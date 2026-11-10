import { Link, useLocation } from "react-router-dom"
import { ChevronRight, CircleCheck, CircleSlash, Flag, Inbox, MessagesSquare, ShieldCheck } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "../lib/cn"
import { APP_ROUTES } from "@/routes/paths"
import { useChatReports, useContentReports, useListParams, useOpenReportCounts } from "../hooks"
import { contentErrorMessage } from "../lib/errors"
import { formatDate, formatRelative } from "../lib/format"
import { chatReportPath, contentReportPath } from "../lib/paths"
import { reportReasonLabels, uploaderName, type ChatReport, type ContentReport, type ReportReason, type ReportStatus } from "../types"
import { reportReasons, reportStatuses } from "../validation"
import { EmptyState, ErrorState, FilterChips, MoreLink, PageIntro, Segmented, Toolbar, focusRing, ink, muted, skeleton, surface } from "../components/ContentBits"
import { ReasonPill } from "../components/ReportBits"
import { isUrgent, reportTargetIcons, reportTargetLabels } from "../lib/reports"

const PAGE_SIZE = 20
const defaults = { queue: "content", status: "OPEN", reason: "all" }
const isReason = (value: string): value is ReportReason => (reportReasons as readonly string[]).includes(value)
const isStatus = (value: string): value is ReportStatus => (reportStatuses as readonly string[]).includes(value)

