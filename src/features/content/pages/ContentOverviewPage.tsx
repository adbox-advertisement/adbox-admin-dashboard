import { Link } from "react-router-dom"
import { ArrowRight, ClipboardList, Flag, LibraryBig, Megaphone, ShieldCheck, Trash2, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "../lib/cn"
import { APP_ROUTES } from "@/routes/paths"
import { useContentScope, useContentSummary, useOpenReportCounts, useTopUploaders, useUserPosts } from "../hooks"
import { contentErrorMessage } from "../lib/errors"
import { compactNumber } from "../lib/format"
import { contentPath } from "../lib/paths"
import { mediaTypeLabels, uploaderName, type ContentSummary, type TopUploader } from "../types"
import { mediaTypes } from "../validation"
import { EmptyState, ErrorState, MoreLink, Section, StatCard, UploaderAvatar, focusRing, ink, muted, skeleton, surface } from "../components/ContentBits"
import { PostCard, PostGridSkeleton } from "../components/PostCards"
import { mediaIcons } from "../lib/media"

const summaryKeys = { VIDEO: "videos", IMAGE: "images", TEXT: "text" } as const satisfies Record<string, keyof ContentSummary>

export function ContentOverviewPage() {
  const { userId, withScope } = useContentScope()
  const summary = useContentSummary(userId)
  const reports = useOpenReportCounts(!userId)
  const data = summary.data
  const live = data ? data.videos + data.images + data.text : undefined

  if (summary.isError) return <div className="px-4 sm:px-6"><div className={surface}><ErrorState message={contentErrorMessage(summary.error, "Could not load the content overview.")} onRetry={() => void summary.refetch()} /></div></div>

  return <div className="flex min-w-0 flex-col gap-4 px-4 sm:px-6">
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {!userId && <AttentionCard total={reports.total} content={reports.content} messages={reports.messages} />}
      <section aria-label="Content overview" className={cn("grid grid-cols-1 gap-4 min-[400px]:grid-cols-2", userId ? "lg:col-span-12 xl:grid-cols-4" : "lg:col-span-7")}>
        <StatCard icon={LibraryBig} tone="purple" label="Live posts" value={live} to={withScope(APP_ROUTES.userContentPosts)}
          hint={data ? `${compactNumber(data.videos)} videos · ${compactNumber(data.images)} pictures · ${compactNumber(data.text)} text` : undefined} />
        {/* Everyone's ads are in Ads Management; one uploader's are listed with their content. */}
        <StatCard icon={Megaphone} tone="blue" label="Ads running now" value={data?.activeAds} to={userId ? withScope(APP_ROUTES.userContentAds, { status: "ACTIVE" }) : APP_ROUTES.adsManagement}
          hint={data ? `${data.ads.toLocaleString()} ${data.ads === 1 ? "ad" : "ads"} in total${userId ? "" : " · Ads Management"}` : undefined} />
        <StatCard icon={ClipboardList} tone="success" label="Surveys collecting" value={data?.activeSurveys} to={withScope(APP_ROUTES.userContentSurveys, { status: "active" })}
          hint={data ? `${data.surveys.toLocaleString()} ${data.surveys === 1 ? "survey" : "surveys"} in total` : undefined} />
        <StatCard icon={Trash2} tone="danger" label="Removed posts" value={data?.removedPosts} to={withScope(APP_ROUTES.userContentPosts, { state: "removed" })} hint="Taken down by admins" />
      </section>
    </div>

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <Section className="lg:col-span-5" title="Content mix" description="Live posts by format. Select one to browse it.">
        {data && live !== undefined ? <ul aria-label="Live posts by format" className="flex flex-col gap-1">
          {mediaTypes.map((type) => {
            const value = data[summaryKeys[type]]
            const share = live > 0 ? value / live : 0
            const Icon = mediaIcons[type]
            return <li key={type}>
              <Link to={withScope(APP_ROUTES.userContentPosts, { type })} className={cn("block rounded-xl px-2 py-2.5 transition-colors hover:bg-grey-50 dark:hover:bg-background", focusRing)}>
                <span className="flex items-center justify-between gap-3">
                  <span className={cn("flex items-center gap-2 text-b2 font-semibold", ink)}><Icon className="size-4 text-purple" aria-hidden="true" />{mediaTypeLabels[type].many}</span>
                  <span className="text-b3 tabular-nums"><span className={cn("font-semibold", ink)}>{value.toLocaleString()}</span><span className={cn("ml-1.5", muted)}>{Math.round(share * 100)}%</span></span>
                </span>
                <span className="mt-2 block h-2 overflow-hidden rounded-full bg-grey-100 dark:bg-muted" aria-hidden="true">
                  <span className="block h-full rounded-full bg-[image:var(--gradient-purple)]" style={{ width: `${Math.max(share * 100, value > 0 ? 2 : 0)}%` }} />
                </span>
              </Link>
            </li>
          })}
        </ul> : <div role="status" aria-label="Loading content mix" className="space-y-5 py-2">{[0, 1, 2].map((index) => <span key={index} className={cn(skeleton, "block h-8")} />)}</div>}
      </Section>
      {userId
        ? <RecentUploads userId={userId} className="lg:col-span-7" compact />
        : <TopCreators className="lg:col-span-7" />}
    </div>

    {!userId && <RecentUploads />}
  </div>
}

function AttentionCard({ total, content, messages }: { total: number | undefined; content: number | undefined; messages: number | undefined }) {
  const clear = total === 0
  return <section aria-label="Needs attention" className="relative flex min-h-56 flex-col justify-between overflow-hidden rounded-[20px] bg-[image:var(--gradient-dark-blue)] p-6 text-white shadow-adbox-medium lg:col-span-5">
    <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-[image:var(--gradient-purple)] opacity-40 blur-2xl" />
    <div className="relative flex items-center gap-2 text-b3 font-semibold uppercase tracking-wide text-white/70">
      {clear ? <ShieldCheck className="size-4" aria-hidden="true" /> : <Flag className="size-4" aria-hidden="true" />}Moderation queue
    </div>
    <div className="relative mt-6">
      {total === undefined
        ? <span className="block h-12 w-20 animate-pulse rounded-lg bg-white/15" aria-label="Loading" />
        : <p className="text-h3 font-bold leading-none tabular-nums">{clear ? "All clear" : total.toLocaleString()}</p>}
      <p className="mt-2 text-b2 text-white/80">
        {clear ? "No reports are waiting for a decision." : total === undefined ? "Checking reports…" : `${total === 1 ? "report needs" : "reports need"} a decision · ${content ?? 0} on posts and comments, ${messages ?? 0} on messages`}
      </p>
    </div>
    <Button asChild className="relative mt-6 h-11 w-fit rounded-full bg-white px-5 text-grey-1000 hover:bg-white/90">
      <Link to={APP_ROUTES.userContentReports}>{clear ? "View past reports" : "Review the queue"}<ArrowRight className="size-4" aria-hidden="true" /></Link>
    </Button>
  </section>
}

function TopCreators({ className }: { className?: string }) {
  const { scopeTo } = useContentScope()
  const uploaders = useTopUploaders()
  const rows = (uploaders.data ?? []).filter((entry): entry is TopUploader & { user: NonNullable<TopUploader["user"]> } => Boolean(entry.user))
  const top = rows[0]?.posts ?? 0
  return <Section className={className} title="Top creators" description="Most live posts. Select someone to see only their content." bodyClassName="px-3 pb-3">
    {uploaders.isPending && <div role="status" aria-label="Loading top creators" className="space-y-3 px-2 py-1">{[0, 1, 2, 3].map((index) => <span key={index} className={cn(skeleton, "block h-10")} />)}</div>}
    {uploaders.isError && <ErrorState message={contentErrorMessage(uploaders.error, "Could not load top creators.")} onRetry={() => void uploaders.refetch()} />}
    {uploaders.data && rows.length === 0 && <EmptyState icon={Trophy} title="No creators yet">People who post appear here.</EmptyState>}
    {rows.length > 0 && <ol className="flex flex-col">
      {rows.slice(0, 6).map((entry, index) => <li key={entry.user.id}>
        <Link to={scopeTo(entry.user.id, APP_ROUTES.userContent)} aria-label={`${uploaderName(entry.user)}, ${entry.posts} posts. Show only their content`}
          className={cn("grid grid-cols-[1.5rem_auto_1fr_auto] items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-grey-50 dark:hover:bg-background", focusRing)}>
          <span className={cn("text-center text-b2 font-bold tabular-nums", index === 0 ? "text-purple" : muted)}>{index + 1}</span>
          <UploaderAvatar user={entry.user} size="md" />
          <span className="min-w-0">
            <span className={cn("block truncate text-b2 font-semibold", ink)}>{uploaderName(entry.user)}</span>
            <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-grey-100 dark:bg-muted" aria-hidden="true">
              <span className="block h-full rounded-full bg-blue dark:bg-cyan" style={{ width: `${top ? Math.max((entry.posts / top) * 100, 3) : 0}%` }} />
            </span>
          </span>
          <span className="text-right">
            <span className={cn("block text-b2 font-bold tabular-nums", ink)}>{compactNumber(entry.posts)}</span>
            <span className={cn("block text-b3", muted)}>{entry.videos}v · {entry.images}p · {entry.text}t</span>
          </span>
        </Link>
      </li>)}
    </ol>}
  </Section>
}

function RecentUploads({ userId, className, compact }: { userId?: string; className?: string; compact?: boolean }) {
  const posts = useUserPosts({ userId, state: "live", limit: compact ? 4 : 8 })
  const grid = compact ? "grid grid-cols-1 gap-4 min-[480px]:grid-cols-2" : "grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  return <section aria-labelledby="recent-uploads" className={cn("flex min-w-0 flex-col gap-3", className)}>
    <div className="flex items-end justify-between gap-3 px-1">
      <div>
        <h2 id="recent-uploads" className={cn("font-heading text-b1 font-semibold", ink)}>Latest uploads</h2>
        <p className={cn("text-b3", muted)}>The newest live posts, of every format.</p>
      </div>
      <MoreLink to={contentPath(APP_ROUTES.userContentPosts, { userId })}>See all</MoreLink>
    </div>
    {posts.isPending && <PostGridSkeleton count={compact ? 2 : 4} className={grid} />}
    {posts.isError && <div className={surface}><ErrorState message={contentErrorMessage(posts.error, "Could not load the latest uploads.")} onRetry={() => void posts.refetch()} /></div>}
    {posts.data && (posts.data.items.length === 0
      ? <div className={surface}><EmptyState icon={LibraryBig} title="Nothing posted yet">New uploads appear here.</EmptyState></div>
      : <ul aria-label="Latest uploads" className={grid}>{posts.data.items.map((post) => <PostCard key={post.id} post={post} />)}</ul>)}
  </section>
}
