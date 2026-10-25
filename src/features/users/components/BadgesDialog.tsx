import { useId, useState, type FormEvent, type ReactNode } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useUpdateUserBadges, useUserAccess } from "../hooks"
import { usersErrorMessage } from "../lib/errors"
import { endOfDayIso, formatDate } from "../lib/format"
import { USER_PERMISSIONS, activeBadges, studentStatusLabels, userDisplayName, verificationTierLabels, type PlatformUser, type StudentStatus, type VerificationTier } from "../types"
import { studentStatuses, updateBadgesSchema, verificationTiers, type UpdateBadgesInput } from "../validation"

const selectTrigger = "h-11 w-full cursor-pointer rounded-xl"

function Choice<T extends string>({ name, value, options, onChange }: { name: string; value: T; options: Array<{ value: T; label: string }>; onChange: (value: T) => void }) {
  return <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-1 rounded-full bg-grey-50 p-1 dark:bg-background">
    {options.map((option) => <button key={option.value} type="button" role="radio" aria-checked={value === option.value} onClick={() => onChange(option.value)}
      className={cn("cursor-pointer rounded-full px-3.5 py-1.5 text-b3 font-semibold transition-colors", value === option.value ? "bg-white text-purple shadow-adbox-small dark:bg-card" : "text-grey-500 hover:text-grey-1000 dark:text-muted-foreground dark:hover:text-foreground")}>
      {option.label}
    </button>)}
  </div>
}

function Group({ title, hint, children }: { title: string; hint: ReactNode; children: ReactNode }) {
  return <fieldset className="flex flex-col gap-3 rounded-2xl border border-grey-200 p-4 dark:border-border">
    <legend className="px-1 text-sm font-semibold">{title}</legend>
    <p className="-mt-1 text-b4 text-muted-foreground">{hint}</p>
    {children}
  </fieldset>
}

