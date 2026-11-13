import { useId, useState } from "react"
import { ArrowDown, ArrowUp, CircleCheck, CircleX, Minus, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "../lib/cn"
import { useLive } from "../lib/live-context"
import { evenSpreadDecay, trendScore } from "../lib/discover"
import { formatNumber, formatScore } from "../lib/values"
import { KIND_LABELS, LEVEL_LABELS, SIGNAL_LABELS } from "../data/catalog"
import { SCOPE_LEVELS, TREND_KINDS, type ScopeLevel, type TrendKind, type WeightedSignal } from "../types"
import { hairline, ink, muted, pill, tones } from "./tokens"

const SIGNALS: WeightedSignal[] = ["post", "like", "comment", "share", "follow"]

/** One subject's trend score in one scope, from a few numbers, with the live Discover policy. */
export function TrendCalculator() {
  const { discover } = useLive()
  const policy = discover.policy
  const [kind, setKind] = useState<TrendKind>("HASHTAG")
  const [level, setLevel] = useState<ScopeLevel>("CAMPUS")
  const [actors, setActors] = useState<Record<string, number>>({ post: 12, like: 30, comment: 8, share: 4, follow: 0 })
  const [ordinary, setOrdinary] = useState(40)
  const [participants, setParticipants] = useState(36)
  const [negative, setNegative] = useState(2)
  const [impressions, setImpressions] = useState(900)

  const result = trendScore({ kind, level, actors, ordinaryShare: ordinary / 100, participants, negative, impressions }, policy)
  const decay = evenSpreadDecay(policy.score)
  const windowHours = policy.score.recentWindowHours

  return <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-12">
    <div className="flex min-w-0 flex-col gap-4 xl:col-span-5">
      <Choice label="Kind of subject" value={kind} options={TREND_KINDS.map((value) => ({ value, label: KIND_LABELS[value].one }))} onChange={setKind} />
      <Choice label="List" value={level} options={SCOPE_LEVELS.map((value) => ({ value, label: LEVEL_LABELS[value].label }))} onChange={setLevel} />
      <fieldset className={cn("rounded-2xl border p-4", hairline)}>
        <legend className={cn("px-1 text-b3 font-semibold", ink)}>People in the last {windowHours} hours who…</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2">
          {SIGNALS.map((signal) => <NumberField key={signal} label={SIGNAL_LABELS[signal].label} suffix={`× ${formatNumber(policy.weights[kind][signal])}`}
            value={actors[signal] ?? 0} onChange={(value) => setActors((current) => ({ ...current, [signal]: value }))} />)}
        </div>
      </fieldset>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <NumberField label="People taking part" value={participants} onChange={setParticipants} />
        <NumberField label="Hid or reported it" value={negative} onChange={setNegative} />
        <NumberField label="Impressions" value={impressions} onChange={setImpressions} />
        <RangeField label="An ordinary day had" value={ordinary} onChange={setOrdinary} suffix="% of this activity" />
      </div>
    </div>

    <div className="min-w-0 xl:col-span-7">
      <div className={cn("rounded-2xl border p-4 sm:p-5", hairline)}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={cn("text-b3 font-semibold", muted)}>Trend score</p>
            <p className={cn("mt-1 font-heading text-h4 font-semibold", ink)} data-testid="trend-score">{formatScore(result.score)}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {result.eligible
              ? <span className={cn(pill, tones.success)}><CircleCheck className="size-3" aria-hidden="true" />Ranked in {LEVEL_LABELS[level].phrase} list</span>
              : <span className={cn(pill, tones.warning)}><CircleX className="size-3" aria-hidden="true" />Not ranked</span>}
            <Direction direction={result.direction} changePct={result.changePct} />
          </div>
        </div>
        {!result.eligible && <ul className="mt-3 flex flex-col gap-1 text-b3 text-warning-700 dark:text-warning-300">
          {!result.enoughPeople && <li>Needs {formatNumber(result.minimum)} people taking part in {LEVEL_LABELS[level].phrase} list; has {formatNumber(participants)}.</li>}
          {!result.enoughActivity && <li>Needs recent activity of at least {formatNumber(policy.score.minRecent)}; has {formatScore(result.recent)}.</li>}
        </ul>}

        <dl className="mt-4 flex flex-col">
          <Row term="Weighted activity" formula={`Σ weight × people, for a ${KIND_LABELS[kind].one.toLowerCase()}`} value={formatScore(result.raw)} />
          <Row term="Recent" formula={`spread over ${windowHours} h, halving every ${formatNumber(policy.score.halfLifeHours)} h (×${formatScore(decay)})`} value={formatScore(result.recent)} />
          <Row term="Baseline" formula={`an ordinary day over the last ${formatNumber(policy.score.baselineDays)} days`} value={formatScore(result.baseline)} />
          <Row term="Momentum" formula={`(recent + ${formatNumber(policy.score.smoothing)}) ÷ (baseline + ${formatNumber(policy.score.smoothing)})`} value={formatScore(result.momentum)} />
          <Row term="Breadth" formula="ln(1 + people taking part)" value={formatScore(result.breadth)} />
          <Row term="Quality" formula={`1 ÷ (1 + ${formatNumber(policy.score.qualityPenalty)} × hid or reported ÷ impressions)`} value={formatScore(result.quality)} />
          <Row term="Score" formula={`momentum^${formatNumber(policy.score.momentumExponent)} × breadth × quality × ${formatNumber(result.kindMultiplier)}`} value={formatScore(result.score)} strong />
        </dl>
      </div>
      <p className={cn("mt-2 text-b3 leading-5", muted)}>
        Recent activity is decayed and the ordinary day is not, so even steady activity has momentum below 1: scores only rank subjects against each other.
        This assumes the activity was spread evenly over the window. Settings: {discover.label}.
      </p>
    </div>
  </div>
}

function Direction({ direction, changePct }: { direction: "UP" | "DOWN" | "STEADY" | "NEW"; changePct: number | null }) {
  const style = { UP: { icon: ArrowUp, text: `${changePct}% above an ordinary day` }, DOWN: { icon: ArrowDown, text: `${Math.abs(changePct ?? 0)}% below an ordinary day` },
    STEADY: { icon: Minus, text: "Steady" }, NEW: { icon: Sparkles, text: "New: no ordinary day yet" } }[direction]
  return <span className={cn("inline-flex items-center gap-1 text-b3 font-semibold", ink)}><style.icon className="size-3.5" aria-hidden="true" />{style.text}</span>
}

function Row({ term, formula, value, strong }: { term: string; formula: string; value: string; strong?: boolean }) {
  return <div className={cn("grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 border-t py-2.5", hairline)}>
    <dt className="min-w-0">
      <span className={cn("text-b2", strong ? "font-semibold" : "", ink)}>{term}</span>
      <span className={cn("block text-b4", muted)}>{formula}</span>
    </dt>
    <dd className={cn("self-center text-b2 tabular-nums", strong ? "font-semibold" : "", ink)}>{value}</dd>
  </div>
}

function Choice<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: Array<{ value: T; label: string }>; onChange: (value: T) => void }) {
  return <div>
    <p className={cn("mb-1.5 text-b3 font-semibold", ink)}>{label}</p>
    <div role="radiogroup" aria-label={label} className="flex w-fit max-w-full flex-wrap gap-1 rounded-3xl bg-grey-50 p-1 dark:bg-background">
      {options.map((option) => <button key={option.value} type="button" role="radio" aria-checked={option.value === value} onClick={() => onChange(option.value)}
        className={cn("min-h-8 cursor-pointer rounded-full px-3 text-b3 font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-purple",
          option.value === value ? "bg-white text-purple shadow-adbox-small dark:bg-card" : "text-grey-500 hover:text-grey-1000 dark:text-muted-foreground dark:hover:text-foreground")}>
        {option.label}
      </button>)}
    </div>
  </div>
}

