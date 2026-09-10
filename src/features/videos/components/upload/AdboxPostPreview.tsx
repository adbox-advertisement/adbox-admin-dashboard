import { type ReactNode, useState } from "react"
import { BatteryFull, ChevronLeft, ChevronRight, GraduationCap, Signal, Tag, Wifi } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { uploadSchools, type UploadSchoolId } from "../../data/schools"
import type { SelectedMediaFile } from "../../types/uploads"
import { ImagePreview } from "../shared/ImagePreview"

function PhoneFrame({ schoolId, children }: { schoolId: UploadSchoolId | undefined; children: ReactNode }) {
  const school = uploadSchools.find(({ id }) => id === schoolId)
  return (
    <div className="mx-auto w-full max-w-[300px]">
      <div className="relative aspect-[9/19.5] overflow-hidden rounded-[42px] border-[10px] border-grey-1000 bg-card text-foreground shadow-adbox-small ring-1 ring-grey-1000/15">
        <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 z-20 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-grey-1000" />
        <div className="absolute inset-0 flex flex-col overflow-y-auto">
          <div className="px-4 pb-3 pt-4">
            <div className="mb-4 flex items-center justify-between text-[10px] font-semibold"><span>9:41</span><span className="flex items-center gap-1.5"><Signal className="size-3" aria-hidden="true" /><Wifi className="size-3" aria-hidden="true" /><BatteryFull className="size-3.5" aria-hidden="true" /></span></div>
            <div className="flex items-center justify-between gap-2"><span className="font-heading text-xl font-semibold text-secondary">AdBox<span className="text-primary">.</span></span><span className="rounded-full bg-secondary/5 px-2.5 py-1 text-[10px] font-semibold text-secondary">Campus stories</span></div>
          </div>
          <div className="flex-1 border-t border-border/60 p-3 pb-8">
            <div className="mb-3 flex items-center gap-2.5"><span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-secondary/5 text-secondary"><GraduationCap className="size-4" aria-hidden="true" /></span><span className="font-heading text-xs font-semibold leading-5">{school?.name}</span></div>
            {children}
          </div>
        </div>
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-2 z-20 mx-auto h-1 w-24 rounded-full bg-grey-900" />
      </div>
    </div>
  )
}

export function AdboxPostPreview({ files, title, description }: { files: SelectedMediaFile[]; title: string; description: string }) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const index = Math.min(photoIndex, files.length - 1)
  const photo = files[index]
  if (!photo) return null

  return (
    <PhoneFrame schoolId={photo.schoolId}>
      {(title || description) && (
        <div className="mb-3 text-xs leading-6 [overflow-wrap:anywhere]">
          {title && <p className="mb-1 font-heading text-sm font-semibold" data-testid="preview-title">{title}</p>}
          {description && <p className="whitespace-pre-wrap text-muted-foreground" data-testid="preview-description">{description}</p>}
        </div>
      )}
      <div className="relative overflow-hidden rounded-2xl bg-muted">
        <ImagePreview src={photo.url} alt={"Post preview: " + photo.file.name} className="aspect-4/5 object-cover" />
        {files.length > 1 && <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-grey-1000/70 px-2 py-1 text-[10px] tabular-nums text-white">{index + 1}/{files.length}</span>}
      </div>
      {files.length > 1 && <div className="mt-2 flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" size="icon" aria-label="Previous preview photo" disabled={index === 0} onClick={() => setPhotoIndex(index - 1)} className="size-10 rounded-full"><ChevronLeft aria-hidden="true" /></Button>
        <span className="text-[10px] tabular-nums text-muted-foreground" aria-live="polite">{index + 1} of {files.length}</span>
        <Button type="button" variant="ghost" size="icon" aria-label="Next preview photo" disabled={index === files.length - 1} onClick={() => setPhotoIndex(index + 1)} className="size-10 rounded-full"><ChevronRight aria-hidden="true" /></Button>
      </div>}
    </PhoneFrame>
  )
}

export function AdboxTextPostPreview({ schoolId, text, reference }: { schoolId: UploadSchoolId; text: string; reference: string }) {
  return (
    <PhoneFrame schoolId={schoolId}>
      <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        {reference && (
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-md border border-secondary/20 bg-secondary/5 px-2 py-1 text-[10px] font-semibold text-secondary" data-testid="preview-reference">
            <Tag className="size-3" aria-hidden="true" />
            <span className="uppercase tracking-wide text-secondary/60">Ref</span>
            <span>{reference}</span>
          </span>
        )}
        <p className={cn("whitespace-pre-wrap text-xs leading-6 [overflow-wrap:anywhere]", !text && "text-muted-foreground")} data-testid="preview-text">{text || "Your text will appear here…"}</p>
      </div>
    </PhoneFrame>
  )
}
