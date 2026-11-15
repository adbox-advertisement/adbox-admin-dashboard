import assert from 'node:assert/strict'

/** The institution catalogue the dashboard map reads (GET /institutions); app.smoke.mjs serves it. */
export const dashboardInstitutions = [
  { id: 'i-ug', name: 'University of Ghana', shortName: 'UG', type: 'TRADITIONAL_UNIVERSITY', region: 'Greater Accra', town: 'Legon', isActive: true },
  { id: 'i-acce', name: 'Accra College of Education', shortName: 'ACCE', type: 'PUBLIC_COLLEGE_OF_EDUCATION', region: 'Greater Accra', town: 'Accra', isActive: true },
  { id: 'i-knust', name: 'Kwame Nkrumah University of Science and Technology', shortName: 'KNUST', type: 'TRADITIONAL_UNIVERSITY', region: 'Ashanti', town: 'Kumasi', isActive: true },
  { id: 'i-tnmtc', name: 'Tamale Nursing and Midwifery Training College', shortName: 'TNMTC', type: 'PUBLIC_HEALTH_TRAINING', region: 'Northern', town: 'Tamale', isActive: true },
  // A town with no known position: drawn at its region's centre.
  { id: 'i-new', name: 'New Volta College', shortName: 'NVC', type: 'PRIVATE_TERTIARY', region: 'Volta', town: 'Somewhere New', isActive: true },
]

const smokeId = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
const dashboardTrend = (rank) => ({ rank, kind: 'HASHTAG', id: smokeId(rank), title: `#trend${rank}`, category: null,
  metrics: { posts: 30 - rank, participants: 40, window: '24h', label: `${30 - rank} posts today` }, trend: { direction: 'UP', changePct: 20 },
  featured: rank === 1, presentation: null, subject: null })
const dashboardMembers = (total, students) => ({ total, STUDENT: students, ALUMNI: total - students, STAFF: 0, NONE: 0, verified: 0, pending: 0 })

/** Sign-ups for the last `days` days: three a day this month, one a day before. */
function dashboardSignups(days) {
  const now = new Date()
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const points = Array.from({ length: days }, (_, index) => {
    const ago = days - 1 - index
    return { date: new Date(today - ago * 86_400_000).toISOString().slice(0, 10), joined: ago < 30 ? 3 : 1 }
  })
  return { days, from: points[0].date, to: points[days - 1].date, timeZone: 'Africa/Accra', before: 1000, total: points.reduce((sum, point) => sum + point.joined, 0), points }
}

/**
 * The figures the dashboard reads besides the map: people, sign-ups, content, creators, ads, gold
 * sales and Trending. app.smoke.mjs serves them to every page; a feature check that needs others
 * routes its own.
 */
