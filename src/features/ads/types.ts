import { z } from "zod"

/** Super-admin's ads permissions (backend `docs/super-admin-api.md`, "Ads"). */
export const ADS_PERMISSIONS = {
  read: "ads.read",
  review: "ads.review",
  manage: "ads.manage",
} as const

export const adStatuses = ["PENDING_REVIEW", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED", "REJECTED"] as const
export type AdStatus = (typeof adStatuses)[number]

export const adTypes = ["BOOST_POST", "IMAGE", "VIDEO", "CAROUSEL", "PROFILE", "EVENT", "SURVEY"] as const
export type AdType = (typeof adTypes)[number]

export const adReportReasons = ["SCAM", "BANNED_PRODUCT", "MISLEADING", "OFFENSIVE", "SEXUAL", "OTHER"] as const
export type AdReportReason = (typeof adReportReasons)[number]

export const adStatusLabels: Record<AdStatus, string> = {
  PENDING_REVIEW: "In review",
  ACTIVE: "Running",
  PAUSED: "Paused",
  COMPLETED: "Finished",
  CANCELLED: "Stopped",
  REJECTED: "Not approved",
}

export const adTypeLabels: Record<AdType, string> = {
  BOOST_POST: "Boosted post",
  IMAGE: "Image ad",
  VIDEO: "Video ad",
  CAROUSEL: "Carousel ad",
  PROFILE: "Promoted profile",
  EVENT: "Promoted event",
  SURVEY: "Promoted survey",
}

export const adReasonLabels: Record<AdReportReason, string> = {
  SCAM: "Scam or fraud",
  BANNED_PRODUCT: "Something AdBox doesn't allow",
  MISLEADING: "Misleading",
  OFFENSIVE: "Offensive or hateful",
  SEXUAL: "Sexual content",
  OTHER: "Something else",
}

const whole = z.number().int()
const timestamp = z.string()
const nullableTimestamp = z.string().nullable().optional().transform((value) => value ?? null)
const text = z.string().nullable().optional().transform((value) => value ?? null)
const lenient = <T extends readonly [string, ...string[]]>(values: T) =>
  z.string().transform((value) => ((values as readonly string[]).includes(value) ? (value as T[number]) : null))

const contentSchema = z.object({
  headline: z.string(),
  body: z.string(),
  destinationUrl: z.string(),
  imageUrls: z.array(z.string()),
  videoUrl: z.string(),
  coverImageUrl: z.string(),
  eventStartsAt: z.string(),
  eventLocation: z.string(),
}).partial().catch({})
export type AdContent = z.infer<typeof contentSchema>

export const advertiserSchema = z.object({
  id: z.string(),
  name: text,
  username: text,
  email: text,
  image: text,
  isActive: z.boolean(),
  kind: z.enum(["PERSON", "PAGE", "BUSINESS"]).catch("PERSON"),
  company: text,
  joinedAt: timestamp,
  emailVerified: z.boolean().optional().default(false),
})
export type Advertiser = z.infer<typeof advertiserSchema>

export const adSummarySchema = z.object({
  id: z.string(),
  type: lenient(adTypes),
  name: z.string(),
  goal: z.string(),
  audience: z.string(),
  institutionIds: z.array(z.string()).default([]),
  campusIds: z.array(z.string()).default([]),
  status: lenient(adStatuses),
  dailyBudgetBars: whole,
  durationDays: whole,
  budgetBars: whole,
  cpmBars: whole,
  chargedBars: whole,
  returnedBars: whole,
  heldBars: whole,
  maxViews: whole,
  startsAt: nullableTimestamp,
  endsAt: nullableTimestamp,
  cancelledAt: nullableTimestamp,
  autoApproved: z.boolean().default(false),
  reviewedAt: nullableTimestamp,
  rejectionReason: text,
  pausedAt: nullableTimestamp,
  pauseReason: z.enum(["REPORTS", "ADMIN"]).nullable().optional().transform((value) => value ?? null),
  settledAt: nullableTimestamp,
  resourceId: text,
  content: contentSchema,
  createdAt: timestamp,
  stats: z.object({ views: whole, reach: whole, clicks: whole, engagements: whole }),
  openReports: whole.default(0),
  advertiser: advertiserSchema,
})
export type AdSummary = z.infer<typeof adSummarySchema>

export const adListSchema = z.object({
  items: z.array(adSummarySchema),
  total: whole,
  page: whole,
  limit: whole,
  counts: z.record(z.string(), whole).default({}),
})
export type AdList = z.infer<typeof adListSchema>

export const reportedAdSchema = adSummarySchema.extend({
  reasons: z.array(z.object({ reason: lenient(adReportReasons), count: whole })),
  lastReportedAt: nullableTimestamp,
})
export type ReportedAd = z.infer<typeof reportedAdSchema>

export const reportedListSchema = z.object({
  items: z.array(reportedAdSchema),
  total: whole,
  page: whole,
  limit: whole,
})

export const adReportSchema = z.object({
  id: z.string(),
  reason: lenient(adReportReasons),
  details: text,
  status: z.enum(["OPEN", "DISMISSED", "UPHELD"]).catch("OPEN"),
  createdAt: timestamp,
  reporter: z.object({ id: z.string(), name: text, username: text }),
})
export type AdReport = z.infer<typeof adReportSchema>

export const adDetailSchema = adSummarySchema.extend({
  daily: z.array(z.object({ date: timestamp, impressions: whole, reach: whole, clicks: whole, engagements: whole })).default([]),
  post: z.object({ id: z.string(), title: text, description: text, mediaType: z.string() }).nullable().optional().transform((value) => value ?? null),
  places: z.object({
    institutions: z.array(z.object({ id: z.string(), name: z.string() })),
    campuses: z.array(z.object({ id: z.string(), name: z.string() })),
  }).default({ institutions: [], campuses: [] }),
  reviewer: z.object({ id: z.string(), email: z.string(), name: text }).nullable().optional().transform((value) => value ?? null),
  reports: z.array(adReportSchema).default([]),
})
export type AdDetail = z.infer<typeof adDetailSchema>

export type AdListQuery = {
  status?: AdStatus
  type?: AdType
  search?: string
  page: number
  limit: number
}

export type AdAction =
  | { kind: "approve" }
  | { kind: "reject"; reason: string }
  | { kind: "pause" }
  | { kind: "resume" }
  | { kind: "stop"; reason: string; returnAll: boolean }
  | { kind: "resolve"; decision: "DISMISS" | "UPHOLD"; reason?: string }
