import { useId, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BriefcaseBusiness, GraduationCap, School, Search, UsersRound } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useUserAccess, useUserStats } from "../hooks"
import { usersErrorMessage } from "../lib/errors"
import { percentOf } from "../lib/format"
import { institutionPath } from "../lib/paths"
import { USER_PERMISSIONS, institutionTypeLabels, type UserStats } from "../types"
import { EmptyState, ErrorState, NoAccess, RowsSkeleton, StatCard, ink, muted, surface } from "../components/Surface"
import { UserAvatar } from "../components/UserBadges"

const ALL = "all"

export function InstitutionsPage() {
  const can = useUserAccess()
  const allowed = can(USER_PERMISSIONS.read)
  const stats = useUserStats(undefined, allowed)
  const navigate = useNavigate()
  const searchId = useId()
  const [search, setSearch] = useState("")
  const [type, setType] = useState(ALL)
  const [withMembers, setWithMembers] = useState(false)

  const institutions = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (stats.data?.institutions ?? []).filter((institution) =>
      (type === ALL || institution.type === type)
      && (!withMembers || institution.members.total > 0)
      && (!query || `${institution.name} ${institution.shortName} ${institution.region ?? ""}`.toLowerCase().includes(query)))
  }, [stats.data, search, type, withMembers])

  if (!allowed) return <NoAccess permission={USER_PERMISSIONS.read} what="institution members" />

  const data = stats.data
  const affiliated = data ? data.institutions.reduce((sum, institution) => sum + institution.members.total, 0) : undefined
  const largest = Math.max(1, ...institutions.map((institution) => institution.members.total))
  const types = [...new Set(data?.institutions.map((institution) => institution.type) ?? [])].sort()

  return <div className="flex min-w-0 flex-col gap-5 px-4 sm:px-6">
    <section aria-label="Institution figures" className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      <StatCard icon={School} tone="purple" label="Institutions" value={data?.institutions.length} hint={data ? `${data.institutions.filter((institution) => institution.members.total > 0).length} with members` : undefined} />
      <StatCard icon={UsersRound} tone="blue" label="People with an institution" value={affiliated} hint={data && affiliated !== undefined ? `${percentOf(affiliated, data.total)} of everyone` : undefined} />
      <StatCard icon={GraduationCap} tone="success" label="Students" value={data?.affiliation.STUDENT} hint={data ? `${data.affiliation.ALUMNI.toLocaleString()} alumni` : undefined} />
      <StatCard icon={BriefcaseBusiness} tone="warning" label="Faculty & staff" value={data?.affiliation.STAFF} hint="Lecturers and campus staff" />
    </section>

    <article aria-label="Institutions" className={cn(surface, "overflow-hidden")}>
      <div className="grid grid-cols-1 gap-3 border-b border-grey-200 p-4 dark:border-border sm:flex sm:flex-wrap sm:items-center sm:p-5">
        <div className="relative min-w-0 sm:min-w-[240px] sm:flex-1">
          <label htmlFor={searchId} className="sr-only">Search institutions</label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-grey-400 dark:text-muted-foreground" />
          <Input id={searchId} type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, short name or region" autoComplete="off"
            className="h-11 rounded-full border-grey-200 bg-grey-50 pl-10 text-b3 focus-visible:ring-0 dark:border-border dark:bg-background md:text-b2" />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger aria-label="Filter by institution type" className="h-11 w-full cursor-pointer rounded-full border-grey-200 bg-grey-50 text-b3 dark:border-border dark:bg-background sm:w-[210px] md:text-b2"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All types</SelectItem>
            {types.map((value) => <SelectItem key={value} value={value}>{institutionTypeLabels[value] ?? value}</SelectItem>)}
          </SelectContent>
        </Select>
        <label className="flex h-11 cursor-pointer items-center gap-2 rounded-full px-2 text-b3 md:text-b2">
          <input type="checkbox" checked={withMembers} onChange={(event) => setWithMembers(event.target.checked)} className="size-4 accent-purple" />
          Only with members
        </label>
      </div>

      {stats.isPending && <RowsSkeleton label="Loading institutions" />}
      {stats.isError && <ErrorState message={usersErrorMessage(stats.error, "Could not load institutions.")} onRetry={() => void stats.refetch()} />}
      {data && (institutions.length === 0
        ? <EmptyState icon={School} title="No institutions match">Try another name or type.</EmptyState>
        : <div className="max-w-full overflow-x-auto [contain:paint]">
          <table className="w-full min-w-[900px] text-left text-b3 md:text-b2">
            <caption className="sr-only">Institutions and their members by affiliation</caption>
            <thead>
              <tr className={cn("border-b border-grey-200 bg-grey-50/60 dark:border-border dark:bg-background/60", muted)}>
                <th scope="col" className="px-6 py-4 font-semibold">Institution</th>
                <th scope="col" className="w-[22%] px-3 py-4 font-semibold">Members</th>
                <th scope="col" className="px-3 py-4 text-right font-semibold">Students</th>
                <th scope="col" className="px-3 py-4 text-right font-semibold">Alumni</th>
                <th scope="col" className="px-3 py-4 text-right font-semibold">Staff</th>
                <th scope="col" className="px-3 py-4 text-right font-semibold">No status</th>
                <th scope="col" className="px-6 py-4 text-right font-semibold">Verified</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {institutions.map((institution) => <InstitutionRow key={institution.id} institution={institution} largest={largest} onOpen={() => navigate(institutionPath(institution.id))} />)}
            </tbody>
          </table>
        </div>)}
    </article>
  </div>
}

