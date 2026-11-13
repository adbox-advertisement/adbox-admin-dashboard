import { useId, useState, type FormEvent } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCreateRole, useDeleteRole, useUpdateRole } from "../hooks"
import { roleKey, roleTitle } from "../lib/catalog"
import { rbacErrorMessage } from "../lib/errors"
import { roleInputSchema } from "../validation"
import type { Role } from "../types"
import { primaryButton } from "./AdminBits"

type FormProps = { onClose: () => void } & ({ mode: "create"; onCreated: (role: Role) => void } | { mode: "edit"; role: Role; onSaved: (message: string) => void })

/** A role's name and what it's for. The name is typed in words and stored as a key, e.g. "Support lead" → SUPPORT_LEAD. */
export function RoleFormDialog(props: FormProps) {
  const isEdit = props.mode === "edit"
  const create = useCreateRole()
  const update = useUpdateRole()
  const pending = create.isPending || update.isPending
  const [title, setTitle] = useState(() => (props.mode === "edit" ? roleTitle(props.role.name) : ""))
  const [description, setDescription] = useState(() => (props.mode === "edit" ? props.role.description : ""))
  const [error, setError] = useState("")
  const formId = useId()
  const key = roleKey(title)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (pending) return
    const parsed = roleInputSchema.safeParse({ name: key, description })
    if (!parsed.success) {
      setError(parsed.error.issues[0].path[0] === "name" ? "Give the role a name of 2 to 64 letters or numbers, starting with a letter." : parsed.error.issues[0].message)
      return
    }
    setError("")
    try {
      if (props.mode === "edit") {
        await update.mutateAsync({ id: props.role.id, input: parsed.data })
        props.onSaved(`Saved ${roleTitle(parsed.data.name)}.`)
        props.onClose()
      } else {
        props.onCreated(await create.mutateAsync(parsed.data))
      }
    } catch (failure) {
      setError(rbacErrorMessage(failure, "Could not save the role. Check the list before trying again."))
    }
  }

  return <Dialog open onOpenChange={(open) => { if (!open && !pending) props.onClose() }}>
    <DialogContent className="max-w-lg rounded-3xl">
      <div className="pr-7">
        <DialogTitle>{isEdit ? "Rename role" : "New role"}</DialogTitle>
        <DialogDescription className="mt-1.5">{isEdit ? "Admins with this role keep it; only the name and description change." : "Name the job it's for. You choose what it allows next."}</DialogDescription>
      </div>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <fieldset disabled={pending} className="contents">
          <div>
            <label htmlFor={`${formId}-name`} className="mb-1.5 block text-sm font-medium">Role name</label>
            <Input id={`${formId}-name`} value={title} onChange={(event) => { setTitle(event.target.value); setError("") }} placeholder="e.g. Support lead" maxLength={64} autoComplete="off" aria-describedby={`${formId}-key`} className="h-11 rounded-xl" />
            <p id={`${formId}-key`} className="mt-1.5 text-xs text-muted-foreground">{key ? <>Saved as <span className="font-mono">{key}</span></> : "Letters, numbers and spaces."}</p>
          </div>
          <div>
            <label htmlFor={`${formId}-description`} className="mb-1.5 block text-sm font-medium">What it's for <span className="font-normal text-muted-foreground">(optional)</span></label>
            <Textarea id={`${formId}-description`} value={description} onChange={(event) => { setDescription(event.target.value); setError("") }} placeholder="e.g. Answers support tickets and suspends abusive accounts" maxLength={255} rows={2} />
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <DialogClose asChild><Button type="button" variant="outline" className="h-10 rounded-full px-4">Cancel</Button></DialogClose>
            <Button type="submit" className={primaryButton}>{pending ? "Saving…" : isEdit ? "Save" : "Create role"}</Button>
          </div>
        </fieldset>
      </form>
    </DialogContent>
  </Dialog>
}

/** Deleting a role takes what it allows away from every admin who has it. */
export function DeleteRoleDialog({ role, members, onClose, onDeleted }: { role: Role; members: number; onClose: () => void; onDeleted: () => void }) {
  const remove = useDeleteRole()
  const [error, setError] = useState("")
  const title = roleTitle(role.name)
  return <Dialog open onOpenChange={(open) => { if (!open && !remove.isPending) onClose() }}>
    <DialogContent className="rounded-3xl">
      <div className="pr-7">
        <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"><Trash2 className="size-6" aria-hidden="true" /></span>
        <DialogTitle>Delete {title}?</DialogTitle>
        <DialogDescription className="mt-2">{members === 0 ? "No admin has this role. This can't be undone." : `The ${members} ${members === 1 ? "admin" : "admins"} with this role lose what it allows, unless another role or an extra permission gives it to them. This can't be undone.`}</DialogDescription>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2">
        <DialogClose asChild><Button type="button" variant="outline" disabled={remove.isPending} className="h-10 rounded-full px-4">Cancel</Button></DialogClose>
        <Button type="button" variant="destructive" className="h-10 rounded-full px-4" disabled={remove.isPending || role.isSystem}
          onClick={async () => {
            setError("")
            // Awaited rather than a mutate() callback: the refreshed role list unmounts this dialog before those run.
            try { await remove.mutateAsync(role.id); onDeleted() }
            catch (failure) { setError(rbacErrorMessage(failure, "Could not delete the role. Try again.")) }
          }}>
          {remove.isPending ? "Deleting…" : "Delete role"}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
}
