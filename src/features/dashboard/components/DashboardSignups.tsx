import { useState } from "react"
import { Minus, TrendingDown, TrendingUp } from "lucide-react"
import { useSignups } from "../hooks"
import { cn } from "../lib/cn"
import { isMissingRoute } from "../lib/errors"
import { formatCount } from "../lib/figures"
import { SIGNUP_RANGES, busiestBar, changeWords, rangeInfo, signupBars, signupSummary, type SignupRange } from "../lib/signups"
import { Card, LoadError, LoadingRows } from "./DashboardBits"
import { SignupsChart } from "./SignupsChart"
import { focusRing, hairline, ink, muted } from "./tokens"

/** New accounts over 30 days, 12 weeks or 12 months, compared with the span before. */
export function DashboardSignups() {
  const [range, setRange] = useState<SignupRange>("30d")
  const query = useSignups(range, true)
  const now = new Date()
  const data = query.data
  // While another range loads, the last one stays, dimmed.
  const shown = rangeInfo(data?.range ?? range)

  return <section className="px-4 sm:px-6">
    <Card title="Sign-ups" description="New accounts, counted by day in Ghana time." action={<RangeSwitch value={range} onChange={setRange} />}>
      {!data && query.isError
        ? isMissingRoute(query.error)
          ? <p className={cn("rounded-2xl border p-4 text-b3 leading-5 md:text-b2 md:leading-6", hairline, muted)}>
            This chart needs the newer admin server (<span className="font-mono text-b4">GET /platform-users/signups</span>). It appears once the backend is updated.
          </p>
          : <LoadError message="Couldn't load the sign-ups." onRetry={() => void query.refetch()} />
        : !data ? <LoadingRows rows={5} label="Loading the sign-ups" />
        : <Figures range={shown.key} points={data.signups.points} everyone={data.signups.before + data.signups.total} now={now} dimmed={query.isPlaceholderData} />}
    </Card>
  </section>
}

function Figures({ range, points, everyone, now, dimmed }: { range: SignupRange; points: Array<{ date: string; joined: number }>; everyone: number; now: Date; dimmed: boolean }) {
  const info = rangeInfo(range)
  const bars = signupBars(points, range, now)
  const summary = signupSummary(points, range, now)
  const busiest = busiestBar(bars)
  const ChangeIcon = summary.change === null ? (summary.total > 0 ? TrendingUp : Minus) : summary.change > 0 ? TrendingUp : summary.change < 0 ? TrendingDown : Minus
  const changeTone = summary.change === null ? (summary.total > 0 ? "up" : "flat") : summary.change > 0 ? "up" : summary.change < 0 ? "down" : "flat"

  return <div className={cn("flex min-w-0 flex-col gap-4 transition-opacity motion-reduce:transition-none", dimmed && "opacity-60")} aria-busy={dimmed}>
    <ul aria-label="Sign-up figures" className="flex flex-wrap items-end gap-x-8 gap-y-3">
      <li>
        <span className={cn("block font-heading text-h4 font-semibold leading-10 tabular-nums", ink)}>{formatCount(summary.total)}</span>
        <span className={cn("block text-b3 md:text-b2", muted)}>in {info.span}</span>
      </li>
      <li>
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-b3 font-semibold",
          changeTone === "up" ? "bg-success-500/10 text-success-700 dark:text-success-300" : changeTone === "down" ? "bg-warning-500/10 text-warning-700 dark:text-warning-300" : "bg-grey-100 text-grey-700 dark:bg-muted dark:text-muted-foreground")}>
          <ChangeIcon className="size-3.5" aria-hidden="true" />{changeWords(summary)}
        </span>
        <span className={cn("mt-1 block text-b3 md:text-b2", muted)}>on {info.previous} ({formatCount(summary.previous)})</span>
      </li>
      <li>
        <span className={cn("block text-b2 font-semibold tabular-nums", ink)}>{summary.perDay.toLocaleString("en-US", { maximumFractionDigits: 1 })}</span>
        <span className={cn("block text-b3 md:text-b2", muted)}>a day on average</span>
      </li>
      {busiest && <li>
        <span className={cn("block text-b2 font-semibold tabular-nums", ink)}>{formatCount(busiest.joined)}</span>
        <span className={cn("block text-b3 md:text-b2", muted)}>busiest {info.bucket}: {busiest.period}</span>
      </li>}
      <li>
        <span className={cn("block text-b2 font-semibold tabular-nums", ink)}>{formatCount(everyone)}</span>
        <span className={cn("block text-b3 md:text-b2", muted)}>accounts in all</span>
      </li>
    </ul>

    <SignupsChart bars={bars} unit={info.bucket} label={`Sign-ups per ${info.bucket}, ${info.span}: ${formatCount(summary.total)} in all`} />

    <details className="group">
      <summary className={cn("w-fit cursor-pointer rounded text-b3 font-semibold text-purple dark:text-royal-300 md:text-b2", focusRing)}>Show the numbers</summary>
      <div className="mt-2 max-h-72 overflow-auto rounded-xl border [contain:paint] dark:border-border">
        <table className="w-full text-left text-b3 md:text-b2">
          <caption className="sr-only">Sign-ups per {info.bucket}, {info.span}</caption>
          <thead className="sticky top-0 bg-white dark:bg-card">
            <tr className={cn("border-b", hairline, muted)}>
              <th scope="col" className="px-4 py-2 font-semibold">{info.bucket[0].toUpperCase() + info.bucket.slice(1)}</th>
              <th scope="col" className="px-4 py-2 text-right font-semibold">Sign-ups</th>
            </tr>
          </thead>
          <tbody className={cn("tabular-nums", ink)}>
            {bars.map((bar) => <tr key={bar.key} className={cn("border-b last:border-0", hairline)}>
              <th scope="row" className="px-4 py-1.5 font-normal">{bar.period}{bar.partial ? " (so far)" : ""}</th>
              <td className="px-4 py-1.5 text-right">{formatCount(bar.joined)}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </details>
  </div>
}

function RangeSwitch({ value, onChange }: { value: SignupRange; onChange: (range: SignupRange) => void }) {
  return <div role="radiogroup" aria-label="Sign-ups over" className="flex gap-1 rounded-3xl bg-grey-50 p-1 dark:bg-background">
    {SIGNUP_RANGES.map((option) => <button key={option.key} type="button" role="radio" aria-checked={value === option.key} onClick={() => onChange(option.key)}
      className={cn("min-h-8 cursor-pointer whitespace-nowrap rounded-full px-3 text-b3 font-semibold transition-colors", focusRing,
        value === option.key ? "bg-white text-purple shadow-adbox-small dark:bg-card dark:text-royal-300" : "text-grey-500 hover:text-grey-1000 dark:text-muted-foreground dark:hover:text-foreground")}>
      {option.label}
    </button>)}
  </div>
}
