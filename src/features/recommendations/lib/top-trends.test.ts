import { describe, expect, it } from "vitest"
import { DEFAULT_DISCOVER_POLICY } from "../data/backend-defaults"
import { appTrendListSchema, type AppTrendList, type InstitutionDirectory, type TrendItem, type TrendReport } from "../types"
import {
  appImage,
  appListOptions,
  appRank,
  appSubline,
  changeWords,
  flameDelay,
  joinTopTrends,
  kindMix,
  placement,
  qualifyingRules,
  scoreProduct,
  subjectFacts,
  windowWords,
} from "./top-trends"

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`
const UG = id(101)

const appItem = (rank: number, kind: string, n: number, title: string, extra: Record<string, unknown> = {}) =>
  ({ rank, kind, id: id(n), title, category: null, metrics: { posts: 12, participants: 40, window: "24h", label: "12 posts today" }, trend: { direction: "UP", changePct: 40 }, featured: false, presentation: null, subject: null, ...extra })

const list = (items: unknown[], extra: Record<string, unknown> = {}): AppTrendList =>
  appTrendListSchema.parse({ scope: { key: "global", level: "GLOBAL", label: "All campuses" }, items, source: "snapshot", computedAt: "2026-11-13T11:55:00Z", policyVersion: "discover-v1", stale: false, ...extra })

const computed = (rank: number, n: number, extra: Partial<TrendItem> = {}): TrendItem => ({
  rank, kind: "HASHTAG", id: id(n), name: null, score: 5, topPostId: null,
  metrics: { posts: 12, participants: 40, follows: 0 }, trend: { direction: "UP", changePct: 40 },
  parts: { recent: 52, baseline: 12, momentum: 2.82, breadth: Math.log1p(40), quality: 1, kindMultiplier: 1 }, ...extra,
})

describe("top trends", () => {
  it("draws rows as the app does", () => {
    expect(appRank(1)).toBe("01")
    expect(appRank(10)).toBe("10")
    expect(appSubline({ kind: "HASHTAG", category: null, featured: false })).toBe("Trending")
    expect(appSubline({ kind: "PERSON", category: null, featured: true })).toBe("Creator · Featured")
    expect(appSubline({ kind: "INSTITUTION", category: { slug: "campus", label: "Campus" }, featured: false })).toBe("Campus")
    // Flames start out of step, within one 1.4 s flicker.
    expect(new Set([1, 2, 3].map(flameDelay)).size).toBe(3)
    for (const rank of [1, 4, 10]) expect(flameDelay(rank)).toBeLessThanOrEqual(0)
    for (const rank of [1, 4, 10]) expect(flameDelay(rank)).toBeGreaterThan(-1.4)
  })

  it("shows the subject's own picture first, and only web addresses", () => {
    const person = { kind: "PERSON" as const, id: "u", username: "ama", fullName: "Ama", image: "https://cdn.example/ama.jpg", verificationTier: null, creatorRole: null, institution: null }
    const poster = { kicker: "TRENDING", headline: "#x", support: null, sticker: [], tone: null, imageUrl: "https://cdn.example/post.jpg", description: null }
    expect(appImage({ subject: person, presentation: poster })).toBe("https://cdn.example/ama.jpg")
    expect(appImage({ subject: null, presentation: poster })).toBe("https://cdn.example/post.jpg")
    // A server without a media host sends the storage key, which can't be shown.
    expect(appImage({ subject: null, presentation: { ...poster, imageUrl: "uploads/post.jpg" } })).toBeNull()
  })

  it("joins the app's list to the computed scores and the overrides in force", () => {
    const app = list([appItem(1, "HASHTAG", 2, "#pinned", { featured: true }), appItem(2, "HASHTAG", 1, "#earned"), appItem(3, "HASHTAG", 3, "#third")])
    const report: TrendReport = {
      scopeKey: "global",
      snapshot: { computedAt: "2026-11-13T11:55:00Z", policyVersion: "discover-v1", items: [computed(1, 1), computed(4, 3)], diagnostics: null },
      overrides: [{ id: "o", scopeKey: "global", kind: "HASHTAG", subjectId: id(2), action: "PIN", rank: 1, multiplier: null, reason: "Launch", startsAt: "2026-11-13T00:00:00Z", endsAt: "2026-11-20T00:00:00Z", endedAt: null, name: "#pinned" }],
    }
    const [pinned, earned, third] = joinTopTrends(app, report)
    expect(pinned.computed).toBeNull()
    expect(pinned.override?.action).toBe("PIN")
    expect(placement(pinned, "snapshot")).toBe("Pinned at 1st by an admin; it wasn't in the computed list.")
    expect(placement(earned, "snapshot")).toBe("It was computed 1st, and is down 1 place: admins placed or boosted subjects above it.")
    expect(placement(third, "snapshot")).toBe("It was computed 4th, and is up 1 place: subjects above it were suppressed, dampened or dropped out since.")
    expect(placement({ item: third.item, computed: null, override: null }, "fallback")).toMatch(/^No list has been computed here yet/)
    expect(joinTopTrends(list(Array.from({ length: 14 }, (_, index) => appItem(index + 1, "HASHTAG", index + 1, `#t${index}`))), undefined)).toHaveLength(10)
  })

  it("says what the figures cover and how they changed", () => {
    expect(windowWords("24h")).toBe("in the last 24 h")
    expect(windowWords("7d")).toBe("in the last 7 days")
    expect(windowWords("all")).toBe("all time")
    expect(windowWords(null)).toBe("")
    expect(changeWords({ direction: "UP", changePct: 140 })).toBe("140% above an ordinary day")
    expect(changeWords({ direction: "DOWN", changePct: -25 })).toBe("25% below an ordinary day")
    expect(changeWords({ direction: "NEW", changePct: null })).toBe("New: no activity in the days before")
    expect(changeWords(null)).toBeNull()
  })

  it("checks the rules and multiplies the parts as the job does", () => {
    const rules = qualifyingRules(computed(1, 1, { metrics: { participants: 8 } }), "GLOBAL", DEFAULT_DISCOVER_POLICY)
    expect(rules).toEqual([
      { label: "People taking part", value: "8", needs: "at least 10 in a nationwide list", passed: false },
      { label: "Recent activity", value: "52", needs: "at least 20", passed: true },
    ])
    const parts = { recent: 52, baseline: 12, momentum: 2.5, breadth: 2, quality: 0.8, kindMultiplier: 1.2 }
    const { momentum, product } = scoreProduct(parts, 0.7)
    expect(momentum).toBeCloseTo(Math.pow(2.5, 0.7))
    expect(product).toBeCloseTo(Math.pow(2.5, 0.7) * 2 * 0.8 * 1.2)
  })

  it("names the lists the app reads, and the kinds in a list", () => {
    const directory: InstitutionDirectory = [
      { id: UG, name: "University of Ghana", shortName: "UG", region: "Greater Accra", isActive: true, campuses: [] },
      { id: id(103), name: "Kwame Nkrumah University of Science and Technology", shortName: "KNUST", region: "Ashanti", isActive: true, campuses: [] },
      { id: id(104), name: "Closed College", shortName: "CC", region: "Volta", isActive: false, campuses: [] },
    ]
    expect(appListOptions(directory, ["global", `inst:${UG}`], "global").map((option) => option.label)).toEqual(["Nationwide", "KNUST", "UG"])
    expect(appListOptions(undefined, [`inst:${UG}`], "global").map((option) => option.label)).toEqual(["Nationwide", "Institution 00000000"])
    expect(kindMix([{ kind: "HASHTAG" }, { kind: "EVENT" }, { kind: "HASHTAG" }, { kind: "PERSON" }])).toBe("2 hashtags, 1 event and 1 person")
    expect(kindMix([{ kind: "HASHTAG" }])).toBe("1 hashtag")
  })

  it("describes each kind of subject", () => {
    expect(subjectFacts({ kind: "PERSON", id: "u", username: "ama", fullName: "Ama Owusu", image: null, verificationTier: "VERIFIED", creatorRole: { slug: "dj", label: "DJ" }, institution: { id: UG, shortName: "UG" } }))
      .toEqual([{ label: "Name", value: "Ama Owusu" }, { label: "Username", value: "@ama" }, { label: "Verification", value: "Verified" }, { label: "Creator role", value: "DJ" }, { label: "Institution", value: "UG" }])
    const event = subjectFacts({ kind: "EVENT", id: "e", title: "Food fair", startsAt: "2026-11-14T10:00:00Z", endsAt: "2026-11-14T16:00:00Z", location: "The Great Hall", coverUrl: null,
      timing: "UPCOMING", going: 120, institution: { id: UG, shortName: "UG" }, campus: { id: "c", name: "Legon" }, hall: null })
    expect(event.map((row) => row.label)).toEqual(["Starts", "Ends", "Now", "Going", "Location", "Held by"])
    expect(event.find((row) => row.label === "Held by")?.value).toBe("Legon, UG")
    expect(subjectFacts({ kind: "HALL", id: "h", name: "Commonwealth Hall", campus: { id: "c", name: "Legon" }, institution: { id: UG, shortName: "UG" } }))
      .toEqual([{ label: "Hall", value: "Commonwealth Hall" }, { label: "Campus", value: "Legon" }, { label: "Institution", value: "UG" }])
  })

  it("keeps the list when a subject's details have a shape it doesn't know", () => {
    const parsed = list([appItem(1, "PERSON", 5, "Ama", { subject: { kind: "PERSON", id: 5 }, presentation: { kicker: 1 } })])
    expect(parsed.items[0].title).toBe("Ama")
    expect(parsed.items[0].subject).toBeNull()
    expect(parsed.items[0].presentation).toBeNull()
  })
})
