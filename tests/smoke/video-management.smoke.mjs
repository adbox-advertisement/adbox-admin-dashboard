import assert from 'node:assert/strict'
import { dashboardInstitutions } from './dashboard.smoke.mjs'

// Video Management is the studio (src/features/videos): accounts admins post from, groups tied
// together by a hashtag, and everything posted from them. Its reads are canned here for every
// check (app.smoke.mjs); its writes, and posting through the app's own API, are routed below.

const smokeAdmin = { id: '30000000-0000-4000-8000-000000000001', name: 'Adison Cole', email: 'admin@example.com' }
const ug = { id: 'i-ug', name: 'University of Ghana', shortName: 'UG' }
const createdAt = '2026-11-10T10:00:00.000Z'
const studioAccount = {
  id: 'acc-1', username: 'legon.hallweek', fullName: 'Legon Hall Week', bio: 'Everything at Legon Hall Week.', image: null,
  institution: ug, campus: null, note: 'Runs our hall week coverage.', isActive: true, archivedAt: null, createdAt, createdBy: smokeAdmin,
  counts: { posts: 3, followers: 120 }, lastPostedAt: '2026-11-15T10:00:00.000Z',
}
const studioGroup = {
  id: 'grp-1', name: 'Legon Hall Week', description: 'A week of everything at Legon.', hashtag: 'LegonHallWeek', hashtagKey: 'legonhallweek',
  institution: ug, campus: null, hall: null, startsAt: '2026-11-14T00:00:00.000Z', endsAt: '2026-11-21T23:59:59.000Z', coverUrl: null,
  archivedAt: null, createdAt, createdBy: smokeAdmin, counts: { posts: 12, studioPosts: 4 },
}
const studioPost = {
  id: 'post-1', type: 'VIDEO', caption: 'Opening night #LegonHallWeek', status: 'PUBLIC', createdAt, isShort: true,
  account: { id: 'acc-1', username: 'legon.hallweek', fullName: 'Legon Hall Week', image: null }, postedBy: smokeAdmin, cover: null, imageCount: 0,
  video: { duration: 42, aspectRatio: 0.5625, transcodingStatus: 'COMPLETED' }, counts: { likes: 10, comments: 2, views: 300 },
  groups: [{ id: 'grp-1', name: 'Legon Hall Week', hashtag: 'LegonHallWeek' }],
}
const studioPage = (items) => ({ items, total: items.length, page: 1, limit: 24 })

/** The studio's reads, or undefined. */
export function studioReply(method, pathname, search = '') {
  const path = pathname.replace(/^\/api\/v1/, '')
  if (method !== 'GET' || !path.startsWith('/studio/')) return undefined
  if (path === '/studio/summary') {
    return { accounts: { active: 1, archived: 0 }, groups: { active: 1 }, posts: { total: 3, last7Days: 2, text: 1, pictures: 1, videos: 1, shorts: 1 }, topAdmins: [{ admin: smokeAdmin, posts: 3 }] }
  }
  if (path === '/studio/accounts/username-available') {
    const username = new URLSearchParams(search).get('username') ?? ''
    const taken = username === studioAccount.username
    return { username, available: !taken, reason: taken ? 'That username is taken.' : null }
  }
  if (path === '/studio/accounts') return studioPage([studioAccount])
  if (path === `/studio/accounts/${studioAccount.id}`) return studioAccount
  if (path === '/studio/groups') return studioPage([studioGroup])
  if (path === `/studio/groups/${studioGroup.id}`) return studioGroup
  if (path === '/studio/posts') return studioPage([studioPost])
  return undefined
}

