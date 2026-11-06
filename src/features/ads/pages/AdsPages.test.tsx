import { beforeEach, describe, expect, it, vi } from "vitest"
import { configure, fireEvent, screen, waitFor, within } from "@testing-library/react"
import { renderWithProviders } from "@/test/test-utils"
import { superAdminApi } from "@/api/client"
import { profileFixture } from "@/test/rbac-fixtures"
import { AdRequestsPage } from "./AdRequestsPage"
import { AdsOverviewPage } from "./AdsOverviewPage"
import { ReportedAdsPage } from "./ReportedAdsPage"

const advertiser = {
  id: "u-1", name: "Kojo Mensah", username: "kojo", email: "kojo@example.com", image: null, isActive: true,
  kind: "PERSON", company: null, joinedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(), emailVerified: false,
}
const ad = (overrides: Record<string, unknown> = {}) => ({
  id: "c-1", type: "PROFILE", name: "Profile ad · 5 Nov · #1", goal: "FOLLOWERS", audience: "ALL", institutionIds: [], campusIds: [],
  status: "PENDING_REVIEW", dailyBudgetBars: 500, durationDays: 3, budgetBars: 1500, cpmBars: 1250, chargedBars: 0, returnedBars: 0,
  heldBars: 1500, maxViews: 1200, startsAt: null, endsAt: null, cancelledAt: null, autoApproved: false, reviewedAt: null,
  rejectionReason: null, pausedAt: null, pauseReason: null, settledAt: null, resourceId: null,
  content: { body: "Follow me for campus news." }, createdAt: new Date(Date.now() - 3 * 3_600_000).toISOString(),
  stats: { views: 0, reach: 0, clicks: 0, engagements: 0 }, openReports: 0, advertiser,
  ...overrides,
})
const detail = (overrides: Record<string, unknown> = {}) => ({
  ...ad(overrides), daily: [], post: null, places: { institutions: [], campuses: [] }, reviewer: null, reports: [], ...overrides,
})

// The overview waits on four queries; a loaded machine takes more than the default second.
configure({ asyncUtilTimeout: 5000 })

let permissions: string[] = ["*"]
let list: Record<string, unknown>
let reported: Record<string, unknown>
let one: Record<string, unknown>

