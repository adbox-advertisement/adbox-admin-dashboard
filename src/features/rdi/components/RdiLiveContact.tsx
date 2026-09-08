import { Building2, ChevronDown, Clock3, Film, Mail, MapPin, Phone, Sun } from "lucide-react"
import { useState, type ReactNode } from "react"
import type { RdiContentBlock, RdiPageContent } from "@/features/rdi/types"
import { RdiHeading, RdiLink, RdiSection } from "@/features/rdi/components/RdiPreviewPrimitives"

function ContactForm({ block }: { block: RdiContentBlock }) {
  const [message, setMessage] = useState("")
  const control = "mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-base font-normal text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
  return <RdiSection block={block} className="rounded-2xl bg-white p-6 shadow-adbox-medium sm:p-8 lg:p-10"><h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{block.title}</h2><p className="mt-3 text-slate-600">{block.description}</p><form className="mt-8" onSubmit={event => { event.preventDefault(); setMessage("This is a website preview. Your message has not been sent.") }}><div className="grid gap-5 sm:grid-cols-2">{block.items?.map((item, index) => <label key={item.id} className={`block text-sm font-medium text-slate-700 ${index > 1 ? "sm:col-span-2" : ""}`}>
    {item.title}
    {item.features?.length ? <select name={item.id} required defaultValue="" className={control}><option value="" disabled>{item.description}</option>{item.features.map((feature, i) => <option key={i} value={feature}>{feature}</option>)}</select> : item.id === "contact-message" ? <textarea name={item.id} required rows={5} placeholder={item.description} className={control} /> : <input name={item.id} type={item.id.includes("email") ? "email" : item.id.includes("phone") ? "tel" : "text"} required={!item.id.includes("phone")} placeholder={item.description} className={control} />}
  </label>)}</div><button type="submit" className="mt-6 min-h-12 w-full rounded-md bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800">{block.buttonLabel}</button><p role="status" className="mt-3 text-sm text-slate-600">{message}</p></form></RdiSection>
}

