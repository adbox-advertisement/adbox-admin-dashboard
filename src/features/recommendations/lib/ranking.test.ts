import { describe, expect, it } from "vitest"
import { DEFAULT_RANKING_CONFIG as config } from "../data/backend-defaults"
import type { RankingConfig } from "../types"
import { buildList, freshness, markExplore, quality, rankCandidates, relevance, rerank, type Candidate, type ScoredCandidate } from "./ranking"

// The cases of adbox-backend libs/recommendation score.spec.ts and rerank.spec.ts, so the
// playground is known to rank as the gateway does.

const NOW = new Date("2026-10-09T12:00:00Z")
const hoursAgo = (hours: number) => new Date(NOW.getTime() - hours * 60 * 60 * 1000)

const candidate = (id: string, overrides: Partial<Omit<Candidate, "stats" | "affinity">> & { stats?: Partial<Candidate["stats"]>; affinity?: Partial<Candidate["affinity"]> } = {}): Candidate => {
  const { stats, affinity, ...rest } = overrides
  return {
    id, authorId: `author-${id}`, mediaType: "IMAGE", createdAt: NOW, quotedResourceId: null, sources: ["recent"], ...rest,
    stats: { impressions: 500, likes: 0, comments: 0, shares: 0, bookmarks: 0, completions: 0, viewers: 0, hides: 0, ...stats },
    affinity: { followsAuthor: false, sameCampus: false, sameInstitution: false, sharedInterests: 0, ...affinity },
  }
}
const stats = (overrides: Partial<Candidate["stats"]>) => candidate("x", { stats: overrides }).stats

describe("quality", () => {
  it("starts at the prior rate with no evidence", () => {
    expect(quality(stats({ impressions: 0 }), config.quality)).toBeCloseTo(config.quality.priorRate)
  })

  it("does not let a lucky post with two impressions beat a reliably good one", () => {
    expect(quality(stats({ impressions: 1000, likes: 300 }), config.quality)).toBeGreaterThan(quality(stats({ impressions: 2, likes: 2 }), config.quality))
  })

  it("weights a share above a comment above a like", () => {
    const like = quality(stats({ likes: 10 }), config.quality)
    const comment = quality(stats({ comments: 10 }), config.quality)
    expect(quality(stats({ shares: 10 }), config.quality)).toBeGreaterThan(comment)
    expect(comment).toBeGreaterThan(like)
  })

  it("counts each viewer's completion once, however many replays", () => {
    expect(quality(stats({ impressions: 12, completions: 33, viewers: 4 }), config.quality)).toBe(quality(stats({ impressions: 12, completions: 4, viewers: 4 }), config.quality))
  })

  it("measures exposure by viewers when plays outside the feed outnumber impressions", () => {
    expect(quality(stats({ impressions: 5, likes: 10, viewers: 100 }), config.quality)).toBeLessThan(quality(stats({ impressions: 5, likes: 10, viewers: 5 }), config.quality))
  })

  it("pushes a heavily hidden post to the floor without going negative", () => {
    expect(quality(stats({ hides: 500 }), config.quality)).toBe(0.001)
  })
})

describe("relevance and freshness", () => {
  const none = candidate("x").affinity

  it("ranks following above campus above institution, and never adds both campus and institution", () => {
    const follows = relevance({ ...none, followsAuthor: true }, config.relevance)
    const campus = relevance({ ...none, sameCampus: true }, config.relevance)
    const institution = relevance({ ...none, sameInstitution: true }, config.relevance)
    expect(relevance(none, config.relevance)).toBe(1)
    expect(follows).toBeGreaterThan(campus)
    expect(campus).toBeGreaterThan(institution)
    expect(relevance({ ...none, sameCampus: true, sameInstitution: true }, config.relevance)).toBe(campus)
  })

  it("caps shared interests", () => {
    expect(relevance({ ...none, sharedInterests: 10 }, config.relevance)).toBe(relevance({ ...none, sharedInterests: config.relevance.maxSharedInterests }, config.relevance))
  })

  it("halves every half-life, by media type", () => {
    expect(freshness(hoursAgo(24), "TEXT", NOW, config.halfLifeHours)).toBeCloseTo(0.5)
    expect(freshness(hoursAgo(48), "VIDEO", NOW, config.halfLifeHours)).toBeCloseTo(0.5)
    expect(freshness(new Date(NOW.getTime() + 60_000), "TEXT", NOW, config.halfLifeHours)).toBe(1)
  })

  it("ranks ties newer first, then by id", () => {
    const ranked = rankCandidates([candidate("b", { createdAt: hoursAgo(1) }), candidate("a", { createdAt: hoursAgo(1) }), candidate("c", { createdAt: NOW })], NOW, config)
    expect(ranked.map((item) => item.id)).toEqual(["c", "a", "b"])
  })
})

