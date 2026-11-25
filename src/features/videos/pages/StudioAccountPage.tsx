import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Archive, ArchiveRestore, ArrowLeft, Images, Pencil, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { APP_ROUTES } from "@/routes/paths"
import { AccountDialog } from "../components/AccountDialog"
import { AccountAvatar, EmptyState, LoadError, Pill, SectionHeading, SkeletonGrid } from "../components/StudioBits"
import { PostSheet, PostTile } from "../components/StudioPosts"
import { ink, muted, panel } from "../components/tokens"
import { useSetAccountArchived, useStudioAccess, useStudioAccount, useStudioPosts } from "../hooks"
import { cn } from "../lib/cn"
import { serverMessage } from "../lib/errors"
import { accountName, ago, day, formatCount, hueOf } from "../lib/format"
import { createPath } from "../lib/paths"
import type { StudioPost } from "../types"

/** One account: how it looks in the app, who made it, and everything posted from it. */
export function StudioAccountPage() {
  const { accountId } = useParams()
  const access = useStudioAccess()
  const account = useStudioAccount(accountId, access.read)
  const posts = useStudioPosts({ accountId, limit: 24 }, access.read && Boolean(accountId))
  const archive = useSetAccountArchived()
  const [editing, setEditing] = useState(false)
  const [openPost, setOpenPost] = useState<StudioPost | null>(null)

  if (account.isPending) return <SkeletonGrid count={3} label="Loading the account" />
  if (account.isError) return <LoadError message={serverMessage(account.error, "Couldn't load the account.")} onRetry={() => void account.refetch()} />
  const data = account.data
  const name = accountName(data)

  const toggleArchive = async () => {
    try {
      await archive.mutateAsync({ id: data.id, archived: !data.archivedAt })
      toast.success(data.archivedAt ? `${name} can post again` : `${name} is archived`)
    } catch (error) {
      toast.error(serverMessage(error, "Couldn't change the account."))
    }
  }

  return <div className="flex flex-col gap-8">
    <Link to={APP_ROUTES.videoAccounts} className={cn("inline-flex w-fit items-center gap-1.5 text-b3 font-semibold", muted)}><ArrowLeft className="size-4" aria-hidden="true" />All accounts</Link>

    <section aria-label={name} className={cn(panel, "overflow-hidden")}>
      <div aria-hidden="true" className="studio-cover-fallback h-32 sm:h-40" style={{ ["--studio-hue" as string]: hueOf(name) }} />
      <div className="flex flex-col gap-5 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="-mt-12 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:gap-5">
          <AccountAvatar account={data} size="xl" className="ring-4" />
          <div className="min-w-0 pb-1">
            <h2 className={cn("truncate font-heading text-h5 font-bold", ink)}>{name}</h2>
            <p className={cn("text-b3 md:text-b2", muted)}>{data.username ? `@${data.username}` : "No username"}{data.institution ? ` · ${data.institution.name}` : ""}{data.campus ? `, ${data.campus.name}` : ""}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.archivedAt && <Pill icon={Archive}>Archived {ago(data.archivedAt)}</Pill>}
          {access.post && !data.archivedAt && <Button asChild className="h-10 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] text-white hover:opacity-90">
            <Link to={createPath({ account: data.id })}><Send className="size-4" aria-hidden="true" />Post as {name}</Link>
          </Button>}
          {access.manageAccounts && <Button type="button" variant="outline" className="h-10 cursor-pointer rounded-full" onClick={() => setEditing(true)}><Pencil className="size-4" aria-hidden="true" />Edit</Button>}
          {access.manageAccounts && <Button type="button" variant="outline" className="h-10 cursor-pointer rounded-full" disabled={archive.isPending} onClick={() => void toggleArchive()}>
            {data.archivedAt ? <ArchiveRestore className="size-4" aria-hidden="true" /> : <Archive className="size-4" aria-hidden="true" />}{data.archivedAt ? "Restore" : "Archive"}
          </Button>}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 border-t border-grey-200 px-6 py-5 dark:border-border md:grid-cols-12">
        <div className="md:col-span-7">
          {data.bio ? <p className={cn("text-b2 leading-6", ink)}>{data.bio}</p> : <p className={cn("text-b3", muted)}>No bio.</p>}
          {data.note && <p className={cn("mt-3 rounded-2xl bg-warning-500/10 px-4 py-3 text-b3 leading-5 text-warning-700 dark:text-warning-300")}><strong>Note for admins:</strong> {data.note}</p>}
        </div>
        <dl className="grid grid-cols-3 gap-2 md:col-span-5">
          {[["Posts", formatCount(data.counts.posts)], ["Followers", formatCount(data.counts.followers)], ["Last post", ago(data.lastPostedAt) ?? "Never"]].map(([label, value]) => <div key={label} className="rounded-2xl bg-grey-50 p-3 text-center dark:bg-background/60">
            <dt className={cn("text-[11px]", muted)}>{label}</dt>
            <dd className={cn("truncate font-heading text-b1 font-semibold tabular-nums", ink)}>{value}</dd>
          </div>)}
          <p className={cn("col-span-3 text-[11px]", muted)}>Made by {data.createdBy ? `${data.createdBy.name} (${data.createdBy.email})` : "a former admin"} on {day(data.createdAt)}.</p>
        </dl>
      </div>
    </section>

    <section aria-labelledby="account-posts">
      <SectionHeading id="account-posts" title="Posts" description="Everything posted from this account, newest first, with the admin who made each." />
      {posts.isPending ? <SkeletonGrid count={3} label="Loading posts" />
        : posts.isError ? <LoadError message="Couldn't load the posts." onRetry={() => void posts.refetch()} />
        : posts.data.items.length === 0 ? <EmptyState icon={Images} title="No posts yet">Its first post shows here as soon as it's made.</EmptyState>
        : <ul aria-label="Posts" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{posts.data.items.map((post) => <PostTile key={post.id} post={post} onOpen={setOpenPost} />)}</ul>}
    </section>

    <AccountDialog open={editing} onOpenChange={setEditing} account={data} />
    <PostSheet post={openPost} onClose={() => setOpenPost(null)} />
  </div>
}
