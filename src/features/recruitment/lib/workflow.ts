import { isAxiosError } from "axios"
import type { ApplicationStatus, ApplicationSummary } from "../types"

// One name per stage everywhere on the page: the pipeline, badges, filters and history.
export const statusLabels: Record<ApplicationStatus, string> = {
  SUBMITTED: "New", UNDER_REVIEW: "In review", SHORTLISTED: "Shortlisted", INTERVIEWED: "Interviewed", ACCEPTED: "Accepted", REJECTED: "Rejected", WITHDRAWN: "Withdrawn",
}

/** The way forward, in order; Rejected and Withdrawn close an application at any point. */
export const pipeline = ["SUBMITTED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEWED", "ACCEPTED"] as const satisfies readonly ApplicationStatus[]
export const closedStatuses = ["REJECTED", "WITHDRAWN"] as const satisfies readonly ApplicationStatus[]

/** What a stage means, and what the reviewer does next for an application in it. */
export const stageGuide: Record<ApplicationStatus, { meaning: string; nextStep: string }> = {
  SUBMITTED: { meaning: "Waiting for a first look", nextStep: "Give it a first look" },
  UNDER_REVIEW: { meaning: "Being assessed", nextStep: "Decide whether to shortlist" },
  SHORTLISTED: { meaning: "To be interviewed", nextStep: "Interview them" },
  INTERVIEWED: { meaning: "Waiting for the final call", nextStep: "Accept or reject" },
  ACCEPTED: { meaning: "On the team", nextStep: "On the team" },
  REJECTED: { meaning: "Not taken forward", nextStep: "Closed" },
  WITHDRAWN: { meaning: "Pulled out", nextStep: "Closed" },
}

/** The button that moves an application one stage forward, by the stage it moves to. */
export const advanceLabels: Partial<Record<ApplicationStatus, string>> = {
  UNDER_REVIEW: "Start review", SHORTLISTED: "Shortlist", INTERVIEWED: "Mark as interviewed", ACCEPTED: "Accept",
}

/** The next stage forward, or undefined once an application is closed or accepted. */
export function nextStage(status: ApplicationStatus) {
  return transitions[status].find(next => next !== "REJECTED" && next !== "WITHDRAWN")
}

export const isClosed = (status: ApplicationStatus) => transitions[status].length === 0
export const statusTones: Record<ApplicationStatus, string> = {
  SUBMITTED: "bg-blue/8 text-blue dark:bg-cyan/10 dark:text-cyan",
  UNDER_REVIEW: "bg-warning-200/70 text-warning-1000 dark:bg-warning-500/10 dark:text-warning-400",
  SHORTLISTED: "bg-purple/10 text-blue dark:bg-purple/15 dark:text-purple",
  INTERVIEWED: "bg-blue/10 text-blue dark:bg-blue/20 dark:text-grey-200",
  ACCEPTED: "bg-success-200/70 text-success-1000 dark:bg-success-500/10 dark:text-success-400",
  REJECTED: "bg-error-100 text-error-800 dark:bg-error-400/10 dark:text-error-400",
  WITHDRAWN: "bg-muted text-muted-foreground",
}
// Mirror the backend's recruitment-status.ts; the server remains authoritative.
export const transitions: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
  SUBMITTED: ["UNDER_REVIEW", "REJECTED", "WITHDRAWN"], UNDER_REVIEW: ["SHORTLISTED", "REJECTED", "WITHDRAWN"],
  SHORTLISTED: ["INTERVIEWED", "REJECTED", "WITHDRAWN"], INTERVIEWED: ["ACCEPTED", "REJECTED", "WITHDRAWN"],
  ACCEPTED: [], REJECTED: [], WITHDRAWN: [],
}
export function recruitmentError(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.status === 403) return "Your account does not have permission for this recruitment action."
    if (error.response?.status === 404) return "This record or video is no longer available. Refresh to see the latest data."
    if (error.response?.status === 409) return "The application has changed or this move is no longer allowed. Review its latest status before trying again."
    if (error.response?.status === 422) return "This video is not ready to view. Try again later."
  }
  return "We couldn't complete this request. Check your connection and try again."
}
export function formatDate(value: string, includeTime = false) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}) }).format(new Date(value))
}
export function reviewerName(actor: ApplicationSummary["reviewedBy"]) {
  return actor ? [actor.firstName, actor.lastName].filter(Boolean).join(" ") || actor.email : "Admin"
}
export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join("").toUpperCase() || "—"
}
