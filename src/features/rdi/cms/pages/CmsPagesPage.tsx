import { useState } from "react"
import { ArrowRight, ArrowUpRight, FileText, Search, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { cmsPages, cmsSections } from "../catalog"
import { useCmsStore } from "../store"
import { CmsButton } from "../components/CmsButton"
export function CmsPagesPage() {
  const [search, setSearch] = useState("")
  const hidden = useCmsStore(state => state.draft.hiddenSections)
  const filtered = cmsPages.filter(page => `${page.name} ${page.description}`.toLowerCase().includes(search.toLowerCase().trim()))
  return <div className="px-4 py-7 sm:px-7 sm:py-9 xl:px-9">
    <section className="relative mb-9 overflow-hidden rounded-3xl border border-blue/10 bg-accent-background p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-10 -top-16 size-64 rounded-full border-[36px] border-white/40" />
      <div className="relative flex flex-wrap items-center justify-between gap-6">
        <div className="max-w-lg">
          <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue">
            <Sparkles className="size-4" />
            Your story starts here
          </span>
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Your website, in one place.
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-grey-600">
            Keep your pages fresh, your images inspiring, and your story up to date. Small changes, beautifully made.
          </p>
        </div>
        <CmsButton variant="default" asChild className="h-11">
          <Link to="/rdi/pages/home">
            Edit your homepage
            <ArrowRight className="size-4" />
          </Link>
        </CmsButton>
      </div>
    </section>
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-heading text-2xl font-semibold">
          Website pages
          <span className="ml-2 align-middle font-sans text-sm font-medium text-grey-400">
            {cmsPages.length}
          </span>
        </h2>
        <p className="mt-1 text-sm text-grey-500">
          Choose a page to make it yours.
        </p>
      </div>
      <div className="relative w-full sm:w-64">
        <Search className="pointer-events-none absolute left-3.5 top-3 size-4 text-grey-400" />
        <Input aria-label="Search website pages" placeholder="Find a page…" value={search} onChange={event => setSearch(event.target.value)} className="h-10 rounded-xl border-grey-200 bg-white pl-10 shadow-none" />
      </div>
    </div>
    <div className="grid grid-cols-1 gap-6 @min-[640px]/cms:grid-cols-2 @min-[1024px]/cms:grid-cols-3">
      {filtered.map(page => {
        const sections = cmsSections.filter(section => section.page === page.id)
        return <article key={page.id} className="group overflow-hidden rounded-2xl border border-grey-200 bg-white transition-all hover:-translate-y-1 hover:border-blue/25 hover:shadow-adbox-small">
          <Link to={`/rdi/pages/${page.id}`} aria-label={`Edit ${page.name} page`} className="block">
            <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${page.theme}`}>
              <img src={page.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20 transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-x-4 top-3 flex items-center gap-1 border-b border-white/15 pb-2">
                <span className="size-1 rounded-full bg-white/60" />
                <span className="size-1 rounded-full bg-white/40" />
                <span className="size-1 rounded-full bg-white/25" />
                <span className="ml-auto text-[8px] tracking-wide text-white/60">
                  RICHDAD INVESTMENTS
                </span>
              </div>
              <p className="absolute bottom-6 left-6 whitespace-pre-line font-heading text-2xl font-semibold leading-tight text-white">
                {page.headline}
              </p>
              <span className="absolute bottom-6 right-5 flex size-8 items-center justify-center rounded-full border border-white/25 text-white transition-colors group-hover:bg-white/15">
                <ArrowUpRight className="size-4" />
              </span>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-heading text-lg font-semibold">
                  {page.name}
                </h3>
                {page.id === "home" && <span className="rounded-md bg-grey-100 px-2 py-1 text-[10px] font-semibold text-grey-500">
                  HOMEPAGE
                </span>}
              </div>
              <p className="mt-1 truncate text-xs text-grey-400">
                {page.path}
              </p>
              <p className="mt-4 min-h-10 text-sm leading-5 text-grey-500">
                {page.description}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-grey-100 pt-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-grey-500">
                  <FileText className="size-3.5" />
                  {sections.filter(section => !hidden.includes(section.id)).length} sections
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue">
                  Edit page
                  <ArrowRight className="size-3.5" />
                </span>
              </div>
            </div>
          </Link>
        </article>
      })}
    </div>
    {filtered.length === 0 && <div className="rounded-2xl border border-dashed border-grey-300 bg-white py-16 text-center">
      <Search className="mx-auto mb-4 size-8 text-grey-300" />
      <h3 className="font-heading text-xl font-semibold">
        No pages found
      </h3>
      <p className="mt-2 text-sm text-grey-500">
        Try another name or clear your search.
      </p>
      <CmsButton className="mt-5" onClick={() => setSearch("")}>
        Clear search
      </CmsButton>
    </div>}
    <p className="mt-7 text-sm text-grey-500">
      Your changes stay in this browser. You can export a backup in{" "}
      <Link to="/rdi/settings" className="font-medium text-blue underline-offset-4 hover:underline">
        Site settings
      </Link>
      .
    </p>
  </div>
}
