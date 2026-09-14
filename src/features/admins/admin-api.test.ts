import { describe, expect, it, vi } from "vitest"
import { superAdminApi } from "@/api/client"
import { adminFixtures, permissionFixtures, roleFixtures } from "@/test/rbac-fixtures"
import { createAdmin, getAdmin, getAdmins, replaceAdminPermissions, replaceAdminRoles, updateAdmin } from "./api"
import { createAdminSchema, roleIdsSchema } from "./validation"

describe("Admin account API contracts", () => {
  it("loads the list with nullable names, multiple roles and direct permission mappings", async () => {
    const get = vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: [{ ...adminFixtures[2], roles: roleFixtures.map((role) => ({ role })), permissions: [{ permission: permissionFixtures[2] }], password: "must-not-be-retained" }] })
    const signal = new AbortController().signal
    const [admin] = await getAdmins(signal)
    expect(get).toHaveBeenCalledWith("/admins", { signal })
    expect(admin).toMatchObject({ firstName: "", lastName: "", isActive: false, roles: [{ name: "SUPER_ADMIN" }, { name: "AUDITOR" }], permissions: [{ key: "roles.read" }] })
    expect(admin).not.toHaveProperty("password")
  })

  it("fetches current account details before editing assignments", async () => {
    const get = vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: adminFixtures[1] })
    const signal = new AbortController().signal
    await getAdmin(adminFixtures[1].id, signal)
    expect(get).toHaveBeenCalledWith(`/admins/${adminFixtures[1].id}`, { signal })
  })

  it("rejects a malformed account response instead of assuming no access", async () => {
    vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: [{ ...adminFixtures[1], roles: undefined }] })
    await expect(getAdmins()).rejects.toThrow()
  })

  it("creates an account with a password and initial role IDs in one POST", async () => {
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: adminFixtures[1] })
    await createAdmin({ firstName: " Kaiya ", lastName: "Reyes", email: " KAIYA@EXAMPLE.COM ", password: "  secret  ", roleIds: [roleFixtures[1].id] })
    expect(post).toHaveBeenCalledWith("/admins", { firstName: "Kaiya", lastName: "Reyes", email: "kaiya@example.com", password: "  secret  ", roleIds: [roleFixtures[1].id] })
  })

  it("accepts backend password limits and optional names/roles", () => {
    const input = { email: "user@example.com", password: "12345" }
    expect(createAdminSchema.safeParse(input).success).toBe(true)
    expect(createAdminSchema.safeParse({ ...input, password: "1234" }).success).toBe(false)
    expect(createAdminSchema.safeParse({ ...input, password: "x".repeat(128), firstName: "x".repeat(100) }).success).toBe(true)
    expect(createAdminSchema.safeParse({ ...input, password: "x".repeat(129) }).success).toBe(false)
    expect(createAdminSchema.safeParse({ ...input, lastName: "x".repeat(101) }).success).toBe(false)
    expect(createAdminSchema.safeParse({ ...input, email: "invalid" }).success).toBe(false)
  })

  it("updates supported fields and deactivates/reactivates with PATCH", async () => {
    const patch = vi.spyOn(superAdminApi, "patch").mockResolvedValue({ data: adminFixtures[1] })
    await updateAdmin({ id: adminFixtures[1].id, input: { firstName: "New", lastName: "Name" } })
    expect(patch).toHaveBeenLastCalledWith(`/admins/${adminFixtures[1].id}`, { firstName: "New", lastName: "Name" })
    for (const isActive of [false, true]) {
      await updateAdmin({ id: adminFixtures[1].id, input: { isActive } })
      expect(patch).toHaveBeenLastCalledWith(`/admins/${adminFixtures[1].id}`, { isActive })
    }
  })

  it("replaces and clears role assignments with IDs", async () => {
    const put = vi.spyOn(superAdminApi, "put").mockResolvedValue({ data: adminFixtures[1] })
    await replaceAdminRoles({ id: adminFixtures[1].id, roleIds: roleFixtures.map((role) => role.id) })
    expect(put).toHaveBeenLastCalledWith(`/admins/${adminFixtures[1].id}/roles`, { roleIds: roleFixtures.map((role) => role.id) })
    await replaceAdminRoles({ id: adminFixtures[1].id, roleIds: [] })
    expect(put).toHaveBeenLastCalledWith(`/admins/${adminFixtures[1].id}/roles`, { roleIds: [] })
    expect(roleIdsSchema.safeParse([roleFixtures[0].id, roleFixtures[0].id]).success).toBe(false)
    expect(roleIdsSchema.safeParse(["SUPER_ADMIN"]).success).toBe(false)
  })

  it("replaces direct permissions independently from roles, including an empty set", async () => {
    const put = vi.spyOn(superAdminApi, "put").mockResolvedValue({ data: adminFixtures[1] })
    await replaceAdminPermissions({ id: adminFixtures[1].id, permissionIds: [permissionFixtures[1].id] })
    expect(put).toHaveBeenLastCalledWith(`/admins/${adminFixtures[1].id}/permissions`, { permissionIds: [permissionFixtures[1].id] })
    await replaceAdminPermissions({ id: adminFixtures[1].id, permissionIds: [] })
    expect(put).toHaveBeenLastCalledWith(`/admins/${adminFixtures[1].id}/permissions`, { permissionIds: [] })
  })
})
