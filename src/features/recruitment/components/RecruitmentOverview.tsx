import { ArrowRight, ChevronRight, GraduationCap, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ApplicationStatus, RecruitmentStats } from "../types"
import { closedStatuses, pipeline, stageGuide, statusLabels } from "../lib/workflow"

type StageProps = { stats: RecruitmentStats | undefined; activeStatus?: ApplicationStatus; onStatus: (status?: ApplicationStatus) => void }

const plural = (count: number, one: string, many = `${one}s`) => `${count.toLocaleString()} ${count === 1 ? one : many}`

/** Shown only while new applications wait: the one thing that needs a reviewer first. */
export function NewApplicationsCallout({ stats, activeStatus, onStart }: { stats: RecruitmentStats | undefined; activeStatus?: ApplicationStatus; onStart: () => void }) {
  const waiting = stats?.byStatus.SUBMITTED ?? 0
  if (!waiting || activeStatus === "SUBMITTED") return null
  return <section aria-label="Waiting for you" className="flex flex-wrap items-center gap-3 rounded-2xl border border-warning-500/30 bg-warning-500/5 p-4 sm:px-5">
    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-warning-500/10 text-warning-700 dark:text-warning-400"><Inbox className="size-5" aria-hidden="true" /></span>
    {/* Wide enough to read; on a phone the button wraps below it. */}
    <div className="min-w-[12rem] flex-1">
      <p className="text-sm font-semibold">{plural(waiting, "new application")} waiting for a first look</p>
      <p className="text-xs text-muted-foreground">Start with these: open one, read it, then move it on or reject it.</p>
    </div>
    <Button variant="secondary" className="h-10 rounded-xl px-4" onClick={onStart}>Review new applications<ArrowRight aria-hidden="true" /></Button>
  </section>
}

/** Where every application is: the stages left to right, then the closed ones. Selecting a stage lists it. */
export function RecruitmentPipeline({ stats, activeStatus, onStatus }: StageProps) {
  const count = (status: ApplicationStatus) => stats?.byStatus[status]
  return <section aria-labelledby="pipeline-title" className="rounded-2xl border border-border bg-card p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 id="pipeline-title" className="text-lg font-semibold">Where every application is</h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">Applications move left to right. Select a stage to list its candidates.</p>
      </div>
      <button type="button" aria-pressed={!activeStatus} onClick={() => onStatus(undefined)} aria-label={stats ? `All candidates, ${stats.total.toLocaleString()}` : "All candidates"}
        className={cn("inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold outline-none transition focus-visible:shadow-adbox-focus-secondary",
          !activeStatus ? "border-blue/40 bg-blue/5 text-blue dark:border-cyan/40 dark:bg-cyan/5 dark:text-cyan" : "border-border text-muted-foreground hover:text-foreground")}>
        All candidates<span className="rounded-md bg-muted px-1.5 py-0.5 tabular-nums text-foreground">{stats?.total.toLocaleString() ?? "—"}</span>
      </button>
    </div>
    <ol className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {pipeline.map((status, index) => {
        const value = count(status)
        const active = activeStatus === status
        const needsYou = status === "SUBMITTED" && Boolean(value)
        return <li key={status} className="relative min-w-0">
          <button type="button" aria-pressed={active} onClick={() => onStatus(active ? undefined : status)}
            aria-label={`${statusLabels[status]}: ${value === undefined ? "loading" : plural(value, "application")}, ${stageGuide[status].meaning.toLowerCase()}`}
            className={cn("flex h-full w-full flex-col rounded-xl border p-4 text-left outline-none transition hover:shadow-adbox-small focus-visible:shadow-adbox-focus-secondary",
              active ? "border-blue/50 bg-blue/5 dark:border-cyan/50 dark:bg-cyan/5" : "border-border bg-card")}>
            <span className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Step {index + 1}</span>
              {needsYou && <span className="rounded-full bg-warning-500/15 px-2 py-0.5 normal-case tracking-normal text-warning-800 dark:text-warning-400">Needs you</span>}
            </span>
            <span className="mt-2 font-heading text-3xl font-semibold tabular-nums">{value?.toLocaleString() ?? "—"}</span>
            <span className={cn("mt-1 text-sm font-semibold", active && "text-blue dark:text-cyan")}>{statusLabels[status]}</span>
            <span className="mt-0.5 text-xs leading-5 text-muted-foreground">{stageGuide[status].meaning}</span>
          </button>
          {index < pipeline.length - 1 && <ChevronRight aria-hidden="true" className="absolute -right-3 top-1/2 z-10 hidden size-4 -translate-y-1/2 rounded-full bg-card text-muted-foreground xl:block" />}
        </li>
      })}
      <li className="col-span-2 min-w-0 rounded-xl border border-dashed border-border p-3 md:col-span-1">
        <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Closed</p>
        <div className="mt-2 flex flex-col gap-1">
          {closedStatuses.map(status => {
            const value = count(status)
            const active = activeStatus === status
            return <button key={status} type="button" aria-pressed={active} onClick={() => onStatus(active ? undefined : status)}
              aria-label={`${statusLabels[status]}: ${value === undefined ? "loading" : plural(value, "application")}`}
              className={cn("flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm outline-none transition hover:bg-muted focus-visible:shadow-adbox-focus-secondary",
                active && "bg-blue/5 text-blue ring-1 ring-blue/30 dark:bg-cyan/5 dark:text-cyan dark:ring-cyan/30")}>
              <span>{statusLabels[status]}<span className="block text-xs text-muted-foreground">{stageGuide[status].meaning}</span></span>
              <span className="font-semibold tabular-nums">{value?.toLocaleString() ?? "—"}</span>
            </button>
          })}
        </div>
      </li>
    </ol>
  </section>
}

