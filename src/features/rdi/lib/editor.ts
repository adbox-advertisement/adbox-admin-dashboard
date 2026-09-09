import { initialRdiSiteContent } from "../data"
import type { RdiBlockType, RdiContentBlock, RdiSiteContent } from "../types"

export function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}`
}

export function cloneInitialContent() {
  return JSON.parse(JSON.stringify(initialRdiSiteContent)) as RdiSiteContent
}

export function createBlock(type: RdiBlockType): RdiContentBlock {
  const baseBlock = {
    id: makeId("section"),
    type,
    name: blockTypeLabels[type],
    visible: true,
    eyebrow: "Section label",
    title: "Add a clear section heading",
    description: "Write a short description that helps visitors understand this section.",
  }

  if (type === "hero") {
    return {
      ...baseBlock,
      buttonLabel: "Primary action",
      buttonHref: "/contact",
      secondaryButtonLabel: "Secondary action",
      secondaryButtonHref: "/about",
      media: { type: "image", url: "", alt: "" },
    }
  }

  if (type === "split") {
    return {
      ...baseBlock,
      buttonLabel: "Learn more",
      buttonHref: "/about",
      media: { type: "image", url: "", alt: "" },
    }
  }

  if (type === "cards") {
    return {
      ...baseBlock,
      items: [
        {
          id: makeId("item"),
          eyebrow: "Item label",
          title: "New card",
          description: "Add the supporting copy for this card.",
        },
      ],
    }
  }

  if (type === "stats") {
    return {
      ...baseBlock,
      items: [{ id: makeId("stat"), title: "100+", description: "Stat label" }],
    }
  }

  return {
    ...baseBlock,
    buttonLabel: "Get started",
    buttonHref: "/contact",
  }
}

export const blockTypeLabels: Record<RdiBlockType, string> = {
  hero: "Hero banner",
  split: "Text + media",
  cards: "Card collection",
  stats: "Impact numbers",
  cta: "Call to action",
}
