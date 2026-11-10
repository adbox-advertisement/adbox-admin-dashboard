import { useNavigate } from "react-router-dom"
import { useUserAccess } from "../hooks"
import { userProfilePath } from "../lib/paths"
import { USER_PERMISSIONS } from "../types"
import { NoAccess } from "../components/Surface"
import { PageIntro } from "../components/ListParts"
import { VerificationQueue } from "../components/VerificationQueue"

export function VerificationPage() {
  const can = useUserAccess()
  const navigate = useNavigate()
  if (!can(USER_PERMISSIONS.verificationRead)) return <NoAccess permission={USER_PERMISSIONS.verificationRead} what="verification requests" />
  return <div className="flex min-w-0 flex-col gap-4 px-4 sm:px-6">
    <PageIntro>
      Students, alumni and staff proving they belong to an institution. Check the evidence before deciding: approving gives them the campus badge. Oldest first.
    </PageIntro>
    <VerificationQueue onOpenUser={(id) => navigate(userProfilePath(id))} />
  </div>
}
