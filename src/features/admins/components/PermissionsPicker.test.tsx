import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { permissionFixtures } from "@/test/rbac-fixtures"
import { PermissionsPicker } from "./PermissionsPicker"

const options = permissionFixtures.map((permission) => ({ ...permission, description: permission.description ?? "" }))

describe("PermissionsPicker", () => {
  it("offers wildcard access for direct admin assignments when explicitly enabled", async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<PermissionsPicker options={options} id="permissions" value={[]} onChange={onChange} allowWildcard />)
    await user.click(screen.getByRole("button", { name: "All permissions (*)" }))
    expect(onChange).toHaveBeenCalledWith([options[0].id])
  })

  it("shows placeholder text and every available permission when nothing is selected", () => {
    render(<PermissionsPicker options={options} id="permissions" value={[]} onChange={vi.fn()} />)
    expect(screen.getByText("Select permission")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "admins.read" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "roles.read" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "*" })).not.toBeInTheDocument()
  })

  it("adds a permission when its available pill is clicked", async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<PermissionsPicker options={options} id="permissions" value={[]} onChange={onChange} />)
    await user.click(screen.getByRole("button", { name: "admins.read" }))
    expect(onChange).toHaveBeenCalledWith([options[1].id])
  })

  it("shows selected permissions as removable chips and excludes them from the available list", () => {
    render(<PermissionsPicker options={options} id="permissions" value={[options[1].id, options[2].id]} onChange={vi.fn()} />)
    expect(screen.getByText("admins.read")).toBeInTheDocument()
    expect(screen.getByText("roles.read")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "admins.read" })).not.toBeInTheDocument() // no longer offered
  })

  it("removes a permission when its chip's remove control is activated", async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<PermissionsPicker options={options} id="permissions" value={[options[1].id, options[2].id]} onChange={onChange} />)
    await user.click(screen.getByRole("button", { name: "Remove admins.read" }))
    expect(onChange).toHaveBeenCalledWith([options[2].id])
  })

  it("collapses the available-options panel when the trigger is toggled closed", async () => {
    const user = userEvent.setup()
    render(<PermissionsPicker options={options} id="permissions" value={[]} onChange={vi.fn()} />)
    const trigger = screen.getByRole("button", { name: "Select permission" })
    await user.click(trigger)
    expect(screen.queryByRole("button", { name: "admins.read" })).not.toBeInTheDocument()
    await user.click(trigger)
    expect(screen.getByRole("button", { name: "admins.read" })).toBeInTheDocument()
  })
})