export function BadgesDialog({ user, onClose }: { user: PlatformUser; onClose: () => void }) {
  const profile = user.userProfile
  const can = useUserAccess()
  const update = useUpdateUserBadges()
  const held = activeBadges(profile)
  const id = useId()
  const [studentStatus, setStudentStatus] = useState<StudentStatus | "NONE">(profile?.studentStatus ?? "NONE")
  const [tier, setTier] = useState<VerificationTier>(profile?.verificationTier ?? "SELF_DECLARED")
  const [honour, setHonour] = useState<"keep" | "GRANT" | "REVOKE">("keep")
  const [honourDate, setHonourDate] = useState("")
  const [spotlight, setSpotlight] = useState<"keep" | "set" | "off">("keep")
  const [spotlightDate, setSpotlightDate] = useState("")
  const [error, setError] = useState("")
  const allowed = can(USER_PERMISSIONS.badges) && Boolean(profile)
  const today = new Date().toISOString().slice(0, 10)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (update.isPending || !allowed || !profile) return
    const changes: UpdateBadgesInput = {}
    const nextStatus = studentStatus === "NONE" ? null : studentStatus
    if (nextStatus !== profile.studentStatus) changes.studentStatus = nextStatus
    if (tier !== profile.verificationTier) changes.verificationTier = tier
    if (honour !== "keep") changes.honour = honour
    if (honour === "GRANT" && honourDate) {
      if (honourDate <= today) { setError("Choose a renewal date in the future."); return }
      changes.honourRenewsAt = endOfDayIso(honourDate)
    }
    if (spotlight === "off") changes.spotlightUntil = null
    if (spotlight === "set") {
      if (!spotlightDate || spotlightDate < today) { setError("Choose the last day Spotlight should run."); return }
      changes.spotlightUntil = endOfDayIso(spotlightDate)
    }
    if (Object.keys(changes).length === 0) { onClose(); return }
    const parsed = updateBadgesSchema.safeParse(changes)
    if (!parsed.success) { setError(parsed.error.issues[0].message); return }
    try {
      await update.mutateAsync({ id: user.id, input: parsed.data })
      toast.success("Badges updated", { description: "The change is recorded in the audit log." })
      onClose()
    } catch (cause) {
      setError(usersErrorMessage(cause, "Could not update the badges. Try again."))
    }
  }

  return <Dialog open onOpenChange={(next) => { if (!next && !update.isPending) onClose() }}>
    <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-xl gap-0 overflow-y-auto rounded-3xl p-0">
      <div className="border-b border-border px-6 py-5 pr-14">
        <DialogTitle>Badges for {userDisplayName(user)}</DialogTitle>
        <DialogDescription className="mt-2">Badges appear beside their name across AdBox. The company seal follows company approval and can't be set here.</DialogDescription>
      </div>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4 p-6">
        <fieldset disabled={update.isPending || !allowed} className="contents">
          <Group title="Campus badge" hint="Shown only when the affiliation is verified.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <span id={`${id}-kind`} className="mb-2 block text-sm font-medium">Affiliation</span>
                <Select value={studentStatus} onValueChange={(value) => { setStudentStatus(value as StudentStatus | "NONE"); setError("") }}>
                  <SelectTrigger aria-labelledby={`${id}-kind`} className={selectTrigger}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">No affiliation</SelectItem>
                    {studentStatuses.map((value) => <SelectItem key={value} value={value}>{studentStatusLabels[value]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <span id={`${id}-tier`} className="mb-2 block text-sm font-medium">Verification</span>
                <Select value={tier} onValueChange={(value) => { setTier(value as VerificationTier); setError("") }}>
                  <SelectTrigger aria-labelledby={`${id}-tier`} className={selectTrigger}><SelectValue /></SelectTrigger>
                  <SelectContent>{verificationTiers.map((value) => <SelectItem key={value} value={value}>{verificationTierLabels[value]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </Group>

          <Group title="Gye Nyame" hint={held.honour ? `Held since ${formatDate(profile?.honourSince ?? null)}${profile?.honourRenewsAt ? `, renews ${formatDate(profile.honourRenewsAt)}` : ""}.` : "Not held. Usually granted from Honours review after nominations."}>
            <Choice name="Gye Nyame change" value={honour} onChange={(value) => { setHonour(value); setError("") }} options={[
              { value: "keep", label: "No change" },
              { value: "GRANT", label: held.honour ? "Grant again" : "Grant" },
              ...(held.honour ? [{ value: "REVOKE" as const, label: "Revoke" }] : []),
            ]} />
            {honour === "GRANT" && <div>
              <label htmlFor={`${id}-renews`} className="mb-2 block text-sm font-medium">Renews on <span className="font-normal text-muted-foreground">(optional, a year by default)</span></label>
              <Input id={`${id}-renews`} type="date" min={today} value={honourDate} onChange={(event) => { setHonourDate(event.target.value); setError("") }} className="h-11 rounded-xl" />
            </div>}
          </Group>

          <Group title="Spotlight" hint={held.spotlight ? `On until ${formatDate(profile?.spotlightUntil ?? null, "MMM d, yyyy 'at' h:mm a")}.` : "Off. People normally buy it with gold."}>
            <Choice name="Spotlight change" value={spotlight} onChange={(value) => { setSpotlight(value); setError("") }} options={[
              { value: "keep", label: "No change" },
              { value: "set", label: held.spotlight ? "Change end date" : "Turn on" },
              ...(held.spotlight ? [{ value: "off" as const, label: "Turn off" }] : []),
            ]} />
            {spotlight === "set" && <div>
              <label htmlFor={`${id}-spotlight`} className="mb-2 block text-sm font-medium">Last day</label>
              <Input id={`${id}-spotlight`} type="date" min={today} value={spotlightDate} onChange={(event) => { setSpotlightDate(event.target.value); setError("") }} className="h-11 rounded-xl" />
            </div>}
          </Group>

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-3">
            <DialogClose asChild><Button type="button" variant="outline" className="h-11 rounded-full px-5">Cancel</Button></DialogClose>
            <Button type="submit" className="h-11 rounded-full bg-[image:var(--gradient-purple)] px-5 text-white">{update.isPending ? "Saving…" : "Save badges"}</Button>
          </div>
        </fieldset>
      </form>
    </DialogContent>
  </Dialog>
}
