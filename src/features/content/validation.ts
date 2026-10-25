import { z } from "zod"

export const mediaTypes = ["VIDEO", "IMAGE", "TEXT"] as const
export const resourceStatuses = ["PUBLIC", "PRIVATE", "DRAFT", "PROCESSING", "ARCHIVED"] as const
export const transcodingStatuses = ["NOT_STARTED", "QUEUED", "PROCESSING", "COMPLETED", "FAILED"] as const
export const adTypes = ["BOOST_POST", "IMAGE", "VIDEO", "CAROUSEL", "PROFILE", "EVENT", "SURVEY"] as const
export const adStatuses = ["DRAFT", "PENDING_REVIEW", "ACTIVE", "PAUSED", "COMPLETED", "REJECTED", "CANCELLED"] as const

const text = z.string().nullable().optional().transform((value) => value ?? null)
const count = z.number().int().nonnegative().nullable().optional().transform((value) => value ?? null)
const timestamp = z.iso.datetime()
const optionalTimestamp = timestamp.nullable().optional().transform((value) => value ?? null)
// User-supplied URLs are only ever rendered when they are http(s).
export const safeUrl = z.string().nullable().optional().transform((value) => {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null
  } catch {
    return null
  }
})
// Unknown values from a newer backend fall back to null instead of failing the list.
const lenientEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.string().nullable().optional().transform((value) => (values as readonly string[]).includes(value ?? "") ? value as T[number] : null)

export const uploaderSchema = z.object({
  id: z.uuid(),
  isActive: z.boolean().nullable().optional().transform((value) => value ?? true),
  userProfile: z.object({
    fullName: text,
    username: text,
    email: z.string(),
    image: safeUrl,
  }).nullable().optional().transform((value) => value ?? null),
})

export const postSchema = z.object({
  id: z.uuid(),
  title: text,
  description: text,
  mediaType: z.enum(mediaTypes),
  status: lenientEnum(resourceStatuses),
  deleteStatus: z.string(),
  publicSlug: text,
  createdAt: timestamp,
  updatedAt: timestamp,
  user: uploaderSchema,
  imgResources: z.array(z.object({
    id: z.uuid(),
    imageUrl: safeUrl,
    previewImageUrl: safeUrl,
    width: count,
    height: count,
  })).default([]),
  videoResource: z.object({
    hlsUrl: safeUrl,
    mp4Url: safeUrl,
    duration: count,
    size: count,
    resolution: text,
    uploadStatus: text,
    transcodingStatus: lenientEnum(transcodingStatuses),
    thumbnail: z.object({ imageUrl: safeUrl, previewImageUrl: safeUrl }).nullable().optional().transform((value) => value ?? null),
  }).nullable().optional().transform((value) => value ?? null),
  _count: z.object({
    likes: z.number().int(),
    comments: z.number().int(),
    views: z.number().int(),
    shares: z.number().int(),
    surveys: z.number().int(),
  }),
}).transform(({ _count, ...post }) => ({ ...post, counts: _count, removed: post.deleteStatus === "DELETED" }))

const adContentSchema = z.object({
  headline: text,
  body: text,
  destinationUrl: safeUrl,
  imageUrls: z.array(z.string()).nullable().optional().transform((urls) => (urls ?? []).map((url) => safeUrl.parse(url)).filter((url): url is string => Boolean(url))),
  videoUrl: safeUrl,
  coverImageUrl: safeUrl,
  eventStartsAt: optionalTimestamp,
  eventLocation: text,
}).partial().catch({})

export const adSchema = z.object({
  id: z.uuid(),
  type: lenientEnum(adTypes),
  name: z.string(),
  goal: z.string(),
  audience: z.string(),
  dailyBudgetGhs: z.number(),
  durationDays: z.number(),
  costBars: z.number(),
  refundedBars: z.number(),
  status: lenientEnum(adStatuses),
  startsAt: timestamp,
  endsAt: timestamp,
  cancelledAt: optionalTimestamp,
  content: adContentSchema,
  createdAt: timestamp,
  updatedAt: timestamp,
  user: uploaderSchema,
  resource: z.object({ id: z.uuid(), title: text, mediaType: z.string() }).nullable().optional().transform((value) => value ?? null),
})

