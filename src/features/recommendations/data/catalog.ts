import { SCOPE_LEVELS, TREND_KINDS, WEIGHTED_SIGNALS, type AdSettingKey, type ScopeLevel, type TrendKind, type WeightedSignal } from "../types"
import { AD_DELIVERY, APP_AD_PLACEMENT } from "../lib/ads"
import { EXPLORE_CODE, OVERRIDE_LIMITS, PEOPLE_CODE, SEARCH_RANKING, TOPIC_CODE, TREND_DIRECTION_PCT } from "../lib/discover"
import { RANKED_FEED_CODE, RANKED_FEED_ENV } from "../lib/ranking"
import { APP_FEED, FEED_LIMITS, SHORTS, SHUFFLE } from "../lib/shuffle"

// Every number that decides what the mobile app shows, where it lives, who can change it and what
// changing it does. Live values are read by path from the three super-admin settings objects; the
// rest are written in the backend or the app and change only with a release.

/** The app screens a parameter reaches. */
export type SurfaceId = "home" | "shorts" | "videos" | "sponsored" | "glances" | "trending" | "explore" | "people" | "search" | "topics" | "ranked"

export const SURFACES: Record<SurfaceId, { label: string; endpoint: string; inApp: boolean }> = {
  home: { label: "Home feed", endpoint: "GET /feed/shuffle?surface=all", inApp: true },
  shorts: { label: "Shorts", endpoint: "GET /feed/shuffle?surface=shorts", inApp: true },
  videos: { label: "Videos under a video", endpoint: "GET /feed/shuffle?surface=videos", inApp: true },
  sponsored: { label: "Sponsored posts", endpoint: "GET /ads/feed", inApp: true },
  glances: { label: "Glances", endpoint: "GET /glances", inApp: true },
  trending: { label: "Trending", endpoint: "GET /discover/trending", inApp: true },
  explore: { label: "Explore", endpoint: "GET /discover/explore", inApp: true },
  people: { label: "People to follow", endpoint: "GET /discover/people", inApp: true },
  search: { label: "Search", endpoint: "GET /search", inApp: true },
  topics: { label: "Topic pages", endpoint: "GET /discover/subjects/:kind/:id/posts", inApp: true },
  ranked: { label: "Ranked home feed", endpoint: "GET /feed", inApp: false },
}
export const SURFACE_IDS = Object.keys(SURFACES) as SurfaceId[]

/** Who can change a parameter, and how fast a change reaches phones. */
export type ControlId = "feed-policy" | "discover-policy" | "gold" | "environment" | "code" | "app"

export const CONTROLS: Record<ControlId, { label: string; where: string; speed: string }> = {
  "feed-policy": { label: "Feed ranking policy", where: "Super-admin, as a numbered version (POST /feed-ranking/policies)", speed: "Live on every gateway within 30 seconds" },
  "discover-policy": { label: "Discover policy", where: "Super-admin, as a numbered version (POST /discover-studio/policy/versions)", speed: "Live within 30 seconds; trend lists change at the trends job's next run" },
  gold: { label: "Gold settings", where: "Financials › Gold & pricing", speed: "Live within about 15 seconds; running ads keep their terms" },
  environment: { label: "Server setting", where: "The API gateway's environment", speed: "Needs a gateway restart" },
  code: { label: "Backend code", where: "adbox-backend source", speed: "Needs a backend release" },
  app: { label: "Mobile app", where: "adbox-mobile-mvp source", speed: "Needs an app release, and people to update" },
}
export const CONTROL_IDS = Object.keys(CONTROLS) as ControlId[]

/** Which algorithm a parameter belongs to: one page of this section each. */
export type AreaId = "home" | "sponsored" | "glances" | "ranked" | "trending" | "explore" | "people" | "search" | "topics"

export const AREAS: Record<AreaId, { label: string; page: "home" | "sponsored" | "ranked" | "discover" }> = {
  home: { label: "Home, Shorts & videos", page: "home" },
  glances: { label: "Glances", page: "home" },
  sponsored: { label: "Sponsored posts", page: "sponsored" },
  ranked: { label: "Ranked feed", page: "ranked" },
  trending: { label: "Discover · Trending", page: "discover" },
  explore: { label: "Discover · Explore", page: "discover" },
  people: { label: "Discover · People", page: "discover" },
  search: { label: "Discover · Search", page: "discover" },
  topics: { label: "Discover · Topic pages", page: "discover" },
}
export const AREA_IDS = Object.keys(AREAS) as AreaId[]

/** The step of the flow a parameter acts on. */
export type StageId = "request" | "eligibility" | "candidates" | "scoring" | "ordering" | "session" | "delivery" | "safety" | "background"

export const STAGES: Record<StageId, string> = {
  request: "Asking for a page",
  eligibility: "Who may see what",
  candidates: "Finding candidates",
  scoring: "Scoring",
  ordering: "Ordering",
  session: "Memory & sessions",
  delivery: "Pacing",
  safety: "Deadlines & fallback",
  background: "Background jobs",
}

export type Unit = "weight" | "×" | "share" | "%" | "hours" | "days" | "minutes" | "seconds" | "ms" | "posts" | "people" | "campaigns" | "subjects" | "views" | "bars" | "px" | "items" | "place" | "places" | "ratio"

export type ValueRef =
  | { from: "feed"; path: string[] }
  | { from: "discover"; path: string[] }
  | { from: "gold"; key: AdSettingKey }
  | { from: "ranked-percent" }
  | { from: "fixed"; value: number }

export type Parameter = {
  /** Stable and URL-safe; the `?param=` that opens its details. */
  id: string
  name: string
  /** As written where it lives: a settings path, a constant or a variable. */
  key: string
  area: AreaId
  stage: StageId
  surfaces: SurfaceId[]
  control: ControlId
  value: ValueRef
  unit: Unit
  effect: string
  /** Where it is defined, from its repository's root. */
  file: string
  /** Fixed ranges for numbers outside the two policies (gold, environment). */
  range?: { min: number; max: number }
}

const FEED_FILE = "adbox-backend · libs/recommendation/src/recommendation.config.ts"
const DISCOVER_FILE = "adbox-backend · libs/recommendation/src/discover-policy.ts"
const GOLD_FILE = "adbox-backend · libs/gold-settings/src/gold-settings.ts"

type Common = Pick<Parameter, "name" | "area" | "stage" | "surfaces" | "unit" | "effect">

const fromFeed = (path: string, common: Common): Parameter => ({
  id: `feed.${path}`, key: path, control: "feed-policy", value: { from: "feed", path: path.split(".") }, file: FEED_FILE, ...common,
})
const fromDiscover = (path: string, common: Common): Parameter => ({
  id: `discover.${path}`, key: path, control: "discover-policy", value: { from: "discover", path: path.split(".") }, file: DISCOVER_FILE, ...common,
})
const fromGold = (key: AdSettingKey, range: Parameter["range"], common: Common): Parameter => ({
  id: `gold.${key}`, key, control: "gold", value: { from: "gold", key }, file: GOLD_FILE, range, ...common,
})
const fixed = (id: string, key: string, value: number, control: "code" | "app" | "environment", file: string, common: Common, range?: Parameter["range"]): Parameter => ({
  id, key, control, value: { from: "fixed", value }, file, range, ...common,
})

