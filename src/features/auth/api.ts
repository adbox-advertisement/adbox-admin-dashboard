import { clearTokens, storeTokens, superAdminApi } from "@/api/client"

export type AdminSession = {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export async function loginAdmin(email: string, password: string) {
  const { data } = await superAdminApi.post<AdminSession>("/auth/login", {
    email,
    password,
  })
  storeTokens(data)
  return data
}

export async function logoutAdmin() {
  try {
    await superAdminApi.post("/auth/logout")
  } finally {
    clearTokens()
  }
}

