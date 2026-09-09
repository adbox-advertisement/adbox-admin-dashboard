import { Building, Film, Sun } from "lucide-react"
import type { RdiContentBlock, RdiPageContent } from "../../types"
import { RdiAction, RdiImage, RdiSection } from "./RdiPreviewPrimitives"
import { useRdiPreview } from "./RdiPreviewContext"

export function RdiLiveHome({ page, renderBlock }: { page: RdiPageContent; renderBlock: (block: RdiContentBlock) => React.ReactNode }) {
  const { settings } = useRdiPreview()
  return <div className="relative min-h-[var(--rdi-viewport-height)] overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] py-16">
    <div className="pointer-events-none absolute -left-20 -top-20 size-96 rounded-full bg-[#FFC107] opacity-5 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-20 -right-20 size-96 rounded-full bg-[#9C27B0] opacity-5 blur-3xl" />
    <div className="rdi-container relative px-4">
      {page.blocks.filter(block => block.visible).map(block => {
        if (block.id === "home-hero") {
          const start = block.title.indexOf(settings.siteName)
          return <RdiSection key={block.id} block={block} className="mb-10 text-center sm:mb-16">
            <h1 className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">{start < 0 ? block.title : <>{block.title.slice(0, start)}<span className="bg-gradient-to-r from-[#FB923C] via-[#FBBF24] to-[#34D399] bg-clip-text text-transparent">{settings.siteName}</span>{block.title.slice(start + settings.siteName.length)}</>}</h1>
            <p className="mx-auto mb-4 max-w-3xl text-xl text-[#94A3B8] md:text-2xl">{block.eyebrow}</p>
            <p className="mx-auto max-w-2xl text-lg text-[#64748B]">{block.description}</p>
          </RdiSection>
        }
        if (block.id === "home-divisions") return <RdiSection key={block.id} block={block}>
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
            {block.items?.filter(item => item.visible !== false).map((item, index) => {
              const Icon = [Building, Film, Sun][index % 3]
              const accent = ["#F97316", "#9C27B0", "#FBBF24"][index % 3]
              return <article key={item.id} style={{ "--division-accent": accent } as React.CSSProperties} className={`group relative overflow-hidden rounded-2xl border-2 border-[#334155] bg-gradient-to-br from-[#1E293B] to-[#0F172A] transition-all duration-500 hover:-translate-y-1 hover:border-[var(--division-accent)] hover:shadow-2xl ${index === 2 ? "md:col-span-2 md:w-[calc(50%_-_0.75rem)] md:justify-self-center xl:col-span-1 xl:w-auto" : ""}`}>
                <RdiImage media={item.media} className="absolute inset-0 h-full w-full opacity-20 transition-opacity group-hover:opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-transparent" />
                <div className="relative flex h-full min-h-[480px] flex-col justify-between p-6 sm:p-8 2xl:p-10">
                  <div>
                    <div className={`mb-6 flex size-20 items-center justify-center rounded-2xl ${index === 2 ? "bg-gradient-to-br from-[#FBBF24]/25 to-[#10B981]/20 text-[#FBBF24]" : index === 1 ? "bg-[#9C27B0] text-[#9C27B0]" : "bg-[#F97316]/20 text-[#FB923C]"}`}><Icon className="size-10" /></div>
                    <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">{item.title}</h2>
                    <div className={`mb-6 h-1 w-20 transition-all group-hover:w-32 ${index === 2 ? "bg-gradient-to-r from-[#FBBF24] to-[#10B981]" : "bg-[var(--division-accent)]"}`} />
                    <p className="mb-8 text-lg text-[#94A3B8]">{item.description}</p>
                    <ul className="mb-8 space-y-3">{item.features?.map((feature, i) => <li key={i} className="flex items-center text-[#CBD5E1]"><span className={`mr-3 size-2 shrink-0 rounded-full ${index === 2 ? "bg-[#10B981]" : "bg-[var(--division-accent)]"}`} />{feature}</li>)}</ul>
                  </div>
                  <RdiAction label={item.buttonLabel} href={item.buttonHref} className={`min-h-10 w-full translate-y-2 rounded-xl bg-[var(--division-accent)] px-4 py-2 text-lg group-hover:translate-y-0 hover:bg-[var(--division-accent)] [&_svg]:size-4 ${index === 2 ? "text-[#0F172A]" : "text-white"}`} />
                </div>
              </article>
            })}
          </div>
        </RdiSection>
        if (block.id === "home-cta") return <RdiSection key={block.id} block={block} className="mt-16 text-center"><p className="mb-4 text-[#64748B]">{block.title}</p>{block.description ? <p className="mb-4 text-[#94A3B8]">{block.description}</p> : null}<RdiAction label={block.buttonLabel} href={block.buttonHref} className="min-h-10 rounded-lg bg-[#334155] px-8 py-2 text-sm font-medium text-white hover:bg-[#475569] [&_svg]:hidden" /></RdiSection>
        return renderBlock(block)
      })}
    </div>
  </div>
}
