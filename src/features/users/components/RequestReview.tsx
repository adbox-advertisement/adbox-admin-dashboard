import { useId, useState, type ReactNode } from "react"
import { toast } from "sonner"
import { CircleSlash, ClipboardCheck, ExternalLink, FileText, History, ScanSearch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "../lib/cn"
import { usersErrorMessage } from "../lib/errors"
import { formatDate, safeImageUrl } from "../lib/format"
import { declineReasons, type DeclineReason, type PageRequestCheck } from "../lib/page-requests"
import { pageRequestChangesSchema } from "../validation"
import { isPicture } from "../lib/requests"
import { CheckPill } from "./PageRequestParts"
import { Section } from "./ProfileParts"
import { ink, muted } from "./Surface"

/**
 * What the page and business request reviews share (backend `docs/group-pages.md`,
 * `docs/business-accounts.md`): both become an account the requester runs, so both are decided
 * the same way — approve with a username, ask for a change, or decline with a reason.
 */

export type DecisionMode = "approve" | "changes" | "decline"

const modes: Array<{ value: DecisionMode; label: string }> = [
  { value: "approve", label: "Approve" },
  { value: "changes", label: "Ask for changes" },
  { value: "decline", label: "Decline" },
]

export function DecisionModes({ mode, onChange }: { mode: DecisionMode; onChange: (mode: DecisionMode) => void }) {
  return <div role="radiogroup" aria-label="Decision" className="grid grid-cols-3 gap-1 rounded-2xl bg-grey-50 p-1 dark:bg-background">
    {modes.map((item) => <button key={item.value} type="button" role="radio" aria-checked={mode === item.value} onClick={() => onChange(item.value)}
      className={cn("cursor-pointer rounded-xl px-2 py-2 text-b4 font-semibold transition-colors sm:text-b3", mode === item.value ? "bg-white text-purple shadow-adbox-small dark:bg-card" : "text-grey-500 hover:text-grey-1000 dark:text-muted-foreground dark:hover:text-foreground")}>
      {item.label}
    </button>)}
  </div>
}

/** Only an admin who may decide sees the controls. */
export function NoDecision({ permission }: { permission: string }) {
  return <>
    <h2 className={cn("text-b1 font-semibold", ink)}>Decision</h2>
    <p className={cn("mt-1 text-b3", muted)}>Deciding needs the <span className="font-mono text-b4">{permission}</span> permission.</p>
  </>
}

/** A private file they sent (a letter, a certificate, a photo): shown when it is a picture, opened full size. */
export function ProofFile({ file, url, what }: { file: { name: string; sizeKb: number }; url: string | null; what: string }) {
  const safe = safeImageUrl(url)
  return <div className="flex min-w-0 flex-col gap-2">
    {isPicture(file.name) && safe
      ? <a href={safe} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-grey-200 dark:border-border">
        <img src={safe} alt={`${what}: ${file.name}`} referrerPolicy="no-referrer" className="aspect-[1/1.3] w-full max-w-56 bg-grey-50 object-contain dark:bg-background" />
      </a>
      : <div aria-hidden="true" className="flex aspect-[1/1.3] w-full max-w-56 flex-col items-center justify-center gap-2 rounded-xl border border-grey-200 bg-grey-50 dark:border-border dark:bg-background">
        <FileText className="size-8 text-grey-400" />
        <span className={cn("text-b4 font-semibold", muted)}>PDF</span>
      </div>}
    <p className={cn("truncate text-b4 font-semibold", ink)} title={file.name}>{file.name}</p>
    <p className={cn("text-b4", muted)}>{file.sizeKb.toLocaleString()} KB · private</p>
    {safe
      ? <Button asChild variant="outline" className="h-9 w-fit cursor-pointer rounded-full px-3">
        <a href={safe} target="_blank" rel="noopener noreferrer">Open full size<ExternalLink className="size-3.5" aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span></a>
      </Button>
      : <p className={cn("text-b4", muted)}>The file couldn't be linked. Reload to try again.</p>}
  </div>
}

/** The reviewer's own checks of the file; all of them gate Approve. */
export function ReviewChecklist({ legend, checks, ticked, onTick, disabled }: {
  legend: string
  checks: Array<{ key: string; label: string }>
  ticked: Record<string, boolean>
  onTick: (key: string, value: boolean) => void
  disabled: boolean
}) {
  const id = useId()
  return <fieldset className="flex min-w-0 flex-col gap-3" disabled={disabled}>
    <legend className={cn("mb-2 text-b3 font-semibold", ink)}>{legend}</legend>
    {checks.map((check) => <div key={check.key} className="flex items-start gap-3">
      <Checkbox id={`${id}-${check.key}`} checked={ticked[check.key] === true} onCheckedChange={(value) => onTick(check.key, value === true)} disabled={disabled} className="mt-0.5" />
      <label htmlFor={`${id}-${check.key}`} className={cn("cursor-pointer text-b3", ink)}>{check.label}</label>
    </div>)}
  </fieldset>
}

export function ChecksSection({ checks }: { checks: PageRequestCheck[] }) {
  return <Section icon={<ScanSearch className="size-4" aria-hidden="true" />} title="Checks AdBox ran">
    <ul className="divide-y divide-grey-100 dark:divide-border">
      {checks.map((check) => <li key={check.text} className="flex items-start gap-3 px-4 py-3">
        <span className="w-24 shrink-0"><CheckPill tone={check.tone} /></span>
        <span className={cn("text-b3", ink)}>{check.text}</span>
      </li>)}
    </ul>
  </Section>
}

export function HistorySection({ history }: { history: Array<{ at: string; text: string }> }) {
  return <Section icon={<History className="size-4" aria-hidden="true" />} title="History">
    <ol className="flex flex-col gap-2 px-4 py-3">
      {history.map((event) => <li key={event.at + event.text} className={cn("text-b3", ink)}>
        <span className={cn("tabular-nums", muted)}>{formatDate(event.at, "d MMM, HH:mm")}</span> · {event.text}
      </li>)}
    </ol>
  </Section>
}

/** The account's username, with the server's answer on whether it is free. */
export function UsernameField({ label, value, onChange, error, hint }: {
  label: string
  value: string
  onChange: (value: string) => void
  error: string | null
  hint: string
}) {
  const id = useId()
  return <div>
    <label htmlFor={id} className={cn("mb-1.5 block text-b3 font-semibold", ink)}>{label}</label>
    <div className="relative">
      <span aria-hidden="true" className={cn("pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-b2", muted)}>@</span>
      <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} autoComplete="off" spellCheck={false} maxLength={31}
        aria-invalid={Boolean(error)} aria-describedby={`${id}-hint`} className="h-11 rounded-xl pl-7" />
    </div>
    <p id={`${id}-hint`} aria-live="polite" className={cn("mt-1 text-b4", error ? "text-destructive" : muted)}>{error ?? hint}</p>
  </div>
}

export function NameField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = useId()
  return <div>
    <label htmlFor={id} className={cn("mb-1.5 block text-b3 font-semibold", ink)}>{label}</label>
    <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} maxLength={80} className="h-11 rounded-xl" />
  </div>
}

