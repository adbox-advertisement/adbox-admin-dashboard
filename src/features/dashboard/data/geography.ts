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

export type MapRegion = {
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

export function getSvgAttribute(svg: string, attribute: "d" | "viewBox") {
  return svg.match(new RegExp(`${attribute}="([^"]+)"`))?.[1] ?? ""
}

export const mapRegions: MapRegion[] = [
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

export const topRegionIds = [
  "greater-accra",
  "western",
  "central",
  "ashanti",
  "western-north",
]

export const topRegions = topRegionIds.map(
  (id) => mapRegions.find((region) => region.id === id)!,
)

export const publishers = [
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
