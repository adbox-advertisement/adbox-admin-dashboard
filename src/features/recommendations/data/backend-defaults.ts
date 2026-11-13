import { SCOPE_LEVELS, TREND_KINDS, WEIGHTED_SIGNALS, type BoundsTree, type DiscoverPolicy, type RankingConfig, type TrendKind } from "../types"

// The built-in settings, copied from adbox-backend (libs/recommendation): what the gateway uses
// when no super-admin version is live, and what this page shows to an admin who cannot read the
// live settings. The live API (GET /feed-ranking, GET /discover-studio/policy) always wins.

/** `DEFAULT_RANKING_CONFIG`, libs/recommendation/src/recommendation.config.ts. */
export const DEFAULT_RANKING_CONFIG: RankingConfig = {
  version: "heuristic-v1",
  quality: {
    weights: { like: 1, comment: 3, share: 5, bookmark: 3, completion: 2 },
    hidePenalty: 10,
    priorStrength: 50,
    priorRate: 0.1,
  },
  relevance: {
    followsAuthor: 1.5,
    sameCampus: 0.6,
    sameInstitution: 0.3,
    perSharedInterest: 0.2,
    maxSharedInterests: 3,
  },
  halfLifeHours: { TEXT: 24, IMAGE: 24, VIDEO: 48 },
  exploration: { impressionThreshold: 200, boost: 1.3, windowHours: 72 },
  rerank: { maxPerAuthorInWindow: 1, authorWindow: 5, maxConsecutiveVideos: 3, exploreEvery: 10 },
  sourceQuota: { recent: 200, following: 150, campus: 100, interest: 100, trending: 100 },
  sourceWindowDays: { following: 14, campus: 14, interest: 14, trending: 7 },
  sessionSize: 200,
}

/** `RANKING_CONFIG_BOUNDS`, libs/recommendation/src/config-validation.ts. */
export const RANKING_CONFIG_BOUNDS = {
  quality: {
    weights: {
      like: { min: 0, max: 100 },
      comment: { min: 0, max: 100 },
      share: { min: 0, max: 100 },
      bookmark: { min: 0, max: 100 },
      completion: { min: 0, max: 100 },
    },
    hidePenalty: { min: 0, max: 1000 },
    priorStrength: { min: 1, max: 10000 },
    priorRate: { min: 0.0001, max: 10 },
  },
  relevance: {
    followsAuthor: { min: 0, max: 20 },
    sameCampus: { min: 0, max: 20 },
    sameInstitution: { min: 0, max: 20 },
    perSharedInterest: { min: 0, max: 20 },
    maxSharedInterests: { min: 0, max: 20, integer: true },
  },
  halfLifeHours: {
    TEXT: { min: 1, max: 720 },
    IMAGE: { min: 1, max: 720 },
    VIDEO: { min: 1, max: 720 },
  },
  exploration: {
    impressionThreshold: { min: 0, max: 100000, integer: true },
    boost: { min: 1, max: 10 },
    windowHours: { min: 1, max: 720 },
  },
  rerank: {
    maxPerAuthorInWindow: { min: 1, max: 50, integer: true },
    authorWindow: { min: 1, max: 50, integer: true },
    maxConsecutiveVideos: { min: 1, max: 50, integer: true },
    exploreEvery: { min: 0, max: 100, integer: true },
  },
  sourceQuota: {
    recent: { min: 1, max: 500, integer: true },
    following: { min: 0, max: 500, integer: true },
    campus: { min: 0, max: 500, integer: true },
    interest: { min: 0, max: 500, integer: true },
    trending: { min: 0, max: 500, integer: true },
  },
  sourceWindowDays: {
    following: { min: 1, max: 90, integer: true },
    campus: { min: 1, max: 90, integer: true },
    interest: { min: 1, max: 90, integer: true },
    trending: { min: 1, max: 90, integer: true },
  },
  sessionSize: { min: 20, max: 500, integer: true },
} satisfies BoundsTree

/** `RANKED_PERCENT_BOUNDS`: the share of people served the ranked feed. */
export const RANKED_PERCENT_BOUNDS = { min: 0, max: 100, integer: true }

const engagementWeights = (scale: number, follow: number, scope: number) => ({
  post: 0,
  like: 1 * scale,
  comment: 3 * scale,
  share: 5 * scale,
  bookmark: 3 * scale,
  follow,
  search: 2,
  open: 1,
  scope,
  rsvp: 0,
  checkin: 0,
})

