import { useEffect, useId, useState, type ReactNode } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "../lib/cn"
import { overrideErrorMessage } from "../lib/errors"
import { OVERRIDE_LIMITS } from "../lib/discover"
import { CHOICES, DURATIONS, actionSummary, actionOf, draftEndsAt, draftInput, draftProblems, kindName, type OverrideChoice, type OverrideDraft } from "../lib/overrides"
import { formatNumber, ordinal } from "../lib/values"
import { KIND_LABELS } from "../data/catalog"
import { TREND_KINDS, type TrendKind, type TrendOverride, type TrendSubject } from "../types"
import { useApprovedEvents, useCreateOverride, useHashtagSearch, useInstitutionDirectory, usePeopleSearch, useRecommendationAccess } from "../hooks"
import { focusRing, hairline, ink, kindIcons, muted } from "./tokens"

type Props = {
  open: boolean
  onClose: () => void
  scopeKey: string
  scopeName: string
  /** The list's overrides in force or scheduled, to warn about clashes before sending. */
  existing: TrendOverride[]
  /** Subjects in this list or just missing it, offered first. */
  candidates: TrendSubject[]
  /** Set when opened from a subject's row. */
  initial?: { subject?: TrendSubject; choice?: OverrideChoice }
  onCreated: (subject: TrendSubject) => void
}

const RANKS = Array.from({ length: OVERRIDE_LIMITS.maxRank }, (_, index) => index + 1)

