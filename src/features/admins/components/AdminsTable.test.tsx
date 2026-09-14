import { z } from "zod"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { superAdminApi } from "@/api/client"
import { renderWithProviders } from "@/test/test-utils"
import { adminFixtures, permissionFixtures, profileFixture, roleFixtures } from "@/test/rbac-fixtures"
import { createAdminSchema, permissionIdsSchema, roleIdsSchema, updateAdminSchema } from "../validation"
import { AdminsTable } from "./AdminsTable"

let admins: typeof adminFixtures
let profile: typeof profileFixture
const apiError = (status: number) => ({ isAxiosError: true, response: { status } })

async function openAction(action: string, name = "Kaiya Reyes") {
  const user = userEvent.setup()
  renderWithProviders(<AdminsTable />)
  await user.click(await screen.findByRole("button", { name: `Open actions for ${name}` }))
  await user.click(screen.getByRole("menuitem", { name: action }))
  const dialogName = action === "Deactivate" ? `Deactivate ${name}?` : action === "Reactivate" ? `Reactivate ${name}?` : action
  return { user, dialog: within(await screen.findByRole("dialog", { name: dialogName })) }
}

async function openCreate() {
  const user = userEvent.setup()
  renderWithProviders(<AdminsTable />)
  await waitFor(() => expect(screen.getByRole("button", { name: "Add Admin" })).toBeEnabled())
  await user.click(screen.getByRole("button", { name: "Add Admin" }))
  return { user, dialog: within(screen.getByRole("dialog")) }
}

