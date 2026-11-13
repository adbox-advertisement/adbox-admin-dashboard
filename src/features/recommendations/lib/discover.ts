import type { DiscoverPolicy, ScopeLevel, TrendKind, WeightedSignal } from "../types"

// Discover's trends, Explore grid, people suggestions and search (adbox-backend
// libs/recommendation: trends.ts, explore.ts, people.ts, search-ranking.ts, trend-overrides.ts;
// libs/discover and apps/api-gateway/src/discover). Constants here are written in code.

/** A subject shows ↑ at +10% against an ordinary day, ↓ at −10% (trends.ts `scoreSubject`). */
export const TREND_DIRECTION_PCT = 10

/** trend-overrides.ts `TREND_OVERRIDE_LIMITS`. */
export const OVERRIDE_LIMITS = {
  maxPinsPerScope: 3,
  maxFeaturedInTop10: 2,
  defaultFeatureRank: 4,
  maxRank: 10,
  minMultiplier: 0.25,
  maxMultiplier: 3,
  maxDurationDays: 30,
} as const

/** libs/discover/src/explore-data.ts and the gateway's discover-explore.service.ts. */
export const EXPLORE_CODE = {
  baseLimit: 600,
  qualityPool: 200,
  freshPool: 50,
  tasteDays: 30,
  seenDays: 7,
  /** novelty(): an author counts as fully familiar after this many engagements. */
  familiarAfter: 3,
  poolTtlMinutes: 5,
  sessionTtlMinutes: 30,
  sessionSize: 200,
  surpriseMemory: 50,
} as const

/** people.ts and the gateway's discover-people.service.ts / libs/discover people-data.ts. */
export const PEOPLE_CODE = {
  proximity: { CAMPUS: 1, INSTITUTION: 0.6, REGION: 0.3 },
  mutualsForFull: 10,
  qualityDays: 30,
  perSource: 300,
  keep: 200,
  cacheMinutes: 15,
} as const

/** search-ranking.ts `SEARCH_RANKING`: result = text match × (1 + popularity) × locality × freshness. */
export const SEARCH_RANKING = {
  exact: 1,
  prefix: 0.8,
  words: 0.6,
  fullTextMin: 0.4,
  fullTextMax: 0.8,
  fuzzyFactor: 0.6,
  minSimilarity: 0.3,
  popularityDivisor: 10,
  locality: { CAMPUS: 1.5, INSTITUTION: 1.3, REGION: 1.1 },
  freshnessHalfLifeDays: 14,
  exactTotalLimit: 1000,
} as const

/** discover-trends.service.ts: a topic's Top tab. */
export const TOPIC_CODE = { topWindowDays: 14, topPool: 300, previewPosts: 10 } as const

/**
 * What evenly spread activity is worth after the recent window's decay, as a share of its raw
 * weight: each hour's bucket is aged from its middle, so the hour in progress counts in full.
 */
export function evenSpreadDecay(score: Pick<DiscoverPolicy["score"], "recentWindowHours" | "halfLifeHours">) {
  const hours = Math.max(1, Math.round(score.recentWindowHours))
  let total = 0
  for (let hour = 0; hour < hours; hour++) total += Math.pow(0.5, hour / score.halfLifeHours)
  return total / hours
}

export type TrendInput = {
  kind: TrendKind
  level: ScopeLevel
  /** Distinct people per signal in the recent window. */
  actors: Partial<Record<WeightedSignal, number>>
  /** An ordinary day's activity, as a share of the recent window's (1 = the same). */
  ordinaryShare: number
  /** Distinct people with any weighted signal in the window. */
  participants: number
  /** People who hid or reported it, and impressions, in the window. */
  negative: number
  impressions: number
}

/**
 * One subject's trend score in one scope (trends.ts `scoreSubject`), with its activity spread
 * evenly over the recent window:
 *   momentum = (recent + k) ÷ (baseline + k), breadth = ln(1 + participants),
 *   quality = 1 ÷ (1 + penalty × negative ÷ impressions), score = momentum^exp × breadth × quality × kind.
 */
export function trendScore(input: TrendInput, policy: DiscoverPolicy) {
  const { score: settings } = policy
  const weights = policy.weights[input.kind]
  const raw = Object.entries(input.actors).reduce((sum, [signal, actors]) => sum + weights[signal as WeightedSignal] * Math.max(0, actors ?? 0), 0)
  const recent = raw * evenSpreadDecay(settings)
  const baseline = raw * Math.max(0, input.ordinaryShare)
  const k = settings.smoothing
  const momentum = baseline + k > 0 ? (recent + k) / (baseline + k) : 1
  const breadth = Math.log1p(Math.max(0, input.participants))
  const quality = 1 / (1 + (settings.qualityPenalty * Math.max(0, input.negative)) / Math.max(1, input.impressions))
  const kindMultiplier = policy.kindMultiplier[input.kind]
  const value = Math.pow(momentum, settings.momentumExponent) * breadth * quality * kindMultiplier
  const minimum = policy.minParticipants[input.kind][input.level]
  const changePct = baseline > 0 ? Math.round((raw / baseline - 1) * 100) : null
  return {
    raw,
    recent,
    baseline,
    momentum,
    breadth,
    quality,
    kindMultiplier,
    score: value,
    minimum,
    enoughPeople: input.participants >= minimum,
    enoughActivity: recent >= settings.minRecent,
    eligible: input.participants >= minimum && recent >= settings.minRecent && value > 0,
    direction: changePct === null ? "NEW" : changePct >= TREND_DIRECTION_PCT ? "UP" : changePct <= -TREND_DIRECTION_PCT ? "DOWN" : "STEADY",
    changePct,
  } as const
}

/** ln(1 + mutuals) ÷ ln(11): ten mutual follows count as full. */
export const mutualsValue = (mutuals: number) => Math.min(1, Math.log1p(Math.max(0, mutuals)) / Math.log(PEOPLE_CODE.mutualsForFull + 1))

/**
 * Explore's tile order for `posts` posts and `surveys` surveys (explore.ts `rankExplore`): the
 * first survey on tile `surveyFirst`, then one after every `surveyEvery` posts while any are left.
 */
export function exploreTiles(posts: number, surveys: number, settings: Pick<DiscoverPolicy["explore"], "surveyFirst" | "surveyEvery">) {
  const tiles: Array<"post" | "survey"> = []
  let sincePrevious = 0
  let surveyIndex = 0
  for (let post = 0; post < posts; post++) {
    const due = surveyIndex < surveys && (surveyIndex === 0 ? tiles.length === settings.surveyFirst - 1 : sincePrevious >= settings.surveyEvery)
    if (due) {
      tiles.push("survey")
      surveyIndex += 1
      sincePrevious = 0
    }
    tiles.push("post")
    sincePrevious += 1
  }
  return tiles
}
