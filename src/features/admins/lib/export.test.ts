import { describe, expect, it } from "vitest"
import { adminsToCsv, rolesToCsv } from "./export"
import type { Admin, Role } from "../types"

const admin: Admin = { id: "1", firstName: "Adison", lastName: "Cole", email: "adison@adbox.com", telephone: "+233 24 000 0001", role: "Super Admin", avatar: "", updatedAt: "2026-10-24T23:46:00.000Z" }
const role: Role = { id: "1", name: "Super Admin", description: "Full access.", permissions: ["get/User", "get/PushWallet"], updatedAt: "2026-10-24T23:46:00.000Z" }

describe("adminsToCsv", () => {
  it("writes a header row followed by one row per admin", () => {
    const csv = adminsToCsv([admin])
    const lines = csv.split("\n")
    expect(lines[0]).toBe("First name,Last name,Role,Email,Telephone,Last updated")
    expect(lines[1]).toBe("Adison,Cole,Super Admin,adison@adbox.com,+233 24 000 0001,2026-10-24T23:46:00.000Z")
  })

  it("returns just the header for an empty list", () => {
    expect(adminsToCsv([])).toBe("First name,Last name,Role,Email,Telephone,Last updated")
  })

  it("quotes and escapes a field containing a comma", () => {
    const csv = adminsToCsv([{ ...admin, lastName: "Cole, Jr." }])
    expect(csv.split("\n")[1]).toBe('Adison,"Cole, Jr.",Super Admin,adison@adbox.com,+233 24 000 0001,2026-10-24T23:46:00.000Z')
  })

  it("escapes an embedded double quote by doubling it", () => {
    const csv = adminsToCsv([{ ...admin, firstName: 'The "Boss"' }])
    expect(csv.split("\n")[1]).toBe('"The ""Boss""",Cole,Super Admin,adison@adbox.com,+233 24 000 0001,2026-10-24T23:46:00.000Z')
  })
})

describe("rolesToCsv", () => {
  it("writes a header row followed by one row per role, with permissions joined and quoted", () => {
    const csv = rolesToCsv([role])
    const lines = csv.split("\n")
    expect(lines[0]).toBe("Role,Description,Permissions,Last updated")
    expect(lines[1]).toBe('Super Admin,Full access.,"get/User, get/PushWallet",2026-10-24T23:46:00.000Z')
  })

  it("returns just the header for an empty list", () => {
    expect(rolesToCsv([])).toBe("Role,Description,Permissions,Last updated")
  })

  it("quotes and escapes a description containing a comma", () => {
    const csv = rolesToCsv([{ ...role, description: "Full access, including billing" }])
    expect(csv.split("\n")[1]).toBe('Super Admin,"Full access, including billing","get/User, get/PushWallet",2026-10-24T23:46:00.000Z')
  })
})
