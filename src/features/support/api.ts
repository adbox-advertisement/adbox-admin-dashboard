import { buildSampleDesk, ME, replyTargets, savedReplies } from "./data/sample-desk"
import { compareTickets, inView, views } from "./lib/desk"
import type { ReplyInput, SupportSummary, Ticket, TicketDetail, TicketQuery, TicketSummary, TicketUpdate, TicketView } from "./types"

// The help desk service. There is no support API yet, so this serves an in-memory sample desk
// with a short delay; replies and changes live until the page reloads. Swap these functions for
// real requests (superAdminApi) and the hooks and screens keep working.

export const sampleDesk = { latency: 250 }

let desk = buildSampleDesk()

/** Back to the original sample conversations (tests, and "Reset sample" on the page). */
export function resetSampleDesk(now = Date.now()) {
  desk = buildSampleDesk(now)
}

const wait = () => new Promise((resolve) => setTimeout(resolve, sampleDesk.latency))
const customerOf = (ticket: Ticket) => desk.customers.find((customer) => customer.id === ticket.customerId)!

function summarise(ticket: Ticket): TicketSummary {
  const { messages, ...rest } = ticket
  const visible = messages.filter((message) => !message.internal)
  return { ...rest, customer: customerOf(ticket), preview: visible[visible.length - 1]?.body ?? "", messageCount: messages.length }
}

export async function getTickets(query: TicketQuery): Promise<TicketSummary[]> {
  await wait()
  const term = query.search?.trim().toLowerCase()
  return desk.tickets
    .filter((ticket) => inView(ticket, query.view) && (!query.category || ticket.category === query.category))
    .filter((ticket) => {
      if (!term) return true
      const customer = customerOf(ticket)
      return [ticket.reference, ticket.subject, customer.name, customer.username, customer.email, ...ticket.messages.map((message) => message.body)]
        .some((text) => text.toLowerCase().includes(term))
    })
    .sort(compareTickets(query.sort))
    .map(summarise)
}

export async function getTicket(id: string): Promise<TicketDetail> {
  await wait()
  const ticket = desk.tickets.find((item) => item.id === id)
  if (!ticket) throw new Error("Ticket not found")
  const customerTickets = desk.tickets.filter((item) => item.customerId === ticket.customerId && item.id !== id).sort(compareTickets("newest")).map(summarise)
  return { ...structuredClone(ticket), customer: customerOf(ticket), customerTickets }
}

export async function getSupportSummary(): Promise<SupportSummary> {
  await wait()
  const now = Date.now()
  const viewCounts = Object.fromEntries(views.map(({ key }) => [key, desk.tickets.filter((ticket) => inView(ticket, key)).length])) as Record<TicketView, number>
  return {
    needsReply: viewCounts["needs-reply"],
    overdue: desk.tickets.filter((ticket) => ticket.status === "open" && ticket.replyDueAt && new Date(ticket.replyDueAt).getTime() < now).length,
    unassigned: viewCounts.unassigned,
    waiting: viewCounts.waiting,
    viewCounts,
    medianFirstReplyMinutes: 38,
    resolvedThisWeek: 46,
    satisfaction: { average: 4.7, ratings: 128 },
  }
}

export async function getSavedReplies() {
  await wait()
  return savedReplies
}

/** Opening a ticket marks it read. */
export async function markRead(id: string) {
  const ticket = desk.tickets.find((item) => item.id === id)
  if (ticket) ticket.unread = false
}

/**
 * A reply moves the ticket to "waiting on customer" (or resolves it); an internal note
 * changes nothing but the conversation. Nothing is sent anywhere.
 */
export async function replyToTicket({ id, input }: { id: string; input: ReplyInput }) {
  await wait()
  const ticket = desk.tickets.find((item) => item.id === id)
  if (!ticket) throw new Error("Ticket not found")
  const body = input.body.trim()
  if (!body) throw new Error("Write a message first")
  const now = new Date().toISOString()
  ticket.messages.push({ id: `${id}-m${ticket.messages.length + 1}`, author: "agent", agentId: ME, body, internal: input.internal, createdAt: now })
  ticket.updatedAt = now
  if (!input.internal) {
    ticket.status = input.resolve ? "resolved" : "pending"
    ticket.replyDueAt = null
    ticket.assigneeId ??= ME
  }
  return summarise(ticket)
}

export async function updateTicket({ id, update }: { id: string; update: TicketUpdate }) {
  await wait()
  const ticket = desk.tickets.find((item) => item.id === id)
  if (!ticket) throw new Error("Ticket not found")
  Object.assign(ticket, update)
  // While a reply is owed, it is due a set time after the customer last wrote (by priority);
  // reopening a ticket starts that clock now. Waiting and resolved tickets owe nothing.
  if (ticket.status === "open" && (update.status || update.priority)) {
    const lastCustomer = [...ticket.messages].reverse().find((message) => message.author === "customer")
    const from = update.status === "open" || !lastCustomer ? Date.now() : new Date(lastCustomer.createdAt).getTime()
    ticket.replyDueAt = new Date(from + replyTargets[ticket.priority] * 60_000).toISOString()
  } else if (update.status) {
    ticket.replyDueAt = null
  }
  ticket.updatedAt = new Date().toISOString()
  return summarise(ticket)
}
