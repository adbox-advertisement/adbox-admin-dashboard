import { superAdminApi } from "@/api/client"
import { adSettingsSchema, discoverOverviewSchema, feedRankingHistorySchema, feedRankingOverviewSchema } from "./types"

// Reads only: this section explains the settings and simulates changes; it never saves them.
// Backend docs/recommendation-pipeline.md §6, docs/discover.md §12.4, docs/gold-wallet.md.

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
