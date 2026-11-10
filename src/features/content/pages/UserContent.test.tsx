import { beforeEach, describe, expect, it, vi } from "vitest"
import { Route, Routes, useLocation } from "react-router-dom"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test/test-utils"
import { superAdminApi } from "@/api/client"
import { profileFixture } from "@/test/rbac-fixtures"
import {
  adFixtures, chatReportDetailFixture, chatReportFixtures, contentPage, contentReportDetailFixture, contentReportFixtures,
  postFixtures, summaryFixture, surveyFixtures, uploaderFixture, uploadersFixture,
} from "@/test/content-fixtures"
import { UserContentLayout } from "./UserContentLayout"
import { ContentOverviewPage } from "./ContentOverviewPage"
import { PostsPage } from "./PostsPage"
import { PostDetailPage } from "./PostDetailPage"
import { AdsPage } from "./AdsPage"
import { SurveysPage } from "./SurveysPage"
import { ReportsPage } from "./ReportsPage"
import { ContentReportDetailPage } from "./ContentReportDetailPage"
import { ChatReportDetailPage } from "./ChatReportDetailPage"

let permissions = ["*"]

function Location() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname + location.search}</output>
}

function renderAt(path: string) {
  return renderWithProviders(<>
    <Routes>
      <Route path="/user-content" element={<UserContentLayout />}>
        <Route index element={<ContentOverviewPage />} />
        <Route path="posts" element={<PostsPage />} />
        <Route path="posts/:postId" element={<PostDetailPage />} />
        <Route path="ads" element={<AdsPage />} />
        <Route path="surveys" element={<SurveysPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="reports/:reportId" element={<ContentReportDetailPage />} />
        <Route path="reports/messages/:reportId" element={<ChatReportDetailPage />} />
      </Route>
      <Route path="*" element={null} />
    </Routes>
    <Location />
  </>, { initialEntries: [path] })
}

const location = () => screen.getByTestId("location").textContent

describe("User Content", () => {
  beforeEach(() => {
    permissions = ["*"]
    vi.spyOn(superAdminApi, "get").mockImplementation(async (url, config) => {
      const params = (config?.params ?? {}) as Record<string, unknown>
      if (url === "/auth/me") return { data: { ...profileFixture, permissions } }
      if (url === "/user-content/summary") return { data: summaryFixture }
      if (url === "/user-content/uploaders") return { data: uploadersFixture }
      if (url === "/user-content/posts") return { data: contentPage(postFixtures.filter((post) => !params.mediaType || post.mediaType === params.mediaType)) }
      if (url.startsWith("/user-content/posts/")) return { data: postFixtures.find((post) => url.endsWith(post.id)) }
      if (url === "/user-content/ads") return { data: contentPage(adFixtures) }
      if (url === "/user-content/surveys") return { data: contentPage(surveyFixtures) }
      if (url === "/user-content/reports") return { data: contentPage(contentReportFixtures, params.limit === 1 ? 3 : 1) }
      if (url.startsWith("/user-content/reports/")) return { data: contentReportDetailFixture }
      if (url === "/user-content/chat-reports") return { data: contentPage(chatReportFixtures, params.limit === 1 ? 2 : 1) }
      if (url.startsWith("/user-content/chat-reports/")) return { data: chatReportDetailFixture }
      if (url.startsWith("/platform-users/")) return { data: uploaderFixture }
      throw new Error("Unexpected GET " + url)
    })
  })

  it("opens on an overview of figures, the report queue and top creators", async () => {
    renderAt("/user-content")
    const overview = await screen.findByRole("region", { name: "Content overview" })
    await waitFor(() => expect(within(overview).getByRole("link", { name: /Removed posts/ })).toHaveTextContent("2"))
    expect(within(overview).getByRole("link", { name: /Live posts/ })).toHaveAttribute("href", "/user-content/posts")
    // Everyone's ads are in Ads Management.
    expect(within(overview).getByRole("link", { name: /Ads running now/ })).toHaveAttribute("href", "/ads-management")
    const attention = screen.getByRole("region", { name: "Needs attention" })
    expect(await within(attention).findByText("5")).toBeInTheDocument()
    expect(await screen.findByRole("link", { name: /Ama Mensah, 2 posts/ })).toHaveAttribute("href", `/user-content?userId=${uploaderFixture.id}`)
    expect(await screen.findByRole("link", { name: "Open Campus tour" })).toBeInTheDocument()
  })

  it("narrows every section to one uploader and keeps that across sections", async () => {
    const user = userEvent.setup()
    const get = vi.mocked(superAdminApi.get)
    renderAt(`/user-content?userId=${uploaderFixture.id}`)
    const banner = await screen.findByRole("region", { name: "Selected uploader" })
    expect(await within(banner).findByText("Ama Mensah")).toBeInTheDocument()
    expect(get).toHaveBeenCalledWith("/user-content/summary", expect.objectContaining({ params: { userId: uploaderFixture.id } }))
    expect(screen.queryByRole("region", { name: "Needs attention" })).not.toBeInTheDocument()
    // One uploader's ads are listed with their content.
    expect(await screen.findByRole("link", { name: /Ads running now/ })).toHaveAttribute("href", `/user-content/ads?status=ACTIVE&userId=${uploaderFixture.id}`)
    const sections = within(banner).getByRole("navigation", { name: "Content by Ama Mensah" })
    expect(within(sections).getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page")
    await user.click(within(sections).getByRole("link", { name: "Ads" }))
    expect(location()).toBe(`/user-content/ads?userId=${uploaderFixture.id}`)
    await waitFor(() => expect(get).toHaveBeenCalledWith("/user-content/ads", expect.objectContaining({ params: expect.objectContaining({ userId: uploaderFixture.id }) })))
    await user.click(within(sections).getByRole("link", { name: "Posts" }))
    expect(location()).toBe(`/user-content/posts?userId=${uploaderFixture.id}`)
    await user.click(within(banner).getByRole("link", { name: "Show everyone" }))
    expect(location()).toBe("/user-content/posts")
  })

  it("lists ads only for one uploader, and sends everyone's to Ads Management", async () => {
    renderAt("/user-content/ads?status=ACTIVE")
    await waitFor(() => expect(location()).toBe("/ads-management"))
    expect(vi.mocked(superAdminApi.get)).not.toHaveBeenCalledWith("/user-content/ads", expect.anything())
  })

  it("redirects old ?tab= links to the matching section", async () => {
    renderAt(`/user-content?tab=pictures&userId=${uploaderFixture.id}`)
    await waitFor(() => expect(location()).toBe(`/user-content/posts?type=IMAGE&userId=${uploaderFixture.id}`))
  })

  it("browses every post format with filters kept in the URL", async () => {
    const user = userEvent.setup()
    const get = vi.mocked(superAdminApi.get)
    renderAt("/user-content/posts")
    expect(await screen.findByRole("link", { name: "Open Campus tour" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Open Graduation day" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /All posts/ })).toHaveTextContent("2")

    await user.click(screen.getByRole("button", { name: /^Videos/ }))
    expect(location()).toBe("/user-content/posts?type=VIDEO")
    await waitFor(() => expect(screen.queryByRole("link", { name: "Open Graduation day" })).not.toBeInTheDocument())
    expect(get).toHaveBeenLastCalledWith("/user-content/posts", expect.objectContaining({ params: expect.objectContaining({ mediaType: "VIDEO", state: "live" }) }))

    await user.click(screen.getByRole("radio", { name: "List" }))
    expect(location()).toBe("/user-content/posts?type=VIDEO&view=list")
    await user.type(screen.getByRole("searchbox"), "tour")
    await waitFor(() => expect(location()).toBe("/user-content/posts?type=VIDEO&view=list&q=tour"))
    await waitFor(() => expect(get).toHaveBeenLastCalledWith("/user-content/posts", expect.objectContaining({ params: expect.objectContaining({ search: "tour" }) })))
  })

  it("opens a post on its own page, plays it and removes it with a reason", async () => {
    const user = userEvent.setup()
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: { ...postFixtures[0], deleteStatus: "DELETED" } })
    renderAt("/user-content/posts?type=VIDEO")
    await user.click(await screen.findByRole("link", { name: "Open Campus tour" }))
    expect(location()).toBe(`/user-content/posts/${postFixtures[0].id}`)
    expect(await screen.findByRole("heading", { name: "Campus tour" })).toBeInTheDocument()
    expect(screen.getByLabelText("Campus tour")).toHaveAttribute("src", "https://cdn.example.com/v/1.mp4")
    expect(screen.getByRole("link", { name: /Open stream link/ })).toHaveAttribute("href", "https://cdn.example.com/hls/1/master.m3u8")

    await user.click(screen.getByRole("button", { name: "Remove post" }))
    const confirm = await screen.findByRole("dialog", { name: "Remove this post?" })
    await user.type(within(confirm).getByLabelText(/Reason/), "Spam")
    await user.click(within(confirm).getByRole("button", { name: "Remove post" }))
    await waitFor(() => expect(post).toHaveBeenCalledWith(`/user-content/posts/${postFixtures[0].id}/remove`, { reason: "Spam" }))

    await user.click(screen.getByRole("link", { name: "Back" }))
    expect(location()).toBe("/user-content/posts?type=VIDEO")
  })

  it("hides moderation without the moderate permission", async () => {
    permissions = ["user.content.read"]
    renderAt(`/user-content/posts/${postFixtures[0].id}`)
    expect(await screen.findByRole("heading", { name: "Campus tour" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Remove post" })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Profile" })).not.toBeInTheDocument()
  })

  it("shows ad details in a side panel, read-only", async () => {
    const user = userEvent.setup()
    renderAt(`/user-content/ads?userId=${uploaderFixture.id}`)
    expect(await screen.findByRole("progressbar", { name: "Campaign progress" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Freshers' night" }))
    const sheet = await screen.findByRole("dialog", { name: "Freshers' night" })
    expect(within(sheet).getByText("Great Hall")).toBeInTheDocument()
    expect(within(sheet).getByText(/view-only/)).toBeInTheDocument()
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    await user.click(screen.getByRole("button", { name: /Pending review/ }))
    expect(location()).toBe(`/user-content/ads?userId=${uploaderFixture.id}&status=PENDING_REVIEW`)
  })

  it("lets moderators deactivate a survey", async () => {
    const user = userEvent.setup()
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: { ...surveyFixtures[0], isActive: false } })
    renderAt("/user-content/surveys")
    expect(await screen.findByText("41")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /On “Campus tour”/ })).toHaveAttribute("href", `/user-content/posts/${postFixtures[0].id}`)
    await user.click(screen.getByRole("button", { name: "Deactivate" }))
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Deactivate survey" }))
    await waitFor(() => expect(post).toHaveBeenCalledWith(`/user-content/surveys/${surveyFixtures[0].id}/deactivate`, {}))
  })

  it("works through the report queue and removes the reported post", async () => {
    const user = userEvent.setup()
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: { ...contentReportDetailFixture, status: "ACTION_TAKEN" } })
    renderAt("/user-content/reports")
    const queue = await screen.findByRole("list", { name: "Reported posts and comments" })
    expect(within(queue).getByText("2 reports on this")).toBeInTheDocument()
    await user.click(within(queue).getByRole("link", { name: "Post reported by Kofi Boateng" }))
    expect(location()).toBe(`/user-content/reports/${contentReportFixtures[0].id}`)
    expect(await screen.findByText("“Targets a classmate”")).toBeInTheDocument()
    expect(screen.getByText(/1 other open report/)).toBeInTheDocument()

    expect(screen.getByRole("checkbox", { name: /Also remove the post/ })).toBeChecked()
    await user.type(screen.getByLabelText(/Note/), "Clear harassment")
    await user.click(screen.getByRole("button", { name: "Remove post and resolve" }))
    await waitFor(() => expect(post).toHaveBeenCalledWith(`/user-content/reports/${contentReportFixtures[0].id}/resolve`, { outcome: "ACTION_TAKEN", removeContent: true, note: "Clear harassment" }))

    await user.click(screen.getByRole("link", { name: "Report queue" }))
    expect(location()).toBe("/user-content/reports")
  })

  it("dismisses a report without removing anything", async () => {
    const user = userEvent.setup()
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: { ...contentReportDetailFixture, status: "DISMISSED" } })
    renderAt(`/user-content/reports/${contentReportFixtures[0].id}`)
    await user.click(await screen.findByRole("radio", { name: /Dismiss/ }))
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Dismiss report" }))
    await waitFor(() => expect(post).toHaveBeenCalledWith(`/user-content/reports/${contentReportFixtures[0].id}/resolve`, { outcome: "DISMISSED" }))
  })

  it("shows a reported message in its conversation", async () => {
    const user = userEvent.setup()
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: { ...chatReportDetailFixture, status: "ACTION_TAKEN" } })
    renderAt("/user-content/reports?queue=messages")
    await user.click(await screen.findByRole("link", { name: /Message from Ama Mensah/ }))
    const transcript = await screen.findByRole("list", { name: "Messages" })
    expect(within(transcript).getByText("Send your PIN to claim the prize")).toBeInTheDocument()
    expect(within(transcript).getByText(/Reported message/)).toBeInTheDocument()
    expect(within(transcript).getByText("1 attachment")).toBeInTheDocument()
    expect(screen.getByText("3 open message reports against this person")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Resolve with action taken" }))
    await waitFor(() => expect(post).toHaveBeenCalledWith(`/user-content/chat-reports/${chatReportFixtures[0].id}/resolve`, { outcome: "ACTION_TAKEN" }))
  })

  it("shows reports read-only without the moderate permission", async () => {
    permissions = ["user.content.read"]
    renderAt(`/user-content/reports/${contentReportFixtures[0].id}`)
    expect(await screen.findByText(/Resolving reports needs/)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /resolve/i })).not.toBeInTheDocument()
  })

  it("explains when the admin cannot view user content", async () => {
    permissions = ["admins.read"]
    renderAt("/user-content")
    expect(await screen.findByText("You don't have access to user content")).toBeInTheDocument()
  })
})
