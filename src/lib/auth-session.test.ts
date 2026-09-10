import { beforeEach, describe, expect, it } from "vitest"
import { clearSession, hasAdminSession, readSession, storeSession } from "./auth-session"

const SESSION_KEY = "adbox-super-admin-session"

describe("auth-session", () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  it("returns null when nothing is stored", () => {
    expect(readSession()).toBeNull()
    expect(hasAdminSession()).toBe(false)
  })

  it("stores and reads back a valid session", () => {
    storeSession({ accessToken: "token-123", refreshToken: "refresh-456", tokenType: "Bearer", expiresIn: 900 })
    expect(readSession()).toEqual({ accessToken: "token-123", refreshToken: "refresh-456", tokenType: "Bearer", expiresIn: 900 })
    expect(hasAdminSession()).toBe(true)
  })

  it("accepts a session with only the required accessToken field", () => {
    storeSession({ accessToken: "token-only" })
    expect(readSession()?.accessToken).toBe("token-only")
  })

  it("rejects a session with an empty accessToken at write time", () => {
    expect(() => storeSession({ accessToken: "" })).toThrow()
  })

  it("treats malformed JSON in storage as no session", () => {
    window.sessionStorage.setItem(SESSION_KEY, "{not valid json")
    expect(readSession()).toBeNull()
    expect(hasAdminSession()).toBe(false)
  })

  it("treats a stored value that fails schema validation as no session", () => {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ refreshToken: "only-refresh" }))
    expect(readSession()).toBeNull()
  })

  it("clears a stored session", () => {
    storeSession({ accessToken: "token-123" })
    clearSession()
    expect(readSession()).toBeNull()
    expect(hasAdminSession()).toBe(false)
  })
})
