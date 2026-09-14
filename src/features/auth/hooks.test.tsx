import type { ReactNode } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { createTestQueryClient } from "@/test/test-utils"
import { loginAdmin } from "./api"
import { useLogin } from "./hooks"

vi.mock("./api", () => ({ getCurrentAdmin: vi.fn(), loginAdmin: vi.fn() }))

describe("useLogin", () => {
  it("removes the previous account's cached profile after a successful sign-in", async () => {
    const client = createTestQueryClient()
    client.setQueryData(["auth", "current-admin"], { id: "previous-admin", email: "previous@example.com", roles: ["AUDITOR"] })
    vi.mocked(loginAdmin).mockResolvedValue({ accessToken: "new-session" })
    const { result } = renderHook(() => useLogin(), {
      wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
    })

    await act(() => result.current.mutateAsync({ email: "next@example.com", password: "test-password" }))

    expect(client.getQueryData(["auth", "current-admin"])).toBeUndefined()
    client.clear()
  })
})
