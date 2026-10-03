import { useState } from "react"
import { ArrowRight, LockKeyhole, Save, Star } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useChangeStatus, useSaveReview } from "../hooks"
import { statusLabels, transitions } from "../lib/workflow"
import { decisionSchema } from "../validation"
import type { Application, ApplicationStatus } from "../types"
import { RecruitmentError, RecruitmentSelect, StatusBadge } from "./RecruitmentControls"

export function CandidateReview({ application, canReview }: { application: Application; canReview: boolean }) {
  const [note, setNote] = useState(application.internalNote ?? "")
  const [rating, setRating] = useState<number | undefined>(application.rating ?? undefined)
  const save = useSaveReview()
  const editable = canReview && !application.redactedAt
  if (application.redactedAt) return <p className="rounded-xl bg-muted p-5 text-sm">Review notes and actions are unavailable for a redacted application.</p>
  return <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-6 lg:grid-cols-12">
    <section className="rounded-2xl border border-border p-5 md:col-span-3 lg:col-span-6"><h3 className="text-lg font-semibold">Your assessment</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Record your rating and notes for the review team.</p>
      {!editable && <p className="mt-4 rounded-lg bg-muted p-3 text-sm">{application.redactedAt ? "Review is unavailable for a redacted application." : "You have view-only access to this application."}</p>}
      <form className="mt-5 space-y-5" onSubmit={event => { event.preventDefault(); save.mutate({ id: application.id, input: { internalNote: note, ...(rating ? { rating } : {}) } }, { onSuccess: () => toast.success("Assessment saved") }) }}>
        <fieldset disabled={!editable || save.isPending}><legend className="mb-2 text-sm font-medium">Overall rating</legend><div className="flex flex-wrap gap-2">{[1, 2, 3, 4, 5].map(value => <label key={value} className="cursor-pointer"><input type="radio" className="peer sr-only" name={`rating-${application.id}`} value={value} checked={rating === value} onChange={() => setRating(value)} aria-label={`${value} out of 5`} /><span className={`flex size-10 items-center justify-center rounded-lg border peer-focus-visible:shadow-adbox-focus-secondary ${rating && value <= rating ? "border-warning-500 bg-warning-200 text-warning-900 dark:bg-warning-500/15 dark:text-warning-400" : "border-border bg-card text-grey-400"}`}><Star className={`size-5 ${rating && value <= rating ? "fill-current" : ""}`} aria-hidden="true" /></span></label>)}</div><p className="mt-2 text-xs text-muted-foreground">{rating ? `${rating} out of 5` : "Not rated yet"}</p></fieldset>
        <div><label htmlFor="candidate-note" className="mb-2 flex items-center gap-2 text-sm font-medium"><LockKeyhole className="size-3.5 text-muted-foreground" aria-hidden="true" />Internal note</label><Textarea id="candidate-note" rows={7} maxLength={2000} value={note} disabled={!editable || save.isPending} onChange={event => setNote(event.target.value)} placeholder="Campus connections, communication, availability, and anything to follow up on…" className="min-h-40 resize-y" /><p className="mt-2 text-xs text-muted-foreground">Only visible to admins · {note.length}/2,000</p></div>
        {save.isError && <RecruitmentError error={save.error} />}
        {editable && <Button type="submit" variant="secondary" className="h-10 px-4" disabled={save.isPending}><Save aria-hidden="true" />{save.isPending ? "Saving…" : "Save assessment"}</Button>}
      </form>
    </section>
    <DecisionForm key={application.status} application={application} editable={editable} />
  </div>
}

function DecisionForm({ application, editable }: { application: Application; editable: boolean }) {
  const allowed = transitions[application.status]
  const [status, setStatus] = useState<ApplicationStatus | undefined>(allowed[0])
  const [note, setNote] = useState("")
  const [validationError, setValidationError] = useState("")
  const decision = useChangeStatus()
  const terminal = status && transitions[status].length === 0
  return <section className="rounded-2xl border border-border p-5 md:col-span-3 lg:col-span-6"><h3 className="text-lg font-semibold">Move the application forward</h3><div className="mt-3"><StatusBadge status={application.status} /></div>
    {allowed.length === 0 ? <p className="mt-5 rounded-xl bg-muted p-4 text-sm leading-6">This application is closed. {statusLabels[application.status]} is a final stage; reopening requires a new application.</p> : <form className="mt-5 space-y-5" onSubmit={event => {
      event.preventDefault()
      const parsed = decisionSchema.safeParse({ status, note })
      if (!parsed.success) { setValidationError(parsed.error.issues[0].message); return }
      setValidationError("")
      decision.mutate({ id: application.id, currentStatus: application.status, input: parsed.data }, { onSuccess: () => toast.success("Review stage updated") })
    }}>
      <RecruitmentSelect label="Next review stage" value={status ?? ""} onChange={value => { setStatus(value as ApplicationStatus); setValidationError("") }} options={allowed.map(value => ({ value, label: statusLabels[value] }))} disabled={!editable || decision.isPending} />
      <div><label htmlFor="decision-note" className="mb-2 block text-sm font-medium">Decision note {status === "REJECTED" ? "(required)" : "(optional)"}</label><Textarea id="decision-note" maxLength={2000} rows={5} value={note} onChange={event => setNote(event.target.value)} disabled={!editable || decision.isPending} aria-invalid={Boolean(validationError)} aria-describedby={validationError ? "decision-error" : undefined} placeholder="Explain the decision for the review history…" /><p className="mt-2 text-xs text-muted-foreground">Saved in the internal history · {note.length}/2,000</p></div>
      {validationError && <p id="decision-error" role="alert" className="text-sm text-error-800 dark:text-error-400">{validationError}</p>}
      {terminal && <p className="rounded-xl bg-warning-200 p-3 dark:bg-warning-500/10 dark:text-warning-400 text-xs leading-5 text-warning-1000">This is a final decision. The application cannot move to another stage afterwards.</p>}
      <p className="text-xs leading-5 text-muted-foreground">Updating the stage does not notify the applicant. Use Contact to prepare a separate response.</p>
      {decision.isError && <RecruitmentError error={decision.error} />}
      {editable && <Button type="submit" variant={status === "REJECTED" ? "destructive" : "secondary"} disabled={decision.isPending} className="h-10 px-4">{decision.isPending ? "Updating…" : terminal ? "Confirm decision" : "Update review stage"}<ArrowRight aria-hidden="true" /></Button>}
    </form>}
  </section>
}
