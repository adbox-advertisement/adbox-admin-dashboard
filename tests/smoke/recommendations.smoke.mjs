import assert from 'node:assert/strict'
import { setThemeFromSettings } from './theme-helpers.mjs'

const settingsApi = /\/api\/v1\/(feed-ranking|discover-studio\/policy|gold-settings)(\/|$|\?)/
// Trending overrides: the lists, overrides, and where subjects of each kind are found.
const overridesApi = /\/api\/v1\/(discover-studio\/(trends|overrides|hashtags|events)|institutions|platform-users)(\/|$|\?)/
// Top trends: the app's Trending (the read-only preview), the scores, and the lists.
const topTrendsApi = /\/api\/v1\/(discover-studio\/(preview|trends)|institutions)(\/|$|\?)/

export async function checkRecommendations(page, baseUrl) {
  const defaults = {
    version: 'heuristic-v1',
    quality: { weights: { like: 1, comment: 3, share: 5, bookmark: 3, completion: 2 }, hidePenalty: 10, priorStrength: 50, priorRate: 0.1 },
    relevance: { followsAuthor: 1.5, sameCampus: 0.6, sameInstitution: 0.3, perSharedInterest: 0.2, maxSharedInterests: 3 },
    halfLifeHours: { TEXT: 24, IMAGE: 24, VIDEO: 48 },
    exploration: { impressionThreshold: 200, boost: 1.3, windowHours: 72 },
    rerank: { maxPerAuthorInWindow: 1, authorWindow: 5, maxConsecutiveVideos: 3, exploreEvery: 10 },
    sourceQuota: { recent: 200, following: 150, campus: 100, interest: 100, trending: 100 },
    sourceWindowDays: { following: 14, campus: 14, interest: 14, trending: 7 },
    sessionSize: 200,
  }
  const range = (min, max) => ({ min, max })
  const bounds = {
    quality: { weights: { like: range(0, 100), comment: range(0, 100), share: range(0, 100), bookmark: range(0, 100), completion: range(0, 100) }, hidePenalty: range(0, 1000), priorStrength: range(1, 10000), priorRate: range(0.0001, 10) },
    relevance: { followsAuthor: range(0, 20), sameCampus: range(0, 20), sameInstitution: range(0, 20), perSharedInterest: range(0, 20), maxSharedInterests: { min: 0, max: 20, integer: true } },
    halfLifeHours: { TEXT: range(1, 720), IMAGE: range(1, 720), VIDEO: range(1, 720) },
    exploration: { impressionThreshold: { min: 0, max: 100000, integer: true }, boost: range(1, 10), windowHours: range(1, 720) },
    rerank: { maxPerAuthorInWindow: { min: 1, max: 50, integer: true }, authorWindow: { min: 1, max: 50, integer: true }, maxConsecutiveVideos: { min: 1, max: 50, integer: true }, exploreEvery: { min: 0, max: 100, integer: true } },
    sourceQuota: { recent: { min: 1, max: 500, integer: true }, following: { min: 0, max: 500, integer: true }, campus: { min: 0, max: 500, integer: true }, interest: { min: 0, max: 500, integer: true }, trending: { min: 0, max: 500, integer: true } },
    sourceWindowDays: { following: { min: 1, max: 90, integer: true }, campus: { min: 1, max: 90, integer: true }, interest: { min: 1, max: 90, integer: true }, trending: { min: 1, max: 90, integer: true } },
    sessionSize: { min: 20, max: 500, integer: true },
  }
  const live = structuredClone(defaults)
  live.version = 'policy-v2'
  live.quality.weights.share = 8
  const versions = [
    { id: '00000000-0000-4000-8000-000000000002', version: 2, isActive: true, rankedPercent: 100, config: live, note: 'Shares count for more', createdByAdminId: 'a', createdAt: '2026-11-10T10:00:00.000Z', activatedByAdminId: 'a', activatedAt: '2026-11-10T10:00:00.000Z' },
    { id: '00000000-0000-4000-8000-000000000001', version: 1, isActive: false, rankedPercent: 100, config: { ...defaults, version: 'policy-v1' }, note: null, createdByAdminId: 'a', createdAt: '2026-11-01T10:00:00.000Z', activatedByAdminId: null, activatedAt: null },
  ]
  const gold = {
    values: { barsPerCedi: 50, dailyRewardBars: 50, adDailyBudgetMinBars: 500, adDailyBudgetMaxBars: 12500, adDurationsDays: [3, 7, 14, 30], adCpmBars: 1250, adMinAudience: 100, adFrequencyCapPerDay: 3,
      surveyRewardMinPerResponse: 2, surveyRewardMaxPerResponse: 5, surveyRewardMinBudget: 100, surveyRewardMaxBudget: 1000000, surveyThreeFormatsFrom: 550, surveyAnyFormatsFrom: 3000 },
    defaults: {}, updatedAt: '2026-11-04T10:00:00.000Z', updatedBy: null, audienceSizes: { ALL: 1, STUDENTS: 1, ALUMNI: 1 },
  }
  const writes = []

  const route = async (intercepted) => {
    const request = intercepted.request()
    const path = new URL(request.url()).pathname.replace(/^\/api\/v1/, '')
    const reply = (data, status = 200) => intercepted.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) })
    if (request.method() === 'POST' && path === '/feed-ranking/policies') {
      // As the server does: a new numbered version, the live settings carried over, made live.
      const body = request.postDataJSON()
      writes.push({ method: 'POST', path, body })
      const created = { ...versions[0], id: '00000000-0000-4000-8000-000000000003', version: 3, rankedPercent: body.rankedPercent, note: body.note ?? null,
        config: { ...versions[0].config, version: 'policy-v3' }, createdAt: '2026-11-13T10:00:00.000Z', activatedAt: '2026-11-13T10:00:00.000Z' }
      versions[0].isActive = false
      versions.unshift(created)
      return reply(created, 201)
    }
    if (request.method() !== 'GET') {
      writes.push({ method: request.method(), path })
      return reply({ message: 'Unexpected write' }, 500)
    }
    if (path === '/feed-ranking') return reply({ active: versions[0], defaults, bounds })
    if (path === '/feed-ranking/policies') return reply({ items: versions })
    // No Discover version is live: the gateway runs the defaults the page ships with.
    if (path === '/discover-studio/policy') return reply({ message: 'Forbidden resource' }, 403)
    if (path === '/gold-settings') return reply(gold)
    return reply({ message: 'Unexpected ' + path }, 500)
  }

  const noOverflow = async (label) => {
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 })
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, label + ' overflows at ' + width)
    }
    await page.setViewportSize({ width: 1440, height: 1000 })
  }

  await page.route(settingsApi, route)
  await page.setViewportSize({ width: 1440, height: 1000 })
  try {
    // Reached from the sidebar as Algorithms, its own section with an overview.
    await page.goto(baseUrl + '/algorithms')
    await page.getByRole('heading', { name: 'Algorithms', exact: true }).first().waitFor()
    assert.equal(await page.title(), 'Algorithms | AdBox')
    const nav = page.getByRole('navigation', { name: 'Dashboard navigation', exact: true })
    for (const [path, label] of [['', 'Overview'], ['/home-feed', 'Home & videos'], ['/sponsored', 'Sponsored posts'], ['/discover', 'Discover'], ['/top-trends', 'Top trends'], ['/ranked-feed', 'Ranked feed'], ['/parameters', 'All parameters']]) {
      await nav.locator(`a[href="/algorithms${path}"]`).getByText(label, { exact: true }).waitFor()
    }
    await page.getByTestId('feed-version').getByText('policy-v2').waitFor()
    // Discover could not be read: its defaults are shown, and say so.
    await page.getByTestId('discover-version').getByText('discover-v1').waitFor()
    await page.getByText("Couldn't load", { exact: true }).waitFor()
    await noOverflow('/algorithms')

    // Any value opens its details over the page; Escape closes them.
    await page.getByRole('link', { name: 'Share weight: 8, changed from the default' }).first().click()
    const details = page.getByRole('dialog')
    await details.getByText('quality.weights.share', { exact: true }).waitFor()
    await details.getByTestId('parameter-value').getByText('8', { exact: true }).waitFor()
    await details.getByText('In the app through Discover', { exact: true }).waitFor()
    assert.match(page.url(), /param=feed\.quality\.weights\.share/)
    await page.keyboard.press('Escape')
    await details.waitFor({ state: 'detached' })
    assert.doesNotMatch(page.url(), /param=/)

    for (const [path, title, shows] of [
      ['/algorithms/home-feed', 'Home & videos', 'Floor from 5.1 days'],
      ['/algorithms/sponsored', 'Sponsored posts', 'Places 4, 13, 22'],
      ['/algorithms/discover', 'Discover', 'Trend score'],
    ]) {
      await page.goto(baseUrl + path)
      await page.getByRole('heading', { name: title, exact: true }).first().waitFor()
      await page.getByText(shows, { exact: true }).first().waitFor()
      await noOverflow(path)
    }

    // The playground re-ranks the sample posts, and saves nothing.
    await page.goto(baseUrl + '/algorithms/ranked-feed')
    await page.getByText('“Shares count for more”').waitFor()
    await page.getByText('The order the settings in force give').waitFor()
    await page.getByLabel('Hide penalty', { exact: true }).fill('0')
    await page.getByText(/With your changes, \d+ of 12 posts move/).waitFor()
    await page.getByRole('button', { name: 'Back to live' }).click()
    await page.getByText('The order the settings in force give').waitFor()
    assert.deepEqual(writes, [], 'The playground saves nothing')

    // The ranked share: chosen, confirmed, then saved as a new live version changing nothing else.
    await page.getByTestId('ranked-share-now').getByText('100%').waitFor()
    await page.getByRole('button', { name: '50%', exact: true }).click()
    await page.getByTestId('ranked-share-split').getByText('50% ranked · 50% newest first.').waitFor()
    await page.getByLabel(/^Why/).fill('Test ranked against newest first')
    await page.getByRole('button', { name: 'Save as version 3' }).click()
    const confirm = page.getByRole('dialog')
    await confirm.getByText('Give 50% of people the ranked feed?').waitFor()
    assert.deepEqual(writes, [], 'Nothing is saved before confirming')
    await confirm.getByRole('button', { name: 'Save and make live' }).click()
    await confirm.waitFor({ state: 'detached' })
    await page.getByTestId('ranked-share-now').getByText('50%').waitFor()
    await page.getByText('Version 3', { exact: true }).waitFor()
    await page.getByText('“Test ranked against newest first”', { exact: true }).waitFor()
    assert.deepEqual(writes, [{ method: 'POST', path: '/feed-ranking/policies', body: { rankedPercent: 50, note: 'Test ranked against newest first', activate: true } }])
    await noOverflow('/algorithms/ranked-feed')

    await checkTrendingOverrides(page, baseUrl, noOverflow)
    await checkTopTrends(page, baseUrl, noOverflow)

    // Every parameter, filtered in the URL.
    await page.goto(baseUrl + '/algorithms/parameters')
    const count = page.getByTestId('parameter-count')
    const total = Number((await count.textContent()).match(/\d+/)[0])
    assert.ok(total > 200, 'every parameter is listed')
    await page.getByRole('combobox', { name: 'Controlled by' }).click()
    await page.getByRole('option', { name: 'Gold settings', exact: true }).click()
    await count.getByText(`5 of ${total} parameters`).waitFor()
    assert.match(page.url(), /control=gold/)
    await page.getByLabel('Search parameters').fill('half-life')
    await page.getByText('No parameter matches').waitFor()
    // The frequency cap, found by its key as well as its name.
    await page.getByLabel('Search parameters').fill('frequency')
    await count.getByText(`1 of ${total} parameters`).waitFor()
    await page.getByRole('link', { name: 'Views per person per ad, a day', exact: true }).waitFor()
    await page.getByRole('button', { name: 'Clear filters' }).click()
    await count.getByText(`${total} parameters`, { exact: true }).waitFor()
    await noOverflow('/algorithms/parameters')

    await setThemeFromSettings(page, baseUrl, 'dark')
    await page.getByTestId('parameter-count').waitFor()
    await noOverflow('/algorithms/parameters (dark)')
    await setThemeFromSettings(page, baseUrl, 'light')
    assert.equal(writes.length, 1, 'Algorithms writes only the ranked share')
  } finally {
    await page.unroute(settingsApi, route)
  }
  console.log('Algorithms: live and default settings, parameter details, every page, the ranking playground, the ranked share saved after confirming, trending overrides pinned and ended, the top trends with their flames, filters, dark mode and responsive layouts passed')
}

