import assert from 'node:assert/strict'
import { setThemeFromSettings } from './theme-helpers.mjs'

const goldApi = /\/api\/v1\/(gold-settings|gold-bundles|spotlight-plans)(\/|$|\?)/

export async function checkFinancials(page, baseUrl) {
  const defaults = {
    barsPerCedi: 50, dailyRewardBars: 50, adDailyBudgetMinBars: 500, adDailyBudgetMaxBars: 12500, adDurationsDays: [3, 7, 14, 30],
    adCpmBars: 1250, adMinAudience: 100, adFrequencyCapPerDay: 3,
    surveyRewardMinPerResponse: 2, surveyRewardMaxPerResponse: 5, surveyRewardMinBudget: 100, surveyRewardMaxBudget: 1000000,
    surveyThreeFormatsFrom: 550, surveyAnyFormatsFrom: 3000,
  }
  let values = { ...defaults }
  const patches = []
  const bundles = [
    { id: 'handful', name: 'Handful', pricePesewas: 199, priceGhs: 1.99, baseBars: 100, bonusPercent: 0, bonusBars: 0, totalBars: 100, badge: null, sortOrder: 0, active: true, paidPurchases: 8 },
    { id: 'stack', name: 'Stack', pricePesewas: 999, priceGhs: 9.99, baseBars: 500, bonusPercent: 10, bonusBars: 50, totalBars: 550, badge: null, sortOrder: 1, active: true, paidPurchases: 2 },
  ]
  const plans = [{ id: 'week', name: '1 week', days: 7, priceBars: 600, badge: 'Popular', sortOrder: 1, active: true, _count: { purchases: 3 } }]
  // As the server does: a bundle's bars are its price at the exchange rate, plus the bonus.
  const price = (bundle) => {
    bundle.baseBars = Math.max(1, Math.round(bundle.pricePesewas * values.barsPerCedi / 100))
    bundle.bonusBars = Math.round(bundle.baseBars * bundle.bonusPercent / 100)
    bundle.totalBars = bundle.baseBars + bundle.bonusBars
    bundle.priceGhs = bundle.pricePesewas / 100
  }
  const settings = () => ({ values, defaults, updatedAt: '2026-11-04T10:00:00.000Z', updatedBy: { id: 'a-1', email: 'efua@adbox.com', name: 'Efua Ansah' }, audienceSizes: { ALL: 12450, STUDENTS: 9100, ALUMNI: 300 } })

  const route = async (intercepted) => {
    const request = intercepted.request()
    const url = new URL(request.url())
    const path = url.pathname.replace(/^\/api\/v1/, '')
    const method = request.method()
    const reply = (data, status = 200) => intercepted.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) })
    if (method === 'GET' && path === '/gold-settings') return reply(settings())
    if (method === 'PATCH' && path === '/gold-settings') {
      const body = request.postDataJSON()
      patches.push({ path, body })
      values = { ...values, ...body }
      if (body.barsPerCedi !== undefined) bundles.forEach(price)
      return reply(settings())
    }
    if (method === 'GET' && path === '/gold-bundles') return reply(bundles)
    if (method === 'PATCH' && path.startsWith('/gold-bundles/')) {
      const body = request.postDataJSON()
      patches.push({ path, body })
      const bundle = bundles.find(item => item.id === decodeURIComponent(path.split('/').pop()))
      Object.assign(bundle, body)
      price(bundle)
      return reply(bundle)
    }
    if (method === 'GET' && path === '/spotlight-plans') return reply(plans)
    return reply({ message: 'Unexpected ' + method + ' ' + path }, 500)
  }

  const noOverflow = async (label) => {
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1100 })
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, label + ' overflows at ' + width)
    }
    await page.setViewportSize({ width: 1440, height: 1100 })
  }

  await page.route(goldApi, route)
  await page.setViewportSize({ width: 1440, height: 1100 })
  try {
    // Reached from the sidebar, under Financials.
    await page.goto(baseUrl + '/financials/gold-pricing')
    await page.getByRole('heading', { name: 'Gold & pricing', exact: true }).first().waitFor()
    await page.getByRole('navigation', { name: 'Dashboard navigation', exact: true }).getByRole('link', { name: 'Gold & pricing' }).waitFor()
    assert.equal(await page.title(), 'Gold & pricing | AdBox')
    await page.getByText(/Last changed by Efua Ansah/).waitFor()
    await page.getByText('Stack', { exact: true }).waitFor()
    await page.getByText('600 bars · 7 days', { exact: true }).waitFor()
    await noOverflow('/financials/gold-pricing')

    // A survey range widened and a length added; only what changed is sent.
    await page.getByLabel('Most per response').fill('20')
    await page.getByLabel('Add a length in days').fill('5')
    await page.getByRole('button', { name: 'Add', exact: true }).click()
    const unsaved = page.getByRole('region', { name: 'Unsaved changes' })
    await unsaved.getByText('2 changes not saved').waitFor()
    await page.getByTestId('survey-summary').getByText(/Creators pay 2–20 bars a response/).waitFor()
    await unsaved.getByRole('button', { name: 'Save changes' }).click()
    await unsaved.waitFor({ state: 'detached' })
    assert.deepEqual(patches.at(-1), { path: '/gold-settings', body: { surveyRewardMaxPerResponse: 20, adDurationsDays: [3, 5, 7, 14, 30] } })

    // A pair that does not hold together is caught before saving.
    await page.getByLabel('Least per response').fill('30')
    await page.getByText('At least the least per response.').waitFor()
    assert.equal(await page.getByRole('button', { name: 'Save changes' }).isDisabled(), true)
    await page.getByRole('button', { name: 'Discard', exact: true }).click()
    await unsaved.waitFor({ state: 'detached' })

    // Ads in bars: what a plan holds and buys; reach is held to the audience.
    await page.getByTestId('ad-example').getByText(/1,500 bars a day for 7 days holds 10,500 bars \(GHS 210\.00\), buys 8,400 views/).waitFor()
    await page.getByRole('radio', { name: /Alumni/ }).click()
    await page.getByTestId('ad-example').getByText(/reach 300 people — all alumni/).waitFor()
    // A higher price per 1,000 views is saved on its own.
    await page.getByLabel('Bars per 1,000 views').fill('1500')
    await page.getByTestId('ad-example').getByText(/buys 7,000 views/).waitFor()
    await unsaved.getByRole('button', { name: 'Save changes' }).click()
    await unsaved.waitFor({ state: 'detached' })
    assert.deepEqual(patches.at(-1), { path: '/gold-settings', body: { adCpmBars: 1500 } })

    // A bundle is a price and a bonus; its bars come from the exchange rate.
    await page.getByRole('button', { name: 'Edit Stack' }).click()
    const dialog = page.getByRole('dialog')
    assert.equal(await dialog.getByLabel('Base bars').count(), 0)
    await dialog.getByLabel('Bonus (%)').fill('15')
    await dialog.getByTestId('bundle-total').getByText(/GHS 9\.99 is 500 bars; with the 15% bonus, buyers get 575 bars/).waitFor()
    await dialog.getByRole('button', { name: 'Save bundle' }).click()
    await dialog.waitFor({ state: 'detached' })
    assert.deepEqual(patches.at(-1), { path: '/gold-bundles/stack', body: { name: 'Stack', pricePesewas: 999, bonusPercent: 15, badge: null, sortOrder: 1, active: true } })
    await page.getByText('500 + 15%').waitFor()

    // A new exchange rate is previewed on every bundle, then reprices the store.
    await page.getByLabel('Bars per cedi').fill('60')
    const preview = page.getByTestId('reprice-preview')
    await preview.getByText('Saving reprices the store at GHS 1 = 60 bars').waitFor()
    await preview.getByText(/Stack \(GHS 9\.99\): 575 → 689 bars/).waitFor()
    await preview.getByText(/Handful \(GHS 1\.99\): 100 → 119 bars/).waitFor()
    await unsaved.getByRole('button', { name: 'Save changes' }).click()
    await unsaved.waitFor({ state: 'detached' })
    assert.deepEqual(patches.at(-1), { path: '/gold-settings', body: { barsPerCedi: 60 } })
    await page.getByText('599 + 15%').waitFor()

    await setThemeFromSettings(page, baseUrl, 'dark')
    await page.getByLabel('Bars per cedi').waitFor()
    await noOverflow('/financials/gold-pricing (dark)')
    await setThemeFromSettings(page, baseUrl, 'light')
  } finally {
    await page.unroute(goldApi, route)
  }
  console.log('Financials: gold settings saved and checked, audience-capped reach, bundles at the exchange rate and repriced with it, dark mode and responsive layouts passed')
}
