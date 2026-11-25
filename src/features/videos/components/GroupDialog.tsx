import { useId, useState, type FormEvent } from "react"
import { Hash, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCreateGroup, useInstitutionDirectory, useStudioAccess, useUpdateGroup } from "../hooks"
import { hashtagProblem, suggestHashtag } from "../lib/caption"
import { cn } from "../lib/cn"
import { serverField, serverMessage } from "../lib/errors"
import type { StudioGroup } from "../types"
import { ImageField } from "./ImageField"
import { PlaceFields, type Place } from "./PlaceFields"
import { ink, muted } from "./tokens"

/** A date input's value from an ISO time, in the browser's day. */
const dateValue = (iso: string | null | undefined) => {
  if (!iso) return ""
  const date = new Date(iso)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}
/** The start or the end of a chosen day, as an ISO time; null for no day. */
const dayEdge = (value: string, edge: "start" | "end") => (value ? new Date(`${value}T${edge === "start" ? "00:00:00" : "23:59:59"}`).toISOString() : null)

/** Make or edit a group such as "Legon Hall Week": its hashtag ties its posts together. */
export function GroupDialog({ open, onOpenChange, group, onSaved }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  group?: StudioGroup
  onSaved?: (group: StudioGroup) => void
}) {
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="video-management-ui max-h-[92vh] max-w-xl overflow-y-auto">
      {open && <GroupForm group={group} onDone={(saved) => { onOpenChange(false); onSaved?.(saved) }} />}
    </DialogContent>
  </Dialog>
}

