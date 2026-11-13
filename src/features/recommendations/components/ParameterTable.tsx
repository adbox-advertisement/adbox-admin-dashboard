import { Link, useSearchParams } from "react-router-dom"
import { cn } from "../lib/cn"
import { PARAM_QUERY, useLive } from "../lib/live-context"
import { displayValue, resolveParameter } from "../lib/resolve"
import { formatWithUnit } from "../lib/values"
import { AREAS, reachOf, type Parameter } from "../data/catalog"
import { ControlPill, ReachPill } from "./Surface"
import { focusRing, hairline, ink, muted } from "./tokens"

/**
 * Parameters as rows: name and key, the value in force against the default and range, who controls
 * it and whether the app feels it. A table from md; stacked rows on phones.
 */
export function ParameterTable({ parameters, caption, showArea = false }: { parameters: Parameter[]; caption: string; showArea?: boolean }) {
  const live = useLive()
  const [params] = useSearchParams()
  const hrefFor = (id: string) => {
    const next = new URLSearchParams(params)
    next.set(PARAM_QUERY, id)
    return `?${next.toString()}`
  }

  return <table className="block w-full text-left md:table">
    <caption className="sr-only">{caption}</caption>
    <thead className="hidden md:table-header-group">
      <tr className={cn("border-b", hairline)}>
        {["Parameter", "In force", "Default", "Allowed", "Controlled by"].map((heading) => <th key={heading} scope="col" className={cn("px-3 py-2.5 text-b3 font-semibold first:pl-0", muted)}>{heading}</th>)}
      </tr>
    </thead>
    <tbody className="block md:table-row-group">
      {parameters.map((parameter) => {
        const resolved = resolveParameter(parameter, live)
        return <tr key={parameter.id} className={cn("grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1.5 border-b py-3 last:border-0 md:table-row md:py-0", hairline)}>
          <th scope="row" className="col-span-2 block min-w-0 font-normal md:table-cell md:max-w-[22rem] md:py-3 md:pr-3 md:align-baseline">
            <Link to={hrefFor(parameter.id)} preventScrollReset className={cn("rounded text-b2 font-semibold hover:text-purple dark:hover:text-royal-300", ink, focusRing)}>{parameter.name}</Link>
            <code className={cn("mt-0.5 block break-all font-mono text-b4", muted)}>{parameter.key}</code>
            {showArea && <span className={cn("mt-0.5 block text-b4", muted)}>{AREAS[parameter.area].label}</span>}
          </th>
          <td className="block md:table-cell md:px-3 md:py-3 md:align-baseline">
            <span className={cn("inline-flex items-center gap-1.5 text-b2 font-semibold tabular-nums", ink)}>
              {displayValue(parameter, resolved)}
              {resolved.changed && <span className="size-1.5 rounded-full bg-purple" role="img" aria-label="changed from the default" />}
            </span>
          </td>
          <td className={cn("block text-right text-b3 tabular-nums md:table-cell md:px-3 md:py-3 md:text-left md:align-baseline", muted)}>
            <span className="md:hidden">Default </span>{formatWithUnit(resolved.defaultValue, parameter.unit)}
          </td>
          <td className={cn("col-span-2 block text-b3 tabular-nums md:table-cell md:px-3 md:py-3 md:align-baseline", muted)}>
            {resolved.bounds ? <><span className="md:hidden">Allowed </span>{formatWithUnit(resolved.bounds.min, parameter.unit)} – {formatWithUnit(resolved.bounds.max, parameter.unit)}</> : <span className="hidden md:inline">—</span>}
          </td>
          <td className="col-span-2 block md:table-cell md:py-3 md:pl-3 md:align-baseline">
            <div className="flex flex-wrap gap-1.5">
              <ControlPill control={parameter.control} />
              <ReachPill reach={reachOf(parameter)} />
            </div>
          </td>
        </tr>
      })}
    </tbody>
  </table>
}
