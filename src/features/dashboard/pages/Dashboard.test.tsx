import { beforeEach, describe, expect, it, vi } from "vitest"
import userEvent from "@testing-library/user-event"
import { AxiosError, AxiosHeaders } from "axios"
import { renderWithProviders, screen, waitFor, within } from "@/test/test-utils"
import { superAdminApi } from "@/api/client"
import { profileFixture } from "@/test/rbac-fixtures"
import { DashboardPage } from "./DashboardPage"

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`
const members = (total: number, students: number) => ({ total, STUDENT: students, ALUMNI: total - students, STAFF: 0, NONE: 0, verified: 0, pending: 0 })

const stats = {
  institutionId: null, generatedAt: "2026-11-15T10:00:00.000Z", total: 1234, newLast7Days: 12, newLast30Days: 40,
  status: { active: 1200, suspended: 4, deactivated: 20, pendingDeletion: 6, erased: 4 },
  roles: { GUEST: 0, VIEWER: 1100, CREATOR: 100, PUBLISHER: 34 },
  affiliation: { STUDENT: 600, ALUMNI: 300, STAFF: 34, NONE: 300 },
  verification: { SELF_DECLARED: 500, PENDING: 30, VERIFIED: 400 },
  badges: { campus: 400, company: 12, honour: 3, spotlight: 9 },
  institutions: [
    { id: id(101), name: "University of Ghana", shortName: "UG", slug: "ug", type: "TRADITIONAL_UNIVERSITY", region: "Greater Accra", isActive: true, logoUrl: null, campusCount: 2, members: members(500, 400) },
    { id: id(102), name: "Kwame Nkrumah University of Science and Technology", shortName: "KNUST", slug: "knust", type: "TRADITIONAL_UNIVERSITY", region: "Ashanti", isActive: true, logoUrl: null, campusCount: 1, members: members(300, 250) },
    { id: id(103), name: "Quiet College", shortName: "QC", slug: "qc", type: "PRIVATE_TERTIARY", region: "Volta", isActive: true, logoUrl: null, campusCount: 1, members: members(0, 0) },
  ],
  campuses: null, withoutCampus: null,
}
const trend = (rank: number) => ({ rank, kind: "HASHTAG", id: id(rank), title: `#trend${rank}`, category: null, metrics: { posts: 30 - rank, participants: 40, window: "24h", label: `${30 - rank} posts today` },
  trend: { direction: "UP", changePct: 20 }, featured: false, presentation: null, subject: null })

let permissions: string[] = ["*"]
let counts: Record<string, number> = { adRequests: 2, contentReports: 5, verification: 0 }
let goldFails = false
let signupsMissing = false

/** Two sign-ups a day in the last 30 days, one a day before that. */
function signups(days: number) {
  const today = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate())
  const points = Array.from({ length: days }, (_, index) => {
    const ago = days - 1 - index
    return { date: new Date(today - ago * 86_400_000).toISOString().slice(0, 10), joined: ago < 30 ? 2 : 1 }
  })
  return { days, from: points[0].date, to: points[days - 1].date, timeZone: "Africa/Accra", before: 100, total: points.reduce((sum, point) => sum + point.joined, 0), points }
}
const notFound = () => new AxiosError("missing", "ERR_BAD_REQUEST", undefined, undefined, { status: 404, data: { message: "Cannot GET" }, statusText: "", headers: {}, config: { headers: new AxiosHeaders() } })

const slow = { timeout: 8000 }

