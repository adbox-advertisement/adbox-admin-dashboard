import { useEffect, useId, useRef, useState } from "react"
import { Check, Eye, FileImage, FileText, FileVideo, Hash, ImagePlus, Images, RefreshCw, Send, Smartphone, Upload, Video, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { MediaKind, SelectedMediaFile, UploadDestination } from "../../types/uploads"
import { AdboxTextPostPreview } from "./AdboxPostPreview"
import { PhotoComposer } from "./PhotoComposer"

type Props = UploadDestination & { onCountChange: (kind: MediaKind, count: number) => void }

const mediaOptions = {
  videos: {
    singular: "video", limit: 1, maxMb: 500,
    accept: ".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm",
    extensions: ["mp4", "mov", "webm"],
    mimeTypes: ["video/mp4", "video/quicktime", "video/webm"],
    formats: "MP4, MOV and WebM",
    quantity: "1 video · Up to 500 MB",
    ratios: "16:9, 9:16 or 1:1",
  },
  photos: {
    singular: "photo", limit: 35, maxMb: 50,
    accept: ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp",
    extensions: ["jpg", "jpeg", "png", "webp"],
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    formats: "JPG, JPEG, PNG and WebP",
    quantity: "Up to 35 photos · 50 MB each",
    ratios: "16:9, 4:3 or 3:4",
  },
}

function UploadPanel({ kind, schoolId, folderId, onCountChange }: Props & { kind: "videos" | "photos" }) {
  const config = mediaOptions[kind]
  const inputRef = useRef<HTMLInputElement>(null)
  const objectUrls = useRef(new Set<string>())
  const dragDepth = useRef(0)
  const [files, setFiles] = useState<SelectedMediaFile[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)
  const MediaIcon = kind === "photos" ? ImagePlus : Video

  useEffect(() => {
    const urls = objectUrls.current
    return () => { urls.forEach((url) => URL.revokeObjectURL(url)) }
  }, [])

  useEffect(() => { onCountChange(kind, files.length) }, [files.length, kind, onCountChange])

  function releaseFiles(entries: SelectedMediaFile[]) {
    entries.forEach(({ url }) => { URL.revokeObjectURL(url); objectUrls.current.delete(url) })
  }

  function addFiles(incoming: FileList | File[]) {
    const replacingVideo = kind === "videos" && files.length > 0
    const next = replacingVideo ? [] : [...files]
    const issues: string[] = []
    for (const file of Array.from(incoming)) {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? ""
      if (!config.extensions.includes(extension) || (file.type && !config.mimeTypes.includes(file.type))) {
        issues.push(file.name + ": choose " + config.formats + ".")
      } else if (file.size === 0 || file.size > config.maxMb * 1024 * 1024) {
        issues.push(file.name + ": file must be non-empty and no larger than " + config.maxMb + " MB.")
      } else if (next.some((entry) => entry.file.name === file.name && entry.file.size === file.size && entry.file.lastModified === file.lastModified)) {
        issues.push(file.name + " is already selected.")
      } else if (next.length >= config.limit) {
        issues.push("You can select up to " + config.limit + " " + (config.limit === 1 ? config.singular : kind) + ". Remove a file to add another.")
        break
      } else {
        const url = URL.createObjectURL(file)
        objectUrls.current.add(url)
        next.push({ id: crypto.randomUUID(), file, url, schoolId, folderId })
      }
    }
    if (!replacingVideo || next.length > 0) {
      if (replacingVideo) releaseFiles(files)
      setFiles(next)
    }
    setErrors(issues)
  }

  function removeFile(id: string) {
    releaseFiles(files.filter((file) => file.id === id))
    setFiles((current) => current.filter((file) => file.id !== id))
    setErrors([])
  }

  const errorMessage = errors.length > 0 && <div role="alert" className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"><ul className="list-inside list-disc space-y-1 break-words">{errors.map((error, index) => <li key={index}>{error}</li>)}</ul></div>
  const video = kind === "videos" ? files[0] : undefined

  return (
    <div className="p-4 sm:p-5">
      <input ref={inputRef} type="file" accept={config.accept} multiple={config.limit > 1} aria-label={"Select " + kind} className="hidden" onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.target.value = "" }} />
      {errorMessage}
      <p role="status" className="sr-only">{files.length} {kind} selected.</p>
      {kind === "photos" && files.length > 0 ? (
        <PhotoComposer files={files} onAdd={() => inputRef.current?.click()} onRemove={removeFile} onReorder={setFiles} onDiscard={() => { releaseFiles(files); setFiles([]); setErrors([]) }} />
      ) : video ? (
        <section aria-label="Selected videos" className="video-reveal">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold"><span className="flex size-6 items-center justify-center rounded-full bg-success-100 text-success-800"><Check className="size-3.5" aria-hidden="true" /></span>Video selected</div>
            <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} className="h-11 rounded-xl px-4"><RefreshCw className="size-4" aria-hidden="true" />Replace video</Button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-muted">
            <video src={video.url} controls preload="metadata" onError={() => setErrors(["This video couldn't be previewed in this browser. Try an MP4 or choose another file."])} className="max-h-[480px] min-h-56 w-full bg-grey-1000" aria-label={video.file.name} />
            <div className="flex items-center gap-3 bg-card p-4">
              <FileVideo className="size-5 shrink-0 text-secondary" aria-hidden="true" />
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold" title={video.file.name}>{video.file.name}</p><p className="mt-1 text-xs text-muted-foreground">{(video.file.size / 1024 / 1024).toFixed(2)} MB</p></div>
              <Button type="button" variant="ghost" size="icon" aria-label={"Remove " + video.file.name} onClick={() => removeFile(video.id)} className="size-11 rounded-xl text-muted-foreground hover:bg-destructive/5 hover:text-destructive"><X className="size-4" aria-hidden="true" /></Button>
            </div>
          </div>
          <p className="mt-4 text-xs leading-6 text-muted-foreground">Your video is selected on this device. It has not been uploaded or published.</p>
        </section>
      ) : (
        <>
          <button
            type="button"
            aria-label={"Select " + kind}
            data-cursor="copy"
            onClick={() => inputRef.current?.click()}
            className={cn("group/upload relative flex min-h-[340px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-5 py-10 text-center outline-none transition-colors focus-visible:shadow-adbox-focus-secondary", dragging ? "border-secondary bg-secondary/10" : "border-secondary/20 bg-linear-to-br from-secondary/3 via-card to-primary/3 hover:border-secondary/60 hover:bg-secondary/5")}
            onDragEnter={(event) => { event.preventDefault(); dragDepth.current += 1; setDragging(true) }}
            onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "copy" }}
            onDragLeave={(event) => { event.preventDefault(); dragDepth.current -= 1; if (dragDepth.current <= 0) setDragging(false) }}
            onDrop={(event) => { event.preventDefault(); dragDepth.current = 0; setDragging(false); addFiles(event.dataTransfer.files) }}
          >
            <span className="relative mb-7 flex size-24 items-center justify-center">
              <span className="absolute left-0 top-3 size-16 -rotate-12 rounded-2xl border border-secondary/10 bg-secondary/10 transition-transform duration-300 group-hover/upload:-translate-x-2 motion-reduce:transform-none" />
              <span className="absolute right-0 top-2 size-16 rotate-12 rounded-2xl border border-primary/10 bg-primary/10 transition-transform duration-300 group-hover/upload:translate-x-2 motion-reduce:transform-none" />
              <span className="relative flex size-20 items-center justify-center rounded-2xl border border-card bg-card text-secondary shadow-adbox-small transition-transform duration-300 group-hover/upload:-translate-y-1 motion-reduce:transform-none"><MediaIcon className="size-9" strokeWidth={1.5} aria-hidden="true" /></span>
              <span className="absolute -bottom-1 -right-1 flex size-9 items-center justify-center rounded-full border-4 border-card bg-secondary text-secondary-foreground"><Upload className="size-4" aria-hidden="true" /></span>
            </span>
            <span role="heading" aria-level={3} className="font-heading text-xl font-semibold leading-8">{dragging ? "Drop it like it's yours." : "Select " + kind + " to upload"}</span>
            <span className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">{dragging ? "Release to add your content to this folder." : "Drag and drop your " + kind + " here, or browse your files."}</span>
            <span className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-secondary px-6 text-sm font-semibold text-secondary-foreground shadow-adbox-small"><Upload className="size-4" aria-hidden="true" />Select {kind}</span>
            <span className="mt-4 text-xs leading-5 text-muted-foreground">{config.quantity}</span>
          </button>
          <div className="mt-5 rounded-2xl bg-muted/40 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">{kind === "photos" ? <FileImage className="size-4 text-secondary" aria-hidden="true" /> : <FileVideo className="size-4 text-secondary" aria-hidden="true" />}A little guidance for a great result</div>
            <dl className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">
              <div className="flex flex-wrap justify-between gap-x-3"><dt>Supported formats</dt><dd className="text-foreground">{config.formats}</dd></div>
              <div className="flex flex-wrap justify-between gap-x-3"><dt>Recommended ratio</dt><dd className="text-foreground">{config.ratios}</dd></div>
            </dl>
          </div>
        </>
      )}
    </div>
  )
}

