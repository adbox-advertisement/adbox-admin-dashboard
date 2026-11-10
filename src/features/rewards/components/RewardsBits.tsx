import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { AlertTriangle, ArrowLeft, CheckCircle2, CircleAlert, FlaskConical, Loader2, RotateCcw, SearchX, ShieldCheck, XCircle, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useResetSampleRewards } from "../hooks"
import { initials, kindLabels, riskLabels, statusShort } from "../lib/rewards"
import type { OfferKind, Partner, RedemptionCheck, RedemptionStatus, Risk } from "../types"

export const card = "rounded-[20px] bg-white shadow-adbox-small dark:bg-card"
const pill = "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold"

export function SampleBanner() {
  const reset = useResetSampleRewards()
  return <section aria-label="About this page" className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-purple/30 bg-purple/5 px-4 py-3">
    <FlaskConical className="size-5 shrink-0 text-purple" aria-hidden="true" />
    <p className="min-w-[14rem] flex-1 text-xs leading-5 text-muted-foreground"><span className="font-semibold text-foreground">Sample data.</span> There's no rewards service yet: partners' names are real, everything else is invented, and approvals, codes and changes stay in this tab until you reload. Nothing reaches a partner or a person.</p>
    <Button variant="outline" size="sm" className="h-8 bg-card" onClick={reset}><RotateCcw aria-hidden="true" />Reset sample</Button>
  </section>
}

export function PageIntro({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2"><p className="max-w-3xl text-sm text-muted-foreground">{children}</p>{action}</div>
}

/** A partner's initials in a neutral tile; partners' own logos and colours aren't in the design system. */
export function PartnerMark({ partner, size = "md" }: { partner: Pick<Partner, "name" | "shortName">; size?: "sm" | "md" | "lg" }) {
  return <span aria-hidden="true" className={cn("flex shrink-0 items-center justify-center rounded-xl bg-blue/10 font-semibold text-blue dark:bg-cyan/10 dark:text-cyan",
    size === "sm" ? "size-8 text-[10px]" : size === "md" ? "size-10 text-xs" : "size-14 text-sm")}>{partner.shortName.slice(0, 3).toUpperCase() || initials(partner.name)}</span>
}

export function StatusPill({ status }: { status: RedemptionStatus }) {
  const style: Record<RedemptionStatus, { tone: string; Icon: LucideIcon }> = {
    pending: { tone: "bg-warning-500/15 text-warning-800 dark:text-warning-300", Icon: CircleAlert },
    processing: { tone: "bg-blue/10 text-blue dark:bg-cyan/10 dark:text-cyan", Icon: Loader2 },
    fulfilled: { tone: "bg-success-500/10 text-success-700 dark:text-success-400", Icon: CheckCircle2 },
    rejected: { tone: "bg-muted text-muted-foreground", Icon: XCircle },
    failed: { tone: "bg-destructive/10 text-destructive", Icon: AlertTriangle },
  }
  const { tone, Icon } = style[status]
  return <span className={cn(pill, tone)}><Icon className={cn("size-3", status === "processing" && "motion-safe:animate-spin")} aria-hidden="true" />{statusShort[status]}</span>
}

export function RiskPill({ risk, count }: { risk: Risk; count?: number }) {
  const tone = { low: "bg-success-500/10 text-success-700 dark:text-success-400", review: "bg-warning-500/15 text-warning-800 dark:text-warning-300", high: "bg-destructive/10 text-destructive" }[risk]
  const Icon = risk === "low" ? ShieldCheck : AlertTriangle
  return <span className={cn(pill, tone)}><Icon className="size-3" aria-hidden="true" />{riskLabels[risk]}{count ? ` · ${count}` : ""}</span>
}

export function KindTag({ kind }: { kind: OfferKind }) {
  return <span className={cn(pill, "bg-muted font-medium text-muted-foreground")}>{kindLabels[kind]}</span>
}

export function CheckList({ checks }: { checks: RedemptionCheck[] }) {
  return <ul aria-label="Checks" className="flex flex-col gap-2">
    {checks.map((check) => {
      const Icon = check.tone === "ok" ? CheckCircle2 : check.tone === "look" ? CircleAlert : AlertTriangle
      return <li key={check.text} className="flex items-start gap-2 text-sm">
        <Icon className={cn("mt-0.5 size-4 shrink-0", check.tone === "ok" ? "text-success-700 dark:text-success-400" : check.tone === "look" ? "text-warning-700 dark:text-warning-300" : "text-destructive")} aria-hidden="true" />
        <span><span className="sr-only">{check.tone === "ok" ? "Fine: " : check.tone === "look" ? "Look: " : "Problem: "}</span>{check.text}</span>
      </li>
    })}
  </ul>
}

export function Figure({ icon: Icon, label, value, hint, tone = "blue", onClick }: { icon: LucideIcon; label: string; value: ReactNode; hint?: ReactNode; tone?: "blue" | "warning" | "danger"; onClick?: () => void }) {
  const body = <>
    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tone === "blue" ? "bg-blue/10 text-blue dark:bg-cyan/10 dark:text-cyan" : tone === "warning" ? "bg-warning-500/15 text-warning-800 dark:text-warning-300" : "bg-destructive/10 text-destructive")}><Icon className="size-5" aria-hidden="true" /></span>
    <span className="min-w-0">
      <span className="block text-xs text-muted-foreground">{label}</span>
      <span className="block font-heading text-2xl font-semibold tabular-nums">{value ?? <span className="inline-block h-6 w-12 animate-pulse rounded bg-muted align-middle" aria-label="Loading" />}</span>
      {hint && <span className="block truncate text-[11px] text-muted-foreground">{hint}</span>}
    </span>
  </>
  const className = cn(card, "flex min-w-0 items-center gap-3 p-4 text-left")
  return onClick
    ? <button type="button" onClick={onClick} className={cn(className, "outline-none transition hover:shadow-adbox-small focus-visible:ring-2 focus-visible:ring-blue")}>{body}</button>
    : <div className={className}>{body}</div>
}

