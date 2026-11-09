import { z } from "zod"

// The work queues super-admin counts live (backend docs/super-admin-api.md, "Live activity").
export const activitySections = [
  "adRequests",
  "reportedAds",
  "contentReports",
  "pageRequests",
  "businessRequests",
  "companies",
  "verification",
  "honours",
  "recruitment",
] as const

export const activitySectionSchema = z.enum(activitySections)
export type ActivitySection = z.infer<typeof activitySectionSchema>

const countSchema = z.number().int().nonnegative()

// A queue the admin may not open is left out, not zero.
export const activityCountsSchema = z.partialRecord(activitySectionSchema, countSchema)
export type ActivityCounts = z.infer<typeof activityCountsSchema>

export const activityCountEventSchema = z.object({
  section: activitySectionSchema,
  count: countSchema,
  increased: z.boolean(),
})
export type ActivityCountEvent = z.infer<typeof activityCountEventSchema>
