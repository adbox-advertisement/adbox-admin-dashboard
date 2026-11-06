import { beforeEach, describe, expect, it, vi } from "vitest"
import { Route, Routes } from "react-router-dom"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test/test-utils"
import { superAdminApi } from "@/api/client"
import { profileFixture } from "@/test/rbac-fixtures"
import { pageDetail, pageRequestFixtures } from "@/test/users-fixtures"
import { PageRequestsPage } from "./PageRequestsPage"
import { PageRequestReviewPage } from "./PageRequestReviewPage"

const [csu, msu] = pageRequestFixtures
const counts = { open: 2, NEW: 2, IN_REVIEW: 0, NEEDS_CHANGES: 0, APPROVED: 4, DECLINED: 1 }
let permissions = ["*"]
// What the fake server holds: the fixtures, changed by each decision.
type Stored = Record<string, unknown> & { status: string; history: Array<{ at: string; text: string }> }
let current: Record<string, Stored> = {}
let taken = new Set<string>()

function renderAt(path: string) {
  return renderWithProviders(<Routes>
    <Route path="/manage-users/page-requests" element={<PageRequestsPage />} />
    <Route path="/manage-users/page-requests/:requestId" element={<PageRequestReviewPage />} />
  </Routes>, { initialEntries: [path] })
}

