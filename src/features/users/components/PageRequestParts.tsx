import { CircleAlert, CircleCheck, Landmark, TriangleAlert } from "lucide-react"
import { cn } from "../lib/cn"
import { groupInitials, pageRequestStatusLabels, type PageRequestCheck, type PageRequestStatus } from "../lib/page-requests"
import { pill } from "./UserBadges"

const tones = {
  success: "bg-success-500/10 text-success-700 dark:text-success-300",
  danger: "bg-destructive/10 text-destructive",
  warning: "bg-warning-500/10 text-warning-700 dark:text-warning-300",
  neutral: "bg-grey-100 text-grey-600 dark:bg-muted dark:text-muted-foreground",
  blue: "bg-blue/10 text-blue dark:text-cyan",
} as const

const statusTone: Record<PageRequestStatus, keyof typeof tones> = {
  NEW: "neutral",
  IN_REVIEW: "warning",
  NEEDS_CHANGES: "warning",
  APPROVED: "success",
  DECLINED: "danger",
}

/** "New", "In review · Ama", "Approved"… `mine` says the reviewer is the admin looking. */
export function PageRequestStatusPill({ request, mine = false }: { request: { status: PageRequestStatus; reviewer: string | null }; mine?: boolean }) {
  const reviewer = request.status === "IN_REVIEW" && request.reviewer ? (mine ? "you" : request.reviewer.split(" ")[0]) : null
  return <span className={cn(pill, tones[statusTone[request.status]])}>
    {pageRequestStatusLabels[request.status]}{reviewer && ` · ${reviewer}`}
  </span>
}

const checkStyles: Record<PageRequestCheck["tone"], { tone: keyof typeof tones; Icon: typeof CircleCheck; label: string }> = {
  ok: { tone: "success", Icon: CircleCheck, label: "OK" },
  look: { tone: "warning", Icon: TriangleAlert, label: "Look" },
  problem: { tone: "danger", Icon: CircleAlert, label: "Problem" },
}

/** One automatic check's verdict; the label carries it, never the colour alone. */
export function CheckPill({ tone, label }: { tone: PageRequestCheck["tone"]; label?: string }) {
  const { Icon, label: fallback } = checkStyles[tone]
  return <span className={cn(pill, tones[checkStyles[tone].tone])}><Icon className="size-3.5" aria-hidden="true" />{label ?? fallback}</span>
}

/** Badge 3, Staff & faculty: what every approved page carries after its name. */
export function StaffBadgePill() {
  return <span className={cn(pill, tones.blue)}><Landmark className="size-3.5" aria-hidden="true" />Staff &amp; faculty</span>
}

/** A group's logo: its initials, when it sent no picture. */
export function GroupLogo({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  return <span aria-hidden="true" className={cn(
    "flex shrink-0 items-center justify-center rounded-full bg-grey-1000 font-semibold text-white dark:bg-foreground dark:text-background",
    size === "lg" ? "size-16 text-b1" : "size-9 text-b4",
  )}>{groupInitials(name)}</span>
}
