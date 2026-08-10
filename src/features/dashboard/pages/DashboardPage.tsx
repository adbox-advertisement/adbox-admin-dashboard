import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { DashboardSidebar } from "@/components/layout/DashboardSidebar"
import { DashboardAudienceCards } from "@/features/dashboard/components/DashboardAudienceCards"
import { DashboardFilters } from "@/features/dashboard/components/DashboardFilters"
import { DashboardGeographySection } from "@/features/dashboard/components/DashboardGeographySection"
import { DashboardMetricCards } from "@/features/dashboard/components/DashboardMetricCards"
import { DashboardPendingApprovalsSection } from "@/features/dashboard/components/DashboardPendingApprovalsSection"
import { DashboardUserOverviewChart } from "@/features/dashboard/components/DashboardUserOverviewChart"

export function DashboardPage() {
  return (
    <main className="min-h-svh w-full overflow-x-hidden bg-auth-background font-sans text-grey-1000 lg:pl-[290px]">
      <DashboardSidebar />

      <section className="w-full min-w-0">
        <div className="mx-auto w-full max-w-[1536px] min-w-0">
          <DashboardHeader />
          <div className="flex min-h-[calc(100svh-101px)] w-full min-w-0 flex-col gap-5 pb-10 pt-8 sm:pb-12">
            <DashboardFilters />
            <DashboardMetricCards />
            <DashboardAudienceCards />
            <DashboardUserOverviewChart />
            <DashboardGeographySection />
            <DashboardPendingApprovalsSection />
          </div>
        </div>
      </section>
    </main>
  )
}
