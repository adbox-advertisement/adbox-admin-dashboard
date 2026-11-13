import { useId, useMemo, useState } from "react"
import { ArrowDown, ArrowUp, FileText, Image as ImageIcon, Minus, RotateCcw, Sparkles, Video, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "../lib/cn"
import { useLive } from "../lib/live-context"
import { buildList, type RuleName } from "../lib/ranking"
import { boundsAt, formatHours, formatNumber, formatScore, valueAt } from "../lib/values"
import { SAMPLE_VIEWER, sampleById, sampleCandidates } from "../data/sample-feed"
import type { MediaType, RankingConfig } from "../types"
import { ParamValue } from "./ParamChip"
import { hairline, ink, muted, pill, series, tones } from "./tokens"

type Knob = { path: string; label: string; min: number; max: number; step: number; format?: (value: number) => string }

// The settings that move the sample list most, each over a range wide enough to see the effect
// (and never beyond what the API accepts).
const GROUPS: Array<{ title: string; knobs: Knob[] }> = [
  { title: "Engagement", knobs: [
    { path: "quality.weights.like", label: "Like weight", min: 0, max: 20, step: 0.5 },
    { path: "quality.weights.comment", label: "Comment weight", min: 0, max: 20, step: 0.5 },
    { path: "quality.weights.share", label: "Share weight", min: 0, max: 20, step: 0.5 },
    { path: "quality.weights.bookmark", label: "Save weight", min: 0, max: 20, step: 0.5 },
    { path: "quality.weights.completion", label: "Completed-watch weight", min: 0, max: 20, step: 0.5 },
    { path: "quality.hidePenalty", label: "Hide penalty", min: 0, max: 100, step: 1 },
    { path: "quality.priorStrength", label: "Prior strength", min: 1, max: 500, step: 1 },
  ] },
  { title: "Ties to the viewer", knobs: [
    { path: "relevance.followsAuthor", label: "Follows the author", min: 0, max: 5, step: 0.1 },
    { path: "relevance.sameCampus", label: "Same campus", min: 0, max: 5, step: 0.1 },
    { path: "relevance.sameInstitution", label: "Same institution", min: 0, max: 5, step: 0.1 },
    { path: "relevance.perSharedInterest", label: "Per shared interest", min: 0, max: 2, step: 0.05 },
  ] },
  { title: "Freshness and new posts", knobs: [
    { path: "halfLifeHours.TEXT", label: "Text half-life", min: 1, max: 168, step: 1, format: (v) => `${v} h` },
    { path: "halfLifeHours.IMAGE", label: "Picture half-life", min: 1, max: 168, step: 1, format: (v) => `${v} h` },
    { path: "halfLifeHours.VIDEO", label: "Video half-life", min: 1, max: 168, step: 1, format: (v) => `${v} h` },
    { path: "exploration.impressionThreshold", label: "New-post threshold", min: 0, max: 2000, step: 10, format: (v) => `${formatNumber(v)} views` },
    { path: "exploration.boost", label: "Exploration boost", min: 1, max: 3, step: 0.05, format: (v) => `×${v}` },
  ] },
  { title: "Order rules", knobs: [
    { path: "rerank.maxPerAuthorInWindow", label: "Posts per author", min: 1, max: 5, step: 1 },
    { path: "rerank.authorWindow", label: "Author window", min: 1, max: 10, step: 1 },
    { path: "rerank.maxConsecutiveVideos", label: "Videos in a row", min: 1, max: 6, step: 1 },
    { path: "rerank.exploreEvery", label: "Explore slot every", min: 0, max: 12, step: 1, format: (v) => (v === 0 ? "off" : `${v} posts`) },
  ] },
]

const ruleWords: Record<RuleName, string> = {
  author: "author spacing",
  videos: "the video run",
  quote: "keeping a quote apart",
  "explore-slot": "the slot kept for a new post",
}

const mediaIcons: Record<MediaType, { icon: LucideIcon; label: string }> = {
  TEXT: { icon: FileText, label: "Text" },
  IMAGE: { icon: ImageIcon, label: "Picture" },
  VIDEO: { icon: Video, label: "Video" },
}

function withOverrides(config: RankingConfig, overrides: Record<string, number>): RankingConfig {
  const next = structuredClone(config)
  for (const [path, value] of Object.entries(overrides)) {
    const keys = path.split(".")
    let target = next as unknown as Record<string, unknown>
    for (const key of keys.slice(0, -1)) target = target[key] as Record<string, unknown>
    target[keys[keys.length - 1]] = value
  }
  return next
}

/**
 * The ranked feed's what-if: twelve sample posts for one sample viewer, ranked with the settings
 * in force and with the admin's changes, by the same functions the gateway runs. Nothing is saved.
 */
export function RankingPlayground() {
  const { feed } = useLive()
  const [overrides, setOverrides] = useState<Record<string, number>>({})
  const [now] = useState(() => new Date())
  const summaryId = useId()

  const candidates = useMemo(() => sampleCandidates(now), [now])
  const draft = useMemo(() => withOverrides(feed.config, overrides), [feed.config, overrides])
  const live = useMemo(() => buildList(candidates, now, feed.config, candidates.length), [candidates, now, feed.config])
  const result = useMemo(() => buildList(candidates, now, draft, candidates.length), [candidates, now, draft])

  const livePlace = new Map(live.items.map((item, index) => [item.id, index]))
  const changed = Object.entries(overrides).filter(([path, value]) => valueAt(feed.config, path.split(".")) !== value).length
  const moved = result.items.filter((item, index) => livePlace.get(item.id) !== index).length
  const top = Math.max(...result.items.map((item) => item.score), Number.MIN_VALUE)
  const authorRuleBroken = draft.rerank.maxPerAuthorInWindow > draft.rerank.authorWindow

  const set = (path: string, value: number) => setOverrides((current) => ({ ...current, [path]: value }))

  return <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-12">
    <div className="min-w-0 xl:col-span-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={cn("text-b3 font-semibold", ink)}>{changed === 0 ? `Settings in force (${feed.label})` : `${changed} ${changed === 1 ? "setting" : "settings"} changed`}</p>
        <Button type="button" variant="outline" size="sm" className="h-8 cursor-pointer rounded-full" disabled={changed === 0} onClick={() => setOverrides({})}>
          <RotateCcw className="size-3.5" aria-hidden="true" />Back to live
        </Button>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {GROUPS.map((group, index) => <details key={group.title} open={index === 0} className={cn("group rounded-2xl border", hairline)}>
          <summary className={cn("cursor-pointer list-none rounded-2xl px-4 py-3 text-b2 font-semibold outline-none focus-visible:ring-2 focus-visible:ring-purple [&::-webkit-details-marker]:hidden", ink)}>
            <span className="flex items-center justify-between gap-2">{group.title}<span aria-hidden="true" className={cn("text-b3 transition-transform group-open:rotate-90", muted)}>›</span></span>
          </summary>
          <div className="flex flex-col gap-4 px-4 pb-4">
            {group.knobs.map((knob) => <Slider key={knob.path} knob={knob} config={feed.config} draft={draft} bounds={boundsAt(feed.bounds, knob.path.split("."))} onChange={(value) => set(knob.path, value)} />)}
          </div>
        </details>)}
      </div>
      {authorRuleBroken && <p role="alert" className="mt-3 text-b3 font-semibold text-warning-700 dark:text-warning-300">
        Super-admin would refuse this: posts per author can't be more than the author window.
      </p>}
    </div>

    <div className="min-w-0 xl:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p id={summaryId} aria-live="polite" className={cn("text-b2 font-semibold", ink)}>
            {changed === 0 ? "The order the settings in force give" : moved === 0 ? "Your changes keep the same order" : `With your changes, ${moved} of ${result.items.length} posts move`}
          </p>
          <p className={cn("mt-0.5 text-b3", muted)}>{SAMPLE_VIEWER}</p>
        </div>
        <span className={cn(pill, tones.grey)}>Sample posts, not real data</span>
      </div>

      <ol aria-describedby={summaryId} className="mt-3 flex flex-col gap-2">
        {result.items.map((item, index) => {
          const post = sampleById.get(item.id)
          if (!post) return null
          const shift = (livePlace.get(item.id) ?? index) - index
          const note = result.notes.get(item.id)
          const media = mediaIcons[item.mediaType]
          const explore = item.sources.includes("explore")
          return <li key={item.id} className={cn("rounded-2xl border p-3 transition-colors sm:p-4", hairline, shift !== 0 && changed > 0 && "border-purple/30 bg-purple/[0.03] dark:bg-royal-500/5")}>
            <div className="flex items-start gap-3">
              <div className="flex w-10 shrink-0 flex-col items-center gap-1">
                <span className={cn("font-heading text-h6 font-semibold tabular-nums", ink)}>{index + 1}</span>
                <Movement shift={changed > 0 ? shift : 0} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className={cn("min-w-0 text-b2 font-semibold", ink)}>{post.title}</p>
                  <p className={cn("text-b2 font-semibold tabular-nums", ink)} title="Score">{formatScore(item.score)}</p>
                </div>
                <p className={cn("mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-b3", muted)}>
                  <span>{post.author}</span>
                  <span className="inline-flex items-center gap-1"><media.icon className="size-3.5" aria-hidden="true" />{media.label}</span>
                  <span>{formatHours(post.ageHours)} old</span>
                  {explore && <span className={cn(pill, tones.purple, "py-0.5")}><Sparkles className="size-3" aria-hidden="true" />Still finding its audience</span>}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-grey-100 dark:bg-muted" aria-hidden="true">
                  <div className={cn("h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none", series.first.swatch)} style={{ width: `${Math.max(2, (item.score / top) * 100)}%` }} />
                </div>
                <p className={cn("mt-1.5 text-b4 tabular-nums", muted)}>
                  quality {formatScore(item.parts.quality)} × relevance {formatScore(item.parts.relevance)} × freshness {formatScore(item.parts.freshness)}{item.parts.exploration !== 1 && ` × exploration ${formatScore(item.parts.exploration)}`}
                </p>
                {note && (note.heldBack.length > 0 || note.exploreSlot || note.relaxed) && <p className={cn("mt-1 text-b3", ink)}>
                  {note.exploreSlot && "Took the slot kept for a new post. "}
                  {note.heldBack.length > 0 && `Held back by ${note.heldBack.map((rule) => ruleWords[rule]).join(" and ")}. `}
                  {note.relaxed && "Placed after the rules were relaxed, as nothing else fit."}
                </p>}
              </div>
            </div>
          </li>
        })}
      </ol>
    </div>
  </div>
}

function Movement({ shift }: { shift: number }) {
  if (shift === 0) return <span className={cn("inline-flex items-center text-b4", muted)}><Minus className="size-3" aria-hidden="true" /><span className="sr-only">no change</span></span>
  const up = shift > 0
  const Icon = up ? ArrowUp : ArrowDown
  return <span className={cn("inline-flex items-center gap-0.5 text-b4 font-semibold", up ? "text-success-700 dark:text-success-300" : "text-warning-700 dark:text-warning-300")}>
    <Icon className="size-3" aria-hidden="true" />{Math.abs(shift)}<span className="sr-only"> {up ? "up" : "down"}</span>
  </span>
}

function Slider({ knob, config, draft, bounds, onChange }: {
  knob: Knob
  config: RankingConfig
  draft: RankingConfig
  bounds: { min: number; max: number } | undefined
  onChange: (value: number) => void
}) {
  const id = useId()
  const path = knob.path.split(".")
  const liveValue = Number(valueAt(config, path))
  const value = Number(valueAt(draft, path))
  // The playground's range, inside the API's, and always wide enough to hold the live value.
  const min = Math.min(Math.max(knob.min, bounds?.min ?? knob.min), liveValue)
  const max = Math.max(Math.min(knob.max, bounds?.max ?? knob.max), liveValue)
  const show = knob.format ?? ((v: number) => formatNumber(v))
  return <div>
    <div className="flex items-baseline justify-between gap-3">
      <label htmlFor={id} className={cn("text-b3 font-semibold", ink)}>{knob.label}</label>
      <span className={cn("text-b3 font-semibold tabular-nums", value !== liveValue ? "text-purple dark:text-royal-300" : ink)}>{show(value)}</span>
    </div>
    <input id={id} type="range" min={min} max={max} step={knob.step} value={value} aria-valuetext={show(value)}
      onChange={(event) => onChange(Number(event.target.value))}
      className="mt-1.5 h-2 w-full cursor-pointer accent-purple" />
    <p className={cn("flex justify-between gap-2 text-b4", muted)}>
      <span>In force: <ParamValue id={`feed.${knob.path}`}>{show(liveValue)}</ParamValue></span>
      {value !== liveValue && <button type="button" onClick={() => onChange(liveValue)} className="cursor-pointer rounded font-semibold text-purple outline-none hover:underline focus-visible:ring-2 focus-visible:ring-purple dark:text-royal-300">Reset</button>}
    </p>
  </div>
}
