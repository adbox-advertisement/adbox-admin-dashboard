import { renderHook } from "@testing-library/react"
import { createElement, type ReactNode } from "react"
import { describe, expect, it } from "vitest"
import { hasPermission, meetsRequirement, PermissionsContext, usePermissionAccess, type PermissionAccess } from "./permissions"

describe("hasPermission", () => {
  it("is granted directly or through the wildcard", () => {
    expect(hasPermission(["ads.read"], "ads.read")).toBe(true)
    expect(hasPermission(["*"], "ads.review")).toBe(true)
    expect(hasPermission(["ads.read"], "ads.review")).toBe(false)
    expect(hasPermission([], "ads.read")).toBe(false)
  })
})

describe("meetsRequirement", () => {
  it("meets nothing required, one permission, or any one of several", () => {
    expect(meetsRequirement([], undefined)).toBe(true)
    expect(meetsRequirement(["payments.read"], "payments.read")).toBe(true)
    expect(meetsRequirement(["discover.read"], ["feed.ranking.read", "discover.read"])).toBe(true)
    expect(meetsRequirement(["ads.read"], ["feed.ranking.read", "discover.read"])).toBe(false)
  })

  it("never meets an empty list of alternatives", () => {
    expect(meetsRequirement(["ads.read"], [])).toBe(false)
  })

  it("takes the wildcard as a requirement only the Super Admin meets", () => {
    expect(meetsRequirement(["*"], "*")).toBe(true)
    expect(meetsRequirement(["ads.read", "ads.review"], "*")).toBe(false)
  })
})

describe("usePermissionAccess", () => {
  const withAccess = (access: PermissionAccess) => ({ children }: { children: ReactNode }) =>
    createElement(PermissionsContext, { value: access }, children)

  it("allows only what needs nothing until the permissions are known", () => {
    const { result } = renderHook(() => usePermissionAccess(), { wrapper: withAccess({ ready: false, granted: ["*"] }) })
    expect(result.current.can(undefined)).toBe(true)
    expect(result.current.can("ads.read")).toBe(false)
  })

  it("follows the admin's grants once known", () => {
    const { result } = renderHook(() => usePermissionAccess(), { wrapper: withAccess({ ready: true, granted: ["ads.read"] }) })
    expect(result.current.can("ads.read")).toBe(true)
    expect(result.current.can("ads.review")).toBe(false)
  })
})
