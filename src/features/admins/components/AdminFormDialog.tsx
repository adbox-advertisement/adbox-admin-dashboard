import { useId, useRef, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAdminsStore, type AdminInput } from "../store/admins-store"
import { adminRoles, type Admin } from "../types"
import { AdminAvatarPicker } from "./AdminAvatarPicker"

const MIN_PASSWORD_LENGTH = 8

// Uncontrolled internally (form values reset via useState initializers), so
// callers must remount this on open — e.g. `key={open ? admin.id : "closed"}`
// — to get a clean form each time it opens. See AdminRowMenu/AdminsTable.
type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
} & ({ mode: "create" } | { mode: "edit"; admin: Admin })

function emptyValues(): AdminInput {
  return { firstName: "", lastName: "", email: "", telephone: "", role: "Administrator", avatar: "" }
}

function valuesFromAdmin(admin: Admin): AdminInput {
  return { firstName: admin.firstName, lastName: admin.lastName, email: admin.email, telephone: admin.telephone, role: admin.role, avatar: admin.avatar }
}

export function AdminFormDialog(props: Props) {
  const { open, onOpenChange } = props
  const addAdmin = useAdminsStore((state) => state.addAdmin)
  const updateAdmin = useAdminsStore((state) => state.updateAdmin)
  const [values, setValues] = useState<AdminInput>(() => (props.mode === "edit" ? valuesFromAdmin(props.admin) : emptyValues()))
  const [password, setPassword] = useState("")
  const [notify, setNotify] = useState(true)
  const [error, setError] = useState("")
  const firstNameRef = useRef<HTMLInputElement>(null)
  const formId = useId()
  const isEdit = props.mode === "edit"

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isEdit && password.trim().length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    const result = isEdit ? updateAdmin(props.admin.id, values) : addAdmin(values)
    if (result.error !== undefined) {
      setError(result.error)
      firstNameRef.current?.focus()
      return
    }
    // Password and "send notification" are UI-only: there is no auth
    // backend yet, so neither is stored or sent anywhere.
    onOpenChange(false)
    setError("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 rounded-3xl p-0">
        <div className="border-b border-border px-6 py-5 pr-14">
          <DialogTitle className="text-h6 md:text-h5">{isEdit ? "Edit profile" : "Add Admin"}</DialogTitle>
        </div>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 px-6 py-6">
          <AdminAvatarPicker value={values.avatar} onChange={(avatar) => setValues((current) => ({ ...current, avatar }))} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${formId}-first-name`} className="mb-2 block text-sm font-medium">First Name</label>
              <Input
                ref={firstNameRef}
                id={`${formId}-first-name`}
                value={values.firstName}
                onChange={(event) => { setValues((current) => ({ ...current, firstName: event.target.value })); setError("") }}
                autoComplete="given-name"
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <label htmlFor={`${formId}-last-name`} className="mb-2 block text-sm font-medium">Last Name</label>
              <Input
                id={`${formId}-last-name`}
                value={values.lastName}
                onChange={(event) => { setValues((current) => ({ ...current, lastName: event.target.value })); setError("") }}
                autoComplete="family-name"
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label htmlFor={`${formId}-email`} className="mb-2 block text-sm font-medium">Email</label>
            <Input
              id={`${formId}-email`}
              type="email"
              value={values.email}
              onChange={(event) => { setValues((current) => ({ ...current, email: event.target.value })); setError("") }}
              placeholder="name@adbox.com"
              autoComplete="off"
              className="h-11 rounded-xl"
            />
          </div>

          <div>
            <label htmlFor={`${formId}-telephone`} className="mb-2 block text-sm font-medium">Telephone</label>
            <Input
              id={`${formId}-telephone`}
              type="tel"
              value={values.telephone}
              onChange={(event) => { setValues((current) => ({ ...current, telephone: event.target.value })); setError("") }}
              placeholder="+1234567890"
              autoComplete="off"
              className="h-11 rounded-xl"
            />
          </div>

          {!isEdit && (
            <div>
              <label htmlFor={`${formId}-password`} className="mb-2 block text-sm font-medium">Password</label>
              <Input
                id={`${formId}-password`}
                type="password"
                value={password}
                onChange={(event) => { setPassword(event.target.value); setError("") }}
                placeholder="Password"
                autoComplete="new-password"
                className="h-11 rounded-xl"
              />
            </div>
          )}

          <div>
            <label htmlFor={`${formId}-role`} className="mb-2 block text-sm font-medium">Assign Role</label>
            <Select value={values.role} onValueChange={(role) => { setValues((current) => ({ ...current, role: role as AdminInput["role"] })); setError("") }}>
              <SelectTrigger id={`${formId}-role`} className="h-11 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {adminRoles.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {!isEdit && (
            <label className="flex items-center gap-3 text-sm text-grey-1000">
              <Checkbox checked={notify} onCheckedChange={(checked) => setNotify(checked === true)} />
              Send notification after adding admin
            </label>
          )}

          {error && <p role="alert" className="text-sm leading-6 text-destructive">{error}</p>}

          <div className="mt-1 flex justify-end gap-3">
            <DialogClose asChild><Button type="button" variant="outline" className="h-11 rounded-full px-5">Cancel</Button></DialogClose>
            <Button type="submit" className="h-11 rounded-full bg-[image:var(--gradient-purple)] px-5 text-white hover:opacity-90">{isEdit ? "Save changes" : "Add Admin"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
