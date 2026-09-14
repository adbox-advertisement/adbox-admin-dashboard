import { Trash2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useDeleteRole } from "../hooks"
import { rbacErrorMessage } from "../lib/errors"
import type { Role } from "../types"

export function RemoveRoleDialog({ role, open, onOpenChange }: { role: Role; open: boolean; onOpenChange: (open: boolean) => void }) {
  const removeRole = useDeleteRole()
  const [error, setError] = useState("")

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!removeRole.isPending) onOpenChange(next) }}>
      <DialogContent className="rounded-3xl">
        <div className="pr-7">
          <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"><Trash2 className="size-6" aria-hidden="true" /></span>
          <DialogTitle>Remove {role.name}?</DialogTitle>
          <DialogDescription className="mt-2">Admins assigned this role will lose the permissions it grants. This can't be undone.</DialogDescription>
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="mt-2 flex justify-end gap-3">
          <DialogClose asChild><Button type="button" variant="outline" disabled={removeRole.isPending} className="h-11 cursor-pointer rounded-xl px-4">Cancel</Button></DialogClose>
          <Button
            type="button"
            variant="destructive"
            className="h-11 cursor-pointer rounded-xl px-4"
            disabled={removeRole.isPending || role.isSystem}
            onClick={() => {
              if (removeRole.isPending || role.isSystem) return
              setError("")
              removeRole.mutate(role.id, {
                onSuccess: () => onOpenChange(false),
                onError: (error) => setError(rbacErrorMessage(error, "Could not remove the role. Try again.")),
              })
            }}
          >
            {removeRole.isPending ? "Removing…" : "Remove role"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
