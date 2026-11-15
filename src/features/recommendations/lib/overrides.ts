import { KIND_LABELS } from "../data/catalog"
import type { InstitutionDirectory, OverrideAction, TrendKind, TrendOverride, TrendReport } from "../types"
import { OVERRIDE_LIMITS } from "./discover"
import { formatNumber, ordinal } from "./values"

// Trending overrides (backend libs/recommendation/src/trend-overrides.ts and
// apps/super-admin/src/discover-studio/trend-controls.service.ts), worded for admins.

const DAY_MS = 24 * 60 * 60 * 1000

/** The admin's choice. Dampening is a BOOST below 1. */
export type OverrideChoice = "PIN" | "FEATURE" | "BOOST" | "DAMPEN" | "SUPPRESS"

export const CHOICES: Array<{ value: OverrideChoice; label: string; help: string }> = [
  { value: "PIN", label: "Pin", help: "Put it at a chosen place, earned or not. The app marks it Featured." },
  { value: "FEATURE", label: "Feature", help: "Add it to the list at a place (4th by default). The app marks it Featured." },
  { value: "BOOST", label: "Boost", help: "Multiply its score, up to ×3. It still has to qualify, and isn't marked." },
  { value: "DAMPEN", label: "Dampen", help: "Multiply its score by less than 1, down to ×0.25, so it sinks." },
  { value: "SUPPRESS", label: "Suppress", help: "Take it out of this list." },
]

export const actionOf = (choice: OverrideChoice): OverrideAction => (choice === "DAMPEN" ? "BOOST" : choice)

/** "Pinned at 1st", "Boosted ×2", "Dampened ×0.5", "Featured at 4th", "Suppressed". */
export function actionSummary(override: Pick<TrendOverride, "action" | "rank" | "multiplier">) {
  switch (override.action) {
    case "PIN": return `Pinned at ${ordinal(override.rank ?? 1)}`
    case "FEATURE": return `Featured at ${ordinal(override.rank ?? OVERRIDE_LIMITS.defaultFeatureRank)}`
    case "SUPPRESS": return "Suppressed"
    case "BOOST": {
      const multiplier = override.multiplier ?? 1
      return `${multiplier < 1 ? "Dampened" : "Boosted"} ×${formatNumber(multiplier)}`
    }
  }
}

/** The backend's region slug: "Greater Accra" → "greater-accra". */
export const regionSlug = (region: string) => region.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

const titleCase = (slug: string) => slug.split("-").filter(Boolean).map((word) => word[0].toUpperCase() + word.slice(1)).join(" ")

export type ScopeLevel = "GLOBAL" | "REGION" | "INSTITUTION" | "CAMPUS"

export function scopeLevel(scopeKey: string): ScopeLevel | null {
  if (scopeKey === "global") return "GLOBAL"
  if (scopeKey.startsWith("region:")) return "REGION"
  if (scopeKey.startsWith("inst:")) return "INSTITUTION"
  if (scopeKey.startsWith("campus:")) return "CAMPUS"
  return null
}

/** A list's name: "Nationwide", "Greater Accra", "KNUST", "KNUST Kumasi". */
export function scopeLabel(scopeKey: string, directory: InstitutionDirectory | undefined) {
  const id = scopeKey.slice(scopeKey.indexOf(":") + 1)
  switch (scopeLevel(scopeKey)) {
    case "GLOBAL": return "Nationwide"
    case "REGION": {
      const region = directory?.find((institution) => regionSlug(institution.region) === id)?.region
      return region ?? titleCase(id)
    }
    case "INSTITUTION": return directory?.find((institution) => institution.id === id)?.shortName ?? `Institution ${id.slice(0, 8)}`
    case "CAMPUS": {
      for (const institution of directory ?? []) {
        const campus = institution.campuses.find((item) => item.id === id)
        if (campus) return `${institution.shortName} ${campus.name}`
      }
      return `Campus ${id.slice(0, 8)}`
    }
    default: return scopeKey
  }
}

const LEVEL_ORDER: Record<ScopeLevel, number> = { GLOBAL: 0, REGION: 1, INSTITUTION: 2, CAMPUS: 3 }

/** The lists the job built, nationwide first, then regions, institutions and campuses by name. */
export function scopeOptions(scopes: string[], directory: InstitutionDirectory | undefined) {
  return [...new Set(["global", ...scopes])]
    .filter((key) => scopeLevel(key) !== null)
    .map((key) => ({ key, level: scopeLevel(key) as ScopeLevel, label: scopeLabel(key, directory) }))
    .sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level] || a.label.localeCompare(b.label))
}

export const LEVEL_NAMES: Record<ScopeLevel, string> = { GLOBAL: "Nationwide", REGION: "Region", INSTITUTION: "Institution", CAMPUS: "Campus" }

/** Why a subject just missed the list, as the job reports it ("participants 2 < 3"), in words. */
export function missedReason(reason: string) {
  const people = reason.match(/^participants (\d+) < (\d+)$/)
  if (people) return `${people[1]} ${people[1] === "1" ? "person" : "people"} taking part; needs ${people[2]}`
  const recent = reason.match(/^recent ([\d.]+) < ([\d.]+)$/)
  if (recent) return `recent activity ${recent[1]}; needs ${recent[2]}`
  return reason
}

export const kindName = (kind: TrendKind) => KIND_LABELS[kind].one.toLowerCase()

