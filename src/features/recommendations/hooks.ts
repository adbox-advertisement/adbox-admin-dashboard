import { useQuery } from "@tanstack/react-query"
import { useCurrentAdmin } from "@/features/auth"
import { getAdSettings, getDiscoverPolicy, getFeedRanking, getFeedRankingHistory } from "./api"
import { AD_SETTINGS_DEFAULTS, DEFAULT_DISCOVER_POLICY, DEFAULT_RANKING_CONFIG, DISCOVER_POLICY_BOUNDS, RANKING_CONFIG_BOUNDS } from "./data/backend-defaults"
import { boundsProblems, mergeOver } from "./lib/values"
import {
  RECOMMENDATION_PERMISSIONS,
  discoverPolicySchema,
  rankingConfigSchema,
  type AdSettings,
  type BoundsTree,
  type DiscoverOverview,
  type DiscoverPolicy,
  type DiscoverPolicyVersion,
  type FeedRankingOverview,
  type FeedRankingPolicy,
  type RankingConfig,
} from "./types"

const keys = {
  feed: ["recommendations", "feed-ranking"] as const,
  history: (limit: number) => ["recommendations", "feed-ranking", "history", limit] as const,
  discover: ["recommendations", "discover-policy"] as const,
  ads: ["recommendations", "ad-settings"] as const,
}

/** Which live settings this admin may read. The backend decides; this only avoids certain 403s. */
export function useRecommendationAccess() {
  const profile = useCurrentAdmin()
  const permissions = profile.data?.permissions ?? []
  const can = (permission: string) => permissions.includes("*") || permissions.includes(permission)
  return {
    loading: profile.isPending,
    feed: can(RECOMMENDATION_PERMISSIONS.feedRanking),
    discover: can(RECOMMENDATION_PERMISSIONS.discover),
    gold: can(RECOMMENDATION_PERMISSIONS.gold),
  }
}

// Settings change rarely and the gateway re-reads them every 30 seconds; a minute is fresh enough.
const STALE_MS = 60_000

export function useFeedRanking(enabled: boolean) {
  return useQuery({ queryKey: keys.feed, queryFn: ({ signal }) => getFeedRanking(signal), enabled, staleTime: STALE_MS })
}

export function useFeedRankingHistory(enabled: boolean, limit = 12) {
  return useQuery({ queryKey: keys.history(limit), queryFn: ({ signal }) => getFeedRankingHistory(limit, signal), enabled, staleTime: STALE_MS })
}

export function useDiscoverPolicy(enabled: boolean) {
  return useQuery({ queryKey: keys.discover, queryFn: ({ signal }) => getDiscoverPolicy(signal), enabled, staleTime: STALE_MS })
}

export function useAdSettings(enabled: boolean) {
  return useQuery({ queryKey: keys.ads, queryFn: ({ signal }) => getAdSettings(signal), enabled, staleTime: STALE_MS })
}

/**
 * - `live`: read from the server just now (an active version, or the defaults when none is live,
 *   which is then what the gateway uses);
 * - `locked`: this admin may not read it, so the built-in defaults are shown;
 * - `error`: the read failed, so the built-in defaults are shown;
 * - `loading`: the defaults are shown until the read returns.
 */
export type LiveStatus = "live" | "locked" | "error" | "loading"

export type FeedSettings = {
  status: LiveStatus
  /** What the gateway ranks with. */
  config: RankingConfig
  defaults: RankingConfig
  bounds: BoundsTree
  active: FeedRankingPolicy | null
  /** `policy-vN` or the built-in `heuristic-v1`. */
  label: string
  /** The live version's share, or null when the gateway's FEED_RANKED_PERCENT applies. */
  rankedPercent: number | null
  /** Why the active version is ignored, when it fails validation (the gateway then uses the defaults). */
  ignored: string[]
  error: unknown
  refetch: () => void
}

export type DiscoverSettings = {
  status: LiveStatus
  policy: DiscoverPolicy
  defaults: DiscoverPolicy
  bounds: BoundsTree
  active: DiscoverPolicyVersion | null
  label: string
  ignored: string[]
  error: unknown
  refetch: () => void
}

export type GoldAdSettings = {
  status: LiveStatus
  values: AdSettings
  updatedAt: string | null
  error: unknown
  refetch: () => void
}

