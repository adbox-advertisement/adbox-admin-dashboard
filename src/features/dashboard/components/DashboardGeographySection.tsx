import { useState, type KeyboardEvent } from "react"

import geographyBarIcon from "@/assets/dashboard/geography-bar-icon.svg"
import ghanaMap01 from "@/assets/dashboard/ghana-map-01.svg"
import ghanaMap01Raw from "@/assets/dashboard/ghana-map-01.svg?raw"
import ghanaMap02 from "@/assets/dashboard/ghana-map-02.svg"
import ghanaMap02Raw from "@/assets/dashboard/ghana-map-02.svg?raw"
import ghanaMap03 from "@/assets/dashboard/ghana-map-03.svg"
import ghanaMap03Raw from "@/assets/dashboard/ghana-map-03.svg?raw"
import ghanaMap04 from "@/assets/dashboard/ghana-map-04.svg"
import ghanaMap04Raw from "@/assets/dashboard/ghana-map-04.svg?raw"
import ghanaMap05 from "@/assets/dashboard/ghana-map-05.svg"
import ghanaMap05Raw from "@/assets/dashboard/ghana-map-05.svg?raw"
import ghanaMap06 from "@/assets/dashboard/ghana-map-06.svg"
import ghanaMap06Raw from "@/assets/dashboard/ghana-map-06.svg?raw"
import ghanaMap07 from "@/assets/dashboard/ghana-map-07.svg"
import ghanaMap07Raw from "@/assets/dashboard/ghana-map-07.svg?raw"
import ghanaMap08 from "@/assets/dashboard/ghana-map-08.svg"
import ghanaMap08Raw from "@/assets/dashboard/ghana-map-08.svg?raw"
import ghanaMap09 from "@/assets/dashboard/ghana-map-09.svg"
import ghanaMap09Raw from "@/assets/dashboard/ghana-map-09.svg?raw"
import ghanaMap10 from "@/assets/dashboard/ghana-map-10.svg"
import ghanaMap10Raw from "@/assets/dashboard/ghana-map-10.svg?raw"
import ghanaMap11 from "@/assets/dashboard/ghana-map-11.svg"
import ghanaMap11Raw from "@/assets/dashboard/ghana-map-11.svg?raw"
import ghanaMap12 from "@/assets/dashboard/ghana-map-12.svg"
import ghanaMap12Raw from "@/assets/dashboard/ghana-map-12.svg?raw"
import ghanaMap13 from "@/assets/dashboard/ghana-map-13.svg"
import ghanaMap13Raw from "@/assets/dashboard/ghana-map-13.svg?raw"
import ghanaMap14 from "@/assets/dashboard/ghana-map-14.svg"
import ghanaMap14Raw from "@/assets/dashboard/ghana-map-14.svg?raw"
import ghanaMap15 from "@/assets/dashboard/ghana-map-15.svg"
import ghanaMap15Raw from "@/assets/dashboard/ghana-map-15.svg?raw"
import ghanaMap16 from "@/assets/dashboard/ghana-map-16.svg"
import ghanaMap16Raw from "@/assets/dashboard/ghana-map-16.svg?raw"
import publisherAlfredo from "@/assets/dashboard/publisher-alfredo.png"
import publisherGustavo from "@/assets/dashboard/publisher-gustavo.png"
import publisherKadin from "@/assets/dashboard/publisher-kadin.png"
import publisherMarilyn from "@/assets/dashboard/publisher-marilyn.png"
import publisherPaityn from "@/assets/dashboard/publisher-paityn.png"
import { cn } from "@/lib/utils"

type MapRegion = {
  id: string
  name: string
  score: number
  users: string
  viewers: string
  publishers: string
  src: string
  path: string
  viewBox: string
  className: string
}

function getSvgAttribute(svg: string, attribute: "d" | "viewBox") {
  return svg.match(new RegExp(`${attribute}="([^"]+)"`))?.[1] ?? ""
}

