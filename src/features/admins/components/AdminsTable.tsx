import { useId, useMemo, useState } from "react"
import { format } from "date-fns"
import { Download, Plus, Search, SearchX, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { downloadAdminsCsv } from "../lib/export"
import { useAdmins, useRbacAccess, useRoles } from "../hooks"
import { rbacErrorMessage } from "../lib/errors"
import { adminDisplayName, type Admin, type AdminRole } from "../types"
import { AdminFormDialog } from "./AdminFormDialog"
import { AdminRowMenu } from "./AdminRowMenu"

const emptyAdmins: Admin[] = []

function RoleBadge({ role }: { role: AdminRole }) {
  return <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-b4 font-semibold leading-none ${role.isSystem ? "bg-purple/10 text-purple" : "bg-blue/10 text-blue"}`}>{role.name}</span>
}

function AdminAvatar({ admin }: { admin: Admin }) {
  return <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-purple)] text-sm font-semibold text-white" aria-hidden="true">
    {adminDisplayName(admin).charAt(0).toUpperCase()}
  </span>
}

export function AdminsTable() {
  const adminsQuery = useAdmins()
  const admins = adminsQuery.data ?? emptyAdmins
  const can = useRbacAccess()
  const roles = useRoles(can("roles.read"))
  const roleOptions = useMemo(() => [...new Map([
    ...admins.flatMap((admin) => admin.roles), ...(roles.data ?? []),
  ].map((role) => [role.id, role])).values()].sort((a, b) => a.name.localeCompare(b.name)), [admins, roles.data])
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [addOpen, setAddOpen] = useState(false)
  const searchId = useId()

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase()
    return admins.filter((admin) =>
      (roleFilter === "all" || admin.roles.some((role) => role.id === roleFilter))
      && (term === "" || adminDisplayName(admin).toLocaleLowerCase().includes(term) || admin.email.toLocaleLowerCase().includes(term)),
    )
  }, [admins, query, roleFilter])

  const allSelected = filtered.length > 0 && filtered.every((admin) => selected.has(admin.id))

  function toggleAll() {
    setSelected((current) => {
      const visibleIds = new Set(filtered.map((admin) => admin.id))
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
    <article className="overflow-hidden rounded-[20px] bg-white shadow-adbox-small">
      <div className="flex flex-wrap items-center gap-3 border-b border-grey-200 p-4 sm:p-5">
        <div className="relative min-w-[220px] flex-1">
          <label htmlFor={searchId} className="sr-only">Search admins by name or email</label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-grey-400" />
          <Input
            id={searchId}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search admins by name or email"
            autoComplete="off"
            className="h-11 rounded-full border-grey-200 bg-grey-50 pl-10 pr-10 text-b3 focus-visible:border-grey-300 focus-visible:ring-0 md:text-b2"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute right-0 top-0 flex h-11 w-10 cursor-pointer items-center justify-center text-grey-400 hover:text-grey-1000"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger aria-label="Filter by role" className="h-11 w-[160px] cursor-pointer rounded-full border-grey-200 bg-grey-50 text-b3 md:text-b2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {roleOptions.map((role) => <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-11 cursor-pointer rounded-full border-grey-300 px-5 text-b3 font-semibold text-grey-1000 hover:bg-grey-50 md:text-b2"
            disabled={!adminsQuery.isSuccess || filtered.length === 0}
            onClick={() => downloadAdminsCsv(filtered)}
          >
            <Download className="size-4" aria-hidden="true" />Export
          </Button>
          <Button
            type="button"
            className="h-11 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] px-5 text-b3 font-semibold text-white hover:opacity-90 md:text-b2"
            disabled={!can("admins.create")}
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-4" aria-hidden="true" />Add Admin
          </Button>
        </div>
      </div>

      {adminsQuery.isPending && <p role="status" className="p-6 text-sm text-muted-foreground">Loading admins…</p>}
      {adminsQuery.isError && <div role="alert" className="flex flex-wrap items-center gap-3 p-6">
        <p className="text-sm text-destructive">{rbacErrorMessage(adminsQuery.error, "Could not load admins.", "admin")}</p>
        <Button type="button" variant="outline" onClick={() => void adminsQuery.refetch()}>Retry admins</Button>
      </div>}

      {/* contain:paint stops the wide table's layout from leaking into the
          document's scrollWidth through the nested overflow-x-auto scroll
          container (a real Chromium quirk, not just a theoretical concern:
          confirmed by measuring document.documentElement.scrollWidth with
          and without it at narrower viewports). */}
      {adminsQuery.data && <div className="max-w-full overflow-x-auto [contain:paint]">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-grey-200 bg-grey-50/60 text-b3 font-semibold text-grey-500 md:text-b2">
              <th className="px-6 py-4 font-semibold sm:px-[26px]">
                <div className="flex items-center gap-3">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all admins" className="cursor-pointer" />
                  <span className="text-grey-1000">Admin</span>
                </div>
              </th>
              <th className="px-3 py-4 font-semibold">Roles</th>
              <th className="px-3 py-4 font-semibold">Email</th>
              <th className="px-3 py-4 font-semibold">Status</th>
              <th className="px-3 py-4 font-semibold">Last updated</th>
              <th className="w-12 px-6 py-4 text-right sm:px-[26px]"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((admin) => (
              <tr key={admin.id} className="border-b border-grey-200 text-b3 transition-colors last:border-b-0 hover:bg-grey-50/60 md:text-b2">
                <td className="px-6 py-4 sm:px-[26px]">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={selected.has(admin.id)} onCheckedChange={() => toggleOne(admin.id)} aria-label={"Select " + adminDisplayName(admin)} className="cursor-pointer" />
                    <AdminAvatar admin={admin} />
                    <span className="truncate font-semibold text-grey-1000">{adminDisplayName(admin)}</span>
                  </div>
                </td>
                <td className="px-3 py-4"><div className="flex flex-wrap gap-1.5">{admin.roles.length > 0 ? admin.roles.map((role) => <RoleBadge key={role.id} role={role} />) : <span className="text-grey-500">No roles assigned</span>}</div></td>
                <td className="px-3 py-4 text-grey-500">{admin.email}</td>
                <td className="px-3 py-4"><span className={`rounded-full px-2.5 py-1 text-b4 font-semibold ${admin.isActive ? "bg-blue/10 text-blue" : "bg-grey-100 text-grey-600"}`}>{admin.isActive ? "Active" : "Inactive"}</span></td>
                <td className="px-3 py-4 whitespace-nowrap text-grey-500">{format(new Date(admin.updatedAt), "MMM d '|' h:mm a")}</td>
                <td className="px-6 py-4 text-right sm:px-[26px]"><AdminRowMenu admin={admin} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-purple/10 text-purple"><SearchX className="size-6" aria-hidden="true" /></span>
            <h3 className="font-heading text-base font-semibold text-grey-1000">No admins found</h3>
            <p className="mt-1.5 max-w-sm text-sm leading-6 text-grey-500">Try a different name, email, or role filter.</p>
          </div>
        )}
      </div>}

      {addOpen && <AdminFormDialog mode="create" open onOpenChange={setAddOpen} />}
    </article>
  )
}
