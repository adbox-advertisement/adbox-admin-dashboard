import { Award, Building2, GraduationCap, Sparkles, type LucideIcon } from "lucide-react"
import type { BadgeKind } from "../types"

export const badgeIcons: Record<BadgeKind, LucideIcon> = { campus: GraduationCap, company: Building2, honour: Award, spotlight: Sparkles }
