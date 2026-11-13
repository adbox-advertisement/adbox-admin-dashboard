import { Link } from "react-router-dom"
import { ArrowRight, CircleDot, Dices, History, Rows3, ShieldCheck, Shuffle } from "lucide-react"
import { APP_ROUTES } from "@/routes/paths"
import { cn } from "../lib/cn"
import { drawWeight, floorAgeHours, SHUFFLE } from "../lib/shuffle"
import { formatNumber } from "../lib/values"
import { PARAMETERS } from "../data/catalog"
import { LineChart } from "../components/LineChart"
import { Callout, Facts, Formula, Op, PageHero, Section, Steps, Term } from "../components/PageParts"
import { ParamChip, ParamValue } from "../components/ParamChip"
import { ParameterTable } from "../components/ParameterTable"
import { ControlPill, Figure, ReachPill } from "../components/Surface"
import { focusRing, hairline, ink, muted } from "../components/tokens"

const ageLabel = (hours: number) => (hours === 0 ? "New" : hours % 24 === 0 ? `${hours / 24} ${hours === 24 ? "day" : "days"}` : `${hours} h`)
const percent = (value: number) => `${formatNumber(Math.round(value * 1000) / 10)}%`

const hours = Array.from({ length: 85 }, (_, index) => index * 2)
const drawSeries = [
  { id: "ordinary", label: "Ordinary author", tone: "first" as const, points: hours.map((x) => ({ x, y: drawWeight(x) })) },
  { id: "spotlight", label: "Spotlight author", tone: "second" as const, points: hours.map((x) => ({ x, y: drawWeight(x, { spotlight: true }) })) },
]

