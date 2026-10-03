import type { RdiPageId } from "../types"
export const websitePages: Array<{
  id: RdiPageId
  href: string
  label: string
  activeColor: string
}> = [
    { id: "home", href: "/", label: "Home", activeColor: "text-[#B45309] dark:text-[#FBBF24]" },
    { id: "about", href: "/about", label: "About", activeColor: "text-[#B45309] dark:text-[#FBBF24]" },
    { id: "construction", href: "/construction", label: "Construction", activeColor: "text-[#EA580C] dark:text-[#FB923C]" },
    { id: "media", href: "/media", label: "Media", activeColor: "text-[#9333EA] dark:text-purple-300" },
    { id: "solar", href: "/solar", label: "Solar Technology", activeColor: "text-[#047857] dark:text-[#34D399]" },
    { id: "contact", href: "/contact", label: "Contact", activeColor: "text-[#B45309] dark:text-[#FBBF24]" },
  ]
