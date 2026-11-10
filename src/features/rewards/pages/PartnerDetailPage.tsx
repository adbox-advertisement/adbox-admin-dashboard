import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { CalendarClock, CheckCircle2, Loader2, Mail, Pause, Phone, Play, Plus, UserRound, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { APP_ROUTES } from "@/routes/paths"
import { useNow, usePartner, useSetPartnerStatus } from "../hooks"
import { agreementSoon, bars, deliveryLabels, errorText, formatDate, ghs, since } from "../lib/rewards"
import type { OfferRow } from "../types"
import { AddCodesDialog } from "../components/AddCodesDialog"
import { BackLink, Empty, Failed, KindTag, PartnerMark, PartnerStatus, SampleBanner, SectionHead, StatusPill, card } from "../components/RewardsBits"

const requestLink = (params: Record<string, string>) => `${APP_ROUTES.rewardRequests}?${new URLSearchParams(params)}`

/** One partner: its rewards, voucher codes, this month's settlement, contact and recent redemptions. */
export function PartnerDetailPage() {
  const { partnerId = "" } = useParams()
  const now = useNow()
  const partner = usePartner(partnerId)
  const setStatus = useSetPartnerStatus()
  const [confirmPause, setConfirmPause] = useState(false)
  const [codesFor, setCodesFor] = useState<OfferRow | null>(null)
  const [message, setMessage] = useState("")
  const back = <BackLink to={APP_ROUTES.rewardPartners}>All partners</BackLink>

  if (partner.isError) return <div className="flex min-w-0 flex-col gap-4 px-4 pb-10 sm:px-6">{back}<div className={card}><Failed message={errorText(partner.error, "Couldn't load this partner.")} onRetry={() => void partner.refetch()} /></div></div>
  const data = partner.data
  if (!data) return <div className="flex min-w-0 flex-col gap-4 px-4 pb-10 sm:px-6">{back}<div role="status" aria-label="Loading partner" className={cn(card, "h-48 animate-pulse")} /></div>

  const vouchers = data.offers.filter((offer) => offer.stock !== null)
  const ending = agreementSoon(data.agreementEnds, now)
  const resume = () => setStatus.mutate({ id: data.id, status: "active" }, { onSuccess: () => setMessage(`${data.name} is active again. Its rewards are back in the app.`) })
  const pause = () => setStatus.mutate({ id: data.id, status: "paused" }, { onSuccess: () => { setConfirmPause(false); setMessage(`${data.name} is paused.`) } })

  return <div className="flex min-w-0 flex-col gap-4 px-4 pb-10 sm:px-6">
    {back}
    <SampleBanner />

    <header className={cn(card, "flex flex-col gap-4 p-5 sm:flex-row sm:items-start")}>
      <PartnerMark partner={data} size="lg" />
      <div className="min-w-0 flex-1">
        <h1 className="flex flex-wrap items-center gap-2 font-heading text-h5 font-semibold">{data.name}<PartnerStatus status={data.status} /></h1>
        <p className="text-sm text-muted-foreground">{deliveryLabels[data.delivery]} · {data.discountPercent}% discount · settled monthly</p>
        <p className="mt-2 max-w-2xl text-sm">{data.notes}</p>
      </div>
      {data.status === "active"
        ? <Button variant="outline" className="h-10 rounded-full px-4" onClick={() => setConfirmPause(true)}><Pause aria-hidden="true" />Pause partner</Button>
        : <Button className="h-10 rounded-full bg-[image:var(--gradient-purple)] px-4 text-white hover:opacity-90" disabled={setStatus.isPending} onClick={resume}>
          {setStatus.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Play aria-hidden="true" />}Make active
        </Button>}
    </header>

    {message && <div role="status" className="flex items-start gap-3 rounded-2xl bg-success-500/10 px-4 py-3 text-sm text-success-800 dark:text-success-300">
      <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><p className="flex-1">{message}</p>
      <button type="button" onClick={() => setMessage("")} className="rounded-full p-0.5 outline-none hover:bg-success-500/15 focus-visible:ring-2 focus-visible:ring-purple" aria-label="Dismiss"><X className="size-4" aria-hidden="true" /></button>
    </div>}
    {data.status === "paused" && <p className="rounded-2xl bg-warning-500/10 px-4 py-3 text-sm text-warning-800 dark:text-warning-300">Paused: people can't pick {data.shortName} rewards in the app, and any request already waiting is flagged for review.</p>}
    {setStatus.isError && <p role="alert" className="text-sm text-destructive">{errorText(setStatus.error, "That didn't save.")}</p>}

    <div className="grid gap-4 lg:grid-cols-12">
      <div className="flex min-w-0 flex-col gap-4 lg:col-span-7">
        <section aria-labelledby="partner-rewards" className={card}>
          <SectionHead id="partner-rewards" title="Rewards"><Link to={APP_ROUTES.rewardCatalog} className="text-b3 font-semibold text-purple outline-none hover:underline focus-visible:ring-2 focus-visible:ring-purple">Edit in the catalog</Link></SectionHead>
          <ul className="divide-y divide-grey-200 dark:divide-border">
            {data.offers.map((offer) => <li key={offer.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm">
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate font-semibold", !offer.active && "text-muted-foreground")}>{offer.name}</span>
                <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"><KindTag kind={offer.kind} />{offer.active ? "On offer" : "Switched off"}</span>
              </span>
              <span className="tabular-nums">{bars(offer.priceBars)}</span>
              <span className="w-24 text-right text-xs text-muted-foreground">{offer.redeemed30d} in 30 days</span>
            </li>)}
          </ul>
        </section>

        {vouchers.length > 0 && <section aria-labelledby="voucher-codes" className={card}>
          <SectionHead id="voucher-codes" title="Voucher codes" />
          <p className="px-5 pt-4 text-sm text-muted-foreground">Each approved voucher request takes the next unused code. Paste new codes from {data.shortName} when a batch arrives.</p>
          <ul className="flex flex-col gap-3 p-5">
            {vouchers.map((offer) => {
              const out = offer.stock === 0
              const low = !out && (offer.stock ?? 0) <= offer.lowStockAt
              return <li key={offer.id} className="rounded-xl border border-grey-200 p-4 dark:border-border">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{offer.name}</span>
                    <span className={cn("block text-xs", out ? "font-semibold text-destructive" : low ? "font-semibold text-warning-800 dark:text-warning-300" : "text-muted-foreground")}>
                      {out ? "Out of codes: requests can't be approved" : `${offer.stock} ${offer.stock === 1 ? "code" : "codes"} left${low ? ", running low" : ""}`}
                    </span>
                  </span>
                  <Button variant="outline" className="h-9 rounded-full px-3.5" onClick={() => setCodesFor(offer)} aria-label={`Add codes for ${offer.name}`}><Plus aria-hidden="true" />Add codes</Button>
                </div>
                {offer.batches.length > 0 && <table className="mt-3 w-full text-left text-xs">
                  <caption className="sr-only">Code batches for {offer.name}</caption>
                  <thead className="text-muted-foreground"><tr><th scope="col" className="py-1 font-medium">Batch added</th><th scope="col" className="py-1 font-medium">By</th><th scope="col" className="py-1 text-right font-medium">Used</th></tr></thead>
                  <tbody className="divide-y divide-grey-200 dark:divide-border">
                    {offer.batches.map((batch) => <tr key={batch.id}>
                      <td className="py-1.5">{formatDate(batch.addedAt)}</td>
                      <td className="py-1.5">{batch.addedBy}</td>
                      <td className="py-1.5 text-right tabular-nums">{batch.issued} of {batch.count}</td>
                    </tr>)}
                  </tbody>
                </table>}
              </li>
            })}
          </ul>
        </section>}

        <section aria-labelledby="partner-recent" className={card}>
          <SectionHead id="partner-recent" title="Recent redemptions"><Link to={requestLink({ status: "all", partner: data.id })} className="text-b3 font-semibold text-purple outline-none hover:underline focus-visible:ring-2 focus-visible:ring-purple">See all</Link></SectionHead>
          {data.recent.length === 0 ? <Empty title="No redemptions yet" />
            : <ul className="divide-y divide-grey-200 dark:divide-border">
              {data.recent.map((item) => <li key={item.id}>
                <Link to={requestLink({ status: "all", partner: data.id, open: item.id })} className="flex items-center gap-3 px-5 py-3 text-sm outline-none transition-colors hover:bg-grey-50 focus-visible:bg-grey-50 dark:hover:bg-muted/40 dark:focus-visible:bg-muted/40">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{item.offer.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{item.user.name} · <span className="font-mono">{item.reference}</span></span>
                  </span>
                  <span className="hidden text-xs text-muted-foreground sm:block">{since(item.requestedAt, now)} ago</span>
                  <StatusPill status={item.status} />
                </Link>
              </li>)}
            </ul>}
        </section>
      </div>

      <div className="flex min-w-0 flex-col gap-4 lg:col-span-5">
        <section aria-labelledby="partner-settlement" className={card}>
          <SectionHead id="partner-settlement" title={`${new Date(now).toLocaleDateString("en-GB", { month: "long" })} settlement`} />
          <dl className="flex flex-col gap-2 p-5 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Delivered at face value</dt><dd className="tabular-nums">{ghs(data.monthFaceValueGhs)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Partner discount ({data.discountPercent}%)</dt><dd className="tabular-nums">− {ghs(Math.round(data.monthFaceValueGhs * data.discountPercent) / 100)}</dd></div>
            <div className="mt-1 flex justify-between gap-3 border-t border-grey-200 pt-3 font-semibold dark:border-border"><dt>AdBox owes {data.shortName}</dt><dd className="tabular-nums">{ghs(data.monthPayableGhs)}</dd></div>
          </dl>
          <p className="px-5 pb-5 text-xs text-muted-foreground">Only delivered rewards count. Rejected and refunded requests cost nothing.</p>
        </section>

        <section aria-labelledby="partner-contact" className={card}>
          <SectionHead id="partner-contact" title="Agreement and contact" />
          <ul className="flex flex-col gap-3 p-5 text-sm">
            <li className={cn("flex items-center gap-2.5", ending && "font-semibold text-warning-800 dark:text-warning-300")}><CalendarClock className="size-4 shrink-0" aria-hidden="true" />Agreement ends {formatDate(data.agreementEnds)}{ending ? ": renew soon" : ""}</li>
            <li className="flex items-center gap-2.5"><UserRound className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />{data.contact.name}</li>
            <li className="flex min-w-0 items-center gap-2.5"><Mail className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><a href={`mailto:${data.contact.email}`} className="truncate text-purple outline-none hover:underline focus-visible:ring-2 focus-visible:ring-purple">{data.contact.email}</a></li>
            <li className="flex items-center gap-2.5"><Phone className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><a href={`tel:${data.contact.phone.replace(/\s/g, "")}`} className="outline-none hover:underline focus-visible:ring-2 focus-visible:ring-purple">{data.contact.phone}</a></li>
          </ul>
          <p className="px-5 pb-5 text-xs text-muted-foreground">Sample contact details, not the partner's real ones.</p>
        </section>
      </div>
    </div>

    <Dialog open={confirmPause} onOpenChange={setConfirmPause}>
      <DialogContent>
        <DialogTitle>Pause {data.name}?</DialogTitle>
        <DialogDescription>People won't be able to pick {data.shortName} rewards in the app until you make it active again. Requests already waiting stay waiting and are flagged; nothing already delivered changes.</DialogDescription>
        <div className="flex flex-wrap justify-end gap-2">
          <DialogClose asChild><Button variant="ghost" className="h-10 rounded-full px-4">Cancel</Button></DialogClose>
          <Button variant="destructive" className="h-10 rounded-full px-4" disabled={setStatus.isPending} onClick={pause}>{setStatus.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Pause aria-hidden="true" />}Pause</Button>
        </div>
      </DialogContent>
    </Dialog>

    {codesFor && <AddCodesDialog key={codesFor.id} offer={codesFor} onClose={() => setCodesFor(null)} onAdded={(text) => { setCodesFor(null); setMessage(text) }} />}
  </div>
}
