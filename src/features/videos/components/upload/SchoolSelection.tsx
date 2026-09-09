import { useId, useState } from "react"
import { ArrowRight, Eye, FolderOpen, GraduationCap, Search, SearchX, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { uploadSchools, type UploadSchoolId } from "../../data/schools"
import { UploadSteps } from "./UploadSteps"
import { VideoPageHero } from "../shared/VideoPageHero"

export function SchoolSelection({ onSelect }: { onSelect: (id: UploadSchoolId) => void }) {
  const [query, setQuery] = useState("")
  const searchId = useId()
  const schools = uploadSchools.filter((school) => (school.name + " " + school.initials).toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <section aria-labelledby="school-selection-title" className="pb-4">
      <VideoPageHero id="school-selection-title" title="Create something worth sharing." description="A campus moment, a fresh idea, a story to tell. Give your videos and photos a home on AdBox.">
        <UploadSteps step={1} />
      </VideoPageHero>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="font-heading text-h5 font-semibold leading-7">Choose your school</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">Select the campus this content belongs to.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <label htmlFor={searchId} className="sr-only">Search schools</label>
          <Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-muted-foreground" aria-hidden="true" />
          <Input id={searchId} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find your school…" className="h-11 rounded-xl border-border bg-card pl-10 pr-11" />
          {query && <button type="button" aria-label="Clear school search" onClick={() => setQuery("")} className="absolute right-0 top-0 flex size-11 items-center justify-center rounded-xl text-muted-foreground outline-none focus-visible:shadow-adbox-focus-secondary"><X className="size-4" aria-hidden="true" /></button>}
        </div>
      </div>
      <p role="status" className="sr-only">{schools.length} schools found</p>
      <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-4 md:grid-cols-6 xl:grid-cols-12">
        {schools.map((school, index) => (
          <button key={school.id} data-school-choice={school.id} type="button" onClick={() => onSelect(school.id)} aria-label={"Upload for " + school.name} className="video-lift group flex min-w-0 flex-row items-center overflow-hidden rounded-3xl border border-border/70 bg-card text-left outline-none hover:border-secondary/30 hover:shadow-adbox-medium focus-visible:shadow-adbox-focus-secondary min-[480px]:col-span-2 min-[480px]:flex-col min-[480px]:items-stretch md:col-span-3 xl:col-span-4">
            <div className="relative ml-3 size-24 shrink-0 overflow-hidden rounded-2xl bg-secondary/5 min-[480px]:mx-3 min-[480px]:mt-3 min-[480px]:aspect-16/10 min-[480px]:h-auto min-[480px]:w-auto" aria-hidden="true">
              <img src={school.image} alt="" width={960} height={640} loading={index < 3 ? "eager" : "lazy"} decoding="async" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none" />
              <span className="absolute left-2 top-2 rounded-lg border border-card/60 bg-card/90 px-2 py-1 font-heading text-xs font-semibold text-secondary backdrop-blur-sm min-[480px]:left-3 min-[480px]:top-3">{school.initials}</span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col p-4 min-[480px]:px-5 min-[480px]:pb-5">
              <h4 className="font-heading text-base font-semibold leading-6 min-[480px]:min-h-12 min-[480px]:text-lg">{school.name}</h4>
              <span className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5"><GraduationCap className="size-3.5 shrink-0" aria-hidden="true" />Select school</span>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary/5 text-secondary transition-colors group-hover:bg-secondary group-hover:text-secondary-foreground"><ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" /></span>
              </span>
            </div>
          </button>
        ))}
        {!query.trim() && <div className="flex flex-col justify-center rounded-3xl border border-secondary/10 bg-linear-to-br from-secondary/5 to-primary/5 p-6 min-[480px]:col-span-2 md:col-span-3 xl:col-span-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-secondary">From idea to preview</p>
          <h4 className="font-heading text-2xl font-semibold leading-8">A home for every story.</h4>
          <div className="mt-6 space-y-4">
            {[{ icon: FolderOpen, title: "Keep it together", detail: "Choose a folder for related content." }, { icon: Upload, title: "Drop in your media", detail: "Add videos or build a photo story." }, { icon: Eye, title: "See it come to life", detail: "Arrange, write, and preview." }].map(({ icon: Icon, title, detail }) => <div key={title} className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-card text-secondary"><Icon className="size-4" aria-hidden="true" /></span><div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p></div></div>)}
          </div>
        </div>}
      </div>
      {schools.length === 0 && <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center"><SearchX className="mx-auto mb-4 size-8 text-secondary" aria-hidden="true" /><h3 className="font-heading text-xl font-semibold">No schools found</h3><p className="mt-2 text-sm text-muted-foreground">Try the school name or its initials.</p><Button variant="secondary" onClick={() => setQuery("")} className="mt-5 h-11 rounded-xl px-5">Clear search</Button></div>}
    </section>
  )
}
