import { openSettingsTab, setThemeFromSettings } from "./theme-helpers.mjs"
import assert from 'node:assert/strict'

export async function checkAppearance(page, baseUrl) {
  const rbacEndpoint = /\/api\/v1\/(admins|roles|permissions)(\?|$)/
  const emptyRbac = route => route.fulfill({ contentType: 'application/json', body: '[]' })
  await page.route(rbacEndpoint, emptyRbac)
  try {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto(baseUrl + '/dashboard')
    await page.getByRole('navigation', { name: 'Dashboard navigation', exact: true }).getByRole('link', { name: 'Settings', exact: true }).click()
    await page.getByRole('heading', { name: 'Appearance', exact: true }).waitFor()
    assert.equal(await page.getByRole('button', { name: /^Switch to (light|dark) mode$/ }).count(), 1)
    await page.getByRole('button', { name: 'Switch to dark mode', exact: true }).click()
    await page.reload()
    await page.getByRole('button', { name: 'Switch to light mode', exact: true }).waitFor()
    const otherTab = await openSettingsTab(page, baseUrl)
    await otherTab.getByRole('button', { name: 'Switch to light mode', exact: true }).waitFor()
    await otherTab.close()

    for (const theme of ['dark', 'light']) {
      if (theme === 'light') await setThemeFromSettings(page, baseUrl, 'light')
      for (const [path, ready, surface] of [
        ['/dashboard', 'text=Total Users', 'article:has-text("Total Users")'],
        ['/manage-admins', 'text=Roles and Permission', 'article'],
        ['/video-management/upload', 'nav[aria-label="Video Management pages"]', 'nav[aria-label="Video Management pages"]'],
        ['/video-management/posts', 'nav[aria-label="Video Management pages"]', 'nav[aria-label="Video Management pages"]'],
        ['/settings', 'h2:has-text("Appearance")', 'header'],
        ['/rdi', 'text=Your website, in one place.', '.rdi-cms > header'],
        ['/rdi/library', 'h1', '.rdi-cms > header'],
        ['/rdi/settings', 'h1', '.rdi-cms > header'],
        ['/rdi/website', '.rdi-website h1', '.rdi-website > header'],
        ['/rdi/website/about', '.rdi-website h1', '.rdi-website > header'],
        ['/rdi/website/construction', '.rdi-website h1', '.rdi-website > header'],
        ['/rdi/website/media', '.rdi-website h1', '.rdi-website > header'],
        ['/rdi/website/solar', '.rdi-website h1', '.rdi-website > header'],
        ['/rdi/website/contact', '.rdi-website h1', '.rdi-website > header'],
      ]) {
        await page.goto(baseUrl + path)
        await page.locator(ready).first().waitFor()
        assert.equal(await page.getByRole('button', { name: /^Switch to (light|dark) mode$/ }).count(), path === '/settings' ? 1 : 0, path + ' theme controls')
        assert.equal(await page.evaluate(() => document.documentElement.classList.contains('dark')), theme === 'dark', path)
        // Assert actual painted surface colors, not only the root theme class.
        const brightness = await page.locator(surface).first().evaluate(element => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          ctx.fillStyle = getComputedStyle(element).backgroundColor
          ctx.fillRect(0, 0, 1, 1)
          return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).reduce((sum, value) => sum + value, 0) / 3
        })
        assert.ok(theme === 'dark' ? brightness < 80 : brightness > 220, `${path} ${theme} surface: ${brightness}`)
        for (const width of [1440, 768, 390, 320]) {
          await page.setViewportSize({ width, height: 1000 })
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${path} overflows at ${width} in ${theme}`)
        }
        if (['/settings', '/dashboard', '/rdi', '/rdi/website', '/manage-admins', '/video-management/upload'].includes(path)) {
          await page.screenshot({ path: `/tmp/adbox-${theme}-${path.slice(1).replaceAll('/', '-')}-mobile.png`, animations: 'disabled' })
          await page.setViewportSize({ width: 1440, height: 1000 })
          if (path === '/settings') {
            // Repaint at the new viewport before capturing the Settings layout.
            await page.reload()
            await page.getByRole('heading', { name: 'Appearance', exact: true }).waitFor()
            assert.equal(await page.locator('main').count(), 1)
            assert.equal(await page.getByRole('heading', { name: 'Settings', exact: true }).count(), 1)
          }
          await page.screenshot({ path: `/tmp/adbox-${theme}-${path.slice(1).replaceAll('/', '-')}.png`, animations: 'disabled' })
        }
      }

      await page.setViewportSize({ width: 1440, height: 1000 })
      await page.goto(baseUrl + '/manage-admins')
      await page.getByRole('tab', { name: 'Admin', exact: true }).click()
      await page.getByRole('button', { name: 'Add Admin', exact: true }).click()
      const dialog = page.getByRole('dialog', { name: 'Add Admin', exact: true })
      await dialog.getByLabel('First Name', { exact: true }).fill('Theme preview')
      await page.screenshot({ path: `/tmp/adbox-${theme}-admin-dialog.png`, animations: 'disabled' })
      await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()

      await page.goto(baseUrl + '/rdi/website/about')
      for (const division of ['Construction', 'Media', 'Solar Technology']) {
        await page.getByRole('tab', { name: division, exact: true }).click()
        const gradient = await page.getByRole('tabpanel').evaluate(element => getComputedStyle(element).backgroundImage)
        assert.equal(gradient.includes('rgb(255, 255, 255)'), theme === 'light', `${division} panel gradient`)
      }
      await page.screenshot({ path: `/tmp/adbox-${theme}-rdi-division.png`, animations: 'disabled' })

      await page.goto(baseUrl + '/video-management/posts')
      await page.getByRole('button', { name: /^View post:/ }).first().click()
      const post = page.getByRole('dialog')
      await post.getByRole('heading', { name: 'Post details', exact: true }).waitFor()
      const descriptionColor = await post.locator('[data-slot="sheet-description"]').evaluate(element => getComputedStyle(element).color)
      assert.equal(descriptionColor, theme === 'dark' ? 'rgb(206, 210, 214)' : 'rgb(103, 110, 118)')
      await post.getByRole('button', { name: 'Close post details', exact: true }).click()

      await page.goto(baseUrl + '/rdi/pages/home')
      const frame = page.frameLocator('iframe[title="Website page preview"]')
      await frame.getByRole('heading', { name: 'Welcome to RichDad Investments', exact: true }).waitFor()
      assert.equal(await frame.locator('html').evaluate(element => element.classList.contains('dark')), theme === 'dark')
      // Open previews synchronize with the app's saved preference via storage events.
      const opposite = theme === 'dark' ? 'light' : 'dark'
      assert.equal(await frame.getByRole('button', { name: /^Switch to (light|dark) mode$/ }).count(), 0)
      await setThemeFromSettings(page, baseUrl, opposite)
      const preview = page.frames().find(frame => frame.url().includes('/rdi/preview/home'))
      await preview.waitForFunction(theme => document.documentElement.classList.contains('dark') === (theme === 'dark'), opposite)
      await setThemeFromSettings(page, baseUrl, theme)
      await page.goto(baseUrl + '/login')
      // Shared smoke verifies the sign-in appearance after logout.
      await page.waitForURL('**/dashboard')
    }
    console.log('Settings-only theme control: both themes across dashboard, admins, videos, RDI/CMS/iframe previews and settings; cross-tab sync, dialogs and 320–1440px layouts passed')
  } finally {
    await page.unroute(rbacEndpoint, emptyRbac)
  }
}
