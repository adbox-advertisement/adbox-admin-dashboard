import { useEffect, useId, useState, type ReactNode } from "react"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import { ClipboardCheck, Coins, Megaphone, Pencil, Plus, Sparkles, Store, Users, X, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { EmptyState, ErrorState, NoAccess, RowsSkeleton, ink, muted, pill, surface } from "../components/Surface"
import { financeErrorMessage, formatRelative } from "../lib/errors"
import { useFinanceAccess, useGoldBundles, useGoldSettings, useSaveGoldBundle, useSaveSpotlightPlan, useSpotlightPlans, useUpdateGoldSettings } from "../hooks"
import { adExample, bars, bundleBaseBars, bundleTotalBars, changedSettings, repricedBundles, settingsProblems, type AdAudience, type SettingsProblems } from "../lib/gold-settings"
import {
  FINANCE_PERMISSIONS,
  goldBundleInputSchema,
  settingsProblemsSchema,
  spotlightPlanInputSchema,
  type GoldBundle,
  type GoldSettings,
  type GoldSettingsKey,
  type GoldSettingsValues,
  type SpotlightPlan,
} from "../types"

const audienceLabels: Record<AdAudience, string> = { ALL: "Everyone", STUDENTS: "Students", ALUMNI: "Alumni" }

/** Financials › Gold & pricing: every number that gold touches, set by AdBox. */
export function GoldPricingPage() {
  const access = useFinanceAccess()
  const canRead = access.can(FINANCE_PERMISSIONS.read)
  const canManage = access.can(FINANCE_PERMISSIONS.manage)
  const canSpotlight = access.can(FINANCE_PERMISSIONS.spotlight)
  const settings = useGoldSettings(canRead)

  if (access.loading) return <div className="px-4 sm:px-6"><RowsSkeleton label="Loading" /></div>
  if (!canRead && !canSpotlight) return <NoAccess permission={FINANCE_PERMISSIONS.read} what="gold and pricing" />

  return <div className="flex min-w-0 flex-col gap-4 px-4 pb-24 sm:px-6">
    <section aria-label="About gold and pricing" className={cn(surface, "flex gap-3 p-5")}>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-warning-500/10 text-warning-700 dark:text-warning-300"><Coins className="size-5" aria-hidden="true" /></span>
      <div className="min-w-0">
        <h2 className={cn("font-heading text-b1 font-semibold", ink)}>Gold & pricing</h2>
        <p className={cn("text-b3", muted)}>
          What gold costs and what it buys: the store, ads, survey rewards and Spotlight. A change reaches the app within about 15 seconds.
          Running ads and paid surveys keep the terms they were made on.
        </p>
        {settings.data?.updatedBy && <p className={cn("mt-1 text-b4", muted)}>
          Last changed by {settings.data.updatedBy.name ?? settings.data.updatedBy.email} {formatRelative(settings.data.updatedAt)}.
        </p>}
        {canRead && !canManage && <p className={cn("mt-1 text-b4", muted)}>You can view these; changing them needs {FINANCE_PERMISSIONS.manage}.</p>}
      </div>
    </section>

    {canRead && <>
      {settings.isPending && <div className={surface}><RowsSkeleton label="Loading settings" /></div>}
      {settings.isError && <div className={surface}><ErrorState message={financeErrorMessage(settings.error, "Could not load the gold settings.")} onRetry={() => void settings.refetch()} /></div>}
      {settings.data && <SettingsForm settings={settings.data} editable={canManage} />}
      <BundlesSection editable={canManage} />
    </>}
    {canSpotlight && <SpotlightSection />}
  </div>
}

// ── The numbers ──────────────────────────────────────────────────────────

function SettingsForm({ settings, editable }: { settings: GoldSettings; editable: boolean }) {
  const saved = settings.values
  const [draft, setDraft] = useState<GoldSettingsValues>(saved)
  const [serverProblems, setServerProblems] = useState<SettingsProblems>({})
  const update = useUpdateGoldSettings()
  const bundles = useGoldBundles(true)
  // A save (here or elsewhere) becomes the new starting point.
  useEffect(() => { setDraft(saved) }, [saved])

  const problems = { ...settingsProblems(draft), ...serverProblems }
  const changes = changedSettings(saved, draft)
  const changed = Object.keys(changes).length
  const invalid = Object.keys(settingsProblems(draft)).length > 0

  const set = <K extends GoldSettingsKey>(key: K, value: GoldSettingsValues[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
    setServerProblems((current) => { const next = { ...current }; delete next[key]; return next })
  }

  const field = (key: Exclude<GoldSettingsKey, "adDurationsDays">, label: string, hint?: string) =>
    <NumberField label={label} value={draft[key]} fallback={settings.defaults[key]} hint={hint} error={problems[key]} disabled={!editable || update.isPending}
      changed={key in changes} onChange={(value) => set(key, value)} />

  const save = () => update.mutate(changes, {
    onSuccess: () => toast.success("Gold settings saved", { description: "The app has them within about 15 seconds." }),
    onError: (error) => {
      const parsed = isAxiosError(error) ? settingsProblemsSchema.safeParse(error.response?.data) : null
      if (parsed?.success) setServerProblems(Object.fromEntries(parsed.data.problems.map((p) => [p.field, p.message])))
      toast.error(financeErrorMessage(error, "Could not save the gold settings."))
    },
  })

  const surveyFormats = `${bars(draft.surveyRewardMinBudget)}–${bars(draft.surveyThreeFormatsFrom - 1)} bars: one question format; ` +
    `${bars(draft.surveyThreeFormatsFrom)}–${bars(draft.surveyAnyFormatsFrom - 1)}: three; ${bars(draft.surveyAnyFormatsFrom)} or more: any.`

  return <>
    <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
      <Card icon={Coins} tone="warning" title="Gold" description="The exchange rate — what a cedi buys in the store — and the once-a-day reward.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {field("barsPerCedi", "Bars per cedi", Number.isInteger(draft.barsPerCedi) && draft.barsPerCedi > 0
            ? `GHS 1 = ${bars(draft.barsPerCedi)} bars. GHS 9.99 buys ${bars(bundleBaseBars(999, draft.barsPerCedi))} before bonuses; an exact top-up of 1,000 bars costs GHS ${(Math.ceil((1000 * 100) / draft.barsPerCedi) / 100).toFixed(2)}.`
            : undefined)}
          {field("dailyRewardBars", "Daily reward", "Bars for opening the app each day. 0 turns it off.")}
        </div>
        {"barsPerCedi" in changes && !problems.barsPerCedi && bundles.data && <RepricePreview bundles={bundles.data} barsPerCedi={draft.barsPerCedi} />}
      </Card>

      <Card icon={ClipboardCheck} tone="success" title="Survey rewards" description="What a creator may pay people who answer every question. The creator types any whole number in the range.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {field("surveyRewardMinPerResponse", "Least per response", "Bars per finished response.")}
          {field("surveyRewardMaxPerResponse", "Most per response")}
          {field("surveyRewardMinBudget", "Least in total", "Taken from the creator's wallet on publishing.")}
          {field("surveyRewardMaxBudget", "Most in total")}
          {field("surveyThreeFormatsFrom", "Three formats from", "The total that lets a survey mix 3 question formats.")}
          {field("surveyAnyFormatsFrom", "Any formats from")}
        </div>
        <p className={cn("mt-3 text-b4", muted)} data-testid="survey-summary">
          Creators pay {draft.surveyRewardMinPerResponse === draft.surveyRewardMaxPerResponse ? bars(draft.surveyRewardMinPerResponse) : `${bars(draft.surveyRewardMinPerResponse)}–${bars(draft.surveyRewardMaxPerResponse)}`} bars a response. {surveyFormats}
        </p>
      </Card>
    </div>

    <Card icon={Megaphone} tone="purple" title="Ads" description="Ads are paid in gold bars only. The daily budget × days is held when an ad starts; views are charged at the price per 1,000, and what is not used comes back when it ends.">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-2">
          {field("adDailyBudgetMinBars", "Least a day (bars)")}
          {field("adDailyBudgetMaxBars", "Most a day (bars)")}
          <div className="sm:col-span-2">
            <DurationsField days={draft.adDurationsDays} error={problems.adDurationsDays} disabled={!editable || update.isPending}
              changed={"adDurationsDays" in changes} onChange={(days) => set("adDurationsDays", days)} />
          </div>
          {field("adCpmBars", "Bars per 1,000 views", Number.isInteger(draft.adCpmBars) && draft.adCpmBars > 0 && draft.barsPerCedi > 0
            ? `A view is charged once it has been half on screen for a second. ${bars(draft.adCpmBars)} bars is GHS ${(draft.adCpmBars / draft.barsPerCedi).toFixed(2)} at the exchange rate.`
            : "A view is charged once it has been half on screen for a second.")}
          {field("adMinAudience", "Fewest people an ad may target", "So an ad can never single anyone out. 0 turns it off.")}
          {field("adFrequencyCapPerDay", "Times a person sees one ad a day")}
        </div>
        <AudiencePanel values={draft} sizes={settings.audienceSizes} />
      </div>
    </Card>

    {editable && changed > 0 && <div role="region" aria-label="Unsaved changes" className={cn(surface, "sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 px-5 py-3 shadow-adbox-large")}>
      <p className={cn("text-b3 font-semibold", ink)}>{changed} {changed === 1 ? "change" : "changes"} not saved</p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="h-10 cursor-pointer rounded-full px-4" disabled={update.isPending} onClick={() => { setDraft(saved); setServerProblems({}) }}>Discard</Button>
        <Button type="button" className="h-10 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] px-5 text-white hover:opacity-90" disabled={invalid || update.isPending} onClick={save}>
          {update.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>}
  </>
}

function RepricePreview({ bundles, barsPerCedi }: { bundles: GoldBundle[]; barsPerCedi: number }) {
  const moved = repricedBundles(bundles, barsPerCedi)
  if (moved.length === 0) return null
  return <div data-testid="reprice-preview" className="mt-4 rounded-2xl bg-warning-500/10 p-4">
    <p className={cn("text-b3 font-semibold", ink)}>Saving reprices the store at GHS 1 = {bars(barsPerCedi)} bars</p>
    <ul className={cn("mt-1 text-b3", ink)}>
      {moved.map((bundle) => <li key={bundle.id} className="tabular-nums">
        {bundle.name} (GHS {(bundle.pricePesewas / 100).toFixed(2)}): {bars(bundle.totalBars)} → <strong>{bars(bundle.after)} bars</strong>
      </li>)}
    </ul>
    <p className={cn("mt-1 text-b4", muted)}>Purchases already started keep their bars; running ads keep their cost.</p>
  </div>
}

function AudiencePanel({ values, sizes }: { values: GoldSettingsValues; sizes: GoldSettings["audienceSizes"] }) {
  const [audience, setAudience] = useState<AdAudience>("ALL")
  const days = values.adDurationsDays.includes(7) ? 7 : ([...values.adDurationsDays].sort((a, b) => a - b)[0] ?? 7)
  const daily = Math.min(Math.max(1500, values.adDailyBudgetMinBars), values.adDailyBudgetMaxBars)
  const example = adExample(values, sizes, audience, daily, days)
  return <aside aria-label="Audiences and an example" className="flex flex-col gap-3 rounded-2xl bg-grey-50 p-4 dark:bg-muted/40">
    <p className={cn("flex items-center gap-2 text-b3 font-semibold", ink)}><Users className="size-4" aria-hidden="true" />People each audience holds now</p>
    <div role="radiogroup" aria-label="Audience" className="grid grid-cols-[repeat(auto-fit,minmax(5.5rem,1fr))] gap-2">
      {(Object.keys(audienceLabels) as AdAudience[]).map((key) =>
        <button key={key} type="button" role="radio" aria-checked={audience === key} onClick={() => setAudience(key)}
          className={cn("cursor-pointer rounded-xl border px-2 py-2 text-left transition-colors", audience === key ? "border-purple bg-purple/10" : "border-grey-200 bg-white dark:border-border dark:bg-card")}>
          <span className={cn("block text-b4", muted)}>{audienceLabels[key]}</span>
          <span className={cn("block text-b1 font-semibold tabular-nums", ink)}>{bars(sizes[key])}</span>
        </button>)}
    </div>
    {example.tooSmall
      ? <p className={"text-b3 font-semibold text-destructive"} data-testid="ad-example">
          Fewer than {bars(values.adMinAudience)} people: no ad may target {audience === "ALL" ? "everyone" : audienceLabels[audience].toLowerCase()} yet.
        </p>
      : <p className={cn("text-b3", ink)} data-testid="ad-example">
          {bars(daily)} bars a day for {days} days holds <strong>{bars(example.held)} bars</strong> (GHS {example.cedis.toFixed(2)}), buys{" "}
          <strong>{bars(example.views)} views</strong> and is estimated to reach{" "}
          <strong>{example.low === example.high ? bars(example.high) : `${bars(example.low)}–${bars(example.high)}`} people</strong>
          {example.capped && <> — {audience === "ALL" ? "everyone on AdBox" : `all ${audienceLabels[audience].toLowerCase()}`}. The app says spending more won't reach more people</>}.
        </p>}
    <p className={cn("text-b4", muted)}>About {bars(example.viewsPerDay)} views a day, at most {values.adFrequencyCapPerDay} to one person. Counts active people, not pages or businesses; the app's figure may be up to 5 minutes old.</p>
  </aside>
}

function DurationsField({ days, error, disabled, changed, onChange }: { days: number[]; error?: string; disabled: boolean; changed: boolean; onChange: (days: number[]) => void }) {
  const id = useId()
  const [adding, setAdding] = useState("")
  const add = () => {
    const value = Number(adding)
    if (!Number.isInteger(value) || value < 1) return
    onChange([...days.filter((day) => day !== value), value].sort((a, b) => a - b))
    setAdding("")
  }
  return <div>
    <label htmlFor={id} className={cn("mb-1.5 flex items-center gap-2 text-b3 font-semibold", ink)}>Lengths on offer (days){changed && <ChangedMark />}</label>
    <div className="flex flex-wrap items-center gap-2">
      <ul aria-label="Lengths on offer" className="flex flex-wrap gap-2">
        {days.map((day) => <li key={day} className={cn(pill, "bg-grey-100 text-grey-800 dark:bg-muted dark:text-foreground")}>
          {day} {day === 1 ? "day" : "days"}
          {!disabled && <button type="button" aria-label={`Remove ${day} days`} onClick={() => onChange(days.filter((d) => d !== day))} className="-mr-1 cursor-pointer rounded-full p-0.5 hover:bg-grey-200 dark:hover:bg-border"><X className="size-3" aria-hidden="true" /></button>}
        </li>)}
      </ul>
      {!disabled && <div className="flex items-center gap-1.5">
        <Input id={id} inputMode="numeric" placeholder="Days" value={adding} aria-label="Add a length in days" className="h-9 w-20 rounded-lg"
          onChange={(event) => setAdding(event.target.value.replace(/\D/g, "").slice(0, 3))}
          onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add() } }} />
        <Button type="button" variant="outline" size="sm" className="h-9 cursor-pointer rounded-full" onClick={add} disabled={!adding}>Add</Button>
      </div>}
    </div>
    {error && <p role="alert" className="mt-1 text-b4 text-destructive">{error}</p>}
  </div>
}

