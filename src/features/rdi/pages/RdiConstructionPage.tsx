import { useCmsText, useCmsCollection } from "../cms/use-cms-content"
import { useWebsiteContact } from "../cms/use-website-contact"
import { CmsSection } from "../cms/components/CmsSection"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Building2, Check, ChevronRight, Clock, Droplets, Hammer, HardHat, Mail, MapPin, Phone, Settings, Shield, Wrench } from "lucide-react"
import { constructionServices as defaultConstructionServices } from "../data/construction"
import { ConstructionSupplies } from "../components/construction/ConstructionSupplies"
import { constructionProjects as defaultConstructionProjects } from "../data/construction"
import { constructionContact } from "../data/construction"
import { WebsiteLink } from "../components/shared/WebsiteLink"
export const RdiConstructionPage = () => {
  const content = useCmsText()
  const { officeAddress } = useWebsiteContact()
  const constructionProjects = useCmsCollection("construction-projects", defaultConstructionProjects)
  const constructionServices = useCmsCollection("services", defaultConstructionServices)
  const [hoveredService, setHoveredService] = useState<number | null>(null), [activeStep, setActiveStep] = useState(0)
  return <>
    <CmsSection id="construction.introduction"><section className="relative bg-gradient-to-br from-[#1E293B] via-[#334155] to-[#1E293B] py-24 @min-[768px]/rdi:py-32 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#F97316] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#F97316] rounded-full blur-3xl animate-pulse" style={{
          animationDelay: "1s"
        }} />
      </div>
      <div className="rdi-container mx-auto px-4 text-center relative z-10">
        <h1 className="mb-6 rdi-heading text-4xl font-bold leading-tight text-white @min-[640px]/rdi:text-5xl @min-[768px]/rdi:text-6xl">
          {content("construction.introduction.1", "Engineering & Construction")}
        </h1>
        <p className="text-[#CBD5E1] text-xl @min-[768px]/rdi:text-2xl max-w-3xl mx-auto leading-relaxed mb-8">
          {content("construction.introduction.2", "Building excellence with precision, quality, and innovation. Civil works, buildings and water infrastructure, from your first drawing to the final handover.")}
        </p>
        <div className="flex flex-col justify-center gap-3 @min-[640px]/rdi:flex-row">
          <a href={content("construction.introduction.3", "#services")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F97316] px-7 py-3 font-semibold text-[#1E293B] transition-colors hover:bg-[#FB923C]">
            {content("construction.introduction.4", "Explore Our Services ")}
            <ChevronRight className="h-5 w-5" />
          </a>
          <a href={content("construction.introduction.5", "#supplies")} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 bg-white/5 px-7 py-3 font-semibold text-white transition-colors hover:bg-white/10">
            {content("construction.introduction.6", "Equipment & Pipe Fittings")}
          </a>
        </div>
      </div>
    </section></CmsSection>
    <CmsSection id="construction.capabilities"><section className="bg-white py-12 @min-[640px]/rdi:py-16" aria-label="Our construction capabilities">
      <div className="rdi-container mx-auto grid grid-cols-2 gap-6 px-4 @min-[768px]/rdi:grid-cols-4 @min-[768px]/rdi:gap-8">
        {[{
          icon: Building2,
          title: content("construction.capabilities.1", "Civil & Building"),
          description: content("construction.capabilities.2", "Engineering and construction")
        }, {
          icon: Droplets,
          title: content("construction.capabilities.3", "Water Systems"),
          description: content("construction.capabilities.4", "Pipelines, boreholes and storage")
        }, {
          icon: Settings,
          title: content("construction.capabilities.5", "HDPE Fittings"),
          description: content("construction.capabilities.6", "DN 40–800 · PN 10–25")
        }, {
          icon: Wrench,
          title: content("construction.capabilities.7", "Sales & Rentals"),
          description: content("construction.capabilities.8", "Butt-fusion machines · DN 50–800")
        }].map(a => <div className="group text-center" key={a.title}>
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#C2410C] transition-colors group-hover:bg-[#F97316] group-hover:text-white">
            <a.icon className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-lg font-bold text-[#1E293B] @min-[640px]/rdi:text-xl">
            {a.title}
          </h2>
          <p className="text-sm leading-relaxed text-[#64748B]">
            {a.description}
          </p>
        </div>)}
      </div>
    </section></CmsSection>
    <CmsSection id="construction.company-profile"><section className="bg-[#F8FAFC] py-16 @min-[640px]/rdi:py-20">
      <div className="rdi-container mx-auto grid items-center gap-10 px-4 @min-[1024px]/rdi:grid-cols-2 @min-[1024px]/rdi:gap-16">
        <div className="relative">
          <img src={content("construction.company-profile.1", "/rdi-assets/construction/residential-buildings.jpg")} alt={content("construction.company-profile.2", "Residential building works from the RichDad Investments construction portfolio")} width="1040" height="592" className="aspect-[4/3] w-full rounded-2xl object-cover shadow-xl" loading="lazy" />
          <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/15 bg-[#1E293B]/95 p-5 text-white shadow-lg @min-[640px]/rdi:left-8 @min-[640px]/rdi:right-auto">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#FB923C]">
              {content("construction.company-profile.3", "Our commitment")}
            </p>
            <p className="mt-2 rdi-heading text-xl font-semibold">
              {content("construction.company-profile.4", "Service by excellence")}
            </p>
          </div>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#C2410C]">
            {content("construction.company-profile.5", "Engineering expertise. Personal commitment.")}
          </p>
          <h2 className="rdi-heading text-3xl font-bold text-[#1E293B] @min-[640px]/rdi:text-4xl">
            {content("construction.company-profile.6", "Your vision, brought to life.")}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[#64748B]">
            {content("construction.company-profile.7", "Based in Accra, RichDad Investments brings multidisciplinary consulting and engineering experience to the planning, design, implementation, monitoring and evaluation of construction projects.")}
          </p>
          <p className="mt-4 leading-relaxed text-[#64748B]">
            {content("construction.company-profile.8", "We work closely with you to turn your ideas into drawings and practical construction solutions. Clear communication throughout the project keeps you informed of progress, schedules and budgets.")}
          </p>
          <div className="mt-7 grid gap-4 @min-[640px]/rdi:grid-cols-2">
            <div className="rounded-xl border border-orange-100 bg-white p-5">
              <h3 className="rdi-heading font-semibold text-[#1E293B]">
                {content("construction.company-profile.9", "Our vision")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                {content("construction.company-profile.10", "To become a regional market leader in civil engineering and building construction services.")}
              </p>
            </div>
            <div className="rounded-xl border border-orange-100 bg-white p-5">
              <h3 className="rdi-heading font-semibold text-[#1E293B]">
                {content("construction.company-profile.11", "Our mission")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                {content("construction.company-profile.12", "To deliver efficient, affordable, sustainable and cost-effective engineering with a high standard of quality.")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section></CmsSection>
    <CmsSection id="construction.why-choose-us"><section className="py-20 bg-gradient-to-b from-[#F8FAFC] to-white">
      <div className="rdi-container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="mb-4 rdi-heading text-3xl font-bold @min-[640px]/rdi:text-4xl @min-[768px]/rdi:text-5xl">
            {content("construction.why-choose-us.1", "Why Choose Us")}
          </h2>
          <p className="text-[#64748B] text-lg max-w-2xl mx-auto">
            {content("construction.why-choose-us.2", "Professionalism, integrity and practical solutions are at the heart of how we work.")}
          </p>
        </div>
        <div className="grid grid-cols-1 @min-[768px]/rdi:grid-cols-2 @min-[1024px]/rdi:grid-cols-4 gap-8">
          <div className="group cursor-pointer">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F97316]/10 rounded-2xl mb-4 group-hover:bg-[#F97316] transition-all duration-300 group-hover:scale-110">
                <Shield className="h-8 w-8 text-[#F97316] group-hover:text-white transition-colors" />
              </div>
              <h3 className="rdi-heading font-semibold text-xl mb-2">
                {content("construction.why-choose-us.3", "Quality First")}
              </h3>
              <p className="text-[#64748B]">
                {content("construction.why-choose-us.4", "Professionalism and integrity, with lasting solutions that stand the test of time")}
              </p>
            </div>
          </div>
          <div className="group cursor-pointer">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F97316]/10 rounded-2xl mb-4 group-hover:bg-[#F97316] transition-all duration-300 group-hover:scale-110">
                <Clock className="h-8 w-8 text-[#F97316] group-hover:text-white transition-colors" />
              </div>
              <h3 className="rdi-heading font-semibold text-xl mb-2">
                {content("construction.why-choose-us.5", "On-Time Delivery")}
              </h3>
              <p className="text-[#64748B]">
                {content("construction.why-choose-us.6", "Clear communication on progress, schedules and budgets throughout your project")}
              </p>
            </div>
          </div>
          <div className="group cursor-pointer">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F97316]/10 rounded-2xl mb-4 group-hover:bg-[#F97316] transition-all duration-300 group-hover:scale-110">
                <HardHat className="h-8 w-8 text-[#F97316] group-hover:text-white transition-colors" />
              </div>
              <h3 className="rdi-heading font-semibold text-xl mb-2">
                {content("construction.why-choose-us.7", "Expert Team")}
              </h3>
              <p className="text-[#64748B]">
                {content("construction.why-choose-us.8", "Multidisciplinary engineering knowledge supported by practical technical expertise")}
              </p>
            </div>
          </div>
          <div className="group cursor-pointer">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F97316]/10 rounded-2xl mb-4 group-hover:bg-[#F97316] transition-all duration-300 group-hover:scale-110">
                <Wrench className="h-8 w-8 text-[#F97316] group-hover:text-white transition-colors" />
              </div>
              <h3 className="rdi-heading font-semibold text-xl mb-2">
                {content("construction.why-choose-us.9", "Full Service")}
              </h3>
              <p className="text-[#64748B]">
                {content("construction.why-choose-us.10", "Planning, design, implementation, monitoring and evaluation under one roof")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section></CmsSection>
    <CmsSection id="construction.our-services"><section id="services" className="scroll-mt-28 py-16 @min-[640px]/rdi:py-20 bg-white">
      <div className="rdi-container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="mb-4 rdi-heading text-3xl font-bold @min-[640px]/rdi:text-4xl @min-[768px]/rdi:text-5xl">
            {content("construction.our-services.1", "Our Services")}
          </h2>
          <p className="text-[#64748B] text-lg max-w-2xl mx-auto">
            {content("construction.our-services.2", "Comprehensive construction solutions tailored to your needs")}
          </p>
        </div>
        <div className="grid grid-cols-1 @min-[768px]/rdi:grid-cols-2 @min-[1024px]/rdi:grid-cols-3 gap-8">
          {constructionServices.map((a, c) => <div className="group cursor-pointer" onMouseEnter={() => setHoveredService(c)} onMouseLeave={() => setHoveredService(null)} key={c}>
            <div className="relative flex h-full flex-col overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="relative h-64 overflow-hidden">
                <img src={a.image} alt={a.alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-[#1E293B]/50 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
                <div className={`absolute top-4 right-4 w-12 h-12 bg-[#F97316] rounded-xl flex items-center justify-center transition-all duration-300 ${hoveredService === c ? "scale-110 rotate-12" : ""}`}>
                  <Check className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex flex-1 flex-col bg-white p-6">
                <h3 className="rdi-heading font-semibold text-xl mb-3 text-[#1E293B] group-hover:text-[#F97316] transition-colors">
                  {a.title}
                </h3>
                <p className="text-[#64748B] leading-relaxed mb-4">
                  {a.description}
                </p>
                <a href={`mailto:construction@richdadinvestments.com?subject=${encodeURIComponent(a.title + " enquiry")}`} className="mt-auto flex items-center gap-2 font-semibold text-[#C2410C] transition-all group-hover:gap-3">
                  {content("construction.our-services.3", "Discuss Your Project")}
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>)}
        </div>
      </div>
    </section></CmsSection>
    <ConstructionSupplies />
    <CmsSection id="construction.our-process"><section className="py-20 bg-gradient-to-b from-[#F8FAFC] to-white">
      <div className="rdi-container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="mb-4 rdi-heading text-3xl font-bold @min-[640px]/rdi:text-4xl @min-[768px]/rdi:text-5xl">
            {content("construction.our-process.1", "Our Process")}
          </h2>
          <p className="text-[#64748B] text-lg max-w-2xl mx-auto">
            {content("construction.our-process.2", "A streamlined approach that ensures your project runs smoothly from start to finish")}
          </p>
        </div>
        <div className="max-w-5xl mx-auto mb-12">
          <div className="flex justify-between items-center mb-8">
            {[0, 1, 2, 3].map(a => <button type="button" aria-label={`View process step ${a + 1}`} aria-pressed={activeStep === a} onClick={() => setActiveStep(a)} className={`flex-1 relative transition-all duration-300 ${a !== 3 ? "mr-4" : ""}`} key={a}>
              <div className={`h-2 rounded-full transition-all duration-300 ${activeStep >= a ? "bg-[#F97316]" : "bg-gray-200"}`} />
              <div className={`w-8 h-8 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 flex items-center justify-center font-bold ${activeStep >= a ? "bg-[#F97316] text-white scale-125" : "bg-gray-200 text-gray-500"}`}>
                {a + 1}
              </div>
            </button>)}
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4 @min-[640px]/rdi:px-6">
          <div className="grid grid-cols-1 @min-[768px]/rdi:grid-cols-2 gap-8">
            <div className={`relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer ${activeStep === 0 ? "ring-4 ring-[#F97316]" : ""}`} onClick={() => setActiveStep(0)} role="button" tabIndex={0} aria-pressed={activeStep === 0} onKeyDown={event => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                setActiveStep(0)
              }
            }}>
              <div className="absolute -top-4 -left-3 @min-[640px]/rdi:-left-5 w-14 h-14 rounded-xl bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white flex items-center justify-center font-bold text-2xl shadow-lg">
                {content("construction.our-process.3", "01")}
              </div>
              <h3 className="rdi-heading font-semibold text-2xl mb-4 mt-4 text-[#1E293B]">
                {content("construction.our-process.4", "Initial Consultation")}
              </h3>
              <p className="text-[#64748B] leading-relaxed">
                {content("construction.our-process.5", "We meet with you to understand your vision, requirements, budget, and timeline. Our experts provide initial guidance and feasibility assessment.")}
              </p>
            </div>
            <div className={`relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer ${activeStep === 1 ? "ring-4 ring-[#F97316]" : ""}`} onClick={() => setActiveStep(1)} role="button" tabIndex={0} aria-pressed={activeStep === 1} onKeyDown={event => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                setActiveStep(1)
              }
            }}>
              <div className="absolute -top-4 -left-3 @min-[640px]/rdi:-left-5 w-14 h-14 rounded-xl bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white flex items-center justify-center font-bold text-2xl shadow-lg">
                {content("construction.our-process.6", "02")}
              </div>
              <h3 className="rdi-heading font-semibold text-2xl mb-4 mt-4 text-[#1E293B]">
                {content("construction.our-process.7", "Design & Planning")}
              </h3>
              <p className="text-[#64748B] leading-relaxed">
                {content("construction.our-process.8", "Our team creates detailed plans, blueprints, and schedules. We handle all permits and ensure compliance with regulations.")}
              </p>
            </div>
            <div className={`relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer ${activeStep === 2 ? "ring-4 ring-[#F97316]" : ""}`} onClick={() => setActiveStep(2)} role="button" tabIndex={0} aria-pressed={activeStep === 2} onKeyDown={event => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                setActiveStep(2)
              }
            }}>
              <div className="absolute -top-4 -left-3 @min-[640px]/rdi:-left-5 w-14 h-14 rounded-xl bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white flex items-center justify-center font-bold text-2xl shadow-lg">
                {content("construction.our-process.9", "03")}
              </div>
              <h3 className="rdi-heading font-semibold text-2xl mb-4 mt-4 text-[#1E293B]">
                {content("construction.our-process.10", "Construction Phase")}
              </h3>
              <p className="text-[#64748B] leading-relaxed">
                {content("construction.our-process.11", "Expert execution with regular progress updates. Quality control at every stage ensures the highest standards are maintained.")}
              </p>
            </div>
            <div className={`relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer ${activeStep === 3 ? "ring-4 ring-[#F97316]" : ""}`} onClick={() => setActiveStep(3)} role="button" tabIndex={0} aria-pressed={activeStep === 3} onKeyDown={event => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                setActiveStep(3)
              }
            }}>
              <div className="absolute -top-4 -left-3 @min-[640px]/rdi:-left-5 w-14 h-14 rounded-xl bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white flex items-center justify-center font-bold text-2xl shadow-lg">
                {content("construction.our-process.12", "04")}
              </div>
              <h3 className="rdi-heading font-semibold text-2xl mb-4 mt-4 text-[#1E293B]">
                {content("construction.our-process.13", "Final Delivery")}
              </h3>
              <p className="text-[#64748B] leading-relaxed">
                {content("construction.our-process.14", "Thorough inspection and walkthrough. We ensure complete satisfaction and provide warranty support for your peace of mind.")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section></CmsSection>
    <CmsSection id="construction.project-gallery"><section className="bg-white py-16 @min-[640px]/rdi:py-20">
      <div className="rdi-container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 rdi-heading text-3xl font-bold text-[#1E293B] @min-[640px]/rdi:text-4xl @min-[768px]/rdi:text-5xl">
            {content("construction.project-gallery.1", "Our Work in Pictures")}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[#64748B]">
            {content("construction.project-gallery.2", "A closer look at our building, civil engineering and water infrastructure works.")}
          </p>
        </div>
        <div className="grid gap-6 @min-[768px]/rdi:grid-cols-2 @min-[1024px]/rdi:grid-cols-3">
          {constructionProjects.map(a => <figure className="group relative h-80 overflow-hidden rounded-2xl bg-slate-100" key={a.cmsId}>
            <img src={a.image} alt={a.alt} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/85 to-transparent px-6 pb-6 pt-20">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-orange-200">
                {a.category}
              </p>
              <h3 className="rdi-heading text-xl font-semibold text-white">
                {a.title}
              </h3>
            </figcaption>
          </figure>)}
        </div>
      </div>
    </section></CmsSection>
    <CmsSection id="construction.get-in-touch"><section className="py-20 bg-[#F8FAFC]">
      <div className="rdi-container mx-auto px-4">
        <div className="relative bg-gradient-to-r from-[#1E293B] to-[#334155] rounded-3xl overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F97316] rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F97316] rounded-full blur-3xl animate-pulse" style={{
              animationDelay: "1s"
            }} />
          </div>
          <div className="relative z-10 grid grid-cols-1 items-center gap-8 p-6 @min-[640px]/rdi:p-10 @min-[768px]/rdi:p-16 @min-[1024px]/rdi:grid-cols-2">
            <div className="text-center @min-[1024px]/rdi:text-left">
              <Hammer className="h-16 w-16 text-[#F97316] mx-auto @min-[1024px]/rdi:mx-0 mb-6" />
              <h2 className="rdi-heading font-bold text-3xl @min-[768px]/rdi:text-4xl text-white mb-4">
                {content("construction.get-in-touch.1", "Let's Build Something Amazing Together")}
              </h2>
              <p className="text-[#CBD5E1] text-lg mb-8">
                {content("construction.get-in-touch.2", "Ready to start your construction project? Get in touch for a consultation and quote.")}
              </p>
              <a href={content("construction.get-in-touch.3", "mailto:construction@richdadinvestments.com?subject=Construction%20project%20enquiry")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F97316] px-7 py-4 text-lg font-semibold text-[#1E293B] shadow-xl transition-colors hover:bg-[#FB923C]">
                <Mail className="h-5 w-5" />
                {content("construction.get-in-touch.4", " Discuss Your Project")}
              </a>
              <div className="mt-6 space-y-3 text-sm text-slate-300">
                {constructionContact.phones.map(a => <a href={a.href} className="flex items-center justify-center gap-2 hover:text-white @min-[1024px]/rdi:justify-start" key={a.href}>
                  <Phone className="h-4 w-4 shrink-0 text-[#FB923C]" />
                  {a.label}
                </a>)}
                <p className="flex items-start justify-center gap-2 @min-[1024px]/rdi:justify-start">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#FB923C]" />
                  {officeAddress.full}
                </p>
              </div>
            </div>
            <div className="hidden @min-[1024px]/rdi:block">
              <img src={content("construction.get-in-touch.5", "/rdi-assets/construction/water-installation.jpg")} alt={content("construction.get-in-touch.6", "Completed pipe fittings and valves installed at a water reservoir")} className="rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </section></CmsSection>
    <CmsSection id="construction.solar-invitation"><section className="py-16 bg-white">
      <div className="rdi-container mx-auto px-4">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-8 rounded-2xl border border-emerald-100 bg-gradient-to-r from-amber-50 to-emerald-50 p-6 shadow-lg @min-[640px]/rdi:p-8 @min-[768px]/rdi:flex-row">
          <div className="text-center @min-[768px]/rdi:text-left">
            <h3 className="rdi-heading font-bold text-2xl @min-[768px]/rdi:text-3xl mb-2">
              {content("construction.solar-invitation.1", "Planning an energy-ready property?")}
            </h3>
            <p className="text-[#64748B] text-lg">
              {content("construction.solar-invitation.2", "Explore how our Solar Technology division can complement your construction project.")}
            </p>
          </div>
          <WebsiteLink href={content("construction.solar-invitation.3", "/solar")} className={cn("w-full @min-[640px]/rdi:w-auto", "flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#FBBF24] px-8 py-3 font-medium text-[#0F172A] shadow-lg transition-colors hover:bg-[#FCD34D] @min-[640px]/rdi:w-auto", "inline-flex items-center justify-center")}>
            {content("construction.solar-invitation.4", "Explore Solar Technology")}
            <ChevronRight className="h-5 w-5" />
          </WebsiteLink>
        </div>
      </div>
    </section></CmsSection>
  </>
}
