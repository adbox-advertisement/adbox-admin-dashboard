import { UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCurrentAdmin } from "../hooks"

export function CurrentAdminProfile() {
  const { data: admin, isPending, isFetching, refetch } = useCurrentAdmin()
  const roles = admin?.roles.map((role) =>
    role.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
  ).join(", ")

  return (
    <div role="group" aria-label="Signed-in account" className="flex min-w-0 items-center gap-3">
      <span className="flex size-[41px] shrink-0 items-center justify-center rounded-full bg-blue/10 text-blue" aria-hidden="true">
        <UserRound className="size-5" strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1 text-left">
        {admin ? (
          <>
            <p className="text-sm font-semibold leading-5 text-grey-1000 [overflow-wrap:anywhere]">
              {admin.email}
            </p>
            <p className="mt-0.5 text-xs leading-4 text-grey-500 [overflow-wrap:anywhere]">
              <span className="sr-only">{admin.roles.length > 1 ? "Roles: " : "Role: "}</span>
              {roles || "No role assigned"}
            </p>
          </>
        ) : isPending ? (
          <p role="status" className="text-xs leading-5 text-grey-500">Loading account…</p>
        ) : (
          <>
            <p role="status" className="text-xs leading-4 text-grey-500">Couldn’t load account</p>
            <Button
              type="button"
              variant="link"
              size="xs"
              className="h-auto p-0 text-xs leading-5 text-blue"
              disabled={isFetching}
              onClick={() => { void refetch() }}
            >
              {isFetching ? "Retrying…" : "Retry"}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
