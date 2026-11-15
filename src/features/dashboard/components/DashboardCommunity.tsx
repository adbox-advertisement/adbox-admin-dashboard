import { Link } from "react-router-dom"
import { cn } from "../lib/cn"
import { APP_ROUTES } from "@/routes/paths"
import { usePeopleStats } from "../hooks"
import { AFFILIATIONS, formatCount, plural, roleRows } from "../lib/figures"
import type { PeopleStats } from "../types"
import { BarList, Card, LoadError, LoadingRows, MoreLink } from "./DashboardBits"
import { focusRing, hairline, ink, muted } from "./tokens"

const peopleWith = (filter: string, value: string) => `${APP_ROUTES.manageUsersPeople}?${filter}=${encodeURIComponent(value)}`

/** Who the people are: how many joined lately, how they relate to their campus, and what their accounts do. */
export function DashboardCommunity({ className }: { className?: string }) {
  const stats = usePeopleStats(true)
  const data = stats.data
  return <Card className={className} title="Who's on AdBox"
    description={data ? `${plural(data.total, "account", "accounts")}, ${formatCount(data.status.active)} active.` : "People, by campus and by what their accounts do."}
    action={<MoreLink to={APP_ROUTES.manageUsers}>Manage Users</MoreLink>}>
    {stats.isError ? <LoadError message="Couldn't load the people figures." onRetry={() => void stats.refetch()} />
      : !data ? <LoadingRows rows={6} label="Loading the people figures" />
      : <Breakdown stats={data} />}
  </Card>
}

function Breakdown({ stats }: { stats: PeopleStats }) {
  const figures = [
    { label: "Joined this week", value: `+${formatCount(stats.newLast7Days)}` },
    { label: "Joined in 30 days", value: `+${formatCount(stats.newLast30Days)}` },
    { label: "Campus badge", value: formatCount(stats.badges.campus), to: peopleWith("badge", "campus") },
    { label: "Suspended", value: formatCount(stats.status.suspended), to: peopleWith("status", "suspended") },
  ]
  return <div className="flex flex-col gap-5">
    <ul aria-label="People figures" className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {figures.map((figure) => {
        const inner = <>
          <span className={cn("block truncate text-b4 md:text-b3", muted)}>{figure.label}</span>
          <span className={cn("mt-1 block font-heading text-h6 font-semibold tabular-nums md:text-h5", ink)}>{figure.value}</span>
        </>
        const box = cn("block h-full rounded-2xl border px-4 py-3", hairline)
        return <li key={figure.label}>
          {figure.to
            ? <Link to={figure.to} className={cn(box, "transition-colors hover:border-purple/40 hover:bg-grey-50 dark:hover:bg-background", focusRing)}>{inner}</Link>
            : <div className={box}>{inner}</div>}
        </li>
      })}
    </ul>
    <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
      <div className="min-w-0">
        <h3 className={cn("mb-1 px-2 text-b3 font-semibold md:text-b2", muted)}>Campus affiliation</h3>
        <BarList label="People by campus affiliation" total={stats.total}
          rows={AFFILIATIONS.map((row) => ({ key: row.key, label: row.label, value: stats.affiliation[row.key], to: peopleWith("affiliation", row.key) }))} />
      </div>
      <div className="min-w-0">
        <h3 className={cn("mb-1 px-2 text-b3 font-semibold md:text-b2", muted)}>Account roles</h3>
        <BarList label="People by account role" total={stats.total}
          rows={roleRows(stats.roles).map((row) => ({ key: row.key, label: row.label, value: stats.roles[row.key], to: peopleWith("role", row.key) }))} />
      </div>
    </div>
  </div>
}
