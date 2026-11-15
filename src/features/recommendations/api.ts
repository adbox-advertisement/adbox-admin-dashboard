import { superAdminApi } from "@/api/client"
import {
  adSettingsSchema,
  createOverrideInputSchema,
  discoverOverviewSchema,
  discoverPreviewSchema,
  eventPageSchema,
  feedRankingHistorySchema,
  feedRankingOverviewSchema,
  feedRankingPolicySchema,
  hashtagPageSchema,
  institutionDirectorySchema,
  overrideListSchema,
  peoplePageSchema,
  rankedShareInputSchema,
  trendOverrideSchema,
  trendReportSchema,
  trendStatusSchema,
  type CreateOverrideInput,
  type RankedShareInput,
} from "./types"

// This section explains the settings and simulates changes. It writes two things: the ranked
// share (a new feed ranking version that changes nothing else) and trend overrides. Backend
// docs/recommendation-pipeline.md §6, docs/discover.md §12.3–§12.4, docs/gold-wallet.md.

/** The active feed ranking version (or null), the built-in defaults and every allowed range. */
export async function getFeedRanking(signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/feed-ranking", { signal })
  return feedRankingOverviewSchema.parse(data)
}

/** Feed ranking versions, newest first. */
export async function getFeedRankingHistory(limit: number, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/feed-ranking/policies", { params: { limit }, signal })
  return feedRankingHistorySchema.parse(data).items
}

/**
 * Saves a new feed ranking version with this ranked share and makes it live. Only `rankedPercent`
 * (and a note) is sent, so the server carries every other setting over from the live version.
 * Audited; live on every gateway within 30 seconds.
 */
export async function saveRankedShare(input: RankedShareInput) {
  const body = rankedShareInputSchema.parse(input)
  const { data } = await superAdminApi.post<unknown>("/feed-ranking/policies", { ...body, activate: true })
  return feedRankingPolicySchema.parse(data)
}

/** Discover's active trend, Explore and people settings (or null), the defaults and the ranges. */
export async function getDiscoverPolicy(signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/discover-studio/policy", { signal })
  return discoverOverviewSchema.parse(data)
}

/** The gold settings ads are delivered by: frequency cap, price and budget limits. */
export async function getAdSettings(signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/gold-settings", { signal })
  return adSettingsSchema.parse(data)
}

// ── Trending overrides ─────────────────────────────────────────────────────

/** One scope's list as last computed, the subjects that just missed and why, and the overrides in force. */
export async function getTrendReport(scopeKey: string, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/discover-studio/trends", { params: { scopeKey }, signal })
  return trendReportSchema.parse(data)
}

/**
 * Trending exactly as the app gets it now, Nationwide or at one institution: overrides applied,
 * subjects dropped since the last run gone, the app's labels and pictures. The admin preview with
 * nothing unsaved, so it saves nothing (POST only because the preview can carry unsaved settings).
 */
export async function getAppTrends(institutionId: string | null, signal?: AbortSignal) {
  const { data } = await superAdminApi.post<unknown>("/discover-studio/preview", institutionId ? { institutionId } : {}, { signal })
  return discoverPreviewSchema.parse(data).trending
}

/** Whether the trends job keeps up, and every list it built at its last success. */
export async function getTrendStatus(signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/discover-studio/trends/status", { signal })
  return trendStatusSchema.parse(data)
}

/** A scope's overrides, newest first: in force and scheduled, or every one ever made. */
export async function getOverrides(scopeKey: string, includeEnded: boolean, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/discover-studio/overrides", { params: { scopeKey, includeEnded, limit: 100 }, signal })
  return overrideListSchema.parse(data).items
}

/** Pin, boost, dampen, suppress or feature a subject in one list. Audited. */
export async function createOverride(input: CreateOverrideInput) {
  const { data } = await superAdminApi.post<unknown>("/discover-studio/overrides", createOverrideInputSchema.parse(input))
  return trendOverrideSchema.parse(data)
}

/** Ends an override now. Ending one that is already over changes nothing. Audited. */
export async function endOverride(id: string) {
  const { data } = await superAdminApi.post<unknown>(`/discover-studio/overrides/${encodeURIComponent(id)}/end`)
  return trendOverrideSchema.parse(data)
}

/** Active hashtags starting with `q`, most used first. */
export async function searchHashtags(q: string, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/discover-studio/hashtags", { params: { q, status: "ACTIVE", limit: 8 }, signal })
  return hashtagPageSchema.parse(data).items
}

/** Every active institution, with its campuses and their halls. */
export async function getInstitutionDirectory(signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/institutions", { signal })
  return institutionDirectorySchema.parse(data)
}

/** People matching `search`. */
export async function searchPeople(search: string, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/platform-users", { params: { search, limit: 8 }, signal })
  return peoplePageSchema.parse(data).items
}

/** Approved events, newest first. */
export async function getApprovedEvents(signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/discover-studio/events", { params: { status: "APPROVED", limit: 100 }, signal })
  return eventPageSchema.parse(data).items
}
