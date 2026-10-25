import type { z } from "zod"
import type {
  accountRoles,
  accountStatuses,
  affiliations,
  badgeKinds,
  companyDetailSchema,
  companySchema,
  companyStatuses,
  connectionDirections,
  connectionsPageSchema,
  followStatuses,
  honourCandidateSchema,
  honourDetailSchema,
  honourPageSchema,
  identityProviders,
  institutionSchema,
  personSchema,
  platformUserPageSchema,
  platformUserProfileSchema,
  platformUserSchema,
  relationshipsSchema,
  studentStatuses,
  userStatsSchema,
  verificationPageSchema,
  verificationRequestSchema,
  verificationRequestStatuses,
  verificationTiers,
} from "./validation"

export type PlatformUser = z.infer<typeof platformUserSchema>
export type PlatformUserProfile = z.infer<typeof platformUserProfileSchema>
export type PlatformUserPage = z.infer<typeof platformUserPageSchema>
export type Person = z.infer<typeof personSchema>
export type UserStats = z.infer<typeof userStatsSchema>
export type Members = UserStats["institutions"][number]["members"]
export type UserRelationships = z.infer<typeof relationshipsSchema>
export type ConnectionsPage = z.infer<typeof connectionsPageSchema>
export type Company = z.infer<typeof companySchema>
export type CompanyDetail = z.infer<typeof companyDetailSchema>
export type HonourCandidate = z.infer<typeof honourCandidateSchema>
export type HonourDetail = z.infer<typeof honourDetailSchema>
export type HonourPage = z.infer<typeof honourPageSchema>
export type VerificationRequest = z.infer<typeof verificationRequestSchema>
export type VerificationPage = z.infer<typeof verificationPageSchema>
export type Institution = z.infer<typeof institutionSchema>
export type VerificationTier = typeof verificationTiers[number]
export type StudentStatus = typeof studentStatuses[number]
export type Affiliation = typeof affiliations[number]
export type AccountRole = typeof accountRoles[number]
export type AccountStatus = typeof accountStatuses[number]
export type BadgeKind = typeof badgeKinds[number]
export type FollowStatus = typeof followStatuses[number]
export type ConnectionDirection = typeof connectionDirections[number]
export type CompanyStatus = typeof companyStatuses[number]
export type IdentityProvider = typeof identityProviders[number]
export type VerificationRequestStatus = typeof verificationRequestStatuses[number]

type Named = { userProfile: { fullName?: string | null; username?: string | null; email?: string | null } | null }

export function userDisplayName(user: Named) {
  const profile = user.userProfile
  return profile?.fullName?.trim() || profile?.username?.trim() || profile?.email || "Unnamed user"
}

/** Where an account stands. The owner's own choices take precedence over a suspension. */
export function accountStatusOf(user: Pick<PlatformUser, "isActive" | "deactivationReason">): AccountStatus {
  if (user.deactivationReason === "ERASED") return "erased"
  if (user.deactivationReason === "DELETION_REQUESTED") return "pending_deletion"
  if (user.deactivationReason === "SELF") return "deactivated"
  return user.isActive ? "active" : "suspended"
}

type BadgeProfile = Pick<PlatformUserProfile, "studentStatus" | "verificationTier" | "honourSince" | "honourRenewsAt" | "spotlightUntil">

/** The badges a person shows right now (docs/badges.md). The company seal needs relationships. */
export function activeBadges(profile: BadgeProfile | null, now = new Date()) {
  return {
    campus: Boolean(profile?.studentStatus && profile.verificationTier === "VERIFIED"),
    honour: Boolean(profile?.honourSince && (!profile.honourRenewsAt || new Date(profile.honourRenewsAt) > now)),
    spotlight: Boolean(profile?.spotlightUntil && new Date(profile.spotlightUntil) > now),
  }
}

export const verificationTierLabels: Record<VerificationTier, string> = {
  SELF_DECLARED: "Self-declared",
  PENDING: "Pending review",
  VERIFIED: "Verified",
}

