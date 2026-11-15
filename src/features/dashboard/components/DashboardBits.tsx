import { useId, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "../lib/cn"
import { formatCount, initials, shareOf } from "../lib/figures"
import { focusRing, heading, ink, muted, surface } from "./tokens"

/** A titled card with an optional link to the section it summarises. */
export function Card({ title, description, action, className, children }: {
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
  children: ReactNode
}) {
  const id = useId()
  return <article aria-labelledby={id} className={cn(surface, "flex min-w-0 flex-col px-5 pb-5 pt-6 sm:px-6", className)}>
    <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 id={id} className={heading}>{title}</h2>
        {description && <p className={cn("mt-1 text-b3 leading-5 md:text-b2 md:leading-6", muted)}>{description}</p>}
      </div>
      {action}
    </header>
    {children}
  </article>
}

export function MoreLink({ to, children }: { to: string; children: ReactNode }) {
  return <Link to={to} className={cn("inline-flex shrink-0 items-center gap-0.5 rounded-full text-b3 font-semibold text-purple hover:underline dark:text-royal-300 md:text-b2", focusRing)}>
    {children}<ChevronRight className="size-4" aria-hidden="true" />
  </Link>
}

export function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div role="alert" className="flex flex-wrap items-center gap-3">
    <p className="text-b3 text-destructive md:text-b2">{message}</p>
    <Button type="button" variant="outline" size="sm" className="cursor-pointer rounded-full" onClick={onRetry}>Retry</Button>
  </div>
}

/** Grey bars standing in for rows until the figures arrive. */
export function LoadingRows({ rows = 4, label }: { rows?: number; label: string }) {
  return <div role="status" aria-label={label} className="flex flex-col gap-3">
    {Array.from({ length: rows }, (_, index) => <span key={index} className="h-9 animate-pulse rounded-xl bg-grey-100 dark:bg-muted" />)}
  </div>
}

export type BarRow = { key: string; label: string; value: number; to?: string }

/** Labelled counts, each with its share of `total` as a bar: one hue, the number always written. */
export function BarList({ rows, total, label }: { rows: BarRow[]; total: number; label: string }) {
  return <ul aria-label={label} className="flex flex-col gap-0.5">
    {rows.map((row) => {
      const share = shareOf(row.value, total)
      const width = total > 0 ? Math.max((row.value / total) * 100, row.value > 0 ? 1.5 : 0) : 0
      const content = <>
        <span className="flex items-baseline justify-between gap-3">
          <span className={cn("min-w-0 truncate text-b3 font-semibold md:text-b2", ink)}>{row.label}</span>
          <span className="shrink-0 text-b3 tabular-nums md:text-b2">
            <span className={cn("font-semibold", ink)}>{formatCount(row.value)}</span>
            <span className={cn("ml-1.5", muted)}>{share}</span>
          </span>
        </span>
        <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-grey-100 dark:bg-muted" aria-hidden="true">
          <span className="block h-full rounded-full bg-purple dark:bg-royal-400" style={{ width: `${width}%` }} />
        </span>
      </>
      return <li key={row.key}>
        {row.to
          ? <Link to={row.to} aria-label={`${row.label}: ${formatCount(row.value)}, ${share}`} className={cn("block rounded-xl px-2 py-2 transition-colors hover:bg-grey-50 dark:hover:bg-background", focusRing)}>{content}</Link>
          : <div className="block px-2 py-2">{content}</div>}
      </li>
    })}
  </ul>
}

/** A picture, or the name's initials on a tinted tile. */
export function Avatar({ name, image, square = false }: { name: string; image: string | null; square?: boolean }) {
  const shape = square ? "rounded-xl" : "rounded-full"
  return image
    ? <img src={image} alt="" loading="lazy" referrerPolicy="no-referrer" className={cn("size-10 shrink-0 bg-grey-100 object-cover dark:bg-muted", shape)} />
    : <span aria-hidden="true" className={cn("flex size-10 shrink-0 items-center justify-center bg-purple/10 text-b3 font-semibold text-purple dark:bg-royal-500/15 dark:text-royal-300", shape)}>{initials(name)}</span>
}
