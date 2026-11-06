import { z } from "zod"
import { superAdminApi } from "@/api/client"
import {
  approveBusinessRequestSchema,
  businessRequestChangesSchema,
  businessRequestCountsSchema,
  businessRequestDetailSchema,
  businessRequestPageSchema,
  businessRequestQuerySchema,
  companyDetailSchema,
  declineBusinessRequestSchema,
  declineRequestSchema,
  companyPageSchema,
  companyQuerySchema,
  companySchema,
  connectionsPageSchema,
  connectionsQuerySchema,
  declineHonourSchema,
  grantHonourSchema,
  honourDetailSchema,
  honourPageSchema,
  honourQuerySchema,
  institutionSchema,
  platformUserPageSchema,
  platformUserQuerySchema,
  platformUserSchema,
  rejectCompanySchema,
  rejectVerificationSchema,
  relationshipsSchema,
  suspendPlatformUserSchema,
  suspendResultSchema,
  updateBadgesSchema,
  updatePlatformUserSchema,
  userStatsSchema,
  verificationPageSchema,
  verificationQuerySchema,
  verificationRequestSchema,
  type ApproveBusinessRequestInput,
  type BusinessRequestChangesInput,
  type BusinessRequestQuery,
  type CompanyQuery,
  type DeclineBusinessRequestInput,
  type DeclineRequestInput,
  type ApprovePageRequestInput,
  type PageRequestChangesInput,
  type PageRequestQuery,
  approvePageRequestSchema,
  pageRequestChangesSchema,
  pageRequestDetailSchema,
  pageRequestPageSchema,
  pageRequestQuerySchema,
  requestCountsSchema,
  usernameCheckSchema,
  type ConnectionsQuery,
  type DeclineHonourInput,
  type GrantHonourInput,
  type HonourQuery,
  type PlatformUserQuery,
  type RejectCompanyInput,
  type RejectVerificationInput,
  type SuspendPlatformUserInput,
  type UpdateBadgesInput,
  type UpdatePlatformUserInput,
  type VerificationQuery,
} from "./validation"

// Empty strings are filters the admin cleared; the API rejects them as invalid values.
function compactParams<T extends Record<string, unknown>>(params: T) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== "")) as Partial<T>
}

const userPath = (id: string) => `/platform-users/${encodeURIComponent(id)}`
const verificationPath = (id: string) => `/verification-requests/${encodeURIComponent(id)}`
const companyPath = (id: string) => `/companies/${encodeURIComponent(id)}`
const honourPath = (userId: string) => `/honour-review/${encodeURIComponent(userId)}`
const businessRequestPath = (id: string) => `/business-requests/${encodeURIComponent(id)}`
const pageRequestPath = (id: string) => `/page-requests/${encodeURIComponent(id)}`

// ── People ────────────────────────────────────────────────────────────────

export async function getPlatformUsers(query: PlatformUserQuery, signal?: AbortSignal) {
  const params = compactParams(platformUserQuerySchema.parse(compactParams(query)))
  const { data } = await superAdminApi.get<unknown>("/platform-users", { params, signal })
  return platformUserPageSchema.parse(data)
}

export async function getUserStats(institutionId: string | undefined, signal?: AbortSignal) {
  const params = institutionId ? { institutionId: z.uuid().parse(institutionId) } : undefined
  const { data } = await superAdminApi.get<unknown>("/platform-users/stats", { params, signal })
  return userStatsSchema.parse(data)
}

export async function getPlatformUser(id: string, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>(userPath(id), { signal })
  return platformUserSchema.parse(data)
}

export async function getUserRelationships(id: string, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>(`${userPath(id)}/relationships`, { signal })
  return relationshipsSchema.parse(data)
}

export async function getUserConnections(id: string, query: ConnectionsQuery, signal?: AbortSignal) {
  const params = compactParams(connectionsQuerySchema.parse(query))
  const { data } = await superAdminApi.get<unknown>(`${userPath(id)}/connections`, { params, signal })
  return connectionsPageSchema.parse(data)
}

