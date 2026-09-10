import { Building, Film, Sun } from "lucide-react"
export const officeAddress = {
  lines: ["No. 64A, Omensa Plaza", "Off Awoshie Pokuase Rd."],
  full: "No. 64A, Omensa Plaza, Off Awoshie Pokuase Rd."
}
export const officeMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(officeAddress.full)}`
export const contactTeams = [{
  name: "Construction",
  description: "Building, renovation, and project enquiries",
  email: "construction@richdadinvestments.com",
  icon: Building,
  iconStyle: "bg-orange-100 text-[#C2410C]"
}, {
  name: "Media",
  description: "Production, branding, and campaign enquiries",
  email: "media@richdadinvestments.com",
  icon: Film,
  iconStyle: "bg-purple-100 text-[#7E22CE]"
}, {
  name: "Solar Technology",
  description: "RDI × ALLOLLA solar systems, storage and support",
  email: "solar@richdadinvestments.com",
  icon: Sun,
  iconStyle: "bg-gradient-to-br from-amber-100 to-emerald-100 text-[#047857]"
}]
export const contactFaqs = [{
  question: "Which areas do you serve?",
  answer: "We are based in Accra and primarily serve the Greater Accra Region, with project availability across Ghana depending on scope and requirements."
}, {
  question: "Do you offer an initial consultation?",
  answer: "Yes. We begin with a conversation about your goals, site or audience, timeline, and budget so we can recommend the most useful next step."
}, {
  question: "Can more than one division work on my project?",
  answer: "Yes. Our construction, media, and solar teams can work independently or coordinate on one project—for example, building a property, installing its energy system, and producing launch content."
}, {
  question: "What solar technology services do you provide?",
  answer: "In partnership with ALLOLLA General Power, our solar division supports photovoltaic modules, inverters, home batteries and commercial energy storage, alongside system planning, installation and support."
}]
