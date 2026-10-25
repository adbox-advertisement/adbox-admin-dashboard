import { useId, useState } from "react"
import { Building2, ShieldX } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useApproveCompany, useRejectCompany } from "../hooks"
import { usersErrorMessage } from "../lib/errors"
import { rejectCompanySchema } from "../validation"

export function CompanyDecisionDialog({ companyId, companyName, decision, onClose }: {
  companyId: string
  companyName: string
  decision: "approve" | "reject"
  onClose: () => void
}) {
  const approve = useApproveCompany()
  const reject = useRejectCompany()
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const noteId = useId()
  const pending = approve.isPending || reject.isPending
  const approving = decision === "approve"
  const Icon = approving ? Building2 : ShieldX

  function confirm() {
    if (pending) return
    setError("")
    if (approving) {
      approve.mutate(companyId, {
        onSuccess: () => { toast.success(`${companyName} approved`, { description: "Its publishers now carry the verified company seal." }); onClose() },
        onError: (cause) => setError(usersErrorMessage(cause, "Could not approve the company. Try again.")),
      })
      return
    }
    const parsed = rejectCompanySchema.safeParse({ rejectionNote: note })
    if (!parsed.success) { setError(parsed.error.issues[0].message); return }
    reject.mutate({ id: companyId, input: parsed.data }, {
      onSuccess: () => { toast.success(`${companyName} rejected`); onClose() },
      onError: (cause) => setError(usersErrorMessage(cause, "Could not reject the company. Try again.")),
    })
  }

  return <Dialog open onOpenChange={(next) => { if (!next && !pending) onClose() }}>
    <DialogContent className="rounded-3xl">
      <div className="pr-7">
        <Icon className={approving ? "mb-4 size-7 text-success-600" : "mb-4 size-7 text-destructive"} aria-hidden="true" />
        <DialogTitle>{approving ? `Approve ${companyName}?` : `Reject ${companyName}?`}</DialogTitle>
        <DialogDescription className="mt-2">
          {approving
            ? "Approved companies can run campaigns, and every publisher in them shows the verified company seal. Check the registration number first."
            : "Its campaigns can't leave draft and its publishers lose the company seal. The reason is saved with the company and the audit log."}
        </DialogDescription>
      </div>
      {!approving && <div>
        <label htmlFor={noteId} className="mb-2 block text-sm font-medium">Reason for rejection</label>
        <Textarea id={noteId} value={note} onChange={(event) => { setNote(event.target.value); setError("") }} maxLength={500} placeholder="e.g. Registration number does not match the register." className="min-h-24 rounded-xl" disabled={pending} />
        <p className="mt-1 text-right text-b4 text-muted-foreground">{note.length}/500</p>
      </div>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-3">
        <DialogClose asChild><Button type="button" variant="outline" disabled={pending} className="h-11 rounded-full px-5">Cancel</Button></DialogClose>
        <Button type="button" variant={approving ? "default" : "destructive"} disabled={pending} className="h-11 rounded-full px-5" onClick={confirm}>
          {pending ? "Saving…" : approving ? "Approve company" : "Reject company"}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
}
