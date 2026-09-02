import { ChevronDown, EllipsisVertical } from "lucide-react"
import { useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

import { Button } from "@/components/ui/button"

type PendingApproval = {
  title: string
  category: string
  budget: string
  running: string
}

type EarningBreakdownDatum = {
  name: string
  value: number
  color: string
  labelPosition: string
}

const pendingApprovals: PendingApproval[] = [
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

const earningBreakdownData: EarningBreakdownDatum[] = [
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

function PendingPostThumbnail() {
  return (
    <div
      className="flex size-[58px] shrink-0 items-center justify-center rounded-md bg-auth-background"
      aria-hidden="true"
    >
      <div className="relative h-[58px] w-11 overflow-hidden rounded-md bg-[linear-gradient(155deg,#0c5dff_0%,#1b86ff_46%,#0530d8_100%)] shadow-adbox-small">
        <div className="absolute inset-x-1 top-1 flex justify-between">
          <span className="h-1 w-2 rounded-full bg-cyan/80" />
          <span className="h-1 w-3 rounded-full bg-white/80" />
        </div>
        <div className="absolute left-1.5 top-3.5 h-10 w-2 rounded-full bg-cyan/60" />
        <div className="absolute right-1 top-2 h-12 w-2 rounded-full bg-purple/70" />
        <div className="absolute left-1/2 top-[18px] -translate-x-1/2 rounded bg-white/90 px-1 text-[13px] font-bold leading-[17px] text-blue">
          5G
        </div>
        <div className="absolute bottom-1 left-1 right-1 flex justify-between text-[4px] font-bold uppercase leading-none text-white/80">
          <span>AdBox</span>
          <span>Ads</span>
        </div>
      </div>
    </div>
  )
}

function ApprovePill() {
  return (
    <span className="inline-flex h-8 min-w-[88px] items-center justify-center rounded-full bg-success-500 px-4 text-b3 font-semibold text-white md:text-b2">
      Approve
    </span>
  )
}

function PendingApprovalsTable() {
  return (
    <article className="min-h-[615px] max-w-full overflow-hidden rounded-[20px] bg-white">
      <header className="flex min-h-[76px] items-center justify-between gap-4 px-6 sm:px-[26px]">
        <h2 className="font-heading text-h6 font-semibold text-grey-1000 md:text-h5">
          Pending Approvals
        </h2>
        <Button
          type="button"
          variant="ghost"
          className="h-8 rounded-full px-0 text-b3 font-semibold text-purple hover:bg-transparent hover:text-purple/80 md:text-b2"
        >
          See all &rsaquo;
        </Button>
      </header>

      <div className="relative z-0 max-w-full overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-divider text-b3 font-medium text-grey-500 md:text-b2">
              <th className="w-[40%] px-6 py-[22px] font-medium sm:px-[26px]">
                User
              </th>
              <th className="w-[19%] px-3 py-[22px] font-medium">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-left"
                >
                  Budget
                  <ChevronDown
                    aria-hidden="true"
                    className="size-4"
                    strokeWidth={1.7}
                  />
                </button>
              </th>
              <th className="w-[18%] px-3 py-[22px] font-medium">
                Running
              </th>
              <th className="w-[18%] px-3 py-[22px] font-medium">Action</th>
              <th className="w-[5%] px-6 py-[22px] text-right font-medium sm:px-[26px]">
                <span className="sr-only">More actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {pendingApprovals.map((approval, index) => (
              <tr
                key={`${approval.title}-${index}`}
                className="h-[91px] text-b3 md:text-b2"
              >
                <td className="px-6 py-4 sm:px-[26px]">
                  <div className="flex min-w-0 items-center gap-3">
                    <PendingPostThumbnail />
                    <div className="min-w-0">
                      <p className="truncate text-b3 font-semibold text-grey-1000 md:text-b2">
                        {approval.title}
                      </p>
                      <p className="truncate text-b3 text-secondary-grey-600 md:text-b2">
                        {approval.category}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 text-b3 font-semibold text-grey-500 md:text-b2">
                  {approval.budget}
                </td>
                <td className="px-3 py-4 text-b3 text-grey-500 md:text-b2">
                  {approval.running}
                </td>
                <td className="px-3 py-4">
                  <ApprovePill />
                </td>
                <td className="px-6 py-4 text-right sm:px-[26px]">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full text-blue hover:bg-auth-background hover:text-blue"
                    aria-label={`Open actions for ${approval.title}`}
                  >
                    <EllipsisVertical className="size-5" strokeWidth={1.8} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}

function EarningBreakdownCard() {
  const [selectedSlice, setSelectedSlice] = useState<EarningBreakdownDatum | null>(
    null,
  )

  return (
    <article className="flex min-h-[425px] flex-col overflow-hidden rounded-[20px] bg-white px-6 py-9">
      <header className="mb-6 flex items-start justify-between gap-4">
        <h2 className="font-heading text-h6 font-semibold text-grey-1000 md:text-h5 md:leading-[27px] lg:text-h6 xl:text-h5">
          Earning Breakdown
        </h2>
        <Button
          type="button"
          variant="ghost"
          className="h-[27px] rounded-full px-0 text-b3 font-medium text-grey-300 hover:bg-transparent hover:text-grey-500 md:text-b2 lg:text-b3 xl:text-b2"
        >
          Monthly
          <ChevronDown aria-hidden="true" className="size-4" strokeWidth={1.7} />
        </Button>
      </header>

      <div className="flex flex-1 flex-col items-center gap-[30px] md:flex-row md:justify-center md:gap-10 lg:flex-col lg:justify-start lg:gap-[30px]">
        <div
          className="relative size-[148px] shrink-0 [&_*]:outline-none"
          onMouseLeave={() => setSelectedSlice(null)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={earningBreakdownData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={74}
                startAngle={90}
                endAngle={-270}
                stroke="var(--adbox-white)"
                strokeWidth={0}
                isAnimationActive={false}
                activeShape={false}
              >
                {earningBreakdownData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    className="cursor-pointer outline-none"
                    focusable={false}
                    tabIndex={-1}
                    onClick={() => setSelectedSlice(entry)}
                    onMouseEnter={() => setSelectedSlice(entry)}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {selectedSlice ? (
            <div
              className={`pointer-events-none absolute z-10 rounded-lg bg-white px-3 py-2 text-b3 shadow-adbox-large ${selectedSlice.labelPosition}`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: selectedSlice.color }}
                  aria-hidden="true"
                />
                <span className="whitespace-nowrap font-semibold text-grey-1000">
                  {selectedSlice.name}
                </span>
              </div>
              <p className="mt-1 text-right font-semibold text-grey-1000">
                {selectedSlice.value}%
              </p>
            </div>
          ) : null}
        </div>

        <div className="w-full max-w-[283px] md:flex-1 lg:flex-none">
          {earningBreakdownData.map((entry) => (
            <div
              key={entry.name}
              className="flex items-center gap-3 border-b border-grey-200 py-[7px] last:border-b-0"
            >
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
                aria-hidden="true"
              />
              <div className="flex min-w-0 flex-1 items-center gap-4 text-b3 md:text-b2 lg:text-b3 xl:text-b2">
                <span className="min-w-0 flex-1 truncate text-grey-500">
                  {entry.name}
                </span>
                <span className="w-[54px] shrink-0 text-left font-semibold text-grey-1000">
                  {entry.value}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

export function DashboardPendingApprovalsSection() {
  return (
    <section className="px-4 sm:px-6">
      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <PendingApprovalsTable />
        </div>
        <div className="lg:col-span-4">
          <EarningBreakdownCard />
        </div>
      </div>
    </section>
  )
}
