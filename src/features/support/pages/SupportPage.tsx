import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react"
import { AlertTriangle, FlaskConical, Inbox, MessageCircleQuestion, RotateCcw, Search, Smile, Timer, UserPlus, X, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useNow, useResetSampleDesk, useSupportSummary, useTickets } from "../hooks"
import { categoryLabels, duration, views } from "../lib/desk"
import type { SupportSummary, TicketCategory, TicketSort, TicketView } from "../types"
import { TicketConversation } from "../components/TicketConversation"
import { TicketList } from "../components/TicketList"

const ALL = "all"

/**
 * The help desk: what needs a reply, the conversations, and one open beside the list.
 * Runs on sample data until AdBox has a support service (`api.ts`).
 */
export function SupportPage() {
  const now = useNow()
  const resetDesk = useResetSampleDesk()
  const [view, setView] = useState<TicketView>("needs-reply")
  const [category, setCategory] = useState<TicketCategory | typeof ALL>(ALL)
  const [sort, setSort] = useState<TicketSort>("urgency")
  const [search, setSearch] = useState("")
  const [term, setTerm] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const searchId = useId()

  useEffect(() => {
    const timer = setTimeout(() => setTerm(search.trim()), 250)
    return () => clearTimeout(timer)
  }, [search])

  const query = useMemo(() => ({ view, sort, category: category === ALL ? undefined : category, search: term || undefined }), [view, sort, category, term])
  const tickets = useTickets(query)
  const summary = useSupportSummary()
  const list = tickets.data

  // On a wide screen the first conversation opens beside the list; on a phone the list comes first.
  useEffect(() => {
    if (!list || selectedId) return
    if (typeof window !== "undefined" && window.matchMedia?.("(min-width: 1024px)").matches && list[0]) setSelectedId(list[0].id)
  }, [list, selectedId])

  // J / K move through the list, R jumps to the reply box, / to search. Never while typing.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (event.metaKey || event.ctrlKey || event.altKey || target?.closest("input, textarea, select, [contenteditable=true], [role=listbox], [role=dialog]")) return
      const key = event.key.toLowerCase()
      if (key === "/") { event.preventDefault(); searchRef.current?.focus(); return }
      if (key === "r" && selectedId) { event.preventDefault(); composerRef.current?.focus(); return }
      if ((key === "j" || key === "k") && list?.length) {
        event.preventDefault()
        const index = list.findIndex((ticket) => ticket.id === selectedId)
        const next = key === "j" ? Math.min(list.length - 1, index + 1) : Math.max(0, index - 1)
        setSelectedId(list[index === -1 ? 0 : next].id)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [list, selectedId])

  const chooseView = (next: TicketView) => { setView(next); setSelectedId(null) }
  const reset = () => { resetDesk(); setSelectedId(null) }
  const viewInfo = views.find((item) => item.key === view)!

  return <div className="flex min-w-0 flex-col gap-5 px-4 pb-10 pt-6 sm:px-6">
    <section aria-label="About this page" className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-purple/30 bg-purple/5 px-4 py-3">
      <FlaskConical className="size-5 shrink-0 text-purple" aria-hidden="true" />
      <p className="min-w-[14rem] flex-1 text-xs leading-5 text-muted-foreground"><span className="font-semibold text-foreground">Sample data.</span> AdBox doesn't have a support service yet: these conversations are invented, and replies and changes stay in this tab until you reload.</p>
      <Button variant="outline" size="sm" className="h-8 bg-card" onClick={reset}><RotateCcw aria-hidden="true" />Reset sample</Button>
    </section>

    <Figures summary={summary.data} onView={chooseView} />

    <section aria-label="Support inbox" className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-4">
        <div role="radiogroup" aria-label="Views" className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none]">
          {views.map((item) => {
            const count = summary.data?.viewCounts[item.key]
            const active = item.key === view
            return <button key={item.key} type="button" role="radio" aria-checked={active} title={item.description} onClick={() => chooseView(item.key)}
              className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-blue",
                active ? "bg-blue text-white dark:bg-cyan dark:text-grey-1000" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              {item.label}{count !== undefined && <span className={cn("rounded px-1 tabular-nums", active ? "bg-white/20" : "bg-muted")}>{count}</span>}
            </button>
          })}
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div className="relative min-w-0">
            <label htmlFor={searchId} className="sr-only">Search conversations</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input ref={searchRef} id={searchId} type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, subject, reference or message…" className="h-10 pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden" />
            {search && <button type="button" aria-label="Clear search" onClick={() => setSearch("")} className="absolute right-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"><X className="size-4" aria-hidden="true" /></button>}
          </div>
          <Select value={category} onValueChange={(value) => { setCategory(value as TicketCategory | typeof ALL); setSelectedId(null) }}>
            <SelectTrigger aria-label="Topic" className="h-10 w-full sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value={ALL}>Every topic</SelectItem>{(Object.keys(categoryLabels) as TicketCategory[]).map((key) => <SelectItem key={key} value={key}>{categoryLabels[key]}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={sort} onValueChange={(value) => setSort(value as TicketSort)}>
            <SelectTrigger aria-label="Order" className="h-10 w-full sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="urgency">Most urgent first</SelectItem><SelectItem value="newest">Newest first</SelectItem></SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid min-h-[560px] grid-cols-1 lg:h-[calc(100svh-140px)] lg:max-h-[880px] lg:min-h-[620px] lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)]">
        <div className={cn("flex min-h-0 flex-col border-border lg:border-r", selectedId && "max-lg:hidden")}>
          <p className="border-b border-border px-4 py-2 text-[11px] text-muted-foreground">{viewInfo.description}{list ? ` · ${list.length} ${list.length === 1 ? "conversation" : "conversations"}` : ""}</p>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <TicketList tickets={list} selectedId={selectedId} onSelect={setSelectedId} now={now} loading={tickets.isFetching}
              empty={term || category !== ALL ? "Nothing matches. Try another search or topic." : view === "needs-reply" ? "Everyone has a reply. Nice work." : "No conversations in this view."} />
          </div>
          <p className="hidden border-t border-border px-4 py-2 text-[11px] text-muted-foreground lg:block">
            <kbd className="rounded border border-border px-1 font-sans">J</kbd> / <kbd className="rounded border border-border px-1 font-sans">K</kbd> to move · <kbd className="rounded border border-border px-1 font-sans">R</kbd> to reply · <kbd className="rounded border border-border px-1 font-sans">/</kbd> to search
          </p>
        </div>
        <div className={cn("min-h-0 min-w-0", !selectedId && "max-lg:hidden")}>
          {selectedId
            ? <TicketConversation id={selectedId} now={now} onBack={() => setSelectedId(null)} onOpen={setSelectedId} composerRef={composerRef} />
            : <div className="flex h-full flex-col items-center justify-center gap-2 p-10 text-center text-muted-foreground"><Inbox className="size-8" aria-hidden="true" /><p className="text-sm">Choose a conversation to read it and reply.</p></div>}
        </div>
      </div>
    </section>
  </div>
}

