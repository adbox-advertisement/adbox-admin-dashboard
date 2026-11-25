import { useCallback } from "react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCurrentAdmin } from "@/features/auth"
import { hasPermission } from "@/lib/permissions"
import {
  checkStudioUsername,
  completeImageUpload,
  createImageUploadIntent,
  createStudioAccount,
  createStudioGroup,
  getInstitutionDirectory,
  getStudioAccount,
  getStudioAccounts,
  getStudioGroup,
  getStudioGroups,
  getStudioPosts,
  getStudioSummary,
  openStudioSession,
  setStudioAccountArchived,
  setStudioGroupArchived,
  updateStudioAccount,
  updateStudioGroup,
  type StudioAccountQuery,
  type StudioGroupQuery,
} from "./api"
import { createAppClient } from "./app-client"
import { readImageSize } from "./lib/media"
import { publishPost, type PostDraft, type PublishProgress } from "./lib/publish"
import { putWithProgress, sha256Hex } from "./lib/upload"
import { STUDIO_PERMISSIONS, type StudioAccountInput, type StudioAccountUpdate, type StudioGroupInput, type StudioGroupUpdate, type StudioPostQuery, type StudioSession } from "./types"

const keys = {
  all: ["videos"] as const,
  summary: ["videos", "summary"] as const,
  accounts: (query: StudioAccountQuery) => ["videos", "accounts", query] as const,
  account: (id: string) => ["videos", "account", id] as const,
  groups: (query: StudioGroupQuery) => ["videos", "groups", query] as const,
  group: (id: string) => ["videos", "group", id] as const,
  posts: (query: StudioPostQuery) => ["videos", "posts", query] as const,
  session: (accountId: string) => ["videos", "session", accountId] as const,
}

/** What this admin may do in the studio. The backend decides; this only hides what would be refused. */
export function useStudioAccess() {
  const admin = useCurrentAdmin()
  const granted = admin.data?.permissions ?? []
  const can = (permission: string) => hasPermission(granted, permission)
  return {
    loading: admin.isPending,
    adminId: admin.data?.id ?? null,
    read: can(STUDIO_PERMISSIONS.read),
    manageAccounts: can(STUDIO_PERMISSIONS.manageAccounts),
    post: can(STUDIO_PERMISSIONS.post),
    manageGroups: can(STUDIO_PERMISSIONS.manageGroups),
    uploadImages: can(STUDIO_PERMISSIONS.uploadImages),
    institutions: can(STUDIO_PERMISSIONS.institutions),
  }
}
export type StudioAccess = ReturnType<typeof useStudioAccess>

const STALE_MS = 30_000

export function useStudioSummary(enabled = true) {
  return useQuery({ queryKey: keys.summary, queryFn: ({ signal }) => getStudioSummary(signal), enabled, staleTime: STALE_MS })
}

export function useStudioAccounts(query: StudioAccountQuery, enabled = true) {
  return useQuery({ queryKey: keys.accounts(query), queryFn: ({ signal }) => getStudioAccounts(query, signal), enabled, staleTime: STALE_MS, placeholderData: keepPreviousData })
}

export function useStudioAccount(id: string | undefined, enabled = true) {
  return useQuery({ queryKey: keys.account(id ?? ""), queryFn: ({ signal }) => getStudioAccount(id as string, signal), enabled: enabled && Boolean(id), staleTime: STALE_MS })
}

export function useUsernameCheck(username: string, enabled = true) {
  return useQuery({
    queryKey: ["videos", "username", username],
    queryFn: ({ signal }) => checkStudioUsername(username, signal),
    enabled: enabled && username.length >= 3,
    staleTime: 10_000,
  })
}

export function useStudioGroups(query: StudioGroupQuery, enabled = true) {
  return useQuery({ queryKey: keys.groups(query), queryFn: ({ signal }) => getStudioGroups(query, signal), enabled, staleTime: STALE_MS, placeholderData: keepPreviousData })
}

