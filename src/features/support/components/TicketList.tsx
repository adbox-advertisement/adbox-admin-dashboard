import { Inbox } from "lucide-react"
import { cn } from "@/lib/utils"
import { ago, slaState } from "../lib/desk"
import type { TicketSummary } from "../types"
import { Avatar, CategoryTag, PriorityTag, SlaTag, StatusTag } from "./SupportBits"

export function TicketList({ tickets, selectedId, onSelect, now, loading, empty }: {
  tickets: TicketSummary[] | undefined
  selectedId: string | null
  onSelect: (id: string) => void
  now: number
  loading: boolean
  empty: string
}) {
  if (!tickets && loading) return <div role="status" aria-label="Loading tickets" className="divide-y divide-border">
    {[0, 1, 2, 3, 4].map((row) => <div key={row} className="flex gap-3 p-4 motion-safe:animate-pulse"><span className="size-9 rounded-full bg-muted" /><span className="flex-1 space-y-2"><span className="block h-3 w-1/2 rounded bg-muted" /><span className="block h-3 w-4/5 rounded bg-muted" /><span className="block h-3 w-2/5 rounded bg-muted" /></span></div>)}
  </div>
  if (!tickets?.length) return <div className="flex flex-col items-center px-6 py-16 text-center">
    <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-blue/10 text-blue dark:bg-cyan/10 dark:text-cyan"><Inbox className="size-6" aria-hidden="true" /></span>
    <p className="text-sm font-semibold">Nothing here</p>
    <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">{empty}</p>
  </div>
  return <ul aria-label="Tickets" className={cn("divide-y divide-border", loading && "opacity-70 transition-opacity")}>
    {tickets.map((ticket) => {
      const selected = ticket.id === selectedId
      const sla = slaState(ticket, now)
      return <li key={ticket.id}>
        <button type="button" onClick={() => onSelect(ticket.id)} aria-current={selected ? "true" : undefined}
          aria-label={`${ticket.subject}, from ${ticket.customer.name}${ticket.unread ? ", unread" : ""}`}
          className={cn("relative flex w-full gap-3 px-4 py-3.5 text-left outline-none transition-colors focus-visible:bg-blue/5 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue dark:focus-visible:ring-cyan",
            selected ? "bg-blue/5 dark:bg-cyan/5" : "hover:bg-muted/60")}>
          {selected && <span className="absolute inset-y-0 left-0 w-0.5 bg-blue dark:bg-cyan" aria-hidden="true" />}
          <Avatar name={ticket.customer.name} />
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-2">
              <span className={cn("truncate text-xs", ticket.unread ? "font-semibold text-foreground" : "text-muted-foreground")}>{ticket.customer.name}</span>
              <span className="shrink-0 text-[11px] text-muted-foreground" title={new Date(ticket.updatedAt).toLocaleString()}>{ago(ticket.updatedAt, now)}</span>
            </span>
            <span className={cn("mt-0.5 flex items-center gap-1.5 text-sm", ticket.unread ? "font-semibold" : "font-medium")}>
              {ticket.unread && <span className="size-2 shrink-0 rounded-full bg-blue dark:bg-cyan" aria-hidden="true" />}
              <span className="truncate">{ticket.subject}</span>
            </span>
            <span className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{ticket.preview}</span>
            <span className="mt-2 flex flex-wrap items-center gap-1.5">
              {sla ? <SlaTag sla={sla} compact /> : <StatusTag status={ticket.status} />}
              {(ticket.priority === "urgent" || ticket.priority === "high") && <PriorityTag priority={ticket.priority} />}
              <CategoryTag category={ticket.category} />
            </span>
          </span>
        </button>
      </li>
    })}
  </ul>
}