export const studentStatusLabels: Record<StudentStatus, string> = {
  STUDENT: "Student",
  ALUMNI: "Alumni",
  STAFF: "Faculty & staff",
}

export const affiliationLabels: Record<Affiliation, string> = {
  ...studentStatusLabels,
  NONE: "No affiliation",
}

export const affiliationDescriptions: Record<Affiliation, string> = {
  STUDENT: "Currently enrolled at an institution",
  ALUMNI: "Graduated from an institution",
  STAFF: "Lecturers, faculty and campus staff (not AdBox employees)",
  NONE: "No institution status on their profile",
}

export const accountRoleLabels: Record<AccountRole, string> = {
  GUEST: "Guest",
  VIEWER: "Viewer",
  CREATOR: "Creator",
  PUBLISHER: "Publisher",
}

export const accountRoleDescriptions: Record<AccountRole, string> = {
  GUEST: "Browsing before registration",
  VIEWER: "The default: watches, follows and engages with content",
  CREATOR: "Earns from content; granted automatically, never chosen",
  PUBLISHER: "Advertiser who owns or belongs to a company",
}

export const accountStatusLabels: Record<AccountStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  deactivated: "Deactivated by user",
  pending_deletion: "Deletion requested",
  erased: "Erased",
}

export const accountStatusDescriptions: Record<AccountStatus, string> = {
  active: "Can sign in and use AdBox",
  suspended: "Switched off by AdBox staff",
  deactivated: "Hidden by the owner until they sign in again",
  pending_deletion: "Erased at the end of the grace period unless they sign in",
  erased: "Personal data removed; the empty account remains",
}

export const badgeLabels: Record<BadgeKind, string> = {
  campus: "Campus badge",
  company: "Verified company",
  honour: "Gye Nyame",
  spotlight: "Spotlight",
}

export const badgeDescriptions: Record<BadgeKind, string> = {
  campus: "Verified student, alumni or staff",
  company: "Publishes for an approved company",
  honour: "Earned honour, renewed yearly",
  spotlight: "Bought with gold; boosts their posts",
}

export const followStatusLabels: Record<FollowStatus, string> = {
  ACTIVE: "Following",
  REQUESTED: "Requested",
  BLOCKED: "Blocked",
  MUTED: "Muted",
}

export const connectionLabels: Record<ConnectionDirection, string> = {
  followers: "Followers",
  following: "Following",
  blocking: "Blocked by them",
  blockedBy: "Blocked them",
}

export const companyStatusLabels: Record<CompanyStatus, string> = {
  PENDING_VERIFICATION: "Awaiting review",
  ACTIVE: "Approved",
  SUSPENDED: "Rejected",
  INACTIVE: "Inactive",
}

export const identityProviderLabels: Record<IdentityProvider, string> = {
  GOOGLE: "Google",
  FACEBOOK: "Facebook",
  APPLE: "Apple",
}

export const institutionTypeLabels: Record<string, string> = {
  UNIVERSITY: "University",
  TECHNICAL_UNIVERSITY: "Technical university",
  COLLEGE_OF_EDUCATION: "College of education",
  NURSING_TRAINING: "Nursing training",
  POLYTECHNIC: "Polytechnic",
  PRIVATE_UNIVERSITY: "Private university",
}

export const honourCheckLabels: Record<string, string> = {
  year: "A year on AdBox",
  verified: "Verified campus or company",
  standing: "Good standing",
  contribution: "Real contribution",
}

export const genderLabels = { MALE: "Male", FEMALE: "Female", OTHER: "Other" } as const

export const USER_PERMISSIONS = {
  read: "platform.users.read",
  update: "platform.users.update",
  suspend: "platform.users.suspend",
  badges: "platform.users.badges",
  institutionsRead: "institutions.read",
  verificationRead: "verification.read",
  verificationReview: "verification.review",
  companiesRead: "companies.read",
  companiesVerify: "companies.verify",
  honoursReview: "honours.review",
  contentRead: "user.content.read",
} as const
