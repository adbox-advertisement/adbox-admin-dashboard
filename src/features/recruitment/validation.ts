import { z } from "zod"

export const statuses = ["SUBMITTED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEWED", "ACCEPTED", "REJECTED", "WITHDRAWN"] as const
export const statusSchema = z.enum(statuses)
const date = z.iso.datetime({ offset: true })
const actorSchema = z.object({ id: z.string(), email: z.string(), firstName: z.string().nullable(), lastName: z.string().nullable() })
const campaignSummarySchema = z.object({ id: z.string(), slug: z.string(), title: z.string() })
const institutionSchema = z.object({ id: z.string(), slug: z.string(), name: z.string(), shortName: z.string().nullable(), region: z.string().nullable().optional() })

export const applicationSummarySchema = z.object({
  id: z.string(), reference: z.string(), status: statusSchema, fullName: z.string(), email: z.string(),
  rating: z.number().int().min(1).max(5).nullable(), createdAt: date, updatedAt: date,
  reviewedAt: date.nullable(), reviewedByAdminId: z.string().nullable(), reviewedBy: actorSchema.nullable().optional(),
  redactedAt: date.nullable(), campaign: campaignSummarySchema, institution: institutionSchema,
})
export const applicationPageSchema = z.object({ items: z.array(applicationSummarySchema), total: z.number().int().nonnegative(), page: z.number().int().positive(), limit: z.number().int().positive() })
export const applicationSchema = applicationSummarySchema.extend({
  phone: z.string(), programme: z.string(), campusId: z.string().nullable(),
  campusReach: z.string(), motivation: z.string(), experience: z.string(), availability: z.string(),
  otherRoles: z.string(), phoneModel: z.string(), paymentAnswer: z.string(), comfortable: z.boolean(), honesty: z.boolean(),
  internalNote: z.string().nullable(),
  video: z.object({ id: z.string(), status: z.enum(["PENDING", "READY", "FAILED"]), fileName: z.string(), mimeType: z.string(), byteSize: z.number().nonnegative(), durationSeconds: z.number().nonnegative(), completedAt: date.nullable() }),
  events: z.array(z.object({ id: z.string(), fromStatus: statusSchema.nullable(), toStatus: statusSchema, note: z.string().nullable(), actorAdminId: z.string().nullable(), actor: actorSchema.nullable(), createdAt: date })),
})
export const statsSchema = z.object({
  total: z.number().int().nonnegative(), byStatus: z.record(statusSchema, z.number().int().nonnegative()),
  byInstitution: z.array(z.object({ institutionId: z.string(), slug: z.string().nullable(), name: z.string().nullable(), count: z.number().int().nonnegative() })),
})
export const campaignSchema = campaignSummarySchema.extend({
  referenceCode: z.string(), opensAt: date, closesAt: date, isActive: z.boolean(), isOpen: z.boolean(),
  positionsPerCampus: z.number().int().positive(), stipendNote: z.string().nullable(), applicationCount: z.number().int().nonnegative(),
})
export const videoUrlSchema = z.object({ url: z.url().refine(value => ["http:", "https:"].includes(new URL(value).protocol), "Invalid video URL"), expiresInSeconds: z.number().positive() })
export const reviewSchema = z.object({ internalNote: z.string().max(2000), rating: z.number().int().min(1).max(5).optional() })
export const decisionSchema = z.object({ status: statusSchema, note: z.string().trim().max(2000) }).superRefine((value, ctx) => {
  if (value.status === "REJECTED" && !value.note) ctx.addIssue({ code: "custom", path: ["note"], message: "Add a reason before rejecting this application." })
})
