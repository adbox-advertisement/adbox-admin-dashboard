import type { TrendDirection } from "../components/DashboardMetricCards"

export const audienceStats: {
  label: string
  value: string
  trendDirection: TrendDirection
  trendValue: string
}[] = [
  {
    label: "Total Publishers",
    value: "321",
    trendDirection: "up",
    trendValue: "6.2%",
  },
  {
    label: "Total Viewers",
    value: "321",
    trendDirection: "up",
    trendValue: "9.8%",
  },
]
