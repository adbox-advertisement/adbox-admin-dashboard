import type { AudienceSizes, GoldSettingsKey, GoldSettingsValues } from "../types"

// Mirrors the backend's libs/gold-settings goldSettingsProblems, so a problem
// is shown on its field before saving. The server checks again on save.

export type SettingsProblems = Partial<Record<GoldSettingsKey, string>>

const LIMITS: Partial<Record<GoldSettingsKey, [number, number]>> = {
  barsPerCedi: [1, 10_000],
  dailyRewardBars: [0, 100_000],
  adDailyBudgetMinBars: [1, 10_000_000],
  adDailyBudgetMaxBars: [1, 10_000_000],
  adCpmBars: [1, 10_000_000],
  adMinAudience: [0, 1_000_000],
  adFrequencyCapPerDay: [1, 100],
  surveyRewardMinPerResponse: [1, 1_000_000],
  surveyRewardMaxPerResponse: [1, 1_000_000],
  surveyRewardMinBudget: [1, 100_000_000],
  surveyRewardMaxBudget: [1, 100_000_000],
  surveyThreeFormatsFrom: [1, 100_000_000],
  surveyAnyFormatsFrom: [1, 100_000_000],
}

export const bars = (value: number) => value.toLocaleString("en-US")

// The exchange rate prices the store (backend libs/gold-settings): a bundle's
// base bars are its price at the rate, its total the base plus bonus. Ads are
// priced in bars only, by the price per 1,000 views.
export const bundleBaseBars = (pricePesewas: number, barsPerCedi: number) =>
  Math.max(1, Math.round((pricePesewas * barsPerCedi) / 100))

export const bundleTotalBars = (baseBars: number, bonusPercent: number) =>
  baseBars + Math.round((baseBars * bonusPercent) / 100)

/** What each bundle would give at [barsPerCedi], for those it changes. */
export function repricedBundles(bundles: Array<{ id: string; name: string; pricePesewas: number; bonusPercent: number; totalBars: number }>, barsPerCedi: number) {
  return bundles
    .map((bundle) => ({ ...bundle, after: bundleTotalBars(bundleBaseBars(bundle.pricePesewas, barsPerCedi), bundle.bonusPercent) }))
    .filter((bundle) => bundle.after !== bundle.totalBars)
}

export function settingsProblems(values: GoldSettingsValues): SettingsProblems {
  const problems: SettingsProblems = {}
  const add = (key: GoldSettingsKey, message: string) => { problems[key] ??= message }
  for (const [key, [min, max]] of Object.entries(LIMITS) as Array<[GoldSettingsKey, [number, number]]>) {
    const value = values[key] as number
    if (!Number.isInteger(value) || value < min || value > max) add(key, `A whole number from ${bars(min)} to ${bars(max)}.`)
  }
  const days = values.adDurationsDays
  if (days.length === 0) add("adDurationsDays", "Offer at least one length.")
  else if (days.length > 8) add("adDurationsDays", "Offer at most 8 lengths.")
  else if (days.some((day) => !Number.isInteger(day) || day < 1 || day > 365)) add("adDurationsDays", "Each a whole number of days, 1 to 365.")
  else if (new Set(days).size !== days.length) add("adDurationsDays", "Each length once.")
  if (values.adDailyBudgetMinBars > values.adDailyBudgetMaxBars) add("adDailyBudgetMaxBars", "At least the daily minimum.")
  if (values.surveyRewardMinPerResponse > values.surveyRewardMaxPerResponse) add("surveyRewardMaxPerResponse", "At least the least per response.")
  if (values.surveyRewardMinBudget > values.surveyRewardMaxBudget) add("surveyRewardMaxBudget", "At least the least in total.")
  if (values.surveyRewardMinBudget < values.surveyRewardMinPerResponse) add("surveyRewardMinBudget", "At least one response at the least per response.")
  if (values.surveyThreeFormatsFrom <= values.surveyRewardMinBudget) add("surveyThreeFormatsFrom", "More than the least in total (which allows one format).")
  if (values.surveyAnyFormatsFrom <= values.surveyThreeFormatsFrom) add("surveyAnyFormatsFrom", "More than where three formats start.")
  return problems
}

/** The keys whose values differ, for a PATCH of only what changed. */
export function changedSettings(before: GoldSettingsValues, after: GoldSettingsValues): Partial<GoldSettingsValues> {
  const changed: Partial<GoldSettingsValues> = {}
  for (const key of Object.keys(after) as GoldSettingsKey[]) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) (changed as Record<string, unknown>)[key] = after[key]
  }
  return changed
}

export type AdAudience = keyof AudienceSizes

/** Views [bars] buy at the price per 1,000 (backend `viewsForBars`). */
export const viewsForBars = (bars: number, cpmBars: number) => Math.floor((bars * 1000) / cpmBars)

/**
 * What an ad of [dailyBars] for [days] holds, buys and reaches, as the app
 * shows it: the views its budget buys, reaching at least views ÷ the daily
 * cap and at most one person a view — never more than the audience holds.
 */
export function adExample(values: GoldSettingsValues, sizes: AudienceSizes, audience: AdAudience, dailyBars: number, days: number) {
  const held = dailyBars * days
  const views = viewsForBars(held, values.adCpmBars)
  const low = Math.ceil(views / values.adFrequencyCapPerDay)
  const size = sizes[audience]
  return {
    held,
    views,
    viewsPerDay: viewsForBars(dailyBars, values.adCpmBars),
    cedis: held / values.barsPerCedi,
    low: Math.min(low, size),
    high: Math.min(views, size),
    capped: views > size,
    tooSmall: size < values.adMinAudience,
  }
}
