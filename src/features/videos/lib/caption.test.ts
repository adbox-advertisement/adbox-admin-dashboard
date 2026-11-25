import { describe, expect, it } from "vitest"
import { captionParts, captionProblems, hashtagProblem, hashtagsIn, suggestHashtag, suggestUsername, withGroupHashtag } from "./caption"

describe("captions as the app reads them", () => {
  it("files a post under its hashtags: lowercase, each once, never numbers alone, at most ten", () => {
    expect(hashtagsIn("Opening night! #LegonHallWeek #legonhallweek #2026 #Pent_Hall")).toEqual(["legonhallweek", "pent_hall"])
    expect(hashtagsIn("a#b no, https://x.com/#frag no, #ok yes")).toEqual(["ok"])
    expect(hashtagsIn(Array.from({ length: 12 }, (_, index) => `#tag${index}`).join(" "))).toHaveLength(10)
  })

  it("adds the group's hashtag at the end, once", () => {
    expect(withGroupHashtag("Day one", "LegonHallWeek")).toBe("Day one\n\n#LegonHallWeek")
    expect(withGroupHashtag("", "LegonHallWeek")).toBe("#LegonHallWeek")
    expect(withGroupHashtag("Day one #legonhallweek", "LegonHallWeek")).toBe("Day one #legonhallweek")
  })

  it("says what stops a post", () => {
    expect(captionProblems("", { needsText: true })).toEqual(["Write something to post."])
    expect(captionProblems("", { needsText: false })).toEqual([])
    expect(captionProblems("x".repeat(5001), { needsText: false })).toEqual(["Keep the caption under 5,000 characters."])
    const tenTags = Array.from({ length: 10 }, (_, index) => `#tag${index}`).join(" ")
    expect(captionProblems(tenTags, { needsText: false })).toEqual([])
    // The group's hashtag would be the eleventh, so it wouldn't count.
    expect(captionProblems(tenTags, { needsText: false, groupHashtag: "LegonHallWeek" })[0]).toMatch(/Remove 1 so #LegonHallWeek counts/)
  })

  it("splits a caption into words and hashtags to draw them", () => {
    expect(captionParts("Hi #Legon and #2026!")).toEqual([
      { text: "Hi ", hashtag: false },
      { text: "#Legon", hashtag: true },
      { text: " and #2026!", hashtag: false },
    ])
  })

  it("suggests a hashtag and a username from a name", () => {
    expect(suggestHashtag("Legon Hall Week 2026")).toBe("LegonHallWeek2026")
    expect(suggestHashtag("Pent hall-week")).toBe("PentHallWeek")
    expect(suggestUsername("Legon Hall Week")).toBe("legon.hallweek")
    expect(suggestUsername("Ẹ̀kọ́")).toBe("eko")
    expect(suggestUsername("  ")).toBe("")
  })

  it("explains a refused hashtag", () => {
    expect(hashtagProblem("#LegonHallWeek")).toBeNull()
    expect(hashtagProblem("a")).toBe("At least 2 characters.")
    expect(hashtagProblem("hall week")).toBe("Only letters, numbers and underscores.")
    expect(hashtagProblem("2026")).toBe("Not only numbers.")
  })
})
