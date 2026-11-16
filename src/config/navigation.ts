import type { LucideIcon } from "lucide-react"
import { Banknote, CircleHelp, CirclePlay, Gift, GraduationCap, LayoutDashboard, LibraryBig, Settings, UserRound, UsersRound, Video, Waypoints } from "lucide-react"
import rdiMark from "@/assets/brand/rdi-mark.svg"
import type { PermissionRequirement } from "@/lib/permissions"
import { APP_ROUTES } from "@/routes/paths"

export type DashboardNavItem = {
  label: string
  icon?: LucideIcon
  imageSrc?: string
  to: string
  /**
   * What opening the entry (and every page under it) needs. Left out, anyone signed in may.
   * A section's own pages need what any of its sub-items needs (navigation-access.ts).
   */
  permission?: PermissionRequirement
  children?: Array<{
    label: string
    to: string
    /** Sub-items sharing a group are listed under its heading, in order. */
    group?: string
    /** What opening this sub-item, and the pages under it, needs. */
    permission?: PermissionRequirement
  }>
}

// The backend's keys (apps/super-admin/src/common/permission.constants.ts), matching what each
// page's endpoints require, so an entry shows exactly when its page can load.
const ALGORITHMS_READ = ["feed.ranking.read", "discover.read"] as const
// Only the Super Admin (the wildcard): RDI, by the owner's decision (2026-11-16), and pages on
// sample data, until they have a permission of their own on the server.
const SUPER_ADMIN_ONLY = "*"

export const navItems: DashboardNavItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    to: APP_ROUTES.dashboard,
  },
  {
    label: "Manage Users",
    icon: UserRound,
    to: APP_ROUTES.manageUsers,
    children: [
      { label: "Overview", to: APP_ROUTES.manageUsers, permission: "platform.users.read" },
      { label: "People", to: APP_ROUTES.manageUsersPeople, group: "Directory", permission: "platform.users.read" },
      { label: "Institutions", to: APP_ROUTES.manageUsersInstitutions, group: "Directory", permission: "platform.users.read" },
      { label: "Companies", to: APP_ROUTES.manageUsersCompanies, group: "Directory", permission: "companies.read" },
      { label: "Verification", to: APP_ROUTES.manageUsersVerification, group: "To review", permission: "verification.read" },
      // A business account is a verified company, so whoever verifies companies decides.
      { label: "Business requests", to: APP_ROUTES.manageUsersBusinessRequests, group: "To review", permission: "companies.read" },
      { label: "Page requests", to: APP_ROUTES.manageUsersPageRequests, group: "To review", permission: "page_requests.read" },
      { label: "Honours", to: APP_ROUTES.manageUsersHonours, group: "To review", permission: "honours.review" },
    ],
  },
  {
    label: "User Content",
    icon: LibraryBig,
    to: APP_ROUTES.userContent,
    children: [
      { label: "Overview", to: APP_ROUTES.userContent, permission: "user.content.read" },
      // Ads live in Ads Management; one person's ads show in their content view (the uploader filter).
      { label: "Posts", to: APP_ROUTES.userContentPosts, group: "Content", permission: "user.content.read" },
      { label: "Surveys", to: APP_ROUTES.userContentSurveys, group: "Content", permission: "user.content.read" },
      { label: "Reports", to: APP_ROUTES.userContentReports, group: "To review", permission: "user.content.read" },
    ],
  },
  {
    label: "Algorithms",
    icon: Waypoints,
    to: APP_ROUTES.recommendations,
    children: [
      // The explainers read whichever live settings they may and show the built-in defaults otherwise.
      { label: "Overview", to: APP_ROUTES.recommendations, permission: ALGORITHMS_READ },
      { label: "Home & videos", to: APP_ROUTES.recommendationsHome, group: "In the app", permission: ALGORITHMS_READ },
      { label: "Sponsored posts", to: APP_ROUTES.recommendationsSponsored, group: "In the app", permission: ["feed.ranking.read", "ads.read", "gold.settings.read"] },
      { label: "Discover", to: APP_ROUTES.recommendationsDiscover, group: "In the app", permission: ALGORITHMS_READ },
      { label: "Top trends", to: APP_ROUTES.recommendationsTopTrends, group: "In the app", permission: "discover.read" },
      { label: "Trending overrides", to: APP_ROUTES.recommendationsOverrides, group: "Manage", permission: "discover.read" },
      { label: "Ranked feed", to: APP_ROUTES.recommendationsRanked, group: "Not in the app yet", permission: "feed.ranking.read" },
      { label: "All parameters", to: APP_ROUTES.recommendationsParameters, group: "Reference", permission: ALGORITHMS_READ },
    ],
  },
  {
    label: "Ads Management",
    icon: CirclePlay,
    to: APP_ROUTES.adsManagement,
    children: [
      { label: "Ad Requests", to: APP_ROUTES.adRequests, permission: "ads.read" },
      { label: "Reported Ads", to: APP_ROUTES.reportedAds, permission: "ads.read" },
    ],
  },
  {
    label: "Financials",
    icon: Banknote,
    to: APP_ROUTES.financials,
    children: [
      { label: "Gold & pricing", to: APP_ROUTES.goldPricing, permission: "gold.settings.read" },
      { label: "Advertisers Payment", to: APP_ROUTES.advertisersPayment, permission: "payments.read" },
      { label: "Withdrawals", to: APP_ROUTES.withdrawals, permission: "payments.read" },
    ],
  },
  {
    label: "Rewards",
    icon: Gift,
    to: APP_ROUTES.rewards,
    children: [
      { label: "Overview", to: APP_ROUTES.rewards, permission: SUPER_ADMIN_ONLY },
      { label: "Redemption requests", to: APP_ROUTES.rewardRequests, group: "To review", permission: SUPER_ADMIN_ONLY },
      { label: "Rewards catalog", to: APP_ROUTES.rewardCatalog, group: "Manage", permission: SUPER_ADMIN_ONLY },
      { label: "Partners", to: APP_ROUTES.rewardPartners, group: "Manage", permission: SUPER_ADMIN_ONLY },
    ],
  },
  {
    label: "Video Management",
    icon: Video,
    to: APP_ROUTES.videoManagement,
    children: [
      { label: "Upload", to: APP_ROUTES.videoUpload, permission: "media.create" },
      { label: "Posts", to: APP_ROUTES.videoPosts, permission: "media.read" },
    ],
  },
  {
    label: "RDI",
    imageSrc: rdiMark,
    to: APP_ROUTES.rdi,
    permission: SUPER_ADMIN_ONLY,
  },
  {
    label: "Recruitment",
    icon: GraduationCap,
    to: APP_ROUTES.recruitment,
    permission: "recruitment.applications.read",
  },
  {
    label: "Support",
    icon: CircleHelp,
    to: APP_ROUTES.support,
    permission: SUPER_ADMIN_ONLY,
  },
  {
    label: "Manage Admins",
    icon: UsersRound,
    to: APP_ROUTES.manageAdmins,
    children: [
      { label: "Admins", to: APP_ROUTES.manageAdminsList, permission: "admins.read" },
      { label: "Roles", to: APP_ROUTES.manageAdminsRoles, permission: "roles.read" },
      { label: "Permissions", to: APP_ROUTES.manageAdminsPermissions, permission: "permissions.read" },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    to: APP_ROUTES.settings,
  },
]
