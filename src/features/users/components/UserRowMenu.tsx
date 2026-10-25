import { useState } from "react"
import { Eye, EllipsisVertical, Pencil, UserCheck, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useUserAccess } from "../hooks"
import { USER_PERMISSIONS, accountStatusOf, userDisplayName, type PlatformUser } from "../types"
import { UserEditDialog } from "./UserEditDialog"
import { UserStatusDialog } from "./UserStatusDialog"

export function UserRowMenu({ user, onView }: { user: PlatformUser; onView: () => void }) {
  const can = useUserAccess()
  const [action, setAction] = useState<"edit" | "status" | null>(null)
  const canEdit = can(USER_PERMISSIONS.update) && Boolean(user.userProfile)
  // Owner-deactivated, pending-deletion and erased accounts are the owner's to restore, not staff's.
  const status = accountStatusOf(user)
  const canSuspend = can(USER_PERMISSIONS.suspend) && (status === "active" || status === "suspended")
  const StatusIcon = user.isActive ? UserX : UserCheck

  return <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label={`Open actions for ${userDisplayName(user)}`} className="size-9 cursor-pointer rounded-full text-muted-foreground hover:bg-secondary/8 hover:text-secondary">
          <EllipsisVertical className="size-5" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={onView}><Eye className="size-4" aria-hidden="true" />View profile</DropdownMenuItem>
        {canEdit && <DropdownMenuItem onSelect={() => setAction("edit")}><Pencil className="size-4" aria-hidden="true" />Edit profile</DropdownMenuItem>}
        {canSuspend && <DropdownMenuItem onSelect={() => setAction("status")} className={user.isActive ? "text-destructive focus:text-destructive" : undefined}>
          <StatusIcon className="size-4" aria-hidden="true" />{user.isActive ? "Suspend user" : "Reactivate user"}
        </DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
    {action === "edit" && <UserEditDialog user={user} onClose={() => setAction(null)} />}
    {action === "status" && <UserStatusDialog user={user} onClose={() => setAction(null)} />}
  </>
}
