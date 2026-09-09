import { ImageIcon, Video } from "lucide-react"
import type { RdiMedia } from "../../types"
import { cn } from "@/lib/utils"

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
