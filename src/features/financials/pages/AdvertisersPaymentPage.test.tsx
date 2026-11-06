import { beforeEach, describe, expect, it, vi } from "vitest"
import { fireEvent, screen, waitFor, within } from "@testing-library/react"
import { renderWithProviders } from "@/test/test-utils"
import { superAdminApi } from "@/api/client"
import { profileFixture } from "@/test/rbac-fixtures"
import { AdvertisersPaymentPage } from "./AdvertisersPaymentPage"

const buyer = { id: "u-1", name: "Abena Mensah", username: "abena.mensah", email: "abena@example.com" }
const page = {
  items: [
    { id: "p-1", status: "PAID", bundleId: null, bundleName: "1,450 gold bars", pricePesewas: 2900, priceGhs: 29, totalBars: 1450, currency: "GHS", channel: "MOMO", providerReference: "gold-p-1", failureReason: null, paidAt: "2026-11-05T06:32:25.629Z", createdAt: "2026-11-05T06:30:00.000Z", buyer },
    { id: "p-2", status: "FAILED", bundleId: "stack", bundleName: "Stack", pricePesewas: 999, priceGhs: 9.99, totalBars: 550, currency: "GHS", channel: "CARD", providerReference: "gold-p-2", failureReason: "Declined by the bank", paidAt: null, createdAt: "2026-11-04T06:30:00.000Z", buyer },
  ],
  total: 2, page: 1, limit: 25,
  paid: { count: 23, totalGhs: 2485.77, totalBars: 160900 },
  counts: { PAID: 23, FAILED: 7, PENDING: 6 },
}

let permissions: string[] = ["*"]

describe("Advertisers Payment", () => {
  beforeEach(() => {
    permissions = ["*"]
    vi.restoreAllMocks()
    vi.spyOn(superAdminApi, "get").mockImplementation(async (url) => {
      if (url === "/auth/me") return { data: { ...profileFixture, permissions } }
      if (url === "/gold-purchases") return { data: page }
      throw new Error("Unexpected GET " + url)
    })
  })

  it("shows what came in, each payment, and filters by status", async () => {
    renderWithProviders(<AdvertisersPaymentPage />)
    expect(await screen.findByText("GHS 2,485.77")).toBeInTheDocument()
    expect(screen.getByText("160,900")).toBeInTheDocument()
    const payments = screen.getByRole("list", { name: "Payments" })
    expect(within(payments).getByText(/Exact top-up · Mobile Money/)).toBeInTheDocument()
    expect(within(payments).getByText("GHS 29.00")).toBeInTheDocument()
    expect(within(payments).getByText("Declined by the bank")).toBeInTheDocument()
    fireEvent.click(within(screen.getByRole("group", { name: "Payment status" })).getByRole("button", { name: /Failed\s*7/ }))
    await waitFor(() => expect(vi.mocked(superAdminApi.get)).toHaveBeenCalledWith("/gold-purchases", expect.objectContaining({ params: expect.objectContaining({ status: "FAILED" }) })))
  })

  it("needs payments.read", async () => {
    permissions = ["ads.read"]
    renderWithProviders(<AdvertisersPaymentPage />)
    expect(await screen.findByText("You don't have access to payments")).toBeInTheDocument()
  })
})
