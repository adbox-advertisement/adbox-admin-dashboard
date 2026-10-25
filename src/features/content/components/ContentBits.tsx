import { useId, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, ChevronRight, Lock, Search, SearchX, X, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "../lib/cn"
import { initials } from "../lib/format"
import { iconTones, pill, pillTones } from "../lib/styles"
import { uploaderName, type Person } from "../types"

export const surface = "rounded-[20px] bg-white shadow-adbox-small dark:bg-card"
export const muted = "text-grey-500 dark:text-muted-foreground"
export const ink = "text-grey-1000 dark:text-foreground"
export const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple"
export const skeleton = "animate-pulse rounded bg-grey-100 dark:bg-muted"

export function Pill({ tone = "neutral", children, className }: { tone?: keyof typeof pillTones; children: ReactNode; className?: string }) {
  return <span className={cn(pill, pillTones[tone], className)}>{children}</span>
}

export function IconTile({ icon: Icon, tone = "purple", size = "md" }: { icon: LucideIcon; tone?: keyof typeof iconTones; size?: "sm" | "md" | "lg" }) {
  const box = size === "lg" ? "size-12 rounded-2xl" : size === "md" ? "size-10 rounded-xl" : "size-8 rounded-lg"
  return <span className={cn("flex shrink-0 items-center justify-center", box, iconTones[tone])}><Icon className={size === "sm" ? "size-4" : "size-5"} aria-hidden="true" /></span>
}

export function UploaderAvatar({ user, size = "sm" }: { user: Person | null; size?: "xs" | "sm" | "md" | "lg" }) {
  const name = uploaderName(user)
  const image = user?.userProfile?.image
  const dimensions = { xs: "size-6 text-[10px]", sm: "size-7 text-[11px]", md: "size-10 text-sm", lg: "size-14 text-base" }[size]
  if (image) return <img src={image} alt="" loading="lazy" referrerPolicy="no-referrer" className={cn("shrink-0 rounded-full object-cover", dimensions)} />
  return <span aria-hidden="true" className={cn("flex shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-purple)] font-semibold text-white", dimensions)}>{initials(name)}</span>
}

/** A person beside content. With `to`, the chip links there (usually: everything they posted). */
export function UploaderChip({ user, to, label, size = "sm" }: { user: Person | null; to?: string; label?: string; size?: "xs" | "sm" | "md" }) {
  const name = uploaderName(user)
  const username = user?.userProfile?.username
  const body = <>
    <UploaderAvatar user={user} size={size} />
    <span className="min-w-0">
      <span className={cn("block truncate font-semibold", size === "md" ? "text-b2" : "text-b3", ink)}>{name}</span>
      {username && size !== "xs" && <span className={cn("block truncate text-b3", muted)}>@{username}</span>}
    </span>
  </>
  if (!to || !user) return <span className="flex min-w-0 items-center gap-2">{body}</span>
  return <Link to={to} aria-label={label ?? `Show all uploads by ${name}`} onClick={(event) => event.stopPropagation()}
    className={cn("flex min-w-0 items-center gap-2 rounded-full text-left transition-opacity hover:opacity-80", focusRing)}>
    {body}
  </Link>
}

export function SearchBox({ value, onChange, label, className }: { value: string; onChange: (value: string) => void; label: string; className?: string }) {
  const id = useId()
  return <div className={cn("relative min-w-0", className)}>
    <label htmlFor={id} className="sr-only">{label}</label>
    <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-grey-400 dark:text-muted-foreground" />
    <Input id={id} type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={label} autoComplete="off" maxLength={200}
      className="h-11 w-full rounded-full border-grey-200 bg-grey-50 pl-10 pr-10 text-b3 focus-visible:border-purple/40 focus-visible:ring-0 dark:border-border dark:bg-background md:text-b2 [&::-webkit-search-cancel-button]:hidden" />
    {value && <button type="button" aria-label="Clear search" onClick={() => onChange("")} className="absolute right-0 top-0 flex h-11 w-10 cursor-pointer items-center justify-center text-grey-400 hover:text-grey-1000 dark:text-muted-foreground dark:hover:text-foreground">
      <X className="size-4" aria-hidden="true" />
    </button>}
  </div>
}

export function Segmented<T extends string>({ label, value, options, onChange, className, iconOnlyOnMobile }: {
  label: string
  /** Show only icons below the `sm` breakpoint; the text stays available to screen readers. */
  iconOnlyOnMobile?: boolean
  value: T
  options: Array<{ value: T; label: string; icon?: LucideIcon }>
  onChange: (value: T) => void
  className?: string
}) {
  return <div role="radiogroup" aria-label={label} className={cn("flex w-fit shrink-0 gap-1 rounded-full bg-grey-50 p-1 dark:bg-background", className)}>
    {options.map(({ value: option, label: text, icon: Icon }) => <button key={option} type="button" role="radio" aria-checked={value === option} onClick={() => onChange(option)}
      className={cn("flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-b3 font-semibold transition-colors", focusRing,
        value === option ? "bg-white text-purple shadow-adbox-small dark:bg-card" : "text-grey-500 hover:text-grey-1000 dark:text-muted-foreground dark:hover:text-foreground")}>
      {Icon && <Icon className="size-4" aria-hidden="true" />}{iconOnlyOnMobile && Icon ? <span className="sr-only sm:not-sr-only">{text}</span> : text}
    </button>)}
  </div>
}

/** One-tap filters. Each chip is a toggle button, so the active one is announced as pressed. */
export function FilterChips<T extends string>({ label, value, options, onChange }: {
  label: string
  value: T
  options: Array<{ value: T; label: string; icon?: LucideIcon; count?: number }>
  onChange: (value: T) => void
}) {
  return <div role="group" aria-label={label} className="-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none]">
    {options.map(({ value: option, label: text, icon: Icon, count }) => {
      const active = value === option
      return <button key={option} type="button" aria-pressed={active} onClick={() => onChange(option)}
        className={cn("flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-b3 font-semibold transition-colors", focusRing,
          active ? "border-transparent bg-purple text-white shadow-adbox-small" : "border-grey-200 bg-white text-grey-600 hover:border-purple/40 hover:text-purple dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:text-foreground")}>
        {Icon && <Icon className="size-4" aria-hidden="true" />}{text}
        {count !== undefined && <span className={cn("rounded-full px-1.5 py-0.5 text-[11px] leading-none tabular-nums", active ? "bg-white/20" : "bg-grey-100 dark:bg-muted")}>{count.toLocaleString()}</span>}
      </button>
    })}
  </div>
}

export function StatCard({ icon, tone, label, value, hint, to }: {
  icon: LucideIcon
  tone: keyof typeof iconTones
  label: string
  value: number | undefined
  hint?: string
  to?: string
}) {
  const body = <>
    <div className="flex items-center justify-between gap-2">
      <IconTile icon={icon} tone={tone} />
      {to && <ChevronRight className="size-4 text-grey-300 transition-transform group-hover:translate-x-0.5 group-hover:text-purple dark:text-muted-foreground" aria-hidden="true" />}
    </div>
    <div className="mt-4 min-w-0">
      <p className={cn("text-h4 font-bold leading-none tabular-nums", ink)}>
        {value === undefined ? <span className={cn(skeleton, "inline-block h-7 w-14 align-middle")} aria-label="Loading" /> : value.toLocaleString()}
      </p>
      <p className={cn("mt-2 truncate text-b3 font-semibold", ink)}>{label}</p>
      {hint && <p className={cn("truncate text-b3", muted)}>{hint}</p>}
    </div>
  </>
  const className = cn(surface, "group flex min-w-0 flex-col p-4 sm:p-5")
  return to
    ? <Link to={to} className={cn(className, "transition-shadow hover:shadow-adbox-medium", focusRing)}>{body}</Link>
    : <div className={className}>{body}</div>
}

export function Section({ title, description, action, children, className, bodyClassName }: {
  title: string
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  const id = useId()
  return <section aria-labelledby={id} className={cn(surface, "flex min-w-0 flex-col", className)}>
    <header className="flex flex-wrap items-start justify-between gap-3 px-5 pb-3 pt-5">
      <div className="min-w-0">
        <h2 id={id} className={cn("font-heading text-b1 font-semibold", ink)}>{title}</h2>
        {description && <p className={cn("mt-0.5 text-b3", muted)}>{description}</p>}
      </div>
      {action}
    </header>
    <div className={cn("px-5 pb-5", bodyClassName)}>{children}</div>
  </section>
}

/** The bar above a list: search and filters. Wraps to stacked rows on narrow screens. */
export function Toolbar({ children }: { children: ReactNode }) {
  return <div className={cn(surface, "flex min-w-0 flex-col gap-3 p-3 sm:p-4")}>{children}</div>
}

export function EmptyState({ icon: Icon = SearchX, title, children, action }: { icon?: LucideIcon; title: string; children?: ReactNode; action?: ReactNode }) {
  return <div className="flex flex-col items-center px-6 py-14 text-center">
    <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-purple/10 text-purple"><Icon className="size-6" aria-hidden="true" /></span>
    <h3 className={cn("font-heading text-base font-semibold", ink)}>{title}</h3>
    {children && <p className={cn("mt-1.5 max-w-sm text-sm leading-6", muted)}>{children}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div role="alert" className="flex flex-wrap items-center gap-3 p-6">
    <p className="text-sm text-destructive">{message}</p>
    <Button type="button" variant="outline" className="rounded-full" onClick={onRetry}>Retry</Button>
  </div>
}

export function NoAccess({ permission, what }: { permission: string; what: string }) {
  return <div className="flex w-full flex-col items-center px-4 py-16 text-center">
    <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-purple/10 text-purple"><Lock className="size-6" aria-hidden="true" /></span>
    <h2 className={cn("font-heading text-base font-semibold", ink)}>You don't have access to {what}</h2>
    <p className={cn("mt-1.5 max-w-sm text-sm leading-6", muted)}>Ask a Super Admin for the <span className="font-mono text-b3">{permission}</span> permission.</p>
  </div>
}

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return <Link to={to} className={cn("inline-flex w-fit items-center gap-1.5 rounded-full text-b3 font-semibold hover:text-purple", focusRing, muted)}>
    <ArrowLeft className="size-4" aria-hidden="true" />{children}
  </Link>
}

export function MoreLink({ to, children }: { to: string; children: ReactNode }) {
  return <Link to={to} className={cn("inline-flex shrink-0 items-center gap-1 rounded-full text-b3 font-semibold text-purple hover:underline", focusRing)}>
    {children}<ChevronRight className="size-4" aria-hidden="true" />
  </Link>
}

/** A labelled fact in a detail view. Renders nothing for an empty value. */
export function Fact({ label, value, icon, mono }: { label: string; value: ReactNode; icon?: ReactNode; mono?: boolean }) {
  if (value === null || value === undefined || value === "") return null
  return <div className="min-w-0 rounded-xl bg-grey-50 px-3 py-2.5 dark:bg-background">
    <dt className={cn("text-b3", muted)}>{label}</dt>
    <dd className={cn("mt-0.5 flex min-w-0 items-center gap-1.5 break-words text-b3 font-medium", ink, mono && "break-all font-mono text-b3")}>{icon}{value}</dd>
  </div>
}
