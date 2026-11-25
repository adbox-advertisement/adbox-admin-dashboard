import { beforeEach, describe, expect, it, vi } from "vitest"
import { Route, Routes } from "react-router-dom"
import userEvent from "@testing-library/user-event"
import { fireEvent, screen, waitFor, within } from "@testing-library/react"
import { superAdminApi } from "@/api/client"
import { profileFixture } from "@/test/rbac-fixtures"
import { renderWithProviders } from "@/test/test-utils"
import { createAppClient } from "../app-client"
import { StudioAccountsPage } from "./StudioAccountsPage"
import { StudioCreatePage } from "./StudioCreatePage"
import { StudioGroupsPage } from "./StudioGroupsPage"
import { StudioHomePage } from "./StudioHomePage"
import { StudioPostsPage } from "./StudioPostsPage"

vi.mock("../app-client", () => ({ createAppClient: vi.fn() }))

const admin = { id: profileFixture.id, name: "Adison Cole", email: "admin@example.com" }
const ug = { id: "ug", name: "University of Ghana", shortName: "UG" }
const createdAt = "2026-11-10T10:00:00.000Z"
const account = {
  id: "acc-1", username: "legon.hallweek", fullName: "Legon Hall Week", bio: "Everything at Legon Hall Week.", image: null,
  institution: ug, campus: null, note: null, isActive: true, archivedAt: null, createdAt, createdBy: admin,
  counts: { posts: 3, followers: 120 }, lastPostedAt: "2026-11-15T10:00:00.000Z",
}
const group = {
  id: "grp-1", name: "Legon Hall Week", description: null, hashtag: "LegonHallWeek", hashtagKey: "legonhallweek",
  institution: ug, campus: null, hall: null, startsAt: null, endsAt: null, coverUrl: null, archivedAt: null, createdAt, createdBy: admin,
  counts: { posts: 12, studioPosts: 4 },
}
const studioPost = {
  id: "post-1", type: "VIDEO", caption: "Opening night #LegonHallWeek", status: "PUBLIC", createdAt, isShort: true,
  account: { id: "acc-1", username: "legon.hallweek", fullName: "Legon Hall Week", image: null }, postedBy: admin, cover: null, imageCount: 0,
  video: { duration: 42, aspectRatio: 0.5625, transcodingStatus: "COMPLETED" }, counts: { likes: 10, comments: 2, views: 300 },
  groups: [{ id: "grp-1", name: "Legon Hall Week", hashtag: "LegonHallWeek" }],
}
const summary = {
  accounts: { active: 1, archived: 0 }, groups: { active: 1 },
  posts: { total: 3, last7Days: 2, text: 1, pictures: 1, videos: 1, shorts: 1 }, topAdmins: [{ admin, posts: 3 }],
}
const directory = [
  { id: "ug", name: "University of Ghana", shortName: "UG", region: "Greater Accra", isActive: true, campuses: [{ id: "legon", name: "Legon", halls: [{ id: "commonwealth", name: "Commonwealth Hall", isActive: true }] }] },
  { id: "knust", name: "Kwame Nkrumah University of Science and Technology", shortName: "KNUST", region: "Ashanti", isActive: true, campuses: [] },
]
const page = <T,>(items: T[]) => ({ items, total: items.length, page: 1, limit: 24 })

function mockStudio() {
  vi.spyOn(superAdminApi, "get").mockImplementation(async (url, config) => {
    if (url === "/auth/me") return { data: { ...profileFixture, permissions: ["*"] } }
    if (url === "/studio/summary") return { data: summary }
    if (url === "/studio/accounts/username-available") return { data: { username: (config?.params as { username: string }).username, available: true, reason: null } }
    if (url === "/studio/accounts") return { data: page([account]) }
    if (url === "/studio/groups") return { data: page([group]) }
    if (url === "/studio/posts") return { data: page([studioPost]) }
    if (url === "/institutions") return { data: directory }
    throw new Error("Unexpected GET " + url)
  })
}

function renderAt(path: string) {
  return renderWithProviders(<Routes>
    <Route path="/video-management" element={<StudioHomePage />} />
    <Route path="/video-management/upload" element={<StudioCreatePage />} />
    <Route path="/video-management/accounts" element={<StudioAccountsPage />} />
    <Route path="/video-management/groups" element={<StudioGroupsPage />} />
    <Route path="/video-management/posts" element={<StudioPostsPage />} />
  </Routes>, { initialEntries: [path] })
}

