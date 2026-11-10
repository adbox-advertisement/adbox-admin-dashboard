import { useId, useMemo, useState, type ReactNode } from "react"
import { isAxiosError } from "axios"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { GHANA_MAP, ghanaRegions } from "../data/ghana-regions"
import { useMapInstitutions } from "../hooks"
import {
  institutionGroups, placeInstitutions, shadeFor, shadeSteps, summariseRegions, typeLabel,
  type InstitutionGroup, type PlacedInstitution, type RegionSummary,
} from "../lib/institution-map"

const ink = "text-grey-1000 dark:text-foreground"
const muted = "text-grey-500 dark:text-muted-foreground"
const groupStyle = Object.fromEntries(institutionGroups.map((group) => [group.key, group])) as Record<InstitutionGroup, (typeof institutionGroups)[number]>
const regionPath = new Map(ghanaRegions.map((region) => [region.id, region]))

/**
 * Every institution in Ghana on a map of the 16 regions: a dot per institution at its town,
 * coloured by kind, over regions shaded by how many institutions they hold. The region list
 * and the selected region's institutions carry the same figures for keyboards and screen readers.
 */
export function DashboardInstitutionMap({ className }: { className?: string }) {
  const institutions = useMapInstitutions()
  const placed = useMemo(() => placeInstitutions(institutions.data ?? []), [institutions.data])
  const regions = useMemo(() => summariseRegions(placed), [placed])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredDot, setHoveredDot] = useState<PlacedInstitution | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  const titleId = useId()

  const counts = new Map(regions.map((region) => [region.id, region.count]))
  // Until someone chooses, the region with the most institutions is shown.
  const selected = regions.find((region) => region.id === selectedId) ?? regions[0]
  const inSelected = placed.filter((institution) => institution.regionId === selected?.id)
  const groupTotals = institutionGroups.map((group) => ({ ...group, count: placed.filter((institution) => institution.group === group.key).length }))
  const loaded = Boolean(institutions.data)

  return <article aria-labelledby={titleId} className={cn("flex min-w-0 flex-col gap-5 overflow-hidden rounded-[20px] bg-white px-5 pb-6 pt-7 shadow-adbox-small dark:bg-card sm:px-8", className)}>
    <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1">
      <div className="min-w-0">
        <h2 id={titleId} className="font-heading text-h6 font-semibold text-black dark:text-foreground md:text-h5">Institutions across Ghana</h2>
        <p className={cn("mt-1 text-b3 md:text-b2", muted)}>
          {loaded ? `${placed.length.toLocaleString()} institutions in 16 regions. Select a region on the map or in the list.` : "Every institution, by region and town."}
        </p>
      </div>
    </header>

    {/* The map in the middle, the regions to its left and the chosen region's institutions to its right;
        on narrower screens the map comes first and the two lists sit under it. */}
    <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-[minmax(190px,230px)_minmax(0,1fr)_minmax(240px,300px)] lg:gap-8">
      <figure className="m-0 flex min-w-0 flex-col gap-4 md:col-span-2 lg:order-2 lg:col-span-1">
        <div className="relative mx-auto w-full max-w-[520px]" onMouseLeave={() => { setHoveredDot(null); setHoveredRegion(null) }}>
          <svg viewBox={`0 0 ${GHANA_MAP.width} ${GHANA_MAP.height}`} className="block h-auto w-full" role="img"
            aria-label={loaded ? `Map of Ghana's 16 regions with ${placed.length} institutions. The region list beside it has the same figures.` : "Map of Ghana's 16 regions"}>
            <g>
              {ghanaRegions.map((region) => <path key={region.id} d={region.path}
                className={cn(shadeFor(counts.get(region.id) ?? 0), "cursor-pointer stroke-white stroke-[1.2] transition-[filter] hover:brightness-95 dark:stroke-card dark:hover:brightness-125")}
                onClick={() => setSelectedId(region.id)}
                onMouseEnter={() => setHoveredRegion(region.id)} />)}
            </g>
            {selected && <path d={regionPath.get(selected.id)?.path} className="pointer-events-none fill-none stroke-grey-900 stroke-2 dark:stroke-white" />}
            <g>
              {placed.map((institution) => <circle key={institution.id} cx={institution.x} cy={institution.y} r={4.2}
                className={cn(groupStyle[institution.group].dot, "pointer-events-none stroke-white stroke-[1.4] dark:stroke-card",
                  hoveredDot?.id === institution.id && "stroke-grey-1000 dark:stroke-white")} />)}
            </g>
            {/* Hit targets larger than the dots, drawn last so they sit on top. */}
            <g>
              {placed.map((institution) => <circle key={institution.id} cx={institution.x} cy={institution.y} r={7} className="cursor-pointer fill-transparent"
                onMouseEnter={() => setHoveredDot(institution)} onMouseLeave={() => setHoveredDot(null)}
                onClick={() => { if (institution.regionId) setSelectedId(institution.regionId) }} />)}
            </g>
          </svg>
          {hoveredDot
            ? <DotTooltip institution={hoveredDot} />
            : hoveredRegion && <RegionTooltip summary={regions.find((region) => region.id === hoveredRegion)} />}
        </div>

        <figcaption className="mx-auto flex w-full max-w-[520px] flex-col gap-3">
          <ul aria-label="Kinds of institution" className="flex flex-wrap gap-x-5 gap-y-2">
            {groupTotals.map((group) => <li key={group.key} className={cn("flex items-center gap-2 text-b3", ink)}>
              <span aria-hidden="true" className={cn("size-2.5 rounded-full", group.swatch)} />
              {group.label}
              {loaded && <span className={cn("tabular-nums", muted)}>{group.count.toLocaleString()}</span>}
            </li>)}
          </ul>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <span className={cn("text-b4", muted)}>Institutions per region</span>
              <svg aria-hidden="true" viewBox="0 0 100 10" className="h-2.5 w-[100px]">
                {shadeSteps.map((step, index) => <rect key={step.label} x={index * 20} width={19} height={10} rx={2} className={step.fill} />)}
              </svg>
              <span className={cn("text-b4", muted)}>1 → 40+</span>
            </div>
            <span className={cn("text-[11px]", muted)}>Boundaries © OpenStreetMap contributors (geoBoundaries)</span>
          </div>
        </figcaption>
      </figure>

      <RegionList regions={regions} selectedId={selected?.id} loaded={loaded} onSelect={setSelectedId}
        status={institutions.isError ? <LoadError error={institutions.error} onRetry={() => void institutions.refetch()} /> : null} />

      {loaded && selected && <SelectedRegion summary={selected} institutions={inSelected} onHover={setHoveredDot} />}
    </div>
  </article>
}

