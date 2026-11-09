import { describe, expect, it } from "vitest"
import { activitySocketTarget, isAuthRefusal } from "./realtime"

describe("activitySocketTarget", () => {
  it("uses the page's origin when the API is proxied in development", () => {
    expect(activitySocketTarget("/api/v1", "http://127.0.0.1:5173")).toEqual({
      url: "http://127.0.0.1:5173/admin",
      path: "/api/v1/socket.io",
    })
  })

  it("follows a separately hosted API", () => {
    expect(activitySocketTarget("https://admin-api.adbox.app/api/v1", "https://admin.adbox.app")).toEqual({
      url: "https://admin-api.adbox.app/admin",
      path: "/api/v1/socket.io",
    })
  })
})

describe("isAuthRefusal", () => {
  it("tells a refused session from a network failure", () => {
    expect(isAuthRefusal(Object.assign(new Error("Admin session is not active"), { data: { code: "UNAUTHENTICATED" } }))).toBe(true)
    expect(isAuthRefusal(new Error("xhr poll error"))).toBe(false)
    expect(isAuthRefusal(null)).toBe(false)
  })
})
