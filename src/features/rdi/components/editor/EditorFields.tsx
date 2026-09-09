import { type ReactNode } from "react"
import { Input } from "@/components/ui/input"

export function EditorCard({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-grey-100 bg-white shadow-adbox-small">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-grey-100 px-6 py-5 max-sm:px-5">
        <div>
          <h2 className="text-base font-semibold text-grey-1000">{title}</h2>
          {description ? <p className="mt-1 text-xs leading-5 text-grey-400">{description}</p> : null}
        </div>
        {actions}
      </div>
      <div className="p-6 max-sm:p-5">{children}</div>
    </section>
  )
}

export function FieldLabel({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-grey-600">
        {label}
        {hint ? <span className="font-normal text-grey-400">{hint}</span> : null}
      </span>
      {children}
    </label>
  )
}

export function EditorInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hint?: string
  type?: "text" | "url"
}) {
  return (
    <FieldLabel label={label} hint={hint}>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 border-grey-200 bg-white text-sm text-grey-900 placeholder:text-grey-300"
      />
    </FieldLabel>
  )
}

export function EditorTextarea({
  label,
  value,
  onChange,
  rows = 4,
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
  hint?: string
}) {
  return (
    <FieldLabel label={label} hint={hint}>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="w-full resize-y rounded-lg border border-grey-200 bg-white px-3 py-3 text-sm leading-6 text-grey-900 outline-none transition-shadow placeholder:text-grey-300 focus:border-grey-400 focus:ring-2 focus:ring-purple/10"
      />
    </FieldLabel>
  )
}
