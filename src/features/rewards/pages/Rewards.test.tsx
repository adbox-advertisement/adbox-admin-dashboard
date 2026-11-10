import { beforeEach, describe, expect, it } from "vitest"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Route, Routes } from "react-router-dom"
import { renderWithProviders } from "@/test/test-utils"
import { resetSampleRewards, sampleRewards } from "../api"
import { PartnerDetailPage } from "./PartnerDetailPage"
import { PartnersPage } from "./PartnersPage"
import { RedemptionRequestsPage } from "./RedemptionRequestsPage"
import { RewardsCatalogPage } from "./RewardsCatalogPage"
import { RewardsOverviewPage } from "./RewardsOverviewPage"

beforeEach(() => {
  sampleRewards.latency = 0
  sampleRewards.deliveryMs = 0
  resetSampleRewards()
})

describe("Rewards overview", () => {
  it("explains the flow, counts what's waiting and links to the oldest requests", async () => {
    renderWithProviders(<RewardsOverviewPage />)
    expect(screen.getByRole("region", { name: "About this page" })).toHaveTextContent("Sample data")
    expect(screen.getByRole("region", { name: "How a redemption works" })).toHaveTextContent("The partner delivers")
    expect(await screen.findByRole("button", { name: /Waiting for approval\s*10/ })).toBeInTheDocument()
    const waiting = screen.getByRole("region", { name: "Waiting for you" })
    const first = (await within(waiting).findAllByRole("link"))[1]
    expect(first).toHaveTextContent("MTN data 1.5 GB")
    expect(first).toHaveAttribute("href", "/rewards/requests?open=r-2052")
    const stock = screen.getByRole("region", { name: "Low on voucher codes" })
    expect(await within(stock).findByText("Out of codes: requests can't be approved")).toBeInTheDocument()
  })
})

describe("Redemption requests", () => {
  it("lists waiting requests oldest first and approves an all-clear one from the list", async () => {
    const user = userEvent.setup()
    renderWithProviders(<RedemptionRequestsPage />)
    const list = await screen.findByRole("list", { name: "Waiting requests" })
    expect(within(list).getAllByRole("listitem")[0]).toHaveTextContent("Fiifi Mensah")
    // Only all-clear requests can be approved without opening them.
    expect(within(list).queryByRole("button", { name: "Approve RDM-2060" })).not.toBeInTheDocument()
    await user.click(within(list).getByRole("button", { name: "Approve RDM-2061" }))
    expect(await screen.findByRole("status")).toHaveTextContent("RDM-2061 approved. MTN is sending the top-up to 024 555 0142.")
    await waitFor(() => expect(within(screen.getByRole("list", { name: "Waiting requests" })).getAllByRole("listitem")).toHaveLength(9))
  })

  it("approves every all-clear request after confirming", async () => {
    const user = userEvent.setup()
    renderWithProviders(<RedemptionRequestsPage />)
    await user.click(await screen.findByRole("button", { name: "Approve all 5" }))
    const dialog = await screen.findByRole("dialog", { name: "Approve 5 all-clear requests?" })
    await user.click(within(dialog).getByRole("button", { name: "Approve 5" }))
    expect(await screen.findByText(/Approved 5 all-clear requests/)).toBeInTheDocument()
    await waitFor(() => expect(within(screen.getByRole("list", { name: "Waiting requests" })).getAllByRole("listitem")).toHaveLength(5))
  })

  it("opens a risky request with its checks and rejects it with a reason", async () => {
    const user = userEvent.setup()
    renderWithProviders(<RedemptionRequestsPage />)
    const list = await screen.findByRole("list", { name: "Waiting requests" })
    await user.click(within(list).getByRole("button", { name: "Review RDM-2060" }))
    const sheet = await screen.findByRole("dialog", { name: "RDM-2060" })
    expect(await within(sheet).findByText("059 555 0199 is also the number on @joeb.gh.")).toBeInTheDocument()
    expect(within(sheet).getByText("Some checks found problems.")).toBeInTheDocument()
    await user.click(within(sheet).getByRole("button", { name: "Reject…" }))
    const reject = within(sheet).getByRole("button", { name: "Reject and return the gold" })
    expect(reject).toBeDisabled()
    await user.click(within(sheet).getByRole("combobox", { name: "Reason" }))
    await user.click(await screen.findByRole("option", { name: "Suspected abuse" }))
    await user.click(reject)
    // Said on the page and, while the sheet covers it, in the sheet.
    expect(await within(sheet).findByText("RDM-2060 rejected. 2,300 bars went back to @prince.b99.")).toHaveAttribute("role", "status")
    expect(await within(sheet).findByText(/Rejected by You/)).toBeInTheDocument()
    // The next waiting request is one click away.
    expect(within(sheet).getByRole("button", { name: "Next waiting request" })).toBeInTheDocument()
  })

  it("opens a request from the address and won't approve a voucher with no codes", async () => {
    const user = userEvent.setup()
    renderWithProviders(<RedemptionRequestsPage />, { initialEntries: ["/rewards/requests?open=r-2053"] })
    const sheet = await screen.findByRole("dialog", { name: "RDM-2053" })
    await user.click(await within(sheet).findByRole("button", { name: "Approve and issue code" }))
    expect(await within(sheet).findByRole("alert")).toHaveTextContent("No codes left for Melcom voucher GH₵ 20. Add codes on the partner's page first.")
  })

  it("filters by status and search", async () => {
    const user = userEvent.setup()
    renderWithProviders(<RedemptionRequestsPage />)
    await screen.findByRole("list", { name: "Waiting requests" })
    await user.click(screen.getByRole("radio", { name: /^Failed/ }))
    const failed = await screen.findByRole("list", { name: "Failed requests" })
    expect(within(failed).getAllByRole("listitem")).toHaveLength(1)
    expect(within(failed).getByText("Nii Armah")).toBeInTheDocument()
    await user.click(screen.getByRole("radio", { name: /^All/ }))
    await user.type(screen.getByRole("searchbox", { name: "Search requests" }), "prince.b99")
    // The search waits for typing to pause; give it room on a busy machine.
    await waitFor(() => expect(within(screen.getByRole("list", { name: "All requests" })).getAllByRole("listitem")).toHaveLength(2), { timeout: 3000 })
  })
})

