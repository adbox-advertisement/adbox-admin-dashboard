import { useCallback, useEffect, useState } from "react"
import { useLocation, useSearchParams } from "react-router-dom"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCurrentAdmin } from "@/features/auth"
import {
  getChatReport,
  getChatReports,
  getContentReport,
  getContentReports,
  getContentSummary,
  getTopUploaders,
  getUploader,
  getUserAds,
  getUserPost,
  getUserPosts,
  getUserSurveys,
  removeUserPost,
  resolveChatReport,
  resolveContentReport,
  restoreUserPost,
  setUserSurveyActive,
} from "./api"
import { contentPath } from "./lib/paths"
import type { AdQuery, ChatReportQuery, ContentReportQuery, PostQuery, SurveyQuery } from "./validation"

export const contentQueryKey = ["user-content"] as const

export function useContentAccess() {
  const profile = useCurrentAdmin()
  const permissions = profile.data?.permissions ?? []
  return {
    isPending: profile.isPending,
    isError: profile.isError,
    retry: () => void profile.refetch(),
    can: (permission: string) => permissions.includes("*") || permissions.includes(permission),
  }
}

/**
 * The uploader every section is narrowed to (`?userId=`), and links that keep it.
 * `scopeTo(id)` points the current section at another uploader; `null` clears the scope.
 */
export function useContentScope() {
  const [params] = useSearchParams()
  const { pathname } = useLocation()
  const userId = params.get("userId") ?? undefined
  const withScope = useCallback((path: string, extra: Record<string, string | undefined> = {}) => contentPath(path, { ...extra, userId }), [userId])
  const scopeTo = useCallback((id: string | null, path?: string) => {
    // On the current section the filters stay; only the uploader and the page change.
    const kept = path ? {} : Object.fromEntries([...params].filter(([key]) => key !== "page" && key !== "userId"))
    return contentPath(path ?? pathname, { ...kept, userId: id ?? undefined })
  }, [params, pathname])
  return { userId, withScope, scopeTo }
}

/** URL-backed list filters, so a filtered view can be shared, bookmarked and restored with Back. */
export function useListParams<T extends Record<string, string>>(defaults: T) {
  const [params, setParams] = useSearchParams()
  const values = Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => [key, params.get(key) ?? fallback])) as T
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1)
  const update = useCallback((next: Partial<T> & { page?: number }) => setParams((current) => {
    const updated = new URLSearchParams(current)
    for (const [key, value] of Object.entries(next)) {
      if (key === "page") continue
      if (value === undefined || value === "" || value === defaults[key]) updated.delete(key)
      else updated.set(key, String(value))
    }
    // Any filter change starts again from the first page.
    const nextPage = next.page ?? 1
    if (nextPage > 1) updated.set("page", String(nextPage))
    else updated.delete("page")
    return updated
  }, { replace: true }), [defaults, setParams])
  return { values, page, update }
}

/**
 * A search box whose debounced text is committed to the URL. Typing stays local and instant;
 * a URL change from elsewhere (Back, a link) replaces the text.
 */
