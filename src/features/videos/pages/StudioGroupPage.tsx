import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Archive, ArchiveRestore, ArrowLeft, CalendarDays, Hash, MapPin, Pencil, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { APP_ROUTES } from "@/routes/paths"
import { GroupDialog } from "../components/GroupDialog"
import { EmptyState, Figure, LoadError, Pill, SectionHeading, SkeletonGrid } from "../components/StudioBits"
import { GroupCover } from "../components/StudioCards"
import { PostSheet, PostTile } from "../components/StudioPosts"
import { ink, muted, panel } from "../components/tokens"
import { useSetGroupArchived, useStudioAccess, useStudioGroup, useStudioPosts } from "../hooks"
import { cn } from "../lib/cn"
import { serverMessage } from "../lib/errors"
import { day, formatCount, groupDates } from "../lib/format"
import { createPath } from "../lib/paths"
import { placeLabel } from "../lib/places"
import type { StudioPost } from "../types"

/** One group: its hashtag, where and when, and its posts from the studio. */
export function StudioGroupPage() {
  const { groupId } = useParams()
  const access = useStudioAccess()
  const group = useStudioGroup(groupId, access.read)
  const posts = useStudioPosts({ groupId, limit: 24 }, access.read && Boolean(groupId))
  const archive = useSetGroupArchived()
  const [editing, setEditing] = useState(false)
  const [openPost, setOpenPost] = useState<StudioPost | null>(null)

  if (group.isPending) return <SkeletonGrid count={3} label="Loading the group" />
  if (group.isError) return <LoadError message={serverMessage(group.error, "Couldn't load the group.")} onRetry={() => void group.refetch()} />
  const data = group.data
  const place = placeLabel(data)
  const dates = groupDates(data)

  const toggleArchive = async () => {
    try {
      await archive.mutateAsync({ id: data.id, archived: !data.archivedAt })
      toast.success(data.archivedAt ? `${data.name} is back` : `${data.name} is archived`)
    } catch (error) {
      toast.error(serverMessage(error, "Couldn't change the group."))
    }
  }

  return <div className="flex flex-col gap-8">
    <Link to={APP_ROUTES.videoGroups} className={cn("inline-flex w-fit items-center gap-1.5 text-b3 font-semibold", muted)}><ArrowLeft className="size-4" aria-hidden="true" />All groups</Link>

    <section aria-label={data.name} className={cn(panel, "overflow-hidden")}>
      <GroupCover group={data} size="lg" className="aspect-[16/9] sm:aspect-[21/8]" />
      <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className={cn("font-heading text-h5 font-bold", ink)}>{data.name}</h2>
          <p className={cn("mt-1 flex flex-wrap gap-x-4 gap-y-1 text-b3 md:text-b2", muted)}>
            {place && <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" aria-hidden="true" />{place}</span>}
            {dates && <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" aria-hidden="true" />{dates}</span>}
          </p>
          {data.description && <p className={cn("mt-3 max-w-2xl text-b2 leading-6", ink)}>{data.description}</p>}
          <p className={cn("mt-3 text-[11px]", muted)}>Made by {data.createdBy?.name ?? "a former admin"} on {day(data.createdAt)}.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.archivedAt && <Pill icon={Archive}>Archived</Pill>}
          {access.post && !data.archivedAt && <Button asChild className="h-10 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] text-white hover:opacity-90">
            <Link to={createPath({ group: data.id })}><Send className="size-4" aria-hidden="true" />Post in this group</Link>
          </Button>}
          {access.manageGroups && <Button type="button" variant="outline" className="h-10 cursor-pointer rounded-full" onClick={() => setEditing(true)}><Pencil className="size-4" aria-hidden="true" />Edit</Button>}
          {access.manageGroups && <Button type="button" variant="outline" className="h-10 cursor-pointer rounded-full" disabled={archive.isPending} onClick={() => void toggleArchive()}>
            {data.archivedAt ? <ArchiveRestore className="size-4" aria-hidden="true" /> : <Archive className="size-4" aria-hidden="true" />}{data.archivedAt ? "Restore" : "Archive"}
          </Button>}
        </div>
      </div>
    </section>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Figure icon={Hash} label="Posts with the hashtag" value={formatCount(data.counts.posts)} hint={`#${data.hashtag} in the app`} />
      <Figure icon={Send} label="From the studio" value={formatCount(data.counts.studioPosts)} hint="Posted by AdBox's accounts" />
      <Figure icon={MapPin} label="From people" value={formatCount(Math.max(0, data.counts.posts - data.counts.studioPosts))} hint="Anyone who used the hashtag" />
    </div>

    <section aria-labelledby="group-posts">
      <SectionHeading id="group-posts" title="From the studio" description={`Posts AdBox's accounts made with #${data.hashtag}, newest first.`} />
      {posts.isPending ? <SkeletonGrid count={3} label="Loading posts" />
        : posts.isError ? <LoadError message="Couldn't load the posts." onRetry={() => void posts.refetch()} />
        : posts.data.items.length === 0 ? <EmptyState icon={Hash} title="Nothing in this group yet">Posts made in this group carry #{data.hashtag} and show here.</EmptyState>
        : <ul aria-label="Posts" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{posts.data.items.map((post) => <PostTile key={post.id} post={post} onOpen={setOpenPost} />)}</ul>}
    </section>

    <GroupDialog open={editing} onOpenChange={setEditing} group={data} />
    <PostSheet post={openPost} onClose={() => setOpenPost(null)} />
  </div>
}
