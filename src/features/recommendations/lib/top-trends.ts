import { format } from "date-fns"
import { KIND_LABELS } from "../data/catalog"
import type { AppTrend, AppTrendList, AppTrendSubject, DiscoverPolicy, InstitutionDirectory, ScopeLevel, TrendDirection, TrendItem, TrendKind, TrendOverride, TrendReport, TrendScoreParts } from "../types"
import { actionSummary, scopeLabel } from "./overrides"
import { formatNumber, formatScore, ordinal } from "./values"

// Trending as the app shows it (adbox-mobile-mvp lib/features/discover: discover_api.dart
// trendFromJson, discover_lists_view.dart _TrendingRow), joined to how the trends job scored it.

/** How many trends the page shows. */
export const TOP_COUNT = 10

/** The app burns a flame beside the top 3 only. */
export const APP_FLAME_RANKS = 3

/** The app's rank: "01", "10". */
export const appRank = (rank: number) => String(rank).padStart(2, "0")

/** The lists the app's Trending reads: Nationwide (`global`) or one institution's (`inst:{id}`). */
export const APP_LIST_PATTERN = /^(global|inst:[0-9a-f-]{36})$/

/** Nationwide, then every active institution by name. */
export function appListOptions(directory: InstitutionDirectory | undefined, computedScopes: string[], current: string) {
  const options = new Map<string, string>()
  const institutions = (directory ?? []).filter((institution) => institution.isActive).sort((a, b) => a.shortName.localeCompare(b.shortName))
  for (const institution of institutions) options.set(`inst:${institution.id}`, institution.shortName)
  // Lists the directory can't name (an admin without access to it) still appear.
  for (const key of [...computedScopes, current]) if (key.startsWith("inst:") && !options.has(key)) options.set(key, scopeLabel(key, directory))
  return [{ key: "global", label: "Nationwide" }, ...[...options].map(([key, label]) => ({ key, label }))]
}

/** One flicker of the app's flame (DiscoverFlame). */
export const FLAME_CYCLE_S = 1.4

/** The app offsets each flame by rank × 1.7 radians of its cycle, so neighbours don't flicker in step. */
export const flameDelay = (rank: number) => -Math.round((((rank * 1.7) / (2 * Math.PI)) * FLAME_CYCLE_S % FLAME_CYCLE_S) * 1000) / 1000

/** The app's word for a subject without a category (discover_api.dart _kindLabel). */
const APP_KIND_WORDS: Record<TrendKind, string> = { HASHTAG: "Trending", PERSON: "Creator", INSTITUTION: "Campus", CAMPUS: "Campus", HALL: "Hall", EVENT: "Event" }

/** The app's second line: "Campus life · Featured". */
export function appSubline(item: Pick<AppTrend, "kind" | "category" | "featured">) {
  return [item.category?.label ?? APP_KIND_WORDS[item.kind], ...(item.featured ? ["Featured"] : [])].join(" · ")
}

/**
 * The app's picture: the subject's photo, cover or logo, else the poster's. Web addresses only: a
 * server without a media host sends bare storage keys, which can't be shown.
 */
export function appImage(item: Pick<AppTrend, "subject" | "presentation">) {
  const subject = item.subject
  const own = subject?.kind === "PERSON" ? subject.image : subject?.kind === "EVENT" ? subject.coverUrl : subject?.kind === "INSTITUTION" ? subject.logoUrl : null
  const url = own ?? item.presentation?.imageUrl ?? null
  return url && /^https?:\/\//i.test(url) ? url : null
}

export const trendKey = (item: { kind: TrendKind; id: string }) => `${item.kind}:${item.id}`

export type TopTrend = {
  item: AppTrend
  /** The job's entry: the place it earned, its score and the parts. Null in a fallback list and for a subject an admin placed. */
  computed: TrendItem | null
  /** The override in force on it in this list. */
  override: TrendOverride | null
}

/** The app's top trends, each with the job's entry and the override in force, matched by kind and id. */
export function joinTopTrends(list: AppTrendList, report: TrendReport | undefined, count = TOP_COUNT): TopTrend[] {
  const computed = new Map((report?.snapshot?.items ?? []).map((item) => [trendKey(item), item]))
  const overrides = new Map((report?.overrides ?? []).map((override) => [`${override.kind}:${override.subjectId}`, override]))
  return list.items.slice(0, count).map((item) => ({ item, computed: computed.get(trendKey(item)) ?? null, override: overrides.get(trendKey(item)) ?? null }))
}

/** Why it sits where it does in the app. */
export function placement({ item, computed, override }: TopTrend, source: AppTrendList["source"]) {
  // A suppressed subject is never in the list, so any override here pins, features, boosts or dampens.
  if (override) return `${actionSummary(override)} by an admin; ${computed ? `it was computed ${ordinal(computed.rank)}` : "it wasn't in the computed list"}.`
  if (!computed) return source === "fallback" ? "No list has been computed here yet, so the app shows the hashtags with the most posts here this week." : "It wasn't in the computed list."
  const moved = computed.rank - item.rank
  if (moved === 0) return `It earned ${ordinal(item.rank)} when the list was computed.`
  const places = `${Math.abs(moved)} ${Math.abs(moved) === 1 ? "place" : "places"}`
  return moved > 0
    ? `It was computed ${ordinal(computed.rank)}, and is up ${places}: subjects above it were suppressed, dampened or dropped out since.`
    : `It was computed ${ordinal(computed.rank)}, and is down ${places}: admins placed or boosted subjects above it.`
}

