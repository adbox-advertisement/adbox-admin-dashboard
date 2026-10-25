import { useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { BriefcaseBusiness, GraduationCap, MapPin, School, UsersRound } from "lucide-react"
import { cn } from "@/lib/utils"
import { APP_ROUTES } from "@/routes/paths"
import { useUserAccess, useUserStats } from "../hooks"
import { usersErrorMessage } from "../lib/errors"
import { percentOf } from "../lib/format"
import { emptyPeopleFilters, type PeopleFilters } from "../lib/people-filters"
import {
  USER_PERMISSIONS,
  accountRoleLabels,
  affiliationDescriptions,
  affiliationLabels,
  institutionTypeLabels,
  type AccountRole,
  type Affiliation,
  type Members,
} from "../types"
import { affiliations } from "../validation"
import { PeopleTable } from "../components/PeopleTable"
import { BackLink, BarList, EmptyState, ErrorState, NoAccess, Panel, StatCard, ink, muted, surface } from "../components/Surface"
import { UserAvatar } from "../components/UserBadges"

export function InstitutionDetailPage() {
  const { institutionId = "" } = useParams()
  const can = useUserAccess()
  const allowed = can(USER_PERMISSIONS.read)
  const stats = useUserStats(institutionId, allowed)
  const [filters, setFilters] = useState<PeopleFilters>({ ...emptyPeopleFilters, institutionId })
  const peopleRef = useRef<HTMLDivElement>(null)

  if (!allowed) return <NoAccess permission={USER_PERMISSIONS.read} what="institution members" />

  const institution = stats.data?.institutions[0]
  const showPeople = (patch: Partial<PeopleFilters>) => {
    setFilters({ ...emptyPeopleFilters, institutionId, ...patch })
    peopleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return <div className="flex min-w-0 flex-col gap-5 px-4 sm:px-6">
    <BackLink to={APP_ROUTES.manageUsersInstitutions}>All institutions</BackLink>
    {stats.isError && <div className={surface}><ErrorState message={usersErrorMessage(stats.error, "Could not load this institution.")} onRetry={() => void stats.refetch()} /></div>}
    {stats.isPending && <div role="status" aria-label="Loading institution" className={cn(surface, "h-40 animate-pulse")} />}
    {stats.data && !institution && <div className={surface}><EmptyState icon={School} title="Institution not found">It may have been removed from the catalogue.</EmptyState></div>}

    {stats.data && institution && <>
      <header className={cn(surface, "flex flex-wrap items-center gap-4 p-5")}>
        {institution.logoUrl ? <UserAvatar name={institution.shortName} image={institution.logoUrl} size="lg" square /> : <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-blue/10 text-blue dark:text-cyan"><School className="size-7" aria-hidden="true" /></span>}
        <div className="min-w-0 flex-1">
          <h1 className={cn("font-heading text-h5 font-semibold", ink)}>{institution.name}</h1>
          <p className={cn("text-b3", muted)}>
            {[institution.shortName, institutionTypeLabels[institution.type] ?? institution.type, institution.region].filter(Boolean).join(" · ")}
            {!institution.isActive && <span className="ml-2 rounded-full bg-grey-100 px-2 py-0.5 text-b4 font-semibold dark:bg-muted">Inactive</span>}
          </p>
        </div>
      </header>

      <section aria-label="Member figures" className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <StatCard icon={UsersRound} tone="purple" label="Members" value={institution.members.total} hint={`${percentOf(institution.members.verified, institution.members.total)} verified`} />
        <StatCard icon={GraduationCap} tone="blue" label="Students" value={institution.members.STUDENT} />
        <StatCard icon={GraduationCap} tone="success" label="Alumni" value={institution.members.ALUMNI} />
        <StatCard icon={BriefcaseBusiness} tone="warning" label="Faculty & staff" value={institution.members.STAFF} />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Panel className="lg:col-span-4" title="Affiliation" description="How members relate to the institution.">
          <AffiliationBars members={institution.members} onSelect={(affiliation) => showPeople({ affiliation })} />
        </Panel>
        <Panel className="lg:col-span-4" title="Account roles" description="What members do on AdBox.">
          <BarList label="Members by account role" total={stats.data.total} rows={(["VIEWER", "CREATOR", "PUBLISHER"] as AccountRole[]).map((role) => ({
            key: role, label: accountRoleLabels[role], value: stats.data.roles[role],
          }))} />
        </Panel>
        <Panel className="lg:col-span-4" title="Verification" description="Only verified members carry the campus badge.">
          <BarList label="Members by verification" total={institution.members.total} rows={[
            { key: "verified", label: "Verified", value: institution.members.verified },
            { key: "pending", label: "Pending review", value: institution.members.pending },
            { key: "self", label: "Self-declared", value: institution.members.total - institution.members.verified - institution.members.pending },
          ]} />
        </Panel>
      </div>

      <Panel title="Campuses" description="Members on each campus. Select one to list its people." bodyClassName="p-0">
        {(stats.data.campuses?.length ?? 0) === 0 ? <p className={cn("p-5 text-b3", muted)}>No campuses are listed for this institution.</p> : <div className="max-w-full overflow-x-auto [contain:paint]">
          <table className="w-full min-w-[640px] text-left text-b3 md:text-b2">
            <caption className="sr-only">Campuses and their members</caption>
            <thead>
              <tr className={cn("border-b border-grey-200 dark:border-border", muted)}>
                <th scope="col" className="px-5 py-3 font-semibold">Campus</th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">Members</th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">Students</th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">Alumni</th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">Staff</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">Verified</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {stats.data.campuses?.map((campus) => <tr key={campus.id} className="border-b border-grey-100 last:border-b-0 dark:border-border">
                <th scope="row" className="px-5 py-3 font-normal">
                  <button type="button" onClick={() => showPeople({ campusId: campus.id })} className={cn("flex cursor-pointer items-center gap-2 text-left font-semibold hover:text-purple", ink)}>
                    <MapPin className="size-4 text-grey-400" aria-hidden="true" />{campus.name}
                    <span className={cn("font-normal", muted)}>· {campus.city}{campus.hallCount ? ` · ${campus.hallCount} halls` : ""}</span>
                  </button>
                </th>
                <td className={cn("px-3 py-3 text-right font-semibold", ink)}>{campus.members.total.toLocaleString()}</td>
                <td className="px-3 py-3 text-right">{campus.members.STUDENT.toLocaleString()}</td>
                <td className="px-3 py-3 text-right">{campus.members.ALUMNI.toLocaleString()}</td>
                <td className="px-3 py-3 text-right">{campus.members.STAFF.toLocaleString()}</td>
                <td className="px-5 py-3 text-right">{percentOf(campus.members.verified, campus.members.total)}</td>
              </tr>)}
              {stats.data.withoutCampus && stats.data.withoutCampus.total > 0 && <tr className={muted}>
                <th scope="row" className="px-5 py-3 font-normal italic">No campus chosen</th>
                <td className="px-3 py-3 text-right">{stats.data.withoutCampus.total.toLocaleString()}</td>
                <td className="px-3 py-3 text-right">{stats.data.withoutCampus.STUDENT.toLocaleString()}</td>
                <td className="px-3 py-3 text-right">{stats.data.withoutCampus.ALUMNI.toLocaleString()}</td>
                <td className="px-3 py-3 text-right">{stats.data.withoutCampus.STAFF.toLocaleString()}</td>
                <td className="px-5 py-3 text-right">{percentOf(stats.data.withoutCampus.verified, stats.data.withoutCampus.total)}</td>
              </tr>}
            </tbody>
          </table>
        </div>}
      </Panel>

      <div ref={peopleRef} className="flex scroll-mt-4 flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className={cn("font-heading text-b1 font-semibold", ink)}>Members</h2>
          <div role="radiogroup" aria-label="Show members by affiliation" className="flex flex-wrap gap-1 rounded-full bg-white p-1 shadow-adbox-small dark:bg-card">
            {(["", ...affiliations] as Array<Affiliation | "">).map((value) => <button key={value || "all"} type="button" role="radio" aria-checked={filters.affiliation === value}
              onClick={() => setFilters({ ...filters, affiliation: value, page: 1 })}
              className={cn("cursor-pointer rounded-full px-3.5 py-1.5 text-b3 font-semibold transition-colors", filters.affiliation === value ? "bg-purple/10 text-purple" : "text-grey-500 hover:text-grey-1000 dark:text-muted-foreground dark:hover:text-foreground")}>
              {value ? affiliationLabels[value] : "Everyone"}
            </button>)}
          </div>
        </div>
        <PeopleTable title={`${institution.shortName} members`} filters={filters} onChange={setFilters} locked={["institutionId", "affiliation"]} campuses={stats.data.campuses ?? []} />
      </div>
    </>}
  </div>
}

function AffiliationBars({ members, onSelect }: { members: Members; onSelect: (affiliation: Affiliation) => void }) {
  return <ul className="flex flex-col gap-1">
    {affiliations.map((affiliation) => {
      const value = members[affiliation]
      return <li key={affiliation}>
        <button type="button" onClick={() => onSelect(affiliation)} className="block w-full cursor-pointer rounded-xl px-2 py-2 text-left transition-colors hover:bg-grey-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple dark:hover:bg-background"
          aria-label={`${affiliationLabels[affiliation]}: ${value}, ${percentOf(value, members.total)}. Show them`}>
          <span className="flex items-baseline justify-between gap-3">
            <span className="min-w-0">
              <span className={cn("block truncate text-b3 font-semibold", ink)}>{affiliationLabels[affiliation]}</span>
              <span className={cn("block truncate text-b4", muted)}>{affiliationDescriptions[affiliation]}</span>
            </span>
            <span className="shrink-0 text-b3 tabular-nums"><span className={cn("font-semibold", ink)}>{value.toLocaleString()}</span><span className={cn("ml-1.5", muted)}>{percentOf(value, members.total)}</span></span>
          </span>
          <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-grey-100 dark:bg-muted" aria-hidden="true">
            <span className="block h-full rounded-full bg-blue dark:bg-cyan" style={{ width: members.total ? `${(value / members.total) * 100}%` : 0 }} />
          </span>
        </button>
      </li>
    })}
  </ul>
}
