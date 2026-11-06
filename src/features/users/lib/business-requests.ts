import type { DeclineReason } from "./page-requests"
import type { BusinessRequest } from "../validation"

/**
 * Business requests (backend `docs/business-accounts.md`): someone asks for a business account
 * from their own account. Approving makes it its own account with a verified company, run by them.
 * Statuses and the history come from the page requests; the words here are the business's.
 */

/** Why a business request was declined: the backend's own labels. */
export const businessDeclineReasonLabels: Record<DeclineReason, string> = {
  ALREADY_HAS_PAGE: "The business already has an account",
  NOT_OFFICIAL: "Not a real business",
  PROOF_NOT_ENOUGH: "The proof is not enough",
  IMPERSONATION: "Impersonation",
  OTHER: "Something else",
}

export const companySizeLabels: Record<string, string> = {
  SOLO: "Just one person",
  SMALL: "2–10 people",
  MEDIUM: "11–50 people",
  LARGE: "51–200 people",
  ENTERPRISE: "More than 200 people",
}

/** "University of Ghana · Legon", or null when it serves no campus in particular. */
export function servesLine(serves: BusinessRequest["serves"]) {
  if (!serves) return null
  return serves.campus ? `${serves.institution} · ${serves.campus}` : serves.institution
}

export type ProofCheck = { key: string; label: string }

/**
 * What the reviewer confirms on the proof before approving. A registered business sends its
 * certificate; one that isn't sends a photo of the shop, stall or menu.
 */
export function proofChecks(request: Pick<BusinessRequest, "name" | "registrationNumber">): ProofCheck[] {
  if (request.registrationNumber) return [
    { key: "certificate", label: `It's a Registrar-General certificate for ${request.name}` },
    { key: "number", label: `Its number reads ${request.registrationNumber}` },
    { key: "genuine", label: "Nothing on it looks edited" },
  ]
  return [
    { key: "real", label: "It shows a real shop, stall, menu or product" },
    { key: "fits", label: `It fits ${request.name} and what they said it does` },
    { key: "genuine", label: "It isn't a stock or downloaded picture" },
  ]
}
