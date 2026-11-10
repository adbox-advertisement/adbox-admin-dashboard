import { beforeEach, describe, expect, it } from "vitest"
import { getSupportSummary, getTicket, getTickets, replyToTicket, resetSampleDesk, sampleDesk, updateTicket } from "./api"

beforeEach(() => {
  sampleDesk.latency = 0
  resetSampleDesk()
})

describe("the sample help desk service", () => {
  it("lists a view, filtered by topic and by any words in the conversation", async () => {
    const gold = await getTickets({ view: "all", sort: "newest", category: "gold" })
    expect(gold.every((ticket) => ticket.category === "gold")).toBe(true)
    const momo = await getTickets({ view: "all", sort: "urgency", search: "momo" })
    expect(momo.map((ticket) => ticket.reference)).toEqual(expect.arrayContaining(["SUP-1048", "SUP-1042"]))
    // Internal notes never show in a list preview.
    const ads = await getTickets({ view: "all", sort: "urgency", search: "SUP-1045" })
    expect(ads[0].preview).not.toMatch(/cheapest in Accra/)
  })

  it("moves a reply to waiting on the customer, or resolves it, and takes it if nobody had it", async () => {
    const before = await getTicket("t-1047")
    expect(before.assigneeId).toBeNull()
    const replied = await replyToTicket({ id: "t-1047", input: { body: "We've secured your account.", internal: false } })
    expect(replied).toMatchObject({ status: "pending", replyDueAt: null, assigneeId: "agent-me" })
    await replyToTicket({ id: "t-1046", input: { body: "Approved now.", internal: false, resolve: true } })
    expect((await getTicket("t-1046")).status).toBe("resolved")
  })

  it("keeps a ticket's status for an internal note, and refuses an empty message", async () => {
    await replyToTicket({ id: "t-1044", input: { body: "Probably the 100 MB limit.", internal: true } })
    const ticket = await getTicket("t-1044")
    expect(ticket.status).toBe("open")
    expect(ticket.messages[ticket.messages.length - 1]).toMatchObject({ internal: true, author: "agent" })
    await expect(replyToTicket({ id: "t-1044", input: { body: "   ", internal: false } })).rejects.toThrow("Write a message first")
  })

  it("recounts its figures as conversations change", async () => {
    const before = await getSupportSummary()
    await updateTicket({ id: "t-1047", update: { assigneeId: "agent-esi" } })
    const after = await getSupportSummary()
    expect(after.unassigned).toBe(before.unassigned - 1)
    expect(after.viewCounts.all).toBe(16)
  })

  it("restarts the reply clock when a ticket is reopened", async () => {
    const reopened = await updateTicket({ id: "t-1038", update: { status: "open" } })
    expect(reopened.status).toBe("open")
    expect(new Date(reopened.replyDueAt!).getTime()).toBeGreaterThan(Date.now())
  })
})
