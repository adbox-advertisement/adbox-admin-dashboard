import { z } from "zod"

/**
 * The studio's permissions (backend docs/super-admin-api.md, "Studio"). Photos and covers go
 * through the media library, and places come from the institutions directory.
 */
export const STUDIO_PERMISSIONS = {
  read: "studio.read",
  manageAccounts: "studio.accounts.manage",
  post: "studio.post",
  manageGroups: "studio.groups.manage",
  uploadImages: "media.create",
  institutions: "institutions.read",
} as const

const text = z.string().nullable().optional().transform((value) => value ?? null)
const count = z.number().int().nonnegative()
const timestamp = z.string()
const nullableTimestamp = z.string().nullable().optional().transform((value) => value ?? null)
// Pictures are shown only when they are web addresses.
const webUrl = z.string().nullable().optional().transform((value) => (value && /^https?:\/\//i.test(value) ? value : null))
const nullable = <T extends z.ZodType>(schema: T) => schema.nullable().optional().transform((value) => value ?? null)

const adminRef = nullable(z.object({ id: z.string(), name: z.string(), email: z.string() }))
const institutionRef = z.object({ id: z.string(), name: z.string(), shortName: z.string() })
const placeRef = z.object({ id: z.string(), name: z.string() })
const pageOf = <T extends z.ZodType>(item: T) => z.object({ items: z.array(item), total: count, page: count, limit: count })

// ── Accounts ─────────────────────────────────────────────────────────────

export const studioAccountSchema = z.object({
  id: z.string(),
  username: text,
  fullName: text,
  bio: text,
  image: webUrl,
  institution: nullable(institutionRef),
  campus: nullable(placeRef),
  note: text,
  isActive: z.boolean().optional().default(true),
  archivedAt: nullableTimestamp,
  createdAt: timestamp,
  createdBy: adminRef,
  counts: z.object({ posts: count, followers: count }),
  lastPostedAt: nullableTimestamp,
})
export type StudioAccount = z.infer<typeof studioAccountSchema>
export const studioAccountPageSchema = pageOf(studioAccountSchema)

export const usernameCheckSchema = z.object({ username: z.string(), available: z.boolean(), reason: text })
export type UsernameCheck = z.infer<typeof usernameCheckSchema>

export type StudioAccountInput = {
  fullName: string
  username: string
  bio?: string
  imageUrl?: string
  institutionId?: string
  campusId?: string
  note?: string
}
/** An edit: a field left out stays as it is, and null clears it. */
export type StudioAccountUpdate = { [Field in keyof StudioAccountInput]?: StudioAccountInput[Field] | null }

/** A short app session for posting as an account: the gateway's own access token. */
export const studioSessionSchema = z.object({
  accessToken: z.string(),
  sessionId: z.string(),
  expiresAt: timestamp,
  apiBaseUrl: z.string(),
  account: z.object({ id: z.string(), username: text, fullName: text }),
})
export type StudioSession = z.infer<typeof studioSessionSchema>

// ── Groups ───────────────────────────────────────────────────────────────

export const studioGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: text,
  /** As written in captions: `LegonHallWeek`. */
  hashtag: z.string(),
  hashtagKey: z.string(),
  institution: nullable(institutionRef),
  campus: nullable(placeRef),
  hall: nullable(placeRef),
  startsAt: nullableTimestamp,
  endsAt: nullableTimestamp,
  coverUrl: webUrl,
  archivedAt: nullableTimestamp,
  createdAt: timestamp,
  createdBy: adminRef,
  counts: z.object({ posts: count, studioPosts: count }),
})
export type StudioGroup = z.infer<typeof studioGroupSchema>
export const studioGroupPageSchema = pageOf(studioGroupSchema)

export type StudioGroupInput = {
  name: string
  hashtag?: string
  description?: string
  institutionId?: string
  campusId?: string
  hallId?: string
  startsAt?: string
  endsAt?: string
  coverUrl?: string
}
/** An edit: a field left out stays as it is, and null clears it. The hashtag is fixed. */
export type StudioGroupUpdate = { [Field in Exclude<keyof StudioGroupInput, "hashtag">]?: StudioGroupInput[Field] | null }

