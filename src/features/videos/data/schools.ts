import ugIllustration from "@/assets/schools/ug.jpg"
import knustIllustration from "@/assets/schools/knust.jpg"
import udsIllustration from "@/assets/schools/uds.jpg"
import ghMediaIllustration from "@/assets/schools/gh-media.jpg"
import umatIllustration from "@/assets/schools/umat.jpg"

export const uploadSchools = [
  { id: "ug", name: "University of Ghana, Legon", initials: "UG", image: ugIllustration },
  { id: "knust", name: "KNUST", initials: "KNUST", image: knustIllustration },
  { id: "uds", name: "UDS", initials: "UDS", image: udsIllustration },
  { id: "gh-media", name: "GH Media", initials: "GH", image: ghMediaIllustration },
  { id: "umat", name: "UMaT", initials: "UMaT", image: umatIllustration },
] as const

export type UploadSchoolId = typeof uploadSchools[number]["id"]
