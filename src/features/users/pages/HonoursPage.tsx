import { useState } from "react"
import { Link } from "react-router-dom"
import { Award, CheckCircle2, CircleSlash, Info, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useHonourNominee, useHonourNominees, useUserAccess } from "../hooks"
import { usersErrorMessage } from "../lib/errors"
import { formatDate, formatRelative } from "../lib/format"
import { describeCheck as describe, unmetRules } from "../lib/honours"
import { userProfilePath } from "../lib/paths"
import { USER_PERMISSIONS, honourCheckLabels, type HonourCandidate } from "../types"
import { UserAvatar, pill } from "../components/UserBadges"
import { EmptyState, ErrorState, NoAccess, RowsSkeleton, ink, muted, surface } from "../components/Surface"
import { HonourDecisionDialog } from "../components/HonourDecisionDialog"

const PAGE_SIZE = 25
const FIRST_YEAR = 2026

type Decision = { candidate: HonourCandidate; decision: "grant" | "decline" }

const nameOf = (candidate: Pick<HonourCandidate, "fullName" | "username">) => candidate.fullName || (candidate.username ? `@${candidate.username}` : "Unnamed user")


export function HonoursPage() {
  const can = useUserAccess()
  const allowed = can(USER_PERMISSIONS.honoursReview)
  const thisYear = new Date().getUTCFullYear()
  const [year, setYear] = useState(thisYear)
  const [page, setPage] = useState(1)
  const [openId, setOpenId] = useState<string | null>(null)
  const [decision, setDecision] = useState<Decision | null>(null)
  const nominees = useHonourNominees({ year, page, limit: PAGE_SIZE }, allowed)
  // Decisions are always for the current year: the API records them against today.
  const decidable = year === thisYear

  if (!allowed) return <NoAccess permission={USER_PERMISSIONS.honoursReview} what="honour reviews" />

  const rules = nominees.data?.rules
  const years = Array.from({ length: Math.max(1, thisYear - FIRST_YEAR + 1) }, (_, index) => thisYear - index)

  return <div className="flex min-w-0 flex-col gap-4 px-4 sm:px-6">
    <section aria-label="About Gye Nyame" className={cn(surface, "flex flex-col gap-3 p-5 md:flex-row md:items-start md:justify-between")}>
      <div className="flex min-w-0 gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-warning-500/10 text-warning-700 dark:text-warning-300"><Award className="size-5" aria-hidden="true" /></span>
        <div className="min-w-0">
          <h2 className={cn("font-heading text-b1 font-semibold", ink)}>Gye Nyame review</h2>
          <p className={cn("text-b3", muted)}>
            The earned honour. Never sold, renewed yearly.
            {rules && ` Needs ${rules.nominationsRequired} nominations from at least ${rules.campusesRequired} campuses, a year on AdBox, a verified badge, good standing and real contribution. At most 1 per ${rules.campusCapPer} active people per school each year.`}
          </p>
        </div>
      </div>
      <Select value={String(year)} onValueChange={(value) => { setYear(Number(value)); setPage(1) }}>
        <SelectTrigger aria-label="Nomination year" className="h-10 w-full shrink-0 cursor-pointer rounded-full md:w-[130px]"><SelectValue /></SelectTrigger>
        <SelectContent>{years.map((value) => <SelectItem key={value} value={String(value)}>{value}</SelectItem>)}</SelectContent>
      </Select>
    </section>

    <article aria-label="Nominees" className={cn(surface, "overflow-hidden")}>
      {nominees.isPending && <RowsSkeleton label="Loading nominees" />}
      {nominees.isError && <ErrorState message={usersErrorMessage(nominees.error, "Could not load nominees.")} onRetry={() => void nominees.refetch()} />}
      {nominees.data && <>
        <ul className={cn("divide-y divide-grey-200 dark:divide-border", nominees.isPlaceholderData && "opacity-60")} aria-busy={nominees.isFetching}>
          {nominees.data.items.map((candidate) => {
            const unmet = unmetRules(candidate)
            const name = nameOf(candidate)
            return <li key={candidate.userId} className="grid grid-cols-1 gap-4 px-4 py-4 sm:px-6 lg:grid-cols-12 lg:items-center">
              <div className="flex min-w-0 items-center gap-3 lg:col-span-3">
                <UserAvatar name={name} image={candidate.image} />
                <div className="min-w-0">
                  <button type="button" onClick={() => setOpenId(candidate.userId)} className={cn("block max-w-full cursor-pointer truncate text-left text-b2 font-semibold hover:text-purple", ink)}>{name}</button>
                  <p className={cn("truncate text-b4", muted)}>{[candidate.username && `@${candidate.username}`, candidate.institution].filter(Boolean).join(" · ") || "No institution"}</p>
                </div>
              </div>
              <div className="flex gap-6 text-b3 tabular-nums lg:col-span-2">
                <p><span className={cn("block text-b1 font-semibold", ink)}>{candidate.nominations}{rules && <span className={cn("text-b3 font-normal", muted)}>/{rules.nominationsRequired}</span>}</span><span className={muted}>nominations</span></p>
                <p><span className={cn("block text-b1 font-semibold", ink)}>{candidate.campuses}{rules && <span className={cn("text-b3 font-normal", muted)}>/{rules.campusesRequired}</span>}</span><span className={muted}>campuses</span></p>
              </div>
              <ul aria-label="Eligibility checks" className="flex flex-wrap gap-1.5 lg:col-span-4">
                {candidate.eligibility.checks.map((check) => <li key={check.key} title={describe(check.detail) ?? undefined}
                  className={cn(pill, check.met ? "bg-success-500/10 text-success-700 dark:text-success-300" : "bg-destructive/10 text-destructive")}>
                  {check.met ? <CheckCircle2 className="size-3.5" aria-hidden="true" /> : <XCircle className="size-3.5" aria-hidden="true" />}
                  {honourCheckLabels[check.key] ?? check.key}<span className="sr-only">{check.met ? " met" : " not met"}</span>
                </li>)}
                {candidate.campusCap && <li className={cn(pill, candidate.campusCap.granted >= candidate.campusCap.limit ? "bg-destructive/10 text-destructive" : "bg-grey-100 text-grey-600 dark:bg-muted dark:text-muted-foreground")}>
                  Campus cap {candidate.campusCap.granted}/{candidate.campusCap.limit}
                </li>}
              </ul>
              <div className="flex flex-wrap items-center gap-2 lg:col-span-3 lg:justify-end">
                {candidate.currentHonour ? <span className={cn(pill, "bg-warning-500/10 text-warning-700 dark:text-warning-300")}><Award className="size-3.5" aria-hidden="true" />Holds the honour</span>
                  : candidate.decision ? <span className={cn(pill, candidate.decision.outcome === "GRANTED" ? "bg-success-500/10 text-success-700 dark:text-success-300" : "bg-grey-100 text-grey-600 dark:bg-muted dark:text-muted-foreground")}>
                    {candidate.decision.outcome === "GRANTED" ? "Granted" : "Declined"} {formatRelative(candidate.decision.createdAt)}
                  </span> : null}
                {decidable && !candidate.currentHonour && <>
                  {candidate.decision?.outcome !== "DECLINED" && <Button type="button" size="sm" variant="outline" className="h-9 cursor-pointer rounded-full px-3" onClick={() => setDecision({ candidate, decision: "decline" })}>
                    <CircleSlash className="size-4" aria-hidden="true" />Decline
                  </Button>}
                  <Button type="button" size="sm" className="h-9 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] px-3 text-white hover:opacity-90" onClick={() => setDecision({ candidate, decision: "grant" })}
                    title={unmet.length ? `Unmet: ${unmet.join(", ")}` : undefined}>
                    <Award className="size-4" aria-hidden="true" />{unmet.length ? "Override…" : "Grant"}
                  </Button>
                </>}
              </div>
            </li>
          })}
        </ul>
        {nominees.data.items.length === 0 && <EmptyState icon={Award} title={`No nominations in ${year}`}>Verified members nominate people from their profiles in the app.</EmptyState>}
        {nominees.data.total > 0 && <Pagination page={page} limit={PAGE_SIZE} total={nominees.data.total} noun="nominees" onPageChange={setPage} />}
      </>}
    </article>

    <NomineeSheet userId={openId} onClose={() => setOpenId(null)} />
    {decision && <HonourDecisionDialog userId={decision.candidate.userId} name={nameOf(decision.candidate)} decision={decision.decision}
      rulesMet={unmetRules(decision.candidate).length === 0} onClose={() => setDecision(null)} />}
  </div>
}