function NumberField({ label, value, fallback, hint, error, disabled, changed, onChange }: {
  label: string; value: number; fallback: number; hint?: string; error?: string; disabled: boolean; changed: boolean; onChange: (value: number) => void
}) {
  const id = useId()
  const [text, setText] = useState(String(value))
  // Follows a value set from outside (a discard or a save); an emptied field stays empty.
  useEffect(() => {
    if (!(text === "" && Number.isNaN(value)) && Number(text) !== value) setText(String(value))
  }, [text, value])
  return <div>
    <label htmlFor={id} className={cn("mb-1.5 flex items-center gap-2 text-b3 font-semibold", ink)}>{label}{changed && <ChangedMark />}</label>
    <Input id={id} inputMode="numeric" value={text} disabled={disabled} aria-invalid={Boolean(error)} aria-describedby={`${id}-hint`} className="h-10 rounded-lg tabular-nums"
      onChange={(event) => {
        const digits = event.target.value.replace(/\D/g, "").slice(0, 9)
        setText(digits)
        onChange(digits === "" ? Number.NaN : Number(digits))
      }} />
    <p id={`${id}-hint`} className={cn("mt-1 text-b4", error ? "text-destructive" : muted)} role={error ? "alert" : undefined}>
      {error ?? [hint, value !== fallback ? `Default ${bars(fallback)}.` : null].filter(Boolean).join(" ")}
    </p>
  </div>
}

