import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

export async function checkRdiTouchScreens(browser, baseUrl, sessionKey, session) {
  const context = await browser.newContext({ viewport: { width: 320, height: 900 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' })
  const apiRequests = []
  try {
    await context.addInitScript(({ key, value }) => sessionStorage.setItem(key, JSON.stringify(value)), { key: sessionKey, value: session })
    await context.route('**/*', route => {
      const request = route.request()
      if (['xhr', 'fetch'].includes(request.resourceType()) || new URL(request.url()).pathname.startsWith('/api/')) {
        apiRequests.push(request.url())
        return route.abort()
      }
      if (new URL(request.url()).origin !== new URL(baseUrl).origin) return route.abort()
      return route.continue()
    })
    const page = await context.newPage()
    await page.goto(baseUrl + '/rdi/website/media')
    await page.locator('#media-project-grid').waitFor()
    for (const card of await page.locator('#media-project-grid > [role="button"]').all()) {
      const fits = await card.evaluate(card => {
        const image = card.querySelector('.rdi-project-image').getBoundingClientRect()
        const overlay = card.querySelector('.rdi-project-overlay')
        const content = overlay.firstElementChild.firstElementChild.getBoundingClientRect()
        return getComputedStyle(overlay).opacity === '1' && image.right <= card.getBoundingClientRect().right && image.right <= innerWidth && content.top >= image.top && content.bottom <= image.bottom
      })
      assert.ok(fits, 'Touch captions must be visible and fit inside their cards at 320px')
    }
    await page.getByRole('button', { name: 'View Tech Innovation Campaign project details' }).tap()
    await page.getByRole('dialog', { name: 'Tech Innovation Campaign' }).waitFor()
    await page.getByRole('button', { name: 'Close dialog' }).tap()
    await page.getByRole('dialog').waitFor({ state: 'hidden' })
    assert.deepEqual(apiRequests, [])
    console.log('Touch captions, card widths, and project dialogs passed at 320px')
  } finally {
    await context.close()
  }
}

export async function checkRdiScreens(page, baseUrl) {
  const apiRequests = []
  const recordRequest = request => {
    if (['fetch', 'xhr'].includes(request.resourceType()) || request.method() !== 'GET') {
      apiRequests.push(request.method() + ' ' + request.url())
    }
  }
  page.on('request', recordRequest)
  const captureDir = process.env.ADBOX_CAPTURE_DIR
  if (captureDir) await mkdir(captureDir, { recursive: true })

  try {
    for (const [route, heading] of [
      ['', 'Welcome to RichDad Investments'],
      ['/about', 'Three disciplines. One connected vision.'],
      ['/construction', 'Engineering & Construction'],
      ['/media', 'Stories That Move People'],
      ['/solar', 'Smarter solar power for a brighter future'],
      ['/contact', "Let's build, create, and power what's next"],
    ]) {
      await page.setViewportSize({ width: 1730, height: 1000 })
      await page.goto(baseUrl + '/rdi/website' + route)
      const website = page.locator('.rdi-website').first()
      const title = website.locator('h1')
      await title.waitFor()
      assert.equal((await title.innerText()).replace(/\s+/g, ' ').trim(), heading)
      assert.equal(await website.getByRole('navigation', { name: 'Primary navigation', exact: true }).getByRole('link').count(), 6)
      assert.equal(await page.getByRole('navigation', { name: 'Dashboard navigation', exact: true }).getByRole('link', { name: 'RDI', exact: true }).getAttribute('aria-current'), 'page')
      assert.equal(await website.locator('a button, button a, iframe').count(), 0)

      // Load every lazy image, including sections below the fold.
      for (const image of await website.locator('img').all()) {
        await image.scrollIntoViewIfNeeded()
        await image.evaluate(image => image.decode())
        assert.ok((await image.getAttribute('src')).startsWith('/rdi-assets/'))
      }
      for (const width of [1730, 1440, 1024, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 })
        const overflow = await website.evaluate(element => {
          const main = element.closest('main')
          return { document: document.documentElement.scrollWidth > innerWidth, main: main.scrollWidth > main.clientWidth }
        })
        assert.deepEqual(overflow, { document: false, main: false }, '/rdi/website' + route + ' overflows at ' + width)
        if (captureDir && [1730, 390].includes(width)) {
          await page.locator('main').evaluate(main => { main.scrollTop = 0 })
          await page.screenshot({ path: join(captureDir, (route.slice(1) || 'home') + '-' + width + '.png') })
        }
      }
    }

    await page.setViewportSize({ width: 1730, height: 1000 })
    await page.goto(baseUrl + '/rdi/website/about')
    const constructionTab = page.getByRole('tab', { name: 'Construction', exact: true })
    await constructionTab.focus()
    await constructionTab.press('ArrowRight')
    assert.equal(await page.getByRole('tab', { name: 'Media', exact: true }).getAttribute('aria-selected'), 'true')
    await page.getByRole('tabpanel').getByRole('heading', { name: 'Media Division' }).waitFor()
    await page.keyboard.press('End')
    await page.getByRole('tabpanel').getByRole('heading', { name: 'Solar Technology Division' }).waitFor()
    await page.getByRole('tabpanel').getByRole('link').click()
    await page.waitForURL('**/rdi/website/solar')
    await page.getByRole('link', { name: 'Explore Solutions', exact: true }).click()
    await page.waitForURL('**/rdi/website/solar#solar-services')
    const solarFilters = page.getByRole('group', { name: 'Filter solar solutions' })
    const allProducts = await page.locator('#solar-product-grid article').count()
    const secondSolarFilter = solarFilters.getByRole('button').nth(1)
    await secondSolarFilter.click()
    assert.equal(await secondSolarFilter.getAttribute('aria-pressed'), 'true')
    const filteredProducts = await page.locator('#solar-product-grid article').count()
    assert.ok(filteredProducts > 0 && filteredProducts < allProducts)
    await solarFilters.getByRole('button').first().click()
    assert.equal(await page.locator('#solar-product-grid article').count(), allProducts)

    await page.goto(baseUrl + '/rdi/website/media')
    await page.getByRole('group', { name: 'Filter media projects' }).getByRole('button', { name: 'Branding', exact: true }).click()
    assert.equal(await page.locator('#media-project-grid [role="button"]').count(), 2)
    const project = page.getByRole('button', { name: 'View EcoLife Brand Identity project details' })
    await project.focus()
    await project.press('Enter')
    const dialog = page.getByRole('dialog', { name: 'EcoLife Brand Identity' })
    await dialog.waitFor()
    for (let index = 0; index < 4; index++) {
      await page.keyboard.press('Tab')
      assert.ok(await dialog.evaluate(element => element.contains(document.activeElement)), 'Project dialog should trap keyboard focus')
    }
    await page.keyboard.press('Escape')
    await dialog.waitFor({ state: 'hidden' })
    assert.ok(await project.evaluate(element => element === document.activeElement), 'Closing a project should restore focus')
    await project.click()
    await page.getByRole('dialog').getByRole('link', { name: 'Start a Similar Project' }).click()
    await page.waitForURL('**/rdi/website/contact')

    await page.getByRole('button', { name: 'Send Message', exact: true }).click()
    assert.equal(await page.locator('form :invalid').count() > 0, true)
    await page.getByRole('textbox', { name: 'First Name', exact: true }).fill('Alex')
    await page.getByRole('textbox', { name: 'Last Name', exact: true }).fill('Mensah')
    await page.getByRole('textbox', { name: 'Email Address', exact: true }).fill('alex@example.com')
    await page.getByRole('combobox', { name: 'Service Interested In', exact: true }).selectOption({ label: 'Construction Services' })
    await page.getByRole('textbox', { name: 'Message', exact: true }).fill('A local UI check.')
    await page.getByRole('button', { name: 'Send Message', exact: true }).click()
    await page.getByRole('status').filter({ hasText: 'Your message has not been sent.' }).waitFor()
    const faq = page.getByRole('button', { name: 'Which areas do you serve?' })
    await faq.click()
    assert.equal(await faq.getAttribute('aria-expanded'), 'true')
    await faq.click()
    assert.equal(await faq.getAttribute('aria-expanded'), 'false')

    await page.goto(baseUrl + '/rdi/website/construction')
    const step = page.getByRole('button', { name: 'View process step 3', exact: true })
    await step.click()
    assert.equal(await step.getAttribute('aria-pressed'), 'true')
    await page.getByRole('button', { name: /04 Final Delivery/ }).press('Enter')
    assert.equal(await page.getByRole('button', { name: 'View process step 4', exact: true }).getAttribute('aria-pressed'), 'true')

    await page.setViewportSize({ width: 390, height: 1000 })
    await page.locator('main').evaluate(main => { main.scrollTop = 0 })
    await page.getByRole('button', { name: 'Open navigation menu', exact: true }).click()
    await page.getByRole('navigation', { name: 'Mobile navigation', exact: true }).getByRole('link').first().focus()
    await page.keyboard.press('Escape')
    const menuButton = page.getByRole('button', { name: 'Open navigation menu', exact: true })
    assert.equal(await menuButton.getAttribute('aria-expanded'), 'false')
    assert.ok(await menuButton.evaluate(element => element === document.activeElement))
    await menuButton.click()
    await page.getByRole('navigation', { name: 'Mobile navigation', exact: true }).getByRole('link', { name: 'About', exact: true }).click()
    await page.waitForURL('**/rdi/website/about')
    await page.getByRole('heading', { name: 'Three disciplines. One connected vision.', exact: true }).waitFor()
    assert.equal(await page.locator('.rdi-website > header').count(), 1, 'Page navigation must retain exactly one website header')
    assert.equal(await page.getByRole('button', { name: 'Open navigation menu', exact: true }).getAttribute('aria-expanded'), 'false')
    assert.ok(await page.locator('main').evaluate(main => main.scrollTop < 2))
    await page.getByRole('link', { name: 'Website manager', exact: true }).click()
    await page.waitForURL('**/rdi')
    assert.deepEqual(apiRequests, [], 'RDI screens and interactions must not make API requests')
    console.log('Six RDI screens, local assets, responsive layouts, keyboard interactions, filters, preview form, and zero API requests passed')
  } finally {
    page.off('request', recordRequest)
  }
}