/** Places a subject in one Trending list: pin, feature, boost, dampen or suppress, for up to 30 days. */
export function OverrideDialog({ open, onClose, scopeKey, scopeName, existing, candidates, initial, onCreated }: Props) {
  const create = useCreateOverride()
  const [subject, setSubject] = useState<TrendSubject | null>(initial?.subject ?? null)
  const [choice, setChoice] = useState<OverrideChoice>(initial?.choice ?? "PIN")
  const [rank, setRank] = useState<number | null>(initial?.choice === "FEATURE" ? null : 1)
  const [multiplier, setMultiplier] = useState(initial?.choice === "DAMPEN" ? 0.5 : 1.5)
  const [later, setLater] = useState(false)
  const [startText, setStartText] = useState("")
  const [days, setDays] = useState(7)
  const [reason, setReason] = useState("")
  const reasonId = useId()
  const startId = useId()
  const [now] = useState(() => new Date())

  const pick = (value: OverrideChoice) => {
    setChoice(value)
    // Each starts at its own default place: a pin at 1st, a feature at the server's default.
    if (value === "PIN" && rank === null) setRank(1)
    if (value === "FEATURE" && choice !== "FEATURE") setRank(null)
    if (value === "BOOST" && multiplier <= 1) setMultiplier(1.5)
    if (value === "DAMPEN" && multiplier >= 1) setMultiplier(0.5)
  }

  const startsAt = later && startText ? new Date(startText) : null
  const draft: OverrideDraft = { scopeKey, subject, choice, rank: choice === "PIN" || choice === "FEATURE" ? rank : null, multiplier, reason, startsAt, days }
  const problems = draftProblems(draft, existing, now)
  if (later && (!startText || Number.isNaN(startsAt?.getTime()))) problems.push("Choose when it starts.")
  const endsAt = draftEndsAt(draft, now)
  const summary = subject
    ? `${actionSummary({ action: actionOf(choice), rank: draft.rank, multiplier })}: ${subject.name} in the ${scopeName} list, ${startsAt ? `from ${format(startsAt, "d MMM, HH:mm")}` : "from now"} until ${format(endsAt, "d MMM yyyy, HH:mm")}.`
    : null

  const submit = () => {
    if (problems.length > 0 || !subject) return
    create.mutate(draftInput(draft, new Date()), {
      onSuccess: () => {
        toast.success("Override added", { description: `${subject.name} in ${scopeName}. The app shows it within about 30 seconds.` })
        onCreated(subject)
        onClose()
      },
    })
  }

  return <Dialog open={open} onOpenChange={(next) => { if (!next && !create.isPending) onClose() }}>
    <DialogContent className="max-w-2xl rounded-3xl">
      <div>
        <DialogTitle>Add an override</DialogTitle>
        <DialogDescription className="mt-1">In the {scopeName} list. Counts never change; only where the subject appears.</DialogDescription>
      </div>

      <section aria-label="What to place" className="flex flex-col gap-2">
        <h3 className={cn("text-b2 font-semibold", ink)}>1. What to place</h3>
        {subject
          ? <SelectedSubject subject={subject} onChange={() => setSubject(null)} />
          : <SubjectSearch candidates={candidates} onPick={setSubject} />}
      </section>

      <section aria-label="What to do" className="flex flex-col gap-2">
        <h3 className={cn("text-b2 font-semibold", ink)}>2. What to do</h3>
        <div role="radiogroup" aria-label="Override" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CHOICES.map((option) => <button key={option.value} type="button" role="radio" aria-checked={choice === option.value} onClick={() => pick(option.value)}
            className={cn("cursor-pointer rounded-2xl border p-3 text-left transition-colors", focusRing,
              choice === option.value ? "border-purple bg-purple/5 dark:bg-royal-500/10" : cn(hairline, "hover:border-purple/40"))}>
            <span className={cn("block text-b2 font-semibold", ink)}>{option.label}</span>
            <span className={cn("mt-0.5 block text-b3 leading-5", muted)}>{option.help}</span>
          </button>)}
        </div>
        {(choice === "PIN" || choice === "FEATURE") && <div className="flex flex-wrap items-center gap-2">
          <span className={cn("text-b3 font-semibold", ink)}>{choice === "PIN" ? "Place" : "Place (optional)"}</span>
          <div role="radiogroup" aria-label="Place in the list" className="flex flex-wrap gap-1">
            {choice === "FEATURE" && <RankButton active={rank === null} onClick={() => setRank(null)}>Default ({ordinal(OVERRIDE_LIMITS.defaultFeatureRank)})</RankButton>}
            {RANKS.map((value) => <RankButton key={value} active={rank === value} onClick={() => setRank(value)}>{ordinal(value)}</RankButton>)}
          </div>
        </div>}
        {(choice === "BOOST" || choice === "DAMPEN") && <div>
          <p className={cn("flex items-baseline justify-between gap-3 text-b3 font-semibold", ink)}>
            {choice === "BOOST" ? "Multiply the score by" : "Multiply the score by (less than 1)"}
            <span className="tabular-nums">×{formatNumber(multiplier)}</span>
          </p>
          <input type="range" aria-label="Multiplier" min={choice === "BOOST" ? 1.1 : OVERRIDE_LIMITS.minMultiplier} max={choice === "BOOST" ? OVERRIDE_LIMITS.maxMultiplier : 0.95}
            step={0.05} value={multiplier} onChange={(event) => setMultiplier(Number(event.target.value))} aria-valuetext={`×${multiplier}`} className="mt-1.5 h-2 w-full cursor-pointer accent-purple" />
        </div>}
      </section>

      <section aria-label="When and why" className="flex flex-col gap-3">
        <h3 className={cn("text-b2 font-semibold", ink)}>3. When and why</h3>
        <div className="flex flex-wrap items-center gap-2">
          <div role="radiogroup" aria-label="Starts" className="flex gap-1 rounded-3xl bg-grey-50 p-1 dark:bg-background">
            <RankButton active={!later} onClick={() => setLater(false)}>Start now</RankButton>
            <RankButton active={later} onClick={() => setLater(true)}>Start later</RankButton>
          </div>
          {later && <><label htmlFor={startId} className="sr-only">Starts at</label>
            <Input id={startId} type="datetime-local" value={startText} onChange={(event) => setStartText(event.target.value)} className="h-9 w-auto rounded-lg" /></>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("text-b3 font-semibold", ink)}>Lasts</span>
          <div role="radiogroup" aria-label="Lasts" className="flex flex-wrap gap-1">
            {DURATIONS.map((value) => <RankButton key={value} active={days === value} onClick={() => setDays(value)}>{value} {value === 1 ? "day" : "days"}</RankButton>)}
          </div>
        </div>
        <div>
          <label htmlFor={reasonId} className={cn("text-b3 font-semibold", ink)}>Why <span className={cn("font-normal", muted)}>(shown in the overrides list and the audit log)</span></label>
          <Textarea id={reasonId} value={reason} maxLength={500} rows={2} onChange={(event) => setReason(event.target.value)} placeholder="For example: launch week for the campus food fair" className="mt-1 min-h-16 rounded-xl" />
        </div>
      </section>

      {summary && <p data-testid="override-summary" className={cn("rounded-2xl bg-grey-50 p-3 text-b3 leading-5 dark:bg-background/70", ink)}>{summary}</p>}
      {problems.length > 0 && <ul aria-label="Still needed" className="flex list-disc flex-col gap-0.5 pl-5 text-b3 text-warning-700 dark:text-warning-300">
        {problems.map((problem) => <li key={problem}>{problem}</li>)}
      </ul>}
      {create.isError && <p role="alert" className="text-b3 text-destructive">{overrideErrorMessage(create.error)}</p>}

      <div className="flex justify-end gap-2">
        <DialogClose asChild><Button type="button" variant="outline" className="h-10 cursor-pointer rounded-full px-4" disabled={create.isPending}>Cancel</Button></DialogClose>
        <Button type="button" className="h-10 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] px-5 text-white hover:opacity-90" disabled={problems.length > 0 || create.isPending} onClick={submit}>
          {create.isPending ? "Saving…" : "Add override"}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
}

function RankButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" role="radio" aria-checked={active} onClick={onClick}
    className={cn("min-h-8 cursor-pointer whitespace-nowrap rounded-full px-3 text-b3 font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-purple",
      active ? "bg-purple text-white" : "bg-grey-50 text-grey-600 hover:text-grey-1000 dark:bg-background dark:text-muted-foreground dark:hover:text-foreground")}>
    {children}
  </button>
}

function SelectedSubject({ subject, onChange }: { subject: TrendSubject; onChange: () => void }) {
  const Icon = kindIcons[subject.kind]
  return <div className={cn("flex items-center justify-between gap-3 rounded-2xl border p-3", hairline)}>
    <span className="flex min-w-0 items-center gap-2">
      <Icon className={cn("size-4 shrink-0", muted)} aria-hidden="true" />
      <span className={cn("min-w-0 truncate text-b2 font-semibold", ink)} data-testid="override-subject">{subject.name}</span>
      <span className={cn("text-b3", muted)}>{KIND_LABELS[subject.kind].one}</span>
    </span>
    <Button type="button" variant="outline" size="sm" className="h-8 cursor-pointer rounded-full" onClick={onChange}>Change</Button>
  </div>
}

/** Find a subject of any of the six kinds: from this list first, then by search. */
function SubjectSearch({ candidates, onPick }: { candidates: TrendSubject[]; onPick: (subject: TrendSubject) => void }) {
  const access = useRecommendationAccess()
  const [kind, setKind] = useState<TrendKind>("HASHTAG")
  const [query, setQuery] = useState("")
  const [term, setTerm] = useState("")
  const searchId = useId()
  // Search as the admin types, without a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setTerm(query), 250)
    return () => clearTimeout(timer)
  }, [query])

  const words = term.trim().toLowerCase().replace(/^#/, "")
  const matches = (name: string) => !words || name.toLowerCase().replace(/^#/, "").includes(words)
  const directory = useInstitutionDirectory(access.institutions && (kind === "INSTITUTION" || kind === "CAMPUS" || kind === "HALL"))
  const hashtags = useHashtagSearch(term, access.discover && kind === "HASHTAG")
  const people = usePeopleSearch(term, access.people && kind === "PERSON")
  const events = useApprovedEvents(access.discover && kind === "EVENT")

  let found: TrendSubject[] = []
  let note: string | null = null
  let loading = false
  if (kind === "HASHTAG") {
    found = (hashtags.data ?? []).map((tag) => ({ kind, id: tag.id, name: `#${tag.displayName ?? tag.name}` }))
    loading = hashtags.isFetching
    if (!words) note = "Type a hashtag to search."
  } else if (kind === "INSTITUTION" || kind === "CAMPUS" || kind === "HALL") {
    if (!access.institutions) note = `Finding a ${kindName(kind)} needs institutions.read; pick one from the list above instead.`
    loading = directory.isFetching
    for (const institution of directory.data ?? []) {
      if (!institution.isActive) continue
      if (kind === "INSTITUTION") found.push({ kind, id: institution.id, name: institution.shortName })
      for (const campus of institution.campuses) {
        if (kind === "CAMPUS") found.push({ kind, id: campus.id, name: `${institution.shortName} ${campus.name}` })
        if (kind === "HALL") for (const hall of campus.halls) if (hall.isActive) found.push({ kind, id: hall.id, name: `${hall.name} (${institution.shortName})` })
      }
    }
    found = found.filter((subject) => matches(subject.name) || (kind === "INSTITUTION" && matches(directory.data?.find((item) => item.id === subject.id)?.name ?? "")))
  } else if (kind === "PERSON") {
    if (!access.people) note = "Finding a person needs platform.users.read; pick one from the list above instead."
    else if (words.length < 2) note = "Type at least 2 letters of a name or username."
    found = (people.data ?? []).filter((person) => person.isActive !== false)
      .map((person) => ({ kind, id: person.id, name: person.userProfile?.fullName ?? (person.userProfile?.username ? `@${person.userProfile.username}` : person.id.slice(0, 8)) }))
    loading = people.isFetching
  } else {
    // Approved, and not more than a day past their end: the events that may trend.
    const since = Date.now() - 24 * 60 * 60 * 1000
    found = (events.data ?? []).filter((event) => new Date(event.endsAt).getTime() > since && matches(event.title))
      .map((event) => ({ kind, id: event.id, name: event.title }))
    loading = events.isFetching
  }

  const fromList = candidates.filter((subject) => subject.kind === kind && matches(subject.name))
  const seen = new Set(fromList.map((subject) => subject.id))
  const results = [...fromList, ...found.filter((subject) => !seen.has(subject.id))].slice(0, 12)

  return <div className="flex flex-col gap-2">
    <div role="radiogroup" aria-label="Kind" className="flex flex-wrap gap-1">
      {TREND_KINDS.map((value) => {
        const Icon = kindIcons[value]
        return <button key={value} type="button" role="radio" aria-checked={kind === value} onClick={() => setKind(value)}
          className={cn("inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-b3 font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-purple",
            kind === value ? "bg-purple text-white" : "bg-grey-50 text-grey-600 hover:text-grey-1000 dark:bg-background dark:text-muted-foreground dark:hover:text-foreground")}>
          <Icon className="size-3.5" aria-hidden="true" />{KIND_LABELS[value].one}
        </button>
      })}
    </div>
    <div className="relative">
      <label htmlFor={searchId} className="sr-only">Search {KIND_LABELS[kind].many.toLowerCase()}</label>
      <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-grey-400" />
      <Input id={searchId} type="search" value={query} onChange={(event) => setQuery(event.target.value)} autoComplete="off" maxLength={50}
        placeholder={kind === "HASHTAG" ? "Search hashtags, e.g. #ugexams" : `Search ${KIND_LABELS[kind].many.toLowerCase()}`} className="h-10 rounded-full pl-9" />
    </div>
    <div aria-busy={loading} className={cn("max-h-56 overflow-y-auto rounded-2xl border", hairline)}>
      {results.length === 0
        ? <p className={cn("p-3 text-b3", muted)}>{note ?? (loading ? "Searching…" : `No ${KIND_LABELS[kind].many.toLowerCase()} match.`)}</p>
        : <ul aria-label="Results">{results.map((subject) => {
          const Icon = kindIcons[subject.kind]
          const inList = seen.has(subject.id)
          return <li key={`${subject.kind}:${subject.id}`} className={cn("border-b last:border-0", hairline)}>
            <button type="button" onClick={() => onPick(subject)} aria-label={`Choose ${subject.name}`}
              className={cn("flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left hover:bg-purple/5 dark:hover:bg-royal-500/10", focusRing)}>
              <Icon className={cn("size-4 shrink-0", muted)} aria-hidden="true" />
              <span className={cn("min-w-0 flex-1 truncate text-b2", ink)}>{subject.name}</span>
              {inList && <span className={cn("text-b4", muted)}>In or near this list</span>}
            </button>
          </li>
        })}</ul>}
    </div>
    {note && results.length > 0 && <p className={cn("text-b4", muted)}>{note}</p>}
  </div>
}
