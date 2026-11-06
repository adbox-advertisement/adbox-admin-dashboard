import { cn } from "@/lib/utils"
import { formatDate } from "../lib/format"
import type { UserRelationships } from "../types"
import { PersonRow } from "./ConnectionsList"
import { muted } from "./Surface"
import { pill } from "./UserBadges"

/**
 * Who runs a page or business, and what a person runs (backend `docs/business-accounts.md`, "People").
 * Owners add people and hand it over; editors post and reply as it. An invitation does not run it
 * until it is accepted.
 */

type Membership = { role: "OWNER" | "EDITOR"; invited: boolean; since: string }

const kindLabels = { PAGE: "Page", BUSINESS: "Business", ACCOUNT: "Account" } as const

function MembershipPills({ member }: { member: Membership }) {
  return <>
    <span className={cn(pill, member.role === "OWNER" ? "bg-purple/10 text-purple" : "bg-grey-100 text-grey-600 dark:bg-muted dark:text-muted-foreground")}>
      {member.role === "OWNER" ? "Owner" : "Editor"}
    </span>
    {member.invited
      ? <span className={cn(pill, "bg-warning-500/10 text-warning-700 dark:text-warning-300")}>Invited</span>
      : <span className={cn("text-b4", muted)}>since {formatDate(member.since)}</span>}
  </>
}

/** The people who run an account, owners first. */
export function RunByList({ members, label }: { members: Array<Membership & { person: UserRelationships["runBy"][number]["person"] }>; label: string }) {
  return <ul aria-label={label} className="divide-y divide-grey-100 dark:divide-border">
    {members.map((member) => <li key={member.person.id}>
      <PersonRow person={member.person} aside={<MembershipPills member={member} />} />
    </li>)}
  </ul>
}

/** The pages and businesses a person runs. */
export function RunsList({ runs }: { runs: UserRelationships["runs"] }) {
  return <ul aria-label="Pages and businesses they run" className="divide-y divide-grey-100 dark:divide-border">
    {runs.map((run) => <li key={run.account.id}>
      <PersonRow person={run.account} aside={<>
        <span className={cn(pill, "bg-blue/10 text-blue dark:text-cyan")}>{kindLabels[run.kind]}</span>
        <MembershipPills member={run} />
      </>} />
    </li>)}
  </ul>
}
