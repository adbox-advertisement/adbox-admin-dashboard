import { useEffect, useMemo, useState } from "react"
import { initialRdiSiteContent } from "../data"
import { useRdiCms } from "./use-rdi-cms"
import { cmsSnapshotToEditor } from "../api/mappers"
import type { RdiBlockType, RdiContentBlock, RdiContentItem, RdiPageContent, RdiPreviewSize, RdiSiteContent, RdiSiteSettings } from "../types"
import { makeId, cloneInitialContent, createBlock } from "../lib/editor"

type WorkspaceView = "editor" | "preview"
type EditorTarget = "page" | "footer"

export function useRdiEditor() {
  const cms = useRdiCms()

  const [content, setContent] = useState<RdiSiteContent>(cloneInitialContent)

  const [selectedPageId, setSelectedPageId] = useState(() => content.pages[0]?.id ?? "home")

  const [selectedBlockId, setSelectedBlockId] = useState(() => content.pages[0]?.blocks[0]?.id ?? "")

  const [editorTarget, setEditorTarget] = useState<EditorTarget>("page")

  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("preview")

  const [previewSize, setPreviewSize] = useState<RdiPreviewSize>("desktop")

  const [newBlockType, setNewBlockType] = useState<RdiBlockType>("split")

  const [isDirty, setIsDirty] = useState(false)

  const [saveMessage, setSaveMessage] = useState("Loading server content…")

  useEffect(() => {
    if (!cms.query.data || isDirty) return
    const serverContent = cmsSnapshotToEditor(cms.query.data)
    setContent(serverContent)
    setSelectedPageId((current) =>
      serverContent.pages.some(({ id }) => id === current)
        ? current
        : (serverContent.pages[0]?.id ?? "home"),
    )
    setSaveMessage("All changes saved to the RDI CMS")
  }, [cms.query.data, isDirty])

  useEffect(() => {
    if (cms.query.isError) {
      setSaveMessage("Could not load the RDI CMS. Check your access and connection.")
    }
  }, [cms.query.isError])

  const selectedPage = content.pages.find((page) => page.id === selectedPageId) ?? content.pages[0]

  const selectedBlock = selectedPage?.blocks.find((block) => block.id === selectedBlockId)

  const visibleSectionCount = useMemo(
    () => selectedPage?.blocks.filter((block) => block.visible).length ?? 0,
    [selectedPage]
  )

  const markChanged = () => {
    setIsDirty(true)
    setSaveMessage("Unsaved changes")
  }

  const updateSettings = (patch: Partial<RdiSiteSettings>) => {
    setContent((currentContent) => ({
      ...currentContent,
      settings: { ...currentContent.settings, ...patch },
    }))
    markChanged()
  }

  const updatePage = (patch: Partial<RdiPageContent>) => {
    setContent((currentContent) => ({
      ...currentContent,
      pages: currentContent.pages.map((page) =>
        page.id === selectedPage.id ? { ...page, ...patch, status: "Draft" } : page
      ),
    }))
    markChanged()
  }

  const updateBlock = (patch: Partial<RdiContentBlock>) => {
    if (!selectedBlock) return

    updatePage({
      blocks: selectedPage.blocks.map((block) =>
        block.id === selectedBlock.id ? { ...block, ...patch } : block
      ),
    })
  }

  const updateItem = (itemId: string, patch: Partial<RdiContentItem>) => {
    if (!selectedBlock) return

    updateBlock({
      items: selectedBlock.items?.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    })
  }

  const selectPage = (pageId: string) => {
    const page = content.pages.find((item) => item.id === pageId)
    if (!page) return

    setSelectedPageId(pageId)
    setSelectedBlockId(page.blocks[0]?.id ?? "")
    setEditorTarget("page")
  }

  const selectBlock = (blockId: string) => {
    setSelectedBlockId(blockId)
    setEditorTarget("page")
    setWorkspaceView("editor")
  }

  const loadWebsiteContent = () => {
    const websitePage = initialRdiSiteContent.pages.find((page) => page.id === selectedPageId)
    if (!websitePage) return
    updatePage({ blocks: structuredClone(websitePage.blocks) })
    setSelectedBlockId(websitePage.blocks[0]?.id ?? "")
    setEditorTarget("page")
    setSaveMessage("Website content loaded into this draft. Review before saving.")
  }

  const addBlock = () => {
    const newBlock = createBlock(newBlockType)
    updatePage({ blocks: [...selectedPage.blocks, newBlock] })
    setSelectedBlockId(newBlock.id)
    setEditorTarget("page")
  }

  const duplicateBlock = () => {
    if (!selectedBlock) return

    const duplicatedBlock: RdiContentBlock = {
      ...selectedBlock,
      id: makeId("section"),
      name: `${selectedBlock.name} copy`,
      items: selectedBlock.items?.map((item) => ({ ...item, id: makeId("item") })),
    }
    const selectedIndex = selectedPage.blocks.findIndex((block) => block.id === selectedBlock.id)
    const blocks = [...selectedPage.blocks]
    blocks.splice(selectedIndex + 1, 0, duplicatedBlock)
    updatePage({ blocks })
    setSelectedBlockId(duplicatedBlock.id)
  }

  const removeBlock = (blockId: string) => {
    const block = selectedPage.blocks.find((item) => item.id === blockId)
    if (!block || !window.confirm(`Remove “${block.name}” from this page?`)) return

    const remainingBlocks = selectedPage.blocks.filter((item) => item.id !== blockId)
    updatePage({ blocks: remainingBlocks })
    if (selectedBlockId === blockId) setSelectedBlockId(remainingBlocks[0]?.id ?? "")
  }

  const moveBlock = (blockId: string, direction: -1 | 1) => {
    const currentIndex = selectedPage.blocks.findIndex((block) => block.id === blockId)
    const nextIndex = currentIndex + direction
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= selectedPage.blocks.length) return

    const blocks = [...selectedPage.blocks]
    const [movedBlock] = blocks.splice(currentIndex, 1)
    blocks.splice(nextIndex, 0, movedBlock)
    updatePage({ blocks })
  }

  const addItem = () => {
    if (!selectedBlock) return

    const newItem: RdiContentItem =
      selectedBlock.type === "stats"
        ? { id: makeId("stat"), title: "100+", description: "Stat label" }
        : {
          id: makeId("item"),
          eyebrow: "Item label",
          title: "New card",
          description: "Add the supporting copy for this card.",
        }

    updateBlock({ items: [...(selectedBlock.items ?? []), newItem] })
  }

  const removeItem = (itemId: string) => {
    if (!selectedBlock) return
    updateBlock({ items: selectedBlock.items?.filter((item) => item.id !== itemId) })
  }

  const saveDraft = async (): Promise<number | undefined> => {
    if (!cms.query.data) {
      setSaveMessage("The CMS is not ready yet. Reload and try again.")
      return undefined
    }

    setSaveMessage("Saving draft…")
    try {
      const result =
        editorTarget === "footer"
          ? await cms.saveSettings.mutateAsync({
            current: cms.query.data.site,
            settings: content.settings,
          })
          : await cms.savePage.mutateAsync({
            current:
              cms.query.data.pages.find(({ key }) => key === selectedPage.id) ??
              (() => {
                throw new Error("Selected page is not available from the CMS")
              })(),
            page: selectedPage,
          })

      setIsDirty(false)
      setSaveMessage("Draft saved to the RDI CMS")
      await cms.query.refetch()
      return result.version
    } catch {
      setSaveMessage("The draft could not be saved. Reload if another editor changed it.")
      return undefined
    }
  }

  const publishPage = async () => {
    if (!cms.query.data) return
    setSaveMessage("Preparing publication…")
    let version =
      editorTarget === "footer"
        ? cms.query.data.site.version
        : cms.query.data.pages.find(({ key }) => key === selectedPage.id)?.version

    if (isDirty) version = await saveDraft()
    if (!version) return

    try {
      if (editorTarget === "footer") {
        await cms.publishSettings.mutateAsync(version)
        setSaveMessage("Global footer published")
      } else {
        await cms.publishPage.mutateAsync({ pageKey: selectedPage.id, version })
        setSaveMessage(`${selectedPage.navigationLabel} page published`)
      }
      setIsDirty(false)
      await cms.query.refetch()
    } catch {
      setSaveMessage("Publishing failed. Your saved draft is still safe.")
    }
  }

  const restoreSaved = async () => {
    if (isDirty && !window.confirm("Discard the unsaved RDI changes in this editing session?")) return

    const refreshed = await cms.query.refetch()
    if (!refreshed.data) {
      setSaveMessage("Could not reload the saved CMS draft")
      return
    }
    const savedContent = cmsSnapshotToEditor(refreshed.data)
    setContent(savedContent)
    const firstPage = savedContent.pages[0]
    setSelectedPageId(firstPage?.id ?? "home")
    setSelectedBlockId(firstPage?.blocks[0]?.id ?? "")
    setEditorTarget("page")
    setIsDirty(false)
    setSaveMessage("Latest CMS draft restored")
  }
  return {
    cms,
    content,
    editorTarget,
    setEditorTarget,
    workspaceView,
    setWorkspaceView,
    previewSize,
    setPreviewSize,
    newBlockType,
    setNewBlockType,
    isDirty,
    saveMessage,
    selectedPage,
    selectedBlock,
    visibleSectionCount,
    updateSettings,
    updateBlock,
    updateItem,
    selectPage,
    selectBlock,
    loadWebsiteContent,
    addBlock,
    duplicateBlock,
    removeBlock,
    moveBlock,
    addItem,
    removeItem,
    saveDraft,
    publishPage,
    restoreSaved,
  }
}
