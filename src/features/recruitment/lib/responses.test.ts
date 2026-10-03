import { describe, expect, it } from "vitest"
import { recruitmentApplication } from "@/test/recruitment-fixtures"
import { emailDraftUrl, responseDraft } from "./responses"

describe("candidate response drafts", () => {
  it("includes the reference and editable interview details without copying internal notes", () => {
    const application = { ...recruitmentApplication, internalNote: "Private assessment" }
    const draft = responseDraft(application, "interview")
    expect(draft.subject).toContain(recruitmentApplication.reference)
    expect(draft.body).toContain("[Add date, time and time zone]")
    expect(draft.body).not.toContain("Private assessment")
  })
  it("encodes recipient, subject, and message rather than allowing extra mail parameters", () => {
    const url = emailDraftUrl("test+one@example.com?bcc=other", "Hello\r\nBcc: other", "Message & test\nNext line")
    expect(url).toContain("test%2Bone%40example.com%3Fbcc%3Dother")
    expect(url).not.toContain("%0D%0A")
    expect(new URLSearchParams(url.split("?")[1]).get("body")).toBe("Message & test\nNext line")
  })
})
