// The shuffled lists the app shows today: Home, Shorts and the videos under an opened video
// (adbox-backend apps/api-gateway/src/feed/shuffle-feed.service.ts). Every number here is written
// in code: changing one needs a backend (or, for APP_FEED, an app) release.

export const SHUFFLE = {
  /** SHUFFLE_HALF_LIFE_HOURS: a post's chance of being drawn halves for every this many hours. */
  halfLifeHours: 24,
  /** SHUFFLE_WEIGHT_FLOOR: no post's chance falls below this share of a brand-new post's. */
  weightFloor: 0.03,
  /** SPOTLIGHT_WEIGHT: a Spotlight author's posts are this many times as likely (never anonymous ones). */
  spotlightWeight: 2,
  /** SHUFFLE_POOL_CAP: a page is drawn from the newest this many unserved posts. */
  poolCap: 5000,
  /** SHUFFLE_SESSION_TTL_SECONDS, in hours: how long a session remembers what it served. */
  sessionTtlHours: 24,
  /** NEW_POSTS_COUNT_CAP: the most new posts counted for the dot on Home. */
  newPostsCountCap: 99,
} as const

/** FEED_DEFAULT_LIMIT and FEED_MAX_LIMIT (apps/api-gateway/src/resource/dto/feed-query.dto.ts). */
export const FEED_LIMITS = { defaultLimit: 20, maxLimit: 50 } as const

/** What makes a video a Short: portrait (width ÷ height ≤ 0.9) and no longer than 90 seconds. */
export const SHORTS = { maxAspectRatio: 0.9, maxSeconds: 90 } as const

/** The app's side (adbox-mobile-mvp): session length and page sizes. */
export const APP_FEED = { idleLimitMinutes: 30, homePage: 20, shortsPage: 10, videosPage: 6, loadMorePx: 800 } as const

/**
 * A post's chance of being drawn, relative to a brand-new post by an ordinary author: halves every
 * half-life, never below the floor, doubled for a Spotlight author.
 */
export function drawWeight(ageHours: number, options: { spotlight?: boolean } = {}) {
  const decayed = Math.max(SHUFFLE.weightFloor, Math.pow(0.5, Math.max(0, ageHours) / SHUFFLE.halfLifeHours))
  return decayed * (options.spotlight ? SHUFFLE.spotlightWeight : 1)
}

/** The age at which every post reaches the floor and stops losing ground: about 121 hours. */
export const floorAgeHours = () => SHUFFLE.halfLifeHours * Math.log2(1 / SHUFFLE.weightFloor)
