import { useEffect, useState } from "react"
import { ArrowLeft, ArrowUpRight, Check, Eye, EyeOff, LayoutTemplate, Redo2, RotateCcw, Save, Search, Undo2 } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cmsCollections, cmsPages, cmsSections } from "../catalog"
import { useCmsStore } from "../store"
import { CmsButton } from "../components/CmsButton"
import { ContentField } from "../components/ContentField"
import { CollectionEditor } from "../components/CollectionEditor"
import { PreviewPane } from "../components/PreviewPane"
import { ConfirmDialog } from "../components/ConfirmDialog"
import { SaveIndicator } from "../components/SaveIndicator"
export function CmsEditorPage() {
  const { pageId } = useParams()
  const page = cmsPages.find(page => page.id === pageId)
  if (!page)
    throw new Response(null, { status: 404 })
  return <PageEditor key={page.id} page={page} />
}
function PageEditor({ page }: {
  page: (typeof cmsPages)[number]
}) {
  const sections = cmsSections.filter(section => section.page === page.id)
  const [sectionId, setSectionId] = useState(sections[0].id)
  const [reset, setReset] = useState(false)
  const draft = useCmsStore(state => state.draft)
  const canUndo = useCmsStore(state => state.past.length > 0)
  const canRedo = useCmsStore(state => state.future.length > 0)
  const section = sections.find(section => section.id === sectionId) ?? sections[0]
  const visible = !draft.hiddenSections.includes(section.id)
  const collections = cmsCollections.filter(collection => collection.section === section.id)
  const seo = draft.seo[page.id] ?? { title: `${page.name} | RichDad Investments`, description: page.description }
  useEffect(() => {
    const save = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault()
        useCmsStore.getState().save()
      }
    }
    window.addEventListener("keydown", save)
    return () => window.removeEventListener("keydown", save)
  }, [])
  const changeField = (id: string, value: string) => useCmsStore.getState().change(current => ({ ...current, values: { ...current.values, [id]: value } }))
  return <div className="px-4 py-6 sm:px-7 xl:px-9">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <Link to="/rdi" className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-grey-500 hover:text-blue">
          <ArrowLeft className="size-3.5" />
          All pages
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
            {page.name}
          </h1>
          <span className="rounded-lg bg-grey-100 px-2.5 py-1 font-mono text-xs text-grey-500">
            {page.path}
          </span>
        </div>
        <div className="mt-2">
          <SaveIndicator />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="mr-1 flex gap-1">
          <CmsButton className="size-9 p-0" aria-label="Undo change" title="Undo change" disabled={!canUndo} onClick={() => useCmsStore.getState().undo()}>
            <Undo2 className="size-4" />
          </CmsButton>
          <CmsButton className="size-9 p-0" aria-label="Redo change" title="Redo change" disabled={!canRedo} onClick={() => useCmsStore.getState().redo()}>
            <Redo2 className="size-4" />
          </CmsButton>
        </div>
        <CmsButton asChild>
          <Link to={`/rdi/preview/${page.id}`} target="_blank" rel="noreferrer">
            <Eye className="size-4" />
            Preview
          </Link>
        </CmsButton>
        <CmsButton variant="default" onClick={() => useCmsStore.getState().save()}>
          <Save className="size-4" />
          Save draft
        </CmsButton>
      </div>
    </div>
    <div className="cms-editor-grid items-start">
      <aside className="min-w-0 rounded-2xl border border-grey-200 bg-white p-3 @min-[880px]/cms:sticky @min-[880px]/cms:top-5">
        <p className="px-2 pb-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-grey-400">
          On this page
        </p>
        <div className="@min-[880px]/cms:hidden">
          <Select value={section.id} onValueChange={setSectionId}>
            <SelectTrigger className="w-full" aria-label="Choose page section">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sections.map(section => <SelectItem key={section.id} value={section.id}>
                {section.label}
              </SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <nav aria-label="Page sections" className="hidden space-y-1 @min-[880px]/cms:block">
          {sections.map((item, index) => <button type="button" key={item.id} onClick={() => setSectionId(item.id)} aria-current={section.id === item.id ? "true" : undefined} className={cn("flex w-full items-center gap-2 rounded-xl px-2.5 py-3 text-left text-xs font-medium transition-colors", section.id === item.id ? "bg-blue/8 text-blue" : "text-grey-500 hover:bg-grey-50 hover:text-grey-900")}>
            <span className="text-[10px] opacity-50">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1">
              {item.label}
            </span>
            {draft.hiddenSections.includes(item.id) ? <EyeOff className="size-3 shrink-0" /> : section.id === item.id ? <span className="size-1.5 rounded-full bg-blue" /> : null}
          </button>)}
        </nav>
        <div className="mt-4 hidden rounded-xl bg-grey-50 p-3 text-xs leading-5 text-grey-500 @min-[880px]/cms:block">
          <LayoutTemplate className="mb-2 size-4 text-blue" />
          Your layout stays consistent while you focus on the words and images.
        </div>
      </aside>
      <section className="min-w-0 overflow-hidden rounded-2xl border border-grey-200 bg-white">
        <Tabs defaultValue="content">
          <TabsList className="gap-5 px-5">
            <TabsTrigger value="content">
              <LayoutTemplate className="size-3.5" />
              Content
            </TabsTrigger>
            <TabsTrigger value="seo">
              <Search className="size-3.5" />
              Search settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="content">
            <div className="border-b border-grey-100 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-grey-400">
                    Page section
                  </p>
                  <h2 className="mt-1 font-heading text-xl font-semibold">
                    {section.label}
                  </h2>
                </div>
                <button type="button" role="switch" aria-checked={visible} aria-label={`Show ${section.label} section`} onClick={() => useCmsStore.getState().change(current => ({ ...current, hiddenSections: visible ? [...current.hiddenSections, section.id] : current.hiddenSections.filter(id => id !== section.id) }))} className={cn("relative mt-1 h-6 w-10 shrink-0 rounded-full transition-colors", visible ? "bg-blue" : "bg-grey-300")}>
                  <span className={cn("absolute top-0.5 size-5 rounded-full bg-white transition-transform", visible ? "left-0.5 translate-x-4" : "left-0.5")} />
                </button>
              </div>
              <p className="mt-2 text-xs leading-5 text-grey-500">
                {visible ? "Update this section. Your preview will follow along." : "This section is hidden from the website preview."}
              </p>
            </div>
            <div key={section.id} className="space-y-6 p-5">
              {section.fields.map(field => <ContentField key={field.id} field={field} value={draft.values[field.id] ?? field.value} onChange={value => changeField(field.id, value)} />)}
              {collections.map(collection => <div key={collection.id} className="border-t border-grey-100 pt-6">
                <CollectionEditor definition={collection} />
              </div>)}
            </div>
            <div className="border-t border-grey-100 p-4">
              <button type="button" className="inline-flex items-center gap-1.5 text-xs text-grey-400 hover:text-grey-800" onClick={() => setReset(true)}>
                <RotateCcw className="size-3.5" />
                Restore original section
              </button>
            </div>
          </TabsContent>
          <TabsContent value="seo" className="space-y-6 p-5">
            <div>
              <h2 className="font-heading text-xl font-semibold">
                Help people find this page
              </h2>
              <p className="mt-2 text-xs leading-5 text-grey-500">
                Set the title and description used in your page preview and content backup.
              </p>
            </div>
            <ContentField field={{ id: "seo-title", label: "Page title", kind: "text", value: "" }} value={seo.title} onChange={title => useCmsStore.getState().change(current => ({ ...current, seo: { ...current.seo, [page.id]: { ...seo, title: title.slice(0, 150) } } }))} />
            <ContentField field={{ id: "seo-description", label: "Page description", kind: "textarea", value: "" }} value={seo.description} onChange={description => useCmsStore.getState().change(current => ({ ...current, seo: { ...current.seo, [page.id]: { ...seo, description: description.slice(0, 500) } } }))} />
            <div className="rounded-xl border border-grey-200 bg-grey-50 p-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-grey-400">
                Search preview
              </p>
              <p className="truncate text-xs text-grey-500">
                richdadinvestments.org
                {page.path === "/" ? "" : page.path}
              </p>
              <p className="mt-1 break-words text-lg text-blue">
                {seo.title}
              </p>
              <p className="mt-1 break-words text-xs leading-5 text-grey-600">
                {seo.description}
              </p>
            </div>
            <p className="inline-flex items-start gap-2 text-xs leading-5 text-grey-400">
              <Check className="mt-0.5 size-3.5 shrink-0" />
              These settings are part of your local draft. Nothing is published online.
            </p>
          </TabsContent>
        </Tabs>
      </section>
      <aside className="cms-preview-column sticky top-5 min-w-0">
        <PreviewPane pageId={page.id} section={section.id} />
        <Link to={`/rdi/preview/${page.id}`} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-1.5 text-xs text-grey-500 hover:text-blue">
          Open a larger preview
          <ArrowUpRight className="size-3.5" />
        </Link>
      </aside>
    </div>
    <ConfirmDialog open={reset} onOpenChange={setReset} title="Restore this section?" description="The original words and images will replace this section’s edits. You can undo this change." action="Restore section" onConfirm={() => useCmsStore.getState().change(current => ({ ...current, values: Object.fromEntries(Object.entries(current.values).filter(([key]) => !section.fields.some(field => field.id === key))), collections: Object.fromEntries(Object.entries(current.collections).filter(([key]) => !collections.some(collection => collection.id === key))), hiddenSections: current.hiddenSections.filter(id => id !== section.id) }))} />
  </div>
}
