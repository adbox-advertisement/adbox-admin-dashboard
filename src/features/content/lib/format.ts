import { format, formatDistanceToNowStrict } from "date-fns"

export function formatDate(value: string | null, pattern = "MMM d, yyyy") {
  return value ? format(new Date(value), pattern) : null
}

export function formatRelative(value: string | null) {
  return value ? `${formatDistanceToNowStrict(new Date(value))} ago` : null
}

export function formatDuration(seconds: number | null) {
  if (seconds === null) return null
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = String(seconds % 60).padStart(2, "0")
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${minutes}:${rest}`
}

export function formatBytes(bytes: number | null) {
  if (bytes === null) return null
  const units = ["B", "KB", "MB", "GB"]
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit++ }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`
}

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })
export function compactNumber(value: number) {
  return compact.format(value)
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?"
}

const DAY = 86_400_000

/** How far a campaign has run: the share of its schedule elapsed and the current day. */
export function campaignProgress(startsAt: string, endsAt: string, now = Date.now()) {
  const start = new Date(startsAt).getTime()
  const end = new Date(endsAt).getTime()
  const totalDays = Math.max(1, Math.round((end - start) / DAY))
  if (now <= start) return { share: 0, day: 0, totalDays, daysLeft: totalDays }
  if (now >= end) return { share: 1, day: totalDays, totalDays, daysLeft: 0 }
  const share = (now - start) / (end - start)
  return { share, day: Math.min(totalDays, Math.floor((now - start) / DAY) + 1), totalDays, daysLeft: Math.ceil((end - now) / DAY) }
}
