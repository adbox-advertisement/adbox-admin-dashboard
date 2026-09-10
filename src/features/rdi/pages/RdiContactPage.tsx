import { useWebsiteContact } from "../cms/use-website-contact"
import { useCmsText, useCmsCollection } from "../cms/use-cms-content"
import { CmsSection } from "../cms/components/CmsSection"
import { useState } from "react"
import { ChevronDown, Clock, Mail, MapPin, Phone, Sun } from "lucide-react"
import { ContactForm } from "../components/contact/ContactForm"
import { contactTeams as defaultContactTeams, contactFaqs as defaultContactFaqs } from "../data/contact"
export const RdiContactPage = () => {
  const content = useCmsText()
  const { officeAddress, officeMapUrl, phone, phoneUrl, email, emailUrl } = useWebsiteContact()
  const contactTeams = useCmsCollection("contact-teams", defaultContactTeams)
  const contactFaqs = useCmsCollection("faqs", defaultContactFaqs)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  return <>
    <CmsSection id="contact.introduction"><section className="relative isolate overflow-hidden bg-[#0F172A] px-4 py-20 text-center @min-[640px]/rdi:py-24">
      <div className="absolute -left-24 top-0 -z-10 h-72 w-72 rounded-full bg-[#F97316]/15 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9333EA]/15 blur-3xl" />
      <div className="absolute -right-24 bottom-0 -z-10 h-72 w-72 rounded-full bg-[#10B981]/15 blur-3xl" />
      <div className="rdi-container mx-auto">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#FBBF24]">
          {content("contact.introduction.1", "Start a conversation")}
        </p>
        <h1 className="mx-auto max-w-4xl rdi-heading text-4xl font-bold leading-tight text-white @min-[640px]/rdi:text-5xl @min-[768px]/rdi:text-6xl">
          {content("contact.introduction.2", "Let's build, create, and power what's next")}
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-slate-300 @min-[640px]/rdi:text-xl">
          {content("contact.introduction.3", "Tell us whether you need construction, media, solar technology, or a connected solution. We'll help you find the right path.")}
        </p>
      </div>
    </section></CmsSection>
    <CmsSection id="contact.contact-details"><section className="bg-gradient-to-b from-slate-50 to-white px-4 py-16 @min-[640px]/rdi:py-24">
      <div className="rdi-container mx-auto grid max-w-7xl gap-8 @min-[1024px]/rdi:grid-cols-3 @min-[1024px]/rdi:gap-12">
        <div className="@min-[1024px]/rdi:col-span-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl @min-[640px]/rdi:p-8 @min-[768px]/rdi:p-10">
            <h2 className="rdi-heading text-3xl font-bold text-slate-900 @min-[640px]/rdi:text-4xl">
              {content("contact.contact-details.1", "Tell us about your project")}
            </h2>
            <p className="mb-8 mt-3 text-slate-600">
              {content("contact.contact-details.2", "Share a few details and select the division that best matches your needs.")}
            </p>
            <ContactForm />
          </div>
        </div>
        <aside className="space-y-6" aria-label="Contact information">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg @min-[640px]/rdi:p-8">
            <h2 className="rdi-heading text-2xl font-semibold text-slate-900">
              {content("contact.contact-details.3", "Contact information")}
            </h2>
            <address className="mt-6 not-italic">
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="rounded-xl bg-amber-100 p-3 text-[#B45309]">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">
                      {content("contact.contact-details.4", "Visit us")}
                    </p>
                    <a href={officeMapUrl} target="_blank" rel="noreferrer" className="mt-1 block leading-relaxed text-slate-600 hover:text-slate-900">
                      {officeAddress.lines.map(s => <span className="block" key={s}>
                        {s}
                      </span>)}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="rounded-xl bg-purple-100 p-3 text-[#7E22CE]">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">
                      {content("contact.contact-details.5", "Call us")}
                    </p>
                    <a href={phoneUrl} className="mt-1 block text-slate-600 hover:text-slate-900">
                      {phone}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="rounded-xl bg-emerald-100 p-3 text-[#047857]">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800">
                      {content("contact.contact-details.8", "Email us")}
                    </p>
                    <a href={emailUrl} className="mt-1 block break-all text-slate-600 hover:text-slate-900">
                      {email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">
                      {content("contact.contact-details.11", "Office hours")}
                    </p>
                    <p className="mt-1 text-slate-600">
                      {content("contact.contact-details.12", "Monday–Friday: 8:00–17:00")}
                    </p>
                  </div>
                </li>
              </ul>
            </address>
          </div>
          <div className="rounded-2xl border border-[#FBBF24]/30 bg-gradient-to-br from-amber-50 to-emerald-50 p-6 @min-[640px]/rdi:p-8">
            <Sun className="h-8 w-8 text-[#B45309]" />
            <h2 className="mt-4 rdi-heading text-xl font-semibold text-slate-900">
              {content("contact.contact-details.13", "Planning a solar project?")}
            </h2>
            <p className="mt-2 leading-relaxed text-slate-600">
              {content("contact.contact-details.14", "Include your location, typical power needs, and property type in the message so our solar team can prepare for the first conversation.")}
            </p>
          </div>
        </aside>
      </div>
    </section></CmsSection>
    <CmsSection id="contact.our-teams"><section className="bg-[#F8FAFC] px-4 py-16 @min-[640px]/rdi:py-24">
      <div className="rdi-container mx-auto">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="rdi-heading text-3xl font-bold text-slate-900 @min-[640px]/rdi:text-4xl">
            {content("contact.our-teams.1", "Speak with the right team")}
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            {content("contact.our-teams.2", "Each division has dedicated specialists ready to understand your project.")}
          </p>
        </div>
        <div className="grid gap-6 @min-[768px]/rdi:grid-cols-3">
          {contactTeams.map(s => <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm @min-[640px]/rdi:p-8" key={s.cmsId}>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.iconStyle}`}>
              <s.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 rdi-heading text-xl font-semibold text-slate-900">
              {s.name}
            </h3>
            <p className="mt-2 text-slate-600">
              {s.description}
            </p>
            <a href={`mailto:${s.email}`} className="mt-4 block break-all text-sm font-semibold text-slate-800 hover:underline">
              {s.email}
            </a>
          </article>)}
        </div>
      </div>
    </section></CmsSection>
    <CmsSection id="contact.frequently-asked-questions"><section className="bg-white px-4 py-16 @min-[640px]/rdi:py-24">
      <div className="rdi-container mx-auto">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="rdi-heading text-3xl font-bold text-slate-900 @min-[640px]/rdi:text-4xl">
            {content("contact.frequently-asked-questions.1", "Frequently asked questions")}
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            {content("contact.frequently-asked-questions.2", "Helpful details before we begin.")}
          </p>
        </div>
        <div className="mx-auto max-w-4xl space-y-4">
          {contactFaqs.map((s, i) => {
            const a = openFaq === i, c = `faq-answer-${i}`
            return <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" key={s.cmsId}>
              <h3>
                <button type="button" onClick={() => setOpenFaq(a ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-slate-50 @min-[640px]/rdi:px-7" aria-expanded={a} aria-controls={c}>
                  <span className="rdi-heading text-lg font-semibold text-slate-900 @min-[640px]/rdi:text-xl">
                    {s.question}
                  </span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${a ? "rotate-180" : ""}`} />
                </button>
              </h3>
              <div id={c} className={`grid transition-[grid-template-rows] duration-300 ${a ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 leading-relaxed text-slate-600 @min-[640px]/rdi:px-7 @min-[640px]/rdi:pb-6">
                    {s.answer}
                  </p>
                </div>
              </div>
            </article>
          })}
        </div>
      </div>
    </section></CmsSection>
  </>
}
