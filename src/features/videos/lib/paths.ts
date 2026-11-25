import { APP_ROUTES } from "@/routes/paths"

export const accountPath = (id: string) => `${APP_ROUTES.videoAccounts}/${encodeURIComponent(id)}`
export const groupPath = (id: string) => `${APP_ROUTES.videoGroups}/${encodeURIComponent(id)}`

/** The composer, with an account or a group already chosen. */
export function createPath(params: { account?: string; group?: string } = {}) {
  const query = new URLSearchParams(Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1]))).toString()
  return query ? `${APP_ROUTES.videoUpload}?${query}` : APP_ROUTES.videoUpload
}
