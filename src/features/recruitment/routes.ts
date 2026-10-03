import type { RouteObject } from "react-router-dom"
import { APP_ROUTES } from "@/routes/paths"
import type { AppRouteHandle } from "@/routes/types"

export const recruitmentRoutes: RouteObject[] = [{
  path: APP_ROUTES.recruitment,
  handle: { title: "Recruitment", compactHeader: true } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./pages/RecruitmentPage")).RecruitmentPage }),
}]
