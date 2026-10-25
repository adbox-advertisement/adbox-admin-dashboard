import { BadgeCheck, CircleDashed, Clock3, Eye, GraduationCap, Megaphone, Sparkles, UserRound, type LucideIcon } from "lucide-react"
import { badgeIcons } from "../lib/badge-icons"
import { cn } from "@/lib/utils"
import { initials, safeImageUrl } from "../lib/format"
import {
  accountRoleLabels,
  accountStatusLabels,
  badgeLabels,
  companyStatusLabels,
  studentStatusLabels,
  verificationTierLabels,
  type AccountRole,
  type AccountStatus,
  type BadgeKind,
  type CompanyStatus,
  type StudentStatus,
  type VerificationRequestStatus,
  type VerificationTier,
} from "../types"

export const pill = "inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-b4 font-semibold leading-none"

const tones = {
  success: "bg-success-500/10 text-success-700 dark:text-success-300",
  danger: "bg-destructive/10 text-destructive",
  warning: "bg-warning-500/10 text-warning-700 dark:text-warning-300",
  neutral: "bg-grey-100 text-grey-600 dark:bg-muted dark:text-muted-foreground",
  blue: "bg-blue/10 text-blue dark:text-cyan",
  purple: "bg-purple/10 text-purple",
} as const

const statusTone: Record<AccountStatus, keyof typeof tones> = {
  active: "success",
  suspended: "danger",
  deactivated: "neutral",
  pending_deletion: "warning",
  erased: "neutral",
}

const dotTone: Record<keyof typeof tones, string> = {
  success: "bg-success-500",
  danger: "bg-destructive",
  warning: "bg-warning-500",
  neutral: "bg-grey-400",
  blue: "bg-blue",
  purple: "bg-purple",
}

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  const tone = statusTone[status]
  return <span className={cn(pill, tones[tone])}>
    <span aria-hidden="true" className={cn("size-1.5 rounded-full", dotTone[tone])} />
    {accountStatusLabels[status]}
  </span>
}

const tierStyles: Record<VerificationTier, { tone: keyof typeof tones; Icon: LucideIcon }> = {
  VERIFIED: { tone: "blue", Icon: BadgeCheck },
  PENDING: { tone: "warning", Icon: Clock3 },
  SELF_DECLARED: { tone: "neutral", Icon: CircleDashed },
}

export function TierBadge({ tier }: { tier: VerificationTier }) {
  const { tone, Icon } = tierStyles[tier]
  return <span className={cn(pill, tones[tone])}><Icon className="size-3.5" aria-hidden="true" />{verificationTierLabels[tier]}</span>
}

const roleIcons: Record<AccountRole, LucideIcon> = { GUEST: UserRound, VIEWER: Eye, CREATOR: Sparkles, PUBLISHER: Megaphone }

export function RoleBadge({ role }: { role: AccountRole | null }) {
  if (!role) return <span className={cn(pill, tones.neutral)}>Unknown role</span>
  const Icon = roleIcons[role]
  return <span className={cn(pill, role === "PUBLISHER" ? tones.blue : role === "CREATOR" ? tones.purple : tones.neutral)}>
    <Icon className="size-3.5" aria-hidden="true" />{accountRoleLabels[role]}
  </span>
}

export function AffiliationBadge({ status }: { status: StudentStatus | null }) {
  if (!status) return <span className={cn(pill, tones.neutral)}>No affiliation</span>
  return <span className={cn(pill, tones.purple)}><GraduationCap className="size-3.5" aria-hidden="true" />{studentStatusLabels[status]}</span>
}

const requestTone: Record<VerificationRequestStatus, keyof typeof tones> = { PENDING: "warning", APPROVED: "success", REJECTED: "danger" }

export function RequestStatusBadge({ status }: { status: VerificationRequestStatus }) {
  return <span className={cn(pill, tones[requestTone[status]])}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
}

const companyTone: Record<CompanyStatus, keyof typeof tones> = { PENDING_VERIFICATION: "warning", ACTIVE: "success", SUSPENDED: "danger", INACTIVE: "neutral" }

export function CompanyStatusBadge({ status }: { status: CompanyStatus | null }) {
  const value = status ?? "INACTIVE"
  return <span className={cn(pill, tones[companyTone[value]])}>{companyStatusLabels[value]}</span>
}

/** The badges a person currently shows, each with its name so nothing relies on the icon alone. */
export function EarnedBadges({ badges, compact = false }: { badges: Partial<Record<BadgeKind, boolean>>; compact?: boolean }) {
  const held = (Object.keys(badgeLabels) as BadgeKind[]).filter((kind) => badges[kind])
  if (held.length === 0) return compact ? null : <span className="text-b4 text-grey-500 dark:text-muted-foreground">No badges</span>
  return <span className="flex flex-wrap gap-1.5">
    {held.map((kind) => {
      const Icon = badgeIcons[kind]
      return <span key={kind} className={cn(pill, kind === "honour" ? tones.warning : kind === "spotlight" ? tones.purple : tones.blue)} title={badgeLabels[kind]}>
        <Icon className="size-3.5" aria-hidden="true" />
        {compact ? <span className="sr-only">{badgeLabels[kind]}</span> : badgeLabels[kind]}
      </span>
    })}
  </span>
}

export function NeutralBadge({ children }: { children: React.ReactNode }) {
  return <span className={cn(pill, tones.purple)}>{children}</span>
}

const avatarSizes = { sm: "size-8 text-xs", md: "size-9 text-sm", lg: "size-16 text-xl", xl: "size-20 text-2xl" } as const

export function UserAvatar({ name, image, size = "md", square = false }: { name: string; image: string | null; size?: keyof typeof avatarSizes; square?: boolean }) {
  const src = safeImageUrl(image)
  const shape = square ? "rounded-xl" : "rounded-full"
  if (src) return <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" className={cn("shrink-0 object-cover", shape, avatarSizes[size])} />
  return <span aria-hidden="true" className={cn("flex shrink-0 items-center justify-center bg-[image:var(--gradient-purple)] font-semibold text-white", shape, avatarSizes[size])}>{initials(name)}</span>
}
