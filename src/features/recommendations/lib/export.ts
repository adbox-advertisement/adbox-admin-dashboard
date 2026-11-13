import type { LiveSettings } from "../hooks"
import { AREAS, CONTROLS, REACH_LABELS, STAGES, SURFACES, reachOf, type Parameter } from "../data/catalog"
import { resolveParameter } from "./resolve"

const cell = (value: unknown) => {
  const text = value === null || value === undefined ? "" : String(value)
  // Quote every field; a leading = + - @ is prefixed so a spreadsheet never runs it as a formula.
  const safe = /^[=+\-@]/.test(text) && !/^-?\d/.test(text) ? `'${text}` : text
  return `"${safe.replace(/"/g, '""')}"`
}

/** The parameters as CSV, with the values in force when it is made. */
export function parametersCsv(parameters: Parameter[], live: LiveSettings) {
  const header = ["Parameter", "Key", "Area", "Stage", "In force", "Default", "Least", "Most", "Unit", "Source of the value", "Controlled by", "Felt in the app", "Screens", "What it does", "Defined in"]
  const rows = parameters.map((parameter) => {
    const resolved = resolveParameter(parameter, live)
    return [
      parameter.name,
      parameter.key,
      AREAS[parameter.area].label,
      STAGES[parameter.stage],
      resolved.value ?? resolved.note ?? "",
      resolved.defaultValue,
      resolved.bounds?.min ?? "",
      resolved.bounds?.max ?? "",
      parameter.unit,
      resolved.status === "fixed" ? "written in code or the app" : resolved.status === "live" ? "live" : "built-in default (live value unavailable)",
      CONTROLS[parameter.control].label,
      REACH_LABELS[reachOf(parameter)],
      parameter.surfaces.map((surface) => SURFACES[surface].label).join("; "),
      parameter.effect,
      parameter.file,
    ]
  })
  return [header, ...rows].map((row) => row.map(cell).join(",")).join("\r\n")
}