describe("Video Management, the studio", () => {
  beforeEach(() => {
    localStorage.clear()
    mockStudio()
  })

  it("opens on what's been made, and who made it", async () => {
    renderAt("/video-management")
    expect(await screen.findByRole("button", { name: "View post: Opening night #LegonHallWeek" })).toBeInTheDocument()
    expect(screen.getByText(/^by Adison Cole · /)).toBeInTheDocument()
    // Each admin who posted lately leads to their posts.
    expect(await screen.findByRole("link", { name: "Adison Cole: 3 posts. See them" })).toHaveAttribute("href", `/video-management/posts?admin=${admin.id}`)

    await userEvent.click(screen.getByRole("button", { name: "View post: Opening night #LegonHallWeek" }))
    const sheet = await screen.findByRole("dialog", { name: "Post details" })
    expect(within(sheet).getByText("Made by Adison Cole (admin@example.com).")).toBeInTheDocument()
    expect(within(sheet).getByRole("link", { name: "#LegonHallWeek" })).toHaveAttribute("href", "/video-management/groups/grp-1")
  })

  it("makes an account with a username taken from its name", async () => {
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: { ...account, id: "acc-2", username: "pent.hallweek", fullName: "Pent Hall Week" } })
    renderAt("/video-management/accounts")
    expect(await screen.findByRole("article", { name: "Legon Hall Week" })).toHaveTextContent("Made by Adison Cole")

    await userEvent.click(screen.getAllByRole("button", { name: "New account" })[0])
    const dialog = await screen.findByRole("dialog", { name: "New account" })
    await userEvent.type(within(dialog).getByLabelText("Name"), "Pent Hall Week")
    expect(within(dialog).getByLabelText("Username")).toHaveValue("pent.hallweek")
    expect(await within(dialog).findByText("@pent.hallweek is free")).toBeInTheDocument()

    await userEvent.click(within(dialog).getByRole("button", { name: "Create account" }))
    await waitFor(() => expect(post).toHaveBeenCalledWith("/studio/accounts", { fullName: "Pent Hall Week", username: "pent.hallweek" }))
  })

  it("finds any institution by typing, and filters by it", async () => {
    renderAt("/video-management/accounts")
    await screen.findByRole("article", { name: "Legon Hall Week" })
    await userEvent.click(await screen.findByRole("button", { name: "Institution" }))
    const search = await screen.findByRole("combobox", { name: "Search institution" })
    // A region finds its institutions too; "Any institution" stays first.
    await userEvent.type(search, "ashanti")
    expect(screen.getAllByRole("option")).toHaveLength(2)
    expect(screen.getAllByRole("option")[1]).toHaveTextContent("KNUST")
    await userEvent.keyboard("{ArrowDown}{Enter}")

    expect(screen.getByRole("button", { name: "Institution: KNUST" })).toBeInTheDocument()
    await waitFor(() => expect(superAdminApi.get).toHaveBeenCalledWith("/studio/accounts", expect.objectContaining({ params: expect.objectContaining({ institutionId: "knust" }) })))
  })

  it("makes a group with its hashtag and dates", async () => {
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: { ...group, id: "grp-2", name: "Pent Hall Week", hashtag: "PentHallWeek" } })
    renderAt("/video-management/groups")
    expect(await screen.findByRole("article", { name: "Legon Hall Week" })).toHaveTextContent("#LegonHallWeek")

    await userEvent.click(screen.getAllByRole("button", { name: "New group" })[0])
    const dialog = await screen.findByRole("dialog", { name: "New group" })
    await userEvent.type(within(dialog).getByLabelText("Name"), "Pent Hall Week")
    expect(within(dialog).getByLabelText("Hashtag")).toHaveValue("PentHallWeek")

    fireEvent.change(within(dialog).getByLabelText(/^Starts/), { target: { value: "2026-11-20" } })
    fireEvent.change(within(dialog).getByLabelText(/^Ends/), { target: { value: "2026-11-18" } })
    expect(within(dialog).getByRole("alert")).toHaveTextContent("It can't end before it starts.")
    expect(within(dialog).getByRole("button", { name: "Create group" })).toBeDisabled()

    fireEvent.change(within(dialog).getByLabelText(/^Ends/), { target: { value: "2026-11-27" } })
    await userEvent.click(within(dialog).getByRole("button", { name: "Create group" }))
    await waitFor(() => expect(post).toHaveBeenCalledWith("/studio/groups", {
      name: "Pent Hall Week",
      hashtag: "PentHallWeek",
      startsAt: new Date("2026-11-20T00:00:00").toISOString(),
      endsAt: new Date("2026-11-27T23:59:59").toISOString(),
    }))
  })

  it("clears what an edit empties, instead of keeping it", async () => {
    const patch = vi.spyOn(superAdminApi, "patch").mockResolvedValue({ data: { ...group, institution: null } })
    renderAt("/video-management/groups")
    await userEvent.click(await screen.findByRole("button", { name: "Edit Legon Hall Week" }))
    const dialog = await screen.findByRole("dialog", { name: "Edit group" })
    expect(within(dialog).getByLabelText("Hashtag")).toBeDisabled()

    await userEvent.click(within(dialog).getByRole("button", { name: "Institution: UG" }))
    await screen.findByRole("combobox", { name: "Search institution" })
    // "No institution" comes first.
    await userEvent.keyboard("{Enter}")
    await userEvent.click(within(dialog).getByRole("button", { name: "Save" }))

    await waitFor(() => expect(patch).toHaveBeenCalledWith("/studio/groups/grp-1", {
      name: "Legon Hall Week",
      description: null,
      coverUrl: null,
      institutionId: null,
      campusId: null,
      hallId: null,
      startsAt: null,
      endsAt: null,
    }))
  })

  it("filters posts by kind and by the admin the address names", async () => {
    renderAt(`/video-management/posts?admin=${admin.id}`)
    await screen.findByRole("button", { name: "View post: Opening night #LegonHallWeek" })
    expect(superAdminApi.get).toHaveBeenCalledWith("/studio/posts", expect.objectContaining({ params: expect.objectContaining({ adminId: admin.id }) }))

    await userEvent.click(screen.getByRole("button", { name: "Pictures" }))
    expect(screen.getByRole("button", { name: "Pictures" })).toHaveAttribute("aria-pressed", "true")
    await waitFor(() => expect(superAdminApi.get).toHaveBeenCalledWith("/studio/posts", expect.objectContaining({ params: expect.objectContaining({ adminId: admin.id, type: "IMAGE" }) })))
  })

  it("posts words as the account, in the group, through the app's own posting", async () => {
    const createPost = vi.fn(async () => ({ id: "post-9", type: "TEXT" as const, caption: null, visibility: "PUBLIC", media: [] }))
    vi.mocked(createAppClient).mockReturnValue({ createPost } as unknown as ReturnType<typeof createAppClient>)
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({
      data: { accessToken: "app-token", sessionId: "session-1", expiresAt: new Date(Date.now() + 3_600_000).toISOString(), apiBaseUrl: "http://localhost:3000/api/v1", account: { id: "acc-1", username: "legon.hallweek", fullName: "Legon Hall Week" } },
    })
    renderAt("/video-management/upload?group=grp-1")

    // The only account is chosen already, and the group's hashtag is on its way.
    expect(await screen.findByRole("radio", { name: /Legon Hall Week/ })).toBeChecked()
    expect(await screen.findByText("is added at the end of the caption.", { exact: false })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("radio", { name: /^Text/ }))
    expect(screen.getByRole("list", { name: "Before posting" })).toHaveTextContent("Write something to post.")

    await userEvent.type(screen.getByLabelText("Post text"), "Opening night is here")
    expect(screen.getByText("Ready: a text from Legon Hall Week.")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Post text" }))

    expect(await screen.findByRole("heading", { name: "Posted as Legon Hall Week" })).toHaveFocus()
    expect(post).toHaveBeenCalledWith("/studio/accounts/acc-1/session")
    expect(createAppClient).toHaveBeenCalledWith(expect.objectContaining({ accessToken: "app-token", apiBaseUrl: "http://localhost:3000/api/v1" }))
    expect(createPost).toHaveBeenCalledWith({ clientPostId: expect.any(String), type: "TEXT", caption: "Opening night is here\n\n#LegonHallWeek", visibility: "PUBLIC" })
    expect(screen.getByRole("status")).toHaveTextContent("It's live in the app now. It's in #LegonHallWeek.")
  })
})
