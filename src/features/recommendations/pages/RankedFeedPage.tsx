import type { ReactNode } from "react"
import { format, formatDistanceToNowStrict } from "date-fns"
import { FlaskConical, History, ListOrdered, Sigma, Workflow } from "lucide-react"
import { cn } from "../lib/cn"
import { useLive } from "../lib/live-context"
import { changesBetween, formatNumber, type Change } from "../lib/values"
import { parameterById, PARAMETERS } from "../data/catalog"
import { RECOMMENDATION_PERMISSIONS, type FeedRankingPolicy } from "../types"
import { useFeedRankingHistory, useRecommendationAccess } from "../hooks"
import { LineChart, type ChartSeries } from "../components/LineChart"
import { Callout, Formula, Op, PageHero, Section, Steps, Term } from "../components/PageParts"
import { ParamChip, ParamValue } from "../components/ParamChip"
import { ParameterTable } from "../components/ParameterTable"
import { RankingPlayground } from "../components/RankingPlayground"
import { ErrorState, ReachPill, StatusPill } from "../components/Surface"
import { hairline, ink, muted, pill, tones } from "../components/tokens"

const ageLabel = (hours: number) => (hours === 0 ? "New" : `${hours / 24} ${hours === 24 ? "day" : "days"}`)
const percent = (value: number) => `${formatNumber(Math.round(value * 1000) / 10)}%`
const when = (value: string | null) => (value ? `${formatDistanceToNowStrict(new Date(value))} ago` : null)

/** A settings path in words, through the catalog, or the path itself. */
const nameOf = (path: string) => parameterById(`feed.${path}`)?.name ?? path
const show = (value: unknown) => (typeof value === "number" ? formatNumber(value) : String(value ?? "—"))

