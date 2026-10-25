import type { z } from "zod"
import type { adSchema, adStatuses, adTypes, chatReportDetailSchema, chatReportSchema, contentReportDetailSchema, contentReportSchema, mediaTypes, postSchema, reportReasons, reportStatuses, resourceStatuses, summarySchema, surveySchema, uploaderSchema, uploadersSchema } from "./validation"

export type Uploader = z.infer<typeof uploaderSchema>
export type UserPost = z.infer<typeof postSchema>
export type UserAd = z.infer<typeof adSchema>
export type UserSurvey = z.infer<typeof surveySchema>
export type ContentSummary = z.infer<typeof summarySchema>
export type TopUploader = z.infer<typeof uploadersSchema>[number]
export type AdStatus = typeof adStatuses[number]
export type AdType = typeof adTypes[number]
export type ResourceStatus = typeof resourceStatuses[number]
export type MediaType = typeof mediaTypes[number]
export type ContentReport = z.infer<typeof contentReportSchema>
export type ContentReportDetail = z.infer<typeof contentReportDetailSchema>
export type ChatReport = z.infer<typeof chatReportSchema>
export type ChatReportDetail = z.infer<typeof chatReportDetailSchema>
export type ReportReason = typeof reportReasons[number]
export type ReportStatus = typeof reportStatuses[number]
/** Anyone shown beside content: uploaders, reporters and reported people. */
export type Person = { id: string; userProfile: { fullName: string | null; username: string | null; email?: string; image?: string | null } | null }

export const CONTENT_PERMISSIONS = {
  read: "user.content.read",
  moderate: "user.content.moderate",
  usersRead: "platform.users.read",
} as const

export function uploaderName(user: Person | null) {
  const profile = user?.userProfile
  return profile?.fullName?.trim() || profile?.username?.trim() || profile?.email || "Unknown user"
}

export const mediaTypeLabels: Record<MediaType, { one: string; many: string }> = {
  VIDEO: { one: "Video", many: "Videos" },
  IMAGE: { one: "Picture post", many: "Pictures" },
  TEXT: { one: "Text post", many: "Text posts" },
}

export const adTypeLabels: Record<AdType, string> = {
  BOOST_POST: "Boosted post",
  IMAGE: "Image ad",
  VIDEO: "Video ad",
  CAROUSEL: "Carousel",
  PROFILE: "Profile promo",
  EVENT: "Event",
  SURVEY: "Survey promo",
}

export const adStatusLabels: Record<AdStatus, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending review",
  ACTIVE: "Active",
  PAUSED: "Paused",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
}

export const visibilityLabels: Record<ResourceStatus, string> = {
  PUBLIC: "Public",
  PRIVATE: "Private",
  DRAFT: "Draft",
  PROCESSING: "Processing",
  ARCHIVED: "Archived",
}

export function humanize(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, " ")
}

export function postTitle(post: UserPost) {
  return post.title?.trim() || post.description?.trim().slice(0, 80) || `Untitled ${post.mediaType === "VIDEO" ? "video" : post.mediaType === "IMAGE" ? "picture post" : "text post"}`
}

export const reportReasonLabels: Record<ReportReason, string> = {
  SPAM: "Spam",
  HARASSMENT: "Harassment",
  HATE: "Hate speech",
  NUDITY: "Nudity",
  VIOLENCE: "Violence",
  SELF_HARM: "Self-harm",
  MISINFORMATION: "Misinformation",
  SCAM: "Scam or fraud",
  INTELLECTUAL_PROPERTY: "Intellectual property",
  OTHER: "Something else",
}

/** Reasons that can mean someone is at risk are surfaced first and in red. */
export const urgentReasons: ReadonlySet<ReportReason> = new Set(["SELF_HARM", "VIOLENCE", "HATE", "HARASSMENT"])

export const reportStatusLabels: Record<ReportStatus, string> = {
  OPEN: "Open",
  ACTION_TAKEN: "Action taken",
  DISMISSED: "Dismissed",
}
