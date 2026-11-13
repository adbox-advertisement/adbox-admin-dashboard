import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ChevronRight, Crown, Download, Plus, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { APP_ROUTES } from "@/routes/paths"
import { useAdmins, useRoles, useViewer } from "../hooks"
import { access } from "../lib/access"
import { areasCovered, isSuperAdminRole, roleTitle } from "../lib/catalog"
import { rbacErrorMessage } from "../lib/errors"
import { downloadRolesCsv } from "../lib/export"
import { rolePath } from "../lib/links"
import type { Role } from "../types"
import { RoleFormDialog } from "../components/RoleDialogs"
import { Failed, LockNote, NoAccess, PageIntro, card, primaryButton } from "../components/AdminBits"

/** Every role: what it's for, how much it allows, which areas it touches and who has it. */
export function RolesPage() {
  const viewer = useViewer()
  const navigate = useNavigate()
  const canRead = viewer.can("roles.read")
  const roles = useRoles(viewer.ready && canRead)
  const admins = useAdmins(viewer.ready && viewer.can("admins.read"))
  const [creating, setCreating] = useState(false)

  if (viewer.ready && !canRead) return <div className="flex min-w-0 flex-col gap-4 px-4 pb-10 sm:px-6"><NoAccess what="roles" /></div>

  const sorted = [...(roles.data ?? [])].sort((a, b) => Number(isSuperAdminRole(b)) - Number(isSuperAdminRole(a)) || roleTitle(a.name).localeCompare(roleTitle(b.name)))
  const members = (role: Role) => admins.data?.filter((admin) => admin.roles.some((entry) => entry.id === role.id)).length

  return <div className="flex min-w-0 flex-col gap-4 px-4 pb-10 sm:px-6">
    <PageIntro action={<div className="flex flex-wrap gap-2">
      <Button variant="outline" className="h-10 rounded-full px-4" disabled={!roles.isSuccess || sorted.length === 0} onClick={() => downloadRolesCsv(sorted)}><Download aria-hidden="true" />Export CSV</Button>
      {access.createRole(viewer) && <Button className={primaryButton} onClick={() => setCreating(true)}><Plus aria-hidden="true" />New role</Button>}
    </div>}>
      A role is a named set of permissions for a job, such as reviewing ads. Give admins roles rather than one-off permissions, so changing a role updates everyone who has it. See every permission on the <Link to={APP_ROUTES.manageAdminsPermissions} className="font-semibold text-purple hover:underline">Permissions</Link> page.
    </PageIntro>
    {viewer.ready && !viewer.isSuperAdmin && <LockNote>Only a Super Admin can create, change or delete roles.</LockNote>}

    {roles.isError ? <div className={card}><Failed message={rbacErrorMessage(roles.error, "Could not load roles.")} onRetry={() => void roles.refetch()} retryLabel="Retry roles" /></div>
      : !roles.isSuccess ? <div role="status" aria-label="Loading roles" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className={cn(card, "h-44 animate-pulse")} />)}</div>
        : <ul aria-label="Roles" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((role) => <li key={role.id}><RoleCard role={role} members={members(role)} /></li>)}
        </ul>}

    {creating && <RoleFormDialog mode="create" onClose={() => setCreating(false)}
      onCreated={(role) => navigate(`${rolePath(role.id)}?edit=permissions`, { state: { message: `Created ${roleTitle(role.name)}. Now choose what it allows.` } })} />}
  </div>
}

function RoleCard({ role, members }: { role: Role; members: number | undefined }) {
  const superAdmin = isSuperAdminRole(role)
  const Icon = superAdmin ? Crown : ShieldCheck
  const covered = areasCovered(role.permissions)
  return <Link to={rolePath(role.id)} aria-label={roleTitle(role.name)}
    className={cn(card, "group flex h-full flex-col gap-3 p-5 outline-none transition hover:shadow-adbox-medium focus-visible:ring-2 focus-visible:ring-purple", superAdmin && "ring-1 ring-purple/30")}>
    <div className="flex items-start gap-3">
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", superAdmin ? "bg-[image:var(--gradient-purple)] text-white" : "bg-blue/10 text-blue dark:bg-cyan/10 dark:text-cyan")}><Icon className="size-5" aria-hidden="true" /></span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 font-heading text-base font-semibold">{roleTitle(role.name)}{role.isSystem && <span className="rounded-full bg-purple/10 px-2 py-0.5 text-[11px] font-semibold text-purple">Built in</span>}</p>
        <p className="font-mono text-[11px] text-grey-500 dark:text-muted-foreground">{role.name}</p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-grey-400 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </div>
    <p className="line-clamp-2 text-sm leading-6 text-grey-600 dark:text-muted-foreground">{superAdmin ? "Everything, now and later. The only role that can change admins' access." : role.description || "No description yet."}</p>
    {!superAdmin && <div className="flex flex-wrap gap-1.5">
      {covered.slice(0, 3).map((area) => <span key={area.id} className="rounded-full bg-grey-100 px-2 py-0.5 text-[11px] font-medium text-grey-700 dark:bg-muted dark:text-muted-foreground">{area.label}</span>)}
      {covered.length > 3 && <span className="rounded-full bg-grey-100 px-2 py-0.5 text-[11px] font-medium text-grey-700 dark:bg-muted dark:text-muted-foreground">+{covered.length - 3} more</span>}
    </div>}
    <dl className="mt-auto grid grid-cols-2 gap-3 rounded-xl bg-grey-50 p-3 dark:bg-background">
      <div><dt className="text-[11px] text-grey-500 dark:text-muted-foreground">Allows</dt><dd className="font-semibold">{superAdmin ? "Everything" : `${role.permissions.length} ${role.permissions.length === 1 ? "permission" : "permissions"}`}</dd></div>
      <div><dt className="text-[11px] text-grey-500 dark:text-muted-foreground">Admins</dt><dd className="font-semibold tabular-nums">{members ?? "—"}</dd></div>
    </dl>
  </Link>
}
