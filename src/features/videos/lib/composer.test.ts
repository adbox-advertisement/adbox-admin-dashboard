import { describe, expect, it } from "vitest"
import { composerProblems, draftKind, finalCaption, moveItem, publishPercent, type ComposerDraft } from "./composer"
import type { PreparedImage, PreparedVideo } from "./media"

const portrait: PreparedVideo = { file: new File(["v"], "short.mp4", { type: "video/mp4" }), url: "blob:short", width: 1080, height: 1920, duration: 42 }
const landscape: PreparedVideo = { ...portrait, width: 1920, height: 1080 }
const picture: PreparedImage = { id: "1", file: new File(["i"], "a.jpg", { type: "image/jpeg" }), url: "blob:a", width: 800, height: 600 }
const draft = (changes: Partial<ComposerDraft> = {}): ComposerDraft => ({ accountId: "acc-1", type: "TEXT", caption: "Hello", images: [], video: null, groupHashtag: null, ...changes })

describe("the composer's rules", () => {
  it("lists what stops the post, in the order to fix it", () => {
    expect(composerProblems(draft())).toEqual([])
    expect(composerProblems(draft({ accountId: null, caption: "" }))).toEqual(["Choose an account to post as.", "Write something to post."])
    expect(composerProblems(draft({ type: "IMAGE", caption: "" }))).toEqual(["Add at least one picture."])
    expect(composerProblems(draft({ type: "VIDEO" }))).toEqual(["Add a video."])
    expect(composerProblems(draft({ type: "VIDEO", video: portrait, caption: "" }))).toEqual([])
  })

  it("needs words in a text post beyond the group's hashtag", () => {
    expect(composerProblems(draft({ caption: "", groupHashtag: "LegonHallWeek" }))).toEqual(["Write something to post."])
  })

  it("posts the caption with the group's hashtag", () => {
    expect(finalCaption(draft({ groupHashtag: "LegonHallWeek" }))).toBe("Hello\n\n#LegonHallWeek")
    expect(finalCaption(draft())).toBe("Hello")
  })

  it("makes a portrait video of 90 seconds or less a Short", () => {
    expect(draftKind(draft({ type: "VIDEO", video: portrait }))).toBe("SHORT")
    expect(draftKind(draft({ type: "VIDEO", video: { ...portrait, duration: 91 } }))).toBe("VIDEO")
    expect(draftKind(draft({ type: "VIDEO", video: landscape }))).toBe("VIDEO")
    expect(draftKind(draft({ type: "IMAGE", images: [picture] }))).toBe("PICTURES")
    expect(draftKind(draft())).toBe("TEXT")
  })

  it("moves a picture, and leaves the order alone for a move off the end", () => {
    expect(moveItem(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"])
    expect(moveItem(["a", "b", "c"], 0, 1)).toEqual(["b", "a", "c"])
    const items = ["a", "b"]
    expect(moveItem(items, 1, 2)).toBe(items)
    expect(moveItem(items, 0, -1)).toBe(items)
  })

  it("counts progress mostly by bytes uploaded", () => {
    expect(publishPercent({ stage: "creating", sent: 0, total: 0 })).toBe(2)
    expect(publishPercent({ stage: "uploading", sent: 50, total: 100 })).toBe(49)
    expect(publishPercent({ stage: "uploading", sent: 100, total: 100 })).toBe(95)
    expect(publishPercent({ stage: "finishing", sent: 100, total: 100 })).toBe(96)
    expect(publishPercent({ stage: "publishing", sent: 100, total: 100 })).toBe(99)
  })
})
