import { Link, Navigate, NavLink, Outlet, useLocation, useSearchParams } from "react-router-dom"
import { ClipboardList, Flag, LayoutGrid, LibraryBig, Megaphone, UserRound, X, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "../lib/cn"
import { APP_ROUTES } from "@/routes/paths"
import { useContentAccess, useContentScope, useOpenReportCounts, useUploader } from "../hooks"
import { legacyTabPath, profilePath } from "../lib/paths"
import { CONTENT_PERMISSIONS, uploaderName } from "../types"
import { ErrorState, NoAccess, UploaderAvatar, focusRing, ink, muted, surface } from "../components/ContentBits"

type Section = { label: string; path: string; icon: LucideIcon; end?: boolean; scoped: boolean; count?: number }

/** Section navigation, the shared permission gate and the "one uploader" scope for every User Content page. */
export function UserContentLayout() {
  const access = useContentAccess()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const { userId, withScope, scopeTo } = useContentScope()
  const canRead = access.can(CONTENT_PERMISSIONS.read)
  const reports = useOpenReportCounts(canRead)

  if (access.isPending) return <p role="status" className="px-4 py-8 text-sm text-muted-foreground sm:px-6">Loading user content…</p>
  if (access.isError) return <ErrorState message="Could not load your permissions." onRetry={access.retry} />
  if (!canRead) return <NoAccess permission={CONTENT_PERMISSIONS.read} what="user content" />

  const legacy = pathname === APP_ROUTES.userContent ? legacyTabPath(params.get("tab"), userId) : null
  if (legacy) return <Navigate to={legacy} replace />

  const sections: Section[] = [
    { label: "Overview", path: APP_ROUTES.userContent, icon: LayoutGrid, end: true, scoped: true },
    { label: "Posts", path: APP_ROUTES.userContentPosts, icon: LibraryBig, scoped: true },
    { label: "Ads", path: APP_ROUTES.userContentAds, icon: Megaphone, scoped: true },
    { label: "Surveys", path: APP_ROUTES.userContentSurveys, icon: ClipboardList, scoped: true },
    { label: "Reports", path: APP_ROUTES.userContentReports, icon: Flag, scoped: false, count: reports.total },
  ]
  // Reports are one queue for everyone, so the uploader scope doesn't apply there.
  const inReports = pathname.startsWith(APP_ROUTES.userContentReports)

  return <div className="flex w-full min-w-0 flex-col gap-5 pb-10 pt-6 sm:pb-12">
    <nav aria-label="User Content sections" className="min-w-0 px-4 sm:px-6">
      <ul className={cn(surface, "relative flex w-fit max-w-full gap-1 overflow-x-auto rounded-2xl p-1.5 [scrollbar-width:none]")}>
        {sections.map(({ label, path, icon: Icon, end, scoped, count }) => <li key={path} className="shrink-0">
          <NavLink to={scoped ? withScope(path) : path} end={end} className={({ isActive }) => cn(
            "flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-b3 font-semibold transition-colors md:text-b2", focusRing,
            isActive ? "bg-[image:var(--gradient-purple)] text-white shadow-adbox-small" : "text-grey-500 hover:bg-grey-50 hover:text-grey-1000 dark:text-muted-foreground dark:hover:bg-background dark:hover:text-foreground",
          )}>
            {({ isActive }) => <>
              <Icon className="size-4" aria-hidden="true" />{label}
              {count ? <span className={cn("min-w-5 rounded-full px-1.5 py-0.5 text-center text-b3 font-bold leading-none tabular-nums", isActive ? "bg-white text-purple" : "bg-destructive text-white")}>
                {count > 99 ? "99+" : count}<span className="sr-only"> open</span>
              </span> : null}
            </>}
          </NavLink>
        </li>)}
      </ul>
    </nav>

    {userId && !inReports && <ScopeBanner userId={userId} clearTo={scopeTo(null)} canViewProfile={access.can(CONTENT_PERMISSIONS.usersRead)} />}

    <Outlet />
  </div>
}

function ScopeBanner({ userId, clearTo, canViewProfile }: { userId: string; clearTo: string; canViewProfile: boolean }) {
  const uploader = useUploader(userId, canViewProfile)
  const name = uploader.data ? uploaderName(uploader.data) : canViewProfile && uploader.isPending ? "Loading…" : "One uploader"
  return <section aria-label="Selected uploader" className="mx-4 flex flex-wrap items-center gap-3 overflow-hidden rounded-[20px] border border-purple/20 bg-purple/5 p-3 pr-4 sm:mx-6">
    {uploader.data ? <UploaderAvatar user={uploader.data} size="md" /> : <span className="flex size-10 items-center justify-center rounded-full bg-purple/10 text-purple"><UserRound className="size-5" aria-hidden="true" /></span>}
    <div className="min-w-0 flex-1">
      <p className={cn("text-b3 font-semibold uppercase tracking-wide", muted)}>Showing content by</p>
      <p className={cn("truncate text-b1 font-semibold leading-snug", ink)}>{name}</p>
    </div>
    <div className="flex flex-wrap gap-2">
      {canViewProfile && <Button asChild variant="outline" className="h-9 rounded-full bg-white px-4 dark:bg-card"><Link to={profilePath(userId)}><UserRound className="size-4" aria-hidden="true" />Profile</Link></Button>}
      <Button asChild variant="outline" className="h-9 rounded-full bg-white px-4 dark:bg-card"><Link to={clearTo}><X className="size-4" aria-hidden="true" />Show everyone</Link></Button>
    </div>
  </section>
}
