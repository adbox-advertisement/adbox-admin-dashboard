import { beforeEach, describe, expect, it, vi } from "vitest"

const STORAGE_KEY = "adbox-rdi-cms-v1"

// store.ts computes its initial draft from localStorage at MODULE LOAD time
// and is a module-scoped singleton, so each test needs a fresh module
// instance (via resetModules + dynamic import) to control that initial state
// and to avoid leaking history between tests.
async function freshStore() {
  vi.resetModules()
  const mod = await import("./store")
  return mod.useCmsStore
}

describe("useCmsStore", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("starts with an empty draft and 'saved' state when nothing is stored", async () => {
    const useCmsStore = await freshStore()
    const state = useCmsStore.getState()
    expect(state.draft.values).toEqual({})
    expect(state.saveState).toBe("saved")
    expect(state.error).toBeNull()
  })

  it("recovers from a corrupted stored draft with an error state and an empty draft", async () => {
    window.localStorage.setItem(STORAGE_KEY, "{not valid json")
    const useCmsStore = await freshStore()
    const state = useCmsStore.getState()
    expect(state.saveState).toBe("error")
    expect(state.error).toMatch(/could not be read/)
    expect(state.draft.values).toEqual({})
  })

  it("loads a valid previously-saved draft", async () => {
    const saved = { version: 1, values: { "home.welcome.1": "Hi" }, hiddenSections: [], collections: {}, assets: [], seo: {}, updatedAt: "2026-01-01T00:00:00.000Z" }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    const useCmsStore = await freshStore()
    expect(useCmsStore.getState().draft.values["home.welcome.1"]).toBe("Hi")
    expect(useCmsStore.getState().saveState).toBe("saved")
  })

  it("change() updates the draft, stamps updatedAt, and marks state as saving", async () => {
    const useCmsStore = await freshStore()
    useCmsStore.getState().change((draft) => ({ ...draft, values: { ...draft.values, x: "1" } }))
    const state = useCmsStore.getState()
    expect(state.draft.values.x).toBe("1")
    expect(state.saveState).toBe("saving")
    expect(state.draft.updatedAt).not.toBeNull()
  })

  it("undo reverts the last change and redo reapplies it", async () => {
    const useCmsStore = await freshStore()
    useCmsStore.getState().change((draft) => ({ ...draft, values: { x: "1" } }))
    useCmsStore.getState().change((draft) => ({ ...draft, values: { x: "2" } }))
    useCmsStore.getState().undo()
    expect(useCmsStore.getState().draft.values.x).toBe("1")
    useCmsStore.getState().redo()
    expect(useCmsStore.getState().draft.values.x).toBe("2")
  })

  it("undo is a no-op with nothing in history", async () => {
    const useCmsStore = await freshStore()
    const before = useCmsStore.getState().draft
    useCmsStore.getState().undo()
    expect(useCmsStore.getState().draft).toBe(before)
  })

  it("a new change clears the redo stack", async () => {
    const useCmsStore = await freshStore()
    useCmsStore.getState().change((draft) => ({ ...draft, values: { x: "1" } }))
    useCmsStore.getState().undo()
    expect(useCmsStore.getState().future).toHaveLength(1)
    useCmsStore.getState().change((draft) => ({ ...draft, values: { x: "3" } }))
    expect(useCmsStore.getState().future).toHaveLength(0)
  })

  it("save() persists the draft and sets saveState to 'saved'", async () => {
    const useCmsStore = await freshStore()
    useCmsStore.getState().change((draft) => ({ ...draft, values: { x: "1" } }))
    useCmsStore.getState().save()
    expect(useCmsStore.getState().saveState).toBe("saved")
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!).values.x).toBe("1")
  })

  it("save() sets an error state when localStorage.setItem throws", async () => {
    const useCmsStore = await freshStore()
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError")
    })
    useCmsStore.getState().change((draft) => ({ ...draft, values: { x: "1" } }))
    useCmsStore.getState().save()
    expect(useCmsStore.getState().saveState).toBe("error")
    expect(useCmsStore.getState().error).toMatch(/couldn.t save your changes/)
    spy.mockRestore()
  })

  it("restore() replaces the whole draft and keeps the previous one for undo", async () => {
    const useCmsStore = await freshStore()
    useCmsStore.getState().change((draft) => ({ ...draft, values: { x: "1" } }))
    useCmsStore.getState().restore({ ...useCmsStore.getState().draft, values: { x: "restored" } })
    expect(useCmsStore.getState().draft.values.x).toBe("restored")
    useCmsStore.getState().undo()
    expect(useCmsStore.getState().draft.values.x).toBe("1")
  })

  it("receive() replaces the draft without touching history and marks it saved", async () => {
    const useCmsStore = await freshStore()
    useCmsStore.getState().change((draft) => ({ ...draft, values: { x: "1" } }))
    useCmsStore.getState().receive({ ...useCmsStore.getState().draft, values: { x: "from-another-tab" } })
    const state = useCmsStore.getState()
    expect(state.draft.values.x).toBe("from-another-tab")
    expect(state.past).toHaveLength(0)
    expect(state.saveState).toBe("saved")
  })
})
