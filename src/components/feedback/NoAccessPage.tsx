import { ArrowLeft, Lock, RefreshCw } from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import { WILDCARD_PERMISSION, type PermissionRequirement } from "@/lib/permissions"
import { APP_ROUTES } from "@/routes/paths"

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 pb-10 pt-6 sm:px-6 sm:pb-12">
      <section className="mx-auto flex w-full max-w-[640px] flex-col items-center rounded-[20px] border border-grey-100 bg-white px-6 py-12 text-center shadow-adbox-small dark:border-border dark:bg-card sm:px-10">
        {children}
      </section>
    </div>
  )
}

/** The keys a page needs, as the admin would ask for them. */
function needs(requirements: readonly PermissionRequirement[]) {
  const keys = requirements.flatMap((requirement) => (typeof requirement === "string" ? [requirement] : [...requirement]))
  return keys.includes(WILDCARD_PERMISSION) ? null : [...new Set(keys)]
}

/**
 * Shown in place of a page the admin's roles do not open, reached by a link or an old bookmark:
 * the sidebar never offers it to them.
 */
export function NoAccessPage({ requirements }: { requirements: readonly PermissionRequirement[] }) {
  const keys = needs(requirements)
  return (
    <Frame>
      <span className="flex size-14 items-center justify-center rounded-2xl bg-purple/10 text-purple">
        <Lock aria-hidden="true" className="size-6" strokeWidth={1.7} />
      </span>
      <h2 className="mt-5 font-heading text-h5 font-semibold text-grey-1000 dark:text-foreground">You don’t have access to this page</h2>
      {keys === null ? (
        <p className="mt-3 max-w-[460px] text-b2 leading-6 text-grey-500 dark:text-muted-foreground">Only a Super Admin can open it.</p>
      ) : (
        <>
          <p className="mt-3 max-w-[460px] text-b2 leading-6 text-grey-500 dark:text-muted-foreground">
            Your roles don’t include {keys.length > 1 ? "any of the permissions" : "the permission"} it needs. A Super Admin can add {keys.length > 1 ? "one" : "it"} to your role.
          </p>
          <ul aria-label="Permissions it needs" className="mt-4 flex flex-wrap justify-center gap-2">
            {keys.map((key) => (
              <li key={key}>
                <code className="rounded-lg bg-muted px-2.5 py-1 text-b3 text-grey-700 dark:text-foreground">{key}</code>
              </li>
            ))}
          </ul>
        </>
      )}
      <Link
        to={APP_ROUTES.dashboard}
        className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-purple px-5 text-b3 font-semibold text-white shadow-adbox-small transition-colors hover:bg-purple/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-2"
      >
        <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.8} />
        Back to Dashboard
      </Link>
    </Frame>
  )
}

/** While the admin's permissions are being read, in place of a page that needs some. */
export function CheckingAccess() {
  return <p role="status" className="px-4 py-8 text-sm text-muted-foreground sm:px-6">Checking your access…</p>
}

/** When the admin's permissions could not be read, in place of a page that needs some. */
export function AccessCheckFailed({ onRetry }: { onRetry: () => void }) {
  return (
    <Frame>
      <h2 className="font-heading text-h5 font-semibold text-grey-1000 dark:text-foreground">We couldn’t check your access</h2>
      <p className="mt-3 max-w-[460px] text-b2 leading-6 text-grey-500 dark:text-muted-foreground">Your permissions did not load, so this page stays closed. Check your connection and try again.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-grey-200 px-5 text-b3 font-semibold text-grey-800 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-2 dark:border-border dark:text-foreground"
      >
        <RefreshCw aria-hidden="true" className="size-4" strokeWidth={1.8} />
        Try again
      </button>
    </Frame>
  )
}
