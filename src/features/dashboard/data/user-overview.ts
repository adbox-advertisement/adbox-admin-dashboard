export type UserOverviewDatum = {
  month: string
  users: number
  highlight?: number
}

export const userOverviewData: UserOverviewDatum[] = [
  { month: "Jan", users: 58 },
  { month: "Feb", users: 142 },
  { month: "Mar", users: 98 },
  { month: "Apr", users: 112 },
  { month: "May", users: 90 },
  { month: "Jun", users: 161, highlight: 90 },
  { month: "Jul", users: 78, highlight: 53 },
  { month: "Aug", users: 142 },
  { month: "Sep", users: 39 },
  { month: "Oct", users: 112 },
  { month: "Nov", users: 63 },
  { month: "Dec", users: 98 },
]
