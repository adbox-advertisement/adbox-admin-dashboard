import {
  ArrowRight,
  Building2,
  Clapperboard,
  Mail,
  MapPin,
  Phone,
  Sun,
} from "lucide-react"
import type { ReactNode } from "react"

import rdiMark from "@/assets/rdi-mark.svg"
import { RdiMediaDisplay } from "@/features/rdi/components/RdiMediaField"
import type {
  RdiContentBlock,
  RdiPageContent,
  RdiSiteSettings,
} from "@/features/rdi/types"
import { cn } from "@/lib/utils"

function EditableSection({
  block,
  children,
  onSelect,
  className,
}: {
  block: RdiContentBlock
  children: ReactNode
  onSelect?: (blockId: string) => void
  className?: string
}) {
  return (
    <section
      onClick={() => onSelect?.(block.id)}
      className={cn(
        "group/section relative cursor-pointer border-2 border-transparent transition-colors hover:border-[#d132fb]",
        className
      )}
      aria-label={`Edit ${block.name}`}
    >
      <span className="pointer-events-none absolute right-2 top-2 z-30 rounded bg-[#d132fb] px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-white opacity-0 transition-opacity group-hover/section:opacity-100">
        Edit {block.name}
      </span>
      {children}
    </section>
  )
}

function HighlightedHomeTitle({ title, siteName }: { title: string; siteName: string }) {
  const brandStart = title.toLocaleLowerCase().indexOf(siteName.toLocaleLowerCase())

  if (brandStart < 0) return <>{title}</>

  return (
    <>
      {title.slice(0, brandStart)}
      <span className="bg-[linear-gradient(90deg,#f97316_0%,#fbbf24_48%,#34d399_100%)] bg-clip-text text-transparent">
        {title.slice(brandStart, brandStart + siteName.length)}
      </span>
      {title.slice(brandStart + siteName.length)}
    </>
  )
}

function HomeHero({
  block,
  settings,
  onSelect,
}: {
  block: RdiContentBlock
  settings: RdiSiteSettings
  onSelect?: (blockId: string) => void
}) {
  return (
    <EditableSection block={block} onSelect={onSelect} className="bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_55%,#334155_100%)] text-center">
      <div className="relative overflow-hidden px-10 pb-14 pt-20 max-sm:px-6 max-sm:pb-10 max-sm:pt-16">
        <div className="pointer-events-none absolute -left-24 -top-28 size-80 rounded-full bg-[#f59e0b]/25 blur-[72px]" />
        <div className="pointer-events-none absolute -right-28 top-10 size-72 rounded-full bg-[#a855f7]/20 blur-[84px]" />
        <h1 className="relative z-10 mx-auto max-w-[980px] font-heading text-[58px] font-bold leading-[1.16] text-white max-lg:text-[48px] max-sm:text-[34px]">
          <HighlightedHomeTitle title={block.title} siteName={settings.siteName} />
        </h1>
        {block.eyebrow ? (
          <p className="relative z-10 mt-7 text-[17px] text-[#94a3b8] max-sm:text-[13px]">
            {block.eyebrow}
          </p>
        ) : null}
        {block.description ? (
          <p className="relative z-10 mt-3 text-[12px] text-[#64748b] max-sm:text-[10px]">
            {block.description}
          </p>
        ) : null}
      </div>
    </EditableSection>
  )
}

