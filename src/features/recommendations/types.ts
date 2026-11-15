import { z } from "zod"

// What decides the posts people see in the mobile app (backend docs/recommendation-pipeline.md,
// docs/discover.md, docs/ad-delivery.md). Three settings objects are live in super-admin; the
// rest of the numbers are written in the backend or the app.

/**
 * Reading each live settings object, and the one change this section makes (the ranked share).
 * None is in a seeded role preset; Super Admins hold all.
 */
export const RECOMMENDATION_PERMISSIONS = {
  feedRanking: "feed.ranking.read",
  feedRankingManage: "feed.ranking.manage",
  discover: "discover.read",
  /** Pin, boost, dampen, suppress, feature and end trend overrides. */
  discoverTrendsManage: "discover.trends.manage",
  gold: "gold.settings.read",
  /** Institutions, campuses and halls, to name lists and find subjects. */
  institutions: "institutions.read",
  /** People, to find a person to place. */
  people: "platform.users.read",
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

/**
 * A new version that changes only the ranked share (POST /feed-ranking/policies): every other
 * setting is carried over from the live version by the server.
 */
export const rankedShareInputSchema = z.object({
  rankedPercent: z.number().int().min(0).max(100),
  note: z.string().trim().max(500).optional(),
})
export type RankedShareInput = z.infer<typeof rankedShareInputSchema>

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

// ── Trending overrides (super-admin discover-studio; docs/discover.md §12.3) ──

export const OVERRIDE_ACTIONS = ["PIN", "FEATURE", "BOOST", "SUPPRESS"] as const
export type OverrideAction = (typeof OVERRIDE_ACTIONS)[number]

export const OVERRIDE_STATES = ["ACTIVE", "SCHEDULED", "ENDED", "EXPIRED"] as const
export type OverrideState = (typeof OVERRIDE_STATES)[number]

/** `global`, `region:{slug}`, `inst:{id}` or `campus:{id}`: one Trending list. */
export const SCOPE_KEY_PATTERN = /^(global|region:[a-z0-9]+(-[a-z0-9]+)*|inst:[0-9a-f-]{36}|campus:[0-9a-f-]{36})$/

const nullableText = z.string().nullable().optional().transform((value) => value ?? null)

export const trendOverrideSchema = z.object({
  id: z.string(),
  scopeKey: z.string(),
  kind: z.enum(TREND_KINDS),
  subjectId: z.string(),
  action: z.enum(OVERRIDE_ACTIONS),
  rank: z.number().int().nullable().optional().transform((value) => value ?? null),
  multiplier: z.number().nullable().optional().transform((value) => value ?? null),
  reason: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  endedAt: nullableText,
  state: z.enum(OVERRIDE_STATES).optional(),
  /** Sent with the trends report; the overrides list leaves it out. */
  name: nullableText,
})
export type TrendOverride = z.infer<typeof trendOverrideSchema>

const trendMetricsSchema = z.object({
  posts: z.number().optional(),
  participants: z.number().optional(),
  follows: z.number().optional(),
})

/** ↑ at least 10% above an ordinary day, ↓ at least 10% below, steady between; new with no baseline. */
const trendDirectionSchema = z.object({ direction: z.enum(["UP", "DOWN", "STEADY", "NEW"]), changePct: z.number().nullable() })
export type TrendDirection = z.infer<typeof trendDirectionSchema>

/** How the trends job scored a subject (libs/recommendation/src/trends.ts, scoreSubject). */
export const trendScorePartsSchema = z.object({
  /** Weighted actions by distinct people in the recent window, halved every half-life. */
  recent: z.number(),
  /** The same weighted activity on an ordinary day of the baseline. */
  baseline: z.number(),
  /** (recent + smoothing) ÷ (baseline + smoothing). */
  momentum: z.number(),
  /** ln(1 + people taking part). */
  breadth: z.number(),
  /** 1 with no hides or reports; lower with them. */
  quality: z.number(),
  kindMultiplier: z.number(),
})
export type TrendScoreParts = z.infer<typeof trendScorePartsSchema>

export const trendItemSchema = z.object({
  rank: z.number().int(),
  kind: z.enum(TREND_KINDS),
  id: z.string(),
  name: nullableText,
  score: z.number(),
  metrics: trendMetricsSchema.optional(),
  trend: trendDirectionSchema.nullable().optional(),
  parts: trendScorePartsSchema.optional(),
  /** The post the app takes the subject's picture from. */
  topPostId: nullableText,
})
export type TrendItem = z.infer<typeof trendItemSchema>

export const missedTrendSchema = z.object({
  kind: z.enum(TREND_KINDS),
  id: z.string(),
  name: nullableText,
  score: z.number(),
  metrics: trendMetricsSchema.optional(),
  reasons: z.array(z.string()).default([]),
})
export type MissedTrend = z.infer<typeof missedTrendSchema>

/** GET /discover-studio/trends: a list as last computed, what just missed, and the overrides in force. */
export const trendReportSchema = z.object({
  scopeKey: z.string(),
  snapshot: z.object({
    computedAt: z.string(),
    policyVersion: z.string(),
    items: z.array(trendItemSchema),
    diagnostics: z.object({ candidates: z.number(), relaxed: z.number(), missed: z.array(missedTrendSchema).default([]) }).nullable().optional(),
  }).nullable(),
  overrides: z.array(trendOverrideSchema),
})
export type TrendReport = z.infer<typeof trendReportSchema>

/** GET /discover-studio/trends/status: whether the job keeps up, and the lists it built. */
export const trendStatusSchema = z.object({
  lastSuccessAt: nullableText,
  stale: z.boolean(),
  intervalMinutes: z.number(),
  scopes: z.array(z.string()).default([]),
})
export type TrendStatus = z.infer<typeof trendStatusSchema>

// ── Trending as the app gets it (GET /discover/trending; libs/discover/src/trends-read.ts) ──

const nullableCount = z.number().nullable().optional().transform((value) => value ?? null)
const nullableOf = <T extends z.ZodType>(schema: T) => schema.nullable().optional().transform((value) => value ?? null)
const namedRef = z.object({ id: z.string(), name: z.string() })
const institutionRef = z.object({ id: z.string(), shortName: z.string() })

/** Who or what a trend is about, with only what the app may show (TrendSubjectView). Hashtags have none. */
export const appTrendSubjectSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("INSTITUTION"), id: z.string(), name: z.string(), shortName: z.string(), region: nullableText, logoUrl: nullableText }),
  z.object({ kind: z.literal("CAMPUS"), id: z.string(), name: z.string(), city: nullableText, institution: institutionRef }),
  z.object({ kind: z.literal("HALL"), id: z.string(), name: z.string(), campus: namedRef, institution: institutionRef }),
  z.object({
    kind: z.literal("EVENT"),
    id: z.string(),
    title: z.string(),
    startsAt: z.string(),
    endsAt: z.string(),
    location: nullableText,
    coverUrl: nullableText,
    timing: z.enum(["UPCOMING", "LIVE", "ENDED"]),
    going: z.number(),
    institution: institutionRef,
    campus: nullableOf(namedRef),
    hall: nullableOf(namedRef),
  }),
  z.object({
    kind: z.literal("PERSON"),
    id: z.string(),
    username: nullableText,
    fullName: nullableText,
    image: nullableText,
    verificationTier: nullableText,
    creatorRole: nullableOf(z.object({ slug: z.string(), label: z.string() })),
    institution: nullableOf(institutionRef),
  }),
])
export type AppTrendSubject = z.infer<typeof appTrendSubjectSchema>

