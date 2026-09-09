import { useRef } from "react"
import { ChevronLeft, ChevronRight, Film, FolderOpen, ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { CollectionPostGroup, VideoPost } from "../../types/posts"
import { formatPostDate } from "../../utils/post-format"
import { uploadSchools } from "../../data/schools"
import { ImagePreview } from "../shared/ImagePreview"

type Props = {
  post: VideoPost | undefined
  group: CollectionPostGroup | undefined
  onClose: () => void
  onNavigate: (id: string) => void
  onReturnFocus: () => void
}

export function PostDetailsSheet({ post, group, onClose, onNavigate, onReturnFocus }: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const index = group?.posts.findIndex(({ id }) => id === post?.id) ?? -1
  const school = uploadSchools.find(({ id }) => id === group?.collection.schoolId)

  function navigate(direction: -1 | 1) {
    const next = group?.posts[index + direction]
    if (next) onNavigate(next.id)
  }

  return (
    <Sheet open={Boolean(post && group)} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent
        className="video-management-ui w-full gap-0 overflow-hidden bg-card sm:w-[600px]"
        closeLabel="Close post details"
        onOpenAutoFocus={(event) => { event.preventDefault(); titleRef.current?.focus({ preventScroll: true }) }}
        onCloseAutoFocus={(event) => { event.preventDefault(); onReturnFocus() }}
        onKeyDown={(event) => {
          if (event.defaultPrevented || (event.target as HTMLElement).closest('[role="dialog"]') !== event.currentTarget) return
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault()
            navigate(event.key === "ArrowLeft" ? -1 : 1)
          }
        }}
      >
        <SheetHeader className="shrink-0 border-b border-border/70 bg-secondary/5 px-5 pb-5 pr-16 pt-6 sm:px-6 sm:pr-16">
          <span className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-secondary"><FolderOpen className="size-4" aria-hidden="true" />{group?.collection.name}</span>
          <SheetTitle ref={titleRef} tabIndex={-1} className="leading-7 text-foreground outline-none">Post details</SheetTitle>
          <SheetDescription className="text-xs leading-6">A closer look at your campus story.</SheetDescription>
        </SheetHeader>
        {post && group && <>
          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <img src={school?.image} alt="" className="size-12 shrink-0 rounded-2xl object-cover" />
              <div className="min-w-0"><p className="font-heading text-sm font-semibold">{school?.name}</p><p className="mt-1 text-xs text-muted-foreground">Added {formatPostDate(post.createdAt)}</p></div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted">
              {post.mediaType === "video" && post.videoUrl
                ? <video key={post.id} src={post.videoUrl} poster={post.cover} controls preload="metadata" aria-label={post.title} className="max-h-[440px] w-full" />
                : <ImagePreview key={post.id} src={post.cover} alt={post.title} />}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5">{post.mediaType === "video" ? <Film className="size-3.5" aria-hidden="true" /> : <ImageIcon className="size-3.5" aria-hidden="true" />}{post.mediaType === "video" ? "Video · " + (post.duration ?? "—") : "Photo"}</span>
              {post.mediaType === "video" && !post.videoUrl && <span>Cover preview · Playback unavailable</span>}
            </div>
            <div className="mt-6 border-t border-border/70 pt-6">
              <h3 className="break-words font-heading text-2xl font-semibold leading-8" aria-live="polite">{post.title}</h3>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">{post.caption}</p>
            </div>
          </div>
          <div className="shrink-0 border-t border-border/70 bg-card p-4 sm:px-6">
            <div className="flex items-center justify-between gap-2">
              <Button variant="outline" aria-label="Previous post" disabled={index <= 0} onClick={() => navigate(-1)} className="h-11 rounded-xl px-3"><ChevronLeft aria-hidden="true" /><span className="hidden min-[380px]:inline">Previous</span></Button>
              <span className="text-xs tabular-nums text-muted-foreground" aria-live="polite">{index + 1} of {group.posts.length}</span>
              <Button variant="secondary" aria-label="Next post" disabled={index >= group.posts.length - 1} onClick={() => navigate(1)} className="h-11 rounded-xl px-3"><span className="hidden min-[380px]:inline">Next</span><ChevronRight aria-hidden="true" /></Button>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">Use ← → to browse this collection</p>
          </div>
        </>}
      </SheetContent>
    </Sheet>
  )
}
