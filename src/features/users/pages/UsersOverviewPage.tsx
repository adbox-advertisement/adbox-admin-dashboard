import { Link } from "react-router-dom"
import { Award, BadgeCheck, Building2, Eye, Flag, GraduationCap, Megaphone, School, ShieldCheck, Sparkles, Store, UserPlus, UserX, UsersRound, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { APP_ROUTES } from "@/routes/paths"
import { useBusinessRequestCounts, useHonourNominees, usePageRequestCounts, usePendingCounts, useUserAccess, useUserStats } from "../hooks"
import { usersErrorMessage } from "../lib/errors"
import { formatRelative, percentOf } from "../lib/format"
import { institutionPath, peoplePath } from "../lib/paths"
import {
  USER_PERMISSIONS,
  accountRoleDescriptions,
  accountRoleLabels,
  accountStatusDescriptions,
  accountStatusLabels,
  affiliationDescriptions,
  affiliationLabels,
  badgeDescriptions,
  badgeLabels,
  type AccountRole,
  type AccountStatus,
  type Affiliation,
  type BadgeKind,
  type UserStats,
} from "../types"
import { BarList, ErrorState, MoreLink, NoAccess, Panel, StatCard, ink, muted, surface } from "../components/Surface"
import { UserAvatar } from "../components/UserBadges"

const statusKeys: Record<AccountStatus, keyof UserStats["status"]> = {
  active: "active", suspended: "suspended", deactivated: "deactivated", pending_deletion: "pendingDeletion", erased: "erased",
}

export function UsersOverviewPage() {
  const can = useUserAccess()
  const allowed = can(USER_PERMISSIONS.read)
  const stats = useUserStats(undefined, allowed)
  const queues = useReviewQueues()

  if (!allowed) return <NoAccess permission={USER_PERMISSIONS.read} what="platform users" />
  if (stats.isError) return <div className="px-4 sm:px-6"><div className={surface}><ErrorState message={usersErrorMessage(stats.error, "Could not load the user overview.")} onRetry={() => void stats.refetch()} /></div></div>

  const data = stats.data
  const total = data?.total ?? 0
  const roles: AccountRole[] = data && data.roles.GUEST > 0 ? ["VIEWER", "CREATOR", "PUBLISHER", "GUEST"] : ["VIEWER", "CREATOR", "PUBLISHER"]

  return <div className="flex min-w-0 flex-col gap-5 px-4 sm:px-6">
    {queues.length > 0 && <Panel title="Waiting for review" description="Each queue opens oldest first. The sidebar shows the same counts.">
      <ReviewQueues queues={queues} />
    </Panel>}

    <section aria-label="Headline figures" className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      <StatCard icon={UsersRound} tone="purple" label="People on AdBox" value={data?.total} hint={data ? `${data.status.active.toLocaleString()} active` : undefined} to={APP_ROUTES.manageUsersPeople} />
      <StatCard icon={UserPlus} tone="success" label="Joined in 30 days" value={data?.newLast30Days} hint={data ? `${data.newLast7Days.toLocaleString()} this week` : undefined} />
      <StatCard icon={BadgeCheck} tone="blue" label="Verified campus members" value={data?.badges.campus} hint={data ? `${percentOf(data.badges.campus, total)} of people` : undefined} to={peoplePath({ badge: "campus" })} />
      <StatCard icon={UserX} tone="danger" label="Suspended by AdBox" value={data?.status.suspended} hint={data ? `${percentOf(data.status.suspended, total)} of people` : undefined} to={peoplePath({ status: "suspended" })} />
    </section>

    {!data ? <OverviewSkeleton /> : <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Panel className="lg:col-span-6" title="Account roles" description="What each account does on AdBox. Select a role to see those people.">
          <BarList label="People by account role" total={total} rows={roles.map((role) => ({
            key: role, label: accountRoleLabels[role], description: accountRoleDescriptions[role], value: data.roles[role], to: peoplePath({ role }),
          }))} />
        </Panel>
        <Panel className="lg:col-span-6" title="Campus affiliation" description="How people relate to their institution, as set on their profile.">
          <BarList label="People by campus affiliation" total={total} rows={(Object.keys(affiliationLabels) as Affiliation[]).map((affiliation) => ({
            key: affiliation, label: affiliationLabels[affiliation], description: affiliationDescriptions[affiliation], value: data.affiliation[affiliation], to: peoplePath({ affiliation }),
          }))} />
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Panel className="lg:col-span-4" title="How accounts connect" description="The relationships behind every profile.">
          <RelationshipMap stats={data} />
        </Panel>
        <Panel className="lg:col-span-4" title="Verification" description="A campus badge appears only once a claim is verified.">
          <BarList label="Profiles by verification" total={data.verification.SELF_DECLARED + data.verification.PENDING + data.verification.VERIFIED} rows={[
            { key: "VERIFIED", label: "Verified", description: "School email or reviewed student ID", value: data.verification.VERIFIED, to: peoplePath({ verificationTier: "VERIFIED" }) },
            { key: "PENDING", label: "Pending review", description: "Evidence submitted", value: data.verification.PENDING, to: peoplePath({ verificationTier: "PENDING" }) },
            { key: "SELF_DECLARED", label: "Self-declared", description: "Not evidenced; excluded from campus ads", value: data.verification.SELF_DECLARED, to: peoplePath({ verificationTier: "SELF_DECLARED" }) },
          ]} />
        </Panel>
        <Panel className="lg:col-span-4" title="Badges held now" description="Shown beside a person's name across the app.">
          <BarList label="People by badge" total={total} rows={(Object.keys(badgeLabels) as BadgeKind[]).map((badge) => ({
            key: badge, label: badgeLabels[badge], description: badgeDescriptions[badge], value: data.badges[badge], to: peoplePath({ badge }),
          }))} />
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Panel className="lg:col-span-5" title="Account status" description="Suspensions are AdBox's; the rest are the owner's own choices.">
          <BarList label="People by account status" total={total} rows={(Object.keys(statusKeys) as AccountStatus[]).map((status) => ({
            key: status, label: accountStatusLabels[status], description: accountStatusDescriptions[status], value: data.status[statusKeys[status]], to: peoplePath({ status }),
          }))} />
        </Panel>
        <Panel className="lg:col-span-7" title="Largest institutions" description={`Members by affiliation · updated ${formatRelative(data.generatedAt) ?? "just now"}`} action={<MoreLink to={APP_ROUTES.manageUsersInstitutions}>All institutions</MoreLink>} bodyClassName="p-0">
          <TopInstitutions institutions={data.institutions.filter((institution) => institution.members.total > 0).slice(0, 6)} />
        </Panel>
      </div>
    </>}
  </div>
}

type Queue = { key: string; icon: LucideIcon; label: string; description: string; to: string; count: number | undefined; noun?: [string, string] }

/** The review queues this admin can open, with what is waiting in each. */
function useReviewQueues(): Queue[] {
  const can = useUserAccess()
  const verification = can(USER_PERMISSIONS.verificationRead)
  const companies = can(USER_PERMISSIONS.companiesRead)
  const pages = can(USER_PERMISSIONS.pageRequestsRead)
  const honours = can(USER_PERMISSIONS.honoursReview)
  const pending = usePendingCounts({ verification, companies })
  const businessRequests = useBusinessRequestCounts(companies).data?.open
  const pageRequests = usePageRequestCounts(pages).data?.open
  const year = new Date().getUTCFullYear()
  const nominees = useHonourNominees({ year, page: 1, limit: 1 }, honours).data?.total
  const queues: Array<Queue | false> = [
    verification && { key: "verification", icon: ShieldCheck, label: "Verification", description: "Student and staff IDs to check", to: APP_ROUTES.manageUsersVerification, count: pending.verification },
    companies && { key: "companies", icon: Building2, label: "Companies to approve", description: "Advertisers waiting for the company seal", to: `${APP_ROUTES.manageUsersCompanies}?status=PENDING_VERIFICATION`, count: pending.companies },
    companies && { key: "business", icon: Store, label: "Business requests", description: "Business accounts people asked for", to: APP_ROUTES.manageUsersBusinessRequests, count: businessRequests },
    pages && { key: "pages", icon: Flag, label: "Page requests", description: "Official pages for campus groups", to: APP_ROUTES.manageUsersPageRequests, count: pageRequests },
    honours && { key: "honours", icon: Award, label: "Honours", description: `Gye Nyame nominees in ${year}`, to: APP_ROUTES.manageUsersHonours, count: nominees, noun: ["nominee", "nominees"] },
  ]
  return queues.filter((queue): queue is Queue => queue !== false)
}

function ReviewQueues({ queues }: { queues: Queue[] }) {
  return <ul aria-label="Review queues" className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
    {queues.map(({ key, icon: Icon, label, description, to, count, noun }) => {
      // Nominees are people put forward, not work left over, so they never read as waiting.
      const waiting = !noun && Boolean(count)
      const unit = noun ? (count === 1 ? noun[0] : noun[1]) : "waiting"
      return <li key={key}>
        <Link to={to} aria-label={count === undefined ? label : `${label}: ${count.toLocaleString()} ${unit}`}
          className="group flex h-full items-center gap-3 rounded-2xl border border-grey-200 px-4 py-3 transition-colors hover:border-purple/40 hover:bg-grey-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple dark:border-border dark:hover:bg-background">
          <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", waiting ? "bg-warning-500/10 text-warning-700 dark:text-warning-300" : "bg-purple/10 text-purple")}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className={cn("block text-b2 font-semibold leading-5 group-hover:text-purple", ink)}>{label}</span>
            <span className={cn("mt-0.5 line-clamp-2 block text-b4", muted)}>{description}</span>
          </span>
          <span className="shrink-0 text-right">
            {count === undefined
              ? <span className="block h-6 w-8 animate-pulse rounded bg-grey-100 dark:bg-muted" />
              : <span className={cn("block text-h5 font-semibold leading-6 tabular-nums", waiting ? "text-warning-700 dark:text-warning-300" : ink)}>{count.toLocaleString()}</span>}
            <span className={cn("block text-b4", muted)}>{unit}</span>
          </span>
        </Link>
      </li>
    })}
  </ul>
}

function RelationshipMap({ stats }: { stats: UserStats }) {
  const items = [
    { icon: Eye, title: "Viewers follow", body: "people and institutions, and can block or mute anyone.", to: peoplePath({ role: "VIEWER" }), figure: stats.roles.VIEWER },
    { icon: Sparkles, title: "Creators earn", body: "from their posts once they meet the earning rules.", to: peoplePath({ role: "CREATOR" }), figure: stats.roles.CREATOR },
    { icon: Megaphone, title: "Publishers advertise", body: "for one or more companies; an approved company gives them its seal.", to: APP_ROUTES.manageUsersCompanies, figure: stats.roles.PUBLISHER },
    { icon: GraduationCap, title: "Profiles belong", body: "to an institution, campus and hall as a student, alumnus or staff member.", to: APP_ROUTES.manageUsersInstitutions, figure: stats.affiliation.STUDENT + stats.affiliation.ALUMNI + stats.affiliation.STAFF },
  ]
  return <ul className="flex flex-col gap-1">
    {items.map(({ icon: Icon, title, body, to, figure }) => <li key={title}>
      <Link to={to} className="flex gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-grey-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple dark:hover:bg-background">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-purple/10 text-purple"><Icon className="size-4" aria-hidden="true" /></span>
        <span className="min-w-0 text-sm leading-5">
          <span className={cn("font-semibold", ink)}>{title}</span> <span className={muted}>{body}</span>
          <span className={cn("mt-0.5 block text-b3 leading-4 tabular-nums", muted)}>{figure.toLocaleString()} people</span>
        </span>
      </Link>
    </li>)}
  </ul>
}

function TopInstitutions({ institutions }: { institutions: UserStats["institutions"] }) {
  if (institutions.length === 0) return <p className={cn("p-5 text-b3", muted)}>Nobody has joined an institution yet.</p>
  return <div className="max-w-full overflow-x-auto [contain:paint]">
    <table className="w-full min-w-[560px] text-left text-b3">
      <caption className="sr-only">Largest institutions by members</caption>
      <thead>
        <tr className={cn("border-b border-grey-200 dark:border-border", muted)}>
          <th scope="col" className="px-5 py-3 font-semibold">Institution</th>
          <th scope="col" className="px-3 py-3 text-right font-semibold">Members</th>
          <th scope="col" className="px-3 py-3 text-right font-semibold">Students</th>
          <th scope="col" className="px-3 py-3 text-right font-semibold">Alumni</th>
          <th scope="col" className="px-3 py-3 text-right font-semibold">Staff</th>
          <th scope="col" className="px-5 py-3 text-right font-semibold">Verified</th>
        </tr>
      </thead>
      <tbody className="tabular-nums">
        {institutions.map((institution) => <tr key={institution.id} className="border-b border-grey-100 last:border-b-0 dark:border-border">
          <th scope="row" className="px-5 py-3 font-normal">
            <Link to={institutionPath(institution.id)} className="flex min-w-0 items-center gap-2.5 hover:text-purple">
              {institution.logoUrl ? <UserAvatar name={institution.shortName} image={institution.logoUrl} size="sm" square /> : <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-blue/10 text-blue dark:text-cyan"><School className="size-4" aria-hidden="true" /></span>}
              <span className="min-w-0">
                <span className={cn("block truncate font-semibold", ink)}>{institution.shortName}</span>
                <span className={cn("block max-w-[220px] truncate text-b4", muted)}>{institution.name}</span>
              </span>
            </Link>
          </th>
          <td className={cn("px-3 py-3 text-right font-semibold", ink)}>{institution.members.total.toLocaleString()}</td>
          <td className="px-3 py-3 text-right">{institution.members.STUDENT.toLocaleString()}</td>
          <td className="px-3 py-3 text-right">{institution.members.ALUMNI.toLocaleString()}</td>
          <td className="px-3 py-3 text-right">{institution.members.STAFF.toLocaleString()}</td>
          <td className="px-5 py-3 text-right">{percentOf(institution.members.verified, institution.members.total)}</td>
        </tr>)}
      </tbody>
    </table>
  </div>
}

function OverviewSkeleton() {
  return <div role="status" aria-label="Loading overview" className="grid grid-cols-1 gap-4 lg:grid-cols-12">
    {[6, 6, 4, 4, 4].map((span, index) => <div key={index} className={cn(surface, "h-64 animate-pulse", span === 6 ? "lg:col-span-6" : "lg:col-span-4")} />)}
  </div>
}