function NomineeSheet({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const nominee = useHonourNominee(userId)
  const data = nominee.data
  return <Sheet open={Boolean(userId)} onOpenChange={(open) => { if (!open) onClose() }}>
    <SheetContent side="right" closeLabel="Close nominee" className="w-[min(32rem,100vw)] gap-0 overflow-y-auto p-0">
      {!data ? <>
        <SheetTitle className="sr-only">Nominee</SheetTitle>
        <SheetDescription className="sr-only">Nominations and reasons</SheetDescription>
        {nominee.isError ? <div className="pt-12"><ErrorState message={usersErrorMessage(nominee.error, "Could not load this nominee.")} onRetry={() => void nominee.refetch()} /></div> : <RowsSkeleton label="Loading nominee" />}
      </> : <div className="flex flex-col gap-5 p-6 pt-12">
        <div className="flex items-center gap-3">
          <UserAvatar name={nameOf(data)} image={data.image} size="lg" />
          <div className="min-w-0">
            <SheetTitle className="truncate">{nameOf(data)}</SheetTitle>
            <SheetDescription>{data.nominations.length} nominations from {data.campuses} campus{data.campuses === 1 ? "" : "es"}</SheetDescription>
            <Link to={userProfilePath(data.userId)} className="text-b3 font-semibold text-blue hover:underline dark:text-cyan">Open full profile</Link>
          </div>
        </div>
        <section aria-label="Eligibility">
          <h3 className={cn("mb-2 text-b2 font-semibold", ink)}>Eligibility</h3>
          <ul className="flex flex-col gap-2">
            {data.eligibility.checks.map((check) => <li key={check.key} className="flex items-start gap-2 text-b3">
              {check.met ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-600" aria-hidden="true" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />}
              <span><span className={cn("font-semibold", ink)}>{honourCheckLabels[check.key] ?? check.key}</span> <span className="sr-only">{check.met ? "met" : "not met"}</span>
                {describe(check.detail) && <span className={cn("block text-b4", muted)}>{describe(check.detail)}</span>}</span>
            </li>)}
            <li className="flex items-start gap-2 text-b3">
              <Info className="mt-0.5 size-4 shrink-0 text-grey-400" aria-hidden="true" />
              <span><span className={cn("font-semibold", ink)}>Upheld reports in 12 months:</span> {data.eligibility.upheldReports} <span className={cn("block text-b4", muted)}>Visible to reviewers only.</span></span>
            </li>
          </ul>
        </section>
        <section aria-label="Nominations">
          <h3 className={cn("mb-2 text-b2 font-semibold", ink)}>Nominations</h3>
          {data.nominations.length === 0 ? <p className={cn("text-b3", muted)}>None this year.</p> : <ul className="divide-y divide-grey-100 rounded-2xl border border-grey-200 dark:divide-border dark:border-border">
            {data.nominations.map((nomination) => <li key={nomination.nominatorId} className="px-4 py-3 text-b3">
              <p className="flex items-center justify-between gap-2">
                <Link to={userProfilePath(nomination.nominatorId)} className={cn("truncate font-semibold hover:text-purple", ink)}>{nameOf(nomination)}</Link>
                <span className={cn("shrink-0 text-b4", muted)}>{formatDate(nomination.createdAt)}</span>
              </p>
              {nomination.reason ? <p className={cn("mt-1 whitespace-pre-line", muted)}>“{nomination.reason}”</p> : <p className={cn("mt-1 italic text-b4", muted)}>No reason given</p>}
            </li>)}
          </ul>}
        </section>
      </div>}
    </SheetContent>
  </Sheet>
}
