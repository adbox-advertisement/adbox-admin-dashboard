import { useId, useMemo, useState, type KeyboardEvent } from "react"
import { Check, ChevronsUpDown, Landmark, Search, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "../lib/cn"
import { readRecentInstitutions, rememberInstitution, searchInstitutions } from "../lib/places"
import type { DirectoryInstitution, InstitutionDirectory } from "../types"
import { focusRing, ink, muted } from "./tokens"

type Props = {
  directory: InstitutionDirectory | undefined
  value: string | null
  onChange: (id: string | null) => void
  label: string
  placeholder?: string
  /** Offer "Any institution" (filters) or "No institution" (forms). */
  noneLabel?: string
  disabled?: boolean
  className?: string
}

/**
 * Any of the institutions (265 and growing), found by typing: short name, name or region. Recent
 * picks come first; arrows move, Enter picks, Escape closes.
 */
export function InstitutionPicker({ directory, value, onChange, label, placeholder = "Choose an institution", noneLabel, disabled, className }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  // This browser's recent picks, read again each time the list opens.
  const [recentIds, setRecentIds] = useState<string[]>(() => readRecentInstitutions())
  const listId = useId()
  const selected = directory?.find((institution) => institution.id === value) ?? null

  const options = useMemo(() => {
    if (!directory) return []
    if (query.trim()) return searchInstitutions(directory, query)
    const recent = recentIds
      .map((id) => directory.find((institution) => institution.id === id && institution.isActive))
      .filter((institution): institution is DirectoryInstitution => Boolean(institution))
    const rest = directory.filter((institution) => institution.isActive && !recent.includes(institution))
      .sort((a, b) => a.region.localeCompare(b.region) || a.shortName.localeCompare(b.shortName))
    return [...recent, ...rest]
  }, [directory, query, recentIds])

  const recentCount = query.trim() ? 0 : recentIds.filter((id) => options.some((option) => option.id === id)).length
  const rows: Array<DirectoryInstitution | null> = noneLabel ? [null, ...options] : options

  const choose = (institution: DirectoryInstitution | null) => {
    if (institution) rememberInstitution(institution.id)
    onChange(institution?.id ?? null)
    setOpen(false)
    setQuery("")
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") setActive((index) => Math.min(rows.length - 1, index + 1))
    else if (event.key === "ArrowUp") setActive((index) => Math.max(0, index - 1))
    else if (event.key === "Enter" && rows.length > 0) choose(rows[Math.min(active, rows.length - 1)])
    else return
    event.preventDefault()
  }

  return <Popover open={open} onOpenChange={(next) => {
    setOpen(next)
    if (next) {
      setActive(0)
      setRecentIds(readRecentInstitutions())
    }
  }}>
    <PopoverTrigger asChild disabled={disabled || !directory}>
      <button type="button" aria-label={selected ? `${label}: ${selected.shortName}` : label}
        className={cn("flex h-11 w-full min-w-0 items-center gap-2.5 rounded-2xl border border-grey-200 bg-white px-3.5 text-left text-b3 transition-colors hover:border-purple/40 disabled:opacity-60 dark:border-border dark:bg-background md:text-b2", focusRing, className)}>
        <Landmark className={cn("size-4 shrink-0", selected ? "text-purple dark:text-royal-300" : muted)} aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">
          {selected ? <><span className={cn("font-semibold", ink)}>{selected.shortName}</span><span className={cn("ml-1.5", muted)}>{selected.name}</span></>
            : <span className={muted}>{directory ? (noneLabel ?? placeholder) : "Loading institutions…"}</span>}
        </span>
        <ChevronsUpDown className={cn("size-4 shrink-0", muted)} aria-hidden="true" />
      </button>
    </PopoverTrigger>
    <PopoverContent align="start" className="video-management-ui w-[min(28rem,calc(100vw-2rem))] p-0">
      <div className="flex items-center gap-2 border-b border-grey-200 px-3 dark:border-border">
        <Search className={cn("size-4 shrink-0", muted)} aria-hidden="true" />
        <input autoFocus value={query} onChange={(event) => { setQuery(event.target.value); setActive(0) }} onKeyDown={onKeyDown}
          role="combobox" aria-expanded="true" aria-controls={listId} aria-autocomplete="list" aria-label={`Search ${label.toLowerCase()}`}
          aria-activedescendant={rows.length ? `${listId}-${Math.min(active, rows.length - 1)}` : undefined}
          placeholder={`Search ${directory?.filter((institution) => institution.isActive).length ?? ""} institutions, or a region`}
          className="h-11 min-w-0 flex-1 bg-transparent text-b2 outline-none placeholder:text-grey-400" />
        {query && <button type="button" aria-label="Clear the search" onClick={() => setQuery("")} className={cn("rounded-full p-1", muted, focusRing)}><X className="size-4" aria-hidden="true" /></button>}
      </div>
      <ul id={listId} role="listbox" aria-label={label} className="max-h-80 overflow-y-auto p-1.5">
        {rows.length === 0 && <li className={cn("px-3 py-6 text-center text-b3", muted)}>No institution matches “{query}”.</li>}
        {rows.map((institution, index) => {
          const isNone = institution === null
          const isSelected = isNone ? value === null : institution.id === value
          const offset = noneLabel ? 1 : 0
          const firstRest = !query.trim() && recentCount > 0 && index === recentCount + offset
          return <li key={institution?.id ?? "none"} role="presentation">
            {!query.trim() && index === offset && recentCount > 0 && <p className={cn("px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide", muted)}>Recent</p>}
            {firstRest && <p className={cn("px-2.5 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide", muted)}>All institutions</p>}
            <div id={`${listId}-${index}`} role="option" aria-selected={isSelected} onMouseEnter={() => setActive(index)} onClick={() => choose(institution)}
              className={cn("flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2", index === active && "bg-purple/5 dark:bg-royal-500/10")}>
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate text-b3 font-semibold md:text-b2", ink)}>{isNone ? noneLabel : institution.shortName}</span>
                {!isNone && <span className={cn("block truncate text-[11px] md:text-b4", muted)}>{institution.name} · {institution.region}</span>}
              </span>
              {isSelected && <Check className="size-4 shrink-0 text-purple dark:text-royal-300" aria-hidden="true" />}
            </div>
          </li>
        })}
      </ul>
    </PopoverContent>
  </Popover>
}
