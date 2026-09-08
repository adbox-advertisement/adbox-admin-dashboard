import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  loadRdiCms,
  publishRdiPage,
  publishRdiSettings,
  saveRdiPage,
  saveRdiSettings,
} from "@/features/rdi/api"

export const rdiCmsQueryKey = ["rdi-cms", "draft"] as const

export function useRdiCms() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: rdiCmsQueryKey, queryFn: loadRdiCms })
  const invalidate = () => queryClient.invalidateQueries({ queryKey: rdiCmsQueryKey })
  const savePage = useMutation({
    mutationFn: ({ current, page }: { current: Parameters<typeof saveRdiPage>[0]; page: Parameters<typeof saveRdiPage>[1] }) =>
      saveRdiPage(current, page),
    onSuccess: invalidate,
  })
  const saveSettings = useMutation({
    mutationFn: ({ current, settings }: { current: Parameters<typeof saveRdiSettings>[0]; settings: Parameters<typeof saveRdiSettings>[1] }) =>
      saveRdiSettings(current, settings),
    onSuccess: invalidate,
  })
  const publishPage = useMutation({
    mutationFn: ({ pageKey, version }: { pageKey: string; version: number }) =>
      publishRdiPage(pageKey, version),
    onSuccess: invalidate,
  })
  const publishSettings = useMutation({ mutationFn: publishRdiSettings, onSuccess: invalidate })
  return { query, savePage, saveSettings, publishPage, publishSettings }
}
