import type { RdiPageId } from "../types"
export type CmsFieldKind = "text" | "textarea" | "image" | "link"
export type CmsField = {
  id: string
  label: string
  kind: CmsFieldKind
  value: string
  options?: string[]
}
export type CmsSectionDefinition = {
  id: string
  page: RdiPageId | "site"
  label: string
  fields: CmsField[]
}
export type CmsCollectionEntry = {
  id: string
  template: number
  values: Record<string, string>
}
export type CmsCollectionDefinition = {
  id: string
  section: string
  label: string
  fixed?: boolean
  fields: CmsField[]
  entries: CmsCollectionEntry[]
}
export type CmsAsset = {
  id: string
  name: string
  src: string
  alt: string
  category: string
  addedAt?: string
}
export type CmsSeo = {
  title: string
  description: string
}
export type CmsDraft = {
  version: 1
  values: Record<string, string>
  hiddenSections: string[]
  collections: Record<string, CmsCollectionEntry[]>
  assets: CmsAsset[]
  seo: Record<string, CmsSeo>
  updatedAt: string | null
}
