import { z } from "zod"

export const verificationTiers = ["SELF_DECLARED", "PENDING", "VERIFIED"] as const
export const studentStatuses = ["STUDENT", "ALUMNI", "STAFF"] as const
export const affiliations = ["STUDENT", "ALUMNI", "STAFF", "NONE"] as const
export const accountRoles = ["GUEST", "VIEWER", "CREATOR", "PUBLISHER"] as const
export const accountStatuses = ["active", "suspended", "deactivated", "pending_deletion", "erased"] as const
export const deactivationReasons = ["SELF", "DELETION_REQUESTED", "ERASED"] as const
export const badgeKinds = ["campus", "company", "honour", "spotlight"] as const
export const verificationRequestStatuses = ["PENDING", "APPROVED", "REJECTED"] as const
export const followStatuses = ["ACTIVE", "REQUESTED", "BLOCKED", "MUTED"] as const
export const connectionDirections = ["followers", "following", "blocking", "blockedBy"] as const
export const companyStatuses = ["PENDING_VERIFICATION", "ACTIVE", "SUSPENDED", "INACTIVE"] as const
export const identityProviders = ["GOOGLE", "FACEBOOK", "APPLE"] as const

// Prisma returns `Boolean?` columns as null for legacy rows; treat null as false.
const flag = z.boolean().nullable().optional().transform((value) => value ?? false)
const optionalText = z.string().nullable().optional().transform((value) => value ?? null)
const optionalNumber = z.number().nullable().optional().transform((value) => value ?? null)
const count = z.number().int().nonnegative()
const timestamp = z.iso.datetime()
const optionalTimestamp = timestamp.nullable().optional().transform((value) => value ?? null)
const optionalUuid = z.uuid().nullable().optional().transform((value) => value ?? null)
// Unknown enum values from a newer backend should not hide the whole list.
const lenientEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.string().nullable().optional().transform((value) => (values as readonly string[]).includes(value ?? "") ? value as T[number] : null)
const nullableObject = <T extends z.ZodType>(schema: T) => schema.nullable().optional().transform((value) => value ?? null)

export const institutionRefSchema = z.object({ id: z.uuid(), slug: z.string(), name: z.string() })
export const campusRefSchema = z.object({ id: z.uuid(), name: z.string(), city: z.string() })

export const platformUserProfileSchema = z.object({
  id: z.uuid(),
  fullName: optionalText,
  username: optionalText,
  email: z.string(),
  contact: optionalText,
  image: optionalText,
  bio: optionalText,
  dob: optionalTimestamp,
  gender: lenientEnum(["MALE", "FEMALE", "OTHER"] as const),
  ipAddress: optionalText,
  institutionId: optionalUuid,
  institution: nullableObject(institutionRefSchema),
  campusId: optionalUuid,
  campus: nullableObject(campusRefSchema),
  hall: nullableObject(z.object({ id: z.uuid(), name: z.string() })),
  studentStatus: lenientEnum(studentStatuses),
  level: optionalNumber,
  programme: optionalText,
  graduationYear: optionalNumber,
  verificationTier: lenientEnum(verificationTiers).transform((value) => value ?? "SELF_DECLARED"),
  verifiedAt: optionalTimestamp,
  honourSince: optionalTimestamp,
  honourRenewsAt: optionalTimestamp,
  spotlightUntil: optionalTimestamp,
  createdAt: timestamp,
  updatedAt: timestamp,
})

const userCountsSchema = z.object({ followers: count.default(0), following: count.default(0), companyPublisher: count.default(0) })

