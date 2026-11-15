import { useState } from "react"
import { format, formatDistanceToNowStrict } from "date-fns"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { cn } from "../lib/cn"
import { overrideErrorMessage } from "../lib/errors"
import { actionSummary, subjectLabel } from "../lib/overrides"
import { KIND_LABELS } from "../data/catalog"
import type { OverrideState, TrendOverride } from "../types"
import { useEndOverride } from "../hooks"
import { hairline, ink, kindIcons, muted, pill, tones, type Tone } from "./tokens"

const STATES: Record<OverrideState, { label: string; tone: Tone }> = {
  ACTIVE: { label: "In force", tone: "success" },
  SCHEDULED: { label: "Scheduled", tone: "purple" },
  ENDED: { label: "Ended early", tone: "grey" },
  EXPIRED: { label: "Finished", tone: "grey" },
}

/** The state the server reports, or worked out from the dates when it isn't sent. */
function stateOf(override: TrendOverride, now: Date): OverrideState {
  if (override.state) return override.state
  if (override.endedAt) return "ENDED"
  if (new Date(override.endsAt) <= now) return "EXPIRED"
  return new Date(override.startsAt) > now ? "SCHEDULED" : "ACTIVE"
}

/** A list's overrides: what each does, why, until when; any in force or scheduled can be ended now. */
export function OverrideList({ overrides, names, canManage }: { overrides: TrendOverride[]; names: ReadonlyMap<string, string>; canManage: boolean }) {
  const [ending, setEnding] = useState<TrendOverride | null>(null)
  const end = useEndOverride()
  const now = new Date()

  if (overrides.length === 0) return <p className={cn("rounded-2xl border p-4 text-b3", hairline, muted)}>No overrides here.</p>

  const endingName = ending ? subjectLabel(ending.kind, ending.subjectId, names) : ""
  const confirmEnd = () => {
    if (!ending) return
    end.mutate(ending.id, {
      onSuccess: () => {
        toast.success("Override ended", { description: `${endingName} goes back to its earned place within about 30 seconds.` })
        setEnding(null)
      },
    })
  }

  return <>
    <ul aria-label="Overrides" className="flex flex-col gap-2">
      {overrides.map((override) => {
        const name = subjectLabel(override.kind, override.subjectId, names)
        const state = stateOf(override, now)
        const Icon = kindIcons[override.kind]
        const live = state === "ACTIVE" || state === "SCHEDULED"
        return <li key={override.id} className={cn("rounded-2xl border p-3", hairline, !live && "opacity-75")}>
          <div className="flex items-start gap-2">
            <Icon className={cn("mt-0.5 size-4 shrink-0", muted)} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className={cn("min-w-0 truncate text-b2 font-semibold", ink)}>{name}</span>
                <span className={cn(pill, tones.purple)}>{actionSummary(override)}</span>
                <span className={cn(pill, tones[STATES[state].tone])}>{STATES[state].label}</span>
              </p>
              <p className={cn("mt-0.5 text-b3", muted)}>
                {KIND_LABELS[override.kind].one} · {state === "SCHEDULED" ? `starts ${format(new Date(override.startsAt), "d MMM, HH:mm")} · ` : ""}
                {state === "ENDED" && override.endedAt ? `ended ${formatDistanceToNowStrict(new Date(override.endedAt))} ago`
                  : state === "EXPIRED" ? `finished ${format(new Date(override.endsAt), "d MMM")}`
                  : `until ${format(new Date(override.endsAt), "d MMM yyyy, HH:mm")}`}
              </p>
              <p className={cn("mt-1 text-b3 italic", muted)}>“{override.reason}”</p>
            </div>
            {canManage && live && <Button type="button" variant="outline" size="sm" className="h-8 shrink-0 cursor-pointer rounded-full" onClick={() => { end.reset(); setEnding(override) }}>
              End now
            </Button>}
          </div>
        </li>
      })}
    </ul>

    <Dialog open={ending !== null} onOpenChange={(open) => { if (!open && !end.isPending) setEnding(null) }}>
      <DialogContent className="max-w-md rounded-3xl">
        <div>
          <DialogTitle>End this override now?</DialogTitle>
          <DialogDescription className="mt-1">
            {ending ? `${actionSummary(ending)}: ${endingName}.` : ""} It stops applying within about 30 seconds and the subject goes back to its earned place.
            The ending is recorded in the audit log.
          </DialogDescription>
        </div>
        {end.isError && <p role="alert" className="text-b3 text-destructive">{overrideErrorMessage(end.error)}</p>}
        <div className="flex justify-end gap-2">
          <DialogClose asChild><Button type="button" variant="outline" className="h-10 cursor-pointer rounded-full px-4" disabled={end.isPending}>Keep it</Button></DialogClose>
          <Button type="button" className="h-10 cursor-pointer rounded-full bg-destructive px-5 text-white hover:opacity-90" disabled={end.isPending} onClick={confirmEnd}>
            {end.isPending ? "Ending…" : "End now"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </>
}
