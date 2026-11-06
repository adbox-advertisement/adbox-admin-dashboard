import { useId, useState, type ReactNode } from "react"
import { toast } from "sonner"
import { CalendarClock, Check, ExternalLink, Flag, MapPin, Pause, Play, ShieldCheck, Square, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useAd, useAdAction, useAdsAccess } from "../hooks"
import { ADS_PERMISSIONS, adReasonLabels, adTypeLabels, type AdAction, type AdDetail, type AdSummary } from "../types"
import { adCover, adTitle, adsErrorMessage, advertiserKind, advertiserName, audienceLabel, bars, formatDate, formatRelative, isPlaceholderEmail } from "../lib/format"
import { AdStatusPill, ErrorState, Fact, Pill, ink, muted } from "./AdsBits"

/** Reasons an ad is refused or stopped, as AdBox's ad rules name them. */
const quickReasons = [
  "Betting is not allowed in ads.",
  "Alcohol is not allowed in ads.",
  "Loans and \"quick money\" offers are not allowed in ads.",
  "Forex and crypto schemes are not allowed in ads.",
  "Paid essays and exam help are not allowed in ads.",
  "The ad is misleading: what it promises is not what it offers.",
  "The link does not lead where the ad says.",
]

type ReasonAsk = { kind: "reject" | "stop" | "uphold" }

/**
 * One ad in full, from `GET /ads/:id`: what it shows, who runs it, who it is
 * aimed at, its gold, its delivery, its review and its reports — and what this
 * admin may do with it at its stage. [summary] draws it while the detail loads.
 */
