import { useState } from "react"
import { ChevronDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { permissionCatalog } from "../data/permissions"

export function PermissionsPicker({ id, value, onChange }: { id: string; value: string[]; onChange: (next: string[]) => void }) {
  const [open, setOpen] = useState(true)
  const available = permissionCatalog.filter((permission) => !value.includes(permission))

  function add(permission: string) {
    onChange([...value, permission])
  }

  function remove(permission: string) {
    onChange(value.filter((entry) => entry !== permission))
  }

  return (
    <div>
      <button
        type="button"
        id={id}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex min-h-11 w-full flex-wrap items-center gap-2 rounded-xl border border-input bg-transparent px-3 py-2 text-left outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {value.length === 0 ? (
          <span className="text-sm text-muted-foreground">Select permission</span>
        ) : (
          value.map((permission) => (
            <span key={permission} className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 py-1 pl-3 pr-1.5 text-xs font-medium text-secondary">
              {permission}
              <span
                role="button"
                tabIndex={0}
                aria-label={"Remove " + permission}
                onClick={(event) => { event.stopPropagation(); remove(permission) }}
                onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); remove(permission) } }}
                className="flex size-4 items-center justify-center rounded-full text-secondary/70 outline-none hover:bg-secondary/20 hover:text-secondary"
              >
                <X className="size-3" aria-hidden="true" />
              </span>
            </span>
          ))
        )}
        <ChevronDown className={cn("ml-auto size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>

      {open && available.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 rounded-xl bg-secondary/5 p-3">
          {available.map((permission) => (
            <button
              key={permission}
              type="button"
              onClick={() => add(permission)}
              className="rounded-full bg-card px-3 py-1.5 text-xs font-medium text-secondary shadow-adbox-small transition-colors hover:bg-secondary/10"
            >
              {permission}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
