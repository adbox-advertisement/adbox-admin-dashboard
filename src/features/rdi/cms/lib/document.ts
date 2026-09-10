import { z } from "zod"
import { cmsSections, cmsCollections } from "../catalog"
import type { CmsDraft } from "../types"
export const CMS_STORAGE_KEY = "adbox-rdi-cms-v1"
export const isSafeLink = (value: string) => value === "" || /^(\/(?!\/)|#|https:\/\/|mailto:|tel:)/i.test(value.trim())
export const isSafeImage = (value: string) => /^\/rdi-assets\/[a-zA-Z0-9/_.-]+$/.test(value) || /^data:image\/(png|jpeg|webp|gif);base64,[a-zA-Z0-9+/=]+$/.test(value)
const fieldsSchema = z.record(z.string().max(150), z.string().max(10000))
export const cmsDraftSchema = z.object({
  version: z.literal(1),
  values: fieldsSchema,
  hiddenSections: z.array(z.string().max(100)).max(100),
  collections: z.record(z.string().max(100), z.array(z.object({ id: z.string().min(1).max(150), template: z.number().int().min(0).max(1000), values: fieldsSchema })).min(1).max(100)),
  assets: z.array(z.object({ id: z.string().min(1).max(150), name: z.string().max(200), src: z.string().max(2900000).refine(isSafeImage), alt: z.string().max(500), category: z.string().max(100), addedAt: z.string().optional() })).max(50),
  seo: z.record(z.string(), z.object({ title: z.string().max(150), description: z.string().max(500) })),
  updatedAt: z.string().nullable(),
}).superRefine((draft, context) => {
  if (new Set(draft.assets.map(asset => asset.id)).size !== draft.assets.length) {
    context.addIssue({ code: "custom", path: ["assets"], message: "Image identifiers must be unique." })
  }
  for (const [id, entries] of Object.entries(draft.collections)) {
    const definition = cmsCollections.find(collection => collection.id === id)
    if (!definition || entries.some(entry => entry.template >= definition.entries.length)
      || new Set(entries.map(entry => entry.id)).size !== entries.length
      || (definition.fixed && (entries.length !== definition.entries.length || entries.some((entry, index) => entry.template !== index)))) {
      context.addIssue({ code: "custom", path: ["collections", id], message: "This collection does not match the website structure." })
    }
  }
})
export const emptyDraft = (): CmsDraft => ({ version: 1, values: {}, hiddenSections: [], collections: {}, assets: [], seo: {}, updatedAt: null })
export function downloadDraft(draft: CmsDraft) {
  const url = URL.createObjectURL(new Blob([JSON.stringify({ ...draft, values: { ...Object.fromEntries(cmsSections.flatMap(section => section.fields.map(field => [field.id, field.value]))), ...draft.values }, collections: { ...Object.fromEntries(cmsCollections.map(collection => [collection.id, collection.entries])), ...draft.collections } }, null, 2)], { type: "application/json" }))
  const link = document.createElement("a")
  link.href = url
  link.download = `rdi-website-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
