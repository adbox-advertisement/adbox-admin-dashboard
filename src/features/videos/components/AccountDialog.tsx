import { useEffect, useId, useState, type FormEvent } from "react"
import { AtSign, Check, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCreateAccount, useInstitutionDirectory, useStudioAccess, useUpdateAccount, useUsernameCheck } from "../hooks"
import { suggestUsername } from "../lib/caption"
import { cn } from "../lib/cn"
import { serverField, serverMessage } from "../lib/errors"
import { initials } from "../lib/format"
import type { StudioAccount } from "../types"
import { ImageField } from "./ImageField"
import { PlaceFields, type Place } from "./PlaceFields"
import { ink, muted } from "./tokens"

/** Waits until typing stops, so the username check doesn't run on every key. */
function useSettled<T>(value: T, ms = 350) {
  const [settled, setSettled] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), ms)
    return () => clearTimeout(timer)
  }, [value, ms])
  return settled
}

/** Make or edit an account to post from: a regular profile in the app, nobody signs in to it. */
export function AccountDialog({ open, onOpenChange, account, onSaved }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: StudioAccount
  onSaved?: (account: StudioAccount) => void
}) {
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="video-management-ui max-h-[92vh] max-w-xl overflow-y-auto">
      {open && <AccountForm account={account} onDone={(saved) => { onOpenChange(false); onSaved?.(saved) }} />}
    </DialogContent>
  </Dialog>
}

function AccountForm({ account, onDone }: { account?: StudioAccount; onDone: (account: StudioAccount) => void }) {
  const access = useStudioAccess()
  const directory = useInstitutionDirectory(access.institutions)
  const create = useCreateAccount()
  const update = useUpdateAccount()
  const [fullName, setFullName] = useState(account?.fullName ?? "")
  const [username, setUsername] = useState(account?.username ?? "")
  const [usernameEdited, setUsernameEdited] = useState(Boolean(account))
  const [bio, setBio] = useState(account?.bio ?? "")
  const [note, setNote] = useState(account?.note ?? "")
  const [image, setImage] = useState<string | null>(account?.image ?? null)
  const [place, setPlace] = useState<Place>({ institutionId: account?.institution?.id ?? null, campusId: account?.campus?.id ?? null, hallId: null })
  const [error, setError] = useState<{ message: string; field: string | null } | null>(null)
  const ids = { name: useId(), username: useId(), bio: useId(), note: useId(), status: useId() }

  // Until someone types a username, it follows the name.
  const shownUsername = usernameEdited ? username : suggestUsername(fullName)
  const normalized = shownUsername.trim().replace(/^@/, "").toLowerCase()
  const settled = useSettled(normalized)
  const unchanged = account?.username?.toLowerCase() === normalized
  const check = useUsernameCheck(settled, !unchanged && access.manageAccounts)
  const checking = !unchanged && normalized.length >= 3 && (settled !== normalized || check.isFetching)
  const usernameProblem = unchanged ? null : normalized.length > 0 && normalized.length < 3 ? "At least 3 characters." : check.data && check.data.username === normalized && !check.data.available ? check.data.reason : null
  const saving = create.isPending || update.isPending

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    const named = { fullName: fullName.trim(), username: normalized }
    try {
      // An edit sends every field, null for one emptied, so removing a photo or a place sticks.
      const saved = account
        ? await update.mutateAsync({ id: account.id, input: { ...named, bio: bio.trim() || null, imageUrl: image, institutionId: place.institutionId, campusId: place.campusId, note: note.trim() || null } })
        : await create.mutateAsync({ ...named, bio: bio.trim() || undefined, imageUrl: image ?? undefined, institutionId: place.institutionId ?? undefined, campusId: place.campusId ?? undefined, note: note.trim() || undefined })
      toast.success(account ? "Account saved" : `@${saved.username} is ready to post`)
      onDone(saved)
    } catch (failure) {
      setError({ message: serverMessage(failure, "The account couldn't be saved."), field: serverField(failure) })
    }
  }

  const disabled = saving || fullName.trim().length < 2 || normalized.length < 3 || Boolean(usernameProblem) || checking
  return <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-5">
    <div>
      <DialogTitle>{account ? "Edit account" : "New account"}</DialogTitle>
      <DialogDescription className="mt-1">
        {account ? "Changes show in the app at once." : "A regular profile in the app that admins post from. Nobody signs in to it, and every post records who made it."}
      </DialogDescription>
    </div>

    <ImageField label="Profile photo" value={image} onChange={setImage} shape="round" canUpload={access.uploadImages} fallbackText={initials(fullName || "New account")} />

    <label className="flex flex-col gap-1.5" htmlFor={ids.name}>
      <span className={cn("text-b3 font-semibold", ink)}>Name</span>
      <Input id={ids.name} value={fullName} onChange={(event) => setFullName(event.target.value)} maxLength={60} required placeholder="Legon Hall Week" className="h-11 rounded-2xl" />
    </label>

    <div className="flex flex-col gap-1.5">
      <label htmlFor={ids.username} className={cn("text-b3 font-semibold", ink)}>Username</label>
      <div className="relative">
        <AtSign className={cn("pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2", muted)} aria-hidden="true" />
        <Input id={ids.username} value={shownUsername} aria-describedby={ids.status} aria-invalid={Boolean(usernameProblem) || error?.field === "username"}
          onChange={(event) => { setUsernameEdited(true); setUsername(event.target.value) }} maxLength={31} required
          placeholder="legon.hallweek" className="h-11 rounded-2xl pl-10 lowercase" />
      </div>
      <p id={ids.status} aria-live="polite" className={cn("flex items-center gap-1 text-b4", usernameProblem ? "text-destructive" : muted)}>
        {usernameProblem ? <><X className="size-3.5" aria-hidden="true" />{usernameProblem}</>
          : checking ? <><Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />Checking…</>
          : !unchanged && check.data?.available && check.data.username === normalized ? <><Check className="size-3.5 text-success-700 dark:text-success-300" aria-hidden="true" />@{normalized} is free</>
          : "3–30 of a–z, 0–9, dots and underscores."}
      </p>
    </div>

    <label className="flex flex-col gap-1.5" htmlFor={ids.bio}>
      <span className={cn("text-b3 font-semibold", ink)}>Bio <span className={cn("font-normal", muted)}>(optional)</span></span>
      <Textarea id={ids.bio} value={bio} onChange={(event) => setBio(event.target.value)} maxLength={300} rows={3} placeholder="Everything happening at Legon Hall Week." className="rounded-2xl" />
    </label>

    {access.institutions
      ? <PlaceFields directory={directory.data} value={place} onChange={setPlace} />
      : <p className={cn("text-b4", muted)}>Choosing an institution needs the institutions.read permission.</p>}

    <label className="flex flex-col gap-1.5" htmlFor={ids.note}>
      <span className={cn("text-b3 font-semibold", ink)}>Note for admins <span className={cn("font-normal", muted)}>(optional, not in the app)</span></span>
      <Input id={ids.note} value={note} onChange={(event) => setNote(event.target.value)} maxLength={300} placeholder="Runs our coverage of hall week." className="h-11 rounded-2xl" />
    </label>

    {error && <p role="alert" className="rounded-2xl bg-error-500/10 px-4 py-3 text-b3 text-error-700 dark:text-error-300">{error.message}</p>}

    <div className="flex flex-wrap justify-end gap-2">
      <Button type="submit" disabled={disabled} className="h-11 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] px-6 text-white hover:opacity-90">
        {saving && <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}{account ? "Save" : "Create account"}
      </Button>
    </div>
  </form>
}
