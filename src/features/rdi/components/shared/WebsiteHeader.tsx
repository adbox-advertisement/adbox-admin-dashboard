import { useCmsText } from "../../cms/use-cms-content"
import { Menu, X } from "lucide-react"
import { useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { websitePages } from "../../config/navigation"
import { WebsiteLink } from "./WebsiteLink"
export function WebsiteHeader({ scrolled }: {
  scrolled: boolean
}) {
  const content = useCmsText()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const { pathname } = useLocation()
  const currentPath = pathname.replace(/^\/rdi\/(website|preview)/, "").replace(/^\/home$/, "/") || "/"
  return (<header onKeyDown={event => {
    if (event.key === "Escape" && menuOpen) {
      setMenuOpen(false)
      menuButton.current?.focus()
    }
  }} className={cn("sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all", scrolled ? "py-1 shadow-adbox-medium" : "py-2 shadow-adbox-small")}>
    <div className="rdi-container mx-auto px-4">
      <div className="flex items-center justify-between gap-6">
        <WebsiteLink href={"/"} aria-label="RichDad Investments home" className="flex shrink-0 items-center gap-2">
          <img src={content("site.brand.logo", "/rdi-assets/logo.png")} alt={content("site.brand.name", "RichDad Investments")} className="size-14 rounded-lg object-cover @min-[640px]/rdi:size-16" />
          <span className="relative rdi-heading text-xl font-semibold text-[#0F172A]">

            {content("site.brand.name", "RDI")}<span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#F97316] via-[#A855F7] to-[#10B981]" />
          </span>
        </WebsiteLink>
        <nav aria-label="Primary navigation" className="hidden items-center gap-5 @min-[1280px]/rdi:flex">
          {websitePages.map(page => <WebsiteLink key={page.id} href={page.href} aria-current={currentPath === page.href ? "page" : undefined} className={cn("rdi-nav-link whitespace-nowrap text-sm @min-[1536px]/rdi:text-base", currentPath === page.href && page.activeColor)}>
            {content(`site.navigation.${page.id}`, page.label)}
          </WebsiteLink>)}
        </nav>
        <button ref={menuButton} type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="rdi-mobile-navigation" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} className="rounded-lg p-2 text-[#0F172A] transition-colors hover:bg-slate-100 hover:text-[#B45309] @min-[1280px]/rdi:hidden">
          {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>
      <nav id="rdi-mobile-navigation" aria-label="Mobile navigation" hidden={!menuOpen} className="@min-[1280px]/rdi:hidden">
        <div className="grid gap-1 border-t border-slate-100 py-3">
          {websitePages.map(page => <WebsiteLink key={page.id} href={page.href} onClick={() => setMenuOpen(false)} aria-current={currentPath === page.href ? "page" : undefined} className={cn("rounded-lg px-3 py-3 font-medium transition-colors hover:bg-slate-50", currentPath === page.href ? page.activeColor : "text-[#0F172A]")}>
            {content(`site.navigation.${page.id}`, page.label)}
          </WebsiteLink>)}
        </div>
      </nav>
    </div>
  </header>)
}