/** The feed policy in force, as the gateway's FeedPolicyService works it out. */
export function effectiveFeed(overview: FeedRankingOverview): Pick<FeedSettings, "config" | "label" | "rankedPercent" | "ignored"> {
  const { active, defaults, bounds } = overview
  if (!active) return { config: defaults, label: defaults.version, rankedPercent: null, ignored: [] }
  const parsed = rankingConfigSchema.safeParse(active.config)
  const problems = parsed.success ? boundsProblems(parsed.data, bounds) : ["The stored settings are incomplete"]
  if (parsed.success && parsed.data.rerank.maxPerAuthorInWindow > parsed.data.rerank.authorWindow) {
    problems.push("rerank.maxPerAuthorInWindow cannot exceed rerank.authorWindow")
  }
  if (!Number.isInteger(active.rankedPercent) || active.rankedPercent < 0 || active.rankedPercent > 100) problems.push("rankedPercent out of range")
  if (!parsed.success || problems.length > 0) return { config: defaults, label: defaults.version, rankedPercent: null, ignored: problems }
  return { config: parsed.data, label: parsed.data.version, rankedPercent: active.rankedPercent, ignored: [] }
}

/** The Discover policy in force, as the gateway reads it (readStoredDiscoverPolicy). */
export function effectiveDiscover(overview: DiscoverOverview): Pick<DiscoverSettings, "policy" | "label" | "ignored"> {
  const { active, defaults, bounds } = overview
  if (!active) return { policy: defaults, label: defaults.version, ignored: [] }
  const merged = mergeOver(defaults, active.config)
  const parsed = discoverPolicySchema.safeParse(merged)
  const problems = parsed.success ? boundsProblems(parsed.data, bounds) : ["The stored settings are incomplete"]
  if (!parsed.success || problems.length > 0) return { policy: defaults, label: defaults.version, ignored: problems }
  return { policy: parsed.data, label: parsed.data.version, ignored: [] }
}

const statusOf = (allowed: boolean, query: { isPending: boolean; isError: boolean; data?: unknown }): LiveStatus =>
  !allowed ? "locked" : query.data !== undefined ? "live" : query.isError ? "error" : "loading"

export function useFeedSettings(): FeedSettings {
  const access = useRecommendationAccess()
  const query = useFeedRanking(access.feed)
  const status = access.loading ? "loading" : statusOf(access.feed, query)
  const live = query.data ? effectiveFeed(query.data) : null
  return {
    status,
    config: live?.config ?? DEFAULT_RANKING_CONFIG,
    defaults: query.data?.defaults ?? DEFAULT_RANKING_CONFIG,
    bounds: query.data?.bounds ?? RANKING_CONFIG_BOUNDS,
    active: query.data?.active ?? null,
    label: live?.label ?? DEFAULT_RANKING_CONFIG.version,
    rankedPercent: live?.rankedPercent ?? null,
    ignored: live?.ignored ?? [],
    error: query.error,
    refetch: () => void query.refetch(),
  }
}

export function useDiscoverSettings(): DiscoverSettings {
  const access = useRecommendationAccess()
  const query = useDiscoverPolicy(access.discover)
  const status = access.loading ? "loading" : statusOf(access.discover, query)
  const live = query.data ? effectiveDiscover(query.data) : null
  return {
    status,
    policy: live?.policy ?? DEFAULT_DISCOVER_POLICY,
    defaults: query.data?.defaults ?? DEFAULT_DISCOVER_POLICY,
    bounds: query.data?.bounds ?? DISCOVER_POLICY_BOUNDS,
    active: query.data?.active ?? null,
    label: live?.label ?? DEFAULT_DISCOVER_POLICY.version,
    ignored: live?.ignored ?? [],
    error: query.error,
    refetch: () => void query.refetch(),
  }
}

export function useGoldAdSettings(): GoldAdSettings {
  const access = useRecommendationAccess()
  const query = useAdSettings(access.gold)
  return {
    status: access.loading ? "loading" : statusOf(access.gold, query),
    values: query.data?.values ?? AD_SETTINGS_DEFAULTS,
    updatedAt: query.data?.updatedAt ?? null,
    error: query.error,
    refetch: () => void query.refetch(),
  }
}

/** All three, for screens that read values from any of them by catalog entry. */
export function useLiveSettings() {
  return { feed: useFeedSettings(), discover: useDiscoverSettings(), gold: useGoldAdSettings() }
}
export type LiveSettings = ReturnType<typeof useLiveSettings>
