import type { ReactNode } from "react"
import { useLocation } from "react-router-dom"
import { Lock } from "lucide-react"
import { cn } from "../lib/cn"
import { APP_ROUTES } from "@/routes/paths"
import { contentErrorMessage } from "../lib/errors"
import { formatDate, formatRelative } from "../lib/format"
import type { ReportStatus } from "../types"
import { BackLink, ErrorState, ink, muted, skeleton, surface } from "./ContentBits"
import { ReportStatusPill } from "./ReportBits"

/** Back link, loading and error states shared by both report detail pages. */
export function ReportShell<T>({ query, render }: { query: { isPending: boolean; isError: boolean; error: unknown; data: T | undefined; refetch: () => unknown }; render: (data: T) => ReactNode }) {
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  const back = <BackLink to={from ?? APP_ROUTES.userContentReports}>Report queue</BackLink>
  return <div className="flex min-w-0 flex-col gap-4 px-4 sm:px-6">
    {back}
    {query.isPending && <div role="status" aria-label="Loading report" className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className={cn(surface, "h-72 animate-pulse lg:col-span-7")} />
      <div className={cn(surface, "space-y-3 p-5 lg:col-span-5")}><span className={cn(skeleton, "block h-4 w-24")} /><span className={cn(skeleton, "block h-5 w-2/3")} /><span className={cn(skeleton, "block h-24 w-full")} /></div>
    </div>}
    {query.isError && <div className={surface}><ErrorState message={contentErrorMessage(query.error, "Could not load this report.")} onRetry={() => void query.refetch()} /></div>}
    {query.data !== undefined && render(query.data)}
  </div>
}

export function ReportSummary({ reason, status, details, createdAt, reporter }: { reason: ReactNode; status: ReportStatus | null; details: string | null; createdAt: string; reporter: ReactNode }) {
  return <section aria-label="Report" className={cn(surface, "flex flex-col gap-4 p-5")}>
    <div className="flex flex-wrap items-center gap-1.5">{reason}<ReportStatusPill status={status} /></div>
    {details
      ? <blockquote className={cn("border-l-4 border-purple/40 pl-3 text-sm italic leading-6", ink)}>“{details}”</blockquote>
      : <p className={cn("text-b3", muted)}>The reporter didn't add details.</p>}
    <div className="flex flex-wrap items-end justify-between gap-3 border-t border-grey-100 pt-4 dark:border-border">
      <div className="min-w-0">
        <p className={cn("mb-1.5 text-b3 font-semibold uppercase tracking-wide", muted)}>Reported by</p>
        {reporter}
      </div>
      <p className={cn("text-b3", muted)} title={formatDate(createdAt, "MMM d, yyyy 'at' h:mm a") ?? undefined}>{formatRelative(createdAt)}</p>
    </div>
  </section>
}

export function ReadOnlyNotice() {
  return <p className={cn(surface, "flex items-start gap-3 p-5 text-sm leading-6", muted)}>
    <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />Resolving reports needs the <span className="font-mono text-b3">user.content.moderate</span> permission.
  </p>
}
