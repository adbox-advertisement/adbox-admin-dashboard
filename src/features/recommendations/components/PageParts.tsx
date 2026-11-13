import { useId, type ReactNode } from "react"
import { Info, TriangleAlert, type LucideIcon } from "lucide-react"
import { cn } from "../lib/cn"
import { IconTile } from "./Surface"
import { hairline, ink, muted, surface, tones, type Tone } from "./tokens"

/** The page's opening card: what it covers, and how the live settings stand. */
export function PageHero({ icon, title, children, aside }: { icon: LucideIcon; title: string; children: ReactNode; aside?: ReactNode }) {
  const id = useId()
  return <section aria-labelledby={id} className={cn(surface, "p-5 sm:p-6")}>
    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
      <div className="flex min-w-0 gap-4">
        <IconTile icon={icon} size="lg" />
        <div className="min-w-0">
          <h2 id={id} className={cn("font-heading text-h6 font-semibold sm:text-h5", ink)}>{title}</h2>
          <div className={cn("mt-2 max-w-3xl text-b2 leading-6", muted)}>{children}</div>
        </div>
      </div>
      {aside && <div className="flex shrink-0 flex-wrap gap-2 xl:max-w-sm xl:justify-end">{aside}</div>}
    </div>
  </section>
}

/** A titled card on the page. `id` makes it a link target from the page's contents. */
export function Section({ id, icon, tone = "purple", title, description, action, children, className }: {
  id?: string
  icon?: LucideIcon
  tone?: Tone
  title: string
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  const headingId = useId()
  return <section id={id} aria-labelledby={headingId} className={cn(surface, "min-w-0 scroll-mt-24 p-5 sm:p-6", className)}>
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 gap-3">
        {icon && <IconTile icon={icon} tone={tone} />}
        <div className="min-w-0">
          <h3 id={headingId} className={cn("font-heading text-b1 font-semibold", ink)}>{title}</h3>
          {description && <p className={cn("mt-0.5 max-w-3xl text-b3 leading-5 md:text-b2 md:leading-6", muted)}>{description}</p>}
        </div>
      </div>
      {action}
    </div>
    {children}
  </section>
}

/** A formula, set apart: terms in raised chips, operators quiet. */
export function Formula({ label, children, className }: { label?: string; children: ReactNode; className?: string }) {
  return <figure className={cn("min-w-0 rounded-2xl bg-grey-50 p-4 dark:bg-background/70", className)}>
    {label && <figcaption className={cn("mb-2 text-b4 font-semibold uppercase tracking-wide", muted)}>{label}</figcaption>}
    <div className={cn("flex flex-wrap items-center gap-x-1.5 gap-y-2 text-b2 font-semibold leading-7", ink)}>{children}</div>
  </figure>
}

export function Term({ children, hint }: { children: ReactNode; hint?: string }) {
  return <span title={hint} className="inline-block rounded-lg bg-white px-2 py-0.5 shadow-adbox-small dark:bg-card">{children}</span>
}

export function Op({ children }: { children: ReactNode }) {
  return <span aria-hidden="true" className="text-grey-400 dark:text-muted-foreground">{children}</span>
}

/** A note that matters to how the page reads: what the app uses today, a caveat. */
export function Callout({ tone = "purple", icon: Icon = tone === "warning" ? TriangleAlert : Info, title, children, className }: {
  tone?: Tone
  icon?: LucideIcon
  title: string
  children: ReactNode
  className?: string
}) {
  return <div role="note" className={cn("flex gap-3 rounded-2xl p-4", tones[tone], className)}>
    <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
    <div className="min-w-0">
      <p className="text-b2 font-semibold">{title}</p>
      <div className="mt-1 text-b3 leading-5 text-grey-700 dark:text-foreground/80 md:text-b2 md:leading-6">{children}</div>
    </div>
  </div>
}

/** A numbered flow, top to bottom, with a rail joining the steps. */
export function Steps({ steps, className }: { steps: Array<{ title: string; body: ReactNode }>; className?: string }) {
  return <ol className={cn("relative flex flex-col gap-5", className)}>
    {steps.map((step, index) => <li key={step.title} className="relative flex gap-4">
      {index < steps.length - 1 && <span aria-hidden="true" className="absolute left-[15px] top-9 h-[calc(100%-1rem)] w-px bg-grey-200 dark:bg-border" />}
      <span className="relative z-[1] flex size-8 shrink-0 items-center justify-center rounded-full bg-purple text-b3 font-semibold text-white">{index + 1}</span>
      <div className="min-w-0 pt-1">
        <p className={cn("text-b2 font-semibold", ink)}>{step.title}</p>
        <div className={cn("mt-1 text-b3 leading-5 md:text-b2 md:leading-6", muted)}>{step.body}</div>
      </div>
    </li>)}
  </ol>
}

/** Label and value rows, two columns from md. */
export function Facts({ items, className }: { items: Array<{ label: string; value: ReactNode }>; className?: string }) {
  return <dl className={cn("grid grid-cols-1 gap-x-6 md:grid-cols-2", className)}>
    {items.map((item, index) => <div key={`${index}-${item.label}`} className={cn("flex items-baseline justify-between gap-4 border-b py-2.5", hairline)}>
      <dt className={cn("text-b3 md:text-b2", muted)}>{item.label}</dt>
      <dd className={cn("text-right text-b3 font-semibold md:text-b2", ink)}>{item.value}</dd>
    </div>)}
  </dl>
}
