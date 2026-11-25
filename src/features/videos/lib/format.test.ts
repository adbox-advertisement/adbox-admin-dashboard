import { describe, expect, it } from "vitest"
import { accountName, groupDates, groupTiming, initials, postKind, postState } from "./format"

describe("studio wording", () => {
  it("names an account by its name, else its username", () => {
    expect(accountName({ fullName: "Legon Hall Week", username: "legon.hallweek" })).toBe("Legon Hall Week")
    expect(accountName({ fullName: " ", username: "legon.hallweek" })).toBe("@legon.hallweek")
    expect(accountName({ fullName: null, username: null })).toBe("Unnamed account")
    expect(initials("Legon Hall Week")).toBe("LH")
    expect(initials("@pent")).toBe("PE")
  })

  it("says where a group is in its dates", () => {
    const now = new Date("2026-11-16T12:00:00Z")
    expect(groupTiming({ startsAt: null, endsAt: null }, now)).toBe("OPEN")
    expect(groupTiming({ startsAt: "2026-11-20T00:00:00Z", endsAt: null }, now)).toBe("UPCOMING")
    expect(groupTiming({ startsAt: "2026-11-14T00:00:00Z", endsAt: "2026-11-20T00:00:00Z" }, now)).toBe("LIVE")
    expect(groupTiming({ startsAt: null, endsAt: "2026-11-01T00:00:00Z" }, now)).toBe("ENDED")
  })

  it("writes a group's dates briefly", () => {
    expect(groupDates({ startsAt: "2026-11-14T10:00:00", endsAt: "2026-11-20T10:00:00" })).toBe("14–20 Nov 2026")
    expect(groupDates({ startsAt: "2026-11-28T10:00:00", endsAt: "2026-12-02T10:00:00" })).toBe("28 Nov – 2 Dec 2026")
    expect(groupDates({ startsAt: "2026-11-14T10:00:00", endsAt: null })).toBe("From 14 Nov 2026")
    expect(groupDates({ startsAt: null, endsAt: null })).toBeNull()
  })

  it("names a post's kind and where it stands", () => {
    expect(postKind({ type: "VIDEO", isShort: true })).toBe("SHORT")
    expect(postKind({ type: "IMAGE", isShort: false })).toBe("PICTURES")
    expect(postState({ status: "PROCESSING", video: null })).toEqual({ label: "Processing", tone: "warning" })
    expect(postState({ status: "PUBLIC", video: { duration: 30, aspectRatio: 0.56, transcodingStatus: "FAILED" } })).toEqual({ label: "Processing failed", tone: "danger" })
    expect(postState({ status: "PRIVATE", video: null }).label).toBe("Only the account")
  })
})
