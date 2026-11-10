import { useState } from "react"
import { Link } from "react-router-dom"
import { Loader2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { APP_ROUTES } from "@/routes/paths"
import { storeRate, useOffers, usePartners, useUpdateOffer } from "../hooks"
import { bars, errorText, ghs, kindLabels, premiumPercent } from "../lib/rewards"
import type { OfferKind, OfferRow } from "../types"
import { Empty, Failed, KindTag, PageIntro, PartnerMark, SampleBanner, Segmented, card } from "../components/RewardsBits"

const ALL = "all"
const kinds: Array<OfferKind | typeof ALL> = [ALL, "airtime", "data", "voucher"]
const columns = "xl:grid xl:grid-cols-[minmax(0,1.6fr)_5.5rem_6.5rem_7.5rem_5rem_7rem_5rem_9rem] xl:items-center xl:gap-4"

/** Every reward people can spend gold on: its price in bars, the monthly limit, stock, and whether it's on offer. */
export function RewardsCatalogPage() {
  const offers = useOffers()
  const partners = usePartners()
  const update = useUpdateOffer()
  const [kind, setKind] = useState<OfferKind | typeof ALL>(ALL)
  const [partnerId, setPartnerId] = useState(ALL)
  const [editing, setEditing] = useState<OfferRow | null>(null)
  const rows = offers.data?.filter((offer) => (kind === ALL || offer.kind === kind) && (partnerId === ALL || offer.partnerId === partnerId))
  const count = (value: OfferKind | typeof ALL) => offers.data?.filter((offer) => value === ALL || offer.kind === value).length

  return <div className="flex min-w-0 flex-col gap-4 px-4 pb-10 sm:px-6">
    <SampleBanner />
    <PageIntro>Prices are in gold bars. At the store rate ({storeRate()} bars for GH₵ 1) a GH₵ 5 top-up is worth {bars(5 * storeRate())}; the difference shows next to each price. Switch a reward off to hide it from the app without losing its settings.</PageIntro>

    <section aria-label="Rewards catalog" className={cn(card, "min-w-0 overflow-hidden")}>
      <div className="flex flex-col gap-3 border-b border-grey-200 p-4 dark:border-border sm:flex-row sm:flex-wrap sm:items-center sm:p-5">
        <Segmented label="Type" value={kind} onChange={setKind}
          options={kinds.map((value) => ({ value, label: value === ALL ? "All" : value === "voucher" ? "Vouchers" : kindLabels[value], count: count(value) }))} />
        <Select value={partnerId} onValueChange={setPartnerId}>
          <SelectTrigger aria-label="Partner" className="h-10 rounded-full sm:ml-auto sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All partners</SelectItem>
            {partners.data?.map((partner) => <SelectItem key={partner.id} value={partner.id}>{partner.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {update.isError && <p role="alert" className="border-b border-grey-200 px-5 py-3 text-sm text-destructive dark:border-border">{errorText(update.error, "That change didn't save.")}</p>}

      <div aria-hidden="true" className={cn("hidden border-b border-grey-200 px-5 py-2.5 text-xs font-medium text-muted-foreground dark:border-border", columns)}>
        <span>Reward</span><span>Worth</span><span>Price</span><span>Against store</span><span>Limit</span><span>Stock</span><span>30 days</span><span className="text-right">On offer</span>
      </div>

      {offers.isError ? <Failed message={errorText(offers.error, "Couldn't load the catalog.")} onRetry={() => void offers.refetch()} />
        : !rows ? <div role="status" aria-label="Loading rewards" className="flex flex-col gap-3 p-5">{[0, 1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-muted" />)}</div>
          : rows.length === 0 ? <Empty title="No rewards here">Try another type or partner.</Empty>
            : <ul aria-label="Rewards" className="divide-y divide-grey-200 dark:divide-border">
              {rows.map((offer) => {
                const premium = premiumPercent(offer, storeRate())
                const saving = update.isPending && update.variables?.id === offer.id
                return <li key={offer.id} className={cn("grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 px-5 py-4 text-sm", columns, !offer.active && "bg-grey-50/60 dark:bg-muted/20")}>
                  <div className="col-span-2 flex min-w-0 items-center gap-3 xl:col-span-1">
                    <PartnerMark partner={offer.partner} size="sm" />
                    <div className="min-w-0">
                      <p className={cn("truncate font-semibold", !offer.active && "text-muted-foreground")}>{offer.name}</p>
                      <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">{offer.partner.name}<KindTag kind={offer.kind} />{offer.partner.status === "paused" && <span className="font-semibold text-warning-800 dark:text-warning-300">Partner paused</span>}</p>
                    </div>
                  </div>
                  <p className="tabular-nums"><span className="text-muted-foreground xl:hidden">Worth </span>{ghs(offer.faceValueGhs)}</p>
                  <p className="justify-self-end font-semibold tabular-nums xl:justify-self-auto">{bars(offer.priceBars)}</p>
                  <p className="text-xs text-muted-foreground">{premium === 0 ? "Same as the store" : `${Math.abs(premium)}% ${premium > 0 ? "above" : "below"} store`}</p>
                  <p className="justify-self-end text-xs xl:justify-self-auto xl:text-sm"><span className="text-muted-foreground xl:hidden">Limit </span>{offer.monthlyLimit}<span className="text-muted-foreground"> / month</span></p>
                  <Stock offer={offer} />
                  <p className="justify-self-end text-xs tabular-nums xl:justify-self-auto xl:text-sm">{offer.redeemed30d}<span className="text-muted-foreground xl:hidden"> delivered in 30 days</span></p>
                  <div className="col-span-2 flex items-center justify-end gap-2 xl:col-span-1">
                    <Button variant="ghost" className="h-9 rounded-full px-3" onClick={() => setEditing(offer)} aria-label={`Edit ${offer.name}`}><Pencil aria-hidden="true" />Edit</Button>
                    {saving && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />}
                    <Switch checked={offer.active} disabled={saving} aria-label={`${offer.name} on offer`} onCheckedChange={(active) => update.mutate({ id: offer.id, update: { active } })} />
                  </div>
                </li>
              })}
            </ul>}
    </section>

    {editing && <EditOffer key={editing.id} offer={editing} onClose={() => setEditing(null)} />}
  </div>
}

function Stock({ offer }: { offer: OfferRow }) {
  if (offer.stock === null) return <p className="text-xs text-muted-foreground">Top-up, no stock</p>
  const out = offer.stock === 0
  const low = !out && offer.stock <= offer.lowStockAt
  return <p className="flex flex-wrap items-center gap-1.5 text-xs xl:text-sm">
    <span className={cn("tabular-nums", out && "font-semibold text-destructive", low && "font-semibold text-warning-800 dark:text-warning-300")}>{out ? "Out of codes" : `${offer.stock} codes`}</span>
    {(out || low) && <Link to={`${APP_ROUTES.rewardPartners}/${offer.partnerId}`} className="text-xs font-semibold text-purple outline-none hover:underline focus-visible:ring-2 focus-visible:ring-purple">Add</Link>}
  </p>
}

/** Price and limit; the dialog shows what the new price means against the store rate before saving. */
function EditOffer({ offer, onClose }: { offer: OfferRow; onClose: () => void }) {
  const update = useUpdateOffer()
  const [price, setPrice] = useState(String(offer.priceBars))
  const [limit, setLimit] = useState(String(offer.monthlyLimit))
  const priceBars = Number(price)
  const monthlyLimit = Number(limit)
  const priceOk = Number.isInteger(priceBars) && priceBars >= 1
  const limitOk = Number.isInteger(monthlyLimit) && monthlyLimit >= 1 && monthlyLimit <= 31
  const premium = priceOk ? premiumPercent({ priceBars, faceValueGhs: offer.faceValueGhs }, storeRate()) : null

  return <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
    <DialogContent>
      <DialogTitle>Edit {offer.name}</DialogTitle>
      <DialogDescription>Worth {ghs(offer.faceValueGhs)}. New prices apply to requests made from now on; requests already waiting keep the gold they hold.</DialogDescription>
      <form className="flex flex-col gap-4" onSubmit={(event) => { event.preventDefault(); if (priceOk && limitOk) update.mutate({ id: offer.id, update: { priceBars, monthlyLimit } }, { onSuccess: onClose }) }}>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Price in gold bars
          <Input type="number" inputMode="numeric" min={1} step={1} value={price} onChange={(event) => setPrice(event.target.value)} aria-invalid={!priceOk} aria-describedby="offer-price-hint" className="h-10 font-normal" />
          <span id="offer-price-hint" className={cn("text-xs font-normal", priceOk ? "text-muted-foreground" : "text-destructive")}>
            {!priceOk ? "Use a whole number of bars, 1 or more." : `≈ ${ghs(Math.round((priceBars / storeRate()) * 100) / 100)} of gold at the store rate · ${premium === 0 ? "same as" : `${Math.abs(premium ?? 0)}% ${(premium ?? 0) > 0 ? "above" : "below"}`} the face value`}
          </span>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Times one person can redeem it a month
          <Input type="number" inputMode="numeric" min={1} max={31} step={1} value={limit} onChange={(event) => setLimit(event.target.value)} aria-invalid={!limitOk} className="h-10 font-normal" />
          {!limitOk && <span className="text-xs font-normal text-destructive">Use a whole number from 1 to 31.</span>}
        </label>
        {update.isError && <p role="alert" className="text-sm text-destructive">{errorText(update.error, "That didn't save.")}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <DialogClose asChild><Button type="button" variant="ghost" className="h-10 rounded-full px-4">Cancel</Button></DialogClose>
          <Button type="submit" className="h-10 rounded-full bg-[image:var(--gradient-purple)] px-4 text-white hover:opacity-90" disabled={!priceOk || !limitOk || update.isPending}>
            {update.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}Save
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
}
