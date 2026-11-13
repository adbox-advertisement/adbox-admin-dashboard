import { useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import { format } from "date-fns"
import { ChevronRight, Crown, KeyRound, Pencil, ShieldCheck, UserCheck, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { APP_ROUTES } from "@/routes/paths"
import { useAdmin, useRoles, useViewer } from "../hooks"
import { access, accessLockReason } from "../lib/access"
import { effectiveAccess, isSuperAdmin, isSuperAdminRole, roleTitle, type Grant } from "../lib/catalog"
import { rbacErrorMessage } from "../lib/errors"
import { rolePath } from "../lib/links"
import { adminDisplayName, type Admin } from "../types"
import { AdminFormDialog } from "../components/AdminFormDialog"
import { AdminStatusDialog } from "../components/AdminStatusDialog"
import { EditAdminRolesDialog, EditExtraPermissionsDialog } from "../components/AccessDialogs"
import { PermissionGroups } from "../components/PermissionGroups"
import { AdminAvatar, BackLink, Failed, LockNote, NoAccess, RoleChip, Saved, Section, StatusPill, YouTag, card } from "../components/AdminBits"

type Dialog = "name" | "roles" | "extra" | "status"

/** One admin: who they are, their roles, any extra permissions, and everything that adds up to. */
export function AdminDetailPage() {
  const { adminId = "" } = useParams()
  const location = useLocation()
  const viewer = useViewer()
  const canRead = viewer.can("admins.read")
  const admin = useAdmin(adminId, viewer.ready && canRead)
  const roles = useRoles(viewer.ready && viewer.can("roles.read"))
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [message, setMessage] = useState(() => (location.state as { message?: string } | null)?.message ?? "")
  const back = <BackLink to={APP_ROUTES.manageAdminsList}>All admins</BackLink>
  const wrap = "flex min-w-0 flex-col gap-4 px-4 pb-10 sm:px-6"

  if (viewer.ready && !canRead) return <div className={wrap}>{back}<NoAccess what="admins" /></div>
  if (admin.isError) return <div className={wrap}>{back}<div className={card}><Failed message={rbacErrorMessage(admin.error, "Could not load this admin.", "admin")} onRetry={() => void admin.refetch()} retryLabel="Retry admin" /></div></div>
  if (!admin.data) return <div className={wrap}>{back}<div role="status" aria-label="Loading admin" className={cn(card, "h-40 animate-pulse")} /></div>

  const data = admin.data
  const name = adminDisplayName(data)
  const you = data.id === viewer.id
  const lock = viewer.ready ? accessLockReason(viewer, data) : null
  const canChangeRoles = access.changeRoles(viewer, data)
  const canChangeExtra = access.changeExtraPermissions(viewer, data)
  const canChangeStatus = access.changeStatus(viewer, data)
  const canEditName = access.editName(viewer, data)
  const StatusIcon = data.isActive ? UserX : UserCheck

  return <div className={wrap}>
    {back}
    {message && <Saved message={message} onDismiss={() => setMessage("")} />}

    <header className={cn(card, "flex flex-col gap-4 p-5 sm:flex-row sm:items-center")}>
      <AdminAvatar admin={data} size="lg" />
      <div className="min-w-0 flex-1">
        <h1 className="flex flex-wrap items-center gap-2 font-heading text-h5 font-semibold">{name}{you && <YouTag />}</h1>
        <p className="truncate text-sm text-grey-500 dark:text-muted-foreground">{data.email}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusPill active={data.isActive} />
          {isSuperAdmin(data) && <RoleChip role={{ name: "SUPER_ADMIN" }} />}
          <span className="text-xs text-grey-500 dark:text-muted-foreground">Last changed {format(new Date(data.updatedAt), "d MMM yyyy, h:mm a")}</span>
        </div>
      </div>
      {(canEditName || canChangeStatus) && <div className="flex flex-wrap gap-2">
        {canEditName && <Button variant="outline" className="h-10 rounded-full px-4" onClick={() => setDialog("name")}><Pencil aria-hidden="true" />Edit name</Button>}
        {canChangeStatus && <Button variant={data.isActive ? "destructive" : "outline"} className="h-10 rounded-full px-4" onClick={() => setDialog("status")}><StatusIcon aria-hidden="true" />{data.isActive ? "Deactivate" : "Reactivate"}</Button>}
      </div>}
    </header>

    {lock && <LockNote>{lock}</LockNote>}

    <div className="grid gap-4 lg:grid-cols-12">
      <div className="flex min-w-0 flex-col gap-4 lg:col-span-5">
        <Section id="admin-roles" title="Roles" description="Each role is a named set of permissions."
          action={canChangeRoles && <Button variant="outline" className="h-9 rounded-full px-3.5" onClick={() => setDialog("roles")}><ShieldCheck aria-hidden="true" />Change roles</Button>}>
          {data.roles.length === 0 ? <p className="px-5 py-6 text-sm text-grey-500 dark:text-muted-foreground">No roles yet, so they can only do what extra permissions allow.</p>
            : <ul className="divide-y divide-grey-200 dark:divide-border">
              {data.roles.map((assigned) => {
                const role = roles.data?.find((entry) => entry.id === assigned.id)
                const superAdmin = isSuperAdminRole(assigned)
                const Icon = superAdmin ? Crown : ShieldCheck
                const body = <>
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", superAdmin ? "bg-purple/10 text-purple" : "bg-blue/10 text-blue dark:bg-cyan/10 dark:text-cyan")}><Icon className="size-4" aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{roleTitle(assigned.name)}</span>
                    <span className="block truncate text-xs text-grey-500 dark:text-muted-foreground">{superAdmin ? "Everything, including changing admins' access" : role ? `${role.description || "No description"} · ${role.permissions.length} ${role.permissions.length === 1 ? "permission" : "permissions"}` : assigned.name}</span>
                  </span>
                </>
                return <li key={assigned.id}>
                  {roles.isSuccess
                    ? <Link to={rolePath(assigned.id)} className="flex items-center gap-3 px-5 py-3 outline-none transition-colors hover:bg-grey-50/70 focus-visible:bg-grey-50 dark:hover:bg-muted/30">{body}<ChevronRight className="size-4 shrink-0 text-grey-400" aria-hidden="true" /></Link>
                    : <div className="flex items-center gap-3 px-5 py-3">{body}</div>}
                </li>
              })}
            </ul>}
        </Section>

        <Section id="admin-extra" title="Extra permissions" description={`Given to ${data.firstName || name} alone, on top of their roles.`}
          action={canChangeExtra && <Button variant="outline" className="h-9 rounded-full px-3.5" onClick={() => setDialog("extra")}><KeyRound aria-hidden="true" />Change</Button>}>
          <PermissionGroups items={data.permissions} empty="None. Everything they can do comes from their roles." />
        </Section>
      </div>

      <div className="min-w-0 lg:col-span-7">
        <WhatTheyCanDo admin={data} access={effectiveAccess(data, roles.data ?? [])} rolesVisible={roles.isSuccess} />
      </div>
    </div>

    {dialog === "name" && <AdminFormDialog mode="edit" admin={data} onClose={() => setDialog(null)} />}
    {dialog === "status" && <AdminStatusDialog admin={data} onClose={() => setDialog(null)} onSaved={setMessage} />}
    {dialog === "roles" && <EditAdminRolesDialog admin={data} onClose={() => setDialog(null)} onSaved={setMessage} />}
    {dialog === "extra" && <EditExtraPermissionsDialog admin={data} onClose={() => setDialog(null)} onSaved={setMessage} />}
  </div>
}

function WhatTheyCanDo({ admin, access: effective, rolesVisible }: { admin: Admin; access: { everything: boolean; grants: Grant[] }; rolesVisible: boolean }) {
  return <Section id="admin-effective" title="What they can do" description="Everything their roles and extra permissions allow, and where each comes from.">
    {effective.everything
      ? <div className="flex items-start gap-3 px-5 py-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple/10 text-purple"><Crown className="size-5" aria-hidden="true" /></span>
        <p className="text-sm leading-6">
          <span className="font-semibold">Everything.</span> {isSuperAdmin(admin)
            ? "As a Super Admin they have every permission, including ones added later, and they're the only admins who can change other admins' access."
            : "They hold the “Everything” permission, which includes every permission there is. Only a Super Admin can change other admins' access, though."}
        </p>
      </div>
      : <>
        {!rolesVisible && admin.roles.length > 0 && <p className="border-b border-grey-200 px-5 py-3 text-xs text-grey-500 dark:border-border dark:text-muted-foreground">You can't view roles, so only their extra permissions show here.</p>}
        <PermissionGroups items={effective.grants} empty="Nothing yet: they can sign in, but every page will be locked."
          meta={(grant) => <span className="flex flex-wrap gap-1.5">
            {grant.sources.map((source) => <span key={source.kind === "role" ? source.role.id : "direct"} className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium",
              source.kind === "role" ? "bg-blue/10 text-blue dark:bg-cyan/10 dark:text-cyan" : "bg-warning-500/15 text-warning-800 dark:text-warning-300")}>
              {source.kind === "role" ? `From ${roleTitle(source.role.name)}` : "Extra permission"}
            </span>)}
          </span>} />
      </>}
  </Section>
}
