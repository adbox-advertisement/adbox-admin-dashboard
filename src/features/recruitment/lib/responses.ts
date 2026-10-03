import type { Application } from "../types"

export type ResponseTemplate = "followup" | "interview" | "accepted" | "rejected"
export function responseDraft(application: Pick<Application, "fullName" | "reference" | "campaign">, template: ResponseTemplate) {
  const messages: Record<ResponseTemplate, { title: string; body: string }> = {
    followup: { title: "Application follow-up", body: "Thank you for applying. We are reviewing your application and would like to follow up on the following:\n\n[Add your questions or next steps.]" },
    interview: { title: "Interview invitation", body: "Thank you for your application. We would like to invite you to an interview.\n\nDate and time: [Add date, time and time zone]\nLocation or meeting link: [Add details]\n\nPlease reply to confirm your availability." },
    accepted: { title: "Application outcome", body: "We are pleased to offer you a place in the programme.\n\n[Add the confirmed role details, start date, and onboarding steps.]\n\nPlease reply to confirm your acceptance." },
    rejected: { title: "Application outcome", body: "Thank you for your interest and the time you put into your application. After reviewing your application, we will not be moving forward on this occasion.\n\nWe appreciate your interest in AdBox and wish you the best with your studies." },
  }
  return { subject: `${messages[template].title} · ${application.reference}`, body: `Hi ${application.fullName},\n\n${messages[template].body}\n\n${application.campaign.title}\nApplication reference: ${application.reference}\n\nBest wishes,\nThe AdBox team` }
}
export function emailDraftUrl(email: string, subject: string, body: string) {
  // Encode every component so an applicant-supplied value cannot inject mail headers.
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject.replace(/[\r\n]/g, " "))}&body=${encodeURIComponent(body)}`
}
