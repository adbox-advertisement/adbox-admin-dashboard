import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { createPortal } from "react-dom"

import type { RdiPreviewSize } from "../../types"

const widths: Record<RdiPreviewSize, number> = { desktop: 1440, tablet: 768, mobile: 390 }

/** A real viewport keeps media queries independent of the surrounding CMS. */
export function RdiPreviewFrame({ size, children }: { size: RdiPreviewSize; children: ReactNode }) {
  const host = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLIFrameElement>(null)
  const [target, setTarget] = useState<HTMLElement | null>(null)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState(1000)
  const width = widths[size]

  useEffect(() => {
    if (!host.current) return
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / width)))
    observer.observe(host.current)
    return () => observer.disconnect()
  }, [width])

  useEffect(() => {
    if (!target) return
    const head = target.ownerDocument.head
    const syncStyles = () => {
      head.querySelectorAll('[data-preview-style]').forEach((node) => node.remove())
      document.head.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
        const clone = node.cloneNode(true) as HTMLElement
        clone.setAttribute("data-preview-style", "")
        head.appendChild(clone)
      })
    }
    syncStyles()
    const observer = new MutationObserver(syncStyles)
    observer.observe(document.head, { childList: true, subtree: true, characterData: true })
    const resize = new ResizeObserver(() => setHeight(Math.ceil(target.getBoundingClientRect().height)))
    resize.observe(target)
    return () => { observer.disconnect(); resize.disconnect() }
  }, [target])

  return (
    <div ref={host} className="w-full">
      <div className="relative mx-auto overflow-hidden rounded-xl bg-white shadow-adbox-small" style={{ width: width * scale, height: height * scale }}>
        <iframe
          ref={frame}
          title={`RDI website ${size} preview`}
          srcDoc={'<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0"><div id="rdi-preview-root" class="rdi-website"></div></body></html>'}
          onLoad={() => setTarget(frame.current?.contentDocument?.getElementById("rdi-preview-root") ?? null)}
          className="absolute left-0 top-0 origin-top-left scroll-mt-28 border-0"
          style={{ width, height, transform: `scale(${scale})` }}
        />
        {target ? createPortal(<div style={{ "--rdi-viewport-height": size === "mobile" ? "844px" : "900px" } as CSSProperties}>{children}</div>, target) : null}
      </div>
    </div>
  )
}
