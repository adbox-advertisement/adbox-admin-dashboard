import { NavLink, Outlet } from "react-router-dom"
import { Clapperboard, Grid2X2, Upload } from "lucide-react"

import { cn } from "@/lib/utils"
import { APP_ROUTES } from "@/routes/paths"
import "../styles/video-management.css"

export function VideoManagementLayout() {
  return (
    <div className="px-4 pb-10 pt-2 sm:px-6 sm:pb-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-5">
        <nav aria-label="Video Management pages" className="inline-flex gap-1 rounded-2xl border border-border/70 bg-card p-1.5">
          {[{ to: APP_ROUTES.videoUpload, label: "Upload", icon: Upload }, { to: APP_ROUTES.videoPosts, label: "Posts", icon: Grid2X2 }].map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => cn("inline-flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold outline-none transition-colors focus-visible:shadow-adbox-focus-secondary", isActive ? "bg-secondary/10 text-secondary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><Icon className="size-4" aria-hidden="true" />{label}</NavLink>
          ))}
        </nav>
        <span className="hidden items-center gap-2 text-xs font-medium text-muted-foreground sm:flex"><Clapperboard className="size-4 text-secondary" aria-hidden="true" />A little creativity goes a long way</span>
      </div>
      <Outlet />
    </div>
  )
}