// Whole review flows with many typed fields: allow for a loaded machine.
describe("Page requests", { timeout: 15_000 }, () => {
  let get: ReturnType<typeof vi.spyOn>
  let post: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    permissions = ["*"]
    taken = new Set(["ug.cathsu"])
    current = { [csu.id]: pageDetail(csu), [msu.id]: pageDetail(msu) }
    get = vi.spyOn(superAdminApi, "get").mockImplementation(async (url, config) => {
      const params = (config?.params ?? {}) as Record<string, string>
      if (url === "/auth/me") return { data: { ...profileFixture, permissions } }
      if (url === "/page-requests/counts") return { data: counts }
      if (url === "/page-requests") {
        const items = Object.values(current).filter((item) => params.status === "open" ? ["NEW", "IN_REVIEW", "NEEDS_CHANGES"].includes(item.status) : item.status === params.status)
        return { data: { items, total: items.length, page: 1, limit: 20 } }
      }
      if (/^\/page-requests\/[^/]+\/username-available$/.test(url)) {
        return { data: { username: params.username, available: !taken.has(params.username), reason: taken.has(params.username) ? "That username is taken." : null } }
      }
      const one = /^\/page-requests\/([^/]+)$/.exec(url)
      if (one && current[one[1]]) return { data: current[one[1]] }
      throw new Error(`Unexpected GET ${url}`)
    })
    post = vi.spyOn(superAdminApi, "post").mockImplementation(async (url, body) => {
      const [, , id, action] = url.split("/")
      const request = current[id]
      const input = (body ?? {}) as Record<string, string>
      const event = (text: string) => [...request.history, { at: "2026-11-03T12:00:00.000Z", text }]
      if (action === "claim") current[id] = { ...request, status: "IN_REVIEW", reviewer: "Adison Cole", reviewerId: profileFixture.id, history: event("Opened by Adison Cole") }
      else if (action === "approve") current[id] = {
        ...request, status: "APPROVED", username: input.username, name: input.name, decidedAt: "2026-11-03T12:00:00.000Z",
        page: { userId: "60000000-0000-4000-8000-000000000099", username: input.username },
        history: event(`Approved by Adison Cole as @${input.username}; @kwame.asante runs it`),
      }
      else if (action === "request-changes") current[id] = { ...request, status: "NEEDS_CHANGES", note: input.note, history: event(`Adison Cole asked for a change: “${input.note}”`) }
      else if (action === "decline") current[id] = { ...request, status: "DECLINED", declineReason: input.reason, note: input.note ?? null, decidedAt: "2026-11-03T12:00:00.000Z", history: event("Declined by Adison Cole: not an official group") }
      else throw new Error(`Unexpected POST ${url}`)
      return { data: current[id] }
    })
  })

  it("lists open requests with the server's counts and checks, and filters on the server", async () => {
    const user = userEvent.setup()
    renderAt("/manage-users/page-requests")
    expect(await screen.findByText("Catholic Students' Union (CSU)")).toBeInTheDocument()
    expect(await screen.findByRole("radio", { name: "All open · 2" })).toHaveAttribute("aria-checked", "true")
    expect(screen.queryByRole("note")).not.toBeInTheDocument()
    expect(screen.getByText("No letter · new account")).toBeInTheDocument()
    expect(screen.getAllByText("University of Ghana · Legon")).toHaveLength(2)

    await user.click(screen.getByRole("radio", { name: "Declined · 1" }))
    await waitFor(() => expect(get).toHaveBeenCalledWith("/page-requests", expect.objectContaining({ params: expect.objectContaining({ status: "DECLINED" }) })))
    expect(await screen.findByText("No requests here")).toBeInTheDocument()

    await user.click(screen.getByRole("radio", { name: "All open · 2" }))
    await user.type(screen.getByRole("searchbox", { name: "Search page requests" }), "kwame")
    await waitFor(() => expect(get).toHaveBeenCalledWith("/page-requests", expect.objectContaining({ params: expect.objectContaining({ search: "kwame" }) })))
  })

  it("claims a new request, checks the letter and the username, and approves with no email", async () => {
    const user = userEvent.setup()
    renderAt(`/manage-users/page-requests/${csu.id}`)
    expect(await screen.findByRole("heading", { name: "Catholic Students' Union (CSU)" })).toBeInTheDocument()
    expect(await screen.findByText("In review · you")).toBeInTheDocument()
    expect(post).toHaveBeenCalledWith(`/page-requests/${csu.id}/claim`)
    expect(screen.getByRole("img", { name: "The letter: letter.jpg" })).toHaveAttribute("src", "https://s3.example.com/letter?signed")
    expect(screen.queryByRole("button", { name: /Preview the email/ })).not.toBeInTheDocument()
    expect(await screen.findByText("What they asked for. Available.")).toBeInTheDocument()

    const approve = screen.getByRole("button", { name: "Approve and create the page" })
    expect(approve).toBeDisabled()
    for (const label of ["On the group's or institution's letterhead", "Signed by the patron, dean or chaplain", "Names Kwame Asante as allowed to run the page", "Dated in the last 6 months"]) {
      await user.click(screen.getByRole("checkbox", { name: label }))
    }
    expect(approve).toBeEnabled()

    const username = screen.getByRole("textbox", { name: "Page username" })
    await user.clear(username)
    await user.type(username, "ug.cathsu")
    expect(await screen.findByText("That username is taken.")).toBeInTheDocument()
    await user.clear(username)
    await user.type(username, "ug.csu.legon")
    expect(await screen.findByText("Available.")).toBeInTheDocument()

    await user.click(approve)
    expect(await screen.findByRole("heading", { name: "Approved" })).toBeInTheDocument()
    expect(post).toHaveBeenCalledWith(`/page-requests/${csu.id}/approve`, { username: "ug.csu.legon", name: "Catholic Students' Union (CSU)" })
    expect(screen.getByText(/Kwame Asante runs it as its owner/)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Open the page's account" })).toHaveAttribute("href", "/manage-users/people/60000000-0000-4000-8000-000000000099")
  })

  it("starts on Ask for changes without a letter, then declines only with a reason", async () => {
    const user = userEvent.setup()
    renderAt(`/manage-users/page-requests/${msu.id}`)
    expect(await screen.findByRole("heading", { name: "Methodist Students' Union" })).toBeInTheDocument()
    expect(screen.getByText(/Nothing was attached, so it can't be approved/)).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "Ask for changes" })).toHaveAttribute("aria-checked", "true")

    await user.click(screen.getByRole("button", { name: "Send to Yaw" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Say what they should fix")
    await user.type(screen.getByRole("textbox", { name: "What should they fix?" }), "Please attach a letter signed by your chaplain.")
    await user.click(screen.getByRole("button", { name: "Send to Yaw" }))
    expect(await screen.findByText(/Waiting for Yaw to change it/)).toBeInTheDocument()
    expect(post).toHaveBeenCalledWith(`/page-requests/${msu.id}/request-changes`, { note: "Please attach a letter signed by your chaplain." })

    await user.click(screen.getByRole("radio", { name: "Decline" }))
    await user.click(screen.getByRole("button", { name: "Decline request" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Choose a reason.")
    await user.click(screen.getByRole("combobox", { name: "Reason" }))
    await user.click(await screen.findByRole("option", { name: "Not an official group" }))
    await user.click(screen.getByRole("button", { name: "Decline request" }))
    expect(await screen.findByRole("heading", { name: "Declined" })).toBeInTheDocument()
    expect(post).toHaveBeenCalledWith(`/page-requests/${msu.id}/decline`, { reason: "NOT_OFFICIAL" })
  })

  it("shows the request but neither claims it nor offers a decision without permission to review", async () => {
    permissions = ["page_requests.read"]
    renderAt(`/manage-users/page-requests/${csu.id}`)
    expect(await screen.findByRole("heading", { name: "Catholic Students' Union (CSU)" })).toBeInTheDocument()
    expect(screen.getByText(/Deciding needs the/)).toBeInTheDocument()
    expect(screen.getByText("page_requests.review")).toBeInTheDocument()
    expect(screen.getByText("New")).toBeInTheDocument()
    expect(post).not.toHaveBeenCalled()
  })

  it("keeps out admins without the page requests permission", async () => {
    permissions = ["companies.read"]
    renderAt("/manage-users/page-requests")
    expect(await screen.findByText("You don't have access to page requests")).toBeInTheDocument()
  })
})
