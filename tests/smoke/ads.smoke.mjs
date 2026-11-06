import assert from 'node:assert/strict'
import { setThemeFromSettings } from './theme-helpers.mjs'

const adsApi = /\/api\/v1\/(ads|gold-purchases)(\/|$|\?)/

export async function checkAds(page, baseUrl) {
  const now = Date.now()
  const advertiser = { id: 'u-1', name: 'Kojo Mensah', username: 'kojo', email: 'kojo@example.com', image: null, isActive: true, kind: 'PERSON', company: null, joinedAt: new Date(now - 2 * 86_400_000).toISOString(), emailVerified: false }
  const business = { ...advertiser, id: 'u-2', name: "Abena's Kitchen", username: 'abenaskitchen', email: 'business-u-2@accounts.adbox.invalid', kind: 'BUSINESS', company: "Abena's Kitchen", emailVerified: false }
  const ad = (id, overrides = {}) => ({
    id, type: 'PROFILE', name: 'Profile ad · 5 Nov · #' + id, goal: 'FOLLOWERS', audience: 'ALL', institutionIds: [], campusIds: [], status: 'PENDING_REVIEW',
    dailyBudgetBars: 500, durationDays: 3, budgetBars: 1500, cpmBars: 1250, chargedBars: 0, returnedBars: 0, heldBars: 1500, maxViews: 1200,
    startsAt: null, endsAt: null, cancelledAt: null, autoApproved: false, reviewedAt: null, rejectionReason: null, pausedAt: null, pauseReason: null,
    settledAt: null, resourceId: null, content: { body: 'Follow me for campus news ' + id }, createdAt: new Date(now - 3 * 3_600_000).toISOString(),
    stats: { views: 0, reach: 0, clicks: 0, engagements: 0 }, openReports: 0, advertiser, ...overrides,
  })
  const waiting = ad('11111111-1111-4111-8111-111111111111')
  const running = ad('22222222-2222-4222-8222-222222222222', {
    type: 'IMAGE', status: 'ACTIVE', advertiser: business, startsAt: new Date(now - 86_400_000).toISOString(), endsAt: new Date(now + 6 * 86_400_000).toISOString(),
    content: { headline: 'Waakye half price', body: 'All week at the JQB stall.', imageUrls: [], destinationUrl: 'https://example.com/waakye' }, chargedBars: 6125, heldBars: 4375, budgetBars: 10500, dailyBudgetBars: 1500, durationDays: 7, maxViews: 8400,
    stats: { views: 4900, reach: 3000, clicks: 40, engagements: 12 },
  })
  const reportedAd = { ...ad('33333333-3333-4333-8333-333333333333', { status: 'PAUSED', pauseReason: 'REPORTS', openReports: 3, startsAt: new Date(now - 86_400_000).toISOString(), endsAt: new Date(now + 2 * 86_400_000).toISOString(), content: { body: 'Quick money, guaranteed' } }), reasons: [{ reason: 'SCAM', count: 2 }, { reason: 'MISLEADING', count: 1 }], lastReportedAt: new Date(now - 600_000).toISOString() }
  const all = [waiting, running, reportedAd]
  const detail = (item) => ({ ...item, daily: [{ date: new Date(now - 86_400_000).toISOString(), impressions: 2000, reach: 1500, clicks: 10, engagements: 3 }, { date: new Date(now).toISOString(), impressions: 2900, reach: 2000, clicks: 30, engagements: 9 }], post: null, places: { institutions: [], campuses: [] }, reviewer: null,
    reports: item.openReports ? [{ id: 'r-1', reason: 'SCAM', details: 'Asks for a fee first', status: 'OPEN', createdAt: new Date(now - 600_000).toISOString(), reporter: { id: 'u-9', name: 'Ama', username: 'ama' } }] : [] })
  const purchases = {
    items: [
      { id: 'p-1', status: 'PAID', bundleId: null, bundleName: '1,450 gold bars', pricePesewas: 2900, priceGhs: 29, totalBars: 1450, currency: 'GHS', channel: 'MOMO', providerReference: 'gold-p-1', failureReason: null, paidAt: new Date(now).toISOString(), createdAt: new Date(now).toISOString(), buyer: { id: 'u-1', name: 'Kojo Mensah', username: 'kojo', email: 'kojo@example.com' } },
      { id: 'p-2', status: 'PENDING', bundleId: 'stack', bundleName: 'Stack', pricePesewas: 999, priceGhs: 9.99, totalBars: 550, currency: 'GHS', channel: 'CARD', providerReference: 'gold-p-2', failureReason: null, paidAt: null, createdAt: new Date(now).toISOString(), buyer: { id: 'u-1', name: 'Kojo Mensah', username: 'kojo', email: 'kojo@example.com' } },
    ],
    total: 2, page: 1, limit: 25, paid: { count: 1, totalGhs: 29, totalBars: 1450 }, counts: { PAID: 1, PENDING: 1 },
  }
  const posts = []
  const lists = []

  const route = async (intercepted) => {
    const request = intercepted.request()
    const url = new URL(request.url())
    const path = url.pathname.replace(/^\/api\/v1/, '')
    const method = request.method()
    const reply = (data, status = 200) => intercepted.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) })
    if (method === 'GET' && path === '/ads') {
      const status = url.searchParams.get('status')
      lists.push(status)
      const items = all.filter(item => !status || item.status === status)
      return reply({ items, total: items.length, page: 1, limit: 20, counts: { PENDING_REVIEW: 1, ACTIVE: 1, PAUSED: 1, COMPLETED: 5 } })
    }
    if (method === 'GET' && path === '/ads/reported') return reply({ items: [reportedAd], total: 1, page: 1, limit: 20 })
    if (method === 'GET' && path.startsWith('/ads/')) return reply(detail(all.find(item => item.id === path.split('/')[2])))
    if (method === 'POST' && path.startsWith('/ads/')) {
      posts.push({ path, body: request.postData() ? request.postDataJSON() : null })
      return reply({ id: path.split('/')[2] })
    }
    if (method === 'GET' && path === '/gold-purchases') return reply(purchases)
    return reply({ message: 'Unexpected ' + method + ' ' + path }, 500)
  }

  const noOverflow = async (label) => {
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1100 })
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, label + ' overflows at ' + width)
    }
    await page.setViewportSize({ width: 1440, height: 1100 })
  }

  await page.route(adsApi, route)
  await page.setViewportSize({ width: 1440, height: 1100 })
  try {
    // The overview: stages counted, what needs a decision linked, every ad listed.
    await page.goto(baseUrl + '/ads-management')
    await page.getByRole('heading', { name: 'Ads Management', exact: true }).first().waitFor()
    assert.equal(await page.title(), 'Ads Management | AdBox')
    await page.getByRole('link', { name: /Waiting for review/ }).waitFor()
    await page.getByRole('list', { name: 'Ads' }).getByText('Waakye half price').waitFor()
    await page.getByText('6,125 / 10,500').waitFor()
    await noOverflow('/ads-management')
    const filteredList = page.waitForRequest(request => new URL(request.url()).pathname === '/api/v1/ads' && new URL(request.url()).searchParams.get('status') === 'ACTIVE')
    await page.getByRole('group', { name: 'Ad stage' }).getByRole('button', { name: /Running/ }).click()
    await filteredList
    await page.getByRole('button', { name: 'Follow me for campus news ' + waiting.id }).waitFor({ state: 'detached' })
    assert.ok(lists.includes('ACTIVE'))

    // A running ad: its gold, its delivery, Pause and Stop.
    await page.getByRole('button', { name: 'Waakye half price' }).click()
    const sheet = page.getByRole('dialog')
    await sheet.getByText('6,125 bars').waitFor()
    await sheet.getByText('None: nobody signs in to it by email').waitFor()
    await sheet.getByRole('list', { name: 'Views by day' }).waitFor()
    await sheet.getByRole('button', { name: 'Pause' }).click()
    await sheet.waitFor({ state: 'detached' })
    assert.deepEqual(posts.at(-1), { path: '/ads/' + running.id + '/pause', body: null })

    // The review queue: a new person's ad, refused with a common reason.
    await page.goto(baseUrl + '/ads-management/ad-requests')
    await page.getByRole('heading', { name: 'Ad Requests', exact: true }).first().waitFor()
    await page.getByText(/Account 2 days old/).waitFor()
    await noOverflow('/ads-management/ad-requests')
    await page.getByRole('button', { name: 'Follow me for campus news ' + waiting.id }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Refuse' }).click()
    const ask = page.getByRole('dialog', { name: 'Refuse this ad' })
    await ask.getByRole('button', { name: 'Loans and "quick money" offers are not allowed in ads.' }).click()
    await ask.getByRole('button', { name: 'Refuse ad' }).click()
    await ask.waitFor({ state: 'detached' })
    assert.deepEqual(posts.at(-1), { path: '/ads/' + waiting.id + '/reject', body: { reason: 'Loans and "quick money" offers are not allowed in ads.' } })

    // Reported: the reasons, the reports, dismissed.
    await page.goto(baseUrl + '/ads-management/reported-ads')
    await page.getByRole('heading', { name: 'Reported Ads', exact: true }).first().waitFor()
    await page.getByText('Scam or fraud · 2').waitFor()
    await noOverflow('/ads-management/reported-ads')
    await page.getByRole('button', { name: 'Quick money, guaranteed' }).click()
    const reportedSheet = page.getByRole('dialog')
    await reportedSheet.getByText('“Asks for a fee first”').waitFor()
    await reportedSheet.getByRole('button', { name: 'Dismiss reports' }).click()
    await reportedSheet.waitFor({ state: 'detached' })
    assert.deepEqual(posts.at(-1), { path: '/ads/' + reportedAd.id + '/reports/resolve', body: { decision: 'DISMISS' } })

    // The money behind ads: gold bought through Paystack.
    await page.goto(baseUrl + '/financials/advertisers-payment')
    await page.getByRole('heading', { name: 'Advertisers Payment', exact: true }).first().waitFor()
    await page.getByText(/Exact top-up · Mobile Money/).waitFor()
    await noOverflow('/financials/advertisers-payment')

    await setThemeFromSettings(page, baseUrl, 'dark')
    await page.goto(baseUrl + '/ads-management')
    await page.getByRole('list', { name: 'Ads' }).waitFor()
    await noOverflow('/ads-management (dark)')
    await setThemeFromSettings(page, baseUrl, 'light')
  } finally {
    await page.unroute(adsApi, route)
  }
  console.log('Ads: overview stages and filters, a running ad paused, a request refused with a reason, reports dismissed, payments listed, dark mode and responsive layouts passed')
}
