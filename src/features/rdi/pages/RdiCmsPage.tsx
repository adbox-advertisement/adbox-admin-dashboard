import { ArrowDown, ArrowUp, Check, ChevronRight, CircleCheck, Download, Eye, EyeOff, FileText, Globe2, Laptop, LayoutTemplate, Link2, PanelBottom, PanelTop, Plus, RotateCcw, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RdiWebsitePreview } from "../components/preview/RdiWebsitePreview"
import type { RdiBlockType } from "../types"
import { cn } from "@/lib/utils"
import { StatusPill } from "../components/editor/StatusPill"
import { FooterEditor } from "../components/editor/FooterEditor"
import { BlockEditor } from "../components/editor/BlockEditor"
import { RdiMobileNavigationButton } from "../components/editor/RdiMobileNavigationButton"
import { blockTypeLabels } from "../lib/editor"
import { previewSizeOptions } from "../config/editor"
import { useRdiEditor } from "../hooks/use-rdi-editor"

export function RdiCmsPage() {
  const {
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
  } = useRdiEditor()
  if (!selectedPage) return null
  return (
    <div className="px-6 pb-12 pt-4 max-sm:px-4 max-sm:pb-10 max-sm:pt-3">
      <div className="sticky top-0 z-30 mb-5 rounded-2xl border border-grey-100 bg-white px-5 py-4 shadow-adbox-small max-sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <RdiMobileNavigationButton />
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#172033] text-white">
              <Globe2 className="size-5" strokeWidth={1.7} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-grey-1000">richdadinvestments.org</p>
                <StatusPill status={selectedPage.status} />
              </div>
              <p className={cn("mt-1 text-xs", isDirty ? "text-warning-700" : "text-grey-400")}>
                {saveMessage}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg bg-grey-100 p-1">
              {(["editor", "preview"] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setWorkspaceView(view)}
                  className={cn(
                    "flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold capitalize transition-colors",
                    workspaceView === view
                      ? "bg-white text-grey-1000 shadow-adbox-small"
                      : "text-grey-500 hover:text-grey-900"
                  )}
                >
                  {view === "editor" ? <LayoutTemplate className="size-3.5" /> : <Eye className="size-3.5" />}
                  {view === "editor" ? "Editor" : "Preview"}
                </button>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => void saveDraft()}
              disabled={!isDirty || cms.savePage.isPending || cms.saveSettings.isPending}
              className="h-10 border-grey-200 bg-white text-grey-700"
            >
              <Save className="size-4" />
              Save draft
            </Button>
            <Button
              type="button"
              onClick={() => void publishPage()}
              disabled={cms.publishPage.isPending || cms.publishSettings.isPending}
              className="h-10 bg-purple text-white hover:bg-purple/90"
            >
              <CircleCheck className="size-4" />
              {editorTarget === "footer" ? "Publish footer" : "Publish"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-12 gap-5 max-xl:grid-cols-1">
        <aside className="col-span-3 min-w-0 max-xl:col-span-1">
          <div className="sticky top-[100px] space-y-4 max-xl:static">
            <div className="rounded-2xl border border-grey-100 bg-white p-3 shadow-adbox-small">
              <div className="mb-2 flex items-center justify-between px-2 py-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-grey-400">Website pages</p>
                <span className="rounded-full bg-grey-100 px-2 py-0.5 text-[10px] font-semibold text-grey-500">
                  {content.pages.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditorTarget("footer")
                  setWorkspaceView("editor")
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                  editorTarget === "footer"
                    ? "bg-accent-background text-purple"
                    : "text-grey-600 hover:bg-grey-50 hover:text-grey-900"
                )}
              >
                <PanelBottom className="size-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">Global footer</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-semibold text-grey-400 shadow-adbox-small">
                  All pages
                </span>
                <ChevronRight className="size-4 shrink-0" />
              </button>

              <div className="my-2 h-px bg-grey-100" />

              <nav className="space-y-1" aria-label="RDI website pages">
                {content.pages.map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => selectPage(page.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                      editorTarget === "page" && page.id === selectedPage.id
                        ? "bg-purple text-white"
                        : "text-grey-600 hover:bg-grey-50 hover:text-grey-900"
                    )}
                  >
                    <FileText className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                      {page.navigationLabel}
                    </span>
                    {page.status === "Published" ? (
                      <Check className="size-3.5 shrink-0" />
                    ) : (
                      <span className="size-2 shrink-0 rounded-full bg-warning-500" />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="rounded-2xl border border-grey-100 bg-white p-3 shadow-adbox-small">
              <div className="mb-2 flex items-center justify-between px-2 py-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-grey-400">Page sections</p>
                <span className="text-[10px] font-semibold text-grey-400">
                  {visibleSectionCount}/{selectedPage.blocks.length} live
                </span>
              </div>

              <div className="space-y-1">
                {selectedPage.blocks.map((block, blockIndex) => (
                  <div
                    key={block.id}
                    className={cn(
                      "group flex items-center gap-1 rounded-xl pr-1 transition-colors",
                      editorTarget === "page" && block.id === selectedBlock?.id
                        ? "bg-accent-background"
                        : "hover:bg-grey-50"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => selectBlock(block.id)}
                      className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-3 text-left"
                    >
                      <span
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold",
                          editorTarget === "page" && block.id === selectedBlock?.id
                            ? "bg-white text-purple shadow-adbox-small"
                            : "bg-grey-100 text-grey-500"
                        )}
                      >
                        {blockIndex + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-grey-800">{block.name}</span>
                        <span className="mt-0.5 block truncate text-[9px] capitalize text-grey-400">
                          {blockTypeLabels[block.type]}
                        </span>
                      </span>
                      {!block.visible ? <EyeOff className="size-3.5 shrink-0 text-grey-400" /> : null}
                    </button>

                    <div className="hidden items-center group-hover:flex group-focus-within:flex">
                      <button
                        type="button"
                        onClick={() => moveBlock(block.id, -1)}
                        disabled={blockIndex === 0}
                        className="flex size-6 items-center justify-center rounded text-grey-400 hover:bg-white hover:text-grey-800 disabled:opacity-30"
                        aria-label={`Move ${block.name} up`}
                      >
                        <ArrowUp className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(block.id, 1)}
                        disabled={blockIndex === selectedPage.blocks.length - 1}
                        className="flex size-6 items-center justify-center rounded text-grey-400 hover:bg-white hover:text-grey-800 disabled:opacity-30"
                        aria-label={`Move ${block.name} down`}
                      >
                        <ArrowDown className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBlock(block.id)}
                        className="flex size-6 items-center justify-center rounded text-grey-400 hover:bg-error-50 hover:text-error-700"
                        aria-label={`Remove ${block.name}`}
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2 border-t border-grey-100 pt-3">
                <select
                  value={newBlockType}
                  onChange={(event) => setNewBlockType(event.target.value as RdiBlockType)}
                  className="h-10 min-w-0 rounded-lg border border-grey-200 bg-white px-3 text-xs font-semibold text-grey-700 outline-none focus:border-purple focus:ring-2 focus:ring-purple/10"
                  aria-label="New section type"
                >
                  {Object.entries(blockTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  size="icon"
                  onClick={addBlock}
                  className="size-10 bg-grey-1000 text-white hover:bg-grey-800"
                  aria-label="Add section"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>

            <button
              type="button"
              onClick={loadWebsiteContent}
              disabled={isDirty}
              title={isDirty ? "Save or restore your changes before loading website content" : "Load the website content reviewed on 8 September 2026 into this page’s draft"}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-grey-200 bg-white px-3 py-2 text-xs font-semibold text-grey-700 transition-colors hover:bg-grey-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="size-3.5" />
              Load website content
            </button>

            <button
              type="button"
              onClick={() => void restoreSaved()}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-grey-400 transition-colors hover:bg-white hover:text-grey-700"
            >
              <RotateCcw className="size-3.5" />
              Restore saved version
            </button>
          </div>
        </aside>

        <div className="col-span-9 min-w-0 max-xl:col-span-1">
          {workspaceView === "preview" ? (
            <div className="rounded-2xl border border-grey-100 bg-[#e8edf5] p-5 shadow-adbox-small max-sm:p-3">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-grey-900">{selectedPage.navigationLabel} page preview</p>
                  <p className="mt-1 text-xs text-grey-400">Explore the website, or use a section’s Edit button to change its content.</p>
                </div>
                <div className="flex rounded-lg bg-grey-100 p-1" aria-label="Preview width">
                  {previewSizeOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPreviewSize(option.id)}
                      className={cn(
                        "flex h-8 w-auto items-center justify-center gap-1.5 rounded-md px-3 transition-colors max-sm:size-8 max-sm:px-0",
                        previewSize === option.id
                          ? "bg-white text-grey-1000 shadow-adbox-small"
                          : "text-grey-400 hover:text-grey-700"
                      )}
                      aria-label={`${option.label} preview`}
                    >
                      <option.icon className="size-3.5" />
                      <span className="text-[10px] font-semibold max-sm:hidden">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto pb-1">
                <RdiWebsitePreview
                  settings={content.settings}
                  pages={content.pages}
                  page={selectedPage}
                  previewSize={previewSize}
                  onSelectBlock={selectBlock}
                  onNavigatePage={selectPage}
                  onEditFooter={() => {
                    setEditorTarget("footer")
                    setWorkspaceView("editor")
                  }}
                />
              </div>
            </div>
          ) : editorTarget === "footer" ? (
            <FooterEditor
              settings={content.settings}
              pageCount={content.pages.length}
              onChange={updateSettings}
            />
          ) : (
            <div className="space-y-5">
              {selectedBlock ? (
                <BlockEditor
                  block={selectedBlock}
                  pageId={selectedPage.id}
                  onChange={updateBlock}
                  onItemChange={updateItem}
                  onAddItem={addItem}
                  onRemoveItem={removeItem}
                  onDuplicate={duplicateBlock}
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-grey-300 bg-white px-6 py-16 text-center">
                  <PanelTop className="mx-auto size-9 text-grey-300" />
                  <p className="mt-4 text-sm font-semibold text-grey-700">This page has no sections.</p>
                  <p className="mt-1 text-xs text-grey-400">Choose a section type on the left, then add it to begin.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-grey-100 bg-white px-4 py-3 text-xs text-grey-400 shadow-adbox-small">
        <span className="flex items-center gap-2">
          <Laptop className="size-3.5" />
          Production CMS · Drafts, publishing, and media are stored securely on the server
        </span>
        <a
          href="https://www.richdadinvestments.org/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 font-semibold text-purple hover:underline"
        >
          <Link2 className="size-3.5" />
          Open live RDI website
        </a>
      </div>
    </div>
  )
}
