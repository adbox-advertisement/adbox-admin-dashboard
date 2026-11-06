import { superAdminApi } from "@/api/client"
import { adDetailSchema, adListSchema, reportedListSchema, type AdAction, type AdListQuery } from "./types"

// Super-admin's ads (backend docs/super-admin-api.md, "Ads"; docs/ad-delivery.md).
// Super-admin only changes an ad's stage; the gateway moves the gold within a minute.

export async function getAds(query: AdListQuery, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/ads", { params: query, signal })
  return adListSchema.parse(data)
}

export async function getReportedAds(query: { search?: string; page: number; limit: number }, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/ads/reported", { params: query, signal })
  return reportedListSchema.parse(data)
}

export async function getAd(id: string, signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>(`/ads/${encodeURIComponent(id)}`, { signal })
  return adDetailSchema.parse(data)
}

export async function actOnAd({ id, action }: { id: string; action: AdAction }) {
  const path = `/ads/${encodeURIComponent(id)}`
  switch (action.kind) {
    case "approve": return superAdminApi.post(`${path}/approve`)
    case "reject": return superAdminApi.post(`${path}/reject`, { reason: action.reason })
    case "pause": return superAdminApi.post(`${path}/pause`)
    case "resume": return superAdminApi.post(`${path}/resume`)
    case "stop": return superAdminApi.post(`${path}/stop`, { reason: action.reason, returnAll: action.returnAll })
    case "resolve": return superAdminApi.post(`${path}/reports/resolve`, { decision: action.decision, ...(action.reason ? { reason: action.reason } : {}) })
  }
}
