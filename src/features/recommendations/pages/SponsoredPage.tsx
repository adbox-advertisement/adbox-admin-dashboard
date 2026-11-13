import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Eye, Gauge, ListChecks, Megaphone, Smartphone } from "lucide-react"
import { APP_ROUTES } from "@/routes/paths"
import { cn } from "../lib/cn"
import { useLive } from "../lib/live-context"
import { AD_DELIVERY, APP_AD_PLACEMENT, adPlaces, pacedViews, viewsForBars } from "../lib/ads"
import { formatNumber } from "../lib/values"
import { PARAMETERS } from "../data/catalog"
import { LineChart } from "../components/LineChart"
import { Formula, Op, PageHero, Section, Term } from "../components/PageParts"
import { ParamChip, ParamValue } from "../components/ParamChip"
import { ParameterTable } from "../components/ParameterTable"
import { ControlPill, Figure, ReachPill, StatusPill } from "../components/Surface"
import { focusRing, hairline, ink, muted, pill, tones } from "../components/tokens"

const clock = (hour: number) => `${String(Math.floor(hour) % 24 === 0 && hour > 0 ? 24 : Math.floor(hour)).padStart(2, "0")}:${hour % 1 ? "30" : "00"}`

/** Recommendations › Sponsored posts: which ads a person is served, how fast, and where Home puts them. */
export function SponsoredPage() {
  const { gold } = useLive()
  const budgets = [...new Set([gold.values.adDailyBudgetMinBars, 1500, 5000, gold.values.adDailyBudgetMaxBars])]
    .filter((bars) => bars >= gold.values.adDailyBudgetMinBars && bars <= gold.values.adDailyBudgetMaxBars)
    .sort((a, b) => a - b)
  const [budget, setBudget] = useState(1500)
  const daily = budget >= gold.values.adDailyBudgetMinBars && budget <= gold.values.adDailyBudgetMaxBars ? budget : budgets[0] ?? 1500
  const dailyViews = viewsForBars(daily, gold.values.adCpmBars)
  const halfHours = Array.from({ length: 49 }, (_, index) => index / 2)
  const pace = [
    { id: "allowed", label: "Allowed by then", tone: "first" as const, points: halfHours.map((hour) => ({ x: hour, y: pacedViews(dailyViews, hour / 24) })) },
    { id: "even", label: "An even spread", tone: "context" as const, points: halfHours.map((hour) => ({ x: hour, y: (dailyViews * hour) / 24 })) },
  ]
  const top = Math.max(1, dailyViews)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((share) => Math.round(top * share))

  return <div className="flex min-w-0 flex-col gap-5 px-4 sm:px-6">
    <PageHero icon={Megaphone} title="Sponsored posts in Home" aside={<><ReachPill reach="in-app" /><ControlPill control="gold" /><StatusPill status={gold.status} /></>}>
      Ads people buy with gold reach other people's Home feed through <code className="font-mono text-b3">GET /ads/feed</code>. The backend decides which ads a person
      may be served and in what order, pacing each one through the day; the app decides where they sit among the posts. The ranked and shuffled feeds never
      contain ads, and never read ad spend.
    </PageHero>

    <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-12">
      <Section icon={ListChecks} title="Who is served an ad" className="xl:col-span-7" description="Every condition must hold. Up to the request's limit, the eligible ads come back in the order below.">
        <ol className="flex flex-col gap-2.5">
          {[
            { text: "It is running and inside its dates, and its advertiser's account is active.", chips: [] },
            { text: "It is aimed at the viewer: everyone, or students or alumni by their profile; their institution and campus when the ad names some.", chips: ["gold.adMinAudience"] },
            { text: "It is not the viewer's own, nor any account they run, and they have not hidden it.", chips: [] },
            { text: "The viewer has been served it fewer times today than the cap.", chips: ["gold.adFrequencyCapPerDay"] },
            { text: "It is behind its pace for the time of day, and its budget is not spent.", chips: ["ads.burst", "gold.adCpmBars"] },
          ].map((rule, index) => <li key={rule.text} className={cn("flex gap-3 rounded-2xl border p-3", hairline)}>
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-purple/10 text-b4 font-semibold text-purple dark:text-royal-300">{index + 1}</span>
            <div className="min-w-0">
              <p className={cn("text-b3 leading-5 md:text-b2 md:leading-6", ink)}>{rule.text}</p>
              {rule.chips.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{rule.chips.map((id) => <ParamChip key={id} id={id} />)}</div>}
            </div>
          </li>)}
        </ol>
        <Formula label="Order among eligible ads" className="mt-4">
          <Term>weight</Term><Op>=</Op><Term>random</Term><Op>×</Op><Term>headroom</Term><Op>,</Op>
          <Term>headroom</Term><Op>=</Op><span>1 −</span><Term>delivered today ÷ allowed by now</Term>
        </Formula>
        <p className={cn("mt-2 text-b3 leading-5", muted)}>An ad far behind its pace is likely to come first; one that has caught up waits. Up to <ParamValue id="ads.pool" /> are weighed per request.</p>
      </Section>

      <Section icon={Smartphone} title="Where Home puts them" className="xl:col-span-5" description="The app asks for a fresh set each time Home loads and spaces them among the posts.">
        <FeedPlacement />
      </Section>
    </div>

    <Section icon={Gauge} title="Pace through the day" description="A daily budget buys a number of views at the price per 1,000. Each delivery day (Africa/Accra, which is UTC) an ad may have had an even share of them by now, plus a head start.">
      <div role="radiogroup" aria-label="Daily budget" className="mb-4 flex w-fit max-w-full flex-wrap gap-1 rounded-3xl bg-grey-50 p-1 dark:bg-background">
        {budgets.map((bars) => <button key={bars} type="button" role="radio" aria-checked={bars === daily} onClick={() => setBudget(bars)}
          className={cn("min-h-9 cursor-pointer rounded-full px-3.5 text-b3 font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-purple",
            bars === daily ? "bg-white text-purple shadow-adbox-small dark:bg-card" : "text-grey-500 hover:text-grey-1000 dark:text-muted-foreground dark:hover:text-foreground")}>
          {formatNumber(bars)} bars a day
        </button>)}
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-8">
          <LineChart label={`Views an ad with ${formatNumber(daily)} bars a day may have had, through the day`} series={pace}
            xDomain={[0, 24]} yDomain={[0, top]} xTicks={[0, 6, 12, 18, 24]} yTicks={ticks}
            formatX={clock} formatY={(value) => formatNumber(Math.round(value))} tableXs={[0, 3, 6, 9, 12, 15, 18, 21, 24]} tableXLabel="Time" />
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 xl:col-span-4 xl:grid-cols-1">
          <Figure label="Views a day" value={formatNumber(dailyViews)} hint={<>{formatNumber(daily)} bars at <ParamValue id="gold.adCpmBars" /> per 1,000 views.</>} />
          <Figure label="Allowed by 06:00" value={formatNumber(pacedViews(dailyViews, 0.25))} hint={`${formatNumber(Math.round(dailyViews / 4))} from an even spread, plus the head start.`} />
          <Figure label="Head start" value={formatNumber(Math.ceil(dailyViews * AD_DELIVERY.pacingBurst))} hint="So a quiet morning does not leave an ad behind." />
        </div>
      </div>
    </Section>

    <Section icon={Eye} title="What counts as a view" description="Serving records nothing. The app reports a view once the ad has been half on screen for a second, and the server counts it only when all of these hold.">
      <ul className={cn("grid grid-cols-1 gap-x-6 gap-y-2 text-b3 leading-5 md:grid-cols-2 md:text-b2 md:leading-6", ink)}>
        {["The server served this ad to this person today.", "A real, active person, never the advertiser or anyone who runs the account.", "Within the day's cap for this person and ad.", "Never beyond what the budget buys."]
          .map((line) => <li key={line} className={cn("rounded-xl border px-3 py-2", hairline)}>{line}</li>)}
      </ul>
      <p className={cn("mt-3 text-b3", muted)}>
        Each counted view is charged at the ad's price per 1,000. The gold numbers are set in{" "}
        <Link to={APP_ROUTES.goldPricing} className={cn("inline-flex items-center gap-1 rounded font-semibold text-purple dark:text-royal-300", focusRing)}>Gold & pricing<ArrowRight className="size-3.5" aria-hidden="true" /></Link>
      </p>
    </Section>

    <Section title="Every parameter on this page" description="Select one for what it does, its range and where it is set.">
      <ParameterTable caption="Parameters of sponsored posts" parameters={PARAMETERS.filter((parameter) => parameter.area === "sponsored")} />
    </Section>
  </div>
}

