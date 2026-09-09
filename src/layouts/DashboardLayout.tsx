import { useEffect } from "react"
import { Outlet, useMatches, useNavigation } from "react-router-dom"
import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { DashboardSidebar } from "@/components/layout/DashboardSidebar"
import { cn } from "@/lib/utils"
import type { AppRouteHandle } from "@/routes/types"

export function DashboardLayout() {
  const matches = useMatches()
  const navigation = useNavigation()
  const handle = matches.reduce<Partial<AppRouteHandle>>(
    (current, match) => ({ ...current, ...(match.handle as AppRouteHandle | undefined) }), {},
  )
  const title = handle.title ?? "AdBox"
  useEffect(() => { document.title = title + " | AdBox" }, [title])
  return (
    <main className={cn("min-h-svh bg-auth-background font-sans text-grey-1000 lg:pl-[290px]", handle.layout === "workspace" && "h-svh overflow-x-clip overflow-y-auto", handle.className)}>
      <a href="#page-content" className="sr-only z-50 rounded-lg bg-white px-4 py-3 text-purple focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
      <DashboardSidebar />
      {navigation.state !== "idle" && (
        <div role="status" className="fixed inset-x-0 top-0 z-50 h-1 bg-purple/20 lg:left-[290px]">
          <div className="h-full w-1/2 bg-purple motion-safe:animate-pulse" />
          <span className="sr-only">Loading page…</span>
        </div>
      )}
      <div className="mx-auto w-full max-w-[1536px]">
        {handle.layout !== "workspace" && <DashboardHeader title={title} />}
        <div id="page-content" tabIndex={-1} className="min-w-0 outline-none"><Outlet /></div>
      </div>
    </main>
  )
}
