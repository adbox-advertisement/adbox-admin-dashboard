import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test/test-utils"
import { LoginPage } from "./LoginPage"

const navigateSpy = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>()
  return { ...actual, useNavigate: () => navigateSpy }
})

vi.mock("../api", () => ({
  loginAdmin: vi.fn(),
}))

import { loginAdmin } from "../api"

describe("LoginPage", () => {
  beforeEach(() => {
    navigateSpy.mockClear()
    vi.mocked(loginAdmin).mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("submits the trimmed email and password, then navigates to the dashboard on success", async () => {
    vi.mocked(loginAdmin).mockResolvedValue({ accessToken: "token-123" })
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    await user.type(screen.getByPlaceholderText("email@adbox.com"), "  admin@example.com  ")
    await user.type(screen.getByPlaceholderText("Your Password"), "password123")
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    await waitFor(() => expect(loginAdmin).toHaveBeenCalledWith("admin@example.com", "password123"))
    await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith("/dashboard", { replace: true }))
  })

  it("shows an error message and does not navigate when login fails", async () => {
    vi.mocked(loginAdmin).mockRejectedValue(new Error("Invalid credentials"))
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    await user.type(screen.getByPlaceholderText("email@adbox.com"), "admin@example.com")
    await user.type(screen.getByPlaceholderText("Your Password"), "wrong-password")
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(/sign in failed/i)
    expect(navigateSpy).not.toHaveBeenCalled()
  })

  it("disables the submit button and shows a signing-in state while pending", async () => {
    let resolveLogin!: (value: { accessToken: string }) => void
    vi.mocked(loginAdmin).mockImplementation(() => new Promise((resolve) => { resolveLogin = resolve }))
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    await user.type(screen.getByPlaceholderText("email@adbox.com"), "admin@example.com")
    await user.type(screen.getByPlaceholderText("Your Password"), "password123")
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    expect(await screen.findByRole("button", { name: "Signing in…" })).toBeDisabled()
    resolveLogin({ accessToken: "token-123" })
    await waitFor(() => expect(navigateSpy).toHaveBeenCalled())
  })
})