describe("Dashboard", { timeout: 20_000 }, () => {
  beforeEach(() => {
    permissions = ["*"]
    counts = { adRequests: 2, contentReports: 5, verification: 0 }
    goldFails = false
    signupsMissing = false
    vi.restoreAllMocks()
    vi.spyOn(superAdminApi, "get").mockImplementation(async (url, config) => {
      if (url === "/auth/me") return { data: { ...profileFixture, permissions } }
      if (url === "/activity/counts") return { data: counts }
      if (url === "/platform-users/stats") return { data: stats }
      if (url === "/platform-users/signups") {
        if (signupsMissing) throw notFound()
        return { data: signups((config?.params as { days: number }).days) }
      }
      if (url === "/user-content/summary") return { data: { videos: 10, images: 6, text: 2, removedPosts: 1, ads: 12, activeAds: 3, surveys: 4, activeSurveys: 2 } }
      if (url === "/user-content/uploaders") {
        return { data: [
          { user: { id: id(201), isActive: true, userProfile: { fullName: "Ama Owusu", username: "ama", email: "ama@example.com", image: null } }, posts: 9, videos: 6, images: 3, text: 0 },
          { user: null, posts: 2, videos: 0, images: 0, text: 2 },
        ] }
      }
      if (url === "/ads") return { data: { items: [], total: 12, page: 1, limit: 1, counts: { PENDING_REVIEW: 2, ACTIVE: 3, PAUSED: 1, COMPLETED: 4, CANCELLED: 1, REJECTED: 1 } } }
      if (url === "/gold-purchases") {
        if (goldFails) throw new AxiosError("failed", "ERR_BAD_RESPONSE", undefined, undefined, { status: 500, data: {}, statusText: "", headers: {}, config: { headers: new AxiosHeaders() } })
        return { data: { items: [], total: 30, page: 1, limit: 1, paid: { count: 27, totalGhs: 2485.77, totalBars: 124_300 }, counts: { PAID: 27, FAILED: 3 } } }
      }
      if (url === "/institutions") return { data: [] }
      throw new Error("Unexpected GET " + url)
    })
    vi.spyOn(superAdminApi, "post").mockImplementation(async (url) => {
      if (url === "/discover-studio/preview") {
        return { data: { discover: {}, applied: {}, trending: {
          scope: { key: "global", level: "GLOBAL", label: "All campuses", showing: null }, items: [1, 2, 3, 4, 5, 6, 7].map(trend),
          source: "snapshot", computedAt: new Date(Date.now() - 180_000).toISOString(), policyVersion: "discover-v1", stale: false,
        } } }
      }
      throw new Error("Unexpected POST " + url)
    })
  })

  it("leads with the live figures, each opening its section", async () => {
    renderWithProviders(<DashboardPage />)
    const figures = screen.getByRole("region", { name: "Headline figures" })
    const people = await within(figures).findByRole("link", { name: /People on AdBox/ }, slow)
    await waitFor(() => expect(people).toHaveTextContent("People on AdBox1,234+12 this week · +40 in 30 days"), slow)
    expect(people).toHaveAttribute("href", "/manage-users")
    await waitFor(() => expect(within(figures).getByRole("link", { name: /Gold sales/ })).toHaveTextContent("GHS 2,485.7727 purchases · 124.3k bars"), slow)
    const ads = within(figures).getByRole("link", { name: /Ads running/ })
    await waitFor(() => expect(ads).toHaveTextContent("Ads running32 in review · 12 ads in all"), slow)
    expect(ads).toHaveAttribute("href", "/ads-management?status=ACTIVE")
    await waitFor(() => expect(within(figures).getByRole("link", { name: /Posts live/ })).toHaveTextContent("Posts live1810 videos · 6 pictures · 2 text"), slow)
  })

  it("lists every queue the admin can open, most waiting first, and says when all is clear", async () => {
    const { unmount } = renderWithProviders(<DashboardPage />)
    const queues = await screen.findByRole("list", { name: "Queues" }, slow)
    expect(within(queues).getAllByRole("link").map((link) => link.getAttribute("aria-label"))).toEqual([
      "User Content reports: 5 waiting", "Ad Requests: 2 waiting", "Verification: clear",
    ])
    expect(screen.getByText("7 items in 2 queues. Each queue opens oldest first.")).toBeInTheDocument()
    unmount()

    counts = { adRequests: 0, verification: 0 }
    renderWithProviders(<DashboardPage />)
    expect(await screen.findByText("All clear: nothing is waiting in the queues you can open.", {}, slow)).toBeInTheDocument()
  })

  it("breaks down who is on AdBox and ranks the institutions, ads and creators", async () => {
    renderWithProviders(<DashboardPage />)
    const affiliation = await screen.findByRole("list", { name: "People by campus affiliation" }, slow)
    expect(within(affiliation).getByRole("link", { name: "Students: 600, 49%" })).toHaveAttribute("href", "/manage-users/people?affiliation=STUDENT")
    expect(within(screen.getByRole("list", { name: "People by account role" })).queryByText("Guests")).not.toBeInTheDocument()

    const institutions = screen.getByRole("list", { name: "Largest institutions" })
    expect(within(institutions).getAllByRole("listitem")).toHaveLength(2)
    expect(within(institutions).getAllByRole("link")[0]).toHaveTextContent("UG")
    expect(within(institutions).getAllByRole("link")[0]).toHaveAttribute("href", `/manage-users/institutions/${id(101)}`)

    const ads = await screen.findByRole("list", { name: "Ads by stage" }, slow)
    expect(within(ads).getByRole("link", { name: "Running: 3, 25%" })).toHaveAttribute("href", "/ads-management?status=ACTIVE")

    const creators = await screen.findByRole("list", { name: "Top creators" }, slow)
    expect(within(creators).getByRole("link", { name: /Ama Owusu/ })).toHaveAttribute("href", `/user-content?userId=${id(201)}`)
    expect(within(creators).getByText("Deleted account")).toBeInTheDocument()
  })

  it("shows what's trending now, with a flame beside each", async () => {
    renderWithProviders(<DashboardPage />)
    const trending = await screen.findByRole("list", { name: "Trending now in the app" }, slow)
    const rows = within(trending).getAllByRole("link")
    expect(rows).toHaveLength(5)
    expect(within(trending).getAllByTestId("trend-flame")).toHaveLength(5)
    expect(rows[0]).toHaveAccessibleName("Number 1, #trend1, 29 posts today")
    expect(rows[0]).toHaveAttribute("href", `/algorithms/top-trends?trend=${encodeURIComponent(`HASHTAG:${id(1)}`)}`)
  })

  it("charts sign-ups and compares them with the span before", async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardPage />)
    const figures = await screen.findByRole("list", { name: "Sign-up figures" }, slow)
    expect(figures).toHaveTextContent("60in the last 30 days")
    expect(figures).toHaveTextContent("+100%on the 30 days before (30)")
    expect(figures).toHaveTextContent("190accounts in all")
    // Every day ties, so no day is named the busiest.
    expect(figures).not.toHaveTextContent("busiest")
    expect(screen.getByRole("group", { name: "Sign-ups per day, the last 30 days: 60 in all" })).toBeInTheDocument()
    expect(superAdminApi.get).toHaveBeenCalledWith("/platform-users/signups", expect.objectContaining({ params: { days: 60 } }))

    await user.click(screen.getByRole("radio", { name: "12 weeks" }))
    expect(await screen.findByRole("group", { name: /^Sign-ups per week, the last 12 weeks: / }, slow)).toBeInTheDocument()
    expect(superAdminApi.get).toHaveBeenCalledWith("/platform-users/signups", expect.objectContaining({ params: { days: 168 } }))
    await user.click(screen.getByText("Show the numbers"))
    const table = screen.getByRole("table", { name: "Sign-ups per week, the last 12 weeks" })
    expect(within(table).getAllByRole("row")).toHaveLength(13)
    const weeks = within(table).getAllByRole("rowheader")
    expect(weeks[weeks.length - 1]).toHaveTextContent("(so far)")
  })

  it("says when the server is older than the sign-ups chart", async () => {
    signupsMissing = true
    renderWithProviders(<DashboardPage />)
    expect(await screen.findByText(/This chart needs the newer admin server/, {}, slow)).toBeInTheDocument()
  })

  it("leaves out what the admin can't read", async () => {
    permissions = ["ads.read"]
    renderWithProviders(<DashboardPage />)
    const figures = screen.getByRole("region", { name: "Headline figures" })
    expect(await within(figures).findByRole("article", { name: "People on AdBox: needs platform.users.read" }, slow)).toBeInTheDocument()
    expect(await screen.findByRole("list", { name: "Ads by stage" }, slow)).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Who's on AdBox" })).not.toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Trending now" })).not.toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Top creators" })).not.toBeInTheDocument()
    expect(superAdminApi.get).not.toHaveBeenCalledWith("/platform-users/stats", expect.anything())
    expect(superAdminApi.get).not.toHaveBeenCalledWith("/platform-users/signups", expect.anything())
    expect(superAdminApi.post).not.toHaveBeenCalled()
  })

  it("lets a figure that failed be read again", async () => {
    goldFails = true
    const user = userEvent.setup()
    renderWithProviders(<DashboardPage />)
    const failed = await screen.findByRole("alert", { name: "Gold sales: couldn't load" }, slow)
    goldFails = false
    await user.click(within(failed).getByRole("button", { name: "Retry" }))
    const figures = screen.getByRole("region", { name: "Headline figures" })
    await waitFor(() => expect(within(figures).getByRole("link", { name: /Gold sales/ })).toHaveTextContent("GHS 2,485.77"), slow)
  })
})
