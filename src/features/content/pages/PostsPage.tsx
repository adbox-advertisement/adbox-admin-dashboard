import { useCallback } from "react"
import { CircleCheck, LayoutGrid, LibraryBig, List, Trash2 } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import { cn } from "../lib/cn"
import { useContentScope, useContentSummary, useListParams, useSearchInput, useUserPosts } from "../hooks"
import { contentErrorMessage } from "../lib/errors"
import { mediaTypeLabels, type MediaType } from "../types"
import { mediaTypes } from "../validation"
import { EmptyState, ErrorState, FilterChips, SearchBox, Segmented, Toolbar, surface } from "../components/ContentBits"
import { PostCard, PostGridSkeleton, PostRow } from "../components/PostCards"
import { mediaIcons } from "../lib/media"

const PAGE_SIZE = 24
const defaults = { type: "all", state: "live", view: "grid", q: "" }
const grid = "grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
const isMediaType = (value: string): value is MediaType => (mediaTypes as readonly string[]).includes(value)

export function PostsPage() {
  const { userId, scopeTo } = useContentScope()
  const { values, page, update } = useListParams(defaults)
  const commitSearch = useCallback((q: string) => update({ q }), [update])
  const [search, setSearch] = useSearchInput(values.q, commitSearch)
  const type = isMediaType(values.type) ? values.type : undefined
  const state = values.state === "removed" ? "removed" : "live"
  const view = values.view === "list" ? "list" : "grid"
  const summary = useContentSummary(userId)
  const posts = useUserPosts({ userId, mediaType: type, state, search: values.q || undefined, page, limit: PAGE_SIZE })

  const counts = summary.data && state === "live"
    ? { all: summary.data.videos + summary.data.images + summary.data.text, VIDEO: summary.data.videos, IMAGE: summary.data.images, TEXT: summary.data.text }
    : undefined
  const noun = type ? mediaTypeLabels[type].many.toLowerCase() : "posts"
  const filtered = Boolean(values.q)

  return <div className="flex min-w-0 flex-col gap-4 px-4 sm:px-6">
    <Toolbar>
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBox value={search} onChange={setSearch} label="Search by title, caption or uploader" className="lg:flex-1" />
        <div className="flex flex-wrap items-center gap-2">
          <Segmented label="Show live or removed posts" value={state} onChange={(next) => update({ ...values, state: next })}
            options={[{ value: "live", label: "Live", icon: CircleCheck }, { value: "removed", label: "Removed", icon: Trash2 }]} />
          <Segmented label="Layout" iconOnlyOnMobile value={view} onChange={(next) => update({ ...values, view: next, page })}
            options={[{ value: "grid", label: "Grid", icon: LayoutGrid }, { value: "list", label: "List", icon: List }]} />
        </div>
      </div>
      <FilterChips label="Post type" value={type ?? "all"} onChange={(next) => update({ ...values, type: next })} options={[
        { value: "all", label: "All posts", icon: LibraryBig, count: counts?.all },
        ...mediaTypes.map((media) => ({ value: media, label: mediaTypeLabels[media].many, icon: mediaIcons[media], count: counts?.[media] })),
      ]} />
    </Toolbar>

    {posts.isPending && <PostGridSkeleton className={grid} />}
    {posts.isError && <div className={surface}><ErrorState message={contentErrorMessage(posts.error, `Could not load ${noun}.`)} onRetry={() => void posts.refetch()} /></div>}
    {posts.data && (posts.data.items.length === 0
      ? <div className={surface}>
        <EmptyState icon={state === "removed" ? Trash2 : LibraryBig} title={`No ${state === "removed" ? "removed " : ""}${noun}${filtered ? " match your search" : ""}`}>
          {filtered ? "Try a different word, or clear the search." : state === "removed" ? "Posts you remove appear here, so they can be restored." : "Uploads appear here as people post them."}
        </EmptyState>
      </div>
      : <div className={cn("flex flex-col gap-4 transition-opacity", posts.isPlaceholderData && "opacity-60")} aria-busy={posts.isPlaceholderData}>
        {view === "grid"
          ? <ul aria-label={`${noun} list`} className={grid}>
            {posts.data.items.map((post) => <PostCard key={post.id} post={post} uploaderTo={userId ? undefined : scopeTo(post.user.id)} />)}
          </ul>
          : <ul aria-label={`${noun} list`} className={cn(surface, "divide-y divide-grey-100 overflow-hidden dark:divide-border")}>
            {posts.data.items.map((post) => <PostRow key={post.id} post={post} uploaderTo={userId ? undefined : scopeTo(post.user.id)} />)}
          </ul>}
        <div className={cn(surface, "overflow-hidden [&>nav]:border-t-0")}>
          <Pagination page={page} limit={PAGE_SIZE} total={posts.data.total} noun={noun} onPageChange={(next) => { update({ ...values, page: next }); window.scrollTo({ top: 0, behavior: "smooth" }) }} />
        </div>
      </div>)}
  </div>
}
