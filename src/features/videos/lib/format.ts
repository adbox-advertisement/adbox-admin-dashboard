import { format, formatDistanceToNowStrict } from "date-fns"
import type { StudioAccount, StudioGroup, StudioPost } from "../types"

export const formatCount = (value: number) => value.toLocaleString("en-US")

/** "3 min ago", or "just now". */
export function ago(iso: string | null | undefined) {
  if (!iso) return null
  const date = new Date(iso)
  return Date.now() - date.getTime() < 45_000 ? "just now" : `${formatDistanceToNowStrict(date)} ago`
}

export const day = (iso: string) => format(new Date(iso), "d MMM yyyy")

/** An account's name as the app shows it: their name, else @username. */
export function accountName(account: Pick<StudioAccount, "fullName" | "username">) {
  return account.fullName?.trim() || (account.username ? `@${account.username}` : "Unnamed account")
}

/** A hue in the indigo family from any text, so the same group or account always gets the same colour. */
export function hueOf(text: string) {
  let hash = 0
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return 228 + (hash % 64)
}

/** Up to two initials: "Legon Hall Week" → "LH". */
export function initials(name: string) {
  const words = name.replace(/^@/, "").split(/\s+/).filter(Boolean)
  return (words.length > 1 ? words[0][0] + words[1][0] : (words[0]?.slice(0, 2) ?? "?")).toUpperCase()
}

export type GroupTiming = "UPCOMING" | "LIVE" | "ENDED" | "OPEN"

/** Where a group is in its dates; OPEN when it has none. */
export function groupTiming(group: Pick<StudioGroup, "startsAt" | "endsAt">, now = new Date()): GroupTiming {
  const start = group.startsAt ? new Date(group.startsAt) : null
  const end = group.endsAt ? new Date(group.endsAt) : null
  if (!start && !end) return "OPEN"
  if (start && now < start) return "UPCOMING"
  if (end && now > end) return "ENDED"
  return "LIVE"
}

export const TIMING_LABELS: Record<GroupTiming, string> = { UPCOMING: "Upcoming", LIVE: "On now", ENDED: "Ended", OPEN: "Open" }

/** "14–20 Nov 2026", "14 Nov – 2 Dec 2026", "From 14 Nov 2026". */
export function groupDates(group: Pick<StudioGroup, "startsAt" | "endsAt">) {
  const start = group.startsAt ? new Date(group.startsAt) : null
  const end = group.endsAt ? new Date(group.endsAt) : null
  if (start && end) {
    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) return `${format(start, "d")}–${format(end, "d MMM yyyy")}`
    return `${format(start, "d MMM")} – ${format(end, "d MMM yyyy")}`
  }
  if (start) return `From ${format(start, "d MMM yyyy")}`
  if (end) return `Until ${format(end, "d MMM yyyy")}`
  return null
}

export type PostKind = "TEXT" | "PICTURES" | "VIDEO" | "SHORT"
export const POST_KIND_LABELS: Record<PostKind, string> = { TEXT: "Text", PICTURES: "Pictures", VIDEO: "Video", SHORT: "Short" }

export function postKind(post: Pick<StudioPost, "type" | "isShort">): PostKind {
  if (post.type === "TEXT") return "TEXT"
  if (post.type === "IMAGE") return "PICTURES"
  return post.isShort ? "SHORT" : "VIDEO"
}

/** Where a post stands, in words: live, only the account, processing, a draft. */
export function postState(post: Pick<StudioPost, "status" | "video">) {
  if (post.video?.transcodingStatus === "FAILED") return { label: "Processing failed", tone: "danger" as const }
  if (post.status === "PROCESSING") return { label: "Processing", tone: "warning" as const }
  if (post.status === "PUBLIC") return { label: "Live", tone: "success" as const }
  if (post.status === "PRIVATE") return { label: "Only the account", tone: "neutral" as const }
  if (post.status === "DRAFT") return { label: "Draft", tone: "neutral" as const }
  return { label: post.status.charAt(0) + post.status.slice(1).toLowerCase(), tone: "neutral" as const }
}
