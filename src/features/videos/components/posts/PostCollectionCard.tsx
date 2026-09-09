import { ArrowUpRight, Eye, FolderOpen, ImageIcon, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CollectionPostGroup } from "../../types/posts"
import { formatPostDate } from "../../utils/post-format"
import { uploadSchools } from "../../data/schools"

export function PostCollectionCard({ group: { collection, posts }, onOpen }: { group: CollectionPostGroup; onOpen: (id: string, trigger: HTMLButtonElement) => void }) {
  const school = uploadSchools.find(({ id }) => id === collection.schoolId)
  return (
    <article data-collection={collection.id} className="video-lift min-w-0 rounded-3xl border border-border/70 bg-card p-4 hover:border-secondary/20 hover:shadow-adbox-medium min-[480px]:col-span-4 md:col-span-3 xl:col-span-6 2xl:col-span-4">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary/5 text-secondary"><FolderOpen className="size-5" aria-hidden="true" /></span>
        <div className="min-w-0 flex-1"><h4 className="truncate font-heading text-lg font-semibold" title={collection.name}>{collection.name}</h4><p className="mt-1 truncate text-xs text-muted-foreground" title={school?.name}>{school?.name}</p></div>
        <span className="rounded-lg bg-muted px-2 py-1.5 text-xs font-medium tabular-nums text-muted-foreground" aria-label={posts.length + " posts"}>{posts.length}</span>
      </div>
      <div className={cn("grid gap-2", posts.length === 1 ? "grid-cols-1" : posts.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
        {posts.slice(0, 3).map((post) => (
          <button key={post.id} type="button" aria-label={"View post: " + post.title} onClick={(event) => onOpen(post.id, event.currentTarget)} className={cn("group/post relative min-w-0 overflow-hidden rounded-2xl bg-muted text-left outline-none focus-visible:shadow-adbox-focus-secondary", posts.length === 1 ? "aspect-16/10" : "aspect-3/4")}>
            <img src={post.cover} alt="" loading="lazy" decoding="async" width={600} height={900} className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover/post:scale-105 group-focus-visible/post:scale-105 motion-reduce:transform-none" />
            <span className="absolute inset-0 bg-linear-to-t from-grey-1000/90 via-grey-1000/5 to-grey-1000/15" aria-hidden="true" />
            <span className="absolute inset-x-2 top-2 flex items-start justify-between gap-1 text-white">
              <span className="flex size-7 items-center justify-center rounded-lg bg-grey-1000/40 backdrop-blur-sm">{post.mediaType === "video" ? <Play className="size-3.5" aria-hidden="true" /> : <ImageIcon className="size-3.5" aria-hidden="true" />}</span>
              {post.duration && <span className="rounded-lg bg-grey-1000/50 px-1.5 py-1.5 text-[10px] tabular-nums">{post.duration}</span>}
            </span>
            <span className="absolute left-1/2 top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-secondary opacity-0 transition-opacity group-hover/post:opacity-100 group-focus-visible/post:opacity-100" aria-hidden="true"><Eye className="size-4" /></span>
            <span className="absolute inset-x-2.5 bottom-3 line-clamp-2 font-heading text-xs font-medium leading-5 text-white">{post.title}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{formatPostDate(posts[0].createdAt)}</span>
        <Button type="button" variant="ghost" className="-mr-1 h-11 gap-1.5 rounded-xl px-3 text-xs text-secondary hover:bg-secondary/5 hover:text-secondary" onClick={(event) => onOpen(posts[0].id, event.currentTarget)} aria-label={"Open collection: " + collection.name}>Open collection<ArrowUpRight className="size-4" aria-hidden="true" /></Button>
      </div>
    </article>
  )
}
