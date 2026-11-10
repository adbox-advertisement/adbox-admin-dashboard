import { useId, useState, type ReactNode, type Ref } from "react"
import { ArrowLeft, AtSign, BadgeCheck, CheckCheck, Coins, GraduationCap, Lock, Mail, MessageSquareText, Paperclip, Send, Smartphone, UserRound } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { agents } from "../data/sample-desk"
import { useReply, useSavedReplies, useTicket, useUpdateTicket } from "../hooks"
import { ago, categoryLabels, fillReply, priorityLabels, slaState, statusLabels } from "../lib/desk"
import type { Customer, TicketDetail, TicketPriority, TicketStatus, TicketSummary } from "../types"
import { Avatar, CategoryTag, SlaTag, StatusTag } from "./SupportBits"

const agentName = (id: string | undefined) => agents.find((agent) => agent.id === id)?.name ?? "Support"
const UNASSIGNED = "unassigned"

export function TicketConversation({ id, now, onBack, onOpen, composerRef }: {
  id: string
  now: number
  onBack: () => void
  onOpen: (id: string) => void
  composerRef: Ref<HTMLTextAreaElement>
}) {
  const query = useTicket(id)
  const ticket = query.data
  if (query.isError) return <p role="alert" className="p-6 text-sm text-destructive">This conversation couldn't be opened.</p>
  if (!ticket) return <div role="status" aria-label="Loading conversation" className="space-y-4 p-6 motion-safe:animate-pulse"><span className="block h-5 w-2/3 rounded bg-muted" /><span className="block h-3 w-1/3 rounded bg-muted" /><span className="block h-24 rounded-xl bg-muted" /><span className="block h-24 rounded-xl bg-muted" /></div>
  const sla = slaState(ticket, now)
  return <section aria-label={`Conversation: ${ticket.subject}`} className="flex h-full min-h-0 flex-col">
    <header className="border-b border-border px-4 py-4 sm:px-6">
      <Button variant="ghost" size="sm" className="-ml-2 mb-2 lg:hidden" onClick={onBack}><ArrowLeft aria-hidden="true" />Back to tickets</Button>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
        <span className="font-mono">{ticket.reference}</span><span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1">{ticket.channel === "email" ? <Mail className="size-3" aria-hidden="true" /> : <Smartphone className="size-3" aria-hidden="true" />}{ticket.channel === "email" ? "Email" : "In the app"}</span><span aria-hidden="true">·</span>
        <span>Opened {ago(ticket.createdAt, now)} by {ticket.customer.name}</span>
      </p>
      <h2 className="mt-1 text-lg font-semibold leading-snug">{ticket.subject}</h2>
      <div className="mt-2 flex flex-wrap items-center gap-2"><StatusTag status={ticket.status} />{sla && <SlaTag sla={sla} />}<CategoryTag category={ticket.category} /></div>
      <TicketControls ticket={ticket} />
    </header>
    <div className="flex min-h-0 flex-1">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <details className="mb-5 rounded-xl border border-border 2xl:hidden">
            <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium"><UserRound className="size-4 text-muted-foreground" aria-hidden="true" />About {ticket.customer.name}</summary>
            <div className="border-t border-border p-4"><CustomerCard customer={ticket.customer} tickets={ticket.customerTickets} now={now} onOpen={onOpen} /></div>
          </details>
          <Thread ticket={ticket} now={now} />
        </div>
        <Composer key={ticket.id} ticket={ticket} composerRef={composerRef} />
      </div>
      <aside aria-label={`About ${ticket.customer.name}`} className="hidden w-72 shrink-0 overflow-y-auto border-l border-border p-5 2xl:block">
        <CustomerCard customer={ticket.customer} tickets={ticket.customerTickets} now={now} onOpen={onOpen} />
      </aside>
    </div>
  </section>
}

function TicketControls({ ticket }: { ticket: TicketDetail }) {
  const update = useUpdateTicket()
  const change = (label: string, patch: Parameters<typeof update.mutate>[0]["update"]) =>
    update.mutate({ id: ticket.id, update: patch }, { onSuccess: () => toast.success(label) })
  return <div className="mt-3 grid grid-cols-1 gap-2 min-[480px]:grid-cols-3">
    <Labeled label="Status" value={ticket.status} disabled={update.isPending} onChange={(value) => change(`Marked ${statusLabels[value as TicketStatus].toLowerCase()}`, { status: value as TicketStatus })}
      options={(Object.keys(statusLabels) as TicketStatus[]).map((value) => ({ value, label: statusLabels[value] }))} />
    <Labeled label="Priority" value={ticket.priority} disabled={update.isPending} onChange={(value) => change(`Priority set to ${priorityLabels[value as TicketPriority].toLowerCase()}`, { priority: value as TicketPriority })}
      options={(Object.keys(priorityLabels) as TicketPriority[]).map((value) => ({ value, label: priorityLabels[value] }))} />
    <Labeled label="Assignee" value={ticket.assigneeId ?? UNASSIGNED} disabled={update.isPending} onChange={(value) => change(value === UNASSIGNED ? "Unassigned" : `Assigned to ${agentName(value) === "You" ? "you" : agentName(value)}`, { assigneeId: value === UNASSIGNED ? null : value })}
      options={[{ value: UNASSIGNED, label: "Unassigned" }, ...agents.map((agent) => ({ value: agent.id, label: agent.name }))]} />
  </div>
}

