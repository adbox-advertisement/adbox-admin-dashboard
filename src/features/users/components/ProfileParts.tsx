import { useState, type ReactNode } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { ink, muted, surface } from "./Surface"

export function Section({ icon, title, action, children, className }: { icon: ReactNode; title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section aria-label={title} className={cn(surface, "min-w-0", className)}>
    <h3 className={cn("flex items-center gap-2 border-b border-grey-200 px-4 py-3 text-b2 font-semibold dark:border-border", ink)}>
      <span className="flex size-7 items-center justify-center rounded-lg bg-purple/10 text-purple">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{title}</span>
      {action}
    </h3>
    {children}
  </section>
}

export function Rows({ children }: { children: ReactNode }) {
  return <dl className="divide-y divide-grey-100 dark:divide-border">{children}</dl>
}

export function Row({ label, value, icon, trailing, mono, multiline }: {
  label: string
  value: ReactNode
  icon?: ReactNode
  trailing?: ReactNode
  mono?: boolean
  multiline?: boolean
}) {
  const empty = value === null || value === undefined || value === ""
  return <div className="grid grid-cols-1 gap-1 px-4 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-3">
    <dt className={cn("text-b3", muted)}>{label}</dt>
    <dd className={cn("flex min-w-0 items-center gap-2 text-b3", ink)}>
      {empty ? <span className="text-grey-400 dark:text-muted-foreground">Not provided</span> : <>
        {icon && <span className="shrink-0 text-grey-400 dark:text-muted-foreground">{icon}</span>}
        <span className={cn("min-w-0", multiline ? "whitespace-pre-line break-words" : "truncate", mono && "font-mono text-b4")} title={typeof value === "string" && !multiline ? value : undefined}>{value}</span>
      </>}
      {trailing && <span className="ml-auto shrink-0">{trailing}</span>}
    </dd>
  </div>
}

export function Verified({ ok, label }: { ok: boolean; label: string }) {
  return <span className={cn("rounded-full px-2 py-0.5 text-b4 font-semibold", ok ? "bg-success-500/10 text-success-700 dark:text-success-300" : "bg-grey-100 text-grey-600 dark:bg-muted dark:text-muted-foreground")}>{label}</span>
}

export function Callout({ tone, icon, children }: { tone: "danger" | "warning" | "neutral"; icon: ReactNode; children: ReactNode }) {
  return <div role="note" className={cn("flex items-start gap-2 rounded-2xl px-4 py-3 text-b3",
    tone === "danger" ? "bg-destructive/10 text-destructive" : tone === "warning" ? "bg-warning-500/10 text-warning-800 dark:text-warning-200" : "bg-grey-100 text-grey-700 dark:bg-muted dark:text-muted-foreground")}>
    <span className="mt-0.5 shrink-0">{icon}</span><div>{children}</div>
  </div>
}

export function MiniStat({ label, value, hint }: { label: string; value: string | number | undefined; hint?: string }) {
  return <div className="min-w-0 rounded-2xl bg-grey-50 px-3 py-3 dark:bg-background">
    <p className={cn("truncate text-b4", muted)}>{label}</p>
    <p className={cn("mt-0.5 truncate text-b1 font-semibold tabular-nums", ink)}>
      {value === undefined ? <span className="inline-block h-5 w-10 animate-pulse rounded bg-grey-100 align-middle dark:bg-muted" aria-label="Loading" /> : typeof value === "number" ? value.toLocaleString() : value}
    </p>
    {hint && <p className={cn("truncate text-b4", muted)}>{hint}</p>}
  </div>
}

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return <button type="button" aria-label={copied ? `Copied ${label}` : `Copy ${label}`} className="flex size-7 cursor-pointer items-center justify-center rounded-full text-grey-500 hover:bg-grey-100 hover:text-grey-1000 dark:text-muted-foreground dark:hover:bg-muted"
    onClick={() => {
      void navigator.clipboard?.writeText(value).then(() => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1500)
      })
    }}>
    {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
  </button>
}
