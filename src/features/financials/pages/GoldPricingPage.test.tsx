import { beforeEach, describe, expect, it, vi } from "vitest"
import { fireEvent, screen, waitFor, within } from "@testing-library/react"
import { renderWithProviders } from "@/test/test-utils"
import { superAdminApi } from "@/api/client"
import { profileFixture } from "@/test/rbac-fixtures"
import { GoldPricingPage } from "./GoldPricingPage"

const defaults = {
  barsPerCedi: 50,
  dailyRewardBars: 50,
  adDailyBudgetMinBars: 500,
  adDailyBudgetMaxBars: 12_500,
  adDurationsDays: [3, 7, 14, 30],
  adCpmBars: 1250,
  adMinAudience: 100,
  adFrequencyCapPerDay: 3,
  surveyRewardMinPerResponse: 2,
  surveyRewardMaxPerResponse: 5,
  surveyRewardMinBudget: 100,
  surveyRewardMaxBudget: 1_000_000,
  surveyThreeFormatsFrom: 550,
  surveyAnyFormatsFrom: 3000,
}
const settings = {
  values: defaults,
  defaults,
  updatedAt: "2026-11-04T10:00:00.000Z",
  updatedBy: { id: "a-1", email: "efua@adbox.com", name: "Efua Ansah" },
  audienceSizes: { ALL: 12450, STUDENTS: 9100, ALUMNI: 300 },
}
const stack = { id: "stack", name: "Stack", pricePesewas: 999, priceGhs: 9.99, baseBars: 500, bonusPercent: 10, bonusBars: 50, totalBars: 550, badge: null, sortOrder: 1, active: true, paidPurchases: 12 }
const week = { id: "week", name: "1 week", days: 7, priceBars: 600, badge: "Popular", sortOrder: 1, active: true, _count: { purchases: 3 } }

let permissions: string[] = ["*"]

function renderPage() {
  return renderWithProviders(<GoldPricingPage />)
}

