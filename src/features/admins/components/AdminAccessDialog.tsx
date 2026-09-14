import { useId, useState, type FormEvent } from "react"
import { useCurrentAdmin } from "@/features/auth"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { usePermissions, useRbacAccess, useReplaceAdminPermissions, useReplaceAdminRoles, useRoles } from "../hooks"
import { rbacErrorMessage } from "../lib/errors"
import { adminDisplayName, type Admin } from "../types"
import { PermissionsPicker } from "./PermissionsPicker"
import { RolesPicker } from "./RolesPicker"

export function AdminAccessDialog({ admin, mode, onClose }: { admin: Admin; mode: "roles" | "permissions"; onClose: () => void }) {
  const can = useRbacAccess()
  const profile = useCurrentAdmin()
  const isRoles = mode === "roles"
  const readable = can(isRoles ? "roles.read" : "permissions.read")
  const roles = useRoles(isRoles && readable)
  const permissions = usePermissions(!isRoles && readable)
  const catalog = isRoles ? roles : permissions
  const saveRoles = useReplaceAdminRoles()
  const savePermissions = useReplaceAdminPermissions()
  const pending = saveRoles.isPending || savePermissions.isPending
  const [selected, setSelected] = useState(() => isRoles ? admin.roles.map((role) => role.id) : admin.permissions.map((permission) => permission.id))
  const [error, setError] = useState("")
  const id = useId()
  const canSave = Boolean(profile.data && profile.data.id !== admin.id) && can(isRoles ? "admins.roles.assign" : "admins.permissions.assign") && readable && catalog.isSuccess && !catalog.isFetching
  const roleOptions = [...(roles.data ?? []), ...admin.roles.filter((role) => !roles.data?.some((entry) => entry.id === role.id))]
  const permissionOptions = [...(permissions.data ?? []), ...admin.permissions.filter((permission) => !permissions.data?.some((entry) => entry.id === permission.id))]

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (pending || !canSave) return
    setError("")
    try {
      if (isRoles) await saveRoles.mutateAsync({ id: admin.id, roleIds: selected })
      else await savePermissions.mutateAsync({ id: admin.id, permissionIds: selected })
      onClose()
    } catch (error) {
      setError(rbacErrorMessage(error, `Could not save ${isRoles ? "roles" : "direct permissions"}. Your selection has been kept; try again.`, "admin"))
    }
  }

  return <Dialog open onOpenChange={(next) => { if (!next && !pending) onClose() }}>
    <DialogContent className="max-w-lg rounded-3xl">
      <div className="pr-7">
        <DialogTitle>{isRoles ? "Assign roles" : "Direct permissions"}</DialogTitle>
        <DialogDescription className="mt-2">{isRoles
          ? `Choose roles for ${adminDisplayName(admin)}. Saving replaces their current roles; an empty selection removes them all.`
          : `Choose direct permissions for ${adminDisplayName(admin)}. Saving replaces their direct permissions. Permissions granted by roles remain in effect.`}</DialogDescription>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-5">
        {!readable ? <p role="alert" className="text-sm text-destructive">You don't have permission to view this catalog.</p> : catalog.isPending ? <p role="status">Loading {isRoles ? "roles" : "permissions"}…</p> : catalog.isError ? <div role="alert">
          <p className="text-sm text-destructive">{rbacErrorMessage(catalog.error, `Could not load ${isRoles ? "roles" : "permissions"}.`, "admin")}</p>
          <Button type="button" variant="outline" onClick={() => void catalog.refetch()}>Retry {isRoles ? "roles" : "permissions"}</Button>
        </div> : isRoles ? <RolesPicker options={roleOptions} value={selected} onChange={(ids) => { setSelected(ids); setError("") }} disabled={pending || !canSave} /> : <div>
          <label htmlFor={id} className="mb-2 block text-sm font-medium">Direct permissions</label>
          <PermissionsPicker id={id} value={selected} options={permissionOptions} onChange={(ids) => { setSelected(ids); setError("") }} disabled={pending || !canSave} allowWildcard />
        </div>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-3">
          <DialogClose asChild><Button type="button" variant="outline" disabled={pending} className="h-11 rounded-full px-5">Cancel</Button></DialogClose>
          <Button type="submit" disabled={pending || !canSave} className="h-11 rounded-full bg-[image:var(--gradient-purple)] px-5 text-white">{pending ? "Saving…" : isRoles ? "Save roles" : "Save direct permissions"}</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
}