export function dashboardReply(method, pathname, search = '') {
  const path = pathname.replace(/^\/api\/v1/, '')
  if (method === 'GET' && path === '/platform-users/signups') return dashboardSignups(Number(new URLSearchParams(search).get('days') ?? 90))
  if (method === 'GET' && path === '/platform-users/stats') {
    return { institutionId: null, generatedAt: new Date().toISOString(), total: 1234, newLast7Days: 12, newLast30Days: 40,
      status: { active: 1200, suspended: 4, deactivated: 20, pendingDeletion: 6, erased: 4 },
      roles: { GUEST: 0, VIEWER: 1100, CREATOR: 100, PUBLISHER: 34 },
      affiliation: { STUDENT: 600, ALUMNI: 300, STAFF: 34, NONE: 300 },
      verification: { SELF_DECLARED: 500, PENDING: 30, VERIFIED: 400 },
      badges: { campus: 400, company: 12, honour: 3, spotlight: 9 },
      institutions: [
        { id: smokeId(101), name: 'University of Ghana', shortName: 'UG', slug: 'ug', type: 'TRADITIONAL_UNIVERSITY', region: 'Greater Accra', isActive: true, logoUrl: null, campusCount: 2, members: dashboardMembers(500, 400) },
        { id: smokeId(102), name: 'Kwame Nkrumah University of Science and Technology', shortName: 'KNUST', slug: 'knust', type: 'TRADITIONAL_UNIVERSITY', region: 'Ashanti', isActive: true, logoUrl: null, campusCount: 1, members: dashboardMembers(300, 250) },
      ],
      campuses: null, withoutCampus: null }
  }
  if (method === 'GET' && path === '/user-content/summary') return { videos: 10, images: 6, text: 2, removedPosts: 1, ads: 12, activeAds: 3, surveys: 4, activeSurveys: 2 }
  if (method === 'GET' && path === '/user-content/uploaders') {
    return [{ user: { id: smokeId(201), isActive: true, userProfile: { fullName: 'Ama Owusu', username: 'ama', email: 'ama@example.com', image: null } }, posts: 9, videos: 6, images: 3, text: 0 }]
  }
  if (method === 'GET' && path === '/ads') return { items: [], total: 12, page: 1, limit: 1, counts: { PENDING_REVIEW: 2, ACTIVE: 3, PAUSED: 1, COMPLETED: 4, CANCELLED: 1, REJECTED: 1 } }
  if (method === 'GET' && path === '/gold-purchases') return { items: [], total: 30, page: 1, limit: 1, paid: { count: 27, totalGhs: 2485.77, totalBars: 124300 }, counts: { PAID: 27, FAILED: 3 } }
  if (method === 'POST' && path === '/discover-studio/preview') {
    return { discover: {}, applied: {}, trending: { scope: { key: 'global', level: 'GLOBAL', label: 'All campuses', showing: null }, items: [1, 2, 3, 4, 5, 6, 7].map(dashboardTrend),
      source: 'snapshot', computedAt: new Date(Date.now() - 180_000).toISOString(), policyVersion: 'discover-v1', stale: false } }
  }
  return undefined
}

