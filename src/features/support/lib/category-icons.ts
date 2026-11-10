import { BadgeCheck, Coins, KeyRound, Megaphone, ShieldAlert, Smartphone, type LucideIcon } from "lucide-react"
import type { TicketCategory } from "../types"

export const categoryIcons: Record<TicketCategory, LucideIcon> = {
  account: KeyRound, gold: Coins, ads: Megaphone, verification: BadgeCheck, safety: ShieldAlert, app: Smartphone,
}
