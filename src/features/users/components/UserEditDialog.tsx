import { useId, useState, type FormEvent } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useInstitutions, useUpdatePlatformUser, useUserAccess } from "../hooks"
import { usersErrorMessage } from "../lib/errors"
import { USER_PERMISSIONS, studentStatusLabels, userDisplayName, type PlatformUser, type StudentStatus } from "../types"
import { studentStatuses, updatePlatformUserSchema, type UpdatePlatformUserInput } from "../validation"

const field = "h-11 rounded-xl"
const selectTrigger = "h-11 w-full cursor-pointer rounded-xl"

function toNumber(value: string) {
  return value.trim() === "" ? undefined : Number(value)
}

export function UserEditDialog({ user, onClose }: { user: PlatformUser; onClose: () => void }) {
  const profile = user.userProfile
  const can = useUserAccess()
  const update = useUpdatePlatformUser()
  const institutions = useInstitutions(can(USER_PERMISSIONS.institutionsRead))
  const [values, setValues] = useState(() => ({
    username: profile?.username ?? "",
    institutionId: profile?.institutionId ?? "",
    campusId: profile?.campusId ?? "",
    studentStatus: profile?.studentStatus ?? "",
    level: profile?.level?.toString() ?? "",
    programme: profile?.programme ?? "",
    graduationYear: profile?.graduationYear?.toString() ?? "",
  }))
  const [error, setError] = useState("")
  const id = useId()
  const allowed = can(USER_PERMISSIONS.update) && Boolean(profile)
  const campuses = institutions.data?.find((institution) => institution.id === values.institutionId)?.campuses ?? []

  function set<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    setError("")
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (update.isPending || !allowed || !profile) return
    const institutionChanged = values.institutionId !== (profile.institutionId ?? "")
    if (institutionChanged && campuses.length > 0 && !values.campusId) {
      setError("Choose a campus for the new institution.")
      return
    }
    // Send only what changed; the API cannot clear fields, so blanks are left untouched.
    const changes: Record<string, unknown> = {}
    if (values.username.trim() && values.username.trim() !== (profile.username ?? "")) changes.username = values.username
    if (values.institutionId && institutionChanged) changes.institutionId = values.institutionId
    if (values.campusId && values.campusId !== (profile.campusId ?? "")) changes.campusId = values.campusId
    if (values.studentStatus && values.studentStatus !== (profile.studentStatus ?? "")) changes.studentStatus = values.studentStatus
    if (values.level.trim() && toNumber(values.level) !== profile.level) changes.level = toNumber(values.level)
    if (values.programme.trim() && values.programme.trim() !== (profile.programme ?? "")) changes.programme = values.programme
    if (values.graduationYear.trim() && toNumber(values.graduationYear) !== profile.graduationYear) changes.graduationYear = toNumber(values.graduationYear)
    if (Object.keys(changes).length === 0) { onClose(); return }

    const parsed = updatePlatformUserSchema.safeParse(changes)
    if (!parsed.success) { setError(parsed.error.issues[0].message); return }
    try {
      await update.mutateAsync({ id: user.id, input: parsed.data satisfies UpdatePlatformUserInput })
      toast.success("Profile updated")
      onClose()
    } catch (cause) {
      setError(usersErrorMessage(cause, "Could not save the profile. Try again."))
    }
  }

  return <Dialog open onOpenChange={(next) => { if (!next && !update.isPending) onClose() }}>
    <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-xl gap-0 overflow-y-auto rounded-3xl p-0">
      <div className="border-b border-border px-6 py-5 pr-14">
        <DialogTitle>Edit {userDisplayName(user)}</DialogTitle>
        <DialogDescription className="mt-2">Correct profile and education details. Email, password, and account role can only be changed by the user or platform rules.</DialogDescription>
      </div>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5 p-6">
        <fieldset disabled={update.isPending || !allowed} className="contents">
          <div>
            <label htmlFor={`${id}-username`} className="mb-2 block text-sm font-medium">Username</label>
            <Input id={`${id}-username`} value={values.username} onChange={(event) => set("username", event.target.value)} maxLength={100} autoComplete="off" className={field} />
          </div>

          {institutions.data ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <span id={`${id}-institution`} className="mb-2 block text-sm font-medium">Institution</span>
              <Select value={values.institutionId || undefined} onValueChange={(value) => setValues((current) => ({ ...current, institutionId: value, campusId: "" }))}>
                <SelectTrigger aria-labelledby={`${id}-institution`} className={selectTrigger}><SelectValue placeholder="Select institution" /></SelectTrigger>
                <SelectContent>{institutions.data.map((institution) => <SelectItem key={institution.id} value={institution.id}>{institution.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <span id={`${id}-campus`} className="mb-2 block text-sm font-medium">Campus</span>
              <Select value={values.campusId || undefined} onValueChange={(value) => set("campusId", value)} disabled={campuses.length === 0}>
                <SelectTrigger aria-labelledby={`${id}-campus`} className={selectTrigger}><SelectValue placeholder={campuses.length ? "Select campus" : "No campuses listed"} /></SelectTrigger>
                <SelectContent>{campuses.map((campus) => <SelectItem key={campus.id} value={campus.id}>{campus.name} · {campus.city}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div> : institutions.isPending && can(USER_PERMISSIONS.institutionsRead)
            ? <p role="status" className="text-sm text-muted-foreground">Loading institutions…</p>
            : <p className="text-sm text-muted-foreground">Institution and campus changes need the institutions.read permission.</p>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <span id={`${id}-status`} className="mb-2 block text-sm font-medium">Student status</span>
              <Select value={values.studentStatus || undefined} onValueChange={(value) => set("studentStatus", value as StudentStatus)}>
                <SelectTrigger aria-labelledby={`${id}-status`} className={selectTrigger}><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{studentStatuses.map((status) => <SelectItem key={status} value={status}>{studentStatusLabels[status]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor={`${id}-level`} className="mb-2 block text-sm font-medium">Level</label>
              <Input id={`${id}-level`} type="number" inputMode="numeric" min={100} max={900} step={100} value={values.level} onChange={(event) => set("level", event.target.value)} placeholder="e.g. 300" className={field} />
            </div>
            <div>
              <label htmlFor={`${id}-graduation`} className="mb-2 block text-sm font-medium">Graduation year</label>
              <Input id={`${id}-graduation`} type="number" inputMode="numeric" min={1950} max={2100} value={values.graduationYear} onChange={(event) => set("graduationYear", event.target.value)} placeholder="e.g. 2027" className={field} />
            </div>
          </div>

          <div>
            <label htmlFor={`${id}-programme`} className="mb-2 block text-sm font-medium">Programme</label>
            <Input id={`${id}-programme`} value={values.programme} onChange={(event) => set("programme", event.target.value)} maxLength={200} placeholder="e.g. BSc Computer Science" className={field} />
          </div>

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-3">
            <DialogClose asChild><Button type="button" variant="outline" className="h-11 rounded-full px-5">Cancel</Button></DialogClose>
            <Button type="submit" className="h-11 rounded-full bg-[image:var(--gradient-purple)] px-5 text-white">{update.isPending ? "Saving…" : "Save changes"}</Button>
          </div>
        </fieldset>
      </form>
    </DialogContent>
  </Dialog>
}
