import { useId, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { format, formatDistanceToNowStrict } from "date-fns"
import { toast } from "sonner"
import { Activity, ArrowRight, CircleCheck, CircleX, Copy, Database, ExternalLink, Minus, Pin, Scale, Smartphone, Sparkles, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react"
import { APP_ROUTES } from "@/routes/paths"
import { KIND_LABELS } from "../data/catalog"
import { cn } from "../lib/cn"
import { loadErrorDetail } from "../lib/errors"
import { actionSummary, kindName } from "../lib/overrides"
import { APP_FLAME_RANKS, appRank, changeWords, placement, qualifyingRules, scoreProduct, subjectFacts, windowWords, type TopTrend } from "../lib/top-trends"
import { formatNumber, formatScore } from "../lib/values"
import type { AppTrend, AppTrendList, DiscoverPolicy } from "../types"
import { Facts, Formula, Op, Term } from "./PageParts"
import { ErrorState } from "./Surface"
import { Flame } from "./Flame"
import { AppTrendRow, Thumbnail } from "./TopTrendList"
import { focusRing, hairline, ink, kindIcons, muted, pill, tones } from "./tokens"

type Props = {
  trend: TopTrend
  list: AppTrendList
  scopeKey: string
  scopeName: string
  /** The Discover settings in force, for the rules and the formula. */
  policy: DiscoverPolicy
  /** The trends report: the scores. The list itself is shown without it. */
  scores: { pending: boolean; error: unknown; retry: () => void }
  canManage: boolean
}

/** Everything about one trend: how the app shows it, its activity, why it ranks there, any override, and the subject. */
export function TrendInspector({ trend, list, scopeKey, scopeName, policy, scores, canManage }: Props) {
  const { item, computed, override } = trend
  const headingId = useId()
  const KindIcon = kindIcons[item.kind]
  const description = item.presentation?.description
  const overridesHref = `${APP_ROUTES.recommendationsOverrides}?list=${encodeURIComponent(scopeKey)}`

  return <section aria-labelledby={headingId} data-testid="trend-details" className="flex min-w-0 flex-col gap-5">
    <div className="flex items-start gap-4">
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1">
          <span className={cn("font-heading text-h4 font-bold tracking-tight tabular-nums", ink)}>{appRank(item.rank)}</span>
          <Flame rank={item.rank} className="h-8 w-7" />
          <span className="sr-only">{`Number ${item.rank} in ${scopeName}`}</span>
        </p>
        <h3 id={headingId} className={cn("mt-1 break-words font-heading text-h5 font-semibold leading-7", ink)}>{item.title}</h3>
        <p className="mt-2 flex flex-wrap gap-1.5">
          <span className={cn(pill, tones.grey)}><KindIcon className="size-3" aria-hidden="true" />{KIND_LABELS[item.kind].one}</span>
          {item.category && <span className={cn(pill, tones.grey)}>{item.category.label}</span>}
          {item.featured && <span className={cn(pill, tones.purple)}><Sparkles className="size-3" aria-hidden="true" />Featured</span>}
          {override && <span className={cn(pill, tones.purple)}><Pin className="size-3" aria-hidden="true" />{actionSummary(override)}</span>}
          <DirectionPill item={item} />
        </p>
      </div>
      <Thumbnail item={item} size="lg" />
    </div>
    {description && <p className={cn("-mt-1 text-b3 leading-5 md:text-b2 md:leading-6", muted)}>{description}</p>}

    <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
      <Card icon={Smartphone} title="In the app">
        <div className="rounded-2xl bg-grey-50 p-2 dark:bg-background/70">
          <div className="flex items-center gap-3 rounded-xl bg-white px-2 py-3 shadow-adbox-small dark:bg-card"><AppTrendRow item={item} /></div>
        </div>
        <p className={cn("mt-2 text-b3 leading-5", muted)}>
          {item.rank <= APP_FLAME_RANKS ? `In the top ${APP_FLAME_RANKS}, so the app burns a flame beside it.` : `The app burns a flame beside the top ${APP_FLAME_RANKS} only.`}
          {item.featured ? " Featured because an admin pinned or featured it." : ""}
        </p>
        {item.presentation && <Facts className="mt-2 md:grid-cols-1" items={[
          { label: "Poster kicker", value: item.presentation.kicker },
          { label: "Poster headline", value: item.presentation.headline },
          ...(item.presentation.support ? [{ label: "Poster line", value: item.presentation.support }] : []),
          ...(item.presentation.sticker.length > 0 ? [{ label: "Stickers", value: item.presentation.sticker.join(" · ") }] : []),
        ]} />}
      </Card>

      <Card icon={Activity} title="Activity">
        <ActivityFacts trend={trend} />
      </Card>

      <Card icon={Scale} title="Why it's here" className="lg:col-span-2">
        <p className={cn("text-b3 leading-5 md:text-b2 md:leading-6", ink)} data-testid="trend-placement">{placement(trend, list.source)}</p>
        {scores.pending && list.source !== "fallback" ? <p role="status" className={cn("mt-3 text-b3", muted)}>Loading its score…</p>
          : scores.error ? <div className="mt-2"><ErrorState message="Couldn't load the scores." onRetry={scores.retry} /><p className={cn("px-5 text-b3", muted)}>{loadErrorDetail(scores.error)}</p></div>
          : <Score trend={trend} level={list.scope.level} policy={policy} policyVersion={list.policyVersion} />}
      </Card>

      <Card icon={Pin} title="Admin override">
        {override ? <div className="flex flex-col gap-2">
          <span className={cn(pill, tones.purple)}>{actionSummary(override)}</span>
          <p className={cn("text-b2", ink)}>“{override.reason}”</p>
          <Facts className="md:grid-cols-1" items={[
            { label: "Since", value: format(new Date(override.startsAt), "d MMM yyyy, HH:mm") },
            { label: "Until", value: `${format(new Date(override.endsAt), "d MMM yyyy, HH:mm")} (in ${formatDistanceToNowStrict(new Date(override.endsAt))})` },
          ]} />
        </div> : <p className={cn("text-b3 leading-5 md:text-b2 md:leading-6", muted)}>None. No admin has moved it in this list.</p>}
        <InlineLink to={overridesHref} icon={ArrowRight}>{canManage ? "Change it in Trending overrides" : "See Trending overrides"}</InlineLink>
      </Card>

      <Card icon={KindIcon} title={`About this ${kindName(item.kind)}`}>
        <Facts className="md:grid-cols-1" items={item.subject ? subjectFacts(item.subject)
          : [{ label: KIND_LABELS[item.kind].one, value: item.title }, { label: "Category", value: item.category?.label ?? "None" }]} />
        <SubjectLinks item={item} topPostId={computed?.topPostId ?? null} />
      </Card>

      <Card icon={Database} title="Record" className="lg:col-span-2">
        <Facts className="md:grid-cols-1" items={[
          { label: "Kind", value: KIND_LABELS[item.kind].one },
          { label: "ID", value: <CopyText value={item.id} /> },
          { label: "List", value: `${scopeName} · ${scopeKey}` },
          { label: "List source", value: SOURCES[list.source] },
          { label: "List computed", value: list.computedAt ? `${format(new Date(list.computedAt), "d MMM yyyy, HH:mm")} (${formatDistanceToNowStrict(new Date(list.computedAt))} ago)` : "Not yet" },
          { label: "Settings version", value: list.policyVersion ?? "—" },
        ]} />
      </Card>
    </div>
  </section>
}

const SOURCES: Record<AppTrendList["source"], string> = {
  snapshot: "Computed by the trends job",
  institution: "Its institution's list",
  fallback: "Fallback: no list computed yet",
}

function Card({ icon: Icon, title, className, children }: { icon: LucideIcon; title: string; className?: string; children: ReactNode }) {
  const id = useId()
  return <section aria-labelledby={id} className={cn("min-w-0 rounded-2xl border p-4", hairline, className)}>
    <h4 id={id} className={cn("mb-3 flex items-center gap-2 text-b2 font-semibold", ink)}>
      <Icon className="size-4 shrink-0 text-purple dark:text-royal-300" aria-hidden="true" />{title}
    </h4>
    {children}
  </section>
}

function DirectionPill({ item }: { item: AppTrend }) {
  const trend = item.trend
  if (!trend) return null
  const style = {
    UP: { tone: tones.success, icon: TrendingUp, label: `Up ${formatNumber(Math.abs(trend.changePct ?? 0))}%` },
    DOWN: { tone: tones.warning, icon: TrendingDown, label: `Down ${formatNumber(Math.abs(trend.changePct ?? 0))}%` },
    STEADY: { tone: tones.grey, icon: Minus, label: "Steady" },
    NEW: { tone: tones.purple, icon: Sparkles, label: "New" },
  }[trend.direction]
  const Icon = style.icon
  return <span className={cn(pill, style.tone)}><Icon className="size-3" aria-hidden="true" />{style.label}</span>
}

function ActivityFacts({ trend }: { trend: TopTrend }) {
  const { item, computed } = trend
  const metrics = item.metrics
  const within = windowWords(metrics.window)
  const people = metrics.participants ?? computed?.metrics?.participants ?? null
  const posts = metrics.posts ?? computed?.metrics?.posts ?? null
  const follows = metrics.follows ?? computed?.metrics?.follows ?? null
  return <Facts className="md:grid-cols-1" items={[
    { label: "Count in the app", value: metrics.label ?? "None shown" },
    ...(people !== null ? [{ label: `People taking part ${within}`.trim(), value: formatNumber(people) }] : []),
    ...(posts !== null ? [{ label: `Posts ${within}`.trim(), value: formatNumber(posts) }] : []),
    ...(item.kind === "PERSON" && follows !== null ? [{ label: `New followers ${within}`.trim(), value: formatNumber(follows) }] : []),
    ...(item.kind === "EVENT" && metrics.going !== null ? [{ label: "People going", value: formatNumber(metrics.going) }] : []),
    { label: "Change", value: changeWords(item.trend) ?? "—" },
  ]} />
}

/** The score as the job multiplied it, what each part means, and the two rules it passed. */
function Score({ trend, level, policy, policyVersion }: { trend: TopTrend; level: AppTrendList["scope"]["level"]; policy: DiscoverPolicy; policyVersion: string | null }) {
  const { item, computed, override } = trend
  if (!computed) {
    return <p className={cn("mt-2 text-b3 leading-5", muted)}>
      {override ? "An admin placed it, so it didn't have to qualify and has no computed score." : "The fallback list has no scores or rules: the more posts this week, the higher."}
    </p>
  }
  const { score: settings } = policy
  const parts = computed.parts
  const boost = override?.action === "BOOST" ? override.multiplier : null
  const product = parts ? scoreProduct(parts, settings.momentumExponent) : null
  // The parts are as computed; a later change to the exponent makes the product drift from the stored score.
  const drifted = product && computed.score > 0 && Math.abs(product.product - computed.score) / computed.score > 0.01 ? product.product : null
  const rules = qualifyingRules(computed, level, policy)

  return <div className="mt-3 flex min-w-0 flex-col gap-4">
    {parts && product ? <>
      <Formula label="Its score">
        <Term hint="How far above an ordinary day, softened">Momentum {formatScore(parts.momentum)}<sup>{formatNumber(settings.momentumExponent)}</sup></Term><Op>×</Op>
        <Term hint="How many different people">Breadth {formatScore(parts.breadth)}</Term><Op>×</Op>
        <Term hint="Hides and reports pull it down">Quality {formatScore(parts.quality)}</Term><Op>×</Op>
        <Term hint={`The weight for ${KIND_LABELS[item.kind].many.toLowerCase()}`}>{KIND_LABELS[item.kind].one} ×{formatNumber(parts.kindMultiplier)}</Term><Op>=</Op>
        <Term hint="Its trend score">{formatScore(computed.score)}</Term>
      </Formula>
      <Facts items={[
        { label: `Recent activity (last ${formatNumber(settings.recentWindowHours)} h)`, value: formatScore(parts.recent) },
        { label: `An ordinary day (${formatNumber(settings.baselineDays)}-day average)`, value: formatScore(parts.baseline) },
        { label: "Momentum", value: `(${formatScore(parts.recent)} + ${formatNumber(settings.smoothing)}) ÷ (${formatScore(parts.baseline)} + ${formatNumber(settings.smoothing)}) = ${formatScore(parts.momentum)}` },
        { label: `Momentum softened (^${formatNumber(settings.momentumExponent)})`, value: formatScore(product.momentum) },
        { label: "Breadth", value: `ln(1 + ${formatNumber(computed.metrics?.participants ?? 0)} people) = ${formatScore(parts.breadth)}` },
        { label: "Quality", value: parts.quality >= 0.9995 ? "1 (no hides or reports)" : `${formatScore(parts.quality)} (hides and reports pulled it down)` },
      ]} />
    </> : <Facts items={[{ label: "Score", value: formatScore(computed.score) }]} />}
    {boost !== null && <p className={cn("text-b3 leading-5", ink)}>With the admin's ×{formatNumber(boost)}, the app ranks it by {formatScore(computed.score * boost)}.</p>}
    {drifted !== null && <p className={cn("text-b3 leading-5", muted)}>Scored with {policyVersion ?? "earlier settings"}; the momentum softening in force now is different, so the parts multiply to {formatScore(drifted)}.</p>}
    {rules.length > 0 && <div>
      <p className={cn("mb-1.5 text-b3 font-semibold", ink)}>The rules to be computed into a list, with the settings in force</p>
      <ul className="flex flex-col gap-1.5">
        {rules.map((rule) => {
          const Icon = rule.passed ? CircleCheck : CircleX
          return <li key={rule.label} className={cn("flex items-start gap-2 text-b3 leading-5 md:text-b2 md:leading-6", ink)}>
            <Icon className={cn("mt-0.5 size-4 shrink-0", rule.passed ? "text-success-700 dark:text-success-300" : "text-warning-700 dark:text-warning-300")} aria-hidden="true" />
            <span>{rule.label}: <strong>{rule.value}</strong>; needs {rule.needs}. <span className="sr-only">{rule.passed ? "Passes." : "Doesn't pass now."}</span></span>
          </li>
        })}
      </ul>
    </div>}
  </div>
}

function SubjectLinks({ item, topPostId }: { item: AppTrend; topPostId: string | null }) {
  const subject = item.subject
  const links: Array<{ to: string; label: string }> = []
  if (subject?.kind === "PERSON") links.push({ to: `${APP_ROUTES.manageUsersPeople}/${encodeURIComponent(subject.id)}`, label: "Open their profile" })
  if (subject?.kind === "INSTITUTION") links.push({ to: `${APP_ROUTES.manageUsersInstitutions}/${encodeURIComponent(subject.id)}`, label: `Open ${subject.shortName}` })
  if (subject && (subject.kind === "CAMPUS" || subject.kind === "HALL" || subject.kind === "EVENT")) {
    links.push({ to: `${APP_ROUTES.manageUsersInstitutions}/${encodeURIComponent(subject.institution.id)}`, label: `Open ${subject.institution.shortName}` })
  }
  if (topPostId) links.push({ to: `${APP_ROUTES.userContentPosts}/${encodeURIComponent(topPostId)}`, label: "Open its top post" })
  if (links.length === 0) return null
  return <div className="mt-2 flex flex-wrap gap-x-4">
    {links.map((link) => <InlineLink key={link.to} to={link.to} icon={ExternalLink}>{link.label}</InlineLink>)}
  </div>
}

function InlineLink({ to, icon: Icon, children }: { to: string; icon: LucideIcon; children: ReactNode }) {
  return <Link to={to} className={cn("mt-3 inline-flex items-center gap-1 rounded text-b3 font-semibold text-purple hover:underline dark:text-royal-300", focusRing)}>
    {children}<Icon className="size-3.5" aria-hidden="true" />
  </Link>
}

function CopyText({ value }: { value: string }) {
  const copy = () => {
    if (!navigator.clipboard) return void toast.error("Copying isn't available here.")
    navigator.clipboard.writeText(value).then(() => toast.success("Copied"), () => toast.error("Couldn't copy."))
  }
  return <span className="inline-flex max-w-full items-center gap-1">
    <span className="break-all font-mono text-b3 font-normal">{value}</span>
    <button type="button" onClick={copy} aria-label="Copy the ID" className={cn("shrink-0 cursor-pointer rounded p-1 text-grey-500 hover:text-grey-1000 dark:text-muted-foreground dark:hover:text-foreground", focusRing)}>
      <Copy className="size-3.5" aria-hidden="true" />
    </button>
  </span>
}
