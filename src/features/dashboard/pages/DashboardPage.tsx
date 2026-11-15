import { Suspense } from "react"
import { TrendingNowCard } from "@/features/recommendations"
import { cn } from "../lib/cn"
import { DashboardCommunity } from "../components/DashboardCommunity"
import { DashboardGeographySection } from "../components/DashboardGeographySection"
import { DashboardGreeting } from "../components/DashboardGreeting"
import { DashboardHeadlines } from "../components/DashboardHeadlines"
import { DashboardAdStages, DashboardLargestInstitutions, DashboardTopCreators } from "../components/DashboardRankings"
import { DashboardSignups } from "../components/DashboardSignups"
import { DashboardWaitingWork } from "../components/DashboardWaitingWork"
import { surface } from "../components/tokens"
import { useDashboardAccess } from "../hooks"

/**
 * AdBox at a glance, from live figures: what is waiting, the headline numbers, sign-ups over time,
 * who is on AdBox, what is trending, every institution on the map, and the largest institutions, ads and creators.
 * A card the admin can't read is left out and the rest fill its row.
 */
export function DashboardPage() {
  const access = useDashboardAccess()
  const bottom = [access.people && "institutions", access.ads && "ads", access.content && "creators"].filter(Boolean)
  // Three cards share a desktop row; on tablets the third takes a row of its own.
  const span = (index: number) => cn(bottom.length === 3 && index === 2 && "md:col-span-2 xl:col-span-1", bottom.length === 1 && "md:col-span-2 xl:col-span-3")

  return (
    <div className="flex min-h-[calc(100svh-101px)] w-full min-w-0 flex-col gap-5 pb-10 pt-8 sm:pb-12">
      <DashboardGreeting />
      <DashboardWaitingWork />
      <DashboardHeadlines access={access} />
      {access.people && <DashboardSignups />}

      {(access.people || access.trends) && <section aria-label="People and trends" className="px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          {access.people && <DashboardCommunity className={access.trends ? "xl:col-span-8" : "xl:col-span-12"} />}
          {access.trends && <Suspense fallback={<div className={cn(surface, "min-h-[420px] animate-pulse", access.people ? "xl:col-span-4" : "xl:col-span-12")} />}>
            <TrendingNowCard className={access.people ? "xl:col-span-4" : "xl:col-span-12"} />
          </Suspense>}
        </div>
      </section>}

      <DashboardGeographySection />

      {bottom.length > 0 && <section aria-label="Largest institutions, ads and creators" className="px-4 sm:px-6">
        <div className={cn("grid grid-cols-1 gap-5", bottom.length > 1 && "md:grid-cols-2", bottom.length === 3 && "xl:grid-cols-3", bottom.length === 1 && "md:grid-cols-2 xl:grid-cols-3")}>
          {access.people && <DashboardLargestInstitutions className={span(bottom.indexOf("institutions"))} />}
          {access.ads && <DashboardAdStages className={span(bottom.indexOf("ads"))} />}
          {access.content && <DashboardTopCreators className={span(bottom.indexOf("creators"))} />}
        </div>
      </section>}
    </div>
  )
}
