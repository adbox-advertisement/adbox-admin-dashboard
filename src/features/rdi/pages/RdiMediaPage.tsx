import { useCmsText, useCmsCollection } from "../cms/use-cms-content"
import { CmsSection } from "../cms/components/CmsSection"
import { mediaCategories, mediaProjects as defaultMediaProjects, type MediaProject } from "../data/media"
import { useRef, useState } from "react"
import { Award, Play, TrendingUp, Users } from "lucide-react"
import { WebsiteLink } from "../components/shared/WebsiteLink"
import { MediaProjectDialog } from "../components/media/MediaProjectDialog"

export const RdiMediaPage = () => {
  const content = useCmsText()
  const mediaProjects = useCmsCollection("media-projects", defaultMediaProjects)
  const projectTrigger = useRef<HTMLElement | null>(null)
  const [selectedProject, setSelectedProject] = useState<MediaProject | null>(null)
  const [activeCategory, setActiveCategory] = useState("all")
  const [hoveredProject, setHoveredProject] = useState<number | null>(null)
  const filteredProjects = activeCategory === "all" ? mediaProjects : mediaProjects.filter(m => m.category === activeCategory)
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <CmsSection id="media.introduction"><section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[url('/rdi-assets/media/photo-1492724441997-5dc865305da7-1600.jpg')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900" />
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <div className="inline-block mb-6 animate-pulse">
          <div className="bg-purple-500/20 backdrop-blur-sm border border-purple-500/50 rounded-full px-6 py-2">
            <span className="text-purple-300 font-semibold">
              {content("media.introduction.1", "Award-Winning Media Production")}
            </span>
          </div>
        </div>
        <h1 className="mb-6 text-4xl font-bold leading-tight text-white @min-[640px]/rdi:text-5xl @min-[768px]/rdi:text-7xl @min-[1024px]/rdi:text-8xl">
          {content("media.introduction.2", "Stories That")}
          <span className="block bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
            {content("media.introduction.3", "Move People")}
          </span>
        </h1>
        <p className="text-xl @min-[768px]/rdi:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
          {content("media.introduction.4", "We create stunning visual content that captivates audiences and drives results")}
        </p>
        <div className="mt-14 grid grid-cols-2 gap-6 @min-[640px]/rdi:gap-8 @min-[768px]/rdi:mt-20 @min-[768px]/rdi:grid-cols-4">
          {[{
            icon: Award,
            label: content("media.introduction.5", "Industry Awards"),
            value: content("media.introduction.6", "24+")
          }, {
            icon: Users,
            label: content("media.introduction.7", "Happy Clients"),
            value: content("media.introduction.8", "150+")
          }, {
            icon: TrendingUp,
            label: content("media.introduction.9", "Projects Delivered"),
            value: content("media.introduction.10", "500+")
          }, {
            icon: Play,
            label: content("media.introduction.11", "Total Views"),
            value: content("media.introduction.12", "50M+")
          }].map((m, x) => <div className="text-center" key={x}>
            <m.icon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">
              {m.value}
            </div>
            <div className="text-gray-400 text-sm">
              {m.label}
            </div>
          </div>)}
        </div>
      </div>
    </section></CmsSection>
    <CmsSection id="media.featured-work"><section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="mb-4 text-3xl font-bold text-white @min-[640px]/rdi:text-4xl @min-[768px]/rdi:text-5xl">
            {content("media.featured-work.1", "Featured Work")}
          </h2>
          <p className="text-xl text-gray-400">
            {content("media.featured-work.2", "Explore our latest creative projects")}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mb-16" role="group" aria-label="Filter media projects">
          {mediaCategories.map(m => <button type="button" aria-pressed={activeCategory === m.id} aria-controls="media-project-grid" onClick={() => setActiveCategory(m.id)} className={`px-6 py-3 rounded-full font-medium transition-all ${activeCategory === m.id ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50" : "bg-white/10 text-gray-300 hover:bg-white/20"}`} key={m.id}>
            {m.label}
          </button>)}
        </div>
        <div id="media-project-grid" className="grid grid-cols-1 @min-[768px]/rdi:grid-cols-2 @min-[1024px]/rdi:grid-cols-3 gap-8">
          {filteredProjects.map(m => <div className="group relative cursor-pointer" onMouseEnter={() => setHoveredProject(m.id)} onMouseLeave={() => setHoveredProject(null)} onFocus={() => setHoveredProject(m.id)} onBlur={() => setHoveredProject(null)} onClick={event => {
            projectTrigger.current = event.currentTarget
            setSelectedProject(m)
          }} onKeyDown={event => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              projectTrigger.current = event.currentTarget
              setSelectedProject(m)
            }
          }} role="button" tabIndex={0} aria-label={`View ${m.title} project details`} key={m.id}>
            <div className="rdi-project-image relative overflow-hidden rounded-2xl aspect-[4/3] bg-slate-800">
              <img src={m.image} alt={m.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
              <div className={`rdi-project-overlay absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent transition-opacity duration-300 ${hoveredProject === m.id ? "opacity-100" : "opacity-0"}`}>
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="transform translate-y-4 group-hover:translate-y-0 group-focus:translate-y-0 transition-transform duration-300">
                    <div className="flex gap-2 mb-3">
                      {m.tags.slice(0, 2).map((x, w) => <span className="bg-purple-500/20 backdrop-blur-sm text-purple-300 px-3 py-1 rounded-full text-xs" key={w}>
                        {x}
                      </span>)}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {m.title}
                    </h3>
                    <p className="text-gray-300 mb-4">
                      {m.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400 text-sm">
                        {m.client}
                      </span>
                      {m.video && <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Play className="w-5 h-5 text-white" />
                      </div>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-4 right-4">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  {m.year}
                </div>
              </div>
            </div>
          </div>)}
        </div>
      </div>
    </section></CmsSection>
    <MediaProjectDialog project={selectedProject} onClose={() => setSelectedProject(null)} returnFocus={projectTrigger} />
    <CmsSection id="media.get-in-touch"><section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-3xl p-6 @min-[640px]/rdi:p-12 border border-purple-500/20">
          <h2 className="mb-6 text-3xl font-bold text-white @min-[640px]/rdi:text-4xl @min-[768px]/rdi:text-5xl">
            {content("media.get-in-touch.1", "Let's Create Something Amazing")}
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            {content("media.get-in-touch.2", "Ready to bring your vision to life? Get in touch with our creative team today.")}
          </p>
          <WebsiteLink href={content("media.get-in-touch.3", "/contact")} className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-12 py-4 text-lg font-semibold text-white shadow-lg shadow-purple-500/50 transition-all hover:scale-105 hover:from-purple-500 hover:to-pink-500">
            {content("media.get-in-touch.4", "Get Started")}
          </WebsiteLink>
        </div>
      </div>
    </section></CmsSection>
  </div>
}
