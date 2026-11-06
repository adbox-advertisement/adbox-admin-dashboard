import { useId, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Search, Store, X } from "lucide-react"
import { Input } from "@/components/ui/input"
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
  const searchId = useId()

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

  const label = (value: BusinessRequestFilter) => {
    const name = value === "open" ? "All open" : pageRequestStatusLabels[value]
    const count = counts?.[value]
    return count === undefined ? name : `${name} · ${count}`
  }
  const open = filter === "open" || openPageRequestStatuses.includes(filter)

  return <div className="flex min-w-0 flex-col gap-4 px-4 sm:px-6">
    <section aria-label="About business requests" className={cn(surface, "px-5 py-4")}>
      <h1 className={cn("font-heading text-h5 font-semibold", ink)}>Business requests</h1>
      <p className={cn("mt-1 max-w-3xl text-b3", muted)}>
        People asking for a business account from their own. Approving makes it its own account with the verified company seal, run by them. Oldest first.
      </p>
    </section>

    <article aria-label="Business requests" className={cn(surface, "overflow-hidden")}>
      <div className="flex flex-col gap-3 border-b border-grey-200 p-4 dark:border-border sm:p-5 xl:flex-row xl:items-center">
        <div role="radiogroup" aria-label="Filter business requests by status" className="flex flex-wrap gap-1 rounded-3xl bg-grey-50 p-1 dark:bg-background">
          {businessRequestFilters.map((value) => <button key={value} type="button" role="radio" aria-checked={filter === value} onClick={() => setFilter(value)}
            className={cn("cursor-pointer whitespace-nowrap rounded-full px-3.5 py-2 text-b3 font-semibold transition-colors", filter === value ? "bg-white text-purple shadow-adbox-small dark:bg-card" : "text-grey-500 hover:text-grey-1000 dark:text-muted-foreground dark:hover:text-foreground")}>
            {label(value)}
          </button>)}
        </div>
        <div className="relative min-w-0 xl:min-w-[260px] xl:flex-1">
          <label htmlFor={searchId} className="sr-only">Search business requests</label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-grey-400 dark:text-muted-foreground" />
          <Input id={searchId} type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Business, username, number or requester" autoComplete="off" maxLength={100}
            className="h-11 rounded-full border-grey-200 bg-grey-50 pl-10 pr-10 text-b3 focus-visible:ring-0 dark:border-border dark:bg-background md:text-b2 [&::-webkit-search-cancel-button]:hidden" />
          {search && <button type="button" aria-label="Clear search" onClick={() => { setSearch(""); setPage(1) }} className="absolute right-0 top-0 flex h-11 w-10 cursor-pointer items-center justify-center text-grey-400 hover:text-grey-1000"><X className="size-4" aria-hidden="true" /></button>}
        </div>
      </div>

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
