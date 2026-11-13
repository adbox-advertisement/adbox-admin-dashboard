import { useId, useState } from "react"
import { Link } from "react-router-dom"
import { Crown, Lock, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { APP_ROUTES } from "@/routes/paths"
import { usePermissions, useRoles, useViewer } from "../hooks"
import { WILDCARD, areas, groupByArea, isSensitive, permissionLabel, roleTitle } from "../lib/catalog"
import { rbacErrorMessage } from "../lib/errors"
import { rolePath } from "../lib/links"
import type { Permission, Role } from "../types"
import { Empty, Failed, Loading, NoAccess, PageIntro, SensitiveTag, card } from "../components/AdminBits"

/** Every permission an admin can be given, by area: what it allows, and which roles include it. Read-only. */
export function PermissionsPage() {
  const viewer = useViewer()
  const canRead = viewer.can("permissions.read")
  const permissions = usePermissions(viewer.ready && canRead)
  const roles = useRoles(viewer.ready && viewer.can("roles.read"))
  const [term, setTerm] = useState("")
  const searchId = useId()

  if (viewer.ready && !canRead) return <div className="flex min-w-0 flex-col gap-4 px-4 pb-10 sm:px-6"><NoAccess what="permissions" /></div>

  const q = term.trim().toLowerCase()
  const all = permissions.data ?? []
  const visible = q ? all.filter((permission) => [permission.key, permissionLabel(permission.key), permission.description].some((text) => text.toLowerCase().includes(q))) : all
  const groups = groupByArea(visible)
  const rolesWith = (permission: Permission) => (roles.data ?? []).filter((role) => role.permissions.some((entry) => entry.id === permission.id))
  const sensitiveCount = all.filter((permission) => permission.key !== WILDCARD && isSensitive(permission.key)).length

  return <div className="flex min-w-0 flex-col gap-4 px-4 pb-10 sm:px-6">
    <PageIntro>
      Every permission an admin can be given, by area. Most admins get them through a <Link to={APP_ROUTES.manageAdminsRoles} className="font-semibold text-purple hover:underline">role</Link>; one can also be given to a single admin as an extra permission from their page.
    </PageIntro>
    <p className="flex items-start gap-2.5 rounded-2xl bg-warning-500/10 px-4 py-3 text-sm text-warning-900 dark:text-warning-200">
      <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span><span className="font-semibold">Sensitive</span> permissions change who can do what{permissions.isSuccess ? ` (${sensitiveCount} of them)` : ""}. Only a Super Admin can give any permission or role, so they can't be handed out by anyone else.</span>
    </p>

    <div className={cn(card, "flex flex-wrap items-center gap-3 p-4 sm:p-5")}>
      <label htmlFor={searchId} className="sr-only">Search permissions</label>
      <div className="relative min-w-0 flex-1 sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input id={searchId} type="search" value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Name, key or what it allows" autoComplete="off" className="h-10 rounded-full pl-9" />
      </div>
      {permissions.isSuccess && <p className="text-xs text-grey-500 dark:text-muted-foreground">{visible.filter((permission) => permission.key !== WILDCARD).length} permissions in {groups.length} of {areas.length} areas</p>}
    </div>

    {permissions.isError ? <div className={card}><Failed message={rbacErrorMessage(permissions.error, "Could not load permissions.")} onRetry={() => void permissions.refetch()} retryLabel="Retry permissions" /></div>
      : !permissions.isSuccess ? <div className={card}><Loading label="Loading permissions" /></div>
        : <>
          {visible.some((permission) => permission.key === WILDCARD) && <section aria-label="Everything" className={cn(card, "flex items-start gap-3 p-5")}>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[image:var(--gradient-purple)] text-white"><Crown className="size-5" aria-hidden="true" /></span>
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-semibold">Everything <SensitiveTag /></p>
              <p className="text-sm text-grey-600 dark:text-muted-foreground">Every permission, including ones added later. It's what the Super Admin role is built on; give someone the Super Admin role rather than this. <span className="font-mono text-xs">*</span></p>
            </div>
          </section>}
          {groups.length === 0 && !visible.length && <div className={card}><Empty title="No permission matches">Try another word.</Empty></div>}
          {groups.map(({ area, items }) => <section key={area.id} aria-labelledby={`area-${area.id}`} className={cn(card, "min-w-0 overflow-hidden")}>
            <div className="border-b border-grey-200 px-5 py-4 dark:border-border">
              <h2 id={`area-${area.id}`} className="font-heading text-base font-semibold">{area.label} <span className="text-sm font-normal text-grey-500 dark:text-muted-foreground">· {items.length}</span></h2>
              <p className="text-xs text-grey-500 dark:text-muted-foreground">{area.hint}</p>
            </div>
            <ul className="divide-y divide-grey-200 dark:divide-border">
              {items.map((permission) => <PermissionRow key={permission.id} permission={permission} roles={roles.isSuccess ? rolesWith(permission) : null} />)}
            </ul>
          </section>)}
        </>}
  </div>
}

function PermissionRow({ permission, roles }: { permission: Permission; roles: Role[] | null }) {
  return <li className="grid gap-2 px-5 py-3.5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:gap-6">
    <div className="min-w-0">
      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">{permissionLabel(permission.key)}{isSensitive(permission.key) && <SensitiveTag />}</p>
      {permission.description && <p className="text-sm leading-6 text-grey-600 dark:text-muted-foreground">{permission.description}</p>}
      <p className="font-mono text-[11px] text-grey-500 dark:text-muted-foreground">{permission.key}</p>
    </div>
    {roles && <div className="flex min-w-0 flex-wrap content-start items-center gap-1.5">
      <span className="text-[11px] font-medium text-grey-500 dark:text-muted-foreground">In roles:</span>
      {roles.length === 0 ? <span className="text-xs text-grey-500 dark:text-muted-foreground">only Super Admin, which has everything</span>
        : roles.map((role) => <Link key={role.id} to={rolePath(role.id)} className="rounded-full bg-grey-100 px-2 py-0.5 text-[11px] font-medium text-grey-800 outline-none hover:bg-purple/10 hover:text-purple focus-visible:ring-2 focus-visible:ring-purple dark:bg-muted dark:text-foreground">{roleTitle(role.name)}</Link>)}
    </div>}
  </li>
}
