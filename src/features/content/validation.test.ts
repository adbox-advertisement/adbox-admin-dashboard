import { describe, expect, it } from "vitest"
import { adSchema, chatReportDetailSchema, contentReportDetailSchema, postSchema, resolveContentReportSchema, surveySchema } from "./validation"
import { adFixtures, chatReportDetailFixture, contentReportDetailFixture, postFixtures, surveyFixtures } from "@/test/content-fixtures"

describe("User Content schemas", () => {
  it("maps engagement counts and removal state onto posts", () => {
    const post = postSchema.parse({ ...postFixtures[0], deleteStatus: "DELETED" })
    expect(post).toMatchObject({ removed: true, counts: { views: 1500, likes: 12 } })
    expect(post).not.toHaveProperty("_count")
  })

  it("drops non-http media URLs instead of rendering them", () => {
    const post = postSchema.parse(postFixtures[1])
    expect(post.imgResources[1].imageUrl).toBeNull()
    expect(post.imgResources[0].imageUrl).toBe("https://cdn.example.com/i/1.jpg")
  })

  it("tolerates unknown statuses from a newer backend", () => {
    expect(postSchema.parse({ ...postFixtures[0], status: "SHADOWBANNED" }).status).toBeNull()
    expect(adSchema.parse({ ...adFixtures[0], status: "ARCHIVED" }).status).toBeNull()
  })

  it("keeps a malformed ad creative from failing the whole list", () => {
    expect(adSchema.parse({ ...adFixtures[0], content: "not-an-object" }).content).toEqual({})
  })

  it("flattens a survey's owner and counts", () => {
    expect(surveySchema.parse(surveyFixtures[0])).toMatchObject({ user: { id: surveyFixtures[0].resource.user.id }, questionCount: 4, responseCount: 41, post: { removed: false } })
  })

  it("reads a reported post and marks it removed once it's no longer active", () => {
    const report = contentReportDetailSchema.parse({ ...contentReportDetailFixture, target: { ...contentReportDetailFixture.target, post: { ...contentReportDetailFixture.target.post, deleteStatus: "DELETED" } } })
    expect(report.target).toMatchObject({ type: "POST", post: { removed: true } })
    expect(contentReportDetailSchema.parse({ ...contentReportDetailFixture, target: null }).target).toBeNull()
  })

  it("puts a reported message after the context that led up to it", () => {
    const { snapshot } = chatReportDetailSchema.parse(chatReportDetailFixture)
    expect(snapshot.messages.map((message) => message.text)).toEqual(["Hi, what prize?", "Send your PIN to claim the prize"])
    expect(snapshot.reportedMessageId).toBe("6650f0c2a1b2c3d4e5f60002")
    expect(snapshot.messages[0].attachments).toBe(1)
  })

  it("reads a conversation snapshot and survives a malformed one", () => {
    const conversation = { type: "GROUP", members: [], messages: [chatReportDetailFixture.snapshot.reported] }
    expect(chatReportDetailSchema.parse({ ...chatReportDetailFixture, targetType: "CONVERSATION", snapshot: conversation }).snapshot).toMatchObject({ conversationType: "GROUP", reportedMessageId: null, messages: [{ text: "Send your PIN to claim the prize" }] })
    expect(chatReportDetailSchema.parse({ ...chatReportDetailFixture, snapshot: "broken" }).snapshot.messages).toEqual([])
  })

  it("only lets content be removed when action is taken", () => {
    expect(resolveContentReportSchema.safeParse({ outcome: "DISMISSED", removeContent: true }).success).toBe(false)
    expect(resolveContentReportSchema.parse({ outcome: "ACTION_TAKEN", removeContent: true, note: " ok " })).toEqual({ outcome: "ACTION_TAKEN", removeContent: true, note: "ok" })
  })
})
