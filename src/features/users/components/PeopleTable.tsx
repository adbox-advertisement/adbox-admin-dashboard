import { useId } from "react"
import { useNavigate } from "react-router-dom"
import { MailCheck, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useDebouncedValue, useInstitutions, usePlatformUsers, useUserAccess } from "../hooks"
import { usersErrorMessage } from "../lib/errors"
import { formatDate, formatRelative } from "../lib/format"
import { userProfilePath } from "../lib/paths"
import { activeFilterCount, emptyPeopleFilters, peopleQuery, type PeopleFilters } from "../lib/people-filters"
import {
  USER_PERMISSIONS,
  accountRoleLabels,
  accountStatusLabels,
  accountStatusOf,
  activeBadges,
  affiliationLabels,
  badgeLabels,
  studentStatusLabels,
  userDisplayName,
  verificationTierLabels,
  type AccountRole,
  type AccountStatus,
  type Affiliation,
  type BadgeKind,
  type VerificationTier,
} from "../types"
import { accountRoles, accountStatuses, affiliations, badgeKinds, verificationTiers } from "../validation"
import { AccountStatusBadge, EarnedBadges, RoleBadge, TierBadge, UserAvatar } from "./UserBadges"
import { UserRowMenu } from "./UserRowMenu"
import { EmptyState, ErrorState, RowsSkeleton, ink, muted, surface } from "./Surface"

const PAGE_SIZE = 20
const filterTrigger = "h-11 w-full cursor-pointer rounded-full border-grey-200 bg-grey-50 text-b3 dark:border-border dark:bg-background sm:w-auto sm:min-w-[150px] md:text-b2"
const ALL = "all"

type FilterKey = Exclude<keyof PeopleFilters, "page" | "search">

/**
 * Every platform account, filtered on the server. Controlled: the People page
 * keeps filters in the URL, an institution page in local state with its
 * institution locked.
 */
