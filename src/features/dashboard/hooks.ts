import { keepPreviousData, useIsFetching, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCurrentAdmin } from "@/features/auth"
import { getAdStages, getContentSummary, getGoldSales, getInstitutions, getPeopleStats, getSignups, getTopCreators } from "./api"
import { daysToFetch, type SignupRange } from "./lib/signups"
import { DASHBOARD_PERMISSIONS } from "./types"
import { hasPermission } from "@/lib/permissions"

/** Every institution, for the map. The catalogue changes rarely, so it is kept for a while. */
export function useMapInstitutions() {
  return useQuery({
    queryKey: ["dashboard", "institutions"],
    queryFn: ({ signal }) => getInstitutions(signal),
    staleTime: 5 * 60_000,
  })
}

/** Which cards this admin may read. The backend decides; this only avoids certain 403s. */
export function useDashboardAccess() {
  const admin = useCurrentAdmin()
  const permissions = admin.data?.permissions ?? []
  const can = (permission: string) => hasPermission(permissions, permission)
  return {
    loading: admin.isPending,
    people: can(DASHBOARD_PERMISSIONS.people),
    content: can(DASHBOARD_PERMISSIONS.content),
    ads: can(DASHBOARD_PERMISSIONS.ads),
    payments: can(DASHBOARD_PERMISSIONS.payments),
    trends: can(DASHBOARD_PERMISSIONS.trends),
  }
}
export type DashboardAccess = ReturnType<typeof useDashboardAccess>

// Figures for a glance: a minute old is fresh enough, and Refresh reads them again.
const STALE_MS = 60_000

export function usePeopleStats(enabled: boolean) {
  return useQuery({ queryKey: ["dashboard", "people"], queryFn: ({ signal }) => getPeopleStats(signal), enabled, staleTime: STALE_MS })
}

/**
 * Sign-ups for a range and the span it is compared with. While another range loads, the last one
 * stays on screen; `data.range` says which range the figures are for.
 */
export function useSignups(range: SignupRange, enabled: boolean) {
  const days = daysToFetch(range, new Date())
  return useQuery({
    queryKey: ["dashboard", "signups", range, days],
    queryFn: async ({ signal }) => ({ range, signups: await getSignups(days, signal) }),
    enabled,
    staleTime: STALE_MS,
    placeholderData: keepPreviousData,
  })
}

export function useContentSummary(enabled: boolean) {
  return useQuery({ queryKey: ["dashboard", "content"], queryFn: ({ signal }) => getContentSummary(signal), enabled, staleTime: STALE_MS })
}

export function useTopCreators(enabled: boolean, limit = 5) {
  return useQuery({ queryKey: ["dashboard", "creators", limit], queryFn: ({ signal }) => getTopCreators(limit, signal), enabled, staleTime: STALE_MS })
}

export function useAdStages(enabled: boolean) {
  return useQuery({ queryKey: ["dashboard", "ads"], queryFn: ({ signal }) => getAdStages(signal), enabled, staleTime: STALE_MS })
}

export function useGoldSales(enabled: boolean) {
  return useQuery({ queryKey: ["dashboard", "gold-sales"], queryFn: ({ signal }) => getGoldSales(signal), enabled, staleTime: STALE_MS })
}

/** Re-reads everything on screen (every card, the map, the queues, Trending), and whether a read is under way. */
export function useRefreshScreen() {
  const client = useQueryClient()
  const fetching = useIsFetching() > 0
  return { refresh: () => client.refetchQueries({ type: "active" }), fetching }
}
