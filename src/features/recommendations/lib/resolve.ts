import type { LiveSettings, LiveStatus } from "../hooks"
import type { Bounds } from "../types"
import { AD_SETTINGS_DEFAULTS, RANKED_PERCENT_BOUNDS } from "../data/backend-defaults"
import { CONTROLS, type Parameter } from "../data/catalog"
import { RANKED_FEED_ENV } from "./ranking"
import { boundsAt, formatWithUnit, valueAt } from "./values"

export type ResolvedParameter = {
  /** What is in force now, or the built-in default when the live value cannot be read. */
  value: number | null
  defaultValue: number
  bounds: Bounds | null
  /** `fixed` for numbers written in code, the app or the server's environment. */
  status: LiveStatus | "fixed"
  /** In force and different from the built-in default. */
  changed: boolean
  /** Shown in place of a value the page cannot know. */
  note: string | null
}

const asNumber = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : null)

/** A catalog entry's current value, default, range and where they came from. */
export function resolveParameter(parameter: Parameter, live: LiveSettings): ResolvedParameter {
  const ref = parameter.value
  switch (ref.from) {
    case "fixed":
      return { value: ref.value, defaultValue: ref.value, bounds: parameter.range ? { ...parameter.range, integer: true } : null, status: "fixed", changed: false, note: null }
    case "feed": {
      const value = asNumber(valueAt(live.feed.config, ref.path))
      const defaultValue = asNumber(valueAt(live.feed.defaults, ref.path)) ?? 0
      return {
        value, defaultValue, bounds: boundsAt(live.feed.bounds, ref.path) ?? null, status: live.feed.status,
        changed: live.feed.status === "live" && value !== null && value !== defaultValue, note: null,
      }
    }
    case "discover": {
      const value = asNumber(valueAt(live.discover.policy, ref.path))
      const defaultValue = asNumber(valueAt(live.discover.defaults, ref.path)) ?? 0
      return {
        value, defaultValue, bounds: boundsAt(live.discover.bounds, ref.path) ?? null, status: live.discover.status,
        changed: live.discover.status === "live" && value !== null && value !== defaultValue, note: null,
      }
    }
    case "gold": {
      const value = live.gold.values[ref.key]
      const defaultValue = AD_SETTINGS_DEFAULTS[ref.key]
      return {
        value, defaultValue, bounds: parameter.range ? { ...parameter.range, integer: true } : null, status: live.gold.status,
        changed: live.gold.status === "live" && value !== defaultValue, note: null,
      }
    }
    case "ranked-percent": {
      const value = live.feed.rankedPercent
      return {
        value, defaultValue: RANKED_FEED_ENV.rankedPercent, bounds: RANKED_PERCENT_BOUNDS, status: live.feed.status,
        changed: live.feed.status === "live" && value !== null && value !== RANKED_FEED_ENV.rankedPercent,
        note: value === null ? `Gateway setting FEED_RANKED_PERCENT (${RANKED_FEED_ENV.rankedPercent}% unless set)` : null,
      }
    }
  }
}

/** The value as the page prints it, with its unit; a note when it is not knowable here. */
export function displayValue(parameter: Parameter, resolved: ResolvedParameter) {
  if (resolved.value === null) return resolved.note ?? "—"
  return formatWithUnit(resolved.value, parameter.unit)
}

/** One line on where a value came from, for the details panel and the table. */
export function provenance(parameter: Parameter, resolved: ResolvedParameter, live: LiveSettings) {
  switch (resolved.status) {
    case "fixed": return `${CONTROLS[parameter.control].label}: ${CONTROLS[parameter.control].speed.toLowerCase()}.`
    case "loading": return "Loading the live value; showing the built-in default."
    case "locked": return "Showing the built-in default: reading the live value needs a permission you don't have."
    case "error": return "Showing the built-in default: the live value could not be loaded."
    case "live": {
      if (parameter.control === "feed-policy") return live.feed.active ? `Live in ${live.feed.label}.` : "Live: no version is active, so the built-in defaults are in force."
      if (parameter.control === "discover-policy") return live.discover.active ? `Live in ${live.discover.label}.` : "Live: no version is active, so the built-in defaults are in force."
      return "Live in the gold settings."
    }
  }
}
