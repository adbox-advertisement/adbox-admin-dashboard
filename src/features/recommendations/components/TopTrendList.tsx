import { useState } from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "../lib/cn"
import { appImage, appRank, appSubline, trendKey, type TopTrend } from "../lib/top-trends"
import type { AppTrend } from "../types"
import { Flame } from "./Flame"
import { focusRing, hairline, ink, kindIcons, muted, tones } from "./tokens"

/** The app's top trends, drawn as the app draws them, with a flame beside every one. Choosing one shows everything about it. */
export function TopTrendList({ trends, selected, onSelect }: { trends: TopTrend[]; selected: string | null; onSelect: (key: string) => void }) {
  return <ol aria-label="Top trends in the app" className="flex flex-col">
    {trends.map(({ item }) => {
      const key = trendKey(item)
      const current = key === selected
      return <li key={key} className={cn("border-b last:border-0", hairline)}>
        <button type="button" aria-current={current ? "true" : undefined} onClick={() => onSelect(key)} aria-label={rowName(item)}
          className={cn("relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-3.5 text-left transition-colors", focusRing,
            current ? "bg-purple/5 dark:bg-royal-500/10" : "hover:bg-grey-50 dark:hover:bg-muted/40")}>
          {current && <span aria-hidden="true" className="absolute inset-y-3 left-0 w-1 rounded-full bg-purple dark:bg-royal-300" />}
          <AppTrendRow item={item} flame />
        </button>
      </li>
    })}
  </ol>
}

/** The app reads a row as one sentence (discover_lists_view.dart _TrendingRow). */
function rowName(item: AppTrend) {
  return [`Number ${item.rank}`, item.title, appSubline(item), item.metrics.label].filter(Boolean).join(", ")
}

/**
 * One row as the app shows it: two-digit rank (the top 3 in ink, the rest muted), a flame, the
 * title, "category · Featured", the arrow with the count, and the picture. `flame` puts a flame by
 * any rank; without it, only the top 3 burn, as in the app.
 */
export function AppTrendRow({ item, flame = false }: { item: AppTrend; flame?: boolean }) {
  const burning = flame || item.rank <= 3
  const Arrow = item.trend?.direction === "DOWN" ? TrendingDown : TrendingUp
  return <>
    <span className="flex min-w-14 shrink-0 items-center gap-0.5">
      <span className={cn("font-heading text-h5 font-bold tracking-tight tabular-nums", item.rank <= 3 ? ink : muted)}>{appRank(item.rank)}</span>
      {burning && <Flame rank={item.rank} />}
    </span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className={cn("truncate font-heading text-b2 font-extrabold", ink)}>{item.title}</span>
      <span className={cn("truncate text-b3 leading-4", muted)}>{appSubline(item)}</span>
      {item.metrics.label && <span className={cn("mt-1 flex min-w-0 items-center gap-1 text-b3 leading-4", ink)}>
        <Arrow className="size-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{item.metrics.label}</span>
      </span>}
    </span>
    <Thumbnail item={item} />
  </>
}

/** The app's picture for the trend, or its kind's icon when there is none (or it won't load). */
export function Thumbnail({ item, size = "md" }: { item: AppTrend; size?: "md" | "lg" }) {
  const url = appImage(item)
  const [failed, setFailed] = useState<string | null>(null)
  const Icon = kindIcons[item.kind]
  const box = size === "md" ? "h-14 w-11 rounded-xl" : "h-24 w-20 rounded-2xl"
  if (url && failed !== url) {
    return <img src={url} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(url)}
      className={cn("shrink-0 bg-grey-100 object-cover dark:bg-muted", item.kind === "PERSON" && size === "md" ? "size-11 rounded-full" : box)} />
  }
  return <span className={cn("flex shrink-0 items-center justify-center", tones.grey, box)}>
    <Icon className={size === "md" ? "size-4" : "size-6"} aria-hidden="true" />
  </span>
}
