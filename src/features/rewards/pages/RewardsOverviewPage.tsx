import { Link, useNavigate } from "react-router-dom"
import { AlertTriangle, ArrowRight, Coins, Gift, Hourglass, PackageX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { APP_ROUTES } from "@/routes/paths"
import { storeRate, useNow, useRedemptions, useRewardsOverview } from "../hooks"
import { bars, errorText, ghs, since } from "../lib/rewards"
import { Empty, Failed, Figure, PageIntro, PartnerMark, RiskPill, SampleBanner, SectionHead, card } from "../components/RewardsBits"

const steps = [
  { title: "They ask", text: "Someone picks a reward in the app and spends gold. The gold is held, not spent yet." },
  { title: "Checks run", text: "Account age, phone number, monthly limit and stock are checked for you." },
  { title: "You decide", text: "Approve it, or reject it with a reason and the gold goes back." },
  { title: "The partner delivers", text: "A top-up lands on their phone; a voucher code appears in their app." },
]

const requestLink = (params: Record<string, string>) => `${APP_ROUTES.rewardRequests}?${new URLSearchParams(params)}`

/** Rewards at a glance: what's waiting, what went out this month, and what needs a hand. */
export function RewardsOverviewPage() {
  const now = useNow()
  const navigate = useNavigate()
  const overview = useRewardsOverview()
  const waiting = useRedemptions({ status: "pending" })
  const data = overview.data
  const attention = data ? data.failed + data.stockAlerts.length : undefined
  const busiest = Math.max(1, ...(data?.byPartner.map((item) => item.faceValueGhs) ?? []))

  return <div className="flex min-w-0 flex-col gap-4 px-4 pb-10 sm:px-6">
    <SampleBanner />
    <PageIntro action={<Button asChild className="h-10 rounded-full bg-[image:var(--gradient-purple)] px-4 text-white hover:opacity-90"><Link to={APP_ROUTES.rewardRequests}>Review requests<ArrowRight aria-hidden="true" /></Link></Button>}>
      MTN, Telecel, AT and Melcom give AdBox airtime, data bundles and shopping vouchers. People spend the gold bars they earn on them, and an admin approves each request before the partner delivers it.
    </PageIntro>

    <section aria-labelledby="how-rewards-work" className={cn(card, "p-5")}>
      <h2 id="how-rewards-work" className="mb-4 font-heading text-base font-semibold">How a redemption works</h2>
      <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => <li key={step.title} className="flex gap-3">
          <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-purple/10 text-xs font-semibold text-purple">{index + 1}</span>
          <div className="min-w-0"><p className="text-sm font-semibold">{step.title}</p><p className="text-xs leading-5 text-muted-foreground">{step.text}</p></div>
        </li>)}
      </ol>
    </section>

    {overview.isError && <div className={card}><Failed message={errorText(overview.error, "Couldn't load the rewards figures.")} onRetry={() => void overview.refetch()} /></div>}

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Figure icon={Hourglass} tone="warning" label="Waiting for approval" value={data?.pending}
        hint={data && (data.oldestPendingAt ? `Oldest has waited ${since(data.oldestPendingAt, now)}` : "Nothing waiting")} onClick={() => navigate(APP_ROUTES.rewardRequests)} />
      <Figure icon={Coins} label="Gold redeemed · 30 days" value={data && bars(data.barsRedeemed30d)} hint={data && `≈ ${ghs(Math.round(data.barsRedeemed30d / storeRate()))} at the store rate`} />
      <Figure icon={Gift} label="Rewards delivered · 30 days" value={data?.fulfilled30d} hint={data && `${ghs(data.faceValue30d)} in face value`} />
      <Figure icon={AlertTriangle} tone={attention ? "danger" : "blue"} label="Needs attention" value={attention}
        hint={data && `${data.failed} failed · ${data.stockAlerts.length} low on codes`} onClick={data?.failed ? () => navigate(requestLink({ status: "failed" })) : undefined} />
    </div>

    <div className="grid gap-4 lg:grid-cols-12">
      <section aria-labelledby="waiting-for-you" className={cn(card, "min-w-0 lg:col-span-7")}>
        <SectionHead id="waiting-for-you" title="Waiting for you">
          {data && data.pending > 0 && <Link to={APP_ROUTES.rewardRequests} className="text-b3 font-semibold text-purple outline-none hover:underline focus-visible:ring-2 focus-visible:ring-purple">See all {data.pending}</Link>}
        </SectionHead>
        {waiting.isError ? <Failed message={errorText(waiting.error, "Couldn't load the requests.")} onRetry={() => void waiting.refetch()} />
          : !waiting.data ? <div role="status" aria-label="Loading requests" className="flex flex-col gap-3 p-5">{[0, 1, 2].map((item) => <div key={item} className="h-12 animate-pulse rounded-xl bg-muted" />)}</div>
            : waiting.data.length === 0 ? <Empty title="Nothing waiting">Every request has been decided.</Empty>
              : <ul className="divide-y divide-grey-200 dark:divide-border">
                {waiting.data.slice(0, 6).map((item) => <li key={item.id}>
                  <Link to={requestLink({ open: item.id })} className="flex items-center gap-3 px-5 py-3 outline-none transition-colors hover:bg-grey-50 focus-visible:bg-grey-50 dark:hover:bg-muted/40 dark:focus-visible:bg-muted/40">
                    <PartnerMark partner={item.partner} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{item.offer.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{item.user.name} · {bars(item.bars)}</span>
                    </span>
                    <span className="hidden sm:block"><RiskPill risk={item.risk} /></span>
                    <span className="w-14 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{since(item.requestedAt, now)}</span>
                  </Link>
                </li>)}
              </ul>}
      </section>

      <div className="flex min-w-0 flex-col gap-4 lg:col-span-5">
        <section aria-labelledby="by-partner" className={card}>
          <SectionHead id="by-partner" title="Delivered by partner · 30 days" />
          <ul className="flex flex-col gap-4 p-5">
            {data ? data.byPartner.map((item) => <li key={item.partnerId}>
              <Link to={`${APP_ROUTES.rewardPartners}/${item.partnerId}`} className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-purple">
                <span className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium group-hover:underline">{item.name}</span>
                  <span className="shrink-0 tabular-nums">{ghs(item.faceValueGhs)} <span className="text-xs text-muted-foreground">· {item.count}</span></span>
                </span>
                <span aria-hidden="true" className="mt-1.5 block h-2 rounded-full bg-grey-100 dark:bg-muted">
                  <span className="block h-full rounded-full bg-blue dark:bg-cyan" style={{ width: `${Math.max(2, (item.faceValueGhs / busiest) * 100)}%` }} />
                </span>
              </Link>
            </li>) : [0, 1, 2, 3].map((item) => <li key={item} className="h-9 animate-pulse rounded-lg bg-muted" />)}
          </ul>
        </section>

        <section aria-labelledby="stock-alerts" className={card}>
          <SectionHead id="stock-alerts" title="Low on voucher codes" />
          {data && data.stockAlerts.length === 0 ? <p className="px-5 py-6 text-sm text-muted-foreground">Every voucher has enough codes.</p>
            : <ul className="divide-y divide-grey-200 dark:divide-border">
              {data?.stockAlerts.map((offer) => <li key={offer.id} className="flex items-center gap-3 px-5 py-3">
                <PackageX className={cn("size-5 shrink-0", offer.stock === 0 ? "text-destructive" : "text-warning-700 dark:text-warning-300")} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{offer.name}</span>
                  <span className={cn("block text-xs", offer.stock === 0 ? "text-destructive" : "text-muted-foreground")}>{offer.stock === 0 ? "Out of codes: requests can't be approved" : `${offer.stock} ${offer.stock === 1 ? "code" : "codes"} left`}</span>
                </span>
                <Button asChild variant="outline" className="h-9 rounded-full px-3.5"><Link to={`${APP_ROUTES.rewardPartners}/${offer.partnerId}`}>Add codes</Link></Button>
              </li>)}
            </ul>}
        </section>
      </div>
    </div>
  </div>
}
