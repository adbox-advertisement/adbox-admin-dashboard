import { beforeEach, describe, expect, it, vi } from "vitest"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test/test-utils"
import { superAdminApi } from "@/api/client"
import { profileFixture } from "@/test/rbac-fixtures"
import { recruitmentApplication, recruitmentCampaign, recruitmentStats } from "@/test/recruitment-fixtures"
import { RecruitmentPage } from "./RecruitmentPage"

describe("recruitment review workspace", () => {
  let application = structuredClone(recruitmentApplication)
  let permissions = ["*"]
  beforeEach(() => {
    application = structuredClone(recruitmentApplication)
    permissions = ["*"]
    vi.spyOn(superAdminApi, "get").mockImplementation(async url => {
      if (url === "/auth/me") return { data: { ...profileFixture, permissions } }
      if (url === "/recruitment/campaigns") return { data: [recruitmentCampaign] }
      if (url === "/recruitment/applications/stats") return { data: recruitmentStats }
      if (url === "/recruitment/applications") return { data: { items: [application], total: 1, page: 1, limit: 10 } }
      if (url.endsWith("/video-url")) return { data: { url: "https://example.com/private-video", expiresInSeconds: 300 } }
      return { data: application }
    })
  })
  async function openProfile() {
    const user = userEvent.setup()
    renderWithProviders(<RecruitmentPage />)
    // Allow the permission check and subsequent queue request to resolve when
    // the full suite starts several jsdom workers at once.
    await user.click(await screen.findByRole("button", { name: "Review Ama Test" }, { timeout: 3000 }))
    await screen.findByRole("heading", { name: "Ama Test" })
    return user
  }
  it("displays every submitted answer and fetches video access only on demand", async () => {
    const user = await openProfile()
    const profile = within(screen.getByRole("dialog"))
    for (const value of [application.programme, application.campusReach, application.motivation, application.experience, application.availability, application.otherRoles, application.phoneModel, application.paymentAnswer]) expect(profile.getByText(value)).toBeVisible()
    expect(profile.getByText("No", { exact: true })).toBeVisible()
    expect(profile.getByText("Yes", { exact: true })).toBeVisible()
    expect(vi.mocked(superAdminApi.get).mock.calls.some(([url]) => url.endsWith("/video-url"))).toBe(false)
    await user.click(profile.getByRole("button", { name: "Watch introduction" }))
    expect(await profile.findByLabelText("Candidate introduction video")).toHaveAttribute("src", "https://example.com/private-video")
  })
  it("keeps assessment input across tabs and failed saves, then persists through the API", async () => {
    const patch = vi.spyOn(superAdminApi, "patch").mockRejectedValueOnce(new Error("Offline")).mockImplementation(async (_url, input) => {
      application = { ...application, ...(input as { internalNote: string; rating: number }) }
      return { data: application }
    })
    const user = await openProfile()
    await user.click(screen.getByRole("tab", { name: "Notes & history" }))
    await user.type(screen.getByLabelText("Internal note"), "Strong campus network")
    await user.click(screen.getByRole("radio", { name: "4 out of 5" }))
    await user.click(screen.getByRole("tab", { name: "Application" }))
    await user.click(screen.getByRole("tab", { name: "Notes & history" }))
    expect(screen.getByLabelText("Internal note")).toHaveValue("Strong campus network")
    await user.click(screen.getByRole("button", { name: "Save assessment" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("couldn't complete")
    expect(screen.getByLabelText("Internal note")).toHaveValue("Strong campus network")
    await user.click(screen.getByRole("button", { name: "Save assessment" }))
    await waitFor(() => expect(patch).toHaveBeenCalledTimes(2))
    expect(patch).toHaveBeenLastCalledWith(`/recruitment/applications/${application.id}`, { internalNote: "Strong campus network", rating: 4 })
  })
  it("shows where the application is and offers one next step", async () => {
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: { ...application, status: "UNDER_REVIEW" } })
    const user = await openProfile()
    const stages = within(screen.getByRole("list", { name: "Review stages" }))
    expect(stages.getAllByRole("listitem")).toHaveLength(5)
    expect(stages.getByText("New").closest("li")).toHaveAttribute("aria-current", "step")
    const next = within(screen.getByRole("region", { name: "Next step" }))
    expect(next.getByText("Give it a first look")).toBeVisible()
    // A new application can only start review, be rejected or be withdrawn: never accepted straight away.
    expect(next.queryByRole("button", { name: /Accept/ })).not.toBeInTheDocument()
    await user.click(next.getByRole("button", { name: "Start review" }))
    await user.click(next.getByRole("button", { name: "Move to In review" }))
    await waitFor(() => expect(post).toHaveBeenCalledWith(`/recruitment/applications/${application.id}/status`, { status: "UNDER_REVIEW", note: "" }))
  })
  it("requires a rejection reason and makes the final decision explicit", async () => {
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: { ...application, status: "REJECTED" } })
    const user = await openProfile()
    const next = within(screen.getByRole("region", { name: "Next step" }))
    await user.click(next.getByRole("button", { name: "Reject…" }))
    expect(next.getByText(/This is final/)).toBeVisible()
    await user.click(next.getByRole("button", { name: "Reject application" }))
    expect(post).not.toHaveBeenCalled()
    expect(await screen.findByRole("alert")).toHaveTextContent("Add a reason")
    await user.type(screen.getByLabelText("Decision note (required)"), "Availability does not match the role")
    await user.click(next.getByRole("button", { name: "Reject application" }))
    await waitFor(() => expect(post).toHaveBeenCalledWith(`/recruitment/applications/${application.id}/status`, { status: "REJECTED", note: "Availability does not match the role" }))
  })
  it("provides a manual email draft and never sends a message", async () => {
    const post = vi.spyOn(superAdminApi, "post")
    const user = await openProfile()
    await user.click(screen.getByRole("tab", { name: "Contact" }))
    expect(screen.getByRole("link", { name: "Open email draft" })).toHaveAttribute("href", expect.stringContaining("mailto:ama%40example.com"))
    expect(screen.getByText("Opening a draft does not send a message or change the review stage.")).toBeVisible()
    expect(post).not.toHaveBeenCalled()
  })
  it("sends search to the server with the first page", async () => {
    const user = userEvent.setup()
    renderWithProviders(<RecruitmentPage />)
    await user.type(await screen.findByRole("textbox", { name: "Search candidates" }), "Ama")
    await user.click(screen.getByRole("button", { name: "Search" }))
    await waitFor(() => expect(superAdminApi.get).toHaveBeenCalledWith("/recruitment/applications", expect.objectContaining({ params: { search: "Ama", page: 1, limit: 10 } })))
  })
  it("searches while typing and lets reviewers remove an individual filter", async () => {
    const user = userEvent.setup()
    renderWithProviders(<RecruitmentPage />)
    await user.type(await screen.findByRole("textbox", { name: "Search candidates" }), "Ama")
    await waitFor(() => expect(superAdminApi.get).toHaveBeenCalledWith("/recruitment/applications", expect.objectContaining({ params: { search: "Ama", page: 1, limit: 10 } })))
    await user.click(screen.getByRole("button", { name: "Clear search" }))
    expect(screen.getByRole("textbox", { name: "Search candidates" })).toHaveValue("")
    await user.click(screen.getByRole("button", { name: /^Shortlisted: 0 applications/ }))
    await waitFor(() => expect(superAdminApi.get).toHaveBeenCalledWith("/recruitment/applications", expect.objectContaining({ params: { search: undefined, status: "SHORTLISTED", page: 1, limit: 10 } })))
    await user.click(screen.getByRole("button", { name: "Remove stage filter" }))
    expect(screen.getByRole("button", { name: /^All candidates/ })).toHaveAttribute("aria-pressed", "true")
  })
  it("supports a larger page size and a shortcut to new applications", async () => {
    const user = userEvent.setup()
    renderWithProviders(<RecruitmentPage />)
    await user.click(await screen.findByRole("combobox", { name: "Per page" }))
    await user.click(screen.getByRole("option", { name: "50" }))
    await waitFor(() => expect(superAdminApi.get).toHaveBeenCalledWith("/recruitment/applications", expect.objectContaining({ params: { page: 1, limit: 50 } })))
    await user.click(screen.getByRole("button", { name: "Review new applications" }))
    await waitFor(() => expect(superAdminApi.get).toHaveBeenCalledWith("/recruitment/applications", expect.objectContaining({ params: { page: 1, limit: 50, status: "SUBMITTED", institutionId: undefined, search: undefined } })))
  })
  it("shows the pipeline, what waits first, and each candidate's next step", async () => {
    renderWithProviders(<RecruitmentPage />)
    const pipeline = within(await screen.findByRole("region", { name: "Where every application is" }))
    expect(await pipeline.findByRole("button", { name: "New: 1 application, waiting for a first look" })).toHaveAttribute("aria-pressed", "false")
    expect(pipeline.getByRole("button", { name: /^Accepted: 0 applications, on the team/ })).toBeInTheDocument()
    expect(pipeline.getByText("Closed")).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Waiting for you" })).toHaveTextContent("1 new application waiting for a first look")
    const row = within(screen.getByRole("list", { name: "Candidates" }))
    expect((await row.findAllByText("Give it a first look")).length).toBeGreaterThan(0)
  })
  it("does not request recruitment data without read permission", async () => {
    permissions = []
    renderWithProviders(<RecruitmentPage />)
    expect(await screen.findByRole("heading", { name: "Recruitment access needed" })).toBeVisible()
    expect(vi.mocked(superAdminApi.get).mock.calls.every(([url]) => url === "/auth/me")).toBe(true)
  })
  it("keeps read-only accounts out of review, export and campaign management calls", async () => {
    permissions = ["recruitment.applications.read"]
    const user = await openProfile()
    expect(screen.queryByRole("button", { name: "Reject…" })).not.toBeInTheDocument()
    expect(screen.getByText(/You have view-only access. Next step for this application: give it a first look/)).toBeVisible()
    await user.click(screen.getByRole("tab", { name: "Notes & history" }))
    expect(screen.getByLabelText("Internal note")).toBeDisabled()
    expect(screen.queryByRole("button", { name: "Save assessment" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Export CSV" })).not.toBeInTheDocument()
    expect(vi.mocked(superAdminApi.get).mock.calls.some(([url]) => url === "/recruitment/campaigns")).toBe(false)
  })
  it("explains redaction and removes video and contact actions", async () => {
    application.redactedAt = "2026-10-03T00:00:00.000Z"
    const user = userEvent.setup()
    renderWithProviders(<RecruitmentPage />)
    await user.click(await screen.findByRole("button", { name: `Review ${application.reference}` }))
    expect(await screen.findByText(/personal data and video have been removed/)).toBeVisible()
    expect(screen.queryByRole("button", { name: "Watch introduction" })).not.toBeInTheDocument()
    await user.click(screen.getByRole("tab", { name: "Contact" }))
    expect(screen.queryByRole("link", { name: "Open email draft" })).not.toBeInTheDocument()
  })
})