export const surveySchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: text,
  isActive: z.boolean(),
  coverImageUrl: safeUrl,
  estimatedMinutes: count,
  createdAt: timestamp,
  updatedAt: timestamp,
  resource: z.object({ id: z.uuid(), title: text, deleteStatus: z.string(), user: uploaderSchema }),
  _count: z.object({ questions: z.number().int(), responses: z.number().int() }),
}).transform(({ _count, resource, ...survey }) => ({ ...survey, post: { id: resource.id, title: resource.title, removed: resource.deleteStatus !== "ACTIVE" }, user: resource.user, questionCount: _count.questions, responseCount: _count.responses }))

const pageOf = <T extends z.ZodType>(item: T) => z.object({
  items: z.array(item),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
})

export const postPageSchema = pageOf(postSchema)
export const adPageSchema = pageOf(adSchema)
export const surveyPageSchema = pageOf(surveySchema)

export const summarySchema = z.object({
  videos: z.number().int(),
  images: z.number().int(),
  text: z.number().int(),
  removedPosts: z.number().int(),
  ads: z.number().int(),
  activeAds: z.number().int(),
  surveys: z.number().int(),
  activeSurveys: z.number().int(),
})

export const uploadersSchema = z.array(z.object({
  user: uploaderSchema.nullable(),
  posts: z.number().int(),
  videos: z.number().int(),
  images: z.number().int(),
  text: z.number().int(),
}))

const pageQuery = {
  userId: z.uuid().optional(),
  search: z.string().trim().max(200).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
}

export const postQuerySchema = z.object({ ...pageQuery, mediaType: z.enum(mediaTypes).optional(), state: z.enum(["live", "removed"]).optional() })
export const adQuerySchema = z.object({ ...pageQuery, type: z.enum(adTypes).optional(), status: z.enum(adStatuses).optional() })
export const surveyQuerySchema = z.object({ ...pageQuery, status: z.enum(["active", "inactive"]).optional() })

export const moderationReasonSchema = z.object({
  reason: z.string().trim().max(500, "Use 500 characters or fewer.").optional(),
})

// Reports raised from the app: posts and comments, and chat messages and conversations.
export const reportReasons = ["SPAM", "HARASSMENT", "HATE", "NUDITY", "VIOLENCE", "SELF_HARM", "MISINFORMATION", "SCAM", "INTELLECTUAL_PROPERTY", "OTHER"] as const
export const reportStatuses = ["OPEN", "ACTION_TAKEN", "DISMISSED"] as const
export const reportOutcomes = ["ACTION_TAKEN", "DISMISSED"] as const

const personSchema = z.object({
  id: z.uuid(),
  isActive: z.boolean().nullable().optional().transform((value) => value ?? true),
  userProfile: z.object({ fullName: text, username: text }).nullable().optional().transform((value) => value ?? null),
})

const reportBase = {
  id: z.uuid(),
  reason: lenientEnum(reportReasons),
  details: text,
  status: lenientEnum(reportStatuses),
  reporter: personSchema.nullable().optional().transform((value) => value ?? null),
  createdAt: timestamp,
  resolvedAt: optionalTimestamp,
  resolutionNote: text,
}

const otherReportsSchema = z.array(z.object({ id: z.uuid(), reason: lenientEnum(reportReasons), status: lenientEnum(reportStatuses), createdAt: timestamp })).default([])

export const contentReportSchema = z.object({
  ...reportBase,
  targetType: z.enum(["POST", "COMMENT"]),
  targetId: z.uuid(),
  resourceId: z.uuid(),
  openReportsOnTarget: z.number().int().nonnegative().optional().default(0),
})

const reportedPostSchema = z.object({
  id: z.uuid(),
  description: text,
  mediaType: z.string(),
  status: lenientEnum(resourceStatuses),
  deleteStatus: z.string(),
  createdAt: timestamp,
  user: personSchema,
}).transform((post) => ({ ...post, removed: post.deleteStatus !== "ACTIVE" }))

