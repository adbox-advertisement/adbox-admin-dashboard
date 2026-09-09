import { useId, useRef, useState } from "react"
import { FolderPlus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useUploadFolderStore, type UploadFolder } from "../../store/folder-store"
import { uploadSchools, type UploadSchoolId } from "../../data/schools"

type Props = {
  schoolId: UploadSchoolId
  defaultName: string
  onCreated: (folder: UploadFolder) => void
}

export function CreateFolderDialog({ schoolId, defaultName, onCreated }: Props) {
  const createFolder = useUploadFolderStore((state) => state.createFolder)
  const school = uploadSchools.find(({ id }) => id === schoolId)
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const formId = useId()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      setName(open ? defaultName.trim().slice(0, 60) : "")
      setError("")
    }}>
      <DialogTrigger asChild>
        <Button type="button" variant="secondary" aria-label="New folder" title="New folder" className="video-folder-create h-11 gap-2 rounded-xl px-4">
          <FolderPlus className="size-4" aria-hidden="true" /><span className="video-folder-create-label">New folder</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="video-management-ui rounded-3xl">
        <div className="pr-7">
          <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary"><FolderPlus className="size-6" aria-hidden="true" /></span>
          <DialogTitle>Create a folder</DialogTitle>
          <DialogDescription className="mt-2">Keep related uploads together in {school?.name}.</DialogDescription>
        </div>
        <form onSubmit={(event) => {
          event.preventDefault()
          const result = createFolder(schoolId, name)
          if (result.error !== undefined) {
            setError(result.error)
            inputRef.current?.focus()
            return
          }
          onCreated(result.folder)
          setIsOpen(false)
          setName("")
          setError("")
        }} noValidate>
          <label htmlFor={`${formId}-folder-name`} className="mb-2 block text-sm font-medium">Folder name</label>
          <Input
            ref={inputRef}
            id={`${formId}-folder-name`}
            value={name}
            onChange={(event) => { setName(event.target.value); setError("") }}
            placeholder="e.g. Orientation week"
            autoComplete="off"
            maxLength={60}
            aria-invalid={Boolean(error)}
            aria-describedby={`${formId}-folder-help${error ? ` ${formId}-folder-error` : ""}`}
            className="h-11 rounded-xl"
          />
          <div id={`${formId}-folder-help`} className="mt-2 flex justify-between gap-3 text-xs text-muted-foreground">
            <span>Give your folder a short, clear name.</span><span className="shrink-0 tabular-nums">{name.length}/60</span>
          </div>
          {error && <p id={`${formId}-folder-error`} role="alert" className="mt-3 text-sm leading-6 text-destructive">{error}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <DialogClose asChild><Button type="button" variant="outline" className="h-11 rounded-xl px-4">Cancel</Button></DialogClose>
            <Button type="submit" variant="secondary" className="h-11 rounded-xl px-4"><Plus className="size-4" aria-hidden="true" />Create folder</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
