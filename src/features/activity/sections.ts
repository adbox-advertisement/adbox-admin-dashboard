import { APP_ROUTES } from "@/routes/paths"
import { activitySections, type ActivityCounts, type ActivitySection } from "./types"

type SectionInfo = {
  /** Said in the toast: "New in Ad Requests". */
  label: string
  /** The sidebar entry that carries the badge. */
  route: string
  /**
   * The owning feature's query-key prefix, refreshed when the queue changes so an
   * open list shows the new item. Keep in step with that feature's hooks.ts.
   */
  queryKey: readonly string[]
}

export const activitySectionInfo: Record<ActivitySection, SectionInfo> = {
  adRequests: { label: "Ad Requests", route: APP_ROUTES.adRequests, queryKey: ["ads"] },
  reportedAds: { label: "Reported Ads", route: APP_ROUTES.reportedAds, queryKey: ["ads"] },
  contentReports: { label: "User Content reports", route: APP_ROUTES.userContentReports, queryKey: ["user-content"] },
  pageRequests: { label: "Page requests", route: APP_ROUTES.manageUsersPageRequests, queryKey: ["users", "page-requests"] },
  businessRequests: { label: "Business requests", route: APP_ROUTES.manageUsersBusinessRequests, queryKey: ["users", "business-requests"] },
  companies: { label: "Publishers & Companies", route: APP_ROUTES.manageUsersCompanies, queryKey: ["users", "companies"] },
  verification: { label: "Verification", route: APP_ROUTES.manageUsersVerification, queryKey: ["users", "verification"] },
  honours: { label: "Honours", route: APP_ROUTES.manageUsersHonours, queryKey: ["users", "honours"] },
  recruitment: { label: "Recruitment", route: APP_ROUTES.recruitment, queryKey: ["recruitment"] },
}

/** Sidebar badges: what is waiting behind each entry, by its route. Empty queues get none. */
export function activityBadges(counts: ActivityCounts | undefined): Record<string, number> {
  const badges: Record<string, number> = {}
  for (const section of activitySections) {
    const count = counts?.[section]
    if (!count) continue
    const { route } = activitySectionInfo[section]
    badges[route] = (badges[route] ?? 0) + count
  }
  return badges
}
