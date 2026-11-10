import { differenceInCalendarDays, differenceInMonths } from "date-fns"

/**
 * Page requests: groups inside a school (faculties, halls, churches, clubs…) asking for an official
 * page, a publisher account with the Staff & faculty badge, run by the person who asked — they switch
 * to it from their own account, with no password (backend `docs/group-pages.md`). Design: the mobile
 * app's `docs/design/group-pages/` (AdminQueue, AdminReview). The requests themselves come from
 * super-admin's `/page-requests` (`../api.ts`); these are the labels and helpers both reviews use.
 */

export const pageRequestStatuses = ["NEW", "IN_REVIEW", "NEEDS_CHANGES", "APPROVED", "DECLINED"] as const
export type PageRequestStatus = typeof pageRequestStatuses[number]

/** The statuses still waiting on someone. */
export const openPageRequestStatuses: PageRequestStatus[] = ["NEW", "IN_REVIEW", "NEEDS_CHANGES"]

export const pageRequestStatusLabels: Record<PageRequestStatus, string> = {
  NEW: "New",
  IN_REVIEW: "In review",
  NEEDS_CHANGES: "Needs changes",
  APPROVED: "Approved",
  DECLINED: "Declined",
}

export const groupKinds = ["FACULTY", "HALL", "CHURCH", "MUSLIM", "CLUB", "UNION", "ALUMNI", "OTHER"] as const
export type GroupKind = typeof groupKinds[number]

export const groupKindLabels: Record<GroupKind, string> = {
  FACULTY: "Faculty",
  HALL: "Hall",
  CHURCH: "Church",
  MUSLIM: "Muslim association",
  CLUB: "Club",
  UNION: "Students' union",
  ALUMNI: "Alumni",
  OTHER: "Group",
}

export const declineReasons = ["ALREADY_HAS_PAGE", "NOT_OFFICIAL", "PROOF_NOT_ENOUGH", "IMPERSONATION", "OTHER"] as const
export type DeclineReason = typeof declineReasons[number]

export const declineReasonLabels: Record<DeclineReason, string> = {
  ALREADY_HAS_PAGE: "The group already has a page",
  NOT_OFFICIAL: "Not an official group",
  PROOF_NOT_ENOUGH: "The proof is not enough",
  IMPERSONATION: "Impersonation",
  OTHER: "Something else",
}

/** What the reviewer confirms on the letter before approving. */
/** Said where a page or business asked for a page or business: approving refuses it too. */
export const sentByAccountNote = "Sent by a page or business, which can't run another account. Decline it: they can ask again from their own account."

export function letterChecks(requester: string) {
  return [
    { key: "letterhead", label: "On the group's or institution's letterhead" },
    { key: "signed", label: "Signed by the patron, dean or chaplain" },
    { key: "names", label: `Names ${requester} as allowed to run the page` },
    { key: "dated", label: "Dated in the last 6 months" },
  ]
}

/** One automatic check. `short` is the queue's one-line summary of it. */
export type PageRequestCheck = { tone: "ok" | "look" | "problem"; text: string; short?: string }

export function kindLine(request: { kind: GroupKind; detail: string | null }) {
  return request.detail ? `${groupKindLabels[request.kind]} · ${request.detail}` : groupKindLabels[request.kind]
}

export function placeLine(request: { institution: string; campus: string | null }) {
  return request.campus ? `${request.institution} · ${request.campus}` : request.institution
}

/** A group's initials for its logo: what is in brackets, a word in capitals, then first letters. */
export function groupInitials(name: string) {
  const bracketed = /\(([A-Za-z]{2,5})\)/.exec(name)
  if (bracketed) return bracketed[1].toUpperCase()
  const words = name.split(/[\s,]+/).map((word) => word.replace(/[^A-Za-z']/g, "")).filter(Boolean)
  const capitals = words.find((word) => /^[A-Z]{2,5}$/.test(word))
  if (capitals) return capitals
  const small = new Set(["of", "and", "the", "for", "at", "in", "on"])
  return words.filter((word) => !small.has(word.toLowerCase())).map((word) => word[0].toUpperCase()).slice(0, 4).join("") || "?"
}

/** "1 day", "5 days", "today": how long it has waited since it was sent. */
export function waitingFor(sentAt: string, now = new Date()) {
  const days = differenceInCalendarDays(now, new Date(sentAt))
  if (days <= 0) return "today"
  return days === 1 ? "1 day" : `${days} days`
}

/** "on AdBox 1 yr", "8 mo", "3 weeks". */
export function accountAge(joinedAt: string, now = new Date()) {
  const months = differenceInMonths(now, new Date(joinedAt))
  if (months >= 12) {
    const years = Math.floor(months / 12)
    return `${years} yr${years === 1 ? "" : "s"}`
  }
  if (months >= 1) return `${months} mo`
  const weeks = Math.max(1, Math.floor(differenceInCalendarDays(now, new Date(joinedAt)) / 7))
  return `${weeks} week${weeks === 1 ? "" : "s"}`
}

/** The worst automatic check, for the queue's Checks column. */
export function checksSummary(checks: PageRequestCheck[]): { tone: PageRequestCheck["tone"]; label: string } {
  const problems = checks.filter((check) => check.tone === "problem")
  if (problems.length) return { tone: "problem", label: problems.map((check) => check.short ?? "Problem").join(" · ") }
  const looks = checks.filter((check) => check.tone === "look")
  if (looks.length) return { tone: "look", label: looks.map((check) => check.short ?? "Look").join(" · ") }
  return { tone: "ok", label: "All clear" }
}

/** The same rules as the app's request form and the backend: 3–30 of a–z, 0–9, dots and underscores. */
export function usernameFormatProblem(username: string) {
  if (username.length < 3) return "At least 3 characters."
  if (username.length > 30) return "At most 30 characters."
  if (!/^[a-z0-9._]+$/.test(username)) return "Only lower-case letters, numbers, dots and underscores."
  if (username.startsWith(".") || username.endsWith(".") || username.includes("..")) return "A dot can't start or end it, or follow another dot."
  return null
}
