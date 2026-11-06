import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { format } from "date-fns"
import { Search, WalletCards, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { cn } from "@/lib/utils"
import { EmptyState, ErrorState, NoAccess, RowsSkeleton, ink, muted, pill, surface } from "../components/Surface"
import { financeErrorMessage } from "../lib/errors"
import { useFinanceAccess, useGoldPurchases } from "../hooks"
import { bars } from "../lib/gold-settings"
import { PAYMENTS_PERMISSION, purchaseStatuses, type GoldPurchase, type PurchaseStatus } from "../types"

const PAGE_SIZE = 25

const statusLabels: Record<PurchaseStatus, string> = { PENDING: "Waiting", PAID: "Paid", FAILED: "Failed", CANCELLED: "Cancelled" }
const statusTones: Record<PurchaseStatus, string> = {
  PENDING: "bg-warning-500/10 text-warning-700 dark:text-warning-300",
  PAID: "bg-success-500/10 text-success-700 dark:text-success-300",
  FAILED: "bg-destructive/10 text-destructive",
  CANCELLED: "bg-grey-100 text-grey-600 dark:bg-muted dark:text-muted-foreground",
}
const isStatus = (value: string | null): value is PurchaseStatus => (purchaseStatuses as readonly string[]).includes(value ?? "")
const cedis = (value: number) => `GHS ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/**
 * Financials › Advertisers Payment: gold bought through Paystack. Ads are
 * paid in gold bars only, so this is where the money comes in; what each ad
 * held, charged and returned is on its page in Ads Management.
 */
export function AdvertisersPaymentPage() {
  const access = useFinanceAccess()
  const canRead = access.can(PAYMENTS_PERMISSION)
  const [params, setParams] = useSearchParams()
  const status = isStatus(params.get("status")) ? (params.get("status") as PurchaseStatus) : undefined
  const committed = params.get("q") ?? ""
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1)
  const [search, setSearch] = useState(committed)
  const set = (next: Record<string, string | undefined>) => setParams((current) => {
    const updated = new URLSearchParams(current)
    for (const [key, value] of Object.entries(next)) { if (value) updated.set(key, value); else updated.delete(key) }
    if (!("page" in next)) updated.delete("page")
    return updated
  }, { replace: true })
  useEffect(() => {
    const value = search.trim()
    if (value === committed) return
    const timer = setTimeout(() => set({ q: value || undefined }), 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])
  const purchases = useGoldPurchases({ status, search: committed || undefined, page, limit: PAGE_SIZE }, canRead)

  if (access.loading) return <div className="px-4 sm:px-6"><RowsSkeleton label="Loading" /></div>
  if (!canRead) return <NoAccess permission={PAYMENTS_PERMISSION} what="payments" />

  const paid = purchases.data?.paid
  const counts = purchases.data?.counts ?? {}
  return <div className="flex min-w-0 flex-col gap-4 px-4 pb-10 sm:px-6">
    <section aria-label="About advertisers' payments" className={cn(surface, "flex gap-3 p-5")}>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-success-500/10 text-success-700 dark:text-success-300"><WalletCards className="size-5" aria-hidden="true" /></span>
      <div className="min-w-0">
        <h2 className={cn("font-heading text-b1 font-semibold", ink)}>Advertisers Payment</h2>
        <p className={cn("text-b3", muted)}>Gold bought through Paystack, newest first. Ads are paid in gold bars only, so this is the money behind them: a bundle, or exactly the bars an ad needed at the exchange rate. Gold is credited only once Paystack confirms the payment.</p>
      </div>
    </section>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Total label="Paid in" value={paid ? cedis(paid.totalGhs) : "—"} />
      <Total label="Gold bars sold" value={paid ? bars(paid.totalBars) : "—"} />
      <Total label="Paid purchases" value={paid ? bars(paid.count) : "—"} />
    </div>

    <div className={cn(surface, "flex flex-col gap-3 p-4")}>
      <div className="relative min-w-0">
        <label htmlFor="purchase-search" className="sr-only">Search by buyer or Paystack reference</label>
        <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-grey-400 dark:text-muted-foreground" />
        <Input id="purchase-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by buyer or Paystack reference" autoComplete="off" maxLength={200}
          className="h-11 w-full rounded-full border-grey-200 bg-grey-50 pl-10 pr-10 text-b3 dark:border-border dark:bg-background md:text-b2 [&::-webkit-search-cancel-button]:hidden" />
        {search && <button type="button" aria-label="Clear search" onClick={() => setSearch("")} className="absolute right-0 top-0 flex h-11 w-10 cursor-pointer items-center justify-center text-grey-400"><X className="size-4" aria-hidden="true" /></button>}
      </div>
      <div role="group" aria-label="Payment status" className="-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 py-1">
        {([undefined, ...purchaseStatuses] as Array<PurchaseStatus | undefined>).map((value) => {
          const active = status === value
          const count = value ? counts[value] ?? 0 : Object.values(counts).reduce((sum, n) => sum + n, 0)
          return <button key={value ?? "all"} type="button" aria-pressed={active} onClick={() => set({ status: value })}
            className={cn("flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-b3 font-semibold",
              active ? "border-transparent bg-purple text-white" : "border-grey-200 bg-white text-grey-600 dark:border-border dark:bg-card dark:text-muted-foreground")}>
            {value ? statusLabels[value] : "All"}<span className={cn("rounded-full px-1.5 py-0.5 text-[11px] leading-none tabular-nums", active ? "bg-white/20" : "bg-grey-100 dark:bg-muted")}>{count.toLocaleString()}</span>
          </button>
        })}
      </div>
    </div>

    <div className={cn(surface, "overflow-hidden")}>
      {purchases.isPending && <RowsSkeleton label="Loading payments" />}
      {purchases.isError && <ErrorState message={financeErrorMessage(purchases.error, "Could not load the payments.")} onRetry={() => void purchases.refetch()} />}
      {purchases.data && (purchases.data.items.length === 0
        ? <EmptyState icon={WalletCards} title={status || committed ? "No payments match" : "No payments yet"}>{status || committed ? "Try another status or search." : "Gold bought in the app appears here."}</EmptyState>
        : <div className={cn("transition-opacity", purchases.isPlaceholderData && "opacity-60")}>
          <ul aria-label="Payments" className="divide-y divide-grey-100 dark:divide-border">
            {purchases.data.items.map((purchase) => <PurchaseRow key={purchase.id} purchase={purchase} />)}
          </ul>
          <Pagination page={page} limit={PAGE_SIZE} total={purchases.data.total} noun="payments" onPageChange={(next) => set({ page: next > 1 ? String(next) : undefined })} />
        </div>)}
    </div>
  </div>
}

function Total({ label, value }: { label: string; value: string }) {
  return <div className={cn(surface, "p-4")}>
    <p className={cn("text-b4", muted)}>{label}</p>
    <p className={cn("mt-1 text-h6 font-semibold tabular-nums", ink)}>{value}</p>
  </div>
}

function PurchaseRow({ purchase }: { purchase: GoldPurchase }) {
  const known = isStatus(purchase.status)
  const buyer = purchase.buyer.name ?? (purchase.buyer.username ? `@${purchase.buyer.username}` : "Unknown buyer")
  return <li className="flex min-w-0 flex-wrap items-start gap-x-4 gap-y-1 px-4 py-4 sm:px-6">
    <div className="min-w-0 flex-1">
      <p className={cn("flex min-w-0 flex-wrap items-center gap-2 text-b2 font-semibold", ink)}>
        <span className="truncate">{buyer}</span>
        <span className={cn(pill, known ? statusTones[purchase.status as PurchaseStatus] : statusTones.CANCELLED)}>{known ? statusLabels[purchase.status as PurchaseStatus] : purchase.status}</span>
      </p>
      <p className={cn("mt-0.5 truncate text-b3", muted)}>
        {purchase.bundleId ? purchase.bundleName ?? purchase.bundleId : "Exact top-up"} · {purchase.channel === "MOMO" ? "Mobile Money" : purchase.channel === "CARD" ? "Card" : purchase.channel ?? "Paystack"}
        {purchase.providerReference && <> · <span className="font-mono text-b4">{purchase.providerReference}</span></>}
      </p>
      {purchase.failureReason && <p className="mt-0.5 text-b4 text-destructive">{purchase.failureReason}</p>}
    </div>
    <div className="shrink-0 text-right">
      <p className={cn("text-b2 font-semibold tabular-nums", ink)}>{cedis(purchase.priceGhs)}</p>
      <p className={cn("text-b4 tabular-nums", muted)}>{bars(purchase.totalBars)} bars · {format(new Date(purchase.paidAt ?? purchase.createdAt), "MMM d, h:mm a")}</p>
    </div>
  </li>
}
