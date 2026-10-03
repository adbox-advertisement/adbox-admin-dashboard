import { useEffect, useState } from "react"
import { Check, CirclePlay, RefreshCw, Search, ShieldCheck, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useApplications, useRecruitmentAccess, useRecruitmentCampaigns, useRecruitmentStats, useRefreshRecruitment } from "../hooks"
import type { ApplicationFilters } from "../types"
import { statusLabels } from "../lib/workflow"
import { CandidateQueue } from "../components/CandidateQueue"
import { CandidateDetails } from "../components/CandidateDetails"
import { CampusBreakdown, RecruitmentOverview, RecruitmentStages, RecruitmentWelcome } from "../components/RecruitmentOverview"
import { RecruitmentError, RecruitmentSelect } from "../components/RecruitmentControls"
import { ExportDialog } from "../components/ExportDialog"

export function RecruitmentPage() {
  const access = useRecruitmentAccess()
  if (access.profile.isPending) return <p role="status" className="p-6 text-sm text-muted-foreground">Loading recruitment access…</p>
  if (access.profile.isError) return <div className="p-6"><RecruitmentError error={access.profile.error} retry={() => void access.profile.refetch()} /></div>
  if (!access.canRead) return <section className="m-6 rounded-2xl border bg-card p-8"><ShieldCheck className="mb-4 size-8 text-blue dark:text-cyan" aria-hidden="true" /><h1 className="text-2xl font-semibold">Recruitment access needed</h1><p className="mt-2 text-sm text-muted-foreground">Ask an administrator for permission to view recruitment applications.</p></section>
  return <RecruitmentWorkspace canReview={access.canReview} canExport={access.canExport} canManageCampaigns={access.canManageCampaigns} />
}

