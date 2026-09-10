import { useCmsText } from "../../cms/use-cms-content"
import { CmsSection } from "../../cms/components/CmsSection"
import { ArrowRight, Check, Phone, Wrench } from "lucide-react"
import { fittings } from "../../data/construction"
import { fittingsEnquiry } from "../../data/construction"
import { constructionContact } from "../../data/construction"
export function ConstructionSupplies() {
  const content = useCmsText()
  return <CmsSection id="construction.equipment-fittings"><section id="supplies" className="scroll-mt-28 bg-[#F8FAFC] py-16 @min-[640px]/rdi:py-20">
    <div className="rdi-container mx-auto px-4">
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#C2410C]">
          {content("construction.equipment-fittings.1", "Supply, sales & rentals")}
        </p>
        <h2 className="mb-4 rdi-heading text-3xl font-bold text-[#1E293B] @min-[640px]/rdi:text-4xl @min-[768px]/rdi:text-5xl">
          {content("construction.equipment-fittings.2", "The right connections. The right equipment.")}
        </h2>
        <p className="text-lg leading-relaxed text-[#64748B]">
          {content("construction.equipment-fittings.3", "HDPE pipe fittings and butt-fusion welding machines to support your next installation.")}
        </p>
      </div>
      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
        <div className="grid @min-[1024px]/rdi:grid-cols-2">
          <div className="flex flex-col justify-center bg-white p-6 @min-[640px]/rdi:p-10">
            <img src={content("construction.equipment-fittings.4", "/rdi-assets/construction/hdpe-fittings.jpg")} alt={content("construction.equipment-fittings.5", "HDPE fittings, blue valves, flanges and couplings from the supplied product range")} width="763" height="455" className="w-full object-contain" loading="lazy" />
            <a href={content("construction.equipment-fittings.6", "/rdi-assets/construction/hdpe-fittings-guide.jpg")} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#C2410C] hover:text-[#9A3412]">
              {content("construction.equipment-fittings.7", "View the full fittings guide ")}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="border-t border-slate-100 p-6 @min-[640px]/rdi:p-10 @min-[1024px]/rdi:border-l @min-[1024px]/rdi:border-t-0">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.15em] text-[#C2410C]">
              {content("construction.equipment-fittings.8", "Pipework essentials")}
            </p>
            <h3 className="rdi-heading text-2xl font-bold text-[#1E293B] @min-[640px]/rdi:text-3xl">
              {content("construction.equipment-fittings.9", "HDPE Pipe Fittings")}
            </h3>
            <p className="mt-4 leading-relaxed text-[#64748B]">
              {content("construction.equipment-fittings.10", "We supply fittings for water supply, drainage, firefighting, urban construction and petroleum and chemical industry applications.")}
            </p>
            <dl className="my-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-orange-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-[#9A3412]">
                  {content("construction.equipment-fittings.11", "Size range")}
                </dt>
                <dd className="mt-1 text-lg font-bold text-[#1E293B]">
                  {content("construction.equipment-fittings.12", "DN 40 – DN 800")}
                </dd>
              </div>
              <div className="rounded-xl bg-orange-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-[#9A3412]">
                  {content("construction.equipment-fittings.13", "Pressure range")}
                </dt>
                <dd className="mt-1 text-lg font-bold text-[#1E293B]">
                  {content("construction.equipment-fittings.14", "PN 10 – PN 25")}
                </dd>
              </div>
            </dl>
            <ul className="grid gap-x-4 gap-y-3 @min-[640px]/rdi:grid-cols-2">
              {fittings.map(t => <li className="flex items-start gap-2 text-sm text-slate-600" key={t}>
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#C2410C]" />
                {t}
              </li>)}
            </ul>
            <a href={fittingsEnquiry} className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F97316] px-6 py-3 font-semibold text-[#1E293B] transition-colors hover:bg-[#FB923C]">
              {content("construction.equipment-fittings.15", "Enquire About Fittings ")}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </article>
      <article className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E293B] to-[#334155] shadow-lg">
        <div className="grid items-center @min-[1024px]/rdi:grid-cols-2">
          <div className="p-6 @min-[640px]/rdi:p-10 @min-[1024px]/rdi:p-12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-300/30 bg-orange-400/10 px-4 py-2 text-sm font-semibold text-orange-200">
              <Wrench className="h-4 w-4" />
              {content("construction.equipment-fittings.16", " Available for sale & rental")}
            </div>
            <h3 className="rdi-heading text-3xl font-bold text-white @min-[640px]/rdi:text-4xl">
              {content("construction.equipment-fittings.17", "Butt-Fusion Welding Machines")}
            </h3>
            <p className="mt-5 text-lg leading-relaxed text-slate-300">
              {content("construction.equipment-fittings.18", "Equipment for your pipe joining work, available to purchase or rent. Speak with our team about the machine and size range your project requires.")}
            </p>
            <p className="mt-6 text-2xl font-bold text-[#FB923C]">
              {content("construction.equipment-fittings.19", "DN 50 – DN 800")}
            </p>
            <div className="mt-8 flex flex-col gap-3 @min-[640px]/rdi:flex-row @min-[640px]/rdi:flex-wrap">
              <a href={content("construction.equipment-fittings.20", "mailto:construction@richdadinvestments.com?subject=Butt-fusion%20machine%20sales%20enquiry")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F97316] px-6 py-3 font-semibold text-[#1E293B] transition-colors hover:bg-[#FB923C]">
                {content("construction.equipment-fittings.21", "Enquire About Sales ")}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href={constructionContact.phones[0].href} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10">
                <Phone className="h-4 w-4" />
                {content("construction.equipment-fittings.22", " Discuss a Rental")}
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 p-6 pt-0 @min-[640px]/rdi:p-8 @min-[1024px]/rdi:pl-0 @min-[1024px]/rdi:pt-8">
            <img src={content("construction.equipment-fittings.23", "/rdi-assets/construction/butt-fusion-on-site.jpg")} alt={content("construction.equipment-fittings.24", "Butt-fusion welding machine clamped around an HDPE pipe on site")} width="632" height="671" className="col-span-2 aspect-[4/3] w-full rounded-2xl object-cover" loading="lazy" />
            <img src={content("construction.equipment-fittings.25", "/rdi-assets/construction/butt-fusion-machine.jpg")} alt={content("construction.equipment-fittings.26", "Butt-fusion welding machine and its control equipment")} width="464" height="327" className="aspect-[3/2] w-full rounded-xl bg-white object-contain p-2" loading="lazy" />
            <img src={content("construction.equipment-fittings.27", "/rdi-assets/construction/butt-fusion-workshop.jpg")} alt={content("construction.equipment-fittings.28", "Butt-fusion machine joining a pipe in a workshop")} width="550" height="366" className="aspect-[3/2] w-full rounded-xl object-cover" loading="lazy" />
          </div>
        </div>
      </article>
    </div>
  </section></CmsSection>
}
