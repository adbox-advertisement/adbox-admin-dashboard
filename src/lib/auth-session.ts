import { z } from "zod"

export const sessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().optional(),
  tokenType: z.string().optional(),
  expiresIn: z.number().optional(),
})

export type AuthSession = z.infer<typeof sessionSchema>
const SESSION_KEY = "adbox-super-admin-session"

export function readSession(): AuthSession | null {
  try {
    const value = window.sessionStorage.getItem(SESSION_KEY)
    if (!value) return null
    const result = sessionSchema.safeParse(JSON.parse(value))
    return result.success ? result.data : null
  } catch {
    return null
  }
}

export function storeSession(session: AuthSession) {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionSchema.parse(session)))
}

export function clearSession() {
  window.sessionStorage.removeItem(SESSION_KEY)
}

export function hasAdminSession() {
  return Boolean(readSession()?.accessToken)
}
