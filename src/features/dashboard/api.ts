import { z } from "zod"
import { superAdminApi } from "@/api/client"

// Super-admin's institution catalogue (backend `apps/super-admin/src/institutions`): every Ghanaian
// tertiary institution students can belong to, with the region and town it is in.
const institutionSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string().nullish(),
  type: z.string().nullish(),
  region: z.string().nullish(),
  town: z.string().nullish(),
  isActive: z.boolean().nullish(),
})

export type MapInstitution = z.infer<typeof institutionSchema>

export async function getInstitutions(signal?: AbortSignal) {
  const { data } = await superAdminApi.get<unknown>("/institutions", { signal })
  return z.array(institutionSchema).parse(data)
}
