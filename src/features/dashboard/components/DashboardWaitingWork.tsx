import { Link } from "react-router-dom"
import { Award, Building2, CircleCheck, ClipboardList, FileText, Flag, MessageSquareWarning, ShieldCheck, Store, UserRoundSearch, type LucideIcon } from "lucide-react"
import { useWaitingWork, type ActivitySection, type WaitingQueue } from "@/features/activity"
import { cn } from "../lib/cn"
import { APP_ROUTES } from "@/routes/paths"
import { formatCount, plural } from "../lib/figures"
import { Card, LoadError } from "./DashboardBits"
import { focusRing, hairline, ink, muted } from "./tokens"

const QUEUES: Record<ActivitySection, { icon: LucideIcon; description: string; to?: string }> = {
  adRequests: { icon: ClipboardList, description: "Ads waiting for a review" },
  reportedAds: { icon: Flag, description: "Ads people reported" },
  contentReports: { icon: MessageSquareWarning, description: "Posts, comments and chats reported" },
  pageRequests: { icon: FileText, description: "Official pages people asked for" },
  businessRequests: { icon: Store, description: "Business accounts people asked for" },
  companies: { icon: Building2, description: "Companies waiting for the seal", to: `${APP_ROUTES.manageUsersCompanies}?status=PENDING_VERIFICATION` },
  verification: { icon: ShieldCheck, description: "Student and staff IDs to check" },
  honours: { icon: Award, description: "Gye Nyame nominees to decide" },
  recruitment: { icon: UserRoundSearch, description: "Campus rep applications" },
}

/**
 * Every queue this admin can open, most waiting first, with the counts the sidebar badges show
 * (kept live by the layout). Hidden when the admin can open none.
 */
export function DashboardWaitingWork() {
  const work = useWaitingWork()
  if (!work.isPending && !work.isError && work.queues.length === 0) return null
  const total = work.queues.reduce((sum, queue) => sum + queue.count, 0)
  const busy = work.queues.filter((queue) => queue.count > 0).length

  return <section className="px-4 sm:px-6">
    <Card title="Waiting for you" description={work.isPending ? "Counting what's waiting…"
      : work.isError ? undefined
      : total === 0 ? "All clear: nothing is waiting in the queues you can open."
      : `${plural(total, "item", "items")} in ${plural(busy, "queue", "queues")}. Each queue opens oldest first.`}>
      {work.isError ? <LoadError message="Couldn't count the waiting work." onRetry={() => void work.refetch()} />
        : work.isPending ? <div role="status" aria-label="Loading the queues" className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => <span key={index} className="h-[68px] animate-pulse rounded-2xl bg-grey-100 dark:bg-muted" />)}
        </div>
        : <ul aria-label="Queues" className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {work.queues.map((queue) => <QueueTile key={queue.section} queue={queue} />)}
        </ul>}
    </Card>
  </section>
}

function QueueTile({ queue }: { queue: WaitingQueue }) {
  const { icon: Icon, description, to } = QUEUES[queue.section]
  const waiting = queue.count > 0
  return <li>
    <Link to={to ?? queue.route} aria-label={`${queue.label}: ${waiting ? `${formatCount(queue.count)} waiting` : "clear"}`}
      className={cn("group flex h-full items-center gap-3 rounded-2xl border px-4 py-3 transition-colors hover:border-purple/40 hover:bg-grey-50 dark:hover:bg-background", hairline, focusRing)}>
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", waiting ? "bg-warning-500/10 text-warning-700 dark:text-warning-300" : "bg-grey-100 text-grey-500 dark:bg-muted dark:text-muted-foreground")}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-b3 font-semibold group-hover:text-purple md:text-b2", ink)}>{queue.label}</span>
        <span className={cn("line-clamp-2 block text-b4 leading-4 md:text-b3 md:leading-4", muted)}>{description}</span>
      </span>
      {waiting
        ? <span className="shrink-0 text-right">
          <span className="block font-heading text-h5 font-semibold leading-6 tabular-nums text-warning-700 dark:text-warning-300">{formatCount(queue.count)}</span>
          <span className={cn("block text-b4", muted)}>waiting</span>
        </span>
        : <span className={cn("inline-flex shrink-0 items-center gap-1 text-b3 font-semibold", muted)}><CircleCheck className="size-4" aria-hidden="true" />Clear</span>}
    </Link>
  </li>
}
