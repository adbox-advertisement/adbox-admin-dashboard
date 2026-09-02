import {
  ArrowRight,
  ChevronDown,
  Clock3,
  ImageIcon,
  Mail,
  MapPin,
  Menu,
  Phone,
  Play,
  Sun,
} from "lucide-react"
import type { ReactNode } from "react"

import rdiLogo from "@/assets/rdi-logo.svg"
import { RdiMediaDisplay } from "@/features/rdi/components/RdiMediaField"
import {
  RdiHomePagePreview,
  RdiWebsiteFooter,
} from "@/features/rdi/components/RdiHomePreview"
import type {
  RdiContentBlock,
  RdiPageContent,
  RdiPreviewSize,
  RdiSiteSettings,
} from "@/features/rdi/types"
import { cn } from "@/lib/utils"

function PreviewButton({ label, secondary = false }: { label: string; secondary?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-4 py-2 text-[10px] font-semibold",
        secondary ? "border border-white/25 text-white" : "bg-[#ffc107] text-[#172033]"
      )}
    >
      {label}
      <ArrowRight aria-hidden="true" className="size-3" />
    </span>
  )
}

function BlockShell({
  block,
  children,
  onSelect,
  dark = false,
}: {
  block: RdiContentBlock
  children: ReactNode
  onSelect?: (blockId: string) => void
  dark?: boolean
}) {
  return (
    <section
      onClick={() => onSelect?.(block.id)}
      className={cn(
        "group/section relative cursor-pointer border-2 border-transparent transition-colors hover:border-[#d132fb]",
        dark && "bg-[#172033]"
      )}
      aria-label={`Edit ${block.name}`}
    >
      <span className="pointer-events-none absolute right-2 top-2 z-20 rounded bg-[#d132fb] px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-white opacity-0 transition-opacity group-hover/section:opacity-100">
        Edit {block.name}
      </span>
      {children}
    </section>
  )
}

