import assert from 'node:assert/strict'
import { chromium } from 'playwright'

// Run against a local dev or preview server. All API requests are intercepted.
const baseUrl = process.env.ADBOX_TEST_URL ?? 'http://127.0.0.1:5173'
const browser = await chromium.launch({ channel: process.env.ADBOX_BROWSER_CHANNEL ?? 'chrome', headless: true })
const sessionKey = 'adbox-super-admin-session'
const session = { accessToken: 'smoke-access', refreshToken: 'smoke-refresh', tokenType: 'Bearer', expiresIn: 900 }
const labels = ['Home', 'About', 'Construction', 'Media', 'Solar', 'Contact']
let pages = labels.map(label => ({
  id: label.toLowerCase(), key: label.toLowerCase(), name: label, navigationLabel: label,
  slug: label === 'Home' ? '/' : '/' + label.toLowerCase(), version: 1,
  content: {
    seo: { title: label, description: 'Browser test fixture', noIndex: true },
    blocks: [{ key: label.toLowerCase() + '-hero', type: 'hero', name: label + ' introduction', visible: true, order: 0,
      content: { eyebrow: 'Welcome', title: 'Explore ' + label, description: 'A local browser test.' }, items: [] }],
  },
}))
const site = {
  id: 'rdi', key: 'rdi', version: 1,
  settings: {
    branding: { siteName: 'RDI' }, navigation: [],
    footer: { description: 'Local test footer', columns: [], socialLinks: [], copyright: 'RDI',
      contact: { heading: 'Contact', address: 'Accra', phone: '+233000000000', email: 'test@example.com' } },
  },
}
let loginAllowed = false
let refreshCount = 0
let refreshCms = false
let failAfterRefresh = false
let saveCount = 0
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
      if (url.pathname.includes('/cms/sites/rdi')) {
        if (refreshCms && request.headers().authorization !== 'Bearer smoke-refreshed') return reply({}, 401)
        if (refreshCms && failAfterRefresh) { failAfterRefresh = false; return reply({}, 500) }
        if (request.method() === 'PATCH' && url.pathname.endsWith('/draft')) {
          const body = request.postDataJSON()
          const key = url.pathname.split('/').at(-2)
          const current = pages.find(page => page.key === key)
          assert.equal(body.baseVersion, current.version)
          assert.equal(request.headers()['if-match'], '"draft:' + current.version + '"')
          assert.ok(request.headers()['idempotency-key'])
          const blocks = body.operations.find(operation => operation.op === 'replace' && operation.path === '/blocks').value
          const saved = { ...current, version: current.version + 1, content: { ...current.content, blocks } }
          pages = pages.map(page => page.key === key ? saved : page)
          saveCount++
          return reply(saved)
        }
        if (request.method() === 'GET' && url.pathname.endsWith('/pages')) return reply(pages)
        if (request.method() === 'GET' && url.pathname.endsWith('/rdi')) return reply(site)
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
  const startupScripts = []
  page.on('request', request => { if (request.resourceType() === 'script') startupScripts.push(request.url()) })
  await page.goto(baseUrl + '/login')
  await page.getByRole('button', { name: 'Sign in', exact: true }).waitFor()
  assert.equal(startupScripts.some(url => /DashboardPage|RdiCmsPage|VideoUploadPage|charts-/.test(url)), false, 'Feature bundles should load on demand')
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

  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(baseUrl + '/rdi')
  await page.getByText('All changes saved to the RDI CMS', { exact: true }).waitFor()
  assert.equal(await page.getByRole('navigation', { name: 'RDI website pages' }).getByRole('button').count(), 6)
  await page.getByRole('button', { name: 'Editor', exact: true }).click()
  await page.getByRole('textbox', { name: 'Heading', exact: true }).fill('Reviewed browser draft')
  await page.getByText('Unsaved changes', { exact: true }).waitFor()
  const savedResponse = page.waitForResponse(response => response.request().method() === 'PATCH')
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await savedResponse
  await page.getByText(/^(All changes saved to the RDI CMS|Draft saved to the RDI CMS)$/).waitFor()
  assert.equal(saveCount, 1)
  assert.equal(pages[0].content.blocks[0].content.title, 'Reviewed browser draft')
  await page.getByRole('button', { name: 'Preview', exact: true }).click()
  await page.frameLocator('iframe[title="RDI website desktop preview"]').getByRole('heading', { name: 'Reviewed browser draft', exact: true }).waitFor()
  await page.getByRole('button', { name: /Global footer/ }).click()
  await page.getByRole('heading', { name: 'Footer navigation', exact: true }).waitFor()
  await page.setViewportSize({ width: 390, height: 1000 })
  await page.getByRole('button', { name: 'Open dashboard navigation', exact: true }).click()
  await page.getByRole('dialog').getByRole('link', { name: 'Dashboard', exact: true }).click()
  await page.getByRole('heading', { name: 'Dashboard', exact: true }).waitFor()
  console.log('CMS loading, editor changes, versioned draft save, preview, footer, and mobile navigation passed')

  refreshCms = true
  failAfterRefresh = true
  await page.goto(baseUrl + '/rdi')
  await page.getByText('All changes saved to the RDI CMS', { exact: true }).waitFor()
  assert.equal(refreshCount, 1, 'Concurrent unauthorized requests should share one refresh')
  assert.equal(await page.evaluate(key => JSON.parse(sessionStorage.getItem(key)).accessToken, sessionKey), 'smoke-refreshed')
  console.log('Concurrent token refresh and recoverable API failure passed')

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
