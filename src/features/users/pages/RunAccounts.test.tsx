import { beforeEach, describe, expect, it, vi } from "vitest"
import { Route, Routes } from "react-router-dom"
import { screen, within } from "@testing-library/react"
import { renderWithProviders } from "@/test/test-utils"
import { superAdminApi } from "@/api/client"
import { profileFixture } from "@/test/rbac-fixtures"
import { companyDetailFixture, personFixture, platformUserFixtures, relationshipsFixture } from "@/test/users-fixtures"
import { CompanyDetailPage } from "./CompanyDetailPage"
import { UserProfilePage } from "./UserProfilePage"

const ama = platformUserFixtures[0]
const owner = { ...personFixture(3), userProfile: { fullName: "Adwoa Owusu", username: "adwoa.owusu", email: null, image: null } }
const invited = { ...personFixture(4), userProfile: { fullName: "Akosua Frimpong", username: "akosua.frimpong", email: null, image: null } }
const hall = { ...personFixture(5, { role: "PUBLISHER" }), userProfile: { fullName: "Legon Hall JCR", username: "ug.legonhall", email: null, image: null } }
let relationships: Record<string, unknown> = relationshipsFixture

function renderAt(path: string) {
  return renderWithProviders(<Routes>
    <Route path="/manage-users/people/:userId" element={<UserProfilePage />} />
    <Route path="/manage-users/companies/:companyId" element={<CompanyDetailPage />} />
  </Routes>, { initialEntries: [path] })
}

describe("Who runs a page or business", () => {
  beforeEach(() => {
    relationships = relationshipsFixture
    vi.spyOn(superAdminApi, "get").mockImplementation(async (url) => {
      if (url === "/auth/me") return { data: { ...profileFixture, permissions: ["*"] } }
      if (url.endsWith("/relationships")) return { data: relationships }
      if (url.endsWith("/connections")) return { data: { direction: "followers", items: [], total: 0, page: 1, limit: 20 } }
      if (url.startsWith("/platform-users/")) return { data: ama }
      if (url.startsWith("/companies/")) {
        return {
          data: {
            ...companyDetailFixture,
            runBy: [{ accountUserId: companyDetailFixture.publishers[0].user.id, role: "OWNER", invited: false, since: "2026-11-03T10:00:00.000Z", user: owner }],
          },
        }
      }
      throw new Error("Unexpected GET " + url)
    })
  })

  it("shows a page's people on its Publishing tab, owners first and invitations marked", async () => {
    relationships = {
      ...relationshipsFixture,
      companies: [],
      runBy: [
        { person: owner, role: "OWNER", invited: false, since: "2026-11-03T10:00:00.000Z" },
        { person: invited, role: "EDITOR", invited: true, since: "2026-11-04T10:00:00.000Z" },
      ],
    }
    renderAt(`/manage-users/people/${ama.id}?tab=publishing`)
    const list = await screen.findByRole("list", { name: "People who run this account" })
    expect(screen.getByText("Run by 1 person")).toBeInTheDocument()
    const rows = within(list).getAllByRole("listitem")
    expect(within(rows[0]).getByRole("link", { name: "Adwoa Owusu" })).toBeInTheDocument()
    expect(within(rows[0]).getByText("Owner")).toBeInTheDocument()
    expect(within(rows[1]).getByText("Invited")).toBeInTheDocument()
    // A page run by people does not also say it publishes for no company.
    expect(screen.queryByText("Not publishing for any company")).not.toBeInTheDocument()
  })

  it("never shows a made-up address as if it were real", async () => {
    vi.mocked(superAdminApi.get).mockImplementation(async (url) => {
      if (url === "/auth/me") return { data: { ...profileFixture, permissions: ["*"] } }
      if (url.endsWith("/relationships")) return { data: relationshipsFixture }
      if (url.startsWith("/platform-users/")) {
        return { data: { ...ama, userProfile: { ...ama.userProfile, email: "page-1@accounts.adbox.invalid" } } }
      }
      throw new Error("Unexpected GET " + url)
    })
    renderAt(`/manage-users/people/${ama.id}`)
    expect(await screen.findByText("None: nobody signs in to it by email")).toBeInTheDocument()
    expect(screen.queryByText(/adbox\.invalid/)).not.toBeInTheDocument()
  })

  it("shows the pages and businesses a person runs", async () => {
    relationships = {
      ...relationshipsFixture,
      runs: [{ account: hall, kind: "PAGE", role: "OWNER", invited: false, since: "2026-11-03T10:00:00.000Z" }],
    }
    renderAt(`/manage-users/people/${ama.id}?tab=publishing`)
    const list = await screen.findByRole("list", { name: "Pages and businesses they run" })
    expect(within(list).getByRole("link", { name: "Legon Hall JCR" })).toBeInTheDocument()
    expect(within(list).getByText("Page")).toBeInTheDocument()
    expect(within(list).getByText("Owner")).toBeInTheDocument()
    // Their companies still show below.
    expect(screen.getByRole("link", { name: "Kofi Foods" })).toBeInTheDocument()
  })

  it("names who runs a company's account on the company page", async () => {
    renderAt(`/manage-users/companies/${companyDetailFixture.id}`)
    const list = await screen.findByRole("list", { name: "People who run this company's account" })
    expect(within(list).getByRole("link", { name: "Adwoa Owusu" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Who runs its account" })).toBeInTheDocument()
  })

  it("says nothing about it for an older server or an account nobody runs", async () => {
    renderAt(`/manage-users/people/${ama.id}?tab=publishing`)
    expect(await screen.findByRole("link", { name: "Kofi Foods" })).toBeInTheDocument()
    expect(screen.queryByRole("list", { name: "People who run this account" })).not.toBeInTheDocument()
  })
})
