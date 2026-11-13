import { describe, expect, it } from "vitest"
import { effectiveDiscover, effectiveFeed } from "../hooks"
import { boundedPaths, boundsProblems, changesBetween, formatWithUnit, mergeOver, valueAt } from "../lib/values"
import { DEFAULT_DISCOVER_POLICY, DEFAULT_RANKING_CONFIG, DISCOVER_POLICY_BOUNDS, RANKING_CONFIG_BOUNDS } from "./backend-defaults"
import { PARAMETERS, parameterById, reachOf } from "./catalog"
import { FLOW } from "./flow"

describe("the parameter catalog", () => {
  it("has every setting of both super-admin policies, each once", () => {
    const ids = PARAMETERS.map((parameter) => parameter.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const path of boundedPaths(RANKING_CONFIG_BOUNDS)) expect(parameterById(`feed.${path.join(".")}`), path.join(".")).toBeDefined()
    for (const path of boundedPaths(DISCOVER_POLICY_BOUNDS)) expect(parameterById(`discover.${path.join(".")}`), path.join(".")).toBeDefined()
  })

  it("reads every policy parameter from a path the defaults have", () => {
    for (const parameter of PARAMETERS) {
      if (parameter.value.from === "feed") expect(typeof valueAt(DEFAULT_RANKING_CONFIG, parameter.value.path), parameter.id).toBe("number")
      if (parameter.value.from === "discover") expect(typeof valueAt(DEFAULT_DISCOVER_POLICY, parameter.value.path), parameter.id).toBe("number")
    }
  })

  it("links the flow map only to parameters that exist", () => {
    for (const row of FLOW) for (const cell of Object.values(row.cells)) for (const id of cell.params) expect(parameterById(id), id).toBeDefined()
  })

  it("says where each parameter is felt today", () => {
    expect(reachOf(parameterById("shuffle.halfLife")!)).toBe("in-app")
    expect(reachOf(parameterById("feed.quality.weights.share")!)).toBe("via-discover")
    expect(reachOf(parameterById("feed.relevance.followsAuthor")!)).toBe("not-yet")
    // Page size reaches Home today as well as the ranked feed later.
    expect(reachOf(parameterById("feed.defaultLimit")!)).toBe("in-app")
  })
})

describe("value helpers", () => {
  it("formats values with their units", () => {
    expect(formatWithUnit(0.03, "share")).toBe("3%")
    expect(formatWithUnit(30_000, "ms")).toBe("30 s")
    expect(formatWithUnit(1500, "ms")).toBe("1,500 ms")
    expect(formatWithUnit(4, "place")).toBe("4th")
    expect(formatWithUnit(1, "people")).toBe("1 person")
    expect(formatWithUnit(5000, "posts")).toBe("5,000 posts")
    expect(formatWithUnit(1.3, "×")).toBe("×1.3")
  })

  it("lists what changed between versions, by path", () => {
    const after = structuredClone(DEFAULT_RANKING_CONFIG)
    after.version = "policy-v2"
    after.quality.weights.share = 8
    expect(changesBetween(DEFAULT_RANKING_CONFIG, after)).toEqual([{ path: "quality.weights.share", before: 5, after: 8 }])
  })

  it("lays a stored version over the defaults and checks ranges", () => {
    const merged = mergeOver(DEFAULT_DISCOVER_POLICY, { score: { smoothing: 4 } })
    expect(merged.score.smoothing).toBe(4)
    expect(merged.score.halfLifeHours).toBe(DEFAULT_DISCOVER_POLICY.score.halfLifeHours)
    expect(boundsProblems(DEFAULT_RANKING_CONFIG, RANKING_CONFIG_BOUNDS)).toEqual([])
    expect(boundsProblems({ ...DEFAULT_RANKING_CONFIG, sessionSize: 5 }, RANKING_CONFIG_BOUNDS)).toEqual(["sessionSize must be between 20 and 500"])
  })
})

describe("the settings in force, as the gateway works them out", () => {
  const policy = (config: unknown, rankedPercent = 50) => ({
    id: "p", version: 3, isActive: true, rankedPercent, config, note: null, createdByAdminId: null, createdAt: "2026-11-01T00:00:00Z", activatedByAdminId: null, activatedAt: "2026-11-02T00:00:00Z",
  })

  it("uses the defaults and the gateway's ranked share when no version is live", () => {
    expect(effectiveFeed({ active: null, defaults: DEFAULT_RANKING_CONFIG, bounds: RANKING_CONFIG_BOUNDS })).toEqual({ config: DEFAULT_RANKING_CONFIG, label: "heuristic-v1", rankedPercent: null, ignored: [] })
  })

  it("uses a valid live version and its share", () => {
    const config = { ...structuredClone(DEFAULT_RANKING_CONFIG), version: "policy-v3", sessionSize: 150 }
    const live = effectiveFeed({ active: policy(config), defaults: DEFAULT_RANKING_CONFIG, bounds: RANKING_CONFIG_BOUNDS })
    expect(live.label).toBe("policy-v3")
    expect(live.config.sessionSize).toBe(150)
    expect(live.rankedPercent).toBe(50)
  })

  it("ignores a version that fails validation, as the gateway does", () => {
    const config = { ...structuredClone(DEFAULT_RANKING_CONFIG), version: "policy-v3", rerank: { ...DEFAULT_RANKING_CONFIG.rerank, maxPerAuthorInWindow: 9, authorWindow: 5 } }
    const live = effectiveFeed({ active: policy(config), defaults: DEFAULT_RANKING_CONFIG, bounds: RANKING_CONFIG_BOUNDS })
    expect(live.config).toBe(DEFAULT_RANKING_CONFIG)
    expect(live.ignored).toContain("rerank.maxPerAuthorInWindow cannot exceed rerank.authorWindow")
  })

  it("fills a Discover version saved before newer settings from the defaults", () => {
    const live = effectiveDiscover({
      active: { id: "d", version: 2, isActive: true, config: { version: "discover-v2", score: { momentumExponent: 0.8 } }, note: null, createdAt: "2026-11-01T00:00:00Z", activatedAt: null },
      defaults: DEFAULT_DISCOVER_POLICY,
      bounds: DISCOVER_POLICY_BOUNDS,
    })
    expect(live.label).toBe("discover-v2")
    expect(live.policy.score.momentumExponent).toBe(0.8)
    expect(live.policy.people).toEqual(DEFAULT_DISCOVER_POLICY.people)
  })
})
