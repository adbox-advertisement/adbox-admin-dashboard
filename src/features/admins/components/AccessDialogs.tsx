import { useState, type FormEvent, type ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { access } from "../lib/access"
import { WILDCARD, isSuperAdmin, isSuperAdminRole, roleTitle } from "../lib/catalog"
import { rbacErrorMessage } from "../lib/errors"
import { usePermissions, useReplaceAdminPermissions, useReplaceAdminRoles, useReplaceRolePermissions, useRoles, useViewer } from "../hooks"
import { adminDisplayName, type Admin, type Role } from "../types"
import { PermissionChecklist, RoleChecklist } from "./Checklists"
import { primaryButton } from "./AdminBits"

function EditShell({ title, description, busy, error, saveLabel, canSave, onClose, onSubmit, children }: {
  title: string
  description: ReactNode
  busy: boolean
  error: string
  saveLabel: string
  canSave: boolean
  onClose: () => void
  onSubmit: () => void
  children: ReactNode
}) {
  const submit = (event: FormEvent) => { event.preventDefault(); if (!busy && canSave) onSubmit() }
  return <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose() }}>
    <DialogContent className="flex h-[min(44rem,calc(100svh-2rem))] max-w-2xl flex-col gap-0 overflow-hidden rounded-3xl p-0">
      <div className="border-b border-grey-200 px-6 py-5 pr-14 dark:border-border">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className="mt-1.5">{description}</DialogDescription>
      </div>
      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col gap-3 px-6 py-4">{children}</div>
        <div className="flex flex-col gap-3 border-t border-grey-200 px-6 py-4 dark:border-border">
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-wrap justify-end gap-2">
            <DialogClose asChild><Button type="button" variant="outline" disabled={busy} className="h-10 rounded-full px-4">Cancel</Button></DialogClose>
            <Button type="submit" disabled={busy || !canSave} className={primaryButton}>{busy ? "Saving…" : saveLabel}</Button>
          </div>
        </div>
      </form>
    </DialogContent>
  </Dialog>
}

function CatalogState({ query, what, children }: { query: { isPending: boolean; isError: boolean; error: unknown; refetch: () => unknown }; what: string; children: ReactNode }) {
  if (query.isPending) return <p role="status" className="text-sm text-muted-foreground">Loading {what}…</p>
  if (query.isError) return <div role="alert" className="flex flex-wrap items-center gap-3">
    <p className="text-sm text-destructive">{rbacErrorMessage(query.error, `Could not load ${what}.`)}</p>
    <Button type="button" variant="outline" className="h-9 rounded-full" onClick={() => void query.refetch()}>Retry {what}</Button>
  </div>
  return <>{children}</>
}

/** The roles an admin holds. Saving replaces them all. Super Admin only. */
export function EditAdminRolesDialog({ admin, onClose, onSaved }: { admin: Admin; onClose: () => void; onSaved: (message: string) => void }) {
  const viewer = useViewer()
  const allowed = access.changeRoles(viewer, admin)
  const roles = useRoles(allowed)
  const save = useReplaceAdminRoles()
  const [selected, setSelected] = useState(() => admin.roles.map((role) => role.id))
  const [error, setError] = useState("")
  const name = adminDisplayName(admin)
  const options = [...(roles.data ?? []), ...admin.roles.filter((role) => !roles.data?.some((entry) => entry.id === role.id)).map((role) => ({ ...role, description: "" }))]
  const addsSuperAdmin = !isSuperAdmin(admin) && options.some((role) => isSuperAdminRole(role) && selected.includes(role.id))

  return <EditShell title={`Roles for ${name}`} busy={save.isPending} error={error} saveLabel="Save roles" canSave={allowed && roles.isSuccess && !roles.isFetching}
    description={<>Roles decide what {name} can do. Saving replaces their roles; untick a role to take it away.</>}
    onClose={onClose}
    onSubmit={() => {
      setError("")
      save.mutate({ id: admin.id, roleIds: selected }, {
        onSuccess: () => { onSaved(`Saved ${name}'s roles.`); onClose() },
        onError: (failure) => setError(rbacErrorMessage(failure, "Could not save the roles. Your choice is kept; try again.", "admin")),
      })
    }}>
    <CatalogState query={roles} what="roles">
      <RoleChecklist roles={options} value={selected} onChange={(ids) => { setSelected(ids); setError("") }} disabled={save.isPending || !allowed} />
      {addsSuperAdmin && <p className="flex items-start gap-2 rounded-2xl bg-warning-500/10 px-4 py-3 text-sm text-warning-800 dark:text-warning-300">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />As a Super Admin, {name} will be able to do everything, including changing every admin's access.
      </p>}
    </CatalogState>
  </EditShell>
}

