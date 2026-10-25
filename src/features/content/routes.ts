import type { RouteObject } from "react-router-dom"
import { APP_ROUTES } from "@/routes/paths"
import type { AppRouteHandle } from "@/routes/types"

// One layout (section navigation, the permission gate and the uploader scope) with a lazy page per section.
export const contentRoutes: RouteObject[] = [{
  path: APP_ROUTES.userContent,
  handle: { title: "User Content" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./pages/UserContentLayout")).UserContentLayout }),
  children: [
    { index: true, lazy: async () => ({ Component: (await import("./pages/ContentOverviewPage")).ContentOverviewPage }) },
    { path: "posts", lazy: async () => ({ Component: (await import("./pages/PostsPage")).PostsPage }) },
    { path: "posts/:postId", lazy: async () => ({ Component: (await import("./pages/PostDetailPage")).PostDetailPage }) },
    { path: "ads", lazy: async () => ({ Component: (await import("./pages/AdsPage")).AdsPage }) },
    { path: "surveys", lazy: async () => ({ Component: (await import("./pages/SurveysPage")).SurveysPage }) },
    { path: "reports", lazy: async () => ({ Component: (await import("./pages/ReportsPage")).ReportsPage }) },
    { path: "reports/:reportId", lazy: async () => ({ Component: (await import("./pages/ContentReportDetailPage")).ContentReportDetailPage }) },
    { path: "reports/messages/:reportId", lazy: async () => ({ Component: (await import("./pages/ChatReportDetailPage")).ChatReportDetailPage }) },
  ],
}]
