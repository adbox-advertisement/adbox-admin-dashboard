import { useEffect, useState } from "react"
import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCurrentAdmin } from "@/features/auth"
import {
  approveCompany,
  approveVerificationRequest,
  declineHonour,
  getCompanies,
  getCompany,
  getHonourNominee,
  getHonourNominees,
  getInstitutions,
  getPlatformUser,
  getPlatformUsers,
  getUserConnections,
  getUserRelationships,
  getUserStats,
  getVerificationRequests,
  grantHonour,
  reactivatePlatformUser,
  rejectCompany,
  rejectVerificationRequest,
  suspendPlatformUser,
  updatePlatformUser,
  updateUserBadges,
} from "./api"
import type { CompanyQuery, ConnectionsQuery, HonourQuery, PlatformUserQuery, VerificationQuery } from "./validation"

// Every key lives under one root so a mutation can refresh the whole module:
// suspending a publisher changes people, companies and stats alike.
export const usersQueryKey = ["users"] as const
const keys = {
  list: (query: PlatformUserQuery) => [...usersQueryKey, "list", query] as const,
  detail: (id: string) => [...usersQueryKey, "detail", id] as const,
  stats: (institutionId?: string) => [...usersQueryKey, "stats", institutionId ?? "all"] as const,
  relationships: (id: string) => [...usersQueryKey, "relationships", id] as const,
  connections: (id: string, query: ConnectionsQuery) => [...usersQueryKey, "connections", id, query] as const,
  institutions: [...usersQueryKey, "institutions"] as const,
  companies: (query: CompanyQuery) => [...usersQueryKey, "companies", query] as const,
  company: (id: string) => [...usersQueryKey, "company", id] as const,
  honours: (query: HonourQuery) => [...usersQueryKey, "honours", query] as const,
  honour: (userId: string) => [...usersQueryKey, "honour", userId] as const,
  verification: (query: VerificationQuery) => [...usersQueryKey, "verification", query] as const,
}

export function useUserAccess() {
  const profile = useCurrentAdmin()
  const permissions = profile.data?.permissions ?? []
  return (permission: string) => permissions.includes("*") || permissions.includes(permission)
}

export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function usePlatformUsers(query: PlatformUserQuery, enabled = true) {
  return useQuery({
    queryKey: keys.list(query),
    queryFn: ({ signal }) => getPlatformUsers(query, signal),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function usePlatformUser(id: string | null, enabled = true) {
  return useQuery({
    queryKey: keys.detail(id ?? ""),
    queryFn: ({ signal }) => getPlatformUser(id ?? "", signal),
    enabled: Boolean(id) && enabled,
  })
}

export function useUserStats(institutionId?: string, enabled = true) {
  return useQuery({
    queryKey: keys.stats(institutionId),
    queryFn: ({ signal }) => getUserStats(institutionId, signal),
    enabled,
    staleTime: 60_000,
  })
}

export function useUserRelationships(id: string, enabled = true) {
  return useQuery({ queryKey: keys.relationships(id), queryFn: ({ signal }) => getUserRelationships(id, signal), enabled })
}

export function useUserConnections(id: string, query: ConnectionsQuery, enabled = true) {
  return useQuery({
    queryKey: keys.connections(id, query),
    queryFn: ({ signal }) => getUserConnections(id, query, signal),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useInstitutions(enabled = true) {
  return useQuery({ queryKey: keys.institutions, queryFn: ({ signal }) => getInstitutions(signal), enabled, staleTime: 5 * 60_000 })
}

export function useCompanies(query: CompanyQuery, enabled = true) {
  return useQuery({
    queryKey: keys.companies(query),
    queryFn: ({ signal }) => getCompanies(query, signal),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useCompany(id: string, enabled = true) {
  return useQuery({ queryKey: keys.company(id), queryFn: ({ signal }) => getCompany(id, signal), enabled })
}

export function useHonourNominees(query: HonourQuery, enabled = true) {
  return useQuery({
    queryKey: keys.honours(query),
    queryFn: ({ signal }) => getHonourNominees(query, signal),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useHonourNominee(userId: string | null, enabled = true) {
  return useQuery({
    queryKey: keys.honour(userId ?? ""),
    queryFn: ({ signal }) => getHonourNominee(userId ?? "", signal),
    enabled: Boolean(userId) && enabled,
  })
}

export function useVerificationRequests(query: VerificationQuery, enabled = true) {
  return useQuery({
    queryKey: keys.verification(query),
    queryFn: ({ signal }) => getVerificationRequests(query, signal),
    placeholderData: keepPreviousData,
    enabled,
  })
}

/** Totals for the section navigation badges: one-row pages give exact counts. */
export function usePendingCounts({ verification, companies }: { verification: boolean; companies: boolean }) {
  const pendingVerification = useQuery({
    queryKey: keys.verification({ status: "PENDING", limit: 1 }),
    queryFn: ({ signal }) => getVerificationRequests({ status: "PENDING", limit: 1 }, signal),
    enabled: verification,
    staleTime: 60_000,
  })
  const pendingCompanies = useQuery({
    queryKey: keys.companies({ status: "PENDING_VERIFICATION", limit: 1 }),
    queryFn: ({ signal }) => getCompanies({ status: "PENDING_VERIFICATION", limit: 1 }, signal),
    enabled: companies,
    staleTime: 60_000,
  })
  return { verification: pendingVerification.data?.total, companies: pendingCompanies.data?.total }
}

// Verification requests only carry a userId; resolve each applicant's profile.
export function useUsersById(ids: string[], enabled = true) {
  const unique = [...new Set(ids)]
  const results = useQueries({
    queries: unique.map((id) => ({
      queryKey: keys.detail(id),
      queryFn: ({ signal }: { signal: AbortSignal }) => getPlatformUser(id, signal),
      enabled,
      staleTime: 60_000,
    })),
  })
  return new Map(unique.map((id, index) => [id, results[index]]))
}

function useRefreshUsers() {
  const client = useQueryClient()
  // Invalidate even on failure: a lost response can follow a successful write.
  return () => client.invalidateQueries({ queryKey: usersQueryKey })
}

export function useUpdatePlatformUser() {
  return useMutation({ mutationFn: updatePlatformUser, onSettled: useRefreshUsers() })
}

export function useUpdateUserBadges() {
  return useMutation({ mutationFn: updateUserBadges, onSettled: useRefreshUsers() })
}

export function useSuspendPlatformUser() {
  return useMutation({ mutationFn: suspendPlatformUser, onSettled: useRefreshUsers() })
}

export function useReactivatePlatformUser() {
  return useMutation({ mutationFn: reactivatePlatformUser, onSettled: useRefreshUsers() })
}

export function useApproveVerification() {
  return useMutation({ mutationFn: approveVerificationRequest, onSettled: useRefreshUsers() })
}

export function useRejectVerification() {
  return useMutation({ mutationFn: rejectVerificationRequest, onSettled: useRefreshUsers() })
}

export function useApproveCompany() {
  return useMutation({ mutationFn: approveCompany, onSettled: useRefreshUsers() })
}

export function useRejectCompany() {
  return useMutation({ mutationFn: rejectCompany, onSettled: useRefreshUsers() })
}

export function useGrantHonour() {
  return useMutation({ mutationFn: grantHonour, onSettled: useRefreshUsers() })
}

export function useDeclineHonour() {
  return useMutation({ mutationFn: declineHonour, onSettled: useRefreshUsers() })
}
