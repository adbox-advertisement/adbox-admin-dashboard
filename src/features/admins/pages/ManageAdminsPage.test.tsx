import { beforeEach, describe, expect, it, vi } from "vitest"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test/test-utils"
import { superAdminApi } from "@/api/client"
import { roleFixtures, profileFixture, adminFixtures } from "@/test/rbac-fixtures"
import { ManageAdminsPage } from "./ManageAdminsPage"

describe("ManageAdminsPage", () => {
  beforeEach(() => {
    vi.spyOn(superAdminApi, "get").mockImplementation(async (url) => ({ data: url === "/roles" ? roleFixtures : url === "/admins" ? adminFixtures : profileFixture }))
  })

  it("shows the Admin tab with the admins table by default", () => {
    renderWithProviders(<ManageAdminsPage />)
    expect(screen.getByRole("tab", { name: "Admin" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("button", { name: "Add Admin" })).toBeInTheDocument()
  })

  it("switches to the Manage Roles and permissions tab and shows the roles table", async () => {
    const user = userEvent.setup()
    renderWithProviders(<ManageAdminsPage />)
    await user.click(screen.getByRole("tab", { name: "Manage Roles and permissions" }))
    expect(screen.getByRole("button", { name: "Add Role" })).toBeInTheDocument()
    expect(await screen.findByText("SUPER_ADMIN")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Add Admin" })).not.toBeInTheDocument()
  })
})
