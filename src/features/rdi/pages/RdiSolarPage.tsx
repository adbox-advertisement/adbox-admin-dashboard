import { useWebsiteContact } from "../cms/use-website-contact"
import { useCmsText } from "../cms/use-cms-content"
import { CmsSection } from "../cms/components/CmsSection"
import { ArrowRight, CircleCheck, Leaf, Mail, MapPin, Phone, ShieldCheck, Sun, Zap } from "lucide-react"
import { solarEnquiry, solarPartner, solarProcess } from "../data/solar"
import { SolarCatalogue } from "../components/solar/SolarCatalogue"

export const RdiSolarPage = () => {
  const content = useCmsText()
  const { officeAddress, officeMapUrl } = useWebsiteContact()
  return <>
  <CmsSection id="solar.introduction"><section className="relative isolate overflow-hidden bg-[#071A14] px-4 py-16 @min-[640px]/rdi:py-24 @min-[1024px]/rdi:py-28">
    <div className="absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-[#FBBF24]/15 blur-3xl" />
    <div className="absolute -right-24 bottom-0 -z-10 h-80 w-80 rounded-full bg-[#10B981]/15 blur-3xl" />
    <div className="rdi-container mx-auto grid items-center gap-12 @min-[1024px]/rdi:grid-cols-[1.05fr_1fr] @min-[1024px]/rdi:gap-14">
      <div>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FBBF24]/40 bg-[#FBBF24]/10 px-4 py-2 text-sm font-semibold text-[#FDE68A]">
          <Sun className="h-4 w-4 shrink-0" />
          {content("solar.introduction.1", " RDI × ALLOLLA · Solar partnership")}
        </div>
        <h1 className="rdi-heading text-4xl font-bold leading-tight text-white @min-[640px]/rdi:text-5xl @min-[1280px]/rdi:text-6xl">
          {content("solar.introduction.2", "Smarter solar power for a")}
          <span className="block bg-gradient-to-r from-[#FBBF24] to-[#34D399] bg-clip-text text-transparent">
            {content("solar.introduction.3", "brighter future")}
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-200 @min-[640px]/rdi:text-xl">
          {content("solar.introduction.4", "RichDad Investments, in partnership with ALLOLLA General Power, brings together local project support and solar technology to help power your home, business and everything ahead.")}
        </p>
        <div className="mt-8 flex flex-col gap-3 @min-[640px]/rdi:flex-row @min-[640px]/rdi:flex-wrap">
          <a href={solarEnquiry()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#FBBF24] px-6 py-3 font-semibold text-[#0F172A] transition-colors hover:bg-[#FCD34D]">
            {content("solar.introduction.5", "Request a Solar Consultation ")}
            <ArrowRight className="h-5 w-5" />
          </a>
          <a href={content("solar.introduction.6", "#solar-services")} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 bg-white/5 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10">
            {content("solar.introduction.7", "Explore Solutions")}
          </a>
        </div>
        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-300">
          {["Solar generation", "Battery storage", "Intelligent power management"].map(t => <span className="flex items-center gap-2" key={t}>
            <CircleCheck className="h-4 w-4 shrink-0 text-[#34D399]" />
            {t}
          </span>)}
        </div>
      </div>
      <div className="overflow-hidden rounded-3xl border border-white/15 bg-white shadow-2xl">
        <div className="flex items-center justify-center gap-5 border-b border-slate-100 px-5 py-6 @min-[640px]/rdi:gap-8">
          <div className="flex items-center gap-2">
            <img src={content("solar.introduction.8", "/rdi-assets/logo.png")} alt={content("solar.introduction.9", "RichDad Investments")} width="52" height="52" className="h-12 w-12 object-contain" />
            <span className="rdi-heading text-xl font-bold text-slate-900">
              {content("solar.introduction.10", "RDI")}
            </span>
          </div>
          <span className="text-2xl font-light text-slate-300" aria-hidden="true">
            {content("solar.introduction.11", "×")}
          </span>
          <img src={solarPartner.logo} alt={content("solar.introduction.12", "ALLOLLA General Power")} width="370" height="120" className="h-auto w-32 object-contain @min-[640px]/rdi:w-40" />
        </div>
        <img src={content("solar.introduction.13", "/rdi-assets/solar/allolla/product-family.jpg")} alt={content("solar.introduction.14", "ALLOLLA solar panels, inverters, home batteries and commercial energy storage systems")} width="1630" height="860" className="w-full object-contain" fetchPriority="high" />
        <div className="grid grid-cols-3 gap-3 border-t border-slate-100 px-5 py-6 text-center">
          {[{
            title: content("solar.introduction.15", "Generate"),
            description: content("solar.introduction.16", "Solar modules")
          }, {
            title: content("solar.introduction.17", "Store"),
            description: content("solar.introduction.18", "Home to industrial")
          }, {
            title: content("solar.introduction.19", "Manage"),
            description: content("solar.introduction.20", "Connected systems")
          }].map(t => <div key={t.title}>
            <p className="rdi-heading font-semibold text-[#047857]">
              {t.title}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {t.description}
            </p>
          </div>)}
        </div>
      </div>
    </div>
  </section></CmsSection>
  <CmsSection id="solar.our-partnership"><section className="bg-white px-4 py-16 @min-[640px]/rdi:py-20">
    <div className="rdi-container mx-auto">
      <div className="mb-12 grid gap-6 @min-[1024px]/rdi:grid-cols-2 @min-[1024px]/rdi:gap-16">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#047857]">
            {content("solar.our-partnership.1", "A partnership built around your energy needs")}
          </p>
          <h2 className="rdi-heading text-3xl font-bold text-slate-900 @min-[640px]/rdi:text-4xl">
            {content("solar.our-partnership.2", "Local guidance.")}
            <br />
            {content("solar.our-partnership.3", "Connected energy solutions.")}
          </h2>
        </div>
        <div className="text-lg leading-relaxed text-slate-600">
          <p>
            {content("solar.our-partnership.4", "RDI is your local point of contact for planning and delivering your solar project. ALLOLLA General Power brings the technology range, from photovoltaic modules and inverters to intelligent battery storage.")}
          </p>
          <p className="mt-4">
            {content("solar.our-partnership.5", "Together, we help you explore a system that fits your property, power needs and plans for growth.")}
          </p>
          <a href={solarPartner.website} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-base font-semibold text-[#047857] hover:text-[#065F46]">
            {content("solar.our-partnership.6", "Meet ALLOLLA General Power ")}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
      <div className="grid gap-8 @min-[768px]/rdi:grid-cols-3">
        {[{
          icon: Zap,
          title: content("solar.our-partnership.7", "Energy independence"),
          text: "Generate power at your property and reduce reliance on the grid."
        }, {
          icon: Leaf,
          title: content("solar.our-partnership.8", "Cleaner operations"),
          text: "Use renewable energy to reduce the environmental impact of daily power needs."
        }, {
          icon: ShieldCheck,
          title: content("solar.our-partnership.9", "Built for reliability"),
          text: "Thoughtful design, quality installation, and support protect long-term performance."
        }].map(t => <article className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/60 p-6 shadow-sm @min-[640px]/rdi:p-8" key={t.title}>
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FBBF24]/20 text-[#B45309]">
            <t.icon className="h-6 w-6" />
          </div>
          <h2 className="rdi-heading text-xl font-semibold text-slate-900">
            {t.title}
          </h2>
          <p className="mt-2 leading-relaxed text-slate-600">
            {t.text}
          </p>
        </article>)}
      </div>
    </div>
  </section></CmsSection>
  <SolarCatalogue />
  <CmsSection id="solar.energy-ecosystem"><section className="bg-[#071A14] px-4 py-16 @min-[640px]/rdi:py-24">
    <div className="rdi-container mx-auto">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#34D399]">
          {content("solar.energy-ecosystem.1", "One connected energy system")}
        </p>
        <h2 className="rdi-heading text-3xl font-bold text-white @min-[640px]/rdi:text-4xl">
          {content("solar.energy-ecosystem.2", "Generate. Store. Stay in control.")}
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-slate-300">
          {content("solar.energy-ecosystem.3", "ALLOLLA connects solar panels, inverters, battery storage and grid supply, with cloud, app and PC monitoring to help you understand your energy system.")}
        </p>
      </div>
      <figure className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-white p-3 shadow-2xl @min-[640px]/rdi:p-6">
        <img src={content("solar.energy-ecosystem.4", "/rdi-assets/solar/allolla/energy-solutions.jpg")} alt={content("solar.energy-ecosystem.5", "ALLOLLA system diagram showing solar panels connected to an inverter, batteries, the grid and household loads, with cloud monitoring on an app or PC")} width="1500" height="1011" className="h-auto w-full" loading="lazy" />
        <figcaption className="px-3 pb-3 pt-2 text-center text-sm text-slate-500">
          {content("solar.energy-ecosystem.6", "The ALLOLLA energy ecosystem, from generation to everyday use.")}
        </figcaption>
      </figure>
      <div className="mx-auto mt-8 grid max-w-5xl gap-6 @min-[768px]/rdi:grid-cols-3">
        {[{
          title: content("solar.energy-ecosystem.7", "Use solar energy"),
          text: "Photovoltaic modules feed the inverter to support your property's energy needs."
        }, {
          title: content("solar.energy-ecosystem.8", "Store energy for later"),
          text: "Battery storage adds flexibility and supports backup power in a suitably designed system."
        }, {
          title: content("solar.energy-ecosystem.9", "Monitor performance"),
          text: "Connected monitoring brings operating information to your app or computer."
        }].map(t => <div className="rounded-2xl border border-white/10 bg-white/5 p-6" key={t.title}>
          <h3 className="rdi-heading text-lg font-semibold text-[#FDE68A]">
            {t.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {t.text}
          </p>
        </div>)}
      </div>
    </div>
  </section></CmsSection>
  <CmsSection id="solar.our-process"><section className="bg-white px-4 py-16 @min-[640px]/rdi:py-24">
    <div className="rdi-container mx-auto grid items-center gap-10 @min-[1024px]/rdi:grid-cols-2 @min-[1024px]/rdi:gap-16">
      <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white p-6 shadow-xl @min-[640px]/rdi:p-8">
        <div className="grid grid-cols-2 items-center gap-5">
          <img src={content("solar.our-process.1", "/rdi-assets/solar/allolla/inverter.jpg")} alt={content("solar.our-process.2", "ALLOLLA inverter with a digital control display")} className="h-64 w-full object-contain @min-[640px]/rdi:h-80" loading="lazy" />
          <img src={content("solar.our-process.3", "/rdi-assets/solar/allolla/geco-wall-battery.jpg")} alt={content("solar.our-process.4", "ALLOLLA GECO wall battery for home energy storage")} className="h-64 w-full object-contain @min-[640px]/rdi:h-80" loading="lazy" />
        </div>
        <div className="mt-6 rounded-2xl bg-emerald-50 p-6">
          <Sun className="mb-3 h-8 w-8 text-[#047857]" />
          <p className="rdi-heading text-xl font-semibold text-slate-900">
            {content("solar.our-process.5", "ALLOLLA technology.")}
            <br />
            {content("solar.our-process.6", "Support from your RDI team.")}
          </p>
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#047857]">
          {content("solar.our-process.7", "Our process")}
        </p>
        <h2 className="rdi-heading text-3xl font-bold text-slate-900 @min-[640px]/rdi:text-4xl">
          {content("solar.our-process.8", "A clear path from energy need to working system")}
        </h2>
        <div className="mt-8 space-y-6">
          {solarProcess.map(t => <div className="flex gap-4" key={t.number}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FBBF24] font-bold text-[#0F172A]">
              {t.number}
            </div>
            <div>
              <h3 className="rdi-heading text-lg font-semibold text-slate-900">
                {t.title}
              </h3>
              <p className="mt-1 leading-relaxed text-slate-600">
                {t.description}
              </p>
            </div>
          </div>)}
        </div>
      </div>
    </div>
  </section></CmsSection>
  <CmsSection id="solar.get-in-touch"><section className="bg-[#071A14] px-4 py-16 @min-[640px]/rdi:py-20">
    <div className="rdi-container mx-auto rounded-3xl border border-[#FBBF24]/20 bg-gradient-to-br from-[#0D2A20] to-[#071A14] p-6 text-center shadow-2xl @min-[640px]/rdi:p-10 @min-[1024px]/rdi:p-14">
      <Sun className="mx-auto mb-5 h-12 w-12 text-[#FBBF24]" />
      <h2 className="rdi-heading text-3xl font-bold text-white @min-[640px]/rdi:text-4xl">
        {content("solar.get-in-touch.1", "Ready to put the sun to work?")}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">
        {content("solar.get-in-touch.2", "Tell us about your property and energy needs. Our RDI solar team will help you explore the ALLOLLA range and plan your next step.")}
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 @min-[640px]/rdi:flex-row @min-[640px]/rdi:flex-wrap">
        <a href={solarEnquiry()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#FBBF24] px-7 py-3 font-semibold text-[#0F172A] transition-colors hover:bg-[#FCD34D]">
          <Mail className="h-5 w-5" />
          {content("solar.get-in-touch.3", " Start Your Solar Project")}
        </a>
        <a href={solarPartner.phone.href} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 px-7 py-3 font-semibold text-white transition-colors hover:bg-white/10">
          <Phone className="h-5 w-5" />
          {solarPartner.phone.label}
        </a>
      </div>
      <a href={officeMapUrl} target="_blank" rel="noreferrer" className="mx-auto mt-7 flex max-w-xl items-start justify-center gap-2 text-sm leading-relaxed text-slate-300 hover:text-white">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#34D399]" />
        {officeAddress.full}
      </a>
    </div>
  </section></CmsSection>
</>

}
