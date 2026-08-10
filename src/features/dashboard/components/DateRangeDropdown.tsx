import { useState } from "react"
import {
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns"
import { ChevronDown } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type PickerMode = "range" | "single"

function getThisWeekRange() {
  const today = new Date()

  return {
    from: startOfWeek(today, { weekStartsOn: 1 }),
    to: endOfWeek(today, { weekStartsOn: 1 }),
  } satisfies DateRange
}

const quickRanges = [
  {
    label: "Today",
    getRange: () => {
      const today = new Date()
      return { from: today, to: today }
    },
  },
  {
    label: "This Week",
    getRange: getThisWeekRange,
  },
  {
    label: "Last week",
    getRange: () => {
      const lastWeek = subWeeks(new Date(), 1)
      return {
        from: startOfWeek(lastWeek, { weekStartsOn: 1 }),
        to: endOfWeek(lastWeek, { weekStartsOn: 1 }),
      }
    },
  },
  {
    label: "Last month",
    getRange: () => {
      const lastMonth = subMonths(new Date(), 1)
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      }
    },
  },
  {
    label: "Last quarter",
    getRange: () => {
      const today = new Date()
      return {
        from: startOfMonth(subMonths(today, 3)),
        to: endOfMonth(subMonths(today, 1)),
      }
    },
  },
]

function formatRange(range: DateRange) {
  if (!range.from) {
    return "Select date range"
  }

  if (!range.to || range.from.toDateString() === range.to.toDateString()) {
    return format(range.from, "dd MMM yy")
  }

  return `${format(range.from, "dd MMM yy")} - ${format(range.to, "dd MMM yy")}`
}

function formatDate(date: Date | undefined) {
  if (!date) {
    return "Select day"
  }

  return format(date, "dd MMM yy")
}

function rangesMatch(left: DateRange, right: DateRange) {
  if (!left.from || !right.from) {
    return false
  }

  const leftTo = left.to ?? left.from
  const rightTo = right.to ?? right.from

  return isSameDay(left.from, right.from) && isSameDay(leftTo, rightTo)
}

const baseCalendarClassNames = {
  root: "w-full",
  months: "relative flex w-full flex-col gap-0",
  month: "flex w-full flex-col gap-0",
  nav: "absolute right-0 top-0 flex items-center justify-end gap-0",
  button_previous:
    "size-9 rounded-full bg-transparent p-0 text-grey-900 hover:bg-transparent hover:text-date-accent",
  button_next:
    "size-9 rounded-full bg-transparent p-0 text-grey-900 hover:bg-transparent hover:text-date-accent",
  month_caption: "mb-3 flex h-9 w-full items-center justify-start px-2",
  caption_label:
    "font-caption text-sm font-semibold leading-5 text-grey-1000 md:text-base",
  month_grid: "w-full border-collapse",
  weekdays: "grid grid-cols-7",
  weekday:
    "p-2 text-center font-caption text-sm font-normal leading-[1.4] text-grey-400 md:text-base",
  week: "mt-0 grid grid-cols-7",
  selected: "text-grey-1000",
  outside: "text-date-muted aria-selected:text-date-muted",
  disabled: "text-date-muted opacity-50",
  today: "text-grey-1000",
}

const rangeCalendarClassNames = {
  ...baseCalendarClassNames,
  day: "relative flex min-w-0 justify-center rounded-none p-1 data-[range-middle=true]:bg-date-range data-[range-start=true]:rounded-l-[18px] data-[range-start=true]:bg-date-range data-[range-end=true]:rounded-r-[18px] data-[range-end=true]:bg-date-range",
  day_button:
    "flex size-7 min-w-7 items-center justify-center rounded-[14px] font-caption text-sm font-normal leading-5 text-grey-1000 transition-colors hover:bg-date-range md:text-base data-[range-middle=true]:bg-transparent data-[range-middle=true]:text-grey-1000 data-[range-start=true]:bg-date-accent data-[range-start=true]:font-semibold data-[range-start=true]:text-white data-[range-end=true]:bg-date-accent data-[range-end=true]:font-semibold data-[range-end=true]:text-white",
  range_start: "rounded-l-[18px] bg-date-range",
  range_middle: "rounded-none bg-date-range",
  range_end: "rounded-r-[18px] bg-date-range",
}

