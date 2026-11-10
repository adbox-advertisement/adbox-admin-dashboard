import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  addCodes, approveAllClear, approveRedemption, getOffers, getPartner, getPartners, getRedemption, getRedemptions, getRewardsOverview,
  refundRedemption, rejectRedemption, resetSampleRewards, retryRedemption, sampleRewards, setPartnerStatus, updateOffer,
} from "./api"
import type { RedemptionQuery } from "./types"

const keys = {
  all: ["rewards"] as const,
  overview: ["rewards", "overview"] as const,
  list: (query: RedemptionQuery) => ["rewards", "redemptions", query] as const,
  one: (id: string) => ["rewards", "redemption", id] as const,
  offers: ["rewards", "offers"] as const,
  partners: ["rewards", "partners"] as const,
  partner: (id: string) => ["rewards", "partner", id] as const,
}

// While a top-up is with the partner, look again shortly so it shows as delivered.
const whileDelivering = (rows: Array<{ status: string }> | undefined) => (rows?.some((item) => item.status === "processing") ? 2000 : false)

export function useRewardsOverview() {
  return useQuery({ queryKey: keys.overview, queryFn: getRewardsOverview, refetchInterval: (query) => (query.state.data?.statusCounts.processing ? 2000 : false) })
}

export function useRedemptions(query: RedemptionQuery) {
  return useQuery({ queryKey: keys.list(query), queryFn: () => getRedemptions(query), placeholderData: (previous) => previous, refetchInterval: (state) => whileDelivering(state.state.data) })
}

export function useRedemption(id: string | null) {
  return useQuery({ queryKey: keys.one(id ?? ""), queryFn: () => getRedemption(id ?? ""), enabled: Boolean(id), refetchInterval: (state) => (state.state.data?.status === "processing" ? 2000 : false) })
}

export function useOffers() {
  return useQuery({ queryKey: keys.offers, queryFn: getOffers })
}

export function usePartners() {
  return useQuery({ queryKey: keys.partners, queryFn: getPartners })
}

export function usePartner(id: string) {
  return useQuery({ queryKey: keys.partner(id), queryFn: () => getPartner(id), refetchInterval: (state) => whileDelivering(state.state.data?.recent) })
}

/** Every write refreshes the whole rewards area: counts, lists, stock and settlement move together. */
function useRewardsMutation<Input, Output>(mutationFn: (input: Input) => Promise<Output>) {
  const client = useQueryClient()
  return useMutation({ mutationFn, onSettled: () => client.invalidateQueries({ queryKey: keys.all }) })
}

export const useApprove = () => useRewardsMutation(approveRedemption)
export const useApproveAllClear = () => useRewardsMutation(approveAllClear)
export const useReject = () => useRewardsMutation(rejectRedemption)
export const useRetry = () => useRewardsMutation(retryRedemption)
export const useRefund = () => useRewardsMutation(refundRedemption)
export const useUpdateOffer = () => useRewardsMutation(updateOffer)
export const useAddCodes = () => useRewardsMutation(addCodes)
export const useSetPartnerStatus = () => useRewardsMutation(setPartnerStatus)

export function useResetSampleRewards() {
  const client = useQueryClient()
  return () => {
    resetSampleRewards()
    void client.invalidateQueries({ queryKey: keys.all })
  }
}

export const storeRate = () => sampleRewards.barsPerCedi

/** The current time, refreshed every half minute so "waiting 12m" keeps counting. */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])
  return now
}
