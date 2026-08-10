import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DateRangeDropdown } from "@/features/dashboard/components/DateRangeDropdown"

export function DashboardFilters() {
  return (
    <section className="px-4 sm:px-6">
      <div className="rounded-2xl bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <button
              type="button"
              className="flex h-10 min-w-[102px] items-center justify-center gap-1 rounded-[40px] bg-auth-background py-2 pl-4 pr-2 text-b3 text-grey-500 transition-colors hover:text-grey-1000 md:text-b2"
            >
              <span className="truncate">All Region</span>
              <ChevronDown
                aria-hidden="true"
                className="size-6 shrink-0 text-grey-400"
                strokeWidth={1.7}
              />
            </button>

            <DateRangeDropdown />
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-[36px] border-grey-300 bg-white px-5 py-3 text-b3 font-semibold text-grey-1000 hover:bg-grey-50 md:text-b2"
          >
            Refresh
          </Button>
        </div>
      </div>
    </section>
  )
}
