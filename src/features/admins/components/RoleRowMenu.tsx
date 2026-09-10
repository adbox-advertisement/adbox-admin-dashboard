import { useState } from "react"
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { RemoveRoleDialog } from "./RemoveRoleDialog"
import { RoleFormDialog } from "./RoleFormDialog"
import type { Role } from "../types"

export function RoleRowMenu({ role }: { role: Role }) {
  const [activeAction, setActiveAction] = useState<"edit" | "remove" | null>(null)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={"Open actions for " + role.name}
            className="size-9 rounded-full text-muted-foreground hover:bg-secondary/8 hover:text-secondary"
          >
            <EllipsisVertical className="size-5" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Both open the same form: Permissions is one field on the same
              Edit Roles dialog as name/description, not a separate flow. */}
          <DropdownMenuItem onSelect={() => setActiveAction("edit")}>
            <Pencil className="size-4" aria-hidden="true" />Edit Permission
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setActiveAction("edit")}>
            <Pencil className="size-4" aria-hidden="true" />Edit role
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setActiveAction("remove")} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
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
      <RemoveRoleDialog
        key={activeAction === "remove" ? "remove-" + role.id : "remove-closed"}
        role={role}
        open={activeAction === "remove"}
        onOpenChange={(open) => setActiveAction(open ? "remove" : null)}
      />
    </>
  )
}