function DivisionCard({ item, index }: { item: NonNullable<RdiContentBlock["items"]>[number]; index: number }) {
  const variants = [
    { accent: "#f97316", secondary: "#f97316", Icon: Building2, buttonText: "#ffffff" },
    { accent: "#a82bbb", secondary: "#a82bbb", Icon: Clapperboard, buttonText: "#ffffff" },
    { accent: "#fbbf24", secondary: "#10b981", Icon: Sun, buttonText: "#0f172a" },
  ] as const
  const variant = variants[index] ?? variants[0]
  const Icon = variant.Icon
  const isSolar = index === 2

  return (
    <article className="relative flex min-h-[500px] overflow-hidden rounded-2xl border-2 border-[#334155] bg-[linear-gradient(135deg,#1e293b,#0f172a)] p-7 text-left max-sm:p-6">
      {item.media?.url ? (
        <div className="absolute inset-0">
          <RdiMediaDisplay media={item.media} className="h-full w-full" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(30,41,59,0.74),rgba(15,23,42,0.98))]" />
        </div>
      ) : null}

      <div className="relative z-10 flex w-full flex-col">
        <span
          className={cn(
            "flex size-12 items-center justify-center rounded-xl shadow-lg",
            isSolar ? "bg-[linear-gradient(135deg,rgba(251,191,36,0.28),rgba(16,185,129,0.24))]" : ""
          )}
          style={isSolar ? { color: variant.accent } : { backgroundColor: `${variant.accent}33`, color: variant.accent }}
        >
          <Icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
        </span>
        <h2 className="mt-5 font-heading text-[31px] font-bold leading-tight text-white max-sm:text-[27px]">
          {item.title}
        </h2>
        <span
          className="mt-3 h-1 w-16"
          style={{ background: `linear-gradient(90deg, ${variant.accent}, ${variant.secondary})` }}
        />
        <p className="mt-5 text-[12px] leading-[1.65] text-[#94a3b8] max-sm:text-[11px]">
          {item.description}
        </p>

        {item.features?.length ? (
          <ul className="mt-5 space-y-3">
            {item.features.map((feature, featureIndex) => (
              <li key={`${item.id}-feature-${featureIndex}`} className="flex items-start gap-2.5 text-[11px] font-medium text-[#cbd5e1] max-sm:text-[10px]">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ backgroundColor: variant.secondary }} />
                {feature}
              </li>
            ))}
          </ul>
        ) : null}

        {item.buttonLabel ? (
          <span
            className="mt-auto flex h-10 w-full items-center justify-center gap-3 rounded-lg px-4 pt-0.5 text-[11px] font-bold text-[#111d31]"
            style={{ backgroundColor: variant.accent, color: variant.buttonText }}
          >
            {item.buttonLabel}
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </span>
        ) : null}
      </div>
    </article>
  )
}

