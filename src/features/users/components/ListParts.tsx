import { useId, type ReactNode } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { muted } from "./Surface"

// One anatomy for every Manage Users list: the header names the page, a line says what it
// holds, then one card with the toolbar (status filter, search, other filters) over the list.

/** What the page holds, in a line or two; an optional link on the right. */
export function PageIntro({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
    <p className={cn("max-w-3xl text-b3 md:text-b2", muted)}>{children}</p>
    {action}
  </div>
}

/** The filters and search above a list, inside its card. */
export function ListToolbar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-3 border-b border-grey-200 p-4 dark:border-border sm:p-5 xl:flex-row xl:flex-wrap xl:items-center", className)}>
    {children}
  </div>
}

export type StatusOption<T extends string> = { value: T; label: string; count?: number }

/** Statuses as one row of choices, each with its count when there is one to show. */
export function StatusFilter<T extends string>({ label, value, options, onChange }: {
  label: string
  value: T
  options: Array<StatusOption<T>>
  onChange: (value: T) => void
}) {
  return <div role="radiogroup" aria-label={label} className="flex w-fit max-w-full flex-wrap gap-1 rounded-3xl bg-grey-50 p-1 dark:bg-background">
    {options.map((option) => {
      const active = option.value === value
      return <button key={option.value} type="button" role="radio" aria-checked={active} onClick={() => onChange(option.value)}
        className={cn(
          "inline-flex min-h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-b3 font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-purple",
          active ? "bg-white text-purple shadow-adbox-small dark:bg-card" : "text-grey-500 hover:text-grey-1000 dark:text-muted-foreground dark:hover:text-foreground",
        )}>
        {option.label}
        {Boolean(option.count) && <> <span className={cn(
          "rounded-full px-1.5 text-b4 tabular-nums",
          active ? "bg-purple/10 text-purple" : "bg-grey-200/70 text-grey-600 dark:bg-muted dark:text-muted-foreground",
        )}>{option.count?.toLocaleString()}</span></>}
      </button>
    })}
  </div>
}

/** A search box that grows to fill the toolbar, with a clear button once there is text. */
export function SearchField({ label, value, onChange, placeholder, maxLength = 200, className }: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  maxLength?: number
  /** Where the toolbar is a row earlier than xl, say so here (e.g. `sm:flex-1`). */
  className?: string
}) {
  const id = useId()
  return <div className={cn("relative min-w-0 xl:min-w-[260px] xl:flex-1", className)}>
    <label htmlFor={id} className="sr-only">{label}</label>
    <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-grey-400 dark:text-muted-foreground" />
    <Input id={id} type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoComplete="off" maxLength={maxLength}
      className="h-11 rounded-full border-grey-200 bg-grey-50 pl-10 pr-10 text-b3 focus-visible:ring-0 dark:border-border dark:bg-background md:text-b2 [&::-webkit-search-cancel-button]:hidden" />
    {value && <button type="button" aria-label="Clear search" onClick={() => onChange("")} className="absolute right-0 top-0 flex h-11 w-10 cursor-pointer items-center justify-center text-grey-400 hover:text-grey-1000 dark:hover:text-foreground"><X className="size-4" aria-hidden="true" /></button>}
  </div>
}
