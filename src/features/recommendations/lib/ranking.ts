import type { CandidateSource, MediaType, RankingConfig } from "../types"

// The ranked feed's scoring and ordering, ported line for line from adbox-backend
// libs/recommendation (score.ts, rerank.ts, candidates.ts) so the playground ranks exactly as the
// gateway would. Pure: no clock, no randomness.

/** Gateway environment (apps/api-gateway/src/feed), with the defaults it falls back to. */
export const RANKED_FEED_ENV = { rankedPercent: 100, policyRefreshMs: 30_000, buildTimeoutMs: 1500, sourceTimeoutMs: 500 } as const

/** Written in feed.service.ts and feed-candidates.service.ts. */
export const RANKED_FEED_CODE = { sessionTtlMinutes: 30, seenWindowDays: 7, seenLimit: 3000 } as const

export type CandidateStats = {
  impressions: number
  likes: number
  comments: number
  shares: number
  bookmarks: number
  /** Qualified video completions, replays included; 0 for other media. */
  completions: number
  /** Distinct people with a qualified play; 0 for other media. */
  viewers: number
  /** Hidden or marked not interested, by anyone. */
  hides: number
}

export type ViewerAffinity = {
  followsAuthor: boolean
  sameCampus: boolean
  sameInstitution: boolean
  sharedInterests: number
}

export type Candidate = {
  id: string
  authorId: string
  mediaType: MediaType
  createdAt: Date
  quotedResourceId: string | null
  sources: CandidateSource[]
  stats: CandidateStats
  affinity: ViewerAffinity
}

export type ScoreParts = { quality: number; relevance: number; freshness: number; exploration: number }
export type ScoredCandidate = Candidate & { score: number; parts: ScoreParts }

const HOUR_MS = 60 * 60 * 1000

/** Smoothed weighted engagement per impression, never below a small floor. */
export function quality(stats: CandidateStats, config: RankingConfig["quality"]) {
  const { weights } = config
  const completions = Math.min(stats.completions, stats.viewers)
  const exposure = Math.max(stats.impressions, stats.viewers, 0)
  const engagement =
    weights.like * stats.likes +
    weights.comment * stats.comments +
    weights.share * stats.shares +
    weights.bookmark * stats.bookmarks +
    weights.completion * completions -
    config.hidePenalty * stats.hides
  const rate = (engagement + config.priorStrength * config.priorRate) / (exposure + config.priorStrength)
  return Math.max(rate, 0.001)
}

/** 1 for a post with no relation to the viewer, more for each tie. */
export function relevance(affinity: ViewerAffinity, config: RankingConfig["relevance"]) {
  let value = 1
  if (affinity.followsAuthor) value += config.followsAuthor
  if (affinity.sameCampus) value += config.sameCampus
  else if (affinity.sameInstitution) value += config.sameInstitution
  value += config.perSharedInterest * Math.min(Math.max(0, affinity.sharedInterests), config.maxSharedInterests)
  return value
}

/** Halves every `halfLifeHours`; 1 for a post published now. */
export function freshness(createdAt: Date, mediaType: MediaType, now: Date, halfLifeHours: RankingConfig["halfLifeHours"]) {
  const ageHours = Math.max(0, now.getTime() - createdAt.getTime()) / HOUR_MS
  return Math.pow(0.5, ageHours / halfLifeHours[mediaType])
}

export function exploration(stats: CandidateStats, config: RankingConfig["exploration"]) {
  return stats.impressions < config.impressionThreshold ? config.boost : 1
}

export function scoreCandidate(candidate: Candidate, now: Date, config: RankingConfig): ScoredCandidate {
  const parts = {
    quality: quality(candidate.stats, config.quality),
    relevance: relevance(candidate.affinity, config.relevance),
    freshness: freshness(candidate.createdAt, candidate.mediaType, now, config.halfLifeHours),
    exploration: exploration(candidate.stats, config.exploration),
  }
  return { ...candidate, parts, score: parts.quality * parts.relevance * parts.freshness * parts.exploration }
}

