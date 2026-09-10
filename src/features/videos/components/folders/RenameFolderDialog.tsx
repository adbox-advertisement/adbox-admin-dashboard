import { useId, useRef, useState } from "react"
import { Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useUploadFolderStore, type UploadFolder } from "../../store/folder-store"

export function RenameFolderDialog({ folder }: { folder: UploadFolder }) {
  const renameFolder = useUploadFolderStore((state) => state.renameFolder)
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState(folder.name)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const formId = useId()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      setName(open ? folder.name : "")
      setError("")
    }}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={"Rename " + folder.name}
          onClick={(event) => event.stopPropagation()}
          className="size-8 shrink-0 rounded-lg text-muted-foreground hover:bg-card hover:text-secondary"
        >
          <Pencil className="size-3.5" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="video-management-ui rounded-3xl">
        <div className="pr-7">
          <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary"><Pencil className="size-6" aria-hidden="true" /></span>
          <DialogTitle>Rename folder</DialogTitle>
          <DialogDescription className="mt-2">Update the name for this folder.</DialogDescription>
        </div>
        <form onSubmit={(event) => {
          event.preventDefault()
          const result = renameFolder(folder.schoolId, folder.id, name)
          if (result.error !== undefined) {
            setError(result.error)
            inputRef.current?.focus()
            return
          }
          setIsOpen(false)
          setError("")
        }} noValidate>
          <label htmlFor={`${formId}-rename-folder`} className="mb-2 block text-sm font-medium">Folder name</label>
          <Input
            ref={inputRef}
            id={`${formId}-rename-folder`}
            value={name}
            onChange={(event) => { setName(event.target.value); setError("") }}
            placeholder="e.g. Orientation week"
            autoComplete="off"
            maxLength={60}
            aria-invalid={Boolean(error)}
            aria-describedby={`${formId}-rename-help${error ? ` ${formId}-rename-error` : ""}`}
            className="h-11 rounded-xl"
          />
          <div id={`${formId}-rename-help`} className="mt-2 flex justify-between gap-3 text-xs text-muted-foreground">
            <span>Give your folder a short, clear name.</span><span className="shrink-0 tabular-nums">{name.length}/60</span>
          </div>
          {error && <p id={`${formId}-rename-error`} role="alert" className="mt-3 text-sm leading-6 text-destructive">{error}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <DialogClose asChild><Button type="button" variant="outline" className="h-11 rounded-xl px-4">Cancel</Button></DialogClose>
            <Button type="submit" variant="secondary" className="h-11 rounded-xl px-4"><Pencil className="size-4" aria-hidden="true" />Save changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