/** Above the dot, or below it near the top edge, in the same units as the map. */
function anchorStyle(x: number, y: number) {
  const below = y < GHANA_MAP.height * 0.15
  return {
    left: `${(x / GHANA_MAP.width) * 100}%`,
    top: `${(y / GHANA_MAP.height) * 100}%`,
    transform: `translate(${x > GHANA_MAP.width * 0.7 ? "-90%" : x < GHANA_MAP.width * 0.3 ? "-10%" : "-50%"}, ${below ? "16px" : "calc(-100% - 12px)"})`,
  }
}

function DotTooltip({ institution }: { institution: PlacedInstitution }) {
  return <div role="tooltip" style={anchorStyle(institution.x, institution.y)}
    className="pointer-events-none absolute z-10 w-max max-w-[240px] rounded-xl bg-white px-3 py-2 shadow-adbox-large dark:bg-background">
    <p className={cn("flex items-start gap-2 text-b3 font-semibold leading-snug", ink)}>
      <span aria-hidden="true" className={cn("mt-1 size-2 shrink-0 rounded-full", groupStyle[institution.group].swatch)} />
      {institution.name}
    </p>
    <p className={cn("mt-0.5 pl-4 text-b4", muted)}>{typeLabel(institution.type)}</p>
    <p className={cn("pl-4 text-b4", muted)}>
      {[institution.town, institution.region].filter(Boolean).join(" · ")}
      {institution.approximate && " · placed at the region's centre"}
    </p>
  </div>
}

function RegionTooltip({ summary }: { summary: RegionSummary | undefined }) {
  const region = summary ? regionPath.get(summary.id) : undefined
  if (!summary || !region) return null
  return <div role="tooltip" style={anchorStyle(region.center.x, region.center.y)}
    className="pointer-events-none absolute z-10 w-max rounded-xl bg-white px-3 py-2 shadow-adbox-large dark:bg-background">
    <p className={cn("text-b3 font-semibold", ink)}>{summary.name}</p>
    <p className={cn("text-b4 tabular-nums", muted)}>{summary.count.toLocaleString()} {summary.count === 1 ? "institution" : "institutions"}</p>
  </div>
}

