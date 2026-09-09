import { useId, useRef, useState } from "react"
import { Check, ChevronLeft, ChevronRight, Folder, FolderOpen, Search, SearchX, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useUploadFolderStore } from "../../store/folder-store"
import type { UploadSchoolId } from "../../data/schools"
import type { MediaSelectionCounts } from "../../types/uploads"
import { CreateFolderDialog } from "./CreateFolderDialog"

const PAGE_SIZE = 6

type Props = {
  schoolId: UploadSchoolId
  selectedId: string
  selectionCounts: Record<string, MediaSelectionCounts>
  onSelect: (id: string) => void
}

function describeSelection(counts?: MediaSelectionCounts) {
  if (!counts || counts.videos + counts.photos === 0) return "No files selected"
  return [
    counts.videos > 0 && (counts.videos + (counts.videos === 1 ? " video" : " videos")),
    counts.photos > 0 && (counts.photos + (counts.photos === 1 ? " photo" : " photos")),
  ].filter(Boolean).join(" · ") + " selected"
}

export function UploadFolders({ schoolId, selectedId, selectionCounts, onSelect }: Props) {
  const allFolders = useUploadFolderStore((state) => state.folders)
  const selectionError = useUploadFolderStore((state) => state.selectionError)
  const folders = [{ id: "general", name: "General" }, ...allFolders.filter((folder) => folder.schoolId === schoolId)]
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState("name")
  const [page, setPage] = useState(1)
  const [announcement, setAnnouncement] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLFieldSetElement>(null)
  const browserId = useId()
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  const sortedFolders = sort === "recent"
    ? [...folders].reverse()
    : [...folders].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }))
  const matchingFolders = sortedFolders.filter((folder) => terms.every((term) => folder.name.toLocaleLowerCase().includes(term)))
  const pageCount = Math.max(1, Math.ceil(matchingFolders.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const visibleFolders = matchingFolders.slice(pageStart, pageStart + PAGE_SIZE)
  const selectedFolder = folders.find((folder) => folder.id === selectedId) ?? folders[0]
  const selectionVisible = visibleFolders.some((folder) => folder.id === selectedId)

  function clearSearch() {
    setQuery("")
    setPage(1)
    searchRef.current?.focus()
  }

  function showSelectedFolder() {
    setQuery("")
    setPage(Math.floor(sortedFolders.findIndex((folder) => folder.id === selectedId) / PAGE_SIZE) + 1)
    requestAnimationFrame(() => resultsRef.current?.querySelector<HTMLInputElement>("input:checked")?.focus())
  }

  return (
    <section aria-labelledby={browserId + "-heading"} className="video-folder-browser overflow-hidden rounded-3xl border border-border/80 bg-card">
      <div className="p-4 sm:p-5">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 id={browserId + "-heading"} className="font-heading text-lg font-semibold leading-7">Choose a folder</h3>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">Keep related content together.</p>
          </div>
          <CreateFolderDialog schoolId={schoolId} defaultName={query} onCreated={(folder) => {
            onSelect(folder.id)
            setQuery("")
            setSort("recent")
            setPage(1)
            setAnnouncement(folder.name + " created and selected.")
          }} />
        </div>

        <div className="video-folder-toolbar flex flex-col gap-3">
          <div className="relative min-w-0 flex-1">
            <label htmlFor={browserId + "-search"} className="sr-only">Search folders</label>
            <Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-muted-foreground" aria-hidden="true" />
            <Input
              ref={searchRef}
              id={browserId + "-search"}
              value={query}
              onChange={(event) => { setQuery(event.target.value); setPage(1) }}
              onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); clearSearch() } }}
              placeholder="Search existing folders…"
              autoComplete="off"
              aria-controls={browserId + "-results"}
              className="h-11 rounded-xl border-border bg-muted/30 pl-10 pr-11 focus-visible:border-secondary focus-visible:shadow-adbox-focus-secondary focus-visible:ring-0"
            />
            {query && <Button type="button" variant="ghost" size="icon" aria-label="Clear folder search" onClick={clearSearch} className="absolute right-0 top-0 size-11 rounded-xl text-muted-foreground"><X className="size-4" aria-hidden="true" /></Button>}
          </div>
          <Select value={sort} onValueChange={(value) => { setSort(value); setPage(1) }}>
            <SelectTrigger aria-label="Sort folders" className="h-11 w-full"><SelectValue /></SelectTrigger>
            <SelectContent className="video-management-ui">
              <SelectItem value="name">Name: A–Z</SelectItem>
              <SelectItem value="recent">Recently added</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-3 mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <p role="status" aria-atomic="true">{terms.length > 0 ? matchingFolders.length + " of " + folders.length : folders.length} {folders.length === 1 ? "folder" : "folders"}</p>
          <span>Choose one folder</span>
        </div>
        {matchingFolders.length > 0 ? (
          <fieldset ref={resultsRef} id={browserId + "-results"} className="min-w-0">
            <legend className="sr-only">Upload folders</legend>
            <div className="video-folder-grid grid grid-cols-1 gap-2">
              {visibleFolders.map((folder) => {
                const selected = selectedId === folder.id
                const Icon = selected ? FolderOpen : Folder
                return (
                  <label key={folder.id} className="relative min-w-0 cursor-pointer">
                    <input
                      type="radio"
                      name={browserId + "-selection"}
                      value={folder.id}
                      checked={selected}
                      onChange={() => { onSelect(folder.id); setAnnouncement(folder.name + " selected. New files will be grouped in this folder.") }}
                      aria-label={"Select folder: " + folder.name}
                      aria-describedby={browserId + "-count-" + folder.id}
                      className="peer sr-only"
                    />
                    <span className={cn("flex h-full min-h-20 items-center gap-3 rounded-xl border p-3 transition-colors peer-focus-visible:border-secondary peer-focus-visible:shadow-adbox-focus-secondary motion-reduce:transition-none", selected ? "border-secondary/40 bg-secondary/5" : "border-border bg-card hover:border-secondary/30 hover:bg-muted/40")}>
                      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", selected ? "bg-secondary/10 text-secondary" : "bg-warning-100 text-warning-700")}><Icon className="size-5" strokeWidth={1.6} aria-hidden="true" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-heading text-sm font-semibold" title={folder.name}>{folder.name}</span>
                        <span id={browserId + "-count-" + folder.id} className="mt-1.5 block text-xs leading-5 text-muted-foreground">{describeSelection(selectionCounts[folder.id])}</span>
                      </span>
                      <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border", selected ? "border-secondary bg-secondary text-secondary-foreground" : "border-border")} aria-hidden="true">
                        {selected && <Check className="size-3.5" strokeWidth={2.5} />}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        ) : (
          <div id={browserId + "-results"} className="flex flex-col items-center rounded-xl border border-dashed border-border bg-muted/20 px-5 py-9 text-center">
            <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><SearchX className="size-6" aria-hidden="true" /></span>
            <h4 className="font-heading text-base font-semibold">No folders found</h4>
            <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">Try another name or use New folder to create a group for this content.</p>
            <Button type="button" variant="outline" onClick={clearSearch} className="mt-4 h-11 rounded-xl px-4">Clear search</Button>
          </div>
        )}

        {pageCount > 1 && (
          <nav aria-label="Folder pages" className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">{pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, matchingFolders.length)} of {matchingFolders.length} folders</p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="icon" aria-label="Previous folder page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="size-11 rounded-xl"><ChevronLeft className="size-4" aria-hidden="true" /></Button>
              <span className="min-w-14 text-center text-xs tabular-nums text-muted-foreground" aria-live="polite">{currentPage} / {pageCount}</span>
              <Button type="button" variant="outline" size="icon" aria-label="Next folder page" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="size-11 rounded-xl"><ChevronRight className="size-4" aria-hidden="true" /></Button>
            </div>
          </nav>
        )}
      </div>

      <div className="border-t border-border/70 bg-secondary/5 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <FolderOpen className="size-5 shrink-0 text-secondary" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Selected folder</p>
              <p className="mt-1 break-words font-heading text-sm font-semibold" data-selected-folder>{selectedFolder.name}</p>
            </div>
          </div>
          {!selectionVisible && <Button type="button" variant="ghost" onClick={showSelectedFolder} className="h-11 rounded-xl text-secondary">Show folder<ChevronRight className="size-4" aria-hidden="true" /></Button>}
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">New files will be added to this group.</p>
      </div>
      <div className="border-t border-border/70 px-5 py-3 sm:px-6">
        <p className="text-xs leading-5 text-muted-foreground">Folders are saved in this browser. Selected files stay until you leave or reload this page.</p>
        {selectionError && <p role="alert" className="mt-2 text-xs leading-5 text-destructive">{selectionError}</p>}
      </div>
      <p className="sr-only" role="status">{announcement}</p>
    </section>
  )
}