function GroupForm({ group, onDone }: { group?: StudioGroup; onDone: (group: StudioGroup) => void }) {
  const access = useStudioAccess()
  const directory = useInstitutionDirectory(access.institutions)
  const create = useCreateGroup()
  const update = useUpdateGroup()
  const [name, setName] = useState(group?.name ?? "")
  const [hashtag, setHashtag] = useState(group?.hashtag ?? "")
  const [hashtagEdited, setHashtagEdited] = useState(Boolean(group))
  const [description, setDescription] = useState(group?.description ?? "")
  const [cover, setCover] = useState<string | null>(group?.coverUrl ?? null)
  const [place, setPlace] = useState<Place>({ institutionId: group?.institution?.id ?? null, campusId: group?.campus?.id ?? null, hallId: group?.hall?.id ?? null })
  const [startsOn, setStartsOn] = useState(dateValue(group?.startsAt))
  const [endsOn, setEndsOn] = useState(dateValue(group?.endsAt))
  const [error, setError] = useState<{ message: string; field: string | null } | null>(null)
  const ids = { name: useId(), hashtag: useId(), hashtagHint: useId(), description: useId(), starts: useId(), ends: useId() }

  const shownHashtag = hashtagEdited ? hashtag.replace(/^#/, "") : suggestHashtag(name)
  const problem = shownHashtag ? hashtagProblem(shownHashtag) : null
  const datesProblem = startsOn && endsOn && endsOn < startsOn ? "It can't end before it starts." : null
  const saving = create.isPending || update.isPending

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    // An edit sends every field, null for one emptied, so clearing a cover, a place or a date sticks.
    const input = {
      name: name.trim(),
      description: description.trim() || null,
      coverUrl: cover,
      institutionId: place.institutionId,
      campusId: place.campusId,
      hallId: place.hallId,
      startsAt: dayEdge(startsOn, "start"),
      endsAt: dayEdge(endsOn, "end"),
    }
    const unset = <T,>(value: T | null) => value ?? undefined
    try {
      const saved = group
        ? await update.mutateAsync({ id: group.id, input })
        : await create.mutateAsync({
          name: input.name,
          hashtag: shownHashtag,
          description: unset(input.description),
          coverUrl: unset(input.coverUrl),
          institutionId: unset(input.institutionId),
          campusId: unset(input.campusId),
          hallId: unset(input.hallId),
          startsAt: unset(input.startsAt),
          endsAt: unset(input.endsAt),
        })
      toast.success(group ? "Group saved" : `#${saved.hashtag} is ready`)
      onDone(saved)
    } catch (failure) {
      setError({ message: serverMessage(failure, "The group couldn't be saved."), field: serverField(failure) })
    }
  }

  return <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-5">
    <div>
      <DialogTitle>{group ? "Edit group" : "New group"}</DialogTitle>
      <DialogDescription className="mt-1">Posts in a group carry its hashtag, so the app shows them together, and anyone's post with the hashtag joins it.</DialogDescription>
    </div>

    <ImageField label="Cover" value={cover} onChange={setCover} shape="wide" canUpload={access.uploadImages} fallbackText={shownHashtag || name} />

    <label className="flex flex-col gap-1.5" htmlFor={ids.name}>
      <span className={cn("text-b3 font-semibold", ink)}>Name</span>
      <Input id={ids.name} value={name} onChange={(event) => setName(event.target.value)} maxLength={80} required placeholder="Legon Hall Week" className="h-11 rounded-2xl" />
    </label>

    <div className="flex flex-col gap-1.5">
      <label htmlFor={ids.hashtag} className={cn("text-b3 font-semibold", ink)}>Hashtag</label>
      <div className="relative">
        <Hash className={cn("pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2", muted)} aria-hidden="true" />
        <Input id={ids.hashtag} value={shownHashtag} disabled={Boolean(group)} aria-describedby={ids.hashtagHint}
          aria-invalid={Boolean(problem) || error?.field === "hashtag"} maxLength={51} required placeholder="LegonHallWeek"
          onChange={(event) => { setHashtagEdited(true); setHashtag(event.target.value) }} className="h-11 rounded-2xl pl-10" />
      </div>
      <p id={ids.hashtagHint} className={cn("text-b4", problem ? "text-destructive" : muted)}>
        {group ? "Fixed once made: posts already carry it." : problem ?? "Added to every post in the group. Letters, numbers and underscores."}
      </p>
    </div>

    <label className="flex flex-col gap-1.5" htmlFor={ids.description}>
      <span className={cn("text-b3 font-semibold", ink)}>About it <span className={cn("font-normal", muted)}>(optional)</span></span>
      <Textarea id={ids.description} value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={2} className="rounded-2xl" />
    </label>

    {access.institutions
      ? <PlaceFields directory={directory.data} value={place} onChange={setPlace} withHall />
      : <p className={cn("text-b4", muted)}>Choosing a place needs the institutions.read permission.</p>}

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1.5" htmlFor={ids.starts}>
        <span className={cn("text-b3 font-semibold", ink)}>Starts <span className={cn("font-normal", muted)}>(optional)</span></span>
        <Input id={ids.starts} type="date" value={startsOn} onChange={(event) => setStartsOn(event.target.value)} className="h-11 rounded-2xl" />
      </label>
      <label className="flex flex-col gap-1.5" htmlFor={ids.ends}>
        <span className={cn("text-b3 font-semibold", ink)}>Ends <span className={cn("font-normal", muted)}>(optional)</span></span>
        <Input id={ids.ends} type="date" value={endsOn} min={startsOn || undefined} onChange={(event) => setEndsOn(event.target.value)} aria-invalid={Boolean(datesProblem)} className="h-11 rounded-2xl" />
      </label>
      {datesProblem && <p role="alert" className="text-b4 text-destructive sm:col-span-2">{datesProblem}</p>}
    </div>

    {error && <p role="alert" className="rounded-2xl bg-error-500/10 px-4 py-3 text-b3 text-error-700 dark:text-error-300">{error.message}</p>}

    <div className="flex justify-end">
      <Button type="submit" disabled={saving || name.trim().length < 2 || !shownHashtag || Boolean(problem) || Boolean(datesProblem)}
        className="h-11 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] px-6 text-white hover:opacity-90">
        {saving && <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}{group ? "Save" : "Create group"}
      </Button>
    </div>
  </form>
}