describe("Rewards catalog", () => {
  it("switches a reward off and reprices one against the store rate", async () => {
    const user = userEvent.setup()
    renderWithProviders(<RewardsCatalogPage />)
    const toggle = await screen.findByRole("switch", { name: "MTN airtime GH₵ 5 on offer" })
    expect(toggle).toBeChecked()
    await user.click(toggle)
    await waitFor(() => expect(screen.getByRole("switch", { name: "MTN airtime GH₵ 5 on offer" })).not.toBeChecked())

    await user.click(screen.getByRole("button", { name: "Edit MTN airtime GH₵ 10" }))
    const dialog = await screen.findByRole("dialog", { name: "Edit MTN airtime GH₵ 10" })
    const price = within(dialog).getByRole("spinbutton", { name: /Price in gold bars/ })
    await user.clear(price)
    await user.type(price, "12.5")
    expect(within(dialog).getByText("Use a whole number of bars, 1 or more.")).toBeInTheDocument()
    expect(within(dialog).getByRole("button", { name: "Save" })).toBeDisabled()
    await user.clear(price)
    await user.type(price, "500")
    expect(within(dialog).getByText(/same as the face value/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole("button", { name: "Save" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(await screen.findByText("500 bars")).toBeInTheDocument()
  })

  it("filters by type", async () => {
    const user = userEvent.setup()
    renderWithProviders(<RewardsCatalogPage />)
    await screen.findByRole("list", { name: "Rewards" })
    await user.click(screen.getByRole("radio", { name: /^Vouchers/ }))
    expect(within(screen.getByRole("list", { name: "Rewards" })).getAllByRole("listitem")).toHaveLength(3)
  })
})

describe("Partners", () => {
  it("lists each partner with what AdBox owes and what needs doing", async () => {
    renderWithProviders(<PartnersPage />)
    const list = await screen.findByRole("list", { name: "Partners" })
    expect(await within(list).findByRole("link", { name: "MTN Ghana, active" })).toHaveAttribute("href", "/rewards/partners/p-mtn")
    expect(within(list).getByText("2 vouchers are low on codes")).toBeInTheDocument()
    expect(within(list).getByText("Agreement ends 31 Dec 2026")).toBeInTheDocument()
  })

  it("adds a batch of voucher codes and pauses a partner", async () => {
    const user = userEvent.setup()
    renderWithProviders(<Routes><Route path="/rewards/partners/:partnerId" element={<PartnerDetailPage />} /></Routes>, { initialEntries: ["/rewards/partners/p-melcom"] })
    expect(await screen.findByRole("heading", { name: /Melcom/, level: 1 })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Add codes for Melcom voucher GH₵ 20" }))
    const dialog = await screen.findByRole("dialog", { name: "Add codes for Melcom voucher GH₵ 20" })
    await user.type(within(dialog).getByRole("textbox", { name: "Codes" }), "MLC20-AAAA-0001{enter}MLC20-AAAA-0002{enter}MLC20-AAAA-0001")
    expect(within(dialog).getByText("2 codes (1 repeated in the list).")).toBeInTheDocument()
    await user.click(within(dialog).getByRole("button", { name: "Add 2 codes" }))
    expect(await screen.findByText("Added 2 codes to Melcom voucher GH₵ 20; 1 was a repeat and left out.")).toBeInTheDocument()
    // The GH₵ 20 voucher now has two codes, like the GH₵ 100 one.
    expect(await screen.findAllByText("2 codes left, running low")).toHaveLength(2)

    await user.click(screen.getByRole("button", { name: "Pause partner" }))
    const confirm = await screen.findByRole("dialog", { name: "Pause Melcom?" })
    await user.click(within(confirm).getByRole("button", { name: "Pause" }))
    expect(await screen.findByText(/Paused: people can't pick Melcom rewards/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Make active" })).toBeInTheDocument()
  })
})
