import { DashboardAudienceCards } from "../components/DashboardAudienceCards"
import { DashboardFilters } from "../components/DashboardFilters"
import { DashboardGeographySection } from "../components/DashboardGeographySection"
import { DashboardMetricCards } from "../components/DashboardMetricCards"
import { DashboardPendingApprovalsSection } from "../components/DashboardPendingApprovalsSection"
import { DashboardUserOverviewChart } from "../components/DashboardUserOverviewChart"

export function DashboardPage() {
  return (
    <div className="flex min-h-[calc(100svh-101px)] w-full min-w-0 flex-col gap-5 pb-10 pt-8 sm:pb-12">
      <DashboardFilters />
      <DashboardMetricCards />
      <DashboardAudienceCards />
      <DashboardUserOverviewChart />
      <DashboardGeographySection />
      <DashboardPendingApprovalsSection />
    </div>
  )
}
