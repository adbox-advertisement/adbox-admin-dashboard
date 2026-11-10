import { beforeEach, describe, expect, it, vi } from "vitest"
import { Route, Routes } from "react-router-dom"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test/test-utils"
import { superAdminApi } from "@/api/client"
import { profileFixture } from "@/test/rbac-fixtures"
import { businessDetail, businessRequestFixtures } from "@/test/users-fixtures"
import { BusinessRequestsPage } from "./BusinessRequestsPage"
import { BusinessRequestReviewPage } from "./BusinessRequestReviewPage"

const [akos, kofi] = businessRequestFixtures
const counts = { open: 2, NEW: 2, IN_REVIEW: 0, NEEDS_CHANGES: 0, APPROVED: 3, DECLINED: 1 }
let permissions = ["*"]
// What the fake server holds: the fixtures, changed by each decision.
type Stored = Record<string, unknown> & { status: string; history: Array<{ at: string; text: string }> }
let current: Record<string, Stored> = {}
let taken = new Set<string>()

function renderAt(path: string) {
  return renderWithProviders(<Routes>
    <Route path="/manage-users/business-requests" element={<BusinessRequestsPage />} />
    <Route path="/manage-users/business-requests/:requestId" element={<BusinessRequestReviewPage />} />
  </Routes>, { initialEntries: [path] })
}

