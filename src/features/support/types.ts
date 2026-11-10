// The help desk's shapes. There is no support API yet: `api.ts` serves sample data in these
// shapes, so a real service can replace it without touching the screens.

/** `open` needs a reply from us; `pending` waits on the customer; `resolved` is done. */
export type TicketStatus = "open" | "pending" | "resolved"
export type TicketPriority = "low" | "normal" | "high" | "urgent"
export type TicketCategory = "account" | "gold" | "ads" | "verification" | "safety" | "app"
export type TicketChannel = "in-app" | "email"

export type Agent = { id: string; name: string }

export type Customer = {
  id: string
  name: string
  username: string
  email: string
  role: "Viewer" | "Creator" | "Publisher"
  institution: string | null
  joinedAt: string
  emailVerified: boolean
  campusBadge: boolean
  goldBalance: number
}

export type Attachment = { name: string; sizeKb: number }

export type TicketMessage = {
  id: string
  author: "customer" | "agent"
  agentId?: string
  body: string
  /** Agents' notes to each other; the customer never sees them. */
  internal: boolean
  createdAt: string
  attachments?: Attachment[]
}

export type Ticket = {
  id: string
  reference: string
  subject: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  channel: TicketChannel
  customerId: string
  assigneeId: string | null
  createdAt: string
  updatedAt: string
  /** When our next reply is due, while the ticket needs one. */
  replyDueAt: string | null
  unread: boolean
  messages: TicketMessage[]
  /** 1–5, given by the customer after it was resolved. */
  satisfaction?: number
}

export type TicketView = "needs-reply" | "mine" | "unassigned" | "high-priority" | "waiting" | "resolved" | "all"
export type TicketSort = "urgency" | "newest"

export type TicketQuery = { view: TicketView; category?: TicketCategory; search?: string; sort: TicketSort }

export type TicketSummary = Omit<Ticket, "messages"> & { customer: Customer; preview: string; messageCount: number }
export type TicketDetail = Ticket & { customer: Customer; customerTickets: TicketSummary[] }

export type SupportSummary = {
  needsReply: number
  overdue: number
  unassigned: number
  waiting: number
  viewCounts: Record<TicketView, number>
  /** Figures a real help desk would report; fixed in the sample. */
  medianFirstReplyMinutes: number
  resolvedThisWeek: number
  satisfaction: { average: number; ratings: number }
}

export type ReplyInput = { body: string; internal: boolean; resolve?: boolean }
export type TicketUpdate = Partial<Pick<Ticket, "status" | "priority" | "assigneeId">>

export type SavedReply = { id: string; title: string; body: string }
