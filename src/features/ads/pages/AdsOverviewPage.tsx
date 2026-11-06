import { useCallback, useState } from "react"
import { Link } from "react-router-dom"
import { ClipboardList, Flag, Megaphone, Pause, Play, type LucideIcon } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { APP_ROUTES } from "@/routes/paths"
import { useAds, useAdsAccess, useListParams, useReportedAds, useSearchInput } from "../hooks"
import { ADS_PERMISSIONS, adStatusLabels, adStatuses, adTypeLabels, adTypes, type AdStatus, type AdType } from "../types"
import { adsErrorMessage } from "../lib/format"
import { AdRow } from "../components/AdRow"
import { AdDetailSheet } from "../components/AdDetailSheet"
import { EmptyState, ErrorState, FilterChips, Intro, NoAccess, RowsSkeleton, SearchBox, focusRing, ink, muted, surface } from "../components/AdsBits"

const PAGE_SIZE = 20
const defaults = { status: "all", type: "all", q: "" }
const isStatus = (value: string): value is AdStatus => (adStatuses as readonly string[]).includes(value)
const isType = (value: string): value is AdType => (adTypes as readonly string[]).includes(value)

/** Ads Management: every ad, by stage, with what needs a decision first. */
export function AdsOverviewPage() {
  const access = useAdsAccess()
  const canRead = access.can(ADS_PERMISSIONS.read)
  const { values, page, update } = useListParams(defaults)
  const commitSearch = useCallback((q: string) => update({ q }), [update])
  const [search, setSearch] = useSearchInput(values.q, commitSearch)
  const [openId, setOpenId] = useState<string | null>(null)
  const status = isStatus(values.status) ? values.status : undefined
  const type = isType(values.type) ? values.type : undefined
  const ads = useAds({ status, type, search: values.q || undefined, page, limit: PAGE_SIZE }, canRead)
  // Every stage's count, whatever is filtered below.
  const all = useAds({ page: 1, limit: 1 }, canRead)
  const reported = useReportedAds({ page: 1, limit: 1 }, canRead)
  const counts = all.data?.counts ?? {}
  const openAd = ads.data?.items.find((ad) => ad.id === openId) ?? null
  const filtered = Boolean(values.q || status || type)

  if (access.loading) return <div className="px-4 sm:px-6"><RowsSkeleton label="Loading" /></div>
  if (!canRead) return <NoAccess permission={ADS_PERMISSIONS.read} what="ads" />

  return <div className="flex min-w-0 flex-col gap-4 px-4 pb-10 sm:px-6">
    <Intro icon={Megaphone} title="Ads Management">
      <p>Ads are paid in gold bars only: the budget is held when an ad is made, each view is charged at its price per 1,000, and the rest goes back when it ends.
        A boost of a post from an account in good standing starts at once; every other ad waits in Ad Requests. Three reports pause a running ad until it is decided.</p>
      <p className="mt-1 text-b4">Approving, refusing, pausing and stopping change an ad's stage; the gold moves within a minute.</p>
    </Intro>

    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StageTile icon={ClipboardList} tone="warning" label="Waiting for review" value={counts.PENDING_REVIEW ?? 0} to={APP_ROUTES.adRequests} />
      <StageTile icon={Flag} tone="danger" label="Reported" value={reported.data?.total ?? 0} to={APP_ROUTES.reportedAds} />
      <StageTile icon={Play} tone="success" label="Running" value={counts.ACTIVE ?? 0} onClick={() => update({ ...values, status: "ACTIVE" })} />
      <StageTile icon={Pause} tone="neutral" label="Paused" value={counts.PAUSED ?? 0} onClick={() => update({ ...values, status: "PAUSED" })} />
    </div>

    <div className={cn(surface, "flex flex-col gap-3 p-4")}>
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBox value={search} onChange={setSearch} label="Search by ad name, username or email" className="sm:flex-1" />
        <Select value={values.type} onValueChange={(next) => update({ ...values, type: next })}>
          <SelectTrigger aria-label="Ad format" className="h-11 w-full cursor-pointer rounded-full border-grey-200 bg-grey-50 text-b3 dark:border-border dark:bg-background sm:w-[200px] md:text-b2"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All formats</SelectItem>
            {adTypes.map((value) => <SelectItem key={value} value={value}>{adTypeLabels[value]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <FilterChips label="Ad stage" value={status ?? "all"} onChange={(next) => update({ ...values, status: next })}
        options={[
          { value: "all", label: "All ads", count: Object.values(counts).reduce((sum, count) => sum + count, 0) },
          ...adStatuses.map((value) => ({ value, label: adStatusLabels[value], count: counts[value] ?? 0 })),
        ]} />
    </div>

    <div className={cn(surface, "overflow-hidden")}>
      {ads.isPending && <RowsSkeleton label="Loading ads" />}
      {ads.isError && <ErrorState message={adsErrorMessage(ads.error, "Could not load ads.")} onRetry={() => void ads.refetch()} />}
      {ads.data && (ads.data.items.length === 0
        ? <EmptyState icon={Megaphone} title={filtered ? "No ads match these filters" : "No ads yet"}>{filtered ? "Try another stage, format or search." : "Ads people make in the app appear here."}</EmptyState>
        : <div className={cn("transition-opacity", ads.isPlaceholderData && "opacity-60")} aria-busy={ads.isPlaceholderData}>
          <ul aria-label="Ads" className="divide-y divide-grey-100 dark:divide-border">
            {ads.data.items.map((ad) => <AdRow key={ad.id} ad={ad} onOpen={() => setOpenId(ad.id)} />)}
          </ul>
          <Pagination page={page} limit={PAGE_SIZE} total={ads.data.total} noun="ads" onPageChange={(next) => update({ ...values, page: next })} />
        </div>)}
    </div>

    <Sheet open={Boolean(openAd)} onOpenChange={(open) => { if (!open) setOpenId(null) }}>
      {openAd && <AdDetailSheet summary={openAd} onDone={() => setOpenId(null)} />}
    </Sheet>
  </div>
}

const tones = {
  warning: "bg-warning-500/10 text-warning-700 dark:text-warning-300",
  danger: "bg-destructive/10 text-destructive",
  success: "bg-success-500/10 text-success-700 dark:text-success-300",
  neutral: "bg-grey-100 text-grey-600 dark:bg-muted dark:text-muted-foreground",
} as const

function StageTile({ icon: Icon, tone, label, value, to, onClick }: { icon: LucideIcon; tone: keyof typeof tones; label: string; value: number; to?: string; onClick?: () => void }) {
  const body = <>
    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tones[tone])}><Icon className="size-5" aria-hidden="true" /></span>
    <span className="min-w-0">
      <span className={cn("block text-h6 font-semibold tabular-nums", ink)}>{value.toLocaleString()}</span>
      <span className={cn("block truncate text-b4", muted)}>{label}</span>
    </span>
  </>
  const className = cn(surface, "flex min-w-0 cursor-pointer items-center gap-3 p-4 text-left transition-shadow hover:shadow-adbox-medium", focusRing)
  return to ? <Link to={to} className={className}>{body}</Link> : <button type="button" onClick={onClick} className={className}>{body}</button>
}
