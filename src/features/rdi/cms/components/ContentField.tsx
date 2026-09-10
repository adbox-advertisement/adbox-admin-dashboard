import { useId, useState } from "react"
import { ImagePlus, Replace } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CmsField } from "../types"
import { useCmsStore } from "../store"
import { isSafeLink } from "../lib/document"
import { assetValue, imageSource } from "../lib/media"
import { AssetPicker } from "./AssetPicker"
import { CmsButton } from "./CmsButton"
export function ContentField({ field, value, onChange }: {
  field: CmsField
  value: string
  onChange: (value: string) => void
}) {
  const id = useId()
  const [pickerOpen, setPickerOpen] = useState(false)
  const assets = useCmsStore(state => state.draft.assets)
  const invalid = field.kind === "link" && !isSafeLink(value)
  if (field.kind === "image")
    return <div>
      <label className="mb-2 block text-sm font-semibold text-grey-800">
        {field.label}
      </label>
      <div className="overflow-hidden rounded-xl border border-grey-200 bg-grey-50">
        <img src={imageSource(value, assets)} alt="Selected website image" className="h-40 w-full object-contain p-3" />
        <div className="flex items-center justify-between border-t border-grey-200 bg-white px-3 py-2.5">
          <span className="inline-flex items-center gap-1.5 text-xs text-grey-500">
            <ImagePlus className="size-3.5" />
            Website image
          </span>
          <CmsButton className="h-8 px-3 text-xs" aria-label={`Replace ${field.label.toLowerCase()}`} onClick={() => setPickerOpen(true)}>
            <Replace className="size-3.5" />
            Replace
          </CmsButton>
        </div>
      </div>
      {pickerOpen && <AssetPicker open onOpenChange={setPickerOpen} value={value} onSelect={asset => onChange(assetValue(asset))} />}
    </div>
  return <div>
    <div className="mb-2 flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-sm font-semibold text-grey-800">
        {field.label}
      </label>
      {field.kind === "textarea" && <span className="text-[11px] text-grey-400">
        {value.length} characters
      </span>}
    </div>
    {field.options ? <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {field.options.map(option => <SelectItem key={option} value={option}>
          {({ generation: "Solar & inverters", home: "Home batteries", business: "Business storage", video: "Video production", branding: "Branding", animation: "Animation", commercial: "Commercials" } as Record<string, string>)[option] ?? option}
        </SelectItem>)}
      </SelectContent>
    </Select> : field.kind === "textarea" ? <Textarea id={id} value={value} maxLength={5000} rows={4} onChange={event => onChange(event.target.value)} className="min-h-28 resize-y rounded-xl border-grey-200 bg-white px-3 py-2.5 text-sm leading-6 shadow-none" /> : <Input id={id} type={field.id.endsWith("email") ? "email" : "text"} value={value} maxLength={1000} onChange={event => onChange(event.target.value)} aria-invalid={invalid || undefined} aria-describedby={invalid ? `${id}-error` : undefined} className="h-11 rounded-xl border-grey-200 bg-white text-sm shadow-none" />}
    {field.kind === "link" && <p id={`${id}-error`} className={`mt-1.5 text-xs ${invalid ? "text-error-700" : "text-grey-400"}`}>
      {invalid ? "Use a page path, https:// address, mailto: email, or tel: number." : "Page path (e.g. /contact), web address, email, or phone link."}
    </p>}
  </div>
}