const reportedCommentSchema = z.object({
  id: z.uuid(),
  resourceId: z.uuid(),
  commentText: text,
  deletedAt: optionalTimestamp,
  deletedBy: text,
  createdAt: timestamp,
  user: personSchema,
})

export const contentReportDetailSchema = contentReportSchema.extend({
  target: z.discriminatedUnion("type", [
    z.object({ type: z.literal("POST"), post: reportedPostSchema }),
    z.object({ type: z.literal("COMMENT"), comment: reportedCommentSchema }),
  ]).nullable().optional().transform((value) => value ?? null),
  otherReports: otherReportsSchema,
})

export const chatReportSchema = z.object({
  ...reportBase,
  targetType: z.enum(["MESSAGE", "CONVERSATION"]),
  targetId: z.string(),
  conversationId: z.string(),
  reportedUserId: z.uuid().nullable().optional().transform((value) => value ?? null),
  reportedUser: personSchema.nullable().optional().transform((value) => value ?? null),
})

const snapshotMessageSchema = z.object({
  id: z.string(),
  senderId: z.string().nullable().optional().transform((value) => value ?? null),
  kind: z.string().nullable().optional().transform((value) => value ?? "TEXT"),
  text,
  attachments: z.array(z.object({ kind: z.string().nullable().optional() }).loose()).nullable().optional().transform((value) => value?.length ?? 0),
  createdAt: optionalTimestamp,
  deletedAt: optionalTimestamp,
})

// The snapshot is copied from MongoDB when the report is made. A message report keeps the
// message and up to 20 before it; a conversation report keeps its last 30 messages.
const snapshotSchema = z.object({
  reported: snapshotMessageSchema.optional(),
  before: z.array(snapshotMessageSchema).optional(),
  type: z.string().optional(),
  messages: z.array(snapshotMessageSchema).optional(),
}).transform((snapshot) => ({
  conversationType: snapshot.type ?? null,
  reportedMessageId: snapshot.reported?.id ?? null,
  messages: snapshot.reported ? [...(snapshot.before ?? []), snapshot.reported] : snapshot.messages ?? [],
})).catch({ conversationType: null, reportedMessageId: null, messages: [] })

export const chatReportDetailSchema = chatReportSchema.extend({
  snapshot: snapshotSchema,
  openReportsAgainstUser: z.number().int().nonnegative().optional().default(0),
  otherReports: otherReportsSchema,
})

export const contentReportPageSchema = pageOf(contentReportSchema)
export const chatReportPageSchema = pageOf(chatReportSchema)

const reportQuery = {
  status: z.enum(reportStatuses).default("OPEN"),
  reason: z.enum(reportReasons).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
}
export const contentReportQuerySchema = z.object({ ...reportQuery, targetType: z.enum(["POST", "COMMENT"]).optional() })
export const chatReportQuerySchema = z.object({ ...reportQuery, targetType: z.enum(["MESSAGE", "CONVERSATION"]).optional() })

const note = z.string().trim().max(500, "Use 500 characters or fewer.").optional()
export const resolveContentReportSchema = z.object({ outcome: z.enum(reportOutcomes), removeContent: z.boolean().optional(), note })
  .refine((input) => !input.removeContent || input.outcome === "ACTION_TAKEN", { message: "Content can only be removed when you take action.", path: ["removeContent"] })
export const resolveChatReportSchema = z.object({ outcome: z.enum(reportOutcomes), note })

export type ContentReportQuery = z.input<typeof contentReportQuerySchema>
export type ChatReportQuery = z.input<typeof chatReportQuerySchema>
export type ResolveContentReport = z.input<typeof resolveContentReportSchema>
export type ResolveChatReport = z.input<typeof resolveChatReportSchema>

export type PostQuery = z.input<typeof postQuerySchema>
export type AdQuery = z.input<typeof adQuerySchema>
export type SurveyQuery = z.input<typeof surveyQuerySchema>
export type ModerationReason = z.infer<typeof moderationReasonSchema>
