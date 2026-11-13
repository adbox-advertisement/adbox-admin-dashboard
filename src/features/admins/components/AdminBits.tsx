import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, CheckCircle2, Crown, Lock, SearchX, ShieldCheck, UserX, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { isSuperAdminRole, roleTitle } from "../lib/catalog"
import { adminDisplayName, type Admin, type AdminRole } from "../types"

export const card = "rounded-[20px] bg-white shadow-adbox-small dark:bg-card"
const chip = "inline-flex max-w-full items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none"
export const primaryButton = "h-10 rounded-full bg-[image:var(--gradient-purple)] px-4 text-white hover:opacity-90"

export function PageIntro({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
    <p className="max-w-3xl text-sm leading-6 text-grey-500 dark:text-muted-foreground">{children}</p>
    {action}
  </div>
}

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return <Link to={to} className="inline-flex w-fit items-center gap-1.5 rounded-full text-b3 font-semibold text-grey-500 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-purple dark:text-muted-foreground">
    <ArrowLeft className="size-4" aria-hidden="true" />{children}
  </Link>
}

export function AdminAvatar({ admin, size = "md" }: { admin: Pick<Admin, "firstName" | "lastName" | "email" | "roles">; size?: "md" | "lg" }) {
  const name = adminDisplayName(admin)
  const letters = (admin.firstName || admin.lastName) ? `${admin.firstName.charAt(0)}${admin.lastName.charAt(0)}` : name.charAt(0)
  const superAdmin = admin.roles.some(isSuperAdminRole)
  return <span aria-hidden="true" className={cn("flex shrink-0 items-center justify-center rounded-full font-semibold uppercase",
    size === "lg" ? "size-16 text-lg" : "size-10 text-sm",
    superAdmin ? "bg-[image:var(--gradient-purple)] text-white" : "bg-blue/10 text-blue dark:bg-cyan/10 dark:text-cyan")}>{letters}</span>
}

export function RoleChip({ role }: { role: Pick<AdminRole, "name"> }) {
  const superAdmin = isSuperAdminRole(role)
  const Icon = superAdmin ? Crown : ShieldCheck
  return <span className={cn(chip, superAdmin ? "bg-purple/10 text-purple" : "bg-grey-100 text-grey-800 dark:bg-muted dark:text-foreground")}>
    <Icon className="size-3 shrink-0" aria-hidden="true" /><span className="truncate">{roleTitle(role.name)}</span>
  </span>
}

export function StatusPill({ active }: { active: boolean }) {
  return active
    ? <span className={cn(chip, "bg-success-500/10 text-success-700 dark:text-success-400")}><CheckCircle2 className="size-3" aria-hidden="true" />Active</span>
    : <span className={cn(chip, "bg-grey-100 text-grey-600 dark:bg-muted dark:text-muted-foreground")}><UserX className="size-3" aria-hidden="true" />Deactivated</span>
}

export function YouTag() {
  return <span className={cn(chip, "bg-blue/10 text-blue dark:bg-cyan/10 dark:text-cyan")}>You</span>
}

export function SensitiveTag() {
  return <span className={cn(chip, "bg-warning-500/15 text-warning-800 dark:text-warning-300")} title="Changes who can do what"><Lock className="size-3" aria-hidden="true" />Sensitive</span>
}

/** Why something can't be changed here. */
export function LockNote({ children }: { children: ReactNode }) {
  return <p className="flex items-start gap-2.5 rounded-2xl bg-grey-50 px-4 py-3 text-sm text-grey-600 dark:bg-background dark:text-muted-foreground">
    <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span>{children}</span>
  </p>
}

export function Section({ title, description, action, children, id }: { title: string; description?: ReactNode; action?: ReactNode; children: ReactNode; id?: string }) {
  return <section aria-labelledby={id} className={cn(card, "min-w-0")}>
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-grey-200 px-5 py-4 dark:border-border">
      <div className="min-w-0">
        <h2 id={id} className="font-heading text-base font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-xs leading-5 text-grey-500 dark:text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
}

