import type { RouteObject } from "react-router-dom"
import { APP_ROUTES } from "@/routes/paths"
import type { AppRouteHandle } from "@/routes/types"

// One layout (section navigation and the shared permission gate) with a lazy page per section.
export const usersRoutes: RouteObject[] = [{
  path: APP_ROUTES.manageUsers,
  handle: { title: "Manage Users" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./pages/ManageUsersLayout")).ManageUsersLayout }),
  children: [
    { index: true, lazy: async () => ({ Component: (await import("./pages/UsersOverviewPage")).UsersOverviewPage }) },
    { path: "people", lazy: async () => ({ Component: (await import("./pages/PeoplePage")).PeoplePage }) },
    { path: "people/:userId", lazy: async () => ({ Component: (await import("./pages/UserProfilePage")).UserProfilePage }) },
    { path: "institutions", lazy: async () => ({ Component: (await import("./pages/InstitutionsPage")).InstitutionsPage }) },
    { path: "institutions/:institutionId", lazy: async () => ({ Component: (await import("./pages/InstitutionDetailPage")).InstitutionDetailPage }) },
    { path: "companies", lazy: async () => ({ Component: (await import("./pages/CompaniesPage")).CompaniesPage }) },
    { path: "companies/:companyId", lazy: async () => ({ Component: (await import("./pages/CompanyDetailPage")).CompanyDetailPage }) },
    { path: "verification", lazy: async () => ({ Component: (await import("./pages/VerificationPage")).VerificationPage }) },
    { path: "honours", lazy: async () => ({ Component: (await import("./pages/HonoursPage")).HonoursPage }) },
  ],
}]
