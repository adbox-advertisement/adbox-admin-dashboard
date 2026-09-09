import { redirect, type RouteObject } from "react-router-dom"
import { hasAdminSession } from "@/lib/auth-session"
import { APP_ROUTES } from "@/routes/paths"
export const authRoutes: RouteObject[] = [{
  path: APP_ROUTES.login,
  loader: () => hasAdminSession() ? redirect(APP_ROUTES.dashboard) : null,
  lazy: async () => ({ Component: (await import("./pages/LoginPage")).LoginPage }),
}]