/** Permissions given to one admin on top of their roles. Saving replaces them. Super Admin only. */
export function EditExtraPermissionsDialog({ admin, onClose, onSaved }: { admin: Admin; onClose: () => void; onSaved: (message: string) => void }) {
  const viewer = useViewer()
  const allowed = access.changeExtraPermissions(viewer, admin)
  const permissions = usePermissions(allowed)
  const save = useReplaceAdminPermissions()
  const [selected, setSelected] = useState(() => admin.permissions.map((permission) => permission.id))
  const [error, setError] = useState("")
  const name = adminDisplayName(admin)
  // "Everything" is what the Super Admin role is for; it's offered only so an old grant can be taken away.
  const options = [
    ...(permissions.data ?? []).filter((permission) => permission.key !== WILDCARD || admin.permissions.some((entry) => entry.key === WILDCARD)),
    ...admin.permissions.filter((permission) => !permissions.data?.some((entry) => entry.id === permission.id)),
  ]

  return <EditShell title={`Extra permissions for ${name}`} busy={save.isPending} error={error} saveLabel="Save extra permissions" canSave={allowed && permissions.isSuccess && !permissions.isFetching}
    description={<>Given to {name} on top of their roles. When several admins need the same thing, a role is easier to manage. For full access, make them a Super Admin instead.</>}
    onClose={onClose}
    onSubmit={() => {
      setError("")
      save.mutate({ id: admin.id, permissionIds: selected }, {
        onSuccess: () => { onSaved(`Saved ${name}'s extra permissions.`); onClose() },
        onError: (failure) => setError(rbacErrorMessage(failure, "Could not save the extra permissions. Your choice is kept; try again.", "admin")),
      })
    }}>
    <CatalogState query={permissions} what="permissions">
      <PermissionChecklist permissions={options} value={selected} onChange={(ids) => { setSelected(ids); setError("") }} disabled={save.isPending || !allowed} />
    </CatalogState>
  </EditShell>
}

/** What a role allows. Saving replaces it for every admin with the role. Super Admin only. */
export function EditRolePermissionsDialog({ role, members, onClose, onSaved }: { role: Role; members: number; onClose: () => void; onSaved: (message: string) => void }) {
  const viewer = useViewer()
  const allowed = access.changeRolePermissions(viewer, role)
  const permissions = usePermissions(allowed)
  const save = useReplaceRolePermissions()
  const [selected, setSelected] = useState(() => role.permissions.map((permission) => permission.id))
  const [error, setError] = useState("")
  const title = roleTitle(role.name)
  const options = [
    ...(permissions.data ?? []).filter((permission) => permission.key !== WILDCARD),
    ...role.permissions.filter((permission) => permission.key !== WILDCARD && !permissions.data?.some((entry) => entry.id === permission.id)),
  ]

  return <EditShell title={`What ${title} allows`} busy={save.isPending} error={error} saveLabel="Save permissions" canSave={allowed && permissions.isSuccess && !permissions.isFetching}
    description={<>Saving replaces this role's permissions. {members === 0 ? "No admin has this role yet." : `The ${members} ${members === 1 ? "admin" : "admins"} with this role get the change straight away.`}</>}
    onClose={onClose}
    onSubmit={() => {
      setError("")
      save.mutate({ id: role.id, permissionIds: selected.filter((id) => options.some((option) => option.id === id)) }, {
        onSuccess: () => { onSaved(`Saved what ${title} allows.`); onClose() },
        onError: (failure) => setError(rbacErrorMessage(failure, "Could not save the permissions. Your choice is kept; try again.")),
      })
    }}>
    <CatalogState query={permissions} what="permissions">
      <PermissionChecklist permissions={options} value={selected} onChange={(ids) => { setSelected(ids); setError("") }} disabled={save.isPending || !allowed} />
    </CatalogState>
  </EditShell>
}
