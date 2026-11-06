import { describe, expect, it, vi } from "vitest"
import { superAdminApi } from "@/api/client"
import {
  approveBusinessRequest, approveCompany, approvePageRequest, declineBusinessRequest, declinePageRequest, getBusinessRequest, getBusinessRequests,
  getCompany, getPageRequest, getPageRequests, getHonourNominee, getPlatformUsers, getUserConnections, getUserRelationships, getUserStats, getVerificationRequests,
  grantHonour, reactivatePlatformUser, rejectCompany, rejectVerificationRequest, suspendPlatformUser, updatePlatformUser, updateUserBadges,
} from "./api"
import {
  businessDetail, businessRequestFixtures, companyDetailFixture, pageDetail, pageRequestFixtures, companyFixture, connectionsFixture, honourCandidateFixture, institutionFixtures, page, platformUserFixtures,
  relationshipsFixture, statsFixture, verificationFixtures,
} from "@/test/users-fixtures"

const userId = platformUserFixtures[0].id

describe("Manage Users API contracts", () => {
  it("lists users with only the filters that are set", async () => {
    const get = vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: page(platformUserFixtures, 42) })
    const result = await getPlatformUsers({ search: " ama ", status: "active", verificationTier: undefined, page: 2 })
    expect(get).toHaveBeenCalledWith("/platform-users", { params: { search: "ama", status: "active", page: 2, limit: 20 }, signal: undefined })
    expect(result.total).toBe(42)
  })

  it("rejects malformed pages", async () => {
    vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: platformUserFixtures })
    await expect(getPlatformUsers({})).rejects.toThrow()
  })

  it("patches only the supplied profile fields", async () => {
    const patch = vi.spyOn(superAdminApi, "patch").mockResolvedValue({ data: platformUserFixtures[0] })
    await updatePlatformUser({ id: userId, input: { level: 400 } })
    expect(patch).toHaveBeenCalledWith(`/platform-users/${userId}`, { level: 400 })
  })

  it("suspends with an optional reason and reports revoked sessions", async () => {
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: { ...platformUserFixtures[0], isActive: false, revokedSessions: 2 } })
    expect((await suspendPlatformUser({ id: userId, input: {} })).revokedSessions).toBe(2)
    expect(post).toHaveBeenCalledWith(`/platform-users/${userId}/suspend`, {})
  })

  it("reactivates through its own endpoint", async () => {
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: platformUserFixtures[0] })
    await reactivatePlatformUser(userId)
    expect(post).toHaveBeenCalledWith(`/platform-users/${userId}/reactivate`)
  })

  it("loads and rejects verification requests", async () => {
    const get = vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: page(verificationFixtures) })
    await getVerificationRequests({ status: "PENDING" })
    expect(get).toHaveBeenCalledWith("/verification-requests", { params: { status: "PENDING", page: 1, limit: 20 }, signal: undefined })
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: { ...verificationFixtures[0], status: "REJECTED", rejectionNote: "Blurry" } })
    await rejectVerificationRequest({ id: verificationFixtures[0].id, input: { rejectionNote: " Blurry " } })
    expect(post).toHaveBeenCalledWith(`/verification-requests/${verificationFixtures[0].id}/reject`, { rejectionNote: "Blurry" })
  })

  it("sends role, affiliation and badge filters", async () => {
    const get = vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: page(platformUserFixtures) })
    await getPlatformUsers({ role: "PUBLISHER", affiliation: "NONE", badge: "company", status: "pending_deletion" })
    expect(get).toHaveBeenCalledWith("/platform-users", { params: { role: "PUBLISHER", affiliation: "NONE", badge: "company", status: "pending_deletion", page: 1, limit: 20 }, signal: undefined })
  })

  it("loads stats for everyone or one institution", async () => {
    const get = vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: statsFixture })
    expect((await getUserStats(undefined)).roles.PUBLISHER).toBe(12)
    expect(get).toHaveBeenLastCalledWith("/platform-users/stats", { params: undefined, signal: undefined })
    await getUserStats(institutionFixtures[0].id)
    expect(get).toHaveBeenLastCalledWith("/platform-users/stats", { params: { institutionId: institutionFixtures[0].id }, signal: undefined })
  })

  it("loads a person's relationships and a page of their connections", async () => {
    const get = vi.spyOn(superAdminApi, "get").mockResolvedValueOnce({ data: relationshipsFixture }).mockResolvedValueOnce({ data: connectionsFixture("blocking") })
    expect((await getUserRelationships(userId)).companies[0].isOwner).toBe(true)
    await getUserConnections(userId, { direction: "blocking", page: 2 })
    expect(get).toHaveBeenLastCalledWith(`/platform-users/${userId}/connections`, { params: { direction: "blocking", page: 2, limit: 20 }, signal: undefined })
  })

  it("patches badges, sending null to switch Spotlight off", async () => {
    const patch = vi.spyOn(superAdminApi, "patch").mockResolvedValue({ data: platformUserFixtures[0] })
    await updateUserBadges({ id: userId, input: { spotlightUntil: null, honour: "REVOKE" } })
    expect(patch).toHaveBeenCalledWith(`/platform-users/${userId}/badges`, { spotlightUntil: null, honour: "REVOKE" })
  })

  it("loads a company with its publishers and decides on it", async () => {
    vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: companyDetailFixture })
    expect((await getCompany(companyFixture.id)).publishers).toHaveLength(2)
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: { ...companyFixture, status: "ACTIVE" } })
    await approveCompany(companyFixture.id)
    expect(post).toHaveBeenLastCalledWith(`/companies/${companyFixture.id}/approve`)
    await rejectCompany({ id: companyFixture.id, input: { rejectionNote: " Wrong number " } })
    expect(post).toHaveBeenLastCalledWith(`/companies/${companyFixture.id}/reject`, { rejectionNote: "Wrong number" })
  })

  it("reads a nominee's nominations and grants with an override note", async () => {
    const detail = { ...honourCandidateFixture(false), nominations: [{ nominatorId: platformUserFixtures[1].id, username: null, fullName: "Kojo", institutionId: null, reason: "Kind", createdAt: "2026-10-01T10:00:00.000Z" }] }
    vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: detail })
    expect((await getHonourNominee(userId)).nominations[0].fullName).toBe("Kojo")
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: detail })
    await grantHonour({ userId, input: { override: true, note: "Led the clean-up drive" } })
    expect(post).toHaveBeenCalledWith(`/honour-review/${userId}/grant`, { override: true, note: "Led the clean-up drive" })
  })

  it("asks for business requests with only the filters that are set", async () => {
    const get = vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: page(businessRequestFixtures) })
    const result = await getBusinessRequests({ status: "open", search: " BN1 " })
    expect(get).toHaveBeenCalledWith("/business-requests", { params: { status: "open", search: "BN1", page: 1, limit: 20 }, signal: undefined })
    expect(result.items[1].proof).toBeNull()
  })

  it("reads a business request with its proof link and history", async () => {
    vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: businessDetail(businessRequestFixtures[0]) })
    const request = await getBusinessRequest(businessRequestFixtures[0].id)
    expect(request.proofUrl).toBe("https://s3.example.com/proof?signed")
    expect(request.history).toHaveLength(1)
  })

  it("approves with a cleaned username and declines without an empty note", async () => {
    const id = businessRequestFixtures[0].id
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: businessDetail(businessRequestFixtures[0]) })
    await approveBusinessRequest({ id, input: { username: " @Akos.Legon ", name: " Akos " } })
    expect(post).toHaveBeenCalledWith(`/business-requests/${id}/approve`, { username: "akos.legon", name: "Akos" })
    await declineBusinessRequest({ id, input: { reason: "IMPERSONATION", note: "  " } })
    expect(post).toHaveBeenLastCalledWith(`/business-requests/${id}/decline`, { reason: "IMPERSONATION" })
  })

  it("reads page requests and decides them on super-admin's routes", async () => {
    const get = vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: page(pageRequestFixtures) })
    const list = await getPageRequests({ status: "NEW", search: " ug " })
    expect(get).toHaveBeenCalledWith("/page-requests", { params: { status: "NEW", search: "ug", page: 1, limit: 20 }, signal: undefined })
    expect(list.items[1].letter).toBeNull()
    get.mockResolvedValue({ data: pageDetail(pageRequestFixtures[0]) })
    expect((await getPageRequest(pageRequestFixtures[0].id)).letterUrl).toBe("https://s3.example.com/letter?signed")

    const id = pageRequestFixtures[0].id
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: pageDetail(pageRequestFixtures[0]) })
    await approvePageRequest({ id, input: { username: " @UG.CSU ", name: " CSU " } })
    expect(post).toHaveBeenCalledWith(`/page-requests/${id}/approve`, { username: "ug.csu", name: "CSU" })
    await declinePageRequest({ id, input: { reason: "ALREADY_HAS_PAGE", note: "" } })
    expect(post).toHaveBeenLastCalledWith(`/page-requests/${id}/decline`, { reason: "ALREADY_HAS_PAGE" })
  })
})