/** Home's list as the app builds it: one page of posts with the served ads in their places. */
function FeedPlacement() {
  const posts = 20
  const places = adPlaces(APP_AD_PLACEMENT.requested, posts)
  const total = posts + places.length
  let post = 0
  const rows = Array.from({ length: total }, (_, index) => {
    const ad = places.indexOf(index + 1)
    if (ad >= 0) return { key: `ad${ad}`, ad: true, label: `Sponsored · ${ad + 1} of ${places.length}` }
    post += 1
    return { key: `post${post}`, ad: false, label: `Post ${post}` }
  })
  return <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-5 xl:flex-col xl:items-center 2xl:flex-row 2xl:items-start">
    <figure aria-label={`Home with ${places.length} ads among ${posts} posts`} className="w-full max-w-[15rem] shrink-0 rounded-[28px] border-[6px] border-grey-900 bg-grey-50 p-2 dark:border-grey-700 dark:bg-background">
      <div className="mb-2 flex gap-1.5 px-1" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((dot) => <span key={dot} className="size-6 rounded-full border-2 border-purple/50 bg-white dark:bg-card" />)}
      </div>
      <ol className="flex flex-col gap-1">
        {rows.map((row, index) => <li key={row.key} className={cn("flex h-5 items-center justify-between rounded-md px-2 text-[10px] font-semibold",
          row.ad ? "bg-purple text-white" : "bg-white text-grey-500 dark:bg-card dark:text-muted-foreground")}>
          <span>{row.label}</span><span className="tabular-nums opacity-70">{index + 1}</span>
        </li>)}
      </ol>
      <p className={cn("mt-2 px-1 text-center text-[10px]", muted)}>Next page asked for near here</p>
    </figure>
    <div className="flex min-w-0 flex-col gap-2">
      <p className={cn("text-b3 leading-5", ink)}>
        Asked for: <ParamValue id="app.adsRequested" /> ads. The first goes at the <ParamValue id="app.firstAdSlot" /> place, then one after every <ParamValue id="app.adSpacing" />, and a later one only where posts surround it.
      </p>
      <p className={cn("text-b3 leading-5", muted)}>A boosted post replaces its plain copy. The viewer's own running ads lead their own Home; others never see an ad twice in one list.</p>
      <span className={cn(pill, tones.grey)}>Places {places.join(", ")}</span>
    </div>
  </div>
}