export function AdDetailSheet({ summary, onDone }: { summary: AdSummary; onDone: () => void }) {
  const detail = useAd(summary.id)
  const ad: AdSummary & Partial<AdDetail> = detail.data ?? summary
  const access = useAdsAccess()
  const action = useAdAction()
  const [asking, setAsking] = useState<ReasonAsk | null>(null)
  const canReview = access.can(ADS_PERMISSIONS.review)
  const canManage = access.can(ADS_PERMISSIONS.manage)
  const cover = adCover(ad)
  const content = ad.content

  // Awaited rather than per-call callbacks: the refetch that follows can take
  // the ad out of its list and close this sheet before those would run.
  const run = async (next: AdAction, done: string) => {
    try {
      await action.mutateAsync({ id: ad.id, action: next })
    } catch (error) {
      toast.error(adsErrorMessage(error, "That did not go through. Please try again."))
      return
    }
    toast.success(done)
    setAsking(null)
    onDone()
  }

  const actions = [
    ad.status === "PENDING_REVIEW" && canReview && <Button key="approve" type="button" className="h-10 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] px-5 text-white hover:opacity-90" disabled={action.isPending}
      onClick={() => void run({ kind: "approve" }, `Approved: it starts now and runs ${ad.durationDays} days. The advertiser is told within a minute.`)}>
      <Check className="size-4" aria-hidden="true" />Approve
    </Button>,
    ad.status === "PENDING_REVIEW" && canReview && <Button key="reject" type="button" variant="outline" className="h-10 cursor-pointer rounded-full px-4 text-destructive" disabled={action.isPending} onClick={() => setAsking({ kind: "reject" })}>
      <X className="size-4" aria-hidden="true" />Refuse
    </Button>,
    ad.status === "ACTIVE" && canManage && <Button key="pause" type="button" variant="outline" className="h-10 cursor-pointer rounded-full px-4" disabled={action.isPending}
      onClick={() => void run({ kind: "pause" }, "Paused. Nothing is charged while it is paused.")}>
      <Pause className="size-4" aria-hidden="true" />Pause
    </Button>,
    ad.status === "PAUSED" && canManage && ad.openReports === 0 && <Button key="resume" type="button" variant="outline" className="h-10 cursor-pointer rounded-full px-4" disabled={action.isPending}
      onClick={() => void run({ kind: "resume" }, "Running again.")}>
      <Play className="size-4" aria-hidden="true" />Resume
    </Button>,
    ad.openReports > 0 && canManage && <Button key="dismiss" type="button" variant="outline" className="h-10 cursor-pointer rounded-full px-4" disabled={action.isPending}
      onClick={() => void run({ kind: "resolve", decision: "DISMISS" }, ad.status === "PAUSED" && ad.pauseReason === "REPORTS" ? "Reports dismissed. The ad runs again." : "Reports dismissed.")}>
      <ShieldCheck className="size-4" aria-hidden="true" />Dismiss reports
    </Button>,
    ad.openReports > 0 && canManage && <Button key="uphold" type="button" variant="outline" className="h-10 cursor-pointer rounded-full px-4 text-destructive" disabled={action.isPending} onClick={() => setAsking({ kind: "uphold" })}>
      <Flag className="size-4" aria-hidden="true" />Uphold reports
    </Button>,
    (ad.status === "ACTIVE" || ad.status === "PAUSED") && canManage && <Button key="stop" type="button" variant="outline" className="h-10 cursor-pointer rounded-full px-4 text-destructive" disabled={action.isPending} onClick={() => setAsking({ kind: "stop" })}>
      <Square className="size-4" aria-hidden="true" />Stop
    </Button>,
  ].filter(Boolean)

  return <SheetContent closeLabel="Close ad" className="flex w-[min(36rem,calc(100vw-1rem))] flex-col gap-0 p-0">
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="relative aspect-[16/7] bg-[image:var(--gradient-dark-blue)]">
        {cover && <img src={cover} alt="" className="size-full object-cover" />}
        <span className="absolute left-4 top-4 flex gap-1.5">
          <AdStatusPill status={ad.status} className="bg-white/95 dark:bg-card" />
          {ad.type && <Pill tone="purple" className="bg-white/95 dark:bg-card">{adTypeLabels[ad.type]}</Pill>}
        </span>
      </div>
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="min-w-0">
          <SheetTitle className={cn("font-heading text-h6 font-semibold", ink)}>{adTitle(ad)}</SheetTitle>
          <SheetDescription className={cn("mt-1 text-b3", muted)}>{ad.name} · created {formatRelative(ad.createdAt)}</SheetDescription>
        </div>

        {ad.status === "PAUSED" && <Notice tone="warning">{ad.pauseReason === "REPORTS" ? `Paused by ${ad.openReports} reports until a moderator decides. Nothing is charged meanwhile.` : "Paused by AdBox. Nothing is charged meanwhile."}</Notice>}
        {ad.rejectionReason && <Notice tone="danger">{ad.status === "REJECTED" ? "Not approved" : "Stopped by AdBox"}: {ad.rejectionReason}</Notice>}

        <Section title="What it shows">
          {content.body && <p className={cn("whitespace-pre-line text-b2", ink)}>{content.body}</p>}
          {ad.post && <p className={cn("text-b3", muted)}>Promotes the post “{ad.post.title || ad.post.description || `Untitled ${ad.post.mediaType.toLowerCase()} post`}”.</p>}
          {(content.eventStartsAt || content.eventLocation) && <p className={cn("flex items-center gap-1.5 text-b3", ink)}>
            <CalendarClock className="size-4" aria-hidden="true" />{formatDate(content.eventStartsAt ?? null, "EEE, MMM d 'at' h:mm a")}{content.eventLocation && ` · ${content.eventLocation}`}
          </p>}
          {(content.imageUrls?.length ?? 0) > 1 && <div className="flex gap-2 overflow-x-auto">
            {content.imageUrls!.map((url) => <img key={url} src={url} alt="" loading="lazy" className="size-20 shrink-0 rounded-xl object-cover" />)}
          </div>}
          <div className="flex flex-wrap gap-4">
            {content.destinationUrl && <Anchor href={content.destinationUrl}>{content.destinationUrl}</Anchor>}
            {content.videoUrl && <Anchor href={content.videoUrl}>Ad video</Anchor>}
          </div>
          {!content.body && !ad.post && !content.destinationUrl && !content.headline && <p className={cn("text-b3", muted)}>No words of its own.</p>}
        </Section>

        <Section title="Who runs it">
          <dl className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
            <Fact label="Account">{advertiserName(ad.advertiser)}{ad.advertiser.username && <span className={cn("font-normal", muted)}> · @{ad.advertiser.username}</span>}</Fact>
            <Fact label="Kind">{advertiserKind[ad.advertiser.kind]}{!ad.advertiser.isActive && <span className="text-destructive"> · switched off</span>}</Fact>
            <Fact label="On AdBox since">{formatDate(ad.advertiser.joinedAt)}</Fact>
            <Fact label="Email">{isPlaceholderEmail(ad.advertiser.email) ? "None: nobody signs in to it by email" : `${ad.advertiser.email} · ${ad.advertiser.emailVerified ? "verified" : "not verified"}`}</Fact>
          </dl>
        </Section>

        <Section title="Who sees it">
          <p className={cn("flex items-start gap-1.5 text-b3", ink)}>
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {audienceLabel(ad.audience)} · {ad.places && (ad.places.institutions.length + ad.places.campuses.length) > 0
              ? [...ad.places.institutions.map((place) => place.name), ...ad.places.campuses.map((place) => place.name)].join(", ")
              : ad.institutionIds.length + ad.campusIds.length > 0 ? `${ad.institutionIds.length + ad.campusIds.length} chosen places` : "every school"}
          </p>
        </Section>

        <Section title="Gold">
          <dl className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3">
            <Fact label="Budget">{bars(ad.dailyBudgetBars)} × {ad.durationDays} days</Fact>
            <Fact label="Held at start">{bars(ad.budgetBars)} bars</Fact>
            <Fact label="Price">{bars(ad.cpmBars)} per 1,000 views</Fact>
            <Fact label="Charged">{bars(ad.chargedBars)} bars</Fact>
            <Fact label={ad.settledAt ? "Returned" : "Still held"}>{bars(ad.settledAt ? ad.returnedBars : ad.heldBars)} bars</Fact>
            <Fact label="Views it buys">{bars(ad.maxViews)}</Fact>
          </dl>
        </Section>

        <Section title="Delivery">
          <dl className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-4">
            <Fact label="Views">{bars(ad.stats.views)}</Fact>
            <Fact label="People">{bars(ad.stats.reach)}</Fact>
            <Fact label="Clicks">{bars(ad.stats.clicks)}</Fact>
            <Fact label="Engaged">{bars(ad.stats.engagements)}</Fact>
          </dl>
          {ad.daily && ad.daily.length > 0 && <DailyViews daily={ad.daily} />}
        </Section>

        <Section title="Review">
          <ul className={cn("flex flex-col gap-1 text-b3", ink)}>
            <li>{ad.autoApproved ? "Started without review: a boost from an account in good standing." : ad.reviewedAt ? `Reviewed ${formatRelative(ad.reviewedAt)}${ad.reviewer ? ` by ${ad.reviewer.name ?? ad.reviewer.email}` : ""}.` : ad.status === "PENDING_REVIEW" ? `Waiting ${formatRelative(ad.createdAt)?.replace(" ago", "")}.` : "Not reviewed."}</li>
            {ad.startsAt && <li>Runs {formatDate(ad.startsAt, "MMM d, h:mm a")} – {formatDate(ad.endsAt, "MMM d, yyyy")}.</li>}
            {ad.cancelledAt && <li>Stopped {formatDate(ad.cancelledAt, "MMM d, yyyy 'at' h:mm a")}.</li>}
            {ad.settledAt && <li>Settled {formatRelative(ad.settledAt)}: {bars(ad.chargedBars)} charged, {bars(ad.returnedBars)} returned.</li>}
          </ul>
        </Section>

        {ad.reports && ad.reports.length > 0 && <Section title={`Reports (${ad.reports.length})`}>
          <ul className="flex flex-col gap-2">
            {ad.reports.map((report) => <li key={report.id} className="rounded-2xl bg-grey-50 px-3 py-2.5 dark:bg-background">
              <p className={cn("flex flex-wrap items-center gap-2 text-b3 font-semibold", ink)}>
                {report.reason ? adReasonLabels[report.reason] : "Reported"}
                <Pill tone={report.status === "OPEN" ? "warning" : report.status === "UPHELD" ? "danger" : "neutral"}>{report.status === "OPEN" ? "Open" : report.status === "UPHELD" ? "Upheld" : "Dismissed"}</Pill>
              </p>
              {report.details && <p className={cn("mt-1 text-b3", ink)}>“{report.details}”</p>}
              <p className={cn("mt-1 text-b4", muted)}>{report.reporter.name ?? (report.reporter.username ? `@${report.reporter.username}` : "Someone")} · {formatRelative(report.createdAt)}</p>
            </li>)}
          </ul>
        </Section>}

        {detail.isError && <ErrorState message={adsErrorMessage(detail.error, "Could not load this ad in full.")} onRetry={() => void detail.refetch()} />}
      </div>
    </div>

    {actions.length > 0 && <div role="group" aria-label="Decide" className="flex flex-wrap gap-2 border-t border-grey-200 bg-white p-4 dark:border-border dark:bg-card sm:px-6">{actions}</div>}

    {asking && <ReasonDialog ask={asking} busy={action.isPending} ended={ad.status !== "ACTIVE" && ad.status !== "PAUSED" && ad.status !== "PENDING_REVIEW"} onClose={() => setAsking(null)}
      onConfirm={(reason, returnAll) => {
        if (asking.kind === "reject") void run({ kind: "reject", reason }, "Refused. Every held bar goes back within a minute, and the advertiser is told why.")
        else if (asking.kind === "stop") void run({ kind: "stop", reason, returnAll }, returnAll ? "Stopped. Every bar goes back within a minute." : "Stopped. Its views are charged and the rest goes back within a minute.")
        else void run({ kind: "resolve", decision: "UPHOLD", reason }, "Reports upheld: the ad is stopped, and the advertiser's boosts are reviewed for 30 days.")
      }} />}
  </SheetContent>
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="flex flex-col gap-2">
    <h3 className={cn("text-b4 font-semibold uppercase tracking-wide", muted)}>{title}</h3>
    {children}
  </section>
}

