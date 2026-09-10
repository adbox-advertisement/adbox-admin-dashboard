import { beforeEach, describe, expect, it } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { seedAdmins } from "../data/admins"
import { useAdminsStore } from "../store/admins-store"
import { adminDisplayName } from "../types"
import { AdminsTable } from "./AdminsTable"

function resetStore() {
  useAdminsStore.setState({ admins: [...seedAdmins] })
}

function tableBody() {
  return screen.getAllByRole("row").slice(1) // drop the header row
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>, dialog: HTMLElement, overrides: Partial<{ firstName: string; lastName: string; email: string; telephone: string; password: string }> = {}) {
  const values = { firstName: "Jordan", lastName: "Blake", email: "jordan@adbox.com", telephone: "+233 24 000 0099", password: "supersecret", ...overrides }
  await user.type(within(dialog).getByLabelText("First Name", { exact: true }), values.firstName)
  await user.type(within(dialog).getByLabelText("Last Name", { exact: true }), values.lastName)
  await user.type(within(dialog).getByLabelText("Email", { exact: true }), values.email)
  await user.type(within(dialog).getByLabelText("Telephone", { exact: true }), values.telephone)
  await user.type(within(dialog).getByLabelText("Password", { exact: true }), values.password)
}

describe("AdminsTable", () => {
  beforeEach(() => {
    resetStore()
  })

  it("lists every seeded admin with their role and email", () => {
    render(<AdminsTable />)
    for (const admin of seedAdmins) {
      const row = screen.getByText(adminDisplayName(admin)).closest("tr")!
      expect(within(row).getByText(admin.role)).toBeInTheDocument()
      expect(within(row).getByText(admin.email)).toBeInTheDocument()
    }
  })

  it("filters rows by search text (name or email)", async () => {
    const user = userEvent.setup()
    render(<AdminsTable />)
    await user.type(screen.getByRole("textbox", { name: "Search user by name/user name" }), "kaiya")
    expect(screen.getByText("Kaiya Reyes")).toBeInTheDocument()
    expect(screen.queryByText("Adison Cole")).not.toBeInTheDocument()
  })

  it("shows a no-results state for an unmatched search", async () => {
    const user = userEvent.setup()
    render(<AdminsTable />)
    await user.type(screen.getByRole("textbox", { name: "Search user by name/user name" }), "no-such-admin")
    expect(screen.getByRole("heading", { name: "No admins found" })).toBeInTheDocument()
  })

  it("filters rows by role", async () => {
    const user = userEvent.setup()
    render(<AdminsTable />)
    await user.click(screen.getByRole("combobox", { name: "Filter by role" }))
    await user.click(screen.getByRole("option", { name: "Accountant" }))
    expect(screen.getByText("Jaxson Mensah")).toBeInTheDocument()
    expect(screen.queryByText("Adison Cole")).not.toBeInTheDocument()
  })

  it("selects and deselects every visible row via the header checkbox", async () => {
    const user = userEvent.setup()
    render(<AdminsTable />)
    const selectAll = screen.getByRole("checkbox", { name: "Select all admins" })
    await user.click(selectAll)
    for (const row of tableBody()) {
      expect(within(row).getByRole("checkbox").getAttribute("data-state")).toBe("checked")
    }
    await user.click(selectAll)
    for (const row of tableBody()) {
      expect(within(row).getByRole("checkbox").getAttribute("data-state")).not.toBe("checked")
    }
  })

  it("adds a new admin through the Add Admin dialog", async () => {
    const user = userEvent.setup()
    render(<AdminsTable />)
    await user.click(screen.getByRole("button", { name: "Add Admin" }))
    const dialog = screen.getByRole("dialog")
    await fillRequiredFields(user, dialog)
    await user.click(within(dialog).getByRole("button", { name: "Add Admin" }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(screen.getByText("Jordan Blake")).toBeInTheDocument()
    expect(screen.getByText("jordan@adbox.com")).toBeInTheDocument()
  })

  it("requires a password of at least 8 characters to add an admin", async () => {
    const user = userEvent.setup()
    render(<AdminsTable />)
    await user.click(screen.getByRole("button", { name: "Add Admin" }))
    const dialog = screen.getByRole("dialog")
    await fillRequiredFields(user, dialog, { password: "short" })
    await user.click(within(dialog).getByRole("button", { name: "Add Admin" }))
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(/at least 8 characters/)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("shows a validation error and keeps the dialog open for a duplicate email", async () => {
    const user = userEvent.setup()
    render(<AdminsTable />)
    await user.click(screen.getByRole("button", { name: "Add Admin" }))
    const dialog = screen.getByRole("dialog")
    await fillRequiredFields(user, dialog, { email: seedAdmins[0].email })
    await user.click(within(dialog).getByRole("button", { name: "Add Admin" }))
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(/already exists/)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("edits an admin through the row menu, with no password field shown", async () => {
    const user = userEvent.setup()
    render(<AdminsTable />)
    await user.click(screen.getByRole("button", { name: "Open actions for Adison Cole" }))
    await user.click(screen.getByRole("menuitem", { name: "Edit profile" }))
    const dialog = screen.getByRole("dialog")
    expect(within(dialog).queryByLabelText("Password", { exact: true })).not.toBeInTheDocument()
    const firstNameField = within(dialog).getByLabelText("First Name", { exact: true })
    await user.clear(firstNameField)
    await user.type(firstNameField, "Adisonia")
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }))
    expect(screen.getByText("Adisonia Cole")).toBeInTheDocument()
    expect(screen.queryByText("Adison Cole")).not.toBeInTheDocument()
  })

  it("removes an admin through the row menu after confirming", async () => {
    const user = userEvent.setup()
    render(<AdminsTable />)
    await user.click(screen.getByRole("button", { name: "Open actions for Adison Cole" }))
    await user.click(screen.getByRole("menuitem", { name: "Remove" }))
    const dialog = screen.getByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Remove admin" }))
    expect(screen.queryByText("Adison Cole")).not.toBeInTheDocument()
    expect(useAdminsStore.getState().admins.some((admin) => admin.firstName === "Adison")).toBe(false)
  })

  it("cancelling remove keeps the admin", async () => {
    const user = userEvent.setup()
    render(<AdminsTable />)
    await user.click(screen.getByRole("button", { name: "Open actions for Adison Cole" }))
    await user.click(screen.getByRole("menuitem", { name: "Remove" }))
    const dialog = screen.getByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }))
    expect(screen.getByText("Adison Cole")).toBeInTheDocument()
    expect(useAdminsStore.getState().admins.some((admin) => admin.firstName === "Adison")).toBe(true)
  })
})