function Labeled({ label, value, options, onChange, disabled }: { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void; disabled?: boolean }) {
  const id = useId()
  return <div className="min-w-0">
    <label htmlFor={id} className="mb-1 block text-[11px] font-medium text-muted-foreground">{label}</label>
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger id={id} className="h-9 w-full min-w-0 bg-card text-xs [&>span]:truncate"><SelectValue /></SelectTrigger>
      <SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
    </Select>
  </div>
}

function Thread({ ticket, now }: { ticket: TicketDetail; now: number }) {
  return <ol aria-label="Conversation" className="flex flex-col gap-4">
    {ticket.messages.map((message) => {
      const fromCustomer = message.author === "customer"
      const name = fromCustomer ? ticket.customer.name : agentName(message.agentId)
      return <li key={message.id} className={cn("flex gap-3", !fromCustomer && "flex-row-reverse")}>
        <Avatar name={name} size="sm" agent={!fromCustomer} />
        <div className={cn("min-w-0 max-w-[85%] rounded-2xl px-4 py-3",
          message.internal ? "border border-dashed border-warning-500/50 bg-warning-500/10" : fromCustomer ? "bg-muted/70" : "bg-blue/8 dark:bg-cyan/10")}>
          <p className="flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">{name}</span>
            {message.internal && <span className="inline-flex items-center gap-1 font-semibold text-warning-800 dark:text-warning-300"><Lock className="size-3" aria-hidden="true" />Internal note</span>}
            <time dateTime={message.createdAt} title={new Date(message.createdAt).toLocaleString()}>{ago(message.createdAt, now)}</time>
          </p>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">{message.body}</p>
          {message.attachments?.length ? <ul aria-label="Attachments" className="mt-2 flex flex-wrap gap-2">{message.attachments.map((file) => <li key={file.name} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1 text-[11px]" title="Sample attachment"><Paperclip className="size-3" aria-hidden="true" />{file.name}<span className="text-muted-foreground">{file.sizeKb} KB</span></li>)}</ul> : null}
        </div>
      </li>
    })}
  </ol>
}

function Composer({ ticket, composerRef }: { ticket: TicketDetail; composerRef: Ref<HTMLTextAreaElement> }) {
  const [mode, setMode] = useState<"reply" | "note">("reply")
  const [body, setBody] = useState("")
  const [error, setError] = useState("")
  const reply = useReply()
  const saved = useSavedReplies()
  const textareaId = useId()
  const first = ticket.customer.name.split(" ")[0]
  const internal = mode === "note"

  const send = (resolve = false) => {
    if (reply.isPending) return
    if (!body.trim()) { setError(internal ? "Write the note first." : `Write your reply to ${first} first.`); return }
    setError("")
    reply.mutate({ id: ticket.id, input: { body, internal, resolve } }, {
      onSuccess: () => {
        setBody("")
        toast.success(internal ? "Note added" : resolve ? "Reply added and resolved" : "Reply added", { description: internal ? "Only agents see it." : "Sample data: nothing was sent to the customer." })
      },
    })
  }

  return <form className="border-t border-border bg-card px-4 py-3 sm:px-6" onSubmit={(event) => { event.preventDefault(); send() }}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div role="radiogroup" aria-label="Write a" className="flex gap-1 rounded-lg bg-muted p-1">
        {([["reply", "Reply", MessageSquareText], ["note", "Internal note", Lock]] as const).map(([value, label, Icon]) => <button key={value} type="button" role="radio" aria-checked={mode === value} onClick={() => { setMode(value); setError("") }}
          className={cn("inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-blue", mode === value ? "bg-card text-foreground shadow-adbox-small" : "text-muted-foreground hover:text-foreground")}>
          <Icon className="size-3.5" aria-hidden="true" />{label}
        </button>)}
      </div>
      {!internal && <Select value="" onValueChange={(value) => { const chosen = saved.data?.find((item) => item.id === value); if (chosen) setBody(fillReply(chosen.body, ticket.customer.name)) }}>
        <SelectTrigger aria-label="Insert a saved reply" className="h-8 w-auto min-w-[11rem] text-xs"><SelectValue placeholder="Insert a saved reply" /></SelectTrigger>
        <SelectContent>{saved.data?.map((item) => <SelectItem key={item.id} value={item.id}>{item.title}</SelectItem>)}</SelectContent>
      </Select>}
    </div>
    <label htmlFor={textareaId} className="sr-only">{internal ? "Internal note" : `Reply to ${first}`}</label>
    <Textarea ref={composerRef} id={textareaId} rows={4} value={body} maxLength={4000} aria-invalid={Boolean(error)}
      onChange={(event) => { setBody(event.target.value); setError("") }}
      onKeyDown={(event) => { if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) { event.preventDefault(); send() } }}
      placeholder={internal ? "A note for the team; the customer never sees it…" : `Write to ${first}…`}
      className={cn("mt-2 min-h-24 resize-y text-sm", internal && "border-warning-500/40 bg-warning-500/5")} />
    {error && <p role="alert" className="mt-1 text-xs text-destructive">{error}</p>}
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
      <p className="text-[11px] text-muted-foreground">
        {internal ? "Only agents see notes." : ticket.status === "resolved" ? "Replying reopens it as waiting on the customer." : "Sample data: nothing is sent."} <kbd className="rounded border border-border px-1 font-sans">Ctrl</kbd> + <kbd className="rounded border border-border px-1 font-sans">Enter</kbd> to send
      </p>
      <div className="flex gap-2">
        {!internal && <Button type="button" variant="outline" className="h-9 px-3" disabled={reply.isPending} onClick={() => send(true)}><CheckCheck aria-hidden="true" />Send & resolve</Button>}
        <Button type="submit" variant="secondary" className="h-9 px-3" disabled={reply.isPending}><Send aria-hidden="true" />{reply.isPending ? "Sending…" : internal ? "Add note" : "Send reply"}</Button>
      </div>
    </div>
  </form>
}

function CustomerCard({ customer, tickets, now, onOpen }: { customer: Customer; tickets: TicketSummary[]; now: number; onOpen: (id: string) => void }) {
  return <div className="flex flex-col gap-4">
    <div className="flex items-center gap-3">
      <Avatar name={customer.name} size="lg" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{customer.name}</p>
        <p className="flex items-center gap-1 truncate text-xs text-muted-foreground"><AtSign className="size-3" aria-hidden="true" />{customer.username}</p>
      </div>
    </div>
    <dl className="grid grid-cols-1 gap-2.5 text-xs">
      <Fact label="Account">{customer.role}{customer.campusBadge && <span className="ml-1.5 inline-flex items-center gap-0.5 text-blue dark:text-cyan"><BadgeCheck className="size-3" aria-hidden="true" />Campus badge</span>}</Fact>
      <Fact label="Institution"><span className="inline-flex items-center gap-1"><GraduationCap className="size-3 text-muted-foreground" aria-hidden="true" />{customer.institution ?? "None"}</span></Fact>
      <Fact label="Email"><span className="break-all">{customer.email}</span>{customer.emailVerified ? <span className="ml-1 text-success-700 dark:text-success-400">verified</span> : <span className="ml-1 text-warning-800 dark:text-warning-300">not verified</span>}</Fact>
      <Fact label="Gold">
        <span className="inline-flex items-center gap-1"><Coins className="size-3 text-muted-foreground" aria-hidden="true" />{customer.goldBalance.toLocaleString()} bars</span>
      </Fact>
      <Fact label="On AdBox since">{new Date(customer.joinedAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</Fact>
    </dl>
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Other conversations</p>
      {tickets.length === 0 ? <p className="text-xs text-muted-foreground">This is their first.</p> : <ul className="flex flex-col gap-1.5">
        {tickets.map((ticket) => <li key={ticket.id}><button type="button" onClick={() => onOpen(ticket.id)} className="w-full rounded-lg border border-border px-3 py-2 text-left outline-none transition hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-blue">
          <span className="block truncate text-xs font-medium">{ticket.subject}</span>
          <span className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground"><StatusTag status={ticket.status} />{categoryLabels[ticket.category]} · {ago(ticket.updatedAt, now)}</span>
        </button></li>)}
      </ul>}
    </div>
    <p className="rounded-lg bg-muted px-3 py-2 text-[11px] leading-4 text-muted-foreground">Sample customer: not a real AdBox account.</p>
  </div>
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return <div className="grid grid-cols-[6.5rem_1fr] gap-2"><dt className="text-muted-foreground">{label}</dt><dd className="min-w-0">{children}</dd></div>
}
