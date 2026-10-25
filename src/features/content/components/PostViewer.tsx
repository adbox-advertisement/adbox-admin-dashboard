import { useState } from "react"
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react"
import { cn } from "../lib/cn"
import { postTitle, type UserPost } from "../types"
import { focusRing } from "./ContentBits"
import { VideoPlayer } from "./VideoPlayer"

/** The post as people see it: the video player, a picture gallery, or the text itself. */
export function PostViewer({ post }: { post: UserPost }) {
  if (post.mediaType === "TEXT") return <div className="flex min-h-72 items-center rounded-2xl bg-[image:var(--gradient-purple)] p-8 text-white sm:min-h-96 sm:p-10">
    <p className="whitespace-pre-line break-words text-h6 font-semibold leading-relaxed">{post.description || post.title || "Empty text post"}</p>
  </div>
  if (post.mediaType === "VIDEO") return <VideoView post={post} />
  return <Gallery post={post} />
}

function VideoView({ post }: { post: UserPost }) {
  const video = post.videoResource
  if (!video) return <NoMedia label="No video file is attached to this post" />
  return <VideoPlayer
    sources={{ hlsUrl: video.hlsUrl, mp4Url: video.mp4Url }}
    poster={video.thumbnail?.imageUrl ?? video.thumbnail?.previewImageUrl ?? null}
    title={postTitle(post)}
    processing={video.transcodingStatus === "QUEUED" || video.transcodingStatus === "PROCESSING" || video.transcodingStatus === "NOT_STARTED"}
  />
}

function Gallery({ post }: { post: UserPost }) {
  const images = post.imgResources.filter((image) => image.imageUrl || image.previewImageUrl)
  const [index, setIndex] = useState(0)
  const current = images[index]
  if (!current) return <NoMedia label="No pictures available" />
  const step = (by: number) => setIndex((position) => (position + by + images.length) % images.length)
  const arrow = cn("absolute top-1/2 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-grey-1000 shadow-adbox-medium transition hover:bg-white dark:bg-card dark:text-foreground", focusRing)
  return <div className="flex flex-col gap-3">
    <div className="relative">
      <img src={current.imageUrl ?? current.previewImageUrl ?? undefined} alt={`Picture ${index + 1} of ${images.length}`} className="aspect-square w-full rounded-2xl bg-grey-100 object-contain dark:bg-muted" />
      {images.length > 1 && <>
        <button type="button" aria-label="Previous picture" onClick={() => step(-1)} className={cn(arrow, "left-3")}><ChevronLeft className="size-5" aria-hidden="true" /></button>
        <button type="button" aria-label="Next picture" onClick={() => step(1)} className={cn(arrow, "right-3")}><ChevronRight className="size-5" aria-hidden="true" /></button>
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2.5 py-1 text-b3 font-semibold tabular-nums text-white" aria-live="polite">{index + 1} / {images.length}</span>
      </>}
    </div>
    {images.length > 1 && <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Pictures in this post">
      {images.map((image, position) => <button key={image.id} type="button" aria-label={`Show picture ${position + 1}`} aria-pressed={position === index} onClick={() => setIndex(position)}
        className={cn("size-16 shrink-0 cursor-pointer overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-white transition dark:ring-offset-card", focusRing, position === index ? "ring-purple" : "ring-transparent opacity-70 hover:opacity-100")}>
        <img src={image.previewImageUrl ?? image.imageUrl ?? undefined} alt="" loading="lazy" className="size-full object-cover" />
      </button>)}
    </div>}
  </div>
}

function NoMedia({ label }: { label: string }) {
  return <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl bg-grey-100 text-grey-500 dark:bg-muted dark:text-muted-foreground">
    <ImageOff className="size-8" aria-hidden="true" /><p className="text-b3">{label}</p>
  </div>
}
