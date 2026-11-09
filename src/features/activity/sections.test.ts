import { describe, expect, it } from "vitest"
import { APP_ROUTES } from "@/routes/paths"
import { activityBadges } from "./sections"
import { activityCountsSchema } from "./types"

describe("activityBadges", () => {
  it("puts each queue's waiting work on its sidebar entry", () => {
    expect(activityBadges({ adRequests: 3, reportedAds: 1, contentReports: 2, recruitment: 4 })).toEqual({
      [APP_ROUTES.adRequests]: 3,
      [APP_ROUTES.reportedAds]: 1,
      [APP_ROUTES.userContentReports]: 2,
      [APP_ROUTES.recruitment]: 4,
    })
  })

  it("gives empty, hidden or unloaded queues no badge", () => {
    expect(activityBadges({ adRequests: 0, verification: 0 })).toEqual({})
    expect(activityBadges(undefined)).toEqual({})
  })
})

describe("activityCountsSchema", () => {
  it("accepts the queues the admin may see and refuses anything else", () => {
    expect(activityCountsSchema.parse({ honours: 2 })).toEqual({ honours: 2 })
    expect(() => activityCountsSchema.parse({ honours: -1 })).toThrow()
    expect(() => activityCountsSchema.parse({ somethingElse: 1 })).toThrow()
  })
})
