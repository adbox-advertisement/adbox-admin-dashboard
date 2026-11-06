import { z } from "zod"
import { superAdminApi } from "@/api/client"
import {
  goldPurchasePageSchema,
  goldBundleInputSchema,
  goldBundleSchema,
  goldSettingsSchema,
  goldSettingsValuesSchema,
  spotlightPlanInputSchema,
  spotlightPlanSchema,
  type GoldBundleInput,
  type PurchaseStatus,
  type GoldSettingsValues,
  type SpotlightPlanInput,
} from "./types"

// Super-admin's gold economy (backend docs/gold-wallet.md, "Settings";
// docs/super-admin-api.md): the numbers, the store's bundles, Spotlight's plans.

export async function getGoldSettings(signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/gold-settings", { signal })
  return goldSettingsSchema.parse(data)
}

/** Only what changed is sent; the server checks the whole holds together. */
export async function updateGoldSettings(changes: Partial<GoldSettingsValues>) {
  const body = goldSettingsValuesSchema.partial().parse(changes)
  const { data } = await superAdminApi.patch<unknown>("/gold-settings", body)
  return goldSettingsSchema.parse(data)
}

export async function getGoldBundles(signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/gold-bundles", { signal })
  return z.array(goldBundleSchema).parse(data)
}

export async function createGoldBundle(input: GoldBundleInput) {
  const { data } = await superAdminApi.post<unknown>("/gold-bundles", goldBundleInputSchema.parse(input))
  return goldBundleSchema.parse(data)
}

export async function updateGoldBundle({ id, input }: { id: string; input: Partial<GoldBundleInput> }) {
  const body = goldBundleInputSchema.omit({ id: true }).partial().parse(input)
  const { data } = await superAdminApi.patch<unknown>(`/gold-bundles/${encodeURIComponent(id)}`, body)
  return goldBundleSchema.parse(data)
}

export async function getSpotlightPlans(signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/spotlight-plans", { signal })
  return z.array(spotlightPlanSchema).parse(data)
}

export async function createSpotlightPlan(input: SpotlightPlanInput) {
  const { data } = await superAdminApi.post<unknown>("/spotlight-plans", spotlightPlanInputSchema.parse(input))
  return spotlightPlanSchema.parse(data)
}

export async function updateSpotlightPlan({ id, input }: { id: string; input: Partial<SpotlightPlanInput> }) {
  const body = spotlightPlanInputSchema.omit({ id: true }).partial().parse(input)
  const { data } = await superAdminApi.patch<unknown>(`/spotlight-plans/${encodeURIComponent(id)}`, body)
  return spotlightPlanSchema.parse(data)
}

/** Gold bought through Paystack, newest first, with what came in. */
export async function getGoldPurchases(query: { status?: PurchaseStatus; search?: string; page: number; limit: number }, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/gold-purchases", { params: query, signal })
  return goldPurchasePageSchema.parse(data)
}
