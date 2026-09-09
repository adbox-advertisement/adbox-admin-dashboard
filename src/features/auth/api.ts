import { superAdminApi } from "@/api/client"
import { clearSession, sessionSchema, storeSession } from "@/lib/auth-session"

export async function loginAdmin(email: string, password: string) {
  const { data } = await superAdminApi.post<unknown>("/auth/login", {
    email,
    password,
  })
  const session = sessionSchema.parse(data)
  storeSession(session)
  return session
}

export async function logoutAdmin() {
  try {
    await superAdminApi.post("/auth/logout")
  } finally {
    clearSession()
  }
}
