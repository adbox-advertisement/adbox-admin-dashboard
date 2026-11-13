// How sponsored posts reach Home (adbox-backend apps/api-gateway/src/ads, docs/ad-delivery.md;
// adbox-mobile-mvp lib/ui/home/sections/feed/mixed_feed_section.dart).

/** ad-delivery.constants.ts */
export const AD_DELIVERY = {
  /** AD_PACING_BURST: an ad may run this share of its day ahead of an even spread. */
  pacingBurst: 0.1,
  /** AD_CANDIDATE_POOL: running campaigns weighed per request. */
  candidatePool: 200,
  defaultLimit: 2,
  maxLimit: 5,
} as const

/** The app: how many ads one load asks for, and where they go among the posts (0-based slot). */
export const APP_AD_PLACEMENT = { requested: 3, firstSlot: 3, spacing: 8 } as const

/** Views `bars` buy at `cpmBars` per 1,000 (libs/gold-settings `viewsForBars`). */
export const viewsForBars = (bars: number, cpmBars: number) => (cpmBars > 0 ? Math.floor((bars * 1000) / cpmBars) : 0)

/**
 * Views an ad may have had by a point in its day (0 at midnight Accra, 1 at the next): an even
 * spread plus the head start, never more than the day's views (`pacedImpressions`).
 */
export function pacedViews(dailyViews: number, dayElapsed: number, burst: number = AD_DELIVERY.pacingBurst) {
  return Math.min(dailyViews, Math.ceil(dailyViews * (Math.min(1, Math.max(0, dayElapsed)) + burst)))
}

/**
 * The places (1-based, in Home's list) the app gives `ads` ads among `posts` posts: the first at
 * place 4, then one after every 8 more posts, and only where posts surround a later one.
 */
export function adPlaces(ads: number, posts: number) {
  const places: number[] = []
  let length = posts
  for (let index = 0; index < ads; index++) {
    const slot = APP_AD_PLACEMENT.firstSlot + index * (APP_AD_PLACEMENT.spacing + 1)
    if (index > 0 && slot > length) break
    places.push(Math.min(slot, length) + 1)
    length += 1
  }
  return places
}
