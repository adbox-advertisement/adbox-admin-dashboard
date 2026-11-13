import type { SurfaceId } from "./catalog"

// Each list the app shows, from the request to the screen. Prose states only what is written in
// code; numbers an admin can change appear as parameter chips, so they always show the live value.

export type FlowStage = "who" | "score" | "order" | "memory"

export const FLOW_STAGES: Record<FlowStage, { label: string; question: string }> = {
  who: { label: "Who is in", question: "Which posts can appear at all" },
  score: { label: "How each is scored", question: "What makes one more likely than another" },
  order: { label: "How the list is ordered", question: "How the final order is built" },
  memory: { label: "Paging & memory", question: "What is remembered between pages" },
}
export const FLOW_STAGE_IDS = Object.keys(FLOW_STAGES) as FlowStage[]

export type FlowCell = { text: string; params: string[] }

export type FlowRow = {
  surface: SurfaceId
  /** What the app asks for, in its words. */
  asks: string
  page: "home" | "sponsored" | "discover" | "ranked"
  cells: Record<FlowStage, FlowCell>
}

export const FLOW: FlowRow[] = [
  {
    surface: "home", asks: "20 posts a page", page: "home",
    cells: {
      who: { text: "Every post the viewer may see: public and active (or their own), not hidden by them, no block either way, not by a switched-off account. Anonymous posts held for review stay with their author.", params: ["shuffle.pool"] },
      score: { text: "A chance, not a score: it halves with every half-life of age down to a floor, and is doubled for Spotlight authors (never on anonymous posts).", params: ["shuffle.halfLife", "shuffle.floor", "shuffle.spotlight"] },
      order: { text: "A weighted draw without replacement, so new posts usually lead, in a different order every time. After a refresh, posts newer than the last page come first.", params: ["app.firstAdSlot", "app.adSpacing"] },
      memory: { text: "Nothing is served twice in a session. Coming back after a while starts a new session; when everything has been served, the app starts a new round.", params: ["shuffle.memory", "app.idleLimit"] },
    },
  },
  {
    surface: "shorts", asks: "10 Shorts a page", page: "home",
    cells: {
      who: { text: "Public videos in portrait and short enough to be a Short; otherwise as Home.", params: ["shorts.aspect", "shorts.seconds"] },
      score: { text: "The same freshness draw as Home.", params: ["shuffle.halfLife"] },
      order: { text: "A weighted draw without replacement.", params: [] },
      memory: { text: "Shorts remember what they served apart from Home.", params: ["app.shortsPage"] },
    },
  },
  {
    surface: "videos", asks: "6 videos a page", page: "home",
    cells: {
      who: { text: "Public videos that can play. The opened video is never returned beneath itself, and counts as served.", params: [] },
      score: { text: "The same freshness draw as Home.", params: ["shuffle.halfLife"] },
      order: { text: "A weighted draw without replacement.", params: [] },
      memory: { text: "This list remembers what it served apart from Home and Shorts.", params: ["app.videosPage"] },
    },
  },
  {
    surface: "sponsored", asks: "3 ads per load of Home", page: "sponsored",
    cells: {
      who: { text: "Running ads inside their dates, aimed at the viewer (everyone, or students or alumni; their institution and campus when named), not hidden by them, never their own or their team's, under the per-person daily cap and inside pace and budget.", params: ["gold.adFrequencyCapPerDay", "ads.pool"] },
      score: { text: "Random, weighted by how far behind its even pace each ad is, so an under-delivered ad comes first and none is starved.", params: ["ads.burst", "gold.adCpmBars"] },
      order: { text: "The app places them among the posts: the first early in the list, then one after every few posts.", params: ["app.firstAdSlot", "app.adSpacing"] },
      memory: { text: "Serving marks an ad as served to the viewer today; only then can its view count, at most the daily cap.", params: ["app.adsRequested"] },
    },
  },
  {
    surface: "glances", asks: "The tray", page: "home",
    cells: {
      who: { text: "Glances still live, for everyone or only followers as the author chose; reported ones leave the viewer's tray.", params: ["glances.lifetime"] },
      score: { text: "Not scored.", params: [] },
      order: { text: "Your own first; then people with something unseen (people you follow first); then people fully seen. Most recent first within each; a person's Glances play oldest first.", params: [] },
      memory: { text: "What each viewer has seen is remembered per Glance.", params: [] },
    },
  },
  {
    surface: "trending", asks: "One list per scope", page: "discover",
    cells: {
      who: { text: "Hashtags, institutions, campuses, people, halls and events with enough distinct people and enough recent activity for the scope.", params: ["discover.score.minRecent", "discover.minParticipants.HASHTAG.CAMPUS"] },
      score: { text: "Weighted, decaying activity of distinct people against an ordinary day: momentum to a power, times breadth, quality and the kind's multiplier.", params: ["discover.score.momentumExponent", "discover.score.halfLifeHours", "discover.weights.HASHTAG.post"] },
      order: { text: "Best first, then a cap per kind near the top, categories kept apart, and admins' pins, boosts and features.", params: ["discover.diversity.topWindow", "overrides.pins"] },
      memory: { text: "A background job recomputes every scope's list on a schedule; the app reads the latest.", params: ["discover.job.intervalMinutes", "discover.diversity.listSize"] },
    },
  },
  {
    surface: "explore", asks: "12 tiles a page", page: "discover",
    cells: {
      who: { text: "Posts and surveys in scope from the Explore window: the best by quality, a few about each rising subject, and new posts still finding an audience; minus what the viewer saw in 7 days.", params: ["discover.explore.windowDays", "explore.qualityPool", "explore.freshPool"] },
      score: { text: "Quality × freshness × novelty × the rising boost × a seeded shuffle. Quality and freshness are the feed ranking policy's.", params: ["feed.quality.weights.share", "feed.halfLifeHours.VIDEO", "discover.explore.risingBoost", "discover.explore.jitter"] },
      order: { text: "“For you” alternates familiar and novel posts; authors are spaced out; surveys take set tiles.", params: ["discover.explore.authorWindow", "discover.explore.surveyFirst", "discover.explore.surveyEvery"] },
      memory: { text: "One visit is ranked once and paged without repeats; a scope's pool is shared and rebuilt every few minutes.", params: ["explore.sessionSize", "explore.poolTtl"] },
    },
  },
  {
    surface: "people", asks: "20 people a page", page: "discover",
    cells: {
      who: { text: "Featured people, friends of friends, people at the viewer's campus, rising creators and people with shared interests.", params: ["people.perSource"] },
      score: { text: "A weighted sum of proximity, mutual follows, shared interests and creator quality.", params: ["discover.people.proximity", "discover.people.mutuals", "discover.people.interests", "discover.people.quality"] },
      order: { text: "Best first, with a limit on suggestions in a row for the same reason.", params: ["discover.people.maxRunPerSource"] },
      memory: { text: "Suggestions are worked out, kept and reused for a while.", params: ["people.cache", "people.keep"] },
    },
  },
  {
    surface: "search", asks: "Results as you type", page: "discover",
    cells: {
      who: { text: "Names and posts that match: exactly, by prefix, every word, full text, or as a typo.", params: ["search.similarity"] },
      score: { text: "Text match × (1 + popularity) × closeness to the viewer × freshness (posts only).", params: ["search.campus", "search.freshness"] },
      order: { text: "Highest score first.", params: [] },
      memory: { text: "Large result counts are capped rather than guessed.", params: ["search.total"] },
    },
  },
  {
    surface: "topics", asks: "20 posts a page", page: "discover",
    cells: {
      who: { text: "Posts about the hashtag, place or person, from a recent window.", params: ["topics.window", "topics.pool"] },
      score: { text: "Top: the feed ranking policy's quality × freshness. New: newest first.", params: ["feed.quality.weights.comment", "feed.halfLifeHours.TEXT"] },
      order: { text: "Best first; ties go to the newer post.", params: [] },
      memory: { text: "Paged by position in the ranked list.", params: [] },
    },
  },
  {
    surface: "ranked", asks: "20 posts a page", page: "ranked",
    cells: {
      who: { text: "Five sources (newest, followed, campus, interests, trending), each capped and windowed; own, blocked, hidden and recently seen posts left out.", params: ["feed.sourceQuota.recent", "feed.sourceWindowDays.trending", "ranked.seenWindow"] },
      score: { text: "Quality × relevance × freshness × exploration.", params: ["feed.quality.weights.share", "feed.relevance.followsAuthor", "feed.halfLifeHours.TEXT", "feed.exploration.boost"] },
      order: { text: "A greedy rerank: authors spaced out, video runs broken, quotes kept apart, a reserved slot for new posts.", params: ["feed.rerank.maxPerAuthorInWindow", "feed.rerank.maxConsecutiveVideos", "feed.rerank.exploreEvery"] },
      memory: { text: "One list per refresh, stable while paging; past the build deadline the person gets newest first.", params: ["feed.sessionSize", "env.buildTimeout", "feed.rankedPercent"] },
    },
  },
]