export async function checkVideoManagement(page, baseUrl) {
  await page.setViewportSize({ width: 1440, height: 1000 })
  const gateway = baseUrl + '/smoke-gateway/api/v1'
  const writes = []
  const appRequests = []
  const json = (route, data, status = 201) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) })
  await page.route('**/api/v1/studio/**', async route => {
    const request = route.request()
    if (request.method() === 'GET') return route.fallback()
    const path = new URL(request.url()).pathname.replace(/^\/api\/v1/, '')
    const body = request.postDataJSON()
    writes.push({ method: request.method(), path, body })
    if (path === '/studio/accounts') return json(route, { ...studioAccount, id: 'acc-2', username: body.username, fullName: body.fullName, note: null, counts: { posts: 0, followers: 0 }, lastPostedAt: null })
    if (path === '/studio/groups') return json(route, { ...studioGroup, id: 'grp-2', name: body.name, hashtag: body.hashtag, hashtagKey: body.hashtag.toLowerCase(), counts: { posts: 0, studioPosts: 0 } })
    if (path === `/studio/accounts/${studioAccount.id}/session`) {
      return json(route, { accessToken: 'studio-app-token', sessionId: 'studio-session', expiresAt: new Date(Date.now() + 3_600_000).toISOString(), apiBaseUrl: gateway, account: { id: 'acc-1', username: 'legon.hallweek', fullName: 'Legon Hall Week' } })
    }
    return json(route, { message: 'Unexpected ' + path }, 500)
  })
  // The app's own posting API, answered in the gateway's envelope.
  await page.route(gateway + '/**', async route => {
    const request = route.request()
    appRequests.push({ path: new URL(request.url()).pathname, authorization: request.headers().authorization, body: request.postDataJSON() })
    return json(route, { success: true, statusCode: 201, message: 'Post created', data: { id: 'post-9', type: 'TEXT', caption: request.postDataJSON()?.caption ?? null, visibility: 'PUBLIC', media: [] } })
  })
  // Places for a group: an institution, its campus, the campus's hall.
  await page.route('**/api/v1/institutions', route => json(route, dashboardInstitutions.map(institution => institution.id === 'i-ug'
    ? { ...institution, campuses: [{ id: 'c-legon', name: 'Legon', halls: [{ id: 'h-pentagon', name: 'Pentagon Hall', isActive: true }] }] }
    : { ...institution, campuses: [] }), 200))

  try {
    await page.goto(baseUrl + '/video-management')
    await page.getByRole('heading', { name: 'Make something every campus will talk about.' }).waitFor()
    const studioNav = page.getByRole('navigation', { name: 'Video Management pages' })
    assert.deepEqual((await studioNav.getByRole('link').allTextContents()).map(text => text.trim()), ['Studio', 'Create', 'Accounts', 'Groups', 'Posts'])
    await page.getByRole('button', { name: 'View post: Opening night #LegonHallWeek' }).waitFor()
    // Whoever posted lately leads to their posts.
    assert.equal(await page.getByRole('link', { name: 'Adison Cole: 3 posts. See them' }).getAttribute('href'), '/video-management/posts?admin=' + smokeAdmin.id)

    // An account: its username follows its name, and a taken one is refused as it's typed.
    await page.goto(baseUrl + '/video-management/accounts')
    await page.getByRole('article', { name: 'Legon Hall Week' }).getByText('Made by Adison Cole', { exact: false }).waitFor()
    await page.getByRole('button', { name: 'New account' }).first().click()
    const accountDialog = page.getByRole('dialog', { name: 'New account' })
    await accountDialog.getByLabel('Name', { exact: true }).fill('Legon Hall Week')
    assert.equal(await accountDialog.getByLabel('Username').inputValue(), 'legon.hallweek')
    await accountDialog.getByText('That username is taken.').waitFor()
    assert.equal(await accountDialog.getByRole('button', { name: 'Create account' }).isDisabled(), true)
    await accountDialog.getByLabel('Username').fill('legon.hallweek26')
    await accountDialog.getByText('@legon.hallweek26 is free').waitFor()
    await accountDialog.getByRole('button', { name: 'Create account' }).click()
    await accountDialog.waitFor({ state: 'hidden' })
    assert.deepEqual(writes.shift(), { method: 'POST', path: '/studio/accounts', body: { fullName: 'Legon Hall Week', username: 'legon.hallweek26' } })

    // Any of the institutions, found by typing a region.
    const knust = page.waitForRequest(request => request.url().includes('/studio/accounts?') && new URL(request.url()).searchParams.get('institutionId') === 'i-knust')
    await page.getByRole('button', { name: 'Institution', exact: true }).click()
    await page.getByRole('combobox', { name: 'Search institution' }).fill('ashanti')
    await page.getByRole('option', { name: /^KNUST/ }).click()
    await page.getByRole('button', { name: 'Institution: KNUST' }).waitFor()
    await knust

    // A group: its hashtag follows its name; its place goes institution, campus, hall.
    await page.goto(baseUrl + '/video-management/groups')
    await page.getByRole('article', { name: 'Legon Hall Week' }).getByText('#LegonHallWeek').first().waitFor()
    await page.getByRole('button', { name: 'New group' }).first().click()
    const groupDialog = page.getByRole('dialog', { name: 'New group' })
    await groupDialog.getByLabel('Name', { exact: true }).fill('Pent Hall Week')
    assert.equal(await groupDialog.getByLabel('Hashtag').inputValue(), 'PentHallWeek')
    await groupDialog.getByRole('button', { name: 'Institution', exact: true }).click()
    await page.getByRole('combobox', { name: 'Search institution' }).fill('UG')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await groupDialog.getByRole('combobox', { name: 'Campus' }).click()
    await page.getByRole('option', { name: 'Legon', exact: true }).click()
    await groupDialog.getByRole('combobox', { name: 'Hall' }).click()
    await page.getByRole('option', { name: 'Pentagon Hall', exact: true }).click()
    await groupDialog.getByLabel(/^Starts/).fill('2026-11-20')
    await groupDialog.getByLabel(/^Ends/).fill('2026-11-27')
    await groupDialog.getByRole('button', { name: 'Create group' }).click()
    await groupDialog.waitFor({ state: 'hidden' })
    const group = writes.shift()
    assert.equal(group.path, '/studio/groups')
    assert.deepEqual({ ...group.body, startsAt: undefined, endsAt: undefined }, { name: 'Pent Hall Week', hashtag: 'PentHallWeek', institutionId: 'i-ug', campusId: 'c-legon', hallId: 'h-pentagon', startsAt: undefined, endsAt: undefined })
    assert.ok(group.body.startsAt < group.body.endsAt, 'a group ends after it starts')

    // Posting words as the account, in the group, through the app's own API with a studio session.
    await page.goto(baseUrl + '/video-management/upload?group=grp-1')
    await page.getByRole('heading', { name: 'Make a post' }).waitFor()
    assert.equal(await page.getByRole('radio', { name: /Legon Hall Week/ }).isChecked(), true)
    await page.getByText('is added at the end of the caption.', { exact: false }).waitFor()
    await page.locator('label', { hasText: 'Words only.' }).click()
    await page.getByLabel('Post text').fill('Opening night is here')
    await page.getByText('Ready: a text from Legon Hall Week.').waitFor()
    await page.getByRole('button', { name: 'Post text' }).click()
    await page.getByRole('heading', { name: 'Posted as Legon Hall Week' }).waitFor()
    assert.deepEqual(writes.shift(), { method: 'POST', path: '/studio/accounts/acc-1/session', body: null })
    assert.equal(appRequests.length, 1)
    assert.equal(appRequests[0].path, '/smoke-gateway/api/v1/resources')
    assert.equal(appRequests[0].authorization, 'Bearer studio-app-token')
    assert.equal(appRequests[0].body.caption, 'Opening night is here\n\n#LegonHallWeek')
    await page.getByText("It's live in the app now.", { exact: false }).waitFor()

    // Everything posted, and who made it.
    await page.goto(baseUrl + '/video-management/posts')
    await page.getByRole('button', { name: /^View post:/ }).first().click()
    const details = page.getByRole('dialog', { name: 'Post details' })
    await details.getByText('Made by Adison Cole (admin@example.com).').waitFor()
    await details.getByRole('button', { name: 'Close post details', exact: true }).click()
    await details.waitFor({ state: 'hidden' })
    await page.getByRole('button', { name: 'Pictures', exact: true }).click()
    await page.waitForURL(/type=IMAGE/)
    assert.deepEqual(writes, [])

    for (const path of ['/video-management', '/video-management/upload', '/video-management/accounts', '/video-management/groups', '/video-management/posts']) {
      await page.goto(baseUrl + path)
      await page.getByRole('navigation', { name: 'Video Management pages' }).waitFor()
      for (const width of [1440, 1024, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 })
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, path + ' overflows at ' + width)
      }
      await page.setViewportSize({ width: 1440, height: 1000 })
    }
  } finally {
    await page.unroute('**/api/v1/studio/**')
    await page.unroute(gateway + '/**')
    await page.unroute('**/api/v1/institutions')
  }
  console.log('Video Management: studio home, accounts (username check), institution search, groups (hashtag, place, dates), posting through the app API, posts and responsive layouts passed')
}
