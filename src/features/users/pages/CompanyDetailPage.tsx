import { useState } from "react"
import { useParams } from "react-router-dom"
import { Building2, CalendarDays, ExternalLink, Globe, Hash, Mail, Megaphone, Phone, ShieldCheck, ShieldX, UserCog, UsersRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { APP_ROUTES } from "@/routes/paths"
import { useCompany, useUserAccess } from "../hooks"
import { usersErrorMessage } from "../lib/errors"
import { companySizeLabels } from "../lib/business-requests"
import { formatDate, formatRelative, safeImageUrl } from "../lib/format"
import { USER_PERMISSIONS } from "../types"
import { CompanyStatusBadge, UserAvatar, pill } from "../components/UserBadges"
import { BackLink, EmptyState, ErrorState, NoAccess, ink, muted, surface } from "../components/Surface"
import { Callout, MiniStat, Row, Rows, Section } from "../components/ProfileParts"
import { PersonRow } from "../components/ConnectionsList"
import { RunByList } from "../components/RunAccounts"
import { CompanyDecisionDialog } from "../components/CompanyDecisionDialog"

const businessLabels: Record<string, string> = { PRODUCTS: "Products", SERVICES: "Services", BOTH: "Products and services" }

export function CompanyDetailPage() {
  const { companyId = "" } = useParams()
  const can = useUserAccess()
  const allowed = can(USER_PERMISSIONS.companiesRead)
  const company = useCompany(companyId, allowed)
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null)

  if (!allowed) return <NoAccess permission={USER_PERMISSIONS.companiesRead} what="advertiser companies" />

  const data = company.data
  const website = safeImageUrl(data?.website ?? null)
  const canVerify = can(USER_PERMISSIONS.companiesVerify)

  return <div className="flex min-w-0 flex-col gap-4 px-4 sm:px-6">
    <BackLink to={APP_ROUTES.manageUsersCompanies}>All companies</BackLink>
    {company.isError && <div className={surface}><ErrorState message={usersErrorMessage(company.error, "Could not load this company.")} onRetry={() => void company.refetch()} /></div>}
    {company.isPending && <div role="status" aria-label="Loading company" className={cn(surface, "h-48 animate-pulse")} />}

    {data && <>
      <header className={cn(surface, "flex flex-col gap-4 p-5 sm:flex-row sm:items-center")}>
        <UserAvatar name={data.name} image={data.logo} size="lg" square />
        <div className="min-w-0 flex-1">
          <h1 className={cn("truncate font-heading text-h5 font-semibold", ink)}>{data.name}</h1>
          <p className={cn("text-b3", muted)}>Registered {formatDate(data.createdAt)} · {formatRelative(data.createdAt)}</p>
          <div className="mt-2"><CompanyStatusBadge status={data.status} /></div>
        </div>
        {canVerify && data.status !== "ACTIVE" && <div className="flex flex-wrap gap-2">
          {data.status === "PENDING_VERIFICATION" && <Button type="button" variant="outline" className="h-10 cursor-pointer rounded-full px-4 text-destructive hover:text-destructive" onClick={() => setDecision("reject")}>
            <ShieldX className="size-4" aria-hidden="true" />Reject
          </Button>}
          <Button type="button" className="h-10 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] px-4 text-white hover:opacity-90" onClick={() => setDecision("approve")}>
            <ShieldCheck className="size-4" aria-hidden="true" />Approve
          </Button>
        </div>}
      </header>

      {(data.status === "REJECTED" || data.status === "SUSPENDED") && data.rejectionNote && <Callout tone="danger" icon={<ShieldX className="size-4" aria-hidden="true" />}>{data.status === "SUSPENDED" ? "Suspended" : "Rejected"}: “{data.rejectionNote}”</Callout>}
      {data.status === "NEEDS_CHANGES" && <Callout tone="warning" icon={<ShieldCheck className="size-4" aria-hidden="true" />}>Changes asked{data.rejectionNote ? `: “${data.rejectionNote}”` : ""}. It comes back for review once the owner changes it.</Callout>}
      {data.status === "PENDING_VERIFICATION" && <Callout tone="warning" icon={<ShieldCheck className="size-4" aria-hidden="true" />}>Waiting for review. Its campaigns stay in draft until the company is approved.</Callout>}

      <section aria-label="At a glance" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MiniStat label="Publishers" value={data.publishers.length} />
        <MiniStat label="Campaigns" value={data._count?.campaigns ?? "—"} />
        <MiniStat label="Size" value={data.size ? companySizeLabels[data.size] ?? data.size : "Not given"} />
        <MiniStat label="Approved" value={data.verifiedAt ? formatDate(data.verifiedAt) ?? "—" : "Not yet"} />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Section className="overflow-hidden lg:col-span-7" icon={<UsersRound className="size-4" aria-hidden="true" />} title={`Publishers (${data.publishers.length})`}>
          {data.publishers.length === 0 ? <EmptyState icon={Megaphone} title="No publishers">Nobody publishes for this company any more.</EmptyState> : <ul className="divide-y divide-grey-100 dark:divide-border">
            {data.publishers.map((publisher) => <li key={publisher.user.id}>
              <PersonRow person={publisher.user} aside={<span className="flex items-center gap-2">
                {publisher.isOwner && <span className={cn(pill, "bg-purple/10 text-purple")}>Owner</span>}
                <span className={cn("text-b4", muted)}>joined {formatRelative(publisher.joinedAt)}</span>
              </span>} />
            </li>)}
          </ul>}
        </Section>
        <Section className="lg:col-span-5" icon={<Building2 className="size-4" aria-hidden="true" />} title="Company details">
          <Rows>
            <Row label="Email" value={data.email} icon={<Mail className="size-3.5" aria-hidden="true" />} />
            <Row label="Phone" value={data.phoneNumber} icon={<Phone className="size-3.5" aria-hidden="true" />} />
            <Row label="Website" value={website ? <a href={website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue hover:underline dark:text-cyan">{data.website}<ExternalLink className="size-3.5" aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span></a> : data.website} icon={<Globe className="size-3.5" aria-hidden="true" />} />
            <Row label="Registration no." value={data.registrationNumber} mono icon={<Hash className="size-3.5" aria-hidden="true" />} />
            <Row label="Business" value={data.businessType ? businessLabels[data.businessType] ?? data.businessType : null} />
            <Row label="Last updated" value={formatDate(data.updatedAt, "MMM d, yyyy 'at' h:mm a")} icon={<CalendarDays className="size-3.5" aria-hidden="true" />} />
            <Row label="About" value={data.bio} multiline />
          </Rows>
        </Section>
      </div>

      {data.runBy.length > 0 && <Section icon={<UserCog className="size-4" aria-hidden="true" />} title="Who runs its account">
        <p className={cn("px-4 pt-3 text-b3", muted)}>Asked for from someone's own account: nobody signs in to it. These people switch to it from theirs.</p>
        <RunByList members={data.runBy.map(({ user, ...member }) => ({ ...member, person: user }))} label="People who run this company's account" />
      </Section>}

      {decision && <CompanyDecisionDialog companyId={data.id} companyName={data.name} decision={decision} onClose={() => setDecision(null)} />}
    </>}
  </div>
}