export async function updatePlatformUser({ id, input }: { id: string; input: UpdatePlatformUserInput }) {
  const { data } = await superAdminApi.patch<unknown>(userPath(id), updatePlatformUserSchema.parse(input))
  return platformUserSchema.parse(data)
}

export async function updateUserBadges({ id, input }: { id: string; input: UpdateBadgesInput }) {
  const { data } = await superAdminApi.patch<unknown>(`${userPath(id)}/badges`, updateBadgesSchema.parse(input))
  return platformUserSchema.parse(data)
}

export async function suspendPlatformUser({ id, input }: { id: string; input: SuspendPlatformUserInput }) {
  const body = compactParams(suspendPlatformUserSchema.parse(input))
  const { data } = await superAdminApi.post<unknown>(`${userPath(id)}/suspend`, body)
  return suspendResultSchema.parse(data)
}

export async function reactivatePlatformUser(id: string) {
  const { data } = await superAdminApi.post<unknown>(`${userPath(id)}/reactivate`)
  return platformUserSchema.parse(data)
}

// ── Institutions ──────────────────────────────────────────────────────────

export async function getInstitutions(signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/institutions", { signal })
  return z.array(institutionSchema).parse(data)
}

// ── Companies ─────────────────────────────────────────────────────────────

export async function getCompanies(query: CompanyQuery, signal?: AbortSignal) {
  const params = compactParams(companyQuerySchema.parse(compactParams(query)))
  const { data } = await superAdminApi.get<unknown>("/companies", { params, signal })
  return companyPageSchema.parse(data)
}

export async function getCompany(id: string, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>(companyPath(id), { signal })
  return companyDetailSchema.parse(data)
}

export async function approveCompany(id: string) {
  const { data } = await superAdminApi.post<unknown>(`${companyPath(id)}/approve`)
  return companySchema.parse(data)
}

export async function rejectCompany({ id, input }: { id: string; input: RejectCompanyInput }) {
  const { data } = await superAdminApi.post<unknown>(`${companyPath(id)}/reject`, rejectCompanySchema.parse(input))
  return companySchema.parse(data)
}

// ── Honours ───────────────────────────────────────────────────────────────

export async function getHonourNominees(query: HonourQuery, signal?: AbortSignal) {
  const params = compactParams(honourQuerySchema.parse(query))
  const { data } = await superAdminApi.get<unknown>("/honour-review", { params, signal })
  return honourPageSchema.parse(data)
}

export async function getHonourNominee(userId: string, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>(honourPath(userId), { signal })
  return honourDetailSchema.parse(data)
}

export async function grantHonour({ userId, input }: { userId: string; input: GrantHonourInput }) {
  const body = compactParams(grantHonourSchema.parse(input))
  const { data } = await superAdminApi.post<unknown>(`${honourPath(userId)}/grant`, body)
  return honourDetailSchema.parse(data)
}

export async function declineHonour({ userId, input }: { userId: string; input: DeclineHonourInput }) {
  const { data } = await superAdminApi.post<unknown>(`${honourPath(userId)}/decline`, declineHonourSchema.parse(input))
  return honourDetailSchema.parse(data)
}

// ── Verification ──────────────────────────────────────────────────────────

export async function getVerificationRequests(query: VerificationQuery, signal?: AbortSignal) {
  const params = compactParams(verificationQuerySchema.parse(compactParams(query)))
  const { data } = await superAdminApi.get<unknown>("/verification-requests", { params, signal })
  return verificationPageSchema.parse(data)
}

export async function approveVerificationRequest(id: string) {
  const { data } = await superAdminApi.post<unknown>(`${verificationPath(id)}/approve`)
  return verificationRequestSchema.omit({ reviewedBy: true }).parse(data)
}

export async function rejectVerificationRequest({ id, input }: { id: string; input: RejectVerificationInput }) {
  const { data } = await superAdminApi.post<unknown>(`${verificationPath(id)}/reject`, rejectVerificationSchema.parse(input))
  return verificationRequestSchema.omit({ reviewedBy: true }).parse(data)
}

