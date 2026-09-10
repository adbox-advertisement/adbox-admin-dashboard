import { CmsDialogContent } from "./CmsDialogContent"
import { useRef, useState } from "react"
import { Check, ImagePlus, LoaderCircle, Search, Upload } from "lucide-react"
import { Dialog, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { libraryAssets } from "../catalog"
import { useCmsStore } from "../store"
import { assertLibrarySpace, assetValue, readImage } from "../lib/media"
import type { CmsAsset } from "../types"
import { CmsButton } from "./CmsButton"
export function AssetPicker({ open, onOpenChange, value, onSelect }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onSelect: (asset: CmsAsset) => void
}) {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const uploaded = useCmsStore(state => state.draft.assets)
  const assets = libraryAssets(uploaded)
  const filtered = assets.filter(asset => `${asset.name} ${asset.category}`.toLowerCase().includes(search.toLowerCase()))
  const current = assets.find(asset => assetValue(asset) === (selected ?? value))
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <CmsDialogContent className="max-w-3xl gap-4 p-5 sm:p-7">
      <div className="pr-7">
        <DialogTitle>
          Choose an image
        </DialogTitle>
        <DialogDescription className="mt-2">
          Find the right image in your library, or add something new.
        </DialogDescription>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-3 size-4 text-grey-400" />
          <Input aria-label="Search image library" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search images…" className="rounded-xl pl-9" />
        </div>
        <CmsButton disabled={busy} onClick={() => input.current?.click()}>
          {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Add image
        </CmsButton>
      </div>
      <input ref={input} aria-label="Upload library image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={async (event) => {
        const file = event.target.files?.[0]
        if (!file)
          return
        setBusy(true)
        setError("")
        try {
          const asset = await readImage(file)
          assertLibrarySpace(useCmsStore.getState().draft, [asset])
          useCmsStore.getState().change(draft => ({ ...draft, assets: [asset, ...draft.assets] }))
          setSelected(assetValue(asset))
          setSearch("")
        }
        catch (error) {
          setError(error instanceof Error ? error.message : "This image could not be added.")
        }
        finally {
          setBusy(false)
          event.target.value = ""
        }
      }} />
      {error && <p role="alert" className="text-sm text-error-700">
        {error}
      </p>}
      <div className="grid max-h-[48svh] grid-cols-2 gap-3 overflow-y-auto p-1 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map(asset => <button type="button" key={asset.id} aria-label={`Select ${asset.name}`} aria-pressed={current?.id === asset.id} onClick={() => setSelected(assetValue(asset))} className={cn("relative overflow-hidden rounded-xl border-2 bg-grey-50 text-left outline-none transition-colors", current?.id === asset.id ? "border-blue" : "border-transparent hover:border-grey-300")}>
          <img src={asset.src} alt={asset.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
          <span className="block truncate bg-white px-2.5 py-2 text-xs text-grey-600">
            {asset.name}
          </span>
          {current?.id === asset.id && <span className="absolute right-2 top-2 rounded-full bg-blue p-1 text-white">
            <Check className="size-3" />
          </span>}
        </button>)}
      </div>
      {filtered.length === 0 && <div className="py-10 text-center text-sm text-grey-500">
        <ImagePlus className="mx-auto mb-3 size-8 text-grey-300" />
        No images found. Try another search.
      </div>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-grey-200 pt-4">
        <p className="text-xs text-grey-500">
          JPG, PNG, WebP, GIF · up to 2 MB
        </p>
        <div className="flex gap-2">
          <CmsButton onClick={() => onOpenChange(false)}>
            Cancel
          </CmsButton>
          <CmsButton variant="default" disabled={!current} onClick={() => {
            if (current) {
              onSelect(current)
              onOpenChange(false)
            }
          }}>
            Use image
            <Check className="size-4" />
          </CmsButton>
        </div>
      </div>
    </CmsDialogContent>
  </Dialog>
}
