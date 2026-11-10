import type { RouteObject } from "react-router-dom"
import { APP_ROUTES } from "@/routes/paths"
import type { AppRouteHandle } from "@/routes/types"

// One layout (the shared permission gate) with a lazy page per section, each titled for the header.
// The sidebar lists the sections (src/config/navigation.ts).
export const usersRoutes: RouteObject[] = [{
  path: APP_ROUTES.manageUsers,
  handle: { title: "Manage Users" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./pages/ManageUsersLayout")).ManageUsersLayout }),
  children: [
    { index: true, lazy: async () => ({ Component: (await import("./pages/UsersOverviewPage")).UsersOverviewPage }) },
    { path: "people", handle: { title: "People" } satisfies AppRouteHandle, lazy: async () => ({ Component: (await import("./pages/PeoplePage")).PeoplePage }) },
    { path: "people/:userId", handle: { title: "Profile" } satisfies AppRouteHandle, lazy: async () => ({ Component: (await import("./pages/UserProfilePage")).UserProfilePage }) },
    { path: "institutions", handle: { title: "Institutions" } satisfies AppRouteHandle, lazy: async () => ({ Component: (await import("./pages/InstitutionsPage")).InstitutionsPage }) },
    { path: "institutions/:institutionId", handle: { title: "Institution" } satisfies AppRouteHandle, lazy: async () => ({ Component: (await import("./pages/InstitutionDetailPage")).InstitutionDetailPage }) },
    { path: "companies", handle: { title: "Companies" } satisfies AppRouteHandle, lazy: async () => ({ Component: (await import("./pages/CompaniesPage")).CompaniesPage }) },
    { path: "companies/:companyId", handle: { title: "Company" } satisfies AppRouteHandle, lazy: async () => ({ Component: (await import("./pages/CompanyDetailPage")).CompanyDetailPage }) },
    { path: "business-requests", handle: { title: "Business requests" } satisfies AppRouteHandle, lazy: async () => ({ Component: (await import("./pages/BusinessRequestsPage")).BusinessRequestsPage }) },
    { path: "business-requests/:requestId", handle: { title: "Business request" } satisfies AppRouteHandle, lazy: async () => ({ Component: (await import("./pages/BusinessRequestReviewPage")).BusinessRequestReviewPage }) },
    { path: "verification", handle: { title: "Verification" } satisfies AppRouteHandle, lazy: async () => ({ Component: (await import("./pages/VerificationPage")).VerificationPage }) },
    { path: "honours", handle: { title: "Honours" } satisfies AppRouteHandle, lazy: async () => ({ Component: (await import("./pages/HonoursPage")).HonoursPage }) },
    { path: "page-requests", handle: { title: "Page requests" } satisfies AppRouteHandle, lazy: async () => ({ Component: (await import("./pages/PageRequestsPage")).PageRequestsPage }) },
    { path: "page-requests/:requestId", handle: { title: "Page request" } satisfies AppRouteHandle, lazy: async () => ({ Component: (await import("./pages/PageRequestReviewPage")).PageRequestReviewPage }) },
  ],
}]
