import assert from 'node:assert/strict'

export const contentApi = /\/api\/v1\/(user-content|platform-users)(\/|$|\?)/
// 1x1 PNG so thumbnails render without network access.
const pixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
export const imageRoute = route => route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from(pixel.split(',')[1], 'base64') })

/** In-memory User Content API: posts, ads, surveys and both report queues, with moderation writes. */
export function createContentMock() {
  const uploaders = ['Ama Mensah', 'Kofi Boateng'].map((fullName, index) => ({
    id: `60000000-0000-4000-8000-00000000000${index + 1}`, isActive: true,
    userProfile: { fullName, username: fullName.split(' ')[0].toLowerCase(), email: `${fullName.split(' ')[0].toLowerCase()}@example.com`, image: null },
  }))
  const posts = Array.from({ length: 30 }, (_, index) => ({
    id: `80000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
    title: index === 0 ? 'Campus tour' : `Upload ${index + 1}`, description: 'A post', mediaType: ['VIDEO', 'IMAGE', 'TEXT'][index % 3],
    status: 'PUBLIC', deleteStatus: 'ACTIVE', publicSlug: null,
    createdAt: new Date(Date.UTC(2026, 9, 1, 0, 0, 0) - index * 3600_000).toISOString(), updatedAt: '2026-10-01T00:00:00.000Z',
    user: uploaders[index % 2],
    imgResources: index % 3 === 1 ? [{ id: `81000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, imageUrl: 'https://cdn.example.com/i.jpg', previewImageUrl: null, width: 1, height: 1 }] : [],
    videoResource: index % 3 === 0 ? { hlsUrl: 'https://cdn.example.com/v.m3u8', mp4Url: 'https://cdn.example.com/v.mp4', duration: 95, size: 1024, resolution: '720p', uploadStatus: 'UPLOADED', transcodingStatus: 'COMPLETED', thumbnail: { imageUrl: 'https://cdn.example.com/t.jpg', previewImageUrl: null } } : null,
    _count: { likes: 4, comments: 1, views: 1200, shares: 0, surveys: 0 },
  }))
  const surveys = [{ id: 'a0000000-0000-4000-8000-000000000001', title: 'Cafeteria feedback', description: 'Two quick questions about lunch', isActive: true, coverImageUrl: null, estimatedMinutes: 2, createdAt: '2026-09-29T00:00:00.000Z', updatedAt: '2026-09-29T00:00:00.000Z', resource: { id: posts[0].id, title: 'Campus tour', deleteStatus: 'ACTIVE', user: uploaders[0] }, _count: { questions: 3, responses: 12 } }]
  const now = Date.now()
  const ads = [
    { id: '90000000-0000-4000-8000-000000000001', type: 'EVENT', name: "Freshers' night", goal: 'REACH', audience: 'STUDENTS', dailyBudgetGhs: 50, durationDays: 7, costBars: 3500, refundedBars: 0, status: 'ACTIVE', startsAt: new Date(now - 2 * 86_400_000).toISOString(), endsAt: new Date(now + 5 * 86_400_000).toISOString(), cancelledAt: null, content: { headline: 'Big night', eventLocation: 'Great Hall' }, createdAt: '2026-09-30T00:00:00.000Z', updatedAt: '2026-09-30T00:00:00.000Z', user: uploaders[1], resource: null },
    { id: '90000000-0000-4000-8000-000000000002', type: 'IMAGE', name: 'Hostel deals', goal: 'TRAFFIC', audience: 'EVERYONE', dailyBudgetGhs: 20, durationDays: 3, costBars: 600, refundedBars: 0, status: 'PENDING_REVIEW', startsAt: '2026-11-01T00:00:00.000Z', endsAt: '2026-11-04T00:00:00.000Z', cancelledAt: null, content: { headline: 'Rooms from GH₵800', imageUrls: ['https://cdn.example.com/a.jpg'] }, createdAt: '2026-10-20T00:00:00.000Z', updatedAt: '2026-10-20T00:00:00.000Z', user: uploaders[0], resource: null },
  ]
  const reporter = { id: uploaders[1].id, userProfile: { fullName: 'Kofi Boateng', username: 'kofi' } }
  const reports = [
    { id: 'b0000000-0000-4000-8000-000000000001', targetType: 'POST', targetId: posts[3].id, resourceId: posts[3].id, reason: 'HARASSMENT', details: 'Targets a classmate by name', status: 'OPEN', reporter, createdAt: '2026-10-20T09:00:00.000Z', resolvedAt: null, resolvedByAdminId: null, resolutionNote: null },
    { id: 'b0000000-0000-4000-8000-000000000002', targetType: 'COMMENT', targetId: 'b1000000-0000-4000-8000-000000000001', resourceId: posts[0].id, reason: 'SPAM', details: null, status: 'OPEN', reporter, createdAt: '2026-10-22T09:00:00.000Z', resolvedAt: null, resolvedByAdminId: null, resolutionNote: null },
  ]
  const chatReports = [{ id: 'c0000000-0000-4000-8000-000000000001', targetType: 'MESSAGE', targetId: '6650f0c2a1b2c3d4e5f60002', conversationId: '6650f0c2a1b2c3d4e5f60000', reason: 'SCAM', details: 'Asked for my MoMo PIN', status: 'OPEN', reporter: { ...reporter, isActive: true }, reportedUserId: uploaders[0].id, createdAt: '2026-10-23T09:00:00.000Z', resolvedAt: null, resolutionNote: null }]
  const snapshot = {
    reported: { id: '6650f0c2a1b2c3d4e5f60002', seq: 3, senderId: uploaders[0].id, kind: 'TEXT', text: 'Send your PIN and the prize is yours', attachments: [], postId: null, createdAt: '2026-10-23T08:59:00.000Z', editedAt: null, deletedAt: null },
    before: [
      { id: '6650f0c2a1b2c3d4e5f60000', seq: 1, senderId: uploaders[0].id, kind: 'TEXT', text: 'You won the AdBox raffle!', attachments: [], postId: null, createdAt: '2026-10-23T08:57:00.000Z', editedAt: null, deletedAt: null },
      { id: '6650f0c2a1b2c3d4e5f60001', seq: 2, senderId: uploaders[1].id, kind: 'TEXT', text: 'Really? What do I need to do?', attachments: [], postId: null, createdAt: '2026-10-23T08:58:00.000Z', editedAt: null, deletedAt: null },
    ],
  }
  const state = { posts, surveys, ads, reports, chatReports, uploaders, resolutions: [] }

  const route = async route => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname.replace('/api/v1', '')
    const method = request.method()
    const query = Object.fromEntries(url.searchParams)
    const reply = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) })
    const pageOf = (items) => {
      const pageNumber = Number(query.page ?? 1)
      const limit = Number(query.limit ?? 20)
      return { items: items.slice((pageNumber - 1) * limit, pageNumber * limit), total: items.length, page: pageNumber, limit }
    }
    const byUser = (owner) => !query.userId || owner.id === query.userId
    const live = (post) => (query.state === 'removed') === (post.deleteStatus === 'DELETED')
    const reportStatus = (report) => report.status === (query.status ?? 'OPEN') && (!query.reason || report.reason === query.reason)
    assert.ok(request.headers().authorization?.startsWith('Bearer '), 'Content requests must carry the session token')
    if (method === 'GET' && path === '/user-content/summary') {
      const mine = posts.filter(post => byUser(post.user))
      const count = (type) => mine.filter(post => post.mediaType === type && post.deleteStatus === 'ACTIVE').length
      return reply({ videos: count('VIDEO'), images: count('IMAGE'), text: count('TEXT'), removedPosts: mine.filter(post => post.deleteStatus === 'DELETED').length, ads: ads.filter(ad => byUser(ad.user)).length, activeAds: 1, surveys: 1, activeSurveys: surveys.filter(survey => survey.isActive).length })
    }
    if (method === 'GET' && path === '/user-content/uploaders') return reply(uploaders.map(user => ({ user, posts: 15, videos: 5, images: 5, text: 5 })))
    if (method === 'GET' && path === '/user-content/posts') return reply(pageOf(posts.filter(post => (!query.mediaType || post.mediaType === query.mediaType) && byUser(post.user) && live(post))))
    if (method === 'GET' && path.startsWith('/user-content/posts/')) return reply(posts.find(entry => path.endsWith(entry.id)) ?? { message: 'Post not found' }, posts.some(entry => path.endsWith(entry.id)) ? 200 : 404)
    if (method === 'POST' && path.startsWith('/user-content/posts/')) {
      const post = posts.find(entry => path.includes(entry.id))
      assert.ok(post, 'Moderation must address a real post')
      if (path.endsWith('/remove')) { assert.deepEqual(request.postDataJSON(), { reason: 'Spam' }); post.deleteStatus = 'DELETED' }
      if (path.endsWith('/restore')) post.deleteStatus = 'ACTIVE'
      return reply(post)
    }
    if (method === 'GET' && path === '/user-content/ads') return reply(pageOf(ads.filter(ad => byUser(ad.user) && (!query.status || ad.status === query.status))))
    if (method === 'GET' && path === '/user-content/surveys') return reply(pageOf(surveys.filter(survey => byUser(survey.resource.user))))
    if (method === 'POST' && path.startsWith('/user-content/surveys/')) {
      surveys[0].isActive = path.endsWith('/reactivate')
      return reply(surveys[0])
    }
    if (method === 'GET' && path === '/user-content/reports') return reply(pageOf(reports.filter(reportStatus).map(report => ({ ...report, openReportsOnTarget: report.status === 'OPEN' ? 1 : 0 }))))
    if (method === 'GET' && path === '/user-content/chat-reports') return reply(pageOf(chatReports.filter(reportStatus).map(report => ({ ...report, reportedUser: uploaders[0] }))))
    const contentDetail = (report) => ({
      ...report,
      target: report.targetType === 'POST'
        ? { type: 'POST', post: { ...posts.find(post => post.id === report.targetId), user: { id: uploaders[1].id, userProfile: { fullName: 'Kofi Boateng', username: 'kofi' } } } }
        : { type: 'COMMENT', comment: { id: report.targetId, resourceId: report.resourceId, commentText: 'Buy followers cheap at spam.example', deletedAt: null, deletedBy: null, createdAt: '2026-10-21T09:00:00.000Z', user: { id: uploaders[0].id, userProfile: { fullName: 'Ama Mensah', username: 'ama' } } } },
      otherReports: [],
    })
    const chatDetail = (report) => ({ ...report, snapshot, reportedUser: uploaders[0], openReportsAgainstUser: 1, otherReports: [] })
    const reportMatch = (list) => list.find(report => path.includes(report.id))
    if (path.startsWith('/user-content/reports/')) {
      const report = reportMatch(reports)
      if (method === 'POST') {
        state.resolutions.push({ id: report.id, body: request.postDataJSON() })
        Object.assign(report, { status: request.postDataJSON().outcome, resolvedAt: new Date().toISOString(), resolutionNote: request.postDataJSON().note ?? null })
        if (request.postDataJSON().removeContent) posts.find(post => post.id === report.targetId).deleteStatus = 'DELETED'
      }
      return reply(contentDetail(report))
    }
    if (path.startsWith('/user-content/chat-reports/')) {
      const report = reportMatch(chatReports)
      if (method === 'POST') Object.assign(report, { status: request.postDataJSON().outcome, resolvedAt: new Date().toISOString() })
      return reply(chatDetail(report))
    }
    if (method === 'GET' && path.startsWith('/platform-users/')) return reply(uploaders.find(user => path.endsWith(user.id)))
    return reply({ message: 'Unexpected ' + method + ' ' + path }, 500)
  }
  return { route, state }
}

