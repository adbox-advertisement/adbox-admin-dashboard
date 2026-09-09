import { Expand } from "lucide-react"

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function ImagePreview({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" data-cursor="zoom-in" aria-label={"Enlarge image: " + alt} className="group/image relative block w-full overflow-hidden rounded-2xl bg-muted outline-none focus-visible:shadow-adbox-focus-secondary">
          <img src={src} alt={alt} className={cn("max-h-[440px] w-full object-contain", className)} />
          <span className="absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-xl bg-grey-1000/70 text-white transition-colors group-hover/image:bg-secondary"><Expand className="size-4" aria-hidden="true" /></span>
        </button>
      </DialogTrigger>
      <DialogContent className="video-management-ui max-w-5xl gap-3 p-4 sm:p-6">
        <DialogTitle className="truncate pr-10 text-base">{alt}</DialogTitle>
        <DialogDescription className="sr-only">Expanded image. Click the image or press Escape to return.</DialogDescription>
        <DialogClose asChild>
          <button type="button" data-cursor="zoom-out" aria-label="Close expanded image" className="overflow-hidden rounded-xl bg-muted outline-none focus-visible:shadow-adbox-focus-secondary">
            <img src={src} alt={alt} className="max-h-[75svh] w-full object-contain" />
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
