import { describe, expect, it } from "vitest"
import { DEFAULT_DISCOVER_POLICY } from "../data/backend-defaults"
import { adPlaces, pacedViews, viewsForBars } from "./ads"
import { evenSpreadDecay, exploreTiles, mutualsValue, trendScore } from "./discover"
import { drawWeight, floorAgeHours, SHUFFLE } from "./shuffle"

describe("the shuffle's draw weight", () => {
  it("halves every day, never falls below the floor, and doubles for Spotlight", () => {
    expect(drawWeight(0)).toBe(1)
    expect(drawWeight(24)).toBeCloseTo(0.5)
    expect(drawWeight(48, { spotlight: true })).toBeCloseTo(drawWeight(24))
    expect(drawWeight(24 * 30)).toBe(SHUFFLE.weightFloor)
  })

  it("reaches the floor at about five days", () => {
    expect(floorAgeHours()).toBeCloseTo(121.4, 1)
  })
})

describe("ad delivery", () => {
  it("turns a budget into views at the price per 1,000", () => {
    expect(viewsForBars(1500, 1250)).toBe(1200)
    expect(viewsForBars(1500, 0)).toBe(0)
  })

  it("paces a day evenly with a 10% head start, never past the day's views", () => {
    expect(pacedViews(1200, 0)).toBe(120)
    expect(pacedViews(1200, 0.25)).toBe(420)
    expect(pacedViews(1200, 1)).toBe(1200)
  })

  it("places the app's ads at the 4th post, then after every 8 more, only where posts surround them", () => {
    expect(adPlaces(3, 20)).toEqual([4, 13, 22])
    expect(adPlaces(3, 11)).toEqual([4, 13])
    // Ten posts and one ad make 11 items: a second ad at place 13 would have nothing around it.
    expect(adPlaces(3, 10)).toEqual([4])
    expect(adPlaces(3, 2)).toEqual([3])
  })
})

describe("Discover", () => {
  it("spreads a window's activity over its decay", () => {
    expect(evenSpreadDecay({ recentWindowHours: 1, halfLifeHours: 6 })).toBe(1)
    expect(evenSpreadDecay({ recentWindowHours: 24, halfLifeHours: 6 })).toBeCloseTo(0.358, 3)
  })

  it("scores a trend and checks the scope's thresholds", () => {
    const result = trendScore({ kind: "HASHTAG", level: "CAMPUS", actors: { post: 12, like: 30, comment: 8, share: 4 }, ordinaryShare: 0.4, participants: 36, negative: 2, impressions: 900 }, DEFAULT_DISCOVER_POLICY)
    // 12×5 + 30×1 + 8×3 + 4×5 = 134 weighted.
    expect(result.raw).toBe(134)
    expect(result.momentum).toBeCloseTo((134 * evenSpreadDecay(DEFAULT_DISCOVER_POLICY.score) + 10) / (134 * 0.4 + 10), 6)
    expect(result.breadth).toBeCloseTo(Math.log(37))
    expect(result.eligible).toBe(true)
    expect(result.direction).toBe("UP")
    expect(result.changePct).toBe(150)
  })

  it("leaves out a subject without enough people for the list", () => {
    const result = trendScore({ kind: "INSTITUTION", level: "GLOBAL", actors: { like: 40 }, ordinaryShare: 1, participants: 12, negative: 0, impressions: 100 }, DEFAULT_DISCOVER_POLICY)
    expect(result.minimum).toBe(20)
    expect(result.enoughPeople).toBe(false)
    expect(result.eligible).toBe(false)
    expect(result.direction).toBe("STEADY")
  })

  it("counts ten mutual follows as full", () => {
    expect(mutualsValue(0)).toBe(0)
    expect(mutualsValue(10)).toBeCloseTo(1)
    expect(mutualsValue(50)).toBe(1)
  })

  it("lays out Explore with the first survey on its tile, then one after every few posts", () => {
    const tiles = exploreTiles(12, 3, { surveyFirst: 3, surveyEvery: 6 })
    expect(tiles.map((tile, index) => (tile === "survey" ? index + 1 : null)).filter(Boolean)).toEqual([3, 10])
    expect(exploreTiles(5, 0, { surveyFirst: 3, surveyEvery: 6 })).not.toContain("survey")
  })
})
