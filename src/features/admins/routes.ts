import type { RouteObject } from "react-router-dom"
import { APP_ROUTES } from "@/routes/paths"
import type { AppRouteHandle } from "@/routes/types"

export const adminsRoutes: RouteObject[] = [{
  path: APP_ROUTES.manageAdmins,
  handle: { title: "Roles and Permission" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./pages/ManageAdminsPage")).ManageAdminsPage }),
}]
