import { describe, expect, it, vi } from "vitest"
import { superAdminApi } from "@/api/client"
import { getCurrentAdmin } from "./api"

describe("getCurrentAdmin", () => {
  it("loads and validates the signed-in user's email and roles", async () => {
    const get = vi.spyOn(superAdminApi, "get").mockResolvedValue({
      data: { id: "admin-1", email: "admin@example.com", roles: ["SUPER_ADMIN"], permissions: ["*"] },
    })
    const controller = new AbortController()

    await expect(getCurrentAdmin(controller.signal)).resolves.toEqual({
      id: "admin-1", email: "admin@example.com", roles: ["SUPER_ADMIN"], permissions: ["*"],
    })
    expect(get).toHaveBeenCalledWith("/auth/me", { signal: controller.signal })
  })

  it("rejects malformed profile data instead of displaying an invented role", async () => {
    vi.spyOn(superAdminApi, "get").mockResolvedValue({
      data: { id: "admin-1", email: "admin@example.com", roles: "SUPER_ADMIN" },
    })

    await expect(getCurrentAdmin()).rejects.toThrow()
  })

  it("accepts an account with no assigned roles", async () => {
    vi.spyOn(superAdminApi, "get").mockResolvedValue({
      data: { id: "admin-1", email: "admin@example.com", roles: [] },
    })

    expect((await getCurrentAdmin()).roles).toEqual([])
  })
})
