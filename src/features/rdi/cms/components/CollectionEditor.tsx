import { useState } from "react"
import { ArrowDown, ArrowUp, ChevronDown, Copy, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CmsCollectionDefinition, CmsCollectionEntry } from "../types"
import { useCmsStore } from "../store"
import { ContentField } from "./ContentField"
import { CmsButton } from "./CmsButton"
import { ConfirmDialog } from "./ConfirmDialog"
export function CollectionEditor({ definition }: {
  definition: CmsCollectionDefinition
}) {
  const customEntries = useCmsStore(state => state.draft.collections[definition.id])
  const entries = customEntries ?? definition.entries
  const [expanded, setExpanded] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  const update = (next: CmsCollectionEntry[]) => useCmsStore.getState().change(draft => ({ ...draft, collections: { ...draft.collections, [definition.id]: next } }))
  const move = (index: number, direction: number) => { const next = [...entries];[next[index], next[index + direction]] = [next[index + direction], next[index]]; update(next) }
  const label = (entry: CmsCollectionEntry) => entry.values.title ?? entry.values.name ?? entry.values.question ?? "Item"
  return <div className="space-y-3">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="font-heading text-lg font-semibold">
        {definition.label}
      </h3>
      <span className="rounded-full bg-grey-100 px-2.5 py-1 text-xs text-grey-500">
        {entries.length}
      </span>
    </div>
    {entries.map((entry, index) => <div key={entry.id} className={cn("overflow-hidden rounded-xl border bg-white", expanded === entry.id ? "border-blue/30" : "border-grey-200")}>
      <button type="button" aria-expanded={expanded === entry.id} aria-controls={`collection-${entry.id}`} onClick={() => setExpanded(expanded === entry.id ? null : entry.id)} className="flex w-full items-center gap-3 p-3.5 text-left">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-grey-100 text-xs text-grey-500">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">
          {label(entry) || "Untitled item"}
        </span>
        <ChevronDown className={cn("size-4 shrink-0 text-grey-400 transition-transform", expanded === entry.id && "rotate-180")} />
      </button>
      {expanded === entry.id && <div id={`collection-${entry.id}`} className="space-y-5 border-t border-grey-100 p-4">
        {definition.fields.filter(field => field.id in entry.values).map(field => <ContentField key={field.id} field={field} value={entry.values[field.id] ?? field.value} onChange={value => update(entries.map(item => item.id === entry.id ? { ...item, values: { ...item.values, [field.id]: value } } : item))} />)}
        {!definition.fixed && <div className="flex flex-wrap items-center justify-between gap-2 border-t border-grey-100 pt-4">
          <div className="flex gap-1">
            <CmsButton className="size-8 p-0" aria-label={`Move ${label(entry)} up`} disabled={index === 0} onClick={() => move(index, -1)}>
              <ArrowUp className="size-3.5" />
            </CmsButton>
            <CmsButton className="size-8 p-0" aria-label={`Move ${label(entry)} down`} disabled={index === entries.length - 1} onClick={() => move(index, 1)}>
              <ArrowDown className="size-3.5" />
            </CmsButton>
            <CmsButton className="size-8 p-0" aria-label={`Duplicate ${label(entry)}`} disabled={entries.length >= 100} onClick={() => { const copy = { ...entry, id: crypto.randomUUID(), values: { ...entry.values } }; update([...entries.slice(0, index + 1), copy, ...entries.slice(index + 1)]); setExpanded(copy.id) }}>
              <Copy className="size-3.5" />
            </CmsButton>
          </div>
          <CmsButton className="h-8 px-2 text-xs text-error-700" disabled={entries.length === 1} onClick={() => setRemoving(entry.id)}>
            <Trash2 className="size-3.5" />
            Remove
          </CmsButton>
        </div>}
      </div>}
    </div>)}
    {!definition.fixed && <CmsButton className="mt-2 h-11 w-full border-dashed text-blue" disabled={entries.length >= 100} onClick={() => {
      const item = { ...definition.entries[0], id: crypto.randomUUID(), values: { ...definition.entries[0].values } }; for (const key of ["title", "name", "question"])
        if (key in item.values)
          item.values[key] = "New item"; if ("description" in item.values)
        item.values.description = ""; update([...entries, item]); setExpanded(item.id)
    }}>
      <Plus className="size-4" />
      Add item
    </CmsButton>}
    <ConfirmDialog open={removing !== null} onOpenChange={open => {
      if (!open)
        setRemoving(null)
    }} title="Remove this item?" description="It will be removed from this page. You can undo this change in the editor." action="Remove item" onConfirm={() => update(entries.filter(entry => entry.id !== removing))} />
  </div>
}
