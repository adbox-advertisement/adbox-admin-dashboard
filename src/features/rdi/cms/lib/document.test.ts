import { describe, expect, it } from "vitest"
import { cmsCollections } from "../catalog"
import { cmsDraftSchema, emptyDraft, isSafeImage, isSafeLink } from "./document"

describe("isSafeLink", () => {
  it.each([
    ["", true],
    ["/about", true],
    ["#section", true],
    ["https://example.com", true],
    ["  https://example.com  ", true],
    ["mailto:hello@example.com", true],
    ["tel:+233241234567", true],
  ])("accepts %s", (value, expected) => {
    expect(isSafeLink(value)).toBe(expected)
  })

  it.each([
    ["//evil.com", false],
    ["http://example.com", false],
    ["javascript:alert(1)", false],
    ["data:text/html,<script>alert(1)</script>", false],
    ["ftp://example.com", false],
  ])("rejects %s", (value, expected) => {
    expect(isSafeLink(value)).toBe(expected)
  })
})

describe("isSafeImage", () => {
  it("accepts a bundled RDI asset path", () => {
    expect(isSafeImage("/rdi-assets/construction/water-installation.jpg")).toBe(true)
  })

  it("accepts a data: URI for an allowed image type", () => {
    expect(isSafeImage("data:image/png;base64,aGVsbG8=")).toBe(true)
    expect(isSafeImage("data:image/jpeg;base64,aGVsbG8=")).toBe(true)
    expect(isSafeImage("data:image/webp;base64,aGVsbG8=")).toBe(true)
    expect(isSafeImage("data:image/gif;base64,aGVsbG8=")).toBe(true)
  })

  it("rejects a remote URL outside /rdi-assets/", () => {
    expect(isSafeImage("https://evil.example/x.jpg")).toBe(false)
  })

  it("rejects a data: URI for a disallowed type such as SVG", () => {
    expect(isSafeImage("data:image/svg+xml;base64,aGVsbG8=")).toBe(false)
  })

  it("rejects a javascript: URI", () => {
    expect(isSafeImage("javascript:alert(1)")).toBe(false)
  })
})

describe("cmsDraftSchema", () => {
  it("accepts an empty draft", () => {
    expect(cmsDraftSchema.safeParse(emptyDraft()).success).toBe(true)
  })

  it("rejects a draft with the wrong version", () => {
    const draft = { ...emptyDraft(), version: 2 }
    expect(cmsDraftSchema.safeParse(draft).success).toBe(false)
  })

  it("rejects duplicate asset ids", () => {
    const draft = {
      ...emptyDraft(),
      assets: [
        { id: "dup", name: "One", src: "/rdi-assets/a.jpg", alt: "", category: "Brand" },
        { id: "dup", name: "Two", src: "/rdi-assets/b.jpg", alt: "", category: "Brand" },
      ],
    }
    const result = cmsDraftSchema.safeParse(draft)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.join(".") === "assets")).toBe(true)
    }
  })

  it("rejects an asset with an unsafe image source", () => {
    const draft = {
      ...emptyDraft(),
      assets: [{ id: "a", name: "Bad", src: "https://evil.example/x.jpg", alt: "", category: "Brand" }],
    }
    expect(cmsDraftSchema.safeParse(draft).success).toBe(false)
  })

  it("accepts a non-fixed collection override that stays within the template range", () => {
    const faqs = cmsCollections.find((collection) => collection.id === "faqs")!
    const draft = {
      ...emptyDraft(),
      collections: { faqs: [{ id: "faqs-custom-1", template: 0, values: { question: "Q?", answer: "A." } }] },
    }
    expect(faqs.fixed).toBe(false)
    expect(cmsDraftSchema.safeParse(draft).success).toBe(true)
  })

  it("rejects a collection entry whose template index is out of range", () => {
    const draft = {
      ...emptyDraft(),
      collections: { faqs: [{ id: "faqs-custom-1", template: 9999, values: {} }] },
    }
    expect(cmsDraftSchema.safeParse(draft).success).toBe(false)
  })

  it("rejects duplicate entry ids inside the same collection", () => {
    const draft = {
      ...emptyDraft(),
      collections: {
        faqs: [
          { id: "same", template: 0, values: {} },
          { id: "same", template: 0, values: {} },
        ],
      },
    }
    expect(cmsDraftSchema.safeParse(draft).success).toBe(false)
  })

  it("rejects an unknown collection id", () => {
    const draft = { ...emptyDraft(), collections: { "not-a-real-collection": [{ id: "x", template: 0, values: {} }] } }
    expect(cmsDraftSchema.safeParse(draft).success).toBe(false)
  })

  it("accepts a fixed collection override that exactly mirrors the original entry count and order", () => {
    const divisions = cmsCollections.find((collection) => collection.id === "divisions")!
    expect(divisions.fixed).toBe(true)
    const draft = {
      ...emptyDraft(),
      collections: {
        divisions: divisions.entries.map((entry, index) => ({ id: entry.id, template: index, values: {} })),
      },
    }
    expect(cmsDraftSchema.safeParse(draft).success).toBe(true)
  })

  it("rejects a fixed collection override with a different entry count", () => {
    const divisions = cmsCollections.find((collection) => collection.id === "divisions")!
    const draft = {
      ...emptyDraft(),
      collections: {
        divisions: divisions.entries.slice(0, -1).map((entry, index) => ({ id: entry.id, template: index, values: {} })),
      },
    }
    expect(cmsDraftSchema.safeParse(draft).success).toBe(false)
  })
})
