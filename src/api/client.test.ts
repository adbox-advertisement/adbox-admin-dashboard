import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { readSession, storeSession } from "@/lib/auth-session"
import { superAdminApi } from "./client"

const originalAdapter = superAdminApi.defaults.adapter

function unauthorized(config: InternalAxiosRequestConfig) {
  return new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, undefined, {
    data: {}, status: 401, statusText: "Unauthorized", headers: {}, config,
  })
}

describe("authenticated API requests", () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    storeSession({ accessToken: "expired-access", refreshToken: "refresh-token" })
  })

  afterEach(() => {
    superAdminApi.defaults.adapter = originalAdapter
    window.sessionStorage.clear()
  })

  it("refreshes an expired token and retries the protected profile endpoint", async () => {
    const authorization: unknown[] = []
    const profile = { id: "admin-1", email: "admin@example.com", roles: ["SUPER_ADMIN"] }
    superAdminApi.defaults.adapter = async (config) => {
      authorization.push(config.headers.get("Authorization"))
      if (authorization.length === 1) throw unauthorized(config)
      return { data: profile, status: 200, statusText: "OK", headers: {}, config }
    }
    const refresh = vi.spyOn(axios, "post").mockResolvedValue({
      data: { accessToken: "fresh-access", refreshToken: "fresh-refresh" },
    })

    const response = await superAdminApi.get("/auth/me")

    expect(response.data).toEqual(profile)
    expect(authorization).toEqual(["Bearer expired-access", "Bearer fresh-access"])
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(readSession()?.accessToken).toBe("fresh-access")
  })

  it.each(["/auth/login", "/auth/refresh", "/auth/logout"])("does not refresh a rejected %s request", async (endpoint) => {
    superAdminApi.defaults.adapter = async (config) => { throw unauthorized(config) }
    const refresh = vi.spyOn(axios, "post")

    await expect(superAdminApi.post(endpoint)).rejects.toMatchObject({ response: { status: 401 } })

    expect(refresh).not.toHaveBeenCalled()
  })
})
