import { useState } from "react"
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { ChevronRight, Crown, KeyRound, Pencil, ShieldCheck, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { APP_ROUTES } from "@/routes/paths"
import { useAdmins, useRoles, useViewer } from "../hooks"
import { access } from "../lib/access"
import { isSuperAdminRole, roleTitle } from "../lib/catalog"
import { rbacErrorMessage } from "../lib/errors"
import { adminPath } from "../lib/links"
import { adminDisplayName } from "../types"
import { EditRolePermissionsDialog } from "../components/AccessDialogs"
import { DeleteRoleDialog, RoleFormDialog } from "../components/RoleDialogs"
import { PermissionGroups } from "../components/PermissionGroups"
import { AdminAvatar, BackLink, Empty, Failed, LockNote, NoAccess, Saved, Section, StatusPill, card } from "../components/AdminBits"

type Dialog = "rename" | "permissions" | "delete"

/** One role: what it's for, every permission it gives, and the admins who have it. */
export function RoleDetailPage() {
  const { roleId = "" } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const viewer = useViewer()
  const canRead = viewer.can("roles.read")
  const roles = useRoles(viewer.ready && canRead)
  const admins = useAdmins(viewer.ready && viewer.can("admins.read"))
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [message, setMessage] = useState(() => (location.state as { message?: string } | null)?.message ?? "")
  const back = <BackLink to={APP_ROUTES.manageAdminsRoles}>All roles</BackLink>
  const wrap = "flex min-w-0 flex-col gap-4 px-4 pb-10 sm:px-6"

  if (viewer.ready && !canRead) return <div className={wrap}>{back}<NoAccess what="roles" /></div>
  if (roles.isError) return <div className={wrap}>{back}<div className={card}><Failed message={rbacErrorMessage(roles.error, "Could not load roles.")} onRetry={() => void roles.refetch()} retryLabel="Retry roles" /></div></div>
  if (!roles.data) return <div className={wrap}>{back}<div role="status" aria-label="Loading role" className={cn(card, "h-40 animate-pulse")} /></div>

  const role = roles.data.find((entry) => entry.id === roleId)
  // Just deleted from here: the list refreshes a moment before the page moves on.
  if (!role && dialog === "delete") return <div className={wrap}>{back}<div role="status" aria-label="Deleting role" className={cn(card, "h-40 animate-pulse")} /></div>
  if (!role) return <div className={wrap}>{back}<div className={card}><Empty title="This role doesn't exist">It may have been deleted. Go back to the roles to pick another.</Empty></div></div>

  const superAdmin = isSuperAdminRole(role)
  const title = roleTitle(role.name)
  const holders = admins.data?.filter((admin) => admin.roles.some((entry) => entry.id === role.id)) ?? []
  const canRename = access.editRole(viewer, role)
  const canChange = access.changeRolePermissions(viewer, role)
  const canDelete = access.deleteRole(viewer, role)
  // A new role arrives here with ?edit=permissions so its permissions are chosen straight away.
  const editing = dialog === "permissions" || (canChange && params.get("edit") === "permissions")
  const closeEditor = () => { setDialog(null); if (params.has("edit")) setParams({}, { replace: true }) }
  const Icon = superAdmin ? Crown : ShieldCheck

  return <div className={wrap}>
    {back}
    {message && <Saved message={message} onDismiss={() => setMessage("")} />}

    <header className={cn(card, "flex flex-col gap-4 p-5 sm:flex-row sm:items-center")}>
      <span className={cn("flex size-14 shrink-0 items-center justify-center rounded-2xl", superAdmin ? "bg-[image:var(--gradient-purple)] text-white" : "bg-blue/10 text-blue dark:bg-cyan/10 dark:text-cyan")}><Icon className="size-7" aria-hidden="true" /></span>
      <div className="min-w-0 flex-1">
        <h1 className="flex flex-wrap items-center gap-2 font-heading text-h5 font-semibold">{title}{role.isSystem && <span className="rounded-full bg-purple/10 px-2 py-0.5 text-[11px] font-semibold text-purple">Built in</span>}</h1>
        <p className="font-mono text-xs text-grey-500 dark:text-muted-foreground">{role.name}</p>
        <p className="mt-1.5 max-w-2xl text-sm text-grey-600 dark:text-muted-foreground">{superAdmin ? "Everything, now and later." : role.description || "No description yet."}</p>
      </div>
      {(canRename || canDelete) && <div className="flex flex-wrap gap-2">
        {canRename && <Button variant="outline" className="h-10 rounded-full px-4" onClick={() => setDialog("rename")}><Pencil aria-hidden="true" />Rename</Button>}
        {canDelete && <Button variant="destructive" className="h-10 rounded-full px-4" onClick={() => setDialog("delete")}><Trash2 aria-hidden="true" />Delete</Button>}
      </div>}
    </header>

    {superAdmin ? <LockNote>Built in. The Super Admin role has every permission, including ones added later, and it's the only role that can change admins' access. It can't be renamed, changed or deleted.</LockNote>
      : viewer.ready && !viewer.isSuperAdmin && <LockNote>Only a Super Admin can change or delete roles.</LockNote>}

    <div className="grid gap-4 lg:grid-cols-12">
      <div className="min-w-0 lg:col-span-7">
        <Section id="role-permissions" title="What this role allows" description={superAdmin ? undefined : `${role.permissions.length} ${role.permissions.length === 1 ? "permission" : "permissions"}, by area.`}
          action={canChange && <Button variant="outline" className="h-9 rounded-full px-3.5" onClick={() => setDialog("permissions")}><KeyRound aria-hidden="true" />Edit permissions</Button>}>
          {superAdmin
            ? <p className="px-5 py-6 text-sm">Every permission there is.</p>
            : <PermissionGroups items={role.permissions} empty={canChange ? "Nothing yet. Choose what this role allows with Edit permissions." : "Nothing yet."} />}
        </Section>
      </div>
      <div className="min-w-0 lg:col-span-5">
        <Section id="role-admins" title="Admins with this role" description={admins.isSuccess ? `${holders.length} ${holders.length === 1 ? "admin" : "admins"}` : undefined}>
          {!viewer.can("admins.read") ? <p className="px-5 py-6 text-sm text-grey-500 dark:text-muted-foreground">You can't view admins.</p>
            : !admins.isSuccess ? <p role="status" className="px-5 py-6 text-sm text-grey-500 dark:text-muted-foreground">{admins.isError ? "Could not load admins." : "Loading admins…"}</p>
              : holders.length === 0 ? <p className="px-5 py-6 text-sm text-grey-500 dark:text-muted-foreground">No admin has this role yet. Give it to someone from their page.</p>
                : <ul className="divide-y divide-grey-200 dark:divide-border">
                  {holders.map((admin) => <li key={admin.id}>
                    <Link to={adminPath(admin.id)} className="flex items-center gap-3 px-5 py-3 outline-none transition-colors hover:bg-grey-50/70 focus-visible:bg-grey-50 dark:hover:bg-muted/30">
                      <AdminAvatar admin={admin} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{adminDisplayName(admin)}</span>
                        <span className="block truncate text-xs text-grey-500 dark:text-muted-foreground">{admin.email}</span>
                      </span>
                      {!admin.isActive && <StatusPill active={false} />}
                      <ChevronRight className="size-4 shrink-0 text-grey-400" aria-hidden="true" />
                    </Link>
                  </li>)}
                </ul>}
        </Section>
      </div>
    </div>

    {dialog === "rename" && <RoleFormDialog mode="edit" role={role} onClose={() => setDialog(null)} onSaved={setMessage} />}
    {editing && <EditRolePermissionsDialog role={role} members={holders.length} onClose={closeEditor} onSaved={setMessage} />}
    {dialog === "delete" && <DeleteRoleDialog role={role} members={holders.length} onClose={() => setDialog(null)}
      onDeleted={() => navigate(APP_ROUTES.manageAdminsRoles, { replace: true })} />}
  </div>
}
