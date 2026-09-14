import { superAdminApi } from "@/api/client"
import { clearSession, sessionSchema, storeSession } from "@/lib/auth-session"
import { currentAdminSchema } from "./validation"

export async function getCurrentAdmin(signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/auth/me", { signal })
  return currentAdminSchema.parse(data)
}

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
