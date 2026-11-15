import { describe, expect, it } from "vitest"
import type { PeopleStats } from "../types"
import { creatorName, formatCedis, formatCedisShort, formatCompact, greeting, initials, largestInstitutions, postMix, roleRows, shareOf } from "./figures"

const members = (total: number) => ({ total, STUDENT: total, ALUMNI: 0, STAFF: 0 })

describe("dashboard figures", () => {
  it("words money and shares as the rest of the dashboard does", () => {
    expect(formatCedis(2485.7)).toBe("GHS 2,485.70")
    expect(formatCedis(0)).toBe("GHS 0.00")
    expect(formatCedisShort(2485.77)).toBe("GHS 2,485.77")
    expect(formatCedisShort(124_300.5)).toBe("GHS 124.3k")
    expect(formatCedisShort(1_250_000)).toBe("GHS 1.3M")
    expect(formatCompact(9_999)).toBe("9,999")
    expect(formatCompact(124_300)).toBe("124.3k")
    expect(shareOf(42, 100)).toBe("42%")
    expect(shareOf(1, 400)).toBe("<1%")
    expect(shareOf(0, 10)).toBe("0%")
    expect(shareOf(3, 0)).toBe("0%")
  })

  it("greets by the time of day", () => {
    expect(greeting(8)).toBe("Good morning")
    expect(greeting(12)).toBe("Good afternoon")
    expect(greeting(19)).toBe("Good evening")
    expect(greeting(2)).toBe("Good evening")
  })

  it("lists guests only when there are any", () => {
    expect(roleRows({ GUEST: 0, VIEWER: 5, CREATOR: 2, PUBLISHER: 1 }).map((row) => row.label)).toEqual(["Viewers", "Creators", "Publishers"])
    expect(roleRows({ GUEST: 3, VIEWER: 5, CREATOR: 2, PUBLISHER: 1 }).map((row) => row.label)).toEqual(["Viewers", "Creators", "Publishers", "Guests"])
  })

  it("keeps the institutions people have joined, most members first", () => {
    const stats = { institutions: [
      { id: "a", name: "A", shortName: "A", region: null, logoUrl: null, members: members(9) },
      { id: "b", name: "B", shortName: "B", region: null, logoUrl: null, members: members(4) },
      { id: "c", name: "C", shortName: "C", region: null, logoUrl: null, members: members(0) },
    ] } as PeopleStats
    expect(largestInstitutions(stats, 5).map((institution) => institution.id)).toEqual(["a", "b"])
    expect(largestInstitutions(stats, 1).map((institution) => institution.id)).toEqual(["a"])
  })

  it("names creators and what they post", () => {
    const creator = (fullName: string | null, username: string | null) => ({ user: { id: "u", userProfile: { fullName, username, image: null } }, posts: 3, videos: 2, images: 0, text: 1 })
    expect(creatorName(creator("Ama Owusu", "ama"))).toBe("Ama Owusu")
    expect(creatorName(creator(null, "ama"))).toBe("@ama")
    expect(creatorName({ ...creator(null, null), user: null })).toBe("Deleted account")
    expect(postMix({ videos: 2, images: 0, text: 1 })).toBe("2 videos · 1 text")
    expect(postMix({ videos: 0, images: 1, text: 0 })).toBe("1 picture")
    expect(initials("Ama Owusu")).toBe("AO")
    expect(initials("@kofi")).toBe("K")
  })
})
