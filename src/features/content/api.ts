import { superAdminApi } from "@/api/client"
import {
  adPageSchema,
  adQuerySchema,
  chatReportDetailSchema,
  chatReportPageSchema,
  chatReportQuerySchema,
  contentReportDetailSchema,
  contentReportPageSchema,
  contentReportQuerySchema,
  moderationReasonSchema,
  postPageSchema,
  postQuerySchema,
  postSchema,
  resolveChatReportSchema,
  resolveContentReportSchema,
  summarySchema,
  surveyPageSchema,
  surveyQuerySchema,
  surveySchema,
  uploaderSchema,
  uploadersSchema,
  type AdQuery,
  type ChatReportQuery,
  type ContentReportQuery,
  type ModerationReason,
  type PostQuery,
  type ResolveChatReport,
  type ResolveContentReport,
  type SurveyQuery,
} from "./validation"

// Cleared filters arrive as undefined or ""; the API rejects empty values.
function compact<T extends Record<string, unknown>>(params: T) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== "")) as Partial<T>
}

const id = (value: string) => encodeURIComponent(value)

export async function getContentSummary(userId: string | undefined, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/user-content/summary", { params: compact({ userId }), signal })
  return summarySchema.parse(data)
}

export async function getTopUploaders(limit: number, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/user-content/uploaders", { params: { limit }, signal })
  return uploadersSchema.parse(data)
}

export async function getUploader(userId: string, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>(`/platform-users/${id(userId)}`, { signal })
  return uploaderSchema.parse(data)
}

export async function getUserPosts(query: PostQuery, signal?: AbortSignal) {
  const params = compact(postQuerySchema.parse(compact(query)))
  const { data } = await superAdminApi.get<unknown>("/user-content/posts", { params, signal })
  return postPageSchema.parse(data)
}

export async function getUserPost(postId: string, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>(`/user-content/posts/${id(postId)}`, { signal })
  return postSchema.parse(data)
}

export async function removeUserPost({ postId, input }: { postId: string; input: ModerationReason }) {
  const { data } = await superAdminApi.post<unknown>(`/user-content/posts/${id(postId)}/remove`, compact(moderationReasonSchema.parse(input)))
  return postSchema.parse(data)
}

export async function restoreUserPost(postId: string) {
  const { data } = await superAdminApi.post<unknown>(`/user-content/posts/${id(postId)}/restore`)
  return postSchema.parse(data)
}

export async function getUserAds(query: AdQuery, signal?: AbortSignal) {
  const params = compact(adQuerySchema.parse(compact(query)))
  const { data } = await superAdminApi.get<unknown>("/user-content/ads", { params, signal })
  return adPageSchema.parse(data)
}

export async function getUserSurveys(query: SurveyQuery, signal?: AbortSignal) {
  const params = compact(surveyQuerySchema.parse(compact(query)))
  const { data } = await superAdminApi.get<unknown>("/user-content/surveys", { params, signal })
  return surveyPageSchema.parse(data)
}

export async function setUserSurveyActive({ surveyId, active, input }: { surveyId: string; active: boolean; input: ModerationReason }) {
  const action = active ? "reactivate" : "deactivate"
  const { data } = await superAdminApi.post<unknown>(`/user-content/surveys/${id(surveyId)}/${action}`, compact(moderationReasonSchema.parse(input)))
  return surveySchema.parse(data)
}

export async function getContentReports(query: ContentReportQuery, signal?: AbortSignal) {
  const params = compact(contentReportQuerySchema.parse(compact(query)))
  const { data } = await superAdminApi.get<unknown>("/user-content/reports", { params, signal })
  return contentReportPageSchema.parse(data)
}

export async function getContentReport(reportId: string, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>(`/user-content/reports/${id(reportId)}`, { signal })
  return contentReportDetailSchema.parse(data)
}

export async function resolveContentReport({ reportId, input }: { reportId: string; input: ResolveContentReport }) {
  const { data } = await superAdminApi.post<unknown>(`/user-content/reports/${id(reportId)}/resolve`, compact(resolveContentReportSchema.parse(input)))
  return contentReportDetailSchema.parse(data)
}

export async function getChatReports(query: ChatReportQuery, signal?: AbortSignal) {
  const params = compact(chatReportQuerySchema.parse(compact(query)))
  const { data } = await superAdminApi.get<unknown>("/user-content/chat-reports", { params, signal })
  return chatReportPageSchema.parse(data)
}

export async function getChatReport(reportId: string, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>(`/user-content/chat-reports/${id(reportId)}`, { signal })
  return chatReportDetailSchema.parse(data)
}

export async function resolveChatReport({ reportId, input }: { reportId: string; input: ResolveChatReport }) {
  const { data } = await superAdminApi.post<unknown>(`/user-content/chat-reports/${id(reportId)}/resolve`, compact(resolveChatReportSchema.parse(input)))
  return chatReportDetailSchema.parse(data)
}
