import type { RouteObject } from "react-router-dom"
import { APP_ROUTES } from "@/routes/paths"
import type { AppRouteHandle } from "@/routes/types"

export const settingsRoutes: RouteObject[] = [{
  path: APP_ROUTES.settings,
  handle: { title: "Settings" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./pages/SettingsPage")).SettingsPage }),
}]
