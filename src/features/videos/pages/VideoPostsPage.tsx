import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowUpRight, GraduationCap, Grid2X2, Plus, SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { APP_ROUTES } from "@/routes/paths"
import { PostCollectionCard } from "../components/posts/PostCollectionCard"
import { PostDetailsSheet } from "../components/posts/PostDetailsSheet"
import { PostsFilters } from "../components/posts/PostsFilters"
import { VideoPageHero } from "../components/shared/VideoPageHero"
import { demoCollections, demoPosts } from "../data/demo-posts"
import { usePostFilters } from "../hooks/use-post-filters"

const counts = {
  all: demoPosts.length,
  video: demoPosts.filter(({ mediaType }) => mediaType === "video").length,
  photo: demoPosts.filter(({ mediaType }) => mediaType === "photo").length,
}
const schoolCount = new Set(demoCollections.map(({ schoolId }) => schoolId)).size

export function VideoPostsPage() {
  const filters = usePostFilters()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const lastTrigger = useRef<HTMLButtonElement | null>(null)
  const selectedGroup = filters.groups.find(({ posts }) => posts.some(({ id }) => id === selectedId))
  const selectedPost = selectedGroup?.posts.find(({ id }) => id === selectedId)
  const resultCount = filters.groups.reduce((sum, group) => sum + group.posts.length, 0)

  function openPost(id: string, trigger: HTMLButtonElement) {
    lastTrigger.current = trigger
    setSelectedId(id)
  }

  return (
    <>
      <section aria-labelledby="posts-title">
        <VideoPageHero id="posts-title" title="Good stories belong together." description="Explore your campus content, revisit a favourite moment, or make room for something new.">
          <Button asChild variant="secondary" className="h-11 gap-2 rounded-xl px-5 shadow-adbox-small"><Link to={APP_ROUTES.videoUpload}><Plus className="size-4" aria-hidden="true" />Upload content<ArrowUpRight className="size-4" aria-hidden="true" /></Link></Button>
        </VideoPageHero>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div><h3 className="font-heading text-h5 font-semibold leading-7">Posts</h3><p className="mt-1.5 text-sm text-muted-foreground">Your videos and photos, grouped into collections.</p></div>
          <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-2"><Grid2X2 className="size-3.5 text-secondary" aria-hidden="true" />{counts.all} posts</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-2"><GraduationCap className="size-3.5 text-secondary" aria-hidden="true" />{schoolCount} schools</span>
          </div>
        </div>
        <PostsFilters {...filters} counts={counts} />
        <div className="mb-4 mt-6 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">{filters.hasFilters ? "Search results" : "All collections"}</h3>
          <p role="status" className="text-xs text-muted-foreground">{resultCount} {resultCount === 1 ? "post" : "posts"} in {filters.groups.length} {filters.groups.length === 1 ? "collection" : "collections"}</p>
        </div>
        {filters.groups.length > 0 ? <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-4 md:grid-cols-6 xl:grid-cols-12">
          {filters.groups.map((group) => <PostCollectionCard key={group.collection.id} group={group} onOpen={openPost} />)}
        </div> : <div className="video-reveal flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center"><span className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-secondary/5 text-secondary"><SearchX className="size-7" aria-hidden="true" /></span><h3 className="font-heading text-h5 font-semibold">No posts found</h3><p className="mt-3 max-w-sm text-sm leading-7 text-muted-foreground">Try a different title, collection, or school. Your next discovery could be one search away.</p><Button variant="secondary" className="mt-5 h-11 rounded-xl px-5" onClick={filters.clearFilters}>Clear all filters</Button></div>}
      </section>
      <PostDetailsSheet post={selectedPost} group={selectedGroup} onClose={() => setSelectedId(null)} onNavigate={setSelectedId} onReturnFocus={() => { if (lastTrigger.current?.isConnected) lastTrigger.current.focus() }} />
    </>
  )
}
