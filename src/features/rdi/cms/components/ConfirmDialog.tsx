import { CmsDialogContent } from "./CmsDialogContent"
import { Dialog, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { CmsButton } from "./CmsButton"
export function ConfirmDialog({ open, onOpenChange, title, description, action, onConfirm }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  action: string
  onConfirm: () => void
}) {
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <CmsDialogContent>
      <div className="pr-6">
        <DialogTitle>
          {title}
        </DialogTitle>
        <DialogDescription className="mt-3">
          {description}
        </DialogDescription>
      </div>
      <div className="flex justify-end gap-3">
        <CmsButton onClick={() => onOpenChange(false)}>
          Cancel
        </CmsButton>
        <CmsButton variant="default" onClick={() => { onConfirm(); onOpenChange(false) }}>
          {action}
        </CmsButton>
      </div>
    </CmsDialogContent>
  </Dialog>
}
