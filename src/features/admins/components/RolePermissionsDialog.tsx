import { useId, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { usePermissions, useRbacAccess, useReplaceRolePermissions } from "../hooks"
import { rbacErrorMessage } from "../lib/errors"
import type { Role } from "../types"
import { PermissionsPicker } from "./PermissionsPicker"

export function RolePermissionsDialog({ role, open, onOpenChange }: { role: Role; open: boolean; onOpenChange: (open: boolean) => void }) {
  const can = useRbacAccess()
  const catalog = usePermissions(open && can("permissions.read"))
  const save = useReplaceRolePermissions()
  const [permissionIds, setPermissionIds] = useState(() => role.permissions.map((permission) => permission.id))
  const [error, setError] = useState("")
  const id = useId()
  const options = [...(catalog.data ?? []), ...role.permissions.filter((permission) => !catalog.data?.some((entry) => entry.id === permission.id))]
  const canSave = can("roles.permissions.assign") && can("permissions.read") && catalog.isSuccess && !catalog.isFetching && !role.isSystem

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (save.isPending || !canSave) return
    setError("")
    try {
      await save.mutateAsync({ id: role.id, permissionIds })
      onOpenChange(false)
    } catch (error) {
      setError(rbacErrorMessage(error, "Could not save permissions. Your selection has been kept; try again."))
    }
  }

  return <Dialog open={open} onOpenChange={(next) => { if (!save.isPending) onOpenChange(next) }}>
    <DialogContent className="max-w-lg rounded-3xl">
      <div className="pr-7">
        <DialogTitle>Edit permissions</DialogTitle>
        <DialogDescription className="mt-2">Choose permissions for {role.name}. Saving replaces all its current permissions. An empty selection removes them all.</DialogDescription>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-5">
        {!can("permissions.read") ? <p role="alert" className="text-sm text-destructive">You don't have permission to view the permission catalog.</p> : catalog.isPending ? <p role="status">Loading permissions…</p> : catalog.isError ? <div role="alert">
          <p className="text-sm text-destructive">{rbacErrorMessage(catalog.error, "Could not load permissions.")}</p>
          <Button type="button" variant="outline" onClick={() => void catalog.refetch()}>Retry permissions</Button>
        </div> : <div>
          <label htmlFor={id} className="mb-2 block text-sm font-medium">Permissions</label>
          <PermissionsPicker id={id} value={permissionIds} options={options} onChange={(next) => { setPermissionIds(next); setError("") }} disabled={save.isPending || !canSave} />
        </div>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-3">
          <DialogClose asChild><Button type="button" variant="outline" disabled={save.isPending} className="h-11 rounded-full px-5">Cancel</Button></DialogClose>
          <Button type="submit" disabled={save.isPending || !canSave} className="h-11 rounded-full bg-[image:var(--gradient-purple)] px-5 text-white">{save.isPending ? "Saving…" : "Save permissions"}</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
}
