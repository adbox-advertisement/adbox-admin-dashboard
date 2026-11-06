import type { RouteObject } from "react-router-dom"
import { APP_ROUTES } from "@/routes/paths"
import type { AppRouteHandle } from "@/routes/types"

export const financialsRoutes: RouteObject[] = [{
  path: APP_ROUTES.goldPricing,
  handle: { title: "Gold & pricing" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./pages/GoldPricingPage")).GoldPricingPage }),
}, {
  path: APP_ROUTES.advertisersPayment,
  handle: { title: "Advertisers Payment" } satisfies AppRouteHandle,
  lazy: async () => ({ Component: (await import("./pages/AdvertisersPaymentPage")).AdvertisersPaymentPage }),
}]
