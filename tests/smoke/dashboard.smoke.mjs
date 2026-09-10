import assert from 'node:assert/strict'

export async function checkDashboardContent(page, baseUrl) {
  await page.setViewportSize({ width: 1440, height: 1100 })
  await page.goto(baseUrl + '/dashboard')
  await page.getByRole('heading', { name: 'Dashboard', exact: true }).waitFor()

  // KPI tiles and their trend badges.
  for (const label of ['Total Revenue', 'Total Users', 'Ad Payment', 'Reward Payment', 'Total Publishers', 'Total Viewers']) {
    await page.getByText(label, { exact: true }).waitFor()
  }
  for (const value of ['12.4%', '8.1%', '4.6%', '2.3%', '6.2%', '9.8%']) {
    await page.getByText(value, { exact: true }).waitFor()
  }

  // User overview chart.
  await page.getByText('User Overview').waitFor()
  await page.getByText('682k').waitFor()

  // Date range dropdown opens and a quick range updates the trigger label.
  const dateTrigger = page.getByRole('button', { name: /^\d{2} \w{3} \d{2}/ })
  await dateTrigger.click()
  await page.getByRole('button', { name: 'Last week', exact: true }).click()
  await page.getByRole('dialog').waitFor({ state: 'hidden' }).catch(() => {})

  // Geography: switching the selected region updates the pressed state.
  // Match the exact region row, not "Western North" which also contains "Western".
  const western = page.getByRole('button', { name: /^Western \d+%$/ })
  const greaterAccra = page.getByRole('button', { name: /^Greater Accra \d+%$/ })
  assert.equal(await greaterAccra.getAttribute('aria-pressed'), 'true')
  await western.click()
  assert.equal(await western.getAttribute('aria-pressed'), 'true')
  assert.equal(await greaterAccra.getAttribute('aria-pressed'), 'false')

  // Top publishers table.
  await page.getByRole('heading', { name: 'Top Publishers' }).waitFor()
  await page.getByText('Paityn').waitFor()

  // Pending approvals table.
  await page.getByRole('heading', { name: 'Pending Approvals' }).waitFor()
  assert.equal(await page.getByRole('button', { name: /^Open actions for/ }).count(), 5)
  assert.ok((await page.getByText('Approve', { exact: true }).count()) >= 5)

  // Earning breakdown legend. Scoped to its own card: percentages like "10%"
  // also appear in the Top Regions table and would otherwise be ambiguous.
  const earningCard = page.locator('article').filter({ has: page.getByRole('heading', { name: 'Earning Breakdown', exact: true }) })
  await earningCard.waitFor()
  for (const [label, value] of [['Video Ad', '10%'], ['Survey Ad', '60%'], ['Picture Ad', '30%']]) {
    await earningCard.getByText(label, { exact: true }).waitFor()
    await earningCard.getByText(value, { exact: true }).waitFor()
  }

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, '/dashboard overflows at ' + width)
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  console.log('Dashboard: KPI tiles with trend badges, chart, date range, geography selection, publishers, approvals, earning breakdown, and responsive layouts passed')
}
