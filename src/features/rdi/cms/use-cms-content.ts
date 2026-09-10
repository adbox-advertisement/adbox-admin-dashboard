import { useCmsStore } from "./store"
import { cmsCollections, fieldDefinitions } from "./catalog"
import { imageSource } from "./lib/media"
import type { CmsAsset } from "./types"
import { isSafeImage, isSafeLink } from "./lib/document"
export function useCmsText() {
  const values = useCmsStore(state => state.draft.values)
  const assets = useCmsStore(state => state.draft.assets)
  return (id: string, fallback: string): string => {
    const value = values[id] ?? fallback
    const kind = fieldDefinitions.get(id)?.kind
    if (kind === "image") {
      const source = imageSource(value, assets)
      return isSafeImage(source) ? source : fallback
    }
    if (kind === "link" && !isSafeLink(value))
      return fallback
    return value
  }
}
function applyValues<T>(template: T, values: Record<string, string>, assets: CmsAsset[], prefix = ""): T {
  if (typeof template === "string") {
    const value = values[prefix] ?? template
    if (prefix === "image") {
      const source = imageSource(value, assets)
      return (isSafeImage(source) ? source : template) as T
    }
    if (prefix === "href" && !isSafeLink(value))
      return template
    return value as T
  }
  if (Array.isArray(template))
    return template.map((value, index) => applyValues(value, values, assets, prefix ? `${prefix}.${index}` : String(index))) as T
  if (template && typeof template === "object") {
    return Object.fromEntries(Object.entries(template).map(([key, value]) => [key, ["icon", "id", "key", "buttonActive"].includes(key) || key.endsWith("Style") ? value : applyValues(value, values, assets, prefix ? `${prefix}.${key}` : key)])) as T
  }
  return template
}
export function useCmsCollection<T extends object>(id: string, templates: T[]): (T & {
  cmsId: string
})[] {
  const entries = useCmsStore(state => state.draft.collections[id])
  const assets = useCmsStore(state => state.draft.assets)
  const definition = cmsCollections.find(collection => collection.id === id)
  if (!definition)
    return templates.map((template, index) => ({ ...template, cmsId: `${id}-${index}` }))
  return (entries ?? definition.entries).map((entry, index) => {
    const template = templates[entry.template] ?? templates[0]
    const result = applyValues(template, entry.values, assets)
    if (!definition.fixed) {
      if ("id" in result)
        Object.assign(result, { id: typeof result.id === "number" ? index + 1 : entry.id })
      if ("key" in result)
        Object.assign(result, { key: entry.id })
    }
    return { ...result, cmsId: entry.id }
  })
}