/** Recommendations › Home & videos: the fresh shuffle behind Home, Shorts and the videos under a video. */
export function HomeFeedPage() {
  const floorDays = floorAgeHours() / 24
  return <div className="flex min-w-0 flex-col gap-5 px-4 sm:px-6">
    <PageHero icon={Shuffle} title="Home, Shorts and the videos under a video" aside={<><ReachPill reach="in-app" /><ControlPill control="code" /></>}>
      Three lists, one algorithm: the fresh shuffle behind <code className="font-mono text-b3">GET /feed/shuffle</code>. New posts are the likeliest to be drawn,
      the order is different every visit, and nothing is served twice in a session. Its numbers are written in the backend, so changing them needs a release;
      none of the super-admin settings reach these lists yet.
    </PageHero>

    <Section icon={Dices} title="The chance of being drawn" description="Each page is a weighted draw from the posts not yet served: every post gets a random key, weighted by this chance, and the highest keys win. New posts usually lead; an older post can still turn up, just less often.">
      <Formula label="A post's chance, relative to a brand-new post">
        <Term>chance</Term><Op>=</Op><span>max(</span><Term><ParamValue id="shuffle.floor" /></Term><Op>,</Op>
        <Term>½<sup className="ml-0.5">age ÷ <ParamValue id="shuffle.halfLife" /></sup></Term><span>)</span>
        <Op>×</Op><Term><ParamValue id="shuffle.spotlight" />&nbsp;for a Spotlight author</Term>
      </Formula>
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-8">
          <LineChart label="Chance of being drawn by the post's age, for an ordinary and a Spotlight author" series={drawSeries}
            xDomain={[0, 168]} yDomain={[0, 2]} xTicks={[0, 24, 48, 72, 96, 120, 144, 168]} yTicks={[0, 0.5, 1, 1.5, 2]}
            formatX={ageLabel} formatY={percent} markers={[{ x: floorAgeHours(), label: `Floor from ${formatNumber(Math.round(floorDays * 10) / 10)} days` }]}
            tableXs={[0, 6, 12, 24, 48, 72, 120, 168]} tableXLabel="Age" />
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 xl:col-span-4 xl:grid-cols-1">
          <Figure label="A day old" value={percent(drawWeight(24))} hint="Half the chance of a post published now." />
          <Figure label="Two days old" value={percent(drawWeight(48))} hint="A Spotlight author's two-day-old post matches an ordinary one a day old." />
          <Figure label={`From about ${formatNumber(Math.round(floorDays))} days`} value={percent(SHUFFLE.weightFloor)} hint="Every older post keeps this floor, so the back catalogue still comes round." />
        </div>
      </div>
    </Section>

    <Section icon={Rows3} title="Three lists" description="Each list remembers on its own what it has served, so a video seen on Home can still come up under another video.">
      <ul className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <ListCard title="Home" endpoint="surface=all" what="Every kind of post the viewer may see." chips={["app.homePage", "app.loadMore", "shuffle.newCap"]} />
        <ListCard title="Shorts" endpoint="surface=shorts" what="Public portrait videos short enough to be a Short." chips={["app.shortsPage", "shorts.aspect", "shorts.seconds"]} />
        <ListCard title="Videos under a video" endpoint="surface=videos" what="Public videos that can play; never the one that was opened." chips={["app.videosPage"]} />
      </ul>
    </Section>

    <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-12">
      <Section icon={History} title="A session, step by step" className="xl:col-span-7">
        <Steps steps={[
          { title: "The app opens a session", body: <>A random id kept on the phone. Coming back within <ParamValue id="app.idleLimit" />, even after closing the app, carries on where the reader was.</> },
          { title: "Each page is drawn from what is left", body: <>From the newest <ParamValue id="shuffle.pool" /> not yet served on that list. Home asks for the next page when the reader is <ParamValue id="app.loadMore" /> from the end.</> },
          { title: "Nothing comes twice", body: <>What a page serves is remembered for <ParamValue id="shuffle.memory" /> after the session's last page, so scrolling and pulling to refresh both bring new posts.</> },
          { title: "New posts light a dot", body: <>The app asks <code className="font-mono text-b4">GET /feed/new</code> with the server time of the page on screen. Any posts by other people since then light the dot on Home.</> },
          { title: "Tapping for new posts", body: "The next page puts posts published since the last refresh first, newest first, ahead of the draw." },
          { title: "Everything served", body: "When a list has nothing left, the app starts a new round of the same session, so a refresh offers posts again rather than an empty screen." },
          { title: "Away for a while", body: <>After more than <ParamValue id="app.idleLimit" /> away, the next visit is a new session and posts can come round again.</> },
        ]} />
      </Section>

      <div className="flex min-w-0 flex-col gap-5 xl:col-span-5">
        <Section icon={ShieldCheck} title="Who can appear">
          <ul className={cn("flex list-disc flex-col gap-2 pl-5 text-b3 leading-5 marker:text-grey-300 md:text-b2 md:leading-6", ink)}>
            <li>Active posts that are not ads (sponsored posts come separately).</li>
            <li>Public posts, or the viewer's own on Home.</li>
            <li>Not hidden by the viewer, and no block between viewer and author either way.</li>
            <li>Not by an account that is switched off, being deleted or suspended.</li>
            <li>An anonymous post held for review after reports stays with its author until a moderator decides.</li>
            <li>Shorts and videos only once a video can play.</li>
          </ul>
        </Section>

        <Section icon={CircleDot} title="Glances" description="The row of Glances at the top of Home is ordered by rules, not scores.">
          <Facts className="md:grid-cols-1" items={[
            { label: "First", value: "Your own Glances" },
            { label: "Then", value: "People with something unseen, followed first" },
            { label: "Then", value: "People you have seen in full" },
            { label: "Within each", value: "Most recent first" },
          ]} />
          <div className="mt-3 flex flex-wrap gap-1.5"><ParamChip id="glances.lifetime" /></div>
        </Section>
      </div>
    </div>

    <Callout title="To tune Home from super-admin">
      Home's order is written in code. Switching the app from <code className="font-mono">GET /feed/shuffle</code> to <code className="font-mono">GET /feed</code> would give
      Home the ranked feed, whose settings are live in super-admin.{" "}
      <Link to={APP_ROUTES.recommendationsRanked} className={cn("inline-flex items-center gap-1 rounded font-semibold text-purple dark:text-royal-300", focusRing)}>
        See the ranked feed<ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </Callout>

    <Section title="Every parameter on this page" description="Select one for what it does, its range and where it is written.">
      <ParameterTable caption="Parameters of Home, Shorts, videos and Glances" parameters={PARAMETERS.filter((parameter) => parameter.area === "home" || parameter.area === "glances")} />
    </Section>
  </div>
}

function ListCard({ title, endpoint, what, chips }: { title: string; endpoint: string; what: string; chips: string[] }) {
  return <li className={cn("flex flex-col gap-2 rounded-2xl border p-4", hairline)}>
    <p className={cn("text-b2 font-semibold", ink)}>{title}</p>
    <code className={cn("font-mono text-b4", muted)}>GET /feed/shuffle?{endpoint}</code>
    <p className={cn("text-b3 leading-5", muted)}>{what}</p>
    <div className="mt-auto flex flex-wrap gap-1.5 pt-1">{chips.map((id) => <ParamChip key={id} id={id} />)}</div>
  </li>
}
