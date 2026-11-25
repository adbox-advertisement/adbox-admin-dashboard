import { useState, type ReactNode } from "react"
import { Check, Search, UserPlus, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "../../lib/cn"
import { accountName } from "../../lib/format"
import type { StudioAccount } from "../../types"
import { AccountAvatar } from "../StudioBits"
import { ink, muted, panel } from "../tokens"

/** One numbered step of the composer. */
export function Step({ number, id, title, description, children, aside }: { number: number; id: string; title: string; description?: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return <section aria-labelledby={id} className={cn(panel, "video-reveal p-5 sm:p-6")}>
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-purple)] font-heading text-b3 font-bold text-white shadow-adbox-small">{number}</span>
        <div className="min-w-0">
          <h2 id={id} className={cn("font-heading text-b1 font-semibold md:text-h6", ink)}>{title}</h2>
          {description && <p className={cn("mt-0.5 text-b3 leading-5", muted)}>{description}</p>}
        </div>
      </div>
      {aside}
    </div>
    {children}
  </section>
}

/** A card that is one choice of a radio group; arrow keys move between them. */
export function ChoiceCard<T extends string>({ name, value, checked, onChange, icon: Icon, title, description, badge }: {
  name: string
  value: T
  checked: boolean
  onChange: (value: T) => void
  icon: LucideIcon
  title: string
  description: string
  badge?: ReactNode
}) {
  return <label className={cn("relative flex min-w-0 flex-col gap-3 rounded-2xl border-2 p-4 transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-purple has-[:focus-visible]:ring-offset-2",
    checked ? "border-purple bg-purple/5 shadow-adbox-small dark:border-royal-300 dark:bg-royal-500/10" : "border-grey-200 hover:border-purple/40 dark:border-border")}>
    <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} className="sr-only" />
    <span className="flex items-center justify-between gap-2">
      <span className={cn("flex size-11 items-center justify-center rounded-2xl transition-colors", checked ? "bg-[image:var(--gradient-purple)] text-white" : "bg-grey-100 text-grey-700 dark:bg-muted dark:text-muted-foreground")}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      {checked ? <Check className="size-5 text-purple dark:text-royal-300" aria-hidden="true" /> : badge}
    </span>
    <span>
      <span className={cn("block font-heading text-b2 font-semibold", ink)}>{title}</span>
      <span className={cn("mt-0.5 block text-b4 leading-4 md:text-b3 md:leading-5", muted)}>{description}</span>
    </span>
  </label>
}

/** Which account the post comes from. Searchable once there are more than a handful. */
export function AccountChooser({ accounts, value, onChange, loading, onCreate }: {
  accounts: StudioAccount[]
  value: string | null
  onChange: (id: string) => void
  loading: boolean
  onCreate?: () => void
}) {
  const [search, setSearch] = useState("")
  const needle = search.trim().toLowerCase().replace(/^@/, "")
  const shown = needle ? accounts.filter((account) => `${account.fullName ?? ""} ${account.username ?? ""} ${account.institution?.shortName ?? ""}`.toLowerCase().includes(needle)) : accounts

  if (loading) return <div role="status" aria-label="Loading accounts" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
    {[0, 1].map((index) => <div key={index} className="h-[4.5rem] animate-pulse rounded-2xl bg-grey-50 dark:bg-muted/40" />)}
  </div>

  if (accounts.length === 0) return <div className="flex flex-col items-start gap-3 rounded-2xl bg-grey-50 p-5 dark:bg-background/60">
    <p className={cn("text-b3 leading-5", muted)}>There's no account to post from yet. Make one for a campus, a hall week or a show.</p>
    {onCreate && <Button type="button" onClick={onCreate} className="h-10 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] text-white hover:opacity-90"><UserPlus className="size-4" aria-hidden="true" />New account</Button>}
  </div>

  return <div className="flex flex-col gap-3">
    {accounts.length > 6 && <label className="relative">
      <span className="sr-only">Find an account</span>
      <Search className={cn("pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2", muted)} aria-hidden="true" />
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Find one of ${accounts.length} accounts`}
        className="h-11 w-full rounded-2xl border border-grey-200 bg-white pl-10 pr-3 text-b3 outline-none focus-visible:ring-2 focus-visible:ring-purple dark:border-border dark:bg-background md:text-b2" />
    </label>}
    <fieldset className="min-w-0">
      <legend className="sr-only">Post as</legend>
      <div className="grid max-h-[19rem] grid-cols-1 gap-3 overflow-y-auto p-0.5 sm:grid-cols-2">
        {shown.map((account) => {
          const checked = account.id === value
          return <label key={account.id} className={cn("flex min-w-0 items-center gap-3 rounded-2xl border-2 px-3.5 py-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-purple",
            checked ? "border-purple bg-purple/5 dark:border-royal-300 dark:bg-royal-500/10" : "border-grey-200 hover:border-purple/40 dark:border-border")}>
            <input type="radio" name="studio-account" value={account.id} checked={checked} onChange={() => onChange(account.id)} className="sr-only" />
            <AccountAvatar account={account} />
            <span className="min-w-0 flex-1">
              <span className={cn("block truncate text-b3 font-semibold md:text-b2", ink)}>{accountName(account)}</span>
              <span className={cn("block truncate text-[11px] md:text-b4", muted)}>{account.username ? `@${account.username}` : ""}{account.institution ? ` · ${account.institution.shortName}` : ""}</span>
            </span>
            {checked && <Check className="size-5 shrink-0 text-purple dark:text-royal-300" aria-hidden="true" />}
          </label>
        })}
        {shown.length === 0 && <p className={cn("px-1 py-3 text-b3 sm:col-span-2", muted)}>No account matches “{search}”.</p>}
      </div>
    </fieldset>
    {onCreate && <button type="button" onClick={onCreate} className="inline-flex w-fit items-center gap-1.5 rounded-full text-b3 font-semibold text-purple hover:underline dark:text-royal-300">
      <UserPlus className="size-4" aria-hidden="true" />Make another account
    </button>}
  </div>
}
