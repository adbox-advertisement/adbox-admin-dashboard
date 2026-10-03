import { Check, MessageCircle, X } from "lucide-react"
import type { Application } from "../types"
import { CandidateVideo } from "./CandidateVideo"

const campusAnswers = [
  ["campusReach", "Campus reach", "Which halls, hostels or areas of campus can you reach easily?"],
  ["motivation", "Motivation", "Why do you want to do this?"],
  ["experience", "Bringing students together", "Tell us about a time you got a group of students to do something — a club, an event, a class project, a hall activity."],
] as const
const roleAnswers = [
  ["availability", "Weekly availability", "How many hours a week can you give, and on which days?"],
  ["otherRoles", "Other commitments", "Are you already an executive or rep for another group, brand or app?"],
  ["phoneModel", "Phone & operating system", "What phone do you use, and is it Android or iPhone?"],
  ["paymentAnswer", "The payment question", "A student asks “will I get paid for using this?” — what do you say?"],
] as const

export function CandidateApplication({ application }: { application: Application }) {
  if (application.redactedAt) return <div className="rounded-xl border bg-muted p-6 text-sm leading-6">This applicant's personal data and video have been removed under the retention policy. The application reference, institution, review stage, and dates remain available.</div>
  return <div className="grid grid-cols-1 items-start gap-6 min-[440px]:grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
    <div className="min-w-0 space-y-7 min-[440px]:col-span-4 md:col-span-6 lg:col-span-8">
      <section aria-labelledby="applicant-details-heading"><h3 id="applicant-details-heading" className="mb-4 text-lg font-semibold">Applicant details</h3><dl className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-muted/40 p-5 sm:grid-cols-2">{[["Full name", application.fullName], ["Institution", application.institution.name], ["Programme & year", application.programme], ["WhatsApp number", application.phone], ["Email address", application.email]].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm font-medium">{value || "Not provided"}</dd></div>)}</dl></section>
      <section aria-labelledby="campus-life-heading"><h3 id="campus-life-heading" className="mb-4 text-lg font-semibold">Campus life</h3><div className="divide-y divide-border rounded-2xl border border-border">{campusAnswers.map(([key, title, question]) => <Answer key={key} title={title} question={question} answer={application[key]} />)}</div></section>
      <section aria-labelledby="role-fit-heading"><h3 id="role-fit-heading" className="mb-4 text-lg font-semibold">Fit for the role</h3><div className="divide-y divide-border rounded-2xl border border-border">{roleAnswers.map(([key, title, question]) => <Answer key={key} title={title} question={question} answer={application[key]} />)}</div></section>
    </div>
    <aside className="order-first min-w-0 space-y-5 lg:order-last lg:sticky lg:top-24 min-[440px]:col-span-4 md:col-span-6 lg:col-span-4"><CandidateVideo application={application} /><section className="rounded-2xl border border-border p-4"><h3 className="mb-4 flex items-center gap-2 text-base font-semibold"><MessageCircle className="size-4 text-blue dark:text-cyan" aria-hidden="true" />Self-assessment</h3><BooleanAnswer value={application.comfortable} title="Approaching new students" question="Comfortable approaching students they do not know, in person?" /><div className="my-4 border-t border-border" /><BooleanAnswer value={application.honesty} title="Honest reporting" question="Agrees to report honestly and never create accounts for people who are not present?" /></section></aside>
  </div>
}

function Answer({ title, question, answer }: { title: string; question: string; answer: string }) {
  return <article className="min-w-0 p-5"><h4 className="text-sm font-semibold">{title}</h4><p className="mt-1 text-xs leading-5 text-muted-foreground">{question}</p><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7">{answer || "No answer provided (optional)."}</p></article>
}
function BooleanAnswer({ value, title, question }: { value: boolean; title: string; question: string }) {
  const Icon = value ? Check : X
  return <div><h4 className="text-sm font-semibold">{title}</h4><p className="mt-1 text-xs leading-5 text-muted-foreground">{question}</p><span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${value ? "bg-success-200 text-success-1000 dark:bg-success-500/10 dark:text-success-400" : "bg-warning-200 text-warning-1000 dark:bg-warning-500/10 dark:text-warning-400"}`}><Icon className="size-3.5" aria-hidden="true" />{value ? "Yes" : "No"}</span></div>
}
