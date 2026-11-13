import type { RouteObject } from "react-router-dom"
import { APP_ROUTES } from "@/routes/paths"
import type { AppRouteHandle } from "@/routes/types"

// One layout (the live settings and the parameter details) with a lazy page per list the app
// shows, each titled for the header. The sidebar lists them (src/config/navigation.ts).
export const recommendationsRoutes: RouteObject[] = [{
  path: APP_ROUTES.recommendations,
  handle: { title: "Recommendations" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./pages/RecommendationsLayout")).RecommendationsLayout }),
  children: [
    { index: true, lazy: async () => ({ Component: (await import("./pages/OverviewPage")).OverviewPage }) },
    { path: "home-feed", handle: { title: "Home & videos" } satisfies AppRouteHandle, lazy: async () => ({ Component: (await import("./pages/HomeFeedPage")).HomeFeedPage }) },
    { path: "sponsored", handle: { title: "Sponsored posts" } satisfies AppRouteHandle, lazy: async () => ({ Component: (await import("./pages/SponsoredPage")).SponsoredPage }) },
    { path: "discover", handle: { title: "Discover" } satisfies AppRouteHandle, lazy: async () => ({ Component: (await import("./pages/DiscoverPage")).DiscoverPage }) },
    { path: "ranked-feed", handle: { title: "Ranked feed" } satisfies AppRouteHandle, lazy: async () => ({ Component: (await import("./pages/RankedFeedPage")).RankedFeedPage }) },
    { path: "parameters", handle: { title: "All parameters" } satisfies AppRouteHandle, lazy: async () => ({ Component: (await import("./pages/ParametersPage")).ParametersPage }) },
  ],
}]
