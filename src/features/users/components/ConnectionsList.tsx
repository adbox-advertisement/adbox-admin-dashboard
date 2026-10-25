import { useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { UsersRound } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useUserConnections } from "../hooks"
import { usersErrorMessage } from "../lib/errors"
import { formatDate, formatRelative } from "../lib/format"
import { userProfilePath } from "../lib/paths"
import {
  accountStatusOf,
  connectionLabels,
  followStatusLabels,
  studentStatusLabels,
  userDisplayName,
  type ConnectionDirection,
  type FollowStatus,
  type Person,
  type UserRelationships,
} from "../types"
import { connectionDirections, followStatuses } from "../validation"
import { AccountStatusBadge, RoleBadge, UserAvatar, pill } from "./UserBadges"
import { EmptyState, ErrorState, RowsSkeleton, ink, muted } from "./Surface"

const PAGE_SIZE = 20

/** One person in someone else's list, linking to their own profile. */
export function PersonRow({ person, aside }: { person: Person; aside?: ReactNode }) {
  const name = userDisplayName(person)
  const profile = person.userProfile
  const status = accountStatusOf(person)
  return <div className="flex min-w-0 flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
    <UserAvatar name={name} image={profile?.image ?? null} />
    <div className="min-w-0 flex-1">
      <Link to={userProfilePath(person.id)} className={cn("block truncate text-b2 font-semibold hover:text-purple", ink)}>{name}</Link>
      <p className={cn("truncate text-b4", muted)}>
        {[profile?.username && `@${profile.username}`, profile?.studentStatus && studentStatusLabels[profile.studentStatus], profile?.institution?.shortName].filter(Boolean).join(" · ") || "No profile details"}
      </p>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <RoleBadge role={person.role} />
      {status !== "active" && <AccountStatusBadge status={status} />}
      {aside}
    </div>
  </div>
}

export function ConnectionsList({ userId, counts }: { userId: string; counts: UserRelationships["counts"] | undefined }) {
  const [direction, setDirection] = useState<ConnectionDirection>("followers")
  const [status, setStatus] = useState<FollowStatus | "">("ACTIVE")
  const [page, setPage] = useState(1)
  const isFollow = direction === "followers" || direction === "following"
  const connections = useUserConnections(userId, { direction, status: isFollow ? status || undefined : undefined, page, limit: PAGE_SIZE })
  const totals: Record<ConnectionDirection, number | undefined> = {
    followers: counts?.followers, following: counts?.following, blocking: counts?.blocking, blockedBy: counts?.blockedBy,
  }

  return <div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-grey-200 p-4 dark:border-border">
      <div role="radiogroup" aria-label="Which connections" className="flex flex-wrap gap-1 rounded-full bg-grey-50 p-1 dark:bg-background">
        {connectionDirections.map((value) => <button key={value} type="button" role="radio" aria-checked={direction === value}
          onClick={() => { setDirection(value); setPage(1) }}
          className={cn("cursor-pointer rounded-full px-3.5 py-2 text-b3 font-semibold transition-colors", direction === value ? "bg-white text-purple shadow-adbox-small dark:bg-card" : "text-grey-500 hover:text-grey-1000 dark:text-muted-foreground dark:hover:text-foreground")}>
          {connectionLabels[value]}{totals[value] !== undefined && <span className="ml-1.5 tabular-nums opacity-70">{totals[value]?.toLocaleString()}</span>}
        </button>)}
      </div>
      {isFollow && <Select value={status || "all"} onValueChange={(value) => { setStatus(value === "all" ? "" : value as FollowStatus); setPage(1) }}>
        <SelectTrigger aria-label="Filter by follow status" className="h-10 w-full cursor-pointer rounded-full sm:w-[170px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Every status</SelectItem>
          {followStatuses.map((value) => <SelectItem key={value} value={value}>{followStatusLabels[value]}</SelectItem>)}
        </SelectContent>
      </Select>}
    </div>
    {connections.isPending && <RowsSkeleton rows={4} label="Loading connections" />}
    {connections.isError && <ErrorState message={usersErrorMessage(connections.error, "Could not load connections.")} onRetry={() => void connections.refetch()} />}
    {connections.data && <>
      <ul className={cn("divide-y divide-grey-100 dark:divide-border", connections.isPlaceholderData && "opacity-60")} aria-busy={connections.isFetching}>
        {connections.data.items.map((item) => <li key={item.user.id}>
          <PersonRow person={item.user} aside={<span className={cn("text-b4", muted)} title={formatDate(item.since, "MMM d, yyyy 'at' h:mm a") ?? undefined}>
            {item.status && item.status !== "ACTIVE" && <span className={cn(pill, "mr-2 bg-warning-500/10 text-warning-700 dark:text-warning-300")}>{followStatusLabels[item.status]}</span>}
            {formatRelative(item.since)}
          </span>} />
        </li>)}
      </ul>
      {connections.data.items.length === 0 && <EmptyState icon={UsersRound} title={`No ${connectionLabels[direction].toLowerCase()}`}>
        {direction === "blocking" ? "They haven't blocked anyone." : direction === "blockedBy" ? "Nobody has blocked them." : "Try another follow status."}
      </EmptyState>}
      {connections.data.total > 0 && <Pagination page={page} limit={PAGE_SIZE} total={connections.data.total} noun="people" onPageChange={setPage} />}
    </>}
  </div>
}
