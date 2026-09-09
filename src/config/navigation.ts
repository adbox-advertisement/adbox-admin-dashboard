import type { LucideIcon } from "lucide-react"
import { Banknote, CircleHelp, CirclePlay, LayoutDashboard, Settings, UserRound, UsersRound, Video } from "lucide-react"
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
    label: "Financials",
    icon: Banknote,
    to: APP_ROUTES.financials,
    children: [
      { label: "Advertisers Payment", to: APP_ROUTES.advertisersPayment },
      { label: "Withdrawals", to: APP_ROUTES.withdrawals },
    ],
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
