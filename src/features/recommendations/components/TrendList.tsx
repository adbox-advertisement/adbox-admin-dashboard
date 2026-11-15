import { formatDistanceToNowStrict } from "date-fns"
import { ArrowDown, ArrowUp, EllipsisVertical, Minus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "../lib/cn"
import { actionSummary, missedReason, subjectLabel, type OverrideChoice } from "../lib/overrides"
import { formatNumber, formatScore } from "../lib/values"
import { KIND_LABELS } from "../data/catalog"
import type { TrendItem, TrendKind, TrendOverride, TrendReport, TrendSubject } from "../types"
import { hairline, ink, kindIcons, muted, pill, tones } from "./tokens"

type Props = {
  report: TrendReport
  names: ReadonlyMap<string, string>
  /** Overrides in force now in this list, by `kind:id`. */
  inForce: ReadonlyMap<string, TrendOverride>
  canManage: boolean
  onAction: (subject: TrendSubject, choice: OverrideChoice) => void
}

/** A list as the trends job last computed it, before overrides, and the subjects that just missed. */
export function TrendList({ report, names, inForce, canManage, onAction }: Props) {
  const snapshot = report.snapshot
  if (!snapshot) {
    return <p className={cn("rounded-2xl border p-4 text-b3 leading-5 md:text-b2 md:leading-6", hairline, muted)}>
      This list hasn't been computed yet. The trends job builds it once enough people are active here; until then the app shows
      a fallback list, and pins and features in this list still apply.
    </p>
  }
  const missed = snapshot.diagnostics?.missed ?? []
  return <div className="flex min-w-0 flex-col gap-5">
    <p className={cn("text-b3", muted)}>
      Computed {formatDistanceToNowStrict(new Date(snapshot.computedAt))} ago with {snapshot.policyVersion}
      {snapshot.diagnostics ? ` · ${formatNumber(snapshot.diagnostics.candidates)} subjects had activity` : ""}. Overrides apply when the app reads the list.
    </p>

    {snapshot.items.length === 0
      ? <p className={cn("text-b3", muted)}>Nothing qualified at the last run.</p>
      : <ol aria-label="The list now" className="flex flex-col">
        {snapshot.items.map((item) => <Row key={`${item.kind}:${item.id}`} item={item} name={subjectLabel(item.kind, item.id, names)}
          override={inForce.get(`${item.kind}:${item.id}`)} canManage={canManage} onAction={onAction} />)}
      </ol>}

    {missed.length > 0 && <section aria-label="Just missed">
      <h4 className={cn("mb-1 text-b2 font-semibold", ink)}>Just missed</h4>
      <p className={cn("mb-2 text-b3", muted)}>The best subjects that didn't qualify, and why. A pin or feature can still place one.</p>
      <ul className="flex flex-col">
        {missed.map((item) => {
          const name = subjectLabel(item.kind, item.id, names)
          const Icon = kindIcons[item.kind]
          return <li key={`${item.kind}:${item.id}`} className={cn("flex items-start gap-3 border-b py-2.5 last:border-0", hairline)}>
            <Icon className={cn("mt-0.5 size-4 shrink-0", muted)} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className={cn("truncate text-b2 font-semibold", ink)}>{name}</p>
              <p className={cn("text-b3", muted)}>{KIND_LABELS[item.kind].one} · {item.reasons.map(missedReason).join("; ") || "didn't qualify"}</p>
            </div>
            {canManage && <ActionMenu name={name} subject={{ kind: item.kind, id: item.id, name }} choices={["PIN", "FEATURE"]} onAction={onAction} />}
          </li>
        })}
      </ul>
    </section>}
  </div>
}

function Row({ item, name, override, canManage, onAction }: { item: TrendItem; name: string; override?: TrendOverride; canManage: boolean; onAction: Props["onAction"] }) {
  const Icon = kindIcons[item.kind]
  const people = item.metrics?.participants
  return <li className={cn("flex items-center gap-3 border-b py-2.5 last:border-0", hairline)}>
    <span className={cn("w-6 shrink-0 text-right font-heading text-b1 font-semibold tabular-nums", ink)}>{item.rank}</span>
    <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", tones.grey)}><Icon className="size-4" aria-hidden="true" /></span>
    <div className="min-w-0 flex-1">
      <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <span className={cn("min-w-0 truncate text-b2 font-semibold", ink)}>{name}</span>
        {override && <span className={cn(pill, tones.purple)} data-testid="override-badge">{actionSummary(override)}</span>}
      </p>
      <p className={cn("flex flex-wrap items-center gap-x-2 text-b3", muted)}>
        <span>{KIND_LABELS[item.kind].one}</span>
        {people !== undefined && <span>{formatNumber(people)} {people === 1 ? "person" : "people"}</span>}
        <Direction trend={item.trend} />
      </p>
    </div>
    <span className={cn("shrink-0 text-b3 tabular-nums", muted)} title="Trend score">{formatScore(item.score)}</span>
    {canManage && <ActionMenu name={name} subject={{ kind: item.kind, id: item.id, name }} choices={["PIN", "BOOST", "DAMPEN", "SUPPRESS"]} onAction={onAction} />}
  </li>
}

function Direction({ trend }: { trend: TrendItem["trend"] }) {
  if (!trend) return null
  if (trend.direction === "NEW") return <span className="inline-flex items-center gap-0.5"><Sparkles className="size-3" aria-hidden="true" />New</span>
  if (trend.direction === "STEADY") return <span className="inline-flex items-center gap-0.5"><Minus className="size-3" aria-hidden="true" />Steady</span>
  const Icon = trend.direction === "UP" ? ArrowUp : ArrowDown
  return <span className="inline-flex items-center gap-0.5"><Icon className="size-3" aria-hidden="true" />{Math.abs(trend.changePct ?? 0)}% {trend.direction === "UP" ? "above" : "below"} usual</span>
}

const CHOICE_LABELS: Record<OverrideChoice, string> = { PIN: "Pin…", FEATURE: "Feature…", BOOST: "Boost…", DAMPEN: "Dampen…", SUPPRESS: "Suppress…" }

function ActionMenu({ name, subject, choices, onAction }: { name: string; subject: { kind: TrendKind; id: string; name: string }; choices: OverrideChoice[]; onAction: Props["onAction"] }) {
  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0 cursor-pointer rounded-full" aria-label={`Change where ${name} appears`}>
        <EllipsisVertical className="size-4" aria-hidden="true" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {choices.map((choice) => <DropdownMenuItem key={choice} onSelect={() => onAction(subject, choice)}>{CHOICE_LABELS[choice]}</DropdownMenuItem>)}
    </DropdownMenuContent>
  </DropdownMenu>
}
