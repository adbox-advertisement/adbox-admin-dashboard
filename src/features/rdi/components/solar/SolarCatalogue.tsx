import { useCmsText, useCmsCollection } from "../../cms/use-cms-content"
import { CmsSection } from "../../cms/components/CmsSection"
import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { solarProducts as defaultSolarProducts, solarCategories, solarEnquiry } from "../../data/solar"
export function SolarCatalogue() {
  const content = useCmsText()
  const solarProducts = useCmsCollection("solar-products", defaultSolarProducts)
  const [activeCategory, setActiveCategory] = useState("all")
  const filteredProducts = solarProducts.filter(product => activeCategory === "all" || product.category === activeCategory)
  return <CmsSection id="solar.product-catalogue"><section id="solar-services" className="scroll-mt-28 bg-[#F8FAFC] px-4 py-16 @min-[640px]/rdi:py-24">
    <div className="rdi-container mx-auto">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#047857]">
          {content("solar.product-catalogue.1", "The ALLOLLA range")}
        </p>
        <h2 className="rdi-heading text-3xl font-bold text-slate-900 @min-[640px]/rdi:text-4xl @min-[768px]/rdi:text-5xl">
          {content("solar.product-catalogue.2", "Power for your home. Capacity for your business.")}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          {content("solar.product-catalogue.3", "Explore solar generation, inverters and energy storage through our partnership with ALLOLLA General Power.")}
        </p>
      </div>
      <div className="mb-8 flex flex-col items-center justify-between gap-5 @min-[1024px]/rdi:flex-row">
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Filter solar solutions">
          {solarCategories.map(i => <button type="button" aria-pressed={activeCategory === i.key} aria-controls="solar-product-grid" onClick={() => setActiveCategory(i.key)} className={`min-h-11 rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${activeCategory === i.key ? "border-[#047857] bg-[#047857] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-[#047857]"}`} key={i.key}>
            {i.label}
          </button>)}
        </div>
        <p className="text-sm text-slate-500" role="status" aria-live="polite" aria-atomic="true">
          {filteredProducts.length}
          {content("solar.product-catalogue.4", " solutions")}
        </p>
      </div>
      <div id="solar-product-grid" className="grid gap-6 @min-[768px]/rdi:grid-cols-2 @min-[1280px]/rdi:grid-cols-3">
        {filteredProducts.map(i => <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl" key={i.key}>
          <div className="relative flex h-64 items-center justify-center border-b border-slate-100 bg-white p-7">
            <img src={i.image} alt={i.alt} className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          </div>
          <div className="flex flex-1 flex-col p-6 @min-[640px]/rdi:p-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#047857]">
              {i.model}
            </p>
            <h3 className="mt-2 rdi-heading text-xl font-semibold text-slate-900">
              {i.name}
            </h3>
            <p className="mt-3 leading-relaxed text-slate-600">
              {i.description}
            </p>
            <dl className="mb-6 mt-5 grid grid-cols-2 gap-3">
              {i.specifications.map(a => <div className="rounded-xl bg-emerald-50/70 p-3" key={a.label}>
                <dt className="text-xs leading-relaxed text-slate-500">
                  {a.label}
                </dt>
                <dd className="mt-1 text-sm font-bold text-[#065F46]">
                  {a.value}
                </dd>
              </div>)}
            </dl>
            <a href={solarEnquiry(`ALLOLLA ${i.name} — ${i.model}`)} aria-label={`Enquire about ${i.name}`} className="mt-auto inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#047857] hover:text-[#065F46]">
              {content("solar.product-catalogue.5", "Enquire About This System ")}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </article>)}
      </div>
      <div className="mt-10 rounded-2xl border border-emerald-100 bg-white p-6 @min-[640px]/rdi:p-8">
        <div>
          <h3 className="rdi-heading text-lg font-semibold text-slate-900">
            {content("solar.product-catalogue.6", "Find the right fit for your project")}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            {content("solar.product-catalogue.7", "Ratings shown are from the ALLOLLA catalogue and vary by model. Our team can help you compare options and plan your system.")}
          </p>
        </div>
      </div>
    </div>
  </section></CmsSection>
}
