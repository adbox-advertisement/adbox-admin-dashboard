import type { ReactNode } from "react"
import { Lock, SearchX, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// The dashboard's card, text and state pieces, as Manage Users draws them.

export const surface = "rounded-[20px] bg-white shadow-adbox-small dark:bg-card"
export const muted = "text-grey-500 dark:text-muted-foreground"
export const ink = "text-grey-1000 dark:text-foreground"
export const pill = "inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-b4 font-semibold leading-none"

export function NoAccess({ permission, what }: { permission: string; what: string }) {
  return <div className="flex w-full flex-col items-center px-4 py-16 text-center">
    <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-purple/10 text-purple"><Lock className="size-6" aria-hidden="true" /></span>
    <h2 className={cn("font-heading text-base font-semibold", ink)}>You don't have access to {what}</h2>
    <p className={cn("mt-1.5 max-w-sm text-sm leading-6", muted)}>Ask a Super Admin for the <span className="font-mono text-b4">{permission}</span> permission.</p>
  </div>
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div role="alert" className="flex flex-wrap items-center gap-3 p-6">
    <p className="text-sm text-destructive">{message}</p>
    <Button type="button" variant="outline" onClick={onRetry}>Retry</Button>
  </div>
}

export function EmptyState({ icon: Icon = SearchX, title, children }: { icon?: LucideIcon; title: string; children?: ReactNode }) {
  return <div className="flex flex-col items-center px-6 py-12 text-center">
    <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-purple/10 text-purple"><Icon className="size-6" aria-hidden="true" /></span>
    <h3 className={cn("font-heading text-base font-semibold", ink)}>{title}</h3>
    {children && <p className={cn("mt-1.5 max-w-sm text-sm leading-6", muted)}>{children}</p>}
  </div>
}

export function RowsSkeleton({ rows = 4, label }: { rows?: number; label: string }) {
  return <div role="status" aria-label={label} className="divide-y divide-grey-200 dark:divide-border">
    {Array.from({ length: rows }, (_, index) => (
      <div key={index} className="flex items-center gap-3 px-6 py-4">
        <div className="flex-1 space-y-2">
          <span className="block h-3 w-40 animate-pulse rounded bg-grey-100 dark:bg-muted" />
          <span className="block h-3 w-56 animate-pulse rounded bg-grey-100 dark:bg-muted" />
        </div>
      </div>
    ))}
  </div>
}
