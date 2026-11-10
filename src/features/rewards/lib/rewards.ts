import type { Delivery, Offer, OfferKind, Partner, Redeemer, Redemption, RedemptionCheck, RedemptionStatus, Risk } from "../types"

export const statusLabels: Record<RedemptionStatus, string> = {
  pending: "Waiting for approval", processing: "Delivering", fulfilled: "Delivered", rejected: "Rejected", failed: "Failed",
}
export const statusShort: Record<RedemptionStatus, string> = {
  pending: "Waiting", processing: "Delivering", fulfilled: "Delivered", rejected: "Rejected", failed: "Failed",
}
export const kindLabels: Record<OfferKind, string> = { airtime: "Airtime", data: "Data bundle", voucher: "Shopping voucher" }
export const deliveryLabels: Record<Delivery, string> = { topup: "Top-ups to phone numbers", code: "Voucher codes" }
export const riskLabels: Record<Risk, string> = { low: "All clear", review: "Take a look", high: "High risk" }

export const rejectReasons = ["Suspected abuse", "Over the monthly limit", "Phone number not valid", "Out of stock", "Other"] as const

const DAY = 86_400_000

export const ghs = (value: number) => `GH₵ ${value.toLocaleString("en-GH", { minimumFractionDigits: value % 1 ? 2 : 0, maximumFractionDigits: 2 })}`
export const bars = (value: number) => `${value.toLocaleString()} ${value === 1 ? "bar" : "bars"}`

/** "12m", "3h 5m", "2d". */
export function since(iso: string, now: number) {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000))
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return minutes % 60 ? `${hours}h ${minutes % 60}m` : `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

function accountAge(joinedAt: string, now: number) {
  const days = Math.floor((now - new Date(joinedAt).getTime()) / DAY)
  if (days < 1) return "today"
  if (days < 60) return `${days} ${days === 1 ? "day" : "days"} ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} ${days < 730 ? "year" : "years"} ago`
}

/**
 * What a reviewer should know before approving: who is asking, where the reward goes, and
 * whether it fits the limits and the stock. Only waiting requests are checked.
 */
export function checkRedemption(redemption: Redemption, ctx: {
  user: Redeemer
  offer: Offer
  partner: Partner
  redeemers: Redeemer[]
  redemptions: Redemption[]
  now: number
}): RedemptionCheck[] {
  const { user, offer, partner, now } = ctx
  const checks: RedemptionCheck[] = []
  const days = (now - new Date(user.joinedAt).getTime()) / DAY
  checks.push(days < 14
    ? { tone: "problem", text: `New account: joined ${accountAge(user.joinedAt, now)}.` }
    : days < 60 ? { tone: "look", text: `Joined ${accountAge(user.joinedAt, now)}.` }
      : { tone: "ok", text: `On AdBox since ${accountAge(user.joinedAt, now)}.` })

  if (offer.kind !== "voucher") {
    const sharing = ctx.redeemers.filter((other) => other.id !== user.id && other.phone === redemption.phone)
    if (sharing.length) checks.push({ tone: "problem", text: `${redemption.phone} is also the number on ${sharing.map((other) => `@${other.username}`).join(", ")}.` })
    checks.push(user.phoneVerified
      ? { tone: "ok", text: `Top-up to their verified number ${redemption.phone}.` }
      : { tone: "look", text: `Phone number ${redemption.phone} isn't verified.` })
  }

  const month = new Date(now).toISOString().slice(0, 7)
  const thisMonth = ctx.redemptions.filter((other) => other.userId === user.id && other.offerId === offer.id && other.status !== "rejected" && other.requestedAt.slice(0, 7) === month).length
  checks.push(thisMonth > offer.monthlyLimit
    ? { tone: "problem", text: `Over the monthly limit: ${thisMonth} of ${offer.monthlyLimit} this month.` }
    : { tone: "ok", text: `${thisMonth} of ${offer.monthlyLimit} allowed this month.` })

  const lastDay = ctx.redemptions.filter((other) => other.userId === user.id && now - new Date(other.requestedAt).getTime() < DAY).length
  if (lastDay >= 3) checks.push({ tone: "look", text: `${lastDay} requests in the last day.` })

  if (offer.stock !== null) {
    if (offer.stock === 0) checks.push({ tone: "problem", text: "No codes left for this voucher: add codes before approving." })
    else if (offer.stock <= offer.lowStockAt) checks.push({ tone: "look", text: `Only ${offer.stock} ${offer.stock === 1 ? "code" : "codes"} left.` })
  }
  if (partner.status === "paused") checks.push({ tone: "problem", text: `${partner.name} is paused.` })
  if (!offer.active) checks.push({ tone: "look", text: "This reward is switched off in the catalog." })
  return checks
}

export function riskOf(checks: RedemptionCheck[]): Risk {
  if (checks.some((check) => check.tone === "problem")) return "high"
  if (checks.some((check) => check.tone === "look")) return "review"
  return "low"
}

/** The gold a reward costs against its face value at the store rate: positive means it costs more than buying the gold. */
export function premiumPercent(offer: Pick<Offer, "priceBars" | "faceValueGhs">, barsPerCedi: number) {
  return Math.round((offer.priceBars / (offer.faceValueGhs * barsPerCedi) - 1) * 100)
}

/** Shows only the last four digits, as reviewers rarely need more. */
export const maskCode = (code: string) => `••••-${code.slice(-4)}`

export const initials = (name: string) => name.split(/[\s(]+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase()

export const errorText = (error: unknown, fallback: string) => (error instanceof Error && error.message ? error.message : fallback)

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })

/** The end date when an agreement runs out within 90 days (or already has), so renewal isn't missed. */
export function agreementSoon(endsOn: string, now: number) {
  const left = new Date(`${endsOn}T23:59:59Z`).getTime() - now
  return left < 90 * DAY ? formatDate(endsOn) : null
}
