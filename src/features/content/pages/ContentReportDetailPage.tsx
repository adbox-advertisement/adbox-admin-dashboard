import { useState } from "react"
import { useParams } from "react-router-dom"
import { FileX2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "../lib/cn"
import { useContentAccess, useContentReport, useResolveContentReport } from "../hooks"
import { contentErrorMessage } from "../lib/errors"
import { formatDate, formatRelative } from "../lib/format"
import { postPath } from "../lib/paths"
import { CONTENT_PERMISSIONS, humanize, reportReasonLabels, type ContentReportDetail } from "../types"
import { MoreLink, Pill, Section, UploaderChip, ink, muted } from "../components/ContentBits"
import { ReasonPill, ReportStatusPill } from "../components/ReportBits"
import { reportTargetLabels } from "../lib/reports"
import { ReadOnlyNotice, ReportShell, ReportSummary } from "../components/ReportLayout"
import { ResolutionSummary, ResolvePanel, type Resolution } from "../components/ResolvePanel"

export function ContentReportDetailPage() {
  const { reportId } = useParams()
  const report = useContentReport(reportId)
  return <ReportShell query={report} render={(data) => <ReportDetail report={data} />} />
}


function ReportDetail({ report }: { report: ContentReportDetail }) {
  const { can } = useContentAccess()
  const resolve = useResolveContentReport()
  const [error, setError] = useState("")
  const target = report.target
  const removable = target?.type === "POST" ? !target.post.removed && "post" : target?.type === "COMMENT" ? !target.comment.deletedAt && "comment" : false
  const otherOpen = report.otherReports.filter((other) => other.status === "OPEN").length

  function onResolve(input: Resolution) {
    setError("")
    resolve.mutate({ reportId: report.id, input }, {
      onSuccess: () => toast.success(input.outcome === "DISMISSED" ? "Report dismissed" : input.removeContent ? `Report resolved and ${reportTargetLabels[report.targetType].toLowerCase()} removed` : "Report resolved"),
      onError: (cause) => setError(contentErrorMessage(cause, "Could not resolve the report. Try again.")),
    })
  }

  return <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
    <div className="flex min-w-0 flex-col gap-4 lg:col-span-7">
      <Section title={`Reported ${reportTargetLabels[report.targetType].toLowerCase()}`}
        action={target?.type === "POST" ? <MoreLink to={postPath(target.post.id)}>Open post</MoreLink> : <MoreLink to={postPath(report.resourceId)}>View the post</MoreLink>}>
        <ReportedContent report={report} />
      </Section>
      <Section title="Report history" description="Everyone who reported this, oldest first.">
        <ol className="flex flex-col gap-2">
          {[{ id: report.id, reason: report.reason, status: report.status, createdAt: report.createdAt }, ...report.otherReports]
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
            .map((entry) => <li key={entry.id} className={cn("flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2.5", entry.id === report.id ? "bg-purple/5 ring-1 ring-purple/20" : "bg-grey-50 dark:bg-background")}>
              <span className="flex items-center gap-2">
                <span className={cn("text-b3 font-semibold", ink)}>{entry.reason ? reportReasonLabels[entry.reason] : "Unknown reason"}</span>
                {entry.id === report.id && <span className={cn("text-b3", muted)}>(this report)</span>}
              </span>
              <span className="flex items-center gap-2"><span className={cn("text-b3", muted)}>{formatDate(entry.createdAt, "MMM d, h:mm a")}</span><ReportStatusPill status={entry.status} /></span>
            </li>)}
        </ol>
      </Section>
    </div>

    <div className="flex min-w-0 flex-col gap-4 lg:col-span-5">
      <ReportSummary reason={<ReasonPill reason={report.reason} />} status={report.status} details={report.details} createdAt={report.createdAt}
        reporter={<UploaderChip user={report.reporter} size="sm" />} />
      {report.status === "OPEN"
        ? can(CONTENT_PERMISSIONS.moderate)
          ? <ResolvePanel removable={removable || undefined} pending={resolve.isPending} error={error} otherOpen={otherOpen} onResolve={onResolve} />
          : <ReadOnlyNotice />
        : <ResolutionSummary status={report.status} resolvedAt={report.resolvedAt} note={report.resolutionNote} />}
    </div>
  </div>
}

function ReportedContent({ report }: { report: ContentReportDetail }) {
  const target = report.target
  if (!target) return <div className={cn("flex items-center gap-3 rounded-2xl bg-grey-50 p-4 text-sm dark:bg-background", muted)}>
    <FileX2 className="size-5 shrink-0" aria-hidden="true" />This {reportTargetLabels[report.targetType].toLowerCase()} no longer exists. Its owner may have deleted it.
  </div>
  if (target.type === "POST") {
    const post = target.post
    return <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <UploaderChip user={post.user} size="sm" />
        <div className="flex flex-wrap gap-1.5">
          <Pill tone="purple">{humanize(post.mediaType)}</Pill>
          {post.removed && <Pill tone="danger">Removed</Pill>}
        </div>
      </div>
      <blockquote className={cn("whitespace-pre-line break-words rounded-2xl bg-grey-50 p-4 text-sm leading-6 dark:bg-background", ink)}>{post.description || <span className={muted}>No caption</span>}</blockquote>
      <p className={cn("text-b3", muted)}>Posted {formatDate(post.createdAt, "MMM d, yyyy")} · {formatRelative(post.createdAt)}</p>
    </div>
  }
  const comment = target.comment
  return <div className="flex flex-col gap-3">
    <div className="flex gap-3">
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-grey-50 p-4 dark:bg-background">
        <UploaderChip user={comment.user} size="xs" />
        <p className={cn("mt-2 whitespace-pre-line break-words text-sm leading-6", comment.deletedAt ? muted : ink)}>
          {comment.deletedAt ? comment.deletedBy === "MODERATOR" ? "Removed by a moderator." : "Deleted by its author." : comment.commentText || "Empty comment"}
        </p>
      </div>
    </div>
    <p className={cn("text-b3", muted)}>Commented {formatDate(comment.createdAt, "MMM d, yyyy 'at' h:mm a")}</p>
  </div>
}
