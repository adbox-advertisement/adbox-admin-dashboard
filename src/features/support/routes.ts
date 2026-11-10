import type { RouteObject } from "react-router-dom"
import { APP_ROUTES } from "@/routes/paths"
import type { AppRouteHandle } from "@/routes/types"

export const supportRoutes: RouteObject[] = [{
  path: APP_ROUTES.support,
  handle: { title: "Support" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./pages/SupportPage")).SupportPage }),
}]