function HomeDivisions({
  block,
  onSelect,
}: {
  block: RdiContentBlock
  onSelect?: (blockId: string) => void
}) {
  return (
    <EditableSection block={block} onSelect={onSelect} className="bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_55%,#334155_100%)]">
      <div className="relative px-10 pb-14 max-sm:px-6 max-sm:pb-12">
        <div className="pointer-events-none absolute -bottom-28 -right-24 size-80 rounded-full bg-[#a82bbb]/30 blur-[85px]" />
        <div className="relative z-10 mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(min(210px,100%),1fr))] gap-5">
          {block.items?.map((item, index) => (
            <DivisionCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </EditableSection>
  )
}

function HomeGuidance({
  block,
  onSelect,
}: {
  block: RdiContentBlock
  onSelect?: (blockId: string) => void
}) {
  return (
    <EditableSection block={block} onSelect={onSelect} className="bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_55%,#334155_100%)]">
      <div className="relative overflow-hidden px-6 pb-14 pt-3 text-center max-sm:pb-12">
        <div className="pointer-events-none absolute -bottom-24 -right-20 size-72 rounded-full bg-[#a82bbb]/25 blur-[80px]" />
        <p className="relative z-10 text-[12px] text-[#66758e] max-sm:text-[11px]">{block.title}</p>
        {block.description ? (
          <p className="relative z-10 mx-auto mt-2 max-w-md text-[9px] text-[#66758e]">{block.description}</p>
        ) : null}
        {block.buttonLabel ? (
          <span className="relative z-10 mx-auto mt-4 inline-flex min-h-9 items-center justify-center rounded-md bg-[#304159] px-7 text-[10px] font-semibold text-white">
            {block.buttonLabel}
          </span>
        ) : null}
      </div>
    </EditableSection>
  )
}

export function RdiHomePagePreview({
  page,
  settings,
  onSelectBlock,
}: {
  page: RdiPageContent
  settings: RdiSiteSettings
  onSelectBlock?: (blockId: string) => void
}) {
  const visibleBlocks = page.blocks.filter((block) => block.visible)
  const hero = visibleBlocks.find((block) => block.id === "home-hero")
  const divisions = visibleBlocks.find((block) => block.id === "home-divisions")
  const guidance = visibleBlocks.find((block) => block.id === "home-cta")

  return (
    <>
      {hero ? <HomeHero block={hero} settings={settings} onSelect={onSelectBlock} /> : null}
      {divisions ? <HomeDivisions block={divisions} onSelect={onSelectBlock} /> : null}
      {guidance ? <HomeGuidance block={guidance} onSelect={onSelectBlock} /> : null}
    </>
  )
}

const socialLinks = [
  { label: "Facebook", mark: "f" },
  { label: "Instagram", mark: "◎" },
  { label: "LinkedIn", mark: "in" },
]

export function RdiWebsiteFooter({
  settings,
  onEdit,
}: {
  settings: RdiSiteSettings
  onEdit?: () => void
}) {
  return (
    <footer
      onClick={onEdit}
      onKeyDown={(event) => {
        if (onEdit && (event.key === "Enter" || event.key === " ")) onEdit()
      }}
      role={onEdit ? "button" : undefined}
      tabIndex={onEdit ? 0 : undefined}
      aria-label={onEdit ? "Edit global footer" : undefined}
      className={cn(
        "group/footer relative bg-[#0f172a] px-12 py-12 text-white max-sm:px-7 max-sm:py-10",
        onEdit && "cursor-pointer border-2 border-transparent transition-colors hover:border-[#d132fb] focus-visible:border-[#d132fb] focus-visible:outline-none"
      )}
    >
      {onEdit ? (
        <span className="pointer-events-none absolute right-2 top-2 z-30 rounded bg-[#d132fb] px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-white opacity-0 transition-opacity group-hover/footer:opacity-100 group-focus/footer:opacity-100">
          Edit global footer
        </span>
      ) : null}
      <div className="mx-auto grid max-w-[1280px] grid-cols-4 gap-8 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-md bg-white">
              <img src={rdiMark} alt="" className="size-8 object-contain" />
            </span>
            <div>
              <span className="font-heading text-[16px] font-bold">RDI</span>
            </div>
          </div>
          <p className="mt-5 max-w-xs text-[10px] leading-relaxed text-[#94a3b8]">{settings.footerDescription}</p>
          <div className="mt-5 flex items-center gap-3 text-[#94a3b8]">
            {socialLinks.map(({ label, mark }) => (
              <span
                key={label}
                className="flex size-7 items-center justify-center rounded-full bg-[#1e293b]"
                aria-label={label}
              >
                <span aria-hidden="true" className="text-[9px] font-bold lowercase">{mark}</span>
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="font-heading text-[13px] font-bold">{settings.footerQuickLinksHeading}</p>
          <ul className="mt-5 space-y-3 text-[10px] text-[#94a3b8]">
            {settings.footerQuickLinks.filter(Boolean).map((link, index) => (
              <li key={`${link}-${index}`}>{link}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-heading text-[13px] font-bold">{settings.footerServicesHeading}</p>
          <ul className="mt-5 space-y-3 text-[10px] text-[#94a3b8]">
            {settings.footerServices.filter(Boolean).map((service, index) => (
              <li key={`${service}-${index}`}>{service}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-heading text-[13px] font-bold">{settings.footerContactHeading}</p>
          <div className="mt-5 space-y-4 text-[10px] leading-4 text-[#94a3b8]">
            <div className="flex items-start gap-2.5">
              <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-[#ffbe0b]" />
              <span className="whitespace-pre-line">{settings.contactAddress}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone aria-hidden="true" className="size-3.5 shrink-0 text-[#c084fc]" />
              <span>{settings.contactPhone}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail aria-hidden="true" className="size-3.5 shrink-0 text-[#34d399]" />
              <span>{settings.contactEmail}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-[1280px] flex-row items-center justify-between gap-4 border-t border-white/10 pt-5 text-[9px] text-[#94a3b8] max-sm:flex-col max-sm:items-start">
        <span>{settings.copyright}</span>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {settings.legalLinks.filter(Boolean).map((link, index) => (
            <span key={`${link}-${index}`}>{link}</span>
          ))}
        </div>
      </div>
    </footer>
  )
}
