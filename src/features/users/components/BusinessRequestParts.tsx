import { Building2 } from "lucide-react"
import { cn } from "../lib/cn"
import { safeImageUrl } from "../lib/format"
import { GroupLogo } from "./PageRequestParts"
import { pill } from "./UserBadges"

/** The business's logo when it sent one, its initials otherwise. */
export function BusinessLogo({ name, url, size = "md" }: { name: string; url: string | null; size?: "md" | "lg" }) {
  const src = safeImageUrl(url)
  if (!src) return <GroupLogo name={name} size={size} />
  return <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" className={cn("shrink-0 rounded-full object-cover", size === "lg" ? "size-16" : "size-9")} />
}

/** What every approved business carries after its name: the verified company seal. */
export function CompanySealPill() {
  return <span className={cn(pill, "bg-blue/10 text-blue dark:text-cyan")}><Building2 className="size-3.5" aria-hidden="true" />Verified business</span>
}