export async function checkUserContent(page, baseUrl) {
  const { route, state } = createContentMock()
  const { posts, surveys, reports, uploaders } = state
  const noOverflow = async (label) => {
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1100 })
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${label} overflows at ${width}`)
    }
    await page.setViewportSize({ width: 1440, height: 1100 })
  }



  // The fake CDN serves a PNG for everything. Hold video requests open instead, so the
  // player keeps its MP4 source rather than failing over while the check runs.
  const heldVideos = []
  const videoRoute = route => { heldVideos.push(route) }
  await page.route(contentApi, route)
  await page.route('https://cdn.example.com/**', imageRoute)
  await page.route('https://cdn.example.com/**/*.mp4', videoRoute)
  await page.setViewportSize({ width: 1440, height: 1100 })
  await page.goto(baseUrl + '/dashboard')
  const group = page.getByRole('navigation', { name: 'Dashboard navigation' }).getByRole('button', { name: 'User Content' })
  await group.click()
  await page.locator('#' + await group.getAttribute('aria-controls')).getByRole('link', { name: 'Overview', exact: true }).click()
  await page.waitForURL('**/user-content')
  await page.getByRole('heading', { name: 'User Content', exact: true }).waitFor()

  // Overview: figures, the moderation queue and top creators.
  await page.getByRole('region', { name: 'Needs attention' }).getByText('3', { exact: true }).waitFor()
  await page.getByRole('link', { name: 'Open Campus tour' }).waitFor()
  await noOverflow('/user-content overview')
  await page.getByRole('link', { name: /Kofi Boateng, 15 posts/ }).click()
  await page.getByRole('region', { name: 'Selected uploader' }).getByText('Kofi Boateng').waitFor()
  assert.ok(page.url().includes('userId=' + uploaders[1].id))
  await page.getByRole('navigation', { name: 'User Content sections' }).getByRole('link', { name: 'Posts' }).click()
  await page.getByText('Showing 1–15 of 15 posts').waitFor()
  await page.getByRole('region', { name: 'Selected uploader' }).getByRole('link', { name: 'Show everyone' }).click()
  await page.getByText('Showing 1–24 of 30 posts').waitFor()

  // Posts: type chips, then a post on its own page with removal and restore.
  await page.getByRole('button', { name: /^Videos/ }).click()
  await page.getByText('Showing 1–10 of 10 videos').waitFor()
  await noOverflow('/user-content/posts')
  await page.getByRole('link', { name: 'Open Campus tour' }).click()
  await page.waitForURL('**/user-content/posts/' + posts[0].id)
  await page.locator('video[src="https://cdn.example.com/v.mp4"]').waitFor()
  await noOverflow('/user-content/posts/:id')
  await page.getByRole('button', { name: 'Remove post' }).click()
  const confirm = page.getByRole('dialog', { name: 'Remove this post?' })
  await confirm.getByLabel(/Reason/).fill('Spam')
  await confirm.getByRole('button', { name: 'Remove post' }).click()
  await page.getByText('This post is hidden from AdBox').waitFor()
  assert.equal(posts[0].deleteStatus, 'DELETED')
  await page.getByRole('button', { name: 'Restore post' }).click()
  await page.getByRole('dialog', { name: 'Restore this post?' }).getByRole('button', { name: 'Restore post' }).click()
  await page.getByRole('button', { name: 'Remove post' }).waitFor()
  assert.equal(posts[0].deleteStatus, 'ACTIVE')
  await page.getByRole('link', { name: 'Back' }).click()
  await page.getByText('Showing 1–10 of 10 videos').waitFor()
  assert.ok(page.url().endsWith('/user-content/posts?type=VIDEO'))

  // Ads and surveys.
  await page.getByRole('navigation', { name: 'User Content sections' }).getByRole('link', { name: 'Ads' }).click()
  await page.getByRole('button', { name: "Freshers' night" }).click()
  await page.getByRole('dialog', { name: "Freshers' night" }).getByText('Great Hall').waitFor()
  await page.keyboard.press('Escape')
  await noOverflow('/user-content/ads')
  await page.getByRole('navigation', { name: 'User Content sections' }).getByRole('link', { name: 'Surveys' }).click()
  await page.getByRole('button', { name: 'Deactivate' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Deactivate survey' }).click()
  await page.getByRole('button', { name: 'Reactivate' }).waitFor()
  assert.equal(surveys[0].isActive, false)

  // Reports: resolve a reported post by removing it, then check a message report.
  await page.getByRole('navigation', { name: 'User Content sections' }).getByRole('link', { name: /Reports/ }).click()
  await page.getByRole('link', { name: 'Post reported by Kofi Boateng' }).click()
  await page.getByText('“Targets a classmate by name”').waitFor()
  await noOverflow('/user-content/reports/:id')
  await page.getByRole('button', { name: 'Remove post and resolve' }).click()
  await page.getByRole('heading', { name: 'Decision' }).waitFor()
  assert.deepEqual(state.resolutions[0], { id: reports[0].id, body: { outcome: 'ACTION_TAKEN', removeContent: true } })
  assert.equal(posts[3].deleteStatus, 'DELETED')
  await page.getByRole('link', { name: 'Report queue' }).click()
  await page.getByRole('link', { name: 'Comment reported by Kofi Boateng' }).waitFor()
  await page.getByRole('radio', { name: /Messages/ }).click()
  await page.getByRole('link', { name: /Message from Ama Mensah/ }).click()
  await page.getByRole('list', { name: 'Messages' }).getByText('Send your PIN and the prize is yours').waitFor()
  await noOverflow('/user-content/reports/messages/:id')

  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.unroute(contentApi, route)
  await page.unroute('https://cdn.example.com/**', imageRoute)
  await page.unroute('https://cdn.example.com/**/*.mp4', videoRoute)
  await Promise.all(heldVideos.map(held => held.abort().catch(() => {})))
  console.log('User Content: sections, overview, uploader scope, posts library and detail page with removal/restore, ads sheet, survey deactivation, report resolution, message report transcript, and responsive layouts passed')
}
