import { beforeEach, describe, expect, it, vi } from "vitest"
import { Route, Routes } from "react-router-dom"
import { fireEvent, renderWithProviders, screen, waitFor, within } from "@/test/test-utils"
import { superAdminApi } from "@/api/client"
import { profileFixture } from "@/test/rbac-fixtures"
import { DEFAULT_DISCOVER_POLICY, DEFAULT_RANKING_CONFIG, DISCOVER_POLICY_BOUNDS, RANKING_CONFIG_BOUNDS } from "../data/backend-defaults"
import { PARAMETERS } from "../data/catalog"
import { RecommendationsLayout } from "./RecommendationsLayout"
import { OverviewPage } from "./OverviewPage"
import { HomeFeedPage } from "./HomeFeedPage"
import { SponsoredPage } from "./SponsoredPage"
import { DiscoverPage } from "./DiscoverPage"
import { RankedFeedPage } from "./RankedFeedPage"
import { ParametersPage } from "./ParametersPage"

const v4 = { ...structuredClone(DEFAULT_RANKING_CONFIG), version: "policy-v4" }
v4.quality.weights.share = 8
v4.rerank.exploreEvery = 8
const v3 = { ...structuredClone(DEFAULT_RANKING_CONFIG), version: "policy-v3" }
v3.quality.weights.share = 8

const policy = (version: number, config: unknown, extra: Record<string, unknown> = {}) => ({
  id: `00000000-0000-4000-8000-00000000000${version}`, version, isActive: false, rankedPercent: 100, config, note: null,
  createdByAdminId: "a", createdAt: "2026-11-01T10:00:00.000Z", activatedByAdminId: null, activatedAt: null, ...extra,
})
const history = [
  policy(4, v4, { isActive: true, activatedAt: "2026-11-10T10:00:00.000Z", note: "Explore slot every 8" }),
  policy(3, v3, { rankedPercent: 50 }),
]
const gold = {
  values: { barsPerCedi: 50, dailyRewardBars: 50, adDailyBudgetMinBars: 500, adDailyBudgetMaxBars: 12_500, adDurationsDays: [3, 7, 14, 30], adCpmBars: 1250, adMinAudience: 100, adFrequencyCapPerDay: 4,
    surveyRewardMinPerResponse: 2, surveyRewardMaxPerResponse: 5, surveyRewardMinBudget: 100, surveyRewardMaxBudget: 1_000_000, surveyThreeFormatsFrom: 550, surveyAnyFormatsFrom: 3000 },
  updatedAt: "2026-11-04T10:00:00.000Z",
}

let permissions: string[] = ["*"]
let feedOverview: unknown
let requested: string[] = []

function renderSection(path: string) {
  return renderWithProviders(<Routes>
    <Route path="/recommendations" element={<RecommendationsLayout />}>
      <Route index element={<OverviewPage />} />
      <Route path="home-feed" element={<HomeFeedPage />} />
      <Route path="sponsored" element={<SponsoredPage />} />
      <Route path="discover" element={<DiscoverPage />} />
      <Route path="ranked-feed" element={<RankedFeedPage />} />
      <Route path="parameters" element={<ParametersPage />} />
    </Route>
  </Routes>, { initialEntries: [path] })
}

// These pages are large; under the full suite's parallel load they take seconds to render in jsdom.
const slow = { timeout: 8000 }

