import { useId, useRef, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useCreateRole, useUpdateRole } from "../hooks"
import { roleInputSchema, type RoleInput } from "../validation"
import { rbacErrorMessage } from "../lib/errors"
import type { Role } from "../types"

// Uncontrolled internally (form values reset via useState initializers), so
// callers must remount this on open — e.g. `key={open ? role.id : "closed"}`
// — to get a clean form each time it opens. See RoleRowMenu/RolesTable.
type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (role: Role) => void
} & ({ mode: "create" } | { mode: "edit"; role: Role })

function emptyValues(): RoleInput {
  return { name: "", description: "" }
}

function valuesFromRole(role: Role): RoleInput {
  return { name: role.name, description: role.description }
}

export function RoleFormDialog(props: Props) {
  const { open, onOpenChange } = props
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const pending = createRole.isPending || updateRole.isPending
  const [values, setValues] = useState<RoleInput>(() => (props.mode === "edit" ? valuesFromRole(props.role) : emptyValues()))
  const [error, setError] = useState("")
  const nameRef = useRef<HTMLInputElement>(null)
  const formId = useId()
  const isEdit = props.mode === "edit"

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const parsed = roleInputSchema.safeParse(values)
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      nameRef.current?.focus()
      return
    }
    setError("")
    try {
      if (props.mode === "edit") {
        await updateRole.mutateAsync({ id: props.role.id, input: parsed.data })
        onOpenChange(false)
      } else {
        const role = await createRole.mutateAsync(parsed.data)
        onOpenChange(false)
        props.onCreated?.(role)
      }
    } catch (error) {
      setError(rbacErrorMessage(error, "Could not save the role. Check the role list before retrying."))
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!pending) onOpenChange(next) }}>
      <DialogContent className="max-w-lg gap-0 rounded-3xl p-0">
        <div className="border-b border-border px-6 py-5 pr-14">
          <DialogTitle className="text-h6 md:text-h5">{isEdit ? "Edit role" : "Add role"}</DialogTitle>
          <DialogDescription className="mt-2">{isEdit ? "Update the role name and description." : "Create a role, then choose its permissions."}</DialogDescription>
        </div>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 px-6 py-6">
          <fieldset disabled={pending} className="contents">
            <div>
              <label htmlFor={`${formId}-name`} className="mb-2 block text-sm font-medium">Role Name</label>
              <Input
                ref={nameRef}
                id={`${formId}-name`}
                value={values.name}
                onChange={(event) => { setValues((current) => ({ ...current, name: event.target.value.toUpperCase() })); setError("") }}
                placeholder="e.g. CONTENT_MANAGER"
                maxLength={64}
                aria-describedby={`${formId}-name-help`}
                autoComplete="off"
                className="h-11 rounded-xl"
              />
              <p id={`${formId}-name-help`} className="mt-2 text-sm text-muted-foreground">Use uppercase letters, numbers and underscores, e.g. CONTENT_MANAGER.</p>
            </div>

            <div>
              <label htmlFor={`${formId}-description`} className="mb-2 block text-sm font-medium">Description</label>
              <Input
                id={`${formId}-description`}
                value={values.description}
                onChange={(event) => { setValues((current) => ({ ...current, description: event.target.value })); setError("") }}
                placeholder="Add description (optional)"
                maxLength={255}
                autoComplete="off"
                className="h-11 rounded-xl"
              />
            </div>

            {error && <p role="alert" className="text-sm leading-6 text-destructive">{error}</p>}

            <div className="mt-1 flex justify-end gap-3">
              <DialogClose asChild><Button type="button" variant="outline" className="h-11 cursor-pointer rounded-full px-5">Cancel</Button></DialogClose>
              <Button type="submit" className="h-11 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] px-5 text-white hover:opacity-90">{pending ? "Saving…" : isEdit ? "Save changes" : "Add role"}</Button>
            </div>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  )
}