/** Applications by institution: how many each has accepted and how many are still moving. */
export function RecruitmentCampuses({ stats, selected, onSelect, placesPerCampus }: {
  stats: RecruitmentStats | undefined
  selected?: string
  onSelect: (id: string) => void
  placesPerCampus?: number
}) {
  const largest = Math.max(1, ...(stats?.byInstitution.map(item => item.count) ?? []))
  return <section className="min-w-0 rounded-2xl border border-border bg-card p-5" aria-labelledby="campus-breakdown-title">
    <div className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue/10 text-blue dark:bg-cyan/10 dark:text-cyan"><GraduationCap className="size-5" aria-hidden="true" /></span>
      <div className="min-w-0">
        <h2 id="campus-breakdown-title" className="text-lg font-semibold">Campuses</h2>
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
          {stats ? `${plural(stats.byInstitution.length, "institution")} applying` : "Applications by institution"}
          {placesPerCampus ? ` · up to ${plural(placesPerCampus, "place")} per campus` : ""}
        </p>
      </div>
    </div>
    <div className="mt-4 max-h-[28rem] space-y-1 overflow-y-auto">
      {!stats && <p className="text-sm text-muted-foreground">Campus counts are unavailable.</p>}
      {stats?.byInstitution.length === 0 && <p className="text-sm text-muted-foreground">Campuses appear here when applications arrive.</p>}
      {stats?.byInstitution.map(item => {
        const statuses = item.byStatus
        const accepted = statuses?.ACCEPTED ?? 0
        const moving = statuses ? (statuses.SUBMITTED ?? 0) + (statuses.UNDER_REVIEW ?? 0) + (statuses.SHORTLISTED ?? 0) + (statuses.INTERVIEWED ?? 0) : undefined
        const name = item.name ?? "Unknown institution"
        return <button type="button" key={item.institutionId} aria-pressed={selected === item.institutionId} aria-label={`Filter by ${name}`} onClick={() => onSelect(item.institutionId)}
          className={cn("w-full rounded-xl px-2 py-3 text-left outline-none transition hover:bg-muted focus-visible:shadow-adbox-focus-secondary", selected === item.institutionId && "bg-blue/5 ring-1 ring-blue/30 dark:bg-cyan/5 dark:ring-cyan/30")}>
          <span className="flex items-start justify-between gap-3"><span className="text-xs font-medium leading-5">{name}</span><span className="text-sm font-semibold tabular-nums">{item.count}</span></span>
          {moving !== undefined && <span className="mt-1 block text-[11px] text-muted-foreground">{accepted} accepted · {moving} in progress</span>}
          <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-blue dark:bg-cyan" style={{ width: `${item.count / largest * 100}%` }} /></span>
        </button>
      })}
    </div>
    <p className="mt-4 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">Select a campus to list its candidates.</p>
  </section>
}
