import { useMemo, useState } from "react"
import { AlertTriangle, ExternalLink, ImageOff, Loader2 } from "lucide-react"
import { canPlayHlsNatively, playbackOrder, type VideoSources } from "../lib/playback"

export function VideoPlayer({ sources, poster, title, processing }: { sources: VideoSources; poster: string | null; title: string; processing: boolean }) {
  const order = useMemo(() => playbackOrder(sources, canPlayHlsNatively()), [sources])
  const [attempt, setAttempt] = useState(0)
  const src = order[attempt]

  if (!src) {
    const reason = processing
      ? "This video is still processing. It can be played once processing finishes."
      : sources.hlsUrl
        ? "This browser can't play the video stream, and no MP4 original is available. Try Safari, or open the stream in a player."
        : "No playable video file is available for this post."
    return <div className="flex flex-col gap-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
        {poster ? <img src={poster} alt="" className="size-full object-contain opacity-60" /> : <span className="flex size-full items-center justify-center text-white/60"><ImageOff className="size-8" aria-hidden="true" /></span>}
        <p role="status" className="absolute inset-x-4 bottom-4 flex items-start gap-2 rounded-xl bg-black/70 px-3 py-2 text-b3 text-white">
          {processing ? <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}{reason}
        </p>
      </div>
      {sources.hlsUrl && <StreamLink href={sources.hlsUrl} />}
    </div>
  }

  return <div className="flex flex-col gap-3">
    {/* Keyed so a fallback source remounts the element instead of reusing its error state. */}
    <video key={src} src={src} poster={poster ?? undefined} controls playsInline preload="metadata" aria-label={title}
      onError={() => setAttempt((current) => current + 1)}
      className="aspect-video w-full rounded-2xl bg-black object-contain" />
    {sources.hlsUrl && <StreamLink href={sources.hlsUrl} />}
  </div>
}

function StreamLink({ href }: { href: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-1 text-b3 font-semibold text-blue hover:underline dark:text-cyan">
    Open stream link<ExternalLink className="size-3.5" aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span>
  </a>
}
