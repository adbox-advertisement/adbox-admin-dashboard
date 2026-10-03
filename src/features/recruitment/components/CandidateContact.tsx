import { useState } from "react"
import { Copy, ExternalLink, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { emailDraftUrl, responseDraft, type ResponseTemplate } from "../lib/responses"
import type { Application } from "../types"
import { RecruitmentSelect } from "./RecruitmentControls"

export function CandidateContact({ application, canReview }: { application: Application; canReview: boolean }) {
  const [template, setTemplate] = useState<ResponseTemplate>("followup")
  const [draft, setDraft] = useState(() => responseDraft(application, "followup"))
  const [copyStatus, setCopyStatus] = useState("")
  if (application.redactedAt) return <p className="rounded-xl bg-muted p-5 text-sm">Contact details have been removed under the retention policy.</p>
  return <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-6 lg:grid-cols-12">
    <section className="min-w-0 rounded-2xl border border-border p-5 md:col-span-2 lg:col-span-4"><h3 className="text-lg font-semibold">Reach the applicant</h3><dl className="mt-5 space-y-5"><div><dt className="flex items-center gap-2 text-xs text-muted-foreground"><Mail className="size-4" aria-hidden="true" />Email address</dt><dd className="mt-2 break-all text-sm font-medium">{application.email}</dd></div><div><dt className="flex items-center gap-2 text-xs text-muted-foreground"><Phone className="size-4" aria-hidden="true" />WhatsApp number</dt><dd className="mt-2 break-words text-sm font-medium">{application.phone}</dd></div></dl><div className="mt-6 border-t border-border pt-5"><h4 className="text-sm font-semibold">Response delivery</h4><p className="mt-2 text-xs leading-6 text-muted-foreground">The recruitment service can email a receipt when an application is submitted. Receipt delivery status is not available here.</p><p className="mt-3 text-xs leading-6 text-muted-foreground">Interview invitations and decisions are sent from your email app. AdBox does not yet send or track these responses.</p></div></section>
    <section className="min-w-0 rounded-2xl border border-border p-5 md:col-span-4 lg:col-span-8"><h3 className="text-lg font-semibold">Prepare a response</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Review and personalise the message before opening your email app.</p>
      {!canReview ? <p className="mt-5 rounded-xl bg-muted p-4 text-sm">Response drafts are available to administrators with recruitment review access.</p> : <div className="mt-5 space-y-5">
        <RecruitmentSelect label="Response template" value={template} onChange={value => { const next = value as ResponseTemplate; setTemplate(next); setDraft(responseDraft(application, next)); setCopyStatus("") }} options={[{ value: "followup", label: "Follow-up questions" }, { value: "interview", label: "Interview invitation" }, { value: "accepted", label: "Acceptance" }, { value: "rejected", label: "Decline" }]} />
        <div><label htmlFor="response-subject" className="mb-2 block text-sm font-medium">Subject</label><Input id="response-subject" value={draft.subject} maxLength={200} onChange={event => setDraft(previous => ({ ...previous, subject: event.target.value }))} /></div>
        <div><label htmlFor="response-body" className="mb-2 block text-sm font-medium">Message</label><Textarea id="response-body" rows={12} maxLength={6000} value={draft.body} onChange={event => setDraft(previous => ({ ...previous, body: event.target.value }))} className="min-h-72 leading-6" /></div>
        {draft.body.includes("[Add") && <p className="rounded-lg bg-warning-200 p-3 dark:bg-warning-500/10 dark:text-warning-400 text-xs leading-5 text-warning-1000">Replace the bracketed details before sending this message.</p>}
        <div className="flex flex-wrap gap-2"><Button asChild variant="secondary" className="h-10 px-4"><a href={emailDraftUrl(application.email, draft.subject, draft.body)}><ExternalLink aria-hidden="true" />Open email draft</a></Button><Button variant="outline" className="h-10 px-4" onClick={async () => { try { await navigator.clipboard.writeText(`To: ${application.email}\nSubject: ${draft.subject}\n\n${draft.body}`); setCopyStatus("Draft copied. Send it from your email app.") } catch { setCopyStatus("Copy is unavailable. Select and copy the message above.") } }}><Copy aria-hidden="true" />Copy draft</Button></div>
        <p role="status" className="text-xs text-muted-foreground">{copyStatus || "Opening a draft does not send a message or change the review stage."}</p>
      </div>}
    </section>
  </div>
}
