import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronDown, Upload } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useUploadFolderStore } from "../../store/folder-store"
import type { UploadSchoolId } from "../../data/schools"
import type { MediaKind, MediaSelectionCounts, UploadDestination } from "../../types/uploads"
import { MediaUpload } from "./MediaUpload"
import { UploadFolders } from "../folders/UploadFolders"

type CountChangeHandler = (folderId: string, kind: MediaKind, count: number) => void

function FolderUploadPanel({ schoolId, folderId, name, active, onCountChange }: UploadDestination & {
  name: string
  active: boolean
  onCountChange: CountChangeHandler
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!active) panelRef.current?.querySelectorAll("video").forEach((video) => video.pause())
  }, [active])
  const reportCount = useCallback((kind: MediaKind, count: number) => {
    onCountChange(folderId, kind, count)
  }, [folderId, onCountChange])

  return (
    <Collapsible ref={panelRef} defaultOpen onOpenChange={(open) => { if (!open) panelRef.current?.querySelectorAll("video").forEach((video) => video.pause()) }} className="overflow-hidden rounded-3xl border border-border bg-card">
      <h3>
        <CollapsibleTrigger className="group flex w-full items-center gap-3 p-5 text-left outline-none hover:bg-muted/50 focus-visible:shadow-adbox-focus-secondary sm:px-6">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Upload className="size-5" aria-hidden="true" /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-heading text-h5 font-semibold">Upload content</span>
            <span className="mt-1 block truncate text-xs font-normal text-muted-foreground" title={name}>Adding to {name}</span>
          </span>
          <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
        </CollapsibleTrigger>
      </h3>
      <CollapsibleContent forceMount className="border-t border-border data-[state=closed]:hidden">
        <MediaUpload schoolId={schoolId} folderId={folderId} onCountChange={reportCount} />
      </CollapsibleContent>
    </Collapsible>
  )
}

export function SchoolUploadWorkspace({ schoolId, active }: { schoolId: UploadSchoolId; active: boolean }) {
  const folders = useUploadFolderStore((state) => state.folders)
  const savedId = useUploadFolderStore((state) => state.selectedBySchool[schoolId])
  const saveSelection = useUploadFolderStore((state) => state.selectFolder)
  const selectedId = savedId && folders.some((folder) => folder.schoolId === schoolId && folder.id === savedId) ? savedId : "general"
  const [visitedIds, setVisitedIds] = useState([selectedId])
  const [selectionCounts, setSelectionCounts] = useState<Record<string, MediaSelectionCounts>>({})
  // Keep visited folders mounted so switching destinations preserves each draft.
  const mountedIds = visitedIds.includes(selectedId) ? visitedIds : [...visitedIds, selectedId]

  const updateCount = useCallback<CountChangeHandler>((folderId, kind, count) => {
    setSelectionCounts((current) => {
      const previous = current[folderId] ?? { videos: 0, photos: 0 }
      if (previous[kind] === count) return current
      return { ...current, [folderId]: { ...previous, [kind]: count } }
    })
  }, [])

  function selectFolder(id: string) {
    setVisitedIds((current) => [...new Set([...current, selectedId, id])])
    saveSelection(schoolId, id)
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 min-[480px]:grid-cols-4 md:grid-cols-6 xl:grid-cols-12">
      <aside className="min-w-0 min-[480px]:col-span-4 md:col-span-6 xl:col-span-4"><UploadFolders schoolId={schoolId} selectedId={selectedId} selectionCounts={selectionCounts} onSelect={selectFolder} /></aside>
      {mountedIds.map((id) => {
        const name = id === "general" ? "General" : folders.find((folder) => folder.schoolId === schoolId && folder.id === id)?.name ?? "Folder"
        return <div key={id} hidden={selectedId !== id} data-folder={id} className="min-w-0 min-[480px]:col-span-4 md:col-span-6 xl:col-span-8">
          <FolderUploadPanel schoolId={schoolId} folderId={id} name={name} active={active && selectedId === id} onCountChange={updateCount} />
        </div>
      })}
    </div>
  )
}
