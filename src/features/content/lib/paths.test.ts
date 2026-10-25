import { describe, expect, it } from "vitest"
import { contentPath, legacyTabPath } from "./paths"

describe("User Content paths", () => {
  it("adds only the parameters that are set", () => {
    expect(contentPath("/user-content/posts", { type: "VIDEO", userId: undefined, q: "" })).toBe("/user-content/posts?type=VIDEO")
    expect(contentPath("/user-content/ads")).toBe("/user-content/ads")
  })

  it("sends old ?tab= links to the matching section", () => {
    expect(legacyTabPath("pictures", "u1")).toBe("/user-content/posts?type=IMAGE&userId=u1")
    expect(legacyTabPath("surveys", undefined)).toBe("/user-content/surveys")
    expect(legacyTabPath("unknown", undefined)).toBeNull()
    expect(legacyTabPath(null, undefined)).toBeNull()
  })
})
