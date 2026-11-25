import type { RouteObject } from "react-router-dom"
import { APP_ROUTES } from "@/routes/paths"
import type { AppRouteHandle } from "@/routes/types"

// Video Management is the studio: its home, the composer, accounts, groups and posts. The sidebar
// (src/config/navigation.ts) decides who opens each page; the composer also lists the accounts to
// post as, so it needs studio.read as well as studio.post.
export const videoRoutes: RouteObject[] = [{
  path: APP_ROUTES.videoManagement,
  handle: { title: "Video Management", className: "video-management-ui" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./layouts/VideoManagementLayout")).VideoManagementLayout }),
  children: [
    { index: true, lazy: async () => ({ Component: (await import("./pages/StudioHomePage")).StudioHomePage }) },
    {
      path: "upload",
      handle: { title: "Video Management", permission: "studio.read" } satisfies AppRouteHandle,
      lazy: async () => ({ Component: (await import("./pages/StudioCreatePage")).StudioCreatePage }),
    },
    { path: "accounts", lazy: async () => ({ Component: (await import("./pages/StudioAccountsPage")).StudioAccountsPage }) },
    { path: "accounts/:accountId", lazy: async () => ({ Component: (await import("./pages/StudioAccountPage")).StudioAccountPage }) },
    { path: "groups", lazy: async () => ({ Component: (await import("./pages/StudioGroupsPage")).StudioGroupsPage }) },
    { path: "groups/:groupId", lazy: async () => ({ Component: (await import("./pages/StudioGroupPage")).StudioGroupPage }) },
    { path: "posts", lazy: async () => ({ Component: (await import("./pages/StudioPostsPage")).StudioPostsPage }) },
  ],
}]
