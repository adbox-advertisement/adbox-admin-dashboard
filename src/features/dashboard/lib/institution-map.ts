import type { MapInstitution } from "../api"
import { ghanaRegions, projectToMap } from "../data/ghana-regions"
import { townCoordinates } from "../data/ghana-towns"

// Dot colours carry one of three groups: a dot map lets any two colours meet, and only three
// categorical hues stay apart for colour-blind readers there (validated light and dark).
export type InstitutionGroup = "university" | "education" | "health"

export const institutionGroups: Array<{ key: InstitutionGroup; label: string; dot: string; swatch: string }> = [
  { key: "university", label: "Universities & tertiary", dot: "fill-[#5946e8] dark:fill-[#6d5df6]", swatch: "bg-[#5946e8] dark:bg-[#6d5df6]" },
  { key: "education", label: "Colleges of education", dot: "fill-[#eb6834] dark:fill-[#d95926]", swatch: "bg-[#eb6834] dark:bg-[#d95926]" },
  { key: "health", label: "Health & other colleges", dot: "fill-[#1baf7a] dark:fill-[#199e70]", swatch: "bg-[#1baf7a] dark:bg-[#199e70]" },
]

const groupOfType: Record<string, InstitutionGroup> = {
  TRADITIONAL_UNIVERSITY: "university",
  PUBLIC_TECHNICAL_UNIVERSITY: "university",
  PUBLIC_DEGREE_AWARDING_PROFESSIONAL: "university",
  REGIONALLY_OWNED: "university",
  CHARTERED_PRIVATE: "university",
  PRIVATE_UNIVERSITY: "university",
  PRIVATE_TERTIARY: "university",
  PRIVATE_POLYTECHNIC: "university",
  REGISTERED_FOREIGN: "university",
  DISTANCE_LEARNING: "university",
  PUBLIC_COLLEGE_OF_EDUCATION: "education",
  PRIVATE_COLLEGE_OF_EDUCATION: "education",
  PUBLIC_HEALTH_TRAINING: "health",
  PRIVATE_HEALTH_TRAINING: "health",
  COLLEGE_OF_AGRICULTURE: "health",
  TUTORIAL_COLLEGE: "health",
}

const typeLabels: Record<string, string> = {
  TRADITIONAL_UNIVERSITY: "Public university",
  PUBLIC_TECHNICAL_UNIVERSITY: "Technical university",
  PUBLIC_DEGREE_AWARDING_PROFESSIONAL: "Professional institute",
  REGIONALLY_OWNED: "Regional institution",
  CHARTERED_PRIVATE: "Chartered private university",
  PRIVATE_UNIVERSITY: "Private university",
  PRIVATE_TERTIARY: "Private tertiary",
  PRIVATE_POLYTECHNIC: "Private polytechnic",
  REGISTERED_FOREIGN: "Foreign university",
  DISTANCE_LEARNING: "Distance learning",
  PUBLIC_COLLEGE_OF_EDUCATION: "College of education",
  PRIVATE_COLLEGE_OF_EDUCATION: "Private college of education",
  PUBLIC_HEALTH_TRAINING: "Nursing & health training",
  PRIVATE_HEALTH_TRAINING: "Private health training",
  COLLEGE_OF_AGRICULTURE: "College of agriculture",
  TUTORIAL_COLLEGE: "Tutorial college",
}

export const groupOf = (type: string | null | undefined): InstitutionGroup => (type && groupOfType[type]) || "health"
export const typeLabel = (type: string | null | undefined) => (type && typeLabels[type]) || "Other institution"

/** Regions by how many institutions they hold, for the fill and its legend. */
export const shadeSteps = [
  { from: 1, label: "1–4", fill: "fill-[#eef0f3] dark:fill-[#22272d]" },
  { from: 5, label: "5–9", fill: "fill-[#e1e4e9] dark:fill-[#2a3037]" },
  { from: 10, label: "10–19", fill: "fill-[#d2d6dd] dark:fill-[#333a43]" },
  { from: 20, label: "20–39", fill: "fill-[#c0c6cf] dark:fill-[#3d4550]" },
  { from: 40, label: "40+", fill: "fill-[#abb2bd] dark:fill-[#48515e]" },
]
export const emptyShade = "fill-[#f6f7f9] dark:fill-[#1e2227]"

export function shadeFor(count: number) {
  if (count === 0) return emptyShade
  return [...shadeSteps].reverse().find((step) => count >= step.from)?.fill ?? emptyShade
}

export type PlacedInstitution = MapInstitution & {
  regionId: string | null
  group: InstitutionGroup
  x: number
  y: number
  /** Placed at its region's centre: its town has no known position. */
  approximate: boolean
}

// Institutions in one town spiral outwards from it (a sunflower), so each stays visible.
const SPACING = 3.6
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

const regionIdOf = new Map(ghanaRegions.map((region) => [region.name.toLowerCase(), region.id]))
const regionById = new Map(ghanaRegions.map((region) => [region.id, region]))

export function regionIdFor(name: string | null | undefined) {
  return name ? regionIdOf.get(name.trim().toLowerCase().replace(/ region$/, "")) ?? null : null
}

/** Each active institution with a position on the map, in a stable order. */
export function placeInstitutions(institutions: MapInstitution[]): PlacedInstitution[] {
  const byPlace = new Map<string, MapInstitution[]>()
  for (const institution of institutions) {
    if (institution.isActive === false) continue
    const key = `${institution.town ?? ""}|${institution.region ?? ""}`
    byPlace.set(key, [...(byPlace.get(key) ?? []), institution])
  }
  const placed: PlacedInstitution[] = []
  for (const [key, group] of byPlace) {
    const regionId = regionIdFor(group[0].region)
    const known = townCoordinates[key]
    const anchor = known ? projectToMap(known[0], known[1]) : regionId ? regionById.get(regionId)!.center : null
    if (!anchor) continue
    group.sort((a, b) => a.name.localeCompare(b.name)).forEach((institution, index) => {
      const radius = SPACING * Math.sqrt(index)
      const angle = index * GOLDEN_ANGLE
      placed.push({
        ...institution,
        regionId,
        group: groupOf(institution.type),
        x: anchor.x + radius * Math.cos(angle),
        y: anchor.y + radius * Math.sin(angle),
        approximate: !known,
      })
    })
  }
  return placed
}

export type RegionSummary = { id: string; name: string; count: number; groups: Record<InstitutionGroup, number> }

/** Every region, most institutions first; regions with none are kept so all 16 are listed. */
export function summariseRegions(placed: PlacedInstitution[]): RegionSummary[] {
  const summaries = new Map(ghanaRegions.map((region) => [region.id, { id: region.id, name: region.name, count: 0, groups: { university: 0, education: 0, health: 0 } }]))
  for (const institution of placed) {
    const summary = institution.regionId ? summaries.get(institution.regionId) : undefined
    if (!summary) continue
    summary.count += 1
    summary.groups[institution.group] += 1
  }
  return [...summaries.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}
