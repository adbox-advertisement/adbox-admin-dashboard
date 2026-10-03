import { useEffect, useState } from "react"
import { CirclePlay, LockKeyhole } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useVideoUrl } from "../hooks"
import type { Application } from "../types"
import { RecruitmentError } from "./RecruitmentControls"

export function CandidateVideo({ application }: { application: Application }) {
  const video = useVideoUrl(application.id)
  const { data, reset } = video
  const [expired, setExpired] = useState(false)
  const [playbackFailed, setPlaybackFailed] = useState(false)
  useEffect(() => {
    if (!data) return
    const timer = setTimeout(() => { reset(); setExpired(true) }, data.expiresInSeconds * 1000)
    return () => clearTimeout(timer)
  }, [data, reset])
  const available = !application.redactedAt && application.video.status === "READY"
  return <section className="overflow-hidden rounded-2xl border border-border bg-card" aria-labelledby="candidate-video-title">
    <div className="p-4"><div className="flex items-center gap-2"><CirclePlay className="size-4 text-blue dark:text-cyan" aria-hidden="true" /><h3 id="candidate-video-title" className="text-base font-semibold">Introduction video</h3></div><p className="mt-1 text-xs text-muted-foreground">Meet the person behind the application.</p></div>
    {data && !playbackFailed ? <video key={data.url} src={data.url} controls playsInline preload="metadata" aria-label="Candidate introduction video" className="aspect-[4/5] max-h-96 w-full bg-grey-1000 object-contain" onError={() => setPlaybackFailed(true)} /> : <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 bg-grey-1000 px-5 text-center text-white"><span className="rounded-full bg-white/10 p-4"><CirclePlay className="size-8" aria-hidden="true" /></span><p className="text-sm">{!available ? "Video unavailable" : playbackFailed ? "The video could not be played." : expired ? "Your viewing link has expired." : "A short introduction. A real first impression."}</p>{available && <Button variant="outline" className="h-10 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white" disabled={video.isPending} onClick={() => { setExpired(false); setPlaybackFailed(false); video.mutate() }}>{video.isPending ? "Opening video…" : expired || playbackFailed ? "Get a new video link" : "Watch introduction"}</Button>}</div>}
    {video.isError && <div className="p-3"><RecruitmentError error={video.error} /></div>}
    <div className="space-y-3 p-4 text-xs text-muted-foreground"><p className="break-all font-medium text-foreground">{application.video.fileName || "File removed"}</p><p>{application.video.durationSeconds.toFixed(1)} seconds · {(application.video.byteSize / 1024 / 1024).toFixed(1)} MB · {application.video.mimeType}</p><p className="flex items-start gap-2 leading-5"><LockKeyhole className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />Private video. Viewing links expire after five minutes.</p>{!available && <p>{application.redactedAt ? "This applicant's video has been removed." : application.video.status === "PENDING" ? "The upload is still being verified." : "The video could not be verified or is no longer available."}</p>}</div>
  </section>
}
