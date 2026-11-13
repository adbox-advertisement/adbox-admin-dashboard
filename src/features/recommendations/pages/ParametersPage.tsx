import { useId } from "react"
import { useSearchParams } from "react-router-dom"
import { Download, Search, SearchX, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "../lib/cn"
import { useLive } from "../lib/live-context"
import { parametersCsv } from "../lib/export"
import { AREAS, AREA_IDS, CONTROLS, CONTROL_IDS, PARAMETERS, REACH_LABELS, reachOf, type AreaId, type ControlId, type Reach } from "../data/catalog"
import { ParameterTable } from "../components/ParameterTable"
import { IconTile } from "../components/Surface"
import { hairline, ink, muted, surface } from "../components/tokens"

const REACHES: Array<{ value: Reach | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "in-app", label: REACH_LABELS["in-app"] },
  { value: "via-discover", label: "Through Discover" },
  { value: "not-yet", label: REACH_LABELS["not-yet"] },
]

const isArea = (value: string | null): value is AreaId => AREA_IDS.includes(value as AreaId)
const isControl = (value: string | null): value is ControlId => CONTROL_IDS.includes(value as ControlId)
const isReach = (value: string | null): value is Reach => value === "in-app" || value === "via-discover" || value === "not-yet"

/** Recommendations › All parameters: every number, searchable, with its value in force. Filters live in the URL. */
export function ParametersPage() {
  const live = useLive()
  const [params, setParams] = useSearchParams()
  const query = params.get("q") ?? ""
  const area = isArea(params.get("area")) ? (params.get("area") as AreaId) : "all"
  const control = isControl(params.get("control")) ? (params.get("control") as ControlId) : "all"
  const reach = isReach(params.get("reach")) ? (params.get("reach") as Reach) : "all"
  const searchId = useId()

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (!value || value === "all") next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true, preventScrollReset: true })
  }
  const clear = () => {
    const next = new URLSearchParams()
    const open = params.get("param")
    if (open) next.set("param", open)
    setParams(next, { replace: true, preventScrollReset: true })
  }

  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const matches = PARAMETERS.filter((parameter) =>
    (area === "all" || parameter.area === area) &&
    (control === "all" || parameter.control === control) &&
    (reach === "all" || reachOf(parameter) === reach) &&
    words.every((word) => `${parameter.name} ${parameter.key} ${parameter.effect} ${AREAS[parameter.area].label}`.toLowerCase().includes(word)))
  const filtered = Boolean(words.length) || area !== "all" || control !== "all" || reach !== "all"

  const download = () => {
    const blob = new Blob([parametersCsv(matches, live)], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "adbox-recommendation-parameters.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  return <div className="flex min-w-0 flex-col gap-4 px-4 sm:px-6">
    <p className={cn("max-w-3xl text-b3 md:text-b2", muted)}>
      Every number that decides what the app shows, with the value in force, the built-in default and the allowed range, who can change it and whether people feel it today.
      Select a parameter for what it does and where it is written.
    </p>

    <div className={cn(surface, "min-w-0")}>
      <div className={cn("flex flex-col gap-3 border-b p-4 sm:p-5 xl:flex-row xl:flex-wrap xl:items-center", hairline)}>
        <div className="relative min-w-0 xl:min-w-[260px] xl:flex-1">
          <label htmlFor={searchId} className="sr-only">Search parameters</label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-grey-400 dark:text-muted-foreground" />
          <Input id={searchId} type="search" value={query} onChange={(event) => update("q", event.target.value)} placeholder="Search by name, setting or effect" autoComplete="off" maxLength={100}
            className="h-11 rounded-full border-grey-200 bg-grey-50 pl-10 pr-10 text-b3 focus-visible:ring-0 dark:border-border dark:bg-background md:text-b2 [&::-webkit-search-cancel-button]:hidden" />
          {query && <button type="button" aria-label="Clear search" onClick={() => update("q", "")} className="absolute right-0 top-0 flex h-11 w-10 cursor-pointer items-center justify-center text-grey-400 hover:text-grey-1000 dark:hover:text-foreground"><X className="size-4" aria-hidden="true" /></button>}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex">
          <Select value={area} onValueChange={(value) => update("area", value)}>
            <SelectTrigger aria-label="Area" className="h-11 rounded-full xl:w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Every area</SelectItem>
              {AREA_IDS.map((id) => <SelectItem key={id} value={id}>{AREAS[id].label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={control} onValueChange={(value) => update("control", value)}>
            <SelectTrigger aria-label="Controlled by" className="h-11 rounded-full xl:w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Anyone</SelectItem>
              {CONTROL_IDS.map((id) => <SelectItem key={id} value={id}>{CONTROLS[id].label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div role="radiogroup" aria-label="Felt in the app" className="flex w-fit max-w-full flex-wrap gap-1 rounded-3xl bg-grey-50 p-1 dark:bg-background">
          {REACHES.map((option) => <button key={option.value} type="button" role="radio" aria-checked={reach === option.value} onClick={() => update("reach", option.value)}
            className={cn("min-h-9 cursor-pointer whitespace-nowrap rounded-full px-3.5 text-b3 font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-purple",
              reach === option.value ? "bg-white text-purple shadow-adbox-small dark:bg-card" : "text-grey-500 hover:text-grey-1000 dark:text-muted-foreground dark:hover:text-foreground")}>
            {option.label}
          </button>)}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 sm:px-5">
        <p aria-live="polite" className={cn("text-b3 font-semibold", ink)} data-testid="parameter-count">
          {filtered ? `${matches.length} of ${PARAMETERS.length} parameters` : `${PARAMETERS.length} parameters`}
        </p>
        <div className="flex flex-wrap gap-2">
          {filtered && <Button type="button" variant="outline" size="sm" className="h-9 cursor-pointer rounded-full" onClick={clear}>Clear filters</Button>}
          <Button type="button" variant="outline" size="sm" className="h-9 cursor-pointer rounded-full" disabled={matches.length === 0} onClick={download}>
            <Download className="size-4" aria-hidden="true" />Download CSV
          </Button>
        </div>
      </div>

      {matches.length === 0
        ? <div className="flex flex-col items-center px-6 py-12 text-center">
          <IconTile icon={SearchX} size="lg" />
          <h3 className={cn("mt-3 font-heading text-base font-semibold", ink)}>No parameter matches</h3>
          <p className={cn("mt-1.5 max-w-sm text-sm leading-6", muted)}>Try another word, or clear the filters.</p>
        </div>
        : <div className="flex flex-col gap-6 p-4 sm:p-5">
          {AREA_IDS.filter((id) => matches.some((parameter) => parameter.area === id)).map((id) => {
            const list = matches.filter((parameter) => parameter.area === id)
            return <section key={id} aria-label={AREAS[id].label}>
              <h3 className={cn("mb-1 flex items-baseline gap-2 text-b1 font-semibold", ink)}>{AREAS[id].label}<span className={cn("text-b3 font-normal", muted)}>{list.length}</span></h3>
              <ParameterTable caption={`Parameters of ${AREAS[id].label}`} parameters={list} />
            </section>
          })}
        </div>}
    </div>
  </div>
}
