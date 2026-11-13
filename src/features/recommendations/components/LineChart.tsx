import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { cn } from "../lib/cn"
import { hairline, ink, muted, series as seriesTones, type SeriesTone } from "./tokens"

export type ChartSeries = { id: string; label: string; tone: SeriesTone; points: Array<{ x: number; y: number }> }

type Props = {
  /** The chart's accessible name; the visible title is the section's. */
  label: string
  /** Every series shares the first series' x positions. */
  series: ChartSeries[]
  xDomain: [number, number]
  yDomain: [number, number]
  xTicks: number[]
  yTicks: number[]
  formatX: (x: number) => string
  formatY: (y: number) => string
  /** Vertical hairlines with a short label. */
  markers?: Array<{ x: number; label: string }>
  height?: number
  /** The rows of the table view, and its first column's heading. */
  tableXs: number[]
  tableXLabel: string
}

const MARGIN = { top: 18, bottom: 30, left: 46 }

/** Linear interpolation of a series at x, clamped to its ends. */
function yAt(points: Array<{ x: number; y: number }>, x: number) {
  if (points.length === 0) return Number.NaN
  if (x <= points[0].x) return points[0].y
  for (let i = 1; i < points.length; i++) {
    const [a, b] = [points[i - 1], points[i]]
    if (x <= b.x) return a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x || 1)
  }
  return points[points.length - 1].y
}

/**
 * A line chart drawn as the dashboard's charts are: 2px lines, hairline grid, a legend for two or
 * more series and end labels where they do not collide, a crosshair that reads every series at
 * the pointer (or arrow keys), and the same numbers as a table.
 */
