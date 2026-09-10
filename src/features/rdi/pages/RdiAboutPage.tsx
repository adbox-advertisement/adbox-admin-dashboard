import { useCmsText, useCmsCollection } from "../cms/use-cms-content"
import { CmsSection } from "../cms/components/CmsSection"
import { useState } from "react"
import { ArrowRight, CircleCheck, Lightbulb, Target, Users } from "lucide-react"
import { divisions as defaultDivisions } from "../data/divisions"
import { WebsiteLink } from "../components/shared/WebsiteLink"
import { WebsiteButton } from "../components/shared/WebsiteButton"
export const RdiAboutPage = () => {
  const content = useCmsText()
  const divisions = useCmsCollection("divisions", defaultDivisions)
  const [activeDivisionId, setActiveDivisionId] = useState("construction")
  const activeDivision = divisions.find(division => division.id === activeDivisionId) ?? divisions[0]
  const DivisionIcon = activeDivision.icon
  return <>
    <CmsSection id="about.introduction"><section className="bg-[#0F172A] px-4 py-16 text-center @min-[640px]/rdi:py-20 @min-[768px]/rdi:py-24">
      <div className="rdi-container mx-auto">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#FBBF24]">
          {content("about.introduction.1", "About RichDad Investments")}
        </p>
        <h1 className="mx-auto max-w-4xl rdi-heading text-4xl font-bold leading-tight text-white @min-[640px]/rdi:text-5xl @min-[768px]/rdi:text-6xl">
          {content("about.introduction.2", "Three disciplines. One connected vision.")}
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-slate-300 @min-[640px]/rdi:text-xl">
          {content("about.introduction.3", "We build enduring spaces, create meaningful stories, and deliver cleaner energy systems that help people and businesses move forward.")}
        </p>
      </div>
    </section></CmsSection>
    <CmsSection id="about.our-divisions"><section className="bg-gradient-to-b from-[#0F172A] to-[#1E293B] px-4 py-16 @min-[640px]/rdi:py-24">
      <div className="rdi-container mx-auto">
        <div className="mx-auto mb-10 max-w-3xl text-center @min-[640px]/rdi:mb-12">
          <h2 className="rdi-heading text-3xl font-bold text-white @min-[640px]/rdi:text-4xl">
            {content("about.our-divisions.1", "Explore our divisions")}
          </h2>
          <p className="mt-3 text-lg text-slate-300">
            {content("about.our-divisions.2", "Specialized teams, connected by one standard of thoughtful delivery.")}
          </p>
        </div>
        <div className="mx-auto mb-8 grid max-w-5xl grid-cols-1 gap-3 @min-[640px]/rdi:grid-cols-3" role="tablist" aria-label="RichDad Investments divisions">
          {divisions.map(a => <button type="button" role="tab" id={`division-tab-${a.id}`} aria-selected={activeDivisionId === a.id} aria-controls="division-panel" tabIndex={activeDivisionId === a.id ? 0 : -1} onKeyDown={event => {
            const currentIndex = divisions.findIndex(division => division.id === a.id)
            const nextIndex = event.key === "ArrowRight" ? (currentIndex + 1) % divisions.length
              : event.key === "ArrowLeft" ? (currentIndex - 1 + divisions.length) % divisions.length
              : event.key === "Home" ? 0
              : event.key === "End" ? divisions.length - 1 : null
            if (nextIndex === null) return
            event.preventDefault()
            const nextId = divisions[nextIndex].id
            setActiveDivisionId(nextId)
            document.getElementById(`division-tab-${nextId}`)?.focus()
          }} onClick={() => setActiveDivisionId(a.id)} className={`flex min-h-14 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 font-semibold transition-all duration-300 ${activeDivisionId === a.id ? a.buttonActive : "bg-white/5 text-slate-200 hover:bg-white/10"}`} key={a.id}>
            <a.icon className="h-5 w-5 shrink-0" />
            {a.name}
          </button>)}
        </div>
        <article id="division-panel" role="tabpanel" aria-labelledby={`division-tab-${activeDivision.id}`} className={`rdi-division-panel mx-auto max-w-5xl rounded-3xl border p-6 shadow-2xl @min-[640px]/rdi:p-8 @min-[1024px]/rdi:p-12 ${activeDivision.panelStyle}`} key={activeDivision.id}>
          <div className="grid gap-8 @min-[1024px]/rdi:grid-cols-[1.1fr_0.9fr] @min-[1024px]/rdi:gap-12">
            <div>
              <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${activeDivision.iconStyle}`}>
                <DivisionIcon className="h-8 w-8" />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-slate-500">
                {activeDivision.eyebrow}
              </p>
              <h3 className="mt-3 rdi-heading text-3xl font-bold text-slate-900 @min-[640px]/rdi:text-4xl">
                {activeDivision.name}
                {content("about.our-divisions.3", " Division")}
              </h3>
              <p className="mt-5 text-lg leading-relaxed text-slate-600">
                {activeDivision.summary}
              </p>
              <WebsiteButton className={`w-full px-6 py-5 font-semibold @min-[640px]/rdi:w-auto ${activeDivision.linkStyle}`} asChild>
                <WebsiteLink href={activeDivision.href} className="mt-7 w-full @min-[640px]/rdi:w-auto">
                  {content("about.our-divisions.4", "Explore ")}
                  {activeDivision.name}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </WebsiteLink>
              </WebsiteButton>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 @min-[640px]/rdi:p-6">
              <h4 className="rdi-heading text-xl font-semibold text-slate-900">
                {content("about.our-divisions.5", "Core capabilities")}
              </h4>
              <ul className="mt-5 space-y-4">
                {activeDivision.items.map(a => <li className="flex items-start gap-3 text-slate-700" key={a}>
                  <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#059669]" />
                  <span>
                    {a}
                  </span>
                </li>)}
              </ul>
              <div className="mt-6 border-t border-slate-200 pt-6">
                <h4 className="rdi-heading font-semibold text-slate-900">
                  {content("about.our-divisions.6", "Our promise")}
                </h4>
                <p className="mt-2 leading-relaxed text-slate-600">
                  {activeDivision.promise}
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section></CmsSection>
    <CmsSection id="about.our-story"><section className="bg-white px-4 py-16 @min-[640px]/rdi:py-24">
      <div className="rdi-container mx-auto grid items-center gap-10 @min-[1024px]/rdi:grid-cols-2 @min-[1024px]/rdi:gap-16">
        <div className="relative">
          <img src={content("about.our-story.1", "/rdi-assets/36.jpg")} alt={content("about.our-story.2", "The RichDad Investments team collaborating")} className="relative z-10 aspect-[4/3] w-full rounded-2xl object-cover shadow-xl" loading="lazy" />
          <div className="absolute -bottom-4 -right-4 hidden h-24 w-24 rounded-xl bg-[#10B981] @min-[768px]/rdi:block" />
          <div className="absolute -left-4 -top-4 hidden h-24 w-24 rounded-xl bg-[#FBBF24] @min-[768px]/rdi:block" />
        </div>
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#B45309]">
            {content("about.our-story.3", "Our story")}
          </p>
          <h2 className="rdi-heading text-3xl font-bold text-slate-900 @min-[640px]/rdi:text-4xl">
            {content("about.our-story.4", "Expertise that grows with the needs of our clients")}
          </h2>
          <div className="mt-6 space-y-5 leading-relaxed text-slate-600">
            <p>
              {content("about.our-story.5", "RichDad Investments began with a vision to combine physical construction expertise with the creative power of digital media. That connected approach gave clients fewer handoffs and a more consistent path from idea to delivery.")}
            </p>
            <p>
              {content("about.our-story.6", "As reliable, sustainable power became increasingly important to the homes and businesses we serve, Solar Technology became our third specialized division. It extends the same practical mindset into energy assessment, solar installation, storage, monitoring, and support.")}
            </p>
            <p>
              {content("about.our-story.7", "Today, our teams can work independently or together—building a facility, communicating its story, and helping power its future.")}
            </p>
          </div>
        </div>
      </div>
    </section></CmsSection>
    <CmsSection id="about.what-sets-us-apart"><section className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] px-4 py-16 @min-[640px]/rdi:py-24">
      <div className="rdi-container mx-auto">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="rdi-heading text-3xl font-bold text-white @min-[640px]/rdi:text-4xl">
            {content("about.what-sets-us-apart.1", "What sets us apart")}
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            {content("about.what-sets-us-apart.2", "Connected expertise creates more options and a clearer experience for every client.")}
          </p>
        </div>
        <div className="grid gap-6 @min-[768px]/rdi:grid-cols-3">
          {[{
            icon: Users,
            title: content("about.what-sets-us-apart.3", "Collaborative teams"),
            text: "Construction, media, and solar specialists can coordinate around one brief and one shared outcome.",
            color: "bg-[#F97316]"
          }, {
            icon: Lightbulb,
            title: content("about.what-sets-us-apart.4", "Practical innovation"),
            text: "We choose technology and creative approaches for their real-world value, not novelty alone.",
            color: "bg-[#9333EA]"
          }, {
            icon: Target,
            title: content("about.what-sets-us-apart.5", "Purposeful delivery"),
            text: "Every solution is shaped around your goals, constraints, users, and long-term success.",
            color: "bg-[#10B981]"
          }].map(a => <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm @min-[640px]/rdi:p-8" key={a.title}>
            <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl ${a.color}`}>
              <a.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="rdi-heading text-xl font-semibold text-white">
              {a.title}
            </h3>
            <p className="mt-3 leading-relaxed text-slate-300">
              {a.text}
            </p>
          </article>)}
        </div>
        <div className="mt-12 text-center">
          <WebsiteButton className="w-full bg-white px-7 py-6 font-semibold text-[#0F172A] hover:bg-slate-100 @min-[640px]/rdi:w-auto" asChild>
            <WebsiteLink href={content("about.what-sets-us-apart.6", "/contact")} className="w-full @min-[640px]/rdi:w-auto">
              {content("about.what-sets-us-apart.7", "Talk to Our Team")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </WebsiteLink>
          </WebsiteButton>
        </div>
      </div>
    </section></CmsSection>
  </>
}