describe("markExplore", () => {
  it("marks new posts still finding their audience, once", () => {
    const marked = markExplore([
      candidate("new", { createdAt: hoursAgo(5), stats: { impressions: 10 } }),
      candidate("old", { createdAt: hoursAgo(100), stats: { impressions: 10 } }),
      candidate("seen", { createdAt: hoursAgo(5), stats: { impressions: 900 } }),
      candidate("already", { createdAt: hoursAgo(5), stats: { impressions: 10 }, sources: ["recent", "explore"] }),
    ], NOW, config.exploration)
    expect(marked.map((item) => item.sources.includes("explore"))).toEqual([true, false, false, true])
    expect(marked[3].sources).toEqual(["recent", "explore"])
  })
})

/** Scored in the order given: the first is the best. */
const scored = (items: Array<[string, Parameters<typeof candidate>[1]?]>): ScoredCandidate[] =>
  items.map(([id, overrides], index) => ({ ...candidate(id, overrides), score: 1000 - index, parts: { quality: 1, relevance: 1, freshness: 1, exploration: 1 } }))
const ids = (items: ScoredCandidate[]) => items.map((item) => item.id)
const noExplore: RankingConfig = { ...config, rerank: { ...config.rerank, exploreEvery: 0 } }

describe("rerank", () => {
  it("keeps score order when no rule is broken", () => {
    expect(ids(rerank(scored([["a"], ["b"], ["c"]]), noExplore).items)).toEqual(["a", "b", "c"])
  })

  it("spaces out one author's posts and says which rule held them back", () => {
    const input = scored([
      ["a1", { authorId: "ama" }], ["a2", { authorId: "ama" }], ["a3", { authorId: "ama" }], ["k1", { authorId: "kofi" }], ["e1", { authorId: "esi" }],
      ["y1", { authorId: "yaw" }], ["b1", { authorId: "abena" }], ["f1", { authorId: "fiifi" }], ["n1", { authorId: "nana" }], ["d1", { authorId: "dede" }], ["m1", { authorId: "mensah" }],
    ])
    const result = rerank(input, noExplore)
    const positions = result.items.map((item, index) => (item.authorId === "ama" ? index : -1)).filter((index) => index >= 0)
    expect(positions).toEqual([0, 5, 10])
    expect(result.relaxed).toBe(0)
    expect(result.notes.get("a2")?.heldBack).toEqual(["author"])
  })

  it("breaks up a long run of videos", () => {
    const input = scored([["v1", { mediaType: "VIDEO" }], ["v2", { mediaType: "VIDEO" }], ["v3", { mediaType: "VIDEO" }], ["v4", { mediaType: "VIDEO" }], ["t1", { mediaType: "TEXT" }]])
    const result = rerank(input, noExplore)
    expect(ids(result.items)).toEqual(["v1", "v2", "v3", "t1", "v4"])
    expect(result.notes.get("v4")?.heldBack).toEqual(["videos"])
  })

  it("never puts a quote next to the post it quotes", () => {
    expect(ids(rerank(scored([["original"], ["quote", { quotedResourceId: "original" }], ["other"]]), noExplore).items)).toEqual(["original", "other", "quote"])
  })

  it("guarantees an explore item in each block, at the block's last slot", () => {
    const withExplore: RankingConfig = { ...config, rerank: { ...config.rerank, exploreEvery: 4 } }
    const result = rerank(scored([["a"], ["b"], ["c"], ["d"], ["e"], ["new", { sources: ["explore"] }]]), withExplore)
    expect(ids(result.items).indexOf("new")).toBe(3)
    expect(result.notes.get("new")?.exploreSlot).toBe(true)
    expect(result.notes.get("d")?.heldBack).toEqual(["explore-slot"])
  })

  it("relaxes the rules instead of leaving the list short", () => {
    const result = rerank(scored([["a1", { authorId: "ama" }], ["a2", { authorId: "ama" }], ["a3", { authorId: "ama" }]]), noExplore)
    expect(ids(result.items)).toEqual(["a1", "a2", "a3"])
    expect(result.relaxed).toBe(2)
    expect(result.notes.get("a3")?.relaxed).toBe(true)
  })

  it("stops at the requested size and returns every item once", () => {
    expect(rerank(scored([["a"], ["b"], ["c"], ["d"]]), noExplore, 2).items).toHaveLength(2)
    const many = scored(Array.from({ length: 40 }, (_, i) => [`p${i}`, { authorId: `author-${i % 3}`, mediaType: i % 2 ? "VIDEO" : "IMAGE", sources: i % 7 === 0 ? ["explore"] : ["recent"] }] as [string, Parameters<typeof candidate>[1]]))
    const result = ids(rerank(many, config).items)
    expect(new Set(result).size).toBe(40)
  })
})

describe("buildList", () => {
  it("marks, scores, ranks and reranks a pool", () => {
    const list = buildList([candidate("fresh", { createdAt: hoursAgo(1), stats: { impressions: 10 } }), candidate("stale", { createdAt: hoursAgo(200) })], NOW, config)
    expect(list.items.map((item) => item.id)).toEqual(["fresh", "stale"])
    expect(list.items[0].parts.exploration).toBe(config.exploration.boost)
  })
})
