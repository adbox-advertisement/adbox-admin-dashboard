import { beforeEach, describe, expect, it, vi } from "vitest"
import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test/test-utils"
import { getCurrentAdmin } from "../api"
import { CurrentAdminProfile } from "./CurrentAdminProfile"

vi.mock("../api", () => ({ getCurrentAdmin: vi.fn(), loginAdmin: vi.fn() }))

const admin = { id: "admin-1", email: "admin@example.com", roles: ["SUPER_ADMIN", "CONTENT_MANAGER"], permissions: ["*"] }

describe("CurrentAdminProfile", () => {
  beforeEach(() => {
    vi.mocked(getCurrentAdmin).mockReset()
  })

  it("shows the current email and readable names for every assigned role", async () => {
    vi.mocked(getCurrentAdmin).mockResolvedValue(admin)
    renderWithProviders(<CurrentAdminProfile />)

    const profile = within(screen.getByRole("group", { name: "Signed-in account" }))
    expect(await profile.findByText("admin@example.com")).toBeVisible()
    expect(profile.getByText("Super Admin, Content Manager")).toHaveTextContent("Roles: Super Admin, Content Manager")
  })

  it("shows a loading status while the profile is being fetched", () => {
    vi.mocked(getCurrentAdmin).mockImplementation(() => new Promise(() => {}))
    renderWithProviders(<CurrentAdminProfile />)

    expect(screen.getByRole("status")).toHaveTextContent("Loading account…")
    expect(screen.queryByText("Super Admin")).not.toBeInTheDocument()
  })

  it("allows a failed profile request to be retried", async () => {
    vi.mocked(getCurrentAdmin).mockRejectedValueOnce(new Error("Unavailable")).mockResolvedValueOnce(admin)
    const user = userEvent.setup()
    renderWithProviders(<CurrentAdminProfile />)

    expect(await screen.findByText("Couldn’t load account")).toBeVisible()
    await user.click(screen.getByRole("button", { name: "Retry" }))

    expect(await screen.findByText("admin@example.com")).toBeVisible()
    expect(screen.queryByText("Couldn’t load account")).not.toBeInTheDocument()
  })

  it("clearly identifies an account without an assigned role", async () => {
    vi.mocked(getCurrentAdmin).mockResolvedValue({ ...admin, roles: [] })
    renderWithProviders(<CurrentAdminProfile />)

    expect(await screen.findByText("No role assigned")).toBeVisible()
    expect(screen.getByText("admin@example.com")).toBeVisible()
  })
})
