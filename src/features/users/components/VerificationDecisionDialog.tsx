import { useId, useState } from "react"
import { ShieldCheck, ShieldX } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useApproveVerification, useRejectVerification } from "../hooks"
import { usersErrorMessage } from "../lib/errors"
import { rejectVerificationSchema } from "../validation"

export function VerificationDecisionDialog({ requestId, decision, applicant, institution, onClose }: {
  requestId: string
  decision: "approve" | "reject"
  applicant: string
  institution: string
  onClose: () => void
}) {
  const approve = useApproveVerification()
  const reject = useRejectVerification()
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const noteId = useId()
  const pending = approve.isPending || reject.isPending
  const approving = decision === "approve"
  const Icon = approving ? ShieldCheck : ShieldX

  function confirm() {
    if (pending) return
    setError("")
    if (approving) {
      approve.mutate(requestId, {
        onSuccess: () => { toast.success(`${applicant} is now verified`); onClose() },
        onError: (cause) => setError(usersErrorMessage(cause, "Could not approve the request. Try again.")),
      })
      return
    }
    const parsed = rejectVerificationSchema.safeParse({ rejectionNote: note })
    if (!parsed.success) { setError(parsed.error.issues[0].message); return }
    reject.mutate({ id: requestId, input: parsed.data }, {
      onSuccess: () => { toast.success("Verification request rejected"); onClose() },
      onError: (cause) => setError(usersErrorMessage(cause, "Could not reject the request. Try again.")),
    })
  }

  return <Dialog open onOpenChange={(next) => { if (!next && !pending) onClose() }}>
    <DialogContent className="rounded-3xl">
      <div className="pr-7">
        <Icon className={approving ? "mb-4 size-7 text-success-600" : "mb-4 size-7 text-destructive"} aria-hidden="true" />
        <DialogTitle>{approving ? "Approve verification?" : "Reject verification?"}</DialogTitle>
        <DialogDescription className="mt-2">
          {approving
            ? `${applicant} will be marked as a verified member of ${institution}. Make sure you have checked the evidence.`
            : `${applicant} will return to self-declared status for ${institution} and can submit new evidence.`}
        </DialogDescription>
      </div>
      {!approving && <div>
        <label htmlFor={noteId} className="mb-2 block text-sm font-medium">Reason for rejection</label>
        <Textarea id={noteId} value={note} onChange={(event) => { setNote(event.target.value); setError("") }} maxLength={500} placeholder="e.g. The uploaded ID is not legible." className="min-h-24 rounded-xl" disabled={pending} aria-describedby={`${noteId}-help`} />
        <p id={`${noteId}-help`} className="mt-1 flex justify-between text-b4 text-muted-foreground"><span>Saved with the request and the audit log.</span><span>{note.length}/500</span></p>
      </div>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-3">
        <DialogClose asChild><Button type="button" variant="outline" disabled={pending} className="h-11 rounded-full px-5">Cancel</Button></DialogClose>
        <Button type="button" variant={approving ? "default" : "destructive"} disabled={pending} className="h-11 rounded-full px-5" onClick={confirm}>
          {pending ? "Saving…" : approving ? "Approve" : "Reject request"}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
}
