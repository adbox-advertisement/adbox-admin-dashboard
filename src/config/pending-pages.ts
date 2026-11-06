import { Banknote, CircleHelp } from "lucide-react"
import type { PendingFeaturePageProps } from "@/components/feedback/PendingFeaturePage"
import { APP_ROUTES } from "@/routes/paths"

export const pendingPages: Array<PendingFeaturePageProps & { path: string }> = [
  {
    path: APP_ROUTES.financials,
    title: "Financials",
    description: "Financial summaries, payments, and withdrawal management will be available here.",
    icon: Banknote,
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
]
