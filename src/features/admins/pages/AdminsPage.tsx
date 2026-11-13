import { useId, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { ChevronRight, Crown, Download, Plus, Search, ShieldCheck, UserX, UsersRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { APP_ROUTES } from "@/routes/paths"
import { useAdmins, useRoles, useViewer } from "../hooks"
import { access } from "../lib/access"
import { isSuperAdmin, roleTitle } from "../lib/catalog"
import { rbacErrorMessage } from "../lib/errors"
import { downloadAdminsCsv } from "../lib/export"
import { adminPath } from "../lib/links"
import { adminDisplayName, type Admin } from "../types"
import { AdminFormDialog } from "../components/AdminFormDialog"
import { AdminAvatar, Empty, Failed, Loading, NoAccess, PageIntro, RoleChip, Segmented, Stat, StatusPill, YouTag, YourAccess, card, primaryButton } from "../components/AdminBits"

const ALL = "all"
type StatusFilter = "all" | "active" | "inactive"
const columns = "md:grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_7rem_6.5rem_1rem] md:items-center md:gap-4"

/** Everyone who signs in to this dashboard, what roles they hold and whether they can sign in. */
export function AdminsPage() {
  const viewer = useViewer()
  const navigate = useNavigate()
  const canRead = viewer.can("admins.read")
  const admins = useAdmins(viewer.ready && canRead)
  const roles = useRoles(viewer.ready && viewer.can("roles.read"))
  const [term, setTerm] = useState("")
  const [roleId, setRoleId] = useState(ALL)
  const [status, setStatus] = useState<StatusFilter>(ALL)
  const [adding, setAdding] = useState(false)
  const searchId = useId()

  const list = useMemo(() => admins.data ?? [], [admins.data])
  const roleOptions = useMemo(() => [...new Map([...list.flatMap((admin) => admin.roles), ...(roles.data ?? [])].map((role) => [role.id, role])).values()]
    .sort((a, b) => roleTitle(a.name).localeCompare(roleTitle(b.name))), [list, roles.data])
  const filtered = useMemo(() => {
    const q = term.trim().toLocaleLowerCase()
    return list
      .filter((admin) => roleId === ALL || admin.roles.some((role) => role.id === roleId))
      .filter((admin) => status === ALL || admin.isActive === (status === "active"))
      .filter((admin) => !q || adminDisplayName(admin).toLocaleLowerCase().includes(q) || admin.email.toLocaleLowerCase().includes(q))
      // Super Admins first, then by name.
      .sort((a, b) => Number(isSuperAdmin(b)) - Number(isSuperAdmin(a)) || adminDisplayName(a).localeCompare(adminDisplayName(b)))
  }, [list, roleId, status, term])

  if (viewer.ready && !canRead) return <div className="flex min-w-0 flex-col gap-4 px-4 pb-10 sm:px-6"><NoAccess what="admins" /></div>

  const active = list.filter((admin) => admin.isActive).length
  const loaded = admins.isSuccess

  return <div className="flex min-w-0 flex-col gap-4 px-4 pb-10 sm:px-6">
    <PageIntro action={access.addAdmin(viewer) && <Button className={primaryButton} onClick={() => setAdding(true)}><Plus aria-hidden="true" />Add admin</Button>}>
      Admins are the people who sign in to this dashboard. What each one can do comes from their <Link to={APP_ROUTES.manageAdminsRoles} className="font-semibold text-purple hover:underline">roles</Link>, plus any extra permissions given to them alone.
    </PageIntro>
    {viewer.ready && <YourAccess isSuperAdmin={viewer.isSuperAdmin} />}

    <section aria-label="Admins at a glance" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <Stat icon={UsersRound} label="Admins" value={loaded ? list.length : undefined} hint={loaded ? `${active} can sign in` : undefined} />
      <Stat icon={Crown} tone="purple" label="Super Admins" value={loaded ? list.filter(isSuperAdmin).length : undefined} hint="Can change everyone's access" />
      <Stat icon={ShieldCheck} label="Roles" value={roles.isSuccess ? roles.data.length : undefined} hint="Named sets of permissions" />
      <Stat icon={UserX} tone="muted" label="Deactivated" value={loaded ? list.length - active : undefined} hint="Can't sign in" />
    </section>

    <section aria-label="Admin list" className={cn(card, "min-w-0 overflow-hidden")}>
      <div className="flex flex-col gap-3 border-b border-grey-200 p-4 dark:border-border sm:p-5 lg:flex-row lg:flex-wrap lg:items-center">
        <label htmlFor={searchId} className="sr-only">Search admins</label>
        <div className="relative min-w-0 lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id={searchId} type="search" value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Name or email" autoComplete="off" className="h-10 rounded-full pl-9" />
        </div>
        <Select value={roleId} onValueChange={setRoleId}>
          <SelectTrigger aria-label="Role" className="h-10 rounded-full lg:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All roles</SelectItem>
            {roleOptions.map((role) => <SelectItem key={role.id} value={role.id}>{roleTitle(role.name)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Segmented label="Status" value={status} onChange={setStatus} options={[
          { value: ALL, label: "All", count: loaded ? list.length : undefined },
          { value: "active", label: "Active", count: loaded ? active : undefined },
          { value: "inactive", label: "Deactivated", count: loaded ? list.length - active : undefined },
        ]} />
        <Button variant="outline" className="h-10 rounded-full px-4 lg:ml-auto" disabled={!loaded || filtered.length === 0} onClick={() => downloadAdminsCsv(filtered)}><Download aria-hidden="true" />Export CSV</Button>
      </div>

      <div aria-hidden="true" className={cn("hidden border-b border-grey-200 px-5 py-2.5 text-xs font-medium text-grey-500 dark:border-border dark:text-muted-foreground", columns)}>
        <span>Admin</span><span>Roles</span><span>Status</span><span>Last changed</span><span />
      </div>

      {admins.isError ? <Failed message={rbacErrorMessage(admins.error, "Could not load admins.", "admin")} onRetry={() => void admins.refetch()} retryLabel="Retry admins" />
        : !loaded ? <Loading label="Loading admins" />
          : filtered.length === 0 ? <Empty title="No admins match">Try another name, role or status.</Empty>
            : <ul aria-label="Admins" className="divide-y divide-grey-200 dark:divide-border">
              {filtered.map((admin) => <AdminRow key={admin.id} admin={admin} you={admin.id === viewer.id} />)}
            </ul>}
    </section>

    {adding && <AdminFormDialog mode="create" onClose={() => setAdding(false)} onCreated={(admin) => navigate(adminPath(admin.id), { state: { message: `Added ${adminDisplayName(admin)}.` } })} />}
  </div>
}

function AdminRow({ admin, you }: { admin: Admin; you: boolean }) {
  const name = adminDisplayName(admin)
  return <li>
    <Link to={adminPath(admin.id)} aria-label={`${name}, ${admin.isActive ? "active" : "deactivated"}`}
      className={cn("flex flex-col gap-3 px-5 py-4 outline-none transition-colors hover:bg-grey-50/70 focus-visible:bg-grey-50 dark:hover:bg-muted/30 dark:focus-visible:bg-muted/30", columns)}>
      <span className="flex min-w-0 items-center gap-3">
        <AdminAvatar admin={admin} />
        <span className="min-w-0">
          <span className="flex items-center gap-2"><span className="truncate font-semibold">{name}</span>{you && <YouTag />}</span>
          <span className="block truncate text-xs text-grey-500 dark:text-muted-foreground">{admin.email}</span>
        </span>
      </span>
      <span className="flex min-w-0 flex-wrap gap-1.5">
        {admin.roles.length ? admin.roles.map((role) => <RoleChip key={role.id} role={role} />) : <span className="text-xs text-grey-500 dark:text-muted-foreground">No roles yet</span>}
        {admin.permissions.length > 0 && <span className="text-xs text-grey-500 dark:text-muted-foreground">+{admin.permissions.length} extra</span>}
      </span>
      <span className="flex items-center justify-between gap-3 md:contents">
        <span className="w-fit"><StatusPill active={admin.isActive} /></span>
        <span className="text-xs text-grey-500 dark:text-muted-foreground">{format(new Date(admin.updatedAt), "d MMM yyyy")}</span>
      </span>
      <ChevronRight className="hidden size-4 text-grey-400 md:block" aria-hidden="true" />
    </Link>
  </li>
}
