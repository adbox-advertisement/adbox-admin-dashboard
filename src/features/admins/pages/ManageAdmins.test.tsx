import { afterEach, describe, expect, it, vi } from "vitest"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Route, Routes } from "react-router-dom"
import { renderWithProviders } from "@/test/test-utils"
import { superAdminApi } from "@/api/client"
import { adminFixtures, permissionFixtures, profileFixture, roleFixtures } from "@/test/rbac-fixtures"
import { AdminsPage } from "./AdminsPage"
import { AdminDetailPage } from "./AdminDetailPage"
import { RolesPage } from "./RolesPage"
import { RoleDetailPage } from "./RoleDetailPage"
import { PermissionsPage } from "./PermissionsPage"

const [adison, kaiya] = adminFixtures
const [superAdminRole, auditor] = roleFixtures
const auditorProfile = { id: kaiya.id, email: kaiya.email, roles: ["AUDITOR"], permissions: ["admins.read", "admins.create", "roles.read", "permissions.read"] }

function mockApi(profile: object = profileFixture) {
  return vi.spyOn(superAdminApi, "get").mockImplementation(async (url) => ({
    data: url === "/auth/me" ? profile : url === "/admins" ? adminFixtures : url === "/roles" ? roleFixtures : url === "/permissions" ? permissionFixtures
      : url.startsWith("/admins/") ? adminFixtures.find((admin) => url.endsWith(admin.id)) : {},
  }))
}

const routes = <Routes>
  <Route path="/manage-admins/admins" element={<AdminsPage />} />
  <Route path="/manage-admins/admins/:adminId" element={<AdminDetailPage />} />
  <Route path="/manage-admins/roles" element={<RolesPage />} />
  <Route path="/manage-admins/roles/:roleId" element={<RoleDetailPage />} />
  <Route path="/manage-admins/permissions" element={<PermissionsPage />} />
</Routes>
const open = (path: string) => renderWithProviders(routes, { initialEntries: [path] })

afterEach(() => vi.restoreAllMocks())