// Where the feed policy's quality and freshness reach the app today: Discover scores Explore and a
// topic's Top posts with them (apps/api-gateway/src/discover). Home reaches them once it calls GET /feed.
const QUALITY_REACH: SurfaceId[] = ["ranked", "explore", "topics"]

// ── Home, Shorts and the videos under a video: GET /feed/shuffle ──────────

const SHUFFLE_FILE = "adbox-backend · apps/api-gateway/src/feed/shuffle-feed.service.ts"
const FEED_QUERY_FILE = "adbox-backend · apps/api-gateway/src/resource/dto/feed-query.dto.ts"
const SESSION_FILE = "adbox-mobile-mvp · lib/data/api/shuffle_session.dart"
const APP_FEED_FILE = "adbox-mobile-mvp · lib/data/repositories/remote_feed_repository.dart"
const shuffled: SurfaceId[] = ["home", "shorts", "videos"]

const homeParameters: Parameter[] = [
  fixed("shuffle.halfLife", "SHUFFLE_HALF_LIFE_HOURS", SHUFFLE.halfLifeHours, "code", SHUFFLE_FILE, {
    name: "Draw half-life", area: "home", stage: "scoring", surfaces: shuffled, unit: "hours",
    effect: "A post's chance of being drawn halves for every this many hours of age. Longer keeps older posts in rotation; shorter makes every list lean harder on what is new.",
  }),
  fixed("shuffle.floor", "SHUFFLE_WEIGHT_FLOOR", SHUFFLE.weightFloor, "code", SHUFFLE_FILE, {
    name: "Chance floor", area: "home", stage: "scoring", surfaces: shuffled, unit: "share",
    effect: "No post's chance falls below this share of a brand-new post's, so the older catalogue still comes round, further down. With a 24-hour half-life a post reaches the floor at about 5 days old.",
  }),
  fixed("shuffle.spotlight", "SPOTLIGHT_WEIGHT", SHUFFLE.spotlightWeight, "code", SHUFFLE_FILE, {
    name: "Spotlight boost", area: "home", stage: "scoring", surfaces: shuffled, unit: "×",
    effect: "A Spotlight author's posts are this many times as likely to be drawn, at every age. Never applied to an anonymous post: being drawn more often would give its author away.",
  }),
  fixed("shuffle.pool", "SHUFFLE_POOL_CAP", SHUFFLE.poolCap, "code", SHUFFLE_FILE, {
    name: "Draw pool", area: "home", stage: "candidates", surfaces: shuffled, unit: "posts",
    effect: "Each page is drawn from the newest this many posts the session has not been served. Past it, the oldest posts wait until newer ones have been served.",
  }),
  fixed("shuffle.memory", "SHUFFLE_SESSION_TTL_SECONDS", SHUFFLE.sessionTtlHours, "code", SHUFFLE_FILE, {
    name: "Session memory", area: "home", stage: "session", surfaces: shuffled, unit: "hours",
    effect: "How long the server remembers what a session has been served, renewed on every page. Nothing is served twice on a list within it.",
  }),
  fixed("shuffle.newCap", "NEW_POSTS_COUNT_CAP", SHUFFLE.newPostsCountCap, "code", SHUFFLE_FILE, {
    name: "New-posts count cap", area: "home", stage: "request", surfaces: ["home"], unit: "posts",
    effect: "The most new posts GET /feed/new counts for the dot on Home. The app shows a dot, not the number, so this only bounds the query.",
  }),
  fixed("feed.defaultLimit", "FEED_DEFAULT_LIMIT", FEED_LIMITS.defaultLimit, "code", FEED_QUERY_FILE, {
    name: "Default page size", area: "home", stage: "request", surfaces: [...shuffled, "ranked"], unit: "posts",
    effect: "Posts in a page when the app does not say how many.",
  }),
  fixed("feed.maxLimit", "FEED_MAX_LIMIT", FEED_LIMITS.maxLimit, "code", FEED_QUERY_FILE, {
    name: "Largest page", area: "home", stage: "request", surfaces: [...shuffled, "ranked"], unit: "posts",
    effect: "The most posts one page may ask for; a larger limit is refused.",
  }),
  fixed("shorts.aspect", "SHORT_MAX_ASPECT_RATIO", SHORTS.maxAspectRatio, "code", FEED_QUERY_FILE, {
    name: "Short: widest shape", area: "home", stage: "eligibility", surfaces: ["shorts"], unit: "ratio",
    effect: "A Short is a portrait video: width ÷ height at most this (9:16 is 0.56, 4:5 is 0.8). There is no separate upload; any such video is one.",
  }),
  fixed("shorts.seconds", "SHORT_MAX_SECONDS", SHORTS.maxSeconds, "code", FEED_QUERY_FILE, {
    name: "Short: longest", area: "home", stage: "eligibility", surfaces: ["shorts"], unit: "seconds",
    effect: "The longest a portrait video can be and still count as a Short.",
  }),
  fixed("app.idleLimit", "ShuffleSession.idleLimit", APP_FEED.idleLimitMinutes, "app", SESSION_FILE, {
    name: "New session after", area: "home", stage: "session", surfaces: shuffled, unit: "minutes",
    effect: "Away from the app (backgrounded or closed) for longer than this and the next visit starts a new session, so posts already served can come round again. Coming back sooner carries on.",
  }),
  fixed("app.homePage", "_feedPage", APP_FEED.homePage, "app", APP_FEED_FILE, {
    name: "Home page size", area: "home", stage: "request", surfaces: ["home"], unit: "posts",
    effect: "Posts the app asks for per page of Home.",
  }),
  fixed("app.shortsPage", "_shortsPage", APP_FEED.shortsPage, "app", APP_FEED_FILE, {
    name: "Shorts page size", area: "home", stage: "request", surfaces: ["shorts"], unit: "posts",
    effect: "Shorts the app asks for per page.",
  }),
  fixed("app.videosPage", "_videosPage", APP_FEED.videosPage, "app", APP_FEED_FILE, {
    name: "Videos page size", area: "home", stage: "request", surfaces: ["videos"], unit: "posts",
    effect: "Videos the app asks for per page under an opened video.",
  }),
  fixed("app.loadMore", "_loadMoreThreshold", APP_FEED.loadMorePx, "app", "adbox-mobile-mvp · lib/ui/home/home_widgets/home_screen.dart", {
    name: "Load the next page at", area: "home", stage: "request", surfaces: ["home"], unit: "px",
    effect: "Home asks for the next page when the reader is within this distance of the end, so scrolling rarely waits.",
  }),
  fixed("glances.lifetime", "expiresAt = createdAt + 24 h", 24, "code", "adbox-backend · docs/glances.md", {
    name: "Glance lifetime", area: "glances", stage: "eligibility", surfaces: ["glances"], unit: "hours",
    effect: "A Glance leaves every tray this long after it was posted.",
  }),
]

// ── Sponsored posts: GET /ads/feed, placed by the app ─────────────────────

const ADS_FILE = "adbox-backend · apps/api-gateway/src/ads/ad-delivery.constants.ts"
const APP_ADS_FILE = "adbox-mobile-mvp · lib/ui/home/sections/feed/mixed_feed_section.dart"

