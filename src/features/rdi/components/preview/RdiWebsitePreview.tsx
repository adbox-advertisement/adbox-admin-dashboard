import { Mail, MapPin, Menu, Pencil, Phone, X } from "lucide-react"
import { useState } from "react"

import { RdiLiveAboutBlock } from "./RdiLiveAbout"
import { RdiLiveConstructionBlock } from "./RdiLiveConstruction"
import { RdiLiveContact } from "./RdiLiveContact"
import { RdiLiveHome } from "./RdiLiveHome"
import { RdiLiveMedia } from "./RdiLiveMedia"
import { RdiLiveSolarBlock } from "./RdiLiveSolar"
import { RdiPreviewContext, useRdiPreview } from "./RdiPreviewContext"
import { RdiPreviewFrame } from "./RdiPreviewFrame"
import { RdiAction, RdiHeading, RdiImage, RdiLink, RdiSection } from "./RdiPreviewPrimitives"
import type { RdiContentBlock, RdiPageContent, RdiPreviewSize, RdiSiteSettings } from "../../types"

const logo = "https://www.richdadinvestments.org/logo.png"
const activeColors: Record<string, string> = { construction: "text-orange-600", media: "text-purple-600", solar: "text-emerald-700" }

function WebsiteHeader({ pageId }: { pageId: string }) {
  const { pages, settings } = useRdiPreview()
  const [menuOpen, setMenuOpen] = useState(false)
  const links = pages.map(page => <RdiLink key={page.id} href={page.slug} onClick={() => setMenuOpen(false)} aria-current={pageId === page.id ? "page" : undefined} className={`rounded-lg px-3 py-3 text-sm font-semibold transition-colors hover:bg-slate-50 xl:px-0 ${page.id === pageId ? activeColors[page.id] ?? "text-amber-700" : "text-slate-900"}`}>{page.navigationLabel}</RdiLink>)
  return <header className="relative z-40 border-b border-slate-200 bg-white py-2 shadow-adbox-small">
    <div className="rdi-container px-4">
      <div className="flex items-center justify-between gap-6">
        <RdiLink href="/" aria-label={`${settings.siteName} home`} className="flex shrink-0 items-center gap-2">
          <img src={logo} alt={settings.siteName} className="size-14 rounded-lg object-cover sm:size-16" />
          <span className="relative text-xl font-semibold text-slate-900">RDI<span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-orange-500 via-purple-400 to-emerald-500" /></span>
        </RdiLink>
        <nav aria-label="Primary navigation" className="hidden items-center gap-5 xl:flex">{links}</nav>
        <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="rdi-mobile-nav" className="flex size-11 items-center justify-center rounded-lg text-slate-900 hover:bg-slate-100 xl:hidden">{menuOpen ? <X /> : <Menu />}</button>
      </div>
      <nav id="rdi-mobile-nav" aria-label="Mobile navigation" className={`${menuOpen ? "grid" : "hidden"} mt-2 border-t border-slate-100 py-3 xl:hidden`}>{links}</nav>
    </div>
  </header>
}

