import { BARS_PER_CEDI, buildSampleRewards } from "./data/sample-rewards"
import { checkRedemption, riskOf } from "./lib/rewards"
import type {
  OfferRow, OfferUpdate, PartnerRow, RedemptionDetail, Redemption, RedemptionQuery, RedemptionRow, RedemptionStatus, RejectInput, RewardsOverview,
} from "./types"

// The rewards service. There is no rewards API yet, so this serves an in-memory sample desk
// with a short delay; approvals, codes and changes live until the page reloads. Swap these
// functions for real requests (superAdminApi) and the hooks and screens keep working.

export const sampleRewards = { latency: 250, deliveryMs: 2500, barsPerCedi: BARS_PER_CEDI }

let desk = buildSampleRewards()
let deliveries: Array<ReturnType<typeof setTimeout>> = []

/** Back to the original sample (tests, and "Reset sample" on the pages). */
export function resetSampleRewards(now = Date.now()) {
  deliveries.forEach(clearTimeout)
  deliveries = []
  desk = buildSampleRewards(now)
  for (const redemption of desk.redemptions) if (redemption.status === "processing") deliver(redemption)
}

const wait = () => new Promise((resolve) => setTimeout(resolve, sampleRewards.latency))
const DAY = 86_400_000

function find(id: string) {
  const redemption = desk.redemptions.find((item) => item.id === id)
  if (!redemption) throw new Error("Redemption not found")
  return redemption
}

function row(redemption: Redemption, now = Date.now()): RedemptionRow {
  const user = desk.redeemers.find((item) => item.id === redemption.userId)!
  const offer = desk.offers.find((item) => item.id === redemption.offerId)!
  const partner = desk.partners.find((item) => item.id === offer.partnerId)!
  const checks = redemption.status === "pending" ? checkRedemption(redemption, { user, offer, partner, redeemers: desk.redeemers, redemptions: desk.redemptions, now }) : []
  // Copies, like a real response: the screens' cached data must never change under them.
  return structuredClone({ ...redemption, user, offer, partner, checks, risk: riskOf(checks) })
}

const recentDelivered = (now: number) => desk.redemptions.filter((item) => item.status === "fulfilled" && now - new Date(item.decidedAt ?? item.requestedAt).getTime() < 30 * DAY)

function offerRow(offerId: string, now = Date.now()): OfferRow {
  const offer = desk.offers.find((item) => item.id === offerId)!
  return structuredClone({
    ...offer,
    partner: desk.partners.find((item) => item.id === offer.partnerId)!,
    redeemed30d: recentDelivered(now).filter((item) => item.offerId === offer.id).length,
    batches: desk.batches.filter((batch) => batch.offerId === offer.id),
  })
}

const lowOnStock = (offer: OfferRow) => offer.stock !== null && offer.active && offer.stock <= offer.lowStockAt

export async function getRewardsOverview(): Promise<RewardsOverview> {
  await wait()
  const now = Date.now()
  const rows = desk.redemptions.map((item) => row(item, now))
  const pending = rows.filter((item) => item.status === "pending")
  const delivered = recentDelivered(now)
  const faceValue = (list: Redemption[]) => list.reduce((sum, item) => sum + desk.offers.find((offer) => offer.id === item.offerId)!.faceValueGhs, 0)
  const statusCounts = Object.fromEntries((["pending", "processing", "fulfilled", "rejected", "failed"] as RedemptionStatus[]).map((status) => [status, rows.filter((item) => item.status === status).length])) as Record<RedemptionStatus, number>
  return {
    pending: pending.length,
    oldestPendingAt: pending.map((item) => item.requestedAt).sort()[0] ?? null,
    lowRiskPending: pending.filter((item) => item.risk === "low").length,
    failed: statusCounts.failed,
    barsRedeemed30d: delivered.reduce((sum, item) => sum + item.bars, 0),
    faceValue30d: faceValue(delivered),
    fulfilled30d: delivered.length,
    byPartner: desk.partners.map((partner) => {
      const theirs = delivered.filter((item) => desk.offers.find((offer) => offer.id === item.offerId)!.partnerId === partner.id)
      return { partnerId: partner.id, name: partner.name, count: theirs.length, faceValueGhs: faceValue(theirs) }
    }).sort((a, b) => b.faceValueGhs - a.faceValueGhs),
    stockAlerts: desk.offers.map((offer) => offerRow(offer.id, now)).filter(lowOnStock),
    statusCounts: { ...statusCounts, all: rows.length },
  }
}

