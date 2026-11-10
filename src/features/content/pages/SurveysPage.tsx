import { useCallback, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { CircleCheck, CirclePause, ClipboardList, Link2, ListChecks, PauseCircle, PlayCircle, Timer } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { cn } from "../lib/cn"
import { useContentAccess, useContentScope, useListParams, useSearchInput, useSetSurveyActive, useUserSurveys } from "../hooks"
import { contentErrorMessage } from "../lib/errors"
import { compactNumber, formatDate, formatRelative } from "../lib/format"
import { postPath } from "../lib/paths"
import { CONTENT_PERMISSIONS, type UserSurvey } from "../types"
import { EmptyState, ErrorState, FilterChips, PageIntro, Pill, SearchBox, Toolbar, UploaderChip, focusRing, ink, muted, skeleton, surface } from "../components/ContentBits"
import { ReasonDialog } from "../components/ReasonDialog"

const PAGE_SIZE = 18
const defaults = { status: "all", q: "" }
const grid = "grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3"

export function SurveysPage() {
  const { can } = useContentAccess()
  const { userId, scopeTo } = useContentScope()
  const { values, page, update } = useListParams(defaults)
  const commitSearch = useCallback((q: string) => update({ q }), [update])
  const [search, setSearch] = useSearchInput(values.q, commitSearch)
  const [target, setTarget] = useState<UserSurvey | null>(null)
  const [error, setError] = useState("")
  const toggle = useSetSurveyActive()
  const status = values.status === "active" || values.status === "inactive" ? values.status : undefined
  const surveys = useUserSurveys({ userId, search: values.q || undefined, status, page, limit: PAGE_SIZE })
  const canModerate = can(CONTENT_PERMISSIONS.moderate)
  const filtered = Boolean(values.q || status)

  return <div className="flex min-w-0 flex-col gap-4 px-4 sm:px-6">
    <PageIntro>Surveys people run, usually on one of their posts. Deactivate one to stop it collecting responses.</PageIntro>
    <Toolbar>
      <SearchBox value={search} onChange={setSearch} label="Search surveys by title or uploader" />
      <FilterChips label="Survey status" value={status ?? "all"} onChange={(next) => update({ ...values, status: next })}
        options={[{ value: "all", label: "All surveys", icon: ClipboardList }, { value: "active", label: "Collecting", icon: CircleCheck }, { value: "inactive", label: "Stopped", icon: CirclePause }]} />
    </Toolbar>

    {surveys.isPending && <SurveysSkeleton />}
    {surveys.isError && <div className={surface}><ErrorState message={contentErrorMessage(surveys.error, "Could not load surveys.")} onRetry={() => void surveys.refetch()} /></div>}
    {surveys.data && (surveys.data.items.length === 0
      ? <div className={surface}><EmptyState icon={ClipboardList} title={filtered ? "No surveys match these filters" : "No surveys yet"}>{filtered ? "Try another status or search." : "Surveys people attach to their posts appear here."}</EmptyState></div>
      : <div className={cn("flex flex-col gap-4 transition-opacity", surveys.isPlaceholderData && "opacity-60")} aria-busy={surveys.isPlaceholderData}>
        <ul aria-label="Surveys" className={grid}>
          {surveys.data.items.map((survey) => <SurveyCard key={survey.id} survey={survey} uploaderTo={userId ? undefined : scopeTo(survey.user.id)}
            onToggle={canModerate ? () => { setError(""); setTarget(survey) } : undefined} />)}
        </ul>
        <div className={cn(surface, "overflow-hidden [&>nav]:border-t-0")}>
          <Pagination page={page} limit={PAGE_SIZE} total={surveys.data.total} noun="surveys" onPageChange={(next) => { update({ ...values, page: next }); window.scrollTo({ top: 0, behavior: "smooth" }) }} />
        </div>
      </div>)}

    {target && <ReasonDialog
      title={target.isActive ? `Stop “${target.title}”?` : `Reopen “${target.title}”?`}
      description={target.isActive
        ? "The survey stops accepting responses and leaves the surveys feed. Responses already given are kept."
        : "The survey shows again and accepts new responses."}
      confirmLabel={target.isActive ? "Deactivate survey" : "Reactivate survey"}
      destructive={target.isActive}
      askReason
      icon={target.isActive ? <PauseCircle className="size-7 text-destructive" aria-hidden="true" /> : <PlayCircle className="size-7 text-secondary" aria-hidden="true" />}
      pending={toggle.isPending}
      error={error}
      onClose={() => setTarget(null)}
      onConfirm={(input) => toggle.mutate({ surveyId: target.id, active: !target.isActive, input }, {
        onSuccess: () => { toast.success(target.isActive ? "Survey deactivated" : "Survey reactivated"); setTarget(null) },
        onError: (cause) => setError(contentErrorMessage(cause, "Could not update the survey. Try again.")),
      })}
    />}
  </div>
}

function SurveyCard({ survey, uploaderTo, onToggle }: { survey: UserSurvey; uploaderTo?: string; onToggle?: () => void }) {
  return <li className={cn(surface, "flex min-w-0 flex-col p-5", !survey.isActive && "bg-grey-50/60 dark:bg-card/70")}>
    <div className="flex items-start gap-4">
      {survey.coverImageUrl
        ? <img src={survey.coverImageUrl} alt="" loading="lazy" className="size-14 shrink-0 rounded-2xl object-cover" />
        : <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[image:var(--gradient-blue)] text-white"><ClipboardList className="size-6" aria-hidden="true" /></span>}
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          <Pill tone={survey.isActive ? "success" : "neutral"}>{survey.isActive ? <CircleCheck className="size-3" aria-hidden="true" /> : <CirclePause className="size-3" aria-hidden="true" />}{survey.isActive ? "Collecting responses" : "Stopped"}</Pill>
          {survey.post.removed && <Pill tone="danger">Post deleted</Pill>}
        </div>
        <h3 className={cn("line-clamp-2 text-b1 font-semibold leading-snug", ink)}>{survey.title}</h3>
        {survey.description && <p className={cn("mt-0.5 line-clamp-2 text-b3 leading-5", muted)}>{survey.description}</p>}
      </div>
    </div>

    <dl className="mt-4 grid grid-cols-3 gap-2">
      <Stat label="Responses" value={compactNumber(survey.responseCount)} strong />
      <Stat label="Questions" value={String(survey.questionCount)} icon={<ListChecks className="size-3.5" aria-hidden="true" />} />
      <Stat label="To complete" value={survey.estimatedMinutes ? `~${survey.estimatedMinutes} min` : "—"} icon={<Timer className="size-3.5" aria-hidden="true" />} />
    </dl>

    {!survey.post.removed && <Link to={postPath(survey.post.id)} className={cn("mt-3 flex min-w-0 items-center gap-1.5 rounded-full text-b3 font-semibold text-purple hover:underline", focusRing)}>
      <Link2 className="size-3.5 shrink-0" aria-hidden="true" /><span className="truncate">On “{survey.post.title || "Untitled post"}”</span>
    </Link>}

    <div className="mt-4 flex items-center justify-between gap-3 border-t border-grey-100 pt-4 dark:border-border">
      <div className="min-w-0">
        <UploaderChip user={survey.user} to={uploaderTo} size="xs" />
        <p className={cn("mt-1 text-b3", muted)} title={formatDate(survey.createdAt) ?? undefined}>Created {formatRelative(survey.createdAt)}</p>
      </div>
      {onToggle && <Button type="button" size="sm" variant="outline" className="h-9 shrink-0 cursor-pointer rounded-full px-3.5" onClick={onToggle}>
        {survey.isActive ? <PauseCircle className="size-4" aria-hidden="true" /> : <PlayCircle className="size-4" aria-hidden="true" />}
        {survey.isActive ? "Deactivate" : "Reactivate"}
      </Button>}
    </div>
  </li>
}

function Stat({ label, value, icon, strong }: { label: string; value: string; icon?: ReactNode; strong?: boolean }) {
  return <div className={cn("rounded-xl px-3 py-2.5", strong ? "bg-purple/10" : "bg-grey-50 dark:bg-background")}>
    <dt className={cn("flex items-center gap-1 text-b3", strong ? "text-purple" : muted)}>{icon}{label}</dt>
    <dd className={cn("mt-1 truncate font-bold tabular-nums", strong ? "text-h6 text-purple" : cn("text-b2", ink))}>{value}</dd>
  </div>
}

function SurveysSkeleton() {
  return <ul role="status" aria-label="Loading surveys" className={grid}>
    {Array.from({ length: 4 }, (_, index) => <li key={index} className={cn(surface, "space-y-4 p-5")}>
      <div className="flex gap-4"><span className="size-14 animate-pulse rounded-2xl bg-grey-100 dark:bg-muted" /><div className="flex-1 space-y-2"><span className={cn(skeleton, "block h-3 w-24")} /><span className={cn(skeleton, "block h-4 w-3/4")} /></div></div>
      <span className="block h-14 animate-pulse rounded-xl bg-grey-100 dark:bg-muted" />
    </li>)}
  </ul>
}
