import type { Admin, AdminRole, Permission, Role } from "../types"

// Plain-language names for the permission catalogue. The API stores keys such as
// `admins.roles.assign`; screens group them by area and name them in words.

/** The built-in role created at bootstrap: every permission, and the only role that changes access. */
export const SUPER_ADMIN_ROLE = "SUPER_ADMIN"
export const WILDCARD = "*"

export const isSuperAdminRole = (role: Pick<AdminRole, "name">) => role.name === SUPER_ADMIN_ROLE
export const isSuperAdmin = (admin: Pick<Admin, "roles">) => admin.roles.some(isSuperAdminRole)

export type AreaId = "access" | "people" | "content" | "money" | "recruitment" | "notifications" | "discover" | "insights" | "rdi" | "own" | "other"

export const areas: Array<{ id: AreaId; label: string; hint: string; prefixes: string[] }> = [
  { id: "access", label: "Admins and access", hint: "Who signs in to this dashboard and what they can do", prefixes: ["admins.", "roles.", "permissions."] },
  { id: "people", label: "People and accounts", hint: "App users, verification, institutions, companies and page requests", prefixes: ["platform.users.", "verification.", "honours.", "institutions.", "companies.", "page_requests."] },
  { id: "content", label: "Content", hint: "The media library and what people post", prefixes: ["media.", "user.content."] },
  { id: "money", label: "Ads and money", hint: "Ads, gold, payments and Spotlight", prefixes: ["ads.", "gold.", "payments.", "spotlight."] },
  { id: "recruitment", label: "Recruitment", hint: "Campus representative applications and campaigns", prefixes: ["recruitment."] },
  { id: "notifications", label: "Notifications", hint: "Messages sent to app users", prefixes: ["notifications."] },
  { id: "discover", label: "Discover and feed", hint: "What people see in Discover and the home feed", prefixes: ["discover.", "feed."] },
  { id: "insights", label: "Analytics and logs", hint: "Metrics, logs and the audit trail", prefixes: ["analytics.", "observability."] },
  { id: "rdi", label: "RDI website", hint: "The RDI website manager", prefixes: ["rdi."] },
  { id: "own", label: "Their own account", hint: "Their own name, picture and password", prefixes: ["profile."] },
  { id: "other", label: "Other", hint: "Permissions without an area yet", prefixes: [] },
]

export const areaOf = (key: string): AreaId => areas.find((area) => area.prefixes.some((prefix) => key.startsWith(prefix)))?.id ?? "other"

// The access area reads exactly; elsewhere the label is built from the key and the
// API's description explains it.
const labels: Record<string, string> = {
  [WILDCARD]: "Everything",
  "admins.read": "View admins",
  "admins.create": "Add admins",
  "admins.update": "Edit admins' names",
  "admins.roles.assign": "Give admins roles",
  "admins.permissions.assign": "Give admins extra permissions",
  "admins.schools.assign": "Limit admins to schools",
  "roles.read": "View roles",
  "roles.create": "Create roles",
  "roles.update": "Rename roles",
  "roles.delete": "Delete roles",
  "roles.permissions.assign": "Change what a role allows",
  "permissions.read": "View the permission list",
  "permissions.create": "Add permissions",
  "permissions.update": "Edit permissions",
  "permissions.delete": "Delete permissions",
  "profile.update": "Edit their own name and picture",
  "profile.password.update": "Change their own password",
  "observability.logs.live": "Watch logs live",
}

const verbs: Record<string, string> = {
  read: "View", create: "Create", update: "Edit", delete: "Delete", manage: "Manage", review: "Review", assign: "Assign",
  export: "Export", publish: "Publish", unpublish: "Unpublish", verify: "Verify", suspend: "Suspend", approve: "Approve",
  edit: "Edit", rollback: "Roll back", propose: "Propose", apply: "Apply", moderate: "Moderate", badges: "Set badges for", live: "Watch live",
}
const words: Record<string, string> = { rdi: "RDI", cms: "CMS", page_requests: "page requests", user: "user", ui: "UI" }

export function permissionLabel(key: string) {
  if (labels[key]) return labels[key]
  const parts = key.split(".")
  const verb = parts.length > 1 ? verbs[parts[parts.length - 1]] : undefined
  const noun = (verb ? parts.slice(0, -1) : parts).map((part) => words[part] ?? part.replace(/_/g, " ")).join(" ")
  const text = verb ? `${verb} ${noun}` : noun
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Permissions that change who can do what. Only a Super Admin can give them, as with all access. */
export const isSensitive = (key: string) => key === WILDCARD || (areaOf(key) === "access" && !key.endsWith(".read"))

/** `CONTENT_MANAGER` → "Content manager"; the built-in role is "Super Admin". */
export function roleTitle(name: string) {
  if (name === SUPER_ADMIN_ROLE) return "Super Admin"
  const text = name.toLowerCase().replace(/_+/g, " ").trim()
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** What someone types as a role name, turned into the key the API stores: "Support lead" → `SUPPORT_LEAD`. */
export const roleKey = (title: string) => title.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "")

export type PermissionGroup<T extends Pick<Permission, "key">> = { area: (typeof areas)[number]; items: T[] }

/** In area order, each area's permissions by label; empty areas left out. The wildcard is never grouped. */
export function groupByArea<T extends Pick<Permission, "key">>(permissions: T[]): Array<PermissionGroup<T>> {
  return areas
    .map((area) => ({
      area,
      items: permissions.filter((permission) => permission.key !== WILDCARD && areaOf(permission.key) === area.id)
        .sort((a, b) => permissionLabel(a.key).localeCompare(permissionLabel(b.key))),
    }))
    .filter((group) => group.items.length > 0)
}

export type Source = { kind: "role"; role: AdminRole } | { kind: "direct" }
export type Grant = Permission & { sources: Source[] }

/**
 * What an admin can do and why: every permission their roles and extra permissions give them,
 * each with where it comes from. `everything` when any of them is the wildcard.
 * Roles the viewer can't read (`roles` missing them) contribute nothing they can show.
 */
export function effectiveAccess(admin: Pick<Admin, "roles" | "permissions">, roles: Role[]) {
  const grants = new Map<string, Grant>()
  const add = (permission: Permission, source: Source) => {
    const grant = grants.get(permission.key) ?? { ...permission, sources: [] }
    grant.sources.push(source)
    grants.set(permission.key, grant)
  }
  for (const assigned of admin.roles) {
    const role = roles.find((entry) => entry.id === assigned.id)
    for (const permission of role?.permissions ?? []) add(permission, { kind: "role", role: assigned })
  }
  for (const permission of admin.permissions) add(permission, { kind: "direct" })
  return { everything: isSuperAdmin(admin) || grants.has(WILDCARD), grants: [...grants.values()] }
}

/** The areas a set of permissions touches, for a short summary on a role card. */
export const areasCovered = (permissions: Array<Pick<Permission, "key">>) => groupByArea(permissions).map((group) => group.area)
