import { useId } from "react"
import { Link } from "react-router-dom"
import { formatDistanceToNowStrict } from "date-fns"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { APP_ROUTES } from "@/routes/paths"
import { cn } from "../lib/cn"
import { trendKey } from "../lib/top-trends"
import { useAppTrends, useRecommendationAccess } from "../hooks"
import { Flame } from "./Flame"
import { AppTrendRow } from "./TopTrendList"
import { focusRing, hairline, muted } from "./tokens"

/** How many trends the card shows. */
const SHOWN = 5

/**
 * Trending now, for the dashboard: the app's top 5 Nationwide, drawn as the app draws them with a
 * flame beside each. Each opens on Top trends. Renders nothing for an admin who can't read Trending.
 */
export function TrendingNowCard({ className }: { className?: string }) {
  const access = useRecommendationAccess()
  const list = useAppTrends(null, access.discover)
  const titleId = useId()
  if (!access.loading && !access.discover) return null

  const items = list.data?.items.slice(0, SHOWN) ?? []
  const computed = list.data?.computedAt
  const note = !list.data ? "Nationwide, as the app shows it."
    : list.data.source === "fallback" ? "Nationwide · no list computed yet, so the app shows this week's most-posted hashtags."
    : `Nationwide · computed ${computed ? `${formatDistanceToNowStrict(new Date(computed))} ago` : "—"}${list.data.stale ? " (the trends job is behind)" : ""}.`

  return <article aria-labelledby={titleId} className={cn("flex min-w-0 flex-col rounded-[20px] bg-white px-5 pb-4 pt-6 shadow-adbox-small dark:bg-card sm:px-6", className)}>
    <header className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 id={titleId} className="flex items-center gap-1.5 font-heading text-h6 font-semibold text-black dark:text-foreground md:text-h5">
          Trending now<Flame rank={1} className="h-6 w-5" />
        </h2>
        <p className={cn("mt-1 text-b3 leading-5", muted)}>{note}</p>
      </div>
      <Link to={APP_ROUTES.recommendationsTopTrends} className={cn("inline-flex shrink-0 items-center gap-0.5 rounded-full text-b3 font-semibold text-purple hover:underline dark:text-royal-300", focusRing)}>
        Top 10<ChevronRight className="size-4" aria-hidden="true" />
      </Link>
    </header>

    {list.isError ? <div role="alert" className="mt-4 flex flex-wrap items-center gap-3">
      <p className="text-b3 text-destructive">Couldn't load Trending.</p>
      <Button type="button" variant="outline" size="sm" className="cursor-pointer rounded-full" onClick={() => void list.refetch()}>Retry</Button>
    </div>
      : !list.data ? <ul aria-label="Loading Trending" className="mt-3 flex flex-col">
        {Array.from({ length: SHOWN }, (_, index) => <li key={index} className={cn("flex items-center gap-3 border-b py-3.5 last:border-0", hairline)}>
          <span className="h-6 w-12 animate-pulse rounded bg-grey-100 dark:bg-muted" />
          <span className="h-9 flex-1 animate-pulse rounded-lg bg-grey-100 dark:bg-muted" />
        </li>)}
      </ul>
      : items.length === 0 ? <p className={cn("mt-4 text-b3", muted)}>Nothing is trending yet.</p>
      : <ol aria-label="Trending now in the app" className="mt-2 flex flex-col">
        {items.map((item) => <li key={trendKey(item)} className={cn("border-b last:border-0", hairline)}>
          <Link to={`${APP_ROUTES.recommendationsTopTrends}?trend=${encodeURIComponent(trendKey(item))}`}
            aria-label={`Number ${item.rank}, ${item.title}${item.metrics.label ? `, ${item.metrics.label}` : ""}`}
            className={cn("flex items-center gap-3 rounded-xl px-1 py-3 transition-colors hover:bg-grey-50 dark:hover:bg-muted/40", focusRing)}>
            <AppTrendRow item={item} flame />
          </Link>
        </li>)}
      </ol>}
  </article>
}
