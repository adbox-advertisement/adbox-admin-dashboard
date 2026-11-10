import { useId, useState } from "react"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useAddCodes } from "../hooks"
import { errorText } from "../lib/rewards"
import type { OfferRow } from "../types"

/** Paste a batch of voucher codes from the partner, one per line. Blank lines and repeats are dropped. */
export function AddCodesDialog({ offer, onClose, onAdded }: { offer: OfferRow; onClose: () => void; onAdded: (message: string) => void }) {
  const add = useAddCodes()
  const [text, setText] = useState("")
  const fieldId = useId()
  const codes = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const unique = new Set(codes).size

  const submit = () => add.mutate({ offerId: offer.id, codes }, {
    onSuccess: ({ added, skipped }) => onAdded(`Added ${added} ${added === 1 ? "code" : "codes"} to ${offer.name}${skipped ? `; ${skipped} ${skipped === 1 ? "was a repeat" : "were repeats"} and left out` : ""}.`),
  })

  return <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
    <DialogContent className="max-w-lg">
      <DialogTitle>Add codes for {offer.name}</DialogTitle>
      <DialogDescription>{offer.stock ?? 0} left now. Paste the codes {offer.partner.shortName} sent, one per line. Codes already added are left out.</DialogDescription>
      <form className="flex flex-col gap-3" onSubmit={(event) => { event.preventDefault(); if (unique) submit() }}>
        <label htmlFor={fieldId} className="text-sm font-semibold">Codes</label>
        <Textarea id={fieldId} value={text} onChange={(event) => setText(event.target.value)} rows={8} spellCheck={false} autoComplete="off" placeholder={"MLC-XXXX-XXXX\nMLC-XXXX-XXXX"} className="font-mono text-sm" aria-describedby={`${fieldId}-count`} />
        <p id={`${fieldId}-count`} aria-live="polite" className="text-xs text-muted-foreground">
          {codes.length === 0 ? "No codes yet." : `${unique} ${unique === 1 ? "code" : "codes"}${codes.length > unique ? ` (${codes.length - unique} repeated in the list)` : ""}.`}
        </p>
        {add.isError && <p role="alert" className="text-sm text-destructive">{errorText(add.error, "Those codes didn't save.")}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <DialogClose asChild><Button type="button" variant="ghost" className="h-10 rounded-full px-4">Cancel</Button></DialogClose>
          <Button type="submit" className="h-10 rounded-full bg-[image:var(--gradient-purple)] px-4 text-white hover:opacity-90" disabled={!unique || add.isPending}>
            {add.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Plus aria-hidden="true" />}Add {unique || ""} {unique === 1 ? "code" : "codes"}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
}
