import { useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import { ArchiveRestore, ClipboardList, Eye, Heart, LibraryBig, MessageCircle, Share2, ShieldAlert, Trash2, UserRound, type LucideIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "../lib/cn"
import { APP_ROUTES } from "@/routes/paths"
import { useContentAccess, useContentScope, useRemovePost, useRestorePost, useUserPost } from "../hooks"
import { contentErrorMessage } from "../lib/errors"
import { compactNumber, formatBytes, formatDate, formatDuration, formatRelative } from "../lib/format"
import { profilePath } from "../lib/paths"
import { CONTENT_PERMISSIONS, humanize, mediaTypeLabels, postTitle, uploaderName, visibilityLabels, type UserPost } from "../types"
import { BackLink, ErrorState, Fact, Pill, Section, UploaderAvatar, ink, muted, skeleton, surface } from "../components/ContentBits"
import { mediaIcons } from "../lib/media"
import { PostViewer } from "../components/PostViewer"
import { ReasonDialog } from "../components/ReasonDialog"

export function PostDetailPage() {
  const { postId } = useParams()
  const location = useLocation()
  const post = useUserPost(postId)
  const from = (location.state as { from?: string } | null)?.from
  const back = <BackLink to={from ?? APP_ROUTES.userContentPosts}>{from ? "Back" : "All posts"}</BackLink>

  if (post.isPending) return <div className="flex min-w-0 flex-col gap-4 px-4 sm:px-6">{back}<DetailSkeleton /></div>
  if (post.isError) return <div className="flex min-w-0 flex-col gap-4 px-4 sm:px-6">{back}<div className={surface}><ErrorState message={contentErrorMessage(post.error, "Could not load this post.")} onRetry={() => void post.refetch()} /></div></div>

  return <div className="flex min-w-0 flex-col gap-4 px-4 sm:px-6">
    {back}
    <PostDetail post={post.data} />
  </div>
}

function PostDetail({ post }: { post: UserPost }) {
  const { can } = useContentAccess()
  const { scopeTo } = useContentScope()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState("")
  const remove = useRemovePost()
  const restore = useRestorePost()
  const canModerate = can(CONTENT_PERMISSIONS.moderate)
  const video = post.videoResource
  const Icon = mediaIcons[post.mediaType]
  const name = uploaderName(post.user)

  function confirm(reason: { reason?: string }) {
    setError("")
    const done = (message: string) => () => { toast.success(message); setConfirming(false) }
    if (post.removed) restore.mutate(post.id, { onSuccess: done("Post restored"), onError: (cause) => setError(contentErrorMessage(cause, "Could not restore the post. Try again.")) })
    else remove.mutate({ postId: post.id, input: reason }, { onSuccess: done("Post removed from AdBox"), onError: (cause) => setError(contentErrorMessage(cause, "Could not remove the post. Try again.")) })
  }

  return <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
    <section aria-label="Post media" className={cn(surface, "p-3 sm:p-4 lg:sticky lg:top-24 lg:col-span-7")}>
      <PostViewer post={post} />
    </section>

    <div className="flex min-w-0 flex-col gap-4 lg:col-span-5">
      <header className={cn(surface, "p-5")}>
        <div className="mb-3 flex flex-wrap gap-1.5">
          <Pill tone="purple"><Icon className="size-3" aria-hidden="true" />{mediaTypeLabels[post.mediaType].one}</Pill>
          {post.status && <Pill tone={post.status === "PUBLIC" ? "success" : "neutral"}>{visibilityLabels[post.status]}</Pill>}
          {post.removed && <Pill tone="danger">Removed by admin</Pill>}
          {video?.transcodingStatus === "FAILED" && <Pill tone="danger">Processing failed</Pill>}
        </div>
        <h2 className={cn("break-words font-heading text-h6 font-bold leading-snug", ink)}>{postTitle(post)}</h2>
        <p className={cn("mt-1.5 text-b3", muted)}>Posted {formatDate(post.createdAt, "MMM d, yyyy 'at' h:mm a")} · {formatRelative(post.createdAt)}</p>
        {post.title && post.description && <p className={cn("mt-4 whitespace-pre-line break-words text-sm leading-6", muted)}>{post.description}</p>}
      </header>

      {post.removed && <div role="status" className="flex gap-3 rounded-[20px] border border-destructive/25 bg-destructive/5 p-4">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
        <div className="min-w-0 text-sm leading-6">
          <p className={cn("font-semibold", ink)}>This post is hidden from AdBox</p>
          <p className={muted}>It doesn't appear in feeds, on {name}'s profile, in playback or through share links. Its engagement is kept.</p>
        </div>
      </div>}

      <section aria-label="Uploaded by" className={cn(surface, "p-5")}>
        <div className="flex items-center gap-3">
          <UploaderAvatar user={post.user} size="lg" />
          <div className="min-w-0 flex-1">
            <p className={cn("truncate text-b1 font-semibold leading-snug", ink)}>{name}</p>
            <p className={cn("truncate text-b3", muted)}>{[post.user.userProfile?.username && `@${post.user.userProfile.username}`, post.user.userProfile?.email].filter(Boolean).join(" · ")}</p>
            {!post.user.isActive && <Pill tone="danger" className="mt-1.5">Account suspended</Pill>}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button asChild variant="outline" className="h-10 rounded-full"><Link to={scopeTo(post.user.id, APP_ROUTES.userContent)}><LibraryBig className="size-4" aria-hidden="true" />All their content</Link></Button>
          {can(CONTENT_PERMISSIONS.usersRead) && <Button asChild variant="outline" className="h-10 rounded-full"><Link to={profilePath(post.user.id)}><UserRound className="size-4" aria-hidden="true" />Profile</Link></Button>}
        </div>
      </section>

      <section aria-label="Engagement" className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5">
        <Metric icon={Eye} label="Views" value={post.counts.views} />
        <Metric icon={Heart} label="Likes" value={post.counts.likes} />
        <Metric icon={MessageCircle} label="Comments" value={post.counts.comments} />
        <Metric icon={Share2} label="Shares" value={post.counts.shares} />
        <Metric icon={ClipboardList} label="Surveys" value={post.counts.surveys} />
      </section>

      <Section title="Details">
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {video && <>
            <Fact label="Duration" value={formatDuration(video.duration)} />
            <Fact label="File size" value={formatBytes(video.size)} />
            <Fact label="Resolution" value={video.resolution} />
            <Fact label="Processing" value={video.transcodingStatus ? humanize(video.transcodingStatus) : null} />
          </>}
          {post.mediaType === "IMAGE" && <Fact label="Pictures" value={String(post.imgResources.length)} />}
          <Fact label="Last updated" value={formatDate(post.updatedAt, "MMM d, yyyy 'at' h:mm a")} />
          <Fact label="Post ID" value={post.id} mono />
        </dl>
      </Section>

      {canModerate && <Section title="Moderation" description={post.removed ? "Put the post back where it was, with its previous visibility." : "Take the post down everywhere. You can restore it later."}>
        {post.removed
          ? <Button type="button" className="h-11 w-full cursor-pointer rounded-full" onClick={() => { setError(""); setConfirming(true) }}><ArchiveRestore className="size-4" aria-hidden="true" />Restore post</Button>
          : <Button type="button" variant="destructive" className="h-11 w-full cursor-pointer rounded-full" onClick={() => { setError(""); setConfirming(true) }}><Trash2 className="size-4" aria-hidden="true" />Remove post</Button>}
      </Section>}
    </div>

    {confirming && <ReasonDialog
      title={post.removed ? "Restore this post?" : "Remove this post?"}
      description={post.removed
        ? `The post returns to ${name}'s profile and to feeds with its previous visibility.`
        : `The post disappears from feeds, profiles, playback and share links. ${name}'s engagement data is kept and you can restore it later.`}
      confirmLabel={post.removed ? "Restore post" : "Remove post"}
      destructive={!post.removed}
      askReason={!post.removed}
      icon={post.removed ? <ArchiveRestore className="size-7 text-secondary" aria-hidden="true" /> : <Trash2 className="size-7 text-destructive" aria-hidden="true" />}
      pending={remove.isPending || restore.isPending}
      error={error}
      onConfirm={confirm}
      onClose={() => { setConfirming(false); setError("") }}
    />}
  </div>
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return <div className={cn(surface, "flex flex-col items-center px-2 py-3 text-center")}>
    <Icon className={cn("size-4", muted)} aria-hidden="true" />
    <p className={cn("mt-1.5 text-b1 font-bold tabular-nums leading-none", ink)}>{compactNumber(value)}</p>
    <p className={cn("mt-1 truncate text-b3", muted)}>{label}</p>
  </div>
}

function DetailSkeleton() {
  return <div role="status" aria-label="Loading post" className="grid grid-cols-1 gap-4 lg:grid-cols-12">
    <div className={cn(surface, "aspect-video animate-pulse lg:col-span-7")} />
    <div className="flex flex-col gap-4 lg:col-span-5">
      <div className={cn(surface, "space-y-3 p-5")}><span className={cn(skeleton, "block h-4 w-24")} /><span className={cn(skeleton, "block h-6 w-3/4")} /><span className={cn(skeleton, "block h-3 w-1/2")} /></div>
      <div className={cn(surface, "h-36 animate-pulse")} />
    </div>
  </div>
}
