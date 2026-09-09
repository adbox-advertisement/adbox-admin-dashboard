import { redirect, type RouteObject } from "react-router-dom"
import { APP_ROUTES } from "@/routes/paths"
import type { AppRouteHandle } from "@/routes/types"
export const videoRoutes: RouteObject[] = [{
  path: APP_ROUTES.videoManagement,
  handle: { title: "Video Management", className: "video-management-ui" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./layouts/VideoManagementLayout")).VideoManagementLayout }),
  children: [
    { index: true, loader: () => redirect(APP_ROUTES.videoUpload) },
    { path: "upload", lazy: async () => ({ Component: (await import("./pages/VideoUploadPage")).VideoUploadPage }) },
    { path: "posts", lazy: async () => ({ Component: (await import("./pages/VideoPostsPage")).VideoPostsPage }) },
  ],
}]