describe("Admin account integration", () => {
  beforeEach(() => {
    admins = structuredClone(adminFixtures)
    profile = structuredClone(profileFixture)
    vi.spyOn(superAdminApi, "get").mockImplementation(async (url) => {
      if (url === "/admins") return { data: structuredClone(admins) }
      if (url === "/roles") return { data: roleFixtures }
      if (url === "/permissions") return { data: permissionFixtures }
      if (url === "/auth/me") return { data: profile }
      if (url?.startsWith("/admins/")) return { data: structuredClone(admins.find((admin) => admin.id === url.split("/")[2])) }
      throw new Error(`Unexpected URL: ${url}`)
    })
  })

  it("loads live accounts, handles missing names and filters by real role IDs", async () => {
    const user = userEvent.setup()
    renderWithProviders(<AdminsTable />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading admins")
    await screen.findByText("Adison Cole")
    const legacyRow = screen.getAllByText("legacy@example.com")[0].closest("tr")!
    expect(within(legacyRow).getByText("Inactive")).toBeInTheDocument()
    expect(within(legacyRow).getByText("No roles assigned")).toBeInTheDocument()
    await user.type(screen.getByRole("textbox", { name: "Search admins by name or email" }), "kaiya@example")
    expect(screen.getByText("Kaiya Reyes")).toBeInTheDocument()
    expect(screen.queryByText("Adison Cole")).not.toBeInTheDocument()
    await user.clear(screen.getByRole("textbox"))
    await user.click(screen.getByRole("combobox", { name: "Filter by role" }))
    await user.click(screen.getByRole("option", { name: "AUDITOR" }))
    expect(screen.getByText("Kaiya Reyes")).toBeInTheDocument()
    expect(screen.queryByText("Adison Cole")).not.toBeInTheDocument()
  })

  it("retries a failed list and never falls back to demo accounts", async () => {
    vi.mocked(superAdminApi.get).mockRejectedValueOnce(new Error("Offline"))
    const user = userEvent.setup()
    renderWithProviders(<AdminsTable />)
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load admins")
    expect(screen.queryByText("Adison Cole")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Retry admins" }))
    expect(await screen.findByText("Adison Cole")).toBeInTheDocument()
  })

  it("disables writes for read-only accounts", async () => {
    profile.permissions = ["admins.read", "roles.read"]
    renderWithProviders(<AdminsTable />)
    await screen.findByText("Kaiya Reyes")
    expect(screen.getByRole("button", { name: "Add Admin" })).toBeDisabled()
    expect(screen.queryByRole("button", { name: "Open actions for Kaiya Reyes" })).not.toBeInTheDocument()
  })

  it("blocks changing your own roles, direct permissions and active status", async () => {
    const user = userEvent.setup()
    renderWithProviders(<AdminsTable />)
    await user.click(await screen.findByRole("button", { name: "Open actions for Adison Cole" }))
    for (const name of ["Assign roles", "Direct permissions", "Deactivate"]) expect(screen.getByRole("menuitem", { name })).toHaveAttribute("aria-disabled", "true")
    expect(screen.getByRole("menuitem", { name: "Edit profile" })).not.toHaveAttribute("aria-disabled")
  })

  it("creates accounts with multiple roles and only backend-supported fields", async () => {
    const post = vi.spyOn(superAdminApi, "post").mockImplementation(async (_url, input) => {
      const parsed = createAdminSchema.parse(input)
      const admin = { ...adminFixtures[1], ...parsed, id: "30000000-0000-4000-8000-000000000004", firstName: parsed.firstName ?? null, lastName: parsed.lastName ?? null, roles: roleFixtures.filter((role) => parsed.roleIds?.includes(role.id)).map((role) => ({ role })), permissions: [] }
      admins.push(admin)
      return { data: admin }
    })
    const { user, dialog } = await openCreate()
    expect(dialog.queryByLabelText("Telephone")).not.toBeInTheDocument()
    expect(dialog.queryByRole("button", { name: "Upload profile photo" })).not.toBeInTheDocument()
    await user.type(dialog.getByLabelText("First Name"), "Jordan")
    await user.type(dialog.getByLabelText("Last Name"), "Blake")
    await user.type(dialog.getByLabelText("Email"), "jordan@example.com")
    await user.type(dialog.getByLabelText("Password"), "12345")
    await user.click(await dialog.findByRole("checkbox", { name: "SUPER_ADMIN" }))
    await user.click(dialog.getByRole("checkbox", { name: "AUDITOR" }))
    await user.click(dialog.getByRole("button", { name: "Add Admin" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(post).toHaveBeenCalledExactlyOnceWith("/admins", { firstName: "Jordan", lastName: "Blake", email: "jordan@example.com", password: "12345", roleIds: roleFixtures.map((role) => role.id) })
    const row = screen.getByText("Jordan Blake").closest("tr")!
    expect(within(row).getByText("SUPER_ADMIN")).toBeInTheDocument()
    expect(within(row).getByText("AUDITOR")).toBeInTheDocument()
  })

  it("validates password length and retains input on email conflict", async () => {
    const post = vi.spyOn(superAdminApi, "post").mockRejectedValue(apiError(409))
    const { user, dialog } = await openCreate()
    await user.type(dialog.getByLabelText("Email"), "kaiya@example.com")
    await user.type(dialog.getByLabelText("Password"), "1234")
    await user.click(dialog.getByRole("button", { name: "Add Admin" }))
    expect(dialog.getByRole("alert")).toHaveTextContent("at least 5 characters")
    expect(post).not.toHaveBeenCalled()
    await user.type(dialog.getByLabelText("Password"), "5")
    await user.click(dialog.getByRole("button", { name: "Add Admin" }))
    expect(await dialog.findByRole("alert")).toHaveTextContent("email already exists")
    expect(dialog.getByLabelText("Email")).toHaveValue("kaiya@example.com")
  })

  it("edits names without changing email, password or assignments", async () => {
    const patch = vi.spyOn(superAdminApi, "patch").mockImplementation(async (_url, input) => {
      admins[1] = { ...admins[1], ...updateAdminSchema.parse(input) }
      return { data: admins[1] }
    })
    const { user, dialog } = await openAction("Edit profile")
    expect(dialog.getByLabelText("Email")).toHaveAttribute("readonly")
    expect(dialog.queryByLabelText("Password")).not.toBeInTheDocument()
    await user.clear(dialog.getByLabelText("Last Name"))
    await user.type(dialog.getByLabelText("Last Name"), "Renamed")
    await user.click(dialog.getByRole("button", { name: "Save changes" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(patch).toHaveBeenCalledExactlyOnceWith(`/admins/${admins[1].id}`, { firstName: "Kaiya", lastName: "Renamed" })
    expect(screen.getByText("Kaiya Renamed")).toBeInTheDocument()
  })

  it("replaces the complete role set after loading fresh account details", async () => {
    const put = vi.spyOn(superAdminApi, "put").mockImplementation(async (_url, input) => {
      const ids = z.object({ roleIds: roleIdsSchema }).parse(input).roleIds
      admins[1].roles = roleFixtures.filter((role) => ids.includes(role.id)).map((role) => ({ role }))
      return { data: admins[1] }
    })
    const { user, dialog } = await openAction("Assign roles")
    expect(superAdminApi.get).toHaveBeenCalledWith(`/admins/${admins[1].id}`, expect.objectContaining({ signal: expect.any(AbortSignal) }))
    expect(await dialog.findByRole("checkbox", { name: "AUDITOR" })).toBeChecked()
    await user.click(dialog.getByRole("checkbox", { name: "AUDITOR" }))
    await user.click(dialog.getByRole("button", { name: "Save roles" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(put).toHaveBeenCalledExactlyOnceWith(`/admins/${admins[1].id}/roles`, { roleIds: [] })
    expect(within(screen.getByText("Kaiya Reyes").closest("tr")!).getByText("No roles assigned")).toBeInTheDocument()
  })

  it("keeps a failed direct-permission selection and retries without changing roles", async () => {
    const put = vi.spyOn(superAdminApi, "put").mockRejectedValueOnce(apiError(403)).mockImplementationOnce(async (_url, input) => {
      const ids = z.object({ permissionIds: permissionIdsSchema }).parse(input).permissionIds
      admins[1].permissions = permissionFixtures.filter((permission) => ids.includes(permission.id)).map((permission) => ({ permission }))
      return { data: admins[1] }
    })
    const { user, dialog } = await openAction("Direct permissions")
    await user.click(await dialog.findByRole("button", { name: "Remove roles.read" }))
    await user.click(dialog.getByRole("button", { name: "admins.read" }))
    await user.click(dialog.getByRole("button", { name: "Save direct permissions" }))
    expect(await dialog.findByRole("alert")).toHaveTextContent("don't have permission")
    expect(dialog.getByRole("button", { name: "Remove admins.read" })).toBeInTheDocument()
    await user.click(dialog.getByRole("button", { name: "Save direct permissions" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(put).toHaveBeenLastCalledWith(`/admins/${admins[1].id}/permissions`, { permissionIds: [permissionFixtures[1].id] })
    expect(admins[1].roles).toHaveLength(1)
  })

  it("keeps account status after a failed deactivation, then allows retry", async () => {
    const patch = vi.spyOn(superAdminApi, "patch").mockRejectedValueOnce(new Error("Offline")).mockImplementationOnce(async (_url, input) => {
      admins[1] = { ...admins[1], ...updateAdminSchema.parse(input) }
      return { data: admins[1] }
    })
    const { user, dialog } = await openAction("Deactivate")
    expect(patch).not.toHaveBeenCalled()
    await user.click(dialog.getByRole("button", { name: "Deactivate admin" }))
    expect(await dialog.findByRole("alert")).toHaveTextContent("Could not deactivate")
    expect(admins[1].isActive).toBe(true)
    await user.click(dialog.getByRole("button", { name: "Deactivate admin" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(patch).toHaveBeenLastCalledWith(`/admins/${admins[1].id}`, { isActive: false })
    expect(within(screen.getByText("Kaiya Reyes").closest("tr")!).getByText("Inactive")).toBeInTheDocument()
  })

  it("reactivates an inactive account", async () => {
    vi.spyOn(superAdminApi, "patch").mockImplementation(async (_url, input) => {
      admins[2] = { ...admins[2], ...updateAdminSchema.parse(input) }
      return { data: admins[2] }
    })
    const { user, dialog } = await openAction("Reactivate", "legacy@example.com")
    await user.click(dialog.getByRole("button", { name: "Reactivate admin" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(superAdminApi.patch).toHaveBeenCalledWith(`/admins/${admins[2].id}`, { isActive: true })
  })

  it("keeps assignment saves disabled if the permission catalog is unavailable", async () => {
    const original = vi.mocked(superAdminApi.get).getMockImplementation()!
    vi.mocked(superAdminApi.get).mockImplementation((url, config) => url === "/permissions" ? Promise.reject(new Error("Offline")) : original(url, config))
    const { dialog } = await openAction("Direct permissions")
    expect(await dialog.findByRole("alert")).toHaveTextContent("Could not load permissions")
    expect(dialog.getByRole("button", { name: "Save direct permissions" })).toBeDisabled()
  })
})
