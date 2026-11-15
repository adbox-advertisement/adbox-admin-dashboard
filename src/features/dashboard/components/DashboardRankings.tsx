import { Link } from "react-router-dom"
import { School } from "lucide-react"
import { cn } from "../lib/cn"
import { APP_ROUTES } from "@/routes/paths"
import { useAdStages, usePeopleStats, useTopCreators } from "../hooks"
import { AD_STAGES, creatorName, formatCount, largestInstitutions, memberMix, plural, postMix } from "../lib/figures"
import { Avatar, BarList, Card, LoadError, LoadingRows, MoreLink } from "./DashboardBits"
import { focusRing, hairline, ink, muted } from "./tokens"

const SHOWN = 5

/** The institutions with the most members, with how they split. */
export function DashboardLargestInstitutions({ className }: { className?: string }) {
  const stats = usePeopleStats(true)
  const institutions = stats.data ? largestInstitutions(stats.data, SHOWN) : []
  return <Card className={className} title="Largest institutions" description="By members on AdBox."
    action={<MoreLink to={APP_ROUTES.manageUsersInstitutions}>All</MoreLink>}>
    {stats.isError ? <LoadError message="Couldn't load the institutions." onRetry={() => void stats.refetch()} />
      : !stats.data ? <LoadingRows rows={SHOWN} label="Loading the institutions" />
      : institutions.length === 0 ? <p className={cn("text-b3 md:text-b2", muted)}>Nobody has joined an institution yet.</p>
      : <ol aria-label="Largest institutions" className="flex flex-col">
        {institutions.map((institution, index) => <li key={institution.id} className={cn("border-b last:border-0", hairline)}>
          <Link to={`${APP_ROUTES.manageUsersInstitutions}/${encodeURIComponent(institution.id)}`}
            className={cn("flex items-center gap-3 rounded-xl px-1 py-2.5 transition-colors hover:bg-grey-50 dark:hover:bg-background", focusRing)}>
            <span className={cn("w-4 shrink-0 text-right text-b3 font-semibold tabular-nums", muted)}>{index + 1}</span>
            {institution.logoUrl ? <Avatar name={institution.shortName} image={institution.logoUrl} square />
              : <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple/10 text-purple dark:bg-royal-500/15 dark:text-royal-300"><School className="size-5" /></span>}
            <span className="min-w-0 flex-1">
              <span className={cn("block truncate text-b3 font-semibold md:text-b2", ink)}>{institution.shortName}</span>
              <span className={cn("line-clamp-2 block text-b4 leading-4 md:text-b3 md:leading-4", muted)}>{memberMix(institution.members)}</span>
            </span>
            <span className="shrink-0 text-right">
              <span className={cn("block text-b2 font-semibold tabular-nums", ink)}>{formatCount(institution.members.total)}</span>
              <span className={cn("block text-b4", muted)}>{institution.members.total === 1 ? "member" : "members"}</span>
            </span>
          </Link>
        </li>)}
      </ol>}
  </Card>
}

/** Every ad by the stage it is in; each opens Ads Management at that stage. */
export function DashboardAdStages({ className }: { className?: string }) {
  const stages = useAdStages(true)
  const data = stages.data
  return <Card className={className} title="Ads by stage" description={data ? `${plural(data.total, "ad", "ads")} in all.` : "Every ad, by where it is."}
    action={<MoreLink to={APP_ROUTES.adsManagement}>Ads</MoreLink>}>
    {stages.isError ? <LoadError message="Couldn't load the ads." onRetry={() => void stages.refetch()} />
      : !data ? <LoadingRows rows={AD_STAGES.length} label="Loading the ads" />
      : <BarList label="Ads by stage" total={data.total}
        rows={AD_STAGES.map((stage) => ({ key: stage.status, label: stage.label, value: data.counts[stage.status] ?? 0, to: `${APP_ROUTES.adsManagement}?status=${stage.status}` }))} />}
  </Card>
}

/** The people with the most live posts; each opens their content. */
export function DashboardTopCreators({ className }: { className?: string }) {
  const creators = useTopCreators(true, SHOWN)
  return <Card className={className} title="Top creators" description="By live posts."
    action={<MoreLink to={APP_ROUTES.userContent}>Content</MoreLink>}>
    {creators.isError ? <LoadError message="Couldn't load the creators." onRetry={() => void creators.refetch()} />
      : !creators.data ? <LoadingRows rows={SHOWN} label="Loading the creators" />
      : creators.data.length === 0 ? <p className={cn("text-b3 md:text-b2", muted)}>Nobody has posted yet.</p>
      : <ol aria-label="Top creators" className="flex flex-col">
        {creators.data.map((creator, index) => {
          const name = creatorName(creator)
          const username = creator.user?.userProfile?.username
          const row = <>
            <span className={cn("w-4 shrink-0 text-right text-b3 font-semibold tabular-nums", muted)}>{index + 1}</span>
            <Avatar name={name} image={creator.user?.userProfile?.image ?? null} />
            <span className="min-w-0 flex-1">
              <span className={cn("block truncate text-b3 font-semibold md:text-b2", ink)}>{name}</span>
              <span className={cn("line-clamp-2 block text-b4 leading-4 md:text-b3 md:leading-4", muted)}>{username && !name.startsWith("@") ? `@${username} · ` : ""}{postMix(creator) || "No live posts"}</span>
            </span>
            <span className="shrink-0 text-right">
              <span className={cn("block text-b2 font-semibold tabular-nums", ink)}>{formatCount(creator.posts)}</span>
              <span className={cn("block text-b4", muted)}>{creator.posts === 1 ? "post" : "posts"}</span>
            </span>
          </>
          const rowClass = "flex items-center gap-3 rounded-xl px-1 py-2.5"
          return <li key={creator.user?.id ?? index} className={cn("border-b last:border-0", hairline)}>
            {creator.user
              ? <Link to={`${APP_ROUTES.userContent}?userId=${encodeURIComponent(creator.user.id)}`} className={cn(rowClass, "transition-colors hover:bg-grey-50 dark:hover:bg-background", focusRing)}>{row}</Link>
              : <div className={rowClass}>{row}</div>}
          </li>
        })}
      </ol>}
  </Card>
}
