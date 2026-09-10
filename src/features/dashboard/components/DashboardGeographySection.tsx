import { useState, type KeyboardEvent } from "react"
import geographyBarIcon from "@/assets/dashboard/geography-bar-icon.svg"
import { cn } from "@/lib/utils"
import { type MapRegion, mapRegions, topRegions, publishers } from "../data/geography"

function GhanaMap({
  selectedRegion,
  onSelectRegion,
}: {
  selectedRegion: MapRegion
  onSelectRegion: (region: MapRegion) => void
}) {
  const handleRegionKeyDown = (
    event: KeyboardEvent<SVGPathElement>,
    region: MapRegion,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return
    }

    event.preventDefault()
    onSelectRegion(region)
  }

  return (
    <div
      className="relative h-[330px] w-[231px] max-w-full shrink-0 overflow-hidden"
      aria-label="Ghana regional performance map"
      role="group"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {mapRegions.map((piece) => (
          <img
            key={piece.id}
            src={piece.src}
            alt=""
            className={`${piece.className} block size-auto max-w-none`}
          />
        ))}
        <svg
          className={`${selectedRegion.className} pointer-events-none z-10 block overflow-visible`}
          viewBox={selectedRegion.viewBox}
          preserveAspectRatio="none"
        >
          <path d={selectedRegion.path} fill="var(--adbox-cyan)" />
        </svg>
      </div>

      {mapRegions.map((region) => (
        <svg
          key={region.id}
          className={`${region.className} pointer-events-none z-20 block overflow-visible`}
          viewBox={region.viewBox}
          preserveAspectRatio="none"
        >
          <path
            d={region.path}
            fill="#000000"
            fillOpacity={0.001}
            pointerEvents="fill"
            role="button"
            tabIndex={0}
            aria-label={`Select ${region.name}`}
            aria-pressed={region.id === selectedRegion.id}
            className="pointer-events-auto cursor-pointer outline-none focus-visible:stroke-cyan focus-visible:stroke-[4px]"
            onClick={() => onSelectRegion(region)}
            onKeyDown={(event) => handleRegionKeyDown(event, region)}
          />
        </svg>
      ))}

      <div
        className="sr-only"
        aria-live="polite"
      >{`${selectedRegion.name}: ${selectedRegion.users} of users`}</div>

      <div className="pointer-events-none absolute left-[37px] top-[120px] z-30 w-[130px] rounded-lg bg-white p-4 shadow-adbox-large">
        <p className="sr-only">{selectedRegion.name}</p>
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-cyan" aria-hidden="true" />
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
            <span className="text-[10px] leading-[15px] text-paragraph-text">
              Viewers
            </span>
            <span className="text-b3 font-semibold text-grey-1000">
              {selectedRegion.viewers}
            </span>
          </div>
        </div>
        <div className="my-2 h-px bg-grey-200" />
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-purple" aria-hidden="true" />
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
            <span className="text-[10px] leading-[15px] text-paragraph-text">
              Publisher
            </span>
            <span className="text-b3 font-semibold text-grey-1000">
              {selectedRegion.publishers}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function TopRegionsTable({
  selectedRegion,
  onSelectRegion,
}: {
  selectedRegion: MapRegion
  onSelectRegion: (region: MapRegion) => void
}) {
  return (
    <div className="w-full md:max-w-[270px] md:justify-self-end">
      <h3 className="pb-2 pt-0 text-b2 font-semibold text-black md:pt-[52px] md:text-b1 md:leading-[19px]">
        Top Regions
      </h3>
      <div className="border-b border-divider pb-2 pt-2">
        <div className="grid grid-cols-[1fr_72px] gap-2 text-b3 font-semibold text-grey-1000 md:text-b2">
          <span>Region</span>
          <span className="text-right">Users</span>
        </div>
      </div>
      <div className="pb-0 pt-1 md:pb-6">
        {topRegions.map((region) => (
          <button
            key={region.name}
            type="button"
            className={cn(
              "grid w-full grid-cols-[1fr_72px] gap-x-2 rounded-lg px-2 py-2 text-left text-b3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-white md:text-b2",
              region.id === selectedRegion.id
                ? "bg-auth-background text-grey-1000"
                : "text-grey-500 hover:bg-grey-50 hover:text-grey-1000",
            )}
            aria-pressed={region.id === selectedRegion.id}
            onClick={() => onSelectRegion(region)}
          >
            <span className="truncate">{region.name}</span>
            <span className="text-right font-semibold text-grey-1000">
              {region.users}
            </span>
            <span
              className="col-span-2 mt-1 h-1 overflow-hidden rounded-full bg-auth-background"
              aria-hidden="true"
            >
              <span
                className="block h-full rounded-full bg-[image:var(--gradient-blue)]"
                style={{ width: `${region.score}%` }}
              />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function TopPublishersTable() {
  return (
    <article className="flex min-h-[326px] flex-col overflow-hidden rounded-[14px] bg-white shadow-adbox-small">
      <div className="px-4 pb-2 pt-6 sm:px-5">
        <h2 className="font-heading text-h6 font-semibold text-black md:text-h5">
          Top Publishers
        </h2>
      </div>
      <div className="min-h-0 flex-1 overflow-x-auto pb-6">
        <table className="w-full min-w-[288px] text-left">
          <thead>
            <tr className="border-b border-divider text-b3 font-semibold text-grey-500 md:text-b2">
              <th className="px-4 pb-[14px] pt-[9px] font-semibold sm:px-5">
                User
              </th>
              <th className="px-2 pb-[14px] pt-[9px] font-semibold">
                Spending
              </th>
              <th className="w-[74px] px-2 pb-[14px] pt-[9px] font-semibold">
                Views
              </th>
            </tr>
          </thead>
          <tbody>
            {publishers.map((publisher) => (
              <tr
                key={publisher.name}
                className="text-b3 text-grey-500 transition-colors hover:bg-grey-50/70 md:text-b2"
              >
                <td className="px-4 py-2 sm:px-5">
                  <div className="flex items-center gap-[10px]">
                    <img
                      src={publisher.avatar}
                      alt=""
                      className="size-[30px] shrink-0 rounded-full object-cover"
                    />
                    <span className="min-w-0 truncate">
                      {publisher.name}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-2 font-semibold text-grey-500">
                  {publisher.spending}
                </td>
                <td className="w-[74px] px-2 py-2">{publisher.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}

export function DashboardGeographySection() {
  const [selectedRegion, setSelectedRegion] = useState(
    () => mapRegions.find((region) => region.id === "greater-accra")!,
  )

  return (
    <section className="px-4 sm:px-6">
      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
        <article className="overflow-hidden rounded-[20px] bg-white px-5 pb-[30px] pt-7 shadow-adbox-small sm:px-8 lg:col-span-8">
          <div className="mb-[21px] flex items-start gap-6">
            <h2 className="min-w-0 flex-1 font-heading text-h6 font-semibold text-black md:text-h5">
              Geographical Performance
            </h2>
            <button
              type="button"
              className="flex size-[33px] shrink-0 items-center justify-center rounded-[18px] bg-auth-background"
              aria-label="View geography chart"
            >
              <img
                src={geographyBarIcon}
                alt=""
                className="size-6 object-contain"
              />
            </button>
          </div>

          <div className="grid grid-cols-1 items-start gap-[21px] md:grid-cols-[minmax(280px,1fr)_minmax(220px,270px)]">
            <div className="flex min-h-[330px] justify-center md:justify-start lg:justify-center">
              <GhanaMap
                selectedRegion={selectedRegion}
                onSelectRegion={setSelectedRegion}
              />
            </div>
            <TopRegionsTable
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
            />
          </div>
        </article>

        <div className="self-start lg:col-span-4">
          <TopPublishersTable />
        </div>
      </div>
    </section>
  )
}
