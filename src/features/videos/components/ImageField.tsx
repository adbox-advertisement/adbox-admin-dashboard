import { useId, useRef, useState } from "react"
import { ImagePlus, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUploadImage } from "../hooks"
import { cn } from "../lib/cn"
import { serverMessage } from "../lib/errors"
import { hueOf } from "../lib/format"
import { IMAGE_TYPES, imageProblem } from "../lib/media"
import { muted } from "./tokens"

type Props = {
  label: string
  value: string | null
  onChange: (url: string | null) => void
  shape: "round" | "wide"
  /** Uploading needs media.create; without it the field says so. */
  canUpload: boolean
  /** Shown on the empty round picture. */
  fallbackText?: string
}

/** A photo or cover, uploaded to the media library and kept by its web address. */
export function ImageField({ label, value, onChange, shape, canUpload, fallbackText = "" }: Props) {
  const upload = useUploadImage()
  const input = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState(0)
  const [problem, setProblem] = useState<string | null>(null)
  const hintId = useId()

  const pick = async (file: File | undefined) => {
    if (!file) return
    const refused = imageProblem(file)
    if (refused) return setProblem(refused)
    setProblem(null)
    setProgress(0)
    try {
      onChange(await upload.mutateAsync({ file, onProgress: setProgress }))
    } catch (error) {
      setProblem(serverMessage(error, "The picture couldn't be uploaded."))
    }
  }

  const frame = shape === "round" ? "size-24 rounded-full" : "aspect-[16/7] w-full rounded-2xl"
  return <div className="flex flex-col gap-2">
    <span className="text-b3 font-semibold text-grey-1000 dark:text-foreground">{label}</span>
    <div className={cn("flex gap-4", shape === "round" ? "items-center" : "flex-col")}>
      <div className={cn("relative shrink-0 overflow-hidden", frame)} style={{ ["--studio-hue" as string]: hueOf(fallbackText || label) }}>
        {value ? <img src={value} alt="" className="size-full object-cover" />
          : <div className="studio-cover-fallback flex size-full items-center justify-center font-heading text-xl font-bold text-white">{shape === "round" ? fallbackText : <ImagePlus className="size-7 opacity-80" aria-hidden="true" />}</div>}
        {upload.isPending && <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-grey-1000/55 text-white">
          <Loader2 className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          <span className="text-[11px] font-semibold tabular-nums">{Math.round(progress * 100)}%</span>
        </div>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input ref={input} type="file" accept={IMAGE_TYPES.join(",")} className="sr-only" tabIndex={-1} aria-hidden="true"
          onChange={(event) => { void pick(event.target.files?.[0]); event.target.value = "" }} />
        <Button type="button" variant="outline" disabled={!canUpload || upload.isPending} aria-describedby={hintId}
          className="h-10 cursor-pointer rounded-full" onClick={() => input.current?.click()}>
          <ImagePlus className="size-4" aria-hidden="true" />{value ? "Change" : "Choose a picture"}
        </Button>
        {value && <Button type="button" variant="ghost" className="h-10 cursor-pointer rounded-full" onClick={() => onChange(null)} disabled={upload.isPending}>
          <Trash2 className="size-4" aria-hidden="true" />Remove
        </Button>}
        <p id={hintId} className={cn("w-full text-[11px]", muted)}>{canUpload ? "JPEG, PNG or WebP, up to 10 MB." : "Adding a picture needs the media.create permission."}</p>
      </div>
    </div>
    {problem && <p role="alert" className="text-b4 text-destructive">{problem}</p>}
  </div>
}
