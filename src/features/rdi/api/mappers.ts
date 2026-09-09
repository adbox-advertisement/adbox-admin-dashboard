import type {
  CmsBlock,
  CmsButton,
  CmsFooterLink,
  CmsMedia,
  CmsPageContent,
  CmsPageResponse,
  CmsSiteResponse,
  CmsSiteSettings,
  CmsSnapshot,
} from "./types"
import type {
  RdiContentBlock,
  RdiContentItem,
  RdiMedia,
  RdiPageContent,
  RdiSiteContent,
  RdiSiteSettings,
} from "../types"

const toEditorMedia = (media?: CmsMedia): RdiMedia | undefined =>
  media
    ? { type: media.kind, url: media.url ?? "", alt: media.alt, assetId: media.assetId }
    : undefined

const toCmsMedia = (media?: RdiMedia): CmsMedia | undefined =>
  media
    ? {
      kind: media.type,
      ...(media.assetId
        ? { assetId: media.assetId }
        : media.url
          ? { url: media.url }
          : {}),
      alt: media.alt,
    }
    : undefined

const button = (buttons: CmsButton[] | undefined, index: number) => buttons?.[index]

export function cmsPageToEditor(page: CmsPageResponse): RdiPageContent {
  return {
    id: page.key,
    name: page.name,
    navigationLabel: page.navigationLabel,
    slug: page.slug,
    status: page.publishedVersion ? "Published" : "Draft",
    blocks: [...page.content.blocks]
      .sort((left, right) => left.order - right.order)
      .map((block): RdiContentBlock => ({
        id: block.key,
        type: block.type,
        name: block.name,
        visible: block.visible,
        eyebrow: block.content.eyebrow ?? "",
        title: block.content.title,
        description: block.content.description,
        ...(button(block.content.buttons, 0)
          ? {
            buttonLabel: button(block.content.buttons, 0)?.label,
            buttonHref: button(block.content.buttons, 0)?.href,
          }
          : {}),
        ...(button(block.content.buttons, 1)
          ? {
            secondaryButtonLabel: button(block.content.buttons, 1)?.label,
            secondaryButtonHref: button(block.content.buttons, 1)?.href,
          }
          : {}),
        ...(block.content.media ? { media: toEditorMedia(block.content.media) } : {}),
        items: [...block.items]
          .sort((left, right) => left.order - right.order)
          .map((item): RdiContentItem => ({
            id: item.key,
            visible: item.visible !== false,
            ...(typeof item.metadata?.category === "string" ? { category: item.metadata.category } : {}),
            ...(item.eyebrow !== undefined ? { eyebrow: item.eyebrow } : {}),
            title: item.title,
            description: item.description,
            ...(item.features ? { features: item.features } : {}),
            ...(button(item.buttons, 0)
              ? {
                buttonLabel: button(item.buttons, 0)?.label,
                buttonHref: button(item.buttons, 0)?.href,
              }
              : {}),
            ...(item.media ? { media: toEditorMedia(item.media) } : {}),
          })),
      })),
  }
}

export function cmsSnapshotToEditor(snapshot: CmsSnapshot): RdiSiteContent {
  const divisions = snapshot.site.settings.footer.columns.find(({ key }) => key === "divisions")
  const company = snapshot.site.settings.footer.columns.find(({ key }) => key === "company")
  const footer = snapshot.site.settings.footer
  return {
    version: snapshot.site.version,
    settings: {
      siteName: snapshot.site.settings.branding.siteName,
      footerDescription: footer.description,
      footerQuickLinksHeading: divisions?.heading ?? "Our Divisions",
      footerQuickLinks: divisions?.links.map(({ label }) => label) ?? [],
      footerServicesHeading: company?.heading ?? "Company",
      footerServices: company?.links.map(({ label }) => label) ?? [],
      footerContactHeading: footer.contact.heading,
      contactAddress: footer.contact.address,
      contactPhone: footer.contact.phone,
      contactEmail: footer.contact.email,
      legalLinks: [],
      copyright: footer.copyright,
    },
    pages: snapshot.pages.map(cmsPageToEditor),
  }
}

const cmsButtons = (
  label?: string,
  href?: string,
  secondaryLabel?: string,
  secondaryHref?: string,
): CmsButton[] | undefined => {
  const buttons: CmsButton[] = []
  if (label !== undefined || href !== undefined) {
    buttons.push({
      key: "primary-action",
      label: label ?? "",
      href: href ?? "",
      style: "primary",
      external: /^https?:\/\//.test(href ?? ""),
    })
  }
  if (secondaryLabel !== undefined || secondaryHref !== undefined) {
    buttons.push({
      key: "secondary-action",
      label: secondaryLabel ?? "",
      href: secondaryHref ?? "",
      style: "secondary",
      external: /^https?:\/\//.test(secondaryHref ?? ""),
    })
  }
  return buttons.length ? buttons : undefined
}

