import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { formatDistanceToNowStrict } from "date-fns"
import { ArrowRight, Coins, Compass, Route, SlidersHorizontal, Waypoints, type LucideIcon } from "lucide-react"
import { APP_ROUTES } from "@/routes/paths"
import { cn } from "../lib/cn"
import { useLive } from "../lib/live-context"
import { changesBetween, formatNumber } from "../lib/values"
import { CONTROLS, CONTROL_IDS, PARAMETERS, type ControlId } from "../data/catalog"
import { RECOMMENDATION_PERMISSIONS } from "../types"
import type { LiveStatus } from "../hooks"
import { FlowMap } from "../components/FlowMap"
import { Callout, PageHero, Section } from "../components/PageParts"
import { ErrorState, IconTile, StatusPill } from "../components/Surface"
import { controlIcons, focusRing, hairline, ink, muted, surface } from "../components/tokens"

const ago = (value: string | null) => (value ? `${formatDistanceToNowStrict(new Date(value))} ago` : null)

/** Recommendations › Overview: every list the app shows, and every number that fills it. */
export function OverviewPage() {
  const total = PARAMETERS.length
  const adjustable = PARAMETERS.filter((parameter) => ["feed-policy", "discover-policy", "gold"].includes(parameter.control)).length

  return <div className="flex min-w-0 flex-col gap-5 px-4 sm:px-6">
    <PageHero icon={Waypoints} title="How the app decides what people see">
      Every list in the AdBox app (Home, Shorts, sponsored posts, Glances and Discover) is filled by the backend from{" "}
      <strong className={ink}>{formatNumber(total)} numbers</strong>, and {formatNumber(adjustable)} of them can be changed from super-admin without a release.
      This section shows each one with the value in force, who can change it and what changing it does. It only reads: nothing here is saved.
    </PageHero>

    <Callout title="What runs in the app today">
      Home, Shorts and the videos under a video use the <strong>fresh shuffle</strong>: newer posts are likelier, the order differs every visit and nothing
      repeats in a session. Its numbers are written in code. The <strong>ranked feed</strong> is built and can be tuned from super-admin, but the app does not
      call it yet; its quality, freshness and new-post settings already shape Discover's Explore grid and topic pages.
    </Callout>

    <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <FeedPolicyCard />
      <DiscoverPolicyCard />
      <GoldCard />
    </div>

    <Section icon={Route} title="From the request to the screen" description="Each list the app shows, stage by stage. Select a parameter to see what it does, its range and where it lives.">
      <FlowMap />
    </Section>

    <Section icon={SlidersHorizontal} title="Who can change what" description="Three settings objects are live in super-admin; the rest change with a release of the backend or the app.">
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {CONTROL_IDS.map((control) => <ControlCard key={control} control={control} />)}
      </ul>
    </Section>
  </div>
}

function ControlCard({ control }: { control: ControlId }) {
  const count = PARAMETERS.filter((parameter) => parameter.control === control).length
  const { label, where, speed } = CONTROLS[control]
  return <li>
    <Link to={`${APP_ROUTES.recommendationsParameters}?control=${control}`}
      className={cn("group flex h-full gap-3 rounded-2xl border p-4 transition-colors hover:border-purple/40 hover:bg-purple/5 dark:hover:bg-royal-500/10", hairline, focusRing)}>
      <IconTile icon={controlIcons[control]} tone={["feed-policy", "discover-policy", "gold"].includes(control) ? "purple" : "grey"} size="sm" />
      <div className="min-w-0">
        <p className={cn("flex items-baseline gap-2 text-b2 font-semibold", ink)}>{label}<span className={cn("text-b3 font-normal", muted)}>{count} {count === 1 ? "parameter" : "parameters"}</span></p>
        <p className={cn("mt-1 text-b3 leading-5", muted)}>{where}.</p>
        <p className={cn("mt-1 text-b3 font-semibold leading-5", ink)}>{speed}.</p>
      </div>
      <ArrowRight className="ml-auto size-4 shrink-0 self-center text-grey-400 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  </li>
}