function HeroBlock({
  block,
  onSelect,
  pageId,
}: {
  block: RdiContentBlock
  onSelect?: (blockId: string) => void
  pageId: string
}) {
  const isCentered = ["about", "construction", "media", "contact"].includes(pageId)
  const isMedia = pageId === "media"
  const isSolar = pageId === "solar"

  const renderTitle = () => {
    if (isMedia && block.title.includes("Move People")) {
      const start = block.title.indexOf("Move People")
      return (
        <>
          {block.title.slice(0, start)}
          <span className="bg-[linear-gradient(90deg,#c084fc,#f72585)] bg-clip-text text-transparent">
            {block.title.slice(start)}
          </span>
        </>
      )
    }

    if (isSolar && block.title.includes("brighter future")) {
      const start = block.title.indexOf("brighter future")
      return (
        <>
          {block.title.slice(0, start)}
          <span className="bg-[linear-gradient(90deg,#fbbf24,#34d399)] bg-clip-text text-transparent">
            {block.title.slice(start)}
          </span>
        </>
      )
    }

    return block.title
  }

  return (
    <BlockShell block={block} onSelect={onSelect} dark>
      <div
        className={cn(
          "relative min-h-[340px] overflow-hidden px-12 py-20 text-white max-sm:px-7 max-sm:py-14",
          pageId === "about" && "bg-[#0f172a]",
          pageId === "construction" && "bg-[linear-gradient(135deg,#1e293b,#334155,#1e293b)]",
          isMedia && "min-h-[470px] bg-[#140f35] py-24 max-sm:py-14",
          isSolar && "min-h-[450px] bg-[#071a14] py-24 max-sm:py-14",
          pageId === "contact" && "bg-[radial-gradient(circle_at_85%_45%,rgba(16,185,129,0.16),transparent_32%),radial-gradient(circle_at_12%_15%,rgba(249,115,22,0.12),transparent_30%),#0f172a]"
        )}
      >
        {block.media?.url ? (
          <div className="absolute inset-0">
            <RdiMediaDisplay media={block.media} className="h-full w-full" />
            <div
              className={cn(
                "absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.98)_0%,rgba(15,23,42,0.8)_55%,rgba(15,23,42,0.35)_100%)]",
                isMedia && "bg-[linear-gradient(135deg,rgba(15,23,42,0.88),rgba(88,28,135,0.74),rgba(15,23,42,0.94))]",
                isSolar && "bg-[linear-gradient(90deg,rgba(3,32,24,0.98),rgba(3,32,24,0.84),rgba(3,32,24,0.35))]"
              )}
            />
          </div>
        ) : null}

        <div className={cn("relative z-10 max-w-[580px]", isCentered && "mx-auto text-center", isSolar && "mx-0 text-left")}>
          {block.eyebrow ? (
            <p
              className={cn(
                "mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ffc107]",
                isMedia && "inline-flex rounded-full border border-[#c084fc]/35 bg-[#c084fc]/15 px-4 py-2 normal-case tracking-normal text-[#d8b4fe]",
                isSolar && "inline-flex rounded-full border border-[#fbbf24]/35 bg-[#fbbf24]/10 px-4 py-2 normal-case tracking-normal text-[#fde68a]"
              )}
            >
              {block.eyebrow}
            </p>
          ) : null}
          <h1 className={cn("max-w-[650px] whitespace-pre-line font-heading text-[46px] font-bold leading-[1.12] max-sm:text-[34px]", isCentered && "mx-auto")}>
            {renderTitle()}
          </h1>
          <p className={cn("mt-5 max-w-[610px] text-[14px] leading-6 text-[#cbd5e1] max-sm:text-[12px] max-sm:leading-5", isCentered && "mx-auto")}>
            {block.description}
          </p>
          <div className={cn("mt-7 flex flex-wrap gap-3", isCentered && "justify-center", isSolar && "justify-start")}>
            {block.buttonLabel ? <PreviewButton label={block.buttonLabel} /> : null}
            {block.secondaryButtonLabel ? (
              <PreviewButton label={block.secondaryButtonLabel} secondary />
            ) : null}
          </div>
        </div>
      </div>
    </BlockShell>
  )
}

function SectionHeading({ block, dark = false, green = false }: { block: RdiContentBlock; dark?: boolean; green?: boolean }) {
  return (
    <div className="mx-auto mb-8 max-w-[590px] text-center">
      {block.eyebrow ? (
        <p className={cn("mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9c27b0]", green && "text-[#059669]")}>
          {block.eyebrow}
        </p>
      ) : null}
      <h2 className={cn("font-heading text-[30px] font-bold leading-tight text-[#172033] max-sm:text-[25px]", dark && "text-white")}>
        {block.title}
      </h2>
      {block.description ? (
        <p className={cn("mx-auto mt-3 max-w-[510px] text-[12px] leading-5 text-[#64748b] max-sm:text-[11px]", dark && "text-[#94a3b8]")}>
          {block.description}
        </p>
      ) : null}
    </div>
  )
}

function SplitBlock({
  block,
  onSelect,
}: {
  block: RdiContentBlock
  onSelect?: (blockId: string) => void
}) {
  return (
    <BlockShell block={block} onSelect={onSelect}>
      <div className="grid grid-cols-2 items-center gap-8 px-12 py-16 max-sm:grid-cols-1 max-sm:px-7 max-sm:py-12">
        <div className="aspect-[4/3] overflow-hidden rounded-xl bg-[#e2e8f0]">
          {block.media ? (
            <RdiMediaDisplay media={block.media} className="h-full w-full" />
          ) : (
            <div className="flex h-full items-center justify-center text-[#94a3b8]">
              <ImageIcon aria-hidden="true" className="size-8" />
            </div>
          )}
        </div>
        <div>
          {block.eyebrow ? (
            <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9c27b0]">
              {block.eyebrow}
            </p>
          ) : null}
          <h2 className="font-heading text-[32px] font-bold leading-tight text-[#172033] max-sm:text-[26px]">
            {block.title}
          </h2>
          <p className="mt-4 whitespace-pre-line text-[12px] leading-5 text-[#64748b] max-sm:text-[11px]">
            {block.description}
          </p>
          {block.buttonLabel ? (
            <div className="mt-6">
              <PreviewButton label={block.buttonLabel} />
            </div>
          ) : null}
        </div>
      </div>
    </BlockShell>
  )
}