describe("Gold & pricing", () => {
  beforeEach(() => {
    permissions = ["*"]
    vi.restoreAllMocks()
    vi.spyOn(superAdminApi, "get").mockImplementation(async (url) => {
      if (url === "/auth/me") return { data: { ...profileFixture, permissions } }
      if (url === "/gold-settings") return { data: settings }
      if (url === "/gold-bundles") return { data: [stack] }
      if (url === "/spotlight-plans") return { data: [week] }
      throw new Error("Unexpected GET " + url)
    })
  })

  it("shows the numbers, who changed them, the audiences and an example ad", async () => {
    renderPage()
    expect(await screen.findByLabelText("Bars per cedi")).toHaveValue("50")
    expect(screen.getByText(/Last changed by Efua Ansah/)).toBeInTheDocument()
    expect(screen.getByText("12,450")).toBeInTheDocument()
    // 1,500 bars a day for 7 days: 10,500 held, 8,400 views at 1,250 per
    // 1,000, reaching 2,800 (three times each) to 8,400 people.
    expect(screen.getByTestId("ad-example")).toHaveTextContent(
      "1,500 bars a day for 7 days holds 10,500 bars (GHS 210.00), buys 8,400 views and is estimated to reach 2,800–8,400 people.")
    expect(screen.getByText(/1,250 bars is GHS 25\.00 at the exchange rate/)).toBeInTheDocument()
    // Alumni hold 300: reach is held to them.
    fireEvent.click(screen.getByRole("radio", { name: /Alumni/ }))
    expect(screen.getByTestId("ad-example")).toHaveTextContent("estimated to reach 300 people — all alumni.")
    // Too few for the least an ad may target: said, not estimated.
    fireEvent.change(screen.getByLabelText("Fewest people an ad may target"), { target: { value: "500" } })
    expect(screen.getByTestId("ad-example")).toHaveTextContent("Fewer than 500 people: no ad may target alumni yet.")
    expect(screen.getByTestId("survey-summary")).toHaveTextContent("Creators pay 2–5 bars a response. 100–549 bars: one question format; 550–2,999: three; 3,000 or more: any.")
    expect(await screen.findByText("Stack")).toBeInTheDocument()
    expect(await screen.findByText("1 week")).toBeInTheDocument()
  })

  it("saves only what changed", async () => {
    const patch = vi.spyOn(superAdminApi, "patch").mockResolvedValue({
      data: { ...settings, values: { ...defaults, surveyRewardMaxPerResponse: 20, adDurationsDays: [3, 5, 7, 14, 30] } },
    })
    renderPage()
    const most = await screen.findByLabelText("Most per response")
    fireEvent.change(most, { target: { value: "20" } })
    fireEvent.change(screen.getByLabelText("Add a length in days"), { target: { value: "5" } })
    fireEvent.click(screen.getByRole("button", { name: "Add" }))
    const bar = screen.getByRole("region", { name: "Unsaved changes" })
    expect(within(bar).getByText("2 changes not saved")).toBeInTheDocument()
    expect(screen.getByTestId("survey-summary")).toHaveTextContent("Creators pay 2–20 bars a response.")
    fireEvent.click(within(bar).getByRole("button", { name: "Save changes" }))
    await waitFor(() => expect(patch).toHaveBeenCalledWith("/gold-settings", { surveyRewardMaxPerResponse: 20, adDurationsDays: [3, 5, 7, 14, 30] }))
    await waitFor(() => expect(screen.queryByRole("region", { name: "Unsaved changes" })).not.toBeInTheDocument())
  })

  it("says on the field when numbers do not hold together, and will not save", async () => {
    const patch = vi.spyOn(superAdminApi, "patch")
    renderPage()
    fireEvent.change(await screen.findByLabelText("Least per response"), { target: { value: "9" } })
    expect(screen.getByText("At least the least per response.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled()
    fireEvent.click(screen.getByRole("button", { name: "Discard" }))
    expect(screen.getByLabelText("Least per response")).toHaveValue("2")
    expect(patch).not.toHaveBeenCalled()
  })

  it("edits a bundle, showing what buyers get", async () => {
    const patch = vi.spyOn(superAdminApi, "patch").mockResolvedValue({ data: { ...stack, bonusPercent: 15, bonusBars: 75, totalBars: 575 } })
    renderPage()
    fireEvent.click(await screen.findByRole("button", { name: "Edit Stack" }))
    const dialog = await screen.findByRole("dialog")
    fireEvent.change(within(dialog).getByLabelText("Bonus (%)"), { target: { value: "15" } })
    // No bars to type: they are the price at the exchange rate.
    expect(within(dialog).queryByLabelText("Base bars")).not.toBeInTheDocument()
    expect(within(dialog).getByTestId("bundle-total")).toHaveTextContent("At GHS 1 = 50 bars, GHS 9.99 is 500 bars; with the 15% bonus, buyers get 575 bars.")
    fireEvent.change(within(dialog).getByLabelText("Price (GHS)"), { target: { value: "19.99" } })
    expect(within(dialog).getByTestId("bundle-total")).toHaveTextContent("GHS 19.99 is 1,000 bars; with the 15% bonus, buyers get 1,150 bars.")
    fireEvent.click(within(dialog).getByRole("button", { name: "Save bundle" }))
    await waitFor(() => expect(patch).toHaveBeenCalledWith("/gold-bundles/stack", {
      name: "Stack", pricePesewas: 1999, bonusPercent: 15, badge: null, sortOrder: 1, active: true,
    }))
  })

  it("shows how a new exchange rate reprices the store, and reads the bundles again after saving", async () => {
    const patch = vi.spyOn(superAdminApi, "patch").mockResolvedValue({ data: { ...settings, values: { ...defaults, barsPerCedi: 60 } } })
    renderPage()
    await screen.findByText("Stack")
    fireEvent.change(await screen.findByLabelText("Bars per cedi"), { target: { value: "60" } })
    expect(screen.getByText(/GHS 1 = 60 bars\. GHS 9\.99 buys 599 before bonuses; an exact top-up of 1,000 bars costs GHS 16\.67\./)).toBeInTheDocument()
    const preview = screen.getByTestId("reprice-preview")
    expect(preview).toHaveTextContent("Saving reprices the store at GHS 1 = 60 bars")
    expect(preview).toHaveTextContent("Stack (GHS 9.99): 550 → 659 bars")
    const gets = vi.mocked(superAdminApi.get)
    const bundleReads = () => gets.mock.calls.filter(([url]) => url === "/gold-bundles").length
    const before = bundleReads()
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
    await waitFor(() => expect(patch).toHaveBeenCalledWith("/gold-settings", { barsPerCedi: 60 }))
    await waitFor(() => expect(bundleReads()).toBeGreaterThan(before))
  })

  it("lets a reader look without changing anything", async () => {
    permissions = ["gold.settings.read"]
    renderPage()
    expect(await screen.findByLabelText("Bars per cedi")).toBeDisabled()
    expect(screen.getByText(/changing them needs gold.settings.manage/)).toBeInTheDocument()
    expect(await screen.findByText("Stack")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Add bundle" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Edit Stack" })).not.toBeInTheDocument()
    // Spotlight is its own permission.
    expect(screen.queryByText("1 week")).not.toBeInTheDocument()
  })

  it("asks for the permission when there is none", async () => {
    permissions = ["platform.users.read"]
    renderPage()
    expect(await screen.findByText(/gold.settings.read/)).toBeInTheDocument()
    expect(screen.queryByLabelText("Bars per cedi")).not.toBeInTheDocument()
  })
})
