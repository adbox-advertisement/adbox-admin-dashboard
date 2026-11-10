import { beforeEach, describe, expect, it } from "vitest"
import {
  addCodes, approveAllClear, approveRedemption, getOffers, getPartner, getRedemption, getRedemptions, getRewardsOverview,
  refundRedemption, rejectRedemption, resetSampleRewards, retryRedemption, sampleRewards, setPartnerStatus, updateOffer,
} from "./api"

beforeEach(() => {
  sampleRewards.latency = 0
  // Top-ups land at once, so a test never waits on a timer.
  sampleRewards.deliveryMs = 0
  resetSampleRewards()
})

describe("the sample rewards service", () => {
  it("lists waiting requests oldest first, with their checks", async () => {
    const waiting = await getRedemptions({ status: "pending" })
    expect(waiting).toHaveLength(10)
    expect(waiting[0].reference).toBe("RDM-2052")
    expect(waiting.find((item) => item.reference === "RDM-2060")).toMatchObject({ risk: "high" })
    expect(waiting.find((item) => item.reference === "RDM-2060")?.checks.map((check) => check.text)).toEqual(expect.arrayContaining([
      "New account: joined 6 days ago.", "059 555 0199 is also the number on @joeb.gh.",
    ]))
    expect(waiting.find((item) => item.reference === "RDM-2053")).toMatchObject({ risk: "high" })
    expect(waiting.find((item) => item.reference === "RDM-2054")).toMatchObject({ risk: "review" })
  })

  it("filters by partner, checks and search", async () => {
    expect((await getRedemptions({ status: "all", partnerId: "p-melcom" })).every((item) => item.partner.id === "p-melcom")).toBe(true)
    expect((await getRedemptions({ status: "pending", risk: "low" })).map((item) => item.reference).sort()).toEqual(["RDM-2052", "RDM-2055", "RDM-2056", "RDM-2058", "RDM-2061"])
    expect((await getRedemptions({ status: "all", search: "059 555 0199" })).map((item) => item.user.username)).toEqual(expect.arrayContaining(["prince.b99", "joeb.gh"]))
  })

  it("sends an approved top-up to the partner and records its reference", async () => {
    const approved = await approveRedemption("r-2061")
    expect(approved.status).toBe("fulfilled")
    expect(approved.fulfilment?.reference).toMatch(/^MTN-TXN-\d{6}$/)
    expect(approved.decidedBy).toBe("You")
    await expect(approveRedemption("r-2061")).rejects.toThrow("already been decided")
  })

  it("issues the next voucher code and takes it from the stock", async () => {
    const before = (await getOffers()).find((offer) => offer.id === "o-mel-50")!
    const approved = await approveRedemption("r-2055")
    expect(approved).toMatchObject({ status: "fulfilled", fulfilment: { code: expect.stringMatching(/^MLC50-/) } })
    const after = (await getOffers()).find((offer) => offer.id === "o-mel-50")!
    expect(after.stock).toBe((before.stock ?? 0) - 1)
    expect(after.batches[0].issued).toBe(before.batches[0].issued + 1)
  })

  it("won't approve a voucher with no codes left until codes are added", async () => {
    await expect(approveRedemption("r-2053")).rejects.toThrow("No codes left for Melcom voucher GH₵ 20")
    expect((await getRedemption("r-2053")).status).toBe("pending")
    const added = await addCodes({ offerId: "o-mel-20", codes: ["NEW-0001", "NEW-0002", "", "NEW-0001"] })
    expect(added).toMatchObject({ added: 2, skipped: 1, offer: { stock: 2 } })
    expect((await approveRedemption("r-2053")).fulfilment?.code).toBe("NEW-0001")
    await expect(addCodes({ offerId: "o-mel-20", codes: ["NEW-0001"] })).rejects.toThrow("No new codes")
    await expect(addCodes({ offerId: "o-mtn-air-5", codes: ["X"] })).rejects.toThrow("Only vouchers take codes.")
  })

  it("rejects with a reason and gives the gold back", async () => {
    const before = await getRedemption("r-2060")
    await expect(rejectRedemption({ id: "r-2060", input: { reason: "" } })).rejects.toThrow("Choose a reason.")
    const rejected = await rejectRedemption({ id: "r-2060", input: { reason: "Suspected abuse", note: "Same number as another account" } })
    expect(rejected).toMatchObject({ status: "rejected", rejectReason: "Suspected abuse: Same number as another account" })
    expect(rejected.user.goldBalance).toBe(before.user.goldBalance + before.bars)
  })

  it("approves only the all-clear requests in one go", async () => {
    expect(await approveAllClear()).toBe(5)
    const waiting = await getRedemptions({ status: "pending" })
    expect(waiting).toHaveLength(5)
    expect(waiting.every((item) => item.risk !== "low")).toBe(true)
  })

  it("retries or refunds a failed delivery", async () => {
    expect((await retryRedemption("r-2051")).status).toBe("fulfilled")
    resetSampleRewards()
    const before = await getRedemption("r-2051")
    const refunded = await refundRedemption("r-2051")
    expect(refunded).toMatchObject({ status: "rejected", rejectReason: "The partner couldn't deliver" })
    expect(refunded.user.goldBalance).toBe(before.user.goldBalance + before.bars)
    await expect(refundRedemption("r-2051")).rejects.toThrow("Only a failed delivery")
  })

  it("prices rewards in whole bars and switches them on and off", async () => {
    await expect(updateOffer({ id: "o-mtn-air-5", update: { priceBars: 12.5 } })).rejects.toThrow("whole number")
    expect(await updateOffer({ id: "o-mtn-air-5", update: { priceBars: 280, active: false } })).toMatchObject({ priceBars: 280, active: false })
  })

  it("adds up a partner's month and flags a paused partner on waiting requests", async () => {
    const melcom = await getPartner("p-melcom")
    expect(melcom.monthPayableGhs).toBeCloseTo(melcom.monthFaceValueGhs * 0.9, 2)
    expect(melcom.lowStock).toBe(2)
    await setPartnerStatus({ id: "p-telecel", status: "paused" })
    const waiting = await getRedemption("r-2058")
    expect(waiting.risk).toBe("high")
    expect(waiting.checks.map((check) => check.text)).toContain("Telecel Ghana is paused.")
  })

  it("summarises what's waiting, what went out and what needs attention", async () => {
    const overview = await getRewardsOverview()
    expect(overview).toMatchObject({ pending: 10, lowRiskPending: 5, failed: 1 })
    expect(overview.stockAlerts.map((offer) => offer.id).sort()).toEqual(["o-mel-100", "o-mel-20"])
    expect(overview.statusCounts.all).toBe(overview.statusCounts.pending + overview.statusCounts.processing + overview.statusCounts.fulfilled + overview.statusCounts.rejected + overview.statusCounts.failed)
    expect(overview.byPartner.reduce((sum, item) => sum + item.count, 0)).toBe(overview.fulfilled30d)
  })
})