describe("Admins", () => {
  it("lists Super Admins first, with roles and status, and filters by status and search", async () => {
    mockApi()
    const user = userEvent.setup()
    open("/manage-admins/admins")
    const list = await screen.findByRole("list", { name: "Admins" })
    const rows = within(list).getAllByRole("link")
    expect(rows[0]).toHaveAccessibleName("Adison Cole, active")
    expect(rows[0]).toHaveAttribute("href", `/manage-admins/admins/${adison.id}`)
    expect(within(rows[0]).getByText("You")).toBeInTheDocument()
    expect(within(rows[0]).getByText("Super Admin")).toBeInTheDocument()
    expect(screen.getByText(/You're a Super Admin/)).toBeInTheDocument()

    await user.click(screen.getByRole("radio", { name: /^Deactivated/ }))
    expect(within(screen.getByRole("list", { name: "Admins" })).getAllByRole("link").map((row) => row.getAttribute("aria-label"))).toEqual(["legacy@example.com, deactivated"])
    await user.click(screen.getByRole("radio", { name: /^All/ }))
    await user.type(screen.getByRole("searchbox", { name: "Search admins" }), "kaiya")
    expect(within(screen.getByRole("list", { name: "Admins" })).getAllByRole("link")).toHaveLength(1)
  })

  it("lets an admin who isn't a Super Admin add accounts, but never with roles", async () => {
    mockApi(auditorProfile)
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: { ...adminFixtures[2], id: "30000000-0000-4000-8000-000000000009", email: "new@example.com", isActive: true } })
    const user = userEvent.setup()
    open("/manage-admins/admins")
    expect(await screen.findByText(/Only a Super Admin can change roles, permissions or account status/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Add admin" }))
    const dialog = await screen.findByRole("dialog", { name: "Add admin" })
    expect(within(dialog).getByText(/Only a Super Admin can give roles/)).toBeInTheDocument()
    expect(within(dialog).queryByRole("checkbox")).not.toBeInTheDocument()
    await user.type(within(dialog).getByLabelText("Email"), "new@example.com")
    await user.type(within(dialog).getByLabelText("Password"), "secret12")
    await user.click(within(dialog).getByRole("button", { name: "Add admin" }))
    await waitFor(() => expect(post).toHaveBeenCalledWith("/admins", expect.objectContaining({ email: "new@example.com", roleIds: [] })))
  })
})

describe("An admin's page", () => {
  it("shows their roles, extra permissions and what they add up to, with where each comes from", async () => {
    mockApi()
    open(`/manage-admins/admins/${kaiya.id}`)
    expect(await screen.findByRole("heading", { level: 1, name: /Kaiya Reyes/ })).toBeInTheDocument()
    const roles = screen.getByRole("region", { name: "Roles" })
    expect(await within(roles).findByRole("link", { name: /Auditor/ })).toHaveAttribute("href", `/manage-admins/roles/${auditor.id}`)
    expect(within(screen.getByRole("region", { name: "Extra permissions" })).getByText("View roles")).toBeInTheDocument()
    const effective = screen.getByRole("region", { name: "What they can do" })
    expect(within(effective).getByText("View admins")).toBeInTheDocument()
    expect(within(effective).getByText("From Auditor")).toBeInTheDocument()
    expect(within(effective).getByText("Extra permission")).toBeInTheDocument()
  })

  it("lets a Super Admin change someone's roles, warning before making them a Super Admin", async () => {
    mockApi()
    const put = vi.spyOn(superAdminApi, "put").mockResolvedValue({ data: { ...kaiya, roles: [{ role: superAdminRole }, { role: auditor }] } })
    const user = userEvent.setup()
    open(`/manage-admins/admins/${kaiya.id}`)
    await user.click(await screen.findByRole("button", { name: "Change roles" }))
    const dialog = await screen.findByRole("dialog", { name: "Roles for Kaiya Reyes" })
    expect(await within(dialog).findByRole("checkbox", { name: "Auditor" })).toBeChecked()
    await user.click(within(dialog).getByRole("checkbox", { name: "Super Admin" }))
    expect(within(dialog).getByText(/will be able to do everything/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole("button", { name: "Save roles" }))
    await waitFor(() => expect(put).toHaveBeenCalledWith(`/admins/${kaiya.id}/roles`, { roleIds: [auditor.id, superAdminRole.id] }))
    expect(await screen.findByText("Saved Kaiya Reyes's roles.")).toBeInTheDocument()
  })

  it("shows the API's reason when a change is refused", async () => {
    mockApi()
    vi.spyOn(superAdminApi, "put").mockRejectedValue(Object.assign(new Error("Forbidden"), { isAxiosError: true, response: { status: 403, data: { message: "Only a Super Admin can do this" } } }))
    const user = userEvent.setup()
    open(`/manage-admins/admins/${kaiya.id}`)
    await user.click(await screen.findByRole("button", { name: "Change roles" }))
    const dialog = await screen.findByRole("dialog")
    await within(dialog).findByRole("checkbox", { name: "Auditor" })
    await user.click(within(dialog).getByRole("button", { name: "Save roles" }))
    expect(await within(dialog).findByRole("alert")).toHaveTextContent("Only a Super Admin can do this")
  })

  it("locks your own access and everything for admins who aren't Super Admins", async () => {
    mockApi()
    const { unmount } = open(`/manage-admins/admins/${adison.id}`)
    expect(await screen.findByText(/This is your account/)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Change roles" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Deactivate/ })).not.toBeInTheDocument()
    expect(screen.getByText("Everything.")).toBeInTheDocument()
    unmount()

    mockApi(auditorProfile)
    open(`/manage-admins/admins/${adison.id}`)
    expect(await screen.findByText(/Only a Super Admin can change an admin's/)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Edit name" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Deactivate/ })).not.toBeInTheDocument()
  })
})

describe("Roles", () => {
  it("shows each role's purpose, size and members, the built-in role first", async () => {
    mockApi()
    open("/manage-admins/roles")
    const list = await screen.findByRole("list", { name: "Roles" })
    const cards = within(list).getAllByRole("link")
    expect(cards[0]).toHaveAccessibleName("Super Admin")
    expect(within(cards[0]).getByText("Built in")).toBeInTheDocument()
    expect(within(cards[1]).getByText("1 permission")).toBeInTheDocument()
  })

  it("creates a role from a plain name and goes straight to choosing what it allows", async () => {
    mockApi()
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: { id: "20000000-0000-4000-8000-000000000009", name: "SUPPORT_LEAD", description: "Answers tickets", isSystem: false, updatedAt: "2026-11-11T09:00:00.000Z" } })
    const user = userEvent.setup()
    open("/manage-admins/roles")
    await user.click(await screen.findByRole("button", { name: "New role" }))
    const dialog = await screen.findByRole("dialog", { name: "New role" })
    await user.type(within(dialog).getByLabelText("Role name"), "Support lead")
    expect(within(dialog).getByText("SUPPORT_LEAD")).toBeInTheDocument()
    await user.type(within(dialog).getByLabelText(/What it's for/), "Answers tickets")
    await user.click(within(dialog).getByRole("button", { name: "Create role" }))
    await waitFor(() => expect(post).toHaveBeenCalledWith("/roles", { name: "SUPPORT_LEAD", description: "Answers tickets" }))
  })

  it("edits a role's permissions by area, and keeps the built-in role locked", async () => {
    mockApi()
    const put = vi.spyOn(superAdminApi, "put").mockResolvedValue({ data: { ...auditor, permissions: [{ permission: permissionFixtures[1] }, { permission: permissionFixtures[2] }] } })
    const user = userEvent.setup()
    const { unmount } = open(`/manage-admins/roles/${auditor.id}`)
    await user.click(await screen.findByRole("button", { name: "Edit permissions" }))
    const dialog = await screen.findByRole("dialog", { name: "What Auditor allows" })
    expect(await within(dialog).findByRole("checkbox", { name: "View admins" })).toBeChecked()
    expect(within(dialog).queryByRole("checkbox", { name: "Everything" })).not.toBeInTheDocument()
    await user.click(within(dialog).getByRole("checkbox", { name: "View roles" }))
    await user.click(within(dialog).getByRole("button", { name: "Save permissions" }))
    await waitFor(() => expect(put).toHaveBeenCalledWith(`/roles/${auditor.id}/permissions`, { permissionIds: [permissionFixtures[1].id, permissionFixtures[2].id] }))
    unmount()

    open(`/manage-admins/roles/${superAdminRole.id}`)
    expect(await screen.findByText(/It can't be renamed, changed or deleted/)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Edit permissions" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument()
  })
})

describe("Permissions", () => {
  it("lists every permission by area with the roles that include it, and searches", async () => {
    mockApi()
    const user = userEvent.setup()
    open("/manage-admins/permissions")
    const area = await screen.findByRole("region", { name: /Admins and access/ })
    // The fixture's description repeats the label.
    expect(within(area).getAllByText("View admins").length).toBeGreaterThan(0)
    expect(within(area).getByRole("link", { name: "Auditor" })).toHaveAttribute("href", `/manage-admins/roles/${auditor.id}`)
    expect(screen.getByRole("region", { name: "Everything" })).toBeInTheDocument()
    await user.type(screen.getByRole("searchbox", { name: "Search permissions" }), "roles.read")
    await waitFor(() => expect(within(screen.getByRole("region", { name: /Admins and access/ })).queryAllByText("View admins")).toHaveLength(0))
    expect(screen.getAllByText("View roles").length).toBeGreaterThan(0)
  })
})
