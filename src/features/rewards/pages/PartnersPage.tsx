import { Link } from "react-router-dom"
import { CalendarClock, ChevronRight, PackageX } from "lucide-react"
import { cn } from "@/lib/utils"
import { APP_ROUTES } from "@/routes/paths"
import { useNow, usePartners } from "../hooks"
import { agreementSoon, deliveryLabels, errorText, ghs } from "../lib/rewards"
import { Failed, PageIntro, PartnerMark, PartnerStatus, SampleBanner, card } from "../components/RewardsBits"

/** The companies behind the rewards: what each offers, what went out this month and what AdBox owes them. */
export function PartnersPage() {
  const now = useNow()
  const partners = usePartners()

  return <div className="flex min-w-0 flex-col gap-4 px-4 pb-10 sm:px-6">
    <SampleBanner />
    <PageIntro>AdBox buys each reward from the partner at its face value less an agreed discount, and settles every month for what was delivered. Telcos top up phone numbers directly; Melcom sends voucher codes in batches.</PageIntro>

    {partners.isError ? <div className={card}><Failed message={errorText(partners.error, "Couldn't load the partners.")} onRetry={() => void partners.refetch()} /></div>
      : <ul aria-label="Partners" className="grid gap-4 md:grid-cols-2">
        {partners.data ? partners.data.map((partner) => {
          const live = partner.offers.filter((offer) => offer.active).length
          const ending = agreementSoon(partner.agreementEnds, now)
          return <li key={partner.id}>
            <Link to={`${APP_ROUTES.rewardPartners}/${partner.id}`} aria-label={`${partner.name}, ${partner.status}`}
              className={cn(card, "group flex h-full flex-col gap-4 p-5 outline-none transition hover:shadow-adbox-medium focus-visible:ring-2 focus-visible:ring-purple")}>
              <div className="flex items-start gap-3">
                <PartnerMark partner={partner} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2"><span className="font-heading text-base font-semibold">{partner.name}</span><PartnerStatus status={partner.status} /></p>
                  <p className="text-xs text-muted-foreground">{deliveryLabels[partner.delivery]} · {partner.discountPercent}% discount</p>
                </div>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </div>
              <dl className="grid grid-cols-3 gap-3 rounded-xl bg-grey-50 p-3 dark:bg-background">
                <Stat label="On offer" value={`${live} of ${partner.offers.length}`} />
                <Stat label="Delivered · 30 days" value={partner.redeemed30d} />
                <Stat label="Owed this month" value={ghs(partner.monthPayableGhs)} />
              </dl>
              {(partner.lowStock > 0 || ending) && <div className="flex flex-col gap-1.5 text-xs">
                {partner.lowStock > 0 && <p className="flex items-center gap-1.5 font-semibold text-warning-800 dark:text-warning-300"><PackageX className="size-4" aria-hidden="true" />{partner.lowStock} {partner.lowStock === 1 ? "voucher is" : "vouchers are"} low on codes</p>}
                {ending && <p className="flex items-center gap-1.5 font-semibold text-warning-800 dark:text-warning-300"><CalendarClock className="size-4" aria-hidden="true" />Agreement ends {ending}</p>}
              </div>}
            </Link>
          </li>
        }) : [0, 1, 2, 3].map((item) => <li key={item} className={cn(card, "h-52 animate-pulse")} />)}
      </ul>}
  </div>
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div className="min-w-0">
    <dt className="truncate text-[11px] text-muted-foreground">{label}</dt>
    <dd className="truncate font-semibold tabular-nums">{value}</dd>
  </div>
}
