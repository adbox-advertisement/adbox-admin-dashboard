import { z } from "zod"
import { superAdminApi } from "@/api/client"
import { adminSchema, createAdminSchema, updateAdminSchema, roleIdsSchema, permissionIdsSchema, permissionSchema, roleInputSchema, roleRecordSchema, roleSchema, type CreateAdminInput, type UpdateAdminInput, type RoleInput } from "./validation"
import type { Admin, Role } from "./types"

export async function getRoles(signal?: AbortSignal): Promise<Role[]> {
  const { data } = await superAdminApi.get<unknown>("/roles", { signal })
  return z.array(roleSchema).parse(data)
}

export async function getPermissions(signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/permissions", { signal })
  return z.array(permissionSchema).parse(data)
}

export async function createRole(input: RoleInput): Promise<Role> {
  const { data } = await superAdminApi.post<unknown>("/roles", roleInputSchema.parse(input))
  return { ...roleRecordSchema.parse(data), permissions: [] }
}

export async function updateRole({ id, input }: { id: string; input: RoleInput }) {
  const { data } = await superAdminApi.patch<unknown>(`/roles/${encodeURIComponent(id)}`, roleInputSchema.parse(input))
  return roleRecordSchema.parse(data)
}

export async function replaceRolePermissions({ id, permissionIds }: { id: string; permissionIds: string[] }) {
  const { data } = await superAdminApi.put<unknown>(`/roles/${encodeURIComponent(id)}/permissions`, {
    permissionIds: permissionIdsSchema.parse(permissionIds),
  })
  return roleSchema.parse(data)
}

export async function deleteRole(id: string) {
  await superAdminApi.delete(`/roles/${encodeURIComponent(id)}`)
}

export async function getAdmins(signal?: AbortSignal): Promise<Admin[]> {
  const { data } = await superAdminApi.get<unknown>("/admins", { signal })
  return z.array(adminSchema).parse(data)
}

export async function getAdmin(id: string, signal?: AbortSignal): Promise<Admin> {
  const { data } = await superAdminApi.get<unknown>(`/admins/${encodeURIComponent(id)}`, { signal })
  return adminSchema.parse(data)
}

export async function createAdmin(input: CreateAdminInput): Promise<Admin> {
  const { data } = await superAdminApi.post<unknown>("/admins", createAdminSchema.parse(input))
  return adminSchema.parse(data)
}

export async function updateAdmin({ id, input }: { id: string; input: UpdateAdminInput }): Promise<Admin> {
  const { data } = await superAdminApi.patch<unknown>(`/admins/${encodeURIComponent(id)}`, updateAdminSchema.parse(input))
  return adminSchema.parse(data)
}

export async function replaceAdminRoles({ id, roleIds }: { id: string; roleIds: string[] }): Promise<Admin> {
  const { data } = await superAdminApi.put<unknown>(`/admins/${encodeURIComponent(id)}/roles`, { roleIds: roleIdsSchema.parse(roleIds) })
  return adminSchema.parse(data)
}

export async function replaceAdminPermissions({ id, permissionIds }: { id: string; permissionIds: string[] }): Promise<Admin> {
  const { data } = await superAdminApi.put<unknown>(`/admins/${encodeURIComponent(id)}/permissions`, { permissionIds: permissionIdsSchema.parse(permissionIds) })
  return adminSchema.parse(data)
}
