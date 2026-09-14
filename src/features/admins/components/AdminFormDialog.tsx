import { useId, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useCreateAdmin, useRbacAccess, useRoles, useUpdateAdmin } from "../hooks"
import { createAdminSchema, updateAdminSchema } from "../validation"
import { rbacErrorMessage } from "../lib/errors"
import type { Admin } from "../types"
import { RolesPicker } from "./RolesPicker"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
} & ({ mode: "create" } | { mode: "edit"; admin: Admin })

export function AdminFormDialog(props: Props) {
  const { open, onOpenChange } = props
  const isEdit = props.mode === "edit"
  const can = useRbacAccess()
  const create = useCreateAdmin()
  const update = useUpdateAdmin()
  const roles = useRoles(open && !isEdit && can("roles.read"))
  const [values, setValues] = useState(() => ({
    firstName: isEdit ? props.admin.firstName : "",
    lastName: isEdit ? props.admin.lastName : "",
    email: isEdit ? props.admin.email : "",
    password: "",
    roleIds: [] as string[],
  }))
  const [error, setError] = useState("")
  const formId = useId()
  const pending = create.isPending || update.isPending
  const allowed = can(isEdit ? "admins.update" : "admins.create")

  function setField(field: "firstName" | "lastName" | "email" | "password", value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setError("")
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (pending || !allowed) return
    setError("")
    try {
      if (isEdit) {
        const parsed = updateAdminSchema.safeParse({ firstName: values.firstName, lastName: values.lastName })
        if (!parsed.success) { setError(parsed.error.issues[0].message); return }
        await update.mutateAsync({ id: props.admin.id, input: parsed.data })
      } else {
        const parsed = createAdminSchema.safeParse(values)
        if (!parsed.success) { setError(parsed.error.issues[0].message); return }
        if (values.roleIds.length > 0 && (!roles.isSuccess || roles.isFetching)) {
          setError("Reload the roles before creating an account with role assignments.")
          return
        }
        await create.mutateAsync(parsed.data)
        create.reset()
        setValues((current) => ({ ...current, password: "" }))
      }
      onOpenChange(false)
    } catch (error) {
      setError(rbacErrorMessage(error, "Could not save the admin. Check the account list before retrying.", "admin"))
    }
  }

  return <Dialog open={open} onOpenChange={(next) => { if (!pending) onOpenChange(next) }}>
    <DialogContent className="max-w-lg gap-0 rounded-3xl p-0">
      <div className="border-b border-border px-6 py-5 pr-14">
        <DialogTitle>{isEdit ? "Edit profile" : "Add Admin"}</DialogTitle>
        <DialogDescription className="mt-2">{isEdit ? "Update this admin's name. Their sign-in email stays the same." : "Create an admin account with a password and optional roles."}</DialogDescription>
      </div>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5 p-6">
        <fieldset disabled={pending || !allowed} className="contents">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${formId}-first-name`} className="mb-2 block text-sm font-medium">First Name</label>
              <Input id={`${formId}-first-name`} value={values.firstName} onChange={(event) => setField("firstName", event.target.value)} autoComplete="given-name" maxLength={100} className="h-11 rounded-xl" />
            </div>
            <div>
              <label htmlFor={`${formId}-last-name`} className="mb-2 block text-sm font-medium">Last Name</label>
              <Input id={`${formId}-last-name`} value={values.lastName} onChange={(event) => setField("lastName", event.target.value)} autoComplete="family-name" maxLength={100} className="h-11 rounded-xl" />
            </div>
          </div>
          <div>
            <label htmlFor={`${formId}-email`} className="mb-2 block text-sm font-medium">Email</label>
            <Input id={`${formId}-email`} type="email" value={values.email} readOnly={isEdit} onChange={(event) => setField("email", event.target.value)} autoComplete="email" className="h-11 rounded-xl" />
          </div>
          {!isEdit && <>
            <div>
              <label htmlFor={`${formId}-password`} className="mb-2 block text-sm font-medium">Password</label>
              <Input id={`${formId}-password`} type="password" value={values.password} onChange={(event) => setField("password", event.target.value)} autoComplete="new-password" minLength={5} maxLength={128} aria-describedby={`${formId}-password-help`} className="h-11 rounded-xl" />
              <p id={`${formId}-password-help`} className="mt-2 text-sm text-muted-foreground">Use 5–128 characters.</p>
            </div>
            {!can("roles.read") ? <p className="text-sm text-muted-foreground">You can create the account without roles. An authorized admin can assign roles later.</p> : roles.isPending ? <p role="status">Loading roles…</p> : roles.isError ? <div role="alert">
              <p className="text-sm text-destructive">Could not load roles. You can retry or create the account without roles.</p>
              <Button type="button" variant="outline" onClick={() => void roles.refetch()}>Retry roles</Button>
            </div> : <RolesPicker options={roles.data} value={values.roleIds} onChange={(roleIds) => setValues((current) => ({ ...current, roleIds }))} disabled={pending} />}
          </>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-3">
            <DialogClose asChild><Button type="button" variant="outline" className="h-11 rounded-full px-5">Cancel</Button></DialogClose>
            <Button type="submit" className="h-11 rounded-full bg-[image:var(--gradient-purple)] px-5 text-white">{pending ? "Saving…" : isEdit ? "Save changes" : "Add Admin"}</Button>
          </div>
        </fieldset>
      </form>
    </DialogContent>
  </Dialog>
}
