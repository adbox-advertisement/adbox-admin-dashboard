import { useId, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Building2, Search, ShieldCheck, ShieldX, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { cn } from "@/lib/utils"
import { useCompanies, useDebouncedValue, useUserAccess } from "../hooks"
import { usersErrorMessage } from "../lib/errors"
import { formatDate, formatRelative } from "../lib/format"
import { companyPath, peoplePath, userProfilePath } from "../lib/paths"
import { USER_PERMISSIONS, companyStatusLabels, userDisplayName, type Company, type CompanyStatus } from "../types"
import { companyStatuses } from "../validation"
import { CompanyStatusBadge, UserAvatar } from "../components/UserBadges"
import { EmptyState, ErrorState, MoreLink, NoAccess, RowsSkeleton, ink, muted, surface } from "../components/Surface"
import { CompanyDecisionDialog } from "../components/CompanyDecisionDialog"

const PAGE_SIZE = 20
type Decision = { company: Company; decision: "approve" | "reject" }

export function CompaniesPage() {
  const can = useUserAccess()
  const allowed = can(USER_PERMISSIONS.companiesRead)
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const requested = params.get("status")
  const status = companyStatuses.includes(requested as CompanyStatus) ? requested as CompanyStatus : ""
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [decision, setDecision] = useState<Decision | null>(null)
  const debounced = useDebouncedValue(search.trim())
  const companies = useCompanies({ status: status || undefined, search: debounced || undefined, page, limit: PAGE_SIZE }, allowed)
  const searchId = useId()
  const canVerify = can(USER_PERMISSIONS.companiesVerify)

  if (!allowed) return <NoAccess permission={USER_PERMISSIONS.companiesRead} what="advertiser companies" />

  const setStatus = (value: CompanyStatus | "") => {
    setPage(1)
    setParams((current) => { const next = new URLSearchParams(current); if (value) next.set("status", value); else next.delete("status"); return next }, { replace: true })
  }

  return <div className="flex min-w-0 flex-col gap-4 px-4 sm:px-6">
    <section aria-label="About publishers" className={cn(surface, "flex flex-wrap items-center justify-between gap-3 px-5 py-4")}>
      <p className={cn("max-w-3xl text-b3", muted)}>
        <span className={cn("font-semibold", ink)}>Publishers are advertisers.</span> Each one owns or joins a company; a company can have several publishers.
        Once AdBox approves a company, its campaigns can go live and its publishers show the verified company seal.
      </p>
      {can(USER_PERMISSIONS.read) && <MoreLink to={peoplePath({ role: "PUBLISHER" })}>All publisher accounts</MoreLink>}
    </section>

    <article aria-label="Companies" className={cn(surface, "overflow-hidden")}>
      <div className="flex flex-col gap-3 border-b border-grey-200 p-4 dark:border-border sm:flex-row sm:flex-wrap sm:items-center sm:p-5">
        <div role="radiogroup" aria-label="Filter companies by status" className="flex flex-wrap gap-1 rounded-full bg-grey-50 p-1 dark:bg-background">
          {(["", ...companyStatuses] as Array<CompanyStatus | "">).map((value) => <button key={value || "all"} type="button" role="radio" aria-checked={status === value} onClick={() => setStatus(value)}
            className={cn("cursor-pointer rounded-full px-3.5 py-2 text-b3 font-semibold transition-colors", status === value ? "bg-white text-purple shadow-adbox-small dark:bg-card" : "text-grey-500 hover:text-grey-1000 dark:text-muted-foreground dark:hover:text-foreground")}>
            {value ? companyStatusLabels[value] : "All"}
          </button>)}
        </div>
        <div className="relative min-w-0 sm:min-w-[220px] sm:flex-1">
          <label htmlFor={searchId} className="sr-only">Search companies by name or email</label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-grey-400 dark:text-muted-foreground" />
          <Input id={searchId} type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search by name or email" autoComplete="off" maxLength={200}
            className="h-11 rounded-full border-grey-200 bg-grey-50 pl-10 pr-10 text-b3 focus-visible:ring-0 dark:border-border dark:bg-background md:text-b2 [&::-webkit-search-cancel-button]:hidden" />
          {search && <button type="button" aria-label="Clear search" onClick={() => setSearch("")} className="absolute right-0 top-0 flex h-11 w-10 cursor-pointer items-center justify-center text-grey-400 hover:text-grey-1000"><X className="size-4" aria-hidden="true" /></button>}
        </div>
      </div>

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
                <th scope="col" className="px-6 py-4 text-right font-semibold"><span className="sr-only">Decision</span></th>
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
                    {canVerify && company.status !== "ACTIVE" && <div className="flex justify-end gap-2">
                      {company.status === "PENDING_VERIFICATION" && <Button type="button" size="sm" variant="outline" className="h-9 cursor-pointer rounded-full px-3 text-destructive hover:text-destructive" onClick={() => setDecision({ company, decision: "reject" })}>
                        <ShieldX className="size-4" aria-hidden="true" />Reject
                      </Button>}
                      <Button type="button" size="sm" className="h-9 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] px-3 text-white hover:opacity-90" onClick={() => setDecision({ company, decision: "approve" })}>
                        <ShieldCheck className="size-4" aria-hidden="true" />Approve
                      </Button>
                    </div>}
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

    {decision && <CompanyDecisionDialog companyId={decision.company.id} companyName={decision.company.name} decision={decision.decision} onClose={() => setDecision(null)} />}
  </div>
}
