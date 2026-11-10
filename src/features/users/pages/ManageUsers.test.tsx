import { beforeEach, describe, expect, it, vi } from "vitest"
import { Route, Routes, useLocation } from "react-router-dom"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test/test-utils"
import { superAdminApi } from "@/api/client"
import { profileFixture } from "@/test/rbac-fixtures"
import {
  companyDetailFixture, companyListFixture, connectionsFixture, honourPageFixture, institutionFixtures, page, platformUserFixtures,
  relationshipsFixture, scopedStatsFixture, statsFixture, verificationFixtures,
} from "@/test/users-fixtures"
import { ManageUsersLayout } from "./ManageUsersLayout"
import { UsersOverviewPage } from "./UsersOverviewPage"
import { PeoplePage } from "./PeoplePage"
import { UserProfilePage } from "./UserProfilePage"
import { InstitutionsPage } from "./InstitutionsPage"
import { InstitutionDetailPage } from "./InstitutionDetailPage"
import { CompaniesPage } from "./CompaniesPage"
import { CompanyDetailPage } from "./CompanyDetailPage"
import { VerificationPage } from "./VerificationPage"
import { HonoursPage } from "./HonoursPage"

let permissions = ["*"]
let honoursMet = true
const ama = platformUserFixtures[0]

function Location() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname + location.search}</output>
}