const sponsoredParameters: Parameter[] = [
  fromGold("adFrequencyCapPerDay", { min: 1, max: 100 }, {
    name: "Views per person per ad, a day", area: "sponsored", stage: "eligibility", surfaces: ["sponsored"], unit: "views",
    effect: "The most times one person is served one ad in a delivery day (Africa/Accra). Lower spreads each ad across more people; higher lets one person see it more often.",
  }),
  fromGold("adCpmBars", { min: 1, max: 10_000_000 }, {
    name: "Price per 1,000 views", area: "sponsored", stage: "delivery", surfaces: ["sponsored"], unit: "bars",
    effect: "A daily budget buys budget × 1,000 ÷ price views a day, which is the pace an ad is delivered at. A change applies to ads created after it.",
  }),
  fromGold("adMinAudience", { min: 0, max: 1_000_000 }, {
    name: "Smallest audience", area: "sponsored", stage: "eligibility", surfaces: ["sponsored"], unit: "people",
    effect: "An ad cannot be aimed at fewer people than this, so no ad singles anyone out. Checked when the ad is created.",
  }),
  fromGold("adDailyBudgetMinBars", { min: 1, max: 10_000_000 }, {
    name: "Least daily budget", area: "sponsored", stage: "delivery", surfaces: ["sponsored"], unit: "bars",
    effect: "With the price, the slowest an ad can be delivered: the fewest views it may buy a day.",
  }),
  fromGold("adDailyBudgetMaxBars", { min: 1, max: 10_000_000 }, {
    name: "Most daily budget", area: "sponsored", stage: "delivery", surfaces: ["sponsored"], unit: "bars",
    effect: "With the price, the fastest an ad can be delivered: the most views it may buy a day.",
  }),
  fixed("ads.burst", "AD_PACING_BURST", AD_DELIVERY.pacingBurst, "code", ADS_FILE, {
    name: "Pacing head start", area: "sponsored", stage: "delivery", surfaces: ["sponsored"], unit: "share",
    effect: "An ad may run this share of its day's views ahead of an even spread, so a quiet morning does not starve it. Larger front-loads delivery.",
  }),
  fixed("ads.pool", "AD_CANDIDATE_POOL", AD_DELIVERY.candidatePool, "code", ADS_FILE, {
    name: "Campaigns considered", area: "sponsored", stage: "candidates", surfaces: ["sponsored"], unit: "campaigns",
    effect: "Running campaigns aimed at the viewer, newest start first, weighed for each request.",
  }),
  fixed("ads.defaultLimit", "AD_FEED_DEFAULT_LIMIT", AD_DELIVERY.defaultLimit, "code", ADS_FILE, {
    name: "Ads per request (default)", area: "sponsored", stage: "request", surfaces: ["sponsored"], unit: "items",
    effect: "Ads served when the app does not say how many.",
  }),
  fixed("ads.maxLimit", "AD_FEED_MAX_LIMIT", AD_DELIVERY.maxLimit, "code", ADS_FILE, {
    name: "Ads per request (most)", area: "sponsored", stage: "request", surfaces: ["sponsored"], unit: "items",
    effect: "The most ads one request may ask for.",
  }),
  fixed("app.adsRequested", "SponsoredFeedController.limit", APP_AD_PLACEMENT.requested, "app", "adbox-mobile-mvp · lib/features/ads/data/sponsored_feed.dart", {
    name: "Ads the app asks for", area: "sponsored", stage: "request", surfaces: ["sponsored"], unit: "items",
    effect: "How many ads one load of Home asks the server for.",
  }),
  fixed("app.firstAdSlot", "MixedFeedSection.firstAdSlot", APP_AD_PLACEMENT.firstSlot + 1, "app", APP_ADS_FILE, {
    name: "First ad at", area: "sponsored", stage: "ordering", surfaces: ["sponsored", "home"], unit: "place",
    effect: "The place in Home's list of posts where the first ad goes (written as index 3 in the app).",
  }),
  fixed("app.adSpacing", "MixedFeedSection.adSpacing", APP_AD_PLACEMENT.spacing, "app", APP_ADS_FILE, {
    name: "Posts between ads", area: "sponsored", stage: "ordering", surfaces: ["sponsored", "home"], unit: "posts",
    effect: "After the first ad, one more after every this many posts, and only where posts surround it.",
  }),
]

// ── The ranked feed: GET /feed (built; the app does not call it yet) ─────

const FEED_SERVICE_FILE = "adbox-backend · apps/api-gateway/src/feed/feed.service.ts"
const CANDIDATES_FILE = "adbox-backend · apps/api-gateway/src/feed/feed-candidates.service.ts"
const POLICY_SERVICE_FILE = "adbox-backend · apps/api-gateway/src/feed/feed-policy.service.ts"

const weightEffect = (action: string, favours: string) =>
  `How much one ${action} adds to a post's engagement. Quality is weighted engagement per impression, so raising it favours posts ${favours}.`

const sourceNames = {
  recent: ["Newest posts", "Newest public posts, whatever their age, so a small catalogue still fills a list."],
  following: ["Followed accounts", "Recent posts by accounts the viewer follows."],
  campus: ["Viewer's campus", "Recent posts by people at the viewer's campus, else their institution."],
  interest: ["Shared interests", "Recent posts by people who share an onboarding interest with the viewer."],
  trending: ["Trending", "Recent posts with the most likes."],
} as const

