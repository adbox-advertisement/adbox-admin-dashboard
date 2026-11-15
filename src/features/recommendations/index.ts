import { lazy } from "react"

export { recommendationsRoutes } from "./routes"

/** Trending now for the dashboard: the app's top 5 with their flames. Loaded on demand, like the pages. */
export const TrendingNowCard = lazy(async () => ({ default: (await import("./components/TrendingNowCard")).TrendingNowCard }))
