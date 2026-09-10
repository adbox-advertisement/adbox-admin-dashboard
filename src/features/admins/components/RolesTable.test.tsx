import { beforeEach, describe, expect, it } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { seedRoles } from "../data/roles"
import { useRolesStore } from "../store/roles-store"
import { RolesTable } from "./RolesTable"

function resetStore() {
  useRolesStore.setState({ roles: [...seedRoles] })
}

function tableBody() {
  return screen.getAllByRole("row").slice(1) // drop the header row
}

async function fillRoleForm(user: ReturnType<typeof userEvent.setup>, dialog: HTMLElement, name: string, description = "Handles a focused set of tasks.") {
  await user.type(within(dialog).getByLabelText("Role Name", { exact: true }), name)
  await user.type(within(dialog).getByLabelText("Description", { exact: true }), description)
  await user.click(within(dialog).getByRole("button", { name: "get/User" }))
}

describe("RolesTable", () => {
  beforeEach(() => {
    resetStore()
  })

  it("lists every seeded role with its description and joined permissions", () => {
    render(<RolesTable />)
    for (const role of seedRoles) {
      const row = screen.getByText(role.name).closest("tr")!
      expect(within(row).getByText(role.description)).toBeInTheDocument()
      expect(within(row).getByText(role.permissions.join(", "))).toBeInTheDocument()
    }
  })

  it("filters rows by search text (name or description)", async () => {
    const user = userEvent.setup()
    render(<RolesTable />)
    await user.type(screen.getByRole("textbox", { name: "Search user by name/user name" }), "accountant")
    expect(screen.getByText("Accountant")).toBeInTheDocument()
    expect(screen.queryByText("Auditor")).not.toBeInTheDocument()
  })

  it("shows a no-results state for an unmatched search", async () => {
    const user = userEvent.setup()
    render(<RolesTable />)
    await user.type(screen.getByRole("textbox", { name: "Search user by name/user name" }), "no-such-role")
    expect(screen.getByRole("heading", { name: "No roles found" })).toBeInTheDocument()
  })

  it("selects and deselects every visible row via the header checkbox", async () => {
    const user = userEvent.setup()
    render(<RolesTable />)
    const selectAll = screen.getByRole("checkbox", { name: "Select all roles" })
    await user.click(selectAll)
    for (const row of tableBody()) {
      expect(within(row).getByRole("checkbox").getAttribute("data-state")).toBe("checked")
    }
    await user.click(selectAll)
    for (const row of tableBody()) {
      expect(within(row).getByRole("checkbox").getAttribute("data-state")).not.toBe("checked")
    }
  })

  it("adds a new role through the Add Role dialog", async () => {
    const user = userEvent.setup()
    render(<RolesTable />)
    await user.click(screen.getByRole("button", { name: "Add Role" }))
    const dialog = screen.getByRole("dialog")
    await fillRoleForm(user, dialog, "Support Lead")
    await user.click(within(dialog).getByRole("button", { name: "Add role" }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(screen.getByText("Support Lead")).toBeInTheDocument()
  })

  it("requires at least one permission to add a role", async () => {
    const user = userEvent.setup()
    render(<RolesTable />)
    await user.click(screen.getByRole("button", { name: "Add Role" }))
    const dialog = screen.getByRole("dialog")
    await user.type(within(dialog).getByLabelText("Role Name", { exact: true }), "Support Lead")
    await user.type(within(dialog).getByLabelText("Description", { exact: true }), "Handles tickets.")
    await user.click(within(dialog).getByRole("button", { name: "Add role" }))
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(/at least one permission/)
  })

  it("rejects a duplicate role name", async () => {
    const user = userEvent.setup()
    render(<RolesTable />)
    await user.click(screen.getByRole("button", { name: "Add Role" }))
    const dialog = screen.getByRole("dialog")
    await fillRoleForm(user, dialog, "Super Admin")
    await user.click(within(dialog).getByRole("button", { name: "Add role" }))
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(/already exists/)
  })

  it("edits a role through the row menu's Edit role item", async () => {
    const user = userEvent.setup()
    render(<RolesTable />)
    await user.click(screen.getByRole("button", { name: "Open actions for Auditor" }))
    await user.click(screen.getByRole("menuitem", { name: "Edit role" }))
    const dialog = screen.getByRole("dialog")
    const nameField = within(dialog).getByLabelText("Role Name", { exact: true })
    await user.clear(nameField)
    await user.type(nameField, "Reviewer")
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }))
    expect(screen.getByText("Reviewer")).toBeInTheDocument()
    expect(screen.queryByText("Auditor")).not.toBeInTheDocument()
  })

  it("edits a role through the row menu's Edit Permission item, with permissions pre-selected", async () => {
    const user = userEvent.setup()
    render(<RolesTable />)
    await user.click(screen.getByRole("button", { name: "Open actions for Accountant" }))
    await user.click(screen.getByRole("menuitem", { name: "Edit Permission" }))
    const dialog = screen.getByRole("dialog")
    // Accountant's seeded permissions should already appear as chips.
    for (const permission of ["get/User", "get/PushWallet", "getAll/Users"]) {
      expect(within(dialog).getByText(permission)).toBeInTheDocument()
    }
  })

  it("removes a role through the row menu after confirming", async () => {
    const user = userEvent.setup()
    render(<RolesTable />)
    await user.click(screen.getByRole("button", { name: "Open actions for Auditor" }))
    await user.click(screen.getByRole("menuitem", { name: "Delete role" }))
    const dialog = screen.getByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Remove role" }))
    expect(screen.queryByText("Auditor")).not.toBeInTheDocument()
    expect(useRolesStore.getState().roles.some((role) => role.name === "Auditor")).toBe(false)
  })

  it("cancelling remove keeps the role", async () => {
    const user = userEvent.setup()
    render(<RolesTable />)
    await user.click(screen.getByRole("button", { name: "Open actions for Auditor" }))
    await user.click(screen.getByRole("menuitem", { name: "Delete role" }))
    const dialog = screen.getByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }))
    expect(screen.getByText("Auditor")).toBeInTheDocument()
  })
})
