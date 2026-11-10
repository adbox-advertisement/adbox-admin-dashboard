import assert from 'node:assert/strict'

// Rewards runs on sample data: no API requests, so nothing is routed here.
export async function checkRewards(page, baseUrl) {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(baseUrl + '/rewards')
  await page.getByRole('heading', { name: 'Rewards', exact: true }).waitFor()
  await page.getByRole('region', { name: 'About this page' }).getByText('Sample data.').waitFor()

  // The sidebar groups the sections under Rewards.
  const nav = page.getByRole('navigation', { name: 'Dashboard navigation', exact: true })
  await nav.getByRole('group', { name: 'To review' }).getByRole('link', { name: 'Redemption requests' }).waitFor()
  await nav.getByRole('link', { name: 'Partners', exact: true }).waitFor()

  // The oldest waiting request opens beside the list from the overview.
  await page.getByRole('region', { name: 'Waiting for you' }).getByRole('link', { name: /MTN data 1\.5 GB/ }).click()
  await page.waitForURL('**/rewards/requests?open=r-2052')
  const sheet = page.getByRole('dialog', { name: 'RDM-2052' })
  await sheet.getByRole('button', { name: 'Approve and send' }).click()
  // The page's message sits behind the sheet; the sheet announces it too.
  await sheet.getByRole('status').filter({ hasText: 'RDM-2052 approved. MTN is sending the top-up' }).waitFor({ state: 'attached' })
  // The top-up lands a moment later.
  await sheet.getByText(/^MTN reference MTN-TXN-\d{6}$/).waitFor({ timeout: 10_000 })
  await sheet.getByRole('button', { name: 'Next waiting request' }).click()
  await page.getByRole('dialog', { name: 'RDM-2053' }).getByText('No codes left for this voucher: add codes before approving.').waitFor()
  await page.keyboard.press('Escape')

  // A risky request is rejected with a reason and its gold goes back.
  const list = page.getByRole('list', { name: 'Waiting requests' })
  await list.getByRole('button', { name: 'Review RDM-2060' }).click()
  const risky = page.getByRole('dialog', { name: 'RDM-2060' })
  await risky.getByText('059 555 0199 is also the number on @joeb.gh.').waitFor()
  await risky.getByRole('button', { name: 'Reject…' }).click()
  await risky.getByRole('combobox', { name: 'Reason' }).click()
  await page.getByRole('option', { name: 'Suspected abuse' }).click()
  await risky.getByRole('button', { name: 'Reject and return the gold' }).click()
  await risky.getByRole('status').filter({ hasText: 'RDM-2060 rejected. 2,300 bars went back to @prince.b99.' }).waitFor({ state: 'attached' })
  await risky.getByText(/^Rejected by You/).waitFor()
  await page.keyboard.press('Escape')

  // Approve all the all-clear requests at once.
  await page.getByRole('button', { name: /^Approve all \d+$/ }).click()
  const confirm = page.getByRole('dialog', { name: /all-clear requests\?$/ })
  await confirm.getByRole('button', { name: /^Approve \d+$/ }).click()
  await page.getByText(/^Approved \d+ all-clear requests\./).waitFor()
  await page.getByRole('region', { name: 'All-clear requests' }).waitFor({ state: 'detached' })
  assert.equal(await list.getByRole('button', { name: /^Approve RDM-/ }).count(), 0)

  // Statuses live in the address.
  await page.getByRole('radio', { name: /^All \d+/ }).click()
  await page.waitForURL('**/rewards/requests?status=all')
  await page.getByRole('list', { name: 'All requests' }).waitFor()

  // A voucher out of codes gets a fresh batch on Melcom's page.
  await page.goto(baseUrl + '/rewards/partners')
  await page.getByRole('link', { name: 'Melcom, active' }).click()
  await page.getByRole('heading', { name: /^Melcom/, level: 1 }).waitFor()
  await page.getByRole('button', { name: 'Add codes for Melcom voucher GH₵ 20' }).click()
  const codes = page.getByRole('dialog', { name: 'Add codes for Melcom voucher GH₵ 20' })
  await codes.getByRole('textbox', { name: 'Codes' }).fill('SMOKE-0001\nSMOKE-0002\nSMOKE-0003')
  await codes.getByRole('button', { name: 'Add 3 codes' }).click()
  await page.getByText('Added 3 codes to Melcom voucher GH₵ 20.').waitFor()
  await page.getByText('3 codes left, running low').waitFor()

  // The catalog switches a reward off.
  await page.goto(baseUrl + '/rewards/catalog')
  const toggle = page.getByRole('switch', { name: 'AT data 10 GB on offer' })
  assert.equal(await toggle.getAttribute('aria-checked'), 'false')
  await toggle.click()
  await page.waitForFunction(() => document.querySelector('[aria-label="AT data 10 GB on offer"]')?.getAttribute('aria-checked') === 'true')

  // Reset puts the sample back.
  await page.getByRole('button', { name: 'Reset sample' }).click()
  await page.waitForFunction(() => document.querySelector('[aria-label="AT data 10 GB on offer"]')?.getAttribute('aria-checked') === 'false')

  for (const path of ['/rewards', '/rewards/requests', '/rewards/catalog', '/rewards/partners', '/rewards/partners/p-mtn']) {
    await page.goto(baseUrl + path)
    await page.locator('#page-content').waitFor()
    await page.getByRole('region', { name: 'About this page' }).waitFor()
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 })
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, path + ' overflows at ' + width)
    }
    await page.setViewportSize({ width: 1440, height: 1000 })
  }
  console.log('Rewards: sample banner, sidebar sections, overview to request, top-up delivery, next request, reject with reason, approve all-clear, status in the address, voucher codes, catalog switch, reset, and responsive layouts passed')
}