const ChangedMark = () => <span className={cn(pill, "bg-purple/10 px-2 py-0.5 text-purple")}>Changed</span>

const tones = {
  warning: "bg-warning-500/10 text-warning-700 dark:text-warning-300",
  success: "bg-success-500/10 text-success-700 dark:text-success-300",
  purple: "bg-purple/10 text-purple",
  blue: "bg-blue/10 text-blue dark:text-cyan",
} as const

function Card({ icon: Icon, tone, title, description, action, children }: { icon: LucideIcon; tone: keyof typeof tones; title: string; description: string; action?: ReactNode; children: ReactNode }) {
  return <section aria-label={title} className={cn(surface, "min-w-0 p-5")}>
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 gap-3">
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tones[tone])}><Icon className="size-5" aria-hidden="true" /></span>
        <div className="min-w-0">
          <h3 className={cn("font-heading text-b1 font-semibold", ink)}>{title}</h3>
          <p className={cn("text-b3", muted)}>{description}</p>
        </div>
      </div>
      {action}
    </div>
    {children}
  </section>
}

// ── The gold store ───────────────────────────────────────────────────────

type Editing<T> = { create: true } | { create: false; item: T } | null

function BundlesSection({ editable }: { editable: boolean }) {
  const bundles = useGoldBundles(true)
  // The saved exchange rate: what a bundle's price buys.
  const rate = useGoldSettings(true).data?.values.barsPerCedi
  const [editing, setEditing] = useState<Editing<GoldBundle>>(null)
  return <Card icon={Store} tone="blue" title="Gold store" description="The bundles people buy with Paystack. Each is a price and a bonus: its bars are the price at the exchange rate, plus the bonus. A change applies to purchases started after it."
    action={editable && rate !== undefined && <Button type="button" className="h-10 cursor-pointer rounded-full px-4" variant="outline" onClick={() => setEditing({ create: true })}><Plus className="size-4" aria-hidden="true" />Add bundle</Button>}>
    {bundles.isPending && <RowsSkeleton label="Loading bundles" />}
    {bundles.isError && <ErrorState message={financeErrorMessage(bundles.error, "Could not load the bundles.")} onRetry={() => void bundles.refetch()} />}
    {bundles.data?.length === 0 && <EmptyState icon={Store} title="No bundles">Nothing is on sale. Add one to open the store.</EmptyState>}
    {bundles.data && bundles.data.length > 0 && <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className={cn("text-xs", muted)}><tr>
          <th className="py-2 pr-3 font-semibold">Bundle</th><th className="px-3 font-semibold">Price</th><th className="px-3 font-semibold">Bars</th>
          <th className="px-3 font-semibold">Per cedi, with bonus</th><th className="px-3 font-semibold">Sold</th><th className="px-3 font-semibold">Status</th><th className="pl-3" />
        </tr></thead>
        <tbody className="divide-y divide-grey-100 dark:divide-border">
          {bundles.data.map((bundle) => <tr key={bundle.id}>
            <td className="py-3 pr-3"><span className={cn("font-semibold", ink)}>{bundle.name}</span>{bundle.badge && <span className={cn(pill, "ml-2 bg-warning-500/10 text-warning-700 dark:text-warning-300")}>{bundle.badge}</span>}<span className={cn("block text-xs", muted)}>{bundle.id}</span></td>
            <td className="px-3 tabular-nums">GHS {bundle.priceGhs.toFixed(2)}</td>
            <td className="px-3 tabular-nums"><span className={ink}>{bars(bundle.totalBars)}</span>{bundle.bonusBars > 0 && <span className={cn("block text-xs", muted)}>{bars(bundle.baseBars)} + {bundle.bonusPercent}%</span>}</td>
            <td className="px-3 tabular-nums">{(bundle.totalBars / bundle.priceGhs).toFixed(1)}</td>
            <td className="px-3 tabular-nums">{bars(bundle.paidPurchases)}</td>
            <td className="px-3"><span className={cn(pill, bundle.active ? "bg-success-500/10 text-success-700 dark:text-success-300" : "bg-grey-100 text-grey-600 dark:bg-muted dark:text-muted-foreground")}>{bundle.active ? "On sale" : "Off sale"}</span></td>
            <td className="pl-3 text-right">{editable && rate !== undefined && <Button type="button" size="sm" variant="ghost" className="cursor-pointer rounded-full" aria-label={`Edit ${bundle.name}`} onClick={() => setEditing({ create: false, item: bundle })}><Pencil className="size-4" aria-hidden="true" /></Button>}</td>
          </tr>)}
        </tbody>
      </table>
    </div>}
    {editing && rate !== undefined && <BundleDialog editing={editing} rate={rate} nextOrder={bundles.data?.length ?? 0} onClose={() => setEditing(null)} />}
  </Card>
}