/** `DEFAULT_DISCOVER_POLICY`, libs/recommendation/src/discover-policy.ts. */
export const DEFAULT_DISCOVER_POLICY: DiscoverPolicy = {
  version: "discover-v1",
  weights: {
    HASHTAG: { ...engagementWeights(1, 0, 0), post: 5 },
    INSTITUTION: { ...engagementWeights(0.5, 4, 1), post: 2 },
    CAMPUS: { ...engagementWeights(0.5, 4, 1), post: 2 },
    PERSON: engagementWeights(1, 4, 0),
    HALL: { ...engagementWeights(1, 0, 0), post: 5 },
    EVENT: { ...engagementWeights(1, 0, 0), post: 5, rsvp: 5, checkin: 5 },
  },
  score: {
    recentWindowHours: 24,
    halfLifeHours: 6,
    baselineDays: 7,
    smoothing: 10,
    momentumExponent: 0.7,
    qualityPenalty: 5,
    minRecent: 20,
  },
  minParticipants: {
    HASHTAG: { GLOBAL: 10, REGION: 7, INSTITUTION: 5, CAMPUS: 3 },
    INSTITUTION: { GLOBAL: 20, REGION: 15, INSTITUTION: 8, CAMPUS: 5 },
    CAMPUS: { GLOBAL: 20, REGION: 15, INSTITUTION: 8, CAMPUS: 5 },
    PERSON: { GLOBAL: 15, REGION: 10, INSTITUTION: 8, CAMPUS: 5 },
    HALL: { GLOBAL: 20, REGION: 15, INSTITUTION: 5, CAMPUS: 3 },
    EVENT: { GLOBAL: 10, REGION: 7, INSTITUTION: 5, CAMPUS: 3 },
  },
  kindMultiplier: { HASHTAG: 1, INSTITUTION: 0.8, CAMPUS: 0.8, PERSON: 0.8, HALL: 1, EVENT: 1.2 },
  diversity: {
    topWindow: 10,
    maxPerKindInTop: { HASHTAG: 10, INSTITUTION: 3, CAMPUS: 3, PERSON: 3, HALL: 3, EVENT: 4 },
    categoryApartWithin: 5,
    listSize: 50,
  },
  people: { proximity: 0.35, mutuals: 0.25, interests: 0.2, quality: 0.2, maxRunPerSource: 3 },
  explore: {
    windowDays: 14,
    risingBoost: 0.5,
    jitter: 0.15,
    authorWindow: 8,
    surveyFirst: 3,
    surveyEvery: 6,
    risingPostsPerSubject: 3,
  },
  job: {
    intervalMinutes: 5,
    minActiveUsers: { INSTITUTION: 20, CAMPUS: 20 },
    activeUserDays: 7,
    staleAfterIntervals: 3,
    snapshotRetentionDays: 7,
    signalRetentionDays: 35,
  },
}

const perKind = <T,>(value: T) => Object.fromEntries(TREND_KINDS.map((kind) => [kind, value])) as Record<TrendKind, T>
const signalWeights = Object.fromEntries(WEIGHTED_SIGNALS.map((signal) => [signal, { min: 0, max: 100 }]))
const perLevel = Object.fromEntries(SCOPE_LEVELS.map((level) => [level, { min: 1, max: 10000, integer: true }]))

/** `DISCOVER_POLICY_BOUNDS`, libs/recommendation/src/discover-policy.ts. */
export const DISCOVER_POLICY_BOUNDS = {
  weights: perKind(signalWeights),
  score: {
    recentWindowHours: { min: 1, max: 72, integer: true },
    halfLifeHours: { min: 0.5, max: 72 },
    baselineDays: { min: 1, max: 28, integer: true },
    smoothing: { min: 0, max: 1000 },
    momentumExponent: { min: 0, max: 2 },
    qualityPenalty: { min: 0, max: 100 },
    minRecent: { min: 0, max: 100000 },
  },
  minParticipants: perKind(perLevel),
  kindMultiplier: perKind({ min: 0, max: 10 }),
  diversity: {
    topWindow: { min: 1, max: 50, integer: true },
    maxPerKindInTop: perKind({ min: 0, max: 50, integer: true }),
    categoryApartWithin: { min: 0, max: 50, integer: true },
    listSize: { min: 10, max: 200, integer: true },
  },
  people: {
    proximity: { min: 0, max: 1 },
    mutuals: { min: 0, max: 1 },
    interests: { min: 0, max: 1 },
    quality: { min: 0, max: 1 },
    maxRunPerSource: { min: 1, max: 20, integer: true },
  },
  explore: {
    windowDays: { min: 1, max: 60, integer: true },
    risingBoost: { min: 0, max: 5 },
    jitter: { min: 0, max: 0.5 },
    authorWindow: { min: 1, max: 30, integer: true },
    surveyFirst: { min: 1, max: 30, integer: true },
    surveyEvery: { min: 1, max: 50, integer: true },
    risingPostsPerSubject: { min: 1, max: 20, integer: true },
  },
  job: {
    intervalMinutes: { min: 1, max: 60, integer: true },
    minActiveUsers: {
      INSTITUTION: { min: 1, max: 100000, integer: true },
      CAMPUS: { min: 1, max: 100000, integer: true },
    },
    activeUserDays: { min: 1, max: 30, integer: true },
    staleAfterIntervals: { min: 2, max: 100, integer: true },
    snapshotRetentionDays: { min: 1, max: 90, integer: true },
    signalRetentionDays: { min: 9, max: 90, integer: true },
  },
} satisfies BoundsTree

/** `GOLD_SETTINGS_DEFAULTS` and `GOLD_SETTINGS_LIMITS` for the numbers ads are delivered by (libs/gold-settings). */
export const AD_SETTINGS_DEFAULTS = {
  adFrequencyCapPerDay: 3,
  adCpmBars: 1250,
  adMinAudience: 100,
  adDailyBudgetMinBars: 500,
  adDailyBudgetMaxBars: 12_500,
}
export const AD_SETTINGS_LIMITS = {
  adFrequencyCapPerDay: { min: 1, max: 100, integer: true },
  adCpmBars: { min: 1, max: 10_000_000, integer: true },
  adMinAudience: { min: 0, max: 1_000_000, integer: true },
  adDailyBudgetMinBars: { min: 1, max: 10_000_000, integer: true },
  adDailyBudgetMaxBars: { min: 1, max: 10_000_000, integer: true },
}
