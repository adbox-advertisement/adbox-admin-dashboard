import type { CmsSectionDefinition } from "../types"
import { websitePages } from "../../config/navigation"
export const siteSections: CmsSectionDefinition[] = [
  {
    id: "site.brand", page: "site", label: "Brand & identity", fields: [
      { id: "site.brand.logo", label: "Website logo", kind: "image", value: "/rdi-assets/logo.png" },
      { id: "site.brand.name", label: "Short brand name", kind: "text", value: "RDI" },
      { id: "site.brand.description", label: "About your business", kind: "textarea", value: "Building spaces, shaping stories, and powering progress through three specialized divisions." },
    ]
  },
  {
    id: "site.contact", page: "site", label: "Contact information", fields: [
      { id: "site.contact.email", label: "General email address", kind: "text", value: "info@richdadinvestments.com" },
      { id: "site.contact.phone", label: "General phone number", kind: "text", value: "+233 (0) 30 123 4567" },
      { id: "site.contact.address", label: "Office address", kind: "textarea", value: "No. 64A, Omensa Plaza\nOff Awoshie Pokuase Rd." },
    ]
  },
  { id: "site.navigation", page: "site", label: "Navigation labels", fields: websitePages.map(page => ({ id: `site.navigation.${page.id}`, label: `${page.label} menu label`, kind: "text", value: page.label })) },
  {
    id: "site.footer", page: "site", label: "Footer", fields: [
      { id: "site.footer.6", label: "Divisions column heading", kind: "text", value: "Our Divisions" },
      { id: "site.footer.7", label: "Company column heading", kind: "text", value: "Company" },
      { id: "site.footer.8", label: "Contact column heading", kind: "text", value: "Contact" },
      { id: "site.footer.13", label: "Copyright notice", kind: "text", value: "© 2026 RichDad Investments. All rights reserved." },
    ]
  },
]
