import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"

type AuthTokens = {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

const SESSION_KEY = "adbox-super-admin-session"

export const superAdminApi = axios.create({
  baseURL:
    import.meta.env.VITE_SUPER_ADMIN_API_URL ??
    (import.meta.env.DEV ? "http://localhost:3005/api/v1" : "/api/v1"),
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
})

function readTokens(): AuthTokens | null {
  try {
    const value = window.sessionStorage.getItem(SESSION_KEY)
    return value ? (JSON.parse(value) as AuthTokens) : null
  } catch {
    return null
  }
}

export function storeTokens(tokens: AuthTokens) {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(tokens))
}

export function clearTokens() {
  window.sessionStorage.removeItem(SESSION_KEY)
}

export function hasAdminSession() {
  return Boolean(readTokens()?.accessToken)
}

superAdminApi.interceptors.request.use((config) => {
  const token = readTokens()?.accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshPromise: Promise<AuthTokens> | null = null

async function refreshSession(): Promise<AuthTokens> {
  const tokens = readTokens()
  if (!tokens?.refreshToken) throw new Error("No refresh token")
  const { data } = await axios.post<AuthTokens>(
    `${superAdminApi.defaults.baseURL}/auth/refresh`,
    { refreshToken: tokens.refreshToken },
    { timeout: 15_000 },
  )
  storeTokens(data)
  return data
}

superAdminApi.interceptors.response.use(undefined, async (error: AxiosError) => {
  const request = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined
  if (error.response?.status !== 401 || !request || request._retried) {
    return Promise.reject(error)
  }
  request._retried = true
  try {
    refreshPromise ??= refreshSession().finally(() => {
      refreshPromise = null
    })
    const tokens = await refreshPromise
    request.headers.Authorization = `Bearer ${tokens.accessToken}`
    return await superAdminApi(request)
  } catch (refreshError) {
    clearTokens()
    if (window.location.pathname !== "/login") window.location.assign("/login")
    return Promise.reject(refreshError)
  }
})
