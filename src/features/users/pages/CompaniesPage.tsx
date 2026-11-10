import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Building2 } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import { cn } from "@/lib/utils"
import { useCompanies, useDebouncedValue, useUserAccess } from "../hooks"
import { usersErrorMessage } from "../lib/errors"
import { formatDate, formatRelative } from "../lib/format"
import { companyPath, peoplePath, userProfilePath } from "../lib/paths"
import { USER_PERMISSIONS, companyStatusLabels, userDisplayName, type CompanyStatus } from "../types"
import { companyStatuses } from "../validation"
import { CompanyStatusBadge, UserAvatar } from "../components/UserBadges"
import { EmptyState, ErrorState, MoreLink, NoAccess, RowsSkeleton, ink, muted, surface } from "../components/Surface"
import { ListToolbar, PageIntro, SearchField, StatusFilter } from "../components/ListParts"

const PAGE_SIZE = 20

export function CompaniesPage() {
  const can = useUserAccess()
  const allowed = can(USER_PERMISSIONS.companiesRead)
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const requested = params.get("status")
  const status = companyStatuses.includes(requested as CompanyStatus) ? requested as CompanyStatus : ""
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const debounced = useDebouncedValue(search.trim())
  const companies = useCompanies({ status: status || undefined, search: debounced || undefined, page, limit: PAGE_SIZE }, allowed)

  if (!allowed) return <NoAccess permission={USER_PERMISSIONS.companiesRead} what="advertiser companies" />

  const setStatus = (value: CompanyStatus | "") => {
    setPage(1)
    setParams((current) => { const next = new URLSearchParams(current); if (value) next.set("status", value); else next.delete("status"); return next }, { replace: true })
  }

  return <div className="flex min-w-0 flex-col gap-4 px-4 sm:px-6">
    <PageIntro action={can(USER_PERMISSIONS.read) ? <MoreLink to={peoplePath({ role: "PUBLISHER" })}>All publisher accounts</MoreLink> : undefined}>
      Advertisers' companies. Publishers own or join one; once AdBox approves it, its campaigns can run and its publishers carry the verified company seal.
    </PageIntro>

    <article aria-label="Companies" className={cn(surface, "overflow-hidden")}>
      <ListToolbar>
        <StatusFilter label="Filter companies by status" value={status} onChange={setStatus}
          options={[{ value: "", label: "All" }, ...companyStatuses.map((value) => ({ value, label: companyStatusLabels[value] }))]} />
        <SearchField label="Search companies by name or email" value={search} onChange={(value) => { setSearch(value); setPage(1) }} placeholder="Search by name or email" />
      </ListToolbar>

      {companies.isPending && <RowsSkeleton label="Loading companies" />}
      {companies.isError && <ErrorState message={usersErrorMessage(companies.error, "Could not load companies.")} onRetry={() => void companies.refetch()} retryLabel="Retry companies" />}
      {companies.data && <>
        <div className="max-w-full overflow-x-auto [contain:paint]" aria-busy={companies.isFetching}>
          <table className="w-full min-w-[980px] text-left text-b3 md:text-b2">
            <caption className="sr-only">Advertiser companies</caption>
            <thead>
              <tr className={cn("border-b border-grey-200 bg-grey-50/60 dark:border-border dark:bg-background/60", muted)}>
                <th scope="col" className="px-6 py-4 font-semibold">Company</th>
                <th scope="col" className="px-3 py-4 font-semibold">Owner</th>
                <th scope="col" className="px-3 py-4 text-right font-semibold">Publishers</th>
                <th scope="col" className="px-3 py-4 text-right font-semibold">Campaigns</th>
                <th scope="col" className="px-3 py-4 font-semibold">Registration</th>
                <th scope="col" className="px-3 py-4 font-semibold">Status</th>
                <th scope="col" className="px-6 py-4 text-right font-semibold"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody className={companies.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
              {companies.data.items.map((company) => {
                const open = () => navigate(companyPath(company.id))
                return <tr key={company.id} className="cursor-pointer border-b border-grey-200 transition-colors last:border-b-0 hover:bg-grey-50/60 dark:border-border dark:hover:bg-background/60" onClick={open}>
                  <td className="px-6 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <UserAvatar name={company.name} image={company.logo} square />
                      <div className="min-w-0">
                        <button type="button" onClick={(event) => { event.stopPropagation(); open() }} className={cn("block max-w-[240px] cursor-pointer truncate text-left font-semibold hover:text-purple focus-visible:text-purple focus-visible:outline-none", ink)}>{company.name}</button>
                        <p className={cn("max-w-[240px] truncate text-b4", muted)}>{company.email} · created {formatRelative(company.createdAt)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4" onClick={(event) => event.stopPropagation()}>
                    {company.owner ? <Link to={userProfilePath(company.owner.id)} className={cn("block max-w-[180px] truncate font-medium hover:text-purple", ink)}>{userDisplayName(company.owner)}</Link> : <span className={muted}>Unknown</span>}
                  </td>
                  <td className="px-3 py-4 text-right tabular-nums">{company._count?.publishers.toLocaleString() ?? "—"}</td>
                  <td className="px-3 py-4 text-right tabular-nums">{company._count?.campaigns.toLocaleString() ?? "—"}</td>
                  <td className={cn("px-3 py-4 font-mono text-b4", company.registrationNumber ? ink : muted)}>{company.registrationNumber ?? "Not given"}</td>
                  <td className="px-3 py-4">
                    <CompanyStatusBadge status={company.status} />
                    {company.verifiedAt && <p className={cn("mt-1 text-b4", muted)}>{formatDate(company.verifiedAt)}</p>}
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(event) => event.stopPropagation()}>
                    <Link to={companyPath(company.id)} className="rounded-full px-2 py-1 font-semibold text-purple hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple" aria-label={`${company.status === "PENDING_VERIFICATION" ? "Review" : "View"} ${company.name}`}>
                      {company.status === "PENDING_VERIFICATION" ? "Review" : "View"}
                    </Link>
                  </td>
                </tr>
              })}
            </tbody>
          </table>
          {companies.data.items.length === 0 && <EmptyState icon={Building2} title={status === "PENDING_VERIFICATION" ? "No companies waiting" : "No companies found"}>
            {debounced || status ? "Try another status or search." : "Companies appear here when publishers register them."}
          </EmptyState>}
        </div>
        {companies.data.total > 0 && <Pagination page={page} limit={PAGE_SIZE} total={companies.data.total} noun="companies" onPageChange={setPage} />}
      </>}
    </article>
  </div>
}