export function Stat({ icon: Icon, label, value, hint, tone = "blue" }: { icon: LucideIcon; label: string; value: ReactNode; hint?: string; tone?: "blue" | "purple" | "muted" }) {
  return <div className={cn(card, "flex min-w-0 items-center gap-3 p-4")}>
    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl",
      tone === "purple" ? "bg-purple/10 text-purple" : tone === "muted" ? "bg-grey-100 text-grey-600 dark:bg-muted dark:text-muted-foreground" : "bg-blue/10 text-blue dark:bg-cyan/10 dark:text-cyan")}>
      <Icon className="size-5" aria-hidden="true" />
    </span>
    <span className="min-w-0">
      <span className="block truncate text-xs text-grey-500 dark:text-muted-foreground">{label}</span>
      <span className="block font-heading text-2xl font-semibold tabular-nums">{value ?? "—"}</span>
      {hint && <span className="block truncate text-[11px] text-grey-500 dark:text-muted-foreground">{hint}</span>}
    </span>
  </div>
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
    <span className="flex size-12 items-center justify-center rounded-2xl bg-purple/10 text-purple"><SearchX className="size-6" aria-hidden="true" /></span>
    <p className="font-heading text-base font-semibold">{title}</p>
    {children && <p className="max-w-sm text-sm leading-6 text-grey-500 dark:text-muted-foreground">{children}</p>}
  </div>
}

export function Failed({ message, onRetry, retryLabel = "Try again" }: { message: string; onRetry: () => void; retryLabel?: string }) {
  return <div role="alert" className="flex flex-wrap items-center gap-3 p-5">
    <p className="text-sm text-destructive">{message}</p>
    <Button type="button" variant="outline" className="h-9 rounded-full px-4" onClick={onRetry}>{retryLabel}</Button>
  </div>
}

export function Loading({ label, rows = 4 }: { label: string; rows?: number }) {
  return <div role="status" aria-label={label} className="flex flex-col gap-3 p-5">
    {Array.from({ length: rows }, (_, index) => <div key={index} className="h-12 animate-pulse rounded-xl bg-muted" />)}
  </div>
}

export function NoAccess({ what }: { what: string }) {
  return <div className={cn(card, "flex flex-col items-center gap-2 px-6 py-14 text-center")}>
    <span className="flex size-12 items-center justify-center rounded-2xl bg-grey-100 text-grey-600 dark:bg-muted dark:text-muted-foreground"><Lock className="size-6" aria-hidden="true" /></span>
    <p className="font-heading text-base font-semibold">You can't view {what}</p>
    <p className="max-w-sm text-sm leading-6 text-grey-500 dark:text-muted-foreground">Ask a Super Admin for access.</p>
  </div>
}

export type Choice<T extends string> = { value: T; label: string; count?: number }

export function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: Array<Choice<T>>; onChange: (value: T) => void }) {
  return <div role="radiogroup" aria-label={label} className="flex w-fit max-w-full flex-wrap gap-1 rounded-3xl bg-grey-50 p-1 dark:bg-background">
    {options.map((option) => {
      const active = option.value === value
      return <button key={option.value} type="button" role="radio" aria-checked={active} onClick={() => onChange(option.value)}
        className={cn("inline-flex min-h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-b3 font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-purple",
          active ? "bg-white text-purple shadow-adbox-small dark:bg-card" : "text-grey-500 hover:text-grey-1000 dark:text-muted-foreground dark:hover:text-foreground")}>
        {option.label}
        {option.count !== undefined && <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", active ? "bg-purple/10" : "bg-grey-200/70 dark:bg-muted")}>{option.count}</span>}
      </button>
    })}
  </div>
}

/** What the signed-in admin can do here, in a line, so nobody wonders why a button is missing. */
export function YourAccess({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  return isSuperAdmin
    ? <p className="flex items-start gap-2.5 rounded-2xl bg-purple/5 px-4 py-3 text-sm text-grey-700 dark:text-foreground">
      <Crown className="mt-0.5 size-4 shrink-0 text-purple" aria-hidden="true" /><span>You're a Super Admin: you can change admins' roles, permissions and status, and manage roles.</span>
    </p>
    : <LockNote>You can view admins and roles. Only a Super Admin can change roles, permissions or account status.</LockNote>
}

/** A saved change, said once; dismissable. */
export function Saved({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return <div role="status" className="flex items-start gap-3 rounded-2xl bg-success-500/10 px-4 py-3 text-sm text-success-800 dark:text-success-300">
    <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
    <p className="flex-1">{message}</p>
    <button type="button" onClick={onDismiss} aria-label="Dismiss" className="rounded-full px-1.5 text-xs font-semibold outline-none hover:bg-success-500/15 focus-visible:ring-2 focus-visible:ring-purple">Dismiss</button>
  </div>
}