const rankedParameters: Parameter[] = [
  {
    id: "feed.rankedPercent", key: "rankedPercent", control: "feed-policy", value: { from: "ranked-percent" }, file: "adbox-backend · apps/super-admin/src/feed-ranking/feed-ranking.service.ts",
    name: "Ranked share", area: "ranked", stage: "request", surfaces: ["ranked"], unit: "%",
    effect: "The share of people served the ranked feed, by a stable hash of their account, so nobody flips between groups as it grows. Everyone else gets newest first; 0 switches ranking off for everyone.",
  },
  fromFeed("quality.weights.like", { name: "Like weight", area: "ranked", stage: "scoring", surfaces: QUALITY_REACH, unit: "weight", effect: weightEffect("like", "people like") }),
  fromFeed("quality.weights.comment", { name: "Comment weight", area: "ranked", stage: "scoring", surfaces: QUALITY_REACH, unit: "weight", effect: weightEffect("comment", "that start conversations") }),
  fromFeed("quality.weights.share", { name: "Share weight", area: "ranked", stage: "scoring", surfaces: QUALITY_REACH, unit: "weight", effect: weightEffect("share", "people pass on") }),
  fromFeed("quality.weights.bookmark", { name: "Save weight", area: "ranked", stage: "scoring", surfaces: QUALITY_REACH, unit: "weight", effect: weightEffect("save", "people keep for later") }),
  fromFeed("quality.weights.completion", {
    name: "Completed-watch weight", area: "ranked", stage: "scoring", surfaces: QUALITY_REACH, unit: "weight",
    effect: "How much one finished video watch adds. Each viewer counts once, however many replays, so raising it favours videos people watch to the end.",
  }),
  fromFeed("quality.hidePenalty", {
    name: "Hide penalty", area: "ranked", stage: "scoring", surfaces: QUALITY_REACH, unit: "weight",
    effect: "Taken off a post's engagement for each person who hid it or marked it not interested. Higher sinks posts people reject; quality never drops below a small floor.",
  }),
  fromFeed("quality.priorStrength", {
    name: "Prior strength", area: "ranked", stage: "scoring", surfaces: QUALITY_REACH, unit: "views",
    effect: "How many impressions' worth of evidence every post starts with, at the prior rate. Higher makes quality slower to react, so two lucky likes cannot outrank a reliably good post.",
  }),
  fromFeed("quality.priorRate", {
    name: "Prior rate", area: "ranked", stage: "scoring", surfaces: QUALITY_REACH, unit: "ratio",
    effect: "The weighted engagement per impression a post is assumed to have before there is evidence. Every post starts here and moves toward its real rate.",
  }),
  fromFeed("relevance.followsAuthor", {
    name: "Follows the author", area: "ranked", stage: "scoring", surfaces: ["ranked"], unit: "weight",
    effect: "Added to relevance, which starts at 1, when the viewer follows the author. At 1.5 a followed author's post scores 2.5 times an unrelated one, before other ties.",
  }),
  fromFeed("relevance.sameCampus", {
    name: "Same campus", area: "ranked", stage: "scoring", surfaces: ["ranked"], unit: "weight",
    effect: "Added to relevance when the author is at the viewer's campus.",
  }),
  fromFeed("relevance.sameInstitution", {
    name: "Same institution", area: "ranked", stage: "scoring", surfaces: ["ranked"], unit: "weight",
    effect: "Added when the author is at the viewer's institution but another campus; never on top of the campus bonus.",
  }),
  fromFeed("relevance.perSharedInterest", {
    name: "Per shared interest", area: "ranked", stage: "scoring", surfaces: ["ranked"], unit: "weight",
    effect: "Added for each onboarding interest the viewer and author share, up to the cap.",
  }),
  fromFeed("relevance.maxSharedInterests", {
    name: "Shared interests counted", area: "ranked", stage: "scoring", surfaces: ["ranked"], unit: "items",
    effect: "The most shared interests that count toward relevance.",
  }),
  fromFeed("halfLifeHours.TEXT", {
    name: "Text half-life", area: "ranked", stage: "scoring", surfaces: QUALITY_REACH, unit: "hours",
    effect: "A text post's freshness halves every this many hours. Longer keeps older posts competitive; shorter favours what is new.",
  }),
  fromFeed("halfLifeHours.IMAGE", {
    name: "Picture half-life", area: "ranked", stage: "scoring", surfaces: QUALITY_REACH, unit: "hours",
    effect: "A picture post's freshness halves every this many hours.",
  }),
  fromFeed("halfLifeHours.VIDEO", {
    name: "Video half-life", area: "ranked", stage: "scoring", surfaces: QUALITY_REACH, unit: "hours",
    effect: "A video's freshness halves every this many hours. Videos get longer by default because they take longer to find their audience.",
  }),
  fromFeed("exploration.impressionThreshold", {
    name: "New-post threshold", area: "ranked", stage: "scoring", surfaces: ["ranked", "explore"], unit: "views",
    effect: "A post with fewer impressions than this is still finding its audience: it gets the exploration boost in the ranked feed and, while inside the explore window, a place in Explore's fresh pool.",
  }),
  fromFeed("exploration.boost", {
    name: "Exploration boost", area: "ranked", stage: "scoring", surfaces: ["ranked"], unit: "×",
    effect: "Multiplies the score of a post under the new-post threshold. Higher gives new posts and new creators more first exposure.",
  }),
  fromFeed("exploration.windowHours", {
    name: "Explore window", area: "ranked", stage: "ordering", surfaces: ["ranked", "explore"], unit: "hours",
    effect: "Only posts this new can take the reserved explore slot in the ranked feed, or join Explore's fresh pool.",
  }),
  fromFeed("rerank.maxPerAuthorInWindow", {
    name: "Posts per author", area: "ranked", stage: "ordering", surfaces: ["ranked"], unit: "posts",
    effect: "At most this many posts by one author in any run of the author window. Lower spreads authors out.",
  }),
  fromFeed("rerank.authorWindow", {
    name: "Author window", area: "ranked", stage: "ordering", surfaces: ["ranked"], unit: "posts",
    effect: "The run of posts the author cap applies to: with 5 and a cap of 1, an author appears at most once in any 5 posts in a row.",
  }),
  fromFeed("rerank.maxConsecutiveVideos", {
    name: "Videos in a row", area: "ranked", stage: "ordering", surfaces: ["ranked"], unit: "posts",
    effect: "The longest unbroken run of videos. Lower mixes text and pictures in sooner.",
  }),
  fromFeed("rerank.exploreEvery", {
    name: "Explore slot every", area: "ranked", stage: "ordering", surfaces: ["ranked"], unit: "posts",
    effect: "At least one new post, still finding its audience, in every block of this many. 0 turns the reserved slot off.",
  }),
  ...(Object.keys(sourceNames) as Array<keyof typeof sourceNames>).map((source) => fromFeed(`sourceQuota.${source}`, {
    name: `${sourceNames[source][0]}: fetched`, area: "ranked", stage: "candidates", surfaces: ["ranked"], unit: "posts",
    effect: `${sourceNames[source][1]} At most this many per list; 0 turns the source off${source === "recent" ? " (the newest-posts source never goes below 1)" : ""}.`,
  })),
  ...(["following", "campus", "interest", "trending"] as const).map((source) => fromFeed(`sourceWindowDays.${source}`, {
    name: `${sourceNames[source][0]}: look-back`, area: "ranked", stage: "candidates", surfaces: ["ranked"], unit: "days",
    effect: `How far back the ${sourceNames[source][0].toLowerCase()} source looks.`,
  })),
  fromFeed("sessionSize", {
    name: "List length", area: "ranked", stage: "session", surfaces: ["ranked"], unit: "posts",
    effect: "Posts ranked into one list; later pages are slices of it. Recently seen posts come back only when fewer than this many unseen are left.",
  }),
  fixed("env.rankedPercent", "FEED_RANKED_PERCENT", RANKED_FEED_ENV.rankedPercent, "environment", POLICY_SERVICE_FILE, {
    name: "Ranked share without a policy", area: "ranked", stage: "request", surfaces: ["ranked"], unit: "%",
    effect: "The ranked share when no super-admin version is live. Deactivating every version returns to it.",
  }, { min: 0, max: 100 }),
  fixed("env.policyRefresh", "FEED_POLICY_REFRESH_MS", RANKED_FEED_ENV.policyRefreshMs, "environment", POLICY_SERVICE_FILE, {
    name: "Policy refresh", area: "ranked", stage: "safety", surfaces: QUALITY_REACH, unit: "ms",
    effect: "How often each gateway re-reads the active feed policy: the longest a saved change takes to reach every phone. A failed read keeps the last good version.",
  }),
  fixed("env.buildTimeout", "FEED_BUILD_TIMEOUT_MS", RANKED_FEED_ENV.buildTimeoutMs, "environment", FEED_SERVICE_FILE, {
    name: "Build deadline", area: "ranked", stage: "safety", surfaces: ["ranked"], unit: "ms",
    effect: "Building a ranked list that takes longer than this is abandoned and the person gets newest first, so the ranker never costs anyone their feed.",
  }),
  fixed("env.sourceTimeout", "FEED_SOURCE_TIMEOUT_MS", RANKED_FEED_ENV.sourceTimeoutMs, "environment", FEED_SERVICE_FILE, {
    name: "Source deadline", area: "ranked", stage: "safety", surfaces: ["ranked"], unit: "ms",
    effect: "Each candidate source that misses this deadline is skipped; the list is built from the others.",
  }),
  fixed("ranked.sessionTtl", "FEED_SESSION_TTL_SECONDS", RANKED_FEED_CODE.sessionTtlMinutes, "code", FEED_SERVICE_FILE, {
    name: "List kept for", area: "ranked", stage: "session", surfaces: ["ranked"], unit: "minutes",
    effect: "How long a ranked list can be paged through without reshuffling. An expired cursor quietly starts a new list.",
  }),
  fixed("ranked.seenWindow", "SEEN_WINDOW_MS", RANKED_FEED_CODE.seenWindowDays, "code", CANDIDATES_FILE, {
    name: "Seen means within", area: "ranked", stage: "eligibility", surfaces: ["ranked"], unit: "days",
    effect: "Posts with an impression this recent count as seen and are left out while enough unseen remain.",
  }),
  fixed("ranked.seenLimit", "SEEN_LIMIT", RANKED_FEED_CODE.seenLimit, "code", CANDIDATES_FILE, {
    name: "Seen posts checked", area: "ranked", stage: "eligibility", surfaces: ["ranked"], unit: "posts",
    effect: "The most recently seen posts loaded for that check.",
  }),
]

