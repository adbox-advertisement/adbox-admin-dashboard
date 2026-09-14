import { useState } from "react"
import { EllipsisVertical, KeyRound, Pencil, ShieldCheck, UserCheck, UserX } from "lucide-react"
import { useCurrentAdmin } from "@/features/auth"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAdmin, useRbacAccess } from "../hooks"
import { rbacErrorMessage } from "../lib/errors"
import { AdminFormDialog } from "./AdminFormDialog"
import { AdminAccessDialog } from "./AdminAccessDialog"
import { AdminStatusDialog } from "./AdminStatusDialog"
import { adminDisplayName, type Admin } from "../types"

type Action = "edit" | "roles" | "permissions" | "status"

function AdminAction({ id, action, onClose }: { id: string; action: Action; onClose: () => void }) {
  const detail = useAdmin(id)
  // Fetch the account's latest assignments before initializing a replacement form.
  if (!detail.data) return <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
    <DialogContent>
      <DialogTitle>Admin account</DialogTitle>
      <DialogDescription>Load the current account details.</DialogDescription>
      {detail.isError ? <div role="alert">
        <p className="text-sm text-destructive">{rbacErrorMessage(detail.error, "Could not load the admin.", "admin")}</p>
        <Button type="button" variant="outline" onClick={() => void detail.refetch()}>Retry admin</Button>
      </div> : <p role="status">Loading admin…</p>}
    </DialogContent>
  </Dialog>
  if (action === "edit") return <AdminFormDialog mode="edit" admin={detail.data} open onOpenChange={(open) => { if (!open) onClose() }} />
  if (action === "status") return <AdminStatusDialog admin={detail.data} onClose={onClose} />
  return <AdminAccessDialog admin={detail.data} mode={action} onClose={onClose} />
}

export function AdminRowMenu({ admin }: { admin: Admin }) {
  const [activeAction, setActiveAction] = useState<Action | null>(null)
  const can = useRbacAccess()
  const profile = useCurrentAdmin()
  const isOtherAccount = Boolean(profile.data && profile.data.id !== admin.id)
  const canEdit = can("admins.update")
  const canAssignRoles = isOtherAccount && can("admins.roles.assign")
  const canAssignPermissions = isOtherAccount && can("admins.permissions.assign")
  if (!canEdit && !canAssignRoles && !canAssignPermissions) return null
  const StatusIcon = admin.isActive ? UserX : UserCheck

  return <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label={`Open actions for ${adminDisplayName(admin)}`} className="size-9 cursor-pointer rounded-full text-muted-foreground hover:bg-secondary/8 hover:text-secondary">
          <EllipsisVertical className="size-5" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={!canEdit} onSelect={() => setActiveAction("edit")}><Pencil className="size-4" aria-hidden="true" />Edit profile</DropdownMenuItem>
        <DropdownMenuItem disabled={!canAssignRoles} onSelect={() => setActiveAction("roles")}><ShieldCheck className="size-4" aria-hidden="true" />Assign roles</DropdownMenuItem>
        <DropdownMenuItem disabled={!canAssignPermissions} onSelect={() => setActiveAction("permissions")}><KeyRound className="size-4" aria-hidden="true" />Direct permissions</DropdownMenuItem>
        <DropdownMenuItem disabled={!canEdit || !isOtherAccount} onSelect={() => setActiveAction("status")} className={admin.isActive ? "text-destructive focus:text-destructive" : undefined}><StatusIcon className="size-4" aria-hidden="true" />{admin.isActive ? "Deactivate" : "Reactivate"}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    {activeAction && <AdminAction id={admin.id} action={activeAction} onClose={() => setActiveAction(null)} />}
  </>
}
