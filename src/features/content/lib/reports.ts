import { FileText, MessageCircle, MessageSquare, MessagesSquare, type LucideIcon } from "lucide-react"
import { urgentReasons, type ReportReason } from "../types"

export const reportTargetIcons: Record<"POST" | "COMMENT" | "MESSAGE" | "CONVERSATION", LucideIcon> = {
  POST: FileText, COMMENT: MessageCircle, MESSAGE: MessageSquare, CONVERSATION: MessagesSquare,
}
export const reportTargetLabels = { POST: "Post", COMMENT: "Comment", MESSAGE: "Message", CONVERSATION: "Conversation" } as const

export const isUrgent = (reason: ReportReason | null) => Boolean(reason && urgentReasons.has(reason))
