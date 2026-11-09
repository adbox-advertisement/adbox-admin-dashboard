import assert from 'node:assert/strict'

// Live activity: waiting-work badges in the navigation and the new-work chime setting.
// The socket is not served here (the shared mock aborts it), so this covers the counts
// the dashboard fetches and how they are shown; the socket is covered by unit tests.
export async function checkActivity(page, baseUrl) {
  const countsEndpoint = /\/api\/v1\/activity\/counts$/
  const counts = { adRequests: 3, reportedAds: 1, contentReports: 2, pageRequests: 1, verification: 0, recruitment: 4 }
  await page.route(countsEndpoint, route => route.fulfill({ contentType: 'application/json', body: JSON.stringify(counts) }))
  try {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto(baseUrl + '/settings')
    const nav = page.getByRole('navigation', { name: 'Dashboard navigation', exact: true })

    // A section adds up its entries; an entry with nothing waiting has no badge.
    await nav.getByRole('button', { name: 'Ads Management, 4 waiting', exact: true }).waitFor()
    await nav.getByRole('button', { name: 'User Content, 2 waiting', exact: true }).waitFor()
    await nav.getByRole('button', { name: 'Manage Users, 1 waiting', exact: true }).waitFor()
    await nav.getByRole('link', { name: 'Recruitment, 4 waiting', exact: true }).waitFor()
    await nav.getByRole('button', { name: 'Financials', exact: true }).waitFor()
    await nav.getByRole('button', { name: 'Ads Management, 4 waiting', exact: true }).click()
    await nav.getByRole('link', { name: 'Ad Requests, 3 waiting', exact: true }).waitFor()
    await nav.getByRole('link', { name: 'Reported Ads, 1 waiting', exact: true }).waitFor()
    await nav.getByRole('button', { name: 'Manage Users, 1 waiting', exact: true }).click()
    await nav.getByRole('link', { name: 'Page requests, 1 waiting', exact: true }).waitFor()
    await nav.getByRole('link', { name: 'Verification', exact: true }).waitFor()
    await page.screenshot({ path: '/tmp/adbox-activity-sidebar.png', animations: 'disabled' })

    // The chime can be turned off, and the choice survives a reload.
    const notifications = page.getByRole('region', { name: 'Notifications', exact: true })
    assert.equal(await notifications.getByRole('status').textContent(), 'Sound is on')
    await notifications.getByRole('button', { name: 'Turn sound off', exact: true }).click()
    assert.equal(await notifications.getByRole('status').textContent(), 'Sound is off')
    await page.reload()
    await notifications.getByRole('button', { name: 'Turn sound on', exact: true }).click()
    assert.equal(await notifications.getByRole('status').textContent(), 'Sound is on')
    await notifications.getByRole('button', { name: 'Play sound', exact: true }).click()

    // On a phone the sidebar hides behind the menu button, which says work is waiting.
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 900 })
      const menu = page.getByRole('button', { name: 'Open navigation, 11 waiting', exact: true })
      await menu.click()
      const sheet = page.getByRole('dialog')
      await sheet.getByRole('link', { name: 'Recruitment, 4 waiting', exact: true }).waitFor()
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `activity badges overflow at ${width}`)
      if (width === 390) await page.screenshot({ path: '/tmp/adbox-activity-mobile.png', animations: 'disabled' })
      await page.keyboard.press('Escape')
      await sheet.waitFor({ state: 'hidden' })
    }
    await page.setViewportSize({ width: 1440, height: 1000 })
    console.log('Waiting-work badges, mobile menu dot and the new-work sound setting passed')
  } finally {
    await page.unroute(countsEndpoint)
  }
}