const singleCalendarClassNames = {
  ...baseCalendarClassNames,
  day: "relative flex min-w-0 justify-center rounded-none p-1",
  day_button:
    "flex size-7 min-w-7 items-center justify-center rounded-[14px] font-caption text-sm font-normal leading-5 text-grey-1000 transition-colors hover:bg-date-range md:text-base data-[selected-single=true]:bg-date-accent data-[selected-single=true]:font-semibold data-[selected-single=true]:text-white",
}

export function DateRangeDropdown() {
  const [pickerMode, setPickerMode] = useState<PickerMode>("range")
  const [selectedRange, setSelectedRange] =
    useState<DateRange>(() => getThisWeekRange())
  const [selectedDay, setSelectedDay] = useState(() => new Date())
  const [month, setMonth] = useState(() => new Date())

  const selectQuickRange = (range: DateRange) => {
    setPickerMode("range")
    setSelectedRange(range)

    if (range.to) {
      setMonth(range.to)
      return
    }

    if (range.from) {
      setMonth(range.from)
    }
  }

  const selectDaysOnly = () => {
    const day = selectedDay ?? selectedRange.from ?? new Date()

    setPickerMode("single")
    setSelectedDay(day)
    setMonth(day)
  }

  const selectRange = (range: DateRange | undefined) => {
    if (!range) {
      setSelectedRange({ from: undefined, to: undefined })
      return
    }

    if (range.from && range.to && isSameDay(range.from, range.to)) {
      setSelectedRange({ from: range.from, to: undefined })
      return
    }

    setSelectedRange(range)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-10 min-w-[199px] items-center justify-center gap-1 rounded-[40px] bg-auth-background py-2 pl-4 pr-2 text-b3 text-grey-500 transition-colors hover:text-grey-1000 data-[state=open]:text-grey-1000 md:text-b2"
        >
          <span className="truncate">
            {pickerMode === "single"
              ? formatDate(selectedDay)
              : formatRange(selectedRange)}
          </span>
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
              {quickRanges.map((range) => {
                const rangeValue = range.getRange()
                const isActive =
                  pickerMode === "range" && rangesMatch(selectedRange, rangeValue)

                return (
                  <button
                    key={range.label}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => selectQuickRange(rangeValue)}
                    className={cn(
                      "rounded-lg px-0 py-2 text-left font-caption text-sm leading-[1.4] text-grey-1000 transition-colors hover:text-date-accent md:text-base",
                      isActive && "font-semibold text-date-accent",
                    )}
                  >
                    {range.label}
                  </button>
                )
              })}
              <button
                type="button"
                aria-pressed={pickerMode === "single"}
                onClick={selectDaysOnly}
                className={cn(
                  "rounded-lg px-0 py-2 text-left font-caption text-sm leading-[1.4] text-grey-1000 transition-colors hover:text-date-accent md:text-base",
                  pickerMode === "single" && "font-semibold text-date-accent",
                )}
              >
                Days only
              </button>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={() => selectQuickRange(getThisWeekRange())}
              className="h-auto w-fit rounded-lg px-0 py-2 font-caption text-sm font-semibold text-date-accent hover:bg-transparent hover:text-date-accent/80 md:text-base"
            >
              Reset
            </Button>
          </div>

          <div className="w-full p-4 sm:w-[284px]">
            {pickerMode === "single" ? (
              <Calendar
                mode="single"
                month={month}
                onMonthChange={setMonth}
                selected={selectedDay}
                onSelect={(day) => {
                  if (!day) {
                    return
                  }

                  setSelectedDay(day)
                  setMonth(day)
                }}
                defaultMonth={new Date()}
                showOutsideDays
                weekStartsOn={1}
                numberOfMonths={1}
                className="w-full bg-white p-0 [--cell-radius:18px] [--cell-size:2.25rem]"
                classNames={singleCalendarClassNames}
              />
            ) : (
              <Calendar
                mode="range"
                month={month}
                onMonthChange={setMonth}
                selected={selectedRange}
                onSelect={selectRange}
                defaultMonth={new Date()}
                showOutsideDays
                weekStartsOn={1}
                numberOfMonths={1}
                className="w-full bg-white p-0 [--cell-radius:18px] [--cell-size:2.25rem]"
                classNames={rangeCalendarClassNames}
              />
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
