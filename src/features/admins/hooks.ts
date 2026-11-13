import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCurrentAdmin } from "@/features/auth"
import type { Viewer } from "./lib/access"
import { SUPER_ADMIN_ROLE } from "./lib/catalog"
import { createAdmin, getAdmin, getAdmins, replaceAdminPermissions, replaceAdminRoles, updateAdmin, createRole, deleteRole, getPermissions, getRoles, replaceRolePermissions, updateRole } from "./api"

export const rolesQueryKey = ["admins", "roles"] as const
export const permissionsQueryKey = ["admins", "permissions"] as const
export const adminsQueryKey = ["admins", "accounts"] as const

export function useRbacAccess() {
  return useViewer().can
}

/** The signed-in admin as Manage Admins sees them: their id, whether they're a Super Admin, and a permission check. */
export function useViewer(): Viewer & { ready: boolean } {
  const profile = useCurrentAdmin()
  const permissions = profile.data?.permissions ?? []
  return {
    id: profile.data?.id ?? "",
    ready: profile.isSuccess,
    isSuperAdmin: profile.data?.roles.includes(SUPER_ADMIN_ROLE) ?? false,
    can: (permission: string) => permissions.includes("*") || permissions.includes(permission),
  }
}

export function useRoles(enabled = true) {
  return useQuery({ queryKey: rolesQueryKey, queryFn: ({ signal }) => getRoles(signal), enabled })
}

export function usePermissions(enabled: boolean) {
  return useQuery({ queryKey: permissionsQueryKey, queryFn: ({ signal }) => getPermissions(signal), enabled })
}

function useRefreshAdminData() {
  const client = useQueryClient()
  // Invalidate even on failure: a lost response can follow a successful write.
  return () => Promise.all([
    client.invalidateQueries({ queryKey: ["admins"] }),
    client.invalidateQueries({ queryKey: ["auth", "current-admin"] }),
  ])
}

export function useCreateRole() {
  return useMutation({ mutationFn: createRole, onSettled: useRefreshAdminData() })
}

export function useUpdateRole() {
  return useMutation({ mutationFn: updateRole, onSettled: useRefreshAdminData() })
}

export function useReplaceRolePermissions() {
  return useMutation({ mutationFn: replaceRolePermissions, onSettled: useRefreshAdminData() })
}

export function useDeleteRole() {
  return useMutation({ mutationFn: deleteRole, onSettled: useRefreshAdminData() })
}

export function useAdmins(enabled = true) {
  return useQuery({ queryKey: adminsQueryKey, queryFn: ({ signal }) => getAdmins(signal), enabled })
}

export function useAdmin(id: string, enabled = true) {
  return useQuery({ queryKey: [...adminsQueryKey, id], queryFn: ({ signal }) => getAdmin(id, signal), staleTime: 0, gcTime: 0, enabled })
}

export function useCreateAdmin() {
  return useMutation({ mutationFn: createAdmin, onSettled: useRefreshAdminData(), gcTime: 0 })
}

export function useUpdateAdmin() {
  return useMutation({ mutationFn: updateAdmin, onSettled: useRefreshAdminData() })
}

export function useReplaceAdminRoles() {
  return useMutation({ mutationFn: replaceAdminRoles, onSettled: useRefreshAdminData() })
}

export function useReplaceAdminPermissions() {
  return useMutation({ mutationFn: replaceAdminPermissions, onSettled: useRefreshAdminData() })
}
