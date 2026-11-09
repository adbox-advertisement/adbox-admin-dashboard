import { render, screen, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"
import { APP_ROUTES } from "@/routes/paths"
import { DashboardSidebar } from "./DashboardSidebar"
import { NavBadgesContext } from "./nav-badges"

function renderSidebar(badges: Record<string, number>, path: string = APP_ROUTES.adRequests) {
  return render(
    <NavBadgesContext value={badges}>
      <MemoryRouter initialEntries={[path]}>
        <DashboardSidebar />
      </MemoryRouter>
    </NavBadgesContext>,
  )
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
