import type { ReactNode } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { cn } from "../lib/cn"
import { PARAM_QUERY, useLive } from "../lib/live-context"
import { displayValue, resolveParameter } from "../lib/resolve"
import { parameterById } from "../data/catalog"
import { controlIcons, focusRing, muted } from "./tokens"

/** `?param=<id>` added to the page's own URL: the details open over the page, and Back closes them. */
function useParamHref(id: string) {
  const [params] = useSearchParams()
  const next = new URLSearchParams(params)
  next.set(PARAM_QUERY, id)
  return `?${next.toString()}`
}

/**
 * A parameter by name with its value in force, opening its details. Where it lives is shown by
 * icon; a value changed from the built-in default carries a mark and says so.
 */
export function ParamChip({ id, name, className }: { id: string; name?: string; className?: string }) {
  const live = useLive()
  const href = useParamHref(id)
  const parameter = parameterById(id)
  if (!parameter) return null
  const resolved = resolveParameter(parameter, live)
  const Icon = controlIcons[parameter.control]
  const value = displayValue(parameter, resolved)
  const shown = resolved.value === null ? "server setting" : value
  return <Link to={href} preventScrollReset title="Show details" aria-label={`${parameter.name}: ${shown}${resolved.changed ? ", changed from the default" : ""}`}
    className={cn(
      "group inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-[18px] border border-grey-200 bg-white py-1 pl-2 pr-2.5 text-b3 transition-colors hover:border-purple/40 hover:bg-purple/5 dark:border-border dark:bg-card dark:hover:bg-royal-500/10",
      focusRing, className,
    )}>
    <Icon className={cn("size-3.5 shrink-0", muted)} aria-hidden="true" />
    <span className={cn("min-w-0 text-left leading-4", muted)}>{name ?? parameter.name}</span>
    <span className="whitespace-nowrap font-semibold tabular-nums text-grey-1000 dark:text-foreground">{shown}</span>
    {resolved.changed && <span className="size-1.5 shrink-0 rounded-full bg-purple" aria-hidden="true" />}
  </Link>
}

/** A value inside a sentence, underlined, opening its details. */
export function ParamValue({ id, children, className }: { id: string; children?: ReactNode; className?: string }) {
  const live = useLive()
  const href = useParamHref(id)
  const parameter = parameterById(id)
  if (!parameter) return null
  const resolved = resolveParameter(parameter, live)
  return <Link to={href} preventScrollReset title="Show details" aria-label={`${parameter.name}: ${displayValue(parameter, resolved)}`}
    className={cn("rounded font-semibold text-grey-1000 underline decoration-purple/40 decoration-2 underline-offset-[3px] hover:decoration-purple dark:text-foreground", focusRing, className)}>
    {children ?? displayValue(parameter, resolved)}
  </Link>
}
