import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronRight,
  CircleCheck,
  Copy,
  Eye,
  EyeOff,
  FileText,
  Globe2,
  Laptop,
  LayoutTemplate,
  Link2,
  Menu,
  Monitor,
  PanelBottom,
  PanelTop,
  Plus,
  RotateCcw,
  Save,
  Tablet,
  Trash2,
} from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"

import {
  DashboardSheetNavigation,
  DashboardSidebar,
} from "@/components/layout/DashboardSidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { RdiMediaField } from "@/features/rdi/components/RdiMediaField"
import { RdiWebsitePreview } from "@/features/rdi/components/RdiWebsitePreview"
import { initialRdiSiteContent, RDI_STORAGE_KEY } from "@/features/rdi/data"
import type {
  RdiBlockType,
  RdiContentBlock,
  RdiContentItem,
  RdiPageContent,
  RdiPreviewSize,
  RdiSiteContent,
  RdiSiteSettings,
} from "@/features/rdi/types"
import { cn } from "@/lib/utils"

type WorkspaceView = "editor" | "preview"
type EditorTarget = "page" | "footer"

const blockTypeLabels: Record<RdiBlockType, string> = {
  hero: "Hero banner",
  split: "Text + media",
  cards: "Card collection",
  stats: "Impact numbers",
  cta: "Call to action",
}

