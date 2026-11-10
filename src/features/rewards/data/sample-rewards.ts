import type { CodeBatch, Offer, Partner, Redeemer, Redemption, RedemptionStatus } from "../types"

// Sample rewards desk: the partners are AdBox's real partners, but every contact, offer,
// person and redemption here is invented, timed relative to `now`. Nothing reaches a partner.

/** The store's sample exchange rate (Financials › Gold & pricing): bars per cedi. */
export const BARS_PER_CEDI = 50

export const partners: Partner[] = [
  { id: "p-mtn", name: "MTN Ghana", shortName: "MTN", kind: "telco", delivery: "topup", status: "active", discountPercent: 4,
    contact: { name: "Partnerships desk", email: "partners@mtn.example", phone: "+233 24 000 0001" }, agreementEnds: "2027-06-30",
    notes: "Airtime and data go straight to the number through MTN's top-up service. Settled monthly." },
  { id: "p-telecel", name: "Telecel Ghana", shortName: "Telecel", kind: "telco", delivery: "topup", status: "active", discountPercent: 5,
    contact: { name: "Enterprise team", email: "enterprise@telecel.example", phone: "+233 20 000 0002" }, agreementEnds: "2027-03-31",
    notes: "Instant top-ups to Telecel numbers. Settled monthly." },
  { id: "p-at", name: "AT (AirtelTigo)", shortName: "AT", kind: "telco", delivery: "topup", status: "active", discountPercent: 5,
    contact: { name: "Business sales", email: "business@at.example", phone: "+233 27 000 0003" }, agreementEnds: "2026-12-31",
    notes: "Top-ups to AT numbers. Agreement ends this year: renewal is being discussed." },
  { id: "p-melcom", name: "Melcom", shortName: "Melcom", kind: "retail", delivery: "code", status: "active", discountPercent: 10,
    contact: { name: "Corporate gifting", email: "gifting@melcom.example", phone: "+233 30 000 0004" }, agreementEnds: "2027-09-30",
    notes: "Shopping vouchers as codes, sent in batches. Redeemable at any Melcom store." },
]

const offerSeeds: Offer[] = [
  { id: "o-mtn-air-5", partnerId: "p-mtn", kind: "airtime", name: "MTN airtime GH₵ 5", faceValueGhs: 5, priceBars: 300, active: true, monthlyLimit: 4, stock: null, lowStockAt: 0 },
  { id: "o-mtn-air-10", partnerId: "p-mtn", kind: "airtime", name: "MTN airtime GH₵ 10", faceValueGhs: 10, priceBars: 600, active: true, monthlyLimit: 4, stock: null, lowStockAt: 0 },
  { id: "o-mtn-data-1", partnerId: "p-mtn", kind: "data", name: "MTN data 1.5 GB", faceValueGhs: 10, priceBars: 600, active: true, monthlyLimit: 3, stock: null, lowStockAt: 0 },
  { id: "o-mtn-data-6", partnerId: "p-mtn", kind: "data", name: "MTN data 6 GB", faceValueGhs: 40, priceBars: 2300, active: true, monthlyLimit: 1, stock: null, lowStockAt: 0 },
  { id: "o-tel-air-5", partnerId: "p-telecel", kind: "airtime", name: "Telecel airtime GH₵ 5", faceValueGhs: 5, priceBars: 300, active: true, monthlyLimit: 4, stock: null, lowStockAt: 0 },
  { id: "o-tel-data-2", partnerId: "p-telecel", kind: "data", name: "Telecel data 2 GB", faceValueGhs: 15, priceBars: 900, active: true, monthlyLimit: 2, stock: null, lowStockAt: 0 },
  { id: "o-at-air-5", partnerId: "p-at", kind: "airtime", name: "AT airtime GH₵ 5", faceValueGhs: 5, priceBars: 300, active: true, monthlyLimit: 4, stock: null, lowStockAt: 0 },
  { id: "o-at-data-3", partnerId: "p-at", kind: "data", name: "AT data 3 GB", faceValueGhs: 12, priceBars: 700, active: true, monthlyLimit: 2, stock: null, lowStockAt: 0 },
  { id: "o-at-data-10", partnerId: "p-at", kind: "data", name: "AT data 10 GB", faceValueGhs: 30, priceBars: 1800, active: false, monthlyLimit: 1, stock: null, lowStockAt: 0 },
  { id: "o-mel-20", partnerId: "p-melcom", kind: "voucher", name: "Melcom voucher GH₵ 20", faceValueGhs: 20, priceBars: 1200, active: true, monthlyLimit: 2, stock: 0, lowStockAt: 5 },
  { id: "o-mel-50", partnerId: "p-melcom", kind: "voucher", name: "Melcom voucher GH₵ 50", faceValueGhs: 50, priceBars: 3000, active: true, monthlyLimit: 1, stock: 14, lowStockAt: 5 },
  { id: "o-mel-100", partnerId: "p-melcom", kind: "voucher", name: "Melcom voucher GH₵ 100", faceValueGhs: 100, priceBars: 6000, active: true, monthlyLimit: 1, stock: 2, lowStockAt: 3 },
]

