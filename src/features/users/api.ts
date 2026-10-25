import { z } from "zod"
import { superAdminApi } from "@/api/client"
import {
  companyDetailSchema,
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
  type CompanyQuery,
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
