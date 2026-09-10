import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MediaUpload } from "./MediaUpload"

function setup() {
  const onCountChange = vi.fn()
  const user = userEvent.setup()
  render(<MediaUpload schoolId="ug" folderId="general" onCountChange={onCountChange} />)
  return { onCountChange, user }
}

describe("MediaUpload tabs", () => {
  it("lists the tabs in the order Photos, Videos, Text", () => {
    setup()
    const tabs = screen.getAllByRole("tab")
    expect(tabs.map((tab) => tab.textContent?.trim())).toEqual(["Photos", "Videos", "Text"])
  })

  it("shows the Photos panel active by default", () => {
    setup()
    expect(screen.getByRole("tab", { name: "Photos" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByText("Select photos to upload")).toBeInTheDocument()
  })

  it("switches to the Videos panel on click", async () => {
    const { user } = setup()
    await user.click(screen.getByRole("tab", { name: "Videos" }))
    expect(screen.getByRole("tab", { name: "Videos" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByText("Select videos to upload")).toBeInTheDocument()
  })

  it("switches to the Text panel and renders its fields", async () => {
    const { user } = setup()
    await user.click(screen.getByRole("tab", { name: "Text" }))
    expect(screen.getByRole("heading", { name: "Create text post" })).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Text" })).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Reference" })).toBeInTheDocument()
  })
})

describe("MediaUpload text tab", () => {
  it("reports a count of 0 while empty and 1 once text is entered", async () => {
    const { user, onCountChange } = setup()
    await user.click(screen.getByRole("tab", { name: "Text" }))
    expect(onCountChange).toHaveBeenCalledWith("text", 0)
    onCountChange.mockClear()
    await user.type(screen.getByRole("textbox", { name: "Text" }), "Hello campus")
    expect(onCountChange).toHaveBeenLastCalledWith("text", 1)
  })

  it("reports a count of 0 again after the text is cleared", async () => {
    const { user, onCountChange } = setup()
    await user.click(screen.getByRole("tab", { name: "Text" }))
    const textbox = screen.getByRole("textbox", { name: "Text" })
    await user.type(textbox, "Hello")
    onCountChange.mockClear()
    await user.clear(textbox)
    expect(onCountChange).toHaveBeenLastCalledWith("text", 0)
  })

  it("inserts a hashtag at the cursor via the Add hashtag button", async () => {
    const { user } = setup()
    await user.click(screen.getByRole("tab", { name: "Text" }))
    const textbox = screen.getByRole("textbox", { name: "Text" })
    await user.type(textbox, "Big win")
    await user.click(screen.getByRole("button", { name: "Add hashtag" }))
    await user.type(textbox, "RoboticsGH")
    expect(textbox).toHaveValue("Big win #RoboticsGH")
  })

  it("keeps the reference field capped at 40 characters", async () => {
    const { user } = setup()
    await user.click(screen.getByRole("tab", { name: "Text" }))
    const reference = screen.getByRole("textbox", { name: "Reference" })
    await user.type(reference, "R".repeat(50))
    expect((reference as HTMLInputElement).value).toHaveLength(40)
  })

  it("clears both fields when Discard is clicked", async () => {
    const { user } = setup()
    await user.click(screen.getByRole("tab", { name: "Text" }))
    const textbox = screen.getByRole("textbox", { name: "Text" })
    const reference = screen.getByRole("textbox", { name: "Reference" })
    await user.type(textbox, "Hello")
    await user.type(reference, "REF-1")
    await user.click(screen.getByRole("button", { name: "Discard" }))
    expect(textbox).toHaveValue("")
    expect(reference).toHaveValue("")
  })
})

describe("MediaUpload photos tab", () => {
  it("switches from the dropzone to the photo composer once a photo is selected", async () => {
    const { user } = setup()
    const file = new File(["fake-bytes"], "campus.png", { type: "image/png" })
    const input = document.querySelector('input[type="file"][aria-label="Select photos"]') as HTMLInputElement
    await user.upload(input, file)
    expect(screen.getByRole("heading", { name: "Create photo post" })).toBeInTheDocument()
    expect(within(screen.getByText("Your photos").closest("section")!).getByText("1/35")).toBeInTheDocument()
  })

  it("rejects a file with an unsupported extension and shows an error", () => {
    setup()
    // A renamed/mis-typed file can still reach the input despite `accept`
    // (e.g. dropped from a file manager), so the app must validate itself.
    // fireEvent bypasses user-event's own accept-attribute filtering, which
    // would otherwise silently drop this file before it reaches the app.
    const file = new File(["fake-bytes"], "notes.txt", { type: "text/plain" })
    const input = document.querySelector('input[type="file"][aria-label="Select photos"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })
    expect(screen.getByRole("alert")).toHaveTextContent(/choose JPG, JPEG, PNG and WebP/i)
  })
})