export function ReportsPage() {
  const { values, page, update } = useListParams(defaults)
  const queue = values.queue === "messages" ? "messages" : "content"
  const status = isStatus(values.status) ? values.status : "OPEN"
  const reason = isReason(values.reason) ? values.reason : undefined
  const query = { status, reason, page, limit: PAGE_SIZE }
  const content = useContentReports(query, queue === "content")
  const chats = useChatReports(query, queue === "messages")
  const open = useOpenReportCounts()
  const list = queue === "content" ? content : chats
  const noun = queue === "content" ? "reports" : "message reports"

  return <div className="flex min-w-0 flex-col gap-4 px-4 sm:px-6">
    <PageIntro action={<MoreLink to={APP_ROUTES.reportedAds}>Reported ads</MoreLink>}>
      Reports on posts, comments and messages, oldest first. Resolving one resolves every open report on the same {queue === "content" ? "post or comment" : "message or conversation"}. Reports on ads are in Ads Management.
    </PageIntro>
    <Toolbar>
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Segmented label="Report queue" value={queue} onChange={(next) => update({ ...values, queue: next })} className="max-w-full overflow-x-auto"
          options={[
            { value: "content", label: "Posts & comments", icon: Flag, count: open.content },
            { value: "messages", label: "Messages", icon: MessagesSquare, count: open.messages },
          ]} />
        <Select value={values.reason} onValueChange={(next) => update({ ...values, reason: next })}>
          <SelectTrigger aria-label="Report reason" className="h-11 w-full cursor-pointer rounded-full border-grey-200 bg-grey-50 text-b3 dark:border-border dark:bg-background md:w-[220px] md:text-b2"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Every reason</SelectItem>
            {reportReasons.map((value) => <SelectItem key={value} value={value}>{reportReasonLabels[value]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <FilterChips label="Report status" value={status} onChange={(next) => update({ ...values, status: next })} options={[
        { value: "OPEN", label: "Needs review", icon: Inbox },
        { value: "ACTION_TAKEN", label: "Action taken", icon: CircleCheck },
        { value: "DISMISSED", label: "Dismissed", icon: CircleSlash },
      ]} />
    </Toolbar>

    {list.isPending && <ReportsSkeleton />}
    {list.isError && <div className={surface}><ErrorState message={contentErrorMessage(list.error, "Could not load reports.")} onRetry={() => void list.refetch()} /></div>}
    {list.data && (list.data.items.length === 0
      ? <div className={surface}>
        {status === "OPEN" && !reason
          ? <EmptyState icon={ShieldCheck} title="All caught up">Nobody has reported {queue === "content" ? "a post or comment" : "a message"} that still needs review.</EmptyState>
          : <EmptyState icon={Flag} title={`No ${noun} here`}>Try another status or reason.</EmptyState>}
      </div>
      : <div className={cn("flex flex-col overflow-hidden transition-opacity", surface, list.isPlaceholderData && "opacity-60")} aria-busy={list.isPlaceholderData}>
        <ul aria-label={queue === "content" ? "Reported posts and comments" : "Reported messages"} className="divide-y divide-grey-100 dark:divide-border">
          {queue === "content"
            ? content.data?.items.map((report) => <ContentReportRow key={report.id} report={report} />)
            : chats.data?.items.map((report) => <ChatReportRow key={report.id} report={report} />)}
        </ul>
        <Pagination page={page} limit={PAGE_SIZE} total={list.data.total} noun={noun} onPageChange={(next) => update({ ...values, page: next })} />
      </div>)}
  </div>
}

function ContentReportRow({ report }: { report: ContentReport }) {
  return <ReportRow
    to={contentReportPath(report.id)}
    target={report.targetType}
    reason={report.reason}
    details={report.details}
    subject={`${reportTargetLabels[report.targetType]} reported by ${uploaderName(report.reporter)}`}
    createdAt={report.createdAt}
    resolvedAt={report.resolvedAt}
    others={report.status === "OPEN" ? report.openReportsOnTarget : 0}
  />
}

function ChatReportRow({ report }: { report: ChatReport }) {
  const about = report.reportedUser ? ` from ${uploaderName(report.reportedUser)}` : ""
  return <ReportRow
    to={chatReportPath(report.id)}
    target={report.targetType}
    reason={report.reason}
    details={report.details}
    subject={`${reportTargetLabels[report.targetType]}${about} · reported by ${uploaderName(report.reporter)}`}
    createdAt={report.createdAt}
    resolvedAt={report.resolvedAt}
    others={0}
  />
}

function ReportRow({ to, target, reason, details, subject, createdAt, resolvedAt, others }: {
  to: string
  target: keyof typeof reportTargetIcons
  reason: ReportReason | null
  details: string | null
  subject: string
  createdAt: string
  resolvedAt: string | null
  others: number
}) {
  const location = useLocation()
  const Icon = reportTargetIcons[target]
  const urgent = isUrgent(reason)
  return <li className="group relative flex items-center gap-4 px-4 py-4 transition-colors hover:bg-grey-50/70 dark:hover:bg-background/60 sm:px-5">
    <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl", urgent ? "bg-destructive/10 text-destructive" : "bg-warning-500/10 text-warning-700 dark:text-warning-300")}>
      <Icon className="size-5" aria-hidden="true" />
    </span>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <ReasonPill reason={reason} />
        {others > 1 && <span className={cn("rounded-full bg-grey-100 px-2 py-1 text-b3 font-semibold leading-none dark:bg-muted", ink)}>{others} reports on this</span>}
      </div>
      <Link to={to} state={{ from: location.pathname + location.search }} className={cn("mt-1.5 line-clamp-1 text-b2 font-semibold after:absolute after:inset-0 group-hover:text-purple", ink, focusRing)}>{subject}</Link>
      <p className={cn("mt-0.5 line-clamp-1 text-b3 leading-5", muted)}>{details ? `“${details}”` : "No details given"}</p>
    </div>
    <div className="hidden shrink-0 text-right sm:block">
      <p className={cn("text-b3 font-semibold", ink)} title={formatDate(createdAt, "MMM d, yyyy 'at' h:mm a") ?? undefined}>{resolvedAt ? `Resolved ${formatRelative(resolvedAt)}` : `Waiting ${formatRelative(createdAt)?.replace(/ ago$/, "")}`}</p>
      <p className={cn("text-b3", muted)}>Reported {formatDate(createdAt, "MMM d")}</p>
    </div>
    <ChevronRight className="size-5 shrink-0 text-grey-300 transition-transform group-hover:translate-x-0.5 group-hover:text-purple dark:text-muted-foreground" aria-hidden="true" />
  </li>
}

function ReportsSkeleton() {
  return <div role="status" aria-label="Loading reports" className={cn(surface, "divide-y divide-grey-100 dark:divide-border")}>
    {Array.from({ length: 5 }, (_, index) => <div key={index} className="flex items-center gap-4 px-5 py-4">
      <span className="size-11 animate-pulse rounded-2xl bg-grey-100 dark:bg-muted" />
      <div className="flex-1 space-y-2"><span className={cn(skeleton, "block h-3 w-20")} /><span className={cn(skeleton, "block h-4 w-2/3")} /><span className={cn(skeleton, "block h-3 w-1/2")} /></div>
    </div>)}
  </div>
}