export const platformUserSchema = z.object({
  id: z.uuid(),
  deviceType: optionalText,
  emailVerified: flag,
  isContactVerified: flag,
  isOAuth: flag,
  isMachine: flag,
  isLegal: flag,
  isActive: z.boolean().nullable().optional().transform((value) => value ?? true),
  deactivationReason: lenientEnum(deactivationReasons),
  deactivatedAt: optionalTimestamp,
  deletionScheduledFor: optionalTimestamp,
  erasedAt: optionalTimestamp,
  role: lenientEnum(accountRoles),
  passwordChangedAt: optionalTimestamp,
  createdAt: timestamp,
  updatedAt: timestamp,
  userProfile: nullableObject(platformUserProfileSchema),
  // Older servers don't send counts; null means "unknown", not zero.
  _count: nullableObject(userCountsSchema),
})

const pageOf = <T extends z.ZodType>(item: T) => z.object({
  items: z.array(item),
  total: count,
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
})

export const platformUserPageSchema = pageOf(platformUserSchema)

export const suspendResultSchema = platformUserSchema.extend({ revokedSessions: count })

export const platformUserQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  status: z.enum(accountStatuses).optional(),
  role: z.enum(accountRoles).optional(),
  affiliation: z.enum(affiliations).optional(),
  badge: z.enum(badgeKinds).optional(),
  verificationTier: z.enum(verificationTiers).optional(),
  institutionId: z.uuid().optional(),
  campusId: z.uuid().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

export const updatePlatformUserSchema = z.object({
  username: z.string().trim().min(1, "Enter a username.").max(100, "Use 100 characters or fewer.").optional(),
  institutionId: z.uuid().optional(),
  campusId: z.uuid().optional(),
  studentStatus: z.enum(studentStatuses).optional(),
  level: z.number().int().min(100, "Level must be between 100 and 900.").max(900, "Level must be between 100 and 900.").optional(),
  programme: z.string().trim().min(1, "Enter a programme.").max(200, "Use 200 characters or fewer.").optional(),
  graduationYear: z.number().int().min(1950, "Use a year between 1950 and 2100.").max(2100, "Use a year between 1950 and 2100.").optional(),
})

export const suspendPlatformUserSchema = z.object({
  reason: z.string().trim().max(500, "Use 500 characters or fewer.").optional(),
})

// Leave a field out to keep it; null clears it (docs/badges.md).
export const updateBadgesSchema = z.object({
  studentStatus: z.enum(studentStatuses).nullable().optional(),
  verificationTier: z.enum(verificationTiers).optional(),
  honour: z.enum(["GRANT", "REVOKE"]).optional(),
  honourRenewsAt: z.iso.datetime().optional(),
  spotlightUntil: z.iso.datetime().nullable().optional(),
}).refine((value) => Object.values(value).some((field) => field !== undefined), { message: "Change at least one badge." })

// ── Stats ─────────────────────────────────────────────────────────────────

export const membersSchema = z.object({
  total: count, STUDENT: count, ALUMNI: count, STAFF: count, NONE: count, verified: count, pending: count,
})

export const userStatsSchema = z.object({
  institutionId: z.uuid().nullable(),
  generatedAt: timestamp,
  total: count,
  newLast7Days: count,
  newLast30Days: count,
  status: z.object({ active: count, suspended: count, deactivated: count, pendingDeletion: count, erased: count }),
  roles: z.object({ GUEST: count, VIEWER: count, CREATOR: count, PUBLISHER: count }),
  affiliation: z.object({ STUDENT: count, ALUMNI: count, STAFF: count, NONE: count }),
  verification: z.object({ SELF_DECLARED: count, PENDING: count, VERIFIED: count }),
  badges: z.object({ campus: count, company: count, honour: count, spotlight: count }),
  institutions: z.array(z.object({
    id: z.uuid(),
    name: z.string(),
    shortName: z.string(),
    slug: z.string(),
    type: z.string(),
    region: optionalText,
    isActive: z.boolean(),
    logoUrl: optionalText,
    campusCount: count,
    members: membersSchema,
  })),
  campuses: z.array(z.object({ id: z.uuid(), name: z.string(), city: z.string(), hallCount: count, members: membersSchema })).nullable(),
  withoutCampus: membersSchema.nullable(),
})

// ── Relationships ─────────────────────────────────────────────────────────

