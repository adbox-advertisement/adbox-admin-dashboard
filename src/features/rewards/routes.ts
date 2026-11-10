import type { RouteObject } from "react-router-dom"
import { APP_ROUTES } from "@/routes/paths"
import type { AppRouteHandle } from "@/routes/types"

// A lazy page per section, each titled for the header. The sidebar lists them (src/config/navigation.ts).
export const rewardsRoutes: RouteObject[] = [{
  path: APP_ROUTES.rewards,
  handle: { title: "Rewards" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./pages/RewardsOverviewPage")).RewardsOverviewPage }),
}, {
  path: APP_ROUTES.rewardRequests,
  handle: { title: "Redemption requests" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./pages/RedemptionRequestsPage")).RedemptionRequestsPage }),
}, {
  path: APP_ROUTES.rewardCatalog,
  handle: { title: "Rewards catalog" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./pages/RewardsCatalogPage")).RewardsCatalogPage }),
}, {
  path: APP_ROUTES.rewardPartners,
  handle: { title: "Partners" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./pages/PartnersPage")).PartnersPage }),
}, {
  path: `${APP_ROUTES.rewardPartners}/:partnerId`,
  handle: { title: "Partner" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./pages/PartnerDetailPage")).PartnerDetailPage }),
}]