// ── Discover: trends ───────────────────────────────────────────────────────

export const KIND_LABELS: Record<TrendKind, { one: string; many: string }> = {
  HASHTAG: { one: "Hashtag", many: "Hashtags" },
  INSTITUTION: { one: "Institution", many: "Institutions" },
  CAMPUS: { one: "Campus", many: "Campuses" },
  PERSON: { one: "Person", many: "People" },
  HALL: { one: "Hall", many: "Halls" },
  EVENT: { one: "Event", many: "Events" },
}

export const SIGNAL_LABELS: Record<WeightedSignal, { label: string; phrase: string }> = {
  post: { label: "Posts", phrase: "post about it" },
  like: { label: "Likes", phrase: "like" },
  comment: { label: "Comments", phrase: "comment" },
  share: { label: "Shares", phrase: "share" },
  bookmark: { label: "Saves", phrase: "save" },
  follow: { label: "Follows", phrase: "follow" },
  search: { label: "Searches", phrase: "search naming it exactly" },
  open: { label: "Page opens", phrase: "opening of its page" },
  scope: { label: "Chosen as scope", phrase: "choice of it as their Discover scope" },
  rsvp: { label: "RSVPs", phrase: "RSVP" },
  checkin: { label: "Check-ins", phrase: "check-in" },
}

export const LEVEL_LABELS: Record<ScopeLevel, { label: string; phrase: string }> = {
  GLOBAL: { label: "Nationwide", phrase: "the nationwide" },
  REGION: { label: "Region", phrase: "a region's" },
  INSTITUTION: { label: "Institution", phrase: "an institution's" },
  CAMPUS: { label: "Campus", phrase: "a campus's" },
}

const TRENDS_FILE = "adbox-backend · libs/recommendation/src/trends.ts"
const OVERRIDES_FILE = "adbox-backend · libs/recommendation/src/trend-overrides.ts"

