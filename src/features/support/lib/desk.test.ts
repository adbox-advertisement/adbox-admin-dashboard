import { describe, expect, it } from "vitest"
import { buildSampleDesk, ME } from "../data/sample-desk"
import type { Ticket } from "../types"
import { ago, compareTickets, duration, fillReply, inView, slaState } from "./desk"

const NOW = Date.UTC(2026, 10, 10, 12, 0)
const { tickets } = buildSampleDesk(NOW)
const ticket = (reference: string) => tickets.find((item) => item.reference === reference)!

describe("help desk views", () => {
  it("files each conversation where an agent expects it", () => {
    const refs = (view: Parameters<typeof inView>[1]) => tickets.filter((item) => inView(item, view)).map((item) => item.reference)
    expect(refs("needs-reply")).toContain("SUP-1048")
    expect(refs("needs-reply")).not.toContain("SUP-1042")
    expect(refs("waiting")).toEqual(expect.arrayContaining(["SUP-1042", "SUP-1041", "SUP-1035"]))
    expect(refs("unassigned")).toContain("SUP-1047")
    expect(refs("mine").every((ref) => ticket(ref).assigneeId === ME && ticket(ref).status !== "resolved")).toBe(true)
    expect(refs("high-priority").every((ref) => ["urgent", "high"].includes(ticket(ref).priority))).toBe(true)
    expect(refs("resolved")).not.toContain("SUP-1048")
    expect(refs("all")).toHaveLength(tickets.length)
  })

  it("puts the most overdue reply first, then waiting, then resolved", () => {
    const sorted = [...tickets].sort(compareTickets("urgency"))
    const firstWaiting = sorted.findIndex((item) => item.status === "pending")
    expect(sorted.slice(0, firstWaiting).every((item) => item.status === "open")).toBe(true)
    const dues = sorted.slice(0, firstWaiting).map((item) => new Date(item.replyDueAt!).getTime())
    expect(dues).toEqual([...dues].sort((a, b) => a - b))
    expect(sorted[sorted.length - 1].status).toBe("resolved")
  })
})

describe("reply deadlines", () => {
  const open = (minutesFromNow: number): Pick<Ticket, "status" | "replyDueAt"> => ({ status: "open", replyDueAt: new Date(NOW + minutesFromNow * 60_000).toISOString() })

  it("counts down, warns in the last hour, and says how late a reply is", () => {
    expect(slaState(open(200), NOW)).toEqual({ tone: "ok", label: "Reply due in 3h 20m" })
    expect(slaState(open(25), NOW)).toEqual({ tone: "soon", label: "Reply due in 25m" })
    expect(slaState(open(-70), NOW)).toEqual({ tone: "overdue", label: "Overdue by 1h 10m" })
    expect(slaState({ status: "pending", replyDueAt: null }, NOW)).toBeNull()
  })

  it("gives the sample's urgent gold ticket an hour from the customer's message", () => {
    expect(slaState(ticket("SUP-1048"), NOW)).toEqual({ tone: "soon", label: "Reply due in 10m" })
  })

  it("writes short durations and ages", () => {
    expect(duration(45)).toBe("45m")
    expect(duration(120)).toBe("2h")
    expect(duration(60 * 50)).toBe("2d 2h")
    expect(ago(new Date(NOW - 3 * 3_600_000).toISOString(), NOW)).toBe("3h ago")
    expect(ago(new Date(NOW).toISOString(), NOW)).toBe("just now")
  })
})

it("fills a saved reply with the customer's first name", () => {
  expect(fillReply("Hi {first}, thanks {first}!", "Kofi Mensah")).toBe("Hi Kofi, thanks Kofi!")
})
