export type PendingApproval = {
  title: string
  category: string
  budget: string
  running: string
}

export type EarningBreakdownDatum = {
  name: string
  value: number
  color: string
  labelPosition: string
}

export const pendingApprovals: PendingApproval[] = [
  {
    title: "GTA 5 new online mod",
    category: "Electronics",
    budget: "$34,000",
    running: "10 days",
  },
  {
    title: "GTA 5 new online mod",
    category: "Electronics",
    budget: "$34,000",
    running: "10 days",
  },
  {
    title: "GTA 5 new online mod",
    category: "Electronics",
    budget: "$34,000",
    running: "10 days",
  },
  {
    title: "GTA 5 new online mod",
    category: "Electronics",
    budget: "$34,000",
    running: "10 days",
  },
  {
    title: "GTA 5 new online mod",
    category: "Electronics",
    budget: "$34,000",
    running: "10 days",
  },
]

export const earningBreakdownData: EarningBreakdownDatum[] = [
  {
    name: "Video Ad",
    value: 10,
    color: "#37d5dc",
    labelPosition: "left-[92px] top-2",
  },
  {
    name: "Survey Ad",
    value: 60,
    color: "#d765f3",
    labelPosition: "left-[90px] top-[86px]",
  },
  {
    name: "Picture Ad",
    value: 30,
    color: "#6432ed",
    labelPosition: "left-0 top-[64px]",
  },
]