/** What the figures cover, as words: "in the last 24 h", "in the last 7 days", "all time". */
export function windowWords(window: string | null) {
  if (window === null) return ""
  if (window === "7d") return "in the last 7 days"
  if (window === "30d") return "in the last 30 days"
  if (window === "all") return "all time"
  const hours = window.match(/^(\d+)h$/)
  return hours ? `in the last ${hours[1]} h` : window
}

/** "140% above an ordinary day", "New: no activity in the days before", "Steady". */
export function changeWords(trend: TrendDirection | null) {
  if (!trend) return null
  if (trend.direction === "NEW") return "New: no activity in the days before"
  if (trend.direction === "STEADY") return trend.changePct === null ? "Steady" : `Steady: ${formatNumber(Math.abs(trend.changePct))}% ${trend.changePct < 0 ? "below" : "above"} an ordinary day`
  return `${formatNumber(Math.abs(trend.changePct ?? 0))}% ${trend.direction === "UP" ? "above" : "below"} an ordinary day`
}

const LEVEL_PHRASES: Record<ScopeLevel, string> = { GLOBAL: "a nationwide list", REGION: "a region's list", INSTITUTION: "an institution's list", CAMPUS: "a campus's list" }

export type Rule = { label: string; value: string; needs: string; passed: boolean }

/** The two rules a subject must pass to be computed into a list (scoreSubject), against the settings in force. */
export function qualifyingRules(computed: TrendItem, level: ScopeLevel, policy: DiscoverPolicy): Rule[] {
  const rules: Rule[] = []
  const people = computed.metrics?.participants
  const minimum = policy.minParticipants[computed.kind][level]
  if (people !== undefined) rules.push({ label: "People taking part", value: formatNumber(people), needs: `at least ${formatNumber(minimum)} in ${LEVEL_PHRASES[level]}`, passed: people >= minimum })
  if (computed.parts) {
    rules.push({ label: "Recent activity", value: formatScore(computed.parts.recent), needs: `at least ${formatNumber(policy.score.minRecent)}`, passed: computed.parts.recent >= policy.score.minRecent })
  }
  return rules
}

/** momentum^exponent × breadth × quality × kind multiplier: what each part comes to, and the product. */
export function scoreProduct(parts: TrendScoreParts, exponent: number) {
  const momentum = Math.pow(parts.momentum, exponent)
  return { momentum, product: momentum * parts.breadth * parts.quality * parts.kindMultiplier }
}

/** "6 hashtags, 2 events, 1 person and 1 institution", most first. */
export function kindMix(items: Array<{ kind: TrendKind }>) {
  const counts = new Map<TrendKind, number>()
  for (const item of items) counts.set(item.kind, (counts.get(item.kind) ?? 0) + 1)
  const parts = [...counts].sort((a, b) => b[1] - a[1]).map(([kind, n]) => `${n} ${(n === 1 ? KIND_LABELS[kind].one : KIND_LABELS[kind].many).toLowerCase()}`)
  return parts.length <= 1 ? (parts[0] ?? "") : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`
}

const TIERS: Record<string, string> = { SELF_DECLARED: "Self-declared", PENDING: "Pending", VERIFIED: "Verified" }
const TIMINGS = { UPCOMING: "Upcoming", LIVE: "Happening now", ENDED: "Ended" } as const
const when = (iso: string) => format(new Date(iso), "d MMM yyyy, HH:mm")

/** What the app may show about the subject, as label and value rows. */
export function subjectFacts(subject: AppTrendSubject): Array<{ label: string; value: string }> {
  const rows = (entries: Array<[string, string | null | undefined]>) => entries.filter((entry): entry is [string, string] => Boolean(entry[1])).map(([label, value]) => ({ label, value }))
  switch (subject.kind) {
    case "INSTITUTION": return rows([["Name", subject.name], ["Short name", subject.shortName], ["Region", subject.region]])
    case "CAMPUS": return rows([["Campus", subject.name], ["Institution", subject.institution.shortName], ["City", subject.city]])
    case "HALL": return rows([["Hall", subject.name], ["Campus", subject.campus.name], ["Institution", subject.institution.shortName]])
    case "EVENT": return rows([
      ["Starts", when(subject.startsAt)],
      ["Ends", when(subject.endsAt)],
      ["Now", TIMINGS[subject.timing]],
      ["Going", formatNumber(subject.going)],
      ["Location", subject.location],
      ["Held by", [subject.hall?.name, subject.campus?.name, subject.institution.shortName].filter(Boolean).join(", ")],
    ])
    case "PERSON": return rows([
      ["Name", subject.fullName],
      ["Username", subject.username ? `@${subject.username}` : null],
      ["Verification", subject.verificationTier ? (TIERS[subject.verificationTier] ?? subject.verificationTier) : null],
      ["Creator role", subject.creatorRole?.label],
      ["Institution", subject.institution?.shortName],
    ])
  }
}
