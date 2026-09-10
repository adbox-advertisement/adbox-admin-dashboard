import { create } from "zustand"
import { CMS_STORAGE_KEY, cmsDraftSchema, emptyDraft } from "./lib/document"
import type { CmsDraft } from "./types"
type SaveState = "saved" | "saving" | "error"
type CmsStore = {
  draft: CmsDraft
  past: CmsDraft[]
  future: CmsDraft[]
  saveState: SaveState
  error: string | null
  change: (update: (draft: CmsDraft) => CmsDraft) => void
  undo: () => void
  redo: () => void
  restore: (draft: CmsDraft) => void
  receive: (draft: CmsDraft) => void
  save: () => void
}
let timer: ReturnType<typeof setTimeout> | undefined
let initialDraft = emptyDraft()
let initialError: string | null = null
try {
  const stored = localStorage.getItem(CMS_STORAGE_KEY)
  if (stored)
    initialDraft = cmsDraftSchema.parse(JSON.parse(stored))
}
catch {
  initialError = "The saved draft could not be read. Original website content is shown. Import a backup to recover your changes."
}
function queueSave() {
  clearTimeout(timer)
  timer = setTimeout(() => useCmsStore.getState().save(), 450)
}
export const useCmsStore = create<CmsStore>((set, get) => ({
  draft: initialDraft, past: [], future: [], saveState: initialError ? "error" : "saved", error: initialError,
  change: update => {
    const current = get().draft
    const draft = { ...update(current), updatedAt: new Date().toISOString() }
    set(state => ({ draft, past: [...state.past.slice(-29), current], future: [], saveState: "saving", error: null }))
    queueSave()
  },
  undo: () => {
    const state = get(), previous = state.past[state.past.length - 1]
    if (!previous)
      return
    set({ draft: { ...previous, updatedAt: new Date().toISOString() }, past: state.past.slice(0, -1), future: [state.draft, ...state.future], saveState: "saving" })
    queueSave()
  },
  redo: () => {
    const state = get(), next = state.future[0]
    if (!next)
      return
    set({ draft: { ...next, updatedAt: new Date().toISOString() }, past: [...state.past, state.draft], future: state.future.slice(1), saveState: "saving" })
    queueSave()
  },
  restore: draft => get().change(() => draft),
  receive: draft => {
    clearTimeout(timer)
    set({ draft, past: [], future: [], saveState: "saved", error: null })
  },
  save: () => {
    clearTimeout(timer)
    try {
      localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(get().draft))
      set({ saveState: "saved", error: null })
    }
    catch {
      set({ saveState: "error", error: "This browser couldn’t save your changes. Export a backup before leaving, or remove an unused uploaded image and try again." })
    }
  },
}))
window.addEventListener("beforeunload", event => {
  const state = useCmsStore.getState()
  if (state.saveState === "saving")
    state.save()
  if (useCmsStore.getState().saveState === "error" && state.past.length) {
    event.preventDefault()
    event.returnValue = ""
  }
})
window.addEventListener("storage", event => {
  if (event.key !== CMS_STORAGE_KEY || !event.newValue)
    return
  const result = (() => {
    try {
      return cmsDraftSchema.safeParse(JSON.parse(event.newValue))
    }
    catch {
      return null
    }
  })()
  if (!result?.success)
    return
  const state = useCmsStore.getState()
  if (state.saveState === "saved")
    state.receive(result.data)
})
