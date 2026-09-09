import type { ReactNode } from "react"
import { ImageIcon, Play, Sparkles } from "lucide-react"

import { uploadSchools } from "../../data/schools"

export function VideoPageHero({ id, title, description, children }: {
  id: string
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <div className="video-reveal relative mb-8 isolate overflow-hidden rounded-3xl border border-secondary/10 bg-linear-to-br from-secondary/8 via-card to-primary/5 p-6 sm:p-8">
      <div className="relative z-10 max-w-xl xl:max-w-[60%]">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-secondary/10 bg-card/80 px-3 py-1.5 text-xs font-semibold text-secondary"><Sparkles className="size-3.5" aria-hidden="true" />Made for campus moments</span>
        <h2 id={id} className="font-heading text-3xl font-semibold leading-tight sm:text-4xl">{title}</h2>
        <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">{description}</p>
        {children && <div className="mt-6 flex flex-wrap items-center gap-3">{children}</div>}
      </div>
      <div className="pointer-events-none absolute right-8 top-1/2 hidden h-44 w-60 -translate-y-1/2 xl:block xl:right-12 xl:w-72" aria-hidden="true">
        <div className="absolute -left-6 top-5 h-36 w-44 -rotate-12 overflow-hidden rounded-2xl border-4 border-card bg-card shadow-adbox-medium"><img src={uploadSchools[1].image} alt="" className="size-full object-cover" /></div>
        <div className="absolute right-0 top-0 h-40 w-48 rotate-6 overflow-hidden rounded-2xl border-4 border-card bg-card shadow-adbox-medium"><img src={uploadSchools[0].image} alt="" className="size-full object-cover" /></div>
        <span className="absolute -right-4 -top-3 flex size-12 rotate-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-adbox-small"><Play className="size-6 fill-current" /></span>
        <span className="absolute -bottom-5 left-12 flex size-12 -rotate-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-adbox-small"><ImageIcon className="size-6" /></span>
      </div>
    </div>
  )
}
