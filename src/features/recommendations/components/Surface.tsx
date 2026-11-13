import type { ReactNode } from "react"
import { CircleCheck, CircleDashed, Compass, LoaderCircle, Lock, TriangleAlert, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "../lib/cn"
import type { LiveStatus } from "../hooks"
import { CONTROLS, REACH_LABELS, type ControlId, type Reach } from "../data/catalog"
import { controlIcons, hairline, ink, muted, pill, tones, type Tone } from "./tokens"

export function IconTile({ icon: Icon, tone = "purple", size = "md" }: { icon: LucideIcon; tone?: Tone; size?: "sm" | "md" | "lg" }) {
  return <span className={cn("flex shrink-0 items-center justify-center", tones[tone], size === "sm" ? "size-8 rounded-lg" : size === "md" ? "size-10 rounded-xl" : "size-12 rounded-2xl")}>
    <Icon className={size === "sm" ? "size-4" : size === "md" ? "size-5" : "size-6"} aria-hidden="true" />
  </span>
}

const reachStyle: Record<Reach, { tone: Tone; icon: LucideIcon }> = {
  "in-app": { tone: "success", icon: CircleCheck },
  "via-discover": { tone: "purple", icon: Compass },
  "not-yet": { tone: "grey", icon: CircleDashed },
}

/** Whether people feel this in the app today. Icon and words, never colour alone. */
export function ReachPill({ reach, className }: { reach: Reach; className?: string }) {
  const { tone, icon: Icon } = reachStyle[reach]
  return <span className={cn(pill, tones[tone], className)}><Icon className="size-3" aria-hidden="true" />{REACH_LABELS[reach]}</span>
}

export function ControlPill({ control, className }: { control: ControlId; className?: string }) {
  const Icon = controlIcons[control]
  return <span className={cn(pill, tones.grey, className)}><Icon className="size-3" aria-hidden="true" />{CONTROLS[control].label}</span>
}

const statusStyle: Record<LiveStatus, { tone: Tone; icon: LucideIcon; label: string }> = {
  live: { tone: "success", icon: CircleCheck, label: "Live" },
  loading: { tone: "grey", icon: LoaderCircle, label: "Loading" },
  locked: { tone: "grey", icon: Lock, label: "Defaults shown" },
  error: { tone: "warning", icon: TriangleAlert, label: "Couldn't load" },
}

export function StatusPill({ status, label, className }: { status: LiveStatus; label?: string; className?: string }) {
  const { tone, icon: Icon, label: fallback } = statusStyle[status]
  return <span className={cn(pill, tones[tone], className)}>
    <Icon className={cn("size-3", status === "loading" && "animate-spin motion-reduce:animate-none")} aria-hidden="true" />{label ?? fallback}
  </span>
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div role="alert" className="flex flex-wrap items-center gap-3 p-5">
    <p className="text-sm text-destructive">{message}</p>
    <Button type="button" variant="outline" className="cursor-pointer rounded-full" onClick={onRetry}>Retry</Button>
  </div>
}

/** A labelled number, read as a figure rather than a chart. */
export function Figure({ label, value, hint, className }: { label: string; value: ReactNode; hint?: ReactNode; className?: string }) {
  return <div className={cn("min-w-0 rounded-2xl border p-4", hairline, className)}>
    <p className={cn("text-b3 font-semibold", muted)}>{label}</p>
    <p className={cn("mt-2 font-heading text-h6 font-semibold", ink)}>{value}</p>
    {hint && <p className={cn("mt-1.5 text-b3 leading-5", muted)}>{hint}</p>}
  </div>
}
