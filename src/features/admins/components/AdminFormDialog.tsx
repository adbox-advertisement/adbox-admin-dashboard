import { useId, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useCreateAdmin, useRoles, useUpdateAdmin, useViewer } from "../hooks"
import { access } from "../lib/access"
import { createAdminSchema, updateAdminSchema } from "../validation"
import { rbacErrorMessage } from "../lib/errors"
import type { Admin } from "../types"
import { LockNote, primaryButton } from "./AdminBits"
import { RoleChecklist } from "./Checklists"

type Props = { onClose: () => void } & ({ mode: "create"; onCreated: (admin: Admin) => void } | { mode: "edit"; admin: Admin })

/** A new admin (name, sign-in email, password and, for a Super Admin, roles), or an admin's name. */
export function AdminFormDialog(props: Props) {
  const { onClose } = props
  const isEdit = props.mode === "edit"
  const viewer = useViewer()
  const create = useCreateAdmin()
  const update = useUpdateAdmin()
  const withRoles = !isEdit && access.giveNewAdminRoles(viewer)
  const roles = useRoles(withRoles)
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
  const allowed = isEdit ? access.editName(viewer, props.admin) : access.addAdmin(viewer)

  function setField(field: "firstName" | "lastName" | "email" | "password", value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setError("")
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (pending || !allowed) return
    setError("")
    try {
      if (props.mode === "edit") {
        const parsed = updateAdminSchema.safeParse({ firstName: values.firstName, lastName: values.lastName })
        if (!parsed.success) { setError(parsed.error.issues[0].message); return }
        await update.mutateAsync({ id: props.admin.id, input: parsed.data })
        onClose()
      } else {
        const parsed = createAdminSchema.safeParse({ ...values, roleIds: withRoles ? values.roleIds : [] })
        if (!parsed.success) { setError(parsed.error.issues[0].message); return }
        const admin = await create.mutateAsync(parsed.data)
        create.reset()
        props.onCreated(admin)
      }
    } catch (failure) {
      setError(rbacErrorMessage(failure, "Could not save the admin. Check the list before trying again.", "admin"))
    }
  }

  return <Dialog open onOpenChange={(open) => { if (!open && !pending) onClose() }}>
    <DialogContent className="flex max-h-[calc(100svh-2rem)] max-w-xl flex-col gap-0 overflow-hidden rounded-3xl p-0">
      <div className="border-b border-grey-200 px-6 py-5 pr-14 dark:border-border">
        <DialogTitle>{isEdit ? "Edit name" : "Add admin"}</DialogTitle>
        <DialogDescription className="mt-1.5">{isEdit ? "Their sign-in email stays the same." : "They sign in to this dashboard with this email and password. Share the password with them privately."}</DialogDescription>
      </div>
      <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
        <fieldset disabled={pending || !allowed} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${formId}-first-name`} className="mb-1.5 block text-sm font-medium">First name</label>
              <Input id={`${formId}-first-name`} value={values.firstName} onChange={(event) => setField("firstName", event.target.value)} autoComplete="off" maxLength={100} className="h-11 rounded-xl" />
            </div>
            <div>
              <label htmlFor={`${formId}-last-name`} className="mb-1.5 block text-sm font-medium">Last name</label>
              <Input id={`${formId}-last-name`} value={values.lastName} onChange={(event) => setField("lastName", event.target.value)} autoComplete="off" maxLength={100} className="h-11 rounded-xl" />
            </div>
          </div>
          {!isEdit && <>
            <div>
              <label htmlFor={`${formId}-email`} className="mb-1.5 block text-sm font-medium">Email</label>
              <Input id={`${formId}-email`} type="email" value={values.email} onChange={(event) => setField("email", event.target.value)} autoComplete="off" className="h-11 rounded-xl" />
            </div>
            <div>
              <label htmlFor={`${formId}-password`} className="mb-1.5 block text-sm font-medium">Password</label>
              <Input id={`${formId}-password`} type="password" value={values.password} onChange={(event) => setField("password", event.target.value)} autoComplete="new-password" minLength={5} maxLength={128} aria-describedby={`${formId}-password-help`} className="h-11 rounded-xl" />
              <p id={`${formId}-password-help`} className="mt-1.5 text-xs text-muted-foreground">5 to 128 characters.</p>
            </div>
            <div className="flex min-h-0 flex-col gap-2">
              <p className="text-sm font-medium">Roles</p>
              {!withRoles ? <LockNote>Only a Super Admin can give roles. The account starts with none; ask a Super Admin to add them.</LockNote>
                : roles.isPending ? <p role="status" className="text-sm text-muted-foreground">Loading roles…</p>
                  : roles.isError ? <div role="alert" className="flex flex-wrap items-center gap-3">
                    <p className="text-sm text-destructive">Could not load roles. Try again, or add the account without roles.</p>
                    <Button type="button" variant="outline" className="h-9 rounded-full" onClick={() => void roles.refetch()}>Retry roles</Button>
                  </div>
                    : <RoleChecklist roles={roles.data} value={values.roleIds} onChange={(roleIds) => setValues((current) => ({ ...current, roleIds }))} disabled={pending} />}
            </div>
          </>}
        </fieldset>
        <div className="flex flex-col gap-3 border-t border-grey-200 px-6 py-4 dark:border-border">
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <DialogClose asChild><Button type="button" variant="outline" disabled={pending} className="h-10 rounded-full px-4">Cancel</Button></DialogClose>
            <Button type="submit" disabled={pending || !allowed} className={primaryButton}>{pending ? "Saving…" : isEdit ? "Save name" : "Add admin"}</Button>
          </div>
        </div>
      </form>
    </DialogContent>
  </Dialog>
}
