import { useState } from "react"
import { ExternalLink, Inbox, ShieldCheck, ShieldX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useInstitutions, useUserAccess, useUsersById, useVerificationRequests } from "../hooks"
import { usersErrorMessage } from "../lib/errors"
import { formatDate, formatRelative } from "../lib/format"
import { USER_PERMISSIONS, userDisplayName, type VerificationRequestStatus } from "../types"
import { Pagination } from "@/components/ui/pagination"
import { RequestStatusBadge, UserAvatar } from "./UserBadges"
import { VerificationDecisionDialog } from "./VerificationDecisionDialog"

const PAGE_SIZE = 20
const filters: Array<{ value: VerificationRequestStatus | "ALL"; label: string }> = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ALL", label: "All" },
]

type Decision = { requestId: string; decision: "approve" | "reject"; applicant: string; institution: string }

export function VerificationQueue({ onOpenUser }: { onOpenUser: (id: string) => void }) {
  const can = useUserAccess()
  const [status, setStatus] = useState<VerificationRequestStatus | "ALL">("PENDING")
  const [page, setPage] = useState(1)
  const [decision, setDecision] = useState<Decision | null>(null)
  const requests = useVerificationRequests({ status: status === "ALL" ? undefined : status, page, limit: PAGE_SIZE })
  const institutions = useInstitutions(can(USER_PERMISSIONS.institutionsRead))
  const canReadUsers = can(USER_PERMISSIONS.read)
  const users = useUsersById(requests.data?.items.map((request) => request.userId) ?? [], canReadUsers)
  const institutionName = (id: string) => institutions.data?.find((institution) => institution.id === id)?.name ?? "Unknown institution"
  const canReview = can(USER_PERMISSIONS.verificationReview)

  return <article className="overflow-hidden rounded-[20px] bg-white shadow-adbox-small dark:bg-card">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-grey-200 p-4 dark:border-border sm:p-5">
      <div role="radiogroup" aria-label="Filter requests by status" className="flex flex-wrap gap-1 rounded-full bg-grey-50 p-1 dark:bg-background">
        {filters.map((filter) => (
          <button key={filter.value} type="button" role="radio" aria-checked={status === filter.value}
            onClick={() => { setStatus(filter.value); setPage(1) }}
            className={cn("cursor-pointer rounded-full px-4 py-2 text-b3 font-semibold transition-colors", status === filter.value ? "bg-white text-purple shadow-adbox-small dark:bg-card" : "text-grey-500 hover:text-grey-1000 dark:text-muted-foreground dark:hover:text-foreground")}>
            {filter.label}
          </button>
        ))}
      </div>
      <p className="text-b3 text-grey-500 dark:text-muted-foreground">Oldest requests first. Check the evidence before deciding.</p>
    </div>

    {requests.isPending && <p role="status" className="p-6 text-sm text-muted-foreground">Loading verification requests…</p>}
    {requests.isError && <div role="alert" className="flex flex-wrap items-center gap-3 p-6">
      <p className="text-sm text-destructive">{usersErrorMessage(requests.error, "Could not load verification requests.")}</p>
      <Button type="button" variant="outline" onClick={() => void requests.refetch()}>Retry requests</Button>
    </div>}

    {requests.data && <>
      <ul className={cn("divide-y divide-grey-200 dark:divide-border", requests.isPlaceholderData && "opacity-60")} aria-busy={requests.isFetching}>
        {requests.data.items.map((request) => {
          const user = users.get(request.userId)?.data
          const name = user ? userDisplayName(user) : canReadUsers && users.get(request.userId)?.isPending ? "Loading…" : "Platform user"
          const institution = institutionName(request.institutionId)
          return <li key={request.id} className="grid grid-cols-1 gap-4 px-4 py-4 sm:px-6 md:grid-cols-12 md:items-center">
            <div className="flex min-w-0 items-center gap-3 md:col-span-4">
              <UserAvatar name={name} image={user?.userProfile?.image ?? null} />
              <div className="min-w-0">
                {canReadUsers
                  ? <button type="button" onClick={() => onOpenUser(request.userId)} className="block max-w-full cursor-pointer truncate text-left text-b2 font-semibold text-grey-1000 hover:text-purple dark:text-foreground">{name}</button>
                  : <p className="truncate text-b2 font-semibold text-grey-1000 dark:text-foreground">{name}</p>}
                <p className="truncate text-b4 text-grey-500 dark:text-muted-foreground">{user?.userProfile?.email ?? request.userId}</p>
              </div>
            </div>
            <div className="min-w-0 md:col-span-3">
              <p className="truncate text-b3 font-medium text-grey-1000 dark:text-foreground">{institution}</p>
              <p className="text-b4 text-grey-500 dark:text-muted-foreground">Submitted {formatDate(request.createdAt)} · {formatRelative(request.createdAt)}</p>
            </div>
            <div className="flex min-w-0 flex-col gap-1.5 md:col-span-2">
              <RequestStatusBadge status={request.status} />
              {request.evidenceUrl
                ? <a href={request.evidenceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-1 text-b3 font-semibold text-blue hover:underline dark:text-cyan">View evidence<ExternalLink className="size-3.5" aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span></a>
                : <span className="text-b4 text-grey-500 dark:text-muted-foreground">Evidence link unavailable</span>}
            </div>
            <div className="md:col-span-3 md:text-right">
              {request.status === "PENDING" ? canReview && <div className="flex gap-2 md:justify-end">
                <Button type="button" size="sm" variant="outline" className="h-9 cursor-pointer rounded-full px-4 text-destructive hover:text-destructive" onClick={() => setDecision({ requestId: request.id, decision: "reject", applicant: name, institution })}>
                  <ShieldX className="size-4" aria-hidden="true" />Reject
                </Button>
                <Button type="button" size="sm" className="h-9 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] px-4 text-white hover:opacity-90" onClick={() => setDecision({ requestId: request.id, decision: "approve", applicant: name, institution })}>
                  <ShieldCheck className="size-4" aria-hidden="true" />Approve
                </Button>
              </div> : <div className="text-b4 text-grey-500 dark:text-muted-foreground">
                <p>{request.status === "APPROVED" ? "Approved" : "Rejected"} {formatRelative(request.reviewedAt) ?? ""}{request.reviewedBy ? ` by ${`${request.reviewedBy.firstName ?? ""} ${request.reviewedBy.lastName ?? ""}`.trim() || request.reviewedBy.email}` : ""}</p>
                {request.rejectionNote && <p className="mt-1 line-clamp-2 italic" title={request.rejectionNote}>“{request.rejectionNote}”</p>}
              </div>}
            </div>
          </li>
        })}
      </ul>
      {requests.data.items.length === 0 && <div className="flex flex-col items-center px-6 py-14 text-center">
        <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-purple/10 text-purple"><Inbox className="size-6" aria-hidden="true" /></span>
        <h3 className="font-heading text-base font-semibold text-grey-1000 dark:text-foreground">{status === "PENDING" ? "No requests waiting" : "No requests found"}</h3>
        <p className="mt-1.5 max-w-sm text-sm leading-6 text-grey-500 dark:text-muted-foreground">{status === "PENDING" ? "You're all caught up. New institution verification requests will appear here." : "Try another status."}</p>
      </div>}
      {requests.data.total > 0 && <Pagination page={page} limit={PAGE_SIZE} total={requests.data.total} noun="requests" onPageChange={setPage} />}
    </>}

    {decision && <VerificationDecisionDialog {...decision} onClose={() => setDecision(null)} />}
  </article>
}