const trendParameters: Parameter[] = [
  ...TREND_KINDS.flatMap((kind) => WEIGHTED_SIGNALS.map((signal) => fromDiscover(`weights.${kind}.${signal}`, {
    name: `${SIGNAL_LABELS[signal].label} · ${KIND_LABELS[kind].one}`, area: "trending", stage: "scoring", surfaces: ["trending"], unit: "weight",
    effect: `How much one person's ${SIGNAL_LABELS[signal].phrase} counts toward a ${KIND_LABELS[kind].one.toLowerCase()}'s trend score. 0 ignores it.`,
  }))),
  fromDiscover("score.recentWindowHours", {
    name: "Recent window", area: "trending", stage: "scoring", surfaces: ["trending"], unit: "hours",
    effect: "The current hour and the hours before it that count as now. Momentum compares this window with an ordinary day.",
  }),
  fromDiscover("score.halfLifeHours", {
    name: "Recent half-life", area: "trending", stage: "scoring", surfaces: ["trending"], unit: "hours",
    effect: "Activity inside the recent window halves in weight every this many hours, so the last few hours count most. Shorter makes lists react faster.",
  }),
  fromDiscover("score.baselineDays", {
    name: "Baseline days", area: "trending", stage: "scoring", surfaces: ["trending"], unit: "days",
    effect: "The days before the window that make up an ordinary day.",
  }),
  fromDiscover("score.smoothing", {
    name: "Smoothing (k)", area: "trending", stage: "scoring", surfaces: ["trending"], unit: "weight",
    effect: "Added to both sides of momentum = (recent + k) ÷ (baseline + k). Higher stops a small subject going from 1 to 5 from looking like a surge.",
  }),
  fromDiscover("score.momentumExponent", {
    name: "Momentum exponent", area: "trending", stage: "scoring", surfaces: ["trending"], unit: "ratio",
    effect: "How strongly momentum drives the score. Below 1 tempers spikes, so steady, broad subjects keep up with sudden ones.",
  }),
  fromDiscover("score.qualityPenalty", {
    name: "Hide & report penalty", area: "trending", stage: "scoring", surfaces: ["trending"], unit: "weight",
    effect: "Quality = 1 ÷ (1 + penalty × (hides + reports) ÷ impressions). Higher pushes down subjects people reject.",
  }),
  fromDiscover("score.minRecent", {
    name: "Least recent activity", area: "trending", stage: "eligibility", surfaces: ["trending"], unit: "weight",
    effect: "A subject needs at least this much decayed, weighted recent activity to be ranked at all.",
  }),
  ...TREND_KINDS.flatMap((kind) => SCOPE_LEVELS.map((level) => fromDiscover(`minParticipants.${kind}.${level}`, {
    name: `Fewest people · ${KIND_LABELS[kind].one} · ${LEVEL_LABELS[level].label}`, area: "trending", stage: "eligibility", surfaces: ["trending"], unit: "people",
    effect: `Distinct people needed in the recent window for a ${KIND_LABELS[kind].one.toLowerCase()} to trend in ${LEVEL_LABELS[level].phrase} list.`,
  }))),
  ...TREND_KINDS.map((kind) => fromDiscover(`kindMultiplier.${kind}`, {
    name: `${KIND_LABELS[kind].one} multiplier`, area: "trending", stage: "scoring", surfaces: ["trending"], unit: "×",
    effect: `Scales every ${KIND_LABELS[kind].one.toLowerCase()}'s score, to balance the kinds of subject against each other.`,
  })),
  fromDiscover("diversity.topWindow", {
    name: "Top of the list", area: "trending", stage: "ordering", surfaces: ["trending"], unit: "places",
    effect: "The first places the per-kind caps apply to.",
  }),
  ...TREND_KINDS.map((kind) => fromDiscover(`diversity.maxPerKindInTop.${kind}`, {
    name: `${KIND_LABELS[kind].many} in the top`, area: "trending", stage: "ordering", surfaces: ["trending"], unit: "subjects",
    effect: `At most this many ${KIND_LABELS[kind].many.toLowerCase()} in the top places.`,
  })),
  fromDiscover("diversity.categoryApartWithin", {
    name: "Category spacing", area: "trending", stage: "ordering", surfaces: ["trending"], unit: "places",
    effect: "Within the first this many places, two subjects of one category are never side by side.",
  }),
  fromDiscover("diversity.listSize", {
    name: "List length", area: "trending", stage: "ordering", surfaces: ["trending"], unit: "subjects",
    effect: "Subjects kept in each scope's list.",
  }),
  fromDiscover("job.intervalMinutes", {
    name: "Trends job runs every", area: "trending", stage: "background", surfaces: ["trending", "explore"], unit: "minutes",
    effect: "How often every list is recomputed; a new policy reaches the lists at the next run.",
  }),
  fromDiscover("job.minActiveUsers.INSTITUTION", {
    name: "Smallest institution with its own list", area: "trending", stage: "background", surfaces: ["trending"], unit: "people",
    effect: "An institution with fewer active people shares the wider list instead.",
  }),
  fromDiscover("job.minActiveUsers.CAMPUS", {
    name: "Smallest campus with its own list", area: "trending", stage: "background", surfaces: ["trending"], unit: "people",
    effect: "A campus with fewer active people shares the wider list instead.",
  }),
  fromDiscover("job.activeUserDays", {
    name: "Active means within", area: "trending", stage: "background", surfaces: ["trending"], unit: "days",
    effect: "Days of activity that make someone active, for the two rules above.",
  }),
  fromDiscover("job.staleAfterIntervals", {
    name: "Stale after", area: "trending", stage: "background", surfaces: ["trending"], unit: "items",
    effect: "A list older than this many runs counts as stale.",
  }),
  fromDiscover("job.snapshotRetentionDays", {
    name: "Lists kept for", area: "trending", stage: "background", surfaces: ["trending"], unit: "days",
    effect: "How long past lists are kept.",
  }),
  fromDiscover("job.signalRetentionDays", {
    name: "Signals kept for", area: "trending", stage: "background", surfaces: ["trending"], unit: "days",
    effect: "How long hourly activity is kept. It must cover the baseline days plus the recent window.",
  }),
  fixed("env.discoverRefresh", "DISCOVER_SETTINGS_REFRESH_MS", 30_000, "environment", "adbox-backend · apps/api-gateway/src/discover/discover-settings.service.ts", {
    name: "Discover settings refresh", area: "trending", stage: "safety", surfaces: ["trending", "explore", "people"], unit: "ms",
    effect: "How often each gateway re-reads Discover's policy and layout. A failed read keeps the last good one; an invalid version is ignored for the defaults.",
  }),
  fixed("trends.direction", "scoreSubject: changePct ≥ 10", TREND_DIRECTION_PCT, "code", TRENDS_FILE, {
    name: "Arrow threshold", area: "trending", stage: "ordering", surfaces: ["trending"], unit: "%",
    effect: "A subject shows ↑ when its recent window is at least this much above an ordinary day, ↓ when this much below, and steady between.",
  }),
  fixed("overrides.pins", "maxPinsPerScope", OVERRIDE_LIMITS.maxPinsPerScope, "code", OVERRIDES_FILE, {
    name: "Pins per list", area: "trending", stage: "ordering", surfaces: ["trending"], unit: "subjects",
    effect: "Admins can pin at most this many subjects in one scope's list.",
  }),
  fixed("overrides.featured", "maxFeaturedInTop10", OVERRIDE_LIMITS.maxFeaturedInTop10, "code", OVERRIDES_FILE, {
    name: "Featured in the top 10", area: "trending", stage: "ordering", surfaces: ["trending"], unit: "subjects",
    effect: "At most this many admin-added subjects in a list's top 10. The app marks them Featured.",
  }),
  fixed("overrides.featureRank", "defaultFeatureRank", OVERRIDE_LIMITS.defaultFeatureRank, "code", OVERRIDES_FILE, {
    name: "Featured place by default", area: "trending", stage: "ordering", surfaces: ["trending"], unit: "place",
    effect: "Where a featured subject goes when no place is chosen.",
  }),
  fixed("overrides.maxRank", "maxRank", OVERRIDE_LIMITS.maxRank, "code", OVERRIDES_FILE, {
    name: "Pins and features within", area: "trending", stage: "ordering", surfaces: ["trending"], unit: "places",
    effect: "Pins and features can only place a subject in the top this many.",
  }),
  fixed("overrides.minMultiplier", "minMultiplier", OVERRIDE_LIMITS.minMultiplier, "code", OVERRIDES_FILE, {
    name: "Strongest dampening", area: "trending", stage: "scoring", surfaces: ["trending"], unit: "×",
    effect: "The lowest an admin boost can scale a subject's score.",
  }),
  fixed("overrides.maxMultiplier", "maxMultiplier", OVERRIDE_LIMITS.maxMultiplier, "code", OVERRIDES_FILE, {
    name: "Strongest boost", area: "trending", stage: "scoring", surfaces: ["trending"], unit: "×",
    effect: "The highest an admin boost can scale a subject's score.",
  }),
  fixed("overrides.days", "maxDurationDays", OVERRIDE_LIMITS.maxDurationDays, "code", OVERRIDES_FILE, {
    name: "Longest override", area: "trending", stage: "ordering", surfaces: ["trending"], unit: "days",
    effect: "An override lasts at most this long.",
  }),
]

// ── Discover: Explore, people, search, topic pages ─────────────────────────

const EXPLORE_DATA_FILE = "adbox-backend · libs/discover/src/explore-data.ts"
const EXPLORE_SERVICE_FILE = "adbox-backend · apps/api-gateway/src/discover/discover-explore.service.ts"
const PEOPLE_FILE = "adbox-backend · libs/recommendation/src/people.ts"
const SEARCH_FILE = "adbox-backend · libs/recommendation/src/search-ranking.ts"
const TOPICS_FILE = "adbox-backend · apps/api-gateway/src/discover/discover-trends.service.ts"

