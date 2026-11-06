import type { RouteObject } from "react-router-dom"
import { APP_ROUTES } from "@/routes/paths"
import type { AppRouteHandle } from "@/routes/types"

export const adsRoutes: RouteObject[] = [
  {
    path: APP_ROUTES.adsManagement,
    handle: { title: "Ads Management" } satisfies AppRouteHandle,
    lazy: async () => ({ Component: (await import("./pages/AdsOverviewPage")).AdsOverviewPage }),
  },
  {
    path: APP_ROUTES.adRequests,
    handle: { title: "Ad Requests" } satisfies AppRouteHandle,
    lazy: async () => ({ Component: (await import("./pages/AdRequestsPage")).AdRequestsPage }),
  },
  {
    path: APP_ROUTES.reportedAds,
    handle: { title: "Reported Ads" } satisfies AppRouteHandle,
    lazy: async () => ({ Component: (await import("./pages/ReportedAdsPage")).ReportedAdsPage }),
  },
]