function Figures({ summary, onView }: { summary: SupportSummary | undefined; onView: (view: TicketView) => void }) {
  return <section aria-label="Support at a glance" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
    <Figure icon={MessageCircleQuestion} label="Need a reply" value={summary?.needsReply} onClick={() => onView("needs-reply")}
      hint={summary ? summary.overdue ? <span className="inline-flex items-center gap-1 text-destructive"><AlertTriangle className="size-3" aria-hidden="true" />{summary.overdue} overdue</span> : "None overdue" : undefined} />
    <Figure icon={UserPlus} label="Unassigned" value={summary?.unassigned} hint="Nobody has picked these up" onClick={() => onView("unassigned")} />
    <Figure icon={Timer} label="Median first reply" value={summary ? duration(summary.medianFirstReplyMinutes) : undefined} hint="Last 7 days · sample figure" />
    <Figure icon={Smile} label="Satisfaction" value={summary ? `${summary.satisfaction.average.toFixed(1)} / 5` : undefined} hint={summary ? `${summary.satisfaction.ratings} ratings · ${summary.resolvedThisWeek} resolved this week · sample` : undefined} />
  </section>
}

function Figure({ icon: Icon, label, value, hint, onClick }: { icon: LucideIcon; label: string; value: number | string | undefined; hint?: ReactNode; onClick?: () => void }) {
  const body = <>
    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue/10 text-blue dark:bg-cyan/10 dark:text-cyan"><Icon className="size-5" aria-hidden="true" /></span>
    <span className="min-w-0">
      <span className="block text-xs text-muted-foreground">{label}</span>
      <span className="block font-heading text-2xl font-semibold tabular-nums">{value ?? <span className="inline-block h-6 w-12 animate-pulse rounded bg-muted align-middle" aria-label="Loading" />}</span>
      {hint && <span className="block truncate text-[11px] text-muted-foreground">{hint}</span>}
    </span>
  </>
  const className = "flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left"
  return onClick
    ? <button type="button" onClick={onClick} className={cn(className, "outline-none transition hover:shadow-adbox-small focus-visible:ring-2 focus-visible:ring-blue")}>{body}</button>
    : <div className={className}>{body}</div>
}
