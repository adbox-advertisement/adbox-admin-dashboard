import { superAdminApi } from "@/api/client"
import { applicationPageSchema, applicationSchema, applicationSummarySchema, campaignSchema, decisionSchema, reviewSchema, statsSchema, videoUrlSchema } from "./validation"
import type { ApplicationFilters, ApplicationStatus, DecisionInput, ExportFilters, ReviewInput } from "./types"
import { transitions } from "./lib/workflow"

const applications = "/recruitment/applications"
const recordPath = (id: string) => `${applications}/${encodeURIComponent(id)}`
export async function getApplications(filters: ApplicationFilters, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>(applications, { params: filters, signal })
  return applicationPageSchema.parse(data)
}
export async function getApplication(id: string, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>(recordPath(id), { signal })
  return applicationSchema.parse(data)
}
export async function getRecruitmentStats(campaignId?: string, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>(`${applications}/stats`, { params: { campaignId }, signal })
  return statsSchema.parse(data)
}
export async function getRecruitmentCampaigns(signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/recruitment/campaigns", { params: { includeInactive: true }, signal })
  return campaignSchema.array().parse(data)
}
export async function getVideoUrl(id: string) {
  const { data } = await superAdminApi.get<unknown>(`${recordPath(id)}/video-url`)
  return videoUrlSchema.parse(data)
}
export async function saveReview({ id, input }: { id: string; input: ReviewInput }) {
  const { data } = await superAdminApi.patch<unknown>(recordPath(id), reviewSchema.parse(input))
  return applicationSummarySchema.parse(data)
}
export async function changeStatus({ id, currentStatus, input }: { id: string; currentStatus: ApplicationStatus; input: DecisionInput }) {
  const payload = decisionSchema.parse(input)
  if (!transitions[currentStatus].includes(payload.status)) throw new Error("Invalid review transition")
  const { data } = await superAdminApi.post<unknown>(`${recordPath(id)}/status`, payload)
  return applicationSummarySchema.parse(data)
}
export async function exportApplications(filters: ExportFilters) {
  // The server's export does not support search or pagination. Never silently
  // forward list filters and imply that they apply to the downloaded file.
  const { data } = await superAdminApi.get<string>(`${applications}/export`, {
    params: { status: filters.status, institutionId: filters.institutionId, campaignId: filters.campaignId }, responseType: "text",
  })
  if (typeof data !== "string" || !data.startsWith('"reference","status"')) throw new Error("Invalid recruitment CSV")
  return data
}
