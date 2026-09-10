import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SchoolSelection } from "./SchoolSelection"
import { uploadSchools } from "../../data/schools"

describe("SchoolSelection", () => {
  it("lists every configured school, including Ghana International School", () => {
    render(<SchoolSelection onSelect={vi.fn()} />)
    for (const school of uploadSchools) {
      expect(screen.getByRole("button", { name: "Upload for " + school.name })).toBeInTheDocument()
    }
  })

  it("filters schools by name or initials as the user types", async () => {
    const user = userEvent.setup()
    render(<SchoolSelection onSelect={vi.fn()} />)
    await user.type(screen.getByPlaceholderText("Find your school…"), "gis")
    expect(screen.getByRole("button", { name: "Upload for Ghana International School" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Upload for KNUST" })).not.toBeInTheDocument()
  })

  it("shows a no-results state for an unmatched search", async () => {
    const user = userEvent.setup()
    render(<SchoolSelection onSelect={vi.fn()} />)
    await user.type(screen.getByPlaceholderText("Find your school…"), "not-a-real-school")
    expect(screen.getByRole("heading", { name: "No schools found" })).toBeInTheDocument()
  })

  it("calls onSelect with the school id when a card is clicked", async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<SchoolSelection onSelect={onSelect} />)
    await user.click(screen.getByRole("button", { name: "Upload for Ghana International School" }))
    expect(onSelect).toHaveBeenCalledWith("gis")
  })

  it("clears the search when Clear search is clicked", async () => {
    const user = userEvent.setup()
    render(<SchoolSelection onSelect={vi.fn()} />)
    const search = screen.getByPlaceholderText("Find your school…")
    await user.type(search, "not-a-real-school")
    await user.click(screen.getByRole("button", { name: "Clear search" }))
    expect(search).toHaveValue("")
    expect(screen.getByRole("button", { name: "Upload for Ghana International School" })).toBeInTheDocument()
  })
})