export function LineChart({ label, series, xDomain, yDomain, xTicks, yTicks, formatX, formatY, markers = [], height = 240, tableXs, tableXLabel }: Props) {
  const wrapper = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(640)
  const [active, setActive] = useState<number | null>(null)
  const descriptionId = useId()

  useEffect(() => {
    const element = wrapper.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => { if (entry) setWidth(Math.max(240, Math.round(entry.contentRect.width))) })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const endLabels = width >= 480
  const right = endLabels ? 104 : 18
  const plotWidth = Math.max(120, width - MARGIN.left - right)
  const plotHeight = height - MARGIN.top - MARGIN.bottom
  const x = (value: number) => MARGIN.left + ((value - xDomain[0]) / (xDomain[1] - xDomain[0] || 1)) * plotWidth
  const y = (value: number) => MARGIN.top + plotHeight - ((value - yDomain[0]) / (yDomain[1] - yDomain[0] || 1)) * plotHeight
  const base = series[0]?.points ?? []

  // End labels sit at each line's last value; where two would overlap, the legend carries them.
  const lastOf = (points: ChartSeries["points"]) => points[points.length - 1] as { x: number; y: number } | undefined
  const ends = series.map((item) => ({ item, at: y(lastOf(item.points)?.y ?? yDomain[0]) }))
  const collide = ends.some((a, i) => ends.some((b, j) => i < j && Math.abs(a.at - b.at) < 16))

  const pick = (event: PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    const scale = width / (box.width || width)
    const at = (event.clientX - box.left) * scale
    let nearest = 0
    base.forEach((point, index) => { if (Math.abs(x(point.x) - at) < Math.abs(x(base[nearest].x) - at)) nearest = index })
    setActive(nearest)
  }

  const step = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = base.length - 1
    const moves: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }
    if (event.key in moves) setActive((current) => Math.min(last, Math.max(0, (current ?? 0) + moves[event.key])))
    else if (event.key === "Home") setActive(0)
    else if (event.key === "End") setActive(last)
    else if (event.key === "Escape") setActive(null)
    else return
    event.preventDefault()
  }

  const point = active === null ? null : base[active]
  const tooltipLeft = point ? Math.min(Math.max(x(point.x) - 80, 0), width - 168) : 0

  return <div className="min-w-0">
    {series.length > 1 && <ul aria-label="Legend" className="mb-3 flex flex-wrap gap-x-4 gap-y-1.5">
      {series.map((item) => <li key={item.id} className={cn("flex items-center gap-2 text-b3", ink)}>
        <span aria-hidden="true" className={cn("h-0.5 w-4 rounded-full", seriesTones[item.tone].swatch)} />{item.label}
      </li>)}
    </ul>}

    <div ref={wrapper} role="group" aria-label={label} aria-describedby={descriptionId} tabIndex={0} onKeyDown={step}
      onFocus={() => setActive((current) => current ?? Math.floor(base.length / 2))} onBlur={() => setActive(null)}
      className="relative rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-purple">
      <p id={descriptionId} className="sr-only">Use the arrow keys to read the values; the same numbers are in the table below.</p>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block max-w-full touch-pan-y select-none font-sans"
        onPointerMove={pick} onPointerDown={pick} onPointerLeave={() => setActive(null)} aria-hidden="true">
        {yTicks.map((tick) => <g key={`y${tick}`}>
          <line x1={MARGIN.left} x2={MARGIN.left + plotWidth} y1={y(tick)} y2={y(tick)} className="stroke-grey-200 dark:stroke-border" strokeWidth={1} />
          <text x={MARGIN.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-grey-500 text-[11px] tabular-nums dark:fill-muted-foreground">{formatY(tick)}</text>
        </g>)}
        {xTicks.map((tick) => <text key={`x${tick}`} x={x(tick)} y={MARGIN.top + plotHeight + 20} textAnchor="middle" className="fill-grey-500 text-[11px] tabular-nums dark:fill-muted-foreground">{formatX(tick)}</text>)}

        {markers.map((marker) => <g key={marker.label}>
          <line x1={x(marker.x)} x2={x(marker.x)} y1={MARGIN.top} y2={MARGIN.top + plotHeight} className="stroke-grey-300 dark:stroke-grey-700" strokeWidth={1} />
          <text x={x(marker.x) + 6} y={MARGIN.top + 4} dy="0.7em" className="fill-grey-600 text-[11px] font-semibold dark:fill-muted-foreground">{marker.label}</text>
        </g>)}

        {series.map((item, index) => {
          const path = item.points.map((p, i) => `${i ? "L" : "M"}${x(p.x).toFixed(1)},${y(p.y).toFixed(1)}`).join("")
          const last = lastOf(item.points)
          return <g key={item.id}>
            {series.length === 1 && last && <path d={`${path}L${x(last.x).toFixed(1)},${y(yDomain[0])}L${x(item.points[0].x).toFixed(1)},${y(yDomain[0])}Z`} className={cn(seriesTones[item.tone].fill, "opacity-10")} />}
            <path d={path} fill="none" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" className={seriesTones[item.tone].stroke} />
            {last && <circle cx={x(last.x)} cy={y(last.y)} r={4} strokeWidth={2} className={cn(seriesTones[item.tone].fill, "stroke-white dark:stroke-card")} />}
            {endLabels && !collide && last && <text x={x(last.x) + 10} y={ends[index].at} dy="0.32em" className="fill-grey-700 text-[11px] font-semibold dark:fill-foreground">
              {series.length > 1 ? `${item.label} ${formatY(last.y)}` : formatY(last.y)}
            </text>}
          </g>
        })}

        {point && <g>
          <line x1={x(point.x)} x2={x(point.x)} y1={MARGIN.top} y2={MARGIN.top + plotHeight} className="stroke-grey-400 dark:stroke-grey-500" strokeWidth={1} />
          {series.map((item) => <circle key={item.id} cx={x(point.x)} cy={y(item.points[active ?? 0]?.y ?? 0)} r={4.5} strokeWidth={2} className={cn(seriesTones[item.tone].fill, "stroke-white dark:stroke-card")} />)}
        </g>}
      </svg>

      {point && <div role="status" className={cn("pointer-events-none absolute top-1 z-10 w-[168px] rounded-xl border bg-white p-2.5 shadow-adbox-medium dark:bg-popover", hairline)} style={{ left: tooltipLeft }}>
        <p className={cn("text-b4 font-semibold", muted)}>{formatX(point.x)}</p>
        <ul className="mt-1 flex flex-col gap-1">
          {series.map((item) => <li key={item.id} className="flex items-center gap-2">
            <span aria-hidden="true" className={cn("h-0.5 w-3 shrink-0 rounded-full", seriesTones[item.tone].swatch)} />
            <span className={cn("text-b3 font-semibold tabular-nums", ink)}>{formatY(item.points[active ?? 0]?.y ?? Number.NaN)}</span>
            <span className={cn("min-w-0 truncate text-b4", muted)}>{item.label}</span>
          </li>)}
        </ul>
      </div>}
    </div>

    <details className="group mt-3">
      <summary className={cn("w-fit cursor-pointer rounded text-b3 font-semibold text-purple outline-none focus-visible:ring-2 focus-visible:ring-purple dark:text-royal-300")}>Show the numbers</summary>
      <div className="mt-2 max-w-full overflow-x-auto">
        <table className="w-full min-w-[280px] text-left text-b3">
          <caption className="sr-only">{label}</caption>
          <thead><tr className={cn("border-b", hairline)}>
            <th scope="col" className={cn("py-2 pr-4 font-semibold", muted)}>{tableXLabel}</th>
            {series.map((item) => <th key={item.id} scope="col" className={cn("py-2 pr-4 font-semibold", muted)}>{item.label}</th>)}
          </tr></thead>
          <tbody>
            {tableXs.map((value) => <tr key={value} className={cn("border-b last:border-0", hairline)}>
              <th scope="row" className={cn("py-1.5 pr-4 font-normal tabular-nums", ink)}>{formatX(value)}</th>
              {series.map((item) => <td key={item.id} className={cn("py-1.5 pr-4 font-semibold tabular-nums", ink)}>{formatY(yAt(item.points, value))}</td>)}
            </tr>)}
          </tbody>
        </table>
      </div>
    </details>
  </div>
}
