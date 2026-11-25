import { superAdminApi } from "@/api/client"
import {
  institutionDirectorySchema,
  mediaAssetSchema,
  mediaUploadIntentSchema,
  studioAccountPageSchema,
  studioAccountSchema,
  studioGroupPageSchema,
  studioGroupSchema,
  studioPostPageSchema,
  studioSessionSchema,
  studioSummarySchema,
  usernameCheckSchema,
  type StudioAccountInput,
  type StudioAccountUpdate,
  type StudioGroupInput,
  type StudioGroupUpdate,
  type StudioPostQuery,
} from "./types"

// Super-admin's studio (backend docs/super-admin-api.md, "Studio"): the accounts admins make and
// post from, their groups, and everything posted from them. Posting itself goes to the app's own
// API with a studio session (app-client.ts).

const compact = <T extends Record<string, unknown>>(params: T) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== "")) as Partial<T>

export async function getStudioSummary(signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/studio/summary", { signal })
  return studioSummarySchema.parse(data)
}

// ── Accounts ─────────────────────────────────────────────────────────────

export type StudioAccountQuery = { search?: string; institutionId?: string; createdById?: string; state?: "active" | "archived" | "all"; page?: number; limit?: number }

export async function getStudioAccounts(query: StudioAccountQuery, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/studio/accounts", { params: compact(query), signal })
  return studioAccountPageSchema.parse(data)
}

export async function getStudioAccount(id: string, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>(`/studio/accounts/${encodeURIComponent(id)}`, { signal })
  return studioAccountSchema.parse(data)
}

export async function checkStudioUsername(username: string, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/studio/accounts/username-available", { params: { username }, signal })
  return usernameCheckSchema.parse(data)
}

export async function createStudioAccount(input: StudioAccountInput) {
  const { data } = await superAdminApi.post<unknown>("/studio/accounts", compact(input))
  return studioAccountSchema.parse(data)
}

export async function updateStudioAccount(id: string, input: StudioAccountUpdate) {
  const { data } = await superAdminApi.patch<unknown>(`/studio/accounts/${encodeURIComponent(id)}`, input)
  return studioAccountSchema.parse(data)
}

export async function setStudioAccountArchived(id: string, archived: boolean) {
  const { data } = await superAdminApi.post<unknown>(`/studio/accounts/${encodeURIComponent(id)}/${archived ? "archive" : "restore"}`)
  return studioAccountSchema.parse(data)
}

/** A short app session to post as the account. Audited, and every post records this admin. */
export async function openStudioSession(accountId: string) {
  const { data } = await superAdminApi.post<unknown>(`/studio/accounts/${encodeURIComponent(accountId)}/session`)
  return studioSessionSchema.parse(data)
}

export async function endStudioSession(sessionId: string) {
  await superAdminApi.post(`/studio/sessions/${encodeURIComponent(sessionId)}/end`)
}

// ── Groups ───────────────────────────────────────────────────────────────

export type StudioGroupQuery = { search?: string; institutionId?: string; state?: "active" | "archived" | "all"; page?: number; limit?: number }

export async function getStudioGroups(query: StudioGroupQuery, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/studio/groups", { params: compact(query), signal })
  return studioGroupPageSchema.parse(data)
}

export async function getStudioGroup(id: string, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>(`/studio/groups/${encodeURIComponent(id)}`, { signal })
  return studioGroupSchema.parse(data)
}

export async function createStudioGroup(input: StudioGroupInput) {
  const { data } = await superAdminApi.post<unknown>("/studio/groups", compact(input))
  return studioGroupSchema.parse(data)
}

export async function updateStudioGroup(id: string, input: StudioGroupUpdate) {
  const { data } = await superAdminApi.patch<unknown>(`/studio/groups/${encodeURIComponent(id)}`, input)
  return studioGroupSchema.parse(data)
}

export async function setStudioGroupArchived(id: string, archived: boolean) {
  const { data } = await superAdminApi.post<unknown>(`/studio/groups/${encodeURIComponent(id)}/${archived ? "archive" : "restore"}`)
  return studioGroupSchema.parse(data)
}

// ── Posts ────────────────────────────────────────────────────────────────

export async function getStudioPosts(query: StudioPostQuery, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/studio/posts", { params: compact(query), signal })
  return studioPostPageSchema.parse(data)
}

// ── Places and pictures ──────────────────────────────────────────────────

export async function getInstitutionDirectory(signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/institutions", { signal })
  return institutionDirectorySchema.parse(data)
}

/** Registers a picture in the media library and returns where to upload it. */
export async function createImageUploadIntent(file: { name: string; type: string; size: number; sha256: string }) {
  const { data } = await superAdminApi.post<unknown>("/media/upload-intents", {
    kind: "IMAGE",
    fileName: file.name,
    mimeType: file.type,
    byteSize: file.size,
    sha256: file.sha256,
  })
  return mediaUploadIntentSchema.parse(data)
}

/** Checks the stored picture against what was registered; READY gives it a web address. */
export async function completeImageUpload(id: string, size: { width?: number; height?: number }) {
  const { data } = await superAdminApi.post<unknown>(`/media/${encodeURIComponent(id)}/complete`, size)
  return mediaAssetSchema.parse(data)
}
