import { Building, Film, Sun } from "lucide-react"
export const divisions = [{
  id: "construction",
  name: "Construction",
  eyebrow: "Building the future, one project at a time",
  summary: "Our construction division brings together planning, craftsmanship, and project management to deliver commercial and residential spaces that perform beautifully.",
  promise: "From the first brief to final handover, we keep quality, safety, clear communication, and responsible delivery at the centre of the project.",
  icon: Building,
  items: ["Commercial and residential construction", "Renovation and remodelling", "Design-build coordination", "Project management"],
  href: "/construction",
  buttonActive: "bg-[#F97316] text-white shadow-lg",
  iconStyle: "bg-orange-100 text-[#C2410C]",
  panelStyle: "border-orange-200 bg-gradient-to-br from-orange-50 to-white",
  linkStyle: "bg-[#F97316] text-white hover:bg-[#FB923C]"
}, {
  id: "media",
  name: "Media",
  eyebrow: "Stories that captivate, connect, and convert",
  summary: "Our media division turns ideas into strong visual experiences through strategy, production, branding, and digital content designed around real audience needs.",
  promise: "We pair creative direction with disciplined production so every asset supports your message, reflects your identity, and helps move your business forward.",
  icon: Film,
  items: ["Video production and photography", "Brand strategy and identity", "Digital marketing content", "Animation and visual storytelling"],
  href: "/media",
  buttonActive: "bg-[#9333EA] text-white shadow-lg",
  iconStyle: "bg-purple-100 text-[#7E22CE]",
  panelStyle: "border-purple-200 bg-gradient-to-br from-purple-50 to-white",
  linkStyle: "bg-[#9333EA] text-white hover:bg-[#A855F7]"
}, {
  id: "solar",
  name: "Solar Technology",
  eyebrow: "In partnership with ALLOLLA General Power",
  summary: "Our solar technology division partners with ALLOLLA General Power to bring together photovoltaic modules, inverters, home batteries and commercial energy storage, supported by RDI’s local project team.",
  promise: "We assess how you use energy, recommend an appropriate system, install it professionally, and help you protect performance after handover.",
  icon: Sun,
  items: ["ALLOLLA photovoltaic modules and inverters", "Home batteries and commercial energy storage", "Energy assessment and system design", "Monitoring, maintenance, and support"],
  href: "/solar",
  buttonActive: "bg-gradient-to-r from-[#FBBF24] to-[#10B981] text-[#0F172A] shadow-lg",
  iconStyle: "bg-gradient-to-br from-amber-100 to-emerald-100 text-[#047857]",
  panelStyle: "border-emerald-200 bg-gradient-to-br from-amber-50 via-white to-emerald-50",
  linkStyle: "bg-[#FBBF24] text-[#0F172A] hover:bg-[#FCD34D]"
}]
