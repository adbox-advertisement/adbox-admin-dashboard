import { ArrowRight, ArrowUpRight, CheckCheck, GraduationCap, Inbox, Sparkles, UsersRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ApplicationStatus, RecruitmentStats } from "../types"
import { statuses } from "../validation"
import { statusLabels } from "../lib/workflow"

type StageProps = { stats: RecruitmentStats | undefined; activeStatus?: ApplicationStatus; onStatus: (status?: ApplicationStatus) => void }

export function RecruitmentWelcome({ stats, onStart }: { stats: RecruitmentStats | undefined; onStart: () => void }) {
  const reviewed = stats ? stats.total - stats.byStatus.SUBMITTED : 0
  const progress = stats?.total ? Math.round(reviewed / stats.total * 100) : 0
  return <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 p-6 text-white sm:p-8" style={{ background: "var(--gradient-dark-blue)" }}>
    <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-32 -z-10 size-96 rounded-full border-[48px] border-purple/15" />
    <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 right-12 -z-10 size-96 rounded-full border-[48px] border-cyan/10" />
    <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-6 xl:grid-cols-12">
      <div className="md:col-span-4 xl:col-span-8">
        <p className="mb-3 flex items-center gap-2 text-xs font-medium tracking-wide text-cyan"><GraduationCap className="size-4" aria-hidden="true" />ADBOX CAMPUS REPRESENTATIVES</p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Great people. Stronger campuses.</h2>
        <p className="mt-3 max-w-lg text-sm leading-6 text-grey-300">Find your next campus voices. Get to know each applicant, share your assessment, and build your team.</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl border-white bg-white px-4 font-semibold text-blue hover:bg-grey-100 hover:text-blue dark:border-white dark:bg-white dark:text-blue dark:hover:bg-grey-100" disabled={!stats?.byStatus.SUBMITTED} onClick={onStart}>Review new applications<ArrowRight aria-hidden="true" /></Button>
          <span className="text-xs text-grey-300">{stats ? `${stats.byStatus.SUBMITTED} waiting for a first look` : "Loading your queue…"}</span>
        </div>
      </div>
      <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2 md:flex-col md:text-center xl:col-span-4 xl:flex-row xl:text-left">
        <div className="grid size-20 shrink-0 place-items-center rounded-full p-1.5" style={{ background: `conic-gradient(var(--adbox-cyan) ${progress}%, rgb(255 255 255 / 12%) 0)` }}>
          <div className="grid size-full place-items-center rounded-full bg-grey-1000 font-heading text-xl font-semibold">{stats ? `${progress}%` : "—"}</div>
        </div>
        <div><h2 className="text-sm font-semibold">Review progress</h2><p className="mt-1 text-xs leading-5 text-grey-300">{stats ? `${reviewed} of ${stats.total} applications moved beyond submission` : "Your team's progress at a glance"}</p></div>
      </div>
    </div>
  </section>
}

export function RecruitmentOverview({ stats, activeStatus, onStatus }: StageProps) {
  const cards = [
    { label: "All applicants", value: stats?.total, description: "Your complete talent pool", icon: UsersRound, status: undefined, tone: "bg-blue/10 text-blue dark:bg-cyan/10 dark:text-cyan" },
    { label: "New applications", value: stats?.byStatus.SUBMITTED, description: "Ready for a first review", icon: Inbox, status: "SUBMITTED" as const, tone: "bg-warning-200/70 text-warning-900 dark:bg-warning-500/10 dark:text-warning-400" },
    { label: "Shortlisted", value: stats?.byStatus.SHORTLISTED, description: "One step closer to the team", icon: Sparkles, status: "SHORTLISTED" as const, tone: "bg-purple/10 text-blue dark:text-purple" },
    { label: "Accepted", value: stats?.byStatus.ACCEPTED, description: "Your future campus voices", icon: CheckCheck, status: "ACCEPTED" as const, tone: "bg-success-200/70 text-success-900 dark:bg-success-500/10 dark:text-success-400" },
  ]
  return <div className="grid grid-cols-1 gap-3 min-[440px]:grid-cols-4 md:grid-cols-6 xl:grid-cols-12 sm:gap-4">
    {cards.map(({ label, value, description, icon: Icon, tone, status }) => <button key={label} type="button" aria-label={`Show ${label.toLowerCase()}`} aria-pressed={activeStatus === status} onClick={() => onStatus(status)} className={cn("group min-w-0 rounded-2xl border bg-card p-4 text-left outline-none transition hover:-translate-y-0.5 hover:shadow-adbox-small focus-visible:shadow-adbox-focus-secondary motion-reduce:transform-none min-[440px]:col-span-2 md:col-span-3 sm:p-5", activeStatus === status ? "border-blue/40 dark:border-cyan/40" : "border-border")}>
      <div className="flex items-center justify-between gap-2"><span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon className="size-5" aria-hidden="true" /></span><ArrowUpRight className="size-4 text-muted-foreground/60 transition group-hover:text-foreground" aria-hidden="true" /></div>
      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1"><p className="font-heading text-3xl font-semibold tabular-nums">{value?.toLocaleString() ?? "—"}</p><p className="text-xs font-medium sm:text-sm">{label}</p></div><p className="mt-1.5 text-xs leading-5 text-muted-foreground">{description}</p>
    </button>)}
  </div>
}

