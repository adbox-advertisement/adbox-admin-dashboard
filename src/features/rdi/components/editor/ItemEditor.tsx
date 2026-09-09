import { ChevronRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RdiMediaField } from "./RdiMediaField"
import type { RdiBlockType, RdiContentItem } from "../../types"
import { FieldLabel, EditorInput, EditorTextarea } from "./EditorFields"

export function ItemEditor({
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
        {blockId === "solar-solutions" || blockId === "media-work" ? (
          <FieldLabel label="Filter category">
            <select
              aria-label="Filter category"
              value={item.category ?? ""}
              onChange={(event) => onChange({ category: event.target.value })}
              className="h-11 w-full rounded-md border border-grey-200 bg-white px-3 text-sm text-grey-900"
            >
              <option value="">Uncategorized</option>
              {(blockId === "solar-solutions"
                ? [["generation", "Solar & inverters"], ["home", "Home batteries"], ["business", "Business storage"]]
                : [["video", "Video Production"], ["commercial", "Commercials"], ["branding", "Branding"], ["animation", "Animation"]]
              ).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </FieldLabel>
        ) : null}
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
