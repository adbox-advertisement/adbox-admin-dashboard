import { useRef, useState } from "react"
import { ArrowRight, CalendarDays, ClipboardCheck, FileText, GraduationCap, History, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApplication } from "../hooks"
import { formatDate, initials, reviewerName, statusLabels } from "../lib/workflow"
import { CandidateApplication } from "./CandidateApplication"
import { CandidateReview } from "./CandidateReview"
import { CandidateContact } from "./CandidateContact"
import { RecruitmentError, StatusBadge } from "./RecruitmentControls"

export function CandidateDetails({ id, canReview, onClose }: { id: string; canReview: boolean; onClose: () => void }) {
  const query = useApplication(id)
  const returnFocus = useRef<HTMLElement | null>(null)
  const [tab, setTab] = useState("application")
  const application = query.isError ? undefined : query.data
  return <Sheet open onOpenChange={open => { if (!open) onClose() }}>
    <SheetContent closeLabel="Close candidate profile" className="w-full max-w-[1050px] gap-0 overflow-y-auto bg-card text-foreground" onOpenAutoFocus={() => { returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null }} onCloseAutoFocus={event => { event.preventDefault(); (returnFocus.current?.isConnected ? returnFocus.current : document.getElementById("candidate-search"))?.focus() }}>
      <SheetHeader className="border-b border-border bg-gradient-to-br from-blue/5 via-card to-purple/5 px-5 pb-6 pt-8 sm:px-8">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-blue dark:text-cyan">Get to know your next campus voice</p>
        <div className="flex items-start gap-4 pr-5"><span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue/8 dark:bg-cyan/10 font-heading text-xl font-semibold text-blue dark:text-cyan">{initials(application?.redactedAt ? "" : application?.fullName ?? "")}</span><div className="min-w-0"><SheetTitle className="break-words text-2xl leading-8 text-foreground">{application ? application.redactedAt ? "Applicant data removed" : application.fullName : "Application details"}</SheetTitle><SheetDescription className="mt-1 break-words text-xs leading-5 text-muted-foreground">{application ? `${application.reference} · ${application.campaign.title}` : "Loading the submitted application and review history."}</SheetDescription></div></div>
        {application && <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3"><StatusBadge status={application.status} /><span className="flex items-center gap-1.5 text-xs text-muted-foreground"><GraduationCap className="size-3.5 shrink-0" aria-hidden="true" />{application.institution.name}</span><span className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />Submitted {formatDate(application.createdAt, true)}</span></div>}
        {application && canReview && !application.redactedAt && tab !== "review" && <div className="mt-4 flex justify-end"><Button variant="secondary" className="h-10 rounded-xl px-4" onClick={() => setTab("review")}>Go to review<ArrowRight aria-hidden="true" /></Button></div>}
      </SheetHeader>
      {query.isPending && <p role="status" className="p-8 text-sm text-muted-foreground">Loading candidate details…</p>}
      {query.isError && <div className="p-5"><RecruitmentError error={query.error} retry={() => void query.refetch()} /></div>}
      {application && <Tabs value={tab} onValueChange={setTab} className="gap-0">
        <div className="sticky top-0 z-10 border-b border-border bg-card px-3 py-3 sm:px-8"><TabsList className="grid h-auto w-full grid-cols-4 gap-1 rounded-xl border-0 bg-muted p-1">{[{ value: "application", label: "Application", icon: FileText }, { value: "review", label: "Review", icon: ClipboardCheck }, { value: "contact", label: "Contact", icon: Mail }, { value: "history", label: "History", icon: History }].map(({ value, label, icon: Icon }) => <TabsTrigger key={value} className="min-h-11 min-w-0 justify-center rounded-lg border-0 px-1 py-2.5 text-xs data-[state=active]:bg-card data-[state=active]:text-blue dark:data-[state=active]:text-cyan sm:text-sm" value={value}><Icon className="hidden size-4 sm:block" aria-hidden="true" />{label}</TabsTrigger>)}</TabsList></div>
        <TabsContent value="application" className="p-5 sm:p-8"><CandidateApplication application={application} /></TabsContent>
        <TabsContent value="review" forceMount className="p-5 data-[state=inactive]:hidden sm:p-8"><CandidateReview application={application} canReview={canReview} /></TabsContent>
        <TabsContent value="contact" forceMount className="p-5 data-[state=inactive]:hidden sm:p-8"><CandidateContact application={application} canReview={canReview} /></TabsContent>
        <TabsContent value="history" className="p-5 sm:p-8"><h3 className="mb-2 flex items-center gap-2 text-lg font-semibold"><History className="size-5 text-blue dark:text-cyan" aria-hidden="true" />Review history</h3><p className="mb-6 text-xs leading-5 text-muted-foreground">{application.reviewedAt ? `Last decision by ${reviewerName(application.reviewedBy)} · ${formatDate(application.reviewedAt, true)}` : "No admin decision recorded yet."}</p><ol className="space-y-0">{application.events.map(event => <li key={event.id} className="relative ml-2 border-l-2 border-blue/15 pb-7 pl-6 last:pb-0"><span className="absolute -left-[7px] top-1 size-3 rounded-full border-2 border-card bg-blue" aria-hidden="true" /><p className="text-sm font-semibold">{event.fromStatus ? `${statusLabels[event.fromStatus]} → ${statusLabels[event.toStatus]}` : "Application submitted"}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{event.actorAdminId ? reviewerName(event.actor) : "Applicant"} · {formatDate(event.createdAt, true)}</p>{event.note && !application.redactedAt && <p className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-muted p-4 text-sm leading-6">{event.note}</p>}</li>)}</ol>{application.events.length === 0 && <p className="text-sm text-muted-foreground">No status events recorded.</p>}</TabsContent>
      </Tabs>}
    </SheetContent>
  </Sheet>
}
