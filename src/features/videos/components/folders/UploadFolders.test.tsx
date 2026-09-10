import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useUploadFolderStore } from "../../store/folder-store"
import { UploadFolders } from "./UploadFolders"

function resetStore() {
  window.localStorage.clear()
  useUploadFolderStore.setState({ folders: [], selectedBySchool: {}, selectionError: "" })
}

function renderFolders(overrides: Partial<Parameters<typeof UploadFolders>[0]> = {}) {
  const onSelect = vi.fn()
  render(
    <UploadFolders
      schoolId="ug"
      selectedId="general"
      selectionCounts={{}}
      onSelect={onSelect}
      {...overrides}
    />,
  )
  return { onSelect }
}

describe("UploadFolders", () => {
  beforeEach(() => {
    resetStore()
  })

  function folderList() {
    return within(screen.getByRole("group", { name: "Upload folders" }))
  }

  it("always shows the General folder with no rename button", () => {
    renderFolders()
    expect(folderList().getByText("General")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Rename General" })).not.toBeInTheDocument()
  })

  it("creates a folder through the New folder dialog and selects it", async () => {
    const user = userEvent.setup()
    const { onSelect } = renderFolders()
    await user.click(screen.getByRole("button", { name: "New folder" }))
    await user.type(screen.getByLabelText("Folder name"), "Orientation week")
    await user.click(screen.getByRole("button", { name: "Create folder" }))
    expect(onSelect).toHaveBeenCalledWith(expect.any(String))
    expect(screen.getByText("Orientation week")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Rename Orientation week" })).toBeInTheDocument()
  })

  it("blocks creating a folder named 'General'", async () => {
    const user = userEvent.setup()
    renderFolders()
    await user.click(screen.getByRole("button", { name: "New folder" }))
    await user.type(screen.getByLabelText("Folder name"), "General")
    await user.click(screen.getByRole("button", { name: "Create folder" }))
    expect(await screen.findByRole("alert")).toHaveTextContent(/already exists/)
  })

  it("renames a folder through its rename dialog", async () => {
    const user = userEvent.setup()
    useUploadFolderStore.getState().createFolder("ug", "Orientation week")
    renderFolders()
    await user.click(screen.getByRole("button", { name: "Rename Orientation week" }))
    const nameField = screen.getByLabelText("Folder name")
    await user.clear(nameField)
    await user.type(nameField, "Freshers Week")
    await user.click(screen.getByRole("button", { name: "Save changes" }))
    expect(screen.getByText("Freshers Week")).toBeInTheDocument()
    expect(screen.queryByText("Orientation week")).not.toBeInTheDocument()
  })

  it("blocks renaming a folder to the reserved name 'General'", async () => {
    const user = userEvent.setup()
    useUploadFolderStore.getState().createFolder("ug", "Orientation week")
    renderFolders()
    await user.click(screen.getByRole("button", { name: "Rename Orientation week" }))
    const nameField = screen.getByLabelText("Folder name")
    await user.clear(nameField)
    await user.type(nameField, "General")
    await user.click(screen.getByRole("button", { name: "Save changes" }))
    expect(await screen.findByRole("alert")).toHaveTextContent(/already exists/)
    expect(screen.getByText("Orientation week")).toBeInTheDocument()
  })

  it("filters the folder list by search", async () => {
    const user = userEvent.setup()
    useUploadFolderStore.getState().createFolder("ug", "Orientation week")
    useUploadFolderStore.getState().createFolder("ug", "Graduation")
    renderFolders()
    await user.type(screen.getByRole("textbox", { name: "Search folders" }), "grad")
    expect(screen.getByText("Graduation")).toBeInTheDocument()
    expect(screen.queryByText("Orientation week")).not.toBeInTheDocument()
  })

  it("only lists folders that belong to the current school", () => {
    useUploadFolderStore.getState().createFolder("ug", "UG only folder")
    useUploadFolderStore.getState().createFolder("knust", "KNUST only folder")
    renderFolders({ schoolId: "ug" })
    expect(screen.getByText("UG only folder")).toBeInTheDocument()
    expect(screen.queryByText("KNUST only folder")).not.toBeInTheDocument()
  })

  it("shows the selection summary for the selected folder", () => {
    const created = useUploadFolderStore.getState().createFolder("ug", "Orientation week")
    renderFolders({ selectedId: created.folder!.id, selectionCounts: { [created.folder!.id]: { videos: 1, photos: 2, text: 0 } } })
    expect(folderList().getByText("1 video · 2 photos selected")).toBeInTheDocument()
    expect(screen.getByText("No files selected")).toBeInTheDocument() // General's own summary
  })
})