function BundleDialog({ editing, rate, nextOrder, onClose }: { editing: Exclude<Editing<GoldBundle>, null>; rate: number; nextOrder: number; onClose: () => void }) {
  const save = useSaveGoldBundle()
  const start = editing.create ? null : editing.item
  const [form, setForm] = useState({
    id: start?.id ?? "", name: start?.name ?? "", price: start ? start.priceGhs.toFixed(2) : "",
    bonusPercent: String(start?.bonusPercent ?? 0), badge: start?.badge ?? "", sortOrder: String(start?.sortOrder ?? nextOrder), active: start?.active ?? true,
  })
  const input = {
    id: form.id, name: form.name, pricePesewas: Math.round(Number(form.price) * 100),
    bonusPercent: Number(form.bonusPercent), badge: form.badge.trim() || null, sortOrder: Number(form.sortOrder), active: form.active,
  }
  const parsed = goldBundleInputSchema.safeParse(input)
  const errors = parsed.success ? {} : Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]))
  const base = bundleBaseBars(input.pricePesewas, rate)
  const total = bundleTotalBars(base, input.bonusPercent)
  const submit = () => {
    if (!parsed.success) return
    save.mutate({ id: parsed.data.id, input: parsed.data, create: editing.create }, {
      onSuccess: () => { toast.success(editing.create ? `${parsed.data.name} added to the store` : `${parsed.data.name} saved`); onClose() },
      onError: (error) => toast.error(financeErrorMessage(error, "Could not save the bundle.")),
    })
  }
  const set = (key: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [key]: value }))
  return <Dialog open onOpenChange={(open) => { if (!open && !save.isPending) onClose() }}>
    <DialogContent className="max-w-lg rounded-3xl">
      <div>
        <DialogTitle>{editing.create ? "Add a bundle" : `Edit ${start?.name}`}</DialogTitle>
        <DialogDescription className="mt-1">Purchases already started keep their price and bars.</DialogDescription>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField label="Name" value={form.name} onChange={set("name")} error={form.name ? errors.name : undefined} />
        {editing.create && <TextField label="Id (sent by the app)" value={form.id} onChange={(value) => set("id")(value.toLowerCase())} error={form.id ? errors.id : undefined} />}
        <TextField label="Price (GHS)" inputMode="decimal" value={form.price} onChange={(value) => set("price")(value.replace(/[^\d.]/g, ""))} error={form.price ? errors.pricePesewas : undefined} />
        <TextField label="Bonus (%)" inputMode="numeric" value={form.bonusPercent} onChange={(value) => set("bonusPercent")(value.replace(/\D/g, ""))} error={errors.bonusPercent} />
        <TextField label="Label (optional)" value={form.badge} onChange={set("badge")} placeholder="BEST VALUE" error={errors.badge} />
        <TextField label="Order" inputMode="numeric" value={form.sortOrder} onChange={(value) => set("sortOrder")(value.replace(/\D/g, ""))} error={errors.sortOrder} />
        <OnSale checked={form.active} onChange={(active) => setForm((current) => ({ ...current, active }))} />
      </div>
      {parsed.success && <p className={cn("text-b3", ink)} data-testid="bundle-total">
        At GHS 1 = {bars(rate)} bars, GHS {(input.pricePesewas / 100).toFixed(2)} is {bars(base)} bars
        {input.bonusPercent > 0 ? <>; with the {input.bonusPercent}% bonus, buyers get <strong>{bars(total)} bars</strong></> : <>: buyers get <strong>{bars(total)} bars</strong></>}.
      </p>}
      <DialogActions pending={save.isPending} disabled={!parsed.success} label={editing.create ? "Add bundle" : "Save bundle"} onSubmit={submit} />
    </DialogContent>
  </Dialog>
}