export async function getRedemptions(query: RedemptionQuery): Promise<RedemptionRow[]> {
  await wait()
  const now = Date.now()
  const term = query.search?.trim().toLowerCase()
  return desk.redemptions
    .filter((item) => query.status === "all" || item.status === query.status)
    .map((item) => row(item, now))
    .filter((item) => !query.partnerId || item.partner.id === query.partnerId)
    .filter((item) => !query.risk || item.risk === query.risk)
    .filter((item) => !term || [item.reference, item.user.name, item.user.username, item.phone ?? "", item.offer.name].some((text) => text.toLowerCase().includes(term)))
    // Waiting requests oldest first, so nobody waits longest; everything else newest first.
    .sort((a, b) => query.status === "pending" ? a.requestedAt.localeCompare(b.requestedAt) : b.requestedAt.localeCompare(a.requestedAt))
}

export async function getRedemption(id: string): Promise<RedemptionDetail> {
  await wait()
  const current = row(find(id))
  const history = desk.redemptions.filter((item) => item.userId === current.userId && item.id !== id)
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)).slice(0, 8).map((item) => row(item))
  return { ...current, history }
}

/** A top-up is handed to the partner and lands a moment later; a voucher gets the next unused code at once. */
function approve(redemption: Redemption, by: string) {
  if (redemption.status !== "pending") throw new Error("This request has already been decided.")
  const offer = desk.offers.find((item) => item.id === redemption.offerId)!
  redemption.decidedAt = new Date().toISOString()
  redemption.decidedBy = by
  if (offer.stock !== null) {
    const code = desk.codes[offer.id]?.shift()
    if (!code) throw new Error(`No codes left for ${offer.name}. Add codes on the partner's page first.`)
    offer.stock -= 1
    const batch = desk.batches.find((item) => item.offerId === offer.id && item.issued < item.count)
    if (batch) batch.issued += 1
    redemption.status = "fulfilled"
    redemption.fulfilment = { code }
    return
  }
  redemption.status = "processing"
  deliver(redemption)
}

function deliver(redemption: Redemption) {
  const finish = () => {
    const partner = desk.partners.find((item) => item.id === desk.offers.find((offer) => offer.id === redemption.offerId)!.partnerId)!
    redemption.status = "fulfilled"
    redemption.fulfilment = { reference: `${partner.shortName.toUpperCase()}-TXN-${Math.floor(100000 + Math.random() * 899999)}` }
  }
  if (sampleRewards.deliveryMs <= 0) finish()
  else deliveries.push(setTimeout(finish, sampleRewards.deliveryMs))
}

export async function approveRedemption(id: string) {
  await wait()
  const redemption = find(id)
  approve(redemption, "You")
  return row(redemption)
}

/** Approves every waiting request whose checks are all clear; returns how many. */
export async function approveAllClear() {
  await wait()
  const clear = desk.redemptions.filter((item) => item.status === "pending" && row(item).risk === "low")
  clear.forEach((item) => approve(item, "You"))
  return clear.length
}

export async function rejectRedemption({ id, input }: { id: string; input: RejectInput }) {
  await wait()
  const redemption = find(id)
  if (redemption.status !== "pending") throw new Error("This request has already been decided.")
  if (!input.reason) throw new Error("Choose a reason.")
  redemption.status = "rejected"
  redemption.rejectReason = input.note?.trim() ? `${input.reason}: ${input.note.trim()}` : input.reason
  redemption.decidedAt = new Date().toISOString()
  redemption.decidedBy = "You"
  returnGold(redemption)
  return row(redemption)
}

/** A failed delivery is tried again, or refunded. */
export async function retryRedemption(id: string) {
  await wait()
  const redemption = find(id)
  if (redemption.status !== "failed") throw new Error("Only a failed delivery can be retried.")
  redemption.status = "processing"
  redemption.failure = null
  deliver(redemption)
  return row(redemption)
}

