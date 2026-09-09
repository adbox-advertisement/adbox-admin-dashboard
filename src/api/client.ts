import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { env } from "@/config/env"
import { clearSession, readSession, sessionSchema, storeSession, type AuthSession } from "@/lib/auth-session"
import { APP_ROUTES } from "@/routes/paths"

export const superAdminApi = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
})

superAdminApi.interceptors.request.use((config) => {
  const token = readSession()?.accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshPromise: Promise<AuthSession> | null = null

async function refreshSession(): Promise<AuthSession> {
  const session = readSession()
  if (!session?.refreshToken) throw new Error("No refresh token")
  const { data } = await axios.post<unknown>(
    `${env.apiBaseUrl}/auth/refresh`,
    { refreshToken: session.refreshToken },
    { timeout: 15_000 },
  )
  const refreshed = sessionSchema.parse(data)
  // A late refresh must not resurrect a session that has been signed out or replaced.
  if (readSession()?.accessToken !== session.accessToken) throw new Error("Session changed")
  storeSession(refreshed)
  return refreshed
}

superAdminApi.interceptors.response.use(undefined, async (error: AxiosError) => {
  const request = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined
  if (error.response?.status !== 401 || !request || request._retried || request.url?.startsWith("/auth/")) {
    return Promise.reject(error)
  }
  request._retried = true
  const previousSession = readSession()
  let session: AuthSession
  try {
    refreshPromise ??= refreshSession().finally(() => { refreshPromise = null })
    session = await refreshPromise
  } catch (refreshError) {
    if (readSession()?.accessToken === previousSession?.accessToken) {
      clearSession()
      if (window.location.pathname !== APP_ROUTES.login) window.location.assign(APP_ROUTES.login)
    }
    return Promise.reject(refreshError)
  }
  request.headers.Authorization = `Bearer ${session.accessToken}`
  return superAdminApi(request)
})
