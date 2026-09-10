import { beforeEach, describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { seedAdmins } from "../data/admins"
import { seedRoles } from "../data/roles"
import { useAdminsStore } from "../store/admins-store"
import { useRolesStore } from "../store/roles-store"
import { ManageAdminsPage } from "./ManageAdminsPage"

describe("ManageAdminsPage", () => {
  beforeEach(() => {
    useAdminsStore.setState({ admins: [...seedAdmins] })
    useRolesStore.setState({ roles: [...seedRoles] })
  })

  it("shows the Admin tab with the admins table by default", () => {
    render(<ManageAdminsPage />)
    expect(screen.getByRole("tab", { name: "Admin" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("button", { name: "Add Admin" })).toBeInTheDocument()
  })

  it("switches to the Manage Roles and permissions tab and shows the roles table", async () => {
    const user = userEvent.setup()
    render(<ManageAdminsPage />)
    await user.click(screen.getByRole("tab", { name: "Manage Roles and permissions" }))
    expect(screen.getByRole("button", { name: "Add Role" })).toBeInTheDocument()
    expect(screen.getByText("Super Admin")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Add Admin" })).not.toBeInTheDocument()
  })
})
