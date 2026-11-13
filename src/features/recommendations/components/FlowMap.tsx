import { useId, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, ChevronDown } from "lucide-react"
import { APP_ROUTES } from "@/routes/paths"
import { cn } from "../lib/cn"
import { FLOW, FLOW_STAGES, FLOW_STAGE_IDS, type FlowRow } from "../data/flow"
import { SURFACES, reachOf } from "../data/catalog"
import { ParamChip } from "./ParamChip"
import { ReachPill } from "./Surface"
import { focusRing, hairline, ink, muted } from "./tokens"

const pageOf: Record<FlowRow["page"], string> = {
  home: APP_ROUTES.recommendationsHome,
  sponsored: APP_ROUTES.recommendationsSponsored,
  discover: APP_ROUTES.recommendationsDiscover,
  ranked: APP_ROUTES.recommendationsRanked,
}

const groups: Array<{ title: string; rows: FlowRow["surface"][] }> = [
  { title: "Home", rows: ["home", "shorts", "videos", "sponsored", "glances"] },
  { title: "Discover", rows: ["trending", "explore", "people", "search", "topics"] },
  { title: "Built, not in the app yet", rows: ["ranked"] },
]

// From xl: one row per list, one column per stage. Below it, each list is a card of its stages.
const columns = "xl:grid xl:grid-cols-[minmax(0,1.1fr)_repeat(4,minmax(0,1fr))] xl:gap-x-5"

/** Every list the app shows, stage by stage, with the parameters that act at each stage. */
export function FlowMap() {
  return <div className="min-w-0">
    <div aria-hidden="true" className={cn("hidden border-b pb-3", hairline, columns)}>
      <p className={cn("text-b3 font-semibold", muted)}>List in the app</p>
      {FLOW_STAGE_IDS.map((stage, index) => <p key={stage} className={cn("flex items-center gap-2 text-b3 font-semibold", ink)}>
        <span className="flex size-5 items-center justify-center rounded-full bg-purple/10 text-b4 text-purple dark:text-royal-300">{index + 1}</span>
        {FLOW_STAGES[stage].label}
      </p>)}
    </div>

    {groups.map((group) => <section key={group.title} aria-label={group.title} className="mt-5 first:mt-4 xl:first:mt-2">
      <h4 className={cn("mb-2 text-b4 font-semibold uppercase tracking-wide", muted)}>{group.title}</h4>
      <ul className="flex flex-col gap-3 xl:gap-0">
        {group.rows.map((surface) => {
          const row = FLOW.find((item) => item.surface === surface)
          return row ? <FlowRowView key={surface} row={row} /> : null
        })}
      </ul>
    </section>)}
  </div>
}

function FlowRowView({ row }: { row: FlowRow }) {
  const surface = SURFACES[row.surface]
  const reach = reachOf({ surfaces: [row.surface] })
  // Phones show each list's name first and its stages on request; from md they are always shown.
  const [open, setOpen] = useState(false)
  const stagesId = useId()
  return <li className={cn(
    "rounded-2xl border p-4 xl:rounded-none xl:border-0 xl:border-b xl:px-0 xl:py-4",
    hairline, columns, !surface.inApp && "bg-grey-50/70 dark:bg-background/40 xl:-mx-3 xl:rounded-xl xl:px-3",
  )}>
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <Link to={pageOf[row.page]} className={cn("group inline-flex items-center gap-1 rounded text-b2 font-semibold", ink, focusRing)}>
          {surface.label}<ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true" />
        </Link>
        <ReachPill reach={reach} className="xl:hidden" />
      </div>
      <code className={cn("mt-1 block break-all font-mono text-b4", muted)}>{surface.endpoint}</code>
      <p className={cn("mt-1 text-b3", muted)}>{row.asks}</p>
      <ReachPill reach={reach} className="mt-2 hidden xl:inline-flex" />
      <button type="button" aria-expanded={open} aria-controls={stagesId} onClick={() => setOpen((current) => !current)}
        className={cn("mt-3 inline-flex items-center gap-1 rounded text-b3 font-semibold text-purple dark:text-royal-300 md:hidden", focusRing)}>
        {open ? "Hide the stages" : "Show the four stages"}<ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
    </div>
    <div id={stagesId} className={cn("mt-3 grid-cols-1 gap-3 md:grid md:grid-cols-2 xl:contents", open ? "grid" : "hidden")}>
      {FLOW_STAGE_IDS.map((stage, index) => {
        const cell = row.cells[stage]
        return <div key={stage} className="min-w-0 rounded-xl bg-grey-50 p-3 dark:bg-background/50 xl:rounded-none xl:bg-transparent xl:p-0 dark:xl:bg-transparent">
          <p className={cn("mb-1 flex items-center gap-1.5 text-b4 font-semibold uppercase tracking-wide xl:hidden", muted)}>
            <span className="flex size-4 items-center justify-center rounded-full bg-purple/10 text-[9px] text-purple dark:text-royal-300">{index + 1}</span>{FLOW_STAGES[stage].label}
          </p>
          <p className={cn("text-b3 leading-5", ink)}>{cell.text}</p>
          {cell.params.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">
            {cell.params.map((id) => <ParamChip key={id} id={id} />)}
          </div>}
        </div>
      })}
    </div>
  </li>
}