const mapRegions: MapRegion[] = [
  {
    id: "western-north",
    name: "Western North",
    score: 8,
    users: "8%",
    viewers: "8k",
    publishers: "13k",
    src: ghanaMap01,
    path: getSvgAttribute(ghanaMap01Raw, "d"),
    viewBox: getSvgAttribute(ghanaMap01Raw, "viewBox"),
    className: "absolute inset-[16.51%_31.08%_50.44%_10.6%]",
  },
  {
    id: "greater-accra",
    name: "Greater Accra",
    score: 35,
    users: "35%",
    viewers: "12k",
    publishers: "24k",
    src: ghanaMap02,
    path: getSvgAttribute(ghanaMap02Raw, "d"),
    viewBox: getSvgAttribute(ghanaMap02Raw, "viewBox"),
    className: "absolute inset-[13.22%_14.26%_54.53%_42.23%]",
  },
  {
    id: "central",
    name: "Central",
    score: 11,
    users: "11%",
    viewers: "9k",
    publishers: "15k",
    src: ghanaMap03,
    path: getSvgAttribute(ghanaMap03Raw, "d"),
    viewBox: getSvgAttribute(ghanaMap03Raw, "viewBox"),
    className: "absolute inset-[55.97%_32.07%_17.43%_17.77%]",
  },
  {
    id: "ashanti",
    name: "Ashanti",
    score: 10,
    users: "10%",
    viewers: "10k",
    publishers: "18k",
    src: ghanaMap04,
    path: getSvgAttribute(ghanaMap04Raw, "d"),
    viewBox: getSvgAttribute(ghanaMap04Raw, "viewBox"),
    className: "absolute inset-[37.87%_18.82%_36.85%_24.92%]",
  },
  {
    id: "eastern",
    name: "Eastern",
    score: 7,
    users: "7%",
    viewers: "7k",
    publishers: "12k",
    src: ghanaMap05,
    path: getSvgAttribute(ghanaMap05Raw, "d"),
    viewBox: getSvgAttribute(ghanaMap05Raw, "viewBox"),
    className: "absolute inset-[62.53%_18.43%_15.12%_45.93%]",
  },
  {
    id: "savannah",
    name: "Savannah",
    score: 5,
    users: "5%",
    viewers: "5k",
    publishers: "8k",
    src: ghanaMap06,
    path: getSvgAttribute(ghanaMap06Raw, "d"),
    viewBox: getSvgAttribute(ghanaMap06Raw, "viewBox"),
    className: "absolute inset-[1.38%_58.21%_77.3%_7.63%]",
  },
  {
    id: "western",
    name: "Western",
    score: 33,
    users: "33%",
    viewers: "11k",
    publishers: "21k",
    src: ghanaMap07,
    path: getSvgAttribute(ghanaMap07Raw, "d"),
    viewBox: getSvgAttribute(ghanaMap07Raw, "viewBox"),
    className: "absolute inset-[78.65%_59.75%_0.04%_1.72%]",
  },
  {
    id: "volta",
    name: "Volta",
    score: 6,
    users: "6%",
    viewers: "6k",
    publishers: "9k",
    src: ghanaMap08,
    path: getSvgAttribute(ghanaMap08Raw, "d"),
    viewBox: getSvgAttribute(ghanaMap08Raw, "viewBox"),
    className: "absolute inset-[37.98%_10.03%_38.79%_66.79%]",
  },
  {
    id: "bono",
    name: "Bono",
    score: 5,
    users: "5%",
    viewers: "5k",
    publishers: "8k",
    src: ghanaMap09,
    path: getSvgAttribute(ghanaMap09Raw, "d"),
    viewBox: getSvgAttribute(ghanaMap09Raw, "viewBox"),
    className: "absolute inset-[37.57%_70.92%_33.89%_2.6%]",
  },
  {
    id: "north-east",
    name: "North East",
    score: 4,
    users: "4%",
    viewers: "4k",
    publishers: "7k",
    src: ghanaMap10,
    path: getSvgAttribute(ghanaMap10Raw, "d"),
    viewBox: getSvgAttribute(ghanaMap10Raw, "viewBox"),
    className: "absolute inset-[6.74%_17.91%_80.8%_36.19%]",
  },
  {
    id: "oti",
    name: "Oti",
    score: 4,
    users: "4%",
    viewers: "4k",
    publishers: "6k",
    src: ghanaMap11,
    path: getSvgAttribute(ghanaMap11Raw, "d"),
    viewBox: getSvgAttribute(ghanaMap11Raw, "viewBox"),
    className: "absolute inset-[60.3%_0.02%_15.52%_76.18%]",
  },
  {
    id: "ahafo",
    name: "Ahafo",
    score: 3,
    users: "3%",
    viewers: "3k",
    publishers: "5k",
    src: ghanaMap12,
    path: getSvgAttribute(ghanaMap12Raw, "d"),
    viewBox: getSvgAttribute(ghanaMap12Raw, "viewBox"),
    className: "absolute inset-[65.29%_74.55%_9.67%_-0.02%]",
  },
  {
    id: "central-east",
    name: "Central East",
    score: 3,
    users: "3%",
    viewers: "3k",
    publishers: "5k",
    src: ghanaMap13,
    path: getSvgAttribute(ghanaMap13Raw, "d"),
    viewBox: getSvgAttribute(ghanaMap13Raw, "viewBox"),
    className: "absolute inset-[76.46%_35.04%_4.28%_24.12%]",
  },
  {
    id: "upper-east",
    name: "Upper East",
    score: 3,
    users: "3%",
    viewers: "3k",
    publishers: "4k",
    src: ghanaMap14,
    path: getSvgAttribute(ghanaMap14Raw, "d"),
    viewBox: getSvgAttribute(ghanaMap14Raw, "viewBox"),
    className: "absolute inset-[-0.01%_26.04%_87.21%_37.45%]",
  },
  {
    id: "bono-east",
    name: "Bono East",
    score: 3,
    users: "3%",
    viewers: "3k",
    publishers: "4k",
    src: ghanaMap15,
    path: getSvgAttribute(ghanaMap15Raw, "d"),
    viewBox: getSvgAttribute(ghanaMap15Raw, "viewBox"),
    className: "absolute inset-[59.5%_69.3%_25.59%_7.3%]",
  },
  {
    id: "greater-accra-coast",
    name: "Greater Accra Coast",
    score: 2,
    users: "2%",
    viewers: "2k",
    publishers: "3k",
    src: ghanaMap16,
    path: getSvgAttribute(ghanaMap16Raw, "d"),
    viewBox: getSvgAttribute(ghanaMap16Raw, "viewBox"),
    className: "absolute inset-[81.13%_9.64%_11.47%_62.84%]",
  },
]

