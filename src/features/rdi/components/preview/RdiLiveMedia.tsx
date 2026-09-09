import { Award, Eye, Film, Play, Users, X } from "lucide-react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import type { RdiContentBlock, RdiContentItem, RdiPageContent } from "../../types"
import { RdiAction, RdiHeading, RdiImage, RdiSection } from "./RdiPreviewPrimitives"

const filters = [{ id: "all", label: "All Projects" }, { id: "video", label: "Video Production" }, { id: "commercial", label: "Commercials" }, { id: "branding", label: "Branding" }, { id: "animation", label: "Animation" }]

function MediaStats({ block }: { block: RdiContentBlock }) {
  return <RdiSection block={block} className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-6 sm:gap-8 md:mt-20 md:grid-cols-4">{block.items?.map((item, index) => { const Icon = [Award, Users, Film, Eye][index % 4]; return <div key={item.id} className="text-center"><Icon className="mx-auto mb-2 size-8 text-purple-400" /><p className="mb-1 text-3xl font-bold text-white">{item.title}</p><p className="text-sm text-slate-400">{item.description}</p></div> })}</RdiSection>
}

function MediaHero({ block, stats }: { block: RdiContentBlock; stats?: RdiContentBlock }) {
  const highlight = "Move People"
  return <RdiSection block={block} className="flex min-h-[var(--rdi-viewport-height)] items-center justify-center overflow-hidden py-16">
    <RdiImage media={block.media} className="absolute inset-0 h-full w-full opacity-20" />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900" />
    <div className="relative z-10 mx-auto max-w-5xl px-4 text-center"><p className="mb-6 inline-block rounded-full border border-purple-500/50 bg-purple-500/20 px-6 py-2 font-semibold text-purple-300">{block.eyebrow}</p><h1 className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-7xl lg:text-8xl">{block.title.endsWith(highlight) ? <>{block.title.slice(0, -highlight.length)}<span className="block bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">{highlight}</span></> : block.title}</h1><p className="mx-auto mb-12 max-w-3xl text-xl text-slate-300 md:text-2xl">{block.description}</p>{stats ? <MediaStats block={stats} /> : null}</div>
  </RdiSection>
}

function FeaturedWork({ block }: { block: RdiContentBlock }) {
  const [category, setCategory] = useState("all")
  const [selection, setSelection] = useState<{ item: RdiContentItem; top: number } | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const projects = block.items?.filter(item => category === "all" || item.category === category) ?? []
  useEffect(() => { if (selection && !dialog.current?.open) dialog.current?.showModal() }, [selection])
  return <RdiSection block={block} className="px-4 py-20">
    <div className="mx-auto max-w-7xl"><RdiHeading block={block} dark /><div role="group" aria-label="Filter media projects" className="mb-16 flex flex-wrap justify-center gap-3">{filters.map(filter => <button type="button" key={filter.id} aria-pressed={category === filter.id} aria-controls="media-project-grid" onClick={() => setCategory(filter.id)} className={`rounded-full px-6 py-3 font-medium transition-colors ${category === filter.id ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-adbox-medium" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}>{filter.label}</button>)}</div>
      <div id="media-project-grid" className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{projects.map(item => <button type="button" key={item.id} onClick={event => setSelection({ item, top: Math.max(24, event.currentTarget.getBoundingClientRect().top - 100) })} aria-label={`View ${item.title} project details`} className="group text-left"><div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-800"><RdiImage media={item.media} className="h-full w-full transition-transform duration-500 group-hover:scale-105" /><div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent p-6 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"><p className="mb-3 text-xs text-purple-300">{item.eyebrow}</p><p className="text-sm text-white">{item.description}</p></div>{item.category !== "branding" ? <span className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-full bg-purple-600 text-white"><Play className="size-5 fill-current" /></span> : null}<span className="absolute right-4 top-4 rounded-full bg-black/50 px-3 py-1 text-sm text-white">{item.features?.[1]}</span></div><h3 className="mb-2 mt-4 text-xl font-bold text-white group-hover:text-purple-400">{item.title}</h3><p className="text-slate-400">{item.features?.[0]}</p></button>)}</div>
      {!projects.length ? <p role="status" className="py-10 text-center text-slate-300">No projects in this category.</p> : null}
    </div>
    <dialog ref={dialog} onClose={() => setSelection(null)} aria-labelledby="media-project-title" className="absolute mx-auto mb-auto w-[calc(100%-2rem)] max-w-3xl overflow-hidden rounded-2xl border border-white/20 bg-slate-900 p-0 text-white shadow-adbox-large backdrop:bg-black/75" style={{ top: selection?.top ?? 24 }}>
      {selection ? <><button type="button" aria-label="Close project details" onClick={() => dialog.current?.close()} className="absolute right-4 top-4 z-10 flex size-11 items-center justify-center rounded-full bg-black/70 text-white"><X /></button><RdiImage media={selection.item.media} className="aspect-video w-full" /><div className="p-6 sm:p-8"><p className="text-sm text-purple-300">{selection.item.eyebrow}</p><h2 id="media-project-title" className="mt-3 text-2xl font-bold sm:text-3xl">{selection.item.title}</h2><p className="mt-3 text-slate-400">{selection.item.features?.join(" · ")}</p><p className="mt-5 leading-relaxed text-slate-300">{selection.item.description}</p><RdiAction label="Discuss a Similar Project" href="/contact" className="mt-6 bg-purple-600 text-white hover:bg-purple-500" /></div></> : null}
    </dialog>
  </RdiSection>
}

export function RdiLiveMedia({ page, renderBlock }: { page: RdiPageContent; renderBlock: (block: RdiContentBlock) => ReactNode }) {
  return <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">{page.blocks.map((block, index) => {
    if (block.id === "media-hero") return <MediaHero key={block.id} block={block} stats={page.blocks[index + 1]?.id === "media-stats" ? page.blocks[index + 1] : undefined} />
    if (block.id === "media-stats") return page.blocks[index - 1]?.id === "media-hero" ? null : <MediaStats key={block.id} block={block} />
    if (block.id === "media-work") return <FeaturedWork key={block.id} block={block} />
    if (block.id === "media-cta") return <RdiSection key={block.id} block={block} className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 px-4 py-20 text-center"><RdiHeading block={block} dark /><RdiAction label={block.buttonLabel} href={block.buttonHref} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white" /></RdiSection>
    return renderBlock(block)
  })}</div>
}
