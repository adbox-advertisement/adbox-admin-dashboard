import { afterEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { WorkspaceTheme } from "./WorkspaceTheme"
import { ThemeToggle } from "./ThemeToggle"

afterEach(() => {
  localStorage.removeItem("adbox-theme")
  localStorage.removeItem("adbox-recruitment-theme")
  document.documentElement.classList.remove("dark", "light")
})

describe("application appearance", () => {
  it("persists the theme across feature changes and sign-in remounts", async () => {
    const user = userEvent.setup()
    const view = render(<WorkspaceTheme><ThemeToggle /><span>Recruitment</span></WorkspaceTheme>)
    await user.click(screen.getByRole("button", { name: "Switch to dark mode" }))
    await waitFor(() => expect(document.documentElement).toHaveClass("dark"))
    expect(localStorage.getItem("adbox-theme")).toBe("dark")
    view.rerender(<WorkspaceTheme><ThemeToggle /><span>Dashboard</span></WorkspaceTheme>)
    expect(document.documentElement).toHaveClass("dark")
    view.unmount()
    render(<WorkspaceTheme><ThemeToggle /><span>Sign in</span></WorkspaceTheme>)
    expect(document.documentElement).toHaveClass("dark")
    await user.click(screen.getByRole("button", { name: "Switch to light mode" }))
    expect(localStorage.getItem("adbox-theme")).toBe("light")
  })
  it("migrates the existing recruitment preference", async () => {
    localStorage.setItem("adbox-recruitment-theme", "dark")
    render(<WorkspaceTheme><ThemeToggle /></WorkspaceTheme>)
    await waitFor(() => expect(document.documentElement).toHaveClass("dark"))
    expect(localStorage.getItem("adbox-theme")).toBe("dark")
  })
  it("prioritizes the global preference and synchronizes other tabs", async () => {
    localStorage.setItem("adbox-recruitment-theme", "dark")
    localStorage.setItem("adbox-theme", "light")
    render(<WorkspaceTheme><ThemeToggle /></WorkspaceTheme>)
    await waitFor(() => expect(document.documentElement).toHaveClass("light"))
    window.dispatchEvent(new StorageEvent("storage", { key: "adbox-theme", newValue: "dark" }))
    await waitFor(() => expect(document.documentElement).toHaveClass("dark"))
  })
  it("allows switching when browser storage is unavailable", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Storage unavailable") })
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage unavailable") })
    const user = userEvent.setup()
    render(<WorkspaceTheme><ThemeToggle /></WorkspaceTheme>)
    await user.click(screen.getByRole("button", { name: "Switch to dark mode" }))
    await waitFor(() => expect(document.documentElement).toHaveClass("dark"))
  })
})
