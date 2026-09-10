import type { RdiPageId } from "../types"
export const websitePages: Array<{
  id: RdiPageId
  href: string
  label: string
  activeColor: string
}> = [
    { id: "home", href: "/", label: "Home", activeColor: "text-[#B45309]" },
    { id: "about", href: "/about", label: "About", activeColor: "text-[#B45309]" },
    { id: "construction", href: "/construction", label: "Construction", activeColor: "text-[#EA580C]" },
    { id: "media", href: "/media", label: "Media", activeColor: "text-[#9333EA]" },
    { id: "solar", href: "/solar", label: "Solar Technology", activeColor: "text-[#047857]" },
    { id: "contact", href: "/contact", label: "Contact", activeColor: "text-[#B45309]" },
  ]
