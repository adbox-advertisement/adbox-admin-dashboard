import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCurrentAdmin } from "@/features/auth"
import { createAdmin, getAdmin, getAdmins, replaceAdminPermissions, replaceAdminRoles, updateAdmin, createRole, deleteRole, getPermissions, getRoles, replaceRolePermissions, updateRole } from "./api"

export const rolesQueryKey = ["admins", "roles"] as const
export const permissionsQueryKey = ["admins", "permissions"] as const
export const adminsQueryKey = ["admins", "accounts"] as const

export function useRbacAccess() {
  const profile = useCurrentAdmin()
  const permissions = profile.data?.permissions ?? []
  return (permission: string) => permissions.includes("*") || permissions.includes(permission)
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

export function useAdmins() {
  return useQuery({ queryKey: adminsQueryKey, queryFn: ({ signal }) => getAdmins(signal) })
}

export function useAdmin(id: string) {
  return useQuery({ queryKey: [...adminsQueryKey, id], queryFn: ({ signal }) => getAdmin(id, signal), staleTime: 0, gcTime: 0 })
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
