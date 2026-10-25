import { useNavigate } from "react-router-dom"
import { useUserAccess } from "../hooks"
import { userProfilePath } from "../lib/paths"
import { USER_PERMISSIONS } from "../types"
import { NoAccess } from "../components/Surface"
import { VerificationQueue } from "../components/VerificationQueue"

export function VerificationPage() {
  const can = useUserAccess()
  const navigate = useNavigate()
  if (!can(USER_PERMISSIONS.verificationRead)) return <NoAccess permission={USER_PERMISSIONS.verificationRead} what="verification requests" />
  return <div className="min-w-0 px-4 sm:px-6">
    <VerificationQueue onOpenUser={(id) => navigate(userProfilePath(id))} />
  </div>
}
