import { describe, expect, it } from "vitest"
import { meetsRequirement } from "@/lib/permissions"
import { APP_ROUTES } from "@/routes/paths"
import { navItems } from "./navigation"
import { pageRequirements, visibleNavItems } from "./navigation-access"

const canFor = (granted: readonly string[]) => (requirement?: Parameters<typeof meetsRequirement>[1]) => meetsRequirement(granted, requirement)

/** The sidebar as labels: sections, and each section's entries. */
const sidebarFor = (granted: readonly string[]) =>
  visibleNavItems(navItems, canFor(granted)).map((item) => item.children ? `${item.label}: ${item.children.map((child) => child.label).join(", ")}` : item.label)

/** Whether an admin holding [granted] may open [pathname]. */
const opens = (granted: readonly string[], pathname: string) =>
  pageRequirements(navItems, pathname).every((requirement) => meetsRequirement(granted, requirement))

describe("visibleNavItems", () => {
  it("shows the Super Admin everything", () => {
    expect(visibleNavItems(navItems, canFor(["*"]))).toEqual(navItems)
  })

  it("shows an ads reviewer the ads, how sponsored posts are placed, and what anyone may open", () => {
    expect(sidebarFor(["ads.read", "ads.review", "ads.manage"])).toEqual([
      "Dashboard",
      "Algorithms: Sponsored posts",
      "Ads Management: Ad Requests, Reported Ads",
      "Settings",
    ])
  })

  it("keeps only the parts of a section the admin may open", () => {
    expect(sidebarFor(["verification.read", "verification.review", "payments.read"])).toEqual([
      "Dashboard",
      "Manage Users: Verification",
      "Financials: Advertisers Payment, Withdrawals",
      "Settings",
    ])
  })

  it("opens an Algorithms explainer to anyone who may read either kind of live setting", () => {
    expect(sidebarFor(["discover.read"])).toContain(
      "Algorithms: Overview, Home & videos, Discover, Top trends, Trending overrides, All parameters",
    )
    expect(sidebarFor(["feed.ranking.read"])).toContain(
      "Algorithms: Overview, Home & videos, Sponsored posts, Discover, Ranked feed, All parameters",
    )
  })

  it("keeps RDI, and pages on sample data, to the Super Admin", () => {
    const everythingButTheWildcard = ["platform.users.read", "user.content.read", "ads.read", "payments.read", "recruitment.applications.read", "rdi.cms.read"]
    expect(sidebarFor(everythingButTheWildcard).join(" | ")).not.toMatch(/RDI|Rewards|Support/)
  })
})

describe("pageRequirements", () => {
  it("opens a page, and the pages under it, on its entry's terms", () => {
    expect(opens(["ads.read"], APP_ROUTES.adRequests)).toBe(true)
    expect(opens(["companies.read"], APP_ROUTES.adRequests)).toBe(false)
    expect(opens(["platform.users.read"], `${APP_ROUTES.manageUsersPeople}/u-1`)).toBe(true)
    expect(opens(["verification.read"], `${APP_ROUTES.manageUsersPeople}/u-1`)).toBe(false)
  })

  it("opens a section's own page to anyone who may open one of its parts", () => {
    // Manage Users then sends a verification reviewer on to Verification.
    expect(opens(["verification.read"], APP_ROUTES.manageUsers)).toBe(true)
    expect(opens(["ads.read"], APP_ROUTES.manageUsers)).toBe(false)
  })

  it("opens a page with no entry of its own on its section's terms", () => {
    expect(opens(["user.content.read"], APP_ROUTES.userContentAds)).toBe(true)
    expect(opens(["ads.read"], APP_ROUTES.userContentAds)).toBe(false)
  })

  it("asks nothing for the pages everyone may open", () => {
    expect(pageRequirements(navItems, APP_ROUTES.dashboard)).toEqual([])
    expect(pageRequirements(navItems, APP_ROUTES.settings)).toEqual([])
  })

  it("keeps every RDI page to the Super Admin", () => {
    for (const path of [APP_ROUTES.rdi, `${APP_ROUTES.rdi}/website/media`, `${APP_ROUTES.rdi}/library`]) {
      expect(opens(["*"], path)).toBe(true)
      expect(opens(["rdi.cms.read", "ads.read"], path)).toBe(false)
    }
  })
})
