import { createContext, useContext } from "react"
import type { RdiPageContent, RdiSiteSettings } from "../../types"

type PreviewContext = {
  pages: RdiPageContent[]
  settings: RdiSiteSettings
  navigate: (id: string) => void
  edit?: (id: string) => void
}
export const RdiPreviewContext = createContext<PreviewContext | null>(null)
export function useRdiPreview() {
  const context = useContext(RdiPreviewContext)
  if (!context) throw new Error("RDI preview requires a context")
  return context
}