const exploreParameters: Parameter[] = [
  fromDiscover("explore.windowDays", {
    name: "Explore window", area: "explore", stage: "candidates", surfaces: ["explore"], unit: "days",
    effect: "Posts and surveys from this many days make up Explore's pools.",
  }),
  fromDiscover("explore.risingBoost", {
    name: "Rising boost", area: "explore", stage: "scoring", surfaces: ["explore"], unit: "ratio",
    effect: "A post about a subject trending in the scope scores (1 + this) times as much.",
  }),
  fromDiscover("explore.jitter", {
    name: "Shuffle", area: "explore", stage: "scoring", surfaces: ["explore"], unit: "share",
    effect: "Moves each score by up to ± this share, seeded per visit: a fresh mix each time, the same order while paging.",
  }),
  fromDiscover("explore.authorWindow", {
    name: "Author spacing", area: "explore", stage: "ordering", surfaces: ["explore"], unit: "items",
    effect: "At most one post per author in any run of this many tiles.",
  }),
  fromDiscover("explore.surveyFirst", {
    name: "First survey tile", area: "explore", stage: "ordering", surfaces: ["explore"], unit: "place",
    effect: "The tile the first survey takes.",
  }),
  fromDiscover("explore.surveyEvery", {
    name: "Survey every", area: "explore", stage: "ordering", surfaces: ["explore"], unit: "posts",
    effect: "After the first, one survey after every this many posts, while any are left.",
  }),
  fromDiscover("explore.risingPostsPerSubject", {
    name: "Rising posts per subject", area: "explore", stage: "candidates", surfaces: ["explore"], unit: "posts",
    effect: "The best few posts about each trending subject that join the pool, marked rising.",
  }),
  fixed("explore.base", "BASE_LIMIT", EXPLORE_CODE.baseLimit, "code", EXPLORE_DATA_FILE, {
    name: "Newest posts read", area: "explore", stage: "candidates", surfaces: ["explore"], unit: "posts",
    effect: "The newest posts in scope that Explore's three pools are drawn from.",
  }),
  fixed("explore.qualityPool", "QUALITY_POOL", EXPLORE_CODE.qualityPool, "code", EXPLORE_DATA_FILE, {
    name: "Quality pool", area: "explore", stage: "candidates", surfaces: ["explore"], unit: "posts",
    effect: "The best of them by the feed's quality per impression.",
  }),
  fixed("explore.freshPool", "FRESH_POOL", EXPLORE_CODE.freshPool, "code", EXPLORE_DATA_FILE, {
    name: "Fresh pool", area: "explore", stage: "candidates", surfaces: ["explore"], unit: "posts",
    effect: "New posts still under the feed's new-post threshold, inside its explore window.",
  }),
  fixed("explore.taste", "TASTE_DAYS", EXPLORE_CODE.tasteDays, "code", EXPLORE_DATA_FILE, {
    name: "Taste read from", area: "explore", stage: "scoring", surfaces: ["explore"], unit: "days",
    effect: "Days of the viewer's activity read to work out what they usually engage with, which novelty is measured against.",
  }),
  fixed("explore.familiar", "novelty(): engagements ÷ 3", EXPLORE_CODE.familiarAfter, "code", "adbox-backend · libs/recommendation/src/explore.ts", {
    name: "Familiar author after", area: "explore", stage: "scoring", surfaces: ["explore"], unit: "items",
    effect: "After this many engagements with an author, their posts count as fully familiar; novelty falls as low as a third.",
  }),
  fixed("explore.seen", "SEEN_DAYS", EXPLORE_CODE.seenDays, "code", EXPLORE_DATA_FILE, {
    name: "Seen means within", area: "explore", stage: "eligibility", surfaces: ["explore"], unit: "days",
    effect: "Posts the viewer saw this recently are left out of their grid.",
  }),
  fixed("explore.poolTtl", "POOL_TTL_SECONDS", EXPLORE_CODE.poolTtlMinutes, "code", EXPLORE_SERVICE_FILE, {
    name: "Pool cached for", area: "explore", stage: "session", surfaces: ["explore"], unit: "minutes",
    effect: "A scope's pool is shared by everyone in it and rebuilt this often.",
  }),
  fixed("explore.sessionSize", "SESSION_SIZE", EXPLORE_CODE.sessionSize, "code", EXPLORE_SERVICE_FILE, {
    name: "Posts per visit", area: "explore", stage: "session", surfaces: ["explore"], unit: "posts",
    effect: "One visit ranks this many posts, pageable without repeats.",
  }),
  fixed("explore.sessionTtl", "SESSION_TTL_SECONDS", EXPLORE_CODE.sessionTtlMinutes, "code", EXPLORE_SERVICE_FILE, {
    name: "Visit kept for", area: "explore", stage: "session", surfaces: ["explore"], unit: "minutes",
    effect: "How long one visit's order can be paged through.",
  }),
  fixed("explore.surprise", "SURPRISE_MEMORY", EXPLORE_CODE.surpriseMemory, "code", EXPLORE_SERVICE_FILE, {
    name: "Surprise me remembers", area: "explore", stage: "session", surfaces: ["explore"], unit: "posts",
    effect: "“Surprise me” picks a post of above-median quality and never repeats any of the last this many picks within 24 hours.",
  }),
]

const peopleParameters: Parameter[] = [
  fromDiscover("people.proximity", {
    name: "Proximity weight", area: "people", stage: "scoring", surfaces: ["people"], unit: "weight",
    effect: "How much being at the viewer's campus, institution or region counts.",
  }),
  fromDiscover("people.mutuals", {
    name: "Mutuals weight", area: "people", stage: "scoring", surfaces: ["people"], unit: "weight",
    effect: "How much people the viewer follows who follow this person count.",
  }),
  fromDiscover("people.interests", {
    name: "Interests weight", area: "people", stage: "scoring", surfaces: ["people"], unit: "weight",
    effect: "How much overlap between the two people's interests counts.",
  }),
  fromDiscover("people.quality", {
    name: "Creator quality weight", area: "people", stage: "scoring", surfaces: ["people"], unit: "weight",
    effect: "How much the engagement on this person's recent posts counts.",
  }),
  fromDiscover("people.maxRunPerSource", {
    name: "Same reason in a row", area: "people", stage: "ordering", surfaces: ["people"], unit: "items",
    effect: "At most this many suggestions in a row for the same reason (featured, friends, campus, rising, interests).",
  }),
  fixed("people.campus", "PROXIMITY.CAMPUS", PEOPLE_CODE.proximity.CAMPUS, "code", PEOPLE_FILE, {
    name: "Proximity: same campus", area: "people", stage: "scoring", surfaces: ["people"], unit: "ratio",
    effect: "The proximity value for someone at the viewer's campus.",
  }),
  fixed("people.institution", "PROXIMITY.INSTITUTION", PEOPLE_CODE.proximity.INSTITUTION, "code", PEOPLE_FILE, {
    name: "Proximity: same institution", area: "people", stage: "scoring", surfaces: ["people"], unit: "ratio",
    effect: "The proximity value for someone at the viewer's institution.",
  }),
  fixed("people.region", "PROXIMITY.REGION", PEOPLE_CODE.proximity.REGION, "code", PEOPLE_FILE, {
    name: "Proximity: same region", area: "people", stage: "scoring", surfaces: ["people"], unit: "ratio",
    effect: "The proximity value for someone in the viewer's region.",
  }),
  fixed("people.mutualsFull", "mutualsValue(): ln(1 + n) ÷ ln 11", PEOPLE_CODE.mutualsForFull, "code", PEOPLE_FILE, {
    name: "Mutuals for a full score", area: "people", stage: "scoring", surfaces: ["people"], unit: "people",
    effect: "This many mutual follows count as a full mutuals score; the first few count most.",
  }),
  fixed("people.qualityDays", "QUALITY_DAYS", PEOPLE_CODE.qualityDays, "code", "adbox-backend · libs/discover/src/people-data.ts", {
    name: "Creator quality reads", area: "people", stage: "scoring", surfaces: ["people"], unit: "days",
    effect: "Days of a person's posts their creator quality is measured over.",
  }),
  fixed("people.perSource", "PER_SOURCE", PEOPLE_CODE.perSource, "code", "adbox-backend · libs/discover/src/people-data.ts", {
    name: "Candidates per reason", area: "people", stage: "candidates", surfaces: ["people"], unit: "people",
    effect: "The most people each reason contributes before scoring.",
  }),
  fixed("people.keep", "KEEP", PEOPLE_CODE.keep, "code", "adbox-backend · apps/api-gateway/src/discover/discover-people.service.ts", {
    name: "Suggestions kept", area: "people", stage: "session", surfaces: ["people"], unit: "people",
    effect: "Suggestions kept per viewer between refreshes.",
  }),
  fixed("people.cache", "CACHE_SECONDS", PEOPLE_CODE.cacheMinutes, "code", "adbox-backend · apps/api-gateway/src/discover/discover-people.service.ts", {
    name: "Suggestions cached for", area: "people", stage: "session", surfaces: ["people"], unit: "minutes",
    effect: "How long a viewer's suggestions are reused before they are worked out again.",
  }),
]