// ── Spotlight ────────────────────────────────────────────────────────────

function SpotlightSection() {
  const plans = useSpotlightPlans(true)
  const [editing, setEditing] = useState<Editing<SpotlightPlan>>(null)
  return <Card icon={Sparkles} tone="warning" title="Spotlight" description="Plans people buy with gold for a gold ring and twice the reach. More time stacks on a running one. A price change applies to purchases after it."
    action={<Button type="button" className="h-10 cursor-pointer rounded-full px-4" variant="outline" onClick={() => setEditing({ create: true })}><Plus className="size-4" aria-hidden="true" />Add plan</Button>}>
    {plans.isPending && <RowsSkeleton label="Loading plans" />}
    {plans.isError && <ErrorState message={financeErrorMessage(plans.error, "Could not load the Spotlight plans.")} onRetry={() => void plans.refetch()} />}
    {plans.data?.length === 0 && <EmptyState icon={Sparkles} title="No plans">Spotlight is not on sale. Add a plan to offer it.</EmptyState>}
    {plans.data && plans.data.length > 0 && <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {plans.data.map((plan) => <li key={plan.id} className="flex items-start justify-between gap-3 rounded-2xl border border-grey-200 p-4 dark:border-border">
        <div className="min-w-0">
          <p className={cn("font-semibold", ink)}>{plan.name}{plan.badge && <span className={cn(pill, "ml-2 bg-warning-500/10 text-warning-700 dark:text-warning-300")}>{plan.badge}</span>}</p>
          <p className={cn("text-b3 tabular-nums", ink)}>{bars(plan.priceBars)} bars · {plan.days} {plan.days === 1 ? "day" : "days"}</p>
          <p className={cn("text-b4", muted)}>{plan.active ? "On sale" : "Off sale"} · {bars(plan._count?.purchases ?? 0)} bought · {(plan.priceBars / plan.days).toFixed(0)} bars a day</p>
        </div>
        <Button type="button" size="sm" variant="ghost" className="cursor-pointer rounded-full" aria-label={`Edit ${plan.name}`} onClick={() => setEditing({ create: false, item: plan })}><Pencil className="size-4" aria-hidden="true" /></Button>
      </li>)}
    </ul>}
    {editing && <PlanDialog editing={editing} nextOrder={plans.data?.length ?? 0} onClose={() => setEditing(null)} />}
  </Card>
}

