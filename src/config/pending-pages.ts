import { Banknote, CircleHelp, CirclePlay, ClipboardList, Flag, Settings, UserRound, UsersRound, WalletCards } from "lucide-react"
import type { PendingFeaturePageProps } from "@/components/feedback/PendingFeaturePage"
import { APP_ROUTES } from "@/routes/paths"

export const pendingPages: Array<PendingFeaturePageProps & { path: string }> = [
  {
    path: APP_ROUTES.manageUsers,
    title: "Manage Users",
    description: "User accounts, roles, and account-management tools will be available here once this module is complete.",
    icon: UserRound,
  },
  {
    path: APP_ROUTES.adsManagement,
    title: "Ads Management",
    description: "The central workspace for reviewing, organizing, and managing advertisements is currently pending.",
    icon: CirclePlay,
  },
  {
    path: APP_ROUTES.adRequests,
    title: "Ad Requests",
    section: "Ads Management",
    description: "The request review queue and approval workflow will be added to this page.",
    icon: ClipboardList,
  },
  {
    path: APP_ROUTES.reportedAds,
    title: "Reported Ads",
    section: "Ads Management",
    description: "Reported advertisement reviews and moderation actions will be managed from this page.",
    icon: Flag,
  },
  {
    path: APP_ROUTES.financials,
    title: "Financials",
    description: "Financial summaries, payments, and withdrawal management will be available here.",
    icon: Banknote,
  },
  {
    path: APP_ROUTES.advertisersPayment,
    title: "Advertisers Payment",
    section: "Financials",
    description: "Advertiser payment records and transaction-management tools are currently pending.",
    icon: WalletCards,
  },
  {
    path: APP_ROUTES.withdrawals,
    title: "Withdrawals",
    section: "Financials",
    description: "Withdrawal requests, review states, and payout actions will be managed here.",
    icon: Banknote,
  },
  {
    path: APP_ROUTES.support,
    title: "Support",
    description: "Support conversations, issue tracking, and resolution tools are being prepared.",
    icon: CircleHelp,
  },
  {
    path: APP_ROUTES.manageAdmins,
    title: "Manage Admins",
    description: "Administrator access, roles, and permissions will be managed from this page.",
    icon: UsersRound,
  },
  {
    path: APP_ROUTES.settings,
    title: "Settings",
    description: "Workspace preferences, security controls, and configuration options are currently pending.",
    icon: Settings,
  },
]
