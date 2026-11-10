import { useState } from "react"
import { History, LockKeyhole, Save, Star } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useSaveReview } from "../hooks"
import { formatDate, reviewerName, statusLabels } from "../lib/workflow"
import type { Application } from "../types"
import { RecruitmentError } from "./RecruitmentControls"

/** The reviewers' private assessment, then everything that has happened to the application. */
export function CandidateNotes({ application, canReview }: { application: Application; canReview: boolean }) {
  if (application.redactedAt) return <div className="space-y-6"><p className="rounded-xl bg-muted p-5 text-sm">Notes are unavailable for a redacted application.</p><ReviewHistory application={application} /></div>
  return <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-6 lg:grid-cols-12">
    <Assessment application={application} canReview={canReview} />
    <div className="md:col-span-3 lg:col-span-6"><ReviewHistory application={application} /></div>
  </div>
}

function Assessment({ application, canReview }: { application: Application; canReview: boolean }) {
  const [note, setNote] = useState(application.internalNote ?? "")
  const [rating, setRating] = useState<number | undefined>(application.rating ?? undefined)
  const save = useSaveReview()
  return <section className="rounded-2xl border border-border p-5 md:col-span-3 lg:col-span-6">
    <h3 className="text-lg font-semibold">Your assessment</h3>
    <p className="mt-1 text-xs leading-5 text-muted-foreground">A rating and private notes for the review team. Saving doesn't change the stage.</p>
    {!canReview && <p className="mt-4 rounded-lg bg-muted p-3 text-sm">You have view-only access to this application.</p>}
    <form className="mt-5 space-y-5" onSubmit={event => { event.preventDefault(); save.mutate({ id: application.id, input: { internalNote: note, ...(rating ? { rating } : {}) } }, { onSuccess: () => toast.success("Assessment saved") }) }}>
      <fieldset disabled={!canReview || save.isPending}>
        <legend className="mb-2 text-sm font-medium">Overall rating</legend>
        <div className="flex flex-wrap gap-2">{[1, 2, 3, 4, 5].map(value => <label key={value} className="cursor-pointer"><input type="radio" className="peer sr-only" name={`rating-${application.id}`} value={value} checked={rating === value} onChange={() => setRating(value)} aria-label={`${value} out of 5`} /><span className={`flex size-10 items-center justify-center rounded-lg border peer-focus-visible:shadow-adbox-focus-secondary ${rating && value <= rating ? "border-warning-500 bg-warning-200 text-warning-900 dark:bg-warning-500/15 dark:text-warning-400" : "border-border bg-card text-grey-400"}`}><Star className={`size-5 ${rating && value <= rating ? "fill-current" : ""}`} aria-hidden="true" /></span></label>)}</div>
        <p className="mt-2 text-xs text-muted-foreground">{rating ? `${rating} out of 5` : "Not rated yet"}</p>
      </fieldset>
      <div>
        <label htmlFor="candidate-note" className="mb-2 flex items-center gap-2 text-sm font-medium"><LockKeyhole className="size-3.5 text-muted-foreground" aria-hidden="true" />Internal note</label>
        <Textarea id="candidate-note" rows={7} maxLength={2000} value={note} disabled={!canReview || save.isPending} onChange={event => setNote(event.target.value)} placeholder="Campus connections, communication, availability, and anything to follow up on…" className="min-h-40 resize-y" />
        <p className="mt-2 text-xs text-muted-foreground">Only visible to admins · {note.length}/2,000</p>
      </div>
      {save.isError && <RecruitmentError error={save.error} />}
      {canReview && <Button type="submit" variant="secondary" className="h-10 px-4" disabled={save.isPending}><Save aria-hidden="true" />{save.isPending ? "Saving…" : "Save assessment"}</Button>}
    </form>
  </section>
}

function ReviewHistory({ application }: { application: Application }) {
  return <section aria-labelledby="review-history-title">
    <h3 id="review-history-title" className="mb-2 flex items-center gap-2 text-lg font-semibold"><History className="size-5 text-blue dark:text-cyan" aria-hidden="true" />Review history</h3>
    <p className="mb-6 text-xs leading-5 text-muted-foreground">{application.reviewedAt ? `Last decision by ${reviewerName(application.reviewedBy)} · ${formatDate(application.reviewedAt, true)}` : "No decision recorded yet."}</p>
    <ol>{application.events.map(event => <li key={event.id} className="relative ml-2 border-l-2 border-blue/15 pb-7 pl-6 last:pb-0">
      <span className="absolute -left-[7px] top-1 size-3 rounded-full border-2 border-card bg-blue" aria-hidden="true" />
      <p className="text-sm font-semibold">{event.fromStatus ? `${statusLabels[event.fromStatus]} → ${statusLabels[event.toStatus]}` : "Application received"}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{event.actorAdminId ? reviewerName(event.actor) : "Applicant"} · {formatDate(event.createdAt, true)}</p>
      {event.note && !application.redactedAt && <p className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-muted p-4 text-sm leading-6">{event.note}</p>}
    </li>)}</ol>
    {application.events.length === 0 && <p className="text-sm text-muted-foreground">No events recorded.</p>}
  </section>
}
