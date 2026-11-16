import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import type { PermissionAccess, PermissionRequirement } from "@/lib/permissions"
import { PageGate } from "./PageGate"

function renderGate(requirements: PermissionRequirement[], access: PermissionAccess, failed = false, onRetry = () => {}) {
  return render(
    <MemoryRouter>
      <PageGate requirements={requirements} access={access} failed={failed} onRetry={onRetry}>
        <p>The page</p>
      </PageGate>
    </MemoryRouter>,
  )
}

describe("PageGate", () => {
  it("opens a page that needs nothing at once, before the permissions are known", () => {
    renderGate([], { ready: false, granted: [] })
    expect(screen.getByText("The page")).toBeInTheDocument()
  })

  it("opens a page whose every requirement is met", () => {
    renderGate(["ads.read", ["feed.ranking.read", "discover.read"]], { ready: true, granted: ["ads.read", "discover.read"] })
    expect(screen.getByText("The page")).toBeInTheDocument()
  })

  it("says the page is closed, and what would open it, when one is not", () => {
    renderGate(["platform.users.read"], { ready: true, granted: ["ads.read"] })

    expect(screen.queryByText("The page")).not.toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "You don’t have access to this page" })).toBeInTheDocument()
    expect(screen.getByRole("list", { name: "Permissions it needs" })).toHaveTextContent("platform.users.read")
    expect(screen.getByRole("link", { name: "Back to Dashboard" })).toHaveAttribute("href", "/dashboard")
  })

  it("names a Super Admin, not a permission, for a page only they may open", () => {
    renderGate(["*"], { ready: true, granted: ["ads.read"] })
    expect(screen.getByText("Only a Super Admin can open it.")).toBeInTheDocument()
    expect(screen.queryByRole("list", { name: "Permissions it needs" })).not.toBeInTheDocument()
  })

  it("waits for the permissions without showing the page", () => {
    renderGate(["ads.read"], { ready: false, granted: [] })
    expect(screen.getByRole("status")).toHaveTextContent("Checking your access…")
    expect(screen.queryByText("The page")).not.toBeInTheDocument()
  })

  it("stays closed when the permissions could not be read, and can try again", async () => {
    const onRetry = vi.fn()
    renderGate(["ads.read"], { ready: false, granted: [] }, true, onRetry)

    expect(screen.queryByText("The page")).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Try again" }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
