import { useState } from "react"
import { BatteryFull, ChevronLeft, ChevronRight, GraduationCap, Signal, Wifi } from "lucide-react"

import { Button } from "@/components/ui/button"
import { uploadSchools } from "../../data/schools"
import type { SelectedMediaFile } from "../../types/uploads"
import { ImagePreview } from "../shared/ImagePreview"

export function AdboxPostPreview({ files, title, description }: { files: SelectedMediaFile[]; title: string; description: string }) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const index = Math.min(photoIndex, files.length - 1)
  const photo = files[index]
  const school = uploadSchools.find(({ id }) => id === photo?.schoolId)
  if (!photo) return null

  return (
    <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-[36px] border-[6px] border-grey-900 bg-card text-foreground shadow-adbox-small">
      <div className="px-4 pb-4 pt-3">
        <div className="mb-5 flex items-center justify-between text-[10px] font-semibold"><span>9:41</span><span className="flex gap-1.5"><Signal className="size-3" aria-hidden="true" /><Wifi className="size-3" aria-hidden="true" /><BatteryFull className="size-3.5" aria-hidden="true" /></span></div>
        <div className="flex items-center justify-between gap-2"><span className="font-heading text-xl font-semibold text-secondary">AdBox<span className="text-primary">.</span></span><span className="rounded-full bg-secondary/5 px-2.5 py-1 text-[10px] font-semibold text-secondary">Campus stories</span></div>
      </div>
      <div className="border-t border-border/60 p-3">
        <div className="mb-3 flex items-center gap-2.5"><span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-secondary/5 text-secondary"><GraduationCap className="size-4" aria-hidden="true" /></span><span className="font-heading text-xs font-semibold leading-5">{school?.name}</span></div>
        <div className="relative overflow-hidden rounded-2xl bg-muted">
          <ImagePreview src={photo.url} alt={"Post preview: " + photo.file.name} className="aspect-4/5 object-cover" />
          {files.length > 1 && <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-grey-1000/70 px-2 py-1 text-[10px] tabular-nums text-white">{index + 1}/{files.length}</span>}
        </div>
        {files.length > 1 && <div className="mt-2 flex items-center justify-between gap-2">
          <Button type="button" variant="ghost" size="icon" aria-label="Previous preview photo" disabled={index === 0} onClick={() => setPhotoIndex(index - 1)} className="size-10 rounded-full"><ChevronLeft aria-hidden="true" /></Button>
          <span className="text-[10px] tabular-nums text-muted-foreground" aria-live="polite">{index + 1} of {files.length}</span>
          <Button type="button" variant="ghost" size="icon" aria-label="Next preview photo" disabled={index === files.length - 1} onClick={() => setPhotoIndex(index + 1)} className="size-10 rounded-full"><ChevronRight aria-hidden="true" /></Button>
        </div>}
        {(title || description) && <div className="px-1 pb-3 pt-3 text-xs leading-6 [overflow-wrap:anywhere]">
          {title && <p className="mb-1 font-heading text-sm font-semibold" data-testid="preview-title">{title}</p>}
          {description && <p className="whitespace-pre-wrap text-muted-foreground" data-testid="preview-description">{description}</p>}
        </div>}
      </div>
      <div className="mx-auto mb-2 mt-3 h-1 w-24 rounded-full bg-grey-900" aria-hidden="true" />
    </div>
  )
}
