import { useId, type ReactNode } from "react"
import { Lock, Search, SearchX, X, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { adStatusLabels, type AdStatus } from "../types"

// The dashboard's card, text and state pieces, as User Content draws them.

export const surface = "rounded-[20px] bg-white shadow-adbox-small dark:bg-card"
export const muted = "text-grey-500 dark:text-muted-foreground"
export const ink = "text-grey-1000 dark:text-foreground"
export const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple"

const pillTones = {
  neutral: "bg-grey-100 text-grey-600 dark:bg-muted dark:text-muted-foreground",
  purple: "bg-purple/10 text-purple",
  blue: "bg-blue/10 text-blue dark:text-cyan",
  success: "bg-success-500/10 text-success-700 dark:text-success-300",
  warning: "bg-warning-500/10 text-warning-700 dark:text-warning-300",
  danger: "bg-destructive/10 text-destructive",
} as const

export function Pill({ tone = "neutral", children, className }: { tone?: keyof typeof pillTones; children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-b4 font-semibold leading-none", pillTones[tone], className)}>{children}</span>
}

const statusTone: Record<AdStatus, keyof typeof pillTones> = {
  PENDING_REVIEW: "warning", ACTIVE: "success", PAUSED: "warning", COMPLETED: "blue", CANCELLED: "neutral", REJECTED: "danger",
}

export function AdStatusPill({ status, className }: { status: AdStatus | null; className?: string }) {
  return status ? <Pill tone={statusTone[status]} className={className}>{adStatusLabels[status]}</Pill> : <Pill className={className}>Unknown</Pill>
}

export function SearchBox({ value, onChange, label, className }: { value: string; onChange: (value: string) => void; label: string; className?: string }) {
  const id = useId()
  return <div className={cn("relative min-w-0", className)}>
    <label htmlFor={id} className="sr-only">{label}</label>
    <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-grey-400 dark:text-muted-foreground" />
    <Input id={id} type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={label} autoComplete="off" maxLength={200}
      className="h-11 w-full rounded-full border-grey-200 bg-grey-50 pl-10 pr-10 text-b3 focus-visible:border-purple/40 focus-visible:ring-0 dark:border-border dark:bg-background md:text-b2 [&::-webkit-search-cancel-button]:hidden" />
    {value && <button type="button" aria-label="Clear search" onClick={() => onChange("")} className="absolute right-0 top-0 flex h-11 w-10 cursor-pointer items-center justify-center text-grey-400 hover:text-grey-1000 dark:text-muted-foreground dark:hover:text-foreground">
      <X className="size-4" aria-hidden="true" />
    </button>}
  </div>
}

export function FilterChips<T extends string>({ label, value, options, onChange }: {
  label: string
  value: T
  options: Array<{ value: T; label: string; count?: number }>
  onChange: (value: T) => void
}) {
  return <div role="group" aria-label={label} className="-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none]">
    {options.map(({ value: option, label: text, count }) => {
      const active = value === option
      return <button key={option} type="button" aria-pressed={active} onClick={() => onChange(option)}
        className={cn("flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-b3 font-semibold transition-colors", focusRing,
          active ? "border-transparent bg-purple text-white shadow-adbox-small" : "border-grey-200 bg-white text-grey-600 hover:border-purple/40 hover:text-purple dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:text-foreground")}>
        {text}
        {count !== undefined && <span className={cn("rounded-full px-1.5 py-0.5 text-[11px] leading-none tabular-nums", active ? "bg-white/20" : "bg-grey-100 dark:bg-muted")}>{count.toLocaleString()}</span>}
      </button>
    })}
  </div>
}

export function NoAccess({ permission, what }: { permission: string; what: string }) {
  return <div className="flex w-full flex-col items-center px-4 py-16 text-center">
    <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-purple/10 text-purple"><Lock className="size-6" aria-hidden="true" /></span>
    <h2 className={cn("font-heading text-base font-semibold", ink)}>You don't have access to {what}</h2>
    <p className={cn("mt-1.5 max-w-sm text-sm leading-6", muted)}>Ask a Super Admin for the <span className="font-mono text-b4">{permission}</span> permission.</p>
  </div>
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div role="alert" className="flex flex-wrap items-center gap-3 p-6">
    <p className="text-sm text-destructive">{message}</p>
    <Button type="button" variant="outline" onClick={onRetry}>Retry</Button>
  </div>
}

export function EmptyState({ icon: Icon = SearchX, title, children }: { icon?: LucideIcon; title: string; children?: ReactNode }) {
  return <div className="flex flex-col items-center px-6 py-12 text-center">
    <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-purple/10 text-purple"><Icon className="size-6" aria-hidden="true" /></span>
    <h3 className={cn("font-heading text-base font-semibold", ink)}>{title}</h3>
    {children && <p className={cn("mt-1.5 max-w-sm text-sm leading-6", muted)}>{children}</p>}
  </div>
}

export function RowsSkeleton({ rows = 4, label }: { rows?: number; label: string }) {
  return <div role="status" aria-label={label} className="divide-y divide-grey-200 dark:divide-border">
    {Array.from({ length: rows }, (_, index) => (
      <div key={index} className="flex items-center gap-3 px-6 py-4">
        <span className="size-12 shrink-0 animate-pulse rounded-xl bg-grey-100 dark:bg-muted" />
        <div className="flex-1 space-y-2">
          <span className="block h-3 w-40 animate-pulse rounded bg-grey-100 dark:bg-muted" />
          <span className="block h-3 w-56 animate-pulse rounded bg-grey-100 dark:bg-muted" />
        </div>
      </div>
    ))}
  </div>
}

export function Fact({ label, children }: { label: string; children: ReactNode }) {
  return <div className="min-w-0 rounded-2xl bg-grey-50 px-3 py-2.5 dark:bg-background">
    <dt className={cn("text-b4", muted)}>{label}</dt>
    <dd className={cn("mt-0.5 break-words text-b3 font-semibold", ink)}>{children}</dd>
  </div>
}

/** The page's opening card: what this list is and how ads work. */
export function Intro({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return <section aria-label={`About ${title.toLowerCase()}`} className={cn(surface, "flex gap-3 p-5")}>
    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-purple/10 text-purple"><Icon className="size-5" aria-hidden="true" /></span>
    <div className="min-w-0">
      <h2 className={cn("font-heading text-b1 font-semibold", ink)}>{title}</h2>
      <div className={cn("text-b3", muted)}>{children}</div>
    </div>
  </section>
}
