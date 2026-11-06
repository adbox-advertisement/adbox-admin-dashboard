import { useCallback, useState } from "react"
import { CalendarClock, CalendarDays, Clapperboard, ExternalLink, GalleryHorizontal, Image as ImageIcon, Info, Megaphone, PartyPopper, Rocket, SquareUser, type LucideIcon } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { cn } from "../lib/cn"
import { useContentScope, useListParams, useSearchInput, useUserAds } from "../hooks"
import { contentErrorMessage } from "../lib/errors"
import { campaignProgress, formatDate, formatRelative } from "../lib/format"
import type { pillTones } from "../lib/styles"
import { adStatusLabels, adTypeLabels, humanize, type AdStatus, type AdType, type UserAd } from "../types"
import { adStatuses, adTypes } from "../validation"
import { EmptyState, ErrorState, Fact, FilterChips, Pill, SearchBox, Toolbar, UploaderChip, focusRing, ink, muted, skeleton, surface } from "../components/ContentBits"

const PAGE_SIZE = 18
const defaults = { status: "all", type: "all", q: "" }
const grid = "grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 xl:grid-cols-3"

const statusTone: Record<AdStatus, keyof typeof pillTones> = {
  DRAFT: "neutral", PENDING_REVIEW: "warning", ACTIVE: "success", PAUSED: "warning", COMPLETED: "blue", REJECTED: "danger", CANCELLED: "neutral",
}
const typeIcons: Record<AdType, LucideIcon> = {
  BOOST_POST: Rocket, IMAGE: ImageIcon, VIDEO: Clapperboard, CAROUSEL: GalleryHorizontal, PROFILE: SquareUser, EVENT: PartyPopper, SURVEY: Megaphone,
}
// The order people scan for: what's running, what needs a decision, then the rest.
const statusOrder: AdStatus[] = ["ACTIVE", "PENDING_REVIEW", "PAUSED", "COMPLETED", "REJECTED", "CANCELLED", "DRAFT"]
const isStatus = (value: string): value is AdStatus => (adStatuses as readonly string[]).includes(value)
const isType = (value: string): value is AdType => (adTypes as readonly string[]).includes(value)

export function AdStatusPill({ status, className }: { status: AdStatus | null; className?: string }) {
  return status ? <Pill tone={statusTone[status]} className={className}>{adStatusLabels[status]}</Pill> : <Pill className={className}>Unknown</Pill>
}

