import type { RdiBlockType } from "@/features/rdi/types"

export type CmsActor = { type: "user" | "agent" | "system"; id: string; displayName: string }
export type CmsButton = {
  key: string
  label: string
  href: string
  style: "primary" | "secondary" | "outline" | "text"
  external?: boolean
}
export type CmsMedia = {
  kind: "image" | "video"
  assetId?: string
  url?: string
  alt: string
  caption?: string
}
export type CmsItem = {
  key: string
  eyebrow?: string
  title: string
  description: string
  order: number
  visible?: boolean
  features?: string[]
  buttons?: CmsButton[]
  media?: CmsMedia
  metadata?: Record<string, unknown>
}
export type CmsBlock = {
  key: string
  type: RdiBlockType
  variant?: string
  name: string
  visible: boolean
  order: number
  content: {
    eyebrow?: string
    title: string
    description: string
    buttons?: CmsButton[]
    media?: CmsMedia
    metadata?: Record<string, unknown>
  }
  items: CmsItem[]
  metadata?: Record<string, unknown>
}
export type CmsPageContent = {
  seo: {
    title: string
    description: string
    canonicalUrl?: string
    noIndex: boolean
    socialImage?: CmsMedia
  }
  blocks: CmsBlock[]
}
export type CmsFooterLink = {
  key: string
  label: string
  href: string
  order: number
  visible: boolean
  external?: boolean
}
export type CmsSiteSettings = {
  branding: { siteName: string; logoAssetId?: string; markAssetId?: string }
  navigation: Array<CmsFooterLink & { pageKey: string }>
  footer: {
    description: string
    columns: Array<{ key: string; heading: string; order: number; links: CmsFooterLink[] }>
    contact: { heading: string; address: string; phone: string; email: string }
    socialLinks: CmsFooterLink[]
    copyright: string
  }
}
export type CmsSiteResponse = {
  id: string
  key: string
  version: number
  publishedVersion?: number
  settings: CmsSiteSettings
}
export type CmsPageResponse = {
  id: string
  key: string
  name: string
  navigationLabel: string
  slug: string
  version: number
  publishedVersion?: number
  content: CmsPageContent
}
export type CmsSnapshot = { site: CmsSiteResponse; pages: CmsPageResponse[] }

