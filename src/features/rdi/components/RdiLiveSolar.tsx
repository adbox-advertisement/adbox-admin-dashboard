import { CheckCircle2, Leaf, ShieldCheck, Sun, Zap } from "lucide-react"
import { useState } from "react"
import type { RdiContentBlock } from "@/features/rdi/types"
import { RdiAction, RdiHeading, RdiImage, RdiLink, RdiSection } from "@/features/rdi/components/RdiPreviewPrimitives"
import { useRdiPreview } from "@/features/rdi/components/RdiPreviewContext"

const asset = (path: string) => `https://www.richdadinvestments.org/solar/allolla/${path}`
const categories = [{ id: "all", label: "All solutions" }, { id: "generation", label: "Solar & inverters" }, { id: "home", label: "Home batteries" }, { id: "business", label: "Business storage" }]

function SolarCatalogue({ block }: { block: RdiContentBlock }) {
  const [category, setCategory] = useState("all")
  const items = block.items?.filter(item => item.visible !== false && (category === "all" || item.category === category)) ?? []
  return <RdiSection block={block} id="solar-services" className="scroll-mt-28 bg-[#F8FAFC] px-4 py-16 sm:py-24">
    <div className="rdi-container">
      <RdiHeading block={block} />
      <div className="mb-8 flex flex-col items-center justify-between gap-5 lg:flex-row">
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Filter solar solutions">{categories.map(item => <button key={item.id} type="button" aria-pressed={category === item.id} aria-controls="solar-product-grid" onClick={() => setCategory(item.id)} className={`min-h-11 rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${category === item.id ? "border-[#047857] bg-[#047857] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-[#047857]"}`}>{item.label}</button>)}</div>
        <p className="text-sm text-slate-500" role="status">{items.length} solutions</p>
      </div>
      <div id="solar-product-grid" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map(item => <article key={item.id} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl">
          <RdiImage media={item.media} contain className="flex h-64 items-center justify-center border-b border-slate-100 bg-white p-7 [&_img]:transition-transform group-hover:[&_img]:scale-105" />
          <div className="flex flex-1 flex-col p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#047857]">{item.eyebrow}</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-3 leading-relaxed text-slate-600">{item.description}</p>
            <dl className="mb-6 mt-5 grid grid-cols-2 gap-3">{item.features?.map((feature, index) => { const [label, ...value] = feature.split(" — "); return <div key={index} className="rounded-xl bg-emerald-50/70 p-3"><dt className="text-xs leading-relaxed text-slate-500">{label}</dt><dd className="mt-1 text-sm font-bold text-[#065F46]">{value.join(" — ")}</dd></div> })}</dl>
            <RdiAction label={item.buttonLabel} href={item.buttonHref} className="mt-auto justify-start bg-transparent p-0 text-sm text-[#047857] hover:bg-transparent hover:text-[#065F46]" />
          </div>
        </article>)}
      </div>
      {!items.length ? <p className="py-12 text-center text-slate-600">No solutions in this category.</p> : null}
      <div className="mt-10 rounded-2xl border border-emerald-100 bg-white p-6 sm:p-8"><h3 className="text-lg font-semibold text-slate-900">Find the right fit for your project</h3><p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">Ratings shown are from the ALLOLLA catalogue and vary by model. Our team can help you compare options and plan your system.</p></div>
    </div>
  </RdiSection>
}

