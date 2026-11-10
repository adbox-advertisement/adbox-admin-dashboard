import { ME } from "../data/sample-desk"
import type { Ticket, TicketCategory, TicketPriority, TicketSort, TicketStatus, TicketView } from "../types"

export const statusLabels: Record<TicketStatus, string> = { open: "Needs reply", pending: "Waiting on customer", resolved: "Resolved" }
export const priorityLabels: Record<TicketPriority, string> = { low: "Low", normal: "Normal", high: "High", urgent: "Urgent" }
export const categoryLabels: Record<TicketCategory, string> = {
  account: "Account & sign-in", gold: "Gold & payments", ads: "Ads", verification: "Verification", safety: "Safety & reports", app: "App problems",
}

export const views: Array<{ key: TicketView; label: string; description: string }> = [
  { key: "needs-reply", label: "Needs reply", description: "Customers waiting on us" },
  { key: "mine", label: "Mine", description: "Assigned to you and still open" },
  { key: "unassigned", label: "Unassigned", description: "Nobody has picked these up" },
  { key: "high-priority", label: "High priority", description: "Urgent and high, not yet resolved" },
  { key: "waiting", label: "Waiting on customer", description: "We replied; they haven't yet" },
  { key: "resolved", label: "Resolved", description: "Done" },
  { key: "all", label: "All", description: "Every conversation" },
]

export function inView(ticket: Ticket, view: TicketView) {
  const active = ticket.status !== "resolved"
  switch (view) {
    case "needs-reply": return ticket.status === "open"
    case "mine": return active && ticket.assigneeId === ME
    case "unassigned": return active && ticket.assigneeId === null
    case "high-priority": return active && (ticket.priority === "urgent" || ticket.priority === "high")
    case "waiting": return ticket.status === "pending"
    case "resolved": return ticket.status === "resolved"
    case "all": return true
  }
}

const statusOrder: Record<TicketStatus, number> = { open: 0, pending: 1, resolved: 2 }
const time = (iso: string | null) => (iso ? new Date(iso).getTime() : Number.POSITIVE_INFINITY)

/** Most urgent first: tickets needing a reply by deadline, then waiting, then resolved, newest activity first. */
export function compareTickets(sort: TicketSort) {
  return (a: Ticket, b: Ticket) => {
    if (sort === "newest") return time(b.createdAt) - time(a.createdAt)
    return statusOrder[a.status] - statusOrder[b.status]
      || (a.status === "open" ? time(a.replyDueAt) - time(b.replyDueAt) : time(b.updatedAt) - time(a.updatedAt))
  }
}

export type SlaState = { tone: "overdue" | "soon" | "ok"; label: string }

/** How long until our reply is due, or how late it is; nothing once we have replied. */
export function slaState(ticket: Pick<Ticket, "status" | "replyDueAt">, now: number): SlaState | null {
  if (ticket.status !== "open" || !ticket.replyDueAt) return null
  const minutes = Math.round((new Date(ticket.replyDueAt).getTime() - now) / 60_000)
  if (minutes < 0) return { tone: "overdue", label: `Overdue by ${duration(-minutes)}` }
  return { tone: minutes <= 60 ? "soon" : "ok", label: `Reply due in ${duration(minutes)}` }
}

/** "45m", "3h 10m", "2d 4h". */
export function duration(minutes: number) {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return minutes % 60 ? `${hours}h ${minutes % 60}m` : `${hours}h`
  const days = Math.floor(hours / 24)
  return hours % 24 ? `${days}d ${hours % 24}h` : `${days}d`
}

/** "just now", "5m ago", "3h ago", "2d ago". */
export function ago(iso: string, now: number) {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000))
  if (minutes < 1) return "just now"
  return `${duration(minutes).split(" ")[0]} ago`
}

/** A saved reply with the customer's first name filled in. */
export function fillReply(body: string, customerName: string) {
  return body.replace(/\{first\}/g, customerName.split(" ")[0])
}

export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase()
