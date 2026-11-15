import { format } from "date-fns"
import type { Signups } from "../types"
import { formatCount } from "./figures"

// Sign-ups over time (GET /platform-users/signups). The server counts by UTC day, which is Ghana's
// day all year, so every date here is a UTC day too, whatever the browser's time zone.

const DAY_MS = 86_400_000

export type SignupRange = "30d" | "12w" | "12m"

export const SIGNUP_RANGES: ReadonlyArray<{ key: SignupRange; label: string; span: string; previous: string; bucket: string }> = [
  { key: "30d", label: "30 days", span: "the last 30 days", previous: "the 30 days before", bucket: "day" },
  { key: "12w", label: "12 weeks", span: "the last 12 weeks", previous: "the 12 weeks before", bucket: "week" },
  { key: "12m", label: "12 months", span: "the last 12 months", previous: "the same months a year earlier", bucket: "month" },
]

export const rangeInfo = (range: SignupRange) => SIGNUP_RANGES.find((item) => item.key === range) ?? SIGNUP_RANGES[0]

const dayOf = (at: Date) => Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate())
const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10)
const daysFrom = (from: number, to: number) => Math.round((to - from) / DAY_MS) + 1

/**
 * The days a range covers (ending today) and the span it is compared with: the 30 days or 12 weeks
 * just before, or for twelve calendar months (this one so far) the same dates a year earlier.
 */
export function rangeWindow(range: SignupRange, now: Date) {
  const today = dayOf(now)
  if (range === "30d") return { start: today - 29 * DAY_MS, today, previousStart: today - 59 * DAY_MS, previousEnd: today - 30 * DAY_MS }
  if (range === "12w") return { start: today - 83 * DAY_MS, today, previousStart: today - 167 * DAY_MS, previousEnd: today - 84 * DAY_MS }
  const at = new Date(today)
  const [year, month, date] = [at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate()]
  return { start: Date.UTC(year, month - 11, 1), today, previousStart: Date.UTC(year, month - 23, 1), previousEnd: Date.UTC(year - 1, month, date) }
}

/** How many days to ask the server for: back to the start of the span compared with. */
export function daysToFetch(range: SignupRange, now: Date) {
  const { previousStart, today } = rangeWindow(range, now)
  return daysFrom(previousStart, today)
}

/** A UTC day as a local date, so it formats as the same calendar day anywhere. */
const calendarDay = (ms: number) => {
  const at = new Date(ms)
  return new Date(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate())
}

export type SignupBar = {
  key: string
  joined: number
  /** Under the bar: "16 Oct", "6 Oct", "Nov". */
  label: string
  /** In the tooltip and the table: "Thu 16 Oct", "6–12 Oct", "November 2026". */
  period: string
  /** Still running: today, this week or this month. */
  partial: boolean
}

/** The range's bars, oldest first: days, weeks ending today, or calendar months (this one so far). */
export function signupBars(points: Signups["points"], range: SignupRange, now: Date): SignupBar[] {
  const { start, today } = rangeWindow(range, now)
  const joinedOn = new Map(points.map((point) => [point.date, point.joined]))
  const sum = (from: number, to: number) => {
    let total = 0
    for (let at = from; at <= to; at += DAY_MS) total += joinedOn.get(isoDay(at)) ?? 0
    return total
  }
  if (range === "30d") {
    return Array.from({ length: 30 }, (_, index) => {
      const at = start + index * DAY_MS
      return { key: isoDay(at), joined: sum(at, at), label: format(calendarDay(at), "d MMM"), period: format(calendarDay(at), "EEE d MMM"), partial: at === today }
    })
  }
  if (range === "12w") {
    return Array.from({ length: 12 }, (_, index) => {
      const from = start + index * 7 * DAY_MS
      const to = from + 6 * DAY_MS
      const [first, last] = [calendarDay(from), calendarDay(to)]
      const period = first.getMonth() === last.getMonth() ? `${format(first, "d")}–${format(last, "d MMM")}` : `${format(first, "d MMM")} – ${format(last, "d MMM")}`
      return { key: isoDay(from), joined: sum(from, to), label: format(first, "d MMM"), period, partial: to >= today }
    })
  }
  const at = new Date(today)
  return Array.from({ length: 12 }, (_, index) => {
    const from = Date.UTC(at.getUTCFullYear(), at.getUTCMonth() - 11 + index, 1)
    const to = Math.min(Date.UTC(at.getUTCFullYear(), at.getUTCMonth() - 10 + index, 0), today)
    const first = calendarDay(from)
    return { key: isoDay(from), joined: sum(from, to), label: format(first, first.getMonth() === 0 || index === 0 ? "MMM yy" : "MMM"), period: format(first, "MMMM yyyy"), partial: index === 11 }
  })
}

/** The bar with the most sign-ups, when one leads on its own; a tie names none. */
export function busiestBar(bars: SignupBar[]) {
  const most = Math.max(0, ...bars.map((bar) => bar.joined))
  const leaders = bars.filter((bar) => bar.joined === most)
  return most > 0 && leaders.length === 1 ? leaders[0] : null
}

/** The range's total, the span it is compared with, and the change between them. */
export function signupSummary(points: Signups["points"], range: SignupRange, now: Date) {
  const window = rangeWindow(range, now)
  const joinedOn = new Map(points.map((point) => [point.date, point.joined]))
  const sum = (from: number, to: number) => {
    let total = 0
    for (let at = from; at <= to; at += DAY_MS) total += joinedOn.get(isoDay(at)) ?? 0
    return total
  }
  const total = sum(window.start, window.today)
  const previous = sum(window.previousStart, window.previousEnd)
  return {
    total,
    previous,
    /** null when nobody joined in the span compared with. */
    change: previous > 0 ? (total - previous) / previous : null,
    perDay: total / daysFrom(window.start, window.today),
  }
}

/** "+18%", "−5%", "No change", or "Up from none" when nobody joined before. */
export function changeWords(summary: { total: number; previous: number; change: number | null }) {
  if (summary.change === null) return summary.total > 0 ? "Up from none" : "No change"
  const percent = Math.round(summary.change * 100)
  if (percent === 0) return "No change"
  return `${percent > 0 ? "+" : "−"}${formatCount(Math.abs(percent))}%`
}

/** Round numbers for the y-axis: a top a little above the highest bar, in 1, 2 or 5 steps. */
export function niceScale(max: number) {
  if (max <= 0) return { top: 4, ticks: [0, 2, 4] }
  const rough = max / 4
  const power = 10 ** Math.floor(Math.log10(rough))
  const step = [1, 2, 5, 10].map((factor) => factor * power).find((candidate) => candidate >= rough) ?? 10 * power
  const whole = Math.max(1, step)
  const top = Math.ceil(max / whole) * whole
  return { top, ticks: Array.from({ length: Math.round(top / whole) + 1 }, (_, index) => index * whole) }
}
