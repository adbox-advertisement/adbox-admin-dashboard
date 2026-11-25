import { useState } from "react"
import { Search, UserPlus, UsersRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AccountDialog } from "../components/AccountDialog"
import { InstitutionPicker } from "../components/InstitutionPicker"
import { EmptyState, LoadError, SectionHeading, SkeletonGrid } from "../components/StudioBits"
import { AccountCard } from "../components/StudioCards"
import { muted } from "../components/tokens"
import { useInstitutionDirectory, useStudioAccess, useStudioAccounts } from "../hooks"
import { cn } from "../lib/cn"
import { formatCount } from "../lib/format"
import type { StudioAccount } from "../types"

const PAGE_SIZE = 24

/** Every account admins made to post from, with who made each and how it is doing. */
export function StudioAccountsPage() {
  const access = useStudioAccess()
  const directory = useInstitutionDirectory(access.institutions)
  const [search, setSearch] = useState("")
  const [institutionId, setInstitutionId] = useState<string | null>(null)
  const [state, setState] = useState<"active" | "archived">("active")
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<StudioAccount | "new" | null>(null)
  const accounts = useStudioAccounts({ search: search.trim() || undefined, institutionId: institutionId ?? undefined, state, page, limit: PAGE_SIZE }, access.read)
  const total = accounts.data?.total ?? 0
  const filtered = Boolean(search.trim() || institutionId || state === "archived")

  return <div className="flex flex-col gap-6">
    <SectionHeading title="Accounts" description={accounts.data ? `${formatCount(total)} ${state === "archived" ? "archived" : ""} account${total === 1 ? "" : "s"} admins post from. Regular profiles in the app; nobody signs in to them.` : "Regular profiles in the app that admins post from."}
      action={access.manageAccounts && <Button type="button" onClick={() => setEditing("new")} className="h-11 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] px-5 text-white hover:opacity-90">
        <UserPlus className="size-4" aria-hidden="true" />New account
      </Button>} />

    <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
      <label className="relative md:col-span-5">
        <span className="sr-only">Search accounts</span>
        <Search className={cn("pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2", muted)} aria-hidden="true" />
        <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search by name or @username" className="h-11 rounded-2xl pl-10" />
      </label>
      {access.institutions && <InstitutionPicker directory={directory.data} value={institutionId} label="Institution" noneLabel="Any institution" className="md:col-span-4"
        onChange={(id) => { setInstitutionId(id); setPage(1) }} />}
      <Select value={state} onValueChange={(value) => { if (value === "active" || value === "archived") { setState(value); setPage(1) } }}>
        <SelectTrigger aria-label="Which accounts" className="h-11 rounded-2xl md:col-span-3"><SelectValue /></SelectTrigger>
        <SelectContent className="video-management-ui">
          <SelectItem value="active">Active accounts</SelectItem>
          <SelectItem value="archived">Archived accounts</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {accounts.isPending ? <SkeletonGrid label="Loading accounts" />
      : accounts.isError ? <LoadError message="Couldn't load the accounts." onRetry={() => void accounts.refetch()} />
      : accounts.data.items.length === 0 ? <EmptyState icon={UsersRound} title={filtered ? "No accounts match" : "No accounts yet"}
        action={!filtered && access.manageAccounts ? <Button type="button" onClick={() => setEditing("new")} className="h-11 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] px-5 text-white hover:opacity-90"><UserPlus className="size-4" aria-hidden="true" />Make the first one</Button> : undefined}>
        {filtered ? "Try another name, institution or list." : "Make an account for a campus, a hall week or a show, then post from it."}
      </EmptyState>
      : <ul aria-label="Accounts" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {accounts.data.items.map((account) => <li key={account.id}>
          <AccountCard account={account} canPost={access.post} canManage={access.manageAccounts} onEdit={() => setEditing(account)} />
        </li>)}
      </ul>}

    {total > PAGE_SIZE && <Pagination page={page} limit={PAGE_SIZE} total={total} noun="accounts" onPageChange={setPage} />}
    <AccountDialog open={editing !== null} onOpenChange={(open) => { if (!open) setEditing(null) }} account={editing === "new" || editing === null ? undefined : editing} />
  </div>
}
