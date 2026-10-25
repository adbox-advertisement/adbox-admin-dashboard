import { describe, expect, it } from "vitest"
import { honourCandidateSchema } from "../validation"
import { honourCandidateFixture } from "@/test/users-fixtures"
import { describeCheck, unmetRules } from "./honours"

describe("Honour review helpers", () => {
  it("names every rule a nominee misses", () => {
    expect(unmetRules(honourCandidateSchema.parse(honourCandidateFixture(true)))).toEqual([])
    expect(unmetRules(honourCandidateSchema.parse(honourCandidateFixture(false)))).toEqual(["Real contribution", "Nominations"])
  })

  it("counts a full campus cap as unmet", () => {
    const candidate = honourCandidateSchema.parse({ ...honourCandidateFixture(true), campusCap: { limit: 1, granted: 1, activePeople: 90 } })
    expect(unmetRules(candidate)).toEqual(["Campus cap"])
  })

  it("puts check figures into words", () => {
    expect(describeCheck({ posts: 12, eventsOrganised: 1 })).toBe("12 posts · 1 events organised")
    expect(describeCheck(undefined)).toBeNull()
  })
})