function WebsiteFooter({ onEdit }: { onEdit?: () => void }) {
  const { settings, pages } = useRdiPreview()
  const hrefFor = (label: string) => pages.find(page => [page.navigationLabel, page.name, page.id].some(name => label.toLowerCase().includes(name.toLowerCase())))?.slug ?? "#"
  return <footer className="group/rdi-footer relative bg-[#0F172A] px-4 py-12 text-white sm:py-16">
    {onEdit ? <button type="button" onClick={onEdit} className="rdi-edit-button absolute right-3 top-3 flex items-center gap-2 rounded-md bg-purple px-3 py-2 text-xs font-semibold opacity-0 shadow-adbox-small group-hover/rdi-footer:opacity-100 focus-visible:opacity-100"><Pencil className="size-3.5" />Edit footer</button> : null}
    <div className="rdi-container">
      <div className="mb-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div><RdiLink href="/" className="mb-5 flex items-center gap-3" aria-label={`${settings.siteName} home`}><img src={logo} alt={settings.siteName} className="size-12 rounded-lg object-cover" /><span className="text-xl font-bold">RDI</span></RdiLink><p className="max-w-xs leading-relaxed text-slate-400">{settings.footerDescription}</p><div className="mt-6 flex gap-3">{["f", "◎", "in"].map((mark, index) => <span key={index} aria-label={["Facebook", "Instagram", "LinkedIn"][index]} className="flex size-10 items-center justify-center rounded-full bg-white/5 text-slate-400">{mark}</span>)}</div></div>
        {[{ heading: settings.footerQuickLinksHeading, links: settings.footerQuickLinks }, { heading: settings.footerServicesHeading, links: settings.footerServices }].map((column, index) => <div key={index}><h2 className="mb-5 text-lg font-semibold">{column.heading}</h2><ul className="space-y-3">{column.links.map((label, i) => <li key={i}><RdiLink href={hrefFor(label)} className="text-slate-400 hover:text-white">{label}</RdiLink></li>)}</ul></div>)}
        <div><h2 className="mb-5 text-lg font-semibold">{settings.footerContactHeading}</h2><ul className="space-y-4 text-slate-400">
          <li><RdiLink href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.contactAddress)}`} target="_blank" rel="noreferrer" className="flex items-start gap-3"><MapPin className="mt-1 size-5 shrink-0 text-amber-400" /><span className="whitespace-pre-line">{settings.contactAddress}</span></RdiLink></li>
          <li><RdiLink href={`tel:${settings.contactPhone.replace(/\(0\)|[^+\d]/g, "")}`} className="flex items-start gap-3"><Phone className="mt-1 size-5 shrink-0 text-purple-400" />{settings.contactPhone}</RdiLink></li>
          <li><RdiLink href={`mailto:${settings.contactEmail}`} className="flex items-start gap-3"><Mail className="mt-1 size-5 shrink-0 text-emerald-400" /><span className="break-all">{settings.contactEmail}</span></RdiLink></li>
        </ul></div>
      </div>
      <p className="border-t border-slate-700 pt-8 text-sm text-slate-400">{settings.copyright}</p>
    </div>
  </footer>
}

/** Newly added CMS sections retain a usable preview without needing a page-specific template. */
function CustomBlock({ block }: { block: RdiContentBlock }) {
  return <RdiSection block={block} className="bg-slate-50 px-4 py-16"><div className="rdi-container"><RdiHeading block={block} /><RdiImage media={block.media} className="mx-auto mb-8 max-w-3xl rounded-2xl" /><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{block.items?.map(item => <article key={item.id} className="rounded-2xl bg-white p-6 shadow-adbox-small"><RdiImage media={item.media} className="mb-5 aspect-video rounded-xl" /><h3 className="text-xl font-semibold text-slate-900">{item.title}</h3><p className="mt-3 whitespace-pre-line text-slate-600">{item.description}</p><ul className="mt-4 space-y-2 text-slate-600">{item.features?.map((feature, index) => <li key={index}>{feature}</li>)}</ul><RdiAction label={item.buttonLabel} href={item.buttonHref} className="mt-5" /></article>)}</div><div className="mt-8 flex flex-wrap justify-center gap-4"><RdiAction label={block.buttonLabel} href={block.buttonHref} /><RdiAction label={block.secondaryButtonLabel} href={block.secondaryButtonHref} className="bg-slate-200 hover:bg-slate-300" /></div></div></RdiSection>
}

export function RdiWebsitePreview({ settings, pages, page, previewSize, onSelectBlock, onEditFooter, onNavigatePage }: {
  settings: RdiSiteSettings
  pages: RdiPageContent[]
  page: RdiPageContent
  previewSize: RdiPreviewSize
  onSelectBlock?: (blockId: string) => void
  onEditFooter?: () => void
  onNavigatePage: (pageId: string) => void
}) {
  const visiblePage = { ...page, blocks: page.blocks.filter(block => block.visible).map(block => ({ ...block, items: block.items?.filter(item => item.visible !== false) })) }
  const renderBlock = (block: RdiContentBlock) => {
    if (page.id === "construction" && block.id.startsWith("construction-")) return <RdiLiveConstructionBlock key={block.id} block={block} />
    if (page.id === "solar" && block.id.startsWith("solar-")) return <RdiLiveSolarBlock key={block.id} block={block} />
    if (page.id === "about" && block.id.startsWith("about-")) return <RdiLiveAboutBlock key={block.id} block={block} />
    return <CustomBlock key={block.id} block={block} />
  }
  return <RdiPreviewFrame size={previewSize}>
    <RdiPreviewContext.Provider value={{ settings, pages, navigate: onNavigatePage, edit: onSelectBlock }}>
      <WebsiteHeader key={`header-${page.id}`} pageId={page.id} />
      <main key={`page-${page.id}`}>
        {page.id === "home" ? <RdiLiveHome page={visiblePage} renderBlock={renderBlock} /> : page.id === "media" ? <RdiLiveMedia page={visiblePage} renderBlock={renderBlock} /> : page.id === "contact" ? <RdiLiveContact page={visiblePage} renderBlock={renderBlock} /> : visiblePage.blocks.map(renderBlock)}
      </main>
      <WebsiteFooter onEdit={onEditFooter} />
    </RdiPreviewContext.Provider>
  </RdiPreviewFrame>
}