export function AdsPage() {
  const { userId, scopeTo } = useContentScope()
  const { values, page, update } = useListParams(defaults)
  const commitSearch = useCallback((q: string) => update({ q }), [update])
  const [search, setSearch] = useSearchInput(values.q, commitSearch)
  const [openId, setOpenId] = useState<string | null>(null)
  const status = isStatus(values.status) ? values.status : undefined
  const type = isType(values.type) ? values.type : undefined
  const ads = useUserAds({ userId, search: values.q || undefined, status, type, page, limit: PAGE_SIZE })
  const openAd = ads.data?.items.find((ad) => ad.id === openId) ?? null
  const filtered = Boolean(values.q || status || type)

  return <div className="flex min-w-0 flex-col gap-4 px-4 sm:px-6">
    <Toolbar>
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBox value={search} onChange={setSearch} label="Search ads by name or uploader" className="sm:flex-1" />
        <Select value={values.type} onValueChange={(next) => update({ ...values, type: next })}>
          <SelectTrigger aria-label="Ad format" className="h-11 w-full cursor-pointer rounded-full border-grey-200 bg-grey-50 text-b3 dark:border-border dark:bg-background sm:w-[190px] md:text-b2"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All formats</SelectItem>
            {adTypes.map((value) => <SelectItem key={value} value={value}>{adTypeLabels[value]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <FilterChips label="Ad status" value={status ?? "all"} onChange={(next) => update({ ...values, status: next })}
        options={[{ value: "all", label: "All ads" }, ...statusOrder.map((value) => ({ value, label: adStatusLabels[value] }))]} />
    </Toolbar>

    {ads.isPending && <AdsSkeleton />}
    {ads.isError && <div className={surface}><ErrorState message={contentErrorMessage(ads.error, "Could not load ads.")} onRetry={() => void ads.refetch()} /></div>}
    {ads.data && (ads.data.items.length === 0
      ? <div className={surface}><EmptyState icon={Megaphone} title={filtered ? "No ads match these filters" : "No ads yet"}>{filtered ? "Try another status, format or search." : "Ads people create in the app appear here."}</EmptyState></div>
      : <div className={cn("flex flex-col gap-4 transition-opacity", ads.isPlaceholderData && "opacity-60")} aria-busy={ads.isPlaceholderData}>
        <ul aria-label="Ads" className={grid}>
          {ads.data.items.map((ad) => <AdCard key={ad.id} ad={ad} onOpen={() => setOpenId(ad.id)} uploaderTo={userId ? undefined : scopeTo(ad.user.id)} />)}
        </ul>
        <div className={cn(surface, "overflow-hidden [&>nav]:border-t-0")}>
          <Pagination page={page} limit={PAGE_SIZE} total={ads.data.total} noun="ads" onPageChange={(next) => { update({ ...values, page: next }); window.scrollTo({ top: 0, behavior: "smooth" }) }} />
        </div>
      </div>)}

    <Sheet open={Boolean(openAd)} onOpenChange={(open) => { if (!open) setOpenId(null) }}>
      {openAd && <AdSheet ad={openAd} uploaderTo={scopeTo(openAd.user.id)} />}
    </Sheet>
  </div>
}

function adCover(ad: UserAd) {
  return ad.content.coverImageUrl ?? ad.content.imageUrls?.[0] ?? null
}

function AdCover({ ad, className }: { ad: UserAd; className?: string }) {
  const cover = adCover(ad)
  const Icon = ad.type ? typeIcons[ad.type] : Megaphone
  return <div className={cn("relative overflow-hidden bg-[image:var(--gradient-dark-blue)]", className)}>
    {cover
      ? <img src={cover} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none" />
      : <div className="flex size-full flex-col justify-end gap-2 p-5 text-white">
        <Icon className="size-7 opacity-80" aria-hidden="true" />
        {ad.content.headline && <p className="line-clamp-2 text-b1 font-semibold leading-snug">{ad.content.headline}</p>}
      </div>}
  </div>
}

function AdCard({ ad, onOpen, uploaderTo }: { ad: UserAd; onOpen: () => void; uploaderTo?: string }) {
  const Icon = ad.type ? typeIcons[ad.type] : Megaphone
  return <li className={cn(surface, "group relative flex min-w-0 flex-col overflow-hidden transition-shadow hover:shadow-adbox-medium")}>
    <div className="relative">
      <AdCover ad={ad} className="aspect-[16/9]" />
      <span className="absolute left-3 top-3"><AdStatusPill status={ad.status} className="bg-white/95 dark:bg-card" /></span>
    </div>
    <div className="flex flex-1 flex-col gap-3 p-4">
      <div className="min-w-0">
        <button type="button" onClick={onOpen} className={cn("line-clamp-1 cursor-pointer text-left text-b1 font-semibold leading-snug after:absolute after:inset-0 hover:text-purple", ink, focusRing)}>{ad.name}</button>
        <p className={cn("mt-1 flex items-center gap-1.5 text-b3", muted)}><Icon className="size-3.5" aria-hidden="true" />{ad.type ? adTypeLabels[ad.type] : "Ad"} · {humanize(ad.goal)}</p>
      </div>
      <Schedule ad={ad} />
      <div className="relative z-10 mt-auto flex items-center justify-between gap-3 border-t border-grey-100 pt-3 dark:border-border">
        <UploaderChip user={ad.user} to={uploaderTo} size="xs" />
        <span className={cn("shrink-0 text-b3 font-semibold tabular-nums", ink)}>{ad.dailyBudgetBars.toLocaleString()} bars<span className={cn("font-normal", muted)}>/day</span></span>
      </div>
    </div>
  </li>
}

/** A running campaign shows how far through it is; any other shows its dates. */
function Schedule({ ad }: { ad: UserAd }) {
  const running = (ad.status === "ACTIVE" || ad.status === "PAUSED") && ad.startsAt && ad.endsAt
  if (!ad.startsAt || !ad.endsAt) return <p className={cn("flex items-center gap-1.5 text-b3", muted)}><CalendarDays className="size-3.5" aria-hidden="true" />{ad.status === "PENDING_REVIEW" ? "Starts when approved" : "Never ran"} · {ad.durationDays} days</p>
  if (!running) return <p className={cn("flex items-center gap-1.5 text-b3", muted)}><CalendarDays className="size-3.5" aria-hidden="true" />{formatDate(ad.startsAt, "MMM d")} – {formatDate(ad.endsAt, "MMM d, yyyy")} · {ad.durationDays} days</p>
  const progress = campaignProgress(ad.startsAt, ad.endsAt)
  const percent = Math.round(progress.share * 100)
  return <div>
    <div className="flex items-baseline justify-between gap-2 text-b3">
      <span className={cn("font-semibold", ink)}>{progress.day === 0 ? "Starts soon" : `Day ${progress.day} of ${progress.totalDays}`}</span>
      <span className={muted}>{progress.daysLeft > 0 ? `${progress.daysLeft} ${progress.daysLeft === 1 ? "day" : "days"} left` : "Ending"}</span>
    </div>
    <div role="progressbar" aria-label="Campaign progress" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-grey-100 dark:bg-muted">
      <div className={cn("h-full rounded-full", ad.status === "PAUSED" ? "bg-warning-500" : "bg-[image:var(--gradient-purple)]")} style={{ width: `${Math.max(percent, 2)}%` }} />
    </div>
  </div>
}

function AdSheet({ ad, uploaderTo }: { ad: UserAd; uploaderTo: string }) {
  const content = ad.content
  const images = content.imageUrls ?? []
  return <SheetContent closeLabel="Close ad details" className="w-[min(34rem,calc(100vw-1rem))] gap-0 overflow-y-auto p-0">
    <div className="relative">
      <AdCover ad={ad} className="aspect-[16/9]" />
      <span className="absolute left-4 top-4 flex gap-1.5"><AdStatusPill status={ad.status} className="bg-white/95 dark:bg-card" />{ad.type && <Pill tone="purple" className="bg-white/95 dark:bg-card">{adTypeLabels[ad.type]}</Pill>}</span>
    </div>
    <div className="flex flex-col gap-5 p-5 sm:p-6">
      <div>
        <SheetTitle className={cn("break-words font-heading text-h6 font-bold leading-snug", ink)}>{ad.name}</SheetTitle>
        <SheetDescription className={cn("mt-1 text-b3", muted)}>Created {formatDate(ad.createdAt, "MMM d, yyyy 'at' h:mm a")} · {formatRelative(ad.createdAt)}</SheetDescription>
      </div>

      {(content.headline || content.body) && <div className="rounded-2xl border border-grey-200 p-4 dark:border-border">
        <p className={cn("mb-1 text-b3 font-semibold uppercase tracking-wide", muted)}>Creative</p>
        {content.headline && <p className={cn("text-b1 font-semibold", ink)}>{content.headline}</p>}
        {content.body && <p className={cn("mt-1 whitespace-pre-line break-words text-sm leading-6", muted)}>{content.body}</p>}
      </div>}
      {images.length > 1 && <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((url) => <img key={url} src={url} alt="" loading="lazy" className="size-20 shrink-0 rounded-xl object-cover" />)}
      </div>}

      {(ad.status === "ACTIVE" || ad.status === "PAUSED") && <Schedule ad={ad} />}

      <div className="flex items-center justify-between gap-3 rounded-2xl bg-grey-50 p-3 dark:bg-background">
        <UploaderChip user={ad.user} to={uploaderTo} size="sm" />
        <span className={cn("truncate text-b3", muted)}>{ad.user.userProfile?.email}</span>
      </div>

      <dl className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
        <Fact label="Goal" value={humanize(ad.goal)} />
        <Fact label="Audience" value={humanize(ad.audience)} />
        <Fact label="Daily budget" value={`${ad.dailyBudgetBars.toLocaleString()} bars × ${ad.durationDays} days`} />
        <Fact label="Gold" value={`${ad.budgetBars.toLocaleString()} held · ${ad.chargedBars.toLocaleString()} charged${ad.returnedBars ? ` · ${ad.returnedBars.toLocaleString()} returned` : ""}`} />
        <Fact label="Price" value={`${ad.cpmBars.toLocaleString()} bars per 1,000 views`} />
        <Fact label="Runs" value={ad.startsAt && ad.endsAt ? `${formatDate(ad.startsAt)} – ${formatDate(ad.endsAt)}` : "Not started"} icon={<CalendarClock className="size-3.5" aria-hidden="true" />} />
        <Fact label="Cancelled" value={formatDate(ad.cancelledAt, "MMM d, yyyy 'at' h:mm a")} />
        <Fact label="Event starts" value={formatDate(content.eventStartsAt ?? null, "MMM d, yyyy 'at' h:mm a")} />
        <Fact label="Event location" value={content.eventLocation} />
        <Fact label="Promoted post" value={ad.resource ? ad.resource.title || `Untitled ${ad.resource.mediaType.toLowerCase()} post` : null} />
      </dl>

      {(content.destinationUrl || content.videoUrl) && <div className="flex flex-wrap gap-4">
        {content.destinationUrl && <ExternalAnchor href={content.destinationUrl}>Destination link</ExternalAnchor>}
        {content.videoUrl && <ExternalAnchor href={content.videoUrl}>Ad video</ExternalAnchor>}
      </div>}

      <p className={cn("flex items-start gap-2 rounded-2xl bg-blue/5 px-4 py-3 text-b3 leading-5", muted)}>
        <Info className="mt-0.5 size-4 shrink-0 text-blue dark:text-cyan" aria-hidden="true" />
        Ads are view-only here. Cancelling an ad requires refunding the advertiser's bars, which is not yet available to admins.
      </p>
    </div>
  </SheetContent>
}

function ExternalAnchor({ href, children }: { href: string; children: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-b3 font-semibold text-blue hover:underline dark:text-cyan">
    {children}<ExternalLink className="size-3.5" aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span>
  </a>
}

function AdsSkeleton() {
  return <ul role="status" aria-label="Loading ads" className={grid}>
    {Array.from({ length: 6 }, (_, index) => <li key={index} className={cn(surface, "overflow-hidden")}>
      <div className="aspect-[16/9] animate-pulse bg-grey-100 dark:bg-muted" />
      <div className="space-y-2.5 p-4"><span className={cn(skeleton, "block h-4 w-2/3")} /><span className={cn(skeleton, "block h-3 w-1/2")} /><span className={cn(skeleton, "block h-1.5 w-full")} /></div>
    </li>)}
  </ul>
}