export async function refundRedemption(id: string) {
  await wait()
  const redemption = find(id)
  if (redemption.status !== "failed") throw new Error("Only a failed delivery can be refunded.")
  redemption.status = "rejected"
  redemption.rejectReason = "The partner couldn't deliver"
  redemption.decidedAt = new Date().toISOString()
  returnGold(redemption)
  return row(redemption)
}

function returnGold(redemption: Redemption) {
  const user = desk.redeemers.find((item) => item.id === redemption.userId)
  if (user) user.goldBalance += redemption.bars
}

export async function getOffers(): Promise<OfferRow[]> {
  await wait()
  return desk.offers.map((offer) => offerRow(offer.id))
}

export async function updateOffer({ id, update }: { id: string; update: OfferUpdate }) {
  await wait()
  const offer = desk.offers.find((item) => item.id === id)
  if (!offer) throw new Error("Reward not found")
  if (update.priceBars !== undefined && (!Number.isInteger(update.priceBars) || update.priceBars < 1)) throw new Error("The price must be a whole number of bars.")
  Object.assign(offer, update)
  return offerRow(id)
}

export async function getPartners(): Promise<PartnerRow[]> {
  await wait()
  return desk.partners.map((partner) => partnerRow(partner.id))
}

function partnerRow(id: string): PartnerRow {
  const now = Date.now()
  const partner = desk.partners.find((item) => item.id === id)
  if (!partner) throw new Error("Partner not found")
  const offers = desk.offers.filter((offer) => offer.partnerId === id).map((offer) => offerRow(offer.id, now))
  const month = new Date(now).toISOString().slice(0, 7)
  const monthly = desk.redemptions.filter((item) => item.status === "fulfilled" && (item.decidedAt ?? item.requestedAt).slice(0, 7) === month && offers.some((offer) => offer.id === item.offerId))
  const face = monthly.reduce((sum, item) => sum + offers.find((offer) => offer.id === item.offerId)!.faceValueGhs, 0)
  return {
    ...structuredClone(partner), offers,
    redeemed30d: offers.reduce((sum, offer) => sum + offer.redeemed30d, 0),
    monthFaceValueGhs: face,
    monthPayableGhs: Math.round(face * (100 - partner.discountPercent)) / 100,
    lowStock: offers.filter(lowOnStock).length,
  }
}

export async function getPartner(id: string) {
  await wait()
  const partner = partnerRow(id)
  const recent = desk.redemptions.filter((item) => partner.offers.some((offer) => offer.id === item.offerId))
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)).slice(0, 8).map((item) => row(item))
  return { ...partner, recent }
}

export async function setPartnerStatus({ id, status }: { id: string; status: "active" | "paused" }) {
  await wait()
  const partner = desk.partners.find((item) => item.id === id)
  if (!partner) throw new Error("Partner not found")
  partner.status = status
  return partnerRow(id)
}

/** Adds a batch of voucher codes, one per line; repeats and blanks are dropped. */
export async function addCodes({ offerId, codes }: { offerId: string; codes: string[] }) {
  await wait()
  const offer = desk.offers.find((item) => item.id === offerId)
  if (!offer || offer.stock === null) throw new Error("Only vouchers take codes.")
  const known = new Set([...(desk.codes[offerId] ?? []), ...desk.redemptions.map((item) => item.fulfilment?.code).filter(Boolean)])
  const fresh = [...new Set(codes.map((code) => code.trim()).filter(Boolean))].filter((code) => !known.has(code))
  if (!fresh.length) throw new Error("No new codes: they were empty or already added.")
  desk.codes[offerId] = [...(desk.codes[offerId] ?? []), ...fresh]
  offer.stock += fresh.length
  desk.batches.push({ id: `b-${desk.batches.length + 1}`, offerId, addedAt: new Date().toISOString(), addedBy: "You", count: fresh.length, issued: 0 })
  return { added: fresh.length, skipped: codes.filter((code) => code.trim()).length - fresh.length, offer: offerRow(offerId) }
}

// The sample's own "Delivering" request lands like any other.
for (const redemption of desk.redemptions) if (redemption.status === "processing") deliver(redemption)
