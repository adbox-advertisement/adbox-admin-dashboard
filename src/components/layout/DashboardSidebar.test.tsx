import { render, screen, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"
import { PermissionsContext, type PermissionAccess } from "@/lib/permissions"
import { APP_ROUTES } from "@/routes/paths"
import { DashboardSidebar } from "./DashboardSidebar"
import { NavBadgesContext } from "./nav-badges"

const superAdmin: PermissionAccess = { ready: true, granted: ["*"] }

function renderSidebar(badges: Record<string, number>, path: string = APP_ROUTES.adRequests, access: PermissionAccess = superAdmin) {
  return render(
    <PermissionsContext value={access}>
      <NavBadgesContext value={badges}>
        <MemoryRouter initialEntries={[path]}>
          <DashboardSidebar />
        </MemoryRouter>
      </NavBadgesContext>
    </PermissionsContext>,
  )
}

/** The sidebar's top-level entries, as read: sections are buttons, plain entries links. */
function topLevel() {
  const nav = screen.getByRole("navigation", { name: "Dashboard navigation" })
  return Array.from(nav.children).map((entry) => (entry.querySelector(":scope > a, :scope > button")?.textContent ?? "").trim())
}

describe("DashboardSidebar badges", () => {
  it("shows what waits behind each entry and adds it up on its section", () => {
    renderSidebar({ [APP_ROUTES.adRequests]: 3, [APP_ROUTES.reportedAds]: 2, [APP_ROUTES.recruitment]: 4 })
    const nav = within(screen.getByRole("navigation", { name: "Dashboard navigation" }))

    expect(nav.getByRole("link", { name: "Ad Requests, 3 waiting" })).toBeVisible()
    expect(nav.getByRole("link", { name: "Reported Ads, 2 waiting" })).toBeVisible()
    expect(nav.getByRole("button", { name: "Ads Management, 5 waiting" })).toBeVisible()
    expect(nav.getByRole("link", { name: "Recruitment, 4 waiting" })).toBeVisible()
  })

  it("shows a section's total even while it is folded away", () => {
    renderSidebar({ [APP_ROUTES.manageUsersPageRequests]: 1, [APP_ROUTES.manageUsersVerification]: 6 })

    expect(screen.getByRole("button", { name: "Manage Users, 7 waiting" })).toHaveAttribute("aria-expanded", "false")
  })

  it("leaves entries with nothing waiting unmarked, and caps large numbers", () => {
    renderSidebar({ [APP_ROUTES.adRequests]: 250 })

    expect(screen.getByRole("link", { name: "Ad Requests, 250 waiting" })).toHaveTextContent("99+")
    expect(screen.getByRole("link", { name: "Reported Ads" })).not.toHaveTextContent(/\d/)
    expect(screen.getByRole("button", { name: "User Content" })).toBeVisible()
  })
})

describe("DashboardSidebar groups", () => {
  // A section's sub-items, found through the button that folds them.
  const subnav = (section: RegExp) => {
    const id = screen.getByRole("button", { name: section }).getAttribute("aria-controls")
    return within(document.getElementById(id ?? "") as HTMLElement)
  }

  it("lists Manage Users under Directory and To review, with Overview on its own", () => {
    renderSidebar({ [APP_ROUTES.manageUsersVerification]: 2 }, APP_ROUTES.manageUsersVerification)
    const users = subnav(/^Manage Users/)

    const directory = within(users.getByRole("group", { name: "Directory" }))
    expect(directory.getAllByRole("link").map((link) => link.textContent)).toEqual(["People", "Institutions", "Companies"])
    const review = within(users.getByRole("group", { name: "To review" }))
    expect(review.getAllByRole("link").map((link) => link.getAttribute("aria-label") ?? link.textContent))
      .toEqual(["Verification, 2 waiting", "Business requests", "Page requests", "Honours"])
    expect(review.getByRole("link", { name: "Verification, 2 waiting" })).toHaveAttribute("aria-current", "page")
    expect(users.getByRole("link", { name: "Overview" }).closest("[role=group]")).toBeNull()
  })

  it("keeps User Content open on a page without its own entry, and lists no Ads there", () => {
    renderSidebar({}, APP_ROUTES.userContentAds)
    expect(screen.getByRole("button", { name: /^User Content/ })).toHaveAttribute("aria-expanded", "true")
    const content = subnav(/^User Content/)
    expect(within(content.getByRole("group", { name: "Content" })).getAllByRole("link").map((link) => link.textContent)).toEqual(["Posts", "Surveys"])
    expect(within(content.getByRole("group", { name: "To review" })).getAllByRole("link").map((link) => link.textContent)).toEqual(["Reports"])
    expect(content.queryByRole("link", { name: "Ads" })).not.toBeInTheDocument()
  })
})

describe("DashboardSidebar access", () => {
  it("offers an ads reviewer the ads, how sponsored posts are placed, and what anyone may open", () => {
    renderSidebar({}, APP_ROUTES.adRequests, { ready: true, granted: ["ads.read", "ads.review", "ads.manage"] })

    expect(topLevel()).toEqual(["Dashboard", "Algorithms", "Ads Management", "Settings"])
    expect(screen.getByRole("link", { name: "Ad Requests" })).toBeVisible()
    expect(screen.queryByRole("button", { name: /^Manage Users/ })).not.toBeInTheDocument()
  })

  it("keeps only the parts of a section the admin may open", () => {
    renderSidebar({}, APP_ROUTES.manageUsersVerification, { ready: true, granted: ["verification.read", "verification.review"] })

    const id = screen.getByRole("button", { name: /^Manage Users/ }).getAttribute("aria-controls")
    const users = within(document.getElementById(id ?? "") as HTMLElement)
    expect(users.getAllByRole("link").map((link) => link.textContent)).toEqual(["Verification"])
    expect(users.queryByRole("group", { name: "Directory" })).not.toBeInTheDocument()
  })

  it("adds up waiting work only behind entries the admin can see", () => {
    renderSidebar(
      { [APP_ROUTES.manageUsersVerification]: 2, [APP_ROUTES.manageUsersPageRequests]: 5 },
      APP_ROUTES.dashboard,
      { ready: true, granted: ["verification.read"] },
    )
    expect(screen.getByRole("button", { name: "Manage Users, 2 waiting" })).toBeVisible()
  })

  it("shows only what anyone may open until the admin's permissions are known", () => {
    renderSidebar({}, APP_ROUTES.dashboard, { ready: false, granted: [] })
    expect(topLevel()).toEqual(["Dashboard", "Settings"])
  })
})
