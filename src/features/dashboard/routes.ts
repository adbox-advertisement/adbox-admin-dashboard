import type { RouteObject } from "react-router-dom"
import { APP_ROUTES } from "@/routes/paths"
import type { AppRouteHandle } from "@/routes/types"
export const dashboardRoutes: RouteObject[] = [{
  path: APP_ROUTES.dashboard,
  handle: { title: "Dashboard" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./pages/DashboardPage")).DashboardPage }),
}]