export function useSearchInput(committed: string, commit: (value: string) => void) {
  const [text, setText] = useState(committed)
  const [seen, setSeen] = useState(committed)
  if (committed !== seen) {
    setSeen(committed)
    if (committed !== text.trim()) setText(committed)
  }
  const debounced = useDebouncedValue(text.trim())
  useEffect(() => {
    if (debounced !== committed) commit(debounced)
    // Only a settled change of the typed text commits; `committed` catching up must not re-commit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])
  return [text, setText] as const
}

export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function useContentSummary(userId: string | undefined, enabled = true) {
  return useQuery({ queryKey: [...contentQueryKey, "summary", userId ?? "all"], queryFn: ({ signal }) => getContentSummary(userId, signal), enabled, staleTime: 30_000 })
}

export function useTopUploaders(enabled = true) {
  return useQuery({ queryKey: [...contentQueryKey, "uploaders"], queryFn: ({ signal }) => getTopUploaders(8, signal), enabled, staleTime: 60_000 })
}

export function useUploader(userId: string | undefined, enabled = true) {
  return useQuery({ queryKey: [...contentQueryKey, "uploader", userId], queryFn: ({ signal }) => getUploader(userId ?? "", signal), enabled: Boolean(userId) && enabled, staleTime: 60_000 })
}

export function useUserPosts(query: PostQuery, enabled = true) {
  return useQuery({ queryKey: [...contentQueryKey, "posts", query], queryFn: ({ signal }) => getUserPosts(query, signal), placeholderData: keepPreviousData, enabled })
}

export function useUserPost(postId: string | undefined, enabled = true) {
  return useQuery({ queryKey: [...contentQueryKey, "post", postId], queryFn: ({ signal }) => getUserPost(postId ?? "", signal), enabled: Boolean(postId) && enabled })
}

export function useUserAds(query: AdQuery, enabled = true) {
  return useQuery({ queryKey: [...contentQueryKey, "ads", query], queryFn: ({ signal }) => getUserAds(query, signal), placeholderData: keepPreviousData, enabled })
}

export function useUserSurveys(query: SurveyQuery, enabled = true) {
  return useQuery({ queryKey: [...contentQueryKey, "surveys", query], queryFn: ({ signal }) => getUserSurveys(query, signal), placeholderData: keepPreviousData, enabled })
}

export function useContentReports(query: ContentReportQuery, enabled = true) {
  return useQuery({ queryKey: [...contentQueryKey, "reports", query], queryFn: ({ signal }) => getContentReports(query, signal), placeholderData: keepPreviousData, enabled })
}

export function useContentReport(reportId: string | undefined, enabled = true) {
  return useQuery({ queryKey: [...contentQueryKey, "report", reportId], queryFn: ({ signal }) => getContentReport(reportId ?? "", signal), enabled: Boolean(reportId) && enabled })
}

export function useChatReports(query: ChatReportQuery, enabled = true) {
  return useQuery({ queryKey: [...contentQueryKey, "chat-reports", query], queryFn: ({ signal }) => getChatReports(query, signal), placeholderData: keepPreviousData, enabled })
}

export function useChatReport(reportId: string | undefined, enabled = true) {
  return useQuery({ queryKey: [...contentQueryKey, "chat-report", reportId], queryFn: ({ signal }) => getChatReport(reportId ?? "", signal), enabled: Boolean(reportId) && enabled })
}

/** Open reports in both queues, for the section badge and the Overview. Only totals are read. */
export function useOpenReportCounts(enabled = true) {
  const posts = useQuery({ queryKey: [...contentQueryKey, "reports", "open-count"], queryFn: ({ signal }) => getContentReports({ status: "OPEN", limit: 1 }, signal), enabled, staleTime: 30_000 })
  const chats = useQuery({ queryKey: [...contentQueryKey, "chat-reports", "open-count"], queryFn: ({ signal }) => getChatReports({ status: "OPEN", limit: 1 }, signal), enabled, staleTime: 30_000 })
  const content = posts.data?.total
  const messages = chats.data?.total
  return { content, messages, total: content === undefined || messages === undefined ? undefined : content + messages, isError: posts.isError || chats.isError }
}

function useRefreshContent() {
  const client = useQueryClient()
  // Invalidate even on failure: a lost response can follow a successful write.
  return () => client.invalidateQueries({ queryKey: contentQueryKey })
}

export function useRemovePost() {
  return useMutation({ mutationFn: removeUserPost, onSettled: useRefreshContent() })
}

export function useRestorePost() {
  return useMutation({ mutationFn: restoreUserPost, onSettled: useRefreshContent() })
}

export function useSetSurveyActive() {
  return useMutation({ mutationFn: setUserSurveyActive, onSettled: useRefreshContent() })
}

export function useResolveContentReport() {
  return useMutation({ mutationFn: resolveContentReport, onSettled: useRefreshContent() })
}

export function useResolveChatReport() {
  return useMutation({ mutationFn: resolveChatReport, onSettled: useRefreshContent() })
}
