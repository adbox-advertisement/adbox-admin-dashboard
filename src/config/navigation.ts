import type { LucideIcon } from "lucide-react"
import { Banknote, CircleHelp, CirclePlay, GraduationCap, LayoutDashboard, LibraryBig, Settings, UserRound, UsersRound, Video } from "lucide-react"
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
      { label: "People", to: APP_ROUTES.manageUsersPeople },
      { label: "Institutions", to: APP_ROUTES.manageUsersInstitutions },
      { label: "Publishers & Companies", to: APP_ROUTES.manageUsersCompanies },
      { label: "Business requests", to: APP_ROUTES.manageUsersBusinessRequests },
      { label: "Page requests", to: APP_ROUTES.manageUsersPageRequests },
      { label: "Verification", to: APP_ROUTES.manageUsersVerification },
      { label: "Honours", to: APP_ROUTES.manageUsersHonours },
    ],
  },
  {
    label: "User Content",
    icon: LibraryBig,
    to: APP_ROUTES.userContent,
    children: [
      { label: "Overview", to: APP_ROUTES.userContent },
      { label: "Posts", to: APP_ROUTES.userContentPosts },
      { label: "Ads", to: APP_ROUTES.userContentAds },
      { label: "Surveys", to: APP_ROUTES.userContentSurveys },
      { label: "Reports", to: APP_ROUTES.userContentReports },
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
  },
  {
    label: "Settings",
    icon: Settings,
    to: APP_ROUTES.settings,
  },
]
