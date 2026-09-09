import { Monitor, Smartphone, Tablet } from "lucide-react"
import type { RdiPreviewSize } from "../types"

export const previewSizeOptions: Array<{
  id: RdiPreviewSize
  label: string
  icon: typeof Monitor
}> = [
    { id: "desktop", label: "Desktop", icon: Monitor },
    { id: "tablet", label: "Tablet", icon: Tablet },
    { id: "mobile", label: "Mobile", icon: Smartphone },
  ]
