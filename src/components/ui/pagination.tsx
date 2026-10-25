import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { pageRange } from "@/lib/pagination"

export function Pagination({ page, limit, total, noun, onPageChange }: {
  page: number
  limit: number
  total: number
  noun: string
  onPageChange: (page: number) => void
}) {
  const { from, to, pages } = pageRange(page, limit, total)
  return <nav aria-label={`${noun} pages`} className="flex flex-wrap items-center justify-between gap-3 border-t border-grey-200 px-4 py-3 text-b3 text-grey-500 dark:border-border dark:text-muted-foreground sm:px-6">
    <p aria-live="polite">Showing <span className="font-semibold text-grey-1000 dark:text-foreground">{from}–{to}</span> of <span className="font-semibold text-grey-1000 dark:text-foreground">{total.toLocaleString()}</span> {noun}</p>
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" size="icon" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="size-9 cursor-pointer rounded-full">
        <ChevronLeft className="size-4" aria-hidden="true" />
      </Button>
      <span className="min-w-[4.5rem] text-center">Page {page} of {pages}</span>
      <Button type="button" variant="outline" size="icon" aria-label="Next page" disabled={page >= pages} onClick={() => onPageChange(page + 1)} className="size-9 cursor-pointer rounded-full">
        <ChevronRight className="size-4" aria-hidden="true" />
      </Button>
    </div>
  </nav>
}
