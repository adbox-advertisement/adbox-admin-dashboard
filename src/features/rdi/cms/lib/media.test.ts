import { describe, expect, it } from "vitest"
import { emptyDraft } from "./document"
import { assertLibrarySpace, assetValue, imageSource } from "./media"
import type { CmsAsset } from "../types"

const uploadedAsset: CmsAsset = { id: "up-1", name: "Photo", src: "data:image/png;base64,aGVsbG8=", alt: "", category: "Uploads", addedAt: "2026-01-01T00:00:00.000Z" }
const originalAsset: CmsAsset = { id: "orig-1", name: "Original", src: "/rdi-assets/original.jpg", alt: "", category: "Brand" }

describe("imageSource", () => {
  it("resolves an asset: reference to the matching asset's src", () => {
    expect(imageSource(`asset:${uploadedAsset.id}`, [uploadedAsset])).toBe(uploadedAsset.src)
  })

  it("returns an empty string when the referenced asset is missing", () => {
    expect(imageSource("asset:does-not-exist", [uploadedAsset])).toBe("")
  })

  it("passes through a plain path unchanged", () => {
    expect(imageSource("/rdi-assets/original.jpg", [])).toBe("/rdi-assets/original.jpg")
  })
})

describe("assetValue", () => {
  it("returns an asset: reference for an uploaded asset (has addedAt)", () => {
    expect(assetValue(uploadedAsset)).toBe(`asset:${uploadedAsset.id}`)
  })

  it("returns the raw src for a bundled original asset (no addedAt)", () => {
    expect(assetValue(originalAsset)).toBe(originalAsset.src)
  })
})

describe("assertLibrarySpace", () => {
  it("allows adding images under the 50-image limit", () => {
    const draft = { ...emptyDraft(), assets: Array.from({ length: 10 }, (_, index) => ({ ...uploadedAsset, id: `a${index}` })) }
    expect(() => assertLibrarySpace(draft, [uploadedAsset])).not.toThrow()
  })

  it("throws when adding images would exceed the 50-image limit", () => {
    const draft = { ...emptyDraft(), assets: Array.from({ length: 50 }, (_, index) => ({ ...uploadedAsset, id: `a${index}` })) }
    expect(() => assertLibrarySpace(draft, [uploadedAsset])).toThrow(/library is full/)
  })

  it("throws when the combined draft size would exceed the 4 MB budget", () => {
    const draft = emptyDraft()
    const huge: CmsAsset = { ...uploadedAsset, src: `data:image/png;base64,${"a".repeat(3 * 1024 * 1024)}` }
    expect(() => assertLibrarySpace(draft, [huge])).toThrow(/library is full/)
  })
})
