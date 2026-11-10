import { Link, Navigate, NavLink, Outlet, useLocation, useSearchParams } from "react-router-dom"
import { ClipboardList, LayoutGrid, LibraryBig, Megaphone, UserRound, X, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "../lib/cn"
import { APP_ROUTES } from "@/routes/paths"
import { useContentAccess, useContentScope, useUploader } from "../hooks"
import { legacyTabPath, profilePath } from "../lib/paths"
import { CONTENT_PERMISSIONS, uploaderName } from "../types"
import { ErrorState, NoAccess, UploaderAvatar, focusRing, ink, muted } from "../components/ContentBits"

// What one uploader made. Ads are only listed here: everyone's ads are in Ads Management.
const scopedSections: Array<{ label: string; path: string; icon: LucideIcon; end?: boolean }> = [
  { label: "Overview", path: APP_ROUTES.userContent, icon: LayoutGrid, end: true },
  { label: "Posts", path: APP_ROUTES.userContentPosts, icon: LibraryBig },
  { label: "Ads", path: APP_ROUTES.userContentAds, icon: Megaphone },
  { label: "Surveys", path: APP_ROUTES.userContentSurveys, icon: ClipboardList },
]

/** The shared permission gate and the "one uploader" scope for every User Content page. The sidebar moves between sections. */
export function UserContentLayout() {
  const access = useContentAccess()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const { userId, scopeTo } = useContentScope()
  const canRead = access.can(CONTENT_PERMISSIONS.read)

  if (access.isPending) return <p role="status" className="px-4 py-8 text-sm text-muted-foreground sm:px-6">Loading user content…</p>
  if (access.isError) return <ErrorState message="Could not load your permissions." onRetry={access.retry} />
  if (!canRead) return <NoAccess permission={CONTENT_PERMISSIONS.read} what="user content" />

  const legacy = pathname === APP_ROUTES.userContent ? legacyTabPath(params.get("tab"), userId) : null
  if (legacy) return <Navigate to={legacy} replace />

  // Reports are one queue for everyone, so the uploader scope doesn't apply there.
  const inReports = pathname.startsWith(APP_ROUTES.userContentReports)

  return <div className="flex w-full min-w-0 flex-col gap-5 pb-10 pt-6 sm:pb-12">
    {userId && !inReports && <ScopeBanner userId={userId} clearTo={scopeTo(null)} canViewProfile={access.can(CONTENT_PERMISSIONS.usersRead)} />}
    <Outlet />
  </div>
}

function ScopeBanner({ userId, clearTo, canViewProfile }: { userId: string; clearTo: string; canViewProfile: boolean }) {
  const uploader = useUploader(userId, canViewProfile)
  const { scopeTo } = useContentScope()
  const name = uploader.data ? uploaderName(uploader.data) : canViewProfile && uploader.isPending ? "Loading…" : "One uploader"
  return <section aria-label="Selected uploader" className="mx-4 flex flex-col gap-3 overflow-hidden rounded-[20px] border border-purple/20 bg-purple/5 p-3 sm:mx-6 sm:p-4">
    <div className="flex flex-wrap items-center gap-3">
      {uploader.data ? <UploaderAvatar user={uploader.data} size="md" /> : <span className="flex size-10 items-center justify-center rounded-full bg-purple/10 text-purple"><UserRound className="size-5" aria-hidden="true" /></span>}
      {/* Wide enough to keep the name whole; the buttons wrap below on a phone. */}
      <div className="min-w-[11rem] flex-1">
        <p className={cn("text-b3 font-semibold uppercase tracking-wide", muted)}>Showing content by</p>
        <p className={cn("truncate text-b1 font-semibold leading-snug", ink)}>{name}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {canViewProfile && <Button asChild variant="outline" className="h-9 rounded-full bg-white px-4 dark:bg-card"><Link to={profilePath(userId)}><UserRound className="size-4" aria-hidden="true" />Profile</Link></Button>}
        <Button asChild variant="outline" className="h-9 rounded-full bg-white px-4 dark:bg-card"><Link to={clearTo}><X className="size-4" aria-hidden="true" />Show everyone</Link></Button>
      </div>
    </div>
    <nav aria-label={`Content by ${name}`} className="min-w-0">
      <ul className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-white p-1 [scrollbar-width:none] dark:bg-card">
        {scopedSections.map(({ label, path, icon: Icon, end }) => <li key={path} className="shrink-0">
          <NavLink to={scopeTo(userId, path)} end={end} className={({ isActive }) => cn(
            "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-b3 font-semibold transition-colors", focusRing,
            isActive ? "bg-purple text-white shadow-adbox-small" : "text-grey-500 hover:text-grey-1000 dark:text-muted-foreground dark:hover:text-foreground",
          )}>
            <Icon className="size-4" aria-hidden="true" />{label}
          </NavLink>
        </li>)}
      </ul>
    </nav>
  </section>
}
