import { useState } from "react"
import { Link } from "react-router-dom"
import { Clapperboard, Hash, Images, PenLine, Plus, Smartphone, Sparkles, Trophy, Type, UserPlus, UsersRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { APP_ROUTES } from "@/routes/paths"
import { AccountDialog } from "../components/AccountDialog"
import { GroupDialog } from "../components/GroupDialog"
import { AccountAvatar, LoadError, MoreLink, SectionHeading, SkeletonGrid } from "../components/StudioBits"
import { GroupCover } from "../components/StudioCards"
import { PostSheet, PostTile } from "../components/StudioPosts"
import { ink, muted, panel, focusRing } from "../components/tokens"
import { useStudioAccess, useStudioAccounts, useStudioGroups, useStudioPosts, useStudioSummary } from "../hooks"
import { cn } from "../lib/cn"
import { accountName, formatCount, groupDates, groupTiming } from "../lib/format"
import { accountPath, createPath, groupPath } from "../lib/paths"
import { placeLabel } from "../lib/places"
import type { StudioPost } from "../types"

/** The studio at a glance: what's been made lately, the groups on now, and who is posting. */
export function StudioHomePage() {
  const access = useStudioAccess()
  const summary = useStudioSummary(access.read)
  const posts = useStudioPosts({ limit: 6 }, access.read)
  const groups = useStudioGroups({ limit: 4 }, access.read)
  const accounts = useStudioAccounts({ limit: 8 }, access.read)
  const [dialog, setDialog] = useState<"account" | "group" | null>(null)
  const [openPost, setOpenPost] = useState<StudioPost | null>(null)
  const figures = summary.data

  return <div className="flex flex-col gap-8">
    <section aria-labelledby="studio-title" className="studio-aurora video-reveal rounded-[32px] px-6 py-10 sm:px-10 sm:py-14">
      <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full studio-glass px-3 py-1 text-xs font-semibold text-white/90"><Sparkles className="size-3.5" aria-hidden="true" />AdBox Studio</p>
          <h2 id="studio-title" className="mt-4 font-heading text-[2rem] font-bold leading-[2.4rem] tracking-tight text-white sm:text-[2.75rem] sm:leading-[3.1rem]">
            Make something every campus will talk about.
          </h2>
          <p className="mt-3 max-w-xl text-b2 leading-6 text-white/80">
            Post videos, Shorts, pictures and words from accounts AdBox runs, gather them into groups like hall weeks,
            and see who made what.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {access.post && <Button asChild className="h-11 cursor-pointer rounded-full bg-white px-5 font-semibold text-royal-900 hover:bg-white/90">
              <Link to={createPath()}><PenLine className="size-4" aria-hidden="true" />Create a post</Link>
            </Button>}
            {access.manageAccounts && <Button type="button" variant="outline" onClick={() => setDialog("account")} className="h-11 cursor-pointer rounded-full border-white/30 bg-white/10 px-5 text-white hover:bg-white/20 hover:text-white">
              <UserPlus className="size-4" aria-hidden="true" />New account
            </Button>}
            {access.manageGroups && <Button type="button" variant="outline" onClick={() => setDialog("group")} className="h-11 cursor-pointer rounded-full border-white/30 bg-white/10 px-5 text-white hover:bg-white/20 hover:text-white">
              <Plus className="size-4" aria-hidden="true" />New group
            </Button>}
          </div>
        </div>
        <dl aria-label="Studio figures" className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:w-[30rem] xl:grid-cols-2">
          {[
            { label: "Accounts", value: figures?.accounts.active, icon: UsersRound },
            { label: "Groups", value: figures?.groups.active, icon: Hash },
            { label: "Posts", value: figures?.posts.total, icon: Images },
            { label: "This week", value: figures?.posts.last7Days, icon: Sparkles },
          ].map(({ label, value, icon: Icon }) => <div key={label} className="studio-glass rounded-2xl px-4 py-3">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-white/75"><Icon className="size-3.5" aria-hidden="true" />{label}</dt>
            <dd className="mt-1 font-heading text-h4 font-bold tabular-nums text-white">{value === undefined ? <span className="studio-shimmer inline-block h-7 w-12 rounded-lg bg-white/10" /> : formatCount(value)}</dd>
          </div>)}
        </dl>
      </div>
      {figures && <ul aria-label="Posts by kind" className="mt-8 flex flex-wrap gap-2">
        {[
          { label: "Videos", value: figures.posts.videos - figures.posts.shorts, icon: Clapperboard },
          { label: "Shorts", value: figures.posts.shorts, icon: Smartphone },
          { label: "Pictures", value: figures.posts.pictures, icon: Images },
          { label: "Text", value: figures.posts.text, icon: Type },
        ].map(({ label, value, icon: Icon }) => <li key={label} className="studio-glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white">
          <Icon className="size-3.5" aria-hidden="true" /><span className="tabular-nums">{formatCount(Math.max(0, value))}</span>{label}
        </li>)}
      </ul>}
    </section>

    {summary.isError && <LoadError message="Couldn't load the studio." onRetry={() => void summary.refetch()} />}

    <section aria-labelledby="studio-recent">
      <SectionHeading id="studio-recent" title="Fresh from the studio" description="The latest posts from AdBox's accounts, and who made each." action={<MoreLink to={APP_ROUTES.videoPosts}>All posts</MoreLink>} />
      {posts.isPending ? <SkeletonGrid count={3} label="Loading posts" />
        : posts.isError ? <LoadError message="Couldn't load the posts." onRetry={() => void posts.refetch()} />
        : posts.data.items.length === 0 ? <div className={cn(panel, "flex flex-col items-center gap-3 px-6 py-10 text-center")}>
          <p className={cn("font-heading text-b1 font-semibold", ink)}>Nothing posted yet</p>
          <p className={cn("max-w-md text-b3 leading-6", muted)}>Make an account, then post your first video, Short, pictures or words from it.</p>
          {access.post && <MoreLink to={createPath()}>Create a post</MoreLink>}
        </div>
        : <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{posts.data.items.map((post) => <PostTile key={post.id} post={post} onOpen={setOpenPost} />)}</ul>}
    </section>

    <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
      <section aria-labelledby="studio-groups" className="xl:col-span-8">
        <SectionHeading id="studio-groups" title="Groups" description="Hall weeks, launches and seasons: each with its own hashtag." action={<MoreLink to={APP_ROUTES.videoGroups}>All groups</MoreLink>} />
        {groups.isPending ? <SkeletonGrid count={2} className="xl:grid-cols-2" label="Loading groups" />
          : groups.isError ? <LoadError message="Couldn't load the groups." onRetry={() => void groups.refetch()} />
          : groups.data.items.length === 0 ? <p className={cn(panel, "px-6 py-8 text-center text-b3", muted)}>No groups yet. Make one for the next hall week.</p>
          : <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {groups.data.items.map((group) => <li key={group.id}>
              <Link to={groupPath(group.id)} className={cn(panel, "video-lift group block overflow-hidden hover:shadow-adbox-medium", focusRing)}>
                <GroupCover group={group} className="aspect-[16/9]" />
                <span className="block p-4">
                  <span className={cn("block truncate font-heading text-b1 font-semibold", ink)}>{group.name}</span>
                  <span className={cn("block truncate text-b3", muted)}>{[placeLabel(group), groupDates(group)].filter(Boolean).join(" · ") || (groupTiming(group) === "OPEN" ? "Open, no dates" : "")}</span>
                  <span className={cn("mt-1 block text-b3 tabular-nums", ink)}><strong>{formatCount(group.counts.posts)}</strong> posts</span>
                </span>
              </Link>
            </li>)}
          </ul>}
      </section>

      <aside aria-labelledby="studio-people" className="flex flex-col gap-8 xl:col-span-4">
        <section aria-labelledby="studio-people">
          <SectionHeading id="studio-people" title="Who's posting" description="Posts made in the last 30 days, by admin." />
          <ol className={cn(panel, "flex flex-col p-2")}>
            {(figures?.topAdmins ?? []).length === 0 && <li className={cn("px-4 py-6 text-center text-b3", muted)}>No posts in the last 30 days.</li>}
            {figures?.topAdmins.map((row, index) => {
              const body = <>
                <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-b3 font-bold", index === 0 ? "bg-warning-500/15 text-warning-700 dark:text-warning-300" : "bg-grey-100 text-grey-700 dark:bg-muted dark:text-muted-foreground")}>
                  {index === 0 ? <Trophy className="size-4" aria-label="Most posts" /> : index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-b3 font-semibold", ink)}>{row.admin?.name ?? "A former admin"}</span>
                  <span className={cn("block truncate text-[11px]", muted)}>{row.admin?.email}</span>
                </span>
                <span className={cn("font-heading text-b1 font-semibold tabular-nums", ink)}>{formatCount(row.posts)}</span>
              </>
              return <li key={row.admin?.id ?? index}>
                {row.admin ? <Link to={`${APP_ROUTES.videoPosts}?admin=${encodeURIComponent(row.admin.id)}`} aria-label={`${row.admin.name}: ${formatCount(row.posts)} posts. See them`}
                  className={cn("flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-grey-50 dark:hover:bg-muted/40", focusRing)}>{body}</Link>
                  : <div className="flex items-center gap-3 rounded-2xl px-3 py-2.5">{body}</div>}
              </li>
            })}
          </ol>
        </section>
        <section aria-labelledby="studio-accounts">
          <SectionHeading id="studio-accounts" title="Accounts" action={<MoreLink to={APP_ROUTES.videoAccounts}>All</MoreLink>} />
          <ul className={cn(panel, "flex flex-col p-2")}>
            {accounts.data?.items.length === 0 && <li className={cn("px-4 py-6 text-center text-b3", muted)}>No accounts yet.</li>}
            {accounts.data?.items.map((account) => <li key={account.id}>
              <Link to={accountPath(account.id)} className={cn("flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-grey-50 dark:hover:bg-muted/40", focusRing)}>
                <AccountAvatar account={account} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-b3 font-semibold", ink)}>{accountName(account)}</span>
                  <span className={cn("block truncate text-[11px]", muted)}>{account.username ? `@${account.username}` : ""}{account.institution ? ` · ${account.institution.shortName}` : ""}</span>
                </span>
                <span className={cn("text-b4 tabular-nums", muted)}>{formatCount(account.counts.posts)} posts</span>
              </Link>
            </li>)}
          </ul>
        </section>
      </aside>
    </div>

    <AccountDialog open={dialog === "account"} onOpenChange={(open) => setDialog(open ? "account" : null)} />
    <GroupDialog open={dialog === "group"} onOpenChange={(open) => setDialog(open ? "group" : null)} />
    <PostSheet post={openPost} onClose={() => setOpenPost(null)} />
  </div>
}
