import type { ReactNode } from "react"

import { AccessCheckFailed, CheckingAccess, NoAccessPage } from "@/components/feedback/NoAccessPage"
import { meetsRequirement, type PermissionAccess, type PermissionRequirement } from "@/lib/permissions"

/**
 * Opens a page only to an admin who meets every one of its [requirements]. A page that needs
 * nothing opens at once; one that does waits for the admin's permissions, and stays closed if
 * they cannot be read.
 */
export function PageGate({
  requirements,
  access,
  failed,
  onRetry,
  children,
}: {
  requirements: readonly PermissionRequirement[]
  access: PermissionAccess
  /** The admin's permissions could not be read. */
  failed: boolean
  onRetry: () => void
  children: ReactNode
}) {
  if (requirements.length === 0) return children
  if (!access.ready) return failed ? <AccessCheckFailed onRetry={onRetry} /> : <CheckingAccess />
  return requirements.every((requirement) => meetsRequirement(access.granted, requirement))
    ? children
    : <NoAccessPage requirements={requirements} />
}