export function RdiLiveSolarBlock({ block }: { block: RdiContentBlock }) {
  const { settings } = useRdiPreview()
  if (block.id === "solar-solutions") return <SolarCatalogue block={block} />
  if (block.id === "solar-hero") {
    const highlight = "brighter future"
    const title = block.title.endsWith(highlight) ? block.title.slice(0, -highlight.length) : block.title
    return <RdiSection block={block} className="isolate overflow-hidden bg-[#071A14] px-4 py-16 sm:py-24 lg:py-28">
      <div className="absolute -left-24 top-10 -z-10 size-72 rounded-full bg-[#FBBF24]/15 blur-3xl" /><div className="absolute -right-24 bottom-0 -z-10 size-80 rounded-full bg-[#10B981]/15 blur-3xl" />
      <div className="rdi-container grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FBBF24]/40 bg-[#FBBF24]/10 px-4 py-2 text-sm font-semibold text-[#FDE68A]"><Sun className="size-4 shrink-0" />{block.eyebrow}</div>
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl xl:text-6xl">{title}{title !== block.title ? <span className="block bg-gradient-to-r from-[#FBBF24] to-[#34D399] bg-clip-text text-transparent">{highlight}</span> : null}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-200 sm:text-xl">{block.description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"><RdiAction label={block.buttonLabel} href={block.buttonHref} className="bg-[#FBBF24] px-6 text-[#0F172A] hover:bg-[#FCD34D]" /><RdiAction label={block.secondaryButtonLabel} href={block.secondaryButtonHref} secondary className="px-6 [&_svg]:hidden" /></div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-300">{["Solar generation", "Battery storage", "Intelligent power management"].map(item => <span key={item} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#34D399]" />{item}</span>)}</div>
        </div>
        <div className="overflow-hidden rounded-3xl border border-white/15 bg-white shadow-2xl">
          <div className="flex items-center justify-center gap-5 border-b border-slate-100 px-5 py-6 sm:gap-8"><div className="flex items-center gap-2"><img src="https://www.richdadinvestments.org/logo.png" alt={settings.siteName} className="size-12 object-contain" /><span className="text-xl font-bold text-slate-900">RDI</span></div><span className="text-2xl text-slate-300">×</span><img src={asset("logo.png")} alt="ALLOLLA General Power" className="h-auto w-32 object-contain sm:w-40" /></div>
          <RdiImage media={block.media} contain className="w-full" />
          <div className="grid grid-cols-3 gap-3 border-t border-slate-100 px-5 py-6 text-center">{[["Generate", "Solar modules"], ["Store", "Home to industrial"], ["Manage", "Connected systems"]].map(([title, description]) => <div key={title}><p className="font-semibold text-[#047857]">{title}</p><p className="mt-1 text-xs text-slate-500">{description}</p></div>)}</div>
        </div>
      </div>
    </RdiSection>
  }
  if (block.id === "solar-benefits") return <RdiSection block={block} className="bg-white px-4 py-16 sm:py-20"><div className="rdi-container">
    <div className="mb-12 grid gap-6 lg:grid-cols-2 lg:gap-16"><div><p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#047857]">{block.eyebrow}</p><h2 className="whitespace-pre-line text-3xl font-bold text-slate-900 sm:text-4xl">{block.title}</h2></div><div><p className="whitespace-pre-line text-lg leading-relaxed text-slate-600">{block.description}</p><RdiAction label={block.buttonLabel} href={block.buttonHref} className="mt-5 justify-start bg-transparent p-0 text-[#047857] hover:bg-transparent" /></div></div>
    <div className="grid gap-8 md:grid-cols-3">{block.items?.map((item, index) => { const Icon = [Zap, Leaf, ShieldCheck][index % 3]; return <article key={item.id} className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/60 p-6 shadow-sm sm:p-8"><div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-[#FBBF24]/20 text-[#B45309]"><Icon className="size-6" /></div><h3 className="text-xl font-semibold text-slate-900">{item.title}</h3><p className="mt-2 leading-relaxed text-slate-600">{item.description}</p></article> })}</div>
  </div></RdiSection>
  if (block.id === "solar-ecosystem") return <RdiSection block={block} className="bg-[#071A14] px-4 py-16 sm:py-24"><div className="rdi-container"><RdiHeading block={block} dark /><figure className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-white p-3 shadow-2xl sm:p-6"><RdiImage media={block.media} contain /><figcaption className="px-3 pb-3 pt-2 text-center text-sm text-slate-500">The ALLOLLA energy ecosystem, from generation to everyday use.</figcaption></figure><div className="mx-auto mt-8 grid max-w-5xl gap-6 md:grid-cols-3">{block.items?.map(item => <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-6"><h3 className="text-lg font-semibold text-[#FDE68A]">{item.title}</h3><p className="mt-3 text-sm leading-relaxed text-slate-300">{item.description}</p></div>)}</div></div></RdiSection>
  if (block.id === "solar-process") return <RdiSection block={block} className="bg-white px-4 py-16 sm:py-24"><div className="rdi-container grid items-center gap-10 lg:grid-cols-2 lg:gap-16"><div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white p-6 shadow-xl sm:p-8"><div className="grid grid-cols-2 items-center gap-5"><img src={asset("inverter.jpg")} alt="ALLOLLA inverter" className="h-64 w-full object-contain sm:h-80" /><img src={asset("geco-wall-battery.jpg")} alt="ALLOLLA GECO wall battery" className="h-64 w-full object-contain sm:h-80" /></div><div className="mt-6 rounded-2xl bg-emerald-50 p-6"><Sun className="mb-3 size-8 text-[#047857]" /><p className="text-xl font-semibold text-slate-900">ALLOLLA technology.<br />Support from your RDI team.</p></div></div><div><p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#047857]">{block.eyebrow || "Our process"}</p><h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">{block.title}</h2><div className="mt-8 space-y-6">{block.items?.map((item, index) => <div key={item.id} className="flex gap-4"><div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#FBBF24] font-bold text-[#0F172A]">{item.eyebrow || String(index + 1).padStart(2, "0")}</div><div><h3 className="text-lg font-semibold text-slate-900">{item.title}</h3><p className="mt-1 leading-relaxed text-slate-600">{item.description}</p></div></div>)}</div></div></div></RdiSection>
  return <RdiSection block={block} className="bg-[#071A14] px-4 py-16 sm:py-20"><div className="rdi-container rounded-3xl border border-[#FBBF24]/20 bg-gradient-to-br from-[#0D2A20] to-[#071A14] p-6 text-center shadow-2xl sm:p-10 lg:p-14"><Sun className="mx-auto mb-5 size-12 text-[#FBBF24]" /><RdiHeading block={block} dark className="mb-8" /><div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap"><RdiAction label={block.buttonLabel} href={block.buttonHref} className="bg-[#FBBF24] text-[#0F172A] hover:bg-[#FCD34D]" /><RdiAction label={block.secondaryButtonLabel} href={block.secondaryButtonHref} secondary /></div><RdiLink href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.contactAddress)}`} target="_blank" rel="noreferrer" className="mx-auto mt-7 block text-sm text-slate-300">{settings.contactAddress}</RdiLink></div></RdiSection>
}