export const relationshipsSchema = z.object({
  counts: z.object({
    followers: count, following: count, requestsReceived: count, requestsSent: count,
    blocking: count, blockedBy: count, posts: count, comments: count, institutionsFollowed: count,
  }),
  companies: z.array(z.object({
    id: z.uuid(),
    name: z.string(),
    email: optionalText,
    logo: optionalText,
    status: lenientEnum(companyStatuses),
    verifiedAt: optionalTimestamp,
    publisherCount: count,
    campaignCount: count,
    isOwner: z.boolean(),
    joinedAt: timestamp,
  })),
  institutionsFollowed: z.array(z.object({ id: z.uuid(), name: z.string(), shortName: z.string(), followedAt: timestamp })),
  identities: z.array(z.object({ provider: lenientEnum(identityProviders), email: optionalText, createdAt: timestamp, lastUsedAt: optionalTimestamp })),
  sessions: z.object({ active: count, lastStartedAt: optionalTimestamp }),
  consent: nullableObject(z.object({ policyVersion: z.string(), acceptedAt: timestamp })),
  goldBalance: z.number().nullable(),
  honour: z.object({
    year: z.number().int(),
    nominationsThisYear: count,
    decisions: z.array(z.object({ year: z.number().int(), outcome: z.enum(["GRANTED", "DECLINED"]), note: optionalText, createdAt: timestamp })),
  }),
  spotlightPurchases: count,
})

// A person as listed under someone else: enough to recognise and open them.
export const personSchema = z.object({
  id: z.uuid(),
  role: lenientEnum(accountRoles),
  isActive: z.boolean().nullable().optional().transform((value) => value ?? true),
  deactivationReason: lenientEnum(deactivationReasons),
  userProfile: nullableObject(z.object({
    fullName: optionalText,
    username: optionalText,
    email: optionalText,
    image: optionalText,
    studentStatus: lenientEnum(studentStatuses),
    verificationTier: lenientEnum(verificationTiers),
    institution: nullableObject(z.object({ id: z.uuid(), shortName: z.string() })),
  })),
})

export const connectionsPageSchema = pageOf(z.object({ user: personSchema, status: lenientEnum(followStatuses), since: timestamp })).extend({
  direction: z.enum(connectionDirections),
})

export const connectionsQuerySchema = z.object({
  direction: z.enum(connectionDirections).default("followers"),
  status: z.enum(followStatuses).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

// ── Companies ─────────────────────────────────────────────────────────────

export const companySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.string(),
  phoneNumber: optionalText,
  bio: optionalText,
  logo: optionalText,
  website: optionalText,
  status: lenientEnum(companyStatuses).transform((value) => value ?? "PENDING_VERIFICATION"),
  registrationNumber: optionalText,
  verifiedAt: optionalTimestamp,
  rejectionNote: optionalText,
  size: optionalText,
  businessType: optionalText,
  createdAt: timestamp,
  updatedAt: timestamp,
  _count: nullableObject(z.object({ publishers: count, campaigns: count })),
  owner: nullableObject(personSchema),
})

export const companyDetailSchema = companySchema.extend({
  publishers: z.array(z.object({ isOwner: z.boolean(), joinedAt: timestamp, user: personSchema })),
})

export const companyPageSchema = pageOf(companySchema)

