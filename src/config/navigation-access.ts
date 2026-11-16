import type { PermissionRequirement } from "@/lib/permissions"
import type { DashboardNavItem } from "./navigation"

// The sidebar decides what an admin may open: an entry shows when its permission is met, and the
// pages under it open on the same terms, so what the sidebar hides cannot be reached by link
// either (DashboardLayout shows "no access" instead).

type NavChild = NonNullable<DashboardNavItem["children"]>[number]

// A child owns its nested pages (/manage-users/people/:id belongs to People),
// except one that shares its group's path, which would otherwise match them all.
export function childMatches(pathname: string, item: DashboardNavItem, to: string) {
  return pathname === to || (to !== item.to && pathname.startsWith(to + "/"))
}

// Any page under a section's path belongs to it, including ones without a sidebar entry
// (User Content's per-uploader Ads).
export function groupMatches(pathname: string, item: DashboardNavItem) {
  return pathname === item.to || pathname.startsWith(item.to + "/") || Boolean(item.children?.some((child) => childMatches(pathname, item, child.to)))
}

/** A section's and an entry's requirements, both to be met; empty when neither asks. */
function both(section?: PermissionRequirement, entry?: PermissionRequirement): PermissionRequirement[] {
  return [section, entry].filter((requirement): requirement is PermissionRequirement => requirement !== undefined)
}

/**
 * What opening any of [children] needs: any one of their permissions. `undefined` when one of them
 * needs nothing, since that one is open to everyone.
 */
function anyOf(children: readonly NavChild[]): PermissionRequirement | undefined {
  if (children.some((child) => child.permission === undefined)) return undefined
  return children.flatMap((child) => (typeof child.permission === "string" ? [child.permission] : [...(child.permission ?? [])]))
}

export type Can = (requirement?: PermissionRequirement) => boolean

/**
 * The sidebar an admin sees: entries they may not open are left out, and a section left with no
 * entries goes too.
 */
export function visibleNavItems(items: readonly DashboardNavItem[], can: Can): DashboardNavItem[] {
  return items.flatMap((item) => {
    if (!can(item.permission)) return []
    if (!item.children) return [item]
    const children = item.children.filter((child) => can(child.permission))
    return children.length ? [{ ...item, children }] : []
  })
}

/**
 * Every requirement opening [pathname] must meet, from the sidebar entry that owns it. Empty when
 * nothing does (Dashboard, Settings, RDI, the pages outside the sidebar).
 *
 * A section's own path, and pages under it with no entry of their own, need what any of its
 * entries needs: the section then shows what the admin may see, or sends them to it (Manage
 * Users opens on the first part they may use).
 */
export function pageRequirements(items: readonly DashboardNavItem[], pathname: string): PermissionRequirement[] {
  const item = items.find((candidate) => groupMatches(pathname, candidate))
  if (!item) return []
  if (!item.children) return both(item.permission)
  const child = pathname === item.to ? undefined : item.children.find((candidate) => childMatches(pathname, item, candidate.to))
  return both(item.permission, child ? child.permission : anyOf(item.children))
}
