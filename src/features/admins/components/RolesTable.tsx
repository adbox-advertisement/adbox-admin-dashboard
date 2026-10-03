import { useId, useMemo, useState } from "react"
import { Download, Plus, Search, SearchX, ShieldCheck, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { downloadRolesCsv } from "../lib/export"
import { useRbacAccess, useRoles } from "../hooks"
import { rbacErrorMessage } from "../lib/errors"
import type { Role } from "../types"
import { RolePermissionsDialog } from "./RolePermissionsDialog"
import { RoleFormDialog } from "./RoleFormDialog"
import { RoleRowMenu } from "./RoleRowMenu"

const emptyRoles: Role[] = []

export function RolesTable() {
  const rolesQuery = useRoles()
  const roles = rolesQuery.data ?? emptyRoles
  const can = useRbacAccess()
  const [createdRole, setCreatedRole] = useState<Role | null>(null)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [addOpen, setAddOpen] = useState(false)
  const searchId = useId()

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase()
    if (term === "") return roles
    return roles.filter((role) => role.name.toLocaleLowerCase().includes(term) || role.description.toLocaleLowerCase().includes(term))
  }, [roles, query])

  const allSelected = filtered.length > 0 && filtered.every((role) => selected.has(role.id))

  function toggleAll() {
    setSelected((current) => {
      const visibleIds = new Set(filtered.map((role) => role.id))
      if (allSelected) return new Set([...current].filter((id) => !visibleIds.has(id)))
      return new Set([...current, ...visibleIds])
    })
  }

  function toggleOne(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <article className="overflow-hidden rounded-[20px] bg-white dark:bg-card shadow-adbox-small">
      <div className="flex flex-wrap items-center gap-3 border-b border-grey-200 dark:border-border p-4 sm:p-5">
        <div className="relative min-w-[220px] flex-1">
          <label htmlFor={searchId} className="sr-only">Search roles by name or description</label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-grey-400 dark:text-muted-foreground" />
          <Input
            id={searchId}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search roles by name or description"
            autoComplete="off"
            className="h-11 rounded-full border-grey-200 dark:border-border bg-grey-50 dark:bg-background pl-10 pr-10 text-b3 focus-visible:border-grey-300 dark:focus-visible:border-border focus-visible:ring-0 md:text-b2"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute right-0 top-0 flex h-11 w-10 cursor-pointer items-center justify-center text-grey-400 dark:text-muted-foreground hover:text-grey-1000 dark:hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Button
            type="button"
            className="h-11 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] px-5 text-b3 font-semibold text-white hover:opacity-90 md:text-b2"
            disabled={!can("roles.create")}
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-4" aria-hidden="true" />Add Role
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 cursor-pointer rounded-full border-grey-300 dark:border-border px-5 text-b3 font-semibold text-grey-1000 dark:text-foreground hover:bg-grey-50 dark:hover:bg-background md:text-b2"
            disabled={!rolesQuery.isSuccess || filtered.length === 0}
            onClick={() => downloadRolesCsv(filtered)}
          >
            <Download className="size-4" aria-hidden="true" />Export
          </Button>
        </div>
      </div>

      {rolesQuery.isPending && <p role="status" className="p-6 text-sm text-muted-foreground">Loading roles…</p>}
      {rolesQuery.isError && <div role="alert" className="flex flex-wrap items-center gap-3 p-6">
        <p className="text-sm text-destructive">{rbacErrorMessage(rolesQuery.error, "Could not load roles.")}</p>
        <Button type="button" variant="outline" onClick={() => void rolesQuery.refetch()}>Retry roles</Button>
      </div>}

      {/* contain:paint stops the wide table's layout from leaking into the
          document's scrollWidth through the nested overflow-x-auto scroll
          container (see AdminsTable for the confirmed Chromium quirk). */}
      {rolesQuery.data && <div className="max-w-full overflow-x-auto [contain:paint]">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-grey-200 dark:border-border bg-grey-50/60 dark:bg-background/60 text-b3 font-semibold text-grey-500 dark:text-muted-foreground md:text-b2">
              <th className="px-6 py-4 font-semibold sm:px-[26px]">
                <div className="flex items-center gap-3">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all roles" className="cursor-pointer" />
                  <span className="text-grey-1000 dark:text-foreground">Role</span>
                </div>
              </th>
              <th className="w-[26%] px-3 py-4 font-semibold">Description</th>
              <th className="px-3 py-4 font-semibold">Permission</th>
              <th className="w-12 px-6 py-4 text-right sm:px-[26px]"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((role) => (
              <tr key={role.id} className="border-b border-grey-200 dark:border-border text-b3 transition-colors last:border-b-0 hover:bg-grey-50/60 dark:hover:bg-background/60 md:text-b2">
                <td className="px-6 py-4 align-top sm:px-[26px]">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={selected.has(role.id)} onCheckedChange={() => toggleOne(role.id)} aria-label={"Select " + role.name} className="cursor-pointer" />
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue/10 text-blue dark:text-cyan">
                      <ShieldCheck className="size-4" aria-hidden="true" />
                    </span>
                    <span className="truncate font-semibold text-grey-1000 dark:text-foreground">{role.name}</span>
                  </div>
                </td>
                <td className="px-3 py-4 align-top text-grey-500 dark:text-muted-foreground">{role.description || "—"}</td>
                <td className="px-3 py-4 align-top">
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.length === 0 && <span className="text-grey-500 dark:text-muted-foreground">No permissions</span>}
                    {role.permissions.map((permission) => (
                      <span key={permission.id} className="inline-flex items-center rounded-full bg-grey-100 dark:bg-muted px-2.5 py-1 text-b4 font-medium leading-none text-grey-600 dark:text-muted-foreground">
                        {permission.key === "*" ? "All permissions" : permission.key}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right align-top sm:px-[26px]"><RoleRowMenu role={role} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-blue/10 text-blue dark:text-cyan"><SearchX className="size-6" aria-hidden="true" /></span>
            <h3 className="font-heading text-base font-semibold text-grey-1000 dark:text-foreground">No roles found</h3>
            <p className="mt-1.5 max-w-sm text-sm leading-6 text-grey-500 dark:text-muted-foreground">Try a different name or description.</p>
          </div>
        )}
      </div>}

      <RoleFormDialog key={addOpen ? "add-open" : "add-closed"} mode="create" open={addOpen} onOpenChange={setAddOpen} onCreated={(role) => { if (can("roles.permissions.assign") && can("permissions.read")) setCreatedRole(role) }} />
      {createdRole && <RolePermissionsDialog role={createdRole} open onOpenChange={(open) => { if (!open) setCreatedRole(null) }} />}
    </article>
  )
}