function PlanDialog({ editing, nextOrder, onClose }: { editing: Exclude<Editing<SpotlightPlan>, null>; nextOrder: number; onClose: () => void }) {
  const save = useSaveSpotlightPlan()
  const start = editing.create ? null : editing.item
  const [form, setForm] = useState({
    id: start?.id ?? "", name: start?.name ?? "", days: String(start?.days ?? ""), priceBars: String(start?.priceBars ?? ""),
    badge: start?.badge ?? "", sortOrder: String(start?.sortOrder ?? nextOrder), active: start?.active ?? true,
  })
  const parsed = spotlightPlanInputSchema.safeParse({
    id: form.id, name: form.name, days: Number(form.days), priceBars: Number(form.priceBars),
    badge: form.badge.trim() || null, sortOrder: Number(form.sortOrder), active: form.active,
  })
  const errors = parsed.success ? {} : Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]))
  const submit = () => {
    if (!parsed.success) return
    save.mutate({ id: parsed.data.id, input: parsed.data, create: editing.create }, {
      onSuccess: () => { toast.success(editing.create ? `${parsed.data.name} added` : `${parsed.data.name} saved`); onClose() },
      onError: (error) => toast.error(financeErrorMessage(error, "Could not save the plan.")),
    })
  }
  const set = (key: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [key]: value }))
  return <Dialog open onOpenChange={(open) => { if (!open && !save.isPending) onClose() }}>
    <DialogContent className="max-w-lg rounded-3xl">
      <div>
        <DialogTitle>{editing.create ? "Add a Spotlight plan" : `Edit ${start?.name}`}</DialogTitle>
        <DialogDescription className="mt-1">Past purchases keep the price they were bought at.</DialogDescription>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField label="Name" value={form.name} onChange={set("name")} placeholder="1 week" error={form.name ? errors.name : undefined} />
        {editing.create && <TextField label="Id (sent by the app)" value={form.id} onChange={(value) => set("id")(value.toLowerCase())} error={form.id ? errors.id : undefined} />}
        <TextField label="Days" inputMode="numeric" value={form.days} onChange={(value) => set("days")(value.replace(/\D/g, ""))} error={form.days ? errors.days : undefined} />
        <TextField label="Price (bars)" inputMode="numeric" value={form.priceBars} onChange={(value) => set("priceBars")(value.replace(/\D/g, ""))} error={form.priceBars ? errors.priceBars : undefined} />
        <TextField label="Label (optional)" value={form.badge} onChange={set("badge")} placeholder="Popular" error={errors.badge} />
        <TextField label="Order" inputMode="numeric" value={form.sortOrder} onChange={(value) => set("sortOrder")(value.replace(/\D/g, ""))} error={errors.sortOrder} />
        <OnSale checked={form.active} onChange={(active) => setForm((current) => ({ ...current, active }))} />
      </div>
      <DialogActions pending={save.isPending} disabled={!parsed.success} label={editing.create ? "Add plan" : "Save plan"} onSubmit={submit} />
    </DialogContent>
  </Dialog>
}