export function RecruitmentStages({ stats, activeStatus, onStatus }: StageProps) {
  const shortLabels: Partial<Record<ApplicationStatus, string>> = { SUBMITTED: "New", UNDER_REVIEW: "In review" }
  return <div className="flex max-w-full gap-1 overflow-x-auto border-b border-border px-4 sm:px-5" role="group" aria-label="Filter by review stage">
    {[undefined, ...statuses].map(status => <button key={status ?? "all"} type="button" aria-label={status ? `Filter by ${statusLabels[status]}` : "All candidates"} aria-pressed={activeStatus === status} onClick={() => onStatus(status)} className={cn("flex min-h-12 shrink-0 items-center gap-2 border-b-2 px-3 text-xs font-medium outline-none transition focus-visible:shadow-adbox-focus-secondary", activeStatus === status ? "border-blue text-blue dark:border-cyan dark:text-cyan" : "border-transparent text-muted-foreground hover:text-foreground")}>
      {status ? shortLabels[status] ?? statusLabels[status] : "All candidates"}<span className={cn("rounded-md px-1.5 py-0.5 text-[10px] tabular-nums", activeStatus === status ? "bg-blue/10 dark:bg-cyan/10" : "bg-muted")}>{stats ? status ? stats.byStatus[status] : stats.total : "—"}</span>
    </button>)}
  </div>
}

export function CampusBreakdown({ stats, selected, onSelect }: { stats: RecruitmentStats | undefined; selected?: string; onSelect: (id: string) => void }) {
  return <section className="min-w-0 rounded-2xl border border-border bg-card p-5" aria-labelledby="campus-breakdown-title">
    <span className="mb-4 flex size-10 items-center justify-center rounded-xl bg-blue/10 text-blue dark:bg-cyan/10 dark:text-cyan"><GraduationCap className="size-5" aria-hidden="true" /></span>
    <h2 id="campus-breakdown-title" className="text-lg font-semibold">Across campuses</h2>
    <p className="mt-1 text-xs leading-5 text-muted-foreground">{stats ? `${stats.byInstitution.length} institutions represented` : "Applications by institution"}</p>
    <div className="mt-5 max-h-96 space-y-1 overflow-y-auto">
      {!stats && <p className="text-sm text-muted-foreground">Campus counts are unavailable.</p>}
      {stats?.byInstitution.length === 0 && <p className="text-sm text-muted-foreground">Campus distribution will appear when applications arrive.</p>}
      {stats?.byInstitution.map(item => <button type="button" key={item.institutionId} aria-pressed={selected === item.institutionId} aria-label={`Filter by ${item.name ?? "Unknown institution"}`} onClick={() => onSelect(item.institutionId)} className={cn("w-full rounded-xl px-2 py-3 text-left outline-none transition hover:bg-muted focus-visible:shadow-adbox-focus-secondary", selected === item.institutionId && "bg-blue/5 ring-1 ring-blue/30 dark:bg-cyan/5 dark:ring-cyan/30")}>
        <span className="flex items-start justify-between gap-3"><span className="text-xs font-medium leading-5">{item.name ?? "Unknown institution"}</span><span className="text-sm font-semibold tabular-nums">{item.count}</span></span>
        <span className="mt-2.5 block h-1.5 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-blue dark:bg-cyan" style={{ width: `${stats.total ? item.count / stats.total * 100 : 0}%` }} /></span>
      </button>)}
    </div>
    <p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">Select a campus to see its candidates. Counts include all review stages.</p>
  </section>
}