// ── Posts ────────────────────────────────────────────────────────────────

export const POST_TYPES = ["TEXT", "IMAGE", "VIDEO"] as const
export type PostType = (typeof POST_TYPES)[number]

export const studioPostSchema = z.object({
  id: z.string(),
  type: z.enum(POST_TYPES),
  caption: text,
  /** PUBLIC, PRIVATE, DRAFT, PROCESSING or ARCHIVED. */
  status: z.string(),
  createdAt: timestamp,
  isShort: z.boolean(),
  account: z.object({ id: z.string(), username: text, fullName: text, image: webUrl }),
  postedBy: adminRef,
  cover: webUrl,
  imageCount: count,
  video: nullable(z.object({ duration: z.number().nullable(), aspectRatio: z.number().nullable(), transcodingStatus: z.string() })),
  counts: z.object({ likes: count, comments: count, views: count }),
  groups: z.array(z.object({ id: z.string(), name: z.string(), hashtag: z.string() })),
})
export type StudioPost = z.infer<typeof studioPostSchema>
export const studioPostPageSchema = pageOf(studioPostSchema)

export type StudioPostQuery = { accountId?: string; groupId?: string; adminId?: string; type?: PostType; page?: number; limit?: number }

export const studioSummarySchema = z.object({
  accounts: z.object({ active: count, archived: count }),
  groups: z.object({ active: count }),
  posts: z.object({ total: count, last7Days: count, text: count, pictures: count, videos: count, shorts: count }),
  topAdmins: z.array(z.object({ admin: adminRef, posts: count })),
})
export type StudioSummary = z.infer<typeof studioSummarySchema>

// ── Places and pictures ──────────────────────────────────────────────────

/** GET /institutions: every institution, with its campuses and their halls. */
export const institutionDirectorySchema = z.array(z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string(),
  region: z.string(),
  isActive: z.boolean().optional().default(true),
  campuses: z.array(z.object({
    id: z.string(),
    name: z.string(),
    halls: z.array(z.object({ id: z.string(), name: z.string(), isActive: z.boolean().optional().default(true) })).default([]),
  })).default([]),
}))
export type InstitutionDirectory = z.infer<typeof institutionDirectorySchema>
export type DirectoryInstitution = InstitutionDirectory[number]

/** POST /media/upload-intents: a READY library asset is how a photo or cover gets a web address. */
export const mediaUploadIntentSchema = z.object({
  asset: z.object({ id: z.string(), publicUrl: text }),
  upload: z.object({ url: z.string(), method: z.string().default("PUT"), headers: z.record(z.string(), z.string()).default({}) }),
})
export const mediaAssetSchema = z.object({ id: z.string(), status: z.string(), publicUrl: text })

// ── The app's own posting API (API gateway), used with a studio session ──

export const POST_VISIBILITIES = ["PUBLIC", "PRIVATE"] as const
export type PostVisibility = (typeof POST_VISIBILITIES)[number]

export const appPostSchema = z.object({
  id: z.string(),
  type: z.enum(POST_TYPES),
  caption: text,
  /** PUBLIC, PRIVATE, DRAFT or PROCESSING (a video still transcoding). */
  visibility: z.string(),
  media: z.array(z.object({ id: z.string().optional(), type: z.string().optional(), status: z.string().optional() }).passthrough()).default([]),
})
export type AppPost = z.infer<typeof appPostSchema>

export const imagePresignSchema = z.object({
  files: z.array(z.object({ uploadUrl: z.string(), s3Key: z.string(), position: z.number().int() })),
})

export const videoUploadSchema = z.object({
  uploadId: z.string(),
  s3Key: z.string(),
  chunkSize: z.number().int().positive(),
  totalParts: z.number().int().positive(),
  maxConcurrentParts: z.number().int().positive().optional().default(4),
})
export type VideoUploadSession = z.infer<typeof videoUploadSchema>

export const partUrlsSchema = z.object({ urls: z.array(z.object({ partNumber: z.number().int(), url: z.string() })) })
