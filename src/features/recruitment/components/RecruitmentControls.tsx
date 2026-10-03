import { useId } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { statusLabels, statusTones, recruitmentError } from "../lib/workflow"
import type { ApplicationStatus } from "../types"

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${statusTones[status]}`}><span className="size-1.5 rounded-full bg-current" aria-hidden="true" />{statusLabels[status]}</span>
}

export function RecruitmentSelect({ label, value, onChange, options, disabled = false }: {
  label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; disabled?: boolean
}) {
  const id = useId()
  return <div className="min-w-0 space-y-1.5">
    <label htmlFor={id} className="block text-xs font-medium text-muted-foreground">{label}</label>
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger id={id} className="h-11 w-full min-w-0 bg-card [&>span]:truncate"><SelectValue /></SelectTrigger>
      <SelectContent>{options.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
    </Select>
  </div>
}

export function RecruitmentError({ error, retry }: { error: unknown; retry?: () => void }) {
  return <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-error-300 bg-error-50 p-4 text-sm text-error-900 dark:border-error-400/30 dark:bg-error-400/10 dark:text-error-400">
    <AlertCircle className="size-4 shrink-0" aria-hidden="true" /><p className="min-w-0 flex-1">{recruitmentError(error)}</p>
    {retry && <Button variant="outline" onClick={retry}>Try again</Button>}
  </div>
}