function CardsBlock({
  block,
  onSelect,
}: {
  block: RdiContentBlock
  onSelect?: (blockId: string) => void
}) {
  const isMediaWork = block.id === "media-work"
  const isAboutDark = ["about-divisions", "about-values"].includes(block.id)
  const isDark = isMediaWork || isAboutDark
  const isSolar = block.id.startsWith("solar-")
  const isContactForm = block.id === "contact-form"
  const isFaq = block.id === "contact-faq"

  if (block.id === "about-divisions") {
    const activeItem = block.items?.[0]
    const promise = activeItem?.features?.find((feature) => feature.startsWith("Our promise —"))
    const capabilities = activeItem?.features?.filter((feature) => !feature.startsWith("Our promise —"))

    return (
      <BlockShell block={block} onSelect={onSelect} dark>
        <div className="bg-[linear-gradient(180deg,#0f172a,#1e293b)] px-12 py-16 max-sm:px-7 max-sm:py-12">
          <SectionHeading block={block} dark />
          <div className="mb-5 grid grid-cols-3 gap-2">
            {block.items?.map((item, index) => (
              <span
                key={item.id}
                className={cn(
                  "flex min-h-9 items-center justify-center rounded-lg border border-[#334155] px-2 text-center text-[9px] font-semibold text-[#cbd5e1]",
                  index === 0 && "border-[#f97316] bg-[#f97316] text-white"
                )}
              >
                {item.title.replace(" Division", "")}
              </span>
            ))}
          </div>
          {activeItem ? (
            <article className="grid grid-cols-2 gap-7 rounded-2xl border border-[#fed7aa] bg-[#fffaf3] p-8 max-sm:grid-cols-1 max-sm:p-6">
              <div>
                {activeItem.eyebrow ? (
                  <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">{activeItem.eyebrow}</p>
                ) : null}
                <h3 className="mt-3 font-heading text-[24px] font-bold text-[#172033]">{activeItem.title}</h3>
                <p className="mt-3 text-[10px] leading-5 text-[#64748b]">{activeItem.description}</p>
                {activeItem.buttonLabel ? (
                  <span className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#f97316] px-4 py-2 text-[9px] font-semibold text-white">
                    {activeItem.buttonLabel}
                    <ArrowRight className="size-3" />
                  </span>
                ) : null}
              </div>
              <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
                <h4 className="font-heading text-[13px] font-bold text-[#172033]">Core capabilities</h4>
                <ul className="mt-4 space-y-2.5 text-[9px] text-[#64748b]">
                  {capabilities?.map((feature, index) => (
                    <li key={`${activeItem.id}-capability-${index}`} className="flex items-start gap-2">
                      <span className="mt-1 size-2 shrink-0 rounded-full border-2 border-[#10b981]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {promise ? (
                  <div className="mt-4 border-t border-[#e2e8f0] pt-4">
                    <h4 className="font-heading text-[11px] font-bold text-[#172033]">Our promise</h4>
                    <p className="mt-2 text-[9px] leading-4 text-[#64748b]">{promise.replace("Our promise — ", "")}</p>
                  </div>
                ) : null}
              </div>
            </article>
          ) : null}
        </div>
      </BlockShell>
    )
  }

  if (isContactForm) {
    return (
      <BlockShell block={block} onSelect={onSelect}>
        <div className="bg-[linear-gradient(180deg,#f8fafc,#ffffff)] px-12 py-16 max-sm:px-7 max-sm:py-12">
          <div className="mx-auto max-w-[760px] rounded-2xl bg-white p-8 shadow-[0_12px_34px_rgba(15,23,42,0.12)] max-sm:p-6">
            <h2 className="font-heading text-[25px] font-bold text-[#0f172a]">{block.title}</h2>
            <p className="mt-2 text-[12px] text-[#64748b] max-sm:text-[11px]">{block.description}</p>
            <div className="mt-7 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
              {block.items?.map((item, index) => (
                <label
                  key={item.id}
                  className={cn("block text-[9px] font-semibold text-[#334155]", index > 1 && "col-span-2 max-sm:col-span-1")}
                >
                  {item.title}
                  <span className={cn("mt-1.5 flex min-h-9 items-center rounded-md border border-[#cbd5e1] px-3 text-[9px] font-normal text-[#94a3b8]", item.id === "contact-message" && "min-h-20 items-start pt-3")}>
                    {item.description}
                    {item.features?.length ? <ChevronDown className="ml-auto size-3.5" /> : null}
                  </span>
                </label>
              ))}
            </div>
            {block.buttonLabel ? (
              <span className="mt-5 flex h-9 items-center justify-center rounded-md bg-[#0f172a] text-[10px] font-semibold text-white">
                {block.buttonLabel}
              </span>
            ) : null}
          </div>
        </div>
      </BlockShell>
    )
  }

  if (isFaq) {
    return (
      <BlockShell block={block} onSelect={onSelect}>
        <div className="bg-white px-12 py-16 max-sm:px-7 max-sm:py-12">
          <SectionHeading block={block} />
          <div className="mx-auto max-w-[680px] space-y-3">
            {block.items?.map((item) => (
              <div key={item.id} className="flex min-h-12 items-center rounded-xl border border-[#e2e8f0] bg-white px-5 shadow-sm">
                <span className="flex-1 font-heading text-[12px] font-semibold text-[#172033]">{item.title}</span>
                <ChevronDown className="size-3.5 text-[#94a3b8]" />
              </div>
            ))}
          </div>
        </div>
      </BlockShell>
    )
  }

  return (
    <BlockShell block={block} onSelect={onSelect}>
      <div
        className={cn(
          "bg-[#f8fafc] px-12 py-16 max-sm:px-7 max-sm:py-12",
          isAboutDark && "bg-[linear-gradient(135deg,#0f172a,#1e293b)]",
          isMediaWork && "bg-[linear-gradient(135deg,#581c87,#3b1768,#111936)]",
          block.id === "construction-services" && "bg-white",
          block.id === "construction-project-gallery" && "bg-white",
          block.id === "solar-benefits" && "bg-white",
          block.id === "solar-process" && "bg-white",
          block.id === "contact-teams" && "bg-[#f8fafc]"
        )}
      >
        <SectionHeading block={block} dark={isDark} green={isSolar} />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(180px,100%),1fr))] gap-4">
          {block.items?.map((item) => (
            <article
              key={item.id}
              className={cn(
                "overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-[0_9px_24px_rgba(15,23,42,0.08)]",
                isDark && "border-white/10 bg-white/5 text-white",
                isSolar && "border-[#d1fae5]",
                isMediaWork && "border-white/10 bg-[#160f35]"
              )}
            >
              {item.media ? (
                <div className="relative aspect-[4/2.7] overflow-hidden bg-[#e2e8f0]">
                  <RdiMediaDisplay media={item.media} className="h-full w-full" />
                  {item.media.type === "video" ? (
                    <span className="absolute left-3 top-3 flex size-7 items-center justify-center rounded-full bg-white/90 text-[#172033]">
                      <Play aria-hidden="true" className="ml-0.5 size-3 fill-current" />
                    </span>
                  ) : null}
                </div>
              ) : null}
              <div className="p-5">
                {item.eyebrow ? (
                  <p className={cn("mb-2 text-[8px] font-semibold uppercase tracking-[0.16em] text-[#9c27b0]", isSolar && "text-[#059669]", isMediaWork && "text-[#d8b4fe]")}>
                    {item.eyebrow}
                  </p>
                ) : null}
                <h3 className={cn("font-heading text-[16px] font-bold text-[#172033]", isDark && "text-white")}>{item.title}</h3>
                <p className={cn("mt-2 whitespace-pre-line text-[10px] leading-[1.55] text-[#64748b]", isDark && "text-[#cbd5e1]")}>{item.description}</p>
                {item.features?.length ? (
                  <ul className={cn("mt-4 space-y-2 text-[9px] text-[#475569]", isDark && "text-[#cbd5e1]")}>
                    {item.features.map((feature, index) => (
                      <li key={`${item.id}-feature-${index}`} className="flex items-start gap-2">
                        <span className={cn("mt-1 size-1.5 shrink-0 rounded-full bg-[#f97316]", isSolar && "bg-[#10b981]", isMediaWork && "bg-[#c084fc]")} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {item.buttonLabel ? (
                  <span className="mt-4 inline-flex items-center gap-2 text-[9px] font-semibold text-[#f97316]">
                    {item.buttonLabel}
                    <ArrowRight className="size-3" />
                  </span>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </BlockShell>
  )
}

function ContactOverview({
  form,
  details,
  note,
  onSelect,
}: {
  form: RdiContentBlock
  details: RdiContentBlock
  note: RdiContentBlock
  onSelect?: (blockId: string) => void
}) {
  const detailIcons = [MapPin, Phone, Mail, Clock3]

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_250px] gap-5 bg-[linear-gradient(180deg,#f8fafc,#ffffff)] px-12 py-16 max-lg:grid-cols-1 max-sm:px-7 max-sm:py-12">
      <BlockShell block={form} onSelect={onSelect}>
        <div className="h-full rounded-2xl bg-white p-8 shadow-[0_12px_34px_rgba(15,23,42,0.12)] max-sm:p-6">
          <h2 className="font-heading text-[25px] font-bold text-[#0f172a]">{form.title}</h2>
          <p className="mt-2 text-[12px] text-[#64748b] max-sm:text-[11px]">{form.description}</p>
          <div className="mt-7 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            {form.items?.map((item, index) => (
              <div
                key={item.id}
                className={cn("block text-[9px] font-semibold text-[#334155]", index > 1 && "col-span-2 max-sm:col-span-1")}
              >
                {item.title}
                <span className={cn("mt-1.5 flex min-h-9 items-center rounded-md border border-[#cbd5e1] px-3 text-[9px] font-normal text-[#94a3b8]", item.id === "contact-message" && "min-h-20 items-start pt-3")}>
                  {item.description}
                  {item.features?.length ? <ChevronDown className="ml-auto size-3.5" /> : null}
                </span>
              </div>
            ))}
          </div>
          {form.buttonLabel ? (
            <span className="mt-5 flex h-9 items-center justify-center rounded-md bg-[#0f172a] text-[10px] font-semibold text-white">
              {form.buttonLabel}
            </span>
          ) : null}
        </div>
      </BlockShell>

      <div className="space-y-5">
        <BlockShell block={details} onSelect={onSelect}>
          <div className="rounded-2xl bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.12)]">
            <h2 className="font-heading text-[18px] font-bold text-[#0f172a]">{details.title}</h2>
            <div className="mt-5 space-y-4">
              {details.items?.map((item, index) => {
                const Icon = detailIcons[index] ?? MapPin
                const iconClasses = ["bg-[#fef3c7] text-[#d97706]", "bg-[#f3e8ff] text-[#a855f7]", "bg-[#d1fae5] text-[#059669]", "bg-[#e2e8f0] text-[#64748b]"]

                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", iconClasses[index])}>
                      <Icon className="size-4" strokeWidth={1.7} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-[#334155]">{item.eyebrow}</p>
                      <p className="mt-1 whitespace-pre-line text-[9px] leading-4 text-[#64748b]">
                        {item.title}{item.description ? `\n${item.description}` : ""}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </BlockShell>

        <BlockShell block={note} onSelect={onSelect}>
          <div className="rounded-2xl border border-[#fde68a] bg-[linear-gradient(135deg,#fff7ed,#ecfdf5)] p-6">
            <Sun className="size-5 text-[#f97316]" />
            <h2 className="mt-4 font-heading text-[16px] font-bold text-[#172033]">{note.title}</h2>
            <p className="mt-2 text-[9px] leading-4 text-[#64748b]">{note.description}</p>
          </div>
        </BlockShell>
      </div>
    </div>
  )
}

function StatsBlock({
  block,
  onSelect,
}: {
  block: RdiContentBlock
  onSelect?: (blockId: string) => void
}) {
  const isMedia = block.id === "media-stats"
  const isConstruction = block.id === "construction-stats"

  return (
    <BlockShell block={block} onSelect={onSelect}>
      <div className={cn("px-12 py-14 max-sm:px-7 max-sm:py-11", isMedia && "bg-[#0f172a] text-white", isConstruction && "bg-white")}>
        {!isMedia && !isConstruction ? <SectionHeading block={block} /> : null}
        <div className="grid grid-cols-4 gap-3 max-sm:grid-cols-2">
          {block.items?.map((item) => (
            <div key={item.id} className={cn("rounded-xl border border-[#e2e8f0] p-4 text-center", (isMedia || isConstruction) && "border-transparent")}>
              <span className={cn("mx-auto mb-3 hidden size-7 rounded-lg bg-[#f97316]", isConstruction && "block", isMedia && "block bg-[#a855f7]")} />
              <p className={cn("font-heading text-[25px] font-bold text-[#172033]", isMedia && "text-white")}>{item.title}</p>
              <p className={cn("mt-1 text-[9px] text-[#64748b]", isMedia && "text-[#94a3b8]")}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </BlockShell>
  )
}

function CtaBlock({
  block,
  onSelect,
}: {
  block: RdiContentBlock
  onSelect?: (blockId: string) => void
}) {
  const isSolar = block.id === "solar-cta"
  const isMedia = block.id === "media-cta"
  const isConstruction = block.id === "construction-cta"
  const isSolarCallout = block.id === "construction-solar-cta"
  const isContactNote = block.id === "contact-solar-note"
  const isLight = isSolarCallout || isContactNote

  return (
    <BlockShell block={block} onSelect={onSelect} dark={!isLight}>
      <div
        className={cn(
          "bg-[radial-gradient(circle_at_top_right,rgba(156,39,176,0.4),transparent_45%)] px-12 py-16 text-center text-white max-sm:px-7 max-sm:py-12",
          isMedia && "bg-[linear-gradient(135deg,#581c87,#3b1768,#111936)]",
          isConstruction && "bg-[#f8fafc] text-left text-[#172033]",
          isSolar && "bg-[#071a14]",
          isSolarCallout && "bg-[linear-gradient(90deg,#fff7ed,#ecfdf5)] text-left text-[#172033]",
          isContactNote && "bg-[linear-gradient(135deg,#fff7ed,#ecfdf5)] text-left text-[#172033]"
        )}
      >
        {block.eyebrow ? (
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#ffc107]">
            {block.eyebrow}
          </p>
        ) : null}
        <h2 className={cn("mx-auto max-w-[590px] font-heading text-[34px] font-bold leading-tight max-sm:text-[27px]", (isConstruction || isLight) && "mx-0")}>
          {block.title}
        </h2>
        <p className={cn("mx-auto mt-4 max-w-[500px] text-[11px] leading-5 text-[#cbd5e1]", (isConstruction || isLight) && "mx-0 text-[#64748b]")}>
          {block.description}
        </p>
        {block.buttonLabel ? (
          <div className={cn("mt-7", (isConstruction || isLight) && "text-left")}>
            <PreviewButton label={block.buttonLabel} />
          </div>
        ) : null}
      </div>
    </BlockShell>
  )
}

function PreviewBlock({
  block,
  onSelect,
  pageId,
}: {
  block: RdiContentBlock
  onSelect?: (blockId: string) => void
  pageId: string
}) {
  if (block.type === "hero") return <HeroBlock block={block} onSelect={onSelect} pageId={pageId} />
  if (block.type === "split") return <SplitBlock block={block} onSelect={onSelect} />
  if (block.type === "cards") return <CardsBlock block={block} onSelect={onSelect} />
  if (block.type === "stats") return <StatsBlock block={block} onSelect={onSelect} />

  return <CtaBlock block={block} onSelect={onSelect} />
}

const previewWidths: Record<RdiPreviewSize, string> = {
  desktop: "max-w-none",
  tablet: "max-w-[760px]",
}

export function RdiWebsitePreview({
  settings,
  pages,
  page,
  previewSize,
  onSelectBlock,
  onEditFooter,
}: {
  settings: RdiSiteSettings
  pages: RdiPageContent[]
  page: RdiPageContent
  previewSize: RdiPreviewSize
  onSelectBlock?: (blockId: string) => void
  onEditFooter?: () => void
}) {
  const visibleBlocks = page.blocks.filter((block) => block.visible)
  const contactForm = visibleBlocks.find((block) => block.id === "contact-form")
  const contactDetails = visibleBlocks.find((block) => block.id === "contact-details")
  const contactNote = visibleBlocks.find((block) => block.id === "contact-solar-note")

  return (
    <div className={cn("mx-auto w-full overflow-hidden rounded-xl bg-white shadow-adbox-medium transition-[max-width]", previewWidths[previewSize])}>
      <header className="flex h-[72px] items-center justify-between border-b border-[#e2e8f0] bg-white px-10 max-sm:px-5">
        <img src={rdiLogo} alt="RDI" className="h-10 w-auto max-w-[112px] object-contain" />

        <nav className="flex items-center gap-5 max-md:hidden" aria-label="Website preview navigation">
          {pages.map((navPage) => (
            <span
              key={navPage.id}
              className={cn(
                "relative py-2 text-[9px] font-semibold text-[#172033]",
                navPage.id === page.id && "text-[#f97316] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-[#f97316]"
              )}
            >
              {navPage.navigationLabel}
            </span>
          ))}
        </nav>

        <Menu aria-hidden="true" className="hidden size-5 text-[#172033] max-md:block" />
      </header>

      <main>
        {page.id === "home" ? (
          <>
            <RdiHomePagePreview page={page} settings={settings} onSelectBlock={onSelectBlock} />
            {page.blocks
              .filter(
                (block) =>
                  block.visible &&
                  !["home-hero", "home-divisions", "home-cta"].includes(block.id)
              )
              .map((block) => (
                <PreviewBlock key={block.id} block={block} onSelect={onSelectBlock} pageId={page.id} />
              ))}
          </>
        ) : page.id === "contact" && contactForm && contactDetails && contactNote ? (
          <>
            {visibleBlocks
              .filter((block) => block.id === "contact-hero")
              .map((block) => (
                <PreviewBlock key={block.id} block={block} onSelect={onSelectBlock} pageId={page.id} />
              ))}
            <ContactOverview
              form={contactForm}
              details={contactDetails}
              note={contactNote}
              onSelect={onSelectBlock}
            />
            {visibleBlocks
              .filter((block) => !["contact-hero", "contact-form", "contact-details", "contact-solar-note"].includes(block.id))
              .map((block) => (
                <PreviewBlock key={block.id} block={block} onSelect={onSelectBlock} pageId={page.id} />
              ))}
          </>
        ) : (
          visibleBlocks.map((block) => (
            <PreviewBlock key={block.id} block={block} onSelect={onSelectBlock} pageId={page.id} />
          ))
        )}
      </main>

      <RdiWebsiteFooter settings={settings} onEdit={onEditFooter} />
    </div>
  )
}
