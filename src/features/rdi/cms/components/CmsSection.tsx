import { cloneElement, type ReactElement } from "react"
import { useCmsStore } from "../store"
export function CmsSection({ id, children }: {
  id: string
  children: ReactElement<{
    "data-cms-section"?: string
  }>
}) {
  const hidden = useCmsStore(state => state.draft.hiddenSections.includes(id))
  return hidden ? null : cloneElement(children, { "data-cms-section": id })
}
