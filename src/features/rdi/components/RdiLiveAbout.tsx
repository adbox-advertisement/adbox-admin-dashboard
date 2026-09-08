import { Building2, CheckCircle2, Film, Lightbulb, Sun, Target, Users } from "lucide-react"
import { useState } from "react"
import type { RdiContentBlock } from "@/features/rdi/types"
import { RdiAction, RdiHeading, RdiImage, RdiSection } from "@/features/rdi/components/RdiPreviewPrimitives"

const divisionStyles = [
  { button: "bg-orange-500 text-white", panel: "border-orange-200 bg-gradient-to-br from-orange-50 to-white", icon: "bg-orange-100 text-orange-700" },
  { button: "bg-purple-600 text-white", panel: "border-purple-200 bg-gradient-to-br from-purple-50 to-white", icon: "bg-purple-100 text-purple-700" },
  { button: "bg-gradient-to-r from-amber-400 to-emerald-500 text-slate-900", panel: "border-emerald-200 bg-gradient-to-br from-amber-50 via-white to-emerald-50", icon: "bg-emerald-100 text-emerald-700" },
]

function DivisionTabs({ block }: { block: RdiContentBlock }) {
  const [activeId, setActiveId] = useState(block.items?.[0]?.id)
  const items = block.items ?? []
  const index = Math.max(0, items.findIndex(item => item.id === activeId))
  const active = items[index]
  const style = divisionStyles[index % 3]
  const Icon = [Building2, Film, Sun][index % 3]
  const promise = active?.features?.find(feature => feature.startsWith("Our promise — "))
  return <RdiSection block={block} className="bg-gradient-to-b from-[#0F172A] to-[#1E293B] px-4 py-16 sm:py-24">
    <div className="rdi-container">
      <RdiHeading block={block} dark />
      <div role="tablist" aria-label="RichDad Investments divisions" className="mx-auto mb-8 grid max-w-5xl gap-3 sm:grid-cols-3">
        {items.map((item, i) => {
          const TabIcon = [Building2, Film, Sun][i % 3]
          return <button type="button" key={item.id} role="tab" id={`tab-${item.id}`} aria-selected={i === index} aria-controls="division-panel" tabIndex={i === index ? 0 : -1} onClick={() => setActiveId(item.id)} onKeyDown={event => {
            const next = event.key === "ArrowRight" ? (index + 1) % items.length : event.key === "ArrowLeft" ? (index - 1 + items.length) % items.length : event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : null
            if (next === null) return
            event.preventDefault()
            setActiveId(items[next].id)
            event.currentTarget.ownerDocument.getElementById(`tab-${items[next].id}`)?.focus()
          }} className={`flex min-h-14 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 font-semibold ${i === index ? divisionStyles[i % 3].button : "bg-white/5 text-slate-200 hover:bg-white/10"}`}><TabIcon className="size-5" />{item.title.replace(/ Division$/, "")}</button>
        })}
      </div>
      {active ? <article id="division-panel" role="tabpanel" aria-labelledby={`tab-${active.id}`} tabIndex={0} className={`mx-auto max-w-5xl rounded-3xl border p-6 shadow-adbox-large sm:p-8 lg:p-12 ${style.panel}`}>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12"><div><div className={`mb-6 flex size-16 items-center justify-center rounded-2xl ${style.icon}`}><Icon className="size-8" /></div><p className="text-sm font-bold uppercase tracking-[0.15em] text-slate-500">{active.eyebrow}</p><h3 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">{active.title}</h3><p className="mt-5 text-lg leading-relaxed text-slate-600">{active.description}</p><RdiAction label={active.buttonLabel} href={active.buttonHref} className={`mt-7 ${style.button}`} /></div><div className="rounded-2xl border border-slate-200 bg-white/80 p-5 sm:p-6"><h4 className="text-xl font-semibold text-slate-900">Core capabilities</h4><ul className="mt-5 space-y-4">{active.features?.filter(feature => !feature.startsWith("Our promise — ")).map((feature, i) => <li key={i} className="flex items-start gap-3 text-slate-700"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />{feature}</li>)}</ul>{promise ? <div className="mt-6 border-t border-slate-200 pt-6"><h4 className="font-semibold text-slate-900">Our promise</h4><p className="mt-2 leading-relaxed text-slate-600">{promise.slice("Our promise — ".length)}</p></div> : null}</div></div>
      </article> : null}
    </div>
  </RdiSection>
}

export function RdiLiveAboutBlock({ block }: { block: RdiContentBlock }) {
  if (block.id === "about-divisions") return <DivisionTabs block={block} />
  if (block.type === "cta") return <RdiSection block={block} className="bg-[#1E293B] px-4 pb-24 text-center"><RdiAction label={block.buttonLabel} href={block.buttonHref} className="bg-white text-slate-900 hover:bg-slate-100" /></RdiSection>
  if (block.type === "hero") return <RdiSection block={block} className="bg-[#0F172A] px-4 py-16 text-center sm:py-20 md:py-24"><div className="rdi-container"><p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-amber-400">{block.eyebrow}</p><h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">{block.title}</h1><p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-slate-300 sm:text-xl">{block.description}</p></div></RdiSection>
  if (block.type === "split") return <RdiSection block={block} className="bg-white px-4 py-16 sm:py-24"><div className="rdi-container grid items-center gap-10 lg:grid-cols-2 lg:gap-16"><RdiImage media={block.media} className="aspect-[4/3] rounded-2xl shadow-adbox-large" /><div><p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-amber-700">{block.eyebrow}</p><h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">{block.title}</h2><p className="mt-6 whitespace-pre-line leading-relaxed text-slate-600">{block.description}</p></div></div></RdiSection>
  return <RdiSection block={block} className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] px-4 py-16 sm:py-24"><div className="rdi-container"><RdiHeading block={block} dark /><div className="grid gap-6 md:grid-cols-3">{block.items?.map((item, index) => { const Icon = [Users, Lightbulb, Target][index % 3]; return <article key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8"><div className={`mb-6 flex size-12 items-center justify-center rounded-xl ${["bg-orange-500", "bg-purple-600", "bg-emerald-500"][index % 3]}`}><Icon className="size-6 text-white" /></div><h3 className="text-xl font-semibold text-white">{item.title}</h3><p className="mt-3 leading-relaxed text-slate-300">{item.description}</p></article> })}</div><div className="mt-12 text-center"><RdiAction label={block.buttonLabel} href={block.buttonHref} className="bg-white text-slate-900 hover:bg-slate-100" /></div></div></RdiSection>
}