const previewSizeOptions: Array<{
  id: RdiPreviewSize
  label: string
  icon: typeof Monitor
}> = [
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "tablet", label: "Tablet", icon: Tablet },
]

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}`
}

function cloneInitialContent() {
  return JSON.parse(JSON.stringify(initialRdiSiteContent)) as RdiSiteContent
}

function readSavedContent() {
  if (typeof window === "undefined") return cloneInitialContent()

  try {
    const savedContent = window.localStorage.getItem(RDI_STORAGE_KEY)
    if (!savedContent) return cloneInitialContent()

    const parsedContent = JSON.parse(savedContent) as RdiSiteContent
    if (
      parsedContent.version !== initialRdiSiteContent.version ||
      !parsedContent.pages?.length ||
      !parsedContent.settings
    ) {
      return cloneInitialContent()
    }

    return parsedContent
  } catch {
    return cloneInitialContent()
  }
}

function createBlock(type: RdiBlockType): RdiContentBlock {
  const baseBlock = {
    id: makeId("section"),
    type,
    name: blockTypeLabels[type],
    visible: true,
    eyebrow: "Section label",
    title: "Add a clear section heading",
    description: "Write a short description that helps visitors understand this section.",
  }

  if (type === "hero") {
    return {
      ...baseBlock,
      buttonLabel: "Primary action",
      buttonHref: "/contact",
      secondaryButtonLabel: "Secondary action",
      secondaryButtonHref: "/about",
      media: { type: "image", url: "", alt: "" },
    }
  }

  if (type === "split") {
    return {
      ...baseBlock,
      buttonLabel: "Learn more",
      buttonHref: "/about",
      media: { type: "image", url: "", alt: "" },
    }
  }

  if (type === "cards") {
    return {
      ...baseBlock,
      items: [
        {
          id: makeId("item"),
          eyebrow: "Item label",
          title: "New card",
          description: "Add the supporting copy for this card.",
        },
      ],
    }
  }

  if (type === "stats") {
    return {
      ...baseBlock,
      items: [{ id: makeId("stat"), title: "100+", description: "Stat label" }],
    }
  }

  return {
    ...baseBlock,
    buttonLabel: "Get started",
    buttonHref: "/contact",
  }
}

function EditorCard({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-grey-100 bg-white shadow-adbox-small">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-grey-100 px-6 py-5 max-sm:px-5">
        <div>
          <h2 className="text-base font-semibold text-grey-1000">{title}</h2>
          {description ? <p className="mt-1 text-xs leading-5 text-grey-400">{description}</p> : null}
        </div>
        {actions}
      </div>
      <div className="p-6 max-sm:p-5">{children}</div>
    </section>
  )
}

function FieldLabel({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-grey-600">
        {label}
        {hint ? <span className="font-normal text-grey-400">{hint}</span> : null}
      </span>
      {children}
    </label>
  )
}

function EditorInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hint?: string
  type?: "text" | "url"
}) {
  return (
    <FieldLabel label={label} hint={hint}>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 border-grey-200 bg-white text-sm text-grey-900 placeholder:text-grey-300"
      />
    </FieldLabel>
  )
}

function EditorTextarea({
  label,
  value,
  onChange,
  rows = 4,
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
  hint?: string
}) {
  return (
    <FieldLabel label={label} hint={hint}>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="w-full resize-y rounded-lg border border-grey-200 bg-white px-3 py-3 text-sm leading-6 text-grey-900 outline-none transition-shadow placeholder:text-grey-300 focus:border-grey-400 focus:ring-2 focus:ring-purple/10"
      />
    </FieldLabel>
  )
}

function StatusPill({ status }: { status: RdiPageContent["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold",
        status === "Published"
          ? "bg-success-100 text-success-800"
          : "bg-warning-100 text-warning-800"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "Published" ? "bg-success-600" : "bg-warning-600"
        )}
      />
      {status}
    </span>
  )
}

function FooterEditor({
  settings,
  pageCount,
  onChange,
}: {
  settings: RdiSiteSettings
  pageCount: number
  onChange: (patch: Partial<RdiSiteSettings>) => void
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-2xl border border-purple/15 bg-accent-background px-5 py-4 text-purple shadow-adbox-small">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-adbox-small">
          <PanelBottom className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold">Global website footer</p>
          <p className="mt-1 text-xs leading-5 text-grey-500">
            This footer is shared across all {pageCount} RDI pages. Edit it once and every page updates.
          </p>
        </div>
      </div>

      <EditorCard title="Footer navigation" description="The division and company links shown at the bottom of every website page.">
        <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
          <div>
            <EditorInput
              label="Divisions heading"
              value={settings.footerQuickLinksHeading}
              onChange={(footerQuickLinksHeading) => onChange({ footerQuickLinksHeading })}
            />
          </div>
          <div>
            <EditorInput
              label="Company heading"
              value={settings.footerServicesHeading}
              onChange={(footerServicesHeading) => onChange({ footerServicesHeading })}
            />
          </div>
          <div>
            <EditorTextarea
              label="Division links"
              hint="One item per line"
              value={settings.footerQuickLinks.join("\n")}
              onChange={(value) => onChange({ footerQuickLinks: value.split("\n") })}
              rows={6}
            />
          </div>
          <div>
            <EditorTextarea
              label="Company links"
              hint="One item per line"
              value={settings.footerServices.join("\n")}
              onChange={(value) => onChange({ footerServices: value.split("\n") })}
              rows={6}
            />
          </div>
          <div className="col-span-2 max-sm:col-span-1">
            <EditorInput
              label="Brand description"
              value={settings.footerDescription}
              onChange={(footerDescription) => onChange({ footerDescription })}
            />
          </div>
        </div>
      </EditorCard>

      <EditorCard title="Footer contact" description="Edit the contact details and copyright line shown in the footer.">
        <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
          <EditorInput
            label="Contact heading"
            value={settings.footerContactHeading}
            onChange={(footerContactHeading) => onChange({ footerContactHeading })}
          />
          <EditorInput
            label="Phone number"
            value={settings.contactPhone}
            onChange={(contactPhone) => onChange({ contactPhone })}
          />
          <div className="col-span-2 max-sm:col-span-1">
            <EditorTextarea
              label="Address"
              value={settings.contactAddress}
              onChange={(contactAddress) => onChange({ contactAddress })}
              rows={3}
            />
          </div>
          <EditorInput
            label="Email address"
            value={settings.contactEmail}
            onChange={(contactEmail) => onChange({ contactEmail })}
          />
          <div className="col-span-2 max-sm:col-span-1">
            <EditorInput
              label="Copyright line"
              value={settings.copyright}
              onChange={(copyright) => onChange({ copyright })}
            />
          </div>
        </div>
      </EditorCard>
    </div>
  )
}

function ItemEditor({
  item,
  blockId,
  blockType,
  itemIndex,
  onChange,
  onRemove,
}: {
  item: RdiContentItem
  blockId: string
  blockType: RdiBlockType
  itemIndex: number
  onChange: (patch: Partial<RdiContentItem>) => void
  onRemove: () => void
}) {
  const isStat = blockType === "stats"
  const isHomeDivision = blockId === "home-divisions"
  const hasFeatures = isHomeDivision || Boolean(item.features?.length)
  const hasButton = isHomeDivision || item.buttonLabel !== undefined || item.buttonHref !== undefined

  return (
    <details open={itemIndex === 0} className="group rounded-xl border border-grey-200 bg-grey-50/60">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple/20">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-purple shadow-adbox-small">
          {itemIndex + 1}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-grey-900">
          {item.title || (isStat ? "Untitled stat" : "Untitled card")}
        </span>
        <ChevronRight className="size-4 shrink-0 text-grey-400 transition-transform group-open:rotate-90" />
      </summary>

      <div className="space-y-5 border-t border-grey-200 p-4">
        {!isStat && !isHomeDivision && item.eyebrow !== undefined ? (
          <EditorInput
            label="Item label"
            value={item.eyebrow ?? ""}
            onChange={(eyebrow) => onChange({ eyebrow })}
            placeholder="Optional category or label"
          />
        ) : null}
        <EditorInput
          label={isStat ? "Number or value" : "Item heading"}
          value={item.title}
          onChange={(title) => onChange({ title })}
        />
        <EditorTextarea
          label={isStat ? "Stat label" : "Item description"}
          value={item.description}
          onChange={(description) => onChange({ description })}
          rows={isStat ? 2 : 3}
        />

        {!isStat && (hasFeatures || hasButton) ? (
          <>
            {hasFeatures ? (
              <EditorTextarea
                label="Feature list"
                hint="One visible item per line"
                value={(item.features ?? []).join("\n")}
                onChange={(value) => onChange({ features: value.split("\n").filter(Boolean) })}
                rows={4}
              />
            ) : null}
            {hasButton ? (
              <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
                <EditorInput
                  label="Button text"
                  value={item.buttonLabel ?? ""}
                  onChange={(buttonLabel) => onChange({ buttonLabel })}
                />
                <EditorInput
                  label="Button destination"
                  value={item.buttonHref ?? ""}
                  onChange={(buttonHref) => onChange({ buttonHref })}
                  placeholder="/page or https://..."
                />
              </div>
            ) : null}
          </>
        ) : null}

        {!isStat && item.media ? (
          <div className="rounded-xl border border-grey-200 bg-white p-4">
            <RdiMediaField media={item.media} onChange={(media) => onChange({ media })} />
          </div>
        ) : null}

        <div className="flex justify-end border-t border-grey-200 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onRemove}
            className="h-9 text-error-700 hover:bg-error-50 hover:text-error-800"
          >
            <Trash2 className="size-4" />
            Remove item
          </Button>
        </div>
      </div>
    </details>
  )
}

function BlockEditor({
  block,
  pageId,
  onChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onDuplicate,
}: {
  block: RdiContentBlock
  pageId: string
  onChange: (patch: Partial<RdiContentBlock>) => void
  onItemChange: (itemId: string, patch: Partial<RdiContentItem>) => void
  onAddItem: () => void
  onRemoveItem: (itemId: string) => void
  onDuplicate: () => void
}) {
  const isHomeHero = pageId === "home" && block.id === "home-hero"
  const isHomeDivisions = pageId === "home" && block.id === "home-divisions"
  const isHomeGuidance = pageId === "home" && block.id === "home-cta"
  const hasButton =
    (block.type === "hero" || block.type === "split" || block.type === "cta") &&
    !isHomeHero
  const hasMedia = (block.type === "hero" || block.type === "split") && !isHomeHero
  const hasItems = block.type === "cards" || block.type === "stats"

  return (
    <div className="space-y-5">
      {!isHomeDivisions ? (
        <EditorCard
          title={block.name}
          description="Edit the text visitors see in this section."
          actions={
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange({ visible: !block.visible })}
                className="h-9 border-grey-200 text-grey-600"
              >
                {block.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                {block.visible ? "Visible" : "Hidden"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onDuplicate}
                className="size-9 border-grey-200 text-grey-600"
                aria-label="Duplicate section"
              >
                <Copy className="size-4" />
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
            {!isHomeGuidance ? (
              <EditorInput
                label={isHomeHero ? "Subtitle" : "Section label"}
                value={block.eyebrow}
                onChange={(eyebrow) => onChange({ eyebrow })}
              />
            ) : null}
            <div className={cn(!isHomeGuidance && "col-span-2 max-sm:col-span-1")}>
              <EditorInput
                label={isHomeGuidance ? "Prompt text" : "Heading"}
                value={block.title}
                onChange={(title) => onChange({ title })}
              />
            </div>
            {!isHomeGuidance ? (
              <div className="col-span-2 max-sm:col-span-1">
                <EditorTextarea
                  label={isHomeHero ? "Supporting text" : "Description"}
                  value={block.description}
                  onChange={(description) => onChange({ description })}
                />
              </div>
            ) : null}
          </div>
        </EditorCard>
      ) : null}

      {hasButton ? (
        <EditorCard title="Links and buttons" description="Update the labels and destinations used in this section.">
          <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
            <EditorInput
              label="Primary button label"
              value={block.buttonLabel ?? ""}
              onChange={(buttonLabel) => onChange({ buttonLabel })}
            />
            <EditorInput
              label="Primary button link"
              value={block.buttonHref ?? ""}
              onChange={(buttonHref) => onChange({ buttonHref })}
              placeholder="/contact or https://..."
            />
            {block.type === "hero" &&
            (block.secondaryButtonLabel !== undefined || block.secondaryButtonHref !== undefined) ? (
              <>
                <EditorInput
                  label="Secondary button label"
                  value={block.secondaryButtonLabel ?? ""}
                  onChange={(secondaryButtonLabel) => onChange({ secondaryButtonLabel })}
                />
                <EditorInput
                  label="Secondary button link"
                  value={block.secondaryButtonHref ?? ""}
                  onChange={(secondaryButtonHref) => onChange({ secondaryButtonHref })}
                  placeholder="/about or https://..."
                />
              </>
            ) : null}
          </div>
        </EditorCard>
      ) : null}

      {hasMedia ? (
        <EditorCard title="Image or video" description="Use a hosted URL or upload a file for this section.">
          <RdiMediaField
            media={block.media ?? { type: "image", url: "", alt: "" }}
            onChange={(media) => onChange({ media })}
          />
        </EditorCard>
      ) : null}

      {hasItems ? (
        <EditorCard
          title={block.type === "stats" ? "Numbers" : "Content cards"}
          description={`Edit, add, or remove the individual ${block.type === "stats" ? "statistics" : "cards"} in this section.`}
          actions={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddItem}
              className="h-9 border-grey-200 text-grey-700"
            >
              <Plus className="size-4" />
              Add {block.type === "stats" ? "stat" : "card"}
            </Button>
          }
        >
          <div className="space-y-3">
            {block.items?.map((item, itemIndex) => (
              <ItemEditor
                key={item.id}
                item={item}
                blockId={block.id}
                itemIndex={itemIndex}
                blockType={block.type}
                onChange={(patch) => onItemChange(item.id, patch)}
                onRemove={() => onRemoveItem(item.id)}
              />
            ))}
            {!block.items?.length ? (
              <div className="rounded-xl border border-dashed border-grey-300 px-5 py-10 text-center">
                <p className="text-sm font-semibold text-grey-700">This section has no items yet.</p>
                <Button type="button" variant="outline" size="sm" onClick={onAddItem} className="mt-4">
                  <Plus className="size-4" />
                  Add the first item
                </Button>
              </div>
            ) : null}
          </div>
        </EditorCard>
      ) : null}
    </div>
  )
}

function RdiMobileNavigationButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="hidden size-10 shrink-0 border-grey-200 bg-white text-grey-600 max-lg:inline-flex"
          aria-label="Open dashboard navigation"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="hidden p-0 max-lg:block">
        <SheetHeader className="sr-only">
          <SheetTitle>Dashboard navigation</SheetTitle>
          <SheetDescription>Navigate to dashboard sections and account actions.</SheetDescription>
        </SheetHeader>
        <DashboardSheetNavigation onNavigate={() => setIsOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}

export function RdiCmsPage() {
  const [content, setContent] = useState<RdiSiteContent>(readSavedContent)
  const [selectedPageId, setSelectedPageId] = useState(() => content.pages[0]?.id ?? "home")
  const [selectedBlockId, setSelectedBlockId] = useState(() => content.pages[0]?.blocks[0]?.id ?? "")
  const [editorTarget, setEditorTarget] = useState<EditorTarget>("page")
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("preview")
  const [previewSize, setPreviewSize] = useState<RdiPreviewSize>("desktop")
  const [newBlockType, setNewBlockType] = useState<RdiBlockType>("split")
  const [isDirty, setIsDirty] = useState(false)
  const [saveMessage, setSaveMessage] = useState("All changes saved locally")

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

  const persistContent = (nextContent: RdiSiteContent, message: string) => {
    try {
      window.localStorage.setItem(RDI_STORAGE_KEY, JSON.stringify(nextContent))
      setIsDirty(false)
      setSaveMessage(message)
    } catch {
      setSaveMessage("Could not save. A media upload may be too large for local storage.")
    }
  }

  const saveDraft = () => persistContent(content, "Draft saved locally")

  const publishPage = () => {
    if (editorTarget !== "page") {
      persistContent(content, "Global footer published across all pages")
      return
    }

    const nextContent = {
      ...content,
      pages: content.pages.map((page) =>
        page.id === selectedPage.id ? { ...page, status: "Published" as const } : page
      ),
    }
    setContent(nextContent)
    persistContent(nextContent, `${selectedPage.navigationLabel} page published`)
  }

  const restoreSaved = () => {
    if (isDirty && !window.confirm("Discard the unsaved RDI changes in this editing session?")) return

    const savedContent = readSavedContent()
    setContent(savedContent)
    const firstPage = savedContent.pages[0]
    setSelectedPageId(firstPage?.id ?? "home")
    setSelectedBlockId(firstPage?.blocks[0]?.id ?? "")
    setEditorTarget("page")
    setIsDirty(false)
    setSaveMessage("Saved version restored")
  }

  if (!selectedPage) return null

  return (
    <main className="h-svh w-full overflow-x-clip overflow-y-auto bg-auth-background pl-[290px] font-sans text-grey-1000 max-lg:pl-0">
      <DashboardSidebar />

      <section className="w-full min-w-0">
        <div className="mx-auto w-full max-w-[1536px] min-w-0">
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
                        {view}
                      </button>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={saveDraft}
                    disabled={!isDirty}
                    className="h-10 border-grey-200 bg-white text-grey-700"
                  >
                    <Save className="size-4" />
                    Save draft
                  </Button>
                  <Button
                    type="button"
                    onClick={publishPage}
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
                    onClick={restoreSaved}
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
                        <p className="mt-1 text-xs text-grey-400">Click any section or the footer in the preview to edit it.</p>
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
                Frontend CMS prototype · Changes are stored in this browser
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
        </div>
      </section>
    </main>
  )
}
