import { AlertTriangle, Clock3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { categoryIcons } from "../lib/category-icons"
import { categoryLabels, initials, priorityLabels, statusLabels, type SlaState } from "../lib/desk"
import type { TicketCategory, TicketPriority, TicketStatus } from "../types"

const pill = "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold"

/** Status colours carry an icon or dot and a label, never colour alone. */
export function SlaTag({ sla, compact = false }: { sla: SlaState; compact?: boolean }) {
  const Icon = sla.tone === "overdue" ? AlertTriangle : Clock3
  return <span className={cn(pill, sla.tone === "overdue" ? "bg-destructive/10 text-destructive" : sla.tone === "soon" ? "bg-warning-500/15 text-warning-800 dark:text-warning-300" : "bg-muted text-muted-foreground", compact && "px-1.5")}>
    <Icon className="size-3" aria-hidden="true" />{sla.label}
  </span>
}

export function PriorityTag({ priority }: { priority: TicketPriority }) {
  const dot = { urgent: "bg-destructive", high: "bg-warning-500", normal: "bg-blue dark:bg-cyan", low: "bg-grey-400" }[priority]
  return <span className={cn(pill, "bg-muted text-foreground")}><span className={cn("size-1.5 rounded-full", dot)} aria-hidden="true" />{priorityLabels[priority]}</span>
}

export function StatusTag({ status }: { status: TicketStatus }) {
  const tone = { open: "bg-blue/10 text-blue dark:bg-cyan/10 dark:text-cyan", pending: "bg-muted text-muted-foreground", resolved: "bg-success-500/10 text-success-700 dark:text-success-400" }[status]
  return <span className={cn(pill, tone)}><span className="size-1.5 rounded-full bg-current" aria-hidden="true" />{statusLabels[status]}</span>
}

export function CategoryTag({ category }: { category: TicketCategory }) {
  const Icon = categoryIcons[category]
  return <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"><Icon className="size-3" aria-hidden="true" />{categoryLabels[category]}</span>
}

export function Avatar({ name, size = "md", agent = false }: { name: string; size?: "sm" | "md" | "lg"; agent?: boolean }) {
  return <span aria-hidden="true" className={cn("flex shrink-0 items-center justify-center rounded-full font-semibold",
    agent ? "bg-purple/10 text-purple dark:bg-purple/20" : "bg-blue/10 text-blue dark:bg-cyan/10 dark:text-cyan",
    size === "sm" ? "size-7 text-[10px]" : size === "md" ? "size-9 text-xs" : "size-12 text-sm")}>{initials(name)}</span>
}
