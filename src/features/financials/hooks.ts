import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCurrentAdmin } from "@/features/auth"
import {
  createGoldBundle,
  createSpotlightPlan,
  getGoldBundles,
  getGoldPurchases,
  getGoldSettings,
  getSpotlightPlans,
  updateGoldBundle,
  updateGoldSettings,
  updateSpotlightPlan,
} from "./api"

const keys = {
  settings: ["gold", "settings"] as const,
  bundles: ["gold", "bundles"] as const,
  spotlight: ["gold", "spotlight-plans"] as const,
}

export function useFinanceAccess() {
  const profile = useCurrentAdmin()
  const permissions = profile.data?.permissions ?? []
  return {
    loading: profile.isPending,
    can: (permission: string) => permissions.includes("*") || permissions.includes(permission),
  }
}

export function useGoldSettings(enabled: boolean) {
  return useQuery({ queryKey: keys.settings, queryFn: ({ signal }) => getGoldSettings(signal), enabled })
}

export function useUpdateGoldSettings() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: updateGoldSettings,
    onSuccess: (settings, changes) => {
      client.setQueryData(keys.settings, settings)
      // A new exchange rate reprices every bundle on the server.
      if (changes.barsPerCedi !== undefined) void client.invalidateQueries({ queryKey: keys.bundles })
    },
  })
}

export function useGoldBundles(enabled: boolean) {
  return useQuery({ queryKey: keys.bundles, queryFn: ({ signal }) => getGoldBundles(signal), enabled })
}

export function useSaveGoldBundle() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (save: Parameters<typeof updateGoldBundle>[0] & { create?: boolean }) =>
      save.create ? createGoldBundle({ ...save.input, id: save.id } as Parameters<typeof createGoldBundle>[0]) : updateGoldBundle(save),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.bundles }),
  })
}

export function useSpotlightPlans(enabled: boolean) {
  return useQuery({ queryKey: keys.spotlight, queryFn: ({ signal }) => getSpotlightPlans(signal), enabled })
}

export function useSaveSpotlightPlan() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (save: Parameters<typeof updateSpotlightPlan>[0] & { create?: boolean }) =>
      save.create ? createSpotlightPlan({ ...save.input, id: save.id } as Parameters<typeof createSpotlightPlan>[0]) : updateSpotlightPlan(save),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.spotlight }),
  })
}

export function useGoldPurchases(query: Parameters<typeof getGoldPurchases>[0], enabled: boolean) {
  return useQuery({ queryKey: ["gold", "purchases", query], queryFn: ({ signal }) => getGoldPurchases(query, signal), placeholderData: keepPreviousData, enabled })
}