function ContactDetails({ block }: { block: RdiContentBlock }) {
  return <RdiSection block={block} className="rounded-2xl bg-white p-6 shadow-adbox-medium sm:p-8"><h2 className="text-2xl font-semibold text-slate-900">{block.title}</h2><ul className="mt-7 space-y-6">{block.items?.map((item, index) => {
    const Icon = [MapPin, Phone, Mail, Clock3][index % 4]
    const text = [item.title, item.description].filter(Boolean).join("\n")
    const href = item.id === "contact-visit" ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}` : item.id === "contact-call" ? `tel:${item.title.replace(/\(0\)|[^+\d]/g, "")}` : item.id === "contact-email" ? `mailto:${item.title}` : undefined
    return <li key={item.id} className="flex items-start gap-4"><div className={`rounded-xl p-3 ${["bg-amber-100 text-amber-700", "bg-purple-100 text-purple-700", "bg-emerald-100 text-emerald-700", "bg-slate-100 text-slate-700"][index % 4]}`}><Icon className="size-6" /></div><div className="min-w-0"><p className="font-medium text-slate-800">{item.eyebrow}</p>{href ? <RdiLink href={href} className="mt-1 block whitespace-pre-line break-words text-slate-600 hover:text-slate-900">{text}</RdiLink> : <p className="mt-1 whitespace-pre-line text-slate-600">{text}</p>}</div></li>
  })}</ul></RdiSection>
}

function Faq({ block }: { block: RdiContentBlock }) {
  const [open, setOpen] = useState<string | null>(null)
  return <RdiSection block={block} className="bg-white px-4 py-16 sm:py-24"><div className="rdi-container"><RdiHeading block={block} /><div className="mx-auto max-w-4xl space-y-4">{block.items?.map(item => <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-adbox-small"><h3><button type="button" aria-expanded={open === item.id} aria-controls={`answer-${item.id}`} onClick={() => setOpen(open === item.id ? null : item.id)} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left hover:bg-slate-50 sm:px-7"><span className="text-lg font-semibold text-slate-900 sm:text-xl">{item.title}</span><ChevronDown className={`size-5 shrink-0 text-slate-500 ${open === item.id ? "rotate-180" : ""}`} /></button></h3><p id={`answer-${item.id}`} hidden={open !== item.id} className="px-5 pb-5 leading-relaxed text-slate-600 sm:px-7 sm:pb-6">{item.description}</p></article>)}</div></div></RdiSection>
}

function ContactBlock({ block, renderBlock }: { block: RdiContentBlock; renderBlock: (block: RdiContentBlock) => ReactNode }) {
  if (block.id === "contact-hero") return <RdiSection block={block} className="bg-[#0F172A] px-4 py-16 text-center sm:py-20 md:py-24"><div className="rdi-container"><p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-amber-400">{block.eyebrow}</p><h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">{block.title}</h1><p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-slate-300 sm:text-xl">{block.description}</p></div></RdiSection>
  if (block.id === "contact-form") return <ContactForm block={block} />
  if (block.id === "contact-details") return <ContactDetails block={block} />
  if (block.id === "contact-solar-note") return <RdiSection block={block} className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-50 to-emerald-50 p-6 sm:p-8"><Sun className="size-8 text-amber-700" /><h2 className="mt-4 text-xl font-semibold text-slate-900">{block.title}</h2><p className="mt-2 leading-relaxed text-slate-600">{block.description}</p></RdiSection>
  if (block.id === "contact-faq") return <Faq block={block} />
  if (block.id === "contact-teams") return <RdiSection block={block} className="bg-slate-50 px-4 py-16 sm:py-24"><div className="rdi-container"><RdiHeading block={block} /><div className="grid gap-6 md:grid-cols-3">{block.items?.map((item, index) => { const Icon = [Building2, Film, Sun][index % 3]; return <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-adbox-small sm:p-8"><div className={`flex size-12 items-center justify-center rounded-xl ${["bg-orange-100 text-orange-700", "bg-purple-100 text-purple-700", "bg-emerald-100 text-emerald-700"][index % 3]}`}><Icon className="size-6" /></div><h3 className="mt-5 text-xl font-semibold text-slate-900">{item.title}</h3><p className="mt-2 text-slate-600">{item.description}</p>{item.features?.map((email, i) => <RdiLink key={i} href={`mailto:${email}`} className="mt-4 block break-all text-sm font-semibold text-slate-800 hover:underline">{email}</RdiLink>)}</article> })}</div></div></RdiSection>
  return renderBlock(block)
}

export function RdiLiveContact({ page, renderBlock }: { page: RdiPageContent; renderBlock: (block: RdiContentBlock) => ReactNode }) {
  // Group only adjacent form/detail blocks, keeping the editor's section order intact.
  const rows: ReactNode[] = []
  for (let i = 0; i < page.blocks.length; i++) {
    const block = page.blocks[i]
    if (block.id === "contact-form") {
      const adjacent: RdiContentBlock[] = []
      while (["contact-details", "contact-solar-note"].includes(page.blocks[i + 1]?.id)) adjacent.push(page.blocks[++i])
      rows.push(<div key={block.id} className="bg-gradient-to-b from-slate-50 to-white px-4 py-16 sm:py-24"><div className="rdi-container grid gap-8 lg:grid-cols-12"><div className={adjacent.length ? "lg:col-span-8" : "lg:col-span-12"}><ContactForm block={block} /></div>{adjacent.length ? <div className="space-y-6 lg:col-span-4">{adjacent.map(item => <ContactBlock key={item.id} block={item} renderBlock={renderBlock} />)}</div> : null}</div></div>)
    } else rows.push(<ContactBlock key={block.id} block={block} renderBlock={renderBlock} />)
  }
  return <>{rows}</>
}