/** A subject's name when the page knows it; otherwise its kind and the start of its id. */
export function subjectLabel(kind: TrendKind, id: string, names: ReadonlyMap<string, string>) {
  return names.get(`${kind}:${id}`) ?? `${KIND_LABELS[kind].one} ${id.slice(0, 8)}`
}

export const DURATIONS = [1, 3, 7, 14, 30]

export type OverrideDraft = {
  scopeKey: string
  subject: { kind: TrendKind; id: string } | null
  choice: OverrideChoice
  rank: number | null
  multiplier: number
  reason: string
  /** Null to start now. */
  startsAt: Date | null
  days: number
}

export const draftEndsAt = (draft: Pick<OverrideDraft, "startsAt" | "days">, now: Date) => new Date((draft.startsAt ?? now).getTime() + draft.days * DAY_MS)

/**
 * What the server would refuse, worked out before sending: the same rules (a reason, a rank for a
 * pin, a multiplier that changes something, at most 30 days), one override per subject per list,
 * and at most 3 pins and 2 features overlapping in a list. The server still decides.
 */
export function draftProblems(draft: OverrideDraft, existing: TrendOverride[], now: Date) {
  const problems: string[] = []
  if (!draft.subject) problems.push("Choose what to place.")
  const reason = draft.reason.trim()
  if (reason.length < 3) problems.push("Say why, in at least 3 characters.")
  if (reason.length > 500) problems.push("Keep the reason under 500 characters.")
  if (draft.choice === "PIN" && draft.rank === null) problems.push("Choose the place to pin it at.")
  if (draft.choice === "BOOST" && !(draft.multiplier > 1 && draft.multiplier <= OVERRIDE_LIMITS.maxMultiplier)) problems.push(`A boost multiplies by more than 1, at most ×${OVERRIDE_LIMITS.maxMultiplier}.`)
  if (draft.choice === "DAMPEN" && !(draft.multiplier < 1 && draft.multiplier >= OVERRIDE_LIMITS.minMultiplier)) problems.push(`Dampening multiplies by less than 1, at least ×${OVERRIDE_LIMITS.minMultiplier}.`)
  if (draft.days > OVERRIDE_LIMITS.maxDurationDays) problems.push(`An override lasts at most ${OVERRIDE_LIMITS.maxDurationDays} days.`)
  const startsAt = draft.startsAt ?? now
  const endsAt = draftEndsAt(draft, now)
  if (endsAt <= now) problems.push("It must end in the future.")

  const overlapping = existing.filter((override) => override.scopeKey === draft.scopeKey && !override.endedAt
    && new Date(override.startsAt) < endsAt && new Date(override.endsAt) > startsAt)
  if (draft.subject && overlapping.some((override) => override.kind === draft.subject?.kind && override.subjectId === draft.subject.id)) {
    problems.push("This already has an override in this list for that time. End it first.")
  }
  if (draft.choice === "PIN" && overlapping.filter((override) => override.action === "PIN").length >= OVERRIDE_LIMITS.maxPinsPerScope) {
    problems.push(`This list already has ${OVERRIDE_LIMITS.maxPinsPerScope} pins for that time.`)
  }
  if (draft.choice === "FEATURE" && overlapping.filter((override) => override.action === "FEATURE").length >= OVERRIDE_LIMITS.maxFeaturedInTop10) {
    problems.push(`This list already has ${OVERRIDE_LIMITS.maxFeaturedInTop10} featured subjects for that time.`)
  }
  return problems
}

/** The request body for a draft that has no problems. */
export function draftInput(draft: OverrideDraft, now: Date) {
  const action = actionOf(draft.choice)
  return {
    scopeKey: draft.scopeKey,
    kind: draft.subject?.kind as TrendKind,
    subjectId: draft.subject?.id as string,
    action,
    ...(action === "PIN" || (action === "FEATURE" && draft.rank !== null) ? { rank: draft.rank ?? undefined } : {}),
    ...(action === "BOOST" ? { multiplier: draft.multiplier } : {}),
    reason: draft.reason.trim(),
    ...(draft.startsAt ? { startsAt: draft.startsAt.toISOString() } : {}),
    endsAt: draftEndsAt(draft, now).toISOString(),
  }
}

/**
 * Every subject name the page has seen: the list, what just missed, the overrides in force (all
 * named by the server), institutions with their campuses and halls, events, and anything placed in
 * this visit. The overrides list itself carries no names.
 */
export function subjectNames(sources: {
  report?: TrendReport
  directory?: InstitutionDirectory
  events?: Array<{ id: string; title: string }>
  extra?: Array<{ kind: TrendKind; id: string; name: string }>
}) {
  const names = new Map<string, string>()
  const add = (kind: TrendKind, id: string, name: string | null | undefined) => { if (name) names.set(`${kind}:${id}`, name) }
  for (const institution of sources.directory ?? []) {
    add("INSTITUTION", institution.id, institution.shortName)
    for (const campus of institution.campuses) {
      add("CAMPUS", campus.id, `${institution.shortName} ${campus.name}`)
      for (const hall of campus.halls) add("HALL", hall.id, hall.name)
    }
  }
  for (const event of sources.events ?? []) add("EVENT", event.id, event.title)
  for (const item of sources.report?.snapshot?.items ?? []) add(item.kind, item.id, item.name)
  for (const item of sources.report?.snapshot?.diagnostics?.missed ?? []) add(item.kind, item.id, item.name)
  for (const override of sources.report?.overrides ?? []) add(override.kind, override.subjectId, override.name)
  for (const subject of sources.extra ?? []) add(subject.kind, subject.id, subject.name)
  return names
}
