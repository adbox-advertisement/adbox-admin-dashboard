import { useId, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "../lib/cn"
import { saveErrorMessage } from "../lib/errors"
import { useLive } from "../lib/live-context"
import { RANKED_FEED_ENV } from "../lib/ranking"
import { useFeedRankingHistory, useRecommendationAccess, useSaveRankedShare } from "../hooks"
import { hairline, ink, muted, series } from "./tokens"

const PRESETS = [0, 10, 25, 50, 100]

/**
 * Who gets the ranked feed: a new feed ranking version that changes only the ranked share, made live
 * after a confirmation. Every other setting is carried over by the server. Mount it once the live
 * policy has loaded, so it starts from the share in force.
 */
export function RankedShareControl() {
  const { feed } = useLive()
  const access = useRecommendationAccess()
  const history = useFeedRankingHistory(access.feed)
  const save = useSaveRankedShare()
  const inputId = useId()
  const noteId = useId()

  const current = feed.rankedPercent
  const [text, setText] = useState(String(current ?? RANKED_FEED_ENV.rankedPercent))
  const [note, setNote] = useState("")
  const [confirming, setConfirming] = useState(false)

  const value = /^\d{1,3}$/.test(text) ? Number(text) : Number.NaN
  const valid = Number.isInteger(value) && value >= 0 && value <= 100
  // With no version live the gateway's own setting applies, so saving even 100% is a change.
  const unchanged = current !== null && value === current
  const nextVersion = (history.data?.[0]?.version ?? feed.active?.version ?? 0) + 1
  const base = feed.active && feed.ignored.length === 0 ? `version ${feed.active.version} (${feed.label})` : `the built-in defaults (${feed.label})`

  const submit = () => save.mutate({ rankedPercent: value, note: note.trim() || undefined }, {
    onSuccess: (created) => {
      setConfirming(false)
      setNote("")
      toast.success(`Version ${created.version} is live`, {
        description: `${created.rankedPercent}% of people get the ranked feed once the app calls it.`,
      })
    },
  })

  return <div id="ranked-share" className={cn("mt-4 scroll-mt-24 rounded-2xl border p-4", hairline)}>
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h4 className={cn("text-b2 font-semibold", ink)}>Change the ranked share</h4>
      <p className={cn("text-b3", muted)} data-testid="ranked-share-now">
        Now: <strong className={ink}>{current === null ? `${RANKED_FEED_ENV.rankedPercent}% (the server's setting)` : `${current}%`}</strong>
      </p>
    </div>

    <div className="mt-3 flex flex-wrap items-center gap-2">
      <div role="group" aria-label="Common shares" className="flex flex-wrap gap-1 rounded-3xl bg-grey-50 p-1 dark:bg-background">
        {PRESETS.map((preset) => <button key={preset} type="button" aria-pressed={value === preset} onClick={() => setText(String(preset))}
          className={cn("min-h-8 cursor-pointer rounded-full px-3 text-b3 font-semibold tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-purple",
            value === preset ? "bg-white text-purple shadow-adbox-small dark:bg-card" : "text-grey-500 hover:text-grey-1000 dark:text-muted-foreground dark:hover:text-foreground")}>
          {preset}%
        </button>)}
      </div>
      <div className="flex items-center gap-1.5">
        <span className={cn("text-b3", muted)}>or</span>
        <Input id={inputId} inputMode="numeric" value={text} aria-invalid={!valid} aria-label="Ranked share (%)" className="h-9 w-20 rounded-lg tabular-nums"
          onChange={(event) => setText(event.target.value.replace(/\D/g, "").slice(0, 3))} />
        <span className={cn("text-b3", muted)}>%</span>
      </div>
    </div>

    {valid
      ? <div className="mt-3">
        <div className="flex h-2 overflow-hidden rounded-full bg-grey-200 dark:bg-muted" aria-hidden="true">
          <span className={cn("h-full transition-[width] duration-300 motion-reduce:transition-none", series.first.swatch)} style={{ width: `${value}%` }} />
        </div>
        <p className={cn("mt-1.5 text-b3", ink)} data-testid="ranked-share-split">
          {value === 0 ? "Ranking off: everyone gets newest first." : value === 100 ? "Everyone gets the ranked feed." : `${value}% ranked · ${100 - value}% newest first.`}
        </p>
      </div>
      : <p role="alert" className="mt-3 text-b3 text-destructive">A whole number from 0 to 100.</p>}

    <label htmlFor={noteId} className={cn("mt-3 block text-b3 font-semibold", ink)}>Why <span className={cn("font-normal", muted)}>(optional, shown in the history and the audit log)</span></label>
    <Input id={noteId} value={note} maxLength={500} placeholder="For example: test ranked against newest first, 50/50" className="mt-1 h-9 rounded-lg"
      onChange={(event) => setNote(event.target.value)} />

    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
      <p className={cn("max-w-md text-b4 leading-4", muted)}>The app still calls the shuffle for Home, so people see no difference until it calls the ranked feed.</p>
      <Button type="button" className="h-9 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] px-4 text-white hover:opacity-90"
        disabled={!valid || unchanged || save.isPending} onClick={() => { save.reset(); setConfirming(true) }}>
        Save as version {nextVersion}
      </Button>
    </div>

    <Dialog open={confirming} onOpenChange={(open) => { if (!open && !save.isPending) setConfirming(false) }}>
      <DialogContent className="max-w-lg rounded-3xl">
        <div>
          <DialogTitle>{value === 0 ? "Switch ranking off for everyone?" : value === 100 ? "Give everyone the ranked feed?" : `Give ${value}% of people the ranked feed?`}</DialogTitle>
          <DialogDescription className="mt-1">This saves version {nextVersion} and makes it live.</DialogDescription>
        </div>
        <ul className={cn("flex list-disc flex-col gap-1.5 pl-5 text-b2 leading-6 marker:text-grey-300", ink)}>
          <li>Ranked share: {current === null ? `the server's setting (${RANKED_FEED_ENV.rankedPercent}%)` : `${current}%`} → <strong>{value}%</strong>. Every other setting stays as it is in {base}.</li>
          <li>Live on every server within 30 seconds, and recorded in the audit log.</li>
          <li>Each person stays in the same group, chosen from their account.</li>
          <li>The app doesn't call the ranked feed yet, so nobody sees a difference until it does.</li>
          {note.trim() && <li>Note: “{note.trim()}”</li>}
        </ul>
        {save.isError && <p role="alert" className="text-b3 text-destructive">{saveErrorMessage(save.error)}</p>}
        <div className="flex justify-end gap-2">
          <DialogClose asChild><Button type="button" variant="outline" className="h-10 cursor-pointer rounded-full px-4" disabled={save.isPending}>Cancel</Button></DialogClose>
          <Button type="button" className="h-10 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] px-5 text-white hover:opacity-90" disabled={save.isPending} onClick={submit}>
            {save.isPending ? "Saving…" : "Save and make live"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
}
