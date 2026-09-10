import ugIllustration from "@/assets/schools/ug.jpg"
import knustIllustration from "@/assets/schools/knust.jpg"
import udsIllustration from "@/assets/schools/uds.jpg"
import ghMediaIllustration from "@/assets/schools/gh-media.jpg"
import umatIllustration from "@/assets/schools/umat.jpg"
import gisIllustration from "@/assets/schools/gis.svg"

export const uploadSchools = [
  { id: "ug", name: "University of Ghana, Legon", initials: "UG", image: ugIllustration },
  { id: "knust", name: "KNUST", initials: "KNUST", image: knustIllustration },
  { id: "uds", name: "UDS", initials: "UDS", image: udsIllustration },
  { id: "gh-media", name: "GH Media", initials: "GH", image: ghMediaIllustration },
  { id: "umat", name: "UMaT", initials: "UMaT", image: umatIllustration },
  { id: "gis", name: "Ghana International School", initials: "GIS", image: gisIllustration },
] as const

export type UploadSchoolId = typeof uploadSchools[number]["id"]