export type Choice<T extends string> = { value: T; label: string; count?: number }

/** A row of choices, each with its count when there is one. */
export function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: Array<Choice<T>>; onChange: (value: T) => void }) {
  return <div role="radiogroup" aria-label={label} className="flex w-fit max-w-full flex-wrap gap-1 rounded-3xl bg-grey-50 p-1 dark:bg-background">
    {options.map((option) => {
      const active = option.value === value
      return <button key={option.value} type="button" role="radio" aria-checked={active} onClick={() => onChange(option.value)}
        className={cn("inline-flex min-h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-b3 font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-purple",
          active ? "bg-white text-purple shadow-adbox-small dark:bg-card" : "text-grey-500 hover:text-grey-1000 dark:text-muted-foreground dark:hover:text-foreground")}>
        {option.label}
        {option.count !== undefined && <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", active ? "bg-purple/10" : "bg-grey-200/70 dark:bg-muted")}>{option.count}</span>}
      </button>
    })}
  </div>
}

export function SectionHead({ title, children, id }: { title: string; children?: ReactNode; id?: string }) {
  return <div className="flex flex-wrap items-center justify-between gap-2 border-b border-grey-200 px-5 py-4 dark:border-border">
    <h2 id={id} className="font-heading text-base font-semibold">{title}</h2>{children}
  </div>
}

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return <Link to={to} className="inline-flex w-fit items-center gap-1.5 rounded-full text-b3 font-semibold text-grey-500 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-purple dark:text-muted-foreground"><ArrowLeft className="size-4" aria-hidden="true" />{children}</Link>
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
    <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
    <p className="font-semibold">{title}</p>
    {children && <p className="max-w-sm text-sm text-muted-foreground">{children}</p>}
  </div>
}

export function Failed({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div role="alert" className="flex flex-col items-center gap-3 px-6 py-10 text-center">
    <p className="text-sm text-destructive">{message}</p>
    <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button>
  </div>
}

export function PartnerStatus({ status }: { status: Partner["status"] }) {
  return status === "active"
    ? <span className={cn(pill, "bg-success-500/10 text-success-700 dark:text-success-400")}><CheckCircle2 className="size-3" aria-hidden="true" />Active</span>
    : <span className={cn(pill, "bg-warning-500/15 text-warning-800 dark:text-warning-300")}><CircleAlert className="size-3" aria-hidden="true" />Paused</span>
}
