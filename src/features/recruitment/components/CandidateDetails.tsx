import { useRef, useState } from "react"
import { ArrowRight, CalendarDays, Check, FileText, GraduationCap, Mail, NotebookPen } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useApplication, useChangeStatus } from "../hooks"
import { advanceLabels, formatDate, initials, isClosed, nextStage, pipeline, stageGuide, statusLabels } from "../lib/workflow"
import { decisionSchema } from "../validation"
import type { Application, ApplicationStatus } from "../types"
import { CandidateApplication } from "./CandidateApplication"
import { CandidateNotes } from "./CandidateNotes"
import { CandidateContact } from "./CandidateContact"
import { RecruitmentError, StatusBadge } from "./RecruitmentControls"

export function CandidateDetails({ id, canReview, onClose }: { id: string; canReview: boolean; onClose: () => void }) {
  const query = useApplication(id)
  const returnFocus = useRef<HTMLElement | null>(null)
  const application = query.isError ? undefined : query.data
  return <Sheet open onOpenChange={open => { if (!open) onClose() }}>
    <SheetContent closeLabel="Close candidate profile" className="w-full max-w-[1050px] gap-0 overflow-y-auto bg-card text-foreground" onOpenAutoFocus={() => { returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null }} onCloseAutoFocus={event => { event.preventDefault(); (returnFocus.current?.isConnected ? returnFocus.current : document.getElementById("candidate-search"))?.focus() }}>
      <SheetHeader className="gap-5 border-b border-border px-5 pb-6 pt-8 sm:px-8">
        <div className="flex items-start gap-4 pr-6">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue/8 font-heading text-xl font-semibold text-blue dark:bg-cyan/10 dark:text-cyan">{initials(application?.redactedAt ? "" : application?.fullName ?? "")}</span>
          <div className="min-w-0">
            <SheetTitle className="break-words text-2xl leading-8 text-foreground">{application ? application.redactedAt ? "Applicant data removed" : application.fullName : "Application details"}</SheetTitle>
            <SheetDescription className="mt-1 break-words text-xs leading-5 text-muted-foreground">{application ? `${application.reference} · ${application.campaign.title}` : "Loading the application and its history."}</SheetDescription>
            {application && <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><GraduationCap className="size-3.5 shrink-0" aria-hidden="true" />{application.institution.name}</span>
              <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />Applied {formatDate(application.createdAt, true)}</span>
            </p>}
          </div>
        </div>
        {application && <StageTracker status={application.status} />}
        {application && <DecisionBar key={application.status} application={application} canReview={canReview} />}
      </SheetHeader>
      {query.isPending && <p role="status" className="p-8 text-sm text-muted-foreground">Loading candidate details…</p>}
      {query.isError && <div className="p-5"><RecruitmentError error={query.error} retry={() => void query.refetch()} /></div>}
      {application && <Tabs defaultValue="application" className="gap-0">
        <div className="sticky top-0 z-10 border-b border-border bg-card px-3 py-3 sm:px-8"><TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-xl border-0 bg-muted p-1">{[{ value: "application", label: "Application", icon: FileText }, { value: "notes", label: "Notes & history", icon: NotebookPen }, { value: "contact", label: "Contact", icon: Mail }].map(({ value, label, icon: Icon }) => <TabsTrigger key={value} className="min-h-11 min-w-0 justify-center rounded-lg border-0 px-1 py-2.5 text-xs data-[state=active]:bg-card data-[state=active]:text-blue dark:data-[state=active]:text-cyan sm:text-sm" value={value}><Icon className="hidden size-4 sm:block" aria-hidden="true" />{label}</TabsTrigger>)}</TabsList></div>
        <TabsContent value="application" className="p-5 sm:p-8"><CandidateApplication application={application} /></TabsContent>
        <TabsContent value="notes" forceMount className="p-5 data-[state=inactive]:hidden sm:p-8"><CandidateNotes application={application} canReview={canReview} /></TabsContent>
        <TabsContent value="contact" forceMount className="p-5 data-[state=inactive]:hidden sm:p-8"><CandidateContact application={application} canReview={canReview} /></TabsContent>
      </Tabs>}
    </SheetContent>
  </Sheet>
}

/** The five stages forward, with this application's place among them; a closed one says how it ended. */
function StageTracker({ status }: { status: ApplicationStatus }) {
  const closed = status === "REJECTED" || status === "WITHDRAWN"
  const current = pipeline.indexOf(status as (typeof pipeline)[number])
  return <div className="flex flex-col gap-2">
    <ol aria-label="Review stages" className="grid grid-cols-5 gap-1.5">
      {pipeline.map((stage, index) => {
        const done = !closed && index < current
        const here = !closed && index === current
        return <li key={stage} aria-current={here ? "step" : undefined} className="min-w-0">
          <span className={cn("block h-1.5 rounded-full", done || here ? "bg-blue dark:bg-cyan" : "bg-muted", closed && "bg-muted")} aria-hidden="true" />
          <span className={cn("mt-1.5 flex items-center gap-1 truncate text-[11px]", here ? "font-semibold text-foreground" : "text-muted-foreground")}>
            {done && <Check className="size-3 shrink-0" aria-hidden="true" />}{statusLabels[stage]}
          </span>
        </li>
      })}
    </ol>
    <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><StatusBadge status={status} />{stageGuide[status].meaning}</p>
  </div>
}