describe("Ads Management", () => {
  beforeEach(() => {
    permissions = ["*"]
    list = { items: [ad()], total: 1, page: 1, limit: 20, counts: { PENDING_REVIEW: 1, ACTIVE: 4, COMPLETED: 9 } }
    reported = { items: [], total: 2, page: 1, limit: 20 }
    one = detail()
    vi.restoreAllMocks()
    vi.spyOn(superAdminApi, "get").mockImplementation(async (url) => {
      if (url === "/auth/me") return { data: { ...profileFixture, permissions } }
      if (url === "/ads") return { data: list }
      if (url === "/ads/reported") return { data: reported }
      if (String(url).startsWith("/ads/")) return { data: one }
      throw new Error("Unexpected GET " + url)
    })
  })

  it("counts every stage and links what needs a decision", async () => {
    renderWithProviders(<AdsOverviewPage />)
    expect(await screen.findByText("Follow me for campus news.")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /1\s*Waiting for review/ })).toHaveAttribute("href", "/ads-management/ad-requests")
    expect(screen.getByRole("link", { name: /2\s*Reported/ })).toHaveAttribute("href", "/ads-management/reported-ads")
    // Money in bars: charged of what is held.
    expect(screen.getByText("0 / 1,500")).toBeInTheDocument()
    const stages = screen.getByRole("group", { name: "Ad stage" })
    expect(within(stages).getByRole("button", { name: /All ads\s*14/ })).toHaveAttribute("aria-pressed", "true")
    fireEvent.click(within(stages).getByRole("button", { name: /Running\s*4/ }))
    await waitFor(() => expect(vi.mocked(superAdminApi.get)).toHaveBeenCalledWith("/ads", expect.objectContaining({ params: expect.objectContaining({ status: "ACTIVE" }) })))
  })

  it("approves an ad in review from its page", async () => {
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: {} })
    renderWithProviders(<AdRequestsPage />)
    fireEvent.click(await screen.findByRole("button", { name: "Follow me for campus news." }))
    const sheet = await screen.findByRole("dialog")
    // What a reviewer weighs: a new person, an unverified email, the bars held.
    expect(within(sheet).getByText("Person")).toBeInTheDocument()
    expect(within(sheet).getByText(/kojo@example\.com · not verified/)).toBeInTheDocument()
    // Held at the start and still held: nothing charged in review.
    expect(within(sheet).getAllByText("1,500 bars")).toHaveLength(2)
    expect(within(sheet).getByText("0 bars")).toBeInTheDocument()
    fireEvent.click(within(sheet).getByRole("button", { name: "Approve" }))
    await waitFor(() => expect(post).toHaveBeenCalledWith("/ads/c-1/approve"))
    expect(screen.getByText(/Account 2 days old/)).toBeInTheDocument()
  })

  it("refuses with a reason the advertiser reads", async () => {
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: {} })
    renderWithProviders(<AdRequestsPage />)
    fireEvent.click(await screen.findByRole("button", { name: "Follow me for campus news." }))
    const sheet = await screen.findByRole("dialog")
    fireEvent.click(within(sheet).getByRole("button", { name: "Refuse" }))
    const dialog = await screen.findByRole("dialog", { name: "Refuse this ad" })
    const confirm = within(dialog).getByRole("button", { name: "Refuse ad" })
    expect(confirm).toBeDisabled()
    fireEvent.click(within(dialog).getByRole("button", { name: "Betting is not allowed in ads." }))
    fireEvent.click(confirm)
    await waitFor(() => expect(post).toHaveBeenCalledWith("/ads/c-1/reject", { reason: "Betting is not allowed in ads." }))
  })

  it("searches the queue by name, username or email", async () => {
    renderWithProviders(<AdRequestsPage />)
    await screen.findByText("Follow me for campus news.")
    fireEvent.change(screen.getByRole("searchbox", { name: /Search by ad name/ }), { target: { value: "kojo" } })
    await waitFor(() => expect(vi.mocked(superAdminApi.get)).toHaveBeenCalledWith("/ads", expect.objectContaining({
      params: expect.objectContaining({ status: "PENDING_REVIEW", search: "kojo" }),
    })))
  })

  it("a reader looks but cannot decide", async () => {
    permissions = ["ads.read"]
    renderWithProviders(<AdRequestsPage />)
    expect(await screen.findByText(/deciding needs ads\.review/)).toBeInTheDocument()
    fireEvent.click(await screen.findByRole("button", { name: "Follow me for campus news." }))
    const sheet = await screen.findByRole("dialog")
    expect(within(sheet).queryByRole("button", { name: "Approve" })).not.toBeInTheDocument()
  })

  it("decides reports: shows the reasons, dismisses or upholds with a reason", async () => {
    const paused = { ...ad({ status: "PAUSED", pauseReason: "REPORTS", openReports: 3, startsAt: "2026-11-04T10:00:00.000Z", endsAt: "2026-11-07T10:00:00.000Z", chargedBars: 3, heldBars: 1497 }) }
    reported = { items: [{ ...paused, reasons: [{ reason: "MISLEADING", count: 2 }, { reason: "SCAM", count: 1 }], lastReportedAt: new Date().toISOString() }], total: 1, page: 1, limit: 20 }
    one = detail({ ...paused, reports: [{ id: "r-1", reason: "MISLEADING", details: "Prices are wrong", status: "OPEN", createdAt: new Date().toISOString(), reporter: { id: "u-2", name: "Ama", username: "ama" } }] })
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: {} })
    renderWithProviders(<ReportedAdsPage />)
    expect(await screen.findByText("Misleading · 2")).toBeInTheDocument()
    expect(screen.getByText("Scam or fraud · 1")).toBeInTheDocument()
    expect(screen.getByText("Paused by reports")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Follow me for campus news." }))
    const sheet = await screen.findByRole("dialog")
    expect(await within(sheet).findByText("“Prices are wrong”")).toBeInTheDocument()
    // Paused by reports: resumed by deciding them, not by Resume.
    expect(within(sheet).queryByRole("button", { name: "Resume" })).not.toBeInTheDocument()
    fireEvent.click(within(sheet).getByRole("button", { name: "Uphold reports" }))
    const dialog = await screen.findByRole("dialog", { name: "Uphold the reports" })
    fireEvent.change(within(dialog).getByLabelText("Reason the advertiser reads"), { target: { value: "The prices shown are not real." } })
    fireEvent.click(within(dialog).getByRole("button", { name: "Uphold and stop" }))
    await waitFor(() => expect(post).toHaveBeenCalledWith("/ads/c-1/reports/resolve", { decision: "UPHOLD", reason: "The prices shown are not real." }))
  })

  it("stops a running ad, returning everything only when asked", async () => {
    list = { ...list, items: [ad({ status: "ACTIVE", startsAt: "2026-11-04T10:00:00.000Z", endsAt: "2026-11-07T10:00:00.000Z" })] }
    one = detail({ status: "ACTIVE", startsAt: "2026-11-04T10:00:00.000Z", endsAt: "2026-11-07T10:00:00.000Z" })
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: {} })
    renderWithProviders(<AdsOverviewPage />)
    fireEvent.click(await screen.findByRole("button", { name: "Follow me for campus news." }))
    const sheet = await screen.findByRole("dialog")
    fireEvent.click(within(sheet).getByRole("button", { name: "Stop" }))
    const dialog = await screen.findByRole("dialog", { name: "Stop this ad" })
    fireEvent.change(within(dialog).getByLabelText("Reason the advertiser reads"), { target: { value: "Our mistake: wrong audience." } })
    fireEvent.click(within(dialog).getByRole("checkbox", { name: "Return every bar" }))
    fireEvent.click(within(dialog).getByRole("button", { name: "Stop ad" }))
    await waitFor(() => expect(post).toHaveBeenCalledWith("/ads/c-1/stop", { reason: "Our mistake: wrong audience.", returnAll: true }))
  })

  it("without ads.read, says so", async () => {
    permissions = ["gold.settings.read"]
    renderWithProviders(<AdsOverviewPage />)
    expect(await screen.findByText("You don't have access to ads")).toBeInTheDocument()
  })
})
