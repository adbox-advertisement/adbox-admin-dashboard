import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useRolesStore } from "../store/roles-store"
import type { Role } from "../types"

export function RemoveRoleDialog({ role, open, onOpenChange }: { role: Role; open: boolean; onOpenChange: (open: boolean) => void }) {
  const removeRole = useRolesStore((state) => state.removeRole)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <div className="pr-7">
          <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"><Trash2 className="size-6" aria-hidden="true" /></span>
          <DialogTitle>Remove {role.name}?</DialogTitle>
          <DialogDescription className="mt-2">Admins assigned this role will need a new one. This can't be undone.</DialogDescription>
        </div>
        <div className="mt-2 flex justify-end gap-3">
          <DialogClose asChild><Button type="button" variant="outline" className="h-11 rounded-xl px-4">Cancel</Button></DialogClose>
          <Button
            type="button"
            variant="destructive"
            className="h-11 rounded-xl px-4"
            onClick={() => { removeRole(role.id); onOpenChange(false) }}
          >
            Remove role
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
