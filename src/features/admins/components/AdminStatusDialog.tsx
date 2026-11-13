import { useState } from "react"
import { UserCheck, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useUpdateAdmin, useViewer } from "../hooks"
import { access } from "../lib/access"
import { rbacErrorMessage } from "../lib/errors"
import { adminDisplayName, type Admin } from "../types"

/** Deactivate (signs them out everywhere, keeps the account) or reactivate. Super Admin only. */
export function AdminStatusDialog({ admin, onClose, onSaved }: { admin: Admin; onClose: () => void; onSaved: (message: string) => void }) {
  const save = useUpdateAdmin()
  const viewer = useViewer()
  const [error, setError] = useState("")
  const allowed = access.changeStatus(viewer, admin)
  const name = adminDisplayName(admin)
  const action = admin.isActive ? "Deactivate" : "Reactivate"
  const Icon = admin.isActive ? UserX : UserCheck

  return <Dialog open onOpenChange={(next) => { if (!next && !save.isPending) onClose() }}>
    <DialogContent className="rounded-3xl">
      <div className="pr-7">
        <span className={cn("mb-4 flex size-12 items-center justify-center rounded-2xl", admin.isActive ? "bg-destructive/10 text-destructive" : "bg-success-500/10 text-success-700 dark:text-success-400")}><Icon className="size-6" aria-hidden="true" /></span>
        <DialogTitle>{action} {name}?</DialogTitle>
        <DialogDescription className="mt-2">{admin.isActive
          ? "They're signed out everywhere straight away and can't sign in again. Their roles and permissions are kept, so you can reactivate them later."
          : "They can sign in again, with the roles and permissions they had."}</DialogDescription>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2">
        <DialogClose asChild><Button type="button" variant="outline" disabled={save.isPending} className="h-10 rounded-full px-4">Cancel</Button></DialogClose>
        <Button type="button" variant={admin.isActive ? "destructive" : "default"} disabled={save.isPending || !allowed} className="h-10 rounded-full px-4"
          onClick={() => {
            if (save.isPending || !allowed) return
            setError("")
            save.mutate({ id: admin.id, input: { isActive: !admin.isActive } }, {
              onSuccess: () => { onSaved(admin.isActive ? `${name} is deactivated and signed out.` : `${name} can sign in again.`); onClose() },
              onError: (failure) => setError(rbacErrorMessage(failure, `Could not ${action.toLowerCase()} ${name}. Try again.`, "admin")),
            })
          }}>
          {save.isPending ? "Saving…" : `${action} admin`}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
}
