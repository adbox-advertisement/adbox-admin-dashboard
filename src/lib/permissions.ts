import { createContext, useContext } from "react"

/** Holding this grants everything: the Super Admin's grant (the backend's WILDCARD_PERMISSION). */
export const WILDCARD_PERMISSION = "*"

/**
 * What a sidebar entry, page or action needs: one permission, or any one of several.
 * The backend's keys (`ads.review`, `platform.users.read`, …) are the only vocabulary;
 * the dashboard never invents a permission of its own.
 */
export type PermissionRequirement = string | readonly string[]

/** Whether [granted] holds [permission], directly or through the wildcard. */
export function hasPermission(granted: readonly string[], permission: string) {
  return granted.includes(WILDCARD_PERMISSION) || granted.includes(permission)
}

/** Whether [granted] meets [requirement]. Nothing required is always met. */
export function meetsRequirement(granted: readonly string[], requirement?: PermissionRequirement) {
  if (requirement === undefined) return true
  if (typeof requirement === "string") return hasPermission(granted, requirement)
  return requirement.some((permission) => hasPermission(granted, permission))
}

export type PermissionAccess = {
  /** False until the signed-in admin's permissions are known. */
  ready: boolean
  granted: readonly string[]
}

/**
 * The signed-in admin's permissions, for shared code that may not import features (the sidebar).
 * The dashboard layout provides it from the current-admin query.
 */
export const PermissionsContext = createContext<PermissionAccess>({ ready: false, granted: [] })

/**
 * `can(requirement)` for the signed-in admin. Until their permissions are known, only what
 * needs nothing is allowed, so nothing they may not use ever shows, even for a moment.
 */
export function usePermissionAccess() {
  const { ready, granted } = useContext(PermissionsContext)
  return {
    ready,
    can: (requirement?: PermissionRequirement) =>
      requirement === undefined || (ready && meetsRequirement(granted, requirement)),
  }
}
