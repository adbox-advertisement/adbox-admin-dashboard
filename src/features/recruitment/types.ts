import type { z } from "zod"
import type { applicationSchema, applicationSummarySchema, campaignSchema, decisionSchema, reviewSchema, statsSchema, statusSchema } from "./validation"

export type ApplicationStatus = z.infer<typeof statusSchema>
export type ApplicationSummary = z.infer<typeof applicationSummarySchema>
export type Application = z.infer<typeof applicationSchema>
export type RecruitmentStats = z.infer<typeof statsSchema>
export type RecruitmentCampaign = z.infer<typeof campaignSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type DecisionInput = z.infer<typeof decisionSchema>
export type ApplicationFilters = { search?: string; status?: ApplicationStatus; institutionId?: string; campaignId?: string; page: number; limit: number }
export type ExportFilters = Pick<ApplicationFilters, "status" | "institutionId" | "campaignId">
