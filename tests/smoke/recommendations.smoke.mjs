import assert from 'node:assert/strict'
import { setThemeFromSettings } from './theme-helpers.mjs'

const settingsApi = /\/api\/v1\/(feed-ranking|discover-studio\/policy|gold-settings)(\/|$|\?)/

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
    if (request.method() !== 'GET') {
      writes.push(request.method() + ' ' + path)
      return reply({ message: 'This section only reads' }, 500)
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
    // Reached from the sidebar, its own section with an overview.
    await page.goto(baseUrl + '/recommendations')
    await page.getByRole('heading', { name: 'Recommendations', exact: true }).first().waitFor()
    assert.equal(await page.title(), 'Recommendations | AdBox')
    const nav = page.getByRole('navigation', { name: 'Dashboard navigation', exact: true })
    for (const [path, label] of [['', 'Overview'], ['/home-feed', 'Home & videos'], ['/sponsored', 'Sponsored posts'], ['/discover', 'Discover'], ['/ranked-feed', 'Ranked feed'], ['/parameters', 'All parameters']]) {
      await nav.locator(`a[href="/recommendations${path}"]`).getByText(label, { exact: true }).waitFor()
    }
    await page.getByTestId('feed-version').getByText('policy-v2').waitFor()
    // Discover could not be read: its defaults are shown, and say so.
    await page.getByTestId('discover-version').getByText('discover-v1').waitFor()
    await page.getByText("Couldn't load", { exact: true }).waitFor()
    await noOverflow('/recommendations')

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
      ['/recommendations/home-feed', 'Home & videos', 'Floor from 5.1 days'],
      ['/recommendations/sponsored', 'Sponsored posts', 'Places 4, 13, 22'],
      ['/recommendations/discover', 'Discover', 'Trend score'],
    ]) {
      await page.goto(baseUrl + path)
      await page.getByRole('heading', { name: title, exact: true }).first().waitFor()
      await page.getByText(shows, { exact: true }).first().waitFor()
      await noOverflow(path)
    }

    // The playground re-ranks the sample posts, and saves nothing.
    await page.goto(baseUrl + '/recommendations/ranked-feed')
    await page.getByText('“Shares count for more”').waitFor()
    await page.getByText('The order the settings in force give').waitFor()
    await page.getByLabel('Hide penalty', { exact: true }).fill('0')
    await page.getByText(/With your changes, \d+ of 12 posts move/).waitFor()
    await page.getByRole('button', { name: 'Back to live' }).click()
    await page.getByText('The order the settings in force give').waitFor()
    await noOverflow('/recommendations/ranked-feed')

    // Every parameter, filtered in the URL.
    await page.goto(baseUrl + '/recommendations/parameters')
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
    await noOverflow('/recommendations/parameters')

    await setThemeFromSettings(page, baseUrl, 'dark')
    await page.getByTestId('parameter-count').waitFor()
    await noOverflow('/recommendations/parameters (dark)')
    await setThemeFromSettings(page, baseUrl, 'light')
    assert.deepEqual(writes, [], 'Recommendations only reads')
  } finally {
    await page.unroute(settingsApi, route)
  }
  console.log('Recommendations: live and default settings, parameter details, every page, the ranking playground, filters, dark mode and responsive layouts passed')
}
