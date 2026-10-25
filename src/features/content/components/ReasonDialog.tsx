import { useId, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { moderationReasonSchema, type ModerationReason } from "../validation"

// Confirmation for a moderation action, with an optional audited reason.
export function ReasonDialog({ title, description, confirmLabel, destructive, askReason, icon, pending, error, onConfirm, onClose }: {
  title: string
  description: string
  confirmLabel: string
  destructive?: boolean
  askReason?: boolean
  icon: ReactNode
  pending: boolean
  error: string
  onConfirm: (input: ModerationReason) => void
  onClose: () => void
}) {
  const [reason, setReason] = useState("")
  const [localError, setLocalError] = useState("")
  const id = useId()

  return <Dialog open onOpenChange={(open) => { if (!open && !pending) onClose() }}>
    <DialogContent className="rounded-3xl">
      <div className="pr-7">
        <span className="mb-4 block">{icon}</span>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className="mt-2">{description}</DialogDescription>
      </div>
      {askReason && <div>
        <label htmlFor={id} className="mb-2 block text-sm font-medium">Reason <span className="font-normal text-muted-foreground">(optional, kept in the audit log)</span></label>
        <Textarea id={id} value={reason} onChange={(event) => { setReason(event.target.value); setLocalError("") }} maxLength={500} disabled={pending} placeholder="e.g. Reported for harassment" className="min-h-24 rounded-xl" />
        <p className="mt-1 text-right text-b4 text-muted-foreground">{reason.length}/500</p>
      </div>}
      {(localError || error) && <p role="alert" className="text-sm text-destructive">{localError || error}</p>}
      <div className="flex justify-end gap-3">
        <DialogClose asChild><Button type="button" variant="outline" disabled={pending} className="h-11 rounded-full px-5">Cancel</Button></DialogClose>
        <Button type="button" variant={destructive ? "destructive" : "default"} disabled={pending} className="h-11 rounded-full px-5"
          onClick={() => {
            const parsed = moderationReasonSchema.safeParse({ reason: reason.trim() || undefined })
            if (!parsed.success) { setLocalError(parsed.error.issues[0].message); return }
            onConfirm(parsed.data)
          }}>
          {pending ? "Saving…" : confirmLabel}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
}