// ── Shared form pieces ───────────────────────────────────────────────────

function TextField({ label, value, onChange, error, placeholder, inputMode }: {
  label: string; value: string; onChange: (value: string) => void; error?: string; placeholder?: string; inputMode?: "numeric" | "decimal"
}) {
  const id = useId()
  return <div>
    <label htmlFor={id} className={cn("mb-1.5 block text-b3 font-semibold", ink)}>{label}</label>
    <Input id={id} value={value} placeholder={placeholder} inputMode={inputMode} aria-invalid={Boolean(error)} className="h-10 rounded-lg" onChange={(event) => onChange(event.target.value)} />
    {error && <p role="alert" className="mt-1 text-b4 text-destructive">{error}</p>}
  </div>
}

function OnSale({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  const id = useId()
  return <div className="flex items-center gap-2 self-end pb-2">
    <Checkbox id={id} checked={checked} onCheckedChange={(value) => onChange(value === true)} />
    <label htmlFor={id} className={cn("cursor-pointer text-b3", ink)}>On sale</label>
  </div>
}

function DialogActions({ pending, disabled, label, onSubmit }: { pending: boolean; disabled: boolean; label: string; onSubmit: () => void }) {
  return <div className="flex justify-end gap-2">
    <DialogClose asChild><Button type="button" variant="outline" className="h-10 cursor-pointer rounded-full px-4" disabled={pending}>Cancel</Button></DialogClose>
    <Button type="button" className="h-10 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] px-5 text-white hover:opacity-90" disabled={disabled || pending} onClick={onSubmit}>
      {pending ? "Saving…" : label}
    </Button>
  </div>
}

