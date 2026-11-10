// Rewards: partners give AdBox airtime, data bundles and shopping vouchers; people spend gold
// bars on them; admins approve each redemption. There is no rewards API yet: `api.ts` serves
// sample data in these shapes, so a real service can replace it without touching the screens.

export type PartnerKind = "telco" | "retail"
/** Top-ups go straight to a phone number through the partner; vouchers are codes from uploaded batches. */
export type Delivery = "topup" | "code"
export type OfferKind = "airtime" | "data" | "voucher"

export type Partner = {
  id: string
  name: string
  shortName: string
  kind: PartnerKind
  delivery: Delivery
  status: "active" | "paused"
  /** What AdBox pays the partner: face value less this discount (percent). */
  discountPercent: number
  contact: { name: string; email: string; phone: string }
  agreementEnds: string
  notes: string
}

export type Offer = {
  id: string
  partnerId: string
  kind: OfferKind
  name: string
  faceValueGhs: number
  priceBars: number
  active: boolean
  /** Redemptions one person may make in a calendar month. */
  monthlyLimit: number
  /** Codes left for a voucher; top-ups have no stock. */
  stock: number | null
  lowStockAt: number
}

export type CodeBatch = { id: string; offerId: string; addedAt: string; addedBy: string; count: number; issued: number }

export type Redeemer = {
  id: string
  name: string
  username: string
  phone: string
  phoneVerified: boolean
  joinedAt: string
  institution: string | null
  campusBadge: boolean
  goldBalance: number
}

/**
 * pending: gold held, waiting for an admin · processing: approved, the partner is delivering ·
 * fulfilled: delivered · rejected: refused, gold returned · failed: the partner could not deliver.
 */
export type RedemptionStatus = "pending" | "processing" | "fulfilled" | "rejected" | "failed"

export type Redemption = {
  id: string
  reference: string
  userId: string
  offerId: string
  /** Where a top-up goes; vouchers are shown in the app instead. */
  phone: string | null
  bars: number
  status: RedemptionStatus
  requestedAt: string
  decidedAt: string | null
  decidedBy: string | null
  rejectReason: string | null
  /** The partner's transaction reference for a top-up, or the voucher code issued. */
  fulfilment: { reference?: string; code?: string } | null
  failure: string | null
}

export type CheckTone = "ok" | "look" | "problem"
export type RedemptionCheck = { tone: CheckTone; text: string }
export type Risk = "low" | "review" | "high"

export type RedemptionRow = Redemption & { user: Redeemer; offer: Offer; partner: Partner; checks: RedemptionCheck[]; risk: Risk }
export type RedemptionDetail = RedemptionRow & { history: RedemptionRow[] }

export type RedemptionQuery = { status: RedemptionStatus | "all"; partnerId?: string; search?: string; risk?: Risk }

export type OfferRow = Offer & { partner: Partner; redeemed30d: number; batches: CodeBatch[] }

export type PartnerRow = Partner & {
  offers: OfferRow[]
  redeemed30d: number
  /** Face value delivered this month, and what AdBox owes the partner for it. */
  monthFaceValueGhs: number
  monthPayableGhs: number
  lowStock: number
}

export type RewardsOverview = {
  pending: number
  oldestPendingAt: string | null
  lowRiskPending: number
  failed: number
  barsRedeemed30d: number
  faceValue30d: number
  fulfilled30d: number
  byPartner: Array<{ partnerId: string; name: string; count: number; faceValueGhs: number }>
  stockAlerts: OfferRow[]
  statusCounts: Record<RedemptionStatus | "all", number>
}

export type RejectInput = { reason: string; note?: string }
export type OfferUpdate = Partial<Pick<Offer, "priceBars" | "active" | "monthlyLimit">>
