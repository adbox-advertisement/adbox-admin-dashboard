import { useEffect, useRef } from "react"
import { useSearchParams } from "react-router-dom"

import { demoCollections, demoPosts } from "../data/demo-posts"
import { uploadSchools } from "../data/schools"
import type { CollectionPostGroup, PostMediaType } from "../types/posts"

export function usePostFilters() {
  const [params, setParams] = useSearchParams()
  const latestParams = useRef(params)
  useEffect(() => { latestParams.current = params }, [params])
  const query = params.get("q") ?? ""
  const school = uploadSchools.find(({ id }) => id === params.get("school"))?.id ?? "all"
  const media: PostMediaType | "all" = params.get("type") === "video" ? "video" : params.get("type") === "photo" ? "photo" : "all"
  const sort = params.get("sort") === "oldest" ? "oldest" : "recent"

  function updateParams(next: URLSearchParams) {
    // Preserve consecutive actions while the router is committing the previous URL.
    latestParams.current = next
    setParams(next, { replace: true, preventScrollReset: true })
  }

  function setFilter(key: "q" | "school" | "type" | "sort", value: string) {
    const next = new URLSearchParams(latestParams.current)
    next.delete("status")
    if (next.get("sort") === "views") next.delete("sort")
    if (!value || value === "all" || (key === "sort" && value === "recent")) next.delete(key)
    else next.set(key, value)
    updateParams(next)
  }

  const search = query.trim().toLowerCase()
  const groups: CollectionPostGroup[] = demoCollections.flatMap((collection) => {
    if (school !== "all" && collection.schoolId !== school) return []
    const schoolName = uploadSchools.find(({ id }) => id === collection.schoolId)?.name ?? ""
    const posts = demoPosts.filter((post) => post.collectionId === collection.id
      && (media === "all" || post.mediaType === media)
      && `${collection.name} ${schoolName} ${post.title} ${post.caption}`.toLowerCase().includes(search))
      .sort((a, b) => sort === "oldest" ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt))
    return posts.length ? [{ collection, posts }] : []
  }).sort((a, b) => sort === "oldest"
    ? a.posts[0].createdAt.localeCompare(b.posts[0].createdAt)
    : b.posts[0].createdAt.localeCompare(a.posts[0].createdAt))

  return {
    query, school, media, sort, groups, setFilter,
    hasFilters: Boolean(query || school !== "all" || media !== "all"),
    clearFilters: () => updateParams(new URLSearchParams(latestParams.current.get("sort") === "oldest" ? { sort: "oldest" } : {})),
  }
}
