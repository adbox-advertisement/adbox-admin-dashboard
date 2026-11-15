import { beforeEach, describe, expect, it, vi } from "vitest"
import { Route, Routes } from "react-router-dom"
import userEvent from "@testing-library/user-event"
import { renderWithProviders, screen, waitFor, within } from "@/test/test-utils"
import { superAdminApi } from "@/api/client"
import { profileFixture } from "@/test/rbac-fixtures"
import { DEFAULT_DISCOVER_POLICY, DEFAULT_RANKING_CONFIG, DISCOVER_POLICY_BOUNDS, RANKING_CONFIG_BOUNDS } from "../data/backend-defaults"
import { RecommendationsLayout } from "./RecommendationsLayout"
import { TrendingOverridesPage } from "./TrendingOverridesPage"

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`
const UG = id(101)
const KNUST = id(103)
const later = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString()
const earlier = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString()

const directory = [
  { id: UG, name: "University of Ghana", shortName: "UG", region: "Greater Accra", isActive: true, campuses: [{ id: id(102), name: "Legon", halls: [{ id: id(105), name: "Commonwealth Hall", isActive: true }] }] },
  { id: KNUST, name: "Kwame Nkrumah University of Science and Technology", shortName: "KNUST", region: "Ashanti", isActive: true, campuses: [] },
]
const item = (rank: number, kind: string, n: number, name: string) => ({ rank, kind, id: id(n), name, score: 10 - rank, metrics: { participants: 40 }, trend: { direction: "UP", changePct: 30 } })
const pin = { id: id(201), scopeKey: "global", kind: "HASHTAG", subjectId: id(1), action: "PIN", rank: 1, multiplier: null, reason: "Freshers week launch", startsAt: earlier(60), endsAt: later(5), endedAt: null }

let permissions: string[] = ["*"]
let inForce: Array<Record<string, unknown>> = []

const slow = { timeout: 8000 }

function renderPage() {
  return renderWithProviders(<Routes>
    <Route path="/algorithms" element={<RecommendationsLayout />}>
      <Route path="trending-overrides" element={<TrendingOverridesPage />} />
    </Route>
  </Routes>, { initialEntries: ["/algorithms/trending-overrides"] })
}

describe("Trending overrides", { timeout: 20_000 }, () => {
  beforeEach(() => {
    permissions = ["*"]
    inForce = [{ ...pin, state: "ACTIVE" }]
    vi.restoreAllMocks()
    vi.spyOn(superAdminApi, "get").mockImplementation(async (url, config) => {
      const params = (config?.params ?? {}) as Record<string, unknown>
      if (url === "/auth/me") return { data: { ...profileFixture, permissions } }
      // The section's live settings, read by its layout on every page.
      if (url === "/feed-ranking") return { data: { active: null, defaults: DEFAULT_RANKING_CONFIG, bounds: RANKING_CONFIG_BOUNDS } }
      if (url === "/discover-studio/policy") return { data: { active: null, defaults: DEFAULT_DISCOVER_POLICY, bounds: DISCOVER_POLICY_BOUNDS } }
      if (url === "/gold-settings") return { data: { values: { adFrequencyCapPerDay: 3, adCpmBars: 1250, adMinAudience: 100, adDailyBudgetMinBars: 500, adDailyBudgetMaxBars: 12500 }, updatedAt: null } }
      if (url === "/discover-studio/trends/status") return { data: { lastSuccessAt: earlier(3), stale: false, intervalMinutes: 5, scopes: ["global", `inst:${UG}`] } }
      if (url === "/discover-studio/trends") {
        return { data: { scopeKey: params.scopeKey, overrides: [{ ...pin, name: "#freshersweek" }], snapshot: {
          computedAt: earlier(3), policyVersion: "discover-v1",
          items: [item(1, "HASHTAG", 1, "#freshersweek"), item(2, "EVENT", 2, "Campus food fair"), item(3, "INSTITUTION", 101, "UG"), item(4, "HASHTAG", 4, "#ugexams")],
          diagnostics: { candidates: 50, relaxed: 0, missed: [{ kind: "PERSON", id: id(10), name: "Kojo Mensah", score: 1, reasons: ["participants 11 < 15"] }] },
        } } }
      }
      if (url === "/discover-studio/overrides") return { data: { items: params.includeEnded ? [...inForce, { ...pin, id: id(299), state: "ENDED", endedAt: earlier(500) }] : inForce } }
      if (url === "/institutions") return { data: directory }
      if (url === "/discover-studio/events") return { data: { items: [] } }
      if (url === "/discover-studio/hashtags") return { data: { items: [] } }
      if (url === "/platform-users") return { data: { items: [] } }
      throw new Error("Unexpected GET " + url)
    })
  })

  it("shows the list with its kinds, the overrides in force, and what just missed", async () => {
    renderPage()
    expect(await screen.findByText("Campus food fair", {}, slow)).toBeInTheDocument()
    const list = screen.getByRole("list", { name: "The list now" })
    expect(within(list).getByText("Pinned at 1st")).toBeInTheDocument()
    expect(within(list).getByText("Institution")).toBeInTheDocument()
    expect(screen.getByText(/11 people taking part; needs 15/)).toBeInTheDocument()
    const overrides = screen.getByRole("list", { name: "Overrides" })
    expect(within(overrides).getByText("In force")).toBeInTheDocument()
    expect(within(overrides).getByText("“Freshers week launch”")).toBeInTheDocument()
  })

  it("pins a subject from its row, with a place, a reason and a length", async () => {
    const user = userEvent.setup()
    const post = vi.spyOn(superAdminApi, "post").mockImplementation(async (_url, body) => ({ data: { ...(body as object), id: id(300), endedAt: null, state: "ACTIVE", startsAt: earlier(0) } }))
    renderPage()
    await user.click(await screen.findByRole("button", { name: "Change where #ugexams appears" }, slow))
    await user.click(await screen.findByRole("menuitem", { name: "Pin…" }))
    const dialog = await screen.findByRole("dialog", {}, slow)
    expect(within(dialog).getByTestId("override-subject")).toHaveTextContent("#ugexams")
    await user.click(within(dialog).getByRole("radio", { name: "3rd" }))
    await user.click(within(dialog).getByRole("radio", { name: "3 days" }))
    expect(within(dialog).getByRole("button", { name: "Add override" })).toBeDisabled()
    await user.type(within(dialog).getByLabelText(/^Why/), "Exam week")
    expect(within(dialog).getByTestId("override-summary")).toHaveTextContent("Pinned at 3rd: #ugexams in the Nationwide list")
    await user.click(within(dialog).getByRole("button", { name: "Add override" }))

    await waitFor(() => expect(post).toHaveBeenCalledTimes(1), slow)
    const [url, body] = post.mock.calls[0] as [string, Record<string, unknown>]
    expect(url).toBe("/discover-studio/overrides")
    expect(body).toMatchObject({ scopeKey: "global", kind: "HASHTAG", subjectId: id(4), action: "PIN", rank: 3, reason: "Exam week" })
    expect(body).not.toHaveProperty("multiplier")
    expect(new Date(body.endsAt as string).getTime() - Date.now()).toBeGreaterThan(2.9 * 86_400_000)
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument(), slow)
  })

  it("finds a subject of another kind and features it at the default place", async () => {
    const user = userEvent.setup()
    const post = vi.spyOn(superAdminApi, "post").mockImplementation(async (_url, body) => ({ data: { ...(body as object), id: id(301), endedAt: null, startsAt: earlier(0) } }))
    renderPage()
    await user.click(await screen.findByRole("button", { name: "Add an override" }, slow))
    const dialog = await screen.findByRole("dialog", {}, slow)
    await user.click(within(dialog).getByRole("radio", { name: "Institution" }))
    await user.type(within(dialog).getByLabelText("Search institutions"), "kwame")
    await user.click(await within(dialog).findByRole("button", { name: "Choose KNUST" }, slow))
    await user.click(within(dialog).getByRole("radio", { name: /^Feature/ }))
    await user.type(within(dialog).getByLabelText(/^Why/), "Open day")
    await user.click(within(dialog).getByRole("button", { name: "Add override" }))
    await waitFor(() => expect(post).toHaveBeenCalledWith("/discover-studio/overrides", expect.objectContaining({ kind: "INSTITUTION", subjectId: KNUST, action: "FEATURE", reason: "Open day" })), slow)
    expect(post.mock.calls[0][1]).not.toHaveProperty("rank")
  })

  it("ends an override only after confirming", async () => {
    const user = userEvent.setup()
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: { ...pin, endedAt: earlier(0), state: "ENDED" } })
    renderPage()
    const overrides = await screen.findByRole("list", { name: "Overrides" }, slow)
    await user.click(within(overrides).getByRole("button", { name: "End now" }))
    const dialog = await screen.findByRole("dialog", {}, slow)
    expect(within(dialog).getByText("End this override now?")).toBeInTheDocument()
    expect(post).not.toHaveBeenCalled()
    await user.click(within(dialog).getByRole("button", { name: "End now" }))
    await waitFor(() => expect(post).toHaveBeenCalledWith(`/discover-studio/overrides/${pin.id}/end`), slow)
  })

  it("says so before sending a pin the list has no room for", async () => {
    inForce = [1, 2, 3].map((n) => ({ ...pin, id: id(400 + n), subjectId: id(500 + n), state: "ACTIVE" }))
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByRole("button", { name: "Change where #ugexams appears" }, slow))
    await user.click(await screen.findByRole("menuitem", { name: "Pin…" }))
    const dialog = await screen.findByRole("dialog", {}, slow)
    await user.type(within(dialog).getByLabelText(/^Why/), "One more")
    expect(within(dialog).getByText("This list already has 3 pins for that time.")).toBeInTheDocument()
    expect(within(dialog).getByRole("button", { name: "Add override" })).toBeDisabled()
  })

  it("lets admins without the manage permission look but not change", async () => {
    permissions = ["discover.read"]
    renderPage()
    expect(await screen.findByText("Changing Trending needs discover.trends.manage.", {}, slow)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Add an override" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "End now" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /^Change where/ })).not.toBeInTheDocument()
  })

  it("explains when Trending can't be read", async () => {
    permissions = ["admins.read"]
    renderPage()
    expect(await screen.findByText("You don't have access to Trending", {}, slow)).toBeInTheDocument()
  })
})
