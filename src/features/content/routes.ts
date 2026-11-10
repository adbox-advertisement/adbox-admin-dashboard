import type { RouteObject } from "react-router-dom"
import { APP_ROUTES } from "@/routes/paths"
import type { AppRouteHandle } from "@/routes/types"

// One layout (the permission gate and the uploader scope) with a lazy page per section, each titled for the header.
// The sidebar lists the sections (src/config/navigation.ts); Ads is reached through one uploader's content.
export const contentRoutes: RouteObject[] = [{
  path: APP_ROUTES.userContent,
  handle: { title: "User Content" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./pages/UserContentLayout")).UserContentLayout }),
  children: [
    { index: true, lazy: async () => ({ Component: (await import("./pages/ContentOverviewPage")).ContentOverviewPage }) },
    { path: "posts", handle: { title: "Posts" } satisfies AppRouteHandle, lazy: async () => ({ Component: (await import("./pages/PostsPage")).PostsPage }) },
    { path: "posts/:postId", handle: { title: "Post" } satisfies AppRouteHandle, lazy: async () => ({ Component: (await import("./pages/PostDetailPage")).PostDetailPage }) },
    { path: "ads", handle: { title: "Ads" } satisfies AppRouteHandle, lazy: async () => ({ Component: (await import("./pages/AdsPage")).AdsPage }) },
    { path: "surveys", handle: { title: "Surveys" } satisfies AppRouteHandle, lazy: async () => ({ Component: (await import("./pages/SurveysPage")).SurveysPage }) },
    { path: "reports", handle: { title: "Reports" } satisfies AppRouteHandle, lazy: async () => ({ Component: (await import("./pages/ReportsPage")).ReportsPage }) },
    { path: "reports/:reportId", handle: { title: "Report" } satisfies AppRouteHandle, lazy: async () => ({ Component: (await import("./pages/ContentReportDetailPage")).ContentReportDetailPage }) },
    { path: "reports/messages/:reportId", handle: { title: "Message report" } satisfies AppRouteHandle, lazy: async () => ({ Component: (await import("./pages/ChatReportDetailPage")).ChatReportDetailPage }) },
  ],
}]
