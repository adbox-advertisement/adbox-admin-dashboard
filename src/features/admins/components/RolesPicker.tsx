import { Checkbox } from "@/components/ui/checkbox"
import type { AdminRole } from "../types"

export function RolesPicker({ options, value, onChange, disabled = false }: {
  options: AdminRole[]
  value: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
}) {
  return <fieldset disabled={disabled}>
    <legend className="mb-2 text-sm font-medium">Assign roles</legend>
    <div className="flex max-h-52 flex-col gap-3 overflow-y-auto rounded-xl border border-input p-3">
      {options.map((role) => <label key={role.id} className="flex cursor-pointer items-center gap-3 text-sm">
        <Checkbox checked={value.includes(role.id)} disabled={disabled} onCheckedChange={(checked) => onChange(checked ? [...value, role.id] : value.filter((id) => id !== role.id))} />
        <span className="min-w-0 break-all">{role.name}</span>
      </label>)}
      {options.length === 0 && <p className="text-sm text-muted-foreground">No roles available.</p>}
    </div>
  </fieldset>
}
