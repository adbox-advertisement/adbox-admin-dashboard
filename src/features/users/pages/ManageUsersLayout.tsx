import { Navigate, Outlet, useLocation, useSearchParams } from "react-router-dom"
import { useCurrentAdmin } from "@/features/auth"
import { APP_ROUTES } from "@/routes/paths"
import { useUserAccess } from "../hooks"
import { userProfilePath } from "../lib/paths"
import { USER_PERMISSIONS } from "../types"
import { ErrorState, NoAccess } from "../components/Surface"

// Each section and the permission that opens it, in the sidebar's order (src/config/navigation.ts).
const sections = [
  { to: APP_ROUTES.manageUsers, permission: USER_PERMISSIONS.read },
  { to: APP_ROUTES.manageUsersPeople, permission: USER_PERMISSIONS.read },
  { to: APP_ROUTES.manageUsersInstitutions, permission: USER_PERMISSIONS.read },
  { to: APP_ROUTES.manageUsersCompanies, permission: USER_PERMISSIONS.companiesRead },
  { to: APP_ROUTES.manageUsersVerification, permission: USER_PERMISSIONS.verificationRead },
  // A business account is a verified company, so whoever verifies companies decides.
  { to: APP_ROUTES.manageUsersBusinessRequests, permission: USER_PERMISSIONS.companiesRead },
  { to: APP_ROUTES.manageUsersPageRequests, permission: USER_PERMISSIONS.pageRequestsRead },
  { to: APP_ROUTES.manageUsersHonours, permission: USER_PERMISSIONS.honoursReview },
]

/** The shared gate for Manage Users. The sidebar moves between sections; the header names each one. */
export function ManageUsersLayout() {
  const profile = useCurrentAdmin()
  const can = useUserAccess()
  const { pathname } = useLocation()
  const [params] = useSearchParams()

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
    <Outlet />
  </div>
}
