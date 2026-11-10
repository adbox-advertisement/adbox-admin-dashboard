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
import { EmptyState, ErrorState, RowsSkeleton, ink, muted, surface } from "./Surface"
import { ListToolbar, StatusFilter } from "./ListParts"

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

  return <article aria-label="Verification requests" className={cn(surface, "overflow-hidden")}>
    <ListToolbar>
      <StatusFilter label="Filter requests by status" value={status} onChange={(value) => { setStatus(value); setPage(1) }} options={filters} />
    </ListToolbar>

    {requests.isPending && <RowsSkeleton label="Loading verification requests" />}
    {requests.isError && <ErrorState message={usersErrorMessage(requests.error, "Could not load verification requests.")} onRetry={() => void requests.refetch()} retryLabel="Retry requests" />}

    {requests.data && <>
      <div className="max-w-full overflow-x-auto [contain:paint]" aria-busy={requests.isFetching}>
        <table className="w-full min-w-[860px] text-left text-b3 md:text-b2">
          <caption className="sr-only">Institution verification requests, oldest first</caption>
          <thead>
            <tr className={cn("border-b border-grey-200 bg-grey-50/60 dark:border-border dark:bg-background/60", muted)}>
              <th scope="col" className="px-6 py-4 font-semibold">Person</th>
              <th scope="col" className="px-3 py-4 font-semibold">Institution</th>
              <th scope="col" className="px-3 py-4 font-semibold">Submitted</th>
              <th scope="col" className="px-3 py-4 font-semibold">Evidence</th>
              <th scope="col" className="px-3 py-4 font-semibold">Status</th>
              <th scope="col" className="px-6 py-4 text-right font-semibold"><span className="sr-only">Decision</span></th>
            </tr>
          </thead>
          <tbody className={requests.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
            {requests.data.items.map((request) => {
              const user = users.get(request.userId)?.data
              const name = user ? userDisplayName(user) : canReadUsers && users.get(request.userId)?.isPending ? "Loading…" : "Platform user"
              const institution = institutionName(request.institutionId)
              return <tr key={request.id} className="border-b border-grey-200 last:border-b-0 dark:border-border">
                <td className="px-6 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <UserAvatar name={name} image={user?.userProfile?.image ?? null} />
                    <div className="min-w-0">
                      {canReadUsers
                        ? <button type="button" onClick={() => onOpenUser(request.userId)} className={cn("block max-w-[220px] cursor-pointer truncate text-left font-semibold hover:text-purple focus-visible:text-purple focus-visible:outline-none", ink)}>{name}</button>
                        : <p className={cn("max-w-[220px] truncate font-semibold", ink)}>{name}</p>}
                      <p className={cn("max-w-[220px] truncate text-b4", muted)}>{user?.userProfile?.email ?? request.userId}</p>
                    </div>
                  </div>
                </td>
                <td className={cn("px-3 py-4", ink)}><p className="max-w-[200px] truncate" title={institution}>{institution}</p></td>
                <td className="whitespace-nowrap px-3 py-4">
                  <p className={ink}>{formatDate(request.createdAt)}</p>
                  <p className={cn("text-b4", muted)}>{formatRelative(request.createdAt)}</p>
                </td>
                <td className="px-3 py-4">
                  {request.evidenceUrl
                    ? <a href={request.evidenceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-1 whitespace-nowrap font-semibold text-blue hover:underline dark:text-cyan">View evidence<ExternalLink className="size-3.5" aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span></a>
                    : <span className={cn("text-b4", muted)}>Link unavailable</span>}
                </td>
                <td className="px-3 py-4">
                  <RequestStatusBadge status={request.status} />
                  {request.status !== "PENDING" && <p className={cn("mt-1 max-w-[200px] text-b4", muted)}>
                    {formatRelative(request.reviewedAt) ?? ""}{request.reviewedBy ? ` by ${`${request.reviewedBy.firstName ?? ""} ${request.reviewedBy.lastName ?? ""}`.trim() || request.reviewedBy.email}` : ""}
                  </p>}
                  {request.rejectionNote && <p className={cn("mt-1 line-clamp-2 max-w-[200px] text-b4 italic", muted)} title={request.rejectionNote}>“{request.rejectionNote}”</p>}
                </td>
                <td className="px-6 py-4 text-right">
                  {request.status === "PENDING" && canReview && <div className="flex justify-end gap-2">
                    <Button type="button" size="sm" variant="outline" className="h-9 cursor-pointer rounded-full px-3 text-destructive hover:text-destructive" onClick={() => setDecision({ requestId: request.id, decision: "reject", applicant: name, institution })}>
                      <ShieldX className="size-4" aria-hidden="true" />Reject
                    </Button>
                    <Button type="button" size="sm" className="h-9 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] px-3 text-white hover:opacity-90" onClick={() => setDecision({ requestId: request.id, decision: "approve", applicant: name, institution })}>
                      <ShieldCheck className="size-4" aria-hidden="true" />Approve
                    </Button>
                  </div>}
                </td>
              </tr>
            })}
          </tbody>
        </table>
        {requests.data.items.length === 0 && <EmptyState icon={Inbox} title={status === "PENDING" ? "No requests waiting" : "No requests found"}>
          {status === "PENDING" ? "You're all caught up. New institution verification requests will appear here." : "Try another status."}
        </EmptyState>}
      </div>
      {requests.data.total > 0 && <Pagination page={page} limit={PAGE_SIZE} total={requests.data.total} noun="requests" onPageChange={setPage} />}
    </>}

    {decision && <VerificationDecisionDialog {...decision} onClose={() => setDecision(null)} />}
  </article>
}