function RecruitmentWorkspace({ canReview, canExport, canManageCampaigns }: { canReview: boolean; canExport: boolean; canManageCampaigns: boolean }) {
  const [filters, setFilters] = useState<ApplicationFilters>({ page: 1, limit: 10 })
  const [search, setSearch] = useState("")
  const [candidateId, setCandidateId] = useState<string | null>(null)
  const applications = useApplications(filters, true)
  const stats = useRecruitmentStats(filters.campaignId, true)
  const campaigns = useRecruitmentCampaigns(canManageCampaigns)
  const refresh = useRefreshRecruitment()
  const filter = (values: Partial<ApplicationFilters>) => setFilters(previous => ({ ...previous, ...values, page: 1 }))
  const clearFilters = () => { setSearch(""); setFilters(previous => ({ page: 1, limit: previous.limit })) }
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = search.trim() || undefined
      setFilters(current => current.search === value ? current : { ...current, search: value, page: 1 })
    }, 300)
    return () => clearTimeout(timer)
  }, [search])
  const selectedCampaign = campaigns.data?.find(campaign => campaign.id === filters.campaignId)
  const selectedInstitution = stats.data?.byInstitution.find(item => item.institutionId === filters.institutionId)
  const hasFilters = Boolean(filters.search || filters.institutionId || filters.campaignId || filters.status)
  const counts = stats.isError ? undefined : stats.data

  return <div className="space-y-6 px-4 pb-12 pt-6 sm:px-8 sm:pt-8" data-testid="recruitment-workspace">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-semibold">Campus recruitment</h1><p className="mt-1 text-xs text-muted-foreground">{selectedCampaign?.title ?? "All recruitment campaigns"}</p></div><div className="flex items-center gap-2"><Button variant="outline" className="h-10 rounded-xl bg-card px-3" disabled={applications.isFetching || stats.isFetching} onClick={() => void refresh()}><RefreshCw className={applications.isFetching ? "motion-safe:animate-spin" : ""} aria-hidden="true" /><span className="hidden sm:inline">Refresh</span><span className="sr-only sm:hidden">Refresh</span></Button>{canExport && <ExportDialog filters={filters} hasSearch={Boolean(filters.search)} />}</div></div>
    <RecruitmentWelcome stats={counts} onStart={() => { filter({ status: "SUBMITTED", institutionId: undefined, search: undefined }); setSearch(""); document.getElementById("candidate-queue-title")?.focus() }} />
    {campaigns.isError && <RecruitmentError error={campaigns.error} retry={() => void campaigns.refetch()} />}
    {stats.isError && <RecruitmentError error={stats.error} retry={() => void stats.refetch()} />}
    <RecruitmentOverview stats={counts} activeStatus={filters.status} onStatus={status => filter({ status })} />
    <div className="grid grid-cols-1 items-start gap-6 min-[440px]:grid-cols-4 md:grid-cols-6 xl:grid-cols-12">
      <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card min-[440px]:col-span-4 md:col-span-6 xl:col-span-9" aria-labelledby="candidate-queue-title">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-3 pt-5"><div><h2 id="candidate-queue-title" tabIndex={-1} className="rounded text-lg font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring">Candidate queue</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">Every application. One clear next step.</p></div><span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="size-1.5 rounded-full bg-success-600" aria-hidden="true" />Updates every minute</span></div>
        <RecruitmentStages stats={counts} activeStatus={filters.status} onStatus={status => filter({ status })} />
        <div className="space-y-3 p-5">
          <div className="grid grid-cols-1 items-end gap-3 min-[700px]:grid-cols-6">
            <form className="min-w-0 min-[700px]:col-span-6" role="search" onSubmit={event => { event.preventDefault(); filter({ search: search.trim() || undefined }) }}><label htmlFor="candidate-search" className="sr-only">Search candidates</label><div className="relative"><Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-muted-foreground" aria-hidden="true" /><Input id="candidate-search" placeholder="Search by name, email or reference…" value={search} maxLength={200} onChange={event => setSearch(event.target.value)} className="h-11 rounded-xl border-border bg-muted/40 pl-10 pr-12 shadow-none" /><Button type="submit" aria-label="Search" variant="ghost" size="icon" className="absolute right-1.5 top-1.5 size-8 rounded-lg"><Search className="size-3.5" aria-hidden="true" /></Button></div></form>
            {canManageCampaigns && <div className="min-w-0 min-[700px]:col-span-3"><RecruitmentSelect label="Recruitment campaign" value={filters.campaignId ?? "all"} onChange={value => filter({ campaignId: value === "all" ? undefined : value, institutionId: undefined })} options={[{ value: "all", label: "All campaigns" }, ...(campaigns.data ?? []).map(campaign => ({ value: campaign.id, label: campaign.title }))]} disabled={campaigns.isPending} /></div>}
            <div className={`min-w-0 ${canManageCampaigns ? "min-[700px]:col-span-3" : "min-[700px]:col-span-6"}`}><RecruitmentSelect label="Institution" value={filters.institutionId ?? "all"} onChange={value => filter({ institutionId: value === "all" ? undefined : value })} options={[{ value: "all", label: "All institutions" }, ...(stats.data?.byInstitution ?? []).map(item => ({ value: item.institutionId, label: item.name ?? "Unknown institution" }))]} /></div>
          </div>
          {selectedCampaign && <p className="text-xs leading-5 text-muted-foreground">{selectedCampaign.isOpen ? "Applications open" : "Applications closed"} · {selectedCampaign.positionsPerCampus} positions per campus</p>}
          {hasFilters && <div className="flex flex-wrap items-center gap-2">
            {filters.status && <FilterChip label={statusLabels[filters.status]} description="Remove stage filter" onRemove={() => filter({ status: undefined })} />}
            {filters.institutionId && <FilterChip label={selectedInstitution?.name ?? "Selected institution"} description="Remove institution filter" onRemove={() => filter({ institutionId: undefined })} />}
            {filters.search && <FilterChip label={`“${filters.search}”`} description="Clear search" onRemove={() => { setSearch(""); filter({ search: undefined }) }} />}
            <Button variant="ghost" size="sm" className="ml-auto text-xs text-muted-foreground" onClick={clearFilters}>Clear filters</Button>
          </div>}
        </div>
        {applications.isPending ? <div role="status" className="space-y-4 border-t p-5"><span className="sr-only">Loading candidates…</span>{[1, 2, 3].map(row => <div key={row} className="flex items-center gap-3 motion-safe:animate-pulse"><div className="size-11 rounded-xl bg-muted" /><div className="flex-1 space-y-2"><div className="h-3 w-2/5 rounded bg-muted" /><div className="h-2 w-3/5 rounded bg-muted" /></div></div>)}</div> : applications.isError ? <div className="p-5"><RecruitmentError error={applications.error} retry={() => void applications.refetch()} /></div> : <CandidateQueue {...applications.data} isFetching={applications.isFetching} hasFilters={hasFilters} onReset={clearFilters} onPage={page => setFilters(previous => ({ ...previous, page }))} onPageSize={limit => filter({ limit })} onSelect={setCandidateId} />}
      </section>
      <aside className="space-y-5 min-[440px]:col-span-4 md:col-span-6 xl:col-span-3"><CampusBreakdown stats={counts} selected={filters.institutionId} onSelect={institutionId => filter({ institutionId: filters.institutionId === institutionId ? undefined : institutionId })} />
        <section className="rounded-2xl border border-blue/15 bg-blue/5 p-5 dark:border-cyan/15 dark:bg-cyan/5"><h2 className="text-base font-semibold">A good review starts with…</h2><ol className="mt-5 space-y-5">{[{ icon: CirclePlay, title: "Meet the candidate", text: "Read their story and watch their introduction." }, { icon: ShieldCheck, title: "Find the right fit", text: "Check experience, availability and campus connections." }, { icon: Check, title: "Make your decision", text: "Add your assessment, then move them to the next stage." }].map(({ icon: Icon, title, text }) => <li key={title} className="flex gap-3"><span className="mt-0.5 text-blue dark:text-cyan"><Icon className="size-4" aria-hidden="true" /></span><div><h3 className="text-xs font-semibold">{title}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p></div></li>)}</ol></section>
      </aside>
    </div>
    {candidateId && <CandidateDetails id={candidateId} canReview={canReview} onClose={() => setCandidateId(null)} />}
  </div>
}

function FilterChip({ label, description, onRemove }: { label: string; description: string; onRemove: () => void }) {
  return <button type="button" aria-label={description} onClick={onRemove} className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-blue/8 px-2.5 py-1.5 text-xs font-medium text-blue outline-none hover:bg-blue/15 focus-visible:ring-2 focus-visible:ring-ring dark:bg-cyan/10 dark:text-cyan"><span className="truncate">{label}</span><X className="size-3.5 shrink-0" aria-hidden="true" /></button>
}
