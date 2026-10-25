import { Link, useLocation } from "react-router-dom"
import { AlertTriangle, Eye, Heart, Images, MessageCircle, Play, Type } from "lucide-react"
import { cn } from "../lib/cn"
import { compactNumber, formatDuration, formatRelative } from "../lib/format"
import { mediaIcons, postCover } from "../lib/media"
import { postPath } from "../lib/paths"
import { mediaTypeLabels, postTitle, visibilityLabels, type UserPost } from "../types"
import { Pill, UploaderChip, focusRing, ink, muted, skeleton, surface } from "./ContentBits"

/** Where the detail page's Back link returns: the exact list (filters, page) the post was opened from. */
function useFrom() {
  const location = useLocation()
  return { from: location.pathname + location.search }
}

function StatusPills({ post, onMedia }: { post: UserPost; onMedia?: boolean }) {
  const glass = onMedia ? "bg-white/95 dark:bg-card" : undefined
  return <>
    {post.removed && <Pill tone="danger" className={glass}>Removed</Pill>}
    {post.status && post.status !== "PUBLIC" && <Pill className={glass}>{visibilityLabels[post.status]}</Pill>}
    {post.videoResource?.transcodingStatus === "FAILED" && <Pill tone="danger" className={glass}><AlertTriangle className="size-3" aria-hidden="true" />Processing failed</Pill>}
  </>
}

export function Engagement({ post, className }: { post: UserPost; className?: string }) {
  return <p className={cn("flex items-center gap-3 text-b3 tabular-nums", muted, className)}>
    <span className="flex items-center gap-1" title="Views"><Eye className="size-3.5" aria-hidden="true" /><span className="sr-only">Views</span>{compactNumber(post.counts.views)}</span>
    <span className="flex items-center gap-1" title="Likes"><Heart className="size-3.5" aria-hidden="true" /><span className="sr-only">Likes</span>{compactNumber(post.counts.likes)}</span>
    <span className="flex items-center gap-1" title="Comments"><MessageCircle className="size-3.5" aria-hidden="true" /><span className="sr-only">Comments</span>{compactNumber(post.counts.comments)}</span>
  </p>
}

/** The visual part of a card: the cover, or the words themselves for a text post. */
export function PostMedia({ post, className, compact }: { post: UserPost; className?: string; compact?: boolean }) {
  const cover = postCover(post)
  const Icon = mediaIcons[post.mediaType]
  const duration = formatDuration(post.videoResource?.duration ?? null)
  return <div className={cn("relative overflow-hidden bg-grey-100 dark:bg-muted", className)}>
    {post.mediaType === "TEXT"
      ? <div className={cn("flex size-full items-center bg-[image:var(--gradient-purple)] text-white", compact ? "justify-center" : "p-5")}>
        {compact ? <Type className="size-6" aria-hidden="true" /> : <p className="line-clamp-5 whitespace-pre-line break-words text-b2 font-semibold leading-snug">{post.description || post.title || "Empty text post"}</p>}
      </div>
      : cover
        ? <img src={cover} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none" />
        : <span className="flex size-full items-center justify-center text-grey-400 dark:text-muted-foreground"><Icon className={compact ? "size-5" : "size-8"} aria-hidden="true" /></span>}
    {compact
      ? post.mediaType === "VIDEO" && <span className="absolute inset-0 flex items-center justify-center bg-black/15 text-white"><Play className="size-4 fill-current" aria-hidden="true" /></span>
      : <PostOverlays post={post} duration={duration} />}
  </div>
}