const redeemerSeeds: Array<Omit<Redeemer, "joinedAt"> & { joinedDaysAgo: number }> = [
  { id: "u-kofi", name: "Kofi Mensah", username: "kofi.m", phone: "024 555 0142", phoneVerified: true, joinedDaysAgo: 420, institution: "KNUST", campusBadge: true, goldBalance: 1840 },
  { id: "u-abena", name: "Abena Owusu", username: "abena.o", phone: "020 555 0187", phoneVerified: true, joinedDaysAgo: 280, institution: "University of Ghana", campusBadge: true, goldBalance: 920 },
  { id: "u-yaw", name: "Yaw Osei", username: "yawosei", phone: "027 555 0119", phoneVerified: true, joinedDaysAgo: 81, institution: "University of Cape Coast", campusBadge: false, goldBalance: 310 },
  { id: "u-ama", name: "Ama Serwaa", username: "ama.serwaa", phone: "054 555 0163", phoneVerified: true, joinedDaysAgo: 330, institution: "University of Ghana", campusBadge: true, goldBalance: 6420 },
  { id: "u-kwame", name: "Kwame Appiah", username: "kwame.films", phone: "055 555 0108", phoneVerified: true, joinedDaysAgo: 345, institution: "Ashesi University", campusBadge: true, goldBalance: 2210 },
  { id: "u-esi", name: "Esi Nyarko", username: "esi.n", phone: "050 555 0176", phoneVerified: true, joinedDaysAgo: 150, institution: "UPSA", campusBadge: false, goldBalance: 480 },
  { id: "u-nii", name: "Nii Armah", username: "nii.armah", phone: "026 555 0131", phoneVerified: true, joinedDaysAgo: 210, institution: "Accra Technical University", campusBadge: true, goldBalance: 1290 },
  // Six days old, phone not verified, and the same number as another account: worth a look.
  { id: "u-new1", name: "Prince Boateng", username: "prince.b99", phone: "059 555 0199", phoneVerified: false, joinedDaysAgo: 6, institution: null, campusBadge: false, goldBalance: 40 },
  { id: "u-new2", name: "Joe Boat", username: "joeb.gh", phone: "059 555 0199", phoneVerified: true, joinedDaysAgo: 9, institution: null, campusBadge: false, goldBalance: 25 },
  { id: "u-efua", name: "Efua Quaye", username: "efua.quaye", phone: "024 555 0155", phoneVerified: true, joinedDaysAgo: 400, institution: "University of Ghana", campusBadge: true, goldBalance: 1550 },
  { id: "u-selasi", name: "Selasi Agbeko", username: "selasi.a", phone: "020 555 0124", phoneVerified: false, joinedDaysAgo: 305, institution: "Ho Technical University", campusBadge: true, goldBalance: 700 },
  { id: "u-fiifi", name: "Fiifi Mensah", username: "fiifi.codes", phone: "054 555 0172", phoneVerified: true, joinedDaysAgo: 435, institution: "KNUST", campusBadge: true, goldBalance: 3300 },
]

/** [reference, user, offer, status, minutes ago, extras] — the requests an admin works on now. */
const requestSeeds: Array<[string, string, string, RedemptionStatus, number, Partial<Redemption>?]> = [
  ["RDM-2061", "u-kofi", "o-mtn-air-10", "pending", 12],
  ["RDM-2060", "u-new1", "o-mtn-data-6", "pending", 25],
  ["RDM-2059", "u-new2", "o-mtn-data-6", "pending", 31],
  ["RDM-2058", "u-abena", "o-tel-data-2", "pending", 48],
  ["RDM-2057", "u-ama", "o-mel-100", "pending", 70],
  ["RDM-2056", "u-esi", "o-at-air-5", "pending", 95],
  ["RDM-2055", "u-kwame", "o-mel-50", "pending", 140],
  ["RDM-2054", "u-selasi", "o-tel-air-5", "pending", 190],
  ["RDM-2053", "u-yaw", "o-mel-20", "pending", 260],
  ["RDM-2052", "u-fiifi", "o-mtn-data-1", "pending", 330],
  ["RDM-2051", "u-nii", "o-at-data-3", "failed", 400, { failure: "AT returned “number not on network”: the number may have been ported.", decidedBy: "You" }],
  ["RDM-2050", "u-efua", "o-mtn-air-5", "processing", 410, { decidedBy: "Kwesi Boateng" }],
  ["RDM-2049", "u-kofi", "o-mtn-air-5", "fulfilled", 1500, { decidedBy: "You", fulfilment: { reference: "MTN-TXN-884213" } }],
  ["RDM-2048", "u-ama", "o-mel-50", "fulfilled", 2900, { decidedBy: "Esi Arthur", fulfilment: { code: "MLC50-7Q2K-91XD" } }],
  ["RDM-2047", "u-new1", "o-mtn-air-10", "rejected", 3100, { decidedBy: "You", rejectReason: "Suspected abuse", }],
]

