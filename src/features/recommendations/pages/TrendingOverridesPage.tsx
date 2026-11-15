import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { formatDistanceToNowStrict } from "date-fns"
import { Flame, Lock, Pin, Plus, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "../lib/cn"
import { LEVEL_NAMES, scopeLabel, scopeLevel, scopeOptions, subjectNames, type OverrideChoice } from "../lib/overrides"
import { RECOMMENDATION_PERMISSIONS, SCOPE_KEY_PATTERN, type TrendSubject } from "../types"
import { useApprovedEvents, useInstitutionDirectory, useOverrides, useRecommendationAccess, useTrendReport, useTrendStatus } from "../hooks"
import { OverrideDialog } from "../components/OverrideDialog"
import { OverrideList } from "../components/OverrideList"
import { PageHero, Section } from "../components/PageParts"
import { ParamChip } from "../components/ParamChip"
import { ErrorState, IconTile } from "../components/Surface"
import { TrendList } from "../components/TrendList"
import { hairline, ink, muted, surface } from "../components/tokens"

/** Algorithms › Trending overrides: pin, feature, boost, dampen or suppress any of the six kinds in one list. */
export function TrendingOverridesPage() {
  const access = useRecommendationAccess()
  const [params, setParams] = useSearchParams()
  const requested = params.get("list") ?? "global"
  const scopeKey = SCOPE_KEY_PATTERN.test(requested) ? requested : "global"
  const [showAll, setShowAll] = useState(false)
  const [dialog, setDialog] = useState<{ subject?: TrendSubject; choice?: OverrideChoice } | null>(null)
  const [placed, setPlaced] = useState<TrendSubject[]>([])

  const status = useTrendStatus(access.discover)
  const directory = useInstitutionDirectory(access.institutions)
  const report = useTrendReport(scopeKey, access.discover)
  const current = useOverrides(scopeKey, false, access.discover)
  const everything = useOverrides(scopeKey, true, access.discover && showAll)
  const events = useApprovedEvents(access.discover)

  if (access.loading) return <p role="status" className={cn("px-4 py-8 text-b2 sm:px-6", muted)}>Loading…</p>
  if (!access.discover) {
    return <div className="px-4 sm:px-6"><div className={cn(surface, "flex flex-col items-center px-6 py-14 text-center")}>
      <IconTile icon={Lock} size="lg" />
      <h2 className={cn("mt-3 font-heading text-b1 font-semibold", ink)}>You don't have access to Trending</h2>
      <p className={cn("mt-1.5 max-w-sm text-b2 leading-6", muted)}>Ask a Super Admin for the <span className="font-mono text-b3">{RECOMMENDATION_PERMISSIONS.discover}</span> permission.</p>
    </div></div>
  }

  const names = subjectNames({ report: report.data, directory: directory.data, events: events.data, extra: placed })
  const options = scopeOptions([...(status.data?.scopes ?? []), scopeKey], directory.data)
  const scopeName = scopeLabel(scopeKey, directory.data)
  const inForce = new Map((report.data?.overrides ?? []).map((override) => [`${override.kind}:${override.subjectId}`, override]))
  const candidates: TrendSubject[] = [
    ...(report.data?.snapshot?.items ?? []),
    ...(report.data?.snapshot?.diagnostics?.missed ?? []),
  ].map((item) => ({ kind: item.kind, id: item.id, name: names.get(`${item.kind}:${item.id}`) ?? item.id.slice(0, 8) }))
  const shown = showAll ? everything : current
  const open = (subject?: TrendSubject, choice?: OverrideChoice) => setDialog({ subject, choice })

  return <div className="flex min-w-0 flex-col gap-5 px-4 sm:px-6">
    <PageHero icon={Pin} title="Trending overrides" aside={<>
      <ParamChip id="overrides.pins" /><ParamChip id="overrides.featured" /><ParamChip id="overrides.days" /><ParamChip id="overrides.maxMultiplier" />
    </>}>
      Pin, feature, boost, dampen or suppress a hashtag, institution, campus, person, hall or event in one Trending list. Pins and features show
      as <strong className={ink}>Featured</strong> in the app; counts never change, only where a subject appears. Every override has a reason and an end
      within 30 days, shows in the app within about 30 seconds, and is recorded in the audit log.
    </PageHero>

    <div className={cn(surface, "flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-5")}>
      <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
        <span className={cn("text-b3 font-semibold", ink)}>List</span>
        <Select value={scopeKey} onValueChange={(value) => setParams({ list: value }, { replace: true })}>
          <SelectTrigger aria-label="List" className="h-10 w-full rounded-full sm:w-72"><SelectValue /></SelectTrigger>
          <SelectContent>
            {options.map((option) => <SelectItem key={option.key} value={option.key}>
              {option.level === "GLOBAL" ? option.label : `${LEVEL_NAMES[option.level]} · ${option.label}`}
            </SelectItem>)}
          </SelectContent>
        </Select>
        <JobStatus status={status.data} />
      </div>
      {access.manageTrends
        ? <Button type="button" className="h-10 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] px-4 text-white hover:opacity-90" onClick={() => open()}>
          <Plus className="size-4" aria-hidden="true" />Add an override
        </Button>
        : <p className={cn("text-b3", muted)}>Changing Trending needs {RECOMMENDATION_PERMISSIONS.discoverTrendsManage}.</p>}
    </div>
    {scopeLevel(scopeKey) === "CAMPUS" && !status.data?.scopes.includes(scopeKey) && <p className={cn("rounded-2xl border p-3 text-b3", hairline, muted)}>
      This campus has no list of its own, so the app shows its institution's list there, with the institution's overrides. Choose the institution instead.
    </p>}

    <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-12">
      <Section icon={Flame} title={`${scopeName}: the list now`} className="xl:col-span-7">
        {report.isPending ? <p role="status" className={cn("text-b3", muted)}>Loading the list…</p>
          : report.isError ? <ErrorState message="Could not load this list." onRetry={() => void report.refetch()} />
          : <TrendList report={report.data} names={names} inForce={inForce} canManage={access.manageTrends} onAction={(subject, choice) => open(subject, choice)} />}
      </Section>

      <Section icon={Pin} title="Overrides" className="xl:col-span-5" action={
        <div role="radiogroup" aria-label="Which overrides" className="flex gap-1 rounded-3xl bg-grey-50 p-1 dark:bg-background">
          {[{ value: false, label: "In force & scheduled" }, { value: true, label: "All" }].map((option) => <button key={option.label} type="button" role="radio" aria-checked={showAll === option.value}
            onClick={() => setShowAll(option.value)}
            className={cn("min-h-8 cursor-pointer whitespace-nowrap rounded-full px-3 text-b3 font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-purple",
              showAll === option.value ? "bg-white text-purple shadow-adbox-small dark:bg-card" : "text-grey-500 hover:text-grey-1000 dark:text-muted-foreground dark:hover:text-foreground")}>
            {option.label}
          </button>)}
        </div>
      }>
        {shown.isPending ? <p role="status" className={cn("text-b3", muted)}>Loading overrides…</p>
          : shown.isError ? <ErrorState message="Could not load the overrides." onRetry={() => void shown.refetch()} />
          : <OverrideList overrides={shown.data} names={names} canManage={access.manageTrends} />}
      </Section>
    </div>

    {dialog && <OverrideDialog open onClose={() => setDialog(null)} scopeKey={scopeKey} scopeName={scopeName} existing={current.data ?? []}
      candidates={candidates} initial={dialog} onCreated={(subject) => setPlaced((list) => [...list, subject])} />}
  </div>
}

function JobStatus({ status }: { status?: { lastSuccessAt: string | null; stale: boolean; intervalMinutes: number } }) {
  if (!status) return null
  if (status.stale) {
    return <p className="inline-flex items-center gap-1 text-b3 font-semibold text-warning-700 dark:text-warning-300">
      <TriangleAlert className="size-3.5" aria-hidden="true" />
      {status.lastSuccessAt ? `The trends job is behind: lists last updated ${formatDistanceToNowStrict(new Date(status.lastSuccessAt))} ago.` : "The trends job hasn't run yet."}
    </p>
  }
  return <p className={cn("text-b3", muted)}>
    Lists updated {status.lastSuccessAt ? `${formatDistanceToNowStrict(new Date(status.lastSuccessAt))} ago` : "—"}, every {status.intervalMinutes} min.
  </p>
}