function Notice({ tone, children }: { tone: "warning" | "danger"; children: ReactNode }) {
  return <p className={cn("rounded-2xl px-4 py-3 text-b3 font-semibold", tone === "warning" ? "bg-warning-500/10 text-warning-700 dark:text-warning-300" : "bg-destructive/10 text-destructive")}>{children}</p>
}

function Anchor({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} target="_blank" rel="noreferrer noopener" className="inline-flex max-w-full items-center gap-1 truncate text-b3 font-semibold text-purple hover:underline">
    <span className="truncate">{children}</span><ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
  </a>
}

/** Views a day, as bars of the busiest day. */
function DailyViews({ daily }: { daily: AdDetail["daily"] }) {
  const most = Math.max(1, ...daily.map((day) => day.impressions))
  return <ol aria-label="Views by day" className="flex h-20 items-end gap-1">
    {daily.slice(-30).map((day) => <li key={day.date} className="flex h-full min-w-0 flex-1 flex-col justify-end" title={`${formatDate(day.date, "MMM d")}: ${bars(day.impressions)} views`}>
      <span className="block rounded-t bg-[image:var(--gradient-purple)]" style={{ height: `${Math.max(4, (day.impressions / most) * 100)}%` }} />
      <span className="sr-only">{formatDate(day.date, "MMM d")}: {bars(day.impressions)} views</span>
    </li>)}
  </ol>
}

