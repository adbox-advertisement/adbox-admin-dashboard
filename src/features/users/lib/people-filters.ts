import { accountRoles, accountStatuses, affiliations, badgeKinds, verificationTiers } from "../validation"
import type { AccountRole, AccountStatus, Affiliation, BadgeKind, VerificationTier } from "../types"
import type { PlatformUserQuery } from "../validation"

export type PeopleFilters = {
  search: string
  role: AccountRole | ""
  affiliation: Affiliation | ""
  status: AccountStatus | ""
  verificationTier: VerificationTier | ""
  badge: BadgeKind | ""
  institutionId: string
  campusId: string
  page: number
}

export const emptyPeopleFilters: PeopleFilters = {
  search: "", role: "", affiliation: "", status: "", verificationTier: "", badge: "", institutionId: "", campusId: "", page: 1,
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function oneOf<T extends string>(values: readonly T[], value: string | null): T | "" {
  return value && (values as readonly string[]).includes(value) ? value as T : ""
}

/** Reads filters from a URL, dropping anything the API would reject. */
export function peopleFiltersFromParams(params: URLSearchParams): PeopleFilters {
  const page = Number.parseInt(params.get("page") ?? "", 10)
  const uuid = (key: string) => {
    const value = params.get(key) ?? ""
    return UUID.test(value) ? value : ""
  }
  return {
    search: (params.get("search") ?? "").slice(0, 200),
    role: oneOf(accountRoles, params.get("role")),
    affiliation: oneOf(affiliations, params.get("affiliation")),
    status: oneOf(accountStatuses, params.get("status")),
    verificationTier: oneOf(verificationTiers, params.get("verificationTier")),
    badge: oneOf(badgeKinds, params.get("badge")),
    institutionId: uuid("institutionId"),
    campusId: uuid("campusId"),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  }
}

export function peopleFiltersToParams(filters: PeopleFilters) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (key === "page" ? value !== 1 : value) params.set(key, String(value))
  }
  return params
}

export function peopleQuery(filters: PeopleFilters, search: string, limit: number): PlatformUserQuery {
  return {
    search: search || undefined,
    role: filters.role || undefined,
    affiliation: filters.affiliation || undefined,
    status: filters.status || undefined,
    verificationTier: filters.verificationTier || undefined,
    badge: filters.badge || undefined,
    institutionId: filters.institutionId || undefined,
    campusId: filters.campusId || undefined,
    page: filters.page,
    limit,
  }
}

export function activeFilterCount(filters: PeopleFilters, locked: Array<keyof PeopleFilters> = []) {
  return (Object.keys(filters) as Array<keyof PeopleFilters>)
    .filter((key) => key !== "page" && key !== "search" && !locked.includes(key) && filters[key])
    .length
}
