import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Flag } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import { useAdminId, useDebouncedValue, usePageRequestCounts, usePageRequests, useUserAccess } from "../hooks"
import { cn } from "../lib/cn"
import { usersErrorMessage } from "../lib/errors"
import { formatDate } from "../lib/format"
import { accountAge, checksSummary, kindLine, openPageRequestStatuses, pageRequestStatusLabels, placeLine, waitingFor } from "../lib/page-requests"
import { pageRequestPath } from "../lib/paths"
import { USER_PERMISSIONS } from "../types"
import { requestFilters, type RequestFilter } from "../validation"
import { BusinessLogo } from "../components/BusinessRequestParts"
import { CheckPill, PageRequestStatusPill } from "../components/PageRequestParts"
import { EmptyState, ErrorState, NoAccess, RowsSkeleton, ink, muted, surface } from "../components/Surface"
import { ListToolbar, PageIntro, SearchField, StatusFilter } from "../components/ListParts"

const PAGE_SIZE = 20

function isFilter(value: string | null): value is RequestFilter {
  return requestFilters.includes(value as RequestFilter)
}

/** Groups asking for an official page, oldest first so nobody waits long. */
export function PageRequestsPage() {
  const can = useUserAccess()
  const allowed = can(USER_PERMISSIONS.pageRequestsRead)
  const navigate = useNavigate()
  const adminId = useAdminId()
  const [params, setParams] = useSearchParams()
  const requested = params.get("status")
  const filter: RequestFilter = isFilter(requested) ? requested : "open"
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const debounced = useDebouncedValue(search.trim())
  const requests = usePageRequests({ status: filter, search: debounced || undefined, page, limit: PAGE_SIZE }, allowed)
  const counts = usePageRequestCounts(allowed).data

  if (!allowed) return <NoAccess permission={USER_PERMISSIONS.pageRequestsRead} what="page requests" />

  const setFilter = (value: RequestFilter) => {
    setPage(1)
    setParams((current) => {
      const next = new URLSearchParams(current)
      if (value === "open") next.delete("status")
      else next.set("status", value)
      return next
    }, { replace: true })
  }

  const options = requestFilters.map((value) => ({ value, label: value === "open" ? "All open" : pageRequestStatusLabels[value], count: counts?.[value] }))
  const open = filter === "open" || openPageRequestStatuses.includes(filter)

  return <div className="flex min-w-0 flex-col gap-4 px-4 sm:px-6">
    <PageIntro>
      Campus groups asking for an official page. Approving makes it its own account with the Staff &amp; faculty badge, run by the person who asked. Oldest first.
    </PageIntro>

    <article aria-label="Page requests" className={cn(surface, "overflow-hidden")}>
      <ListToolbar>
        <StatusFilter label="Filter page requests by status" value={filter} onChange={setFilter} options={options} />
        <SearchField label="Search page requests" value={search} onChange={(value) => { setSearch(value); setPage(1) }} placeholder="Group, username, school or requester" maxLength={100} />
      </ListToolbar>

      {requests.isPending && <RowsSkeleton label="Loading page requests" />}
      {requests.isError && <ErrorState message={usersErrorMessage(requests.error, "Could not load page requests.")} onRetry={() => void requests.refetch()} />}
      {requests.data && <>
        <div className="max-w-full overflow-x-auto [contain:paint]" aria-busy={requests.isFetching}>
          <table className="w-full min-w-[920px] text-left text-b3 md:text-b2">
            <caption className="sr-only">Page requests, {open ? "oldest first" : "newest first"}</caption>
            <thead>
              <tr className={cn("border-b border-grey-200 bg-grey-50/60 dark:border-border dark:bg-background/60", muted)}>
                <th scope="col" className="px-6 py-4 font-semibold">Group</th>
                <th scope="col" className="px-3 py-4 font-semibold">Institution</th>
                <th scope="col" className="px-3 py-4 font-semibold">Asked by</th>
                <th scope="col" className="px-3 py-4 font-semibold">Checks</th>
                <th scope="col" className="px-3 py-4 font-semibold">{open ? "Waiting" : "Decided"}</th>
                <th scope="col" className="px-3 py-4 font-semibold">Status</th>
                <th scope="col" className="px-6 py-4 text-right font-semibold"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody className={requests.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
              {requests.data.items.map((request) => {
                const path = pageRequestPath(request.id)
                const checks = checksSummary(request.checks)
                const decided = request.status === "APPROVED" || request.status === "DECLINED"
                return <tr key={request.id} className="cursor-pointer border-b border-grey-200 transition-colors last:border-b-0 hover:bg-grey-50/60 dark:border-border dark:hover:bg-background/60" onClick={() => navigate(path)}>
                  <td className="px-6 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <BusinessLogo name={request.name} url={request.logoUrl} />
                      <div className="min-w-0">
                        <p className={cn("max-w-[240px] truncate font-semibold", ink)}>{request.name}</p>
                        <p className={cn("max-w-[240px] truncate text-b4", muted)}>@{request.username} · {kindLine(request)}</p>
                      </div>
                    </div>
                  </td>
                  <td className={cn("px-3 py-4", ink)}><span className="block max-w-[200px] truncate" title={placeLine(request)}>{placeLine(request)}</span></td>
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
          {requests.data.items.length === 0 && <EmptyState icon={Flag} title={debounced ? "No requests match" : open ? "Nothing waiting" : "No requests here"}>
            {debounced ? "Try another name, username, school or requester." : open ? "Page requests appear here as campus groups send them from the app." : "Try another status."}
          </EmptyState>}
        </div>
        {requests.data.total > 0 && <Pagination page={page} limit={PAGE_SIZE} total={requests.data.total} noun="requests" onPageChange={setPage} />}
      </>}
    </article>
  </div>
}
