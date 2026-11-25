import type { DirectoryInstitution, InstitutionDirectory } from "../types"

// Choosing among every institution (265 and growing): search by short name, name or region,
// recent picks first, the rest by region.

const fold = (value: string) => value.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()

/** How well an institution matches a search: 0 is none, higher is better. */
export function matchScore(institution: Pick<DirectoryInstitution, "name" | "shortName" | "region">, query: string) {
  const q = fold(query.trim())
  if (!q) return 1
  const short = fold(institution.shortName)
  const name = fold(institution.name)
  if (short === q) return 100
  if (short.startsWith(q)) return 80
  if (name.startsWith(q)) return 70
  if (name.split(/[^a-z0-9]+/).some((word) => word.startsWith(q))) return 60
  if (short.includes(q) || name.includes(q)) return 40
  if (fold(institution.region).includes(q)) return 20
  return 0
}

/** Active institutions matching the search, best first, then by short name. */
export function searchInstitutions(directory: InstitutionDirectory, query: string, limit = 60) {
  return directory
    .filter((institution) => institution.isActive)
    .map((institution) => ({ institution, score: matchScore(institution, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.institution.shortName.localeCompare(b.institution.shortName))
    .slice(0, limit)
    .map(({ institution }) => institution)
}

/** Regions with how many active institutions each holds, A–Z. */
export function regionsOf(directory: InstitutionDirectory) {
  const counts = new Map<string, number>()
  for (const institution of directory) if (institution.isActive) counts.set(institution.region, (counts.get(institution.region) ?? 0) + 1)
  return [...counts].map(([region, count]) => ({ region, count })).sort((a, b) => a.region.localeCompare(b.region))
}

const RECENT_KEY = "adbox-studio-recent-institutions"

/** This browser's recent picks, newest first. A convenience only: it may be empty. */
export function readRecentInstitutions(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]")
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string").slice(0, 6) : []
  } catch {
    return []
  }
}

export function rememberInstitution(id: string) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify([id, ...readRecentInstitutions().filter((recent) => recent !== id)].slice(0, 6)))
  } catch {
    // Private windows and blocked storage just don't remember.
  }
}

/** "UG · Legon · Commonwealth Hall". */
export function placeLabel(place: { institution?: { shortName: string } | null; campus?: { name: string } | null; hall?: { name: string } | null }) {
  return [place.institution?.shortName, place.campus?.name, place.hall?.name].filter(Boolean).join(" · ")
}
