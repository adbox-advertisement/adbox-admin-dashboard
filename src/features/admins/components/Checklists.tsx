import { useId, useState } from "react"
import { Crown, Search, ShieldCheck } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { WILDCARD, groupByArea, isSensitive, isSuperAdminRole, permissionLabel, roleTitle } from "../lib/catalog"
import type { Permission, Role } from "../types"
import { SensitiveTag } from "./AdminBits"

function PermissionRow({ permission, checked, disabled, onChange }: { permission: Permission; checked: boolean; disabled?: boolean; onChange: (checked: boolean) => void }) {
  const describedBy = useId()
  return <label className={cn("flex items-start gap-3 px-4 py-2.5 transition-colors", disabled ? "cursor-default" : "cursor-pointer hover:bg-grey-50 dark:hover:bg-muted/40")}>
    <Checkbox className="mt-0.5" checked={checked} disabled={disabled} onCheckedChange={(next) => onChange(next === true)} aria-label={permissionLabel(permission.key)} aria-describedby={describedBy} />
    <span className="min-w-0 flex-1">
      <span className="flex flex-wrap items-center gap-2 text-sm font-medium">{permissionLabel(permission.key)}{isSensitive(permission.key) && <SensitiveTag />}</span>
      <span id={describedBy} className="block text-xs leading-5 text-grey-500 dark:text-muted-foreground">
        {permission.description && permission.description !== "All permissions" ? `${permission.description} · ` : ""}<span className="font-mono">{permission.key}</span>
      </span>
    </span>
  </label>
}

/**
 * Permissions grouped by area, each with its plain name, what it allows and its key. Search narrows
 * the list; each area can be selected or cleared at once.
 */
export function PermissionChecklist({ permissions, value, onChange, disabled }: {
  permissions: Permission[]
  value: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
}) {
  const [term, setTerm] = useState("")
  const searchId = useId()
  const headingId = useId()
  const q = term.trim().toLowerCase()
  const visible = q ? permissions.filter((permission) => [permission.key, permissionLabel(permission.key), permission.description].some((text) => text.toLowerCase().includes(q))) : permissions
  const wildcard = visible.find((permission) => permission.key === WILDCARD)
  const groups = groupByArea(visible)
  const toggle = (id: string, on: boolean) => onChange(on ? [...new Set([...value, id])] : value.filter((entry) => entry !== id))
  const setMany = (ids: string[], on: boolean) => onChange(on ? [...new Set([...value, ...ids])] : value.filter((entry) => !ids.includes(entry)))

  return <div className="flex min-h-0 flex-1 flex-col gap-3">
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor={searchId} className="sr-only">Find a permission</label>
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input id={searchId} type="search" value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Find a permission" autoComplete="off" className="h-10 rounded-full pl-9" />
      </div>
      <p aria-live="polite" className="text-xs font-semibold text-grey-500 dark:text-muted-foreground">{value.length} selected</p>
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-grey-200 dark:border-border">
      {wildcard && <div className="border-b border-grey-200 dark:border-border"><PermissionRow permission={wildcard} checked={value.includes(wildcard.id)} disabled={disabled} onChange={(on) => toggle(wildcard.id, on)} /></div>}
      {groups.map(({ area, items }) => {
        const ids = items.map((item) => item.id)
        const chosen = ids.filter((id) => value.includes(id)).length
        const all = chosen === ids.length
        return <div key={area.id} role="group" aria-labelledby={`${headingId}-${area.id}`} className="border-b border-grey-200 last:border-b-0 dark:border-border">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-grey-50/95 px-4 py-2 backdrop-blur dark:bg-background/95">
            <p id={`${headingId}-${area.id}`} className="text-xs font-semibold uppercase tracking-wide text-grey-600 dark:text-muted-foreground">{area.label} <span className="font-normal normal-case tracking-normal">· {chosen} of {ids.length}</span></p>
            <button type="button" disabled={disabled} onClick={() => setMany(ids, !all)} aria-label={`${all ? "Clear" : "Select all"} in ${area.label}`}
              className="rounded-full px-2 py-0.5 text-xs font-semibold text-purple outline-none hover:bg-purple/10 focus-visible:ring-2 focus-visible:ring-purple disabled:opacity-50">{all ? "Clear" : "Select all"}</button>
          </div>
          {items.map((permission) => <PermissionRow key={permission.id} permission={permission} checked={value.includes(permission.id)} disabled={disabled} onChange={(on) => toggle(permission.id, on)} />)}
        </div>
      })}
      {!wildcard && groups.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted-foreground">No permission matches “{term}”.</p>}
    </div>
  </div>
}

/** Roles as cards to tick: name, what it's for and how much it allows. The Super Admin role is called out. */
export function RoleChecklist({ roles, value, onChange, disabled }: {
  roles: Array<Pick<Role, "id" | "name" | "description" | "isSystem"> & { permissions?: Role["permissions"] }>
  value: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
}) {
  const sorted = [...roles].sort((a, b) => Number(isSuperAdminRole(b)) - Number(isSuperAdminRole(a)) || roleTitle(a.name).localeCompare(roleTitle(b.name)))
  return <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
    {sorted.map((role) => {
      const checked = value.includes(role.id)
      const superAdmin = isSuperAdminRole(role)
      const Icon = superAdmin ? Crown : ShieldCheck
      const count = role.permissions?.length
      return <label key={role.id} className={cn("flex items-start gap-3 rounded-2xl border p-3.5 transition-colors",
        checked ? "border-purple/50 bg-purple/5" : "border-grey-200 dark:border-border", disabled ? "cursor-default" : "cursor-pointer hover:border-purple/40")}>
        <Checkbox className="mt-0.5" checked={checked} disabled={disabled} onCheckedChange={(next) => onChange(next === true ? [...value, role.id] : value.filter((id) => id !== role.id))} aria-label={roleTitle(role.name)} />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <Icon className={cn("size-4", superAdmin ? "text-purple" : "text-grey-500 dark:text-muted-foreground")} aria-hidden="true" />
            <span className="text-sm font-semibold">{roleTitle(role.name)}</span>
            <span className="font-mono text-[11px] text-grey-500 dark:text-muted-foreground">{role.name}</span>
          </span>
          <span className="mt-0.5 block text-xs leading-5 text-grey-500 dark:text-muted-foreground">
            {superAdmin ? "Full access to everything, including changing other admins' access." : role.description || "No description."}
            {!superAdmin && count !== undefined && ` · ${count} ${count === 1 ? "permission" : "permissions"}`}
          </span>
        </span>
      </label>
    })}
    {roles.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No roles yet.</p>}
  </div>
}