export function ChangesForm({ who, waiting, placeholder, onSend }: {
  who: string
  /** Asking again while it waits would only repeat the note. */
  waiting: boolean
  placeholder: string
  onSend: (note: string) => Promise<unknown>
}) {
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const noteId = useId()

  async function confirm() {
    if (pending) return
    const parsed = pageRequestChangesSchema.safeParse({ note })
    if (!parsed.success) { setError(parsed.error.issues[0].message); return }
    setError("")
    setPending(true)
    try {
      await onSend(parsed.data.note)
      toast.success(`Sent to ${who}`, { description: "The request waits for their change." })
    } catch (cause) {
      setError(usersErrorMessage(cause, "Could not send. Try again."))
    } finally {
      setPending(false)
    }
  }

  if (waiting) return <p className={cn("text-b3", muted)}>
    Already waiting for {who}'s change. Once they send it, the request comes back as New.
  </p>
  return <div className="flex flex-col gap-4">
    <div>
      <label htmlFor={noteId} className={cn("mb-1.5 block text-b3 font-semibold", ink)}>What should they fix?</label>
      <Textarea id={noteId} value={note} onChange={(event) => { setNote(event.target.value); setError("") }} maxLength={500} placeholder={placeholder} className="min-h-28 rounded-xl" />
      <p className={cn("mt-1 text-right text-b4", muted)}>{note.length}/500</p>
    </div>
    <p className={cn("text-b3", muted)}>{who} is told in the app and can edit and resend it.</p>
    {error && <p role="alert" className="text-b3 text-destructive">{error}</p>}
    <Button type="button" disabled={pending} className="h-11 cursor-pointer rounded-full" onClick={() => void confirm()}>
      <ClipboardCheck className="size-4" aria-hidden="true" />{pending ? "Sending…" : `Send to ${who}`}
    </Button>
  </div>
}

