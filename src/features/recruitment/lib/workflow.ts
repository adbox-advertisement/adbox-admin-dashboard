import { isAxiosError } from "axios"
import type { ApplicationStatus, ApplicationSummary } from "../types"

export const statusLabels: Record<ApplicationStatus, string> = {
  SUBMITTED: "Submitted", UNDER_REVIEW: "Under review", SHORTLISTED: "Shortlisted", INTERVIEWED: "Interviewed", ACCEPTED: "Accepted", REJECTED: "Rejected", WITHDRAWN: "Withdrawn",
}
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