/** Recommendations › Ranked feed: GET /feed, built and controllable, not yet called by the app. */
export function RankedFeedPage() {
  const { feed } = useLive()
  const halfLives = feed.config.halfLifeHours
  const days = Array.from({ length: 85 }, (_, index) => index * 2)
  const curve = (halfLife: number) => days.map((x) => ({ x, y: Math.pow(0.5, x / halfLife) }))
  const freshness: ChartSeries[] = halfLives.TEXT === halfLives.IMAGE
    ? [{ id: "text", label: "Text & pictures", tone: "first", points: curve(halfLives.TEXT) }, { id: "video", label: "Videos", tone: "second", points: curve(halfLives.VIDEO) }]
    : [{ id: "text", label: "Text", tone: "first", points: curve(halfLives.TEXT) }, { id: "image", label: "Pictures", tone: "second", points: curve(halfLives.IMAGE) },
        { id: "video", label: "Videos", tone: "third", points: curve(halfLives.VIDEO) }]

  return <div className="flex min-w-0 flex-col gap-5 px-4 sm:px-6">
    <PageHero icon={ListOrdered} title="The ranked feed" aside={<><ReachPill reach="not-yet" /><StatusPill status={feed.status} label={feed.status === "live" ? `Live · ${feed.label}` : undefined} /></>}>
      <code className="font-mono text-b3">GET /feed</code> ranks each person's Home by how much they are likely to value each post, gives new posts and new creators a
      first audience, and never fails worse than newest first. It is built and every number can be changed from super-admin, but the app still calls the shuffle for Home.
    </PageHero>

    <Callout title="Already in the app through Discover">
      The quality weights, hide penalty, prior, half-lives, new-post threshold and explore window below also score Discover's Explore grid and a topic's Top posts.
      A new version changes those within 30 seconds.
    </Callout>

    <PolicySection />

    <Section icon={Workflow} title="How a list is built" description="On pull to refresh. Each step has a deadline, and anything that goes wrong serves newest first instead.">
      <Steps steps={[
        { title: "Ranked or newest first", body: <>A stable hash of the person's account puts them in a group: the first <ParamValue id="feed.rankedPercent" /> of people get the ranked feed. People stay in their group as the share grows.</> },
        { title: "Who is asking", body: <>Their campus, institution and interests; who they follow; blocks both ways; posts they hid; and posts they saw in the last <ParamValue id="ranked.seenWindow" />.</> },
        { title: "Candidates from five sources", body: <><span className="mb-2 block">Newest posts, followed accounts, the viewer's campus, shared interests and the most liked, in parallel. A source that misses <ParamValue id="env.sourceTimeout" /> is skipped.</span>
          <span className="flex flex-wrap gap-1.5">{["recent", "following", "campus", "interest", "trending"].map((source) => <ParamChip key={source} id={`feed.sourceQuota.${source}`} />)}
            {["following", "campus", "interest", "trending"].map((source) => <ParamChip key={source} id={`feed.sourceWindowDays.${source}`} />)}</span></> },
        { title: "Leave out", body: <>Own posts, blocked authors and hidden posts always. Recently seen posts too, while at least <ParamValue id="feed.sessionSize" /> unseen remain; otherwise they come back, ranked behind.</> },
        { title: "Mark new posts", body: <>Posts younger than <ParamValue id="feed.exploration.windowHours" /> with fewer than <ParamValue id="feed.exploration.impressionThreshold" /> are still finding their audience.</> },
        { title: "Score", body: "Quality × relevance × freshness × exploration, below." },
        { title: "Order", body: <><span className="mb-2 block">Greedily, best first, keeping each rule; when nothing fits, the rules are dropped in this order rather than leave a gap.</span>
          <span className="flex flex-wrap gap-1.5">{["rerank.exploreEvery", "rerank.maxPerAuthorInWindow", "rerank.authorWindow", "rerank.maxConsecutiveVideos"].map((path) => <ParamChip key={path} id={`feed.${path}`} />)}</span></> },
        { title: "Keep the list", body: <>Up to <ParamValue id="feed.sessionSize" />, stored for <ParamValue id="ranked.sessionTtl" />, so later pages are slices of one list and nothing reshuffles under the reader. Each page re-checks hides and blocks.</> },
        { title: "Or fall back", body: <>An error, a Redis failure or a build past <ParamValue id="env.buildTimeout" /> serves newest first and is recorded as such.</> },
      ]} />
    </Section>

    <Section icon={Sigma} title="The score" description="Four parts multiplied: a post needs some of each.">
      <Formula label="Score">
        <Term>quality</Term><Op>×</Op><Term>relevance</Term><Op>×</Op><Term>freshness</Term><Op>×</Op><Term>exploration</Term>
      </Formula>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Part title="Quality" chips={["quality.weights.like", "quality.weights.comment", "quality.weights.share", "quality.weights.bookmark", "quality.weights.completion", "quality.hidePenalty", "quality.priorStrength", "quality.priorRate"]}>
          Weighted engagement per impression, smoothed: (likes, comments, shares and saves by their weights + completed watches − hides × penalty + prior strength × prior rate) ÷ (impressions + prior strength).
          A replay counts once; exposure is the larger of impressions and video viewers.
        </Part>
        <Part title="Relevance" chips={["relevance.followsAuthor", "relevance.sameCampus", "relevance.sameInstitution", "relevance.perSharedInterest", "relevance.maxSharedInterests"]}>
          1 for a post with no tie to the viewer, plus a bonus for following the author, sharing a campus (or else an institution), and each shared interest.
        </Part>
        <Part title="Freshness" chips={["halfLifeHours.TEXT", "halfLifeHours.IMAGE", "halfLifeHours.VIDEO"]}>
          Halves every half-life of the post's age, by its kind.
        </Part>
        <Part title="Exploration" chips={["exploration.boost", "exploration.impressionThreshold"]}>
          A multiplier while a post has fewer impressions than the threshold; 1 after.
        </Part>
      </div>
      <div className="mt-6">
        <h4 className={cn("mb-3 text-b2 font-semibold", ink)}>Freshness by age, with the half-lives in force</h4>
        <LineChart label="Freshness by the post's age for each kind of post" series={freshness} xDomain={[0, 168]} yDomain={[0, 1]}
          xTicks={[0, 24, 48, 72, 96, 120, 144, 168]} yTicks={[0, 0.25, 0.5, 0.75, 1]} formatX={ageLabel} formatY={percent}
          tableXs={[0, 12, 24, 48, 72, 120, 168]} tableXLabel="Age" height={220} />
      </div>
    </Section>

    <Section icon={FlaskConical} title="Try a change" description="The sample posts are ranked by the same functions the gateway runs, with the settings in force and with yours. Nothing is saved.">
      <RankingPlayground />
    </Section>

    <Section title="Every parameter on this page" description="Select one for what it does, its range and where it lives.">
      <ParameterTable caption="Parameters of the ranked feed" parameters={PARAMETERS.filter((parameter) => parameter.area === "ranked")} />
    </Section>
  </div>
}

function Part({ title, chips, children }: { title: string; chips: string[]; children: ReactNode }) {
  return <div className={cn("rounded-2xl border p-4", hairline)}>
    <h4 className={cn("text-b2 font-semibold", ink)}>{title}</h4>
    <p className={cn("mt-1 text-b3 leading-5", muted)}>{children}</p>
    <div className="mt-3 flex flex-wrap gap-1.5">{chips.map((path) => <ParamChip key={path} id={`feed.${path}`} />)}</div>
  </div>
}

function ChangeList({ changes, limit = 4 }: { changes: Change[]; limit?: number }) {
  if (changes.length === 0) return <p className={cn("text-b3", muted)}>No setting changed.</p>
  return <ul className="flex flex-col gap-1">
    {changes.slice(0, limit).map((change) => <li key={change.path} className={cn("text-b3", ink)}>
      {nameOf(change.path)}: <span className="tabular-nums">{show(change.before)}</span> → <strong className="tabular-nums">{show(change.after)}</strong>
    </li>)}
    {changes.length > limit && <li className={cn("text-b3", muted)}>and {changes.length - limit} more</li>}
  </ul>
}

function PolicySection() {
  const { feed } = useLive()
  const access = useRecommendationAccess()
  const history = useFeedRankingHistory(access.feed)
  const fromDefaults = changesBetween(feed.defaults, feed.config)

  return <Section icon={History} title="The policy in force" description="Every change is a new numbered version; activating an older one rolls back. The gateway reads the active version at most every 30 seconds.">
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      <div className="min-w-0 xl:col-span-5">
        <p className={cn("font-heading text-h5 font-semibold", ink)}>{feed.label}</p>
        <p className={cn("mt-1 text-b3", muted)}>
          {feed.status === "locked" ? `Built-in defaults shown; the live version needs ${RECOMMENDATION_PERMISSIONS.feedRanking}.`
            : feed.active && feed.ignored.length === 0 ? `Version ${feed.active.version}, live ${when(feed.active.activatedAt) ?? ""}.` : "No version is live: the built-in defaults are in force."}
        </p>
        {feed.ignored.length > 0 && <p className="mt-2 text-b3 font-semibold text-warning-700 dark:text-warning-300">Version {feed.active?.version} fails validation ({feed.ignored[0]}), so the gateway uses the defaults.</p>}
        {feed.status === "error" && <div className="-mx-5"><ErrorState message="Could not load the feed ranking settings." onRetry={feed.refetch} /></div>}
        <div className="mt-4 flex flex-wrap gap-1.5"><ParamChip id="feed.rankedPercent" /><ParamChip id="env.policyRefresh" /></div>
        <div className={cn("mt-4 rounded-2xl border p-4", hairline)}>
          <p className={cn("mb-2 text-b3 font-semibold", ink)}>Against the built-in defaults</p>
          <ChangeList changes={fromDefaults} limit={8} />
        </div>
      </div>

      <div className="min-w-0 xl:col-span-7">
        <p className={cn("mb-2 text-b3 font-semibold", ink)}>Versions</p>
        {!access.feed ? <p className={cn("text-b3", muted)}>Version history needs {RECOMMENDATION_PERMISSIONS.feedRanking}.</p>
          : history.isPending ? <p role="status" className={cn("text-b3", muted)}>Loading versions…</p>
          : history.isError ? <ErrorState message="Could not load the version history." onRetry={() => void history.refetch()} />
          : history.data.length === 0 ? <p className={cn("text-b3", muted)}>No version has been saved yet: the gateway runs the built-in defaults.</p>
          : <ol className="flex flex-col gap-2">
            {history.data.map((version, index) => <VersionRow key={version.id} version={version} previous={history.data[index + 1] ?? null} defaults={feed.defaults} />)}
          </ol>}
      </div>
    </div>
  </Section>
}

function VersionRow({ version, previous, defaults }: { version: FeedRankingPolicy; previous: FeedRankingPolicy | null; defaults: unknown }) {
  const changes = changesBetween(previous?.config ?? defaults, version.config)
  const shareChanged = previous && previous.rankedPercent !== version.rankedPercent
  return <li className={cn("rounded-2xl border p-4", hairline, version.isActive && "border-purple/40 bg-purple/[0.03] dark:bg-royal-500/5")}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className={cn("flex items-center gap-2 text-b2 font-semibold", ink)}>
        Version {version.version}
        {version.isActive && <span className={cn(pill, tones.success)}>Live</span>}
      </p>
      <p className={cn("text-b4 tabular-nums", muted)} title={format(new Date(version.createdAt), "d MMM yyyy, HH:mm")}>Saved {when(version.createdAt)}</p>
    </div>
    {version.note && <p className={cn("mt-1 text-b3 italic", muted)}>“{version.note}”</p>}
    <div className="mt-2">
      <ChangeList changes={changes} />
      {shareChanged && <p className={cn("mt-1 text-b3", ink)}>Ranked share: {previous?.rankedPercent}% → <strong>{version.rankedPercent}%</strong></p>}
      {!previous && <p className={cn("mt-1 text-b4", muted)}>Compared with the built-in defaults. Ranked share {version.rankedPercent}%.</p>}
    </div>
  </li>
}
