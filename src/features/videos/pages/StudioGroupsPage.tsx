import { useState } from "react"
import { Hash, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GroupDialog } from "../components/GroupDialog"
import { InstitutionPicker } from "../components/InstitutionPicker"
import { EmptyState, LoadError, SectionHeading, SkeletonGrid } from "../components/StudioBits"
import { GroupCard } from "../components/StudioCards"
import { muted } from "../components/tokens"
import { useInstitutionDirectory, useStudioAccess, useStudioGroups } from "../hooks"
import { cn } from "../lib/cn"
import { formatCount } from "../lib/format"
import type { StudioGroup } from "../types"

const PAGE_SIZE = 24

/** Groups such as hall weeks: each has its own hashtag, and every post carrying it belongs. */
export function StudioGroupsPage() {
  const access = useStudioAccess()
  const directory = useInstitutionDirectory(access.institutions)
  const [search, setSearch] = useState("")
  const [institutionId, setInstitutionId] = useState<string | null>(null)
  const [state, setState] = useState<"active" | "archived">("active")
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<StudioGroup | "new" | null>(null)
  const groups = useStudioGroups({ search: search.trim() || undefined, institutionId: institutionId ?? undefined, state, page, limit: PAGE_SIZE }, access.read)
  const total = groups.data?.total ?? 0
  const filtered = Boolean(search.trim() || institutionId || state === "archived")

  return <div className="flex flex-col gap-6">
    <SectionHeading title="Groups" description="Posts in a group carry its hashtag, so the app shows them together and anyone's post with it joins in."
      action={access.manageGroups && <Button type="button" onClick={() => setEditing("new")} className="h-11 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] px-5 text-white hover:opacity-90">
        <Plus className="size-4" aria-hidden="true" />New group
      </Button>} />

    <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
      <label className="relative md:col-span-5">
        <span className="sr-only">Search groups</span>
        <Search className={cn("pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2", muted)} aria-hidden="true" />
        <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search by name or #hashtag" className="h-11 rounded-2xl pl-10" />
      </label>
      {access.institutions && <InstitutionPicker directory={directory.data} value={institutionId} label="Institution" noneLabel="Any institution" className="md:col-span-4"
        onChange={(id) => { setInstitutionId(id); setPage(1) }} />}
      <Select value={state} onValueChange={(value) => { if (value === "active" || value === "archived") { setState(value); setPage(1) } }}>
        <SelectTrigger aria-label="Which groups" className="h-11 rounded-2xl md:col-span-3"><SelectValue /></SelectTrigger>
        <SelectContent className="video-management-ui">
          <SelectItem value="active">Active groups</SelectItem>
          <SelectItem value="archived">Archived groups</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {groups.data && <p role="status" className={cn("text-b3", muted)}>{formatCount(total)} {total === 1 ? "group" : "groups"}</p>}
    {groups.isPending ? <SkeletonGrid label="Loading groups" />
      : groups.isError ? <LoadError message="Couldn't load the groups." onRetry={() => void groups.refetch()} />
      : groups.data.items.length === 0 ? <EmptyState icon={Hash} title={filtered ? "No groups match" : "No groups yet"}
        action={!filtered && access.manageGroups ? <Button type="button" onClick={() => setEditing("new")} className="h-11 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] px-5 text-white hover:opacity-90"><Plus className="size-4" aria-hidden="true" />Make the first group</Button> : undefined}>
        {filtered ? "Try another name, institution or list." : "Make one for Legon Hall Week, Pent Hall Week, a launch or a season."}
      </EmptyState>
      : <ul aria-label="Groups" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {groups.data.items.map((group) => <li key={group.id}>
          <GroupCard group={group} canPost={access.post} canManage={access.manageGroups} onEdit={() => setEditing(group)} />
        </li>)}
      </ul>}

    {total > PAGE_SIZE && <Pagination page={page} limit={PAGE_SIZE} total={total} noun="groups" onPageChange={setPage} />}
    <GroupDialog open={editing !== null} onOpenChange={(open) => { if (!open) setEditing(null) }} group={editing === "new" || editing === null ? undefined : editing} />
  </div>
}
