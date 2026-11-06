import { z } from "zod"

/** Super-admin's gold economy permissions (backend `docs/gold-wallet.md`, "Settings"). */
export const FINANCE_PERMISSIONS = {
  read: "gold.settings.read",
  manage: "gold.settings.manage",
  spotlight: "spotlight.plans.manage",
} as const

const whole = z.number().int()

export const goldSettingsValuesSchema = z.object({
  barsPerCedi: whole,
  dailyRewardBars: whole,
  adDailyBudgetMinBars: whole,
  adDailyBudgetMaxBars: whole,
  adDurationsDays: z.array(whole),
  adCpmBars: whole,
  adMinAudience: whole,
  adFrequencyCapPerDay: whole,
  surveyRewardMinPerResponse: whole,
  surveyRewardMaxPerResponse: whole,
  surveyRewardMinBudget: whole,
  surveyRewardMaxBudget: whole,
  surveyThreeFormatsFrom: whole,
  surveyAnyFormatsFrom: whole,
})
export type GoldSettingsValues = z.infer<typeof goldSettingsValuesSchema>
export type GoldSettingsKey = keyof GoldSettingsValues

export const audienceSizesSchema = z.object({ ALL: whole, STUDENTS: whole, ALUMNI: whole })
export type AudienceSizes = z.infer<typeof audienceSizesSchema>

export const goldSettingsSchema = z.object({
  values: goldSettingsValuesSchema,
  defaults: goldSettingsValuesSchema,
  updatedAt: z.string().nullable(),
  updatedBy: z.object({ id: z.string(), email: z.string(), name: z.string().nullable() }).nullable(),
  audienceSizes: audienceSizesSchema,
})
export type GoldSettings = z.infer<typeof goldSettingsSchema>

export const goldBundleSchema = z.object({
  id: z.string(),
  name: z.string(),
  pricePesewas: whole,
  priceGhs: z.number(),
  baseBars: whole,
  bonusPercent: whole,
  bonusBars: whole,
  totalBars: whole,
  badge: z.string().nullable(),
  sortOrder: whole,
  active: z.boolean(),
  paidPurchases: whole.default(0),
})
export type GoldBundle = z.infer<typeof goldBundleSchema>

export const goldBundleInputSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,40}$/, "Lowercase letters, numbers and dashes."),
  name: z.string().trim().min(1, "Name it.").max(40),
  pricePesewas: whole.min(100, "At least GHS 1.00.").max(10_000_000),
  bonusPercent: whole.min(0).max(500, "At most 500%."),
  badge: z.string().trim().max(24).nullable(),
  sortOrder: whole,
  active: z.boolean(),
})
export type GoldBundleInput = z.infer<typeof goldBundleInputSchema>

export const spotlightPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  days: whole,
  priceBars: whole,
  badge: z.string().nullable(),
  sortOrder: whole.default(0),
  active: z.boolean(),
  _count: z.object({ purchases: whole }).optional(),
})
export type SpotlightPlan = z.infer<typeof spotlightPlanSchema>

export const spotlightPlanInputSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,40}$/, "Lowercase letters, numbers and dashes."),
  name: z.string().trim().min(1, "Name it.").max(40),
  days: whole.min(1).max(365, "At most 365 days."),
  priceBars: whole.min(1, "At least 1 bar.").max(1_000_000),
  badge: z.string().trim().max(24).nullable(),
  sortOrder: whole,
  active: z.boolean(),
})
export type SpotlightPlanInput = z.infer<typeof spotlightPlanInputSchema>

/** A refusal of settings that do not hold together, one per field. */
export const settingsProblemsSchema = z.object({
  problems: z.array(z.object({ field: z.string(), message: z.string() })),
})

/** Reading gold purchases (backend `docs/super-admin-api.md`, "Gold economy"). */
export const PAYMENTS_PERMISSION = "payments.read"

export const purchaseStatuses = ["PENDING", "PAID", "FAILED", "CANCELLED"] as const
export type PurchaseStatus = (typeof purchaseStatuses)[number]

export const goldPurchaseSchema = z.object({
  id: z.string(),
  status: z.string(),
  bundleId: z.string().nullable(),
  bundleName: z.string().nullable().optional().transform((value) => value ?? null),
  pricePesewas: whole,
  priceGhs: z.number(),
  totalBars: whole,
  currency: z.string(),
  channel: z.string().nullable().optional().transform((value) => value ?? null),
  providerReference: z.string().nullable().optional().transform((value) => value ?? null),
  failureReason: z.string().nullable().optional().transform((value) => value ?? null),
  paidAt: z.string().nullable().optional().transform((value) => value ?? null),
  createdAt: z.string(),
  buyer: z.object({ id: z.string(), name: z.string().nullable(), username: z.string().nullable(), email: z.string().nullable() }),
})
export type GoldPurchase = z.infer<typeof goldPurchaseSchema>

export const goldPurchasePageSchema = z.object({
  items: z.array(goldPurchaseSchema),
  total: whole,
  page: whole,
  limit: whole,
  paid: z.object({ count: whole, totalGhs: z.number(), totalBars: whole }),
  counts: z.record(z.string(), whole).default({}),
})
export type GoldPurchasePage = z.infer<typeof goldPurchasePageSchema>