/** Highest score first; ties on newer, then id, so the same inputs always give the same order. */
export function rankCandidates(candidates: Candidate[], now: Date, config: RankingConfig) {
  return candidates
    .map((candidate) => scoreCandidate(candidate, now, config))
    .sort((a, b) => b.score - a.score || b.createdAt.getTime() - a.createdAt.getTime() || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
}

/** Marks new posts still finding their audience as `explore`, for the rerank's reserved slot. */
export function markExplore(candidates: Candidate[], now: Date, config: RankingConfig["exploration"]) {
  const since = now.getTime() - config.windowHours * HOUR_MS
  return candidates.map((candidate) =>
    candidate.createdAt.getTime() >= since && candidate.stats.impressions < config.impressionThreshold && !candidate.sources.includes("explore")
      ? { ...candidate, sources: [...candidate.sources, "explore" as const] }
      : candidate)
}

/** A soft rule of the rerank, named so the playground can say which one moved a post. */
export type RuleName = "explore-slot" | "author" | "videos" | "quote"

export type RerankNote = {
  /** Rules that kept this post out of a slot its score had earned. */
  heldBack: RuleName[]
  /** It took a slot reserved for a new post. */
  exploreSlot: boolean
  /** It was placed only after rules were dropped, because nothing else fit. */
  relaxed: boolean
}

export type RerankResult = { items: ScoredCandidate[]; relaxed: number; notes: Map<string, RerankNote> }

const isExplore = (candidate: ScoredCandidate) => candidate.sources.includes("explore")

/**
 * The final order, built greedily (libs/recommendation rerank.ts): each slot takes the highest-scored
 * remaining post that breaks no rule; when nothing fits, rules are dropped in a fixed order (the
 * explore slot, the author cap, the video run, quote adjacency) rather than leave a gap.
 */
export function rerank(ranked: ScoredCandidate[], config: RankingConfig, size = config.sessionSize): RerankResult {
  const rules = config.rerank
  type Rule = { name: RuleName; test: (candidate: ScoredCandidate, placed: ScoredCandidate[]) => boolean }

  const authorCap: Rule = {
    name: "author",
    test: (candidate, placed) => placed.slice(-(rules.authorWindow - 1)).filter((item) => item.authorId === candidate.authorId).length < rules.maxPerAuthorInWindow,
  }
  const videoRun: Rule = {
    name: "videos",
    test: (candidate, placed) => {
      if (candidate.mediaType !== "VIDEO") return true
      const tail = placed.slice(-rules.maxConsecutiveVideos)
      return tail.length < rules.maxConsecutiveVideos || tail.some((item) => item.mediaType !== "VIDEO")
    },
  }
  const quoteApart: Rule = {
    name: "quote",
    test: (candidate, placed) => {
      const previous = placed[placed.length - 1] as ScoredCandidate | undefined
      return !previous || (candidate.quotedResourceId !== previous.id && previous.quotedResourceId !== candidate.id)
    },
  }
  const exploreOnly: Rule = { name: "explore-slot", test: (candidate) => isExplore(candidate) }

  /** True when this slot is the last chance for its block's explore item. */
  const exploreDue = (placed: ScoredCandidate[]) => {
    const every = rules.exploreEvery
    if (every <= 0 || placed.length % every !== every - 1) return false
    const blockStart = placed.length - (every - 1)
    return !placed.slice(blockStart).some(isExplore)
  }

  const remaining = [...ranked]
  const placed: ScoredCandidate[] = []
  const notes = new Map<string, RerankNote>(ranked.map((item) => [item.id, { heldBack: [], exploreSlot: false, relaxed: false }]))
  let relaxed = 0

  while (remaining.length > 0 && placed.length < size) {
    const soft = [authorCap, videoRun, quoteApart]
    const exploreSet = exploreDue(placed) && remaining.some(isExplore)
    const ruleSets: Rule[][] = [...(exploreSet ? [[exploreOnly, ...soft]] : []), soft, [videoRun, quoteApart], [quoteApart], []]

    let index = -1
    let level = 0
    for (; level < ruleSets.length; level += 1) {
      const set = ruleSets[level]
      index = remaining.findIndex((candidate) => set.every((rule) => rule.test(candidate, placed)))
      if (index !== -1) break
    }
    const chosen = remaining[index]
    const usedSet = ruleSets[level]
    // Better-scored posts passed over for this slot, and the first rule each broke.
    for (const skipped of remaining.slice(0, index)) {
      const broken = usedSet.find((rule) => !rule.test(skipped, placed))
      const note = notes.get(skipped.id)
      if (broken && note && !note.heldBack.includes(broken.name)) note.heldBack.push(broken.name)
    }
    const note = notes.get(chosen.id)
    if (note) {
      if (exploreSet && level === 0) note.exploreSlot = true
      if (level > ruleSets.indexOf(soft)) note.relaxed = true
    }
    if (level > ruleSets.indexOf(soft)) relaxed += 1

    placed.push(chosen)
    remaining.splice(index, 1)
  }

  return { items: placed, relaxed, notes }
}

/** Scores, marks explore, ranks and reranks a pool: everything after the candidate queries. */
export function buildList(candidates: Candidate[], now: Date, config: RankingConfig, size = config.sessionSize) {
  const ranked = rankCandidates(markExplore(candidates, now, config.exploration), now, config)
  return { ranked, ...rerank(ranked, config, size) }
}
