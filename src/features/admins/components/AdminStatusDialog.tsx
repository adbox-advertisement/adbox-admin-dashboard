import { useState } from "react"
import { UserCheck, UserX } from "lucide-react"
import { useCurrentAdmin } from "@/features/auth"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useRbacAccess, useUpdateAdmin } from "../hooks"
import { rbacErrorMessage } from "../lib/errors"
import { adminDisplayName, type Admin } from "../types"

export function AdminStatusDialog({ admin, onClose }: { admin: Admin; onClose: () => void }) {
  const save = useUpdateAdmin()
  const can = useRbacAccess()
  const profile = useCurrentAdmin()
  const [error, setError] = useState("")
  const allowed = Boolean(profile.data && profile.data.id !== admin.id) && can("admins.update")
  const action = admin.isActive ? "Deactivate" : "Reactivate"
  const Icon = admin.isActive ? UserX : UserCheck

  return <Dialog open onOpenChange={(next) => { if (!next && !save.isPending) onClose() }}>
    <DialogContent className="rounded-3xl">
      <div className="pr-7">
        <Icon className="mb-4 size-7 text-secondary" aria-hidden="true" />
        <DialogTitle>{action} {adminDisplayName(admin)}?</DialogTitle>
        <DialogDescription className="mt-2">{admin.isActive ? "This revokes all their active sessions and prevents sign-in. You can reactivate the account later." : "This allows the admin to sign in again with their existing roles and permissions."}</DialogDescription>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-3">
        <DialogClose asChild><Button type="button" variant="outline" disabled={save.isPending} className="h-11 rounded-full px-5">Cancel</Button></DialogClose>
        <Button type="button" variant={admin.isActive ? "destructive" : "default"} disabled={save.isPending || !allowed} className="h-11 rounded-full px-5"
          onClick={() => {
            if (save.isPending || !allowed) return
            setError("")
            save.mutate({ id: admin.id, input: { isActive: !admin.isActive } }, {
              onSuccess: onClose,
              onError: (error) => setError(rbacErrorMessage(error, `Could not ${action.toLowerCase()} the admin. Try again.`, "admin")),
            })
          }}>
          {save.isPending ? "Saving…" : `${action} admin`}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
}
