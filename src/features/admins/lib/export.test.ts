import { describe, expect, it } from "vitest"
import { adminsToCsv, rolesToCsv } from "./export"
import type { Admin, Role } from "../types"

const admin: Admin = { id: "1", firstName: "Adison", lastName: "Cole", email: "adison@adbox.com", isActive: true, roles: [{ id: "r1", name: "SUPER_ADMIN", isSystem: true }], permissions: [], updatedAt: "2026-10-24T23:46:00.000Z" }
const role: Role = { id: "1", name: "Super Admin", description: "Full access.", isSystem: true, permissions: [{ id: "p1", key: "admins.read", description: "" }, { id: "p2", key: "roles.read", description: "" }], updatedAt: "2026-10-24T23:46:00.000Z" }

describe("adminsToCsv", () => {
  it("writes a header row followed by one row per admin", () => {
    const csv = adminsToCsv([admin])
    const lines = csv.split("\n")
    expect(lines[0]).toBe("First name,Last name,Roles,Email,Status,Direct permissions,Last updated")
    expect(lines[1]).toBe("Adison,Cole,SUPER_ADMIN,adison@adbox.com,Active,,2026-10-24T23:46:00.000Z")
  })

  it("returns just the header for an empty list", () => {
    expect(adminsToCsv([])).toBe("First name,Last name,Roles,Email,Status,Direct permissions,Last updated")
  })

  it("quotes and escapes a field containing a comma", () => {
    const csv = adminsToCsv([{ ...admin, lastName: "Cole, Jr." }])
    expect(csv.split("\n")[1]).toBe('Adison,"Cole, Jr.",SUPER_ADMIN,adison@adbox.com,Active,,2026-10-24T23:46:00.000Z')
  })

  it("escapes an embedded double quote by doubling it", () => {
    const csv = adminsToCsv([{ ...admin, firstName: 'The "Boss"' }])
    expect(csv.split("\n")[1]).toBe('"The ""Boss""",Cole,SUPER_ADMIN,adison@adbox.com,Active,,2026-10-24T23:46:00.000Z')
  })
})

describe("rolesToCsv", () => {
  it("writes a header row followed by one row per role, with permissions joined and quoted", () => {
    const csv = rolesToCsv([role])
    const lines = csv.split("\n")
    expect(lines[0]).toBe("Role,Description,Permissions,Last updated")
    expect(lines[1]).toBe('Super Admin,Full access.,"admins.read, roles.read",2026-10-24T23:46:00.000Z')
  })

  it("returns just the header for an empty list", () => {
    expect(rolesToCsv([])).toBe("Role,Description,Permissions,Last updated")
  })

  it("quotes and escapes a description containing a comma", () => {
    const csv = rolesToCsv([{ ...role, description: "Full access, including billing" }])
    expect(csv.split("\n")[1]).toBe('Super Admin,"Full access, including billing","admins.read, roles.read",2026-10-24T23:46:00.000Z')
  })
})
