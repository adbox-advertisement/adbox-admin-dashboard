import { useState } from "react"
import { ChevronDown, X } from "lucide-react"
import type { Permission } from "../types"

export function PermissionsPicker({ id, value, options, onChange, disabled = false, allowWildcard = false }: {
  id: string
  value: string[]
  options: Permission[]
  onChange: (next: string[]) => void
  disabled?: boolean
  allowWildcard?: boolean
}) {
  const [open, setOpen] = useState(true)
  const available = options.filter((permission) => (allowWildcard || permission.key !== "*") && !value.includes(permission.id))

  return (
    <div>
      <button type="button" id={id} disabled={disabled} onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-controls={`${id}-options`}
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-input px-3 py-2 text-left text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50">
        {value.length === 0 ? "Select permission" : `${value.length} permissions selected`}
        <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
      </button>
      {value.length > 0 && <div className="mt-2 flex flex-wrap gap-2">
        {value.map((permissionId) => {
          const permission = options.find((entry) => entry.id === permissionId)
          const label = permission?.key === "*" ? "All permissions (*)" : permission?.key ?? "Unavailable permission"
          return <span key={permissionId} className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-secondary/10 py-1 pl-3 pr-1.5 text-xs font-medium text-secondary">
            <span className="break-all">{label}</span>
            <button type="button" disabled={disabled} aria-label={`Remove ${label}`} onClick={() => onChange(value.filter((entry) => entry !== permissionId))}
              className="flex size-6 shrink-0 items-center justify-center rounded-full outline-none hover:bg-secondary/20 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">
              <X className="size-3" aria-hidden="true" />
            </button>
          </span>
        })}
      </div>}
      {open && <div id={`${id}-options`} className="mt-2 flex max-h-52 flex-wrap gap-2 overflow-y-auto rounded-xl bg-secondary/5 p-3">
        {available.map((permission) => <button key={permission.id} type="button" disabled={disabled} title={permission.description || undefined}
          onClick={() => onChange([...value, permission.id])}
          className="max-w-full cursor-pointer break-all rounded-full bg-card px-3 py-1.5 text-xs font-medium text-secondary shadow-adbox-small hover:bg-secondary/10 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">
          {permission.key === "*" ? "All permissions (*)" : permission.key}
        </button>)}
        {available.length === 0 && <p className="text-sm text-muted-foreground">No more permissions available.</p>}
      </div>}
    </div>
  )
}
