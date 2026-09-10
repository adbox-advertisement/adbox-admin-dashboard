import { ArrowLeft, ArrowUpRight, Download, Files, Image, Settings2, Sparkles } from "lucide-react"
import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { CmsButton } from "./CmsButton"
import { SaveIndicator } from "./SaveIndicator"
import { useCmsStore } from "../store"
import { downloadDraft } from "../lib/document"
import "../styles.css"
export function CmsLayout() {
  const error = useCmsStore(state => state.error)
  const { pathname } = useLocation()
  const editing = pathname.includes("/pages/")
  return <div className="rdi-cms min-h-svh bg-grey-50 text-grey-1000">
    <header className="border-b border-grey-200 bg-white px-4 sm:px-7 xl:px-9">
      <div className="flex min-h-20 flex-wrap items-center justify-between gap-3 py-4">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" aria-label="Back to AdBox" className="rounded-lg p-2 text-grey-500 hover:bg-grey-100 lg:hidden">
            <ArrowLeft className="size-5" />
          </Link>
          <Link to="/rdi" className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl border border-grey-200 bg-white">
              <img src="/rdi-assets/logo.png" alt="" className="size-8 object-contain" />
            </span>
            <span>
              <span className="block font-heading text-lg font-semibold leading-6">
                RichDad Investments
              </span>
              <span className="block text-xs text-grey-500">
                Website manager
              </span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden rounded-full bg-success-100 px-3 py-1.5 text-xs font-medium text-success-800 sm:block">
            Local workspace
          </span>
          <CmsButton asChild>
            <Link to="/rdi/website" target="_blank" rel="noreferrer">
              View website
              <ArrowUpRight className="size-4" />
            </Link>
          </CmsButton>
        </div>
      </div>
      {!editing && <nav aria-label="Website manager" className="flex gap-6 overflow-x-auto sm:gap-8">
        {[{ to: "/rdi", label: "Pages", icon: Files }, { to: "/rdi/library", label: "Media library", icon: Image }, { to: "/rdi/settings", label: "Site settings", icon: Settings2 }].map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end className={({ isActive }) => cn("flex shrink-0 items-center gap-2 border-b-2 px-1 pb-4 pt-2 text-sm font-semibold transition-colors", isActive ? "border-blue text-blue" : "border-transparent text-grey-500 hover:text-grey-1000")}>
          <Icon className="size-4" />
          {label}
        </NavLink>)}
      </nav>}
    </header>
    {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border-b border-warning-300 bg-warning-100 px-5 py-3 text-sm text-warning-1000">
      <span>
        {error}
      </span>
      <div className="flex gap-2">
        <CmsButton onClick={() => downloadDraft(useCmsStore.getState().draft)}>
          <Download className="size-4" />
          Export backup
        </CmsButton>
        <CmsButton onClick={() => useCmsStore.getState().save()}>
          Try saving again
        </CmsButton>
      </div>
    </div>}
    <Outlet />
    {!editing && <footer className="mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-grey-200 py-6 text-xs text-grey-500 sm:mx-7 xl:mx-9">
      <span className="inline-flex items-center gap-2">
        <Sparkles className="size-3.5 text-blue" />
        A little care goes a long way.
      </span>
      <SaveIndicator />
    </footer>}
  </div>
}
