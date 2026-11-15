import type { PeopleStats, TopCreator } from "../types"

// How the dashboard words its figures. Labels follow the sections they link to.

export const formatCount = (value: number) => value.toLocaleString("en-US")

/** "GHS 2,485.77", as Financials writes money. */
export const formatCedis = (value: number) => `GHS ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/** "42%", "<1%" for a sliver, "0%" for none. */
export function shareOf(value: number, total: number) {
  if (total <= 0 || value <= 0) return "0%"
  const percent = (value / total) * 100
  return percent < 1 ? "<1%" : `${Math.round(percent)}%`
}

/** "950", "124.3k", "1.2M": for a figure that only needs to be read at a glance. */
export function formatCompact(value: number) {
  if (value < 10_000) return formatCount(value)
  if (value < 1_000_000) return `${(Math.round(value / 100) / 10).toLocaleString("en-US")}k`
  return `${(Math.round(value / 100_000) / 10).toLocaleString("en-US")}M`
}

/** Money for a tile: in full below GHS 100,000, then "GHS 124.3k", "GHS 1.2M". */
export const formatCedisShort = (value: number) => (value < 100_000 ? formatCedis(value) : `GHS ${formatCompact(value)}`)

export const plural = (value: number, one: string, many: string) => `${formatCount(value)} ${value === 1 ? one : many}`

/** "Good morning" until noon, "Good afternoon" until 5 pm, then "Good evening". */
export function greeting(hour: number) {
  if (hour >= 5 && hour < 12) return "Good morning"
  if (hour >= 12 && hour < 17) return "Good afternoon"
  return "Good evening"
}

/** Ad stages in the order an ad moves through them, worded as Ads Management words them. */
export const AD_STAGES = [
  { status: "PENDING_REVIEW", label: "In review" },
  { status: "ACTIVE", label: "Running" },
  { status: "PAUSED", label: "Paused" },
  { status: "COMPLETED", label: "Finished" },
  { status: "CANCELLED", label: "Stopped" },
  { status: "REJECTED", label: "Not approved" },
] as const

/** Campus affiliation, as Manage Users words it. */
export const AFFILIATIONS = [
  { key: "STUDENT", label: "Students" },
  { key: "ALUMNI", label: "Alumni" },
  { key: "STAFF", label: "Faculty & staff" },
  { key: "NONE", label: "No affiliation" },
] as const satisfies ReadonlyArray<{ key: keyof PeopleStats["affiliation"]; label: string }>

/** Account roles, as Manage Users words them; guests only when there are any. */
export function roleRows(roles: PeopleStats["roles"]) {
  const rows: Array<{ key: keyof PeopleStats["roles"]; label: string }> = [
    { key: "VIEWER", label: "Viewers" },
    { key: "CREATOR", label: "Creators" },
    { key: "PUBLISHER", label: "Publishers" },
  ]
  return roles.GUEST > 0 ? [...rows, { key: "GUEST" as const, label: "Guests" }] : rows
}

/** The institutions people have joined, most members first. */
export const largestInstitutions = (stats: PeopleStats, count: number) => stats.institutions.filter((institution) => institution.members.total > 0).slice(0, count)

/** "400 students · 100 alumni": only the groups an institution has. */
export function memberMix(members: PeopleStats["institutions"][number]["members"]) {
  return [
    members.STUDENT > 0 && plural(members.STUDENT, "student", "students"),
    members.ALUMNI > 0 && `${formatCount(members.ALUMNI)} alumni`,
    members.STAFF > 0 && `${formatCount(members.STAFF)} staff`,
  ].filter(Boolean).join(" · ") || "No affiliation given"
}

/** A creator's name: their full name, else their username, else that they're gone. */
export function creatorName(creator: TopCreator) {
  const profile = creator.user?.userProfile
  return profile?.fullName?.trim() || (profile?.username ? `@${profile.username}` : null) || "Deleted account"
}

/** "12 videos · 4 pictures · 2 text": only the kinds they post. */
export function postMix(creator: Pick<TopCreator, "videos" | "images" | "text">) {
  return [
    creator.videos > 0 && plural(creator.videos, "video", "videos"),
    creator.images > 0 && plural(creator.images, "picture", "pictures"),
    creator.text > 0 && `${formatCount(creator.text)} text`,
  ].filter(Boolean).join(" · ")
}

/** Up to two initials for a picture-less avatar: "Ama Owusu" → "AO", "@kofi" → "K". */
export function initials(name: string) {
  const words = name.replace(/^@/, "").split(/\s+/).filter(Boolean)
  return (words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0]?.[0] ?? "?")).toUpperCase()
}
