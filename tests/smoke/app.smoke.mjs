import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { checkRdiScreens, checkRdiTouchScreens } from './rdi.smoke.mjs'
import { checkRdiCms } from './rdi-cms.smoke.mjs'

// Run against a local dev or preview server. All API requests are intercepted.
const baseUrl = process.env.ADBOX_TEST_URL ?? 'http://127.0.0.1:5173'
const browser = await chromium.launch({ channel: process.env.ADBOX_BROWSER_CHANNEL ?? 'chrome', headless: true })
const sessionKey = 'adbox-super-admin-session'
const session = { accessToken: 'smoke-access', refreshToken: 'smoke-refresh', tokenType: 'Bearer', expiresIn: 900 }
let loginAllowed = false
let refreshCount = 0
const unexpectedRequests = []
const runtimeErrors = []

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
  await context.route('**/*', async route => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.pathname.startsWith('/api/')) {
      const reply = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) })
      if (url.pathname.endsWith('/auth/login')) return reply(loginAllowed ? session : { message: 'Invalid credentials' }, loginAllowed ? 200 : 401)
      if (url.pathname.endsWith('/auth/logout')) return reply({ message: 'Server unavailable' }, 503)
      if (url.pathname.endsWith('/auth/refresh')) {
        refreshCount++
        await new Promise(resolve => setTimeout(resolve, 100))
        return reply({ ...session, accessToken: 'smoke-refreshed' })
      }
      unexpectedRequests.push(request.method() + ' ' + url.pathname)
      return reply({}, 500)
    }
    if (url.origin !== new URL(baseUrl).origin) return route.abort()
    return route.continue()
  })
  const page = await context.newPage()
  page.setDefaultTimeout(15_000)
  page.on('pageerror', error => runtimeErrors.push(error.message))
  page.on('console', message => { if (message.type() === 'error' && /same key|unique.*key/i.test(message.text())) runtimeErrors.push(message.text()) })
  const startupScripts = []
  page.on('request', request => { if (request.resourceType() === 'script') startupScripts.push(request.url()) })
  await page.goto(baseUrl + '/login')
  await page.getByRole('button', { name: 'Sign in', exact: true }).waitFor()
  assert.equal(startupScripts.some(url => /DashboardPage|RdiWebsiteLayout|RdiHomePage|VideoUploadPage|charts-/.test(url)), false, 'Feature bundles should load on demand')
  await page.goto(baseUrl + '/video-management/upload')
  await page.waitForURL('**/login')
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('admin@example.com')
  await page.getByLabel('Password', { exact: true }).fill('test-password')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.getByRole('alert').waitFor()
  assert.equal(refreshCount, 0, 'Failed login must not refresh a session')
  loginAllowed = true
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.waitForURL('**/dashboard')
  await page.getByRole('heading', { name: 'Dashboard', exact: true }).waitFor()
  assert.equal(await page.title(), 'Dashboard | AdBox')
  console.log('Lazy startup, protected routes, failed sign-in, and successful sign-in passed')

  for (const [path, title] of [
    ['/manage-users', 'Manage Users'], ['/ads-management', 'Ads Management'],
    ['/ads-management/ad-requests', 'Ad Requests'], ['/ads-management/reported-ads', 'Reported Ads'],
    ['/financials', 'Financials'], ['/financials/advertisers-payment', 'Advertisers Payment'],
    ['/financials/withdrawals', 'Withdrawals'], ['/support', 'Support'], ['/manage-admins', 'Manage Admins'], ['/settings', 'Settings'],
  ]) {
    await page.goto(baseUrl + path)
    await page.getByRole('heading', { name: title, exact: true }).waitFor()
    assert.equal(await page.getByRole('navigation', { name: 'Dashboard navigation', exact: true }).count(), 1)
  }
  for (const path of ['/dashboard', '/video-management/upload', '/video-management/posts', '/settings']) {
    await page.goto(baseUrl + path)
    await page.locator('#page-content').waitFor()
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 })
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, path + ' overflows at ' + width)
    }
  }
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
  const mobileNav = page.getByRole('dialog')
  await mobileNav.getByRole('link', { name: 'Dashboard', exact: true }).click()
  await mobileNav.waitFor({ state: 'hidden' })
  await page.getByRole('heading', { name: 'Dashboard', exact: true }).waitFor()
  console.log('All planned routes, shared page shell, mobile navigation, and responsive layouts passed')

  await checkRdiScreens(page, baseUrl)
  await checkRdiTouchScreens(browser, baseUrl, sessionKey, session)
  await checkRdiCms(page, baseUrl)

  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.getByRole('button', { name: 'Log Out', exact: true }).click()
  await page.waitForURL('**/login')
  assert.equal(await page.evaluate(key => sessionStorage.getItem(key), sessionKey), null)
  await page.goto(baseUrl + '/dashboard')
  await page.waitForURL('**/login')
  await page.evaluate(key => sessionStorage.setItem(key, '{invalid'), sessionKey)
  await page.goto(baseUrl + '/dashboard')
  await page.waitForURL('**/login')
  await page.goto(baseUrl + '/missing-page')
  await page.getByRole('heading', { name: 'Page not found', exact: true }).waitFor()
  assert.deepEqual(unexpectedRequests, [])
  assert.deepEqual(runtimeErrors, [])
  console.log('Logout despite server failure, malformed session recovery, and not-found handling passed; no runtime errors')
} finally {
  await browser.close()
}
