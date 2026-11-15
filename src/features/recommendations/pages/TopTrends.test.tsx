import { beforeEach, describe, expect, it, vi } from "vitest"
import { Route, Routes } from "react-router-dom"
import userEvent from "@testing-library/user-event"
import { AxiosError, AxiosHeaders } from "axios"
import { renderWithProviders, screen, waitFor, within } from "@/test/test-utils"
import { superAdminApi } from "@/api/client"
import { profileFixture } from "@/test/rbac-fixtures"
import { DEFAULT_DISCOVER_POLICY, DEFAULT_RANKING_CONFIG, DISCOVER_POLICY_BOUNDS, RANKING_CONFIG_BOUNDS } from "../data/backend-defaults"
import { RecommendationsLayout } from "./RecommendationsLayout"
import { TopTrendsPage } from "./TopTrendsPage"

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`
const UG = id(101)
const earlier = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString()
const later = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString()

const directory = [{ id: UG, name: "University of Ghana", shortName: "UG", region: "Greater Accra", isActive: true, campuses: [] }]
const metrics = (posts: number, participants: number) => ({ posts, participants, window: "24h", label: `${posts} posts today` })
const appItem = (rank: number, kind: string, n: number, title: string, extra: Record<string, unknown> = {}) => ({
  rank, kind, id: id(n), title, category: null, metrics: metrics(20 - rank, 50 - rank), trend: { direction: "UP", changePct: 30 }, featured: false,
  presentation: { kicker: "TRENDING", headline: title, support: null, sticker: [], tone: null, imageUrl: null, description: null }, subject: null, ...extra,
})
const parts = (participants: number) => ({ recent: 60, baseline: 12, momentum: 72 / 22, breadth: Math.log1p(participants), quality: 1, kindMultiplier: 1 })
const scored = (rank: number, kind: string, n: number, participants: number) => {
  const p = parts(participants)
  return { rank, kind, id: id(n), name: null, score: Math.pow(p.momentum, 0.7) * p.breadth, metrics: { posts: 10, participants, follows: 0 }, trend: { direction: "UP", changePct: 30 },
    parts: p, categoryId: null, parentId: null, topPostId: n === 2 ? id(900) : null }
}

const items = [
  appItem(1, "HASHTAG", 1, "#freshersweek", { featured: true }),
  appItem(2, "EVENT", 2, "Campus food fair", { subject: { kind: "EVENT", id: id(2), title: "Campus food fair", startsAt: later(1), endsAt: later(1.2), location: "The Great Hall", coverUrl: null,
    timing: "UPCOMING", going: 120, institution: { id: UG, shortName: "UG" }, campus: null, hall: null } }),
  appItem(3, "PERSON", 3, "Ama Owusu", { subject: { kind: "PERSON", id: id(3), username: "ama", fullName: "Ama Owusu", image: null, verificationTier: "VERIFIED", creatorRole: null, institution: { id: UG, shortName: "UG" } } }),
  ...Array.from({ length: 9 }, (_, index) => appItem(index + 4, "HASHTAG", index + 4, `#tag${index + 4}`)),
]
const pin = { id: id(201), scopeKey: "global", kind: "HASHTAG", subjectId: id(1), action: "PIN", rank: 1, multiplier: null, reason: "Freshers week launch", startsAt: earlier(60), endsAt: later(5), endedAt: null, name: "#freshersweek" }

let permissions: string[] = ["*"]
let source = "snapshot"
let preview: (body: Record<string, unknown>) => Promise<unknown>

const slow = { timeout: 8000 }

function renderPage(path = "/algorithms/top-trends") {
  return renderWithProviders(<Routes>
    <Route path="/algorithms" element={<RecommendationsLayout />}>
      <Route path="top-trends" element={<TopTrendsPage />} />
    </Route>
  </Routes>, { initialEntries: [path] })
}

