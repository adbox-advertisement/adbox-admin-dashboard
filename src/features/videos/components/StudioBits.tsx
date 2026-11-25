import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, CircleAlert, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "../lib/cn"
import { accountName, hueOf, initials } from "../lib/format"
import { focusRing, ink, muted, panel } from "./tokens"
import type { StudioAccount } from "../types"


/** An account's photo, or its initials on its own colour. */
export function AccountAvatar({ account, size = "md", className }: { account: Pick<StudioAccount, "fullName" | "username" | "image">; size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const name = accountName(account)
  const box = { sm: "size-8 text-[11px]", md: "size-11 text-sm", lg: "size-16 text-lg", xl: "size-24 text-2xl" }[size]
  if (account.image) return <img src={account.image} alt="" loading="lazy" referrerPolicy="no-referrer" className={cn("shrink-0 rounded-full bg-grey-100 object-cover ring-2 ring-white dark:bg-muted dark:ring-card", box, className)} />
  return <span aria-hidden="true" style={{ ["--studio-hue" as string]: hueOf(name) }}
    className={cn("studio-cover-fallback flex shrink-0 items-center justify-center rounded-full font-heading font-bold text-white ring-2 ring-white dark:ring-card", box, className)}>
    {initials(name)}
  </span>
}

const tones = {
  purple: "bg-purple/10 text-purple dark:bg-royal-500/15 dark:text-royal-300",
  success: "bg-success-500/10 text-success-700 dark:text-success-300",
  warning: "bg-warning-500/10 text-warning-700 dark:text-warning-300",
  danger: "bg-error-500/10 text-error-700 dark:text-error-300",
  neutral: "bg-grey-100 text-grey-700 dark:bg-muted dark:text-muted-foreground",
} as const
export type PillTone = keyof typeof tones

export function Pill({ tone = "neutral", icon: Icon, children, className }: { tone?: PillTone; icon?: LucideIcon; children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none", tones[tone], className)}>
    {Icon && <Icon className="size-3" aria-hidden="true" />}{children}
  </span>
}

/** A labelled figure. */
export function Figure({ label, value, hint, icon: Icon, className }: { label: string; value: ReactNode; hint?: ReactNode; icon?: LucideIcon; className?: string }) {
  return <div className={cn(panel, "flex min-w-0 items-center gap-3.5 px-5 py-4", className)}>
    {Icon && <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-purple/10 text-purple dark:bg-royal-500/15 dark:text-royal-300"><Icon className="size-5" aria-hidden="true" /></span>}
    <span className="min-w-0">
      <span className={cn("block truncate text-b3 md:text-b2", muted)}>{label}</span>
      <span className={cn("block font-heading text-h5 font-semibold tabular-nums", ink)}>{value}</span>
      {hint && <span className={cn("block truncate text-b4 md:text-b3", muted)}>{hint}</span>}
    </span>
  </div>
}

export function SectionHeading({ title, description, action, id }: { title: string; description?: ReactNode; action?: ReactNode; id?: string }) {
  return <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
    <div className="min-w-0">
      <h2 id={id} className={cn("font-heading text-h6 font-semibold md:text-h5", ink)}>{title}</h2>
      {description && <p className={cn("mt-1 text-b3 leading-5 md:text-b2", muted)}>{description}</p>}
    </div>
    {action}
  </div>
}

export function MoreLink({ to, children }: { to: string; children: ReactNode }) {
  return <Link to={to} className={cn("inline-flex items-center gap-1 rounded-full text-b3 font-semibold text-purple hover:underline dark:text-royal-300 md:text-b2", focusRing)}>
    {children}<ArrowRight className="size-4" aria-hidden="true" />
  </Link>
}

export function EmptyState({ icon: Icon, title, children, action }: { icon: LucideIcon; title: string; children?: ReactNode; action?: ReactNode }) {
  return <div className={cn(panel, "video-reveal flex flex-col items-center px-6 py-14 text-center")}>
    <span className="studio-cover-fallback mb-4 flex size-16 items-center justify-center rounded-3xl text-white shadow-adbox-medium" style={{ ["--studio-hue" as string]: 252 }}>
      <Icon className="size-7" aria-hidden="true" />
    </span>
    <h3 className={cn("font-heading text-h6 font-semibold", ink)}>{title}</h3>
    {children && <div className={cn("mt-2 max-w-md text-b3 leading-6 md:text-b2", muted)}>{children}</div>}
    {action && <div className="mt-5">{action}</div>}
  </div>
}

export function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div role="alert" className={cn(panel, "flex flex-wrap items-center gap-3 px-5 py-4")}>
    <CircleAlert className="size-5 shrink-0 text-destructive" aria-hidden="true" />
    <p className="flex-1 text-b3 text-destructive md:text-b2">{message}</p>
    <Button type="button" variant="outline" className="cursor-pointer rounded-full" onClick={onRetry}>Retry</Button>
  </div>
}

export function SkeletonGrid({ count = 6, className, label }: { count?: number; className?: string; label: string }) {
  return <div role="status" aria-label={label} className={cn("grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3", className)}>
    {Array.from({ length: count }, (_, index) => <div key={index} className={cn(panel, "h-56 animate-pulse bg-grey-50 dark:bg-muted/40")} />)}
  </div>
}