export function useStudioGroup(id: string | undefined, enabled = true) {
  return useQuery({ queryKey: keys.group(id ?? ""), queryFn: ({ signal }) => getStudioGroup(id as string, signal), enabled: enabled && Boolean(id), staleTime: STALE_MS })
}

export function useStudioPosts(query: StudioPostQuery, enabled = true) {
  return useQuery({ queryKey: keys.posts(query), queryFn: ({ signal }) => getStudioPosts(query, signal), enabled, staleTime: STALE_MS, placeholderData: keepPreviousData })
}

/** Every institution with its campuses and halls; it changes rarely. */
export function useInstitutionDirectory(enabled = true) {
  return useQuery({ queryKey: ["videos", "institutions"], queryFn: ({ signal }) => getInstitutionDirectory(signal), enabled, staleTime: 10 * 60_000 })
}

/** After any studio write, everything the studio shows is read again. */
function useStudioWrite<TInput, TResult>(write: (input: TInput) => Promise<TResult>) {
  const client = useQueryClient()
  return useMutation({ mutationFn: write, onSettled: () => client.invalidateQueries({ queryKey: keys.all }) })
}

export const useCreateAccount = () => useStudioWrite((input: StudioAccountInput) => createStudioAccount(input))
export const useUpdateAccount = () => useStudioWrite(({ id, input }: { id: string; input: StudioAccountUpdate }) => updateStudioAccount(id, input))
export const useSetAccountArchived = () => useStudioWrite(({ id, archived }: { id: string; archived: boolean }) => setStudioAccountArchived(id, archived))
export const useCreateGroup = () => useStudioWrite((input: StudioGroupInput) => createStudioGroup(input))
export const useUpdateGroup = () => useStudioWrite(({ id, input }: { id: string; input: StudioGroupUpdate }) => updateStudioGroup(id, input))
export const useSetGroupArchived = () => useStudioWrite(({ id, archived }: { id: string; archived: boolean }) => setStudioGroupArchived(id, archived))

/** Uploads a photo or cover to the media library and returns its web address. */
export function useUploadImage() {
  return useMutation({
    mutationFn: async ({ file, onProgress }: { file: File; onProgress?: (fraction: number) => void }) => {
      const [sha256, size] = await Promise.all([sha256Hex(file), readImageSize(file)])
      const intent = await createImageUploadIntent({ name: file.name, type: file.type, size: file.size, sha256 })
      await putWithProgress(intent.upload.url, file, { headers: intent.upload.headers, onProgress: (sent) => onProgress?.(sent / file.size) })
      const asset = await completeImageUpload(intent.asset.id, size)
      if (asset.status !== "READY" || !asset.publicUrl) throw new Error("The picture didn't finish uploading. Try again.")
      return asset.publicUrl
    },
  })
}

// A studio session lasts an hour; it is reused until five minutes are left, and kept in memory only.
const SESSION_MARGIN_MS = 5 * 60_000

/** An app client acting as the account, opening (and auditing) a session when needed. */
export function useAccountClient() {
  const client = useQueryClient()
  return useCallback(async (accountId: string) => {
    const cached = client.getQueryData<StudioSession>(keys.session(accountId))
    const usable = cached && Date.parse(cached.expiresAt) - Date.now() > SESSION_MARGIN_MS
    const session = usable ? cached : await openStudioSession(accountId)
    if (!usable) client.setQueryData(keys.session(accountId), session)
    return createAppClient(session)
  }, [client])
}

/** Posts as a studio account: text, pictures, a video or a Short. */
export function usePublishPost() {
  const client = useQueryClient()
  const accountClient = useAccountClient()
  return useMutation({
    mutationFn: async ({ accountId, draft, onProgress }: { accountId: string; draft: PostDraft; onProgress: (progress: PublishProgress) => void }) =>
      publishPost(await accountClient(accountId), draft, onProgress),
    onSettled: () => client.invalidateQueries({ queryKey: keys.all, predicate: (query) => query.queryKey[1] !== "session" }),
  })
}
