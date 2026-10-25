import { isUrgent } from "../lib/reports"
import { reportReasonLabels, reportStatusLabels, type ReportReason, type ReportStatus } from "../types"
import { Pill } from "./ContentBits"

export function ReasonPill({ reason }: { reason: ReportReason | null }) {
  return <Pill tone={isUrgent(reason) ? "danger" : "warning"}>{reason ? reportReasonLabels[reason] : "Unknown reason"}</Pill>
}

export function ReportStatusPill({ status }: { status: ReportStatus | null }) {
  if (!status) return <Pill>Unknown</Pill>
  return <Pill tone={status === "OPEN" ? "purple" : status === "ACTION_TAKEN" ? "success" : "neutral"}>{reportStatusLabels[status]}</Pill>
}