function TextPanel({ schoolId, onCountChange }: Props) {
  const formId = useId()
  const [text, setText] = useState("")
  const [reference, setReference] = useState("")
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { onCountChange("text", text.trim().length > 0 ? 1 : 0) }, [text, onCountChange])

  function insertHashtag() {
    const field = textRef.current
    const start = field?.selectionStart ?? text.length
    const end = field?.selectionEnd ?? start
    const prefix = start > 0 && !/\s/.test(text[start - 1]) ? " #" : "#"
    const next = text.slice(0, start) + prefix + text.slice(end)
    if (next.length > 4000) return
    setText(next)
    requestAnimationFrame(() => { field?.focus(); field?.setSelectionRange(start + prefix.length, start + prefix.length) })
  }

  return (
    <div className="p-4 sm:p-5">
      <div className="video-composer video-reveal">
        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div><h3 className="font-heading text-xl font-semibold">Create text post</h3><p className="mt-1.5 text-xs leading-5 text-muted-foreground">Share an update with a reference code, no media required.</p></div>
            <Dialog>
              <DialogTrigger asChild><Button type="button" variant="outline" className="video-preview-trigger h-11 rounded-xl px-3"><Eye className="size-4" aria-hidden="true" />Preview</Button></DialogTrigger>
              <DialogContent className="video-management-ui rounded-3xl">
                <DialogTitle>Post preview</DialogTitle>
                <DialogDescription className="sr-only">See how your text and reference look on AdBox.</DialogDescription>
                <AdboxTextPostPreview schoolId={schoolId} text={text} reference={reference} />
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-5">
            <div>
              <label htmlFor={formId + "-text"} className="mb-2 block text-sm font-semibold">Text</label>
              <div className="overflow-hidden rounded-xl border border-border bg-card focus-within:border-secondary focus-within:shadow-adbox-focus-secondary">
                <Textarea ref={textRef} id={formId + "-text"} maxLength={4000} placeholder="Write your post…" value={text} onChange={(event) => setText(event.target.value)} className="min-h-40 resize-y rounded-none border-0 px-3.5 py-3 focus-visible:shadow-none" aria-describedby={formId + "-text-count"} />
                <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-muted/30 px-2 py-1.5">
                  <Button type="button" variant="ghost" onClick={insertHashtag} disabled={text.length >= 4000} className="h-10 rounded-lg text-xs text-secondary"><Hash aria-hidden="true" />Add hashtag</Button>
                  <span id={formId + "-text-count"} className="pr-2 text-xs tabular-nums text-muted-foreground">{text.length}/4000</span>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor={formId + "-reference"} className="text-sm font-semibold">Reference</label>
                <span id={formId + "-reference-count"} className="text-xs tabular-nums text-muted-foreground">{reference.length}/40</span>
              </div>
              <Input id={formId + "-reference"} maxLength={40} placeholder="e.g. REF-2049" value={reference} onChange={(event) => setReference(event.target.value)} className="h-12 rounded-xl border-border px-3.5" aria-describedby={formId + "-reference-count"} />
              <p className="mt-2 text-xs leading-5 text-muted-foreground">A tracking or document reference code for this post.</p>
            </div>
          </div>
          <div className="mt-6 border-t border-border pt-5">
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="secondary" disabled className="h-11 min-w-32 rounded-xl"><Send aria-hidden="true" />Post</Button>
              <Button type="button" variant="ghost" onClick={() => { setText(""); setReference("") }} className="h-11 rounded-xl px-4 text-muted-foreground">Discard</Button>
            </div>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">Text stays on this device. Posting will be available when uploads are connected.</p>
          </div>
        </div>
        <aside aria-label="AdBox mobile preview" className="video-inline-preview min-w-0">
          <div className="mb-4 flex items-center justify-between gap-2"><h3 className="font-heading text-base font-semibold">Live preview</h3><Smartphone className="size-4 text-secondary" aria-hidden="true" /></div>
          <AdboxTextPostPreview schoolId={schoolId} text={text} reference={reference} />
        </aside>
      </div>
    </div>
  )
}