function NumberField({ label, value, onChange, suffix }: { label: string; value: number; onChange: (value: number) => void; suffix?: string }) {
  const id = useId()
  return <div className="min-w-0">
    <label htmlFor={id} className={cn("mb-1 flex items-baseline justify-between gap-2 text-b3 font-semibold", ink)}>{label}{suffix && <span className={cn("font-normal tabular-nums", muted)}>{suffix}</span>}</label>
    <Input id={id} inputMode="numeric" value={String(value)} className="h-9 rounded-lg tabular-nums"
      onChange={(event) => onChange(Number(event.target.value.replace(/\D/g, "").slice(0, 7) || 0))} />
  </div>
}

function RangeField({ label, value, onChange, suffix }: { label: string; value: number; onChange: (value: number) => void; suffix: string }) {
  const id = useId()
  return <div className="min-w-0">
    <label htmlFor={id} className={cn("mb-1 block text-b3 font-semibold", ink)}>{label} <span className="tabular-nums">{value}</span><span className={cn("font-normal", muted)}>{suffix}</span></label>
    <input id={id} type="range" min={0} max={200} step={5} value={value} onChange={(event) => onChange(Number(event.target.value))} aria-valuetext={`${value}${suffix}`} className="h-2 w-full cursor-pointer accent-purple" />
  </div>
}
