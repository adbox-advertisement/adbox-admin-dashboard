import { siteSections } from "./data/site-settings"
import { sectionData } from "./data/sections"
import { constructionServices, constructionProjects } from "../data/construction"
import { mediaProjects } from "../data/media"
import { solarProducts } from "../data/solar"
import { contactFaqs, contactTeams } from "../data/contact"
import { divisions } from "../data/divisions"
import type { CmsAsset, CmsCollectionDefinition, CmsField, CmsSectionDefinition } from "./types"
export const cmsSections: CmsSectionDefinition[] = [...sectionData.filter(section => section.page !== "site"), ...siteSections]
export const cmsPages = [
  { id: "home", name: "Home", description: "A warm welcome to your three divisions.", path: "/", image: "/rdi-assets/construction/residential-buildings.jpg", color: "bg-accent-background text-blue", theme: "from-grey-1000 to-blue", headline: "Three divisions.\nOne vision." },
  { id: "about", name: "About", description: "Your story, your people, your purpose.", path: "/about", image: "/rdi-assets/36.jpg", color: "bg-accent-background text-blue", theme: "from-grey-1000 to-grey-700", headline: "One connected\nvision." },
  { id: "construction", name: "Construction", description: "Showcase the work you build with pride.", path: "/construction", image: "/rdi-assets/construction/building-construction.jpg", color: "bg-warning-100 text-warning-800", theme: "from-grey-900 to-warning-800", headline: "Built around\nyour vision." },
  { id: "media", name: "Media", description: "Give your creative work the spotlight.", path: "/media", image: "/rdi-assets/media/photo-1478720568477-152d9b164e26-800.jpg", color: "bg-purple/10 text-blue", theme: "from-blue to-purple", headline: "Stories that\nmove people." },
  { id: "solar", name: "Solar Technology", description: "Make a brighter future easy to explore.", path: "/solar", image: "/rdi-assets/solar/allolla/product-family.jpg", color: "bg-success-100 text-success-800", theme: "from-success-1000 to-success-700", headline: "Power a\nbrighter future." },
  { id: "contact", name: "Contact", description: "Help the next great project find you.", path: "/contact", image: "/rdi-assets/construction/completed-building.jpg", color: "bg-auth-background text-blue", theme: "from-grey-900 to-blue", headline: "Let’s start\nsomething great." },
] as const
function editableFields(value: unknown, path = ""): CmsField[] {
  if (typeof value === "string") {
    const key = path.split(".").slice(-1)[0] ?? path
    const label = ({ alt: "Image description", image: "Image", href: "Link destination", name: "Name", title: "Title", description: "Description", question: "Question", answer: "Answer", summary: "Summary", eyebrow: "Small heading", promise: "Our promise", model: "Model", category: "Category", client: "Client", year: "Year" } as Record<string, string>)[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, text => text.toUpperCase())
    return [{ id: path, label: path.startsWith("specifications.") ? `Specification ${Number(path.split(".")[1]) + 1} ${key}` : /^\d+$/.test(key) ? `${path.startsWith("tags.") ? "Tag" : "Item"} ${Number(key) + 1}` : label, kind: key === "image" ? "image" : key === "href" ? "link" : value.length > 100 ? "textarea" : "text", value }]
  }
  if (!value || typeof value !== "object")
    return []
  return Object.entries(value).flatMap(([key, child]) => ["id", "key", "icon", "buttonActive"].includes(key) || key.endsWith("Style") ? [] : editableFields(child, path ? `${path}.${key}` : key))
}
function collection(id: string, section: string, label: string, items: unknown[], fixed = false): CmsCollectionDefinition {
  const fields = [...new Map(items.flatMap(item => editableFields(item)).map(field => [field.id, field])).values()]
  for (const field of fields) {
    if (field.id === "category")
      field.options = [...new Set(items.map(item => String((item as Record<string, unknown>).category)))]
  }
  return { id, section, label, fixed, fields, entries: items.map((item, index) => ({ id: `${id}-${index + 1}`, template: index, values: Object.fromEntries(editableFields(item).map(field => [field.id, field.value])) })) }
}
export const cmsCollections = [
  collection("divisions", "about.our-divisions", "Divisions", divisions, true),
  collection("services", "construction.our-services", "Services", constructionServices),
  collection("construction-projects", "construction.project-gallery", "Projects", constructionProjects),
  collection("media-projects", "media.featured-work", "Projects", mediaProjects),
  collection("solar-products", "solar.product-catalogue", "Products", solarProducts),
  collection("contact-teams", "contact.our-teams", "Division contacts", contactTeams, true),
  collection("faqs", "contact.frequently-asked-questions", "Questions", contactFaqs),
]
const imageFields = [...cmsSections.flatMap(section => section.fields), ...cmsCollections.flatMap(collection => collection.entries.flatMap(entry => Object.entries(entry.values).filter(([key]) => key === "image").map(([id, value]) => ({ id, value, kind: "image" as const, label: "Image" }))))]
export const originalAssets: CmsAsset[] = [...new Set(imageFields.filter(field => field.kind === "image").map(field => field.value))].map((src, index) => ({
  id: `original-${index}`, src,
  name: src.includes("/photo-") ? `Media production ${index + 1}` : src.endsWith("/36.jpg") ? "Company story" : src.split("/").slice(-1)[0]?.replace(/\.[^.]+$/, "").replace(/-/g, " ") ?? "Website image",
  alt: "", category: src.includes("/construction/") ? "Construction" : src.includes("/solar/") ? "Solar" : src.includes("/media/") ? "Media" : "Brand",
}))
export const fieldDefinitions = new Map(cmsSections.flatMap(section => section.fields.map(field => [field.id, field] as const)))
export const libraryAssets = (custom: CmsAsset[]) => [...custom, ...originalAssets.filter(asset => !custom.some(item => item.id === asset.id))]
