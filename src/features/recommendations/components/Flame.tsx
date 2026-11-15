import { useId, type CSSProperties } from "react"
import { cn } from "../lib/cn"
import { flameDelay } from "../lib/top-trends"
import "../styles/flame.css"

// The app's teardrops (DiscoverFlame._flame) in a 16 × 20 box: the outer flame, a middle one from
// 20% to 80% across and 28% down, and a core from 36% to 64% across and 58% down.
const OUTER = "M8 20C-0.8 19 0.8 9 8 0C15.2 9 16.8 19 8 20Z"
const MIDDLE = "M8 20C2.72 19.28 3.68 12.08 8 5.6C12.32 12.08 13.28 19.28 8 20Z"
const CORE = "M8 20C5.536 19.58 5.984 15.38 8 11.6C10.016 15.38 10.464 19.58 8 20Z"

/**
 * The flame the app burns beside its top trends, flickering out of step by rank. Decorative: the
 * rank beside it says the same in words.
 */
export function Flame({ rank, className }: { rank: number; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "")
  return <svg viewBox="-1 -0.5 18 21" width="18" height="21" aria-hidden="true" focusable="false" data-testid="trend-flame"
    className={cn("adbox-flame shrink-0", className)} style={{ "--flame-delay": `${flameDelay(rank)}s` } as CSSProperties}>
    <defs>
      <radialGradient id={`${id}-glow`}>
        <stop offset="0" className="adbox-flame-amber" />
        <stop offset="1" className="adbox-flame-amber" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-outer`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" className="adbox-flame-red" />
        <stop offset="1" className="adbox-flame-gold" />
      </linearGradient>
      <linearGradient id={`${id}-middle`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" className="adbox-flame-amber" />
        <stop offset="1" className="adbox-flame-yellow" />
      </linearGradient>
    </defs>
    <ellipse className="adbox-flame-glow" cx="8" cy="14.4" rx="11" ry="9" fill={`url(#${id}-glow)`} />
    <path className="adbox-flame-outer" d={OUTER} fill={`url(#${id}-outer)`} />
    <path className="adbox-flame-middle" d={MIDDLE} fill={`url(#${id}-middle)`} />
    <path className="adbox-flame-core" d={CORE} />
  </svg>
}
