import { superAdminApi } from "@/api/client"
import type {
  CmsPageResponse,
  CmsSiteResponse,
  CmsSnapshot,
} from "@/features/rdi/cms-types"
import { editorPageToCms, editorSettingsToCms } from "@/features/rdi/mappers"
import type { RdiPageContent, RdiSiteSettings } from "@/features/rdi/types"

const requestIdentity = (scope: string) => {
  const id = crypto.randomUUID()
  return { requestId: id, idempotencyKey: `rdi-${scope}-${id}` }
}

const mutationHeaders = (version: number, idempotencyKey: string, requestId: string) => ({
  "If-Match": `"draft:${version}"`,
  "Idempotency-Key": idempotencyKey,
  "X-Request-Id": requestId,
})

export async function loadRdiCms(): Promise<CmsSnapshot> {
  const [site, pages] = await Promise.all([
    superAdminApi.get<CmsSiteResponse>("/cms/sites/rdi", { params: { view: "draft" } }),
    superAdminApi.get<CmsPageResponse[]>("/cms/sites/rdi/pages", {
      params: { view: "draft" },
    }),
  ])

  console.log("Loaded RDI CMS data:", { site: site.data, pages: pages.data })
  return { site: site.data, pages: pages.data }
}

export async function saveRdiPage(current: CmsPageResponse, page: RdiPageContent) {
  const nextContent = editorPageToCms(page, current)
  const identity = requestIdentity(`page-${current.key}`)
  const { data } = await superAdminApi.patch<CmsPageResponse>(
    `/cms/sites/rdi/pages/${current.key}/draft`,
    {
      baseVersion: current.version,
      idempotencyKey: identity.idempotencyKey,
      changeSummary: `Update ${current.navigationLabel} page from the Adbox dashboard`,
      operations: [
        { op: "test", path: "/blocks", value: current.content.blocks },
        { op: "replace", path: "/blocks", value: nextContent.blocks },
      ],
    },
    { headers: mutationHeaders(current.version, identity.idempotencyKey, identity.requestId) },
  )
  return data
}

export async function saveRdiSettings(current: CmsSiteResponse, settings: RdiSiteSettings) {
  const next = editorSettingsToCms(settings, current)
  const identity = requestIdentity("site-settings")
  const { data } = await superAdminApi.patch<CmsSiteResponse>(
    "/cms/sites/rdi/draft",
    {
      baseVersion: current.version,
      idempotencyKey: identity.idempotencyKey,
      changeSummary: "Update RDI site settings from the Adbox dashboard",
      operations: [
        { op: "test", path: "/branding", value: current.settings.branding },
        { op: "replace", path: "/branding", value: next.branding },
        { op: "test", path: "/footer", value: current.settings.footer },
        { op: "replace", path: "/footer", value: next.footer },
      ],
    },
    { headers: mutationHeaders(current.version, identity.idempotencyKey, identity.requestId) },
  )
  return data
}

async function publish(path: string, version: number) {
  const identity = requestIdentity("publish")
  const { data } = await superAdminApi.post(
    path,
    { baseVersion: version, idempotencyKey: identity.idempotencyKey },
    { headers: mutationHeaders(version, identity.idempotencyKey, identity.requestId) },
  )
  return data
}

export const publishRdiPage = (pageKey: string, version: number) =>
  publish(`/cms/sites/rdi/pages/${pageKey}/publish`, version)

export const publishRdiSettings = (version: number) =>
  publish("/cms/sites/rdi/publish", version)

export async function uploadRdiAsset(
  file: File,
  kind: "image" | "video",
  alt: string,
) {
  const hash = await crypto.subtle.digest("SHA-256", await file.arrayBuffer())
  const sha256 = [...new Uint8Array(hash)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")
  const identity = requestIdentity("asset")
  const intent = await superAdminApi.post<{
    asset: { _id: string; storage: { publicUrl: string } }
    upload: { url: string; headers: Record<string, string> }
  }>(
    "/cms/assets/upload-intents",
    {
      siteKey: "rdi",
      kind,
      fileName: file.name,
      mimeType: file.type,
      byteSize: file.size,
      sha256,
      alt,
      idempotencyKey: identity.idempotencyKey,
    },
    {
      headers: {
        "Idempotency-Key": identity.idempotencyKey,
        "X-Request-Id": identity.requestId,
      },
    },
  )
  const upload = await fetch(intent.data.upload.url, {
    method: "PUT",
    headers: intent.data.upload.headers,
    body: file,
  })
  if (!upload.ok) throw new Error("Object-storage upload failed")
  const completed = await superAdminApi.post<{
    _id: string
    storage: { publicUrl: string }
  }>(
    `/cms/assets/${intent.data.asset._id}/complete`,
    {},
    { headers: { "X-Request-Id": identity.requestId } },
  )
  return {
    assetId: completed.data._id,
    url: completed.data.storage.publicUrl,
  }
}

