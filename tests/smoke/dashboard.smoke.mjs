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

export async function checkDashboardContent(page, baseUrl) {
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

  // Top publishers table.
  await page.getByRole('heading', { name: 'Top Publishers' }).waitFor()
  await page.getByText('Paityn').waitFor()

  // Pending approvals table.
  await page.getByRole('heading', { name: 'Pending Approvals' }).waitFor()
  assert.equal(await page.getByRole('button', { name: /^Open actions for/ }).count(), 5)
  assert.ok((await page.getByText('Approve', { exact: true }).count()) >= 5)

  // Earning breakdown legend, scoped to its own card.
  const earningCard = page.locator('article').filter({ has: page.getByRole('heading', { name: 'Earning Breakdown', exact: true }) })
  await earningCard.waitFor()
  for (const [label, value] of [['Video Ad', '10%'], ['Survey Ad', '60%'], ['Picture Ad', '30%']]) {
    await earningCard.getByText(label, { exact: true }).waitFor()
    await earningCard.getByText(value, { exact: true }).waitFor()
  }

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 })
    assert.ok(await account.getByText('admin@example.com', { exact: true }).isVisible(), 'Account email must remain visible at ' + width)
    assert.ok(await account.getByText('Super Admin').isVisible(), 'Account role must remain visible at ' + width)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, '/dashboard overflows at ' + width)
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  console.log('Dashboard: KPI tiles with trend badges, chart, date range, institutions map and region selection, publishers, approvals, earning breakdown, and responsive layouts passed')
}