export function PeopleTable({ filters, onChange, locked = [], campuses, title = "People" }: {
  filters: PeopleFilters
  onChange: (next: PeopleFilters) => void
  locked?: FilterKey[]
  campuses?: Array<{ id: string; name: string }>
  title?: string
}) {
  const can = useUserAccess()
  const navigate = useNavigate()
  const showInstitution = !locked.includes("institutionId")
  const institutions = useInstitutions(showInstitution && can(USER_PERMISSIONS.institutionsRead))
  const search = useDebouncedValue(filters.search.trim())
  const users = usePlatformUsers(peopleQuery(filters, search, PAGE_SIZE))
  const searchId = useId()
  const activeCount = activeFilterCount(filters, locked)
  const filtered = activeCount > 0 || Boolean(search)

  // Any filter change returns to the first page.
  const set = <K extends keyof PeopleFilters>(key: K, value: PeopleFilters[K]) =>
    onChange({ ...filters, [key]: value, ...(key === "page" ? {} : { page: 1 }), ...(key === "institutionId" ? { campusId: "" } : {}) })

  function clear() {
    const next = { ...emptyPeopleFilters }
    for (const key of locked) (next as Record<string, unknown>)[key] = filters[key]
    onChange(next)
  }

  const select = <T extends string>(key: FilterKey, label: string, values: readonly T[], labels: Record<T, string>, allLabel: string) =>
    <Select value={(filters[key] as string) || ALL} onValueChange={(value) => set(key, (value === ALL ? "" : value) as never)}>
      <SelectTrigger aria-label={label} className={cn(filterTrigger, filters[key] && "border-purple/40 bg-purple/5 text-purple")}><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {values.map((value) => <SelectItem key={value} value={value}>{labels[value]}</SelectItem>)}
      </SelectContent>
    </Select>

  return (
    <article aria-label={title} className={cn(surface, "overflow-hidden")}>
      <div className="flex flex-col gap-3 border-b border-grey-200 p-4 dark:border-border sm:p-5">
        <div className="relative min-w-0">
          <label htmlFor={searchId} className="sr-only">Search people by name, username, email, phone or ID</label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-grey-400 dark:text-muted-foreground" />
          <Input
            id={searchId}
            type="search"
            value={filters.search}
            onChange={(event) => set("search", event.target.value)}
            placeholder="Search by name, username, email, phone or ID"
            autoComplete="off"
            maxLength={200}
            className="h-11 rounded-full border-grey-200 bg-grey-50 pl-10 pr-10 text-b3 focus-visible:border-grey-300 focus-visible:ring-0 dark:border-border dark:bg-background dark:focus-visible:border-border md:text-b2 [&::-webkit-search-cancel-button]:hidden"
          />
          {filters.search && <button type="button" aria-label="Clear search" onClick={() => set("search", "")} className="absolute right-0 top-0 flex h-11 w-10 cursor-pointer items-center justify-center text-grey-400 hover:text-grey-1000 dark:text-muted-foreground dark:hover:text-foreground">
            <X className="size-4" aria-hidden="true" />
          </button>}
        </div>
        <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 sm:flex sm:flex-wrap sm:items-center">
          {select<AccountRole>("role", "Filter by account role", accountRoles, accountRoleLabels, "All roles")}
          {!locked.includes("affiliation") && select<Affiliation>("affiliation", "Filter by campus affiliation", affiliations, affiliationLabels, "All affiliations")}
          {select<VerificationTier>("verificationTier", "Filter by verification", verificationTiers, verificationTierLabels, "All verification")}
          {select<BadgeKind>("badge", "Filter by badge", badgeKinds, badgeLabels, "All badges")}
          {select<AccountStatus>("status", "Filter by account status", accountStatuses, accountStatusLabels, "All statuses")}
          {showInstitution && institutions.data && <Select value={filters.institutionId || ALL} onValueChange={(value) => set("institutionId", value === ALL ? "" : value)}>
            <SelectTrigger aria-label="Filter by institution" className={cn(filterTrigger, filters.institutionId && "border-purple/40 bg-purple/5 text-purple")}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All institutions</SelectItem>
              {institutions.data.map((institution) => <SelectItem key={institution.id} value={institution.id}>{institution.shortName} · {institution.name}</SelectItem>)}
            </SelectContent>
          </Select>}
          {campuses && campuses.length > 0 && <Select value={filters.campusId || ALL} onValueChange={(value) => set("campusId", value === ALL ? "" : value)}>
            <SelectTrigger aria-label="Filter by campus" className={cn(filterTrigger, filters.campusId && "border-purple/40 bg-purple/5 text-purple")}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All campuses</SelectItem>
              {campuses.map((campus) => <SelectItem key={campus.id} value={campus.id}>{campus.name}</SelectItem>)}
            </SelectContent>
          </Select>}
          {activeCount > 0 && <Button type="button" variant="ghost" onClick={clear} className="h-11 cursor-pointer rounded-full px-4 text-b3 text-purple hover:bg-purple/10 hover:text-purple">
            <X className="size-4" aria-hidden="true" />Clear {activeCount} filter{activeCount === 1 ? "" : "s"}
          </Button>}
        </div>
      </div>

      {users.isPending && <RowsSkeleton label="Loading people" />}
      {users.isError && <ErrorState message={usersErrorMessage(users.error, "Could not load people.")} onRetry={() => void users.refetch()} retryLabel="Retry people" />}

      {users.data && <>
        {/* contain:paint keeps the wide table's scroll width from leaking into the page. */}
        <div className="max-w-full overflow-x-auto [contain:paint]" aria-busy={users.isFetching}>
          <table className="w-full min-w-[880px] text-left">
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr className={cn("border-b border-grey-200 bg-grey-50/60 text-b3 dark:border-border dark:bg-background/60 md:text-b2", muted)}>
                <th scope="col" className="py-4 pl-6 pr-3 font-semibold">Person</th>
                <th scope="col" className="px-3 py-4 font-semibold">Role</th>
                <th scope="col" className="px-3 py-4 font-semibold">Affiliation & verification</th>
                <th scope="col" className="px-3 py-4 font-semibold">Audience</th>
                <th scope="col" className="px-3 py-4 font-semibold">Status</th>
                <th scope="col" className="w-12 px-6 py-4"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className={users.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
              {users.data.items.map((user) => {
                const profile = user.userProfile
                const name = userDisplayName(user)
                const open = () => navigate(userProfilePath(user.id))
                const companies = user._count?.companyPublisher ?? 0
                return (
                  <tr key={user.id} className="cursor-pointer border-b border-grey-200 text-b3 transition-colors last:border-b-0 hover:bg-grey-50/60 dark:border-border dark:hover:bg-background/60 md:text-b2" onClick={open}>
                    <td className="py-4 pl-6 pr-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <UserAvatar name={name} image={profile?.image ?? null} />
                        <div className="min-w-0">
                          <span className="flex items-center gap-2">
                            <button type="button" onClick={(event) => { event.stopPropagation(); open() }} className={cn("block max-w-[220px] cursor-pointer truncate text-left font-semibold hover:text-purple focus-visible:text-purple focus-visible:outline-none", ink)}>
                              {name}
                            </button>
                            <EarnedBadges badges={{ ...activeBadges(profile) }} compact />
                          </span>
                          <p className={cn("flex max-w-[260px] items-center gap-1 truncate text-b4", muted)}>
                            {profile?.username && <span className="truncate">@{profile.username} ·</span>}
                            <span className="truncate">{profile?.email ?? "No profile"}</span>
                            {user.emailVerified && <MailCheck className="size-3.5 shrink-0 text-success-600 dark:text-success-400" aria-label="Email verified" />}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <RoleBadge role={user.role} />
                      {companies > 0 && <p className={cn("mt-1 text-b4", muted)}>{companies} compan{companies === 1 ? "y" : "ies"}</p>}
                    </td>
                    <td className="px-3 py-4">
                      {profile?.studentStatus || profile?.institution ? <div className="min-w-0">
                        <p className={cn("max-w-[200px] truncate font-medium", ink)}>{profile.studentStatus ? studentStatusLabels[profile.studentStatus] : "Status not set"}</p>
                        <p className={cn("max-w-[200px] truncate text-b4", muted)}>
                          {[profile.institution?.name, profile.campus?.name, profile.level && `Level ${profile.level}`].filter(Boolean).join(" · ") || "No institution"}
                        </p>
                      </div> : <span className={muted}>None</span>}
                      {profile && <div className="mt-1.5"><TierBadge tier={profile.verificationTier} /></div>}
                    </td>
                    <td className={cn("whitespace-nowrap px-3 py-4 tabular-nums", muted)}>
                      {user._count ? <>
                        <p><span className={cn("font-semibold", ink)}>{user._count.followers.toLocaleString()}</span> followers</p>
                        <p className="text-b4">{user._count.following.toLocaleString()} following</p>
                      </> : "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      <AccountStatusBadge status={accountStatusOf(user)} />
                      <p className={cn("mt-1.5 text-b4", muted)} title={formatRelative(user.createdAt) ?? undefined}>Joined {formatDate(user.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(event) => event.stopPropagation()}><UserRowMenu user={user} onView={open} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {users.data.items.length === 0 && (
            <EmptyState title={filtered ? "No people match these filters" : "No one here yet"} action={filtered ? <Button type="button" variant="outline" className="rounded-full" onClick={clear}>Clear filters</Button> : undefined}>
              {filtered ? "Try a different search or fewer filters." : "New sign-ups will appear here."}
            </EmptyState>
          )}
        </div>
        {users.data.total > 0 && <Pagination page={filters.page} limit={PAGE_SIZE} total={users.data.total} noun="people" onPageChange={(page) => set("page", page)} />}
      </>}
    </article>
  )
}
