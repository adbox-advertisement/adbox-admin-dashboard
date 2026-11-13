import type { Admin } from "../types"
import { isSuperAdmin } from "./catalog"

// Who may change what in Manage Admins. It mirrors the API (super-admin
// `admins/admin-access.policy.ts`): access changes are the Super Admin's alone,
// whatever permissions another admin holds. The API enforces it; these only
// decide what the screens offer.

export type Viewer = {
  id: string
  isSuperAdmin: boolean
  can: (permission: string) => boolean
}

type Target = Pick<Admin, "id" | "roles">

export const access = {
  addAdmin: (viewer: Viewer) => viewer.can("admins.create"),
  /** Only a Super Admin can give a new account roles; anyone else creates it without. */
  giveNewAdminRoles: (viewer: Viewer) => viewer.isSuperAdmin && viewer.can("admins.create") && viewer.can("roles.read"),
  editName: (viewer: Viewer, target: Target) => viewer.can("admins.update") && (viewer.isSuperAdmin || !isSuperAdmin(target)),
  changeRoles: (viewer: Viewer, target: Target) => viewer.isSuperAdmin && viewer.id !== target.id && viewer.can("admins.roles.assign") && viewer.can("roles.read"),
  changeExtraPermissions: (viewer: Viewer, target: Target) => viewer.isSuperAdmin && viewer.id !== target.id && viewer.can("admins.permissions.assign") && viewer.can("permissions.read"),
  changeStatus: (viewer: Viewer, target: Target) => viewer.isSuperAdmin && viewer.id !== target.id && viewer.can("admins.update"),
  createRole: (viewer: Viewer) => viewer.isSuperAdmin && viewer.can("roles.create"),
  editRole: (viewer: Viewer, role: { isSystem: boolean }) => viewer.isSuperAdmin && !role.isSystem && viewer.can("roles.update"),
  changeRolePermissions: (viewer: Viewer, role: { isSystem: boolean }) => viewer.isSuperAdmin && !role.isSystem && viewer.can("roles.permissions.assign") && viewer.can("permissions.read"),
  deleteRole: (viewer: Viewer, role: { isSystem: boolean }) => viewer.isSuperAdmin && !role.isSystem && viewer.can("roles.delete"),
}

/** Why someone's access can't be changed from here, in a sentence; null when it can. */
export function accessLockReason(viewer: Viewer, target: Target) {
  if (viewer.id === target.id) return "This is your account. Another Super Admin has to change your roles, permissions or status."
  if (!viewer.isSuperAdmin) return "Only a Super Admin can change an admin's roles, permissions or status."
  return null
}
