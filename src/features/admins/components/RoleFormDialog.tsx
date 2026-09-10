import { useId, useRef, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useRolesStore, type RoleInput } from "../store/roles-store"
import type { Role } from "../types"
import { PermissionsPicker } from "./PermissionsPicker"

// Uncontrolled internally (form values reset via useState initializers), so
// callers must remount this on open — e.g. `key={open ? role.id : "closed"}`
// — to get a clean form each time it opens. See RoleRowMenu/RolesTable.
type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
} & ({ mode: "create" } | { mode: "edit"; role: Role })

function emptyValues(): RoleInput {
  return { name: "", description: "", permissions: [] }
}

function valuesFromRole(role: Role): RoleInput {
  return { name: role.name, description: role.description, permissions: role.permissions }
}

export function RoleFormDialog(props: Props) {
  const { open, onOpenChange } = props
  const addRole = useRolesStore((state) => state.addRole)
  const updateRole = useRolesStore((state) => state.updateRole)
  const [values, setValues] = useState<RoleInput>(() => (props.mode === "edit" ? valuesFromRole(props.role) : emptyValues()))
  const [error, setError] = useState("")
  const nameRef = useRef<HTMLInputElement>(null)
  const formId = useId()
  const isEdit = props.mode === "edit"

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = isEdit ? updateRole(props.role.id, values) : addRole(values)
    if (result.error !== undefined) {
      setError(result.error)
      nameRef.current?.focus()
      return
    }
    onOpenChange(false)
    setError("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 rounded-3xl p-0">
        <div className="border-b border-border px-6 py-5 pr-14">
          <DialogTitle className="text-h6 md:text-h5">{isEdit ? "Edit Roles" : "Add Roles"}</DialogTitle>
        </div>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 px-6 py-6">
          <div>
            <label htmlFor={`${formId}-name`} className="mb-2 block text-sm font-medium">Role Name</label>
            <Input
              ref={nameRef}
              id={`${formId}-name`}
              value={values.name}
              onChange={(event) => { setValues((current) => ({ ...current, name: event.target.value })); setError("") }}
              placeholder="eg, Super Admin"
              autoComplete="off"
              className="h-11 rounded-xl"
            />
          </div>

          <div>
            <label htmlFor={`${formId}-description`} className="mb-2 block text-sm font-medium">Description</label>
            <Input
              id={`${formId}-description`}
              value={values.description}
              onChange={(event) => { setValues((current) => ({ ...current, description: event.target.value })); setError("") }}
              placeholder="Add description"
              autoComplete="off"
              className="h-11 rounded-xl"
            />
          </div>

          <div>
            <label htmlFor={`${formId}-permissions`} className="mb-2 block text-sm font-medium">Permissions</label>
            <PermissionsPicker
              id={`${formId}-permissions`}
              value={values.permissions}
              onChange={(permissions) => { setValues((current) => ({ ...current, permissions })); setError("") }}
            />
          </div>

          {error && <p role="alert" className="text-sm leading-6 text-destructive">{error}</p>}

          <div className="mt-1 flex justify-end gap-3">
            <DialogClose asChild><Button type="button" variant="outline" className="h-11 rounded-full px-5">Cancel</Button></DialogClose>
            <Button type="submit" className="h-11 rounded-full bg-[image:var(--gradient-purple)] px-5 text-white hover:opacity-90">{isEdit ? "Save changes" : "Add role"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