/** One row of the app's Trending: overrides applied, with the labels and pictures the app shows. */
export const appTrendSchema = z.object({
  rank: z.number().int(),
  kind: z.enum(TREND_KINDS),
  id: z.string(),
  title: z.string(),
  category: nullableOf(z.object({ slug: z.string(), label: z.string() })),
  metrics: z.object({
    posts: nullableCount,
    participants: nullableCount,
    /** New followers (people). */
    follows: nullableCount,
    /** People going, all told (events). */
    going: nullableCount,
    /** What the figures cover: `24h`, `7d`, `30d` or `all`. */
    window: nullableText,
    /** What the app prints, "2.4k posts today"; null when there is nothing honest to say. */
    label: nullableText,
  }),
  trend: nullableOf(trendDirectionSchema),
  /** Pinned or featured by an admin: the app marks it Featured. */
  featured: z.boolean().optional().default(false),
  // The extra details are read leniently: a shape this page doesn't know hides them, not the list.
  presentation: z.object({
    kicker: z.string(),
    headline: z.string(),
    support: nullableText,
    sticker: z.array(z.string()).default([]),
    tone: nullableText,
    imageUrl: nullableText,
    description: nullableText,
  }).nullable().catch(null),
  subject: appTrendSubjectSchema.nullable().catch(null),
})
export type AppTrend = z.infer<typeof appTrendSchema>

