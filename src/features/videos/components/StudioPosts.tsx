import { Link } from "react-router-dom"
import { Clapperboard, Eye, Heart, Images, MessageCircle, Smartphone, Type, type LucideIcon } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { captionParts } from "../lib/caption"
import { cn } from "../lib/cn"
import { POST_KIND_LABELS, accountName, ago, day, formatCount, hueOf, postKind, postState, type PostKind } from "../lib/format"
import { formatDuration } from "../lib/media"
import { accountPath, groupPath } from "../lib/paths"
import type { StudioPost } from "../types"
import { AccountAvatar, Pill } from "./StudioBits"
import { focusRing, ink, muted, panel } from "./tokens"

const kindIcons: Record<PostKind, LucideIcon> = { TEXT: Type, PICTURES: Images, VIDEO: Clapperboard, SHORT: Smartphone }

/** A caption with its hashtags drawn as the app draws them. */
export function Caption({ text, className, tagClassName = "text-purple dark:text-royal-300" }: { text: string; className?: string; tagClassName?: string }) {
  return <p className={cn("whitespace-pre-wrap [overflow-wrap:anywhere]", className)}>
    {captionParts(text).map((part, index) => part.hashtag
      ? <span key={index} className={cn("font-semibold", tagClassName)}>{part.text}</span>
      : <span key={index}>{part.text}</span>)}
  </p>
}

/** The post's picture, or its words on its account's colour. */
function PostCover({ post, className }: { post: StudioPost; className?: string }) {
  const kind = postKind(post)
  const Icon = kindIcons[kind]
  return <div className={cn("relative overflow-hidden bg-grey-100 dark:bg-muted", className)} style={{ ["--studio-hue" as string]: hueOf(post.account.username ?? post.id) }}>
    {post.cover ? <img src={post.cover} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
      : <div className="studio-cover-fallback absolute inset-0 flex items-center p-4">
        <p className="line-clamp-5 font-heading text-b2 font-semibold leading-6 text-white">{post.caption?.trim() || "No caption"}</p>
      </div>}
    <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-grey-1000/70 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">
      <Icon className="size-3" aria-hidden="true" />{POST_KIND_LABELS[kind]}{post.type === "IMAGE" && post.imageCount > 1 ? ` · ${post.imageCount}` : ""}
    </span>
    {post.video?.duration ? <span className="absolute bottom-2.5 right-2.5 rounded-full bg-grey-1000/70 px-2 py-1 text-[11px] font-semibold tabular-nums text-white">{formatDuration(post.video.duration)}</span> : null}
  </div>
}

/** One post in a grid; it opens its details. */
export function PostTile({ post, onOpen }: { post: StudioPost; onOpen: (post: StudioPost) => void }) {
  const state = postState(post)
  const title = post.caption?.trim().split("\n")[0] || POST_KIND_LABELS[postKind(post)]
  return <li className={cn(panel, "video-lift flex min-w-0 flex-col overflow-hidden hover:shadow-adbox-medium")}>
    <button type="button" onClick={() => onOpen(post)} aria-label={`View post: ${title}`} className={cn("block text-left", focusRing)}>
      <PostCover post={post} className={post.isShort ? "aspect-[4/5]" : "aspect-[4/3]"} />
    </button>
    <div className="flex flex-1 flex-col gap-2 p-4">
      <div className="flex items-center gap-2">
        <AccountAvatar account={post.account} size="sm" />
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate text-b3 font-semibold", ink)}>{accountName(post.account)}</span>
          <span className={cn("block truncate text-[11px]", muted)}>by {post.postedBy?.name ?? "an admin (not recorded)"} · {ago(post.createdAt)}</span>
        </span>
        <Pill tone={state.tone}>{state.label}</Pill>
      </div>
      {post.caption && <Caption text={post.caption} className={cn("line-clamp-2 text-b3 leading-5", muted)} />}
      {post.groups.length > 0 && <div className="flex flex-wrap gap-1.5">{post.groups.map((group) => <Pill key={group.id} tone="purple">#{group.hashtag}</Pill>)}</div>}
      <p className={cn("mt-auto flex items-center gap-3 pt-1 text-[11px] tabular-nums", muted)}>
        <span className="inline-flex items-center gap-1"><Heart className="size-3" aria-hidden="true" />{formatCount(post.counts.likes)}</span>
        <span className="inline-flex items-center gap-1"><MessageCircle className="size-3" aria-hidden="true" />{formatCount(post.counts.comments)}</span>
        <span className="inline-flex items-center gap-1"><Eye className="size-3" aria-hidden="true" />{formatCount(post.counts.views)}</span>
      </p>
    </div>
  </li>
}

/** Everything about one studio post: what it says, which account, which admin, its groups and numbers. */
export function PostSheet({ post, onClose }: { post: StudioPost | null; onClose: () => void }) {
  const state = post ? postState(post) : null
  return <Sheet open={Boolean(post)} onOpenChange={(open) => { if (!open) onClose() }}>
    <SheetContent side="right" closeLabel="Close post details" className="video-management-ui w-full overflow-y-auto sm:max-w-md">
      {post && state && <>
        <SheetHeader className="px-6 pt-6">
          <SheetTitle className="font-heading text-h6">Post details</SheetTitle>
          <SheetDescription>Posted as {accountName(post.account)} by {post.postedBy?.name ?? "an admin"} on {day(post.createdAt)}.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-5 px-6 pb-8">
          <PostCover post={post} className={cn("rounded-2xl", post.isShort ? "aspect-[9/16] max-h-[60vh]" : "aspect-[4/3]")} />
          <div className="flex flex-wrap gap-2">
            <Pill tone={state.tone}>{state.label}</Pill>
            <Pill>{POST_KIND_LABELS[postKind(post)]}</Pill>
            {post.groups.map((group) => <Link key={group.id} to={groupPath(group.id)} className={cn("rounded-full", focusRing)}><Pill tone="purple">#{group.hashtag}</Pill></Link>)}
          </div>
          {post.caption ? <Caption text={post.caption} className={cn("text-b2 leading-6", ink)} /> : <p className={cn("text-b3", muted)}>No caption.</p>}
          <dl className="grid grid-cols-3 gap-2 rounded-2xl bg-grey-50 p-3 text-center dark:bg-background/60">
            {[["Likes", post.counts.likes], ["Comments", post.counts.comments], ["Views", post.counts.views]].map(([label, value]) => <div key={label}>
              <dt className={cn("text-[11px]", muted)}>{label}</dt>
              <dd className={cn("font-heading text-b1 font-semibold tabular-nums", ink)}>{formatCount(value as number)}</dd>
            </div>)}
          </dl>
          <div className="flex items-center gap-3 rounded-2xl border border-grey-200 p-3 dark:border-border">
            <AccountAvatar account={post.account} />
            <span className="min-w-0 flex-1">
              <Link to={accountPath(post.account.id)} className={cn("block truncate rounded text-b2 font-semibold hover:text-purple", ink, focusRing)}>{accountName(post.account)}</Link>
              <span className={cn("block truncate text-b4", muted)}>{post.account.username ? `@${post.account.username}` : ""}</span>
            </span>
          </div>
          <p className={cn("text-b4", muted)}>Made by {post.postedBy ? `${post.postedBy.name} (${post.postedBy.email})` : "an admin the app didn't record"}.</p>
        </div>
      </>}
    </SheetContent>
  </Sheet>
}
