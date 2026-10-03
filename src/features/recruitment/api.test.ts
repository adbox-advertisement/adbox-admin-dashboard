import { describe, expect, it, vi } from "vitest"
import { superAdminApi } from "@/api/client"
import { recruitmentApplication } from "@/test/recruitment-fixtures"
import { changeStatus, exportApplications, getApplication, getApplications, getVideoUrl, saveReview } from "./api"

describe("recruitment API", () => {
  it("passes list filters to the server and validates response rows", async () => {
    const get = vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: { items: [recruitmentApplication], total: 31, page: 2, limit: 20 } })
    const filters = { search: "Ama", status: "SUBMITTED" as const, page: 2, limit: 20 }
    const result = await getApplications(filters)
    expect(get).toHaveBeenCalledWith("/recruitment/applications", expect.objectContaining({ params: filters }))
    expect(result.items[0]).not.toHaveProperty("phone")
    expect(result.total).toBe(31)
  })
  it("keeps every submitted answer while stripping technical and storage secrets", async () => {
    vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: { ...recruitmentApplication, submittedIpHash: "private", idempotencyKey: "private", video: { ...recruitmentApplication.video, storageKey: "private" } } })
    const application = await getApplication(recruitmentApplication.id)
    expect(application.paymentAnswer).toBe(recruitmentApplication.paymentAnswer)
    expect(application.comfortable).toBe(false)
    expect(application).not.toHaveProperty("submittedIpHash")
    expect(application.video).not.toHaveProperty("storageKey")
  })
  it("rejects malformed answers and unsafe video URLs", async () => {
    const get = vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: { ...recruitmentApplication, comfortable: "no" } })
    await expect(getApplication("id")).rejects.toThrow()
    get.mockResolvedValue({ data: { url: "javascript:alert(1)", expiresInSeconds: 300 } })
    await expect(getVideoUrl("id")).rejects.toThrow()
  })
  it("rejects skipped stages, terminal moves, and missing rejection reasons without a request", async () => {
    const post = vi.spyOn(superAdminApi, "post")
    await expect(changeStatus({ id: "id", currentStatus: "SUBMITTED", input: { status: "ACCEPTED", note: "" } })).rejects.toThrow()
    await expect(changeStatus({ id: "id", currentStatus: "ACCEPTED", input: { status: "UNDER_REVIEW", note: "" } })).rejects.toThrow()
    await expect(changeStatus({ id: "id", currentStatus: "SUBMITTED", input: { status: "REJECTED", note: "   " } })).rejects.toThrow()
    expect(post).not.toHaveBeenCalled()
  })
  it("writes only annotations and validates the rating", async () => {
    const patch = vi.spyOn(superAdminApi, "patch").mockResolvedValue({ data: recruitmentApplication })
    await saveReview({ id: "id", input: { internalNote: "Good experience", rating: 4 } })
    expect(patch).toHaveBeenCalledWith("/recruitment/applications/id", { internalNote: "Good experience", rating: 4 })
    await expect(saveReview({ id: "id", input: { internalNote: "", rating: 0 } })).rejects.toThrow()
    expect(patch).toHaveBeenCalledTimes(1)
  })
  it("exports only supported filters and rejects non-CSV success responses", async () => {
    const get = vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: '"reference","status"\n' })
    const filters = { campaignId: "campaign", search: "Ama", page: 2 }
    await exportApplications(filters)
    expect(get).toHaveBeenCalledWith("/recruitment/applications/export", { params: { campaignId: "campaign", status: undefined, institutionId: undefined }, responseType: "text" })
    get.mockResolvedValue({ data: "<html>Login</html>" })
    await expect(exportApplications({})).rejects.toThrow("Invalid recruitment CSV")
  })
})
