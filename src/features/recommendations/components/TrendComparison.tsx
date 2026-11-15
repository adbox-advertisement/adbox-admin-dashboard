import { KIND_LABELS } from "../data/catalog"
import { cn } from "../lib/cn"
import { actionSummary } from "../lib/overrides"
import { appRank, trendKey, type TopTrend } from "../lib/top-trends"
import { formatNumber, formatScore } from "../lib/values"
import type { TrendDirection } from "../types"
import { focusRing, hairline, ink, muted, series } from "./tokens"

const COLUMNS: Array<{ label: string; numeric?: boolean }> = [
  { label: "Place" }, { label: "Trend" }, { label: "Kind" }, { label: "Admin" }, { label: "People", numeric: true }, { label: "Posts", numeric: true },
  { label: "Against usual", numeric: true }, { label: "Score", numeric: true }, { label: "Momentum", numeric: true }, { label: "Breadth", numeric: true },
  { label: "Quality", numeric: true },
]

/** The top trends side by side: overrides, counts, change and score parts. Also the list's table view. */
export function TrendComparison({ trends, selected, onSelect }: { trends: TopTrend[]; selected: string | null; onSelect: (key: string) => void }) {
  const best = Math.max(0, ...trends.map((trend) => trend.computed?.score ?? 0))
  const cell = "whitespace-nowrap px-3 py-2.5"
  return <div className="min-w-0 overflow-x-auto">
    <table className="w-full min-w-max border-collapse text-left text-b3 md:text-b2">
      <caption className="sr-only">The top trends side by side</caption>
      <thead>
        <tr className={cn("border-b", hairline)}>
          {COLUMNS.map((column) => <th key={column.label} scope="col" className={cn("whitespace-nowrap px-3 py-2 text-b3 font-semibold", muted, column.numeric && "text-right")}>{column.label}</th>)}
        </tr>
      </thead>
      <tbody className={ink}>
        {trends.map(({ item, computed, override }) => {
          const key = trendKey(item)
          const parts = computed?.parts
          const people = item.metrics.participants ?? computed?.metrics?.participants ?? null
          const posts = item.metrics.posts ?? computed?.metrics?.posts ?? null
          return <tr key={key} className={cn("border-b last:border-0", hairline, key === selected && "bg-purple/5 dark:bg-royal-500/10")}>
            <td className={cn(cell, "font-semibold tabular-nums")}>{appRank(item.rank)}</td>
            <th scope="row" className={cn(cell, "max-w-56 font-normal")}>
              <button type="button" onClick={() => onSelect(key)} aria-current={key === selected ? "true" : undefined} aria-label={`Show everything about ${item.title}`}
                className={cn("block max-w-full cursor-pointer truncate rounded text-left font-semibold hover:underline", focusRing)}>
                {item.title}
              </button>
            </th>
            <td className={cell}>{KIND_LABELS[item.kind].one}</td>
            <td className={cell}>{override ? actionSummary(override) : "—"}</td>
            <td className={cn(cell, "text-right tabular-nums")}>{people === null ? "—" : formatNumber(people)}</td>
            <td className={cn(cell, "text-right tabular-nums")}>{posts === null ? "—" : formatNumber(posts)}</td>
            <td className={cn(cell, "text-right tabular-nums")}>{changeShort(item.trend)}</td>
            <td className={cn(cell, "text-right")}>{computed ? <ScoreBar score={computed.score} best={best} /> : "—"}</td>
            <td className={cn(cell, "text-right tabular-nums")}>{parts ? formatScore(parts.momentum) : "—"}</td>
            <td className={cn(cell, "text-right tabular-nums")}>{parts ? formatScore(parts.breadth) : "—"}</td>
            <td className={cn(cell, "text-right tabular-nums")}>{parts ? formatScore(parts.quality) : "—"}</td>
          </tr>
        })}
      </tbody>
    </table>
  </div>
}

/** "+140%", "−20%", "Steady", "New". */
function changeShort(trend: TrendDirection | null) {
  if (!trend) return "—"
  if (trend.direction === "NEW") return "New"
  if (trend.direction === "STEADY") return "Steady"
  return `${trend.direction === "UP" ? "+" : "−"}${formatNumber(Math.abs(trend.changePct ?? 0))}%`
}

/** The score, with a bar against the best of the list. */
function ScoreBar({ score, best }: { score: number; best: number }) {
  const share = best > 0 ? Math.max(2, Math.round((score / best) * 100)) : 0
  return <span className="inline-flex items-center gap-2">
    <span className="tabular-nums">{formatScore(score)}</span>
    <span aria-hidden="true" className="h-1.5 w-16 overflow-hidden rounded-full bg-grey-100 dark:bg-muted">
      <span className={cn("block h-full rounded-full", series.first.swatch)} style={{ width: `${share}%` }} />
    </span>
  </span>
}
