import { ImageIcon, Link2, Upload, Video, X } from "lucide-react"
import { useId, useState, type ChangeEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { RdiMedia } from "@/features/rdi/types"
import { cn } from "@/lib/utils"

const MAX_EMBEDDED_FILE_SIZE = 5 * 1024 * 1024

function getEmbeddedVideoUrl(url: string) {
  if (!url) return null

  try {
    const parsedUrl = new URL(url)

    if (parsedUrl.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${parsedUrl.pathname.slice(1)}`
    }

    if (parsedUrl.hostname.includes("youtube.com")) {
      if (parsedUrl.pathname.startsWith("/embed/")) return url

      const videoId = parsedUrl.searchParams.get("v")
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }

    if (parsedUrl.hostname.includes("vimeo.com")) {
      const pathParts = parsedUrl.pathname.split("/").filter(Boolean)
      const videoId = pathParts[pathParts.length - 1]
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null
    }
  } catch {
    return null
  }

  return null
}

export function RdiMediaDisplay({
  media,
  className,
}: {
  media: RdiMedia
  className?: string
}) {
  if (!media.url) {
    return (
      <div
        className={cn(
          "flex min-h-44 items-center justify-center bg-grey-100 text-grey-400",
          className
        )}
      >
        {media.type === "image" ? (
          <ImageIcon aria-hidden="true" className="size-8" strokeWidth={1.5} />
        ) : (
          <Video aria-hidden="true" className="size-8" strokeWidth={1.5} />
        )}
      </div>
    )
  }

  if (media.type === "image") {
    return (
      <img
        src={media.url}
        alt={media.alt}
        className={cn("h-full w-full object-cover", className)}
      />
    )
  }

  const embeddedUrl = getEmbeddedVideoUrl(media.url)

  if (embeddedUrl) {
    return (
      <iframe
        src={embeddedUrl}
        title={media.alt || "Video preview"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={cn("h-full w-full border-0", className)}
      />
    )
  }

  return (
    <video
      src={media.url}
      aria-label={media.alt || "Video preview"}
      controls
      playsInline
      className={cn("h-full w-full object-cover", className)}
    />
  )
}

export function RdiMediaField({
  media,
  onChange,
}: {
  media: RdiMedia
  onChange: (media: RdiMedia) => void
}) {
  const inputId = useId()
  const [fileError, setFileError] = useState("")

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) return

    if (file.size > MAX_EMBEDDED_FILE_SIZE) {
      setFileError("Files saved in this prototype must be 5 MB or smaller. Use a hosted URL for larger media.")
      return
    }

    const requiredPrefix = media.type === "image" ? "image/" : "video/"

    if (!file.type.startsWith(requiredPrefix)) {
      setFileError(`Choose a valid ${media.type} file.`)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== "string") return

      setFileError("")
      onChange({
        ...media,
        url: reader.result,
        alt: media.alt || file.name.replace(/\.[^/.]+$/, ""),
      })
    }
    reader.onerror = () => setFileError("This file could not be read. Try another file or use a hosted URL.")
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-grey-900">Section media</p>
          <p className="mt-1 text-xs text-grey-400">Upload a file or paste a hosted media URL.</p>
        </div>

        <div className="flex rounded-lg bg-grey-100 p-1" aria-label="Media type">
          {(["image", "video"] as const).map((type) => {
            const Icon = type === "image" ? ImageIcon : Video

            return (
              <button
                key={type}
                type="button"
                onClick={() => onChange({ type, url: "", alt: media.alt })}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold capitalize transition-colors",
                  media.type === type
                    ? "bg-white text-grey-1000 shadow-adbox-small"
                    : "text-grey-500 hover:text-grey-900"
                )}
              >
                <Icon aria-hidden="true" className="size-3.5" />
                {type}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-4 max-xl:grid-cols-1">
        <div className="relative min-h-52 overflow-hidden rounded-xl border border-grey-200 bg-grey-100">
          <RdiMediaDisplay media={media} className="absolute inset-0" />
          {media.url ? (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => onChange({ ...media, url: "" })}
              className="absolute right-2 top-2 size-8 rounded-full bg-white/95 text-grey-700 shadow-adbox-small hover:bg-white"
              aria-label="Remove media"
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>

        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="flex items-center gap-2 text-xs font-semibold text-grey-600">
              <Link2 aria-hidden="true" className="size-3.5" />
              Media URL
            </span>
            <Input
              type="url"
              value={media.url.startsWith("data:") ? "" : media.url}
              onChange={(event) => onChange({ ...media, url: event.target.value })}
              placeholder={
                media.type === "image"
                  ? "https://example.com/image.jpg"
                  : "YouTube, Vimeo, MP4, or WebM URL"
              }
              className="h-11 border-grey-200 bg-white"
            />
          </label>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-grey-200" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-grey-400">or</span>
            <div className="h-px flex-1 bg-grey-200" />
          </div>

          <input
            id={inputId}
            type="file"
            accept={media.type === "image" ? "image/*" : "video/*"}
            onChange={handleFileChange}
            className="sr-only"
          />
          <label
            htmlFor={inputId}
            className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-grey-300 bg-grey-50 px-4 text-sm font-semibold text-grey-700 transition-colors hover:border-purple hover:bg-accent-background hover:text-purple focus-within:ring-2 focus-within:ring-purple/20"
          >
            <Upload aria-hidden="true" className="size-4" />
            Upload {media.type}
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-semibold text-grey-600">
              {media.type === "image" ? "Alternative text" : "Accessible video title"}
            </span>
            <Input
              value={media.alt}
              onChange={(event) => onChange({ ...media, alt: event.target.value })}
              placeholder="Describe the media for accessibility"
              className="h-11 border-grey-200 bg-white"
            />
          </label>
        </div>
      </div>

      {fileError ? (
        <p role="alert" className="text-xs font-medium text-error-700">
          {fileError}
        </p>
      ) : null}
    </div>
  )
}
