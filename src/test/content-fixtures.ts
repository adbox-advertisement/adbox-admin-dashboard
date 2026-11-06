// Raw backend shapes for User Content tests (before schema transforms).
export const uploaderFixture = {
  id: "60000000-0000-4000-8000-000000000001",
  isActive: true,
  userProfile: { fullName: "Ama Mensah", username: "ama", email: "ama@example.com", image: null },
}

const counts = { likes: 12, comments: 3, views: 1500, shares: 2, surveys: 1 }

export const postFixtures = [
  {
    id: "80000000-0000-4000-8000-000000000001", title: "Campus tour", description: "A walk around Legon", mediaType: "VIDEO", status: "PUBLIC", deleteStatus: "ACTIVE",
    publicSlug: "campus-tour", createdAt: "2026-10-01T10:00:00.000Z", updatedAt: "2026-10-01T10:00:00.000Z", user: uploaderFixture, imgResources: [],
    videoResource: { hlsUrl: "https://cdn.example.com/hls/1/master.m3u8", mp4Url: "https://cdn.example.com/v/1.mp4", duration: 95, size: 5242880, resolution: "1080p", uploadStatus: "UPLOADED", transcodingStatus: "COMPLETED", thumbnail: { imageUrl: "https://cdn.example.com/t/1.jpg", previewImageUrl: null } },
    _count: counts,
  },
  {
    id: "80000000-0000-4000-8000-000000000002", title: null, description: "Graduation day", mediaType: "IMAGE", status: "PRIVATE", deleteStatus: "ACTIVE",
    publicSlug: null, createdAt: "2026-09-30T10:00:00.000Z", updatedAt: "2026-09-30T10:00:00.000Z", user: uploaderFixture,
    imgResources: [
      { id: "81000000-0000-4000-8000-000000000001", imageUrl: "https://cdn.example.com/i/1.jpg", previewImageUrl: "https://cdn.example.com/i/1-s.jpg", width: 800, height: 600 },
      { id: "81000000-0000-4000-8000-000000000002", imageUrl: "javascript:alert(1)", previewImageUrl: null, width: null, height: null },
    ],
    videoResource: null, _count: { ...counts, surveys: 0 },
  },
]

export const adFixtures = [{
  id: "90000000-0000-4000-8000-000000000001", type: "EVENT", name: "Freshers' night", goal: "REACH", audience: "STUDENTS", dailyBudgetBars: 500, durationDays: 7,
  budgetBars: 3500, cpmBars: 1250, chargedBars: 1250, returnedBars: 0, status: "ACTIVE", startsAt: "2026-10-01T00:00:00.000Z", endsAt: "2026-10-08T00:00:00.000Z", cancelledAt: null,
  content: { headline: "Freshers' night is here", body: "Join us", destinationUrl: "https://example.com/event", eventLocation: "Great Hall", imageUrls: ["https://cdn.example.com/a/1.jpg"] },
  createdAt: "2026-09-30T00:00:00.000Z", updatedAt: "2026-09-30T00:00:00.000Z", user: uploaderFixture, resource: null,
}]

export const surveyFixtures = [{
  id: "a0000000-0000-4000-8000-000000000001", title: "Cafeteria feedback", description: "Two quick questions", isActive: true, coverImageUrl: null, estimatedMinutes: 2,
  createdAt: "2026-09-29T00:00:00.000Z", updatedAt: "2026-09-29T00:00:00.000Z",
  resource: { id: postFixtures[0].id, title: "Campus tour", deleteStatus: "ACTIVE", user: uploaderFixture },
  _count: { questions: 4, responses: 41 },
}]

export const summaryFixture = { videos: 1, images: 1, text: 0, removedPosts: 2, ads: 1, activeAds: 1, surveys: 1, activeSurveys: 1 }
export const uploadersFixture = [{ user: uploaderFixture, posts: 2, videos: 1, images: 1, text: 0 }]

export const contentPage = <T,>(items: T[], total = items.length) => ({ items, total, page: 1, limit: 20 })

const reporter = { id: "60000000-0000-4000-8000-000000000002", userProfile: { fullName: "Kofi Boateng", username: "kofi" } }

export const contentReportFixtures = [{
  id: "b0000000-0000-4000-8000-000000000001", targetType: "POST", targetId: postFixtures[0].id, resourceId: postFixtures[0].id,
  reason: "HARASSMENT", details: "Targets a classmate", status: "OPEN", reporter, createdAt: "2026-10-02T09:00:00.000Z",
  resolvedAt: null, resolvedByAdminId: null, resolutionNote: null, openReportsOnTarget: 2,
}]

export const contentReportDetailFixture = {
  ...contentReportFixtures[0],
  target: { type: "POST", post: { id: postFixtures[0].id, description: "A walk around Legon", mediaType: "VIDEO", status: "PUBLIC", deleteStatus: "ACTIVE", createdAt: "2026-10-01T10:00:00.000Z", user: uploaderFixture } },
  otherReports: [{ id: "b0000000-0000-4000-8000-000000000002", reason: "SPAM", status: "OPEN", createdAt: "2026-10-03T09:00:00.000Z" }],
}

export const chatReportFixtures = [{
  id: "c0000000-0000-4000-8000-000000000001", targetType: "MESSAGE", targetId: "6650f0c2a1b2c3d4e5f60002", conversationId: "6650f0c2a1b2c3d4e5f60000",
  reason: "SCAM", details: "Asked for my MoMo PIN", status: "OPEN", reporter: { ...reporter, isActive: true }, reportedUserId: uploaderFixture.id,
  createdAt: "2026-10-04T09:00:00.000Z", resolvedAt: null, resolutionNote: null, reportedUser: uploaderFixture,
}]

export const chatReportDetailFixture = {
  ...chatReportFixtures[0],
  snapshot: {
    reported: { id: "6650f0c2a1b2c3d4e5f60002", seq: 2, senderId: uploaderFixture.id, kind: "TEXT", text: "Send your PIN to claim the prize", attachments: [], postId: null, createdAt: "2026-10-04T08:59:00.000Z", editedAt: null, deletedAt: null },
    before: [{ id: "6650f0c2a1b2c3d4e5f60001", seq: 1, senderId: reporter.id, kind: "TEXT", text: "Hi, what prize?", attachments: [{ kind: "IMAGE", key: "chat/1.jpg", mime: "image/jpeg" }], postId: null, createdAt: "2026-10-04T08:58:00.000Z", editedAt: null, deletedAt: null }],
  },
  openReportsAgainstUser: 3,
  otherReports: [],
}
