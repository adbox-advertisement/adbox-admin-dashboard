import type { LucideIcon } from "lucide-react"
import { Banknote, CircleHelp, CirclePlay, Gift, GraduationCap, LayoutDashboard, LibraryBig, Settings, UserRound, UsersRound, Video } from "lucide-react"
import rdiMark from "@/assets/brand/rdi-mark.svg"
import { APP_ROUTES } from "@/routes/paths"

export type DashboardNavItem = {
  label: string
  icon?: LucideIcon
  imageSrc?: string
  to: string
  children?: Array<{
    label: string
    to: string
    /** Sub-items sharing a group are listed under its heading, in order. */
    group?: string
  }>
}

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
      { label: "Overview", to: APP_ROUTES.manageUsers },
      { label: "People", to: APP_ROUTES.manageUsersPeople, group: "Directory" },
      { label: "Institutions", to: APP_ROUTES.manageUsersInstitutions, group: "Directory" },
      { label: "Companies", to: APP_ROUTES.manageUsersCompanies, group: "Directory" },
      { label: "Verification", to: APP_ROUTES.manageUsersVerification, group: "To review" },
      { label: "Business requests", to: APP_ROUTES.manageUsersBusinessRequests, group: "To review" },
      { label: "Page requests", to: APP_ROUTES.manageUsersPageRequests, group: "To review" },
      { label: "Honours", to: APP_ROUTES.manageUsersHonours, group: "To review" },
    ],
  },
  {
    label: "User Content",
    icon: LibraryBig,
    to: APP_ROUTES.userContent,
    children: [
      { label: "Overview", to: APP_ROUTES.userContent },
      // Ads live in Ads Management; one person's ads show in their content view (the uploader filter).
      { label: "Posts", to: APP_ROUTES.userContentPosts, group: "Content" },
      { label: "Surveys", to: APP_ROUTES.userContentSurveys, group: "Content" },
      { label: "Reports", to: APP_ROUTES.userContentReports, group: "To review" },
    ],
  },
  {
    label: "Ads Management",
    icon: CirclePlay,
    to: APP_ROUTES.adsManagement,
    children: [
      { label: "Ad Requests", to: APP_ROUTES.adRequests },
      { label: "Reported Ads", to: APP_ROUTES.reportedAds },
    ],
  },
  {
    label: "Financials",
    icon: Banknote,
    to: APP_ROUTES.financials,
    children: [
      { label: "Gold & pricing", to: APP_ROUTES.goldPricing },
      { label: "Advertisers Payment", to: APP_ROUTES.advertisersPayment },
      { label: "Withdrawals", to: APP_ROUTES.withdrawals },
    ],
  },
  {
    label: "Rewards",
    icon: Gift,
    to: APP_ROUTES.rewards,
    children: [
      { label: "Overview", to: APP_ROUTES.rewards },
      { label: "Redemption requests", to: APP_ROUTES.rewardRequests, group: "To review" },
      { label: "Rewards catalog", to: APP_ROUTES.rewardCatalog, group: "Manage" },
      { label: "Partners", to: APP_ROUTES.rewardPartners, group: "Manage" },
    ],
  },
  {
    label: "Video Management",
    icon: Video,
    to: APP_ROUTES.videoManagement,
    children: [
      { label: "Upload", to: APP_ROUTES.videoUpload },
      { label: "Posts", to: APP_ROUTES.videoPosts },
    ],
  },
  {
    label: "RDI",
    imageSrc: rdiMark,
    to: APP_ROUTES.rdi,
  },
  {
    label: "Recruitment",
    icon: GraduationCap,
    to: APP_ROUTES.recruitment,
  },
  {
    label: "Support",
    icon: CircleHelp,
    to: APP_ROUTES.support,
  },
  {
    label: "Manage Admins",
    icon: UsersRound,
    to: APP_ROUTES.manageAdmins,
    children: [
      { label: "Admins", to: APP_ROUTES.manageAdminsList },
      { label: "Roles", to: APP_ROUTES.manageAdminsRoles },
      { label: "Permissions", to: APP_ROUTES.manageAdminsPermissions },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    to: APP_ROUTES.settings,
  },
]
