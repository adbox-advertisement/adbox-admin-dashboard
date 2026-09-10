import { useRef, useState } from "react"
import { ArrowDownToLine, ArrowUpFromLine, Check, HardDrive, Info, LoaderCircle, ShieldCheck } from "lucide-react"
import { cmsSections } from "../catalog"
import { useCmsStore } from "../store"
import { cmsDraftSchema, downloadDraft } from "../lib/document"
import type { CmsDraft } from "../types"
import { CmsButton } from "../components/CmsButton"
import { ContentField } from "../components/ContentField"
import { ConfirmDialog } from "../components/ConfirmDialog"
import { SaveIndicator } from "../components/SaveIndicator"
export function CmsSettingsPage() {
  const draft = useCmsStore(state => state.draft)
  const [pending, setPending] = useState<CmsDraft | null>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  return <div className="px-4 py-7 sm:px-7 sm:py-9 xl:px-9">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue">
          The finishing touches
        </p>
        <h1 className="font-heading text-3xl font-semibold">
          Site settings
        </h1>
        <p className="mt-2 text-sm text-grey-500">
          The details that connect every page of your website.
        </p>
      </div>
      <SaveIndicator />
    </div>
    <div className="grid grid-cols-1 items-start gap-6 @min-[900px]/cms:grid-cols-12">
      <div className="space-y-6 @min-[900px]/cms:col-span-8">
        {cmsSections.filter(section => section.page === "site").map(section => <section key={section.id} className="rounded-2xl border border-grey-200 bg-white p-5 sm:p-7">
          <div className="mb-6 border-b border-grey-100 pb-4">
            <h2 className="font-heading text-xl font-semibold">
              {section.label}
            </h2>
            <p className="mt-1 text-xs text-grey-400">
              Shared across your website.
            </p>
          </div>
          <div className="space-y-6">
            {section.fields.map(field => <ContentField key={field.id} field={field} value={draft.values[field.id] ?? field.value} onChange={value => useCmsStore.getState().change(current => ({ ...current, values: { ...current.values, [field.id]: value } }))} />)}
          </div>
        </section>)}
      </div>
      <aside className="space-y-5 @min-[900px]/cms:col-span-4 @min-[900px]/cms:sticky @min-[900px]/cms:top-5">
        <section className="rounded-2xl border border-grey-200 bg-white p-5">
          <span className="mb-4 flex size-10 items-center justify-center rounded-xl bg-accent-background text-blue">
            <HardDrive className="size-5" />
          </span>
          <h2 className="font-heading text-xl font-semibold">
            Your content, kept safe.
          </h2>
          <p className="mt-2 text-xs leading-6 text-grey-500">
            Drafts and images are saved in this browser. Download a backup to keep a copy or move your content to another device.
          </p>
          <CmsButton className="mt-5 w-full" variant="default" onClick={() => downloadDraft(draft)}>
            <ArrowDownToLine className="size-4" />
            Export backup
          </CmsButton>
          <CmsButton className="mt-2 w-full" disabled={busy} onClick={() => input.current?.click()}>
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowUpFromLine className="size-4" />}
            Import backup
          </CmsButton>
          <input ref={input} type="file" aria-label="Import website backup" accept="application/json,.json" className="sr-only" onChange={async (event) => {
            const file = event.target.files?.[0]
            if (!file)
              return
            setError("")
            setBusy(true)
            try {
              if (file.size > 6 * 1024 * 1024)
                throw new Error("Choose a backup smaller than 6 MB.")
              const result = cmsDraftSchema.safeParse(JSON.parse(await file.text()))
              if (!result.success)
                throw new Error("This file isn’t a valid RDI website backup.")
              setPending(result.data)
            }
            catch (error) {
              setError(error instanceof SyntaxError ? "This file isn’t a valid RDI website backup." : error instanceof Error ? error.message : "This backup could not be opened.")
            }
            finally {
              setBusy(false)
              event.target.value = ""
            }
          }} />
          {error && <p role="alert" className="mt-3 text-xs leading-5 text-error-700">
            {error}
          </p>}
          <p className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-grey-400">
            <ShieldCheck className="size-3.5" />
            Includes page content, settings, and images.
          </p>
        </section>
        <div className="rounded-2xl bg-accent-background/50 p-5">
          <Info className="mb-3 size-4 text-blue" />
          <h3 className="text-sm font-semibold">
            A space to get everything right.
          </h3>
          <p className="mt-2 text-xs leading-6 text-grey-600">
            This CMS is a local workspace. Edits won’t change the public website. Use Preview to review your draft as you go.
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-blue">
            <Check className="size-3.5" />
            No publishing connection
          </p>
        </div>
      </aside>
    </div>
    <ConfirmDialog open={pending !== null} onOpenChange={open => {
      if (!open)
        setPending(null)
    }} title="Restore this website backup?" description="This replaces the current draft, site settings, and uploaded library. Export your current backup first if you want to keep both versions." action="Restore backup" onConfirm={() => {
      if (pending)
        useCmsStore.getState().restore(pending)
    }} />
  </div>
}
