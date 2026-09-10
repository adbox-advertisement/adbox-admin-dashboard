import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PermissionsPicker } from "./PermissionsPicker"

describe("PermissionsPicker", () => {
  it("shows placeholder text and every available permission when nothing is selected", () => {
    render(<PermissionsPicker id="permissions" value={[]} onChange={vi.fn()} />)
    expect(screen.getByText("Select permission")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "get/User" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "get/PushWallet" })).toBeInTheDocument()
  })

  it("adds a permission when its available pill is clicked", async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<PermissionsPicker id="permissions" value={[]} onChange={onChange} />)
    await user.click(screen.getByRole("button", { name: "get/User" }))
    expect(onChange).toHaveBeenCalledWith(["get/User"])
  })

  it("shows selected permissions as removable chips and excludes them from the available list", () => {
    render(<PermissionsPicker id="permissions" value={["get/User", "assign/Roles"]} onChange={vi.fn()} />)
    expect(screen.getByText("get/User")).toBeInTheDocument()
    expect(screen.getByText("assign/Roles")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "get/PushWallet" })).toBeInTheDocument() // still available
    expect(screen.queryByRole("button", { name: "get/User" })).not.toBeInTheDocument() // no longer offered
  })

  it("removes a permission when its chip's remove control is activated", async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<PermissionsPicker id="permissions" value={["get/User", "assign/Roles"]} onChange={onChange} />)
    await user.click(screen.getByRole("button", { name: "Remove get/User" }))
    expect(onChange).toHaveBeenCalledWith(["assign/Roles"])
  })

  it("collapses the available-options panel when the trigger is toggled closed", async () => {
    const user = userEvent.setup()
    render(<PermissionsPicker id="permissions" value={[]} onChange={vi.fn()} />)
    const trigger = screen.getByRole("button", { name: "Select permission" })
    await user.click(trigger)
    expect(screen.queryByRole("button", { name: "get/User" })).not.toBeInTheDocument()
    await user.click(trigger)
    expect(screen.getByRole("button", { name: "get/User" })).toBeInTheDocument()
  })
})
