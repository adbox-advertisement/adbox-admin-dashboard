import type { Bounds, BoundsTree } from "../types"

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value)
const isBounds = (value: unknown): value is Bounds => isObject(value) && typeof value.min === "number" && typeof value.max === "number"

/** The value at `path` in a settings object, or undefined. */
export function valueAt(source: unknown, path: readonly string[]): unknown {
  let current: unknown = source
  for (const key of path) {
    if (!isObject(current)) return undefined
    current = current[key]
  }
  return current
}

/** The range at `path` in a bounds tree, or undefined. */
export function boundsAt(tree: BoundsTree, path: readonly string[]): Bounds | undefined {
  const found = valueAt(tree, path)
  return isBounds(found) ? found : undefined
}

/** Every settings path in a bounds tree, in its order. */
export function boundedPaths(tree: BoundsTree, prefix: string[] = []): string[][] {
  return Object.entries(tree).flatMap(([key, value]) => (isBounds(value) ? [[...prefix, key]] : boundedPaths(value, [...prefix, key])))
}

/** `override` laid over a copy of `base`, objects merged key by key (readStoredDiscoverPolicy). */
export function mergeOver<T>(base: T, override: unknown): T {
  if (!isObject(base) || !isObject(override)) return (override === undefined ? base : override) as T
  const merged: Record<string, unknown> = { ...base }
  for (const [key, value] of Object.entries(override)) merged[key] = key in base ? mergeOver(base[key], value) : value
  return merged as T
}

/** Why a complete settings object is out of range, as `checkBounded` reports it; empty when fine. */
export function boundsProblems(input: unknown, tree: BoundsTree, prefix = ""): string[] {
  if (!isObject(input)) return [`${prefix || "config"} must be an object`]
  return Object.entries(tree).flatMap(([key, bound]) => {
    const at = prefix ? `${prefix}.${key}` : key
    const field = input[key]
    if (!isBounds(bound)) return boundsProblems(field, bound, at)
    if (typeof field !== "number" || !Number.isFinite(field)) return [`${at} must be a number`]
    if (bound.integer && !Number.isInteger(field)) return [`${at} must be a whole number`]
    if (field < bound.min || field > bound.max) return [`${at} must be between ${bound.min} and ${bound.max}`]
    return []
  })
}

export type Change = { path: string; before: unknown; after: unknown }

/** Settings that differ between two versions, by path (numbers compared exactly). */
export function changesBetween(before: unknown, after: unknown, prefix = ""): Change[] {
  if (isObject(before) && isObject(after)) {
    const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((key) => !(key === "version" && !prefix))
    return keys.flatMap((key) => changesBetween(before[key], after[key], prefix ? `${prefix}.${key}` : key))
  }
  return Object.is(before, after) ? [] : [{ path: prefix, before, after }]
}

const groupThousands = (value: number) => value.toLocaleString("en-US", { maximumFractionDigits: 4 })

/** A number as people read it: thousands grouped, at most four decimals. */
export function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "—"
  return groupThousands(value)
}

/** A value with its unit, as the page shows it: "24 h", "3%", "×1.3", "5,000 posts". */
export function formatWithUnit(value: number, unit: string) {
  switch (unit) {
    case "share": return `${formatNumber(Math.round(value * 1000) / 10)}%`
    case "%": return `${formatNumber(value)}%`
    case "×": return `×${formatNumber(value)}`
    case "hours": return `${formatNumber(value)} h`
    case "minutes": return `${formatNumber(value)} min`
    case "seconds": return `${formatNumber(value)} s`
    case "ms": return value >= 1000 && value % 1000 === 0 ? `${formatNumber(value / 1000)} s` : `${formatNumber(value)} ms`
    case "days": return `${formatNumber(value)} ${value === 1 ? "day" : "days"}`
    case "px": return `${formatNumber(value)} px`
    case "place": return ordinal(value)
    case "weight":
    case "ratio":
    case "items":
      return formatNumber(value)
    default: return `${formatNumber(value)} ${value === 1 ? (singular[unit] ?? unit) : unit}`
  }
}

const singular: Record<string, string> = { people: "person", posts: "post", campaigns: "campaign", subjects: "subject", views: "view", bars: "bar", places: "place" }

export function ordinal(value: number) {
  const rounded = Math.round(value)
  const tens = rounded % 100
  const suffix = tens >= 11 && tens <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[rounded % 10] ?? "th"
  return `${formatNumber(rounded)}${suffix}`
}

/** Score-sized numbers: three significant figures, never scientific notation. */
export function formatScore(value: number) {
  if (!Number.isFinite(value)) return "—"
  if (value === 0) return "0"
  const magnitude = Math.floor(Math.log10(Math.abs(value)))
  const decimals = Math.min(6, Math.max(0, 2 - magnitude))
  return value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: decimals })
}

/** "1.5 days", "40 min", "5 h" for an age or duration given in hours. */
export function formatHours(hours: number) {
  if (hours < 1) return `${Math.round(hours * 60)} min`
  if (hours < 48) return `${formatNumber(Math.round(hours * 10) / 10)} h`
  return `${formatNumber(Math.round((hours / 24) * 10) / 10)} days`
}
