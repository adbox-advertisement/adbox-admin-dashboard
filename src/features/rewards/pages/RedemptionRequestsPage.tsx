import { useEffect, useId, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { CheckCheck, CheckCircle2, Loader2, Search, ShieldCheck, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useApprove, useApproveAllClear, useNow, usePartners, useRedemptions, useRewardsOverview } from "../hooks"
import { bars, errorText, initials, kindLabels, riskLabels, since } from "../lib/rewards"
import type { RedemptionQuery, RedemptionRow, RedemptionStatus, Risk } from "../types"
import { RedemptionSheet } from "../components/RedemptionSheet"
import { Empty, Failed, PageIntro, PartnerMark, RiskPill, SampleBanner, Segmented, StatusPill, card, type Choice } from "../components/RewardsBits"

const ALL = "all"
const statuses: Array<{ value: RedemptionStatus | typeof ALL; label: string }> = [
  { value: "pending", label: "Waiting" }, { value: "processing", label: "Delivering" }, { value: "failed", label: "Failed" },
  { value: "fulfilled", label: "Delivered" }, { value: "rejected", label: "Rejected" }, { value: ALL, label: "All" },
]
const risks: Risk[] = ["low", "review", "high"]
const PAGE = 20
// Wide screens get a table; the same row stacks into a card below xl (the sidebar takes 290px).
// Waiting requests show their checks; decided ones show their status and who decided.
const columns = (waiting: boolean) => cn("xl:grid xl:items-center xl:gap-4", waiting
  ? "xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)_7rem_7.5rem_4.5rem_10rem]"
  : "xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)_7rem_6.5rem_7rem_4.5rem_5.5rem]")

/**
 * Redemption requests: people asked to spend gold on a reward, and each waits for an admin.
 * Waiting requests come oldest first; the filters live in the address so a link opens the same view.
 */
export function RedemptionRequestsPage() {
  const now = useNow()
  const [params, setParams] = useSearchParams()
  const status = (statuses.some((item) => item.value === params.get("status")) ? params.get("status") : "pending") as RedemptionQuery["status"]
  const partnerId = params.get("partner") ?? ALL
  const risk = (risks.includes(params.get("risk") as Risk) ? params.get("risk") : ALL) as Risk | typeof ALL
  const openId = params.get("open")
  const [search, setSearch] = useState("")
  const [term, setTerm] = useState("")
  const [message, setMessage] = useState("")
  const [confirmAll, setConfirmAll] = useState(false)
  const [shown, setShown] = useState({ key: "", count: PAGE })
  const searchId = useId()

  useEffect(() => {
    const timer = setTimeout(() => setTerm(search.trim()), 250)
    return () => clearTimeout(timer)
  }, [search])

  const query = useMemo<RedemptionQuery>(() => ({
    status, partnerId: partnerId === ALL ? undefined : partnerId, search: term || undefined, risk: status === "pending" && risk !== ALL ? risk : undefined,
  }), [status, partnerId, risk, term])
  const list = useRedemptions(query)
  const overview = useRewardsOverview()
  const partners = usePartners()
  const approve = useApprove()
  const approveAll = useApproveAllClear()

  const update = (patch: Record<string, string | null>) => setParams((previous) => {
    const next = new URLSearchParams(previous)
    for (const [key, value] of Object.entries(patch)) {
      // Waiting is the default status; for the other filters "all" is.
      if (value === null || (key === "status" ? value === "pending" : value === ALL)) next.delete(key)
      else next.set(key, value)
    }
    return next
  }, { replace: true })

  const counts = overview.data?.statusCounts
  const statusOptions: Array<Choice<RedemptionStatus | typeof ALL>> = statuses.map((item) => ({ ...item, count: counts?.[item.value] }))
  const rows = list.data
  // A new filter starts again from the first page.
  const listKey = JSON.stringify(query)
  const limit = shown.key === listKey ? shown.count : PAGE
  const clear = overview.data?.lowRiskPending ?? 0
  const waitingView = status === "pending"
  const waiting = rows?.filter((item) => item.status === "pending" && item.id !== openId) ?? []
  const next = status === "pending" && waiting[0] ? () => update({ open: waiting[0].id }) : undefined

  const quickApprove = (item: RedemptionRow) => approve.mutate(item.id, {
    onSuccess: () => setMessage(item.offer.stock === null ? `${item.reference} approved. ${item.partner.shortName} is sending the top-up to ${item.phone}.` : `${item.reference} approved. The voucher code is in ${item.user.name}'s app.`),
    onError: (error) => setMessage(errorText(error, `${item.reference} couldn't be approved.`)),
  })
  const runApproveAll = () => approveAll.mutate(undefined, {
    onSuccess: (count) => { setConfirmAll(false); setMessage(`Approved ${count} all-clear ${count === 1 ? "request" : "requests"}. Top-ups are on their way; voucher codes are in people's apps.`) },
  })

  return <div className="flex min-w-0 flex-col gap-4 px-4 pb-10 sm:px-6">
    <SampleBanner />
    <PageIntro>When someone spends gold on a reward, the gold is held and the request waits here. Approve it and the partner delivers: a top-up lands on their phone, a voucher code appears in their app. Reject it and the gold goes back.</PageIntro>

    {message && <div role="status" className="flex items-start gap-3 rounded-2xl bg-success-500/10 px-4 py-3 text-sm text-success-800 dark:text-success-300">
      <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p className="flex-1">{message}</p>
      <button type="button" onClick={() => setMessage("")} className="rounded-full p-0.5 outline-none hover:bg-success-500/15 focus-visible:ring-2 focus-visible:ring-purple" aria-label="Dismiss"><X className="size-4" aria-hidden="true" /></button>
    </div>}

    {status === "pending" && clear > 0 && <section aria-label="All-clear requests" className={cn(card, "flex flex-wrap items-center gap-3 px-5 py-4")}>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success-500/10 text-success-700 dark:text-success-400"><ShieldCheck className="size-5" aria-hidden="true" /></span>
      <p className="min-w-[12rem] flex-1 text-sm"><span className="font-semibold">{clear} waiting {clear === 1 ? "request has" : "requests have"} every check clear.</span> <span className="text-muted-foreground">Established accounts, verified numbers, within limits and in stock.</span></p>
      <Button className="h-10 rounded-full bg-[image:var(--gradient-purple)] px-4 text-white hover:opacity-90" onClick={() => setConfirmAll(true)}><CheckCheck aria-hidden="true" />Approve all {clear}</Button>
    </section>}

    <section aria-label="Redemption requests" className={cn(card, "min-w-0 overflow-hidden")}>
      <div className="flex flex-col gap-3 border-b border-grey-200 p-4 dark:border-border sm:p-5 2xl:flex-row 2xl:items-center">
        <Segmented label="Status" value={status} options={statusOptions} onChange={(value) => update({ status: value, risk: null, open: null })} />
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center 2xl:justify-end">
          <label htmlFor={searchId} className="sr-only">Search requests</label>
          <div className="relative min-w-0 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id={searchId} type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, phone or reference" className="h-10 rounded-full pl-9" />
          </div>
          <Select value={partnerId} onValueChange={(value) => update({ partner: value })}>
            <SelectTrigger aria-label="Partner" className="h-10 rounded-full sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All partners</SelectItem>
              {partners.data?.map((partner) => <SelectItem key={partner.id} value={partner.id}>{partner.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {status === "pending" && <Select value={risk} onValueChange={(value) => update({ risk: value })}>
            <SelectTrigger aria-label="Checks" className="h-10 rounded-full sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Any checks</SelectItem>
              {risks.map((item) => <SelectItem key={item} value={item}>{riskLabels[item]}</SelectItem>)}
            </SelectContent>
          </Select>}
        </div>
      </div>

      <div aria-hidden="true" className={cn("hidden border-b border-grey-200 px-5 py-2.5 text-xs font-medium text-muted-foreground dark:border-border", columns(waitingView))}>
        <span>Person</span><span>Reward</span><span>Deliver to</span>
        {waitingView ? <><span>Checks</span><span>Waiting</span></> : <><span>Status</span><span>Decided by</span><span>Asked</span></>}
        <span className="text-right">Actions</span>
      </div>

      {list.isError ? <Failed message={errorText(list.error, "Couldn't load the requests.")} onRetry={() => void list.refetch()} />
        : !rows ? <div role="status" aria-label="Loading requests" className="flex flex-col gap-3 p-5">{[0, 1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-muted" />)}</div>
          : rows.length === 0 ? <Empty title={status === "pending" && !term && partnerId === ALL && risk === ALL ? "Nothing waiting" : "No requests match"}>
            {status === "pending" && !term ? "Every request has been decided. New ones appear here as people redeem their gold." : "Try another status, partner or search."}
          </Empty>
            : <ul aria-label={`${statuses.find((item) => item.value === status)?.label} requests`} className={cn("divide-y divide-grey-200 dark:divide-border", list.isFetching && list.isPlaceholderData && "opacity-60")}>
              {rows.slice(0, limit).map((item) => <Row key={item.id} item={item} now={now} waiting={waitingView} approving={approve.isPending && approve.variables === item.id}
                onOpen={() => update({ open: item.id })} onApprove={() => quickApprove(item)} />)}
            </ul>}
      {rows && rows.length > limit && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-grey-200 px-5 py-3 text-sm dark:border-border">
        <p className="text-muted-foreground">Showing {limit} of {rows.length}</p>
        <Button variant="outline" className="h-9 rounded-full px-4" onClick={() => setShown({ key: listKey, count: limit + PAGE })}>Show {Math.min(PAGE, rows.length - limit)} more</Button>
      </div>}
    </section>

    <RedemptionSheet id={openId} onClose={() => update({ open: null })} onDone={setMessage} onNext={next} />

    <Dialog open={confirmAll} onOpenChange={setConfirmAll}>
      <DialogContent>
        <DialogTitle>Approve {clear} all-clear {clear === 1 ? "request" : "requests"}?</DialogTitle>
        <DialogDescription>Top-ups go to the partners now and land on people's phones in a few seconds. Voucher codes are issued straight away. Requests that need a look stay waiting.</DialogDescription>
        {approveAll.isError && <p role="alert" className="text-sm text-destructive">{errorText(approveAll.error, "That didn't work. Try again.")}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <DialogClose asChild><Button variant="ghost" className="h-10 rounded-full px-4">Cancel</Button></DialogClose>
          <Button className="h-10 rounded-full bg-[image:var(--gradient-purple)] px-4 text-white hover:opacity-90" disabled={approveAll.isPending} onClick={runApproveAll}>
            {approveAll.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <CheckCheck aria-hidden="true" />}Approve {clear}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
}

function Row({ item, now, waiting, approving, onOpen, onApprove }: { item: RedemptionRow; now: number; waiting: boolean; approving: boolean; onOpen: () => void; onApprove: () => void }) {
  const flagged = item.checks.filter((check) => check.tone !== "ok").length
  const pending = item.status === "pending"
  // Below xl the cells reflow into a two-column card: the person and their status or checks first, then the reward.
  return <li className={cn("grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 px-5 py-4 text-sm", columns(waiting))}>
    <div className="order-1 flex min-w-0 items-center gap-3 xl:order-none">
      <span aria-hidden="true" className="hidden size-9 shrink-0 items-center justify-center rounded-full bg-purple/10 text-xs font-semibold text-purple sm:flex xl:hidden 2xl:flex">{initials(item.user.name)}</span>
      <div className="min-w-0">
        <p className="truncate font-semibold">{item.user.name}</p>
        <p className="truncate text-xs text-muted-foreground">@{item.user.username} · <span className="font-mono">{item.reference}</span></p>
      </div>
    </div>
    <div className="order-3 col-span-2 flex min-w-0 items-center gap-2.5 xl:order-none xl:col-span-1">
      <PartnerMark partner={item.partner} size="sm" />
      <div className="min-w-0">
        <p className="truncate">{item.offer.name}</p>
        <p className="truncate text-xs text-muted-foreground">{bars(item.bars)} · {kindLabels[item.offer.kind]}</p>
      </div>
    </div>
    <p className="order-4 tabular-nums xl:order-none">{item.phone ?? <span className="text-muted-foreground">Code in app</span>}</p>
    {waiting
      ? <div className="order-2 justify-self-end xl:order-none xl:justify-self-auto"><RiskPill risk={item.risk} count={flagged || undefined} /></div>
      : <>
        <div className="order-2 justify-self-end xl:order-none xl:justify-self-auto"><StatusPill status={item.status} /></div>
        <div className="order-6 min-w-0 self-center text-xs text-muted-foreground xl:order-none">{pending ? <RiskPill risk={item.risk} /> : <span className="truncate">{item.decidedBy ? `By ${item.decidedBy}` : "—"}</span>}</div>
      </>}
    <p className="order-5 justify-self-end text-xs text-muted-foreground xl:order-none xl:justify-self-auto">{since(item.requestedAt, now)}<span className="xl:hidden"> ago</span></p>
    <div className={cn("order-7 flex justify-end gap-2 xl:order-none xl:col-span-1", waiting && "col-span-2")}>
      <Button variant="outline" className="h-9 rounded-full px-3" onClick={onOpen} aria-label={`${pending ? "Review" : "Open"} ${item.reference}`}>{pending ? "Review" : "Open"}</Button>
      {waiting && pending && item.risk === "low" && <Button className="h-9 rounded-full bg-[image:var(--gradient-purple)] px-3 text-white hover:opacity-90" disabled={approving} onClick={onApprove} aria-label={`Approve ${item.reference}`}>
        {approving && <Loader2 className="animate-spin" aria-hidden="true" />}Approve
      </Button>}
    </div>
  </li>
}
