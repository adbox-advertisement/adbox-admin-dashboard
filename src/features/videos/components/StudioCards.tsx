import { Link } from "react-router-dom"
import { Archive, CalendarDays, Hash, MapPin, Pencil, Send, Sparkles, UsersRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "../lib/cn"
import { TIMING_LABELS, accountName, ago, day, formatCount, groupDates, groupTiming, hueOf } from "../lib/format"
import { accountPath, createPath, groupPath } from "../lib/paths"
import { placeLabel } from "../lib/places"
import type { StudioAccount, StudioGroup } from "../types"
import { AccountAvatar, Pill } from "./StudioBits"
import { focusRing, ink, muted, panel } from "./tokens"

/** An account admins post from: who it is in the app, who made it, how it is doing. */
export function AccountCard({ account, canPost, canManage, onEdit }: { account: StudioAccount; canPost: boolean; canManage: boolean; onEdit: () => void }) {
  const name = accountName(account)
  return <article aria-label={name} className={cn(panel, "video-lift flex min-w-0 flex-col overflow-hidden hover:shadow-adbox-medium")}>
    <div aria-hidden="true" className="studio-cover-fallback h-20" style={{ ["--studio-hue" as string]: hueOf(name) }} />
    <div className="flex flex-1 flex-col px-5 pb-5">
      <div className="-mt-9 flex items-end justify-between gap-3">
        <AccountAvatar account={account} size="lg" className="ring-4" />
        {account.archivedAt ? <Pill icon={Archive}>Archived</Pill> : null}
      </div>
      <Link to={accountPath(account.id)} className={cn("mt-3 w-fit max-w-full truncate rounded font-heading text-b1 font-semibold hover:text-purple dark:hover:text-royal-300", ink, focusRing)}>{name}</Link>
      <p className={cn("truncate text-b3", muted)}>{account.username ? `@${account.username}` : "No username"}{account.institution ? ` · ${account.institution.shortName}` : ""}</p>
      {account.bio && <p className={cn("mt-2 line-clamp-2 text-b3 leading-5", muted)}>{account.bio}</p>}
      <dl className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-grey-50 p-3 text-center dark:bg-background/60">
        {[["Posts", formatCount(account.counts.posts)], ["Followers", formatCount(account.counts.followers)], ["Last post", ago(account.lastPostedAt) ?? "Never"]].map(([label, value]) => <div key={label} className="min-w-0">
          <dt className={cn("text-[11px]", muted)}>{label}</dt>
          <dd className={cn("truncate text-b3 font-semibold tabular-nums", ink)}>{value}</dd>
        </div>)}
      </dl>
      <p className={cn("mt-3 text-[11px]", muted)}>Made by {account.createdBy?.name ?? "a former admin"} · {day(account.createdAt)}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {canPost && !account.archivedAt && <Button asChild className="h-9 flex-1 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] text-white hover:opacity-90">
          <Link to={createPath({ account: account.id })} aria-label={`Post as ${name}`}><Send className="size-4" aria-hidden="true" />Post as</Link>
        </Button>}
        {canManage && <Button type="button" variant="outline" className="h-9 cursor-pointer rounded-full" onClick={onEdit} aria-label={`Edit ${name}`}>
          <Pencil className="size-4" aria-hidden="true" />Edit
        </Button>}
      </div>
    </div>
  </article>
}

/** The cover a group shows: its picture, or its hashtag on its own colour. */
export function GroupCover({ group, className, size = "md" }: { group: Pick<StudioGroup, "hashtag" | "coverUrl" | "startsAt" | "endsAt">; className?: string; size?: "md" | "lg" }) {
  const timing = groupTiming(group)
  return <div className={cn("relative overflow-hidden", className)} style={{ ["--studio-hue" as string]: hueOf(group.hashtag) }}>
    {group.coverUrl ? <img src={group.coverUrl} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" /> : <div className="studio-cover-fallback absolute inset-0" />}
    <div className="absolute inset-0 bg-gradient-to-t from-grey-1000/80 via-grey-1000/20 to-transparent" />
    <div className="absolute inset-x-0 bottom-0 p-4">
      <p className={cn("break-words font-heading font-bold leading-tight text-white drop-shadow", size === "lg" ? "text-h4 md:text-[2.75rem] md:leading-[3rem]" : "text-h5")}>#{group.hashtag}</p>
    </div>
    {timing !== "OPEN" && <span className={cn("absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur",
      timing === "LIVE" ? "bg-success-500/90 text-white" : timing === "UPCOMING" ? "bg-white/85 text-grey-1000" : "bg-grey-1000/60 text-white")}>
      {timing === "LIVE" && <span className="studio-pulse size-1.5 rounded-full bg-white" aria-hidden="true" />}{TIMING_LABELS[timing]}
    </span>}
  </div>
}

/** A group: its cover and hashtag, where and when, and how many posts carry it. */
export function GroupCard({ group, canPost, canManage, onEdit }: { group: StudioGroup; canPost: boolean; canManage: boolean; onEdit: () => void }) {
  const place = placeLabel(group)
  const dates = groupDates(group)
  return <article aria-label={group.name} className={cn(panel, "video-lift flex min-w-0 flex-col overflow-hidden hover:shadow-adbox-medium")}>
    <Link to={groupPath(group.id)} className={cn("block", focusRing)} aria-label={`Open ${group.name}`}>
      <GroupCover group={group} className="aspect-[16/9]" />
    </Link>
    <div className="flex flex-1 flex-col gap-2 p-5">
      <div className="flex items-start justify-between gap-3">
        <Link to={groupPath(group.id)} className={cn("min-w-0 truncate rounded font-heading text-b1 font-semibold hover:text-purple dark:hover:text-royal-300", ink, focusRing)}>{group.name}</Link>
        {group.archivedAt && <Pill icon={Archive}>Archived</Pill>}
      </div>
      {place && <p className={cn("flex items-center gap-1.5 text-b3", muted)}><MapPin className="size-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{place}</span></p>}
      {dates && <p className={cn("flex items-center gap-1.5 text-b3", muted)}><CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />{dates}</p>}
      <p className={cn("mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-b3", ink)}>
        <span className="inline-flex items-center gap-1"><Hash className="size-3.5 text-purple dark:text-royal-300" aria-hidden="true" /><strong className="tabular-nums">{formatCount(group.counts.posts)}</strong> posts</span>
        <span className="inline-flex items-center gap-1"><Sparkles className="size-3.5 text-purple dark:text-royal-300" aria-hidden="true" /><strong className="tabular-nums">{formatCount(group.counts.studioPosts)}</strong> from the studio</span>
        <span className={cn("inline-flex items-center gap-1", muted)}><UsersRound className="size-3.5" aria-hidden="true" />{formatCount(Math.max(0, group.counts.posts - group.counts.studioPosts))} from people</span>
      </p>
      <div className="mt-auto flex flex-wrap gap-2 pt-3">
        {canPost && !group.archivedAt && <Button asChild className="h-9 flex-1 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] text-white hover:opacity-90">
          <Link to={createPath({ group: group.id })} aria-label={`Post in ${group.name}`}><Send className="size-4" aria-hidden="true" />Post in group</Link>
        </Button>}
        {canManage && <Button type="button" variant="outline" className="h-9 cursor-pointer rounded-full" onClick={onEdit} aria-label={`Edit ${group.name}`}>
          <Pencil className="size-4" aria-hidden="true" />Edit
        </Button>}
      </div>
    </div>
  </article>
}
