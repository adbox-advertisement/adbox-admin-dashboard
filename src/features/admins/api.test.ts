import { describe, expect, it, vi } from "vitest"
import { superAdminApi } from "@/api/client"
import { permissionFixtures, roleFixtures } from "@/test/rbac-fixtures"
import { createRole, deleteRole, getPermissions, getRoles, replaceRolePermissions, updateRole } from "./api"

describe("RBAC API contracts", () => {
  it("maps nested assignments and nullable descriptions from the backend", async () => {
    const get = vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: roleFixtures })
    const signal = new AbortController().signal
    const roles = await getRoles(signal)
    expect(get).toHaveBeenCalledWith("/roles", { signal })
    expect(roles[0]).toMatchObject({ isSystem: true, description: "", permissions: [{ id: permissionFixtures[0].id, key: "*", description: "" }] })
  })

  it("loads the permission catalog with cancellation", async () => {
    const get = vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: permissionFixtures })
    const signal = new AbortController().signal
    expect(await getPermissions(signal)).toHaveLength(3)
    expect(get).toHaveBeenCalledWith("/permissions", { signal })
  })

  it("rejects malformed API responses instead of inventing empty assignments", async () => {
    vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: [{ ...roleFixtures[0], permissions: undefined }] })
    await expect(getRoles()).rejects.toThrow()
  })

  it("creates metadata without sending unsupported permissions in POST", async () => {
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: roleFixtures[1] })
    expect(await createRole({ name: " AUDITOR ", description: "" })).toMatchObject({ name: "AUDITOR", permissions: [] })
    expect(post).toHaveBeenCalledWith("/roles", { name: "AUDITOR", description: "" })
  })

  it("updates metadata with PATCH, without touching assignments", async () => {
    const patch = vi.spyOn(superAdminApi, "patch").mockResolvedValue({ data: roleFixtures[1] })
    await updateRole({ id: roleFixtures[1].id, input: { name: "AUDITOR", description: "Updated" } })
    expect(patch).toHaveBeenCalledWith(`/roles/${roleFixtures[1].id}`, { name: "AUDITOR", description: "Updated" })
  })

  it("replaces permissions with IDs and supports removing the entire set", async () => {
    const put = vi.spyOn(superAdminApi, "put").mockResolvedValue({ data: { ...roleFixtures[1], permissions: [] } })
    await replaceRolePermissions({ id: roleFixtures[1].id, permissionIds: [permissionFixtures[2].id] })
    expect(put).toHaveBeenLastCalledWith(`/roles/${roleFixtures[1].id}/permissions`, { permissionIds: [permissionFixtures[2].id] })
    await replaceRolePermissions({ id: roleFixtures[1].id, permissionIds: [] })
    expect(put).toHaveBeenLastCalledWith(`/roles/${roleFixtures[1].id}/permissions`, { permissionIds: [] })
  })

  it("rejects duplicate or non-UUID permission IDs before sending a request", async () => {
    const put = vi.spyOn(superAdminApi, "put")
    await expect(replaceRolePermissions({ id: roleFixtures[1].id, permissionIds: ["admins.read"] })).rejects.toThrow()
    await expect(replaceRolePermissions({ id: roleFixtures[1].id, permissionIds: [permissionFixtures[1].id, permissionFixtures[1].id] })).rejects.toThrow()
    expect(put).not.toHaveBeenCalled()
  })

  it("deletes the selected backend role", async () => {
    const remove = vi.spyOn(superAdminApi, "delete").mockResolvedValue({ data: { message: "Role deleted" } })
    await deleteRole(roleFixtures[1].id)
    expect(remove).toHaveBeenCalledWith(`/roles/${roleFixtures[1].id}`)
  })
})
