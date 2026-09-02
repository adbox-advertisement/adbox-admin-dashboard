import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom"
import {
  Banknote,
  CircleHelp,
  CirclePlay,
  ClipboardList,
  Flag,
  Settings,
  UserRound,
  UsersRound,
  Video,
  WalletCards,
} from "lucide-react"

import { LoginPage } from "@/features/auth"
import { DashboardPage } from "@/features/dashboard"
import { PendingFeaturePage, type PendingFeaturePageProps } from "@/features/pending"
import { RdiPage } from "@/features/rdi"
import { APP_ROUTES } from "@/routes/paths"

const pendingRoutes: Array<PendingFeaturePageProps & { path: string }> = [
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
    path: APP_ROUTES.videoManagement,
    title: "Video Management",
    description: "Video review, publishing, and management tools are being prepared for this workspace.",
    icon: Video,
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

const router = createBrowserRouter([
  {
    path: APP_ROUTES.root,
    loader: () => redirect(APP_ROUTES.login),
  },
  {
    path: APP_ROUTES.login,
    element: <LoginPage />,
  },
  {
    path: APP_ROUTES.dashboard,
    element: <DashboardPage />,
  },
  {
    path: APP_ROUTES.rdi,
    element: <RdiPage />,
  },
  ...pendingRoutes.map(({ path, ...pageProps }) => ({
    path,
    element: <PendingFeaturePage {...pageProps} />,
  })),
  {
    path: "*",
    loader: () => redirect(APP_ROUTES.login),
  },
])

export function AppRoutes() {
  return <RouterProvider router={router} />
}
