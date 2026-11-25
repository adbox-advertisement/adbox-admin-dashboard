import { NavLink, Outlet } from "react-router-dom"
import { Fingerprint, Grid2X2, Hash, LayoutDashboard, PenLine, UsersRound } from "lucide-react"
import { cn } from "@/lib/utils"
import { APP_ROUTES } from "@/routes/paths"
import { useStudioAccess } from "../hooks"
import "../styles/video-management.css"

/**
 * Video Management, the studio: accounts admins make and post from, groups tied together by a
 * hashtag, and everything posted from them. The sidebar lists the same pages.
 */
export function VideoManagementLayout() {
  const access = useStudioAccess()
  const pages = [
    { to: APP_ROUTES.videoManagement, label: "Studio", icon: LayoutDashboard, end: true, show: access.read },
    { to: APP_ROUTES.videoUpload, label: "Create", icon: PenLine, end: false, show: access.post },
    { to: APP_ROUTES.videoAccounts, label: "Accounts", icon: UsersRound, end: false, show: access.read },
    { to: APP_ROUTES.videoGroups, label: "Groups", icon: Hash, end: false, show: access.read },
    { to: APP_ROUTES.videoPosts, label: "Posts", icon: Grid2X2, end: false, show: access.read },
  ].filter((page) => page.show)

  return (
    <div className="px-4 pb-10 pt-2 sm:px-6 sm:pb-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-5">
        <nav aria-label="Video Management pages" className="flex max-w-full flex-wrap gap-1 rounded-2xl border border-border/70 bg-card p-1.5">
          {pages.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => cn("inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold outline-none transition-colors focus-visible:shadow-adbox-focus-secondary sm:px-4",
              isActive ? "bg-secondary/10 text-secondary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              <Icon className="size-4" aria-hidden="true" />{label}
            </NavLink>
          ))}
        </nav>
        <span className="hidden items-center gap-2 text-xs font-medium text-muted-foreground sm:flex">
          <Fingerprint className="size-4 text-secondary" aria-hidden="true" />Every post records who made it
        </span>
      </div>
      <Outlet />
    </div>
  )
}
