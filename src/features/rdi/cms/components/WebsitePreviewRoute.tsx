import { lazy, Suspense, useEffect } from "react"
import { useParams } from "react-router-dom"
import { WebsiteHeader } from "../../components/shared/WebsiteHeader"
import { WebsiteFooter } from "../../components/shared/WebsiteFooter"
import { cmsPages } from "../catalog"
import { useCmsStore } from "../store"
import { cmsDraftSchema } from "../lib/document"
import "../../styles/website.css"
const screens = {
  home: lazy(() => import("../../pages/RdiHomePage").then(module => ({ default: module.RdiHomePage }))),
  about: lazy(() => import("../../pages/RdiAboutPage").then(module => ({ default: module.RdiAboutPage }))),
  construction: lazy(() => import("../../pages/RdiConstructionPage").then(module => ({ default: module.RdiConstructionPage }))),
  media: lazy(() => import("../../pages/RdiMediaPage").then(module => ({ default: module.RdiMediaPage }))),
  solar: lazy(() => import("../../pages/RdiSolarPage").then(module => ({ default: module.RdiSolarPage }))),
  contact: lazy(() => import("../../pages/RdiContactPage").then(module => ({ default: module.RdiContactPage }))),
}
export function WebsitePreviewRoute() {
  const { pageId = "home" } = useParams()
  const page = cmsPages.find(page => page.id === pageId)
  const seo = useCmsStore(state => state.draft.seo[pageId])
  useEffect(() => {
    document.title = seo?.title || `${page?.name ?? "Preview"} | RichDad Investments`
    const meta = document.createElement("meta")
    meta.name = "description"
    meta.content = seo?.description || page?.description || ""
    document.head.append(meta)
    window.scrollTo({ top: 0, behavior: "instant" })
    return () => meta.remove()
  }, [pageId, page, seo])
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== window.parent || !event.data)
        return
      if (event.data.type === "rdi-preview-document") {
        const result = cmsDraftSchema.safeParse(event.data.draft)
        if (result.success)
          useCmsStore.getState().receive(result.data)
      }
      if (event.data.type === "rdi-preview-focus" && typeof event.data.section === "string")
        document.querySelector(`[data-cms-section="${CSS.escape(event.data.section)}"]`)?.scrollIntoView({ block: "start", behavior: "instant" })
    }
    window.addEventListener("message", receive)
    if (parent !== window)
      parent.postMessage({ type: "rdi-preview-ready" }, location.origin)
    return () => window.removeEventListener("message", receive)
  }, [])
  if (!page)
    throw new Response(null, { status: 404 })
  const Screen = screens[page.id]
  return <main className="rdi-website min-h-svh bg-white">
    <WebsiteHeader key={`preview-header:${page.id}`} scrolled={false} />
    <Suspense fallback={<div className="p-12 text-center text-sm text-grey-500">Loading page…</div>}>
      <Screen key={page.id} />
    </Suspense>
    <WebsiteFooter />
  </main>
}
