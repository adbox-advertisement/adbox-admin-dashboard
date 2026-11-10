import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { SearchField, StatusFilter } from "./ListParts"

describe("StatusFilter", () => {
  it("shows a count only where there is something to count, and reports the choice", async () => {
    const onChange = vi.fn()
    render(<StatusFilter label="Filter by status" value="open" onChange={onChange}
      options={[{ value: "open", label: "All open", count: 4 }, { value: "NEW", label: "New", count: 0 }, { value: "DECLINED", label: "Declined" }]} />)

    expect(screen.getByRole("radiogroup", { name: "Filter by status" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "All open 4" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("radio", { name: "New" })).toHaveAttribute("aria-checked", "false")
    await userEvent.click(screen.getByRole("radio", { name: "Declined" }))
    expect(onChange).toHaveBeenCalledWith("DECLINED")
  })
})

describe("SearchField", () => {
  it("is labelled and clears with one button", async () => {
    const onChange = vi.fn()
    const { rerender } = render(<SearchField label="Search companies" value="" onChange={onChange} placeholder="Name" />)
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument()
    await userEvent.type(screen.getByRole("searchbox", { name: "Search companies" }), "k")
    expect(onChange).toHaveBeenLastCalledWith("k")

    rerender(<SearchField label="Search companies" value="kofi" onChange={onChange} placeholder="Name" />)
    await userEvent.click(screen.getByRole("button", { name: "Clear search" }))
    expect(onChange).toHaveBeenLastCalledWith("")
  })
})
