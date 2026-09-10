import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AdminAvatarPicker } from "./AdminAvatarPicker"

function getFileInput() {
  return document.querySelector('input[type="file"]') as HTMLInputElement
}

describe("AdminAvatarPicker", () => {
  it("shows a placeholder icon when there is no avatar yet", () => {
    render(<AdminAvatarPicker value="" onChange={vi.fn()} />)
    expect(screen.getByRole("button", { name: "Upload profile photo" })).toBeInTheDocument()
    expect(document.querySelector("img")).not.toBeInTheDocument()
  })

  it("shows the image once a value is provided", () => {
    render(<AdminAvatarPicker value="data:image/png;base64,aGVsbG8=" onChange={vi.fn()} />)
    expect(screen.getByRole("button", { name: "Change profile photo" })).toBeInTheDocument()
    expect(document.querySelector("img")).toBeInTheDocument()
  })

  it("reads a chosen image file and reports it as a data URL", async () => {
    const onChange = vi.fn()
    render(<AdminAvatarPicker value="" onChange={onChange} />)
    const file = new File(["fake-bytes"], "avatar.png", { type: "image/png" })
    const user = userEvent.setup()
    await user.upload(getFileInput(), file)
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1))
    expect(onChange.mock.calls[0][0]).toMatch(/^data:/)
  })

  it("rejects a non-image file with an inline error", async () => {
    // fireEvent bypasses user-event's own accept-attribute filtering, which
    // would otherwise silently drop this file before it reaches the app —
    // the app must validate the file type itself regardless.
    const onChange = vi.fn()
    render(<AdminAvatarPicker value="" onChange={onChange} />)
    const file = new File(["not an image"], "notes.txt", { type: "text/plain" })
    fireEvent.change(getFileInput(), { target: { files: [file] } })
    expect(await screen.findByRole("alert")).toHaveTextContent(/choose an image/i)
    expect(onChange).not.toHaveBeenCalled()
  })

  it("rejects a file larger than 5 MB", async () => {
    const onChange = vi.fn()
    render(<AdminAvatarPicker value="" onChange={onChange} />)
    const file = new File([new Uint8Array(6 * 1024 * 1024)], "huge.png", { type: "image/png" })
    const user = userEvent.setup()
    await user.upload(getFileInput(), file)
    expect(await screen.findByRole("alert")).toHaveTextContent(/smaller than 5 MB/i)
    expect(onChange).not.toHaveBeenCalled()
  })
})