const topRegionIds = [
  "greater-accra",
  "western",
  "central",
  "ashanti",
  "western-north",
]

const topRegions = topRegionIds.map(
  (id) => mapRegions.find((region) => region.id === id)!,
)

const publishers = [
  {
    rank: "01",
    name: "Paityn",
    spending: "$7,846",
    views: "35k",
    avatar: publisherPaityn,
  },
  {
    rank: "02",
    name: "Gustavo",
    spending: "$6,846",
    views: "36k",
    avatar: publisherGustavo,
  },
  {
    rank: "03",
    name: "Marilyn",
    spending: "$5,846",
    views: "35k",
    avatar: publisherMarilyn,
  },
  {
    rank: "04",
    name: "Kadin",
    spending: "$4,846",
    views: "25k",
    avatar: publisherKadin,
  },
  {
    rank: "05",
    name: "Alfredo",
    spending: "$7,846",
    views: "23k",
    avatar: publisherAlfredo,
  },
]

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
    <article className="flex min-h-[326px] flex-col overflow-hidden rounded-[14px] bg-white">
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
                className="text-b3 text-grey-500 md:text-b2"
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
        <article className="overflow-hidden rounded-[20px] bg-white px-5 pb-[30px] pt-7 sm:px-8 lg:col-span-8">
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
