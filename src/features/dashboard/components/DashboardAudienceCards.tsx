import { TrendBadge, UsersGlyph } from "./DashboardMetricCards"
import { audienceStats } from "../data/audience"

export function DashboardAudienceCards() {
  return (
    <section className="px-4 sm:px-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-12">
        {audienceStats.map((stat) => (
          <article
            key={stat.label}
            className="col-span-1 flex min-h-[112px] items-center gap-4 overflow-hidden rounded-[20px] bg-white px-6 py-4 shadow-adbox-small transition-all duration-200 hover:-translate-y-0.5 hover:shadow-adbox-medium sm:col-span-4 md:col-span-3 xl:col-span-6"
          >
            <UsersGlyph />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="truncate text-b3 text-secondary-grey-600 md:text-b2">
                {stat.label}
              </p>
              <p className="truncate font-heading text-h6 font-semibold text-grey-1000 md:text-h5">
                {stat.value}
              </p>
              <TrendBadge direction={stat.trendDirection} value={stat.trendValue} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
