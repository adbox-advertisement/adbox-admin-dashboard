import { describe, expect, it } from "vitest"
import { buildSampleRewards } from "../data/sample-rewards"
import type { Redemption } from "../types"
import { agreementSoon, checkRedemption, ghs, maskCode, premiumPercent, riskOf, since } from "./rewards"

const now = new Date("2026-11-10T12:00:00Z").getTime()
const DAY = 86_400_000

function context(overrides: { joinedDaysAgo?: number; phoneVerified?: boolean; stock?: number | null; paused?: boolean; active?: boolean } = {}) {
  const desk = buildSampleRewards(now)
  const user = { ...desk.redeemers.find((item) => item.id === "u-kofi")!, phoneVerified: overrides.phoneVerified ?? true }
  if (overrides.joinedDaysAgo !== undefined) user.joinedAt = new Date(now - overrides.joinedDaysAgo * DAY).toISOString()
  const offer = { ...desk.offers.find((item) => item.id === "o-mtn-air-10")!, stock: overrides.stock ?? null, lowStockAt: 3, active: overrides.active ?? true }
  const partner = { ...desk.partners.find((item) => item.id === "p-mtn")!, status: overrides.paused ? "paused" as const : "active" as const }
  const redemption: Redemption = {
    id: "r-test", reference: "RDM-9999", userId: user.id, offerId: offer.id, phone: user.phone, bars: 600, status: "pending",
    requestedAt: new Date(now - 60_000).toISOString(), decidedAt: null, decidedBy: null, rejectReason: null, fulfilment: null, failure: null,
  }
  return { redemption, ctx: { user, offer, partner, redeemers: desk.redeemers.map((item) => (item.id === user.id ? user : item)), redemptions: [redemption], now } }
}

describe("redemption checks", () => {
  it("are all clear for an established, verified account within its limits", () => {
    const { redemption, ctx } = context()
    const checks = checkRedemption(redemption, ctx)
    expect(checks.every((check) => check.tone === "ok")).toBe(true)
    expect(riskOf(checks)).toBe("low")
  })

  it("flag a new account as a problem and a fairly new one for a look", () => {
    expect(riskOf(checkRedemption(...spread(context({ joinedDaysAgo: 5 }))))).toBe("high")
    expect(riskOf(checkRedemption(...spread(context({ joinedDaysAgo: 30 }))))).toBe("review")
  })

  it("ask for a look at an unverified number, and stop at a shared one", () => {
    expect(riskOf(checkRedemption(...spread(context({ phoneVerified: false }))))).toBe("review")
    const { redemption, ctx } = context()
    const other = { ...ctx.redeemers.find((item) => item.id === "u-abena")!, phone: redemption.phone! }
    const checks = checkRedemption(redemption, { ...ctx, redeemers: [...ctx.redeemers.filter((item) => item.id !== other.id), other] })
    expect(checks).toContainEqual({ tone: "problem", text: `${redemption.phone} is also the number on @abena.o.` })
  })

  it("stop at the monthly limit and count requests in the last day", () => {
    const { redemption, ctx } = context()
    const earlier = Array.from({ length: 4 }, (_, index) => ({ ...redemption, id: `r-${index}`, requestedAt: new Date(now - (index + 2) * 3_600_000).toISOString() }))
    const checks = checkRedemption(redemption, { ...ctx, redemptions: [redemption, ...earlier] })
    expect(checks).toContainEqual({ tone: "problem", text: "Over the monthly limit: 5 of 4 this month." })
    expect(checks).toContainEqual({ tone: "look", text: "5 requests in the last day." })
  })

  it("watch voucher stock, a paused partner and a switched-off reward", () => {
    expect(checkRedemption(...spread(context({ stock: 0 })))).toContainEqual({ tone: "problem", text: "No codes left for this voucher: add codes before approving." })
    expect(checkRedemption(...spread(context({ stock: 2 })))).toContainEqual({ tone: "look", text: "Only 2 codes left." })
    expect(riskOf(checkRedemption(...spread(context({ paused: true }))))).toBe("high")
    expect(checkRedemption(...spread(context({ active: false })))).toContainEqual({ tone: "look", text: "This reward is switched off in the catalog." })
  })
})

describe("formatting", () => {
  it("shows money, waits, codes and the price against the store rate", () => {
    expect(ghs(5)).toBe("GH₵ 5")
    expect(ghs(33.25)).toBe("GH₵ 33.25")
    expect(since(new Date(now - 12 * 60_000).toISOString(), now)).toBe("12m")
    expect(since(new Date(now - 185 * 60_000).toISOString(), now)).toBe("3h 5m")
    expect(since(new Date(now - 3 * DAY).toISOString(), now)).toBe("3d")
    expect(maskCode("MLC50-7Q2K-91XD")).toBe("••••-91XD")
    expect(premiumPercent({ priceBars: 300, faceValueGhs: 5 }, 50)).toBe(20)
    expect(premiumPercent({ priceBars: 250, faceValueGhs: 5 }, 50)).toBe(0)
  })

  it("warns about an agreement ending within 90 days", () => {
    expect(agreementSoon("2026-12-31", now)).toBe("31 Dec 2026")
    expect(agreementSoon("2027-06-30", now)).toBeNull()
  })
})

function spread({ redemption, ctx }: ReturnType<typeof context>) {
  return [redemption, ctx] as const
}
