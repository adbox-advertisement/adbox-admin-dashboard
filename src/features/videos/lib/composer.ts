import type { PostType } from "../types"
import { captionProblems, withGroupHashtag } from "./caption"
import type { PostKind } from "./format"
import { isShort, type PreparedImage, type PreparedVideo } from "./media"
import type { PublishProgress } from "./publish"

// The composer's rules, apart from its screens: what the post will say and what stops it.

export type ComposerDraft = {
  accountId: string | null
  type: PostType
  caption: string
  images: PreparedImage[]
  video: PreparedVideo | null
  /** The chosen group's hashtag, added to the caption when posting. */
  groupHashtag: string | null
}

/** The caption as it will be posted: the group's hashtag added at the end. */
export const finalCaption = (draft: Pick<ComposerDraft, "caption" | "groupHashtag">) =>
  draft.groupHashtag ? withGroupHashtag(draft.caption, draft.groupHashtag) : draft.caption

/** Everything that stops the post, in the order to fix it. Empty when it can go. */
export function composerProblems(draft: ComposerDraft) {
  const problems: string[] = []
  if (!draft.accountId) problems.push("Choose an account to post as.")
  if (draft.type === "IMAGE" && draft.images.length === 0) problems.push("Add at least one picture.")
  if (draft.type === "VIDEO" && !draft.video) problems.push("Add a video.")
  problems.push(...captionProblems(draft.caption, { needsText: draft.type === "TEXT", groupHashtag: draft.groupHashtag }))
  return problems
}

/** What the post will be in the app: a portrait video up to 90 seconds is a Short. */
export function draftKind(draft: Pick<ComposerDraft, "type" | "video">): PostKind {
  if (draft.type === "TEXT") return "TEXT"
  if (draft.type === "IMAGE") return "PICTURES"
  return draft.video && isShort(draft.video) ? "SHORT" : "VIDEO"
}

/** The list with one item moved; unchanged when the move falls outside it. */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items
  const next = [...items]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

/** How far along posting is, 0–100: uploading is most of it, by bytes sent. */
export function publishPercent(progress: PublishProgress) {
  if (progress.stage === "creating") return 2
  if (progress.stage === "uploading") return 3 + Math.round((progress.total > 0 ? progress.sent / progress.total : 0) * 92)
  if (progress.stage === "finishing") return 96
  return 99
}
