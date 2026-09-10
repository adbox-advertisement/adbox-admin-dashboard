import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { AdboxPostPreview, AdboxTextPostPreview } from "./AdboxPostPreview"
import type { SelectedMediaFile } from "../../types/uploads"

const photo: SelectedMediaFile = {
  id: "1",
  file: new File(["fake-bytes"], "campus.png", { type: "image/png" }),
  url: "blob:mock-url",
  schoolId: "ug",
  folderId: "general",
}

describe("AdboxPostPreview", () => {
  it("renders nothing when there are no files", () => {
    const { container } = render(<AdboxPostPreview files={[]} title="" description="" />)
    expect(container).toBeEmptyDOMElement()
  })

  it("renders the school name, title, and description for a photo post", () => {
    render(<AdboxPostPreview files={[photo]} title="Campus day" description="A great time" />)
    expect(screen.getByText("University of Ghana, Legon")).toBeInTheDocument()
    expect(screen.getByText("Campus day")).toBeInTheDocument()
    expect(screen.getByText("A great time")).toBeInTheDocument()
  })

  it("shows a photo counter only when there is more than one photo", () => {
    const { rerender } = render(<AdboxPostPreview files={[photo]} title="" description="" />)
    expect(screen.queryByText("1/1")).not.toBeInTheDocument()
    const secondPhoto = { ...photo, id: "2" }
    rerender(<AdboxPostPreview files={[photo, secondPhoto]} title="" description="" />)
    expect(screen.getByText("1/2")).toBeInTheDocument()
  })
})

describe("AdboxTextPostPreview", () => {
  it("shows placeholder copy when there is no text yet", () => {
    render(<AdboxTextPostPreview schoolId="ug" text="" reference="" />)
    expect(screen.getByTestId("preview-text")).toHaveTextContent("Your text will appear here…")
    expect(screen.queryByTestId("preview-reference")).not.toBeInTheDocument()
  })

  it("renders the reference as a labeled 'Ref' badge, not a hashtag", () => {
    render(<AdboxTextPostPreview schoolId="ug" text="Big win this week" reference="REF-2049" />)
    const badge = screen.getByTestId("preview-reference")
    expect(badge).toHaveTextContent("Ref")
    expect(badge).toHaveTextContent("REF-2049")
    // The visible text must not read as a hashtag chip (e.g. "#REF-2049").
    expect(badge.textContent).not.toMatch(/#/)
    expect(screen.getByTestId("preview-text")).toHaveTextContent("Big win this week")
  })

  it("still renders inline hashtags typed into the text itself", () => {
    render(<AdboxTextPostPreview schoolId="ug" text="Big win #RoboticsGH" reference="" />)
    expect(screen.getByTestId("preview-text")).toHaveTextContent("Big win #RoboticsGH")
  })
})