export function DeclineForm({ who, name, labels, placeholder, onDecline }: {
  who: string
  /** What is being declined, for the toast. */
  name: string
  labels: Record<DeclineReason, string>
  placeholder: string
  onDecline: (input: { reason: DeclineReason; note: string }) => Promise<unknown>
}) {
  const [reason, setReason] = useState<DeclineReason | "">("")
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const reasonId = useId()
  const noteId = useId()

  async function confirm() {
    if (pending) return
    if (!reason) { setError("Choose a reason."); return }
    if (note.trim().length > 500) { setError("At most 500 characters."); return }
    setError("")
    setPending(true)
    try {
      await onDecline({ reason, note })
      toast.success(`${name} declined`, { description: `${who} is told in the app and can ask again.` })
    } catch (cause) {
      setError(usersErrorMessage(cause, "Could not decline. Try again."))
    } finally {
      setPending(false)
    }
  }

  return <div className="flex flex-col gap-4">
    <div>
      <label htmlFor={reasonId} className={cn("mb-1.5 block text-b3 font-semibold", ink)}>Reason</label>
      <Select value={reason} onValueChange={(value) => { setReason(value as DeclineReason); setError("") }}>
        <SelectTrigger id={reasonId} className="h-11 w-full rounded-xl"><SelectValue placeholder="Choose a reason" /></SelectTrigger>
        <SelectContent>
          {declineReasons.map((value) => <SelectItem key={value} value={value}>{labels[value]}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
    <div>
      <label htmlFor={noteId} className={cn("mb-1.5 block text-b3 font-semibold", ink)}>Note for {who} (optional)</label>
      <Textarea id={noteId} value={note} onChange={(event) => { setNote(event.target.value); setError("") }} maxLength={500} placeholder={placeholder} className="min-h-24 rounded-xl" />
    </div>
    <p className={cn("text-b3", muted)}>Closes the request. They see the reason and can send a new one.</p>
    {error && <p role="alert" className="text-b3 text-destructive">{error}</p>}
    <Button type="button" variant="destructive" disabled={pending} className="h-11 cursor-pointer rounded-full" onClick={() => void confirm()}>
      <CircleSlash className="size-4" aria-hidden="true" />{pending ? "Declining…" : "Decline request"}
    </Button>
  </div>
}

/** "Added" or "No …" for a picture they may have sent. */
export function Added({ done, yes, no }: { done: boolean; yes: string; no: string }) {
  return <span className={cn("rounded-full px-2.5 py-1 text-b4 font-semibold", done ? "bg-grey-100 text-grey-700 dark:bg-muted dark:text-foreground" : "bg-warning-500/10 text-warning-700 dark:text-warning-300")}>{done ? yes : no}</span>
}

/** A request's cover across the top of its header, when it sent one. */
export function Cover({ url }: { url: string | null }) {
  const src = safeImageUrl(url)
  if (!src) return null
  return <img src={src} alt="" referrerPolicy="no-referrer" className="h-28 w-full object-cover sm:h-36" />
}

export function ExternalAnchor({ href, children }: { href: string; children: ReactNode }) {
  const safe = safeImageUrl(href)
  if (!safe) return <>{children}</>
  return <a href={safe} target="_blank" rel="noopener noreferrer" className="inline-flex min-w-0 items-center gap-1 text-blue hover:underline dark:text-cyan">
    <span className="truncate">{children}</span><ExternalLink className="size-3.5 shrink-0" aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span>
  </a>
}
