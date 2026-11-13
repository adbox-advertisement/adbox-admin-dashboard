import type { ReactNode } from "react"
import { groupByArea, isSensitive, permissionLabel } from "../lib/catalog"
import type { Permission } from "../types"
import { SensitiveTag } from "./AdminBits"

/** Permissions by area, each with its plain name, what it allows and its key; `meta` adds a line such as where it comes from. */
export function PermissionGroups<T extends Permission>({ items, meta, empty }: { items: T[]; meta?: (item: T) => ReactNode; empty: ReactNode }) {
  const groups = groupByArea(items)
  if (groups.length === 0) return <div className="px-5 py-8 text-center text-sm text-grey-500 dark:text-muted-foreground">{empty}</div>
  return <div className="flex flex-col divide-y divide-grey-200 dark:divide-border">
    {groups.map(({ area, items: grouped }) => <div key={area.id} className="px-5 py-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-grey-600 dark:text-muted-foreground">{area.label} <span className="font-normal normal-case tracking-normal">· {grouped.length}</span></h3>
      <ul className="flex flex-col gap-2.5">
        {grouped.map((item) => <li key={item.id} className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-sm font-medium">{permissionLabel(item.key)}{isSensitive(item.key) && <SensitiveTag />}</p>
          <p className="text-xs leading-5 text-grey-500 dark:text-muted-foreground">
            {item.description ? `${item.description} · ` : ""}<span className="font-mono">{item.key}</span>
          </p>
          {meta && <div className="mt-1">{meta(item)}</div>}
        </li>)}
      </ul>
    </div>)}
  </div>
}
