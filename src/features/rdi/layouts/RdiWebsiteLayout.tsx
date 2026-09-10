import { ArrowLeft } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { APP_ROUTES } from "@/routes/paths"
import { WebsiteHeader } from "../components/shared/WebsiteHeader"
import { WebsiteFooter } from "../components/shared/WebsiteFooter"
import "../styles/website.css"
export function RdiWebsiteLayout() {
  const { pathname, hash } = useLocation()
  const marker = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const scrollRoot = marker.current?.closest("main")
    if (!scrollRoot)
      return
    const updateScroll = () => setScrolled(scrollRoot.scrollTop > 10)
    scrollRoot.addEventListener("scroll", updateScroll, { passive: true })
    updateScroll()
    return () => scrollRoot.removeEventListener("scroll", updateScroll)
  }, [])
  useEffect(() => {
    if (hash)
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: "start" })
    else
      marker.current?.closest("main")?.scrollTo({ top: 0, behavior: "instant" })
  }, [pathname, hash])
  return (<div ref={marker} className="rdi-website min-w-0 bg-white">
    <div className="border-b border-slate-100 bg-white px-4 py-2 lg:hidden">
      <Link to={APP_ROUTES.rdi} className="inline-flex min-h-9 items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="size-4" />

        Website manager

      </Link>
    </div>
    <WebsiteHeader key={`navigation:${pathname}`} scrolled={scrolled} />
    <div key={pathname} id="rdi-page-content">
      <Outlet />
    </div>
    <WebsiteFooter />
  </div>)
}
