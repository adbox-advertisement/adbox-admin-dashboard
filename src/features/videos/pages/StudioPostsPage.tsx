import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Clapperboard, Grid2X2, Images, Type, X, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState, LoadError, SectionHeading, SkeletonGrid } from "../components/StudioBits"
import { PostSheet, PostTile } from "../components/StudioPosts"
import { focusRing, muted } from "../components/tokens"
import { useStudioAccess, useStudioAccounts, useStudioGroups, useStudioPosts, useStudioSummary } from "../hooks"
import { cn } from "../lib/cn"
import { accountName, formatCount } from "../lib/format"
import { POST_TYPES, type PostType, type StudioPost } from "../types"

const PAGE_SIZE = 24
const ANY = "any"

const KINDS: Array<{ value: PostType | null; label: string; icon: LucideIcon }> = [
  { value: null, label: "Everything", icon: Grid2X2 },
  { value: "VIDEO", label: "Videos & Shorts", icon: Clapperboard },
  { value: "IMAGE", label: "Pictures", icon: Images },
  { value: "TEXT", label: "Text", icon: Type },
]

/** Everything posted from the studio's accounts, with the admin who made each. Filters live in the address. */
export function StudioPostsPage() {
  const access = useStudioAccess()
  const [params, setParams] = useSearchParams()
  const accountId = params.get("account") ?? undefined
  const groupId = params.get("group") ?? undefined
  const adminId = params.get("admin") ?? undefined
  const type = POST_TYPES.find((value) => value === params.get("type"))
  const page = Math.max(1, Number(params.get("page")) || 1)
  const posts = useStudioPosts({ accountId, groupId, adminId, type, page, limit: PAGE_SIZE }, access.read)
  const accounts = useStudioAccounts({ state: "all", limit: 100 }, access.read)
  const groups = useStudioGroups({ state: "all", limit: 100 }, access.read)
  const summary = useStudioSummary(access.read)
  const [openPost, setOpenPost] = useState<StudioPost | null>(null)
  const total = posts.data?.total ?? 0
  const filtered = Boolean(accountId || groupId || adminId || type)

  // Radix reports "" when its hidden native select briefly lacks an option still loading (an
  // account named in the address); no option here is empty, so that's ignored.
  const choose = (name: string) => (value: string) => { if (value) setFilter(name, value === ANY ? null : value) }

  const setFilter = (name: string, value: string | null | undefined) => setParams((current) => {
    const next = new URLSearchParams(current)
    if (value) next.set(name, value)
    else next.delete(name)
    if (name !== "page") next.delete("page")
    return next
  }, { replace: true })

  // The admins worth offering: you, then whoever posted lately, then whoever the address names.
  const admins = new Map<string, string>()
  if (access.adminId) admins.set(access.adminId, "Me")
  for (const row of summary.data?.topAdmins ?? []) if (row.admin && !admins.has(row.admin.id)) admins.set(row.admin.id, row.admin.name)
  if (adminId && !admins.has(adminId)) admins.set(adminId, "The chosen admin")

  return <div className="flex flex-col gap-6">
    <SectionHeading title="Posts" description="Everything posted from AdBox's accounts, newest first, with the admin who made each." />

    <div role="group" aria-label="Kind of post" className="flex flex-wrap gap-2">
      {KINDS.map(({ value, label, icon: Icon }) => {
        const selected = (type ?? null) === value
        return <button key={label} type="button" aria-pressed={selected} onClick={() => setFilter("type", value)}
          className={cn("inline-flex h-10 items-center gap-2 rounded-full border px-4 text-b3 font-semibold transition-colors", focusRing,
            selected ? "border-transparent bg-[image:var(--gradient-purple)] text-white shadow-adbox-small" : "border-grey-200 bg-white text-grey-700 hover:border-purple/40 dark:border-border dark:bg-card dark:text-muted-foreground")}>
          <Icon className="size-4" aria-hidden="true" />{label}
        </button>
      })}
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
      <Select value={accountId ?? ANY} onValueChange={choose("account")}>
        <SelectTrigger aria-label="Account" className="h-11 rounded-2xl lg:col-span-4"><SelectValue /></SelectTrigger>
        <SelectContent className="video-management-ui">
          <SelectItem value={ANY}>Any account</SelectItem>
          {accountId && !accounts.data?.items.some((account) => account.id === accountId) && <SelectItem value={accountId}>The chosen account</SelectItem>}
          {accounts.data?.items.map((account) => <SelectItem key={account.id} value={account.id}>{accountName(account)}{account.username ? ` · @${account.username}` : ""}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={groupId ?? ANY} onValueChange={choose("group")}>
        <SelectTrigger aria-label="Group" className="h-11 rounded-2xl lg:col-span-4"><SelectValue /></SelectTrigger>
        <SelectContent className="video-management-ui">
          <SelectItem value={ANY}>Any group</SelectItem>
          {groupId && !groups.data?.items.some((group) => group.id === groupId) && <SelectItem value={groupId}>The chosen group</SelectItem>}
          {groups.data?.items.map((group) => <SelectItem key={group.id} value={group.id}>#{group.hashtag}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={adminId ?? ANY} onValueChange={choose("admin")}>
        <SelectTrigger aria-label="Made by" className="h-11 rounded-2xl lg:col-span-3"><SelectValue /></SelectTrigger>
        <SelectContent className="video-management-ui">
          <SelectItem value={ANY}>Made by anyone</SelectItem>
          {[...admins].map(([id, name]) => <SelectItem key={id} value={id}>Made by {name}</SelectItem>)}
        </SelectContent>
      </Select>
      {filtered && <Button type="button" variant="ghost" className="h-11 cursor-pointer rounded-full lg:col-span-1" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
        <X className="size-4" aria-hidden="true" />Clear
      </Button>}
    </div>

    {posts.data && <p role="status" className={cn("text-b3", muted)}>{formatCount(total)} {total === 1 ? "post" : "posts"}</p>}
    {posts.isPending ? <SkeletonGrid label="Loading posts" />
      : posts.isError ? <LoadError message="Couldn't load the posts." onRetry={() => void posts.refetch()} />
      : posts.data.items.length === 0 ? <EmptyState icon={Grid2X2} title={filtered ? "No posts match" : "Nothing posted yet"}>
        {filtered ? "Try another kind, account, group or admin." : "Posts made from the studio's accounts show here, with who made each."}
      </EmptyState>
      : <ul aria-label="Posts" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {posts.data.items.map((post) => <PostTile key={post.id} post={post} onOpen={setOpenPost} />)}
      </ul>}

    {total > PAGE_SIZE && <Pagination page={page} limit={PAGE_SIZE} total={total} noun="posts" onPageChange={(next) => setFilter("page", String(next))} />}
    <PostSheet post={openPost} onClose={() => setOpenPost(null)} />
  </div>
}