describe("Recommendations", { timeout: 20_000 }, () => {
  beforeEach(() => {
    permissions = ["*"]
    requested = []
    feedOverview = { active: history[0], defaults: DEFAULT_RANKING_CONFIG, bounds: RANKING_CONFIG_BOUNDS }
    vi.restoreAllMocks()
    vi.spyOn(superAdminApi, "get").mockImplementation(async (url) => {
      requested.push(url)
      if (url === "/auth/me") return { data: { ...profileFixture, permissions } }
      if (url === "/feed-ranking") return { data: feedOverview }
      if (url === "/feed-ranking/policies") return { data: { items: history } }
      if (url === "/discover-studio/policy") {
        return { data: { active: { id: "d2", version: 2, isActive: true, config: { version: "discover-v2", score: { momentumExponent: 0.8 } }, note: null, createdAt: "2026-11-01T10:00:00.000Z", activatedAt: "2026-11-02T10:00:00.000Z" }, defaults: DEFAULT_DISCOVER_POLICY, bounds: DISCOVER_POLICY_BOUNDS } }
      }
      if (url === "/gold-settings") return { data: gold }
      throw new Error("Unexpected GET " + url)
    })
  })

  it("shows the live versions of all three settings and every list the app shows", async () => {
    renderSection("/recommendations")
    await waitFor(() => expect(screen.getByTestId("feed-version")).toHaveTextContent("policy-v4"), slow)
    await waitFor(() => expect(screen.getByTestId("discover-version")).toHaveTextContent("discover-v2"), slow)
    expect(await screen.findByText("4 views a day", {}, slow)).toBeInTheDocument()
    expect(screen.getByText(`${PARAMETERS.length} numbers`)).toBeInTheDocument()
    for (const list of ["Home feed", "Shorts", "Sponsored posts", "Glances", "Trending", "Explore", "Ranked home feed"]) {
      expect(screen.getByRole("link", { name: list })).toBeInTheDocument()
    }
    // A changed value is marked on its chip.
    expect(screen.getAllByRole("link", { name: /Share weight: 8/ }).length).toBeGreaterThan(0)
  })

  it("shows the built-in defaults, and asks for nothing, without read permissions", async () => {
    permissions = ["admins.read"]
    renderSection("/recommendations")
    expect(await screen.findAllByText("Live values need", { exact: false }, slow)).toHaveLength(3)
    expect(screen.getByTestId("feed-version")).toHaveTextContent("heuristic-v1")
    expect(screen.getAllByText("Defaults shown")).toHaveLength(3)
    expect(requested).toEqual(["/auth/me"])
  })

  it("explains a live version the gateway ignores", async () => {
    feedOverview = { active: policy(5, { ...v4, sessionSize: 5 }, { isActive: true }), defaults: DEFAULT_RANKING_CONFIG, bounds: RANKING_CONFIG_BOUNDS }
    renderSection("/recommendations")
    expect(await screen.findByText(/fails validation, so the gateway uses the defaults: sessionSize must be between 20 and 500/, {}, slow)).toBeInTheDocument()
    expect(screen.getByTestId("feed-version")).toHaveTextContent("heuristic-v1")
  })

  it("opens any parameter's details from its chip", async () => {
    renderSection("/recommendations/home-feed")
    fireEvent.click((await screen.findAllByRole("link", { name: /Draw half-life: 24 h/ }, slow))[0])
    const details = await screen.findByRole("dialog", {}, slow)
    expect(within(details).getByText("SHUFFLE_HALF_LIFE_HOURS")).toBeInTheDocument()
    expect(within(details).getByTestId("parameter-value")).toHaveTextContent("24 h")
    expect(within(details).getByText(/Needs a backend release/)).toBeInTheDocument()
  })

  it("filters every parameter by area, control and words, from the URL", async () => {
    renderSection("/recommendations/parameters?control=gold")
    expect(await screen.findByTestId("parameter-count", {}, slow)).toHaveTextContent(`5 of ${PARAMETERS.length} parameters`)
    expect(screen.getByRole("link", { name: "Views per person per ad, a day" })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText("Search parameters"), { target: { value: "half-life" } })
    expect(await screen.findByText("No parameter matches", {}, slow)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }))
    expect(screen.getByTestId("parameter-count")).toHaveTextContent(`${PARAMETERS.length} parameters`)

    fireEvent.change(screen.getByLabelText("Search parameters"), { target: { value: "half-life" } })
    await waitFor(() => expect(screen.getByRole("link", { name: "Draw half-life" })).toBeInTheDocument(), slow)
    expect(screen.getByRole("link", { name: "Video half-life" })).toBeInTheDocument()
  })

  it("re-ranks the sample posts as a setting moves, without saving anything", async () => {
    const post = vi.spyOn(superAdminApi, "post")
    renderSection("/recommendations/ranked-feed")
    expect(await screen.findByText("The order the settings in force give", {}, slow)).toBeInTheDocument()
    const posts = () => within(screen.getAllByRole("list").find((list) => list.getAttribute("aria-describedby"))!).getAllByRole("listitem").map((item) => item.textContent ?? "")
    const before = posts()

    fireEvent.change(screen.getByLabelText("Hide penalty"), { target: { value: "0" } })
    expect(screen.getByText(/1 setting changed/)).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText(/With your changes, \d+ of 12 posts move/)).toBeInTheDocument(), slow)
    expect(posts()).not.toEqual(before)

    fireEvent.click(screen.getByRole("button", { name: "Back to live" }))
    expect(screen.getByText("The order the settings in force give")).toBeInTheDocument()
    expect(post).not.toHaveBeenCalled()
  })

  it("lists the feed's versions with what each changed", async () => {
    renderSection("/recommendations/ranked-feed")
    expect(await screen.findByText("Version 4", {}, slow)).toBeInTheDocument()
    expect(screen.getByText("“Explore slot every 8”")).toBeInTheDocument()
    expect(screen.getByText(/Ranked share: 50% →/)).toBeInTheDocument()
  })

  it("works out a trend score with the live Discover policy", async () => {
    renderSection("/recommendations/discover")
    const score = await screen.findByTestId("trend-score", {}, slow)
    const first = score.textContent
    fireEvent.change(screen.getByLabelText("People taking part"), { target: { value: "1" } })
    expect(screen.getByText(/Needs 3 people taking part/)).toBeInTheDocument()
    expect(score.textContent).not.toBe(first)
  })

  it("shows where Home puts sponsored posts and how fast they are paced", async () => {
    renderSection("/recommendations/sponsored")
    expect(await screen.findByText("Places 4, 13, 22", {}, slow)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("radio", { name: "5,000 bars a day" }))
    expect(screen.getByRole("radio", { name: "5,000 bars a day" })).toHaveAttribute("aria-checked", "true")
    // 5,000 bars at 1,250 per 1,000 views.
    expect(screen.getAllByText("4,000").length).toBeGreaterThan(0)
  })
})
