import { z } from "zod"
import { roleInputSchema, permissionIdsSchema } from "../validation"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { superAdminApi } from "@/api/client"
import { renderWithProviders } from "@/test/test-utils"
import { permissionFixtures, profileFixture, roleFixtures } from "@/test/rbac-fixtures"
import { RolesTable } from "./RolesTable"

let roles: typeof roleFixtures
let profile: typeof profileFixture
const apiError = (status: number) => ({ isAxiosError: true, response: { status } })

async function openAction(action: string) {
  const user = userEvent.setup()
  renderWithProviders(<RolesTable />)
  await user.click(await screen.findByRole("button", { name: "Open actions for AUDITOR" }))
  await user.click(screen.getByRole("menuitem", { name: action }))
  return { user, dialog: within(screen.getByRole("dialog")) }
}

describe("RolesTable API integration", () => {
  beforeEach(() => {
    roles = structuredClone(roleFixtures)
    profile = structuredClone(profileFixture)
    vi.spyOn(superAdminApi, "get").mockImplementation(async (url) => {
      if (url === "/roles") return { data: structuredClone(roles) }
      if (url === "/permissions") return { data: permissionFixtures }
      if (url === "/auth/me") return { data: profile }
      throw new Error(`Unexpected URL: ${url}`)
    })
  })

  it("loads backend roles, exposes search and protects system records", async () => {
    const user = userEvent.setup()
    renderWithProviders(<RolesTable />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading roles")
    expect(await screen.findByText("SUPER_ADMIN")).toBeInTheDocument()
    expect(screen.getByText("All permissions")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Open actions for SUPER_ADMIN" })).not.toBeInTheDocument()
    await user.type(screen.getByRole("textbox", { name: "Search roles by name or description" }), "read-only")
    expect(screen.getByText("AUDITOR")).toBeInTheDocument()
    expect(screen.queryByText("SUPER_ADMIN")).not.toBeInTheDocument()
    await user.type(screen.getByRole("textbox"), "missing")
    expect(screen.getByText("No roles found")).toBeInTheDocument()
  })

  it("retries failed list requests without showing mock data", async () => {
    vi.mocked(superAdminApi.get).mockRejectedValueOnce(new Error("Offline"))
    const user = userEvent.setup()
    renderWithProviders(<RolesTable />)
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load roles")
    expect(screen.queryByText("No roles found")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Retry roles" }))
    expect(await screen.findByText("AUDITOR")).toBeInTheDocument()
  })

  it("shows access denied for a forbidden roles list", async () => {
    vi.mocked(superAdminApi.get).mockRejectedValueOnce(apiError(403))
    renderWithProviders(<RolesTable />)
    expect(await screen.findByRole("alert")).toHaveTextContent("don't have permission")
  })

  it("disables writes for a read-only account", async () => {
    profile.permissions = ["roles.read"]
    renderWithProviders(<RolesTable />)
    await screen.findByText("AUDITOR")
    expect(screen.getByRole("button", { name: "Add Role" })).toBeDisabled()
    expect(screen.queryByRole("button", { name: "Open actions for AUDITOR" })).not.toBeInTheDocument()
  })

  it("creates a role, then separately saves permissions by ID", async () => {
    const post = vi.spyOn(superAdminApi, "post").mockImplementation(async (_url, input) => {
      const role = { ...roles[1], ...roleInputSchema.parse(input), id: "20000000-0000-4000-8000-000000000003", permissions: [] }
      roles.push(role)
      return { data: role }
    })
    const put = vi.spyOn(superAdminApi, "put").mockImplementation(async (_url, input) => {
      const role = roles[2]
      role.permissions = permissionFixtures.filter((permission) => z.object({ permissionIds: permissionIdsSchema }).parse(input).permissionIds.includes(permission.id)).map((permission) => ({ permission }))
      return { data: role }
    })
    const user = userEvent.setup()
    renderWithProviders(<RolesTable />)
    await waitFor(() => expect(screen.getByRole("button", { name: "Add Role" })).toBeEnabled())
    await user.click(screen.getByRole("button", { name: "Add Role" }))
    let dialog = within(screen.getByRole("dialog"))
    await user.type(dialog.getByLabelText("Role Name"), "support_lead")
    await user.click(dialog.getByRole("button", { name: "Add role" }))
    dialog = within(await screen.findByRole("dialog", { name: "Edit permissions" }))
    await user.click(await dialog.findByRole("button", { name: "admins.read" }))
    await user.click(dialog.getByRole("button", { name: "Save permissions" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(post).toHaveBeenCalledExactlyOnceWith("/roles", { name: "SUPPORT_LEAD", description: "" })
    expect(put).toHaveBeenCalledExactlyOnceWith(`/roles/${roles[2].id}/permissions`, { permissionIds: [permissionFixtures[1].id] })
    expect(within(screen.getByText("SUPPORT_LEAD").closest("tr")!).getByText("admins.read")).toBeInTheDocument()
  })

  it("retains input after a duplicate-name error", async () => {
    vi.spyOn(superAdminApi, "post").mockRejectedValue(apiError(409))
    const user = userEvent.setup()
    renderWithProviders(<RolesTable />)
    await waitFor(() => expect(screen.getByRole("button", { name: "Add Role" })).toBeEnabled())
    await user.click(screen.getByRole("button", { name: "Add Role" }))
    const dialog = within(screen.getByRole("dialog"))
    await user.type(dialog.getByLabelText("Role Name"), "AUDITOR")
    await user.click(dialog.getByRole("button", { name: "Add role" }))
    expect(await dialog.findByRole("alert")).toHaveTextContent("already exists")
    expect(dialog.getByLabelText("Role Name")).toHaveValue("AUDITOR")
  })

  it("validates the role name before sending it", async () => {
    const post = vi.spyOn(superAdminApi, "post")
    const user = userEvent.setup()
    renderWithProviders(<RolesTable />)
    await waitFor(() => expect(screen.getByRole("button", { name: "Add Role" })).toBeEnabled())
    await user.click(screen.getByRole("button", { name: "Add Role" }))
    const dialog = within(screen.getByRole("dialog"))
    await user.type(dialog.getByLabelText("Role Name"), "Support Lead")
    await user.click(dialog.getByRole("button", { name: "Add role" }))
    expect(dialog.getByRole("alert")).toHaveTextContent("uppercase letters")
    expect(post).not.toHaveBeenCalled()
  })

  it("edits metadata without replacing permissions", async () => {
    const patch = vi.spyOn(superAdminApi, "patch").mockImplementation(async (_url, input) => {
      roles[1] = { ...roles[1], ...roleInputSchema.parse(input) }
      return { data: roles[1] }
    })
    const put = vi.spyOn(superAdminApi, "put")
    const { user, dialog } = await openAction("Edit role")
    await user.clear(dialog.getByLabelText("Role Name"))
    await user.type(dialog.getByLabelText("Role Name"), "REVIEWER")
    await user.click(dialog.getByRole("button", { name: "Save changes" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(await screen.findByText("REVIEWER")).toBeInTheDocument()
    expect(patch).toHaveBeenCalledWith(`/roles/${roles[1].id}`, { name: "REVIEWER", description: "Read-only access" })
    expect(put).not.toHaveBeenCalled()
  })

  it("keeps the selected set after failure, then allows clearing all permissions", async () => {
    const put = vi.spyOn(superAdminApi, "put").mockRejectedValueOnce(apiError(403)).mockImplementationOnce(async () => {
      roles[1].permissions = []
      return { data: roles[1] }
    })
    const { user, dialog } = await openAction("Edit permissions")
    await user.click(await dialog.findByRole("button", { name: "Remove admins.read" }))
    await user.click(dialog.getByRole("button", { name: "Save permissions" }))
    expect(await dialog.findByRole("alert")).toHaveTextContent("don't have permission")
    expect(dialog.queryByRole("button", { name: "Remove admins.read" })).not.toBeInTheDocument()
    await user.click(dialog.getByRole("button", { name: "Save permissions" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(put).toHaveBeenLastCalledWith(`/roles/${roles[1].id}/permissions`, { permissionIds: [] })
    expect(screen.getByText("No permissions")).toBeInTheDocument()
  })

  it("blocks permission saves until a failed catalog has been retried", async () => {
    vi.mocked(superAdminApi.get).mockImplementation(async (url) => {
      if (url === "/permissions") throw new Error("Offline")
      return { data: url === "/roles" ? roles : profile }
    })
    const { user, dialog } = await openAction("Edit permissions")
    expect(await dialog.findByRole("alert")).toHaveTextContent("Could not load permissions")
    expect(dialog.getByRole("button", { name: "Save permissions" })).toBeDisabled()
    vi.mocked(superAdminApi.get).mockResolvedValueOnce({ data: permissionFixtures })
    await user.click(dialog.getByRole("button", { name: "Retry permissions" }))
    await waitFor(() => expect(dialog.getByRole("button", { name: "Save permissions" })).toBeEnabled())
  })

  it("prevents duplicate requests and dismissal during a permission save", async () => {
    let resolveSave!: (value: { data: typeof roleFixtures[number] }) => void
    const put = vi.spyOn(superAdminApi, "put").mockImplementation(() => new Promise((resolve) => { resolveSave = resolve }))
    const { user, dialog } = await openAction("Edit permissions")
    await waitFor(() => expect(dialog.getByRole("button", { name: "Save permissions" })).toBeEnabled())
    await user.dblClick(dialog.getByRole("button", { name: "Save permissions" }))
    expect(put).toHaveBeenCalledTimes(1)
    expect(dialog.getByRole("button", { name: "Saving…" })).toBeDisabled()
    await user.click(dialog.getByRole("button", { name: "Close dialog" }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    resolveSave({ data: roles[1] })
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it("retains a role when deletion fails, and removes it only after a successful retry", async () => {
    const remove = vi.spyOn(superAdminApi, "delete").mockRejectedValueOnce(new Error("Offline")).mockImplementationOnce(async () => {
      roles = roles.slice(0, 1)
      return { data: { message: "Role deleted" } }
    })
    const { user, dialog } = await openAction("Delete role")
    expect(remove).not.toHaveBeenCalled()
    await user.click(dialog.getByRole("button", { name: "Remove role" }))
    expect(await dialog.findByRole("alert")).toHaveTextContent("Could not remove")
    expect(roles).toHaveLength(2)
    await user.click(dialog.getByRole("button", { name: "Remove role" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.queryByText("AUDITOR")).not.toBeInTheDocument()
  })
})