function PlaneCard({ icon, title, status, permission, onRetry, children, link }: {
  icon: LucideIcon
  title: string
  status: LiveStatus
  permission: string
  onRetry: () => void
  children: ReactNode
  link: { to: string; label: string }
}) {
  return <section aria-label={title} className={cn(surface, "flex min-w-0 flex-col p-5 md:last:col-span-2 xl:last:col-span-1")}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <IconTile icon={icon} size="sm" />
        <h3 className={cn("font-heading text-b1 font-semibold", ink)}>{title}</h3>
      </div>
      <StatusPill status={status} />
    </div>
    <div className="mt-4 flex-1">
      {status === "error" ? <div className="-m-5"><ErrorState message="Could not load the live settings; the built-in defaults are shown." onRetry={onRetry} /></div> : children}
      {status === "locked" && <p className={cn("mt-2 text-b3", muted)}>Live values need <code className="font-mono text-b4">{permission}</code>.</p>}
    </div>
    <Link to={link.to} className={cn("mt-4 inline-flex w-fit items-center gap-1 rounded text-b3 font-semibold text-purple dark:text-royal-300", focusRing)}>
      {link.label}<ArrowRight className="size-3.5" aria-hidden="true" />
    </Link>
  </section>
}

function FeedPolicyCard() {
  const { feed } = useLive()
  return <PlaneCard icon={SlidersHorizontal} title="Feed ranking policy" status={feed.status} permission={RECOMMENDATION_PERMISSIONS.feedRanking} onRetry={feed.refetch}
    link={{ to: APP_ROUTES.recommendationsRanked, label: "How the ranked feed works" }}>
    <p className={cn("font-heading text-h6 font-semibold", ink)} data-testid="feed-version">{feed.label}</p>
    <p className={cn("mt-1 text-b3", muted)}>
      {feed.active && feed.ignored.length === 0 ? `Version ${feed.active.version}, live ${ago(feed.active.activatedAt) ?? ""}` : "Built-in defaults: no version is live"}
    </p>
    <p className={cn("mt-3 text-b3", ink)}>
      Ranked share: <strong>{feed.rankedPercent === null ? "the gateway's FEED_RANKED_PERCENT (100% unless set)" : `${feed.rankedPercent}%`}</strong>
    </p>
    {feed.ignored.length > 0 && <p className="mt-2 text-b3 font-semibold text-warning-700 dark:text-warning-300">
      Version {feed.active?.version} fails validation, so the gateway uses the defaults: {feed.ignored[0]}.
    </p>}
  </PlaneCard>
}

function DiscoverPolicyCard() {
  const { discover } = useLive()
  const differing = changesBetween(discover.defaults, discover.policy).length
  return <PlaneCard icon={Compass} title="Discover policy" status={discover.status} permission={RECOMMENDATION_PERMISSIONS.discover} onRetry={discover.refetch}
    link={{ to: APP_ROUTES.recommendationsDiscover, label: "How Discover ranks" }}>
    <p className={cn("font-heading text-h6 font-semibold", ink)} data-testid="discover-version">{discover.label}</p>
    <p className={cn("mt-1 text-b3", muted)}>
      {discover.active && discover.ignored.length === 0 ? `Version ${discover.active.version}, live ${ago(discover.active.activatedAt) ?? ""}` : "Built-in defaults: no version is live"}
    </p>
    <p className={cn("mt-3 text-b3", ink)}>
      {differing === 0 ? "Every setting is at its default." : <><strong>{differing}</strong> {differing === 1 ? "setting differs" : "settings differ"} from the defaults.</>}
    </p>
    {discover.ignored.length > 0 && <p className="mt-2 text-b3 font-semibold text-warning-700 dark:text-warning-300">
      Version {discover.active?.version} fails validation, so the gateway uses the defaults: {discover.ignored[0]}.
    </p>}
  </PlaneCard>
}

function GoldCard() {
  const { gold } = useLive()
  return <PlaneCard icon={Coins} title="Gold settings" status={gold.status} permission={RECOMMENDATION_PERMISSIONS.gold} onRetry={gold.refetch}
    link={{ to: APP_ROUTES.recommendationsSponsored, label: "How sponsored posts are served" }}>
    <p className={cn("font-heading text-h6 font-semibold", ink)}>{gold.values.adFrequencyCapPerDay} views a day</p>
    <p className={cn("mt-1 text-b3", muted)}>The most one person is served one ad.</p>
    <p className={cn("mt-3 text-b3", ink)}>Price: <strong>{formatNumber(gold.values.adCpmBars)} bars</strong> per 1,000 views</p>
    {gold.updatedAt && <p className={cn("mt-1 text-b3", muted)}>Changed {ago(gold.updatedAt)}.</p>}
  </PlaneCard>
}