describe("Top trends", { timeout: 20_000 }, () => {
  beforeEach(() => {
    permissions = ["*"]
    source = "snapshot"
    preview = async () => ({ data: {
      discover: { sections: [] },
      trending: { scope: { key: "global", level: "GLOBAL", label: "All campuses", showing: null }, items, source, computedAt: earlier(3), policyVersion: "discover-v1", stale: false },
      applied: { policyVersion: "discover-v1", policySource: "default", rescored: false, unsavedLayout: false, unsavedOverrides: 0, asUserId: null },
    } })
    vi.restoreAllMocks()
    vi.spyOn(superAdminApi, "get").mockImplementation(async (url) => {
      if (url === "/auth/me") return { data: { ...profileFixture, permissions } }
      if (url === "/feed-ranking") return { data: { active: null, defaults: DEFAULT_RANKING_CONFIG, bounds: RANKING_CONFIG_BOUNDS } }
      if (url === "/discover-studio/policy") return { data: { active: null, defaults: DEFAULT_DISCOVER_POLICY, bounds: DISCOVER_POLICY_BOUNDS } }
      if (url === "/gold-settings") return { data: { values: { adFrequencyCapPerDay: 3, adCpmBars: 1250, adMinAudience: 100, adDailyBudgetMinBars: 500, adDailyBudgetMaxBars: 12500 }, updatedAt: null } }
      if (url === "/discover-studio/trends/status") return { data: { lastSuccessAt: earlier(3), stale: false, intervalMinutes: 5, scopes: ["global", `inst:${UG}`] } }
      if (url === "/discover-studio/trends") {
        return { data: { scopeKey: "global", overrides: [pin], snapshot: source === "fallback" ? null : {
          computedAt: earlier(3), policyVersion: "discover-v1",
          items: [scored(1, "EVENT", 2, 49), scored(2, "PERSON", 3, 8), scored(3, "HASHTAG", 1, 51), ...Array.from({ length: 9 }, (_, index) => scored(index + 4, "HASHTAG", index + 4, 46 - index))],
          diagnostics: { candidates: 80, relaxed: 0, missed: [] },
        } } }
      }
      if (url === "/institutions") return { data: directory }
      throw new Error("Unexpected GET " + url)
    })
    vi.spyOn(superAdminApi, "post").mockImplementation(async (url, body) => {
      if (url === "/discover-studio/preview") return preview(body as Record<string, unknown>)
      throw new Error("Unexpected POST " + url)
    })
  })

  it("shows the app's top 10 in its order and words, with a flame beside each", async () => {
    renderPage()
    const list = await screen.findByRole("list", { name: "Top trends in the app" }, slow)
    const rows = within(list).getAllByRole("button")
    expect(rows).toHaveLength(10)
    expect(within(list).getAllByTestId("trend-flame")).toHaveLength(10)
    expect(rows[0]).toHaveAccessibleName("Number 1, #freshersweek, Trending · Featured, 19 posts today")
    expect(rows[0]).toHaveTextContent("01")
    expect(rows[9]).toHaveTextContent("10")
    expect(screen.getByText("8 hashtags, 1 event and 1 person; 1 featured by admins.")).toBeInTheDocument()
    // Asked for once, read-only: nothing unsaved goes with it.
    expect(superAdminApi.post).toHaveBeenCalledWith("/discover-studio/preview", {}, expect.anything())
  })

  it("tells everything about the first trend, and about another when chosen", async () => {
    const user = userEvent.setup()
    renderPage()
    const details = await screen.findByTestId("trend-details", {}, slow)
    expect(within(details).getByRole("heading", { level: 3, name: "#freshersweek" })).toBeInTheDocument()
    await waitFor(() => expect(within(details).getByTestId("trend-placement")).toHaveTextContent("Pinned at 1st by an admin; it was computed 3rd."), slow)
    expect(within(details).getByText("“Freshers week launch”")).toBeInTheDocument()
    expect(within(details).getByText("In the top 3, so the app burns a flame beside it.", { exact: false })).toBeInTheDocument()

    const list = screen.getByRole("list", { name: "Top trends in the app" })
    await user.click(within(list).getByRole("button", { name: /^Number 3, Ama Owusu/ }))
    const person = screen.getByTestId("trend-details")
    expect(within(person).getByRole("heading", { level: 3, name: "Ama Owusu" })).toBeInTheDocument()
    expect(within(person).getByText("@ama")).toBeInTheDocument()
    expect(within(person).getByText("Verified")).toBeInTheDocument()
    expect(within(person).getByTestId("trend-placement")).toHaveTextContent("It was computed 2nd, and is down 1 place")
    // The rules, against the settings in force: a person needs 15 people in a nationwide list.
    expect(within(person).getByText(/^People taking part:/).closest("li")).toHaveTextContent("People taking part: 8; needs at least 15 in a nationwide list. Doesn't pass now.")
    expect(within(person).getByRole("link", { name: "Open their profile" })).toHaveAttribute("href", `/manage-users/people/${id(3)}`)

    await user.click(within(list).getByRole("button", { name: /^Number 2, Campus food fair/ }))
    const event = screen.getByTestId("trend-details")
    expect(within(event).getByText("The Great Hall")).toBeInTheDocument()
    expect(within(event).getByRole("link", { name: "Open its top post" })).toHaveAttribute("href", `/user-content/posts/${id(900)}`)
    expect(within(event).getByText(/^Momentum \d/)).toBeInTheDocument()
  })

  it("compares all ten side by side, and chooses from there too", async () => {
    const user = userEvent.setup()
    renderPage()
    const table = await screen.findByRole("table", { name: "The top trends side by side" }, slow)
    expect(within(table).getAllByRole("row")).toHaveLength(11)
    expect(within(table).getByRole("row", { name: /#freshersweek/ })).toHaveTextContent("Pinned at 1st")
    await user.click(within(table).getByRole("button", { name: "Show everything about #tag7" }))
    expect(within(screen.getByTestId("trend-details")).getByRole("heading", { level: 3, name: "#tag7" })).toBeInTheDocument()
  })

  it("reads an institution's list as the app does, by its id", async () => {
    renderPage(`/algorithms/top-trends?list=inst:${UG}`)
    await screen.findByRole("list", { name: "Top trends in the app" }, slow)
    expect(superAdminApi.post).toHaveBeenCalledWith("/discover-studio/preview", { institutionId: UG }, expect.anything())
    expect(superAdminApi.get).toHaveBeenCalledWith("/discover-studio/trends", expect.objectContaining({ params: { scopeKey: `inst:${UG}` } }))
  })

  it("explains a list that hasn't been computed yet", async () => {
    source = "fallback"
    renderPage()
    expect(await screen.findByText(/^No list computed here yet/, {}, slow)).toBeInTheDocument()
    const details = await screen.findByTestId("trend-details", {}, slow)
    await waitFor(() => expect(within(details).getByText("An admin placed it, so it didn't have to qualify and has no computed score.")).toBeInTheDocument(), slow)
  })

  it("says why Trending couldn't be read", async () => {
    preview = async () => { throw new AxiosError("failed", "ERR_BAD_RESPONSE", undefined, undefined, { status: 500, data: { message: "Snapshot read failed" }, statusText: "", headers: {}, config: { headers: new AxiosHeaders() } }) }
    renderPage()
    expect(await screen.findByText("Couldn't load Trending.", {}, slow)).toBeInTheDocument()
    expect(await screen.findByTestId("load-error-detail", {}, slow)).toHaveTextContent("The server answered 500: Snapshot read failed.")
  })

  it("explains when Trending can't be read", async () => {
    permissions = ["admins.read"]
    renderPage()
    expect(await screen.findByText("You don't have access to Trending", {}, slow)).toBeInTheDocument()
    expect(superAdminApi.post).not.toHaveBeenCalled()
  })
})
