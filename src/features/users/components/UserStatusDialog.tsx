import { useId, useState } from "react"
import { UserCheck, UserX } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useReactivatePlatformUser, useSuspendPlatformUser, useUserAccess } from "../hooks"
import { usersErrorMessage } from "../lib/errors"
import { USER_PERMISSIONS, userDisplayName, type PlatformUser } from "../types"
import { suspendPlatformUserSchema } from "../validation"

export function UserStatusDialog({ user, onClose }: { user: PlatformUser; onClose: () => void }) {
  const suspend = useSuspendPlatformUser()
  const reactivate = useReactivatePlatformUser()
  const can = useUserAccess()
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const reasonId = useId()
  const pending = suspend.isPending || reactivate.isPending
  const allowed = can(USER_PERMISSIONS.suspend)
  const name = userDisplayName(user)
  const Icon = user.isActive ? UserX : UserCheck

  function confirm() {
    if (pending || !allowed) return
    setError("")
    if (user.isActive) {
      const parsed = suspendPlatformUserSchema.safeParse({ reason: reason.trim() || undefined })
      if (!parsed.success) { setError(parsed.error.issues[0].message); return }
      suspend.mutate({ id: user.id, input: parsed.data }, {
        onSuccess: (result) => {
          toast.success(`${name} suspended`, { description: `${result.revokedSessions} active session${result.revokedSessions === 1 ? "" : "s"} signed out.` })
          onClose()
        },
        onError: (cause) => setError(usersErrorMessage(cause, "Could not suspend the user. Try again.")),
      })
    } else {
      reactivate.mutate(user.id, {
        onSuccess: () => { toast.success(`${name} reactivated`); onClose() },
        onError: (cause) => setError(usersErrorMessage(cause, "Could not reactivate the user. Try again.")),
      })
    }
  }

  return <Dialog open onOpenChange={(next) => { if (!next && !pending) onClose() }}>
    <DialogContent className="rounded-3xl">
      <div className="pr-7">
        <Icon className={user.isActive ? "mb-4 size-7 text-destructive" : "mb-4 size-7 text-secondary"} aria-hidden="true" />
        <DialogTitle>{user.isActive ? "Suspend" : "Reactivate"} {name}?</DialogTitle>
        <DialogDescription className="mt-2">
          {user.isActive
            ? "Suspending signs the user out of every device immediately and blocks new sign-ins. Their content and data are kept, and you can reactivate the account later."
            : "Reactivating lets the user sign in again. They will need to sign in again on each device."}
        </DialogDescription>
      </div>
      {user.isActive && <div>
        <label htmlFor={reasonId} className="mb-2 block text-sm font-medium">Reason <span className="font-normal text-muted-foreground">(optional, kept in the audit log)</span></label>
        <Textarea id={reasonId} value={reason} onChange={(event) => { setReason(event.target.value); setError("") }} maxLength={500} placeholder="e.g. Spam reports from multiple users" className="min-h-24 rounded-xl" disabled={pending} />
        <p className="mt-1 text-right text-b4 text-muted-foreground">{reason.length}/500</p>
      </div>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-3">
        <DialogClose asChild><Button type="button" variant="outline" disabled={pending} className="h-11 rounded-full px-5">Cancel</Button></DialogClose>
        <Button type="button" variant={user.isActive ? "destructive" : "default"} disabled={pending || !allowed} className="h-11 rounded-full px-5" onClick={confirm}>
          {pending ? "Saving…" : user.isActive ? "Suspend user" : "Reactivate user"}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
}
