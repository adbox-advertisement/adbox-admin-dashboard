import type { RouteObject } from "react-router-dom"
import { APP_ROUTES } from "@/routes/paths"
import type { AppRouteHandle } from "@/routes/types"
export const rdiRoutes: RouteObject[] = [{
  path: APP_ROUTES.rdi,
  handle: { title: "RDI Website", layout: "workspace" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./pages/RdiCmsPage")).RdiCmsPage }),
}]
