import { useId, useRef, useState } from "react"
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ArrowLeft, ArrowRight, Eye, GripVertical, Hash, Plus, Send, Smartphone, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { SelectedMediaFile } from "../../types/uploads"
import { AdboxPostPreview } from "./AdboxPostPreview"
import { ImagePreview } from "../shared/ImagePreview"

function SortablePhoto({ entry, index, count, onRemove, onMove }: {
  entry: SelectedMediaFile
  index: number
  count: number
  onRemove: () => void
  onMove: (index: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: entry.id })
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.45 : 1 }} className="relative min-w-0 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative aspect-square bg-muted">
        <ImagePreview src={entry.url} alt={entry.file.name} className="aspect-square object-cover" />
        <span className="pointer-events-none absolute left-2 top-2 rounded-lg bg-grey-1000/75 px-2 py-1 text-[10px] font-semibold text-white">{index === 0 ? "Cover" : index + 1}</span>
        <Button type="button" size="icon-sm" className="absolute right-2 top-2 size-8 rounded-full bg-grey-1000/75 text-white hover:bg-destructive" aria-label={"Remove " + entry.file.name} onClick={onRemove}><X aria-hidden="true" /></Button>
      </div>
      <div className="grid grid-cols-3 gap-0.5 px-1 py-1">
        <Button type="button" size="icon-sm" variant="ghost" className="h-11 w-full" aria-label={"Move " + entry.file.name + " earlier"} disabled={index === 0} onClick={() => onMove(index - 1)}><ArrowLeft aria-hidden="true" /></Button>
        <Button type="button" size="icon-sm" variant="ghost" data-cursor="grab" className="h-11 w-full touch-none" {...attributes} {...listeners} aria-label={"Reorder " + entry.file.name}><GripVertical aria-hidden="true" /></Button>
        <Button type="button" size="icon-sm" variant="ghost" className="h-11 w-full" aria-label={"Move " + entry.file.name + " later"} disabled={index === count - 1} onClick={() => onMove(index + 1)}><ArrowRight aria-hidden="true" /></Button>
      </div>
    </div>
  )
}