function RegionList({ regions, selectedId, loaded, onSelect, status }: {
  regions: RegionSummary[]
  selectedId: string | undefined
  loaded: boolean
  onSelect: (id: string) => void
  status: ReactNode
}) {
  const largest = Math.max(1, ...regions.map((region) => region.count))
  return <section aria-label="Regions" className="flex min-w-0 flex-col lg:order-1">
    <div className="grid grid-cols-[1fr_auto] gap-2 border-b border-divider pb-2 text-b3 font-semibold text-grey-1000 dark:border-border dark:text-foreground md:text-b2">
      <h3 className="font-semibold">Region</h3>
      <span>Institutions</span>
    </div>
    {status}
    {!loaded && !status && <p role="status" className={cn("py-3 text-b3", muted)}>Loading institutions…</p>}
    <ul className="flex flex-col pt-1">
      {regions.map((region) => {
        const pressed = region.id === selectedId
        return <li key={region.id}>
          <button type="button" aria-pressed={pressed} onClick={() => onSelect(region.id)}
            aria-label={loaded ? `${region.name}, ${region.count.toLocaleString()} ${region.count === 1 ? "institution" : "institutions"}` : region.name}
            className={cn(
              "grid w-full grid-cols-[1fr_auto] gap-x-2 rounded-lg px-2 py-1.5 text-left text-b3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan md:text-b2",
              pressed ? "bg-auth-background text-grey-1000 dark:bg-background dark:text-foreground" : "text-grey-500 hover:bg-grey-50 hover:text-grey-1000 dark:text-muted-foreground dark:hover:bg-background dark:hover:text-foreground",
            )}>
            <span className="truncate">{region.name}</span>
            <span className={cn("text-right font-semibold tabular-nums", ink)}>{loaded ? region.count.toLocaleString() : "–"}</span>
            {/* The region's institutions by kind, in the map's colours, with a gap between kinds. */}
            <span aria-hidden="true" className="col-span-2 mt-1 flex h-1 gap-0.5 overflow-hidden rounded-full" style={{ width: `${(region.count / largest) * 100}%` }}>
              {institutionGroups.map((group) => region.groups[group.key] > 0 && <span key={group.key} className={cn("h-full rounded-full", group.swatch)} style={{ flexGrow: region.groups[group.key] }} />)}
            </span>
          </button>
        </li>
      })}
    </ul>
  </section>
}

function SelectedRegion({ summary, institutions, onHover }: {
  summary: RegionSummary
  institutions: PlacedInstitution[]
  onHover: (institution: PlacedInstitution | null) => void
}) {
  const sorted = [...institutions].sort((a, b) => a.name.localeCompare(b.name))
  const breakdown = institutionGroups.filter((group) => summary.groups[group.key] > 0).map((group) => `${summary.groups[group.key]} ${group.label.toLowerCase()}`).join(", ")
  return <section aria-label={`Institutions in ${summary.name}`} className="flex min-w-0 flex-col gap-3 lg:order-3">
    <div className="border-b border-divider pb-2 dark:border-border">
      <h3 className={cn("text-b1 font-semibold", ink)}>{summary.name}</h3>
      <p className={cn("text-b3", muted)}>
        {summary.count === 0 ? "No institutions here yet." : `${summary.count.toLocaleString()} ${summary.count === 1 ? "institution" : "institutions"}: ${breakdown}.`}
      </p>
    </div>
    {sorted.length > 0 && <ul className="grid max-h-80 grid-cols-1 gap-x-6 gap-y-1 overflow-y-auto pr-1 sm:grid-cols-2 md:grid-cols-1 lg:max-h-[620px]" onMouseLeave={() => onHover(null)}>
      {sorted.map((institution) => <li key={institution.id} className="flex min-w-0 items-start gap-2 rounded-lg px-1 py-1 hover:bg-grey-50 dark:hover:bg-background" onMouseEnter={() => onHover(institution)}>
        <span aria-hidden="true" className={cn("mt-1.5 size-2 shrink-0 rounded-full", groupStyle[institution.group].swatch)} />
        <span className="min-w-0">
          <span className={cn("block truncate text-b3 font-medium", ink)} title={institution.name}>{institution.name}</span>
          <span className={cn("block truncate text-b4", muted)}>{typeLabel(institution.type)}{institution.town ? ` · ${institution.town}` : ""}</span>
        </span>
      </li>)}
    </ul>}
  </section>
}

function LoadError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const forbidden = isAxiosError(error) && error.response?.status === 403
  return <div role="alert" className="flex flex-col items-start gap-2 py-3">
    <p className="text-b3 text-destructive">
      {forbidden ? "Ask a Super Admin for the institutions.read permission to see institutions here." : "Could not load institutions."}
    </p>
    {!forbidden && <Button type="button" variant="outline" size="sm" onClick={onRetry}>Retry</Button>}
  </div>
}
