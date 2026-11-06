import { useId, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Flag, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
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
  const searchId = useId()

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

  const label = (value: RequestFilter) => {
    const name = value === "open" ? "All open" : pageRequestStatusLabels[value]
    const count = counts?.[value]
    return count === undefined ? name : `${name} · ${count}`
  }
  const open = filter === "open" || openPageRequestStatuses.includes(filter)

  return <div className="flex min-w-0 flex-col gap-4 px-4 sm:px-6">
    <section aria-label="About page requests" className={cn(surface, "px-5 py-4")}>
      <h1 className={cn("font-heading text-h5 font-semibold", ink)}>Page requests</h1>
      <p className={cn("mt-1 max-w-3xl text-b3", muted)}>
        Campus groups asking for an official page. Approving makes it its own account with the Staff &amp; faculty badge, run by the person who asked. Oldest first.
      </p>
    </section>

    <article aria-label="Page requests" className={cn(surface, "overflow-hidden")}>
      <div className="flex flex-col gap-3 border-b border-grey-200 p-4 dark:border-border sm:p-5 xl:flex-row xl:items-center">
        <div role="radiogroup" aria-label="Filter page requests by status" className="flex flex-wrap gap-1 rounded-3xl bg-grey-50 p-1 dark:bg-background">
          {requestFilters.map((value) => <button key={value} type="button" role="radio" aria-checked={filter === value} onClick={() => setFilter(value)}
            className={cn("cursor-pointer whitespace-nowrap rounded-full px-3.5 py-2 text-b3 font-semibold transition-colors", filter === value ? "bg-white text-purple shadow-adbox-small dark:bg-card" : "text-grey-500 hover:text-grey-1000 dark:text-muted-foreground dark:hover:text-foreground")}>
            {label(value)}
          </button>)}
        </div>
        <div className="relative min-w-0 xl:min-w-[260px] xl:flex-1">
          <label htmlFor={searchId} className="sr-only">Search page requests</label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-grey-400 dark:text-muted-foreground" />
          <Input id={searchId} type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Group, username, school or requester" autoComplete="off" maxLength={100}
            className="h-11 rounded-full border-grey-200 bg-grey-50 pl-10 pr-10 text-b3 focus-visible:ring-0 dark:border-border dark:bg-background md:text-b2 [&::-webkit-search-cancel-button]:hidden" />
          {search && <button type="button" aria-label="Clear search" onClick={() => { setSearch(""); setPage(1) }} className="absolute right-0 top-0 flex h-11 w-10 cursor-pointer items-center justify-center text-grey-400 hover:text-grey-1000"><X className="size-4" aria-hidden="true" /></button>}
        </div>
      </div>

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
