import type { ReactNode } from "react"
import { Clapperboard, Flag, GalleryHorizontal, Image as ImageIcon, Megaphone, PartyPopper, Rocket, SquareUser, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { adTypeLabels, type AdSummary, type AdType } from "../types"
import { adCover, adTitle, advertiserKind, advertiserName, bars, formatRelative } from "../lib/format"
import { AdStatusPill, Pill, focusRing, ink, muted } from "./AdsBits"

const typeIcons: Record<AdType, LucideIcon> = {
  BOOST_POST: Rocket, IMAGE: ImageIcon, VIDEO: Clapperboard, CAROUSEL: GalleryHorizontal, PROFILE: SquareUser, EVENT: PartyPopper, SURVEY: Megaphone,
}

export function AdThumb({ ad, className }: { ad: AdSummary; className?: string }) {
  const cover = adCover(ad)
  const Icon = ad.type ? typeIcons[ad.type] : Megaphone
  return <span className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[image:var(--gradient-dark-blue)] text-white", className)}>
    {cover ? <img src={cover} alt="" loading="lazy" className="size-full object-cover" /> : <Icon className="size-5 opacity-85" aria-hidden="true" />}
  </span>
}

/**
 * One ad in a list: what it shows, who runs it, its stage, its gold and its
 * views. The whole row opens the ad; [extra] adds a line under it.
 */
export function AdRow({ ad, onOpen, extra }: { ad: AdSummary; onOpen: () => void; extra?: ReactNode }) {
  return <li className="relative flex min-w-0 items-start gap-3 px-4 py-4 transition-colors hover:bg-grey-50 dark:hover:bg-muted/40 sm:px-6">
    <AdThumb ad={ad} className="size-12" />
    <div className="min-w-0 flex-1">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <button type="button" onClick={onOpen} className={cn("min-w-0 max-w-full cursor-pointer truncate text-left text-b2 font-semibold after:absolute after:inset-0 hover:text-purple", ink, focusRing)}>
          {adTitle(ad)}
        </button>
        <AdStatusPill status={ad.status} />
        {ad.openReports > 0 && <Pill tone="danger"><Flag className="size-3" aria-hidden="true" />{ad.openReports} {ad.openReports === 1 ? "report" : "reports"}</Pill>}
      </div>
      <p className={cn("mt-0.5 truncate text-b3", muted)}>
        {ad.type ? adTypeLabels[ad.type] : "Ad"} · {advertiserName(ad.advertiser)} · {advertiserKind[ad.advertiser.kind]} · {formatRelative(ad.createdAt)}
      </p>
      {extra}
    </div>
    <div className="hidden shrink-0 text-right sm:block">
      <p className={cn("text-b3 font-semibold tabular-nums", ink)}>{bars(ad.chargedBars)} / {bars(ad.budgetBars)}</p>
      <p className={cn("text-b4 tabular-nums", muted)}>bars · {bars(ad.stats.views)} views</p>
    </div>
  </li>
}
