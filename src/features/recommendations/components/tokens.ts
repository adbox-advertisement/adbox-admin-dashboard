import { CodeXml, Coins, Compass, Server, SlidersHorizontal, Smartphone, type LucideIcon } from "lucide-react"
import type { ControlId } from "../data/catalog"

// The section's card, text and badge classes, as the rest of the dashboard draws them.

export const surface = "rounded-[20px] bg-white shadow-adbox-small dark:bg-card"
export const muted = "text-grey-500 dark:text-muted-foreground"
export const ink = "text-grey-1000 dark:text-foreground"
export const hairline = "border-grey-200 dark:border-border"
export const pill = "inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-b4 font-semibold leading-none"
export const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-card"

export const tones = {
  purple: "bg-purple/10 text-purple dark:bg-royal-500/15 dark:text-royal-300",
  success: "bg-success-500/10 text-success-700 dark:text-success-300",
  warning: "bg-warning-500/10 text-warning-700 dark:text-warning-300",
  grey: "bg-grey-100 text-grey-700 dark:bg-muted dark:text-muted-foreground",
} as const
export type Tone = keyof typeof tones

export const controlIcons: Record<ControlId, LucideIcon> = {
  "feed-policy": SlidersHorizontal,
  "discover-policy": Compass,
  gold: Coins,
  environment: Server,
  code: CodeXml,
  app: Smartphone,
}

// Chart marks: the dashboard's validated categorical slots (light / dark), as the institution map
// uses them: brand indigo, orange, aqua. Text never wears these; marks only.
export const series = {
  first: { stroke: "stroke-[#5946e8] dark:stroke-[#6d5df6]", fill: "fill-[#5946e8] dark:fill-[#6d5df6]", swatch: "bg-[#5946e8] dark:bg-[#6d5df6]" },
  second: { stroke: "stroke-[#eb6834] dark:stroke-[#d95926]", fill: "fill-[#eb6834] dark:fill-[#d95926]", swatch: "bg-[#eb6834] dark:bg-[#d95926]" },
  // Below 3:1 on white: only ever beside the legend, end labels and the table view.
  third: { stroke: "stroke-[#1baf7a] dark:stroke-[#199e70]", fill: "fill-[#1baf7a] dark:fill-[#199e70]", swatch: "bg-[#1baf7a] dark:bg-[#199e70]" },
  context: { stroke: "stroke-grey-400 dark:stroke-grey-500", fill: "fill-grey-400 dark:fill-grey-500", swatch: "bg-grey-400 dark:bg-grey-500" },
} as const
export type SeriesTone = keyof typeof series
