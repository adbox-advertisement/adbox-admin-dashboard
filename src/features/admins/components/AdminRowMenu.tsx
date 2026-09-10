import { useState } from "react"
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AdminFormDialog } from "./AdminFormDialog"
import { RemoveAdminDialog } from "./RemoveAdminDialog"
import { adminDisplayName, type Admin } from "../types"

export function AdminRowMenu({ admin }: { admin: Admin }) {
  const [activeAction, setActiveAction] = useState<"edit" | "remove" | null>(null)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={"Open actions for " + adminDisplayName(admin)}
            className="size-9 rounded-full text-muted-foreground hover:bg-secondary/8 hover:text-secondary"
          >
            <EllipsisVertical className="size-5" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setActiveAction("edit")}>
            <Pencil className="size-4" aria-hidden="true" />Edit profile
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setActiveAction("remove")} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
            <Trash2 className="size-4" aria-hidden="true" />Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AdminFormDialog
        key={activeAction === "edit" ? "edit-" + admin.id : "edit-closed"}
        mode="edit"
        admin={admin}
        open={activeAction === "edit"}
        onOpenChange={(open) => setActiveAction(open ? "edit" : null)}
      />
      <RemoveAdminDialog
        key={activeAction === "remove" ? "remove-" + admin.id : "remove-closed"}
        admin={admin}
        open={activeAction === "remove"}
        onOpenChange={(open) => setActiveAction(open ? "remove" : null)}
      />
    </>
  )
}
