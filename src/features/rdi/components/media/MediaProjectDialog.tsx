import type { RefObject } from "react"
import { Film } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import type { MediaProject } from "../../data/media"
import { WebsiteLink } from "../shared/WebsiteLink"

type MediaProjectDialogProps = {
  project: MediaProject | null
  onClose: () => void
  returnFocus: RefObject<HTMLElement | null>
}

export function MediaProjectDialog({ project, onClose, returnFocus }: MediaProjectDialogProps) {
  return (
    <Dialog open={project !== null} onOpenChange={open => { if (!open) onClose() }}>
      <DialogContent
        className="rdi-website max-w-4xl gap-0 overflow-y-auto rounded-2xl border-slate-700 bg-slate-900 p-0 text-white [&>button]:bg-slate-900/80 [&>button]:text-white"
        onCloseAutoFocus={event => {
          event.preventDefault()
          returnFocus.current?.focus()
        }}
      >
        {project && <>
          <div className="relative">
            <img src={project.image} alt={project.title} className="h-56 w-full object-cover @min-[640px]/rdi:h-96" />
            {project.video && (
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-4 py-2 text-sm text-white">
                <Film className="size-4" aria-hidden="true" />
                Video preview unavailable
              </span>
            )}
          </div>
          <div className="p-6 @min-[640px]/rdi:p-8">
            <div className="mb-4 flex flex-wrap gap-2">
              {project.tags.map(tag => <span key={tag} className="rounded-full bg-purple-500/20 px-3 py-1 text-sm text-purple-300">{tag}</span>)}
            </div>
            <DialogTitle className="mb-2 text-3xl font-bold leading-tight text-white @min-[640px]/rdi:text-4xl">{project.title}</DialogTitle>
            <p className="mb-4 text-purple-400">Client: {project.client}</p>
            <DialogDescription className="mb-6 text-lg text-gray-300">{project.description}</DialogDescription>
            <dl className="grid grid-cols-2 gap-6">
              {Object.entries(project.stats).map(([label, value]) => (
                <div key={label}>
                  <dt className="text-sm capitalize text-gray-400">{label}</dt>
                  <dd className="mt-1 text-2xl font-bold text-white">{value}</dd>
                </div>
              ))}
            </dl>
            <WebsiteLink href="/contact" onClick={onClose} className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-center font-semibold text-white transition-colors hover:from-purple-500 hover:to-pink-500">
              Start a Similar Project
            </WebsiteLink>
          </div>
        </>}
      </DialogContent>
    </Dialog>
  )
}