const askCopy = {
  reject: { title: "Refuse this ad", description: "Nothing was charged. Every held bar goes back, and the advertiser reads your reason.", confirm: "Refuse ad" },
  stop: { title: "Stop this ad", description: "It stops now. Views it got are charged and the rest goes back — or everything, when the fault is AdBox's. The advertiser reads your reason.", confirm: "Stop ad" },
  uphold: { title: "Uphold the reports", description: "The ad is stopped (views it got are charged) and the reports count against the advertiser for 30 days, so their boosts are reviewed. They read your reason.", confirm: "Uphold and stop" },
} as const

function ReasonDialog({ ask, busy, ended, onClose, onConfirm }: { ask: ReasonAsk; busy: boolean; ended: boolean; onClose: () => void; onConfirm: (reason: string, returnAll: boolean) => void }) {
  const id = useId()
  const [reason, setReason] = useState("")
  const [returnAll, setReturnAll] = useState(false)
  const copy = askCopy[ask.kind]
  const trimmed = reason.trim()
  const valid = trimmed.length >= 5 && trimmed.length <= 300
  return <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose() }}>
    <DialogContent className="max-w-lg rounded-3xl">
      <div>
        <DialogTitle>{copy.title}</DialogTitle>
        <DialogDescription className="mt-1">{ask.kind === "uphold" && ended
          ? "It has already ended. The reports count against the advertiser for 30 days, so their boosts are reviewed. They read your reason."
          : copy.description}</DialogDescription>
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Common reasons">
        {quickReasons.map((text) => <button key={text} type="button" onClick={() => setReason(text)}
          className={cn("cursor-pointer rounded-full border px-3 py-1.5 text-left text-b4 font-semibold", reason === text ? "border-purple bg-purple/10 text-purple" : "border-grey-200 text-grey-600 hover:border-purple/40 dark:border-border dark:text-muted-foreground")}>
          {text}
        </button>)}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className={cn("text-b3 font-semibold", ink)}>Reason the advertiser reads</label>
        <Textarea id={id} value={reason} maxLength={300} rows={3} onChange={(event) => setReason(event.target.value)} />
        <p className={cn("text-b4", muted)}>{trimmed.length < 5 ? "At least 5 characters." : `${300 - trimmed.length} characters left.`}</p>
      </div>
      {ask.kind === "stop" && <label className={cn("flex cursor-pointer items-start gap-2 text-b3", ink)}>
        <Checkbox checked={returnAll} onCheckedChange={(checked) => setReturnAll(checked === true)} aria-label="Return every bar" className="mt-0.5" />
        <span>Return every bar, charged views too — the fault is AdBox's, not the advertiser's.</span>
      </label>}
      <div className="flex justify-end gap-2">
        <DialogClose asChild><Button type="button" variant="outline" className="h-10 cursor-pointer rounded-full px-4" disabled={busy}>Cancel</Button></DialogClose>
        <Button type="button" className="h-10 cursor-pointer rounded-full bg-destructive px-5 text-white hover:opacity-90" disabled={!valid || busy} onClick={() => onConfirm(trimmed, returnAll)}>
          {busy ? "Saving…" : copy.confirm}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
}
