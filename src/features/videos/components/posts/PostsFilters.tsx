import { ArrowDownWideNarrow, Film, GraduationCap, Images, LayoutGrid, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { uploadSchools } from "../../data/schools"
import type { usePostFilters } from "../../hooks/use-post-filters"

type Props = ReturnType<typeof usePostFilters> & { counts: { all: number; video: number; photo: number } }

export function PostsFilters({ query, school, media, sort, setFilter, hasFilters, clearFilters, counts }: Props) {
  return (
    <div className="rounded-3xl border border-border/70 bg-card p-4 sm:p-5">
      <div className="flex flex-col justify-between gap-4 min-[900px]:flex-row min-[900px]:items-center">
        <div className="flex gap-1 self-start rounded-xl bg-muted/80 p-1" role="group" aria-label="Filter by media type">
          {([{ value: "all", label: "All posts", icon: LayoutGrid }, { value: "video", label: "Videos", icon: Film }, { value: "photo", label: "Photos", icon: Images }] as const).map(({ value, label, icon: Icon }) => (
            <Button key={value} type="button" variant="ghost" aria-pressed={media === value} onClick={() => setFilter("type", value)} className={cn("h-10 gap-1.5 rounded-lg px-2.5 text-xs sm:px-3 sm:text-sm", media === value ? "bg-card text-secondary shadow-adbox-small hover:bg-card hover:text-secondary" : "text-muted-foreground")}>
              <Icon className="hidden size-3.5 min-[380px]:block" aria-hidden="true" />{label}<span className={cn("hidden rounded-md px-1.5 py-0.5 text-[10px] tabular-nums min-[480px]:inline", media === value ? "bg-secondary/8 text-secondary" : "bg-grey-200/50 text-muted-foreground")}>{counts[value]}</span>
            </Button>
          ))}
        </div>
        <label className="relative block min-w-0 min-[900px]:w-[300px]">
          <span className="sr-only">Search posts</span><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input type="search" value={query} onChange={(event) => setFilter("q", event.target.value)} placeholder="Find a post or collection…" className="h-11 rounded-xl border-border bg-card pl-10 pr-3 text-sm" />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/70 pt-4">
        <Select value={school} onValueChange={(value) => setFilter("school", value)}>
          <SelectTrigger aria-label="Filter by school" className="h-11 w-full min-[480px]:w-[230px]"><span className="flex min-w-0 items-center gap-2"><GraduationCap className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><SelectValue /></span></SelectTrigger>
          <SelectContent className="video-management-ui"><SelectItem value="all">All schools</SelectItem>{uploadSchools.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent>
        </Select>
        {hasFilters && <Button variant="ghost" className="h-10 gap-1 text-xs text-muted-foreground" onClick={clearFilters}><X className="size-3.5" aria-hidden="true" />Clear filters</Button>}
        <Select value={sort} onValueChange={(value) => setFilter("sort", value)}>
          <SelectTrigger aria-label="Sort posts" className="h-11 min-w-[160px] flex-1 min-[480px]:ml-auto min-[480px]:flex-none"><span className="flex items-center gap-2"><ArrowDownWideNarrow className="size-4 text-muted-foreground" aria-hidden="true" /><SelectValue /></span></SelectTrigger>
          <SelectContent className="video-management-ui"><SelectItem value="recent">Newest first</SelectItem><SelectItem value="oldest">Oldest first</SelectItem></SelectContent>
        </Select>
      </div>
    </div>
  )
}
