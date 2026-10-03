import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCurrentAdmin } from "@/features/auth"
import { changeStatus, exportApplications, getApplication, getApplications, getRecruitmentCampaigns, getRecruitmentStats, getVideoUrl, saveReview } from "./api"
import type { ApplicationFilters } from "./types"

export function useRecruitmentAccess() {
  const profile = useCurrentAdmin()
  const can = (key: string) => Boolean(profile.data?.permissions.some(permission => permission === "*" || permission === key))
  return { profile, canRead: can("recruitment.applications.read"), canReview: can("recruitment.applications.review"), canExport: can("recruitment.applications.export"), canManageCampaigns: can("recruitment.campaigns.manage") }
}
export function useApplications(filters: ApplicationFilters, enabled: boolean) {
  return useQuery({ queryKey: ["recruitment", "applications", filters], queryFn: ({ signal }) => getApplications(filters, signal), enabled, refetchInterval: 60_000 })
}
export function useApplication(id: string) {
  return useQuery({ queryKey: ["recruitment", "detail", id], queryFn: ({ signal }) => getApplication(id, signal), staleTime: 0, gcTime: 0 })
}
export function useRecruitmentStats(campaignId: string | undefined, enabled: boolean) {
  return useQuery({ queryKey: ["recruitment", "stats", campaignId], queryFn: ({ signal }) => getRecruitmentStats(campaignId, signal), enabled, refetchInterval: 60_000 })
}
export function useRecruitmentCampaigns(enabled: boolean) {
  return useQuery({ queryKey: ["recruitment", "campaigns"], queryFn: ({ signal }) => getRecruitmentCampaigns(signal), enabled })
}
export function useRefreshRecruitment() {
  const client = useQueryClient()
  return () => client.invalidateQueries({ queryKey: ["recruitment"] })
}
export function useSaveReview() {
  return useMutation({ mutationFn: saveReview, onSettled: useRefreshRecruitment() })
}
export function useChangeStatus() {
  return useMutation({ mutationFn: changeStatus, onSettled: useRefreshRecruitment() })
}
export function useVideoUrl(id: string) {
  return useMutation({ mutationFn: () => getVideoUrl(id), gcTime: 0 })
}
export function useExportApplications() {
  return useMutation({ mutationFn: exportApplications, gcTime: 0 })
}
