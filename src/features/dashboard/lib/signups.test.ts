import { describe, expect, it } from "vitest"
import { busiestBar, changeWords, daysToFetch, niceScale, rangeWindow, signupBars, signupSummary } from "./signups"

const NOW = new Date("2026-11-15T10:00:00Z")
const day = (iso: string) => Date.parse(`${iso}T00:00:00Z`)
const points = [
  { date: "2026-09-16", joined: 9 }, // before the 30 days compared with
  { date: "2026-09-17", joined: 4 }, // first day compared with
  { date: "2026-10-16", joined: 5 }, // last day compared with
  { date: "2026-10-17", joined: 1 }, // first of the 30 days
  { date: "2026-11-01", joined: 3 },
  { date: "2026-11-15", joined: 2 }, // today
]

describe("sign-up ranges", () => {
  it("ends every range today, and compares it with the span before", () => {
    expect(rangeWindow("30d", NOW)).toEqual({ start: day("2026-10-17"), today: day("2026-11-15"), previousStart: day("2026-09-17"), previousEnd: day("2026-10-16") })
    expect(rangeWindow("12w", NOW)).toEqual({ start: day("2026-08-24"), today: day("2026-11-15"), previousStart: day("2026-06-01"), previousEnd: day("2026-08-23") })
    // Twelve calendar months, this one so far, against the same dates a year earlier.
    expect(rangeWindow("12m", NOW)).toEqual({ start: day("2025-12-01"), today: day("2026-11-15"), previousStart: day("2024-12-01"), previousEnd: day("2025-11-15") })
    expect(daysToFetch("30d", NOW)).toBe(60)
    expect(daysToFetch("12w", NOW)).toBe(168)
    expect(daysToFetch("12m", NOW)).toBe(715)
  })

  it("counts a UTC day as Ghana does, wherever the browser is", () => {
    expect(rangeWindow("30d", new Date("2026-11-15T23:59:00Z")).today).toBe(day("2026-11-15"))
    expect(rangeWindow("30d", new Date("2026-11-16T00:01:00Z")).today).toBe(day("2026-11-16"))
  })
})

describe("sign-up bars", () => {
  it("draws a bar a day for 30 days, today still running", () => {
    const bars = signupBars(points, "30d", NOW)
    expect(bars).toHaveLength(30)
    expect(bars[0]).toEqual({ key: "2026-10-17", joined: 1, label: "17 Oct", period: "Sat 17 Oct", partial: false })
    expect(bars[29]).toEqual({ key: "2026-11-15", joined: 2, label: "15 Nov", period: "Sun 15 Nov", partial: true })
    expect(bars.reduce((sum, bar) => sum + bar.joined, 0)).toBe(6)
  })

  it("groups twelve weeks ending today", () => {
    const bars = signupBars(points, "12w", NOW)
    expect(bars).toHaveLength(12)
    expect(bars[0]).toMatchObject({ key: "2026-08-24", period: "24–30 Aug", partial: false })
    expect(bars[1]).toMatchObject({ period: "31 Aug – 6 Sep" })
    expect(bars[11]).toMatchObject({ key: "2026-11-09", period: "9–15 Nov", joined: 2, partial: true })
  })

  it("groups twelve calendar months, naming the year where it turns", () => {
    const bars = signupBars(points, "12m", NOW)
    expect(bars.map((bar) => bar.label)).toEqual(["Dec 25", "Jan 26", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"])
    expect(bars[11]).toMatchObject({ period: "November 2026", joined: 5, partial: true })
    expect(bars[10]).toMatchObject({ period: "October 2026", joined: 6, partial: false })
  })
})

describe("sign-up summary", () => {
  it("compares the range with the span before it", () => {
    const summary = signupSummary(points, "30d", NOW)
    expect(summary).toMatchObject({ total: 6, previous: 9, perDay: 0.2 })
    expect(changeWords(summary)).toBe("−33%")
    expect(changeWords({ total: 12, previous: 10, change: 0.2 })).toBe("+20%")
    expect(changeWords({ total: 5, previous: 0, change: null })).toBe("Up from none")
    expect(changeWords({ total: 0, previous: 0, change: null })).toBe("No change")
  })

  it("names the busiest bar only when one leads", () => {
    expect(busiestBar(signupBars(points, "12m", NOW))?.period).toBe("September 2026")
    expect(busiestBar(signupBars([], "30d", NOW))).toBeNull()
    expect(busiestBar(signupBars([{ date: "2026-11-14", joined: 2 }, { date: "2026-11-15", joined: 2 }], "30d", NOW))).toBeNull()
  })

  it("puts round numbers on the axis", () => {
    expect(niceScale(0)).toEqual({ top: 4, ticks: [0, 2, 4] })
    expect(niceScale(3)).toEqual({ top: 3, ticks: [0, 1, 2, 3] })
    expect(niceScale(7)).toEqual({ top: 8, ticks: [0, 2, 4, 6, 8] })
    expect(niceScale(26)).toEqual({ top: 30, ticks: [0, 10, 20, 30] })
  })
})