export function PhotoComposer({ files, onAdd, onRemove, onReorder, onDiscard }: {
  files: SelectedMediaFile[]
  onAdd: () => void
  onRemove: (id: string) => void
  onReorder: (files: SelectedMediaFile[]) => void
  onDiscard: () => void
}) {
  const formId = useId()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [reordering, setReordering] = useState(false)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  function insertHashtag() {
    const field = descriptionRef.current
    const start = field?.selectionStart ?? description.length
    const end = field?.selectionEnd ?? start
    const prefix = start > 0 && !/\s/.test(description[start - 1]) ? " #" : "#"
    const next = description.slice(0, start) + prefix + description.slice(end)
    if (next.length > 4000) return
    setDescription(next)
    requestAnimationFrame(() => { field?.focus(); field?.setSelectionRange(start + prefix.length, start + prefix.length) })
  }

  return (
    <div className="video-composer video-reveal" data-reordering={reordering}>
      <div className="min-w-0">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="font-heading text-xl font-semibold">Create photo post</h3><p className="mt-1.5 text-xs leading-5 text-muted-foreground">A few photos. One great story.</p></div>
          <Dialog>
            <DialogTrigger asChild><Button type="button" variant="outline" className="video-preview-trigger h-11 rounded-xl px-3"><Eye className="size-4" aria-hidden="true" />Preview</Button></DialogTrigger>
            <DialogContent className="video-management-ui rounded-3xl">
              <DialogTitle>Post preview</DialogTitle>
              <DialogDescription className="sr-only">See how your photos and caption look on AdBox.</DialogDescription>
              <AdboxPostPreview files={files} title={title} description={description} />
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3"><label htmlFor={formId + "-title"} className="text-sm font-semibold">Post title</label><span id={formId + "-title-count"} className="text-xs tabular-nums text-muted-foreground">{title.length}/90</span></div>
            <Input id={formId + "-title"} autoFocus maxLength={90} placeholder="Give your story a title" value={title} onChange={(event) => setTitle(event.target.value)} className="h-12 rounded-xl border-border px-3.5" aria-describedby={formId + "-title-count"} />
          </div>
          <div>
            <label htmlFor={formId + "-description"} className="mb-2 block text-sm font-semibold">Post description</label>
            <div className="overflow-hidden rounded-xl border border-border bg-card focus-within:border-secondary focus-within:shadow-adbox-focus-secondary">
              <Textarea ref={descriptionRef} id={formId + "-description"} maxLength={4000} placeholder="Tell the story behind your photos…" value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-36 resize-y rounded-none border-0 px-3.5 py-3 focus-visible:shadow-none" aria-describedby={formId + "-description-count"} />
              <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-muted/30 px-2 py-1.5">
                <Button type="button" variant="ghost" onClick={insertHashtag} disabled={description.length >= 4000} className="h-10 rounded-lg text-xs text-secondary"><Hash aria-hidden="true" />Add hashtag</Button>
                <span id={formId + "-description-count"} className="pr-2 text-xs tabular-nums text-muted-foreground">{description.length}/4000</span>
              </div>
            </div>
          </div>
        </div>
        <section aria-label="Selected photos" className="mt-6">
          <div className="flex items-center justify-between gap-3"><h3 className="font-heading text-base font-semibold">Your photos</h3><span className="rounded-lg bg-secondary/5 px-2 py-1 text-xs font-medium tabular-nums text-secondary">{files.length}/35</span></div>
          <p className="mb-4 mt-2 text-xs leading-6 text-muted-foreground">Drag the handles or use the arrows to reorder. Your first photo is the cover.</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={() => setReordering(true)} onDragCancel={() => setReordering(false)} onDragEnd={({ active, over }) => {
            setReordering(false)
            if (over && active.id !== over.id) onReorder(arrayMove(files, files.findIndex((entry) => entry.id === active.id), files.findIndex((entry) => entry.id === over.id)))
          }}>
            <SortableContext items={files.map(({ id }) => id)} strategy={rectSortingStrategy}>
              <div className="video-photo-grid grid grid-cols-2 gap-3">
                {files.map((entry, index) => <SortablePhoto key={entry.id} entry={entry} index={index} count={files.length} onRemove={() => onRemove(entry.id)} onMove={(target) => onReorder(arrayMove(files, index, target))} />)}
                {files.length < 35 && <button type="button" onClick={onAdd} className="group/add flex min-h-36 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-secondary/20 bg-secondary/3 text-secondary outline-none transition-colors hover:border-secondary/50 hover:bg-secondary/8 focus-visible:shadow-adbox-focus-secondary"><span className="flex size-10 items-center justify-center rounded-full bg-secondary/8 transition-transform group-hover/add:rotate-90 motion-reduce:transform-none"><Plus className="size-6" aria-hidden="true" /></span><span className="text-xs font-semibold">Add photos</span></button>}
              </div>
            </SortableContext>
          </DndContext>
        </section>
        <div className="mt-6 border-t border-border pt-5">
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" disabled aria-describedby={formId + "-post-status"} className="h-11 min-w-32 rounded-xl"><Send aria-hidden="true" />Post</Button>
            <Button type="button" variant="ghost" onClick={onDiscard} className="h-11 rounded-xl px-4 text-muted-foreground">Discard</Button>
          </div>
          <p id={formId + "-post-status"} className="mt-3 text-xs leading-6 text-muted-foreground">Photos stay on this device. Posting will be available when uploads are connected.</p>
        </div>
      </div>
      <aside aria-label="AdBox mobile preview" className="video-inline-preview min-w-0">
        <div className="mb-4 flex items-center justify-between gap-2"><h3 className="font-heading text-base font-semibold">Live preview</h3><Smartphone className="size-4 text-secondary" aria-hidden="true" /></div>
        <AdboxPostPreview files={files} title={title} description={description} />
      </aside>
    </div>
  )
}
