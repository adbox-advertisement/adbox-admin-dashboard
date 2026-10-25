import { useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import {
  AlertTriangle, Award, BadgeCheck, Building2, CalendarDays, Coins, Fingerprint, GraduationCap, KeyRound, LibraryBig, Mail, Medal, Pencil,
  Phone, School, ShieldCheck, Smartphone, Sparkles, Trash2, UserCheck, UserRound, UsersRound, UserX,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { APP_ROUTES } from "@/routes/paths"
import { usePlatformUser, useUserAccess, useUserRelationships } from "../hooks"
import { usersErrorMessage } from "../lib/errors"
import { ageFrom, formatDate, formatRelative } from "../lib/format"
import { companyPath, institutionPath } from "../lib/paths"
import {
  USER_PERMISSIONS,
  accountRoleDescriptions,
  accountRoleLabels,
  accountStatusOf,
  activeBadges,
  badgeLabels,
  genderLabels,
  identityProviderLabels,
  studentStatusLabels,
  userDisplayName,
  verificationTierLabels,
  type PlatformUser,
  type UserRelationships,
} from "../types"
import { AccountStatusBadge, AffiliationBadge, CompanyStatusBadge, EarnedBadges, RoleBadge, TierBadge, UserAvatar, pill } from "../components/UserBadges"
import { badgeIcons } from "../lib/badge-icons"
import { BackLink, EmptyState, ErrorState, NoAccess, ink, muted, surface } from "../components/Surface"
import { Callout, CopyButton, MiniStat, Row, Rows, Section, Verified } from "../components/ProfileParts"
import { ConnectionsList } from "../components/ConnectionsList"
import { UserEditDialog } from "../components/UserEditDialog"
import { UserStatusDialog } from "../components/UserStatusDialog"
import { BadgesDialog } from "../components/BadgesDialog"

const tabs = ["profile", "connections", "publishing", "badges", "account"] as const
type Tab = typeof tabs[number]
const tabTrigger = "cursor-pointer rounded-lg border-0 px-3.5 py-2.5 text-b3 text-grey-500 dark:text-muted-foreground data-[state=active]:bg-purple/10 data-[state=active]:text-purple md:text-b2"
const dateTime = "MMM d, yyyy 'at' h:mm a"

export function UserProfilePage() {
  const { userId = "" } = useParams()
  const can = useUserAccess()
  const allowed = can(USER_PERMISSIONS.read)
  const user = usePlatformUser(userId, allowed)
  const relationships = useUserRelationships(userId, allowed)

  if (!allowed) return <NoAccess permission={USER_PERMISSIONS.read} what="platform users" />

  return <div className="flex min-w-0 flex-col gap-4 px-4 sm:px-6">
    <BackLink to={APP_ROUTES.manageUsersPeople}>All people</BackLink>
    {user.isError && <div className={surface}><ErrorState message={usersErrorMessage(user.error, "Could not load this person.")} onRetry={() => void user.refetch()} /></div>}
    {user.isPending && <div role="status" aria-label="Loading person" className="flex flex-col gap-4">
      <div className={cn(surface, "h-56 animate-pulse")} />
      <div className={cn(surface, "h-80 animate-pulse")} />
    </div>}
    {user.data && <Profile user={user.data} relationships={relationships.data} relationshipsError={relationships.isError ? relationships.error : null} onRetryRelationships={() => void relationships.refetch()} />}
  </div>
}

function Profile({ user, relationships, relationshipsError, onRetryRelationships }: {
  user: PlatformUser
  relationships: UserRelationships | undefined
  relationshipsError: unknown
  onRetryRelationships: () => void
}) {
  const can = useUserAccess()
  const [params, setParams] = useSearchParams()
  const [action, setAction] = useState<"edit" | "status" | "badges" | null>(null)
  const requested = params.get("tab")
  const tab: Tab = tabs.includes(requested as Tab) ? requested as Tab : "profile"
  const profile = user.userProfile
  const name = userDisplayName(user)
  const status = accountStatusOf(user)
  const companySeal = relationships?.companies.some((company) => company.status === "ACTIVE" && company.verifiedAt) ?? false
  const badges = { ...activeBadges(profile), company: companySeal }
  const canToggle = can(USER_PERMISSIONS.suspend) && (status === "active" || status === "suspended")

  const relationshipsBlock = (render: (data: UserRelationships) => React.ReactNode) =>
    relationships ? render(relationships)
      : relationshipsError ? <div className={surface}><ErrorState message={usersErrorMessage(relationshipsError, "Could not load this person's connections.")} onRetry={onRetryRelationships} /></div>
        : <div role="status" aria-label="Loading" className={cn(surface, "h-48 animate-pulse")} />

  return <>
    <header className={cn(surface, "overflow-hidden")}>
      <div className="h-20 bg-[image:var(--gradient-primary)] sm:h-24" aria-hidden="true" />
      <div className="flex flex-col gap-4 px-4 pb-5 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start">
          {/* Only the avatar overlaps the banner; the name stays on the card surface. */}
          <span className="-mt-10 inline-flex w-fit shrink-0 rounded-full bg-card p-1"><UserAvatar name={name} image={profile?.image ?? null} size="xl" /></span>
          <div className="min-w-0 sm:pt-3">
            <h1 className={cn("truncate font-heading text-h5 font-semibold", ink)}>{name}</h1>
            <p className={cn("truncate text-b3", muted)}>{[profile?.username && `@${profile.username}`, profile?.email].filter(Boolean).join(" · ") || "No profile created"}</p>
            <p className={cn("mt-0.5 text-b4", muted)}>Joined {formatDate(user.createdAt)} · {formatRelative(user.createdAt)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 lg:pt-3">
          {can(USER_PERMISSIONS.contentRead) && <Button asChild size="sm" variant="outline" className="h-9 rounded-full px-4">
            <Link to={`${APP_ROUTES.userContent}?userId=${encodeURIComponent(user.id)}`}><LibraryBig className="size-4" aria-hidden="true" />View uploads</Link>
          </Button>}
          {can(USER_PERMISSIONS.update) && profile && <Button type="button" size="sm" variant="outline" onClick={() => setAction("edit")} className="h-9 cursor-pointer rounded-full px-4">
            <Pencil className="size-4" aria-hidden="true" />Edit profile
          </Button>}
          {can(USER_PERMISSIONS.badges) && profile && <Button type="button" size="sm" variant="outline" onClick={() => setAction("badges")} className="h-9 cursor-pointer rounded-full px-4">
            <Medal className="size-4" aria-hidden="true" />Badges
          </Button>}
          {canToggle && <Button type="button" size="sm" variant={user.isActive ? "destructive" : "default"} onClick={() => setAction("status")} className="h-9 cursor-pointer rounded-full px-4">
            {user.isActive ? <UserX className="size-4" aria-hidden="true" /> : <UserCheck className="size-4" aria-hidden="true" />}{user.isActive ? "Suspend" : "Reactivate"}
          </Button>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-grey-200 px-4 py-3 dark:border-border sm:px-6">
        <AccountStatusBadge status={status} />
        <RoleBadge role={user.role} />
        {profile && <AffiliationBadge status={profile.studentStatus} />}
        {profile && <TierBadge tier={profile.verificationTier} />}
        <EarnedBadges badges={badges} compact={false} />
      </div>
    </header>

    <StatusCallouts user={user} />

    <section aria-label="At a glance" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      <MiniStat label="Followers" value={relationships?.counts.followers} />
      <MiniStat label="Following" value={relationships?.counts.following} />
      <MiniStat label="Posts" value={relationships?.counts.posts} />
      <MiniStat label="Comments" value={relationships?.counts.comments} />
      <MiniStat label="Companies" value={relationships?.companies.length} />
      <MiniStat label="Gold balance" value={relationships ? relationships.goldBalance === null ? "No wallet" : `${relationships.goldBalance.toLocaleString()} bars` : undefined} />
    </section>

    <Tabs value={tab} onValueChange={(value) => setParams((current) => { const next = new URLSearchParams(current); next.set("tab", value); return next }, { replace: true })}>
      <TabsList className="mb-4 w-fit max-w-full gap-1 overflow-x-auto rounded-xl border-0 bg-white p-1 shadow-adbox-small dark:bg-card">
        <TabsTrigger value="profile" className={tabTrigger}><UserRound className="size-4" aria-hidden="true" />Profile</TabsTrigger>
        <TabsTrigger value="connections" className={tabTrigger}><UsersRound className="size-4" aria-hidden="true" />Connections</TabsTrigger>
        <TabsTrigger value="publishing" className={tabTrigger}><Building2 className="size-4" aria-hidden="true" />Publishing</TabsTrigger>
        <TabsTrigger value="badges" className={tabTrigger}><Award className="size-4" aria-hidden="true" />Badges & honours</TabsTrigger>
        <TabsTrigger value="account" className={tabTrigger}><KeyRound className="size-4" aria-hidden="true" />Account & sign-in</TabsTrigger>
      </TabsList>

      <TabsContent value="profile"><ProfileTab user={user} /></TabsContent>
      <TabsContent value="connections">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Section className="overflow-hidden lg:col-span-8" icon={<UsersRound className="size-4" aria-hidden="true" />} title="People">
            <ConnectionsList userId={user.id} counts={relationships?.counts} />
          </Section>
          <div className="flex flex-col gap-4 lg:col-span-4">
            {relationshipsBlock((data) => <>
              <Section icon={<UsersRound className="size-4" aria-hidden="true" />} title="Follow requests">
                <Rows>
                  <Row label="Waiting on them" value={data.counts.requestsReceived.toLocaleString()} />
                  <Row label="Sent by them" value={data.counts.requestsSent.toLocaleString()} />
                </Rows>
              </Section>
              <Section icon={<School className="size-4" aria-hidden="true" />} title={`Institutions followed (${data.counts.institutionsFollowed})`}>
                {data.institutionsFollowed.length === 0 ? <p className={cn("px-4 py-3 text-b3", muted)}>None yet.</p> : <ul className="divide-y divide-grey-100 dark:divide-border">
                  {data.institutionsFollowed.map((institution) => <li key={institution.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-b3">
                    <Link to={institutionPath(institution.id)} className={cn("min-w-0 truncate font-semibold hover:text-purple", ink)} title={institution.name}>{institution.shortName}</Link>
                    <span className={cn("shrink-0 text-b4", muted)}>{formatRelative(institution.followedAt)}</span>
                  </li>)}
                </ul>}
              </Section>
            </>)}
          </div>
        </div>
      </TabsContent>
      <TabsContent value="publishing">{relationshipsBlock((data) => <PublishingTab user={user} relationships={data} />)}</TabsContent>
      <TabsContent value="badges">{relationshipsBlock((data) => <BadgesTab user={user} relationships={data} badges={badges} onManage={can(USER_PERMISSIONS.badges) && profile ? () => setAction("badges") : undefined} />)}</TabsContent>
      <TabsContent value="account"><AccountTab user={user} relationships={relationships} /></TabsContent>
    </Tabs>

    {action === "edit" && <UserEditDialog user={user} onClose={() => setAction(null)} />}
    {action === "status" && <UserStatusDialog user={user} onClose={() => setAction(null)} />}
    {action === "badges" && <BadgesDialog user={user} onClose={() => setAction(null)} />}
  </>
}

function StatusCallouts({ user }: { user: PlatformUser }) {
  const can = useUserAccess()
  const status = accountStatusOf(user)
  const profile = user.userProfile
  return <>
    {status === "suspended" && <Callout tone="danger" icon={<UserX className="size-4" aria-hidden="true" />}>This account is suspended. They are signed out everywhere and can't sign in until reactivated.</Callout>}
    {status === "deactivated" && <Callout tone="neutral" icon={<UserX className="size-4" aria-hidden="true" />}>They switched their account off{user.deactivatedAt ? ` ${formatRelative(user.deactivatedAt)}` : ""}. It comes back when they sign in again.</Callout>}
    {status === "pending_deletion" && <Callout tone="warning" icon={<Trash2 className="size-4" aria-hidden="true" />}>They asked for their account to be deleted. It will be erased {user.deletionScheduledFor ? `on ${formatDate(user.deletionScheduledFor)}` : "after the grace period"} unless they sign in first.</Callout>}
    {status === "erased" && <Callout tone="neutral" icon={<Trash2 className="size-4" aria-hidden="true" />}>This account was erased{user.erasedAt ? ` on ${formatDate(user.erasedAt)}` : ""}. Personal data is gone; the empty account keeps payment and conversation history intact.</Callout>}
    {!profile && status !== "erased" && <Callout tone="warning" icon={<AlertTriangle className="size-4" aria-hidden="true" />}>They created an account but haven't completed a profile, so contact and education details are unavailable.</Callout>}
    {profile?.verificationTier === "PENDING" && can(USER_PERMISSIONS.verificationRead) && <Callout tone="warning" icon={<ShieldCheck className="size-4" aria-hidden="true" />}>
      They're waiting for institution verification. <Link to={APP_ROUTES.manageUsersVerification} className="font-semibold underline underline-offset-2">Review requests</Link>
    </Callout>}
  </>
}

function ProfileTab({ user }: { user: PlatformUser }) {
  const profile = user.userProfile
  const age = ageFrom(profile?.dob ?? null)
  return <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
    <Section className="lg:col-span-7" icon={<GraduationCap className="size-4" aria-hidden="true" />} title="Institution affiliation">
      <Rows>
        <Row label="Institution" value={profile?.institution ? <Link to={institutionPath(profile.institution.id)} className="font-semibold hover:text-purple">{profile.institution.name}</Link> : null} />
        <Row label="Campus" value={profile?.campus ? `${profile.campus.name} · ${profile.campus.city}` : null} />
        <Row label="Hall" value={profile?.hall?.name} />
        <Row label="Affiliation" value={profile?.studentStatus ? studentStatusLabels[profile.studentStatus] : null} />
        <Row label="Level" value={profile?.level ? `Level ${profile.level}` : null} />
        <Row label="Programme" value={profile?.programme} />
        <Row label="Graduation year" value={profile?.graduationYear?.toString()} />
        <Row label="Verification" value={profile ? `${verificationTierLabels[profile.verificationTier]}${profile.verifiedAt ? ` · ${formatDate(profile.verifiedAt)}` : ""}` : null}
          icon={profile?.verificationTier === "VERIFIED" ? <BadgeCheck className="size-3.5 text-blue dark:text-cyan" aria-hidden="true" /> : undefined} />
      </Rows>
    </Section>
    <div className="flex flex-col gap-4 lg:col-span-5">
      <Section icon={<Mail className="size-4" aria-hidden="true" />} title="Contact">
        <Rows>
          <Row label="Email" value={profile?.email} trailing={profile ? <Verified ok={user.emailVerified} label={user.emailVerified ? "Verified" : "Unverified"} /> : null} />
          <Row label="Phone" value={profile?.contact} icon={<Phone className="size-3.5" aria-hidden="true" />} trailing={profile?.contact ? <Verified ok={user.isContactVerified} label={user.isContactVerified ? "Verified" : "Unverified"} /> : null} />
        </Rows>
      </Section>
      <Section icon={<UserRound className="size-4" aria-hidden="true" />} title="Personal">
        <Rows>
          <Row label="Full name" value={profile?.fullName} />
          <Row label="Gender" value={profile?.gender ? genderLabels[profile.gender] : null} />
          <Row label="Date of birth" value={profile?.dob ? `${formatDate(profile.dob)}${age !== null ? ` · ${age} years` : ""}` : null} />
          <Row label="Bio" value={profile?.bio} multiline />
        </Rows>
      </Section>
    </div>
  </div>
}

function PublishingTab({ user, relationships }: { user: PlatformUser; relationships: UserRelationships }) {
  const can = useUserAccess()
  const canOpen = can(USER_PERMISSIONS.companiesRead)
  if (relationships.companies.length === 0) return <div className={surface}>
    <EmptyState icon={Building2} title="Not publishing for any company">
      {user.role === "PUBLISHER" ? "They signed up as a publisher but haven't created or joined a company yet." : `${user.role ? accountRoleLabels[user.role] : "This account"}: ${user.role ? accountRoleDescriptions[user.role].toLowerCase() : "no company links"}. Publishers advertise through companies.`}
    </EmptyState>
  </div>
  return <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
    {relationships.companies.map((company) => <li key={company.id} className={cn(surface, "flex flex-col gap-3 p-5")}>
      <div className="flex items-start gap-3">
        <UserAvatar name={company.name} image={company.logo} size="lg" square />
        <div className="min-w-0 flex-1">
          {canOpen ? <Link to={companyPath(company.id)} className={cn("block truncate text-b1 font-semibold hover:text-purple", ink)}>{company.name}</Link> : <p className={cn("truncate text-b1 font-semibold", ink)}>{company.name}</p>}
          <p className={cn("truncate text-b4", muted)}>{company.email ?? "No email"}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <CompanyStatusBadge status={company.status} />
            {company.isOwner && <span className={cn(pill, "bg-purple/10 text-purple")}>Owner</span>}
          </div>
        </div>
      </div>
      <dl className="grid grid-cols-3 gap-2 text-center">
        {[["Publishers", company.publisherCount], ["Campaigns", company.campaignCount], ["Joined", formatDate(company.joinedAt, "MMM yyyy")]].map(([label, value]) =>
          <div key={label} className="rounded-xl bg-grey-50 px-2 py-2 dark:bg-background">
            <dt className={cn("text-b4", muted)}>{label}</dt>
            <dd className={cn("text-b2 font-semibold tabular-nums", ink)}>{typeof value === "number" ? value.toLocaleString() : value}</dd>
          </div>)}
      </dl>
    </li>)}
  </ul>
}

function BadgesTab({ user, relationships, badges, onManage }: {
  user: PlatformUser
  relationships: UserRelationships
  badges: ReturnType<typeof activeBadges> & { company: boolean }
  onManage?: () => void
}) {
  const can = useUserAccess()
  const profile = user.userProfile
  const details: Record<keyof typeof badges, string> = {
    campus: badges.campus && profile?.studentStatus ? `${studentStatusLabels[profile.studentStatus]}${profile.institution ? ` at ${profile.institution.name}` : ""}` : profile?.studentStatus ? `${studentStatusLabels[profile.studentStatus]}, not verified yet` : "No affiliation on their profile",
    company: badges.company ? "Publishes for an approved company" : relationships.companies.length ? "No approved company yet" : "Not a publisher",
    honour: badges.honour ? `Since ${formatDate(profile?.honourSince ?? null)}${profile?.honourRenewsAt ? `, renews ${formatDate(profile.honourRenewsAt)}` : ""}` : `${relationships.honour.nominationsThisYear} nomination${relationships.honour.nominationsThisYear === 1 ? "" : "s"} in ${relationships.honour.year}`,
    spotlight: badges.spotlight ? `On until ${formatDate(profile?.spotlightUntil ?? null, dateTime)}` : `${relationships.spotlightPurchases} purchase${relationships.spotlightPurchases === 1 ? "" : "s"} so far`,
  }
  return <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
    <Section className="lg:col-span-7" icon={<Medal className="size-4" aria-hidden="true" />} title="Badges"
      action={onManage && <Button type="button" size="sm" variant="outline" onClick={onManage} className="h-8 cursor-pointer rounded-full px-3 text-b3">Manage</Button>}>
      <ul className="divide-y divide-grey-100 dark:divide-border">
        {(Object.keys(details) as Array<keyof typeof badges>).map((kind) => {
          const Icon = badgeIcons[kind]
          return <li key={kind} className="flex items-center gap-3 px-4 py-3">
            <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", badges[kind] ? "bg-blue/10 text-blue dark:text-cyan" : "bg-grey-100 text-grey-400 dark:bg-muted")}><Icon className="size-4" aria-hidden="true" /></span>
            <div className="min-w-0 flex-1">
              <p className={cn("text-b2 font-semibold", ink)}>{badgeLabels[kind]}</p>
              <p className={cn("truncate text-b4", muted)}>{details[kind]}</p>
            </div>
            <span className={cn(pill, badges[kind] ? "bg-success-500/10 text-success-700 dark:text-success-300" : "bg-grey-100 text-grey-600 dark:bg-muted dark:text-muted-foreground")}>{badges[kind] ? "Held" : "Not held"}</span>
          </li>
        })}
      </ul>
    </Section>
    <Section className="lg:col-span-5" icon={<Award className="size-4" aria-hidden="true" />} title="Gye Nyame history"
      action={can(USER_PERMISSIONS.honoursReview) && <Link to={APP_ROUTES.manageUsersHonours} className="text-b3 font-semibold text-blue hover:underline dark:text-cyan">Review</Link>}>
      {relationships.honour.decisions.length === 0 ? <p className={cn("px-4 py-3 text-b3", muted)}>No decisions yet.</p> : <ul className="divide-y divide-grey-100 dark:divide-border">
        {relationships.honour.decisions.map((decision) => <li key={decision.year} className="px-4 py-3 text-b3">
          <p className="flex items-center justify-between gap-2">
            <span className={cn("font-semibold", ink)}>{decision.year}</span>
            <span className={cn(pill, decision.outcome === "GRANTED" ? "bg-success-500/10 text-success-700 dark:text-success-300" : "bg-grey-100 text-grey-600 dark:bg-muted dark:text-muted-foreground")}>{decision.outcome === "GRANTED" ? "Granted" : "Declined"}</span>
          </p>
          {decision.note && <p className={cn("mt-1 italic", muted)}>“{decision.note}”</p>}
        </li>)}
      </ul>}
    </Section>
  </div>
}

function AccountTab({ user, relationships }: { user: PlatformUser; relationships: UserRelationships | undefined }) {
  const profile = user.userProfile
  return <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
    <Section className="lg:col-span-7" icon={<KeyRound className="size-4" aria-hidden="true" />} title="Account">
      <Rows>
        <Row label="User ID" value={user.id} mono trailing={<CopyButton value={user.id} label="user ID" />} />
        <Row label="Account role" value={user.role ? `${accountRoleLabels[user.role]} · ${accountRoleDescriptions[user.role]}` : null} />
        <Row label="Created" value={formatDate(user.createdAt, dateTime)} icon={<CalendarDays className="size-3.5" aria-hidden="true" />} />
        <Row label="Last updated" value={formatDate(user.updatedAt, dateTime)} />
        <Row label="Signed up on" value={user.deviceType} icon={<Smartphone className="size-3.5" aria-hidden="true" />} />
        <Row label="Sign-up IP" value={profile?.ipAddress} mono />
        {(user.isMachine || user.isLegal) && <Row label="Flags" value={[user.isMachine && "Automated account", user.isLegal && "Legal entity"].filter(Boolean).join(", ")} />}
        {user.deactivatedAt && <Row label="Deactivated" value={formatDate(user.deactivatedAt, dateTime)} />}
        {user.deletionScheduledFor && <Row label="Deletion scheduled" value={formatDate(user.deletionScheduledFor, dateTime)} />}
        {user.erasedAt && <Row label="Erased" value={formatDate(user.erasedAt, dateTime)} />}
      </Rows>
    </Section>
    <div className="flex flex-col gap-4 lg:col-span-5">
      <Section icon={<Fingerprint className="size-4" aria-hidden="true" />} title="Sign-in">
        <Rows>
          <Row label="Password" value={user.isOAuth && !user.passwordChangedAt ? "Social sign-in only" : user.passwordChangedAt ? `Changed ${formatRelative(user.passwordChangedAt)}` : "Set at sign-up"} />
          <Row label="Live sessions" value={relationships ? relationships.sessions.active.toLocaleString() : "…"} />
          <Row label="Last sign-in" value={relationships ? formatDate(relationships.sessions.lastStartedAt, dateTime) ?? "Never" : "…"} />
        </Rows>
        <div className="border-t border-grey-100 px-4 py-3 dark:border-border">
          <p className={cn("mb-2 text-b3", muted)}>Linked accounts</p>
          {!relationships ? <span className={cn("text-b3", muted)}>…</span> : relationships.identities.length === 0 ? <p className={cn("text-b3", muted)}>None. They sign in with email and password.</p> : <ul className="flex flex-col gap-2">
            {relationships.identities.map((identity) => <li key={`${identity.provider}-${identity.createdAt}`} className="flex flex-wrap items-center justify-between gap-2 text-b3">
              <span className={cn("font-semibold", ink)}>{identity.provider ? identityProviderLabels[identity.provider] : "Other provider"}</span>
              <span className={cn("min-w-0 truncate text-b4", muted)}>{identity.email ?? "No email shared"} · {identity.lastUsedAt ? `used ${formatRelative(identity.lastUsedAt)}` : `linked ${formatRelative(identity.createdAt)}`}</span>
            </li>)}
          </ul>}
        </div>
      </Section>
      <Section icon={<Coins className="size-4" aria-hidden="true" />} title="Consent & wallet">
        <Rows>
          <Row label="Terms accepted" value={relationships?.consent ? `Version ${relationships.consent.policyVersion} · ${formatDate(relationships.consent.acceptedAt)}` : relationships ? "No record" : "…"} />
          <Row label="Gold balance" value={relationships ? relationships.goldBalance === null ? "No wallet" : `${relationships.goldBalance.toLocaleString()} bars` : "…"} icon={<Sparkles className="size-3.5" aria-hidden="true" />} />
        </Rows>
      </Section>
    </div>
  </div>
}
