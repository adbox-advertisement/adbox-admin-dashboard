import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { cn } from "../lib/cn"
import { formatCount } from "../lib/figures"
import { niceScale, type SignupBar } from "../lib/signups"
import { hairline, ink, muted } from "./tokens"

const MARGIN = { top: 14, right: 6, bottom: 26, left: 34 }

/** A column whose top corners are rounded and whose foot sits square on the baseline. */
function columnPath(left: number, width: number, top: number, bottom: number) {
  const radius = Math.min(4, width / 2, bottom - top)
  const right = left + width
  return `M${left},${bottom}V${top + radius}Q${left},${top} ${left + radius},${top}H${right - radius}Q${right},${top} ${right},${top + radius}V${bottom}Z`
}

/**
 * Sign-ups as columns, one hue: a recessive grid, labels that never crowd, the bar still running
 * drawn lighter, and a tooltip by pointer or arrow keys. The same numbers are in the table under it.
 */
export function SignupsChart({ bars, label, unit }: { bars: SignupBar[]; label: string; unit: string }) {
  const wrapper = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(640)
  const [active, setActive] = useState<number | null>(null)
  const hintId = useId()

  useEffect(() => {
    const element = wrapper.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => { if (entry) setWidth(Math.max(240, Math.round(entry.contentRect.width))) })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const height = width < 480 ? 180 : 220
  const plotWidth = width - MARGIN.left - MARGIN.right
  const plotHeight = height - MARGIN.top - MARGIN.bottom
  const { top, ticks } = niceScale(Math.max(0, ...bars.map((bar) => bar.joined)))
  const band = plotWidth / Math.max(1, bars.length)
  const columnWidth = Math.max(2, Math.min(36, band * 0.62))
  const y = (value: number) => MARGIN.top + plotHeight - (value / top) * plotHeight
  const baseline = y(0)
  // Labels at least ~56px apart, counted back from the latest bar so it is always named.
  const labelEvery = Math.max(1, Math.ceil(56 / band))
  const empty = bars.every((bar) => bar.joined === 0)

  const pick = (event: PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    const at = (event.clientX - box.left) * (width / (box.width || width)) - MARGIN.left
    setActive(Math.min(bars.length - 1, Math.max(0, Math.floor(at / band))))
  }

  const step = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = bars.length - 1
    const moves: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }
    if (event.key in moves) setActive((current) => Math.min(last, Math.max(0, (current ?? last) + moves[event.key])))
    else if (event.key === "Home") setActive(0)
    else if (event.key === "End") setActive(last)
    else if (event.key === "Escape") setActive(null)
    else return
    event.preventDefault()
  }

  const bar = active === null ? null : bars[active]
  const centre = (index: number) => MARGIN.left + index * band + band / 2
  // A label centred under its bar, unless that would run off the edge (11px digits are ~6.5px wide).
  const labelAt = (index: number, text: string) => {
    const half = (text.length * 6.5) / 2
    if (centre(index) + half > width - 2) return { x: width - 2, textAnchor: "end" as const }
    if (centre(index) - half < 2) return { x: 2, textAnchor: "start" as const }
    return { x: centre(index), textAnchor: "middle" as const }
  }
  const tooltipLeft = active === null ? 0 : Math.min(Math.max(centre(active) - 84, 0), width - 168)

  return <div ref={wrapper} role="group" aria-label={label} aria-describedby={hintId} tabIndex={0} onKeyDown={step}
    onFocus={() => setActive((current) => current ?? bars.length - 1)} onBlur={() => setActive(null)}
    className="relative min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-purple">
    <p id={hintId} className="sr-only">Use the arrow keys to read each {unit}; the same numbers are in the table below.</p>
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="block max-w-full touch-pan-y select-none font-sans"
      onPointerMove={pick} onPointerDown={pick} onPointerLeave={() => setActive(null)}>
      {ticks.map((tick) => <g key={tick}>
        <line x1={MARGIN.left} x2={MARGIN.left + plotWidth} y1={y(tick)} y2={y(tick)} strokeWidth={1}
          className={tick === 0 ? "stroke-grey-300 dark:stroke-grey-700" : "stroke-grey-200 dark:stroke-border"} />
        <text x={MARGIN.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-grey-500 text-[11px] tabular-nums dark:fill-muted-foreground">{formatCount(tick)}</text>
      </g>)}
      {active !== null && <rect x={MARGIN.left + active * band} y={MARGIN.top} width={band} height={plotHeight} rx={6} className="fill-grey-100 dark:fill-muted/60" />}
      {bars.map((item, index) => {
        const left = centre(index) - columnWidth / 2
        return <g key={item.key}>
          {item.joined > 0 && <path d={columnPath(left, columnWidth, y(item.joined), baseline)}
            className={cn("fill-purple transition-opacity motion-reduce:transition-none", item.partial && "opacity-50", active !== null && active !== index && "opacity-40")} />}
          {(bars.length - 1 - index) % labelEvery === 0 && <text {...labelAt(index, item.label)} y={MARGIN.top + plotHeight + 18}
            className={cn("text-[11px] tabular-nums", active === index ? "fill-grey-1000 font-semibold dark:fill-foreground" : "fill-grey-500 dark:fill-muted-foreground")}>{item.label}</text>}
        </g>
      })}
      {empty && <text x={MARGIN.left + plotWidth / 2} y={MARGIN.top + plotHeight / 2} textAnchor="middle" className="fill-grey-500 text-[12px] dark:fill-muted-foreground">Nobody joined in this range</text>}
    </svg>

    {bar && <div role="status" className={cn("pointer-events-none absolute top-0 z-10 w-[168px] rounded-xl border bg-white px-3 py-2 shadow-adbox-medium dark:bg-popover", hairline)} style={{ left: tooltipLeft }}>
      <p className={cn("text-b4 font-semibold md:text-b3", muted)}>{bar.period}{bar.partial ? " (so far)" : ""}</p>
      <p className={cn("mt-0.5 text-b2 font-semibold tabular-nums", ink)}>{formatCount(bar.joined)} {bar.joined === 1 ? "sign-up" : "sign-ups"}</p>
    </div>}
  </div>
}
