import { beforeEach, describe, expect, it } from "vitest"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test/test-utils"
import { resetSampleDesk, sampleDesk } from "../api"
import { SupportPage } from "./SupportPage"

describe("Support", () => {
  beforeEach(() => {
    sampleDesk.latency = 0
    resetSampleDesk()
  })

  it("says it runs on sample data and shows what needs a reply first", async () => {
    renderWithProviders(<SupportPage />)
    expect(screen.getByRole("region", { name: "About this page" })).toHaveTextContent("Sample data")
    const figures = screen.getByRole("region", { name: "Support at a glance" })
    expect(await within(figures).findByText("9")).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: /^Needs reply/ })).toHaveAttribute("aria-checked", "true")
    const list = await screen.findByRole("list", { name: "Tickets" })
    // Most overdue first.
    expect(within(list).getAllByRole("button")[0]).toHaveAccessibleName(/Campus badge disappeared/)
  })

  it("switches views and searches every message", async () => {
    const user = userEvent.setup()
    renderWithProviders(<SupportPage />)
    await screen.findByRole("list", { name: "Tickets" })
    await user.click(screen.getByRole("radio", { name: /^Waiting on customer/ }))
    await waitFor(() => expect(within(screen.getByRole("list", { name: "Tickets" })).getAllByRole("button")).toHaveLength(3))
    await user.click(screen.getByRole("radio", { name: /^All/ }))
    await user.type(screen.getByRole("searchbox", { name: "Search conversations" }), "jollof")
    // The search waits for typing to pause; give it room on a busy machine.
    await waitFor(() => expect(within(screen.getByRole("list", { name: "Tickets" })).getAllByRole("button")).toHaveLength(1), { timeout: 3000 })
  })

  it("opens a conversation, fills a saved reply and sends it to waiting on the customer", async () => {
    const user = userEvent.setup()
    renderWithProviders(<SupportPage />)
    const list = await screen.findByRole("list", { name: "Tickets" })
    await user.click(within(list).getByRole("button", { name: /Paid for 500 gold bars/ }))
    const conversation = await screen.findByRole("region", { name: /Conversation: Paid for 500 gold bars/ })
    expect(within(conversation).getByText("momo-receipt.jpg")).toBeInTheDocument()
    await user.click(within(conversation).getByRole("combobox", { name: "Insert a saved reply" }))
    await user.click(await screen.findByRole("option", { name: "Ask for the Mobile Money transaction ID" }))
    expect((within(conversation).getByRole("textbox", { name: "Reply to Kofi" }) as HTMLTextAreaElement).value).toMatch(/^Hi Kofi,\n\nThanks for letting us know/)
    await user.click(within(conversation).getByRole("button", { name: "Send reply" }))
    await waitFor(() => expect(within(conversation).getAllByText(/Mobile Money transaction ID/).length).toBeGreaterThan(0))
    // The status tag and the Status control both say so.
    expect((await within(conversation).findAllByText("Waiting on customer")).length).toBeGreaterThan(0)
    expect(within(conversation).getByRole("textbox", { name: "Reply to Kofi" })).toHaveValue("")
  })

  it("keeps an internal note from changing the status, and asks for words first", async () => {
    const user = userEvent.setup()
    renderWithProviders(<SupportPage />)
    const list = await screen.findByRole("list", { name: "Tickets" })
    await user.click(within(list).getByRole("button", { name: /Video upload keeps failing/ }))
    const conversation = await screen.findByRole("region", { name: /Conversation: Video upload/ })
    await user.click(within(conversation).getByRole("radio", { name: "Internal note" }))
    await user.click(within(conversation).getByRole("button", { name: "Add note" }))
    expect(within(conversation).getByRole("alert")).toHaveTextContent("Write the note first.")
    await user.type(within(conversation).getByRole("textbox", { name: "Internal note" }), "Likely the size limit.")
    await user.click(within(conversation).getByRole("button", { name: "Add note" }))
    expect(await within(conversation).findByText("Likely the size limit.")).toBeInTheDocument()
    expect(within(conversation).getAllByText("Needs reply").length).toBeGreaterThan(0)
  })

  it("moves through the list with J and K", async () => {
    const user = userEvent.setup()
    renderWithProviders(<SupportPage />)
    const list = await screen.findByRole("list", { name: "Tickets" })
    const buttons = within(list).getAllByRole("button")
    await user.keyboard("j")
    await waitFor(() => expect(buttons[0]).toHaveAttribute("aria-current", "true"))
    await user.keyboard("j")
    await waitFor(() => expect(buttons[1]).toHaveAttribute("aria-current", "true"))
    await user.keyboard("k")
    await waitFor(() => expect(buttons[0]).toHaveAttribute("aria-current", "true"))
  })
})
