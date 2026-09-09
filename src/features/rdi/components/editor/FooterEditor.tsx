import { PanelBottom } from "lucide-react"
import type { RdiSiteSettings } from "../../types"
import { EditorCard, EditorInput, EditorTextarea } from "./EditorFields"

export function FooterEditor({
  settings,
  pageCount,
  onChange,
}: {
  settings: RdiSiteSettings
  pageCount: number
  onChange: (patch: Partial<RdiSiteSettings>) => void
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-2xl border border-purple/15 bg-accent-background px-5 py-4 text-purple shadow-adbox-small">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-adbox-small">
          <PanelBottom className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold">Global website footer</p>
          <p className="mt-1 text-xs leading-5 text-grey-500">
            This footer is shared across all {pageCount} RDI pages. Edit it once and every page updates.
          </p>
        </div>
      </div>

      <EditorCard title="Footer navigation" description="The division and company links shown at the bottom of every website page.">
        <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
          <div>
            <EditorInput
              label="Divisions heading"
              value={settings.footerQuickLinksHeading}
              onChange={(footerQuickLinksHeading) => onChange({ footerQuickLinksHeading })}
            />
          </div>
          <div>
            <EditorInput
              label="Company heading"
              value={settings.footerServicesHeading}
              onChange={(footerServicesHeading) => onChange({ footerServicesHeading })}
            />
          </div>
          <div>
            <EditorTextarea
              label="Division links"
              hint="One item per line"
              value={settings.footerQuickLinks.join("\n")}
              onChange={(value) => onChange({ footerQuickLinks: value.split("\n") })}
              rows={6}
            />
          </div>
          <div>
            <EditorTextarea
              label="Company links"
              hint="One item per line"
              value={settings.footerServices.join("\n")}
              onChange={(value) => onChange({ footerServices: value.split("\n") })}
              rows={6}
            />
          </div>
          <div className="col-span-2 max-sm:col-span-1">
            <EditorInput
              label="Brand description"
              value={settings.footerDescription}
              onChange={(footerDescription) => onChange({ footerDescription })}
            />
          </div>
        </div>
      </EditorCard>

      <EditorCard title="Footer contact" description="Edit the contact details and copyright line shown in the footer.">
        <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
          <EditorInput
            label="Contact heading"
            value={settings.footerContactHeading}
            onChange={(footerContactHeading) => onChange({ footerContactHeading })}
          />
          <EditorInput
            label="Phone number"
            value={settings.contactPhone}
            onChange={(contactPhone) => onChange({ contactPhone })}
          />
          <div className="col-span-2 max-sm:col-span-1">
            <EditorTextarea
              label="Address"
              value={settings.contactAddress}
              onChange={(contactAddress) => onChange({ contactAddress })}
              rows={3}
            />
          </div>
          <EditorInput
            label="Email address"
            value={settings.contactEmail}
            onChange={(contactEmail) => onChange({ contactEmail })}
          />
          <div className="col-span-2 max-sm:col-span-1">
            <EditorInput
              label="Copyright line"
              value={settings.copyright}
              onChange={(copyright) => onChange({ copyright })}
            />
          </div>
        </div>
      </EditorCard>
    </div>
  )
}
