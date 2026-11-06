import { Navigate, NavLink, Outlet, useLocation, useSearchParams } from "react-router-dom"
import { Award, Building2, Flag, LayoutDashboard, School, ShieldCheck, Store, UsersRound, type LucideIcon } from "lucide-react"
import { useCurrentAdmin } from "@/features/auth"
import { cn } from "@/lib/utils"
import { APP_ROUTES } from "@/routes/paths"
import { useBusinessRequestCounts, usePageRequestCounts, usePendingCounts, useUserAccess } from "../hooks"
import { userProfilePath } from "../lib/paths"
import { USER_PERMISSIONS } from "../types"
import { ErrorState, NoAccess } from "../components/Surface"

type Section = { label: string; to: string; icon: LucideIcon; permission: string; end?: boolean; count?: number }

export function ManageUsersLayout() {
  const profile = useCurrentAdmin()
  const can = useUserAccess()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const pending = usePendingCounts({ verification: can(USER_PERMISSIONS.verificationRead), companies: can(USER_PERMISSIONS.companiesRead) })
  const openPageRequests = usePageRequestCounts(can(USER_PERMISSIONS.pageRequestsRead)).data?.open
  const openBusinessRequests = useBusinessRequestCounts(can(USER_PERMISSIONS.companiesRead)).data?.open

  const sections: Section[] = [
    { label: "Overview", to: APP_ROUTES.manageUsers, icon: LayoutDashboard, permission: USER_PERMISSIONS.read, end: true },
    { label: "People", to: APP_ROUTES.manageUsersPeople, icon: UsersRound, permission: USER_PERMISSIONS.read },
    { label: "Institutions", to: APP_ROUTES.manageUsersInstitutions, icon: School, permission: USER_PERMISSIONS.read },
    { label: "Publishers & Companies", to: APP_ROUTES.manageUsersCompanies, icon: Building2, permission: USER_PERMISSIONS.companiesRead, count: pending.companies },
    // A business account is a verified company, so whoever verifies companies decides.
    { label: "Business requests", to: APP_ROUTES.manageUsersBusinessRequests, icon: Store, permission: USER_PERMISSIONS.companiesRead, count: openBusinessRequests },
    { label: "Page requests", to: APP_ROUTES.manageUsersPageRequests, icon: Flag, permission: USER_PERMISSIONS.pageRequestsRead, count: openPageRequests },
    { label: "Verification", to: APP_ROUTES.manageUsersVerification, icon: ShieldCheck, permission: USER_PERMISSIONS.verificationRead, count: pending.verification },
    { label: "Honours", to: APP_ROUTES.manageUsersHonours, icon: Award, permission: USER_PERMISSIONS.honoursReview },
  ]

  if (profile.isPending) return <p role="status" className="px-4 py-8 text-sm text-muted-foreground sm:px-6">Loading users…</p>
  if (profile.isError) return <ErrorState message="Could not load your permissions." onRetry={() => void profile.refetch()} />

  const allowed = sections.filter((section) => can(section.permission))
  if (allowed.length === 0) return <NoAccess permission={USER_PERMISSIONS.read} what="platform users" />

  // Older links (e.g. from User Content) open a profile with `?user=<id>`.
  const legacyUser = params.get("user")
  if (pathname === APP_ROUTES.manageUsers && legacyUser) return <Navigate to={userProfilePath(legacyUser)} replace />
  // Admins without platform.users.read land on the first section they can use.
  if (pathname === APP_ROUTES.manageUsers && !can(USER_PERMISSIONS.read)) return <Navigate to={allowed[0].to} replace />

  return <div className="flex w-full min-w-0 flex-col gap-6 pb-10 pt-6 sm:pb-12">
    <nav aria-label="Manage Users sections" className="min-w-0 px-4 sm:px-6">
      <ul className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-adbox-small dark:bg-card">
        {allowed.map(({ label, to, icon: Icon, end, count }) => <li key={to} className="shrink-0">
          <NavLink to={to} end={end} className={({ isActive }) => cn(
            "flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-b3 font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-purple md:text-b2",
            isActive ? "bg-purple/10 text-purple" : "text-grey-500 hover:text-grey-1000 dark:text-muted-foreground dark:hover:text-foreground",
          )}>
            <Icon className="size-4" aria-hidden="true" />{label}
            {count ? <span className="rounded-full bg-warning-500 px-2 py-0.5 text-b4 font-semibold leading-none text-white" aria-label={`${count} waiting`}>{count}</span> : null}
          </NavLink>
        </li>)}
      </ul>
    </nav>
    <Outlet />
  </div>
}
