import { Bookmark, Heart, Lock, MessageCircle, Send } from "lucide-react"
import { cn } from "../../lib/cn"
import { accountName } from "../../lib/format"
import type { PreparedImage, PreparedVideo } from "../../lib/media"
import type { PostType, PostVisibility, StudioAccount } from "../../types"
import { AccountAvatar } from "../StudioBits"
import { Caption } from "../StudioPosts"
import { muted } from "../tokens"

type Props = {
  account: Pick<StudioAccount, "fullName" | "username" | "image"> | null
  type: PostType
  short: boolean
  caption: string
  images: PreparedImage[]
  video: PreparedVideo | null
  visibility: PostVisibility
}

const prefersReducedMotion = () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** The post on a phone, roughly as the app shows it: full screen for a Short, a feed card otherwise. */
export function PhonePreview(props: Props) {
  return <figure className="mx-auto w-full max-w-[300px]">
    <div className="studio-phone relative aspect-[9/19.5] overflow-hidden bg-white dark:bg-background">
      <div aria-hidden="true" className="absolute left-1/2 top-2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-grey-1000" />
      {props.short && props.video ? <ShortScreen {...props} video={props.video} /> : <FeedScreen {...props} />}
    </div>
    <figcaption className={cn("mt-3 text-center text-[11px]", muted)}>A preview: roughly as it shows in the app.</figcaption>
  </figure>
}

function ShortScreen({ account, caption, video }: Props & { video: PreparedVideo }) {
  return <div className="absolute inset-0 bg-grey-1000">
    <video src={video.url} className="absolute inset-0 size-full object-cover" muted loop playsInline autoPlay={!prefersReducedMotion()} aria-label="Your Short" />
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-grey-1000/90 via-grey-1000/40 to-transparent px-4 pb-6 pt-16 text-white">
      <div className="flex items-center gap-2">
        {account ? <AccountAvatar account={account} size="sm" className="ring-white/70" /> : <span className="size-8 rounded-full bg-white/20" />}
        <span className="min-w-0 truncate text-[13px] font-semibold">{account ? accountName(account) : "Choose an account"}</span>
        <span className="rounded-full border border-white/60 px-2 py-0.5 text-[10px] font-semibold">Follow</span>
      </div>
      {caption.trim() && <Caption text={caption} tagClassName="text-white" className="mt-2 line-clamp-3 text-[12px] leading-4 text-white/90" />}
    </div>
    <div aria-hidden="true" className="absolute bottom-24 right-2.5 flex flex-col items-center gap-4 text-white">
      {[Heart, MessageCircle, Send, Bookmark].map((Icon, index) => <span key={index} className="flex flex-col items-center gap-0.5"><Icon className="size-6 drop-shadow" /><span className="text-[10px] font-semibold">0</span></span>)}
    </div>
  </div>
}

function FeedScreen({ account, type, caption, images, video, visibility }: Props) {
  const empty = !caption.trim() && images.length === 0 && !video
  const first = images[0]
  return <div className="absolute inset-0 flex flex-col overflow-hidden pt-10">
    <p className="px-4 pb-2 font-heading text-[15px] font-bold text-grey-1000 dark:text-foreground">Feed</p>
    <article className="border-y border-grey-100 py-3 dark:border-border">
      <div className="flex items-center gap-2.5 px-3.5">
        {account ? <AccountAvatar account={account} size="sm" /> : <span className="size-8 rounded-full bg-grey-100 dark:bg-muted" />}
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[13px] font-semibold text-grey-1000 dark:text-foreground">{account ? accountName(account) : "Choose an account"}</span>
          <span className={cn("flex items-center gap-1 text-[11px]", muted)}>Just now{visibility === "PRIVATE" && <><span aria-hidden="true">·</span><Lock className="size-3" aria-label="Only the account" /></>}</span>
        </span>
      </div>
      {caption.trim()
        ? <Caption text={caption} className={cn("mt-2.5 px-3.5 text-grey-1000 dark:text-foreground", type === "TEXT" ? "line-clamp-[10] text-[14px] leading-5" : "line-clamp-4 text-[12px] leading-4")} />
        : empty && <div className="mt-3 space-y-1.5 px-3.5" aria-hidden="true">
          <div className="h-2.5 w-11/12 rounded-full bg-grey-100 dark:bg-muted" />
          <div className="h-2.5 w-3/4 rounded-full bg-grey-100 dark:bg-muted" />
        </div>}
      {type === "IMAGE" && <div className="relative mt-2.5 bg-grey-50 dark:bg-muted">
        {first ? <img src={first.url} alt="" className="max-h-[22rem] w-full object-cover" style={{ aspectRatio: `${Math.min(Math.max(first.width / first.height, 0.8), 1.91)}` }} />
          : <div className="aspect-square w-full" />}
        {images.length > 1 && <>
          <span className="absolute right-2 top-2 rounded-full bg-grey-1000/70 px-2 py-0.5 text-[10px] font-semibold text-white">1/{images.length}</span>
          <span aria-hidden="true" className="absolute inset-x-0 bottom-2 flex justify-center gap-1">{images.map((image, index) => <span key={image.id} className={cn("size-1.5 rounded-full", index === 0 ? "bg-white" : "bg-white/50")} />)}</span>
        </>}
      </div>}
      {type === "VIDEO" && <div className="mt-2.5 bg-grey-1000">
        {video ? <video src={video.url} className="max-h-[22rem] w-full object-contain" muted loop playsInline autoPlay={!prefersReducedMotion()} aria-label="Your video" style={{ aspectRatio: `${video.width}/${video.height}` }} />
          : <div className="aspect-video w-full" />}
      </div>}
      <div aria-hidden="true" className="mt-2.5 flex items-center gap-4 px-3.5 text-grey-700 dark:text-muted-foreground">
        <Heart className="size-5" /><MessageCircle className="size-5" /><Send className="size-5" /><Bookmark className="ml-auto size-5" />
      </div>
    </article>
    <div aria-hidden="true" className="space-y-2 px-3.5 pt-4 opacity-60">
      <div className="flex items-center gap-2.5"><span className="size-8 rounded-full bg-grey-100 dark:bg-muted" /><span className="h-2.5 w-24 rounded-full bg-grey-100 dark:bg-muted" /></div>
      <div className="h-28 rounded-xl bg-grey-50 dark:bg-muted/60" />
    </div>
  </div>
}
