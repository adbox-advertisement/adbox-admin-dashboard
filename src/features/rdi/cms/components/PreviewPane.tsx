import { useEffect, useRef, useState } from "react"
import { ArrowUpRight, Monitor, Smartphone } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useCmsStore } from "../store"
export function PreviewPane({ pageId, section }: {
  pageId: string
  section?: string
}) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop")
  const [width, setWidth] = useState(400)
  const container = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLIFrameElement>(null)
  const draft = useCmsStore(state => state.draft)
  const viewport = device === "desktop" ? 1440 : 390
  const scale = Math.min(1, Math.max(1, width) / viewport)
  const previewHeight = device === "desktop" ? 900 * scale : 620
  useEffect(() => {
    if (!container.current)
      return
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0)
        setWidth(entry.contentRect.width)
    })
    observer.observe(container.current)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    const send = () => frame.current?.contentWindow?.postMessage({ type: "rdi-preview-document", draft }, location.origin)
    send()
    const receive = (event: MessageEvent) => {
      if (event.origin === location.origin && event.source === frame.current?.contentWindow && event.data?.type === "rdi-preview-ready")
        send()
    }
    window.addEventListener("message", receive)
    return () => window.removeEventListener("message", receive)
  }, [draft])
  useEffect(() => {
    if (section)
      frame.current?.contentWindow?.postMessage({ type: "rdi-preview-focus", section }, location.origin)
  }, [section])
  return <div className="overflow-hidden rounded-2xl border border-grey-200 dark:border-border bg-white dark:bg-card shadow-adbox-small">
    <div className="flex items-center justify-between gap-2 border-b border-grey-200 dark:border-border p-3">
      <span className="text-xs font-semibold text-grey-600 dark:text-muted-foreground">
        Live preview
      </span>
      <div className="flex rounded-lg bg-grey-100 dark:bg-muted p-1" role="group" aria-label="Preview device">
        {([{ id: "desktop", icon: Monitor }, { id: "mobile", icon: Smartphone }] as const).map(({ id, icon: Icon }) => <button type="button" key={id} aria-label={`${id} preview`} aria-pressed={device === id} onClick={() => setDevice(id)} className={cn("rounded-md px-2 py-1.5", device === id ? "bg-white dark:bg-card text-blue dark:text-cyan shadow-adbox-small" : "text-grey-400 dark:text-muted-foreground hover:text-grey-800 dark:hover:text-foreground")}>
          <Icon className="size-3.5" />
        </button>)}
      </div>
      <Link to={`/rdi/preview/${pageId}`} target="_blank" rel="noreferrer" aria-label="Open full preview" className="rounded-lg p-1.5 text-grey-400 dark:text-muted-foreground hover:bg-grey-100 dark:hover:bg-muted hover:text-blue dark:hover:text-cyan">
        <ArrowUpRight className="size-4" />
      </Link>
    </div>
    <div className="border-b border-grey-200 dark:border-border bg-grey-50 dark:bg-background px-3 py-2 text-center text-[10px] text-grey-400 dark:text-muted-foreground">
      richdadinvestments.org
      {pageId === "home" ? "" : "/" + pageId}
    </div>
    <div ref={container} className="relative overflow-hidden bg-grey-100 dark:bg-muted" style={{ height: previewHeight }}>
      <iframe ref={frame} src={`/rdi/preview/${pageId}`} title="Website page preview" className="absolute left-1/2 top-0 border-0 bg-white dark:bg-card" style={{ width: viewport, height: previewHeight / scale, transform: `translateX(-50%) scale(${scale})`, transformOrigin: "top center" }} />
    </div>
    <p className="border-t border-grey-200 dark:border-border px-3 py-3 text-center text-[11px] text-grey-400 dark:text-muted-foreground">
      Your draft updates here as you edit.
    </p>
  </div>
}
