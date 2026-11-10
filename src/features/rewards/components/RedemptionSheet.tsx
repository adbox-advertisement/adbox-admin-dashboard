import { useState, type ReactNode } from "react"
import { ArrowRight, BadgeCheck, Check, Eye, EyeOff, Loader2, RotateCcw, Undo2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { storeRate, useApprove, useNow, useRedemption, useRefund, useReject, useRetry } from "../hooks"
import { bars, errorText, formatDate, ghs, initials, maskCode, rejectReasons, since } from "../lib/rewards"
import type { RedemptionDetail } from "../types"
import { CheckList, KindTag, PartnerMark, RiskPill, StatusPill } from "./RewardsBits"

/**
 * One request, side by side with the list: who asked, for what, what the checks found, and
 * the decision. Approving hands a top-up to the partner or issues the next voucher code;
 * rejecting needs a reason and gives the gold back.
 */
export function RedemptionSheet({ id, onClose, onDone, onNext }: {
  id: string | null
  onClose: () => void
  /** Announces what happened, for the page's live region. */
  onDone: (message: string) => void
  onNext?: () => void
}) {
  const detail = useRedemption(id)
  const data = detail.data?.id === id ? detail.data : undefined
  return <Sheet open={Boolean(id)} onOpenChange={(open) => { if (!open) onClose() }}>
    <SheetContent side="right" closeLabel="Close request" className="w-[min(34rem,calc(100vw-1rem))] gap-0 overflow-y-auto p-0" aria-describedby={undefined}>
      {data ? <Body key={data.id} data={data} onDone={onDone} onNext={onNext} />
        : <div className="flex flex-col gap-4 p-5">
          <SheetTitle className="pr-10">{detail.isError ? "Couldn't open this request" : "Loading request"}</SheetTitle>
          {detail.isError ? <p role="alert" className="text-sm text-destructive">{errorText(detail.error, "Try again in a moment.")}</p>
            : <div role="status" aria-label="Loading request" className="h-64 animate-pulse rounded-2xl bg-muted" />}
        </div>}
    </SheetContent>
  </Sheet>
}

function Body({ data, onDone, onNext }: { data: RedemptionDetail; onDone: (message: string) => void; onNext?: () => void }) {
  const now = useNow()
  const approve = useApprove()
  const reject = useReject()
  const retry = useRetry()
  const refund = useRefund()
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState("")
  const [note, setNote] = useState("")
  const [showCode, setShowCode] = useState(false)
  // The page's own message sits behind the open sheet, so the sheet says it too.
  const [said, setSaid] = useState("")
  const announce = (message: string) => { setSaid(message); onDone(message) }
  const { user, offer, partner } = data
  const topUp = offer.stock === null
  const busy = approve.isPending || reject.isPending || retry.isPending || refund.isPending
  const failure = [approve, reject, retry, refund].find((mutation) => mutation.isError)?.error
  const decided = data.status !== "pending"

  const doApprove = () => approve.mutate(data.id, {
    onSuccess: () => announce(topUp ? `${data.reference} approved. ${partner.shortName} is sending the top-up to ${data.phone}.` : `${data.reference} approved. The voucher code is in ${user.name}'s app.`),
  })
  const doReject = () => reject.mutate({ id: data.id, input: { reason, note } }, {
    onSuccess: () => { setRejecting(false); announce(`${data.reference} rejected. ${bars(data.bars)} went back to @${user.username}.`) },
  })

  return <>
    <header className="flex flex-col gap-2 border-b border-grey-200 px-5 pb-4 pt-5 pr-14 dark:border-border">
      <div className="flex flex-wrap items-center gap-2">
        <SheetTitle className="font-mono text-base">{data.reference}</SheetTitle>
        <StatusPill status={data.status} />
      </div>
      <SheetDescription className="text-sm">{offer.name} for {user.name} · asked {since(data.requestedAt, now)} ago</SheetDescription>
    </header>

    <div className="flex flex-1 flex-col gap-6 px-5 py-5">
      <Block title="Who asked">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-purple/10 text-sm font-semibold text-purple">{initials(user.name)}</span>
          <div className="min-w-0">
            <p className="flex items-center gap-1 font-semibold">{user.name}{user.campusBadge && <BadgeCheck className="size-4 text-blue dark:text-cyan" aria-label="Campus badge" />}</p>
            <p className="truncate text-xs text-muted-foreground">@{user.username}{user.institution ? ` · ${user.institution}` : ""}</p>
          </div>
        </div>
        <Facts rows={[
          ["Joined", formatDate(user.joinedAt)],
          ["Phone", <>{user.phone} <span className="text-muted-foreground">({user.phoneVerified ? "verified" : "not verified"})</span></>],
          ["Gold left", bars(user.goldBalance)],
        ]} />
      </Block>

      <Block title="What they asked for">
        <div className="flex items-center gap-3">
          <PartnerMark partner={partner} />
          <div className="min-w-0">
            <p className="font-semibold">{offer.name}</p>
            <p className="text-xs text-muted-foreground">{partner.name}</p>
          </div>
          <span className="ml-auto"><KindTag kind={offer.kind} /></span>
        </div>
        <Facts rows={[
          ["Gold held", <>{bars(data.bars)} <span className="text-muted-foreground">(≈ {ghs(data.bars / storeRate())} at the store rate)</span></>],
          ["Worth", ghs(offer.faceValueGhs)],
          ["Delivered as", topUp ? `Top-up to ${data.phone}` : "A voucher code in their app"],
        ]} />
      </Block>

      {data.status === "pending" && <Block title="Checks" aside={<RiskPill risk={data.risk} />}>
        <CheckList checks={data.checks} />
      </Block>}

      {decided && <Block title="Outcome">
        <Outcome data={data} now={now} showCode={showCode} onToggleCode={() => setShowCode((value) => !value)} />
        {data.status === "failed" && <div className="flex flex-wrap gap-2">
          <Button className="h-9 rounded-full px-4" disabled={busy} onClick={() => retry.mutate(data.id, { onSuccess: () => announce(`Trying ${data.reference} again with ${partner.shortName}.`) })}>
            {retry.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <RotateCcw aria-hidden="true" />}Try again
          </Button>
          <Button variant="outline" className="h-9 rounded-full px-4" disabled={busy} onClick={() => refund.mutate(data.id, { onSuccess: () => announce(`${data.reference} refunded. ${bars(data.bars)} went back to @${user.username}.`) })}>
            <Undo2 aria-hidden="true" />Refund the gold
          </Button>
        </div>}
      </Block>}

      {data.history.length > 0 && <Block title={`${user.name.split(" ")[0]}'s other requests`}>
        <ul className="flex flex-col divide-y divide-grey-200 dark:divide-border">
          {data.history.map((item) => <li key={item.id} className="flex items-center gap-3 py-2 text-sm">
            <span className="min-w-0 flex-1 truncate">{item.offer.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{since(item.requestedAt, now)} ago</span>
            <StatusPill status={item.status} />
          </li>)}
        </ul>
      </Block>}
    </div>

    <footer className="sticky bottom-0 flex flex-col gap-3 border-t border-grey-200 bg-card px-5 py-4 dark:border-border">
      <p role="status" className="sr-only">{said}</p>
      {failure && <p role="alert" className="text-sm text-destructive">{errorText(failure, "That didn't work. Try again.")}</p>}
      {data.status === "pending" && (rejecting
        ? <form className="flex flex-col gap-3" onSubmit={(event) => { event.preventDefault(); if (reason) doReject() }}>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">Reason
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger aria-label="Reason" className="h-10 font-normal"><SelectValue placeholder="Choose a reason" /></SelectTrigger>
              <SelectContent>{rejectReasons.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">Note to them <span className="font-normal text-muted-foreground">(optional, shown in the app)</span>
            <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} maxLength={200} className="font-normal" />
          </label>
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="ghost" className="h-10 rounded-full px-4" onClick={() => setRejecting(false)}>Cancel</Button>
            <Button type="submit" variant="destructive" className="h-10 rounded-full px-4" disabled={!reason || busy}>
              {reject.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}Reject and return the gold
            </Button>
          </div>
        </form>
        : <div className="flex flex-wrap items-center justify-end gap-2">
          {data.risk === "high" && <p className="mr-auto text-xs text-destructive">Some checks found problems.</p>}
          <Button variant="outline" className="h-10 rounded-full px-4 text-destructive hover:text-destructive" disabled={busy} onClick={() => setRejecting(true)}><X aria-hidden="true" />Reject…</Button>
          <Button className="h-10 rounded-full px-4 bg-[image:var(--gradient-purple)] text-white hover:opacity-90" disabled={busy} onClick={doApprove}>
            {approve.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Check aria-hidden="true" />}{topUp ? "Approve and send" : "Approve and issue code"}
          </Button>
        </div>)}
      {decided && onNext && <Button variant="outline" className="h-10 self-end rounded-full px-4" onClick={onNext}>Next waiting request<ArrowRight aria-hidden="true" /></Button>}
    </footer>
  </>
}

function Outcome({ data, now, showCode, onToggleCode }: { data: RedemptionDetail; now: number; showCode: boolean; onToggleCode: () => void }) {
  const when = data.decidedAt ? `${since(data.decidedAt, now)} ago` : ""
  const by = data.decidedBy ? ` by ${data.decidedBy}` : ""
  if (data.status === "processing") return <p className="flex items-start gap-2 text-sm"><Loader2 className="mt-0.5 size-4 shrink-0 text-blue motion-safe:animate-spin dark:text-cyan" aria-hidden="true" />Approved{by}. {data.partner.name} is sending it to {data.phone}; it usually lands in a few seconds.</p>
  if (data.status === "rejected") return <p className="text-sm">Rejected{by} {when}: <span className="font-semibold">{data.rejectReason}</span>. The gold went back to them.</p>
  if (data.status === "failed") return <p className="text-sm text-destructive">{data.failure ?? `${data.partner.name} couldn't deliver it.`} The gold is still held.</p>
  return <div className="flex flex-col gap-2 text-sm">
    <p>Delivered{when ? ` ${when}` : ""}{data.decidedBy ? `, approved by ${data.decidedBy}` : ""}.</p>
    {data.fulfilment?.reference && <p>{data.partner.shortName} reference <span className="font-mono">{data.fulfilment.reference}</span></p>}
    {data.fulfilment?.code && <p className="flex flex-wrap items-center gap-2">Voucher code <span className="font-mono">{showCode ? data.fulfilment.code : maskCode(data.fulfilment.code)}</span>
      <Button size="sm" variant="ghost" className="h-7 rounded-full px-2" onClick={onToggleCode} aria-pressed={showCode}>{showCode ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}{showCode ? "Hide" : "Show"}</Button>
    </p>}
  </div>
}

function Block({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return <section className="flex flex-col gap-3">
    <div className="flex items-center justify-between gap-2"><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>{aside}</div>
    {children}
  </section>
}

function Facts({ rows }: { rows: Array<[string, ReactNode]> }) {
  return <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 rounded-xl bg-grey-50 px-4 py-3 text-sm dark:bg-background">
    {rows.map(([label, value]) => <div key={label} className="contents">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("min-w-0 break-words")}>{value}</dd>
    </div>)}
  </dl>
}
