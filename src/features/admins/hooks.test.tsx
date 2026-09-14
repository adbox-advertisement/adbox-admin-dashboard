import type { ReactNode } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { createTestQueryClient } from "@/test/test-utils"
import { replaceRolePermissions } from "./api"
import { adminsQueryKey, rolesQueryKey, useReplaceRolePermissions } from "./hooks"

vi.mock("./api", () => ({ replaceRolePermissions: vi.fn() }))

describe("RBAC cache invalidation", () => {
  it("invalidates role and account caches even when a write response is lost", async () => {
    const client = createTestQueryClient()
    const profileKey = ["auth", "current-admin"]
    client.setQueryData(rolesQueryKey, [{ id: "role" }])
    client.setQueryData(adminsQueryKey, [{ id: "admin" }])
    client.setQueryData([...adminsQueryKey, "admin"], { id: "admin", roles: [] })
    client.setQueryData(profileKey, { permissions: ["roles.read"] })
    vi.mocked(replaceRolePermissions).mockRejectedValue(new Error("Connection lost"))
    const { result } = renderHook(() => useReplaceRolePermissions(), {
      wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
    })

    await act(async () => {
      await expect(result.current.mutateAsync({ id: "role", permissionIds: [] })).rejects.toThrow("Connection lost")
    })

    expect(client.getQueryState(rolesQueryKey)?.isInvalidated).toBe(true)
    expect(client.getQueryState(profileKey)?.isInvalidated).toBe(true)
    expect(client.getQueryState(adminsQueryKey)?.isInvalidated).toBe(true)
    expect(client.getQueryState([...adminsQueryKey, "admin"])?.isInvalidated).toBe(true)
    client.clear()
  })
})
