import type { PermissionRequirement } from "@/lib/permissions"

export type AppRouteHandle = {
  title: string
  layout?: "workspace"
  className?: string
  compactHeader?: boolean
  /**
   * What the page needs beyond its sidebar entry's permission (src/config/navigation.ts), which
   * already closes every page under the entry. For a page outside the sidebar, or one that asks more.
   */
  permission?: PermissionRequirement
}
