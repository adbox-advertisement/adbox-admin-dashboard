import { useState, type DragEvent, type ReactNode } from "react"
import { ChevronLeft, ChevronRight, Clapperboard, ImagePlus, Loader2, RefreshCw, Smartphone, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "../../lib/cn"
import { moveItem } from "../../lib/composer"
import {
  IMAGE_TYPES,
  MAX_IMAGES,
  VIDEO_TYPES,
  formatBytes,
  formatDuration,
  isShort,
  prepareImage,
  prepareVideo,
  type PreparedImage,
  type PreparedVideo,
} from "../../lib/media"
import { Pill } from "../StudioBits"
import { ink, muted } from "../tokens"

const reason = (error: unknown) => (error instanceof Error ? error.message : "It couldn't be read.")

/** A place to drop files, or press to choose them. */
function DropZone({ accept, multiple, disabled, busy, onFiles, icon, title, hint }: {
  accept: readonly string[]
  multiple?: boolean
  disabled?: boolean
  busy?: boolean
  onFiles: (files: File[]) => void
  icon: ReactNode
  title: string
  hint: ReactNode
}) {
  const [over, setOver] = useState(false)
  const drop = (event: DragEvent) => {
    event.preventDefault()
    setOver(false)
    if (!disabled) onFiles([...event.dataTransfer.files])
  }
  return <label onDragOver={(event) => { event.preventDefault(); if (!disabled) setOver(true) }} onDragLeave={() => setOver(false)} onDrop={drop}
    className={cn("group relative flex min-h-44 flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border-2 border-dashed px-6 py-8 text-center transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-purple has-[:focus-visible]:ring-offset-2",
      over ? "border-purple bg-purple/5 dark:border-royal-300 dark:bg-royal-500/10" : "border-grey-200 bg-grey-50/60 hover:border-purple/50 dark:border-border dark:bg-background/40",
      disabled && "pointer-events-none opacity-60")}>
    <input type="file" accept={accept.join(",")} multiple={multiple} disabled={disabled} className="sr-only"
      onChange={(event) => { onFiles([...(event.target.files ?? [])]); event.target.value = "" }} />
    <span className="flex size-14 items-center justify-center rounded-2xl bg-[image:var(--gradient-purple)] text-white shadow-adbox-medium transition-transform group-hover:scale-105">
      {busy ? <Loader2 className="size-6 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : icon}
    </span>
    <span className={cn("font-heading text-b1 font-semibold", ink)}>{busy ? "Reading…" : title}</span>
    <span className={cn("max-w-sm text-b3 leading-5", muted)}>{hint}</span>
  </label>
}

function Problems({ problems, onDismiss }: { problems: string[]; onDismiss: () => void }) {
  if (problems.length === 0) return null
  return <div role="alert" className="flex items-start gap-2 rounded-2xl bg-error-500/10 px-4 py-3 text-b3 text-error-700 dark:text-error-300">
    <ul className="flex-1 space-y-1">{problems.map((problem) => <li key={problem}>{problem}</li>)}</ul>
    <button type="button" onClick={onDismiss} aria-label="Dismiss" className="rounded-full p-0.5 hover:bg-error-500/10"><X className="size-4" aria-hidden="true" /></button>
  </div>
}

/** Up to ten pictures; the first is the cover. They can be dropped, reordered and removed. */
export function PicturesPicker({ images, onChange }: { images: PreparedImage[]; onChange: (images: PreparedImage[]) => void }) {
  const [problems, setProblems] = useState<string[]>([])
  const [reading, setReading] = useState(false)
  const room = MAX_IMAGES - images.length

  const add = async (files: File[]) => {
    if (files.length === 0) return
    const chosen = files.slice(0, Math.max(0, room))
    const refused = files.length > chosen.length ? [`A post holds up to ${MAX_IMAGES} pictures, so ${files.length - chosen.length} ${files.length - chosen.length === 1 ? "was" : "were"} left out.`] : []
    setReading(true)
    const results = await Promise.allSettled(chosen.map(prepareImage))
    setReading(false)
    const ready: PreparedImage[] = []
    results.forEach((result, index) => {
      if (result.status === "fulfilled") ready.push(result.value)
      else refused.push(`${chosen[index].name}: ${reason(result.reason)}`)
    })
    setProblems(refused)
    if (ready.length) onChange([...images, ...ready])
  }

  return <div className="flex flex-col gap-4">
    {room > 0 && <DropZone accept={IMAGE_TYPES} multiple busy={reading} disabled={reading} onFiles={(files) => void add(files)}
      icon={<ImagePlus className="size-6" aria-hidden="true" />}
      title={images.length ? "Add more pictures" : "Drop pictures here, or choose them"}
      hint={`JPEG, PNG or WebP, up to 10 MB each. ${images.length ? `${room} more can go in.` : `Up to ${MAX_IMAGES}; the first is the cover.`}`} />}
    <Problems problems={problems} onDismiss={() => setProblems([])} />
    {images.length > 0 && <ol aria-label="Pictures in order" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {images.map((image, index) => <li key={image.id} className="video-reveal group relative overflow-hidden rounded-2xl border border-grey-200 bg-grey-50 dark:border-border dark:bg-muted">
        <img src={image.url} alt={`Picture ${index + 1}`} className="aspect-square w-full object-cover" />
        <span className="absolute left-2 top-2 flex items-center gap-1">
          <span className="flex size-6 items-center justify-center rounded-full bg-grey-1000/75 text-[11px] font-bold text-white">{index + 1}</span>
          {index === 0 && <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-grey-1000">Cover</span>}
        </span>
        <span className="absolute inset-x-2 bottom-2 flex justify-between gap-1">
          <span className="flex gap-1">
            <button type="button" disabled={index === 0} onClick={() => onChange(moveItem(images, index, index - 1))} aria-label={`Move picture ${index + 1} earlier`}
              className="flex size-8 items-center justify-center rounded-full bg-white/90 text-grey-1000 shadow-adbox-small disabled:opacity-40"><ChevronLeft className="size-4" aria-hidden="true" /></button>
            <button type="button" disabled={index === images.length - 1} onClick={() => onChange(moveItem(images, index, index + 1))} aria-label={`Move picture ${index + 1} later`}
              className="flex size-8 items-center justify-center rounded-full bg-white/90 text-grey-1000 shadow-adbox-small disabled:opacity-40"><ChevronRight className="size-4" aria-hidden="true" /></button>
          </span>
          <button type="button" onClick={() => onChange(images.filter((item) => item.id !== image.id))} aria-label={`Remove picture ${index + 1}`}
            className="flex size-8 items-center justify-center rounded-full bg-white/90 text-error-700 shadow-adbox-small"><Trash2 className="size-4" aria-hidden="true" /></button>
        </span>
      </li>)}
    </ol>}
  </div>
}

/** One video: it becomes a Short by itself when it is portrait and up to 90 seconds. */
export function VideoPicker({ video, onChange }: { video: PreparedVideo | null; onChange: (video: PreparedVideo | null) => void }) {
  const [problem, setProblem] = useState<string | null>(null)
  const [reading, setReading] = useState(false)

  const choose = async (files: File[]) => {
    const file = files[0]
    if (!file) return
    setReading(true)
    try {
      onChange(await prepareVideo(file))
      setProblem(null)
    } catch (error) {
      setProblem(`${file.name}: ${reason(error)}`)
    } finally {
      setReading(false)
    }
  }

  if (!video) return <div className="flex flex-col gap-4">
    <DropZone accept={VIDEO_TYPES} busy={reading} disabled={reading} onFiles={(files) => void choose(files)}
      icon={<Clapperboard className="size-6" aria-hidden="true" />} title="Drop a video here, or choose one"
      hint={<>MP4 or MOV, up to 1 GB and 10 minutes. <strong className="font-semibold">Portrait and up to 90 seconds makes it a Short.</strong></>} />
    <Problems problems={problem ? [problem] : []} onDismiss={() => setProblem(null)} />
  </div>

  const short = isShort(video)
  return <div className="flex flex-col gap-4">
    <div className={cn("grid grid-cols-1 gap-4", short ? "sm:grid-cols-[minmax(0,14rem)_1fr]" : "")}>
      <video src={video.url} controls playsInline className={cn("w-full rounded-2xl bg-grey-1000 object-contain", short ? "aspect-[9/16]" : "max-h-80")} aria-label="Chosen video" />
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {short ? <Pill tone="purple" icon={Smartphone}>Short</Pill> : <Pill tone="purple" icon={Clapperboard}>Video</Pill>}
          <Pill>{formatDuration(video.duration)}</Pill>
          <Pill>{video.width}×{video.height}</Pill>
          <Pill>{formatBytes(video.file.size)}</Pill>
        </div>
        <p className={cn("text-b3 leading-5", muted)}>
          {short ? "It's portrait and 90 seconds or less, so the app shows it as a Short."
            : "It shows as a video. A portrait video up to 90 seconds would be a Short."}
        </p>
        <p className={cn("truncate text-b4", muted)} title={video.file.name}>{video.file.name}</p>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-grey-200 bg-white px-4 text-b3 font-semibold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-purple dark:border-border dark:bg-card">
            <input type="file" accept={VIDEO_TYPES.join(",")} className="sr-only" disabled={reading} onChange={(event) => { void choose([...(event.target.files ?? [])]); event.target.value = "" }} />
            {reading ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <RefreshCw className="size-4" aria-hidden="true" />}Replace
          </label>
          <Button type="button" variant="ghost" className="h-10 cursor-pointer rounded-full" onClick={() => onChange(null)}><Trash2 className="size-4" aria-hidden="true" />Remove</Button>
        </div>
      </div>
    </div>
    <Problems problems={problem ? [problem] : []} onDismiss={() => setProblem(null)} />
  </div>
}