function PostOverlays({ post, duration }: { post: UserPost; duration: string | null }) {
  const Icon = mediaIcons[post.mediaType]
  return <>
    {post.mediaType === "VIDEO" && <span className="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-90 backdrop-blur-sm transition-transform group-hover:scale-110 motion-reduce:transition-none">
      <Play className="ml-0.5 size-5 fill-current" aria-hidden="true" />
    </span>}
    <span className="absolute left-2.5 top-2.5 flex max-w-[calc(100%-1.25rem)] flex-wrap gap-1">
      <span className="flex size-7 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm" title={mediaTypeLabels[post.mediaType].one}><Icon className="size-3.5" aria-hidden="true" /></span>
      <StatusPills post={post} onMedia />
    </span>
    <span className="absolute bottom-2.5 right-2.5 flex gap-1">
      {duration && <span className="rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-white">{duration}</span>}
      {post.mediaType === "IMAGE" && post.imgResources.length > 1 && <span className="flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white"><Images className="size-3" aria-hidden="true" />{post.imgResources.length}</span>}
    </span>
  </>
}

export function PostCard({ post, uploaderTo }: { post: UserPost; uploaderTo?: string }) {
  const state = useFrom()
  const title = postTitle(post)
  return <li className={cn(surface, "group relative flex min-w-0 flex-col overflow-hidden transition-shadow hover:shadow-adbox-medium", post.removed && "opacity-80")}>
    <PostMedia post={post} className="aspect-[4/3]" />
    <div className="flex flex-1 flex-col gap-3 p-4">
      {/* The title link covers the card, so the whole card opens the post; the uploader link sits above it. */}
      <Link to={postPath(post.id)} state={state} aria-label={`Open ${title}`} className={cn("line-clamp-2 text-b2 font-semibold leading-snug after:absolute after:inset-0 after:rounded-[20px] hover:text-purple", ink, focusRing, "focus-visible:after:ring-2 focus-visible:after:ring-purple focus-visible:ring-0")}>{title}</Link>
      <div className="relative z-10 mt-auto flex items-center justify-between gap-2">
        <UploaderChip user={post.user} to={uploaderTo} size="xs" />
        <span className={cn("shrink-0 text-b3", muted)}>{formatRelative(post.createdAt)}</span>
      </div>
      <Engagement post={post} className="border-t border-grey-100 pt-3 dark:border-border" />
    </div>
  </li>
}

export function PostRow({ post, uploaderTo }: { post: UserPost; uploaderTo?: string }) {
  const state = useFrom()
  const title = postTitle(post)
  return <li className="group relative grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 px-4 py-3 transition-colors hover:bg-grey-50/70 dark:hover:bg-background/60 sm:px-5 md:grid-cols-12">
    <PostMedia post={post} compact className="size-14 rounded-xl md:col-span-1" />
    <div className="min-w-0 md:col-span-5">
      <Link to={postPath(post.id)} state={state} className={cn("line-clamp-1 text-b2 font-semibold after:absolute after:inset-0 hover:text-purple", ink, focusRing)}>{title}</Link>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <span className={cn("text-b3", muted)}>{mediaTypeLabels[post.mediaType].one}</span>
        <StatusPills post={post} />
      </div>
    </div>
    <div className="relative z-10 col-span-2 min-w-0 md:col-span-3"><UploaderChip user={post.user} to={uploaderTo} /></div>
    <div className="col-span-2 flex items-center justify-between gap-3 md:col-span-3 md:justify-end">
      <Engagement post={post} />
      <span className={cn("shrink-0 text-b3", muted)}>{formatRelative(post.createdAt)}</span>
    </div>
  </li>
}

export function PostGridSkeleton({ count = 8, className }: { count?: number; className?: string }) {
  return <ul role="status" aria-label="Loading posts" className={className}>
    {Array.from({ length: count }, (_, index) => <li key={index} className={cn(surface, "overflow-hidden")}>
      <div className="aspect-[4/3] animate-pulse bg-grey-100 dark:bg-muted" />
      <div className="space-y-2.5 p-4"><span className={cn(skeleton, "block h-3.5 w-3/4")} /><span className={cn(skeleton, "block h-3 w-1/2")} /></div>
    </li>)}
  </ul>
}