export const companyQuerySchema = z.object({
  status: z.enum(companyStatuses).optional(),
  search: z.string().trim().max(200).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

export const rejectCompanySchema = z.object({
  rejectionNote: z.string().trim().min(3, "Explain the rejection in at least 3 characters.").max(500, "Use 500 characters or fewer."),
})

// ── Honours (Gye Nyame) ───────────────────────────────────────────────────

export const honourCandidateSchema = z.object({
  userId: z.uuid(),
  username: optionalText,
  fullName: optionalText,
  image: optionalText,
  institution: optionalText,
  nominations: count,
  campuses: count,
  meetsNominationRule: z.boolean(),
  eligibility: z.object({
    eligible: z.boolean(),
    checks: z.array(z.object({ key: z.string(), met: z.boolean(), detail: z.record(z.string(), z.number()).optional() })),
    upheldReports: count,
  }),
  campusCap: nullableObject(z.object({ limit: count, granted: count, activePeople: count })),
  currentHonour: z.boolean(),
  decision: nullableObject(z.object({ outcome: z.enum(["GRANTED", "DECLINED"]), note: optionalText, override: z.boolean(), createdAt: timestamp })),
})

export const honourPageSchema = pageOf(honourCandidateSchema).extend({
  year: z.number().int(),
  rules: z.record(z.string(), z.number()),
})

// The detail endpoint replaces the nomination count with the nominations themselves.
export const honourDetailSchema = honourCandidateSchema.extend({
  nominations: z.array(z.object({
    nominatorId: z.uuid(),
    username: optionalText,
    fullName: optionalText,
    institutionId: optionalUuid,
    reason: optionalText,
    createdAt: timestamp,
  })),
})

export const honourQuerySchema = z.object({
  year: z.number().int().min(2026).max(2100).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(25),
})

export const grantHonourSchema = z.object({
  override: z.boolean().optional(),
  note: z.string().trim().min(5, "Write at least 5 characters.").max(500, "Use 500 characters or fewer.").optional(),
}).refine((value) => !value.override || Boolean(value.note), { message: "Explain why you are overriding the rules.", path: ["note"] })

export const declineHonourSchema = z.object({
  note: z.string().trim().min(5, "Write at least 5 characters.").max(500, "Use 500 characters or fewer."),
})

// ── Verification ──────────────────────────────────────────────────────────

export const reviewerSchema = z.object({
  id: z.uuid(),
  email: z.string(),
  firstName: optionalText,
  lastName: optionalText,
})

// Evidence is user-supplied; only http(s) links are ever rendered as anchors.
const evidenceUrl = z.string().transform((value) => {
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null
  } catch {
    return null
  }
})

export const verificationRequestSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  institutionId: z.uuid(),
  evidenceUrl,
  status: z.enum(verificationRequestStatuses),
  reviewedByAdminId: optionalUuid,
  reviewedAt: optionalTimestamp,
  rejectionNote: optionalText,
  createdAt: timestamp,
  reviewedBy: nullableObject(reviewerSchema),
})

export const verificationPageSchema = pageOf(verificationRequestSchema)

export const verificationQuerySchema = z.object({
  status: z.enum(verificationRequestStatuses).optional(),
  institutionId: z.uuid().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

export const rejectVerificationSchema = z.object({
  rejectionNote: z.string().trim().min(3, "Explain the rejection in at least 3 characters.").max(500, "Use 500 characters or fewer."),
})

export const institutionSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  shortName: z.string(),
  slug: z.string(),
  type: optionalText,
  region: optionalText,
  isActive: z.boolean().optional().default(true),
  campuses: z.array(campusRefSchema).optional().default([]),
})

export type PlatformUserQuery = z.input<typeof platformUserQuerySchema>
export type UpdatePlatformUserInput = z.infer<typeof updatePlatformUserSchema>
export type SuspendPlatformUserInput = z.infer<typeof suspendPlatformUserSchema>
export type UpdateBadgesInput = z.infer<typeof updateBadgesSchema>
export type ConnectionsQuery = z.input<typeof connectionsQuerySchema>
export type CompanyQuery = z.input<typeof companyQuerySchema>
export type RejectCompanyInput = z.infer<typeof rejectCompanySchema>
export type HonourQuery = z.input<typeof honourQuerySchema>
export type GrantHonourInput = z.infer<typeof grantHonourSchema>
export type DeclineHonourInput = z.infer<typeof declineHonourSchema>
export type VerificationQuery = z.input<typeof verificationQuerySchema>
export type RejectVerificationInput = z.infer<typeof rejectVerificationSchema>