type Move = { to: ApplicationStatus; label: string }

/** One clear next step, with Reject and Withdrawn beside it; each asks for a note before it is saved. */
function DecisionBar({ application, canReview }: { application: Application; canReview: boolean }) {
  const [move, setMove] = useState<Move | null>(null)
  const [note, setNote] = useState("")
  const [validationError, setValidationError] = useState("")
  const decision = useChangeStatus()
  if (application.redactedAt) return null
  if (isClosed(application.status)) return <p className="rounded-xl bg-muted p-3 text-xs leading-5">{application.status === "ACCEPTED" ? "Accepted: they are on the team." : `${statusLabels[application.status]}: this application is closed.`} A final stage can't be changed; a new application starts again.</p>
  if (!canReview) return <p className="rounded-xl bg-muted p-3 text-xs leading-5">You have view-only access. Next step for this application: {stageGuide[application.status].nextStep.toLowerCase()}.</p>

  const forward = nextStage(application.status)
  const final = move ? isClosed(move.to) : false
  const choose = (next: Move) => { setMove(next); setNote(""); setValidationError(""); decision.reset() }
  const confirm = () => {
    if (!move) return
    const parsed = decisionSchema.safeParse({ status: move.to, note })
    if (!parsed.success) { setValidationError(parsed.error.issues[0].message); return }
    setValidationError("")
    decision.mutate({ id: application.id, currentStatus: application.status, input: parsed.data }, { onSuccess: () => toast.success(`Moved to ${statusLabels[move.to]}`) })
  }

  return <section aria-label="Next step" className="rounded-2xl border border-border bg-muted/30 p-4">
    <div className="flex flex-wrap items-center gap-2">
      <p className="mr-auto text-sm"><span className="text-muted-foreground">Next step: </span><span className="font-semibold">{stageGuide[application.status].nextStep}</span></p>
      {forward && <Button variant="secondary" className="h-10 rounded-xl px-4" disabled={decision.isPending} onClick={() => choose({ to: forward, label: `Move to ${statusLabels[forward]}` })}>{advanceLabels[forward] ?? statusLabels[forward]}<ArrowRight aria-hidden="true" /></Button>}
      <Button variant="outline" className="h-10 rounded-xl px-4 text-error-800 hover:text-error-800 dark:text-error-400" disabled={decision.isPending} onClick={() => choose({ to: "REJECTED", label: "Reject application" })}>Reject…</Button>
      <Button variant="ghost" className="h-10 rounded-xl px-3 text-muted-foreground" disabled={decision.isPending} onClick={() => choose({ to: "WITHDRAWN", label: "Mark as withdrawn" })}>Withdrawn…</Button>
    </div>
    {move && <form className="mt-4 space-y-3 border-t border-border pt-4" onSubmit={event => { event.preventDefault(); confirm() }}>
      <p className="text-sm font-semibold">{statusLabels[application.status]} → {statusLabels[move.to]}</p>
      <div>
        <label htmlFor="decision-note" className="mb-2 block text-sm font-medium">Decision note {move.to === "REJECTED" ? "(required)" : "(optional)"}</label>
        <Textarea id="decision-note" maxLength={2000} rows={3} value={note} onChange={event => setNote(event.target.value)} disabled={decision.isPending} aria-invalid={Boolean(validationError)} aria-describedby={validationError ? "decision-error" : undefined} placeholder={move.to === "REJECTED" ? "Why it isn't going forward, for the review history…" : "Anything the team should know, for the review history…"} />
        <p className="mt-1.5 text-xs text-muted-foreground">Saved in the review history · {note.length}/2,000. The applicant isn't told: use Contact to write to them.</p>
      </div>
      {validationError && <p id="decision-error" role="alert" className="text-sm text-error-800 dark:text-error-400">{validationError}</p>}
      {final && <p className="rounded-xl bg-warning-200 p-3 text-xs leading-5 text-warning-1000 dark:bg-warning-500/10 dark:text-warning-400">This is final: the application can't move to another stage afterwards.</p>}
      {decision.isError && <RecruitmentError error={decision.error} />}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant={move.to === "REJECTED" ? "destructive" : "secondary"} className="h-10 px-4" disabled={decision.isPending}>{decision.isPending ? "Saving…" : move.label}</Button>
        <Button type="button" variant="ghost" className="h-10 px-4" disabled={decision.isPending} onClick={() => setMove(null)}>Cancel</Button>
      </div>
    </form>}
  </section>
}
