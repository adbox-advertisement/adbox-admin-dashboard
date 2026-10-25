import { honourCheckLabels, type HonourCandidate } from "../types"

/** Everything that stands between a nominee and the honour, by name. */
export function unmetRules(candidate: HonourCandidate) {
  return [
    ...candidate.eligibility.checks.filter((check) => !check.met).map((check) => honourCheckLabels[check.key] ?? check.key),
    ...(candidate.meetsNominationRule ? [] : ["Nominations"]),
    ...(candidate.campusCap && candidate.campusCap.granted >= candidate.campusCap.limit ? ["Campus cap"] : []),
  ]
}

/** Check figures as words: { posts: 12, interactions: 40 } → "12 posts · 40 interactions". */
export function describeCheck(detail: Record<string, number> | undefined) {
  return detail ? Object.entries(detail).map(([key, value]) => `${value.toLocaleString()} ${key.replace(/([A-Z])/g, " $1").toLowerCase()}`).join(" · ") : null
}
