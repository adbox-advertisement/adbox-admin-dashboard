import { z } from "zod"

// What decides the posts people see in the mobile app (backend docs/recommendation-pipeline.md,
// docs/discover.md, docs/ad-delivery.md). Three settings objects are live in super-admin; the
// rest of the numbers are written in the backend or the app.

/** Reading each live settings object. None is in a seeded role preset; Super Admins hold all. */
export const RECOMMENDATION_PERMISSIONS = {
  feedRanking: "feed.ranking.read",
  discover: "discover.read",
  gold: "gold.settings.read",
} as const

export const MEDIA_TYPES = ["TEXT", "IMAGE", "VIDEO"] as const
export type MediaType = (typeof MEDIA_TYPES)[number]

export const CANDIDATE_SOURCES = ["recent", "following", "campus", "interest", "trending", "explore"] as const
export type CandidateSource = (typeof CANDIDATE_SOURCES)[number]
export type FetchedSource = Exclude<CandidateSource, "explore">

// ── Bounds ───────────────────────────────────────────────────────────────

export const boundsSchema = z.object({ min: z.number(), max: z.number(), integer: z.boolean().optional() })
export type Bounds = z.infer<typeof boundsSchema>
export type BoundsTree = { [key: string]: Bounds | BoundsTree }
export const boundsTreeSchema: z.ZodType<BoundsTree> = z.lazy(() => z.record(z.string(), z.union([boundsSchema, boundsTreeSchema])))

// ── The home feed's ranking settings (libs/recommendation/src/recommendation.config.ts) ──

const perMedia = z.object({ TEXT: z.number(), IMAGE: z.number(), VIDEO: z.number() })

export const rankingConfigSchema = z.object({
  version: z.string(),
  quality: z.object({
    weights: z.object({ like: z.number(), comment: z.number(), share: z.number(), bookmark: z.number(), completion: z.number() }),
    hidePenalty: z.number(),
    priorStrength: z.number(),
    priorRate: z.number(),
  }),
  relevance: z.object({
    followsAuthor: z.number(),
    sameCampus: z.number(),
    sameInstitution: z.number(),
    perSharedInterest: z.number(),
    maxSharedInterests: z.number(),
  }),
  halfLifeHours: perMedia,
  exploration: z.object({ impressionThreshold: z.number(), boost: z.number(), windowHours: z.number() }),
  rerank: z.object({
    maxPerAuthorInWindow: z.number(),
    authorWindow: z.number(),
    maxConsecutiveVideos: z.number(),
    exploreEvery: z.number(),
  }),
  sourceQuota: z.object({ recent: z.number(), following: z.number(), campus: z.number(), interest: z.number(), trending: z.number() }),
  sourceWindowDays: z.object({ following: z.number(), campus: z.number(), interest: z.number(), trending: z.number() }),
  sessionSize: z.number(),
})
export type RankingConfig = z.infer<typeof rankingConfigSchema>

/** A FeedRankingPolicy row; `config` is checked separately, as the gateway does. */
export const feedRankingPolicySchema = z.object({
  id: z.string(),
  version: z.number().int(),
  isActive: z.boolean(),
  rankedPercent: z.number().int(),
  config: z.unknown(),
  note: z.string().nullable().optional().transform((value) => value ?? null),
  createdByAdminId: z.string().nullable().optional().transform((value) => value ?? null),
  createdAt: z.string(),
  activatedByAdminId: z.string().nullable().optional().transform((value) => value ?? null),
  activatedAt: z.string().nullable().optional().transform((value) => value ?? null),
})
export type FeedRankingPolicy = z.infer<typeof feedRankingPolicySchema>

export const feedRankingOverviewSchema = z.object({
  active: feedRankingPolicySchema.nullable(),
  defaults: rankingConfigSchema,
  bounds: boundsTreeSchema,
})
export type FeedRankingOverview = z.infer<typeof feedRankingOverviewSchema>

export const feedRankingHistorySchema = z.object({ items: z.array(feedRankingPolicySchema) })

// ── Discover's trend, Explore and people settings (libs/recommendation/src/discover-policy.ts) ──

export const TREND_KINDS = ["HASHTAG", "INSTITUTION", "CAMPUS", "PERSON", "HALL", "EVENT"] as const
export type TrendKind = (typeof TREND_KINDS)[number]

export const SCOPE_LEVELS = ["GLOBAL", "REGION", "INSTITUTION", "CAMPUS"] as const
export type ScopeLevel = (typeof SCOPE_LEVELS)[number]

export const WEIGHTED_SIGNALS = ["post", "like", "comment", "share", "bookmark", "follow", "search", "open", "scope", "rsvp", "checkin"] as const
export type WeightedSignal = (typeof WEIGHTED_SIGNALS)[number]

const kindKeyed = <T extends z.ZodType>(value: T) => z.record(z.enum(TREND_KINDS), value)

export const discoverPolicySchema = z.object({
  version: z.string(),
  weights: kindKeyed(z.record(z.enum(WEIGHTED_SIGNALS), z.number())),
  score: z.object({
    recentWindowHours: z.number(),
    halfLifeHours: z.number(),
    baselineDays: z.number(),
    smoothing: z.number(),
    momentumExponent: z.number(),
    qualityPenalty: z.number(),
    minRecent: z.number(),
  }),
  minParticipants: kindKeyed(z.record(z.enum(SCOPE_LEVELS), z.number())),
  kindMultiplier: kindKeyed(z.number()),
  diversity: z.object({
    topWindow: z.number(),
    maxPerKindInTop: kindKeyed(z.number()),
    categoryApartWithin: z.number(),
    listSize: z.number(),
  }),
  people: z.object({ proximity: z.number(), mutuals: z.number(), interests: z.number(), quality: z.number(), maxRunPerSource: z.number() }),
  explore: z.object({
    windowDays: z.number(),
    risingBoost: z.number(),
    jitter: z.number(),
    authorWindow: z.number(),
    surveyFirst: z.number(),
    surveyEvery: z.number(),
    risingPostsPerSubject: z.number(),
  }),
  job: z.object({
    intervalMinutes: z.number(),
    minActiveUsers: z.object({ INSTITUTION: z.number(), CAMPUS: z.number() }),
    activeUserDays: z.number(),
    staleAfterIntervals: z.number(),
    snapshotRetentionDays: z.number(),
    signalRetentionDays: z.number(),
  }),
})
export type DiscoverPolicy = z.infer<typeof discoverPolicySchema>

export const discoverPolicyVersionSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  isActive: z.boolean(),
  config: z.unknown(),
  note: z.string().nullable().optional().transform((value) => value ?? null),
  createdAt: z.string(),
  activatedAt: z.string().nullable().optional().transform((value) => value ?? null),
})
export type DiscoverPolicyVersion = z.infer<typeof discoverPolicyVersionSchema>

export const discoverOverviewSchema = z.object({
  active: discoverPolicyVersionSchema.nullable(),
  defaults: discoverPolicySchema,
  bounds: boundsTreeSchema,
})
export type DiscoverOverview = z.infer<typeof discoverOverviewSchema>

// ── The gold settings that shape ad delivery (libs/gold-settings) ──────────

export const adSettingsSchema = z.object({
  values: z.object({
    adFrequencyCapPerDay: z.number().int(),
    adCpmBars: z.number().int(),
    adMinAudience: z.number().int(),
    adDailyBudgetMinBars: z.number().int(),
    adDailyBudgetMaxBars: z.number().int(),
  }),
  updatedAt: z.string().nullable(),
})
export type AdSettings = z.infer<typeof adSettingsSchema>["values"]
export type AdSettingKey = keyof AdSettings