// Pin a hashtag found by search, see it placed, then end the pin already in force.
async function checkTrendingOverrides(page, baseUrl, noOverflow) {
  const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
  const minutesAgo = (m) => new Date(Date.now() - m * 60_000).toISOString()
  const daysAhead = (d) => new Date(Date.now() + d * 86_400_000).toISOString()
  const names = { [id(1)]: '#freshersweek', [id(9)]: '#nightmarket' }
  const overrides = [{ id: id(201), scopeKey: 'global', kind: 'HASHTAG', subjectId: id(1), action: 'PIN', rank: 1, multiplier: null, reason: 'Freshers week launch', startsAt: minutesAgo(60), endsAt: daysAhead(5), endedAt: null }]
  const writes = []
  const state = (o) => (o.endedAt ? 'ENDED' : 'ACTIVE')
  const live = () => overrides.filter((o) => !o.endedAt)

  const route = async (intercepted) => {
    const request = intercepted.request()
    const url = new URL(request.url())
    const path = url.pathname.replace(/^\/api\/v1/, '')
    const reply = (data, status = 200) => intercepted.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) })
    if (request.method() === 'POST' && path === '/discover-studio/overrides') {
      const body = request.postDataJSON()
      writes.push({ path, body })
      const created = { ...body, id: id(300), rank: body.rank ?? null, multiplier: body.multiplier ?? null, startsAt: new Date().toISOString(), endedAt: null }
      overrides.unshift(created)
      return reply({ ...created, state: 'ACTIVE' }, 201)
    }
    const ending = path.match(/^\/discover-studio\/overrides\/([^/]+)\/end$/)
    if (request.method() === 'POST' && ending) {
      writes.push({ path })
      const override = overrides.find((o) => o.id === ending[1])
      override.endedAt = new Date().toISOString()
      return reply({ ...override, state: 'ENDED' })
    }
    if (request.method() !== 'GET') return reply({ message: 'Unexpected ' + request.method() + ' ' + path }, 500)
    if (path === '/discover-studio/trends/status') return reply({ lastSuccessAt: minutesAgo(3), stale: false, intervalMinutes: 5, scopes: ['global'] })
    if (path === '/discover-studio/trends') {
      const items = [[1, 'HASHTAG', 1, '#freshersweek'], [2, 'EVENT', 2, 'Campus food fair'], [3, 'PERSON', 4, 'Ama Owusu']]
        .map(([rank, kind, n, name]) => ({ rank, kind, id: id(n), name, score: 10 - rank, metrics: { participants: 40 }, trend: { direction: 'UP', changePct: 20 } }))
      return reply({ scopeKey: 'global', snapshot: { computedAt: minutesAgo(3), policyVersion: 'discover-v1', items, diagnostics: { candidates: 30, relaxed: 0, missed: [] } },
        overrides: live().map((o) => ({ ...o, name: names[o.subjectId] ?? null })) })
    }
    if (path === '/discover-studio/overrides') {
      const all = url.searchParams.get('includeEnded') === 'true'
      return reply({ items: (all ? overrides : live()).map((o) => ({ ...o, state: state(o) })) })
    }
    if (path === '/discover-studio/hashtags') return reply({ items: url.searchParams.get('q') === 'night' ? [{ id: id(9), name: 'nightmarket', displayName: 'NightMarket', status: 'ACTIVE', postCount: 31 }] : [], total: 1 })
    if (path === '/discover-studio/events') return reply({ items: [], total: 0 })
    if (path === '/institutions') return reply([])
    if (path === '/platform-users') return reply({ items: [], total: 0, page: 1, limit: 8 })
    return reply({ message: 'Unexpected ' + path }, 500)
  }

  await page.route(overridesApi, route)
  try {
    await page.goto(baseUrl + '/algorithms/trending-overrides')
    await page.getByRole('heading', { name: 'Trending overrides', exact: true }).first().waitFor()
    await page.getByRole('navigation', { name: 'Dashboard navigation', exact: true }).locator('a[href="/algorithms/trending-overrides"]').waitFor()
    const list = page.getByRole('list', { name: 'The list now' })
    await list.getByText('Pinned at 1st').waitFor()

    // Found by search, pinned at 2nd for 3 days, after a reason.
    await page.getByRole('button', { name: 'Add an override' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Search hashtags').fill('night')
    await dialog.getByRole('button', { name: 'Choose #NightMarket' }).click()
    await dialog.getByRole('radio', { name: '2nd', exact: true }).click()
    await dialog.getByRole('radio', { name: '3 days', exact: true }).click()
    await dialog.getByLabel(/^Why/).fill('Night market week')
    await dialog.getByTestId('override-summary').getByText(/^Pinned at 2nd: #NightMarket in the Nationwide list/).waitFor()
    assert.equal(writes.length, 0, 'Nothing is saved before Add override')
    await dialog.getByRole('button', { name: 'Add override' }).click()
    await dialog.waitFor({ state: 'detached' })
    const placed = page.getByRole('list', { name: 'Overrides' })
    await placed.getByText('Pinned at 2nd').waitFor()
    assert.deepEqual({ ...writes[0].body, endsAt: undefined }, { scopeKey: 'global', kind: 'HASHTAG', subjectId: id(9), action: 'PIN', rank: 2, reason: 'Night market week', endsAt: undefined })
    const days = (new Date(writes[0].body.endsAt).getTime() - Date.now()) / 86_400_000
    assert.ok(days > 2.9 && days <= 3, 'ends in 3 days')

    // The pin in force, ended after confirming.
    await placed.getByRole('listitem').filter({ hasText: 'Freshers week launch' }).getByRole('button', { name: 'End now' }).click()
    const confirm = page.getByRole('dialog')
    await confirm.getByText('End this override now?').waitFor()
    await confirm.getByRole('button', { name: 'End now' }).click()
    await confirm.waitFor({ state: 'detached' })
    await placed.getByText('Freshers week launch').waitFor({ state: 'detached' })
    assert.deepEqual(writes[1], { path: `/discover-studio/overrides/${id(201)}/end` })
    await noOverflow('/algorithms/trending-overrides')
  } finally {
    await page.unroute(overridesApi, route)
  }
}

// The app's top 10, each with a flame, and everything about the one chosen. Reads only.
async function checkTopTrends(page, baseUrl, noOverflow) {
  const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
  const minutesAgo = (m) => new Date(Date.now() - m * 60_000).toISOString()
  const daysAhead = (d) => new Date(Date.now() + d * 86_400_000).toISOString()
  const items = Array.from({ length: 12 }, (_, index) => ({
    rank: index + 1, kind: index === 1 ? 'EVENT' : 'HASHTAG', id: id(index + 1), title: index === 0 ? '#freshersweek' : index === 1 ? 'Campus food fair' : `#trend${index + 1}`,
    category: index === 0 ? { slug: 'campus-life', label: 'Campus life' } : null,
    metrics: { posts: 40 - index, participants: 60 - index, window: '24h', label: `${40 - index} posts today` }, trend: { direction: index === 5 ? 'DOWN' : 'UP', changePct: index === 5 ? -15 : 25 },
    featured: index === 0, presentation: { kicker: 'TRENDING', headline: 'Headline', support: null, sticker: [], tone: null, imageUrl: null, description: index === 0 ? 'Everything freshers need this week.' : null },
    subject: index === 1 ? { kind: 'EVENT', id: id(2), title: 'Campus food fair', startsAt: daysAhead(1), endsAt: daysAhead(1.25), location: 'The Great Hall', coverUrl: null, timing: 'UPCOMING', going: 120,
      institution: { id: id(101), shortName: 'UG' }, campus: null, hall: null } : null,
  }))
  const scored = items.map((item, index) => ({
    rank: index + 1, kind: item.kind, id: item.id, name: item.title, score: 6 - index * 0.3, metrics: { posts: 10, participants: 60 - index, follows: 0 }, trend: item.trend,
    parts: { recent: 80 - index, baseline: 12, momentum: (90 - index) / 22, breadth: Math.log1p(60 - index), quality: 1, kindMultiplier: item.kind === 'EVENT' ? 1.2 : 1 }, categoryId: null, parentId: null, topPostId: null,
  }))
  const pin = { id: id(201), scopeKey: 'global', kind: 'HASHTAG', subjectId: id(1), action: 'PIN', rank: 1, multiplier: null, reason: 'Freshers week launch', startsAt: minutesAgo(60), endsAt: daysAhead(5), endedAt: null, name: '#freshersweek' }
  const previews = []

  const route = async (intercepted) => {
    const request = intercepted.request()
    const path = new URL(request.url()).pathname.replace(/^\/api\/v1/, '')
    const reply = (data, status = 200) => intercepted.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) })
    if (request.method() === 'POST' && path === '/discover-studio/preview') {
      previews.push(request.postDataJSON())
      return reply({ discover: { sections: [] }, trending: { scope: { key: 'global', level: 'GLOBAL', label: 'All campuses', showing: null }, items, source: 'snapshot', computedAt: minutesAgo(3), policyVersion: 'discover-v1', stale: false },
        applied: { policyVersion: 'discover-v1', policySource: 'default', rescored: false, unsavedLayout: false, unsavedOverrides: 0, asUserId: null } })
    }
    if (request.method() !== 'GET') return reply({ message: 'Unexpected ' + request.method() + ' ' + path }, 500)
    if (path === '/discover-studio/trends/status') return reply({ lastSuccessAt: minutesAgo(3), stale: false, intervalMinutes: 5, scopes: ['global'] })
    if (path === '/discover-studio/trends') return reply({ scopeKey: 'global', snapshot: { computedAt: minutesAgo(3), policyVersion: 'discover-v1', items: scored, diagnostics: { candidates: 80, relaxed: 0, missed: [] } }, overrides: [pin] })
    if (path === '/institutions') return reply([{ id: id(101), name: 'University of Ghana', shortName: 'UG', region: 'Greater Accra', isActive: true, campuses: [] }])
    return reply({ message: 'Unexpected ' + path }, 500)
  }
  const animationOf = (locator) => locator.evaluate((element) => getComputedStyle(element).animationName)

  await page.route(topTrendsApi, route)
  try {
    await page.goto(baseUrl + '/algorithms/top-trends')
    await page.getByRole('heading', { name: 'Top trends', exact: true }).first().waitFor()
    assert.equal(await page.title(), 'Top trends | AdBox')
    const list = page.getByRole('list', { name: 'Top trends in the app' })
    await list.getByRole('button', { name: /^Number 10, / }).waitFor()
    assert.equal(await list.getByRole('button').count(), 10, 'the top 10 only')
    assert.equal(await list.getByTestId('trend-flame').count(), 10, 'a flame beside each')
    // Still when motion is reduced (as this browser runs); otherwise they flicker, out of step, like the app's.
    const flames = list.getByTestId('trend-flame')
    assert.equal(await animationOf(flames.first().locator('.adbox-flame-outer')), 'none')
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    assert.equal(await animationOf(flames.first().locator('.adbox-flame-outer')), 'adbox-flame-outer')
    assert.notEqual(await flames.nth(0).evaluate((element) => element.style.getPropertyValue('--flame-delay')), await flames.nth(1).evaluate((element) => element.style.getPropertyValue('--flame-delay')))
    await page.emulateMedia({ reducedMotion: 'reduce' })

    // The first is chosen to start; another is chosen from the list, and from the table.
    const details = page.getByTestId('trend-details')
    await details.getByRole('heading', { name: '#freshersweek', level: 3 }).waitFor()
    await details.getByText('Pinned at 1st by an admin; it was computed 1st.').waitFor()
    await details.getByText('“Freshers week launch”').waitFor()
    await list.getByRole('button', { name: /^Number 2, Campus food fair/ }).click()
    await details.getByRole('heading', { name: 'Campus food fair', level: 3 }).waitFor()
    await details.getByText('The Great Hall', { exact: true }).waitFor()
    assert.match(page.url(), /trend=EVENT%3A/)
    const table = page.getByRole('table', { name: 'The top trends side by side' })
    await table.getByRole('button', { name: 'Show everything about #trend6' }).click()
    await details.getByRole('heading', { name: '#trend6', level: 3 }).waitFor()
    await details.getByText('Down 15%', { exact: true }).waitFor()
    assert.ok(previews.length > 0 && previews.every((body) => Object.keys(body).length === 0), 'Trending is read with nothing unsaved')
    await noOverflow('/algorithms/top-trends')


    await setThemeFromSettings(page, baseUrl, 'dark')
    await page.goto(baseUrl + '/algorithms/top-trends')
    await list.getByTestId('trend-flame').first().waitFor()
    await noOverflow('/algorithms/top-trends (dark)')
    await setThemeFromSettings(page, baseUrl, 'light')
  } finally {
    await page.unroute(topTrendsApi, route)
  }
}
