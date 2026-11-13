import { Compass, Flame, Hash, LayoutGrid, Search, UserPlus } from "lucide-react"
import { cn } from "../lib/cn"
import { useLive } from "../lib/live-context"
import { exploreTiles, PEOPLE_CODE } from "../lib/discover"
import { formatNumber } from "../lib/values"
import { AREAS, KIND_LABELS, LEVEL_LABELS, PARAMETERS, SIGNAL_LABELS, type AreaId } from "../data/catalog"
import { SCOPE_LEVELS, TREND_KINDS, WEIGHTED_SIGNALS } from "../types"
import { Callout, Formula, Op, PageHero, Section, Term } from "../components/PageParts"
import { ParamChip, ParamValue } from "../components/ParamChip"
import { ParameterTable } from "../components/ParameterTable"
import { StatusPill } from "../components/Surface"
import { TrendCalculator } from "../components/TrendCalculator"
import { focusRing, hairline, ink, muted, series } from "../components/tokens"

const SECTIONS = [
  { id: "trending", label: "Trending" },
  { id: "explore", label: "Explore" },
  { id: "people", label: "People" },
  { id: "search", label: "Search" },
  { id: "topics", label: "Topic pages" },
]

/** Recommendations › Discover: trends, the Explore grid, people to follow, search and topic pages. */
export function DiscoverPage() {
  const { discover } = useLive()
  const policy = discover.policy
  const tiles = exploreTiles(18, 3, policy.explore)

  return <div className="flex min-w-0 flex-col gap-5 px-4 sm:px-6">
    <PageHero icon={Compass} title="Discover" aside={<><StatusPill status={discover.status} label={discover.status === "live" ? `Live · ${discover.label}` : undefined} /></>}>
      Trending lists, the Explore grid, people to follow, search and topic pages. Trends, Explore and people follow Discover's policy, which can be changed in
      super-admin; Explore and a topic's Top posts also use the feed ranking policy's quality and freshness. Search is written in code.
    </PageHero>

    <nav aria-label="On this page" className="flex flex-wrap gap-2">
      {SECTIONS.map((section) => <a key={section.id} href={`#${section.id}`} className={cn("rounded-full border bg-white px-3.5 py-1.5 text-b3 font-semibold hover:border-purple/40 hover:text-purple dark:bg-card", hairline, ink, focusRing)}>{section.label}</a>)}
    </nav>

    <Section id="trending" icon={Flame} title="Trending" description="A background job scores every hashtag, institution, campus, person, hall and event in every scope, then builds each scope's list. The app reads the latest list.">
      <Formula label="A subject's trend score">
        <Term>score</Term><Op>=</Op><Term>momentum<sup className="ml-0.5"><ParamValue id="discover.score.momentumExponent" /></sup></Term><Op>×</Op>
        <Term>breadth</Term><Op>×</Op><Term>quality</Term><Op>×</Op><Term>kind multiplier</Term>
      </Formula>
      <div className={cn("mt-3 grid grid-cols-1 gap-2 text-b3 leading-5 md:grid-cols-3", muted)}>
        <p><strong className={ink}>Momentum</strong> = (recent + k) ÷ (baseline + k), with k = <ParamValue id="discover.score.smoothing" />. Recent is weighted activity in the last <ParamValue id="discover.score.recentWindowHours" />, halving every <ParamValue id="discover.score.halfLifeHours" />; baseline is an ordinary day over <ParamValue id="discover.score.baselineDays" />.</p>
        <p><strong className={ink}>Breadth</strong> = ln(1 + distinct people), so a hundred people count for more than one very busy person.</p>
        <p><strong className={ink}>Quality</strong> = 1 ÷ (1 + <ParamValue id="discover.score.qualityPenalty" /> × (hides + reports) ÷ impressions).</p>
      </div>

      <div className="mt-6">
        <h4 className={cn("mb-3 text-b2 font-semibold", ink)}>Try it</h4>
        <TrendCalculator />
      </div>

      <div className="mt-8 grid min-w-0 grid-cols-1 gap-6 2xl:grid-cols-12">
        <div className="min-w-0 2xl:col-span-7">
          <h4 className={cn("text-b2 font-semibold", ink)}>What each signal is worth</h4>
          <p className={cn("mt-0.5 text-b3", muted)}>Per distinct person in the window. A dot marks a value changed from the default.</p>
          <div className="mt-3 max-w-full overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-b3">
              <caption className="sr-only">Signal weights by kind of subject</caption>
              <thead><tr className={cn("border-b", hairline)}>
                <th scope="col" className={cn("py-2 pr-3 font-semibold", muted)}>Signal</th>
                {TREND_KINDS.map((kind) => <th key={kind} scope="col" className={cn("px-2 py-2 text-right font-semibold", muted)}>{KIND_LABELS[kind].one}</th>)}
              </tr></thead>
              <tbody>{WEIGHTED_SIGNALS.map((signal) => <tr key={signal} className={cn("border-b last:border-0", hairline)}>
                <th scope="row" className={cn("py-1.5 pr-3 font-normal", ink)}>{SIGNAL_LABELS[signal].label}</th>
                {TREND_KINDS.map((kind) => <WeightCell key={kind} id={`discover.weights.${kind}.${signal}`} value={policy.weights[kind][signal]} changed={policy.weights[kind][signal] !== discover.defaults.weights[kind][signal]} />)}
              </tr>)}</tbody>
            </table>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-6 2xl:col-span-5">
          <div>
            <h4 className={cn("text-b2 font-semibold", ink)}>Fewest people to trend</h4>
            <p className={cn("mt-0.5 text-b3", muted)}>Distinct people needed in the recent window, by list.</p>
            <div className="mt-3 max-w-full overflow-x-auto">
              <table className="w-full min-w-[24rem] text-left text-b3">
                <caption className="sr-only">Fewest people to trend, by kind and list</caption>
                <thead><tr className={cn("border-b", hairline)}>
                  <th scope="col" className={cn("py-2 pr-3 font-semibold", muted)}>Kind</th>
                  {SCOPE_LEVELS.map((level) => <th key={level} scope="col" className={cn("px-2 py-2 text-right font-semibold", muted)}>{LEVEL_LABELS[level].label}</th>)}
                </tr></thead>
                <tbody>{TREND_KINDS.map((kind) => <tr key={kind} className={cn("border-b last:border-0", hairline)}>
                  <th scope="row" className={cn("py-1.5 pr-3 font-normal", ink)}>{KIND_LABELS[kind].many}</th>
                  {SCOPE_LEVELS.map((level) => <WeightCell key={level} id={`discover.minParticipants.${kind}.${level}`} value={policy.minParticipants[kind][level]} changed={policy.minParticipants[kind][level] !== discover.defaults.minParticipants[kind][level]} />)}
                </tr>)}</tbody>
              </table>
            </div>
          </div>
          <div>
            <h4 className={cn("text-b2 font-semibold", ink)}>Balancing the kinds</h4>
            <div className="mt-3 max-w-full overflow-x-auto">
              <table className="w-full min-w-[20rem] text-left text-b3">
                <caption className="sr-only">Kind multipliers and the most of each kind near the top</caption>
                <thead><tr className={cn("border-b", hairline)}>
                  <th scope="col" className={cn("py-2 pr-3 font-semibold", muted)}>Kind</th>
                  <th scope="col" className={cn("px-2 py-2 text-right font-semibold", muted)}>Multiplier</th>
                  <th scope="col" className={cn("px-2 py-2 text-right font-semibold", muted)}>Most in the top {policy.diversity.topWindow}</th>
                </tr></thead>
                <tbody>{TREND_KINDS.map((kind) => <tr key={kind} className={cn("border-b last:border-0", hairline)}>
                  <th scope="row" className={cn("py-1.5 pr-3 font-normal", ink)}>{KIND_LABELS[kind].many}</th>
                  <WeightCell id={`discover.kindMultiplier.${kind}`} value={policy.kindMultiplier[kind]} changed={policy.kindMultiplier[kind] !== discover.defaults.kindMultiplier[kind]} prefix="×" />
                  <WeightCell id={`discover.diversity.maxPerKindInTop.${kind}`} value={policy.diversity.maxPerKindInTop[kind]} changed={policy.diversity.maxPerKindInTop[kind] !== discover.defaults.diversity.maxPerKindInTop[kind]} />
                </tr>)}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={cn("rounded-2xl border p-4", hairline)}>
          <h4 className={cn("text-b2 font-semibold", ink)}>How a list is ordered</h4>
          <p className={cn("mt-1 text-b3 leading-5", muted)}>Best score first, then: a cap per kind near the top, no two of one category side by side early on, a campus never directly beside its own institution. When nothing fits, the rules relax rather than leave a gap.</p>
          <div className="mt-3 flex flex-wrap gap-1.5">{["discover.diversity.topWindow", "discover.diversity.categoryApartWithin", "discover.diversity.listSize", "trends.direction"].map((id) => <ParamChip key={id} id={id} />)}</div>
        </div>
        <div className={cn("rounded-2xl border p-4", hairline)}>
          <h4 className={cn("text-b2 font-semibold", ink)}>Admins' pins, boosts and features</h4>
          <p className={cn("mt-1 text-b3 leading-5", muted)}>Applied when a list is read: suppress removes a subject, a boost scales its score (the list is then re-ordered), a pin or feature places it, marked Featured in the app. Counts are never changed.</p>
          <div className="mt-3 flex flex-wrap gap-1.5">{["overrides.pins", "overrides.featured", "overrides.minMultiplier", "overrides.maxMultiplier", "overrides.days"].map((id) => <ParamChip key={id} id={id} />)}</div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className={cn("mr-1 text-b3 font-semibold", ink)}>The job:</span>
        {["discover.job.intervalMinutes", "discover.job.minActiveUsers.INSTITUTION", "discover.job.minActiveUsers.CAMPUS", "discover.job.staleAfterIntervals", "env.discoverRefresh"].map((id) => <ParamChip key={id} id={id} />)}
      </div>
    </Section>

    <Section id="explore" icon={LayoutGrid} title="Explore" description="“A little out of your usual”: a grid that favours good posts the viewer would not otherwise meet.">
      <Callout title="Shared with the ranked feed" className="mb-4">
        Explore's quality and freshness are the feed ranking policy's, and its pool of new posts uses the feed's new-post threshold and explore window. A change to those
        reaches Explore within 30 seconds, even though Home does not use the ranked feed yet.
      </Callout>
      <Formula label="A post's Explore score">
        <Term>quality</Term><Op>×</Op><Term>freshness</Term><Op>×</Op><Term>novelty</Term><Op>×</Op>
        <Term>(1 + <ParamValue id="discover.explore.risingBoost" /> if rising)</Term><Op>×</Op><Term>shuffle ±<ParamValue id="discover.explore.jitter" /></Term>
      </Formula>
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <h4 className={cn("text-b2 font-semibold", ink)}>Three pools</h4>
          <ul className={cn("mt-2 flex flex-col gap-2 text-b3 leading-5", muted)}>
            <li><strong className={ink}>Quality:</strong> the best <ParamValue id="explore.qualityPool" /> of the newest <ParamValue id="explore.base" /> in scope from the last <ParamValue id="discover.explore.windowDays" />.</li>
            <li><strong className={ink}>Rising:</strong> the best <ParamValue id="discover.explore.risingPostsPerSubject" /> about each subject trending in the scope.</li>
            <li><strong className={ink}>Fresh:</strong> up to <ParamValue id="explore.freshPool" /> still under <ParamValue id="feed.exploration.impressionThreshold" />, from the last <ParamValue id="feed.exploration.windowHours" />.</li>
          </ul>
          <p className={cn("mt-3 text-b3 leading-5", muted)}>
            <strong className={ink}>Novelty</strong> = 1 ÷ (1 + how familiar the author is + how much of the viewer's activity is in the post's category), read from the last <ParamValue id="explore.taste" />.
            “For you” alternates a post matching the viewer's interests with the most novel one.
          </p>
        </div>
        <div className="min-w-0">
          <h4 className={cn("text-b2 font-semibold", ink)}>The grid's order</h4>
          <p className={cn("mt-1 text-b3 leading-5", muted)}>
            One post per author in any <ParamValue id="discover.explore.authorWindow" /> tiles; the first survey is the <ParamValue id="discover.explore.surveyFirst" /> tile, then one after every <ParamValue id="discover.explore.surveyEvery" />.
          </p>
          <ol aria-label="The first tiles of the grid" className="mt-3 grid max-w-[24rem] grid-cols-6 gap-1">
            {tiles.map((tile, index) => <li key={index} className={cn("flex aspect-square flex-col items-center justify-center rounded-md text-[9px] font-semibold leading-3",
              tile === "survey" ? "bg-purple text-white" : "bg-grey-100 text-grey-500 dark:bg-muted dark:text-muted-foreground")}>
              <span className="tabular-nums">{index + 1}</span>{tile === "survey" ? "Survey" : "Post"}
            </li>)}
          </ol>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">{["explore.sessionSize", "explore.sessionTtl", "explore.poolTtl", "explore.seen", "explore.surprise"].map((id) => <ParamChip key={id} id={id} />)}</div>
    </Section>

    <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
      <Section id="people" icon={UserPlus} title="People to follow" description="Candidates come from five reasons: featured, friends of friends, same campus, rising creators and shared interests.">
        <h4 className={cn("text-b2 font-semibold", ink)}>Weights</h4>
        <ul aria-label="People score weights" className="mt-3 flex flex-col gap-3">
          {(["proximity", "mutuals", "interests", "quality"] as const).map((term) => <li key={term} className="grid grid-cols-[7rem_minmax(0,1fr)_3rem] items-center gap-3">
            <span className={cn("text-b3", ink)}>{{ proximity: "Proximity", mutuals: "Mutual follows", interests: "Shared interests", quality: "Creator quality" }[term]}</span>
            <span className="h-2 rounded-full bg-grey-100 dark:bg-muted" aria-hidden="true">
              <span className={cn("block h-full rounded-full", series.first.swatch)} style={{ width: `${Math.min(100, policy.people[term] * 100)}%` }} />
            </span>
            <span className="text-right text-b3 tabular-nums"><ParamValue id={`discover.people.${term}`} /></span>
          </li>)}
        </ul>
        <p className={cn("mt-4 text-b3 leading-5", muted)}>
          Proximity is 1 at the viewer's campus, {formatNumber(PEOPLE_CODE.proximity.INSTITUTION)} at their institution and {formatNumber(PEOPLE_CODE.proximity.REGION)} in their region.
          Mutuals count fully at {PEOPLE_CODE.mutualsForFull}. Creator quality is the engagement on their posts from the last {PEOPLE_CODE.qualityDays} days.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">{["discover.people.maxRunPerSource", "people.cache", "people.keep"].map((id) => <ParamChip key={id} id={id} />)}</div>
      </Section>

      <div className="flex min-w-0 flex-col gap-5">
        <Section id="search" icon={Search} title="Search" description="Written in code; results come back best first.">
          <Formula>
            <Term>text match</Term><Op>×</Op><Term>(1 + popularity)</Term><Op>×</Op><Term>closeness</Term><Op>×</Op><Term>freshness</Term>
          </Formula>
          <div className="mt-3 flex flex-wrap gap-1.5">{["search.exact", "search.prefix", "search.words", "search.fuzzy", "search.similarity", "search.campus", "search.institution", "search.region", "search.freshness"].map((id) => <ParamChip key={id} id={id} />)}</div>
        </Section>
        <Section id="topics" icon={Hash} title="Topic pages" description="A hashtag's, place's or person's page: Top and New.">
          <p className={cn("text-b3 leading-5 md:text-b2 md:leading-6", muted)}>
            <strong className={ink}>Top</strong> ranks the newest <ParamValue id="topics.pool" /> from the last <ParamValue id="topics.window" /> by the feed policy's
            quality × freshness, so the feed's weights and half-lives (for example <ParamValue id="feed.quality.weights.comment">the comment weight</ParamValue>) change it today.
            <strong className={ink}> New</strong> is newest first.
          </p>
        </Section>
      </div>
    </div>

    <Section title="Every parameter on this page" description="Select one for what it does, its range and where it lives.">
      <div className="flex flex-col gap-2">
        {(["trending", "explore", "people", "search", "topics"] as AreaId[]).map((area) => {
          const list = PARAMETERS.filter((parameter) => parameter.area === area)
          return <details key={area} className={cn("group rounded-2xl border", hairline)}>
            <summary className={cn("flex cursor-pointer list-none items-center justify-between gap-2 rounded-2xl px-4 py-3 text-b2 font-semibold outline-none focus-visible:ring-2 focus-visible:ring-purple [&::-webkit-details-marker]:hidden", ink)}>
              {AREAS[area].label}<span className={cn("text-b3 font-normal", muted)}>{list.length} parameters</span>
            </summary>
            <div className="px-4 pb-2"><ParameterTable caption={`Parameters of ${AREAS[area].label}`} parameters={list} /></div>
          </details>
        })}
      </div>
    </Section>
  </div>
}

function WeightCell({ id, value, changed, prefix = "" }: { id: string; value: number; changed: boolean; prefix?: string }) {
  return <td className={cn("px-2 py-1.5 text-right tabular-nums", value === 0 ? muted : ink)}>
    <span className="inline-flex items-center justify-end gap-1">
      {changed && <span className="size-1.5 rounded-full bg-purple" role="img" aria-label="changed from the default" />}
      <ParamValue id={id} className={value === 0 ? "text-grey-400 dark:text-muted-foreground" : undefined}>{prefix}{formatNumber(value)}</ParamValue>
    </span>
  </td>
}