function renderAt(path: string) {
  return renderWithProviders(<>
    <Routes>
      <Route path="/manage-users" element={<ManageUsersLayout />}>
        <Route index element={<UsersOverviewPage />} />
        <Route path="people" element={<PeoplePage />} />
        <Route path="people/:userId" element={<UserProfilePage />} />
        <Route path="institutions" element={<InstitutionsPage />} />
        <Route path="institutions/:institutionId" element={<InstitutionDetailPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="companies/:companyId" element={<CompanyDetailPage />} />
        <Route path="verification" element={<VerificationPage />} />
        <Route path="honours" element={<HonoursPage />} />
      </Route>
    </Routes>
    <Location />
  </>, { initialEntries: [path] })
}

const location = () => screen.getByTestId("location").textContent

describe("Manage Users", () => {
  beforeEach(() => {
    permissions = ["*"]
    honoursMet = true
    vi.spyOn(superAdminApi, "get").mockImplementation(async (url, config) => {
      const params = (config?.params ?? {}) as Record<string, unknown>
      if (url === "/auth/me") return { data: { ...profileFixture, permissions } }
      if (url === "/platform-users/stats") return { data: params.institutionId ? scopedStatsFixture : statsFixture }
      if (url === "/platform-users") return { data: page(platformUserFixtures, 2) }
      if (url === `/platform-users/${ama.id}/relationships`) return { data: relationshipsFixture }
      if (url === `/platform-users/${ama.id}/connections`) return { data: connectionsFixture(String(params.direction)) }
      if (url.startsWith("/platform-users/")) return { data: ama }
      if (url === "/institutions") return { data: institutionFixtures }
      if (url === "/companies") return { data: page([companyListFixture], params.status === "PENDING_VERIFICATION" ? 1 : 1) }
      if (url.startsWith("/companies/")) return { data: companyDetailFixture }
      if (url === "/verification-requests") return { data: page(verificationFixtures) }
      if (url === "/honour-review") return { data: honourPageFixture(honoursMet) }
      if (url === "/business-requests/counts") return { data: { open: 2, NEW: 1, IN_REVIEW: 1, NEEDS_CHANGES: 0, APPROVED: 0, DECLINED: 0 } }
      throw new Error("Unexpected GET " + url)
    })
  })

  it("opens on the review queues an admin may use, with what waits in each", async () => {
    permissions = ["platform.users.read", "companies.read"]
    renderAt("/manage-users")
    const queues = await screen.findByRole("list", { name: "Review queues" })
    expect(await within(queues).findByRole("link", { name: "Companies to approve: 1 waiting" })).toHaveAttribute("href", "/manage-users/companies?status=PENDING_VERIFICATION")
    expect(await within(queues).findByRole("link", { name: "Business requests: 2 waiting" })).toHaveAttribute("href", "/manage-users/business-requests")
    expect(within(queues).queryByRole("link", { name: /Verification/ })).not.toBeInTheDocument()
    expect(within(queues).queryByRole("link", { name: /Page requests|Honours/ })).not.toBeInTheDocument()
  })

  it("leaves the queues out for an admin who can open none of them", async () => {
    permissions = ["platform.users.read"]
    renderAt("/manage-users")
    expect(await screen.findByRole("list", { name: "People by account role" })).toBeInTheDocument()
    expect(screen.queryByRole("list", { name: "Review queues" })).not.toBeInTheDocument()
  })

  it("sends admins without user access to the first section they can open", async () => {
    permissions = ["honours.review"]
    renderAt("/manage-users")
    await waitFor(() => expect(location()).toBe("/manage-users/honours"))
  })

  it("opens a profile from an old ?user= link", async () => {
    renderAt(`/manage-users?user=${ama.id}`)
    await waitFor(() => expect(location()).toBe(`/manage-users/people/${ama.id}`))
  })

  it("breaks people down by role and affiliation, linking to filtered lists", async () => {
    const user = userEvent.setup()
    renderAt("/manage-users")
    const roles = await screen.findByRole("list", { name: "People by account role" })
    expect(within(roles).getByRole("link", { name: /Publisher: 12, 10%/ })).toBeInTheDocument()
    const affiliation = screen.getByRole("list", { name: "People by campus affiliation" })
    expect(within(affiliation).getByText("Faculty & staff")).toBeInTheDocument()
    await user.click(within(affiliation).getByRole("link", { name: /Alumni: 15/ }))
    await waitFor(() => expect(location()).toBe("/manage-users/people?affiliation=ALUMNI"))
  })

  it("filters people from the URL and keeps new filters in it", async () => {
    const user = userEvent.setup()
    const get = vi.mocked(superAdminApi.get)
    renderAt("/manage-users/people?role=PUBLISHER")
    expect(await screen.findByRole("button", { name: "Ama Mensah" })).toBeInTheDocument()
    expect(get).toHaveBeenCalledWith("/platform-users", expect.objectContaining({ params: expect.objectContaining({ role: "PUBLISHER" }) }))
    await user.click(screen.getByRole("combobox", { name: "Filter by badge" }))
    await user.click(await screen.findByRole("option", { name: "Gye Nyame" }))
    await waitFor(() => expect(location()).toBe("/manage-users/people?role=PUBLISHER&badge=honour"))
    await user.click(screen.getByRole("button", { name: "Clear 2 filters" }))
    await waitFor(() => expect(location()).toBe("/manage-users/people"))
  })

  it("opens a full profile with connections, companies and sign-in details", async () => {
    const user = userEvent.setup()
    renderAt("/manage-users/people")
    await user.click(await screen.findByRole("button", { name: "Ama Mensah" }))
    expect(await screen.findByRole("heading", { level: 1, name: "Ama Mensah" })).toBeInTheDocument()
    // The approved company it owns gives it the company seal.
    expect(await screen.findByText("Verified company")).toBeInTheDocument()

    await user.click(screen.getByRole("tab", { name: "Connections" }))
    expect(await screen.findByRole("link", { name: "Person 3" })).toBeInTheDocument()
    await user.click(screen.getByRole("radio", { name: /Blocked by them/ }))
    await waitFor(() => expect(superAdminApi.get).toHaveBeenCalledWith(`/platform-users/${ama.id}/connections`, expect.objectContaining({ params: expect.objectContaining({ direction: "blocking" }) })))

    await user.click(screen.getByRole("tab", { name: "Publishing" }))
    expect(await screen.findByRole("link", { name: "Kofi Foods" })).toBeInTheDocument()
    expect(screen.getByText("Owner")).toBeInTheDocument()

    await user.click(screen.getByRole("tab", { name: "Account & sign-in" }))
    expect(await screen.findByText("Google")).toBeInTheDocument()
    expect(location()).toContain("tab=account")
  })

  it("sets badges, sending only what changed", async () => {
    const user = userEvent.setup()
    const patch = vi.spyOn(superAdminApi, "patch").mockResolvedValue({ data: ama })
    renderAt(`/manage-users/people/${ama.id}`)
    await user.click(await screen.findByRole("button", { name: "Badges" }))
    const dialog = await screen.findByRole("dialog", { name: "Badges for Ama Mensah" })
    await user.click(within(dialog).getByRole("combobox", { name: "Verification" }))
    await user.click(await screen.findByRole("option", { name: "Verified" }))
    await user.click(within(dialog).getByRole("radio", { name: "Grant" }))
    await user.click(within(dialog).getByRole("button", { name: "Save badges" }))
    await waitFor(() => expect(patch).toHaveBeenCalledWith(`/platform-users/${ama.id}/badges`, { verificationTier: "VERIFIED", honour: "GRANT" }))
  })

  it("lists institutions and drills into campuses and members", async () => {
    const user = userEvent.setup()
    const get = vi.mocked(superAdminApi.get)
    renderAt("/manage-users/institutions")
    await user.click(await screen.findByRole("checkbox", { name: "Only with members" }))
    expect(screen.queryByRole("button", { name: /^KNUST/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^UG/ }))
    expect(await screen.findByRole("heading", { level: 1, name: "University of Ghana" })).toBeInTheDocument()
    expect(screen.getByText("No campus chosen")).toBeInTheDocument()
    await user.click(screen.getByRole("radio", { name: "Faculty & staff" }))
    await waitFor(() => expect(get).toHaveBeenCalledWith("/platform-users", expect.objectContaining({ params: expect.objectContaining({ institutionId: institutionFixtures[0].id, affiliation: "STAFF" }) })))
  })

  it("approves a company from its page", async () => {
    const user = userEvent.setup()
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: { ...companyDetailFixture, status: "ACTIVE" } })
    renderAt("/manage-users/companies")
    expect(await screen.findByRole("link", { name: "Kofi Owner" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Kofi Foods" }))
    expect(await screen.findByRole("heading", { level: 1, name: "Kofi Foods" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Publishers (2)" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Approve" }))
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Approve company" }))
    await waitFor(() => expect(post).toHaveBeenCalledWith(`/companies/${companyDetailFixture.id}/approve`))
  })

  it("requires a note to override unmet honour rules", async () => {
    honoursMet = false
    const user = userEvent.setup()
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: { ...honourPageFixture(false).items[0], nominations: [] } })
    renderAt("/manage-users/honours")
    await user.click(await screen.findByRole("button", { name: "Override…" }))
    const dialog = await screen.findByRole("dialog", { name: "Grant Gye Nyame to Ama Mensah?" })
    await user.click(within(dialog).getByRole("button", { name: "Override and grant" }))
    expect(await within(dialog).findByRole("alert")).toHaveTextContent("Explain why you are overriding the rules.")
    expect(post).not.toHaveBeenCalled()
    await user.type(within(dialog).getByLabelText(/Why override/), "Campus leader for three years")
    await user.click(within(dialog).getByRole("button", { name: "Override and grant" }))
    await waitFor(() => expect(post).toHaveBeenCalledWith(`/honour-review/${ama.id}/grant`, { override: true, note: "Campus leader for three years" }))
  })

  it("explains missing access on a section", async () => {
    permissions = ["platform.users.read"]
    renderAt("/manage-users/companies")
    expect(await screen.findByText("You don't have access to advertiser companies")).toBeInTheDocument()
  })
})
