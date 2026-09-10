import { CmsDialogContent } from "../components/CmsDialogContent"
import { useRef, useState } from "react"
import { Image, LoaderCircle, Search, Upload, Trash2, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { libraryAssets } from "../catalog"
import { useCmsStore } from "../store"
import { assertLibrarySpace, readImage } from "../lib/media"
import type { CmsAsset } from "../types"
import { CmsButton } from "../components/CmsButton"
import { ConfirmDialog } from "../components/ConfirmDialog"
export function CmsMediaPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("All images")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [selected, setSelected] = useState<CmsAsset | null>(null)
  const [removing, setRemoving] = useState<CmsAsset | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const draft = useCmsStore(state => state.draft)
  const assets = libraryAssets(draft.assets)
  const filtered = assets.filter(asset => (filter === "All images" || asset.category === filter) && `${asset.name} ${asset.alt}`.toLowerCase().includes(search.toLowerCase().trim()))
  const add = async (files: FileList | null) => {
    if (!files?.length)
      return
    setBusy(true)
    setError("")
    try {
      if (draft.assets.length + files.length > 50)
        throw new Error("Your library can hold up to 50 uploaded images.")
      const incoming = await Promise.all(Array.from(files).map(readImage))
      assertLibrarySpace(useCmsStore.getState().draft, incoming)
      useCmsStore.getState().change(current => ({ ...current, assets: [...incoming, ...current.assets] }))
    }
    catch (error) {
      setError(error instanceof Error ? error.message : "These images could not be added.")
    }
    finally {
      setBusy(false)
      if (input.current)
        input.current.value = ""
    }
  }
  const used = (asset: CmsAsset) => JSON.stringify({ values: draft.values, collections: draft.collections }).includes(`asset:${asset.id}`)
  return <div className="px-4 py-7 sm:px-7 sm:py-9 xl:px-9">
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue">
          Made to be seen
        </p>
        <h1 className="font-heading text-3xl font-semibold">
          Media library
        </h1>
        <p className="mt-2 text-sm text-grey-500">
          The images that bring your website to life, all together.
        </p>
      </div>
      <CmsButton variant="default" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}
        Add images
      </CmsButton>
    </div>
    <input ref={input} type="file" aria-label="Upload images" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="sr-only" onChange={event => void add(event.target.files)} />
    <div onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = "copy" }} onDrop={event => {
      event.preventDefault(); if (!busy)
        void add(event.dataTransfer.files)
    }} className="mb-7 flex flex-wrap items-center gap-4 rounded-2xl border border-dashed border-blue/25 bg-accent-background/40 p-5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue">
        <Image className="size-5" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold">
          A new look starts with a great image.
        </p>
        <p className="mt-1 text-xs leading-5 text-grey-500">
          Drop images here, or use Add images. JPG, PNG, WebP, GIF · up to 2 MB each.
        </p>
      </div>
      <span className="w-full text-xs text-grey-400 sm:w-auto">
        Stored in this browser
      </span>
    </div>
    {error && <p role="alert" className="mb-5 rounded-xl bg-error-100 p-4 text-sm text-error-700">
      {error}
    </p>}
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div role="group" aria-label="Filter media library" className="flex flex-wrap gap-2">
        {["All images", "Construction", "Media", "Solar", "Brand", "Uploads"].map(category => <button type="button" key={category} aria-pressed={filter === category} onClick={() => setFilter(category)} className={cn("rounded-full px-3.5 py-2 text-xs font-semibold transition-colors", filter === category ? "bg-grey-1000 text-white" : "bg-white text-grey-500 hover:bg-grey-100")}>
          {category}
        </button>)}
      </div>
      <div className="relative w-full sm:w-56">
        <Search className="absolute left-3.5 top-3 size-4 text-grey-400" />
        <Input aria-label="Search media library" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search images…" className="rounded-xl border-grey-200 bg-white pl-10 shadow-none" />
      </div>
    </div>
    <p role="status" className="mb-4 text-xs text-grey-400">
      {filtered.length} {filtered.length === 1 ? "image" : "images"}
    </p>
    <div className="grid grid-cols-1 gap-4 @min-[375px]/cms:grid-cols-2 @min-[640px]/cms:grid-cols-3 @min-[1024px]/cms:grid-cols-4">
      {filtered.map(asset => <button type="button" key={asset.id} aria-label={`Image details: ${asset.name}`} onClick={() => setSelected(asset)} className="group overflow-hidden rounded-2xl border border-grey-200 bg-white text-left transition-all hover:border-blue/30 hover:shadow-adbox-small">
        <div className="relative overflow-hidden bg-grey-100">
          <img src={asset.src} alt={asset.alt} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <span className="absolute bottom-2.5 left-2.5 rounded-md bg-white/90 px-2 py-1 text-[10px] font-semibold text-grey-600">
            {asset.category}
          </span>
        </div>
        <div className="p-3">
          <p className="truncate text-xs font-semibold">
            {asset.name}
          </p>
          <p className="mt-1 text-[10px] text-grey-400">
            {asset.addedAt ? "Added to your library" : "Website original"}
          </p>
        </div>
      </button>)}
    </div>
    {filtered.length === 0 && <div className="rounded-2xl border border-dashed border-grey-300 bg-white p-12 text-center">
      <Image className="mx-auto mb-4 size-8 text-grey-300" />
      <h2 className="font-heading text-xl font-semibold">
        Room for something new
      </h2>
      <p className="mt-2 text-sm text-grey-500">
        Add an image or try a different search.
      </p>
    </div>}
    {selected && <AssetDetails asset={selected} onClose={() => setSelected(null)} inUse={used(selected)} onRemove={() => { setRemoving(selected); setSelected(null) }} />}
    <ConfirmDialog open={removing !== null} onOpenChange={open => {
      if (!open)
        setRemoving(null)
    }} title="Remove this image?" description="This image is not used in your current draft. It will be removed from this browser’s library." action="Remove image" onConfirm={() => useCmsStore.getState().change(current => ({ ...current, assets: current.assets.filter(asset => asset.id !== removing?.id) }))} />
  </div>
}
function AssetDetails({ asset, onClose, inUse, onRemove }: {
  asset: CmsAsset
  onClose: () => void
  inUse: boolean
  onRemove: () => void
}) {
  const [name, setName] = useState(asset.name)
  const [alt, setAlt] = useState(asset.alt)
  const [error, setError] = useState("")
  const saveDetails = () => {
    const draft = useCmsStore.getState().draft
    const remaining = draft.assets.filter(item => item.id !== asset.id)
    const updated = { ...asset, name: name.trim(), alt }
    try {
      assertLibrarySpace({ ...draft, assets: remaining }, [updated])
      useCmsStore.getState().change(current => ({ ...current, assets: [updated, ...remaining] }))
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : "These details could not be saved.")
    }
  }
  return <Dialog open onOpenChange={open => {
    if (!open)
      onClose()
  }}>
    <CmsDialogContent className="max-w-xl">
      <DialogTitle>
        Image details
      </DialogTitle>
      <DialogDescription>
        Give this image a clear name so it’s easy to find.
      </DialogDescription>
      <img src={asset.src} alt={alt} className="max-h-64 w-full rounded-xl bg-grey-50 object-contain" />
      <label className="text-sm font-semibold">
        Image name
        <Input className="mt-2 rounded-xl" value={name} maxLength={200} onChange={event => setName(event.target.value)} />
      </label>
      <label className="text-sm font-semibold">
        Library description
        <Input className="mt-2 rounded-xl" value={alt} maxLength={500} onChange={event => setAlt(event.target.value)} />
        <span className="mt-1.5 block text-xs font-normal leading-5 text-grey-400">
          Describe what’s in this image to help you find it. Page editors have separate image descriptions for accessibility.
        </span>
      </label>
      {error && <p role="alert" className="text-sm text-error-700">{error}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {asset.addedAt ? <CmsButton disabled={inUse} title={inUse ? "Replace this image in your pages before removing it." : undefined} onClick={onRemove} className="text-error-700">
          <Trash2 className="size-4" />
          {inUse ? "Used in a page" : "Remove"}
        </CmsButton> : <span className="text-xs text-grey-400">
          Website original
        </span>}
        <CmsButton variant="default" disabled={!name.trim()} onClick={saveDetails}>
          <Check className="size-4" />
          Save details
        </CmsButton>
      </div>
    </CmsDialogContent>
  </Dialog>
}
