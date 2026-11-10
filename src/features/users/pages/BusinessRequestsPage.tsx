import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Store } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import { useAdminId, useBusinessRequestCounts, useBusinessRequests, useDebouncedValue, useUserAccess } from "../hooks"
import { servesLine } from "../lib/business-requests"
import { cn } from "../lib/cn"
import { usersErrorMessage } from "../lib/errors"
import { formatDate } from "../lib/format"
import { accountAge, checksSummary, openPageRequestStatuses, pageRequestStatusLabels, waitingFor } from "../lib/page-requests"
import { businessRequestPath } from "../lib/paths"
import { USER_PERMISSIONS } from "../types"
import { businessRequestFilters, type BusinessRequestFilter } from "../validation"
import { BusinessLogo } from "../components/BusinessRequestParts"
import { CheckPill, PageRequestStatusPill } from "../components/PageRequestParts"
import { EmptyState, ErrorState, NoAccess, RowsSkeleton, ink, muted, surface } from "../components/Surface"
import { ListToolbar, PageIntro, SearchField, StatusFilter } from "../components/ListParts"

const PAGE_SIZE = 20

function isFilter(value: string | null): value is BusinessRequestFilter {
  return businessRequestFilters.includes(value as BusinessRequestFilter)
}

/** People asking for a business account, oldest first so nobody waits long. */
export function BusinessRequestsPage() {
  const can = useUserAccess()
  const allowed = can(USER_PERMISSIONS.companiesRead)
  const navigate = useNavigate()
  const adminId = useAdminId()
  const [params, setParams] = useSearchParams()
  const requested = params.get("status")
  const filter: BusinessRequestFilter = isFilter(requested) ? requested : "open"
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const debounced = useDebouncedValue(search.trim())
  const requests = useBusinessRequests({ status: filter, search: debounced || undefined, page, limit: PAGE_SIZE }, allowed)
  const counts = useBusinessRequestCounts(allowed).data

  if (!allowed) return <NoAccess permission={USER_PERMISSIONS.companiesRead} what="business requests" />

  const setFilter = (value: BusinessRequestFilter) => {
    setPage(1)
    setParams((current) => {
      const next = new URLSearchParams(current)
      if (value === "open") next.delete("status")
      else next.set("status", value)
      return next
    }, { replace: true })
  }

  const options = businessRequestFilters.map((value) => ({ value, label: value === "open" ? "All open" : pageRequestStatusLabels[value], count: counts?.[value] }))
  const open = filter === "open" || openPageRequestStatuses.includes(filter)

  return <div className="flex min-w-0 flex-col gap-4 px-4 sm:px-6">
    <PageIntro>
      People asking for a business account from their own. Approving makes it its own account with the verified company seal, run by them. Oldest first.
    </PageIntro>

    <article aria-label="Business requests" className={cn(surface, "overflow-hidden")}>
      <ListToolbar>
        <StatusFilter label="Filter business requests by status" value={filter} onChange={setFilter} options={options} />
        <SearchField label="Search business requests" value={search} onChange={(value) => { setSearch(value); setPage(1) }} placeholder="Business, username, number or requester" maxLength={100} />
      </ListToolbar>

      {requests.isPending && <RowsSkeleton label="Loading business requests" />}
      {requests.isError && <ErrorState message={usersErrorMessage(requests.error, "Could not load business requests.")} onRetry={() => void requests.refetch()} />}
      {requests.data && <>
        <div className="max-w-full overflow-x-auto [contain:paint]" aria-busy={requests.isFetching}>
          <table className="w-full min-w-[960px] text-left text-b3 md:text-b2">
            <caption className="sr-only">Business requests, {open ? "oldest first" : "newest first"}</caption>
            <thead>
              <tr className={cn("border-b border-grey-200 bg-grey-50/60 dark:border-border dark:bg-background/60", muted)}>
                <th scope="col" className="px-6 py-4 font-semibold">Business</th>
                <th scope="col" className="px-3 py-4 font-semibold">Where</th>
                <th scope="col" className="px-3 py-4 font-semibold">Asked by</th>
                <th scope="col" className="px-3 py-4 font-semibold">Checks</th>
                <th scope="col" className="px-3 py-4 font-semibold">{open ? "Waiting" : "Decided"}</th>
                <th scope="col" className="px-3 py-4 font-semibold">Status</th>
                <th scope="col" className="px-6 py-4 text-right font-semibold"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody className={requests.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
              {requests.data.items.map((request) => {
                const path = businessRequestPath(request.id)
                const checks = checksSummary(request.checks)
                const decided = request.status === "APPROVED" || request.status === "DECLINED"
                const serves = servesLine(request.serves)
                return <tr key={request.id} className="cursor-pointer border-b border-grey-200 transition-colors last:border-b-0 hover:bg-grey-50/60 dark:border-border dark:hover:bg-background/60" onClick={() => navigate(path)}>
                  <td className="px-6 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <BusinessLogo name={request.name} url={request.logoUrl} />
                      <div className="min-w-0">
                        <p className={cn("max-w-[240px] truncate font-semibold", ink)}>{request.name}</p>
                        <p className={cn("max-w-[240px] truncate text-b4", muted)}>@{request.username} · {request.categoryLabel}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <p className={cn("max-w-[200px] truncate", ink)} title={request.location}>{request.location}</p>
                    {serves && <p className={cn("max-w-[200px] truncate text-b4", muted)} title={serves}>Serves {serves}</p>}
                  </td>
                  <td className="px-3 py-4">
                    <p className={cn("max-w-[200px] truncate font-medium", ink)}>{request.requester.name}</p>
                    <p className={cn("max-w-[200px] truncate text-b4", muted)}>{request.requester.role} · on AdBox {accountAge(request.requester.joinedAt)}</p>
                  </td>
                  <td className="px-3 py-4"><CheckPill tone={checks.tone} label={checks.label} /></td>
                  <td className={cn("whitespace-nowrap px-3 py-4 tabular-nums", ink)}>{decided ? formatDate(request.decidedAt) : waitingFor(request.sentAt)}</td>
                  <td className="px-3 py-4"><PageRequestStatusPill request={request} mine={Boolean(adminId) && request.reviewerId === adminId} /></td>
                  <td className="px-6 py-4 text-right" onClick={(event) => event.stopPropagation()}>
                    <Link to={path} className="rounded-full px-2 py-1 font-semibold text-purple hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple" aria-label={`Review ${request.name}`}>
                      {decided ? "View" : "Review"}
                    </Link>
                  </td>
                </tr>
              })}
            </tbody>
          </table>
          {requests.data.items.length === 0 && <EmptyState icon={Store} title={debounced ? "No requests match" : open ? "Nothing waiting" : "No requests here"}>
            {debounced ? "Try another name, username, registration number or requester." : open ? "Business requests appear here as people send them from the app." : "Try another status."}
          </EmptyState>}
        </div>
        {requests.data.total > 0 && <Pagination page={page} limit={PAGE_SIZE} total={requests.data.total} noun="requests" onPageChange={setPage} />}
      </>}
    </article>
  </div>
}