export const appTrendListSchema = z.object({
  scope: z.object({ key: z.string(), level: z.enum(SCOPE_LEVELS), label: z.string() }),
  items: z.array(appTrendSchema),
  /**
   * `snapshot`: the list as computed. `institution`: a campus showing its institution's.
   * `fallback`: nothing computed yet, so admin-placed subjects and this week's most-posted hashtags.
   */
  source: z.enum(["snapshot", "institution", "fallback"]),
  computedAt: nullableText,
  policyVersion: nullableText,
  stale: z.boolean().optional().default(false),
})
export type AppTrendList = z.infer<typeof appTrendListSchema>

/** POST /discover-studio/preview: the app's Discover page and Trending. Only Trending is read here. */
export const discoverPreviewSchema = z.object({ trending: appTrendListSchema })

export const overrideListSchema = z.object({ items: z.array(trendOverrideSchema) })

/** POST /discover-studio/overrides. The server checks it all again. */
export const createOverrideInputSchema = z.object({
  scopeKey: z.string().regex(SCOPE_KEY_PATTERN),
  kind: z.enum(TREND_KINDS),
  subjectId: z.uuid(),
  action: z.enum(OVERRIDE_ACTIONS),
  rank: z.number().int().min(1).max(10).optional(),
  multiplier: z.number().min(0.25).max(3).optional(),
  reason: z.string().trim().min(3).max(500),
  startsAt: z.string().optional(),
  endsAt: z.string(),
})
export type CreateOverrideInput = z.infer<typeof createOverrideInputSchema>

// Where subjects are found: hashtags and events from Discover studio, institutions (with their
// campuses and halls) and people from their own sections.

export const hashtagPageSchema = z.object({
  items: z.array(z.object({ id: z.string(), name: z.string(), displayName: nullableText, status: z.string(), postCount: z.number().default(0) })),
})

export const institutionDirectorySchema = z.array(z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string(),
  region: z.string(),
  isActive: z.boolean().optional().default(true),
  campuses: z.array(z.object({
    id: z.string(),
    name: z.string(),
    halls: z.array(z.object({ id: z.string(), name: z.string(), isActive: z.boolean().optional().default(true) })).default([]),
  })).default([]),
}))
export type InstitutionDirectory = z.infer<typeof institutionDirectorySchema>

export const peoplePageSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    isActive: z.boolean().nullable().optional(),
    userProfile: z.object({ fullName: nullableText, username: nullableText }).nullable().optional(),
  })),
})

export const eventPageSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    title: z.string(),
    status: z.string(),
    startsAt: z.string(),
    endsAt: z.string(),
    institution: z.object({ shortName: z.string() }).nullable().optional(),
  })),
})

/** A subject to place, whatever its kind. */
export type TrendSubject = { kind: TrendKind; id: string; name: string }
