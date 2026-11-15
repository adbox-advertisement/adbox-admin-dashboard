import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import type { UseQueryResult } from "@tanstack/react-query"
import { Clapperboard, Coins, Lock, Megaphone, UsersRound, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "../lib/cn"
import { APP_ROUTES } from "@/routes/paths"
import { useAdStages, useContentSummary, useGoldSales, usePeopleStats, type DashboardAccess } from "../hooks"
import { formatCedis, formatCedisShort, formatCompact, formatCount, plural } from "../lib/figures"
import { DASHBOARD_PERMISSIONS } from "../types"
import { focusRing, ink, muted } from "./tokens"

/** One figure per part of AdBox: people, money in, ads and posts. Each opens its section. */
export function DashboardHeadlines({ access }: { access: DashboardAccess }) {
  const people = usePeopleStats(access.people)
  const sales = useGoldSales(access.payments)
  const ads = useAdStages(access.ads)
  const content = useContentSummary(access.content)
  return <section aria-label="Headline figures" className="px-4 sm:px-6">
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-12">
      <Tile hero icon={UsersRound} label="People on AdBox" to={APP_ROUTES.manageUsers} allowed={access.people} permission={DASHBOARD_PERMISSIONS.people} query={people}
        value={(stats) => formatCount(stats.total)} hint={(stats) => `+${formatCount(stats.newLast7Days)} this week · +${formatCount(stats.newLast30Days)} in 30 days`} />
      <Tile icon={Coins} label="Gold sales" to={APP_ROUTES.advertisersPayment} allowed={access.payments} permission={DASHBOARD_PERMISSIONS.payments} query={sales}
        value={(gold) => formatCedisShort(gold.paid.totalGhs)} exact={(gold) => `${formatCedis(gold.paid.totalGhs)} paid in`}
        hint={(gold) => `${plural(gold.paid.count, "purchase", "purchases")} · ${formatCompact(gold.paid.totalBars)} bars`} />
      <Tile icon={Megaphone} label="Ads running" to={`${APP_ROUTES.adsManagement}?status=ACTIVE`} allowed={access.ads} permission={DASHBOARD_PERMISSIONS.ads} query={ads}
        value={(stages) => formatCount(stages.counts.ACTIVE ?? 0)} hint={(stages) => `${formatCount(stages.counts.PENDING_REVIEW ?? 0)} in review · ${plural(stages.total, "ad", "ads")} in all`} />
      <Tile icon={Clapperboard} label="Posts live" to={APP_ROUTES.userContentPosts} allowed={access.content} permission={DASHBOARD_PERMISSIONS.content} query={content}
        value={(posts) => formatCount(posts.videos + posts.images + posts.text)} hint={(posts) => `${formatCount(posts.videos)} videos · ${formatCount(posts.images)} pictures · ${formatCount(posts.text)} text`} />
    </div>
  </section>
}

function Tile<T>({ hero = false, icon: Icon, label, to, allowed, permission, query, value, exact, hint }: {
  hero?: boolean
  icon: LucideIcon
  label: string
  to: string
  allowed: boolean
  permission: string
  query: UseQueryResult<T>
  value: (data: T) => string
  /** The figure in full, as a tooltip, when `value` shortens it. */
  exact?: (data: T) => string
  hint: (data: T) => string
}) {
  const box = cn("col-span-1 flex min-h-[112px] min-w-0 items-center gap-3.5 overflow-hidden rounded-[20px] px-5 py-4 shadow-adbox-small sm:col-span-4 md:col-span-3 xl:col-span-3",
    hero ? "bg-[image:var(--gradient-primary)] text-white" : "bg-white dark:bg-card")
  const icon = <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl", hero ? "bg-white/15 text-white" : "bg-purple/10 text-purple dark:bg-royal-500/15 dark:text-royal-300")}>
    <Icon className="size-5" aria-hidden="true" />
  </span>
  const labelClass = cn("truncate text-b3 md:text-b2", hero ? "text-white/80" : muted)
  const valueClass = cn("truncate font-heading text-h5 font-semibold leading-8 tabular-nums", hero ? "text-white" : ink)
  const hintClass = cn("line-clamp-2 text-b4 leading-4 md:text-b3 md:leading-4", hero ? "text-white/80" : muted)

  if (!allowed) {
    return <article className={box} aria-label={`${label}: needs ${permission}`}>
      {icon}
      <span className="min-w-0 flex-1">
        <span className={cn("block", labelClass)}>{label}</span>
        <span className={cn("block", valueClass)}>—</span>
        <span className={cn("flex items-center gap-1", hintClass)}><Lock className="size-3 shrink-0" aria-hidden="true" /><span className="truncate">Needs {permission}</span></span>
      </span>
    </article>
  }
  if (query.isError) {
    return <article className={box} role="alert" aria-label={`${label}: couldn't load`}>
      {icon}
      <span className="min-w-0 flex-1">
        <span className={cn("block", labelClass)}>{label}</span>
        <span className={cn("block text-b3 font-semibold md:text-b2", hero ? "text-white" : "text-destructive")}>Couldn't load</span>
        <Button type="button" variant="link" className={cn("h-auto cursor-pointer p-0 text-b3", hero ? "text-white" : "text-purple")} onClick={() => void query.refetch()}>Retry</Button>
      </span>
    </article>
  }
  const data = query.data
  const body: ReactNode = <>
    {icon}
    <span className="min-w-0 flex-1">
      <span className={cn("block", labelClass)}>{label}</span>
      {data === undefined
        ? <span role="status" aria-label={`Loading ${label}`} className={cn("my-1 block h-8 w-24 animate-pulse rounded-lg", hero ? "bg-white/20" : "bg-grey-100 dark:bg-muted")} />
        : <span className={cn("block", valueClass)}>{value(data)}</span>}
      {data !== undefined && <span className={cn("block", hintClass)}>{hint(data)}</span>}
    </span>
  </>
  return <Link to={to} title={data !== undefined && exact ? exact(data) : undefined} className={cn(box, "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-adbox-medium motion-reduce:transition-none motion-reduce:hover:translate-y-0", focusRing)}>{body}</Link>
}
