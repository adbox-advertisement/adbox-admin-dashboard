import { z } from "zod"
import { superAdminApi } from "@/api/client"
import { adStagesSchema, contentSummarySchema, goldSalesSchema, peopleStatsSchema, signupsSchema, topCreatorsSchema } from "./types"

// Super-admin's institution catalogue (backend `apps/super-admin/src/institutions`): every Ghanaian
// tertiary institution students can belong to, with the region and town it is in.
const institutionSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string().nullish(),
  type: z.string().nullish(),
  region: z.string().nullish(),
  town: z.string().nullish(),
  isActive: z.boolean().nullish(),
})

export type MapInstitution = z.infer<typeof institutionSchema>

export async function getInstitutions(signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/institutions", { signal })
  return z.array(institutionSchema).parse(data)
}

// The rest of the page reads figures other sections own, from the same endpoints they use.

/** Who the people are: totals, new sign-ups, roles, affiliation, badges and members per institution. */
export async function getPeopleStats(signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/platform-users/stats", { signal })
  return peopleStatsSchema.parse(data)
}

/** Accounts made on each day of the last `days`, today included. */
export async function getSignups(days: number, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/platform-users/signups", { params: { days }, signal })
  return signupsSchema.parse(data)
}

export async function getContentSummary(signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/user-content/summary", { signal })
  return contentSummarySchema.parse(data)
}

export async function getTopCreators(limit: number, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/user-content/uploaders", { params: { limit }, signal })
  return topCreatorsSchema.parse(data)
}

/** Every ad's stage, counted: the ads list with one row, for its `counts`. */
export async function getAdStages(signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/ads", { params: { page: 1, limit: 1 }, signal })
  return adStagesSchema.parse(data)
}

/** Gold sold through Paystack: the purchases list with one row, for its `paid` totals. */
export async function getGoldSales(signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/gold-purchases", { params: { page: 1, limit: 1 }, signal })
  return goldSalesSchema.parse(data)
}
