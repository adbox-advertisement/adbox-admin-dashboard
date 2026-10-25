import { describe, expect, it, vi } from "vitest"
import { superAdminApi } from "@/api/client"
import { getChatReports, getContentReports, getUserAds, getUserPost, getUserPosts, removeUserPost, resolveChatReport, resolveContentReport, restoreUserPost, setUserSurveyActive } from "./api"
import { adFixtures, chatReportDetailFixture, chatReportFixtures, contentPage, contentReportDetailFixture, contentReportFixtures, postFixtures, surveyFixtures } from "@/test/content-fixtures"

describe("User Content API contracts", () => {
  it("lists posts with only the filters that are set", async () => {
    const get = vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: contentPage(postFixtures) })
    await getUserPosts({ mediaType: "VIDEO", state: "live", search: " tour ", userId: undefined })
    expect(get).toHaveBeenCalledWith("/user-content/posts", { params: { mediaType: "VIDEO", state: "live", search: "tour", page: 1, limit: 20 }, signal: undefined })
  })

  it("lists ads for one uploader", async () => {
    const get = vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: contentPage(adFixtures) })
    await getUserAds({ userId: postFixtures[0].user.id, status: "ACTIVE" })
    expect(get).toHaveBeenCalledWith("/user-content/ads", { params: { userId: postFixtures[0].user.id, status: "ACTIVE", page: 1, limit: 20 }, signal: undefined })
  })

  it("removes a post with a trimmed reason and restores without a body", async () => {
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: postFixtures[0] })
    await removeUserPost({ postId: postFixtures[0].id, input: { reason: " spam " } })
    expect(post).toHaveBeenCalledWith(`/user-content/posts/${postFixtures[0].id}/remove`, { reason: "spam" })
    await restoreUserPost(postFixtures[0].id)
    expect(post).toHaveBeenLastCalledWith(`/user-content/posts/${postFixtures[0].id}/restore`)
  })

  it("deactivates and reactivates surveys through separate endpoints", async () => {
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: surveyFixtures[0] })
    await setUserSurveyActive({ surveyId: surveyFixtures[0].id, active: false, input: {} })
    expect(post).toHaveBeenCalledWith(`/user-content/surveys/${surveyFixtures[0].id}/deactivate`, {})
    await setUserSurveyActive({ surveyId: surveyFixtures[0].id, active: true, input: {} })
    expect(post).toHaveBeenLastCalledWith(`/user-content/surveys/${surveyFixtures[0].id}/reactivate`, {})
  })

  it("loads one post and lists every format when no type is set", async () => {
    const get = vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: postFixtures[0] })
    await getUserPost(postFixtures[0].id)
    expect(get).toHaveBeenCalledWith(`/user-content/posts/${postFixtures[0].id}`, { signal: undefined })
    get.mockResolvedValue({ data: contentPage(postFixtures) })
    await getUserPosts({ state: "live", limit: 8 })
    expect(get).toHaveBeenLastCalledWith("/user-content/posts", { params: { state: "live", page: 1, limit: 8 }, signal: undefined })
  })

  it("asks for open reports by default and filters by reason", async () => {
    const get = vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: contentPage(contentReportFixtures) })
    await getContentReports({ reason: "SPAM" })
    expect(get).toHaveBeenCalledWith("/user-content/reports", { params: { status: "OPEN", reason: "SPAM", page: 1, limit: 20 }, signal: undefined })
    get.mockResolvedValue({ data: contentPage(chatReportFixtures) })
    await getChatReports({ status: "DISMISSED" })
    expect(get).toHaveBeenLastCalledWith("/user-content/chat-reports", { params: { status: "DISMISSED", page: 1, limit: 20 }, signal: undefined })
  })

  it("resolves reports with only the fields that are set", async () => {
    const post = vi.spyOn(superAdminApi, "post").mockResolvedValue({ data: contentReportDetailFixture })
    await resolveContentReport({ reportId: contentReportFixtures[0].id, input: { outcome: "ACTION_TAKEN", removeContent: true, note: "" } })
    expect(post).toHaveBeenCalledWith(`/user-content/reports/${contentReportFixtures[0].id}/resolve`, { outcome: "ACTION_TAKEN", removeContent: true })
    post.mockResolvedValue({ data: chatReportDetailFixture })
    await resolveChatReport({ reportId: chatReportFixtures[0].id, input: { outcome: "DISMISSED", note: "Not a scam" } })
    expect(post).toHaveBeenLastCalledWith(`/user-content/chat-reports/${chatReportFixtures[0].id}/resolve`, { outcome: "DISMISSED", note: "Not a scam" })
  })
})
