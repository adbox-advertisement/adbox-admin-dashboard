import { Copy, Eye, EyeOff, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RdiMediaField } from "./RdiMediaField"
import type { RdiContentBlock, RdiContentItem } from "../../types"
import { cn } from "@/lib/utils"
import { EditorCard, EditorInput, EditorTextarea } from "./EditorFields"
import { ItemEditor } from "./ItemEditor"

export function BlockEditor({
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
