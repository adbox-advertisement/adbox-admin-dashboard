import { describe, expect, it } from "vitest"
import { accountStatusOf, activeBadges } from "./types"

const NOW = new Date("2026-10-24T12:00:00.000Z")
const profile = { studentStatus: null, verificationTier: "SELF_DECLARED" as const, honourSince: null, honourRenewsAt: null, spotlightUntil: null }

describe("accountStatusOf", () => {
  it("tells an AdBox suspension apart from the owner's own choices", () => {
    expect(accountStatusOf({ isActive: true, deactivationReason: null })).toBe("active")
    expect(accountStatusOf({ isActive: false, deactivationReason: null })).toBe("suspended")
    expect(accountStatusOf({ isActive: false, deactivationReason: "SELF" })).toBe("deactivated")
    expect(accountStatusOf({ isActive: false, deactivationReason: "DELETION_REQUESTED" })).toBe("pending_deletion")
    expect(accountStatusOf({ isActive: false, deactivationReason: "ERASED" })).toBe("erased")
  })
})

describe("activeBadges", () => {
  it("shows the campus badge only for a verified affiliation", () => {
    expect(activeBadges({ ...profile, studentStatus: "ALUMNI", verificationTier: "PENDING" }, NOW).campus).toBe(false)
    expect(activeBadges({ ...profile, studentStatus: "ALUMNI", verificationTier: "VERIFIED" }, NOW).campus).toBe(true)
  })

  it("ignores an honour or Spotlight that has lapsed", () => {
    expect(activeBadges({ ...profile, honourSince: "2025-01-01T00:00:00.000Z", honourRenewsAt: "2026-01-01T00:00:00.000Z", spotlightUntil: "2026-10-01T00:00:00.000Z" }, NOW))
      .toEqual({ campus: false, honour: false, spotlight: false })
    expect(activeBadges({ ...profile, honourSince: "2026-03-01T00:00:00.000Z", honourRenewsAt: "2027-03-01T00:00:00.000Z", spotlightUntil: "2026-11-01T00:00:00.000Z" }, NOW))
      .toEqual({ campus: false, honour: true, spotlight: true })
  })

  it("has nothing for an account without a profile", () => {
    expect(activeBadges(null, NOW)).toEqual({ campus: false, honour: false, spotlight: false })
  })
})
