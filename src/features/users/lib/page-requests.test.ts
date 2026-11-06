import { describe, expect, it } from "vitest"
import { accountAge, checksSummary, groupInitials, letterChecks, usernameFormatProblem, waitingFor } from "./page-requests"
import { usernameHint } from "./requests"

const now = new Date("2026-10-31T12:00:00")

describe("page requests", () => {
  it("draws a group's initials from brackets, capitals, then first letters", () => {
    expect(groupInitials("Catholic Students' Union (CSU)")).toBe("CSU")
    expect(groupInitials("Commonwealth Hall JCR")).toBe("JCR")
    expect(groupInitials("GMSA, UCC")).toBe("GMSA")
    expect(groupInitials("Faculty of Engineering")).toBe("FE")
  })

  it("says how long a request waited and how old the account is", () => {
    expect(waitingFor("2026-10-30T10:42:00", now)).toBe("1 day")
    expect(waitingFor("2026-10-26T10:42:00", now)).toBe("5 days")
    expect(waitingFor("2026-10-31T08:00:00", now)).toBe("today")
    expect(accountAge("2025-08-31T12:00:00", now)).toBe("1 yr")
    expect(accountAge("2026-02-28T12:00:00", now)).toBe("8 mo")
    expect(accountAge("2026-10-10T12:00:00", now)).toBe("3 weeks")
  })

  it("sums up the checks as the queue shows them, worst first", () => {
    const ok = { tone: "ok" as const, text: "No page for this group yet." }
    const similar = { tone: "look" as const, short: "Similar name", text: "Similar name: @ugcatholics." }
    const noLetter = { tone: "problem" as const, short: "No letter", text: "No letter of proof was attached." }
    const newAccount = { tone: "problem" as const, short: "new account", text: "On AdBox 3 weeks." }
    expect(checksSummary([ok, similar])).toEqual({ tone: "look", label: "Similar name" })
    expect(checksSummary([ok])).toEqual({ tone: "ok", label: "All clear" })
    expect(checksSummary([similar, noLetter, newAccount])).toEqual({ tone: "problem", label: "No letter · new account" })
  })

  it("names the requester in the letter checks", () => {
    expect(letterChecks("Kwame Asante").map((check) => check.label)).toContain("Names Kwame Asante as allowed to run the page")
  })

  it("checks a page username as the app and the backend do", () => {
    expect(usernameFormatProblem("ug.csu")).toBeNull()
    expect(usernameFormatProblem("ug")).toBe("At least 3 characters.")
    expect(usernameFormatProblem("UG.CSU")).toBe("Only lower-case letters, numbers, dots and underscores.")
    expect(usernameFormatProblem("ug..csu")).toBe("A dot can't start or end it, or follow another dot.")
  })

  it("says what the username field should: the rules, then the server's answer", () => {
    const base = { cleaned: "ug.csu", requested: "ug.csu", formatProblem: null, failed: false }
    expect(usernameHint({ ...base, answer: undefined })).toEqual({ error: null, hint: "Checking…" })
    expect(usernameHint({ ...base, answer: { available: true, reason: null } }).hint).toBe("What they asked for. Available.")
    expect(usernameHint({ ...base, cleaned: "ug.csu.legon", answer: { available: true, reason: null } }).hint).toBe("Available.")
    expect(usernameHint({ ...base, answer: { available: false, reason: "That username is taken." } }).error).toBe("That username is taken.")
    expect(usernameHint({ ...base, formatProblem: "At least 3 characters.", answer: undefined }).error).toBe("At least 3 characters.")
    expect(usernameHint({ ...base, answer: undefined, failed: true }).hint).toMatch(/approving checks again/)
  })
})