const searchParameters: Parameter[] = [
  fixed("search.exact", "SEARCH_RANKING.exact", SEARCH_RANKING.exact, "code", SEARCH_FILE, {
    name: "Exact name", area: "search", stage: "scoring", surfaces: ["search"], unit: "ratio",
    effect: "Text match when a name is exactly the query.",
  }),
  fixed("search.prefix", "SEARCH_RANKING.prefix", SEARCH_RANKING.prefix, "code", SEARCH_FILE, {
    name: "Name starts with it", area: "search", stage: "scoring", surfaces: ["search"], unit: "ratio",
    effect: "Text match when a name starts with the query.",
  }),
  fixed("search.words", "SEARCH_RANKING.words", SEARCH_RANKING.words, "code", SEARCH_FILE, {
    name: "Every word found", area: "search", stage: "scoring", surfaces: ["search"], unit: "ratio",
    effect: "Text match when every query word starts a word of the name.",
  }),
  fixed("search.fullTextMin", "SEARCH_RANKING.fullTextMin", SEARCH_RANKING.fullTextMin, "code", SEARCH_FILE, {
    name: "Post text, weakest", area: "search", stage: "scoring", surfaces: ["search"], unit: "ratio",
    effect: "The lowest text match a post's full-text hit maps to.",
  }),
  fixed("search.fullTextMax", "SEARCH_RANKING.fullTextMax", SEARCH_RANKING.fullTextMax, "code", SEARCH_FILE, {
    name: "Post text, strongest", area: "search", stage: "scoring", surfaces: ["search"], unit: "ratio",
    effect: "The highest text match a post's full-text hit maps to.",
  }),
  fixed("search.fuzzy", "SEARCH_RANKING.fuzzyFactor", SEARCH_RANKING.fuzzyFactor, "code", SEARCH_FILE, {
    name: "Typo match factor", area: "search", stage: "scoring", surfaces: ["search"], unit: "×",
    effect: "A typo match scores its weakest word's similarity times this.",
  }),
  fixed("search.similarity", "SEARCH_RANKING.minSimilarity", SEARCH_RANKING.minSimilarity, "code", SEARCH_FILE, {
    name: "Typo tolerance", area: "search", stage: "eligibility", surfaces: ["search"], unit: "ratio",
    effect: "The least trigram similarity that still counts as a typo of a word. Lower forgives more typos and finds more noise.",
  }),
  fixed("search.popularity", "SEARCH_RANKING.popularityDivisor", SEARCH_RANKING.popularityDivisor, "code", SEARCH_FILE, {
    name: "Popularity divisor", area: "search", stage: "scoring", surfaces: ["search"], unit: "ratio",
    effect: "Popularity = ln(1 + followers, members or posts) ÷ this, at most 1, and the score is multiplied by 1 + popularity.",
  }),
  fixed("search.campus", "SEARCH_RANKING.locality.CAMPUS", SEARCH_RANKING.locality.CAMPUS, "code", SEARCH_FILE, {
    name: "Same campus", area: "search", stage: "scoring", surfaces: ["search"], unit: "×",
    effect: "Results on the viewer's (or chosen scope's) campus score this many times as much.",
  }),
  fixed("search.institution", "SEARCH_RANKING.locality.INSTITUTION", SEARCH_RANKING.locality.INSTITUTION, "code", SEARCH_FILE, {
    name: "Same institution", area: "search", stage: "scoring", surfaces: ["search"], unit: "×",
    effect: "Results at the same institution score this many times as much.",
  }),
  fixed("search.region", "SEARCH_RANKING.locality.REGION", SEARCH_RANKING.locality.REGION, "code", SEARCH_FILE, {
    name: "Same region", area: "search", stage: "scoring", surfaces: ["search"], unit: "×",
    effect: "Results in the same region score this many times as much.",
  }),
  fixed("search.freshness", "SEARCH_RANKING.freshnessHalfLifeDays", SEARCH_RANKING.freshnessHalfLifeDays, "code", SEARCH_FILE, {
    name: "Post half-life", area: "search", stage: "scoring", surfaces: ["search"], unit: "days",
    effect: "A post result's score halves every this many days. People, places and hashtags do not age.",
  }),
  fixed("search.total", "SEARCH_RANKING.exactTotalLimit", SEARCH_RANKING.exactTotalLimit, "code", SEARCH_FILE, {
    name: "Exact count up to", area: "search", stage: "request", surfaces: ["search"], unit: "items",
    effect: "Result counts above this show as “1,000+” rather than a guess.",
  }),
]

const topicParameters: Parameter[] = [
  fixed("topics.window", "TOP_WINDOW_DAYS", TOPIC_CODE.topWindowDays, "code", TOPICS_FILE, {
    name: "Top posts from", area: "topics", stage: "candidates", surfaces: ["topics"], unit: "days",
    effect: "A topic's Top tab ranks posts from this many days, by the feed policy's quality × freshness.",
  }),
  fixed("topics.pool", "TOP_POOL", TOPIC_CODE.topPool, "code", TOPICS_FILE, {
    name: "Top posts considered", area: "topics", stage: "candidates", surfaces: ["topics"], unit: "posts",
    effect: "The newest this many posts about the topic are ranked for its Top tab.",
  }),
  fixed("topics.preview", "PREVIEW_POSTS", TOPIC_CODE.previewPosts, "code", TOPICS_FILE, {
    name: "Preview posts", area: "topics", stage: "request", surfaces: ["topics", "trending"], unit: "posts",
    effect: "Posts shown in a trending subject's preview.",
  }),
]

export const PARAMETERS: Parameter[] = [
  ...homeParameters,
  ...sponsoredParameters,
  ...rankedParameters,
  ...trendParameters,
  ...exploreParameters,
  ...peopleParameters,
  ...searchParameters,
  ...topicParameters,
]

const byId = new Map(PARAMETERS.map((parameter) => [parameter.id, parameter]))

export const parameterById = (id: string | null | undefined) => (id ? byId.get(id) : undefined)

/** Where a parameter's effect is felt today: in the app, through Discover only, or not yet. */
export type Reach = "in-app" | "via-discover" | "not-yet"

const DISCOVER_SURFACES: ReadonlySet<SurfaceId> = new Set(["trending", "explore", "people", "search", "topics"])

export function reachOf(parameter: Pick<Parameter, "surfaces">): Reach {
  const live = parameter.surfaces.filter((surface) => SURFACES[surface].inApp)
  if (live.length === 0) return "not-yet"
  // A ranked-feed setting the app feels today only because Discover reuses it.
  return parameter.surfaces.includes("ranked") && live.every((surface) => DISCOVER_SURFACES.has(surface)) ? "via-discover" : "in-app"
}

export const REACH_LABELS: Record<Reach, string> = {
  "in-app": "In the app",
  "via-discover": "In the app through Discover",
  "not-yet": "Not in the app yet",
}