// ── Business requests ─────────────────────────────────────────────────────

export async function getBusinessRequests(query: BusinessRequestQuery, signal?: AbortSignal) {
  const params = compactParams(businessRequestQuerySchema.parse(compactParams(query)))
  const { data } = await superAdminApi.get<unknown>("/business-requests", { params, signal })
  return businessRequestPageSchema.parse(data)
}

export async function getBusinessRequestCounts(signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/business-requests/counts", { signal })
  return businessRequestCountsSchema.parse(data)
}

export async function getBusinessRequest(id: string, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>(businessRequestPath(id), { signal })
  return businessRequestDetailSchema.parse(data)
}

export async function checkBusinessUsername({ id, username }: { id: string; username: string }, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>(`${businessRequestPath(id)}/username-available`, { params: { username }, signal })
  return usernameCheckSchema.parse(data)
}

/** Opening a NEW request claims it, so two admins don't review the same one. */
export async function claimBusinessRequest(id: string) {
  const { data } = await superAdminApi.post<unknown>(`${businessRequestPath(id)}/claim`)
  return businessRequestDetailSchema.parse(data)
}

export async function approveBusinessRequest({ id, input }: { id: string; input: ApproveBusinessRequestInput }) {
  const { data } = await superAdminApi.post<unknown>(`${businessRequestPath(id)}/approve`, approveBusinessRequestSchema.parse(input))
  return businessRequestDetailSchema.parse(data)
}

export async function askForBusinessRequestChanges({ id, input }: { id: string; input: BusinessRequestChangesInput }) {
  const { data } = await superAdminApi.post<unknown>(`${businessRequestPath(id)}/request-changes`, businessRequestChangesSchema.parse(input))
  return businessRequestDetailSchema.parse(data)
}

export async function declineBusinessRequest({ id, input }: { id: string; input: DeclineBusinessRequestInput }) {
  const { data } = await superAdminApi.post<unknown>(`${businessRequestPath(id)}/decline`, declineBusinessRequestSchema.parse(input))
  return businessRequestDetailSchema.parse(data)
}

// ── Page requests ─────────────────────────────────────────────────────────

export async function getPageRequests(query: PageRequestQuery, signal?: AbortSignal) {
  const params = compactParams(pageRequestQuerySchema.parse(compactParams(query)))
  const { data } = await superAdminApi.get<unknown>("/page-requests", { params, signal })
  return pageRequestPageSchema.parse(data)
}

export async function getPageRequestCounts(signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/page-requests/counts", { signal })
  return requestCountsSchema.parse(data)
}

export async function getPageRequest(id: string, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>(pageRequestPath(id), { signal })
  return pageRequestDetailSchema.parse(data)
}

export async function checkPageUsername({ id, username }: { id: string; username: string }, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>(`${pageRequestPath(id)}/username-available`, { params: { username }, signal })
  return usernameCheckSchema.parse(data)
}

/** Opening a NEW request claims it, so two admins don't review the same one. */
export async function claimPageRequest(id: string) {
  const { data } = await superAdminApi.post<unknown>(`${pageRequestPath(id)}/claim`)
  return pageRequestDetailSchema.parse(data)
}

export async function approvePageRequest({ id, input }: { id: string; input: ApprovePageRequestInput }) {
  const { data } = await superAdminApi.post<unknown>(`${pageRequestPath(id)}/approve`, approvePageRequestSchema.parse(input))
  return pageRequestDetailSchema.parse(data)
}

export async function askForPageRequestChanges({ id, input }: { id: string; input: PageRequestChangesInput }) {
  const { data } = await superAdminApi.post<unknown>(`${pageRequestPath(id)}/request-changes`, pageRequestChangesSchema.parse(input))
  return pageRequestDetailSchema.parse(data)
}

export async function declinePageRequest({ id, input }: { id: string; input: DeclineRequestInput }) {
  const { data } = await superAdminApi.post<unknown>(`${pageRequestPath(id)}/decline`, declineRequestSchema.parse(input))
  return pageRequestDetailSchema.parse(data)
}
