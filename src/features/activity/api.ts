import { superAdminApi } from "@/api/client"
import { activityCountsSchema } from "./types"

export async function getActivityCounts(signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/activity/counts", { signal })
  return activityCountsSchema.parse(data)
}
