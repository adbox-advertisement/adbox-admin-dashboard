import { useCmsText } from "../cms/use-cms-content"
import { CmsSection } from "../cms/components/CmsSection"
import { useState } from "react"
import { ArrowRight, Building, Film, Sun } from "lucide-react"
import { WebsiteLink } from "../components/shared/WebsiteLink"
import { WebsiteButton } from "../components/shared/WebsiteButton"
export const RdiHomePage = () => {
  const content = useCmsText()
  const [hoveredDivision, setHoveredDivision] = useState<string | null>(null)
  return <>
    <section className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-[#FFC107] opacity-5 rounded-full blur-3xl -top-20 -left-20 animate-pulse" />
        <div className="absolute w-96 h-96 bg-[#9C27B0] opacity-5 rounded-full blur-3xl -bottom-20 -right-20 animate-pulse" />
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#10B981] opacity-5 blur-3xl" />
      </div>
      <div className="rdi-container mx-auto px-4 relative z-10 py-16">
        <CmsSection id="home.welcome"><div className="mb-10 text-center @min-[640px]/rdi:mb-16">
          <h1 className="mx-auto mb-6 max-w-5xl rdi-heading text-4xl font-bold leading-tight text-white @min-[640px]/rdi:text-5xl @min-[768px]/rdi:text-6xl @min-[1024px]/rdi:text-7xl">
            {content("home.welcome.1", "Welcome to")}
            {" "}
            <span className="bg-gradient-to-r from-[#FB923C] via-[#FBBF24] to-[#34D399] bg-clip-text text-transparent">
              {content("home.welcome.2", "RichDad Investments")}
            </span>
          </h1>
          <p className="text-[#94A3B8] text-xl @min-[768px]/rdi:text-2xl mb-4 max-w-3xl mx-auto">
            {content("home.welcome.3", "Three Divisions. One Vision. Endless Possibilities.")}
          </p>
          <p className="text-[#64748B] text-lg max-w-2xl mx-auto">
            {content("home.welcome.4", "Choose your path to discover how we can transform your project")}
          </p>
        </div></CmsSection>
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 @min-[768px]/rdi:grid-cols-2 @min-[1280px]/rdi:grid-cols-3 @min-[1280px]/rdi:gap-8">
          <CmsSection id="home.construction-card"><div onMouseEnter={() => setHoveredDivision("construction")} onMouseLeave={() => setHoveredDivision(null)} className="group relative overflow-hidden rounded-2xl border-2 border-[#334155] bg-gradient-to-br from-[#1E293B] to-[#0F172A] transition-all duration-500 hover:-translate-y-1 hover:border-[#F97316] hover:shadow-2xl">
            <div className="absolute inset-0">
              <img src={content("home.construction-card.1", "/rdi-assets/construction/residential-buildings.jpg")} alt={content("home.construction-card.2", "Residential building works from the RichDad Investments construction portfolio")} className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-transparent" />
            </div>
            <div className="relative flex h-full min-h-[480px] flex-col justify-between p-6 @min-[640px]/rdi:p-8 @min-[1280px]/rdi:p-8 @min-[1536px]/rdi:p-10">
              <div>
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#F97316]/20 transition-all duration-300 group-hover:bg-[#F97316]/30">
                  <Building className="h-10 w-10 text-[#FB923C]" />
                </div>
                <h2 className="mb-4 rdi-heading text-3xl font-bold text-white @min-[640px]/rdi:text-4xl">
                  {content("home.construction-card.3", "Construction")}
                </h2>
                <div className="mb-6 h-1 w-20 bg-[#F97316] transition-all duration-300 group-hover:w-32" />
                <p className="text-[#94A3B8] text-lg mb-8">
                  {content("home.construction-card.4", "Building tomorrow's infrastructure today. Civil works, buildings and water systems, supported by the right equipment and engineering expertise.")}
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-[#CBD5E1]">
                    <div className="mr-3 h-2 w-2 shrink-0 rounded-full bg-[#F97316]" />
                    {content("home.construction-card.5", "Civil Engineering & Building Construction")}
                  </li>
                  <li className="flex items-center text-[#CBD5E1]">
                    <div className="mr-3 h-2 w-2 shrink-0 rounded-full bg-[#F97316]" />
                    {content("home.construction-card.6", "Pipe Laying & Water Systems")}
                  </li>
                  <li className="flex items-center text-[#CBD5E1]">
                    <div className="mr-3 h-2 w-2 shrink-0 rounded-full bg-[#F97316]" />
                    {content("home.construction-card.7", "HDPE Pipe Fittings")}
                  </li>
                  <li className="flex items-center text-[#CBD5E1]">
                    <div className="mr-3 h-2 w-2 shrink-0 rounded-full bg-[#F97316]" />
                    {content("home.construction-card.8", "Butt-Fusion Machine Sales & Rentals")}
                  </li>
                </ul>
              </div>
              <WebsiteButton className="flex w-full translate-y-2 items-center justify-center rounded-xl bg-[#F97316] py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-[#FB923C] group-hover:translate-y-0" asChild>
                <WebsiteLink href={content("home.construction-card.9", "/construction")}>
                  {content("home.construction-card.10", "Explore Construction")}
                  <ArrowRight className={`ml-2 h-5 w-5 transition-transform duration-300 ${hoveredDivision === "construction" ? "translate-x-2" : ""}`} />
                </WebsiteLink>
              </WebsiteButton>
            </div>
          </div></CmsSection>
          <CmsSection id="home.media-card"><div onMouseEnter={() => setHoveredDivision("media")} onMouseLeave={() => setHoveredDivision(null)} className="group relative overflow-hidden rounded-2xl border-2 border-[#334155] bg-gradient-to-br from-[#1E293B] to-[#0F172A] transition-all duration-500 hover:-translate-y-1 hover:border-[#9C27B0] hover:shadow-2xl">
            <div className="absolute inset-0">
              <img src={content("home.media-card.1", "/rdi-assets/media/photo-1492691527719-9d1e07e534b4-1200.jpg")} alt={content("home.media-card.2", "Media Production")} className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-transparent" />
            </div>
            <div className="relative flex h-full min-h-[480px] flex-col justify-between p-6 @min-[640px]/rdi:p-8 @min-[1280px]/rdi:p-8 @min-[1536px]/rdi:p-10">
              <div>
                <div className="w-20 h-20 bg-[#9C27B0]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#9C27B0]/30 transition-all duration-300">
                  <Film className="h-10 w-10 text-[#9C27B0]" />
                </div>
                <h2 className="mb-4 rdi-heading text-3xl font-bold text-white @min-[640px]/rdi:text-4xl">
                  {content("home.media-card.3", "Media")}
                </h2>
                <div className="w-20 h-1 bg-[#9C27B0] mb-6 group-hover:w-32 transition-all duration-300" />
                <p className="text-[#94A3B8] text-lg mb-8">
                  {content("home.media-card.4", "Crafting compelling stories through digital innovation. From concept to creation, we bring your brand's vision to life.")}
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-[#CBD5E1]">
                    <div className="w-2 h-2 bg-[#9C27B0] rounded-full mr-3" />
                    {content("home.media-card.5", "Video Production & Photography")}
                  </li>
                  <li className="flex items-center text-[#CBD5E1]">
                    <div className="w-2 h-2 bg-[#9C27B0] rounded-full mr-3" />
                    {content("home.media-card.6", "Digital Marketing Solutions")}
                  </li>
                  <li className="flex items-center text-[#CBD5E1]">
                    <div className="w-2 h-2 bg-[#9C27B0] rounded-full mr-3" />
                    {content("home.media-card.7", "Brand Development")}
                  </li>
                  <li className="flex items-center text-[#CBD5E1]">
                    <div className="w-2 h-2 bg-[#9C27B0] rounded-full mr-3" />
                    {content("home.media-card.8", "Content Strategy")}
                  </li>
                </ul>
              </div>
              <WebsiteButton className="w-full bg-[#9C27B0] hover:bg-[#AB47BC] text-white font-semibold py-4 rounded-xl transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 flex items-center justify-center text-lg" asChild>
                <WebsiteLink href={content("home.media-card.9", "/media")}>
                  {content("home.media-card.10", "Explore Media")}
                  <ArrowRight className={`ml-2 h-5 w-5 transition-transform duration-300 ${hoveredDivision === "media" ? "translate-x-2" : ""}`} />
                </WebsiteLink>
              </WebsiteButton>
            </div>
          </div></CmsSection>
          <CmsSection id="home.solar-card"><div onMouseEnter={() => setHoveredDivision("solar")} onMouseLeave={() => setHoveredDivision(null)} className="group relative overflow-hidden rounded-2xl border-2 border-[#334155] bg-gradient-to-br from-[#1E293B] to-[#0F172A] transition-all duration-500 hover:-translate-y-1 hover:border-[#FBBF24] hover:shadow-2xl @min-[768px]/rdi:col-span-2 @min-[768px]/rdi:w-[calc(50%_-_0.75rem)] @min-[768px]/rdi:justify-self-center @min-[1280px]/rdi:col-span-1 @min-[1280px]/rdi:w-auto">
            <div className="absolute inset-0">
              <img src={content("home.solar-card.1", "/rdi-assets/solar/allolla/product-family.jpg")} alt={content("home.solar-card.2", "ALLOLLA solar panels, inverters and energy storage systems")} className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-transparent" />
            </div>
            <div className="relative flex h-full min-h-[480px] flex-col justify-between p-6 @min-[640px]/rdi:p-8 @min-[1280px]/rdi:p-8 @min-[1536px]/rdi:p-10">
              <div>
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FBBF24]/25 to-[#10B981]/20 transition-all duration-300 group-hover:from-[#FBBF24]/35 group-hover:to-[#10B981]/30">
                  <Sun className="h-10 w-10 text-[#FBBF24]" />
                </div>
                <h2 className="mb-4 rdi-heading text-3xl font-bold text-white @min-[640px]/rdi:text-4xl">
                  {content("home.solar-card.3", "Solar Technology")}
                </h2>
                <div className="mb-6 h-1 w-20 bg-gradient-to-r from-[#FBBF24] to-[#10B981] transition-all duration-300 group-hover:w-32" />
                <p className="text-[#94A3B8] text-lg mb-8">
                  {content("home.solar-card.4", "In partnership with ALLOLLA General Power, we connect homes and businesses with solar panels, inverters and intelligent energy storage.")}
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-[#CBD5E1]">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full mr-3 shrink-0" />
                    {content("home.solar-card.5", "Solar Panel Installation")}
                  </li>
                  <li className="flex items-center text-[#CBD5E1]">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full mr-3 shrink-0" />
                    {content("home.solar-card.6", "ALLOLLA Inverters & Battery Storage")}
                  </li>
                  <li className="flex items-center text-[#CBD5E1]">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full mr-3 shrink-0" />
                    {content("home.solar-card.7", "Commercial Energy Storage")}
                  </li>
                  <li className="flex items-center text-[#CBD5E1]">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full mr-3 shrink-0" />
                    {content("home.solar-card.8", "Maintenance & Performance Monitoring")}
                  </li>
                </ul>
              </div>
              <WebsiteButton className="flex w-full translate-y-2 items-center justify-center rounded-xl bg-[#FBBF24] py-4 text-lg font-semibold text-[#0F172A] transition-all duration-300 hover:bg-[#FCD34D] group-hover:translate-y-0" asChild>
                <WebsiteLink href={content("home.solar-card.9", "/solar")}>
                  {content("home.solar-card.10", "Explore Solar Technology")}
                  <ArrowRight className={`ml-2 h-5 w-5 transition-transform duration-300 ${hoveredDivision === "solar" ? "translate-x-2" : ""}`} />
                </WebsiteLink>
              </WebsiteButton>
            </div>
          </div></CmsSection>
        </div>
        <CmsSection id="home.contact-invitation"><div className="text-center mt-16">
          <p className="text-[#64748B] mb-4">
            {content("home.contact-invitation.1", "Not sure which division you need?")}
          </p>
          <WebsiteButton className="bg-[#334155] hover:bg-[#475569] text-white px-8 py-3 rounded-lg font-medium transition-all" asChild>
            <WebsiteLink href={content("home.contact-invitation.2", "/contact")}>
              {content("home.contact-invitation.3", "Contact Us for Guidance")}
            </WebsiteLink>
          </WebsiteButton>
        </div></CmsSection>
      </div>
    </section>
  </>
}
