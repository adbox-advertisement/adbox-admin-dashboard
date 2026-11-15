import { z } from "zod"

/**
 * What each card reads; the backend decides (docs/super-admin-api.md). A card the admin can't read
 * isn't shown. The map and the waiting work need none of their own.
 */
export const DASHBOARD_PERMISSIONS = {
  people: "platform.users.read",
  content: "user.content.read",
  ads: "ads.read",
  payments: "payments.read",
  trends: "discover.read",
} as const

const count = z.number().int().nonnegative()
const text = z.string().nullable().optional().transform((value) => value ?? null)
// Pictures from the server are shown only when they are web addresses.
const webUrl = z.string().nullable().optional().transform((value) => (value && /^https?:\/\//i.test(value) ? value : null))

const membersSchema = z.object({ total: count, STUDENT: count, ALUMNI: count, STAFF: count })

/** GET /platform-users/stats: who the people are. Only what the dashboard shows is read. */
export const peopleStatsSchema = z.object({
  generatedAt: z.string(),
  total: count,
  newLast7Days: count,
  newLast30Days: count,
  status: z.object({ active: count, suspended: count }),
  roles: z.object({ GUEST: count, VIEWER: count, CREATOR: count, PUBLISHER: count }),
  affiliation: z.object({ STUDENT: count, ALUMNI: count, STAFF: count, NONE: count }),
  badges: z.object({ campus: count, company: count, honour: count, spotlight: count }),
  /** Every institution, most members first. */
  institutions: z.array(z.object({ id: z.string(), name: z.string(), shortName: z.string(), region: text, logoUrl: webUrl, members: membersSchema })),
})
export type PeopleStats = z.infer<typeof peopleStatsSchema>

/**
 * GET /platform-users/signups: accounts made on each UTC day (Ghana time) of the window, every day
 * listed. `before + total` is everyone, as in the stats.
 */
export const signupsSchema = z.object({
  days: count,
  from: z.string(),
  to: z.string(),
  before: count,
  total: count,
  points: z.array(z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), joined: count })),
})
export type Signups = z.infer<typeof signupsSchema>

/** GET /user-content/summary: live posts by kind, removed posts and surveys. */
export const contentSummarySchema = z.object({ videos: count, images: count, text: count, removedPosts: count, surveys: count, activeSurveys: count })
export type ContentSummary = z.infer<typeof contentSummarySchema>

/** GET /user-content/uploaders: the people with the most live posts. */
export const topCreatorsSchema = z.array(z.object({
  user: z.object({
    id: z.string(),
    userProfile: z.object({ fullName: text, username: text, image: webUrl }).nullable().optional().transform((value) => value ?? null),
  }).nullable(),
  posts: count,
  videos: count,
  images: count,
  text: count,
}))
export type TopCreator = z.infer<typeof topCreatorsSchema>[number]

/** GET /ads with a single row: every ad's stage, counted. */
export const adStagesSchema = z.object({ total: count, counts: z.record(z.string(), count).default({}) })
export type AdStages = z.infer<typeof adStagesSchema>

/** GET /gold-purchases with a single row: what gold sales brought in. */
export const goldSalesSchema = z.object({ paid: z.object({ count, totalGhs: z.number().nonnegative(), totalBars: count }) })
export type GoldSales = z.infer<typeof goldSalesSchema>
