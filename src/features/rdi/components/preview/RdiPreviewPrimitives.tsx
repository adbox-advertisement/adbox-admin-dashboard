import { ArrowRight, Pencil } from "lucide-react"
import { useId, type AnchorHTMLAttributes, type ReactNode } from "react"
import type { RdiContentBlock, RdiMedia } from "../../types"
import { RdiMediaDisplay } from "../shared/RdiMediaDisplay"
import { useRdiPreview } from "./RdiPreviewContext"
import { cn } from "@/lib/utils"

export function RdiLink({ href = "", children, onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { pages, navigate } = useRdiPreview()
  let url: URL | undefined
  try {
    if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(href)) url = new URL(href, "https://www.richdadinvestments.org")
  } catch { /* Incomplete destinations remain inert while the editor is typing. */ }
  const safeHref = url && ["http:", "https:", "mailto:", "tel:"].includes(url.protocol) ? url.href : undefined
  return <a {...props} href={safeHref} onClick={(event) => {
    onClick?.(event)
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (!url || !safeHref) { event.preventDefault(); return }
    if (url.origin !== "https://www.richdadinvestments.org") return
    const destination = pages.find(page => page.slug === url.pathname)
    if (href.startsWith("#")) {
      event.preventDefault()
      event.currentTarget.ownerDocument.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" })
    } else if (destination) {
      event.preventDefault()
      navigate(destination.id)
      event.currentTarget.ownerDocument.defaultView?.frameElement?.scrollIntoView({ block: "start" })
    }
  }}>{children}</a>
}

export function RdiSection({ block, children, className, id }: { block: RdiContentBlock; children: ReactNode; className?: string; id?: string }) {
  const { edit } = useRdiPreview()
  const headingId = useId()
  if (!block.visible) return null
  return <section id={id ?? block.id} aria-label={block.name} className={cn("group/rdi-section relative", className)}>
    {edit ? <button type="button" onClick={() => edit(block.id)} aria-describedby={headingId} className="rdi-edit-button absolute right-3 top-3 z-30 flex items-center gap-2 rounded-md bg-purple px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-adbox-small transition-opacity group-hover/rdi-section:opacity-100 focus-visible:opacity-100"><Pencil className="size-3.5" />Edit <span id={headingId}>{block.name}</span></button> : null}
    {children}
  </section>
}

export function RdiAction({ label, href, secondary, className }: { label?: string; href?: string; secondary?: boolean; className?: string }) {
  if (!label) return null
  return <RdiLink href={href} className={cn("inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-7 py-3 font-semibold transition-colors", secondary ? "border border-white/30 bg-white/5 text-white hover:bg-white/10" : "bg-[#F97316] text-[#1E293B] hover:bg-[#FB923C]", className)}>{label}<ArrowRight aria-hidden="true" className="size-5" /></RdiLink>
}

export function RdiHeading({ block, dark, className }: { block: RdiContentBlock; dark?: boolean; className?: string }) {
  return <div className={cn("mx-auto mb-12 max-w-3xl text-center", className)}>
    {block.eyebrow ? <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#047857]">{block.eyebrow}</p> : null}
    <h2 className={cn("whitespace-pre-line text-3xl font-bold sm:text-4xl", dark ? "text-white" : "text-slate-900")}>{block.title}</h2>
    {block.description ? <p className={cn("mt-4 whitespace-pre-line text-lg leading-relaxed", dark ? "text-slate-300" : "text-slate-600")}>{block.description}</p> : null}
  </div>
}

export function RdiImage({ media, className, contain = false }: { media?: RdiMedia; className?: string; contain?: boolean }) {
  if (!media?.url) return null
  return <div className={cn("overflow-hidden", contain && "[&_img]:object-contain", className)}><RdiMediaDisplay media={media} className="h-full w-full" /></div>
}
