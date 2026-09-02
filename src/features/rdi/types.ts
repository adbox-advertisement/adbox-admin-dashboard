export type RdiMediaType = "image" | "video"

export type RdiBlockType = "hero" | "split" | "cards" | "stats" | "cta"

export type RdiPageStatus = "Published" | "Draft"

export type RdiPreviewSize = "desktop" | "tablet"

export type RdiMedia = {
  type: RdiMediaType
  url: string
  alt: string
}

export type RdiContentItem = {
  id: string
  eyebrow?: string
  title: string
  description: string
  features?: string[]
  buttonLabel?: string
  buttonHref?: string
  media?: RdiMedia
}

export type RdiContentBlock = {
  id: string
  type: RdiBlockType
  name: string
  visible: boolean
  eyebrow: string
  title: string
  description: string
  buttonLabel?: string
  buttonHref?: string
  secondaryButtonLabel?: string
  secondaryButtonHref?: string
  media?: RdiMedia
  items?: RdiContentItem[]
}

export type RdiPageContent = {
  id: string
  name: string
  navigationLabel: string
  slug: string
  status: RdiPageStatus
  blocks: RdiContentBlock[]
}

export type RdiSiteSettings = {
  siteName: string
  footerDescription: string
  footerQuickLinksHeading: string
  footerQuickLinks: string[]
  footerServicesHeading: string
  footerServices: string[]
  footerContactHeading: string
  contactAddress: string
  contactPhone: string
  contactEmail: string
  legalLinks: string[]
  copyright: string
}

export type RdiSiteContent = {
  version: number
  settings: RdiSiteSettings
  pages: RdiPageContent[]
}
