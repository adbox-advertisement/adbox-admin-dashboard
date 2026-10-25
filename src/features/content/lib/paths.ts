import { APP_ROUTES } from "@/routes/paths"

export const postPath = (id: string) => `${APP_ROUTES.userContentPosts}/${encodeURIComponent(id)}`
export const contentReportPath = (id: string) => `${APP_ROUTES.userContentReports}/${encodeURIComponent(id)}`
export const chatReportPath = (id: string) => `${APP_ROUTES.userContentReports}/messages/${encodeURIComponent(id)}`
export const profilePath = (id: string) => `${APP_ROUTES.manageUsersPeople}/${encodeURIComponent(id)}`

/** A section link that keeps the selected uploader, plus any filters, in the query string. */
export function contentPath(path: string, params: Record<string, string | undefined> = {}) {
  const query = new URLSearchParams(Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1]))).toString()
  return query ? `${path}?${query}` : path
}

// Before the redesign every list lived on one page as `?tab=`; old links land on the matching section.
const legacyTabs: Record<string, { path: string; type?: string }> = {
  videos: { path: APP_ROUTES.userContentPosts, type: "VIDEO" },
  pictures: { path: APP_ROUTES.userContentPosts, type: "IMAGE" },
  text: { path: APP_ROUTES.userContentPosts, type: "TEXT" },
  ads: { path: APP_ROUTES.userContentAds },
  surveys: { path: APP_ROUTES.userContentSurveys },
}

export function legacyTabPath(tab: string | null, userId: string | undefined) {
  const target = tab ? legacyTabs[tab] : undefined
  return target ? contentPath(target.path, { type: target.type, userId }) : null
}
