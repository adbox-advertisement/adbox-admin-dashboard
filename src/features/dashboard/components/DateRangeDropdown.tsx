import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const quickRanges = [
  "Today",
  "This Week",
  "Last week",
  "Last month",
  "Last quarter",
]

const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

type CalendarDay = {
  label: string
  muted?: boolean
  weekend?: boolean
  selected?: boolean
  range?: "start" | "middle" | "end"
}

const calendarWeeks: CalendarDay[][] = [
  [
    { label: "26", muted: true },
    { label: "27", muted: true },
    { label: "28", muted: true, selected: true, range: "start" },
    { label: "29", muted: true, range: "middle" },
    { label: "30", muted: true, range: "middle" },
    { label: "31", muted: true, range: "middle" },
    { label: "1", weekend: true, range: "middle" },
  ],
  [
    { label: "2", range: "middle" },
    { label: "3", range: "middle" },
    { label: "4", range: "middle" },
    { label: "5", range: "middle" },
    { label: "6", range: "middle" },
    { label: "7", weekend: true, range: "middle" },
    { label: "8", weekend: true, range: "middle" },
  ],
  [
    { label: "9", range: "middle" },
    { label: "10", selected: true, range: "end" },
    { label: "11" },
    { label: "12" },
    { label: "13" },
    { label: "14", weekend: true },
    { label: "15", weekend: true },
  ],
  [
    { label: "16" },
    { label: "17" },
    { label: "18" },
    { label: "19" },
    { label: "20" },
    { label: "21", weekend: true },
    { label: "22", weekend: true },
  ],
  [
    { label: "23" },
    { label: "24" },
    { label: "25" },
    { label: "26" },
    { label: "27" },
    { label: "28", weekend: true },
    { label: "29", weekend: true },
  ],
  [
    { label: "30" },
    { label: "31" },
    { label: "1", muted: true },
    { label: "2", muted: true },
    { label: "3", muted: true },
    { label: "4", muted: true },
    { label: "5", muted: true },
  ],
]

export function DateRangeDropdown() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-10 min-w-[199px] items-center justify-center gap-1 rounded-[40px] bg-auth-background py-2 pl-4 pr-2 text-b3 text-grey-500 transition-colors hover:text-grey-1000 data-[state=open]:text-grey-1000 md:text-b2"
        >
          <span className="truncate">28 Dec 22 - 10 Jan 23</span>
          <ChevronDown
            aria-hidden="true"
            className="size-6 shrink-0 text-grey-400"
            strokeWidth={1.7}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[calc(100vw-2rem)] max-w-[437px] overflow-hidden p-0"
      >
        <div className="flex flex-col bg-white sm:flex-row">
          <div className="flex shrink-0 flex-col justify-between gap-4 px-6 py-4 sm:w-[153px] sm:pl-6 sm:pr-3">
            <div className="flex flex-wrap gap-x-4 gap-y-1 sm:flex-col sm:flex-nowrap">
              {quickRanges.map((range) => (
                <button
                  key={range}
                  type="button"
                  className="rounded-lg px-0 py-2 text-left font-caption text-sm leading-[1.4] text-grey-1000 transition-colors hover:text-date-accent md:text-base"
                >
                  {range}
                </button>
              ))}
            </div>

            <Button
              type="button"
              variant="ghost"
              className="h-auto w-fit rounded-lg px-0 py-2 font-caption text-sm font-semibold text-date-accent hover:bg-transparent hover:text-date-accent/80 md:text-base"
            >
              Reset
            </Button>
          </div>

          <div className="w-full p-4 sm:w-[284px]">
            <div className="mb-3 flex items-center gap-4 pl-2">
              <p className="min-w-0 flex-1 font-caption text-sm font-semibold leading-5 text-grey-1000 md:text-base">
                January 2023
              </p>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-full text-grey-900 hover:text-date-accent"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="size-5" strokeWidth={1.8} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-full text-grey-900 hover:text-date-accent"
                  aria-label="Next month"
                >
                  <ChevronRight className="size-5" strokeWidth={1.8} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7" aria-hidden="true">
              {weekdays.map((weekday) => (
                <div
                  key={weekday}
                  className="p-2 text-center font-caption text-sm leading-[1.4] text-grey-400 md:text-base"
                >
                  {weekday}
                </div>
              ))}
            </div>

            <div className="grid gap-0" role="grid" aria-label="January 2023">
              {calendarWeeks.map((week, weekIndex) => (
                <div
                  key={`week-${weekIndex}`}
                  className="grid grid-cols-7"
                  role="row"
                >
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${day.label}-${dayIndex}`}
                      className={cn(
                        "flex min-w-0 justify-center p-1",
                        day.range && "bg-date-range",
                        day.range === "start" && "rounded-l-[18px]",
                        day.range === "end" && "rounded-r-[18px]"
                      )}
                      role="gridcell"
                    >
                      <button
                        type="button"
                        className={cn(
                          "flex size-7 items-center justify-center rounded-[14px] font-caption text-sm leading-5 transition-colors md:text-base",
                          day.selected
                            ? "bg-date-accent font-semibold text-white"
                            : "hover:bg-date-range",
                          !day.selected &&
                            day.range === "end" &&
                            "font-semibold text-date-accent",
                          !day.selected &&
                            !day.range &&
                            !day.muted &&
                            !day.weekend &&
                            "text-grey-1000",
                          !day.selected &&
                            day.range &&
                            !day.muted &&
                            !day.weekend &&
                            "text-grey-1000",
                          !day.selected && day.weekend && "text-grey-400",
                          !day.selected && day.muted && "text-date-muted"
                        )}
                      >
                        {day.label}
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