function InstitutionRow({ institution, largest, onOpen }: { institution: UserStats["institutions"][number]; largest: number; onOpen: () => void }) {
  const { members } = institution
  return <tr className="cursor-pointer border-b border-grey-200 transition-colors last:border-b-0 hover:bg-grey-50/60 dark:border-border dark:hover:bg-background/60" onClick={onOpen}>
    <th scope="row" className="px-6 py-4 font-normal">
      <div className="flex min-w-0 items-center gap-3">
        {institution.logoUrl ? <UserAvatar name={institution.shortName} image={institution.logoUrl} square /> : <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue/10 text-blue dark:text-cyan"><School className="size-4" aria-hidden="true" /></span>}
        <div className="min-w-0">
          <button type="button" onClick={(event) => { event.stopPropagation(); onOpen() }} className={cn("block max-w-[280px] cursor-pointer truncate text-left font-semibold hover:text-purple focus-visible:text-purple focus-visible:outline-none", ink)}>
            {institution.shortName} <span className={cn("font-normal", muted)}>· {institution.name}</span>
          </button>
          <p className={cn("truncate text-b4", muted)}>
            {[institutionTypeLabels[institution.type] ?? institution.type, institution.region, `${institution.campusCount} campus${institution.campusCount === 1 ? "" : "es"}`, !institution.isActive && "Inactive"].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>
    </th>
    <td className="px-3 py-4">
      <p className={cn("font-semibold", ink)}>{members.total.toLocaleString()}</p>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-grey-100 dark:bg-muted" aria-hidden="true">
        <div className="h-full rounded-full bg-blue dark:bg-cyan" style={{ width: `${(members.total / largest) * 100}%` }} />
      </div>
    </td>
    <td className="px-3 py-4 text-right">{members.STUDENT.toLocaleString()}</td>
    <td className="px-3 py-4 text-right">{members.ALUMNI.toLocaleString()}</td>
    <td className="px-3 py-4 text-right">{members.STAFF.toLocaleString()}</td>
    <td className={cn("px-3 py-4 text-right", muted)}>{members.NONE.toLocaleString()}</td>
    <td className="px-6 py-4 text-right">
      <p>{percentOf(members.verified, members.total)}</p>
      {members.pending > 0 && <p className="text-b4 text-warning-700 dark:text-warning-300">{members.pending} pending</p>}
    </td>
  </tr>
}
