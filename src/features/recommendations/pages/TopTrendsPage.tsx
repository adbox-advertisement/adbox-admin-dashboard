import { useRef } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { formatDistanceToNowStrict } from "date-fns"
import { ArrowRight, Flame as FlameIcon, Lock, RefreshCw, Table2, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { APP_ROUTES } from "@/routes/paths"
import { cn } from "../lib/cn"
import { loadErrorDetail } from "../lib/errors"
import { useLive } from "../lib/live-context"
import { scopeLabel } from "../lib/overrides"
import { APP_LIST_PATTERN, TOP_COUNT, appListOptions, joinTopTrends, kindMix, trendKey } from "../lib/top-trends"
import { RECOMMENDATION_PERMISSIONS } from "../types"
import { useAppTrends, useInstitutionDirectory, useRecommendationAccess, useRefreshTrends, useTrendReport, useTrendStatus } from "../hooks"
import { PageHero, Section } from "../components/PageParts"
import { ParamChip } from "../components/ParamChip"
import { ErrorState, IconTile } from "../components/Surface"
import { TopTrendList } from "../components/TopTrendList"
import { TrendComparison } from "../components/TrendComparison"
import { TrendInspector } from "../components/TrendInspector"
import { focusRing, ink, muted, surface } from "../components/tokens"

const MINUTE_MS = 60_000

/** Algorithms › Top trends: the app's top 10, each with a flame, and everything about the one chosen. */
export function TopTrendsPage() {
  const access = useRecommendationAccess()
  const live = useLive()
  const [params, setParams] = useSearchParams()
  const requested = params.get("list") ?? "global"
  const scopeKey = APP_LIST_PATTERN.test(requested) ? requested : "global"
  const institutionId = scopeKey === "global" ? null : scopeKey.slice("inst:".length)
  const details = useRef<HTMLDivElement>(null)

  const directory = useInstitutionDirectory(access.institutions)
  const status = useTrendStatus(access.discover)
  const list = useAppTrends(institutionId, access.discover)
  const report = useTrendReport(scopeKey, access.discover, MINUTE_MS)
  const refresh = useRefreshTrends()

  if (access.loading) return <p role="status" className={cn("px-4 py-8 text-b2 sm:px-6", muted)}>Loading…</p>
  if (!access.discover) {
    return <div className="px-4 sm:px-6"><div className={cn(surface, "flex flex-col items-center px-6 py-14 text-center")}>
      <IconTile icon={Lock} size="lg" />
      <h2 className={cn("mt-3 font-heading text-b1 font-semibold", ink)}>You don't have access to Trending</h2>
      <p className={cn("mt-1.5 max-w-sm text-b2 leading-6", muted)}>Ask a Super Admin for the <span className="font-mono text-b3">{RECOMMENDATION_PERMISSIONS.discover}</span> permission.</p>
    </div></div>
  }

  const scopeName = scopeLabel(scopeKey, directory.data)
  const options = appListOptions(directory.data, status.data?.scopes ?? [], scopeKey)
  const trends = list.data ? joinTopTrends(list.data, report.data) : []
  const chosen = trends.find((trend) => trendKey(trend.item) === params.get("trend")) ?? trends[0] ?? null
  const featured = trends.filter((trend) => trend.item.featured).length

  const select = (key: string) => {
    setParams((current) => {
      const next = new URLSearchParams(current)
      next.set("trend", key)
      return next
    }, { replace: true })
    // Below xl the details sit under the list: bring them into view.
    if (!window.matchMedia("(min-width: 80rem)").matches) {
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      details.current?.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" })
    }
  }

  return <div className="flex min-w-0 flex-col gap-5 px-4 sm:px-6">
    <PageHero icon={FlameIcon} title="Top trends" aside={<>
      <ParamChip id="discover.score.recentWindowHours" /><ParamChip id="discover.score.momentumExponent" /><ParamChip id="discover.job.intervalMinutes" />
    </>}>
      The {TOP_COUNT} subjects at the top of Trending in the app right now, in the app's order and drawn as the app draws them, each with its
      flame. Choose one to see everything about it: what it is, how many people are taking part, why it ranks where it does, and any admin
      override. Re-read every minute; nothing here changes the app.
    </PageHero>

    <div className={cn(surface, "flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-5")}>
      <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
        <span className={cn("text-b3 font-semibold", ink)}>List</span>
        <Select value={scopeKey} onValueChange={(value) => setParams({ list: value }, { replace: true })}>
          <SelectTrigger aria-label="List" className="h-10 w-full rounded-full sm:w-64"><SelectValue /></SelectTrigger>
          <SelectContent>
            {options.map((option) => <SelectItem key={option.key} value={option.key}>{option.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <ListStatus list={list.data} intervalMinutes={status.data?.intervalMinutes} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" className="h-10 cursor-pointer rounded-full" onClick={() => void refresh()} disabled={list.isFetching}>
          <RefreshCw className={cn("size-4", list.isFetching && "animate-spin motion-reduce:animate-none")} aria-hidden="true" />Refresh
        </Button>
        <Link to={`${APP_ROUTES.recommendationsOverrides}?list=${encodeURIComponent(scopeKey)}`}
          className={cn("inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-b3 font-semibold text-purple hover:bg-purple/5 dark:text-royal-300 dark:hover:bg-royal-500/10", focusRing)}>
          Trending overrides<ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>

    {list.isPending ? <p role="status" className={cn(surface, "p-6 text-b2", muted)}>Loading Trending…</p>
      : list.isError ? <div className={surface}>
        <ErrorState message="Couldn't load Trending." onRetry={() => void list.refetch()} />
        <p className={cn("px-5 pb-5 text-b3", muted)} data-testid="load-error-detail">{loadErrorDetail(list.error)}</p>
      </div>
      : trends.length === 0 ? <p className={cn(surface, "p-6 text-b2", muted)}>Nothing is trending in {scopeName} yet.</p>
      : <>
        <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-12">
          <Section icon={FlameIcon} title={`${scopeName}: the top ${trends.length}`} className="xl:col-span-4 xl:self-start"
            description={`${kindMix(trends.map((trend) => trend.item))}${featured > 0 ? `; ${featured} featured by admins` : ""}.`}>
            <TopTrendList trends={trends} selected={chosen ? trendKey(chosen.item) : null} onSelect={select} />
          </Section>
          <div ref={details} className={cn(surface, "min-w-0 scroll-mt-24 p-5 sm:p-6 xl:col-span-8")}>
            {chosen && <TrendInspector trend={chosen} list={list.data} scopeKey={scopeKey} scopeName={scopeName} policy={live.discover.policy}
              scores={{ pending: report.isPending, error: report.isError ? report.error : null, retry: () => void report.refetch() }} canManage={access.manageTrends} />}
          </div>
        </div>

        <Section icon={Table2} title="All side by side" description="Overrides, counts, change and the parts of each score, to compare them. Choose a name to see everything about it.">
          <TrendComparison trends={trends} selected={chosen ? trendKey(chosen.item) : null} onSelect={select} />
        </Section>
      </>}
  </div>
}

function ListStatus({ list, intervalMinutes }: { list?: { source: "snapshot" | "institution" | "fallback"; computedAt: string | null; policyVersion: string | null; stale: boolean }; intervalMinutes?: number }) {
  if (!list) return null
  if (list.source === "fallback") {
    return <p className={cn("max-w-md text-b3 leading-5", muted)}>No list computed here yet: the app shows the hashtags with the most posts here this week, and anything pinned or featured.</p>
  }
  const age = list.computedAt ? `${formatDistanceToNowStrict(new Date(list.computedAt))} ago` : "—"
  if (list.stale) {
    return <p className="inline-flex items-center gap-1 text-b3 font-semibold text-warning-700 dark:text-warning-300">
      <TriangleAlert className="size-3.5 shrink-0" aria-hidden="true" />The trends job is behind: this list was computed {age}.
    </p>
  }
  return <p className={cn("text-b3", muted)}>
    Computed {age}{list.policyVersion ? ` with ${list.policyVersion}` : ""}{intervalMinutes ? `, every ${intervalMinutes} min` : ""}.
  </p>
}

