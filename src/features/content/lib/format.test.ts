import { describe, expect, it } from "vitest"
import { campaignProgress, formatBytes, formatDuration, initials } from "./format"

describe("content formatting", () => {
  it("formats video durations", () => {
    expect(formatDuration(null)).toBeNull()
    expect(formatDuration(65)).toBe("1:05")
    expect(formatDuration(3725)).toBe("1:02:05")
  })

  it("formats file sizes", () => {
    expect(formatBytes(512)).toBe("512 B")
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB")
  })

  it("builds initials", () => {
    expect(initials("Ama Kofi Mensah")).toBe("AM")
    expect(initials("")).toBe("?")
  })
})

describe("campaignProgress", () => {
  const start = "2026-10-01T00:00:00.000Z"
  const end = "2026-10-08T00:00:00.000Z"

  it("reports the day and share elapsed while running", () => {
    expect(campaignProgress(start, end, Date.parse("2026-10-03T12:00:00.000Z"))).toEqual({ share: 2.5 / 7, day: 3, totalDays: 7, daysLeft: 5 })
  })

  it("clamps before the start and after the end", () => {
    expect(campaignProgress(start, end, Date.parse("2026-09-01T00:00:00.000Z"))).toMatchObject({ share: 0, day: 0, daysLeft: 7 })
    expect(campaignProgress(start, end, Date.parse("2026-11-01T00:00:00.000Z"))).toMatchObject({ share: 1, day: 7, daysLeft: 0 })
  })
})
