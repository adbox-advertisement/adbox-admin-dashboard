import { isAxiosError } from "axios"
import { format, formatDistanceToNowStrict } from "date-fns"
import type { AdSummary, Advertiser } from "../types"

export const bars = (value: number) => value.toLocaleString("en-US")

export const formatDate = (value: string | null, pattern = "MMM d, yyyy") => (value ? format(new Date(value), pattern) : null)

export const formatRelative = (value: string | null) => (value ? `${formatDistanceToNowStrict(new Date(value))} ago` : null)

/** Pages, businesses and erased accounts carry a made-up address nobody reads. */
export const isPlaceholderEmail = (email: string | null) => !email || email.endsWith("@accounts.adbox.invalid")

export const advertiserName = (advertiser: Advertiser) => advertiser.company ?? advertiser.name ?? (advertiser.username ? `@${advertiser.username}` : "Unknown account")

export const advertiserKind: Record<Advertiser["kind"], string> = {
  PERSON: "Person",
  PAGE: "Campus page",
  BUSINESS: "Verified business",
}

export const audienceLabel = (audience: string) => ({ ALL: "Everyone", STUDENTS: "Students", ALUMNI: "Alumni" })[audience] ?? audience

/** What the ad shows people: its headline, else its words, else its name. */
export const adTitle = (ad: AdSummary) => ad.content.headline || ad.content.body || ad.name

export const adCover = (ad: AdSummary) => ad.content.coverImageUrl ?? ad.content.imageUrls?.[0] ?? null

/** What to tell the admin when an ads call fails. */
export function adsErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    const status = error.response?.status
    const data: unknown = error.response?.data
    if (status === 403) return "You don't have permission to perform this action."
    if (status === 404 && hasMessage(data) && /^Cannot (GET|POST|PATCH|PUT|DELETE) \//.test(String(data.message))) {
      return "The connected server doesn't support this yet. Ask a developer to rebuild or redeploy the super-admin API, then refresh."
    }
    if ((status === 400 || status === 404 || status === 409) && hasMessage(data)) {
      const message = data.message
      if (typeof message === "string") return message
      if (Array.isArray(message)) return message.join(" ")
    }
  }
  return fallback
}

const hasMessage = (data: unknown): data is { message: unknown } => Boolean(data && typeof data === "object" && "message" in data)