export function MediaUpload(props: Props) {
  const mediaRef = useRef<HTMLDivElement>(null)
  return (
    <Tabs ref={mediaRef} defaultValue="photos" onValueChange={() => mediaRef.current?.querySelectorAll("video").forEach((video) => video.pause())} className="video-media-workspace">
      <TabsList aria-label="Media type" className="mx-4 mt-4 gap-1 rounded-xl border-0 bg-muted/70 p-1 sm:mx-5">
        <TabsTrigger value="photos" className="flex-1 justify-center rounded-lg border-0 px-3 py-3 data-[state=active]:bg-card data-[state=active]:text-secondary data-[state=active]:shadow-adbox-small"><Images className="size-4" aria-hidden="true" /> Photos</TabsTrigger>
        <TabsTrigger value="videos" className="flex-1 justify-center rounded-lg border-0 px-3 py-3 data-[state=active]:bg-card data-[state=active]:text-secondary data-[state=active]:shadow-adbox-small"><Video className="size-4" aria-hidden="true" /> Videos</TabsTrigger>
        <TabsTrigger value="text" className="flex-1 justify-center rounded-lg border-0 px-3 py-3 data-[state=active]:bg-card data-[state=active]:text-secondary data-[state=active]:shadow-adbox-small"><FileText className="size-4" aria-hidden="true" /> Text</TabsTrigger>
      </TabsList>
      <TabsContent value="photos" forceMount className="data-[state=inactive]:hidden"><UploadPanel kind="photos" {...props} /></TabsContent>
      <TabsContent value="videos" forceMount className="data-[state=inactive]:hidden"><UploadPanel kind="videos" {...props} /></TabsContent>
      <TabsContent value="text" forceMount className="data-[state=inactive]:hidden"><TextPanel {...props} /></TabsContent>
    </Tabs>
  )
}
