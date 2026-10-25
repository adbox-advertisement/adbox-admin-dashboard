import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, ChevronRight, Lock, SearchX, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const surface = "rounded-[20px] bg-white shadow-adbox-small dark:bg-card"
export const muted = "text-grey-500 dark:text-muted-foreground"
export const ink = "text-grey-1000 dark:text-foreground"

const iconTones = {
  purple: "bg-purple/10 text-purple",
  blue: "bg-blue/10 text-blue dark:text-cyan",
  success: "bg-success-500/10 text-success-700 dark:text-success-300",
  danger: "bg-destructive/10 text-destructive",
  warning: "bg-warning-500/10 text-warning-700 dark:text-warning-300",
} as const

export function StatCard({ icon: Icon, tone, label, value, hint, to }: {
  icon: LucideIcon
  tone: keyof typeof iconTones
  label: string
  value: number | string | undefined
  hint?: string
  to?: string
}) {
  const body = <>
    <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", iconTones[tone])}><Icon className="size-5" aria-hidden="true" /></span>
    <div className="min-w-0 flex-1">
      <p className={cn("truncate text-b3", muted)}>{label}</p>
      <p className={cn("text-h5 font-semibold leading-tight", ink)}>
        {value === undefined ? <span className="inline-block h-6 w-12 animate-pulse rounded bg-grey-100 align-middle dark:bg-muted" aria-label="Loading" /> : typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {hint && <p className={cn("truncate text-b4", muted)}>{hint}</p>}
    </div>
  </>
  const className = cn(surface, "flex min-w-0 items-center gap-3 px-4 py-4")
  return to
    ? <Link to={to} className={cn(className, "transition-shadow hover:shadow-adbox-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple")}>{body}</Link>
    : <div className={className}>{body}</div>
}

export function Panel({ title, description, action, children, className, bodyClassName }: {
  title: string
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return <section aria-label={title} className={cn(surface, "flex min-w-0 flex-col", className)}>
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-grey-200 px-5 py-4 dark:border-border">
      <div className="min-w-0">
        <h2 className={cn("font-heading text-b1 font-semibold", ink)}>{title}</h2>
        {description && <p className={cn("mt-0.5 text-b3", muted)}>{description}</p>}
      </div>
      {action}
    </header>
    <div className={cn("p-5", bodyClassName)}>{children}</div>
  </section>
}

export type BarRow = { key: string; label: string; description?: string; value: number; to?: string }

/**
 * Shares of a whole, one labelled row each. Every bar uses one hue: the row
 * label carries identity and the exact count and share are always written out,
 * so nothing depends on telling colours apart.
 */
export function BarList({ rows, total, label }: { rows: BarRow[]; total: number; label: string }) {
  return <ul aria-label={label} className="flex flex-col gap-1">
    {rows.map((row) => {
      const share = total > 0 ? row.value / total : 0
      const percent = `${Math.round(share * 100)}%`
      const content = <>
        <div className="flex items-baseline justify-between gap-3">
          <span className="min-w-0">
            <span className={cn("block truncate text-b3 font-semibold", ink)}>{row.label}</span>
            {row.description && <span className={cn("block truncate text-b4", muted)}>{row.description}</span>}
          </span>
          <span className="shrink-0 text-right text-b3 tabular-nums">
            <span className={cn("font-semibold", ink)}>{row.value.toLocaleString()}</span>
            <span className={cn("ml-1.5", muted)}>{percent}</span>
          </span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-grey-100 dark:bg-muted" aria-hidden="true">
          <div className="h-full rounded-full bg-blue dark:bg-cyan" style={{ width: `${Math.max(share * 100, row.value > 0 ? 1.5 : 0)}%` }} />
        </div>
      </>
      const itemClass = "block rounded-xl px-2 py-2"
      return <li key={row.key} title={`${row.label}: ${row.value.toLocaleString()} (${percent})`}>
        {row.to
          ? <Link to={row.to} className={cn(itemClass, "group transition-colors hover:bg-grey-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple dark:hover:bg-background")} aria-label={`${row.label}: ${row.value.toLocaleString()}, ${percent}. View these people`}>{content}</Link>
          : <div className={itemClass}>{content}</div>}
      </li>
    })}
  </ul>
}

export function NoAccess({ permission, what }: { permission: string; what: string }) {
  return <div className="flex w-full flex-col items-center px-4 py-16 text-center">
    <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-purple/10 text-purple"><Lock className="size-6" aria-hidden="true" /></span>
    <h2 className={cn("font-heading text-base font-semibold", ink)}>You don't have access to {what}</h2>
    <p className={cn("mt-1.5 max-w-sm text-sm leading-6", muted)}>Ask a Super Admin for the <span className="font-mono text-b4">{permission}</span> permission.</p>
  </div>
}

export function ErrorState({ message, onRetry, retryLabel = "Retry" }: { message: string; onRetry: () => void; retryLabel?: string }) {
  return <div role="alert" className="flex flex-wrap items-center gap-3 p-6">
    <p className="text-sm text-destructive">{message}</p>
    <Button type="button" variant="outline" onClick={onRetry}>{retryLabel}</Button>
  </div>
}

export function EmptyState({ icon: Icon = SearchX, title, children, action }: { icon?: LucideIcon; title: string; children?: ReactNode; action?: ReactNode }) {
  return <div className="flex flex-col items-center px-6 py-12 text-center">
    <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-purple/10 text-purple"><Icon className="size-6" aria-hidden="true" /></span>
    <h3 className={cn("font-heading text-base font-semibold", ink)}>{title}</h3>
    {children && <p className={cn("mt-1.5 max-w-sm text-sm leading-6", muted)}>{children}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
}

export function RowsSkeleton({ rows = 6, label }: { rows?: number; label: string }) {
  return <div role="status" aria-label={label} className="divide-y divide-grey-200 dark:divide-border">
    {Array.from({ length: rows }, (_, index) => (
      <div key={index} className="flex items-center gap-3 px-6 py-4">
        <span className="size-9 animate-pulse rounded-full bg-grey-100 dark:bg-muted" />
        <div className="flex-1 space-y-2">
          <span className="block h-3 w-40 animate-pulse rounded bg-grey-100 dark:bg-muted" />
          <span className="block h-3 w-56 animate-pulse rounded bg-grey-100 dark:bg-muted" />
        </div>
      </div>
    ))}
  </div>
}

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return <Link to={to} className={cn("inline-flex w-fit items-center gap-1.5 rounded-full text-b3 font-semibold hover:text-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple", muted)}>
    <ArrowLeft className="size-4" aria-hidden="true" />{children}
  </Link>
}

export function MoreLink({ to, children }: { to: string; children: ReactNode }) {
  return <Link to={to} className="inline-flex items-center gap-1 text-b3 font-semibold text-blue hover:underline dark:text-cyan">
    {children}<ChevronRight className="size-4" aria-hidden="true" />
  </Link>
}
