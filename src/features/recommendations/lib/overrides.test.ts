import { describe, expect, it } from "vitest"
import type { InstitutionDirectory, TrendOverride } from "../types"
import { actionSummary, draftInput, draftProblems, missedReason, regionSlug, scopeLabel, scopeOptions, subjectNames, type OverrideDraft } from "./overrides"

const NOW = new Date("2026-11-13T12:00:00Z")
const UG = "00000000-0000-4000-8000-000000000101"
const LEGON = "00000000-0000-4000-8000-000000000102"
const TAG = "00000000-0000-4000-8000-000000000001"
const directory: InstitutionDirectory = [{
  id: UG, name: "University of Ghana", shortName: "UG", region: "Greater Accra", isActive: true,
  campuses: [{ id: LEGON, name: "Legon", halls: [{ id: "h-1", name: "Commonwealth Hall", isActive: true }] }],
}]

const override = (extra: Partial<TrendOverride>): TrendOverride => ({
  id: "o", scopeKey: "global", kind: "HASHTAG", subjectId: TAG, action: "PIN", rank: 1, multiplier: null, reason: "Launch",
  startsAt: "2026-11-12T00:00:00Z", endsAt: "2026-11-20T00:00:00Z", endedAt: null, name: null, ...extra,
})

const draft = (extra: Partial<OverrideDraft> = {}): OverrideDraft => ({
  scopeKey: "global", subject: { kind: "HASHTAG", id: TAG }, choice: "PIN", rank: 1, multiplier: 1.5, reason: "Launch week", startsAt: null, days: 7, ...extra,
})

describe("trend override helpers", () => {
  it("names lists as the app does", () => {
    expect(regionSlug(" Greater Accra ")).toBe("greater-accra")
    expect(scopeLabel("global", directory)).toBe("Nationwide")
    expect(scopeLabel("region:greater-accra", directory)).toBe("Greater Accra")
    expect(scopeLabel("region:upper-east", undefined)).toBe("Upper East")
    expect(scopeLabel(`inst:${UG}`, directory)).toBe("UG")
    expect(scopeLabel(`campus:${LEGON}`, directory)).toBe("UG Legon")
    expect(scopeOptions([`campus:${LEGON}`, `inst:${UG}`, "region:greater-accra"], directory).map((option) => option.label)).toEqual(["Nationwide", "Greater Accra", "UG", "UG Legon"])
  })

  it("says what each override does", () => {
    expect(actionSummary({ action: "PIN", rank: 3, multiplier: null })).toBe("Pinned at 3rd")
    expect(actionSummary({ action: "FEATURE", rank: null, multiplier: null })).toBe("Featured at 4th")
    expect(actionSummary({ action: "BOOST", rank: null, multiplier: 2 })).toBe("Boosted ×2")
    expect(actionSummary({ action: "BOOST", rank: null, multiplier: 0.5 })).toBe("Dampened ×0.5")
    expect(actionSummary({ action: "SUPPRESS", rank: null, multiplier: null })).toBe("Suppressed")
  })

  it("explains why a subject just missed", () => {
    expect(missedReason("participants 8 < 10")).toBe("8 people taking part; needs 10")
    expect(missedReason("participants 1 < 3")).toBe("1 person taking part; needs 3")
    expect(missedReason("recent 12.5 < 20")).toBe("recent activity 12.5; needs 20")
  })

  it("catches what the server would refuse, before sending", () => {
    expect(draftProblems(draft(), [], NOW)).toEqual([])
    expect(draftProblems(draft({ subject: null, reason: "x" }), [], NOW)).toEqual(["Choose what to place.", "Say why, in at least 3 characters."])
    expect(draftProblems(draft({ rank: null }), [], NOW)).toContain("Choose the place to pin it at.")
    expect(draftProblems(draft({ choice: "BOOST", multiplier: 1 }), [], NOW)[0]).toMatch(/more than 1/)
    expect(draftProblems(draft({ choice: "DAMPEN", multiplier: 1.2 }), [], NOW)[0]).toMatch(/less than 1/)
    // One override per subject per list at a time, and room for at most 3 pins.
    expect(draftProblems(draft(), [override({ action: "BOOST", rank: null, multiplier: 2 })], NOW)).toContain("This already has an override in this list for that time. End it first.")
    const pins = [1, 2, 3].map((n) => override({ id: `p${n}`, subjectId: `00000000-0000-4000-8000-00000000099${n}` }))
    expect(draftProblems(draft(), pins, NOW)).toContain("This list already has 3 pins for that time.")
    // Ended overrides, other lists and periods that don't overlap leave room.
    expect(draftProblems(draft(), [override({ endedAt: "2026-11-12T06:00:00Z" }), override({ scopeKey: `inst:${UG}` }), override({ startsAt: "2026-12-01T00:00:00Z", endsAt: "2026-12-05T00:00:00Z" })], NOW)).toEqual([])
  })

  it("sends only what the action takes", () => {
    expect(draftInput(draft({ rank: 2 }), NOW)).toEqual({ scopeKey: "global", kind: "HASHTAG", subjectId: TAG, action: "PIN", rank: 2, reason: "Launch week", endsAt: "2026-11-20T12:00:00.000Z" })
    expect(draftInput(draft({ choice: "DAMPEN", multiplier: 0.5, rank: null }), NOW)).toMatchObject({ action: "BOOST", multiplier: 0.5 })
    expect(draftInput(draft({ choice: "DAMPEN", multiplier: 0.5, rank: null }), NOW)).not.toHaveProperty("rank")
    expect(draftInput(draft({ choice: "FEATURE", rank: null }), NOW)).not.toHaveProperty("rank")
    expect(draftInput(draft({ choice: "SUPPRESS", rank: null, startsAt: new Date("2026-11-14T08:00:00Z"), days: 1 }), NOW))
      .toEqual({ scopeKey: "global", kind: "HASHTAG", subjectId: TAG, action: "SUPPRESS", reason: "Launch week", startsAt: "2026-11-14T08:00:00.000Z", endsAt: "2026-11-15T08:00:00.000Z" })
  })

  it("names subjects from every source the page has", () => {
    const names = subjectNames({ directory, events: [{ id: "e-1", title: "Food fair" }], extra: [{ kind: "PERSON", id: "u-1", name: "Ama Owusu" }] })
    expect(names.get(`INSTITUTION:${UG}`)).toBe("UG")
    expect(names.get(`CAMPUS:${LEGON}`)).toBe("UG Legon")
    expect(names.get("HALL:h-1")).toBe("Commonwealth Hall")
    expect(names.get("EVENT:e-1")).toBe("Food fair")
    expect(names.get("PERSON:u-1")).toBe("Ama Owusu")
  })
})
