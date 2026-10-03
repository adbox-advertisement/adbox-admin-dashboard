import type { Application, RecruitmentCampaign, RecruitmentStats } from "@/features/recruitment/types"

export const recruitmentCampaign: RecruitmentCampaign = {
  id: "40000000-0000-4000-8000-000000000001", slug: "campus-reps-2026", title: "Campus Representatives 2026", referenceCode: "CR26",
  opensAt: "2026-09-29T00:00:00.000Z", closesAt: "2026-12-20T23:59:59.000Z", isActive: true, isOpen: true, positionsPerCampus: 2, stipendNote: null, applicationCount: 1,
}
export const recruitmentApplication: Application = {
  id: "50000000-0000-4000-8000-000000000001", reference: "ADBX-CR26-0001", status: "SUBMITTED", fullName: "Ama Test", email: "ama@example.com",
  rating: null, createdAt: "2026-10-02T10:00:00.000Z", updatedAt: "2026-10-02T10:00:00.000Z", reviewedAt: null, reviewedByAdminId: null, reviewedBy: null, redactedAt: null,
  campaign: { id: recruitmentCampaign.id, slug: recruitmentCampaign.slug, title: recruitmentCampaign.title },
  institution: { id: "60000000-0000-4000-8000-000000000001", slug: "ug", name: "University of Ghana", shortName: "UG", region: "Greater Accra" }, campusId: null,
  phone: "+233500000001", programme: "BSc Computer Science, Year 3", campusReach: "Legon Hall and the computer science department.",
  motivation: "I want to help students discover relevant opportunities.", experience: "I organised a student coding workshop for 30 people.",
  availability: "Four hours on Tuesdays and Saturdays.", otherRoles: "Secretary of the coding club.", phoneModel: "Samsung Galaxy A15, Android",
  paymentAnswer: "I would explain the programme without promising payment.", comfortable: false, honesty: true, internalNote: null,
  video: { id: "70000000-0000-4000-8000-000000000001", status: "READY", fileName: "introduction.webm", mimeType: "video/webm", byteSize: 2097152, durationSeconds: 24.5, completedAt: "2026-10-02T09:59:00.000Z" },
  events: [{ id: "80000000-0000-4000-8000-000000000001", fromStatus: null, toStatus: "SUBMITTED", note: null, actorAdminId: null, actor: null, createdAt: "2026-10-02T10:00:00.000Z" }],
}
export const recruitmentStats: RecruitmentStats = {
  total: 1, byStatus: { SUBMITTED: 1, UNDER_REVIEW: 0, SHORTLISTED: 0, INTERVIEWED: 0, ACCEPTED: 0, REJECTED: 0, WITHDRAWN: 0 },
  byInstitution: [{ institutionId: recruitmentApplication.institution.id, slug: "ug", name: "University of Ghana", count: 1 }],
}
