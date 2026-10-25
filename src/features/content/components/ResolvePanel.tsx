import { useId, useState, type ReactNode } from "react"
import { CircleSlash, Gavel } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "../lib/cn"
import { formatDate, formatRelative } from "../lib/format"
import type { ReportStatus } from "../types"
import { Section, ink, muted } from "./ContentBits"
import { ReportStatusPill } from "./ReportBits"

export type Resolution = { outcome: "ACTION_TAKEN" | "DISMISSED"; removeContent?: boolean; note?: string }

/**
 * The decision on an open report. `removable` names what "take action" can also take down
 * (e.g. "post"); without it, taking action only records the outcome.
 */
export function ResolvePanel({ removable, pending, error, onResolve, otherOpen }: {
  removable?: string
  pending: boolean
  error: string
  otherOpen: number
  onResolve: (resolution: Resolution) => void
}) {
  const [outcome, setOutcome] = useState<Resolution["outcome"]>("ACTION_TAKEN")
  const [remove, setRemove] = useState(Boolean(removable))
  const [note, setNote] = useState("")
  const noteId = useId()
  const removeId = useId()
  const removing = outcome === "ACTION_TAKEN" && Boolean(removable) && remove
  const label = outcome === "DISMISSED" ? "Dismiss report" : removing ? `Remove ${removable} and resolve` : "Resolve with action taken"

  return <Section title="Your decision" description={otherOpen > 0 ? `Applies to this report and ${otherOpen} other open ${otherOpen === 1 ? "report" : "reports"} on the same content.` : "Recorded in the audit log with your name."}>
    <form className="flex flex-col gap-4" onSubmit={(event) => {
      event.preventDefault()
      onResolve({ outcome, removeContent: removing || undefined, note: note.trim() || undefined })
    }}>
      <fieldset className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2" disabled={pending}>
        <legend className="sr-only">Outcome</legend>
        <Choice name="outcome" checked={outcome === "ACTION_TAKEN"} onChange={() => setOutcome("ACTION_TAKEN")} icon={<Gavel className="size-4" aria-hidden="true" />} title="Take action" body="The report is valid." tone="danger" />
        <Choice name="outcome" checked={outcome === "DISMISSED"} onChange={() => setOutcome("DISMISSED")} icon={<CircleSlash className="size-4" aria-hidden="true" />} title="Dismiss" body="Nothing breaks the rules." tone="neutral" />
      </fieldset>

      {removable && outcome === "ACTION_TAKEN" && <div className="flex items-start gap-3 rounded-2xl bg-destructive/5 p-3">
        <Checkbox id={removeId} checked={remove} onCheckedChange={(checked) => setRemove(checked === true)} disabled={pending} className="mt-0.5" />
        <label htmlFor={removeId} className="text-sm leading-5">
          <span className={cn("block font-semibold", ink)}>Also remove the {removable}</span>
          <span className={muted}>It disappears from AdBox for everyone. {removable === "post" ? "You can restore it later from Posts." : "A removed comment can't be restored."}</span>
        </label>
      </div>}

      <div>
        <label htmlFor={noteId} className={cn("mb-1.5 block text-sm font-medium", ink)}>Note <span className={cn("font-normal", muted)}>(optional)</span></label>
        <Textarea id={noteId} value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} disabled={pending} placeholder="Why you decided this, for other admins" className="min-h-20 rounded-xl" />
        <p className={cn("mt-1 text-right text-b3", muted)}>{note.length}/500</p>
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" variant={removing ? "destructive" : "default"} disabled={pending} className="h-11 cursor-pointer rounded-full">{pending ? "Saving…" : label}</Button>
    </form>
  </Section>
}

function Choice({ name, checked, onChange, icon, title, body, tone }: { name: string; checked: boolean; onChange: () => void; icon: ReactNode; title: string; body: string; tone: "danger" | "neutral" }) {
  return <label className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-purple",
    checked ? tone === "danger" ? "border-destructive/60 bg-destructive/5" : "border-purple/50 bg-purple/5" : "border-grey-200 hover:border-grey-300 dark:border-border")}>
    <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
    <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg", tone === "danger" ? "bg-destructive/10 text-destructive" : "bg-grey-100 text-grey-600 dark:bg-muted dark:text-muted-foreground")}>{icon}</span>
    <span className="min-w-0">
      <span className={cn("block text-b2 font-semibold", ink)}>{title}</span>
      <span className={cn("block text-b3 leading-5", muted)}>{body}</span>
    </span>
  </label>
}

/** What was decided, once a report is closed. */
export function ResolutionSummary({ status, resolvedAt, note }: { status: ReportStatus | null; resolvedAt: string | null; note: string | null }) {
  return <Section title="Decision">
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <ReportStatusPill status={status} />
        {resolvedAt && <span className={cn("text-b3", muted)} title={formatDate(resolvedAt, "MMM d, yyyy 'at' h:mm a") ?? undefined}>{formatRelative(resolvedAt)}</span>}
      </div>
      {note ? <p className={cn("rounded-xl bg-grey-50 px-3 py-2.5 text-sm leading-6 dark:bg-background", ink)}>{note}</p> : <p className={cn("text-b3", muted)}>No note was left.</p>}
    </div>
  </Section>
}
