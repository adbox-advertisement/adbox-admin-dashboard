import { useId, useState } from "react"
import { Award, CircleSlash } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useDeclineHonour, useGrantHonour } from "../hooks"
import { usersErrorMessage } from "../lib/errors"
import { declineHonourSchema, grantHonourSchema } from "../validation"

export function HonourDecisionDialog({ userId, name, decision, rulesMet, onClose }: {
  userId: string
  name: string
  decision: "grant" | "decline"
  /** False when a nomination, eligibility or campus-cap rule is unmet: granting then needs an override with a note. */
  rulesMet: boolean
  onClose: () => void
}) {
  const grant = useGrantHonour()
  const decline = useDeclineHonour()
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const noteId = useId()
  const pending = grant.isPending || decline.isPending
  const granting = decision === "grant"
  const override = granting && !rulesMet
  const noteRequired = !granting || override

  function confirm() {
    if (pending) return
    setError("")
    const trimmed = note.trim()
    if (granting) {
      const parsed = grantHonourSchema.safeParse({ override: override || undefined, note: trimmed || undefined })
      if (!parsed.success) { setError(parsed.error.issues[0].message); return }
      grant.mutate({ userId, input: parsed.data }, {
        onSuccess: () => { toast.success(`Gye Nyame granted to ${name}`, { description: "They'll be notified in the app." }); onClose() },
        onError: (cause) => setError(usersErrorMessage(cause, "Could not grant the honour. Try again.")),
      })
      return
    }
    const parsed = declineHonourSchema.safeParse({ note: trimmed })
    if (!parsed.success) { setError(parsed.error.issues[0].message); return }
    decline.mutate({ userId, input: parsed.data }, {
      onSuccess: () => { toast.success(`Declined for this year`); onClose() },
      onError: (cause) => setError(usersErrorMessage(cause, "Could not record the decision. Try again.")),
    })
  }

  return <Dialog open onOpenChange={(next) => { if (!next && !pending) onClose() }}>
    <DialogContent className="rounded-3xl">
      <div className="pr-7">
        {granting ? <Award className="mb-4 size-7 text-warning-600" aria-hidden="true" /> : <CircleSlash className="mb-4 size-7 text-destructive" aria-hidden="true" />}
        <DialogTitle>{granting ? `Grant Gye Nyame to ${name}?` : `Decline ${name} this year?`}</DialogTitle>
        <DialogDescription className="mt-2">
          {granting
            ? override
              ? "Not every rule is met. You can still grant it, but you must explain why. The override is recorded in the audit log."
              : "The honour lasts a year from today. They'll be notified, and the badge appears beside their name everywhere."
            : "They won't be told. Nominations can continue, and you can still grant it later this year."}
        </DialogDescription>
      </div>
      <div>
        <label htmlFor={noteId} className="mb-2 block text-sm font-medium">
          {override ? "Why override the rules?" : granting ? "Note" : "Reason"} {!noteRequired && <span className="font-normal text-muted-foreground">(optional)</span>}
        </label>
        <Textarea id={noteId} value={note} onChange={(event) => { setNote(event.target.value); setError("") }} maxLength={500} className="min-h-24 rounded-xl" disabled={pending}
          placeholder={granting ? "e.g. Led the campus clean-up drive for three terms." : "e.g. Contribution is mostly reposts."} />
        <p className="mt-1 flex justify-between text-b4 text-muted-foreground"><span>Seen by reviewers only.</span><span>{note.length}/500</span></p>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-3">
        <DialogClose asChild><Button type="button" variant="outline" disabled={pending} className="h-11 rounded-full px-5">Cancel</Button></DialogClose>
        <Button type="button" variant={granting ? "default" : "destructive"} disabled={pending} className="h-11 rounded-full px-5" onClick={confirm}>
          {pending ? "Saving…" : granting ? override ? "Override and grant" : "Grant honour" : "Decline"}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
}
