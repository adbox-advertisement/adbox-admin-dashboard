import { useEffect, useMemo } from "react"
import { Outlet, useLocation, useMatches, useNavigation } from "react-router-dom"
import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { DashboardSidebar } from "@/components/layout/DashboardSidebar"
import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader"
import { NavBadgesContext } from "@/components/layout/nav-badges"
import { PageGate } from "@/components/layout/PageGate"
import { activityBadges, useLiveActivity } from "@/features/activity"
import { navItems } from "@/config/navigation"
import { pageRequirements } from "@/config/navigation-access"
import { CurrentAdminProfile, useCurrentAdmin } from "@/features/auth"
import { PermissionsContext, type PermissionAccess, type PermissionRequirement } from "@/lib/permissions"
import { cn } from "@/lib/utils"
import { APP_ROUTES } from "@/routes/paths"
import type { AppRouteHandle } from "@/routes/types"

export function DashboardLayout() {
  const matches = useMatches()
  const navigation = useNavigation()
  const handle = matches.reduce<Partial<AppRouteHandle>>(
    (current, match) => ({ ...current, ...(match.handle as AppRouteHandle | undefined) }), {},
  )
  const title = handle.title ?? "AdBox"
  useEffect(() => { document.title = title + " | AdBox" }, [title])
  // RDI pages make no API requests and look as they always have (AGENTS.md, RDI rule),
  // so live activity and its badges are off there.
  const { pathname } = useLocation()
  const onRdi = pathname === APP_ROUTES.rdi || pathname.startsWith(APP_ROUTES.rdi + "/")
  const { counts } = useLiveActivity({ enabled: !onRdi })
  const badges = useMemo(() => activityBadges(counts), [counts])
  // The admin's permissions decide what the sidebar offers and which pages open, RDI included (it
  // is the Super Admin's). Read once and cached: an RDI page opened by its address makes this one
  // account check, and RDI's own screens still ask nothing of the API.
  const admin = useCurrentAdmin()
  const granted = admin.data?.permissions
  const access = useMemo<PermissionAccess>(() => ({ ready: granted !== undefined, granted: granted ?? [] }), [granted])
  // Everything on the way to this page must be met: its sidebar entry's permission, and any a
  // route adds. A page the sidebar would not offer this admin does not open by link either.
  const requirements = [
    ...pageRequirements(navItems, pathname),
    ...matches.flatMap((match): PermissionRequirement[] => {
      const permission = (match.handle as AppRouteHandle | undefined)?.permission
      return permission === undefined ? [] : [permission]
    }),
  ]
  return (
    <PermissionsContext value={access}>
      <NavBadgesContext value={badges}>
        <main className={cn("min-h-svh bg-auth-background font-sans text-foreground dark:bg-background lg:pl-[290px]", handle.layout === "workspace" && "h-svh overflow-x-clip overflow-y-auto", handle.className)}>
          <a href="#page-content" className="sr-only z-50 rounded-lg bg-white px-4 py-3 text-purple focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
          <DashboardSidebar />
          {navigation.state !== "idle" && (
            <div role="status" className="fixed inset-x-0 top-0 z-50 h-1 bg-purple/20 lg:left-[290px]">
              <div className="h-full w-1/2 bg-purple motion-safe:animate-pulse" />
              <span className="sr-only">Loading page…</span>
            </div>
          )}
          <div className="mx-auto w-full max-w-[1536px]">
            {handle.compactHeader ? <WorkspaceHeader title={title} account={<CurrentAdminProfile />} /> : handle.layout !== "workspace" && <DashboardHeader title={title} account={<CurrentAdminProfile />} />}
            <div id="page-content" tabIndex={-1} className="min-w-0 outline-none">
              <PageGate requirements={requirements} access={access} failed={admin.isError} onRetry={() => void admin.refetch()}>
                <Outlet />
              </PageGate>
            </div>
          </div>
        </main>
      </NavBadgesContext>
    </PermissionsContext>
  )
}
