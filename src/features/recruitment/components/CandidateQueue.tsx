import { ArrowRight, ChevronLeft, ChevronRight, SearchX, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDate, initials } from "../lib/workflow"
import type { ApplicationSummary } from "../types"
import { RecruitmentSelect, StatusBadge } from "./RecruitmentControls"

export function CandidateQueue({ items, total, page, limit, onPage, onPageSize, onSelect, isFetching, hasFilters, onReset }: {
  items: ApplicationSummary[]; total: number; page: number; limit: number; onPage: (page: number) => void; onPageSize: (limit: number) => void;
  onSelect: (id: string) => void; isFetching: boolean; hasFilters: boolean; onReset: () => void
}) {
  const pages = Math.max(1, Math.ceil(total / limit))
  return <div aria-busy={isFetching}>
    {items.length === 0 ? <div className="flex flex-col items-center px-5 py-14 text-center"><span className="rounded-2xl bg-blue/5 p-4 text-blue dark:bg-cyan/10 dark:text-cyan"><SearchX className="size-7" aria-hidden="true" /></span><h3 className="mt-5 text-lg font-semibold">{hasFilters ? "No matching candidates" : "Your next team is on its way"}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{hasFilters ? "Try a different name or remove a filter to see more applicants." : "New applications will appear here, ready for your first review."}</p>{hasFilters && <Button variant="outline" className="mt-5 h-10" onClick={onReset}>Reset filters</Button>}</div> : <>
      <div className="hidden grid-cols-12 gap-3 border-y border-border bg-muted/50 px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground min-[800px]:grid"><span className="col-span-5">Candidate</span><span className="col-span-3">Stage</span><span className="col-span-2">Submitted</span><span className="col-span-2 text-right">Rating</span></div>
      <ul className="divide-y divide-border" aria-label="Candidates">
        {items.map(item => <li key={item.id}>
          <button type="button" onClick={() => onSelect(item.id)} aria-label={`Review ${item.redactedAt ? item.reference : item.fullName}`} className="group grid w-full grid-cols-1 items-center gap-3 px-5 py-4 text-left outline-none transition hover:bg-blue/5 focus-visible:bg-blue/5 focus-visible:shadow-adbox-focus-secondary dark:hover:bg-cyan/5 dark:focus-visible:bg-cyan/5 min-[800px]:grid-cols-12 min-[800px]:gap-3">
            <div className="flex min-w-0 items-center gap-3 min-[800px]:col-span-5"><span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue/8 text-sm font-semibold text-blue ring-1 ring-blue/10 dark:bg-cyan/10 dark:text-cyan dark:ring-cyan/15">{initials(item.redactedAt ? "" : item.fullName)}</span><div className="min-w-0"><p className="truncate text-sm font-semibold group-hover:text-blue dark:group-hover:text-cyan">{item.redactedAt ? "Applicant data removed" : item.fullName}</p><p className="mt-1 truncate text-xs text-muted-foreground">{item.institution.shortName || item.institution.name}<span className="mx-1.5 opacity-50">·</span>{item.reference}</p><p className="mt-1 truncate text-[11px] text-muted-foreground">{item.campaign.title}</p></div></div>
            <div className="flex items-center justify-between gap-2 min-[800px]:col-span-3"><StatusBadge status={item.status} /><span className="flex items-center gap-1 text-xs font-medium text-blue dark:text-cyan min-[800px]:hidden">Review<ArrowRight className="size-3.5" aria-hidden="true" /></span></div>
            <p className="hidden text-xs text-muted-foreground min-[800px]:col-span-2 min-[800px]:block">{formatDate(item.createdAt)}</p>
            <div className="flex items-center justify-between gap-2 text-xs min-[800px]:col-span-2 min-[800px]:justify-end"><span className="text-[11px] text-muted-foreground min-[800px]:hidden">Submitted {formatDate(item.createdAt)}</span><span className="flex items-center gap-1">{item.rating ? <><Star className="size-3.5 fill-warning-500 text-warning-700 dark:text-warning-400" aria-hidden="true" /><span className="font-semibold">{item.rating}</span><span className="text-muted-foreground">/ 5</span></> : <span className="text-xs text-muted-foreground">Unrated</span>}<ArrowRight className="ml-2 hidden size-4 text-muted-foreground/50 group-hover:text-blue dark:group-hover:text-cyan min-[800px]:block" aria-hidden="true" /></span></div>
          </button>
        </li>)}
      </ul>
    </>}
    <div className="flex flex-wrap items-end justify-between gap-4 border-t border-border px-5 py-4 text-xs text-muted-foreground">
      <div className="flex items-end gap-3"><div className="w-20"><RecruitmentSelect label="Per page" value={String(limit)} onChange={value => onPageSize(Number(value))} options={[10, 20, 50].map(value => ({ value: String(value), label: String(value) }))} disabled={isFetching} /></div><p className="pb-3" aria-live="polite">{total === 0 ? "0 candidates" : `${items.length ? (page - 1) * limit + 1 : 0}–${Math.min(page * limit, total)} of ${total} candidates`}</p></div>
      <div className="flex h-11 items-center gap-2"><Button variant="outline" size="icon" className="size-9 rounded-xl" aria-label="Previous page" disabled={page <= 1 || isFetching} onClick={() => onPage(page - 1)}><ChevronLeft aria-hidden="true" /></Button><span className="min-w-16 text-center tabular-nums">{page} / {pages}</span><Button variant="outline" size="icon" className="size-9 rounded-xl" aria-label="Next page" disabled={page >= pages || isFetching} onClick={() => onPage(page + 1)}><ChevronRight aria-hidden="true" /></Button></div>
    </div>
  </div>
}
