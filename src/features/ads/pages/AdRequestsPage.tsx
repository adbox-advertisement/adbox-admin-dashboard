import { useCallback, useState } from "react"
import { differenceInCalendarDays } from "date-fns"
import { ClipboardList } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import { Sheet } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAds, useAdsAccess, useListParams, useSearchInput } from "../hooks"
import { ADS_PERMISSIONS, type AdSummary } from "../types"
import { adsErrorMessage, audienceLabel, bars, formatRelative, isPlaceholderEmail } from "../lib/format"
import { AdRow } from "../components/AdRow"
import { AdDetailSheet } from "../components/AdDetailSheet"
import { EmptyState, ErrorState, Intro, NoAccess, Pill, RowsSkeleton, SearchBox, muted, surface } from "../components/AdsBits"

const PAGE_SIZE = 20
const defaults = { q: "" }

/** What a reviewer weighs at a glance: why it is here and who made it. */
function ReviewFacts({ ad }: { ad: AdSummary }) {
  const days = differenceInCalendarDays(new Date(), new Date(ad.advertiser.joinedAt))
  const person = ad.advertiser.kind === "PERSON"
  return <div className={cn("mt-2 flex flex-wrap items-center gap-1.5 text-b4", muted)}>
    <Pill tone="warning">Waiting {formatRelative(ad.createdAt)?.replace(" ago", "")}</Pill>
    <span>{bars(ad.dailyBudgetBars)} bars × {ad.durationDays} days · {audienceLabel(ad.audience)}{ad.institutionIds.length + ad.campusIds.length > 0 ? " · chosen places" : ""}</span>
    {person && days < 7 && <Pill>Account {days} {days === 1 ? "day" : "days"} old</Pill>}
    {person && !isPlaceholderEmail(ad.advertiser.email) && !ad.advertiser.emailVerified && <Pill>Email not verified</Pill>}
    {!ad.advertiser.isActive && <Pill tone="danger">Account switched off</Pill>}
  </div>
}

/** Ads Management › Ad Requests: ads waiting for AdBox, oldest first. */
export function AdRequestsPage() {
  const access = useAdsAccess()
  const canRead = access.can(ADS_PERMISSIONS.read)
  const canReview = access.can(ADS_PERMISSIONS.review)
  const { values, page, update } = useListParams(defaults)
  const commitSearch = useCallback((q: string) => update({ q }), [update])
  const [search, setSearch] = useSearchInput(values.q, commitSearch)
  const [openId, setOpenId] = useState<string | null>(null)
  const ads = useAds({ status: "PENDING_REVIEW", search: values.q || undefined, page, limit: PAGE_SIZE }, canRead)
  const openAd = ads.data?.items.find((ad) => ad.id === openId) ?? null

  if (access.loading) return <div className="px-4 sm:px-6"><RowsSkeleton label="Loading" /></div>
  if (!canRead) return <NoAccess permission={ADS_PERMISSIONS.read} what="ad requests" />

  return <div className="flex min-w-0 flex-col gap-4 px-4 pb-10 sm:px-6">
    <Intro icon={ClipboardList} title="Ad Requests">
      <p>Ads waiting for AdBox, oldest first. An ad is here when it adds words or pictures of its own, or its account is new, unverified or was reported recently.
        Its bars are held meanwhile and nothing is charged. Approved, it starts at once and runs its days; refused, every bar goes back and the advertiser reads why.</p>
      <p className="mt-1 text-b4">Refuse anything for betting, alcohol, loans or "quick money", forex or crypto schemes, or paid essays and exam help. Political and dating ads may run after review.</p>
      {canRead && !canReview && <p className="mt-1 text-b4">You can look; deciding needs {ADS_PERMISSIONS.review}.</p>}
    </Intro>

    <div className={cn(surface, "p-4")}>
      <SearchBox value={search} onChange={setSearch} label="Search by ad name, username or email" />
    </div>

    <div className={cn(surface, "overflow-hidden")}>
      {ads.isPending && <RowsSkeleton label="Loading ad requests" />}
      {ads.isError && <ErrorState message={adsErrorMessage(ads.error, "Could not load the ad requests.")} onRetry={() => void ads.refetch()} />}
      {ads.data && (ads.data.items.length === 0
        ? <EmptyState icon={ClipboardList} title={values.q ? "No requests match" : "Nothing waiting"}>{values.q ? "Try another search." : "Boosts from accounts in good standing start without review; anything else lands here."}</EmptyState>
        : <div className={cn("transition-opacity", ads.isPlaceholderData && "opacity-60")} aria-busy={ads.isPlaceholderData}>
          <ul aria-label="Ad requests" className="divide-y divide-grey-100 dark:divide-border">
            {ads.data.items.map((ad) => <AdRow key={ad.id} ad={ad} onOpen={() => setOpenId(ad.id)} extra={<ReviewFacts ad={ad} />} />)}
          </ul>
          <Pagination page={page} limit={PAGE_SIZE} total={ads.data.total} noun="requests" onPageChange={(next) => update({ ...values, page: next })} />
        </div>)}
    </div>

    <Sheet open={Boolean(openAd)} onOpenChange={(open) => { if (!open) setOpenId(null) }}>
      {openAd && <AdDetailSheet summary={openAd} onDone={() => setOpenId(null)} />}
    </Sheet>
  </div>
}
