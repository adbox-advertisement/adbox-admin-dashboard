// Captions as the app reads them (backend libs/discover hashtags.ts): hashtags are read from the
// caption only, 2–50 letters, marks, digits or underscores, not only digits, at most 10 a post.

export const CAPTION_MAX = 5000
export const MAX_HASHTAGS = 10

const HASHTAG = /(?<![\p{L}\p{M}\p{N}_/&#])#([\p{L}\p{M}\p{N}_]{2,50})(?![\p{L}\p{M}\p{N}_])/gu
const ALL_DIGITS = /^\p{N}+$/u

/** The hashtags the app will file a caption under: lowercase, in order, each once, at most 10. */
export function hashtagsIn(caption: string) {
  const found: string[] = []
  for (const match of caption.normalize("NFKC").matchAll(HASHTAG)) {
    const name = match[1].toLowerCase()
    if (ALL_DIGITS.test(name) || found.includes(name)) continue
    found.push(name)
    if (found.length === MAX_HASHTAGS) break
  }
  return found
}

/** Every hashtag written, past the tenth too, so the composer can say which won't count. */
export function allHashtags(caption: string) {
  const found: string[] = []
  for (const match of caption.normalize("NFKC").matchAll(HASHTAG)) {
    const name = match[1].toLowerCase()
    if (!ALL_DIGITS.test(name) && !found.includes(name)) found.push(name)
  }
  return found
}

/** The caption with the group's hashtag at the end, unless it is there already. */
export function withGroupHashtag(caption: string, hashtag: string) {
  if (allHashtags(caption).includes(hashtag.toLowerCase())) return caption
  const trimmed = caption.trimEnd()
  return trimmed ? `${trimmed}\n\n#${hashtag}` : `#${hashtag}`
}

/** What would stop the post, in the composer's words. */
export function captionProblems(caption: string, options: { needsText: boolean; groupHashtag?: string | null }) {
  const problems: string[] = []
  const final = options.groupHashtag ? withGroupHashtag(caption, options.groupHashtag) : caption
  if (options.needsText && !caption.trim()) problems.push("Write something to post.")
  if (final.length > CAPTION_MAX) problems.push(`Keep the caption under ${CAPTION_MAX.toLocaleString()} characters.`)
  const tags = allHashtags(final)
  if (tags.length > MAX_HASHTAGS) {
    problems.push(options.groupHashtag
      ? `A post counts at most ${MAX_HASHTAGS} hashtags. Remove ${tags.length - MAX_HASHTAGS} so #${options.groupHashtag} counts.`
      : `A post counts at most ${MAX_HASHTAGS} hashtags; the rest are ignored.`)
  }
  return problems
}

export type CaptionPart = { text: string; hashtag: boolean }

/** The caption split into plain text and hashtags, to draw them as the app does. */
export function captionParts(caption: string): CaptionPart[] {
  const parts: CaptionPart[] = []
  let last = 0
  for (const match of caption.matchAll(HASHTAG)) {
    const start = match.index ?? 0
    if (ALL_DIGITS.test(match[1])) continue
    if (start > last) parts.push({ text: caption.slice(last, start), hashtag: false })
    parts.push({ text: match[0], hashtag: true })
    last = start + match[0].length
  }
  if (last < caption.length) parts.push({ text: caption.slice(last), hashtag: false })
  return parts
}

/** "Legon Hall Week 2026" → "LegonHallWeek2026": a hashtag to start from. */
export function suggestHashtag(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join("")
    .slice(0, 50)
}

/** Why a hashtag would be refused, or null. */
export function hashtagProblem(raw: string) {
  const name = raw.trim().replace(/^#/, "")
  if (name.length < 2) return "At least 2 characters."
  if (name.length > 50) return "At most 50 characters."
  if (!/^[\p{L}\p{M}\p{N}_]+$/u.test(name)) return "Only letters, numbers and underscores."
  if (ALL_DIGITS.test(name)) return "Not only numbers."
  return null
}

/** "Legon Hall Week" → "legon.hallweek": a username to start from (3–30 of a–z, 0–9, . and _). */
export function suggestUsername(fullName: string) {
  const words = fullName
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
  if (words.length === 0) return ""
  const [first, ...rest] = words
  return (rest.length ? `${first}.${rest.join("")}` : first).slice(0, 30).replace(/\.+$/, "")
}
