import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useExportApplications } from "../hooks"
import type { ExportFilters } from "../types"
import { RecruitmentError } from "./RecruitmentControls"

export function ExportDialog({ filters, hasSearch }: { filters: ExportFilters; hasSearch: boolean }) {
  const [open, setOpen] = useState(false)
  const download = useExportApplications()
  return <>
    <Button variant="outline" className="h-10 bg-card px-4" onClick={() => setOpen(true)}><Download aria-hidden="true" />Export CSV</Button>
    <Dialog open={open} onOpenChange={value => { if (!download.isPending) { setOpen(value); download.reset() } }}>
      <DialogContent><DialogTitle>Export applications</DialogTitle><DialogDescription>Download up to 10,000 applications matching the selected campaign, institution, and review stage. The export includes contact details and summary fields; full written answers and videos stay in the candidate profile.</DialogDescription>
        {hasSearch && <p className="rounded-lg bg-warning-200 p-3 dark:bg-warning-500/10 dark:text-warning-400 text-sm text-warning-1000">Text search is not applied to exports. This file may include candidates outside your search results.</p>}
        {download.isError && <RecruitmentError error={download.error} />}
        <Button variant="secondary" className="h-10" disabled={download.isPending} onClick={() => download.mutate(filters, { onSuccess: csv => {
          const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }))
          const link = document.createElement("a")
          link.href = url; link.download = `recruitment-applications-${new Date().toISOString().slice(0, 10)}.csv`
          link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
          setOpen(false); download.reset()
        } })}>{download.isPending ? "Preparing download…" : "Download CSV"}</Button>
      </DialogContent>
    </Dialog>
  </>
}