// Whole review flows with many typed fields: allow for a loaded machine.
describe("Business requests", { timeout: 15_000 }, () => {
  let get: ReturnType<typeof vi.spyOn>
  let post: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    permissions = ["*"]
    taken = new Set(["akos"])
    current = { [akos.id]: businessDetail(akos), [kofi.id]: businessDetail(kofi) }
    get = vi.spyOn(superAdminApi, "get").mockImplementation(async (url, config) => {
      const params = (config?.params ?? {}) as Record<string, string>
      if (url === "/auth/me") return { data: { ...profileFixture, permissions } }
      if (url === "/business-requests/counts") return { data: counts }
      if (url === "/business-requests") {
        const items = Object.values(current).filter((item) => params.status === "open" ? ["NEW", "IN_REVIEW", "NEEDS_CHANGES"].includes(item.status) : item.status === params.status)
        return { data: { items, total: items.length, page: 1, limit: 20 } }
      }
      const check = /^\/business-requests\/([^/]+)\/username-available$/.exec(url)
      if (check) return { data: { username: params.username, available: !taken.has(params.username), reason: taken.has(params.username) ? "That username is taken." : null } }
      const one = /^\/business-requests\/([^/]+)$/.exec(url)
      if (one && current[one[1]]) return { data: current[one[1]] }
      throw new Error(`Unexpected GET ${url}`)
    })
    post = vi.spyOn(superAdminApi, "post").mockImplementation(async (url, body) => {
      const [, , id, action] = url.split("/")
      const request = current[id]
      const input = (body ?? {}) as Record<string, string>
      const me = { reviewer: "Adison Cole", reviewerId: profileFixture.id }
      const event = (text: string) => [...request.history, { at: "2026-11-03T12:00:00.000Z", text }]
      if (action === "claim") current[id] = { ...request, ...me, status: "IN_REVIEW", history: event("Opened by Adison Cole") }
      else if (action === "approve") current[id] = {
        ...request, status: "APPROVED", username: input.username, name: input.name, decidedAt: "2026-11-03T12:00:00.000Z",
        account: { userId: "60000000-0000-4000-8000-000000000099", username: input.username },
        company: { id: "80000000-0000-4000-8000-000000000099", status: "ACTIVE" },
        history: event(`Approved by Adison Cole as @${input.username}; @abena.mensah runs it`),
      }
      else if (action === "request-changes") current[id] = { ...request, status: "NEEDS_CHANGES", note: input.note, history: event(`Adison Cole asked for a change: “${input.note}”`) }
      else if (action === "decline") current[id] = { ...request, status: "DECLINED", declineReason: input.reason, note: input.note ?? null, decidedAt: "2026-11-03T12:00:00.000Z", history: event("Declined by Adison Cole: not a real business") }
      else throw new Error(`Unexpected POST ${url}`)
      return { data: current[id] }
    })
  })

  it("lists open requests with their counts and checks, and filters on the server", async () => {
    const user = userEvent.setup()
    renderAt("/manage-users/business-requests")
    expect(await screen.findByText("Auntie Akos' Waakye")).toBeInTheDocument()
    expect(await screen.findByRole("radio", { name: "All open 2" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByText("Serves University of Ghana · Legon")).toBeInTheDocument()
    expect(screen.getByText("No proof · New account")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Review Kofi Prints" })).toHaveAttribute("href", `/manage-users/business-requests/${kofi.id}`)

    await user.click(screen.getByRole("radio", { name: "Approved 3" }))
    await waitFor(() => expect(get).toHaveBeenCalledWith("/business-requests", expect.objectContaining({ params: expect.objectContaining({ status: "APPROVED" }) })))
    expect(await screen.findByText("No requests here")).toBeInTheDocument()

    await user.click(screen.getByRole("radio", { name: "All open 2" }))
    await user.type(screen.getByRole("searchbox", { name: "Search business requests" }), "BN123")
    await waitFor(() => expect(get).toHaveBeenCalledWith("/business-requests", expect.objectContaining({ params: expect.objectContaining({ search: "BN123" }) })))
  })

  it("claims a new request, checks the username, and approves once the proof is checked", async () => {
    const user = userEvent.setup()
    renderAt(`/manage-users/business-requests/${akos.id}`)
    expect(await screen.findByRole("heading", { name: "Auntie Akos' Waakye" })).toBeInTheDocument()
    // Opening it claims it for this admin.
    expect(await screen.findByText("In review · you")).toBeInTheDocument()
    expect(post).toHaveBeenCalledWith(`/business-requests/${akos.id}/claim`)
    expect(screen.getByText(/Opened by Adison Cole/)).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "The proof: certificate.jpg" })).toHaveAttribute("src", "https://s3.example.com/proof?signed")
    expect(await screen.findByText("What they asked for. Available.")).toBeInTheDocument()

    const approve = screen.getByRole("button", { name: "Approve and create the account" })
    expect(approve).toBeDisabled()
    for (const label of ["It's a Registrar-General certificate for Auntie Akos' Waakye", "Its number reads BN123456789", "Nothing on it looks edited"]) {
      await user.click(screen.getByRole("checkbox", { name: label }))
    }
    expect(approve).toBeEnabled()

    const username = screen.getByRole("textbox", { name: "Account username" })
    await user.clear(username)
    await user.type(username, "akos")
    expect(await screen.findByText("That username is taken.")).toBeInTheDocument()
    await user.clear(username)
    await user.type(username, "ak")
    expect(screen.getByText("At least 3 characters.")).toBeInTheDocument()
    await user.clear(username)
    await user.type(username, "akos.legon")
    expect(await screen.findByText("Available.")).toBeInTheDocument()

    await user.click(approve)
    expect(await screen.findByRole("heading", { name: "Approved" })).toBeInTheDocument()
    expect(post).toHaveBeenCalledWith(`/business-requests/${akos.id}/approve`, { username: "akos.legon", name: "Auntie Akos' Waakye" })
    expect(screen.getByText(/@akos.legon is a business account/)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Open the company" })).toHaveAttribute("href", "/manage-users/companies/80000000-0000-4000-8000-000000000099")
    expect(screen.getByRole("link", { name: "Open the account" })).toHaveAttribute("href", "/manage-users/people/60000000-0000-4000-8000-000000000099")
  })

  it("starts on Ask for changes without proof, then declines only with a reason", async () => {
    const user = userEvent.setup()
    renderAt(`/manage-users/business-requests/${kofi.id}`)
    expect(await screen.findByRole("heading", { name: "Kofi Prints" })).toBeInTheDocument()
    expect(screen.getByText(/Nothing was attached, so it can't be approved/)).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "Ask for changes" })).toHaveAttribute("aria-checked", "true")

    await user.click(screen.getByRole("button", { name: "Send to Kofi" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Say what they should fix")
    await user.type(screen.getByRole("textbox", { name: "What should they fix?" }), "Please send a photo of your shop front.")
    await user.click(screen.getByRole("button", { name: "Send to Kofi" }))
    expect(await screen.findByText(/Waiting for Kofi to change it/)).toBeInTheDocument()
    expect(post).toHaveBeenCalledWith(`/business-requests/${kofi.id}/request-changes`, { note: "Please send a photo of your shop front." })
    expect(screen.getByText(/Already waiting for Kofi's change/)).toBeInTheDocument()

    await user.click(screen.getByRole("radio", { name: "Approve" }))
    expect(screen.getByRole("button", { name: "Approve and create the account" })).toBeDisabled()
    expect(screen.getByText("No proof, so it can't be approved. Ask for changes.")).toBeInTheDocument()

    await user.click(screen.getByRole("radio", { name: "Decline" }))
    await user.click(screen.getByRole("button", { name: "Decline request" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Choose a reason.")
    await user.click(screen.getByRole("combobox", { name: "Reason" }))
    await user.click(await screen.findByRole("option", { name: "Not a real business" }))
    await user.click(screen.getByRole("button", { name: "Decline request" }))
    expect(await screen.findByRole("heading", { name: "Declined" })).toBeInTheDocument()
    // An empty note is left out, not sent blank.
    expect(post).toHaveBeenCalledWith(`/business-requests/${kofi.id}/decline`, { reason: "NOT_OFFICIAL" })
    expect(screen.getByText("Not a real business")).toBeInTheDocument()
  })

  it("starts on Decline when a page or business asked, and never approves it", async () => {
    const user = userEvent.setup()
    current[akos.id] = businessDetail(akos, { requester: { ...akos.requester, name: "Cool", username: "cool", isAccount: true } })
    renderAt(`/manage-users/business-requests/${akos.id}`)
    expect(await screen.findByRole("heading", { name: "Auntie Akos' Waakye" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "Decline" })).toHaveAttribute("aria-checked", "true")

    await user.click(screen.getByRole("radio", { name: "Approve" }))
    expect(screen.getByText("Sent by a page or business, which can't run another account. Decline it: they can ask again from their own account.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Approve and create the account" })).toBeDisabled()
  })

  it("shows the request but neither claims it nor offers a decision without permission to verify", async () => {
    permissions = ["companies.read"]
    renderAt(`/manage-users/business-requests/${akos.id}`)
    expect(await screen.findByRole("heading", { name: "Auntie Akos' Waakye" })).toBeInTheDocument()
    expect(screen.getByText(/Deciding needs the/)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Approve and create the account" })).not.toBeInTheDocument()
    expect(screen.getByText("New")).toBeInTheDocument()
    expect(post).not.toHaveBeenCalled()
  })

  it("keeps out admins without the companies permission", async () => {
    permissions = ["platform.users.read"]
    renderAt("/manage-users/business-requests")
    expect(await screen.findByText("You don't have access to business requests")).toBeInTheDocument()
    expect(within(document.body).queryByText("Auntie Akos' Waakye")).not.toBeInTheDocument()
  })
})