export function editorPageToCms(
  page: RdiPageContent,
  current: CmsPageResponse,
): CmsPageContent {
  const blocks: CmsBlock[] = page.blocks.map((block, order) => ({
    key: block.id,
    type: block.type,
    name: block.name,
    visible: block.visible,
    order,
    content: {
      eyebrow: block.eyebrow,
      title: block.title,
      description: block.description,
      ...(cmsButtons(
        block.buttonLabel,
        block.buttonHref,
        block.secondaryButtonLabel,
        block.secondaryButtonHref,
      )
        ? {
          buttons: cmsButtons(
            block.buttonLabel,
            block.buttonHref,
            block.secondaryButtonLabel,
            block.secondaryButtonHref,
          ),
        }
        : {}),
      ...(block.media ? { media: toCmsMedia(block.media) } : {}),
      ...(current.content.blocks.find(({ key }) => key === block.id)?.content.metadata
        ? {
          metadata: current.content.blocks.find(({ key }) => key === block.id)?.content
            .metadata,
        }
        : {}),
    },
    items: (block.items ?? []).map((item, itemOrder) => ({
      key: item.id,
      ...(item.eyebrow !== undefined ? { eyebrow: item.eyebrow } : {}),
      title: item.title,
      description: item.description,
      order: itemOrder,
      visible: item.visible !== false,
      ...(item.features ? { features: item.features } : {}),
      ...(cmsButtons(item.buttonLabel, item.buttonHref)
        ? { buttons: cmsButtons(item.buttonLabel, item.buttonHref) }
        : {}),
      ...(item.media ? { media: toCmsMedia(item.media) } : {}),
      ...(item.category !== undefined || current.content.blocks
        .find(({ key }) => key === block.id)
        ?.items.find(({ key }) => key === item.id)?.metadata
        ? {
          metadata: {
            ...current.content.blocks
              .find(({ key }) => key === block.id)
              ?.items.find(({ key }) => key === item.id)?.metadata,
            ...(item.category !== undefined ? { category: item.category } : {}),
          },
        }
        : {}),
    })),
    ...(current.content.blocks.find(({ key }) => key === block.id)?.variant
      ? { variant: current.content.blocks.find(({ key }) => key === block.id)?.variant }
      : {}),
    ...(current.content.blocks.find(({ key }) => key === block.id)?.metadata
      ? { metadata: current.content.blocks.find(({ key }) => key === block.id)?.metadata }
      : {}),
  }))
  return { seo: current.content.seo, blocks }
}

const linkFor = (label: string) => {
  const value = label.toLowerCase()
  if (value.includes("construction")) return "/construction"
  if (value.includes("media")) return "/media"
  if (value.includes("solar")) return "/solar"
  if (value.includes("about")) return "/about"
  if (value.includes("contact") || value.includes("consultation")) return "/contact"
  return value === "home" ? "/" : "#"
}

function footerLinks(labels: string[], existing: CmsFooterLink[] | undefined, prefix: string) {
  return labels.map((label, order) => {
    const previous = existing?.[order]
    return {
      key: previous?.key ?? `${prefix}-${order + 1}`,
      label,
      href: previous?.label === label ? previous.href : linkFor(label),
      order,
      visible: true,
      external: false,
    }
  })
}

export function editorSettingsToCms(
  settings: RdiSiteSettings,
  current: CmsSiteResponse,
): CmsSiteSettings {
  const divisions = current.settings.footer.columns.find(({ key }) => key === "divisions")
  const company = current.settings.footer.columns.find(({ key }) => key === "company")
  return {
    ...current.settings,
    branding: { ...current.settings.branding, siteName: settings.siteName },
    footer: {
      ...current.settings.footer,
      description: settings.footerDescription,
      columns: [
        {
          key: "divisions",
          heading: settings.footerQuickLinksHeading,
          order: 0,
          links: footerLinks(
            settings.footerQuickLinks,
            divisions?.links,
            "division",
          ),
        },
        {
          key: "company",
          heading: settings.footerServicesHeading,
          order: 1,
          links: footerLinks(
            settings.footerServices,
            company?.links,
            "company",
          ),
        },
      ],
      contact: {
        heading: settings.footerContactHeading,
        address: settings.contactAddress,
        phone: settings.contactPhone,
        email: settings.contactEmail,
      },
      copyright: settings.copyright,
    },
  }
}
