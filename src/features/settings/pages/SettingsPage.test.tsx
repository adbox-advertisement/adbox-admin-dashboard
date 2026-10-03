import { afterEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, redirect, RouterProvider } from "react-router-dom"
import { WorkspaceTheme } from "@/components/layout/WorkspaceTheme"
import { APP_ROUTES } from "@/routes/paths"
import { SettingsPage } from "./SettingsPage"

function renderSettings(logout = vi.fn(() => redirect(APP_ROUTES.login))) {
  const router = createMemoryRouter([
    { path: APP_ROUTES.settings, Component: SettingsPage },
    { path: APP_ROUTES.logout, action: logout },
    { path: APP_ROUTES.login, element: <h1>Sign in</h1> },
  ], { initialEntries: [APP_ROUTES.settings] })
  render(<WorkspaceTheme><RouterProvider router={router} /></WorkspaceTheme>)
  return { logout, router }
}

afterEach(() => {
  localStorage.removeItem("adbox-theme")
  document.documentElement.classList.remove("dark", "light")
})

describe("Settings appearance", () => {
  it("offers one keyboard-accessible button that updates the theme and current-mode label", async () => {
    const user = userEvent.setup()
    renderSettings()
    const appearance = within(screen.getByRole("region", { name: "Appearance" }))
    expect(appearance.getAllByRole("button")).toHaveLength(1)
    expect(appearance.getByRole("status")).toHaveTextContent("Light mode is on")
    await user.tab()
    expect(appearance.getByRole("button", { name: "Switch to dark mode" })).toHaveFocus()
    await user.keyboard("{Enter}")
    await waitFor(() => expect(document.documentElement).toHaveClass("dark"))
    expect(appearance.getByRole("status")).toHaveTextContent("Dark mode is on")
    expect(localStorage.getItem("adbox-theme")).toBe("dark")
    await user.click(appearance.getByRole("button", { name: "Switch to light mode" }))
    expect(appearance.getByRole("status")).toHaveTextContent("Light mode is on")
    expect(localStorage.getItem("adbox-theme")).toBe("light")
  })

  it("reflects a previously saved choice when Settings opens", async () => {
    localStorage.setItem("adbox-theme", "dark")
    renderSettings()
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Dark mode is on"))
    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeVisible()
  })

  it("logs out from the Account section", async () => {
    const user = userEvent.setup()
    const { logout, router } = renderSettings()
    const account = within(screen.getByRole("region", { name: "Account" }))
    await user.click(account.getByRole("button", { name: "Log Out" }))
    await screen.findByRole("heading", { name: "Sign in" })
    expect(logout).toHaveBeenCalledOnce()
    expect(router.state.location.pathname).toBe(APP_ROUTES.login)
  })
})
