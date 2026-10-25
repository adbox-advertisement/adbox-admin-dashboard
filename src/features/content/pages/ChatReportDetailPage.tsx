import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { LibraryBig, MessageSquareOff, Paperclip, UserRound } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "../lib/cn"
import { APP_ROUTES } from "@/routes/paths"
import { useChatReport, useContentAccess, useContentScope, useResolveChatReport } from "../hooks"
import { contentErrorMessage } from "../lib/errors"
import { formatDate } from "../lib/format"
import { profilePath } from "../lib/paths"
import { CONTENT_PERMISSIONS, humanize, uploaderName, type ChatReportDetail } from "../types"
import { Pill, Section, UploaderAvatar, UploaderChip, ink, muted } from "../components/ContentBits"
import { ReasonPill } from "../components/ReportBits"
import { reportTargetLabels } from "../lib/reports"
import { ReadOnlyNotice, ReportShell, ReportSummary } from "../components/ReportLayout"
import { ResolutionSummary, ResolvePanel, type Resolution } from "../components/ResolvePanel"

export function ChatReportDetailPage() {
  const { reportId } = useParams()
  const report = useChatReport(reportId)
  return <ReportShell query={report} render={(data) => <ReportDetail report={data} />} />
}

function ReportDetail({ report }: { report: ChatReportDetail }) {
  const { can } = useContentAccess()
  const resolve = useResolveChatReport()
  const [error, setError] = useState("")
  const otherOpen = report.otherReports.filter((other) => other.status === "OPEN").length

  function onResolve({ outcome, note }: Resolution) {
    setError("")
    resolve.mutate({ reportId: report.id, input: { outcome, note } }, {
      onSuccess: () => toast.success(outcome === "DISMISSED" ? "Report dismissed" : "Report resolved"),
      onError: (cause) => setError(contentErrorMessage(cause, "Could not resolve the report. Try again.")),
    })
  }

  return <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
    <div className="flex min-w-0 flex-col gap-4 lg:col-span-7">
      <Section title={report.targetType === "MESSAGE" ? "Reported message, in context" : "Reported conversation"}
        description={report.targetType === "MESSAGE" ? "Copied when it was reported, with up to 20 messages before it. Deleting them later doesn't change this record." : `The last messages${report.snapshot.conversationType ? ` of this ${humanize(report.snapshot.conversationType).toLowerCase()} chat` : ""}, copied when it was reported.`}>
        <Transcript report={report} />
      </Section>
    </div>

    <div className="flex min-w-0 flex-col gap-4 lg:col-span-5">
      <ReportSummary reason={<><ReasonPill reason={report.reason} /><Pill>{reportTargetLabels[report.targetType]}</Pill></>} status={report.status} details={report.details} createdAt={report.createdAt}
        reporter={<UploaderChip user={report.reporter} size="sm" />} />
      {report.reportedUser && <ReportedPerson report={report} />}
      {report.status === "OPEN"
        ? can(CONTENT_PERMISSIONS.moderate)
          ? <ResolvePanel pending={resolve.isPending} error={error} otherOpen={otherOpen} onResolve={onResolve} />
          : <ReadOnlyNotice />
        : <ResolutionSummary status={report.status} resolvedAt={report.resolvedAt} note={report.resolutionNote} />}
    </div>
  </div>
}

function ReportedPerson({ report }: { report: ChatReportDetail }) {
  const { can } = useContentAccess()
  const { scopeTo } = useContentScope()
  const person = report.reportedUser
  if (!person) return null
  return <Section title="Person reported">
    <div className="flex items-center gap-3">
      <UploaderAvatar user={person} size="md" />
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-b2 font-semibold", ink)}>{uploaderName(person)}</p>
        {person.userProfile?.username && <p className={cn("truncate text-b3", muted)}>@{person.userProfile.username}</p>}
      </div>
      {!person.isActive && <Pill tone="danger">Suspended</Pill>}
    </div>
    {report.openReportsAgainstUser > 1 && <p className="mt-3 rounded-xl bg-destructive/5 px-3 py-2 text-b3 font-semibold text-destructive">{report.openReportsAgainstUser} open message reports against this person</p>}
    <div className="mt-4 grid grid-cols-2 gap-2">
      <Button asChild variant="outline" className="h-10 rounded-full"><Link to={scopeTo(person.id, APP_ROUTES.userContent)}><LibraryBig className="size-4" aria-hidden="true" />Their content</Link></Button>
      {can(CONTENT_PERMISSIONS.usersRead) && <Button asChild variant="outline" className="h-10 rounded-full"><Link to={profilePath(person.id)}><UserRound className="size-4" aria-hidden="true" />Profile</Link></Button>}
    </div>
  </Section>
}

function Transcript({ report }: { report: ChatReportDetail }) {
  const { messages, reportedMessageId } = report.snapshot
  if (messages.length === 0) return <div className={cn("flex items-center gap-3 rounded-2xl bg-grey-50 p-4 text-sm dark:bg-background", muted)}>
    <MessageSquareOff className="size-5 shrink-0" aria-hidden="true" />No messages were saved with this report.
  </div>
  // The reporter's own messages sit on the right, as in the app; everyone else's on the left.
  const nameOf = (senderId: string | null) => senderId === report.reporter?.id ? `${uploaderName(report.reporter)} (reporter)`
    : senderId && senderId === report.reportedUserId ? uploaderName(report.reportedUser) : "Another member"
  return <ol aria-label="Messages" className="flex max-h-[640px] flex-col gap-3 overflow-y-auto rounded-2xl bg-grey-50 p-3 dark:bg-background sm:p-4">
    {messages.map((message) => {
      const mine = message.senderId === report.reporter?.id
      const flagged = message.id === reportedMessageId
      return <li key={message.id} className={cn("flex max-w-[85%] flex-col gap-1", mine ? "items-end self-end" : "items-start self-start")}>
        <span className={cn("px-1 text-b3 font-semibold", muted)}>{nameOf(message.senderId)}</span>
        <div className={cn("rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-adbox-small",
          mine ? "rounded-tr-md bg-purple text-white" : "rounded-tl-md bg-white dark:bg-card",
          flagged && "ring-2 ring-destructive ring-offset-2 ring-offset-grey-50 dark:ring-offset-background")}>
          {message.deletedAt
            ? <span className="italic opacity-75">Deleted before the report</span>
            : <span className={cn("whitespace-pre-line break-words", !mine && ink)}>{message.text || (message.kind !== "TEXT" ? humanize(message.kind) : "Empty message")}</span>}
          {message.attachments > 0 && <span className={cn("mt-1 flex items-center gap-1 text-b3", mine ? "text-white/80" : muted)}><Paperclip className="size-3.5" aria-hidden="true" />{message.attachments} {message.attachments === 1 ? "attachment" : "attachments"}</span>}
        </div>
        <span className={cn("flex items-center gap-1.5 px-1 text-b3", muted)}>
          {flagged && <span className="font-semibold text-destructive">Reported message ·</span>}
          {formatDate(message.createdAt, "MMM d, h:mm a")}
        </span>
      </li>
    })}
  </ol>
}
