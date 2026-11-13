import { Link, useSearchParams } from "react-router-dom"
import { ArrowRight, FileCode2 } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { APP_ROUTES } from "@/routes/paths"
import { cn } from "../lib/cn"
import { PARAM_QUERY, useLive } from "../lib/live-context"
import { displayValue, provenance, resolveParameter } from "../lib/resolve"
import { formatWithUnit } from "../lib/values"
import { AREAS, CONTROLS, STAGES, SURFACES, parameterById, reachOf } from "../data/catalog"
import { ControlPill, ReachPill, StatusPill } from "./Surface"
import { focusRing, hairline, ink, muted } from "./tokens"

/** One parameter in full, opened by `?param=<id>` from any page of the section. */
export function ParameterSheet() {
  const [params, setParams] = useSearchParams()
  const live = useLive()
  const parameter = parameterById(params.get(PARAM_QUERY))

  const close = () => {
    const next = new URLSearchParams(params)
    next.delete(PARAM_QUERY)
    setParams(next, { replace: true, preventScrollReset: true })
  }

  const resolved = parameter ? resolveParameter(parameter, live) : null
  const areaLink = parameter ? `${APP_ROUTES.recommendationsParameters}?area=${parameter.area}` : APP_ROUTES.recommendationsParameters

  return <Sheet open={Boolean(parameter)} onOpenChange={(open) => { if (!open) close() }}>
    <SheetContent closeLabel="Close details" className="w-[min(30rem,calc(100vw-1rem))] gap-0 overflow-y-auto p-0">
      {parameter && resolved && <>
        <SheetHeader className="gap-2 border-b border-grey-200 px-5 pb-5 pr-14 pt-6 dark:border-border">
          <p className={cn("text-b4 font-semibold uppercase tracking-wide", muted)}>{AREAS[parameter.area].label} · {STAGES[parameter.stage]}</p>
          <SheetTitle className="text-h6">{parameter.name}</SheetTitle>
          <SheetDescription className="sr-only">What this parameter does, its value and where it is set.</SheetDescription>
          <code className={cn("w-fit max-w-full break-all rounded-md bg-grey-100 px-1.5 py-0.5 font-mono text-b3 dark:bg-muted", ink)}>{parameter.key}</code>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <ReachPill reach={reachOf(parameter)} />
            <ControlPill control={parameter.control} />
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-5 py-5">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className={cn("text-b3 font-semibold", muted)}>{resolved.status === "fixed" ? "Value" : "In force"}</p>
              {resolved.status !== "fixed" && <StatusPill status={resolved.status} />}
            </div>
            <p data-testid="parameter-value" className={cn("mt-1 font-heading text-h5 font-semibold", ink)}>{displayValue(parameter, resolved)}</p>
            <p className={cn("mt-1.5 text-b3 leading-5", muted)}>{provenance(parameter, resolved, live)}</p>
            <dl className={cn("mt-3 grid grid-cols-2 gap-3 rounded-2xl border p-3", hairline)}>
              <div>
                <dt className={cn("text-b4", muted)}>Built-in default</dt>
                <dd className={cn("mt-0.5 text-b2 font-semibold tabular-nums", ink)}>{formatWithUnit(resolved.defaultValue, parameter.unit)}</dd>
              </div>
              <div>
                <dt className={cn("text-b4", muted)}>Allowed</dt>
                <dd className={cn("mt-0.5 text-b2 font-semibold tabular-nums", ink)}>
                  {resolved.bounds ? `${formatWithUnit(resolved.bounds.min, parameter.unit)} – ${formatWithUnit(resolved.bounds.max, parameter.unit)}` : "Any (set in code)"}
                </dd>
                {resolved.bounds?.integer && <dd className={cn("text-b4", muted)}>Whole numbers</dd>}
              </div>
            </dl>
            {resolved.changed && <p className="mt-2 text-b3 font-semibold text-purple dark:text-royal-300">Changed from the default.</p>}
          </div>

          <section aria-label="What it does">
            <h3 className={cn("text-b2 font-semibold", ink)}>What it does</h3>
            <p className={cn("mt-1 text-b2 leading-6", muted)}>{parameter.effect}</p>
          </section>

          <section aria-label="Where people feel it">
            <h3 className={cn("text-b2 font-semibold", ink)}>Where people feel it</h3>
            <ul className="mt-2 flex flex-col gap-2">
              {parameter.surfaces.map((surface) => <li key={surface} className={cn("rounded-xl border px-3 py-2", hairline)}>
                <p className={cn("text-b3 font-semibold", ink)}>{SURFACES[surface].label}{!SURFACES[surface].inApp && <span className={cn("font-normal", muted)}> · the app doesn't call it yet</span>}</p>
                <code className={cn("font-mono text-b4", muted)}>{SURFACES[surface].endpoint}</code>
              </li>)}
            </ul>
          </section>

          <section aria-label="How to change it">
            <h3 className={cn("text-b2 font-semibold", ink)}>How to change it</h3>
            <p className={cn("mt-1 text-b2 leading-6", muted)}>{CONTROLS[parameter.control].where}. {CONTROLS[parameter.control].speed}.</p>
            {parameter.control === "gold" && <Link to={APP_ROUTES.goldPricing} className={cn("mt-2 inline-flex items-center gap-1 rounded text-b3 font-semibold text-purple dark:text-royal-300", focusRing)}>
              Open Gold & pricing<ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>}
          </section>

          <section aria-label="Defined in">
            <h3 className={cn("flex items-center gap-1.5 text-b2 font-semibold", ink)}><FileCode2 className="size-4" aria-hidden="true" />Defined in</h3>
            <code className={cn("mt-1 block font-mono text-b3", muted)}>{parameter.file.split("/").map((part, index) => <span key={index}>{index > 0 && <>/<wbr /></>}{part}</span>)}</code>
          </section>

          <Link to={areaLink} onClick={close} className={cn("inline-flex w-fit items-center gap-1 rounded text-b3 font-semibold text-purple dark:text-royal-300", focusRing)}>
            Every parameter in {AREAS[parameter.area].label}<ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </>}
    </SheetContent>
  </Sheet>
}
