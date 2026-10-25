import { describe, expect, it } from "vitest"
import { grantHonourSchema, platformUserSchema, rejectVerificationSchema, updateBadgesSchema, updatePlatformUserSchema, userStatsSchema, verificationRequestSchema } from "./validation"
import { platformUserFixtures, scopedStatsFixture, verificationFixtures } from "@/test/users-fixtures"

describe("Manage Users schemas", () => {
  it("normalizes nullable account flags from legacy rows", () => {
    const user = platformUserSchema.parse(platformUserFixtures[1])
    expect(user).toMatchObject({ emailVerified: false, isContactVerified: false, isMachine: false, isActive: false, userProfile: null })
  })

  it("keeps the full sign-up profile including education details", () => {
    const user = platformUserSchema.parse(platformUserFixtures[0])
    expect(user.userProfile).toMatchObject({ fullName: "Ama Mensah", level: 300, verificationTier: "PENDING", campus: { name: "Legon" } })
  })

  it("tolerates unknown enum values from a newer backend", () => {
    const user = platformUserSchema.parse({ ...platformUserFixtures[0], role: "MODERATOR" })
    expect(user.role).toBeNull()
  })

  it("never exposes credentials even if the API leaks them", () => {
    const user = platformUserSchema.parse({ ...platformUserFixtures[0], password: "hash", passwordResetToken: "token" })
    expect(user).not.toHaveProperty("password")
    expect(user).not.toHaveProperty("passwordResetToken")
  })

  it("drops evidence links that are not http(s)", () => {
    expect(verificationRequestSchema.parse({ ...verificationFixtures[0], evidenceUrl: "javascript:alert(1)" }).evidenceUrl).toBeNull()
    expect(verificationRequestSchema.parse(verificationFixtures[0]).evidenceUrl).toBe("https://files.example.com/id-card.jpg")
  })

  it("enforces the backend's profile edit limits", () => {
    expect(updatePlatformUserSchema.safeParse({ level: 950 }).success).toBe(false)
    expect(updatePlatformUserSchema.safeParse({ graduationYear: 1900 }).success).toBe(false)
    expect(updatePlatformUserSchema.safeParse({ level: 400, programme: " Law " }).data).toEqual({ level: 400, programme: "Law" })
  })

  it("requires a meaningful rejection note", () => {
    expect(rejectVerificationSchema.safeParse({ rejectionNote: " no " }).success).toBe(false)
    expect(rejectVerificationSchema.safeParse({ rejectionNote: "ID is not legible" }).success).toBe(true)
  })

  it("reads lifecycle fields and relationship counts, tolerating servers that omit counts", () => {
    const user = platformUserSchema.parse({ ...platformUserFixtures[0], deactivationReason: "DELETION_REQUESTED", deletionScheduledFor: "2026-11-20T00:00:00.000Z", _count: { followers: 3, following: 1, companyPublisher: 0 } })
    expect(user).toMatchObject({ deactivationReason: "DELETION_REQUESTED", _count: { followers: 3 } })
    expect(platformUserSchema.parse(platformUserFixtures[0])._count).toBeNull()
  })

  it("parses institution-scoped stats with campuses", () => {
    const stats = userStatsSchema.parse(scopedStatsFixture)
    expect(stats.campuses?.[0].members.STUDENT).toBe(36)
    expect(stats.withoutCampus?.total).toBe(5)
  })

  it("needs at least one badge change, and a note to override honour rules", () => {
    expect(updateBadgesSchema.safeParse({}).success).toBe(false)
    expect(updateBadgesSchema.safeParse({ studentStatus: null }).success).toBe(true)
    expect(grantHonourSchema.safeParse({ override: true }).success).toBe(false)
    expect(grantHonourSchema.safeParse({ override: true, note: "Campus leader for 3 years" }).success).toBe(true)
  })
})