export async function checkDashboardContent(page, baseUrl) {
  // Some work waiting, so the queues show; the layout reads these counts too.
  const countsRoute = (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ adRequests: 2, contentReports: 1, verification: 0 }) })
  await page.route('**/api/v1/activity/counts', countsRoute)
  let statsReads = 0
  const countStats = (request) => { if (new URL(request.url()).pathname === '/api/v1/platform-users/stats') statsReads += 1 }
  page.on('request', countStats)
  try {
    await page.setViewportSize({ width: 1440, height: 1100 })
    await page.goto(baseUrl + '/dashboard')
    await page.getByRole('heading', { name: 'Dashboard', exact: true }).waitFor()

    const account = page.getByRole('group', { name: 'Signed-in account' })
    await account.getByText('admin@example.com', { exact: true }).waitFor()
    await account.getByText('Super Admin').waitFor()

    // Profile identity survives a full page reload.
    await page.reload()
    await account.getByText('admin@example.com', { exact: true }).waitFor()
    await account.getByText('Super Admin').waitFor()

    // The day, and what is waiting, most first.
    await page.getByText(/^Good (morning|afternoon|evening)$/).waitFor()
    const queues = page.getByRole('list', { name: 'Queues' })
    await queues.getByRole('link', { name: 'Ad Requests: 2 waiting' }).waitFor()
    assert.deepEqual(await queues.getByRole('link').evaluateAll((links) => links.map((link) => link.getAttribute('aria-label'))),
      ['Ad Requests: 2 waiting', 'User Content reports: 1 waiting', 'Verification: clear'])
    await page.getByText('3 items in 2 queues. Each queue opens oldest first.').waitFor()

    // The headline figures, each opening its section.
    const figures = page.getByRole('region', { name: 'Headline figures' })
    for (const [label, value, href] of [['People on AdBox', '1,234', '/manage-users'], ['Gold sales', 'GHS 2,485.77', '/financials/advertisers-payment'],
      ['Ads running', '3', '/ads-management?status=ACTIVE'], ['Posts live', '18', '/user-content/posts']]) {
      const tile = figures.getByRole('link', { name: new RegExp(`^${label}`) })
      await tile.getByText(value, { exact: true }).waitFor()
      assert.equal(await tile.getAttribute('href'), href)
    }

    // Sign-ups by day, then by week, compared with the span before.
    const signups = page.getByRole('list', { name: 'Sign-up figures' })
    await signups.getByText('in the last 30 days', { exact: true }).waitFor()
    assert.match(await signups.textContent(), /^90in the last 30 days\+200%on the 30 days before \(30\)/)
    await page.getByRole('group', { name: 'Sign-ups per day, the last 30 days: 90 in all' }).waitFor()
    await page.getByRole('radio', { name: '12 weeks', exact: true }).click()
    await page.getByRole('group', { name: /^Sign-ups per week, the last 12 weeks: / }).waitFor()
    await page.getByRole('radio', { name: '30 days', exact: true }).click()

    // Who is on AdBox, and what is trending, with a flame beside each.
    await page.getByRole('list', { name: 'People by campus affiliation' }).getByRole('link', { name: 'Students: 600, 49%' }).waitFor()
    const trending = page.getByRole('list', { name: 'Trending now in the app' })
    await trending.getByRole('link', { name: 'Number 5, #trend5, 25 posts today' }).waitFor()
    assert.equal(await trending.getByRole('link').count(), 5)
    assert.equal(await trending.getByTestId('trend-flame').count(), 5)

    // Institutions map: every institution on the 16 regions; the busiest region opens first.
    const map = page.getByRole('article', { name: 'Institutions across Ghana' })
    await map.getByText('5 institutions in 16 regions.', { exact: false }).waitFor()
    await map.getByRole('img', { name: /Map of Ghana's 16 regions with 5 institutions/ }).waitFor()
    assert.equal(await map.locator('svg[role=img] circle.pointer-events-none').count(), 5)
    const regions = map.getByRole('region', { name: 'Regions' })
    assert.equal(await regions.getByRole('button').count(), 16)
    const greaterAccra = regions.getByRole('button', { name: 'Greater Accra, 2 institutions' })
    const ashanti = regions.getByRole('button', { name: 'Ashanti, 1 institution' })
    assert.equal(await greaterAccra.getAttribute('aria-pressed'), 'true')
    await map.getByRole('region', { name: 'Institutions in Greater Accra' }).getByText('University of Ghana').waitFor()
    await ashanti.click()
    assert.equal(await ashanti.getAttribute('aria-pressed'), 'true')
    assert.equal(await greaterAccra.getAttribute('aria-pressed'), 'false')
    await map.getByRole('region', { name: 'Institutions in Ashanti' }).getByText('Kwame Nkrumah University of Science and Technology').waitFor()

    // The largest institutions, the ads by stage and the top creators.
    await page.getByRole('list', { name: 'Largest institutions' }).getByRole('link').first().getByText('UG', { exact: true }).waitFor()
    assert.equal(await page.getByRole('list', { name: 'Ads by stage' }).getByRole('link', { name: 'Running: 3, 25%' }).getAttribute('href'), '/ads-management?status=ACTIVE')
    await page.getByRole('list', { name: 'Top creators' }).getByRole('link', { name: /Ama Owusu/ }).waitFor()

    // Refresh reads every figure again.
    const before = statsReads
    await page.getByRole('button', { name: 'Refresh', exact: true }).click()
    await page.waitForFunction(() => !document.querySelector('[aria-busy="true"]'))
    assert.ok(statsReads > before, 'Refresh reads the figures again')

    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1100 })
      assert.ok(await account.getByText('admin@example.com', { exact: true }).isVisible(), 'Account email must remain visible at ' + width)
      assert.ok(await account.getByText('Super Admin').isVisible(), 'Account role must remain visible at ' + width)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, '/dashboard overflows at ' + width)
    }
    await page.setViewportSize({ width: 1440, height: 1000 })
  } finally {
    page.off('request', countStats)
    await page.unroute('**/api/v1/activity/counts', countsRoute)
  }
  console.log('Dashboard: waiting work, headline figures, sign-ups by day and week, people, trending with flames, institutions map and region selection, largest institutions, ads by stage, top creators, refresh and responsive layouts passed')
}
