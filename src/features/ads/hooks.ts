import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCurrentAdmin } from "@/features/auth"
import { actOnAd, getAd, getAds, getReportedAds } from "./api"
import type { AdListQuery } from "./types"

const keys = {
  all: ["ads"] as const,
  list: (query: AdListQuery) => ["ads", "list", query] as const,
  reported: (query: object) => ["ads", "reported", query] as const,
  one: (id: string) => ["ads", "one", id] as const,
}

export function useAdsAccess() {
  const profile = useCurrentAdmin()
  const permissions = profile.data?.permissions ?? []
  return {
    loading: profile.isPending,
    can: (permission: string) => permissions.includes("*") || permissions.includes(permission),
  }
}

export function useAds(query: AdListQuery, enabled = true) {
  return useQuery({ queryKey: keys.list(query), queryFn: ({ signal }) => getAds(query, signal), placeholderData: keepPreviousData, enabled })
}

export function useReportedAds(query: { search?: string; page: number; limit: number }, enabled = true) {
  return useQuery({ queryKey: keys.reported(query), queryFn: ({ signal }) => getReportedAds(query, signal), placeholderData: keepPreviousData, enabled })
}

export function useAd(id: string | null) {
  return useQuery({ queryKey: keys.one(id ?? ""), queryFn: ({ signal }) => getAd(id!, signal), enabled: Boolean(id) })
}

/** Any stage change: every list and the ad itself are read again. */
export function useAdAction() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: actOnAd,
    onSettled: () => client.invalidateQueries({ queryKey: keys.all }),
  })
}

/** Filters kept in the address, so a view can be shared and survives a reload. */
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
    const nextPage = next.page ?? 1
    if (nextPage > 1) updated.set("page", String(nextPage))
    else updated.delete("page")
    return updated
  }, { replace: true }), [defaults, setParams])
  return { values, page, update }
}

/** Typed search that commits once the typing settles. */
export function useSearchInput(committed: string, commit: (value: string) => void, delay = 300) {
  const [text, setText] = useState(committed)
  useEffect(() => {
    const value = text.trim()
    if (value === committed) return
    const timer = setTimeout(() => commit(value), delay)
    return () => clearTimeout(timer)
    // Only the typed text starts a commit; `committed` catching up must not.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])
  return [text, setText] as const
}
