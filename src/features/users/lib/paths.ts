import { APP_ROUTES } from "@/routes/paths"

export const userProfilePath = (id: string) => `${APP_ROUTES.manageUsersPeople}/${encodeURIComponent(id)}`
export const institutionPath = (id: string) => `${APP_ROUTES.manageUsersInstitutions}/${encodeURIComponent(id)}`
export const companyPath = (id: string) => `${APP_ROUTES.manageUsersCompanies}/${encodeURIComponent(id)}`

/** A People link with filters already applied, e.g. from an Overview figure. */
export function peoplePath(filters: Record<string, string | undefined>) {
  const params = new URLSearchParams(Object.entries(filters).filter((entry): entry is [string, string] => Boolean(entry[1])))
  const query = params.toString()
  return query ? `${APP_ROUTES.manageUsersPeople}?${query}` : APP_ROUTES.manageUsersPeople
}