/** Older, delivered redemptions so the month's figures and settlement have something to add up. */
function history(now: number): Redemption[] {
  const people = ["u-kofi", "u-abena", "u-ama", "u-kwame", "u-esi", "u-nii", "u-efua", "u-fiifi", "u-yaw"]
  const offers = ["o-mtn-air-5", "o-mtn-air-10", "o-mtn-data-1", "o-tel-air-5", "o-tel-data-2", "o-at-air-5", "o-at-data-3", "o-mel-50", "o-mtn-data-6", "o-mel-20"]
  return Array.from({ length: 46 }, (_, index) => {
    const offer = offerSeeds.find((item) => item.id === offers[(index * 7) % offers.length])!
    // Older than the requests above, newest first, spread over the last four weeks.
    const at = new Date(now - (54 + index * 14) * 3_600_000).toISOString()
    const telco = offer.kind !== "voucher"
    return {
      id: `r-h${index}`, reference: `RDM-${2046 - index}`, userId: people[(index * 5) % people.length], offerId: offer.id,
      phone: telco ? redeemerSeeds.find((user) => user.id === people[(index * 5) % people.length])!.phone : null,
      bars: offer.priceBars, status: "fulfilled", requestedAt: at, decidedAt: at, decidedBy: ["You", "Kwesi Boateng", "Esi Arthur"][index % 3],
      rejectReason: null, failure: null,
      fulfilment: telco ? { reference: `${offer.partnerId === "p-mtn" ? "MTN" : offer.partnerId === "p-telecel" ? "TCL" : "AT"}-TXN-${700000 + index * 131}` } : { code: `MLC${offer.faceValueGhs}-${(1000 + index).toString(36).toUpperCase()}-${(5000 + index * 7).toString(36).toUpperCase()}` },
    }
  })
}

/** A fresh copy of the sample rewards desk, as of `now`. */
export function buildSampleRewards(now = Date.now()) {
  const minutesAgo = (minutes: number) => new Date(now - minutes * 60_000).toISOString()
  const redeemers: Redeemer[] = redeemerSeeds.map(({ joinedDaysAgo, ...user }) => ({ ...user, joinedAt: minutesAgo(joinedDaysAgo * 1440) }))
  const offers = offerSeeds.map((offer) => ({ ...offer }))
  const recent: Redemption[] = requestSeeds.map(([reference, userId, offerId, status, ago, extras]) => {
    const offer = offers.find((item) => item.id === offerId)!
    const decided = status !== "pending"
    return {
      id: `r-${reference.slice(4)}`, reference, userId, offerId, bars: offer.priceBars, status,
      phone: offer.kind === "voucher" ? null : redeemers.find((user) => user.id === userId)!.phone,
      requestedAt: minutesAgo(ago), // The one still delivering was approved a moment ago.
      decidedAt: decided ? minutesAgo(status === "processing" ? 1 : Math.max(1, ago - 5)) : null,
      decidedBy: null, rejectReason: null, fulfilment: null, failure: null, ...extras,
    }
  })
  const batches: CodeBatch[] = [
    { id: "b-1", offerId: "o-mel-50", addedAt: minutesAgo(30 * 1440), addedBy: "Esi Arthur", count: 25, issued: 11 },
    { id: "b-2", offerId: "o-mel-100", addedAt: minutesAgo(30 * 1440), addedBy: "Esi Arthur", count: 10, issued: 8 },
    { id: "b-3", offerId: "o-mel-20", addedAt: minutesAgo(45 * 1440), addedBy: "You", count: 20, issued: 20 },
  ]
  // Codes not yet issued, per voucher offer, oldest batch first.
  const codes: Record<string, string[]> = {}
  for (const offer of offers) {
    if (offer.stock === null) continue
    codes[offer.id] = Array.from({ length: offer.stock }, (_, index) => `MLC${offer.faceValueGhs}-${(9000 + index).toString(36).toUpperCase()}-${(30000 + index * 97).toString(36).toUpperCase()}`)
  }
  return { partners: partners.map((partner) => ({ ...partner, contact: { ...partner.contact } })), offers, redeemers, redemptions: [...recent, ...history(now)], batches, codes }
}
