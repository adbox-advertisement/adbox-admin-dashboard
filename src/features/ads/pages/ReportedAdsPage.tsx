import { useCallback, useState } from "react"
import { Flag } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import { Sheet } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAdsAccess, useListParams, useReportedAds, useSearchInput } from "../hooks"
import { ADS_PERMISSIONS, adReasonLabels, type ReportedAd } from "../types"
import { adsErrorMessage, formatRelative } from "../lib/format"
import { AdRow } from "../components/AdRow"
import { AdDetailSheet } from "../components/AdDetailSheet"
import { EmptyState, ErrorState, Intro, NoAccess, Pill, RowsSkeleton, SearchBox, muted, surface } from "../components/AdsBits"

const PAGE_SIZE = 20
const defaults = { q: "" }

function Reasons({ ad }: { ad: ReportedAd }) {
  return <div className={cn("mt-2 flex flex-wrap items-center gap-1.5 text-b4", muted)}>
    {ad.reasons.map(({ reason, count }) => <Pill key={reason ?? "other"} tone="danger">{reason ? adReasonLabels[reason] : "Other"} · {count}</Pill>)}
    {ad.lastReportedAt && <span>Last reported {formatRelative(ad.lastReportedAt)}</span>}
    {ad.status === "PAUSED" && ad.pauseReason === "REPORTS" && <Pill tone="warning">Paused by reports</Pill>}
  </div>
}

/** Ads Management › Reported Ads: ads people reported, waiting for a decision. */
export function ReportedAdsPage() {
  const access = useAdsAccess()
  const canRead = access.can(ADS_PERMISSIONS.read)
  const canManage = access.can(ADS_PERMISSIONS.manage)
  const { values, page, update } = useListParams(defaults)
  const commitSearch = useCallback((q: string) => update({ q }), [update])
  const [search, setSearch] = useSearchInput(values.q, commitSearch)
  const [openId, setOpenId] = useState<string | null>(null)
  const ads = useReportedAds({ search: values.q || undefined, page, limit: PAGE_SIZE }, canRead)
  const openAd = ads.data?.items.find((ad) => ad.id === openId) ?? null

  if (access.loading) return <div className="px-4 sm:px-6"><RowsSkeleton label="Loading" /></div>
  if (!canRead) return <NoAccess permission={ADS_PERMISSIONS.read} what="reported ads" />

  return <div className="flex min-w-0 flex-col gap-4 px-4 pb-10 sm:px-6">
    <Intro icon={Flag} title="Reported Ads">
      <p>Ads people reported, most recent first. Reporting hides an ad from whoever reported it; three different people pause it for everyone until it is decided here.</p>
      <p className="mt-1 text-b4">Dismiss: a paused ad runs again. Uphold: the ad is stopped, its views so far are charged, and the advertiser's boosts are reviewed for 30 days.</p>
      {canRead && !canManage && <p className="mt-1 text-b4">You can look; deciding needs {ADS_PERMISSIONS.manage}.</p>}
    </Intro>

    <div className={cn(surface, "p-4")}>
      <SearchBox value={search} onChange={setSearch} label="Search by ad name, username or email" />
    </div>

    <div className={cn(surface, "overflow-hidden")}>
      {ads.isPending && <RowsSkeleton label="Loading reported ads" />}
      {ads.isError && <ErrorState message={adsErrorMessage(ads.error, "Could not load the reported ads.")} onRetry={() => void ads.refetch()} />}
      {ads.data && (ads.data.items.length === 0
        ? <EmptyState icon={Flag} title={values.q ? "No reported ads match" : "No reports waiting"}>{values.q ? "Try another search." : "When people report an ad from its ⋯ menu, it appears here."}</EmptyState>
        : <div className={cn("transition-opacity", ads.isPlaceholderData && "opacity-60")} aria-busy={ads.isPlaceholderData}>
          <ul aria-label="Reported ads" className="divide-y divide-grey-100 dark:divide-border">
            {ads.data.items.map((ad) => <AdRow key={ad.id} ad={ad} onOpen={() => setOpenId(ad.id)} extra={<Reasons ad={ad} />} />)}
          </ul>
          <Pagination page={page} limit={PAGE_SIZE} total={ads.data.total} noun="reported ads" onPageChange={(next) => update({ ...values, page: next })} />
        </div>)}
    </div>

    <Sheet open={Boolean(openAd)} onOpenChange={(open) => { if (!open) setOpenId(null) }}>
      {openAd && <AdDetailSheet summary={openAd} onDone={() => setOpenId(null)} />}
    </Sheet>
  </div>
}
