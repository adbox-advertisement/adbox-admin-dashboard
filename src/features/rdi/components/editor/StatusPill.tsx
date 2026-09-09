import type { RdiPageContent } from "../../types"
import { cn } from "@/lib/utils"

export function StatusPill({ status }: { status: RdiPageContent["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold",
        status === "Published"
          ? "bg-success-100 text-success-800"
          : "bg-warning-100 text-warning-800"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "Published" ? "bg-success-600" : "bg-warning-600"
        )}
      />
      {status}
    </span>
  )
}
