import { useState } from "react"
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { RemoveRoleDialog } from "./RemoveRoleDialog"
import { RoleFormDialog } from "./RoleFormDialog"
import { RolePermissionsDialog } from "./RolePermissionsDialog"
import { useRbacAccess } from "../hooks"
import type { Role } from "../types"

export function RoleRowMenu({ role }: { role: Role }) {
  const [activeAction, setActiveAction] = useState<"edit" | "permissions" | "remove" | null>(null)
  const can = useRbacAccess()

  if (role.isSystem) return <span className="text-xs text-muted-foreground">System role</span>
  if (!can("roles.update") && !can("roles.delete") && !can("roles.permissions.assign")) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={"Open actions for " + role.name}
            className="size-9 cursor-pointer rounded-full text-muted-foreground hover:bg-secondary/8 hover:text-secondary"
          >
            <EllipsisVertical className="size-5" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled={!can("roles.permissions.assign")} onSelect={() => setActiveAction("permissions")} className="cursor-pointer">
            <Pencil className="size-4" aria-hidden="true" />Edit permissions
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!can("roles.update")} onSelect={() => setActiveAction("edit")} className="cursor-pointer">
            <Pencil className="size-4" aria-hidden="true" />Edit role
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!can("roles.delete")} onSelect={() => setActiveAction("remove")} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
            <Trash2 className="size-4" aria-hidden="true" />Delete role
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <RoleFormDialog
        key={activeAction === "edit" ? "edit-" + role.id : "edit-closed"}
        mode="edit"
        role={role}
        open={activeAction === "edit"}
        onOpenChange={(open) => setActiveAction(open ? "edit" : null)}
      />
      <RolePermissionsDialog key={activeAction === "permissions" ? role.id : "permissions-closed"} role={role} open={activeAction === "permissions"} onOpenChange={(open) => setActiveAction(open ? "permissions" : null)} />
      <RemoveRoleDialog
        key={activeAction === "remove" ? "remove-" + role.id : "remove-closed"}
        role={role}
        open={activeAction === "remove"}
        onOpenChange={(open) => setActiveAction(open ? "remove" : null)}
      />
    </>
  )
}
