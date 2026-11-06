import { differenceInYears, format, formatDistanceToNowStrict } from "date-fns"

export function formatDate(value: string | null, pattern = "MMM d, yyyy") {
  return value ? format(new Date(value), pattern) : null
}

export function formatRelative(value: string | null) {
  return value ? `${formatDistanceToNowStrict(new Date(value))} ago` : null
}

export function ageFrom(dob: string | null, now = new Date()) {
  return dob ? differenceInYears(now, new Date(dob)) : null
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?"
}

// Only render remote avatars over http(s); anything else falls back to initials.
export function safeImageUrl(value: string | null) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null
  } catch {
    return null
  }
}

export function percentOf(value: number, total: number) {
  return total > 0 ? `${Math.round((value / total) * 100)}%` : "0%"
}

/** The end of a chosen calendar day (yyyy-mm-dd), in the admin's time zone. */
export function endOfDayIso(date: string) {
  return new Date(`${date}T23:59:59`).toISOString()
}

/**
 * An address AdBox made up for an account nobody signs in to by email — a page or business run from
 * its members' own accounts, or an erased account (`…@accounts.adbox.invalid`). Never shown as if real.
 */
export function isPlaceholderEmail(email: string | null | undefined) {
  return (email ?? "").trim().toLowerCase().endsWith(".adbox.invalid")
}
