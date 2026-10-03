import { setThemeFromSettings } from "./theme-helpers.mjs"
import assert from 'node:assert/strict'

// Synthetic applications only. Every recruitment request stays inside this fixture.
export async function checkRecruitment(page, baseUrl) {
  const campaign = { id: '40000000-0000-4000-8000-000000000001', slug: 'campus-reps-2026', title: 'Campus Representatives 2026', referenceCode: 'CR26', opensAt: '2026-09-29T00:00:00.000Z', closesAt: '2026-12-20T23:59:59.000Z', isActive: true, isOpen: true, positionsPerCampus: 2, stipendNote: null, applicationCount: 25 }
  const institutions = [
    { id: '60000000-0000-4000-8000-000000000001', slug: 'ug', name: 'University of Ghana', shortName: 'UG', region: 'Greater Accra' },
    { id: '60000000-0000-4000-8000-000000000002', slug: 'knust', name: 'Kwame Nkrumah University of Science and Technology', shortName: 'KNUST', region: 'Ashanti' },
    { id: '60000000-0000-4000-8000-000000000003', slug: 'ucc', name: 'University of Cape Coast', shortName: 'UCC', region: 'Central' },
  ]
  const statuses = ['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEWED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN']
  const names = ['Ama Mensah', 'Kwame Asante', 'Abena Owusu', 'Kofi Boateng', 'Akosua Appiah', 'Yaw Osei', 'Efua Arthur']
  const applications = Array.from({ length: 25 }, (_, i) => ({
    id: `50000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`, reference: `ADBX-CR26-${String(i + 1).padStart(4, '0')}`, status: statuses[i % statuses.length],
    fullName: i < names.length ? names[i] : `Test Candidate ${i + 1}`, email: `candidate${i + 1}@example.com`, phone: '+233500000001',
    createdAt: '2026-10-02T10:00:00.000Z', updatedAt: '2026-10-02T10:00:00.000Z', rating: i === 0 ? null : i % 3 + 3,
    reviewedAt: null, reviewedByAdminId: null, reviewedBy: null, redactedAt: null, campaign, institution: institutions[i % 3], campusId: null,
    programme: 'BSc Computer Science, Year 3', campusReach: 'Legon Hall, the library, and my department.', motivation: 'Help students find useful opportunities on campus.',
    experience: 'Organised a coding workshop attended by 30 students.', availability: 'Four hours on Tuesdays and Saturdays.', otherRoles: 'Secretary of the coding club.',
    phoneModel: 'Samsung Galaxy A15, Android', paymentAnswer: 'I would explain AdBox without promising guaranteed earnings.', comfortable: false, honesty: true, internalNote: null,
    video: { id: `video-${i}`, status: 'READY', fileName: 'introduction.webm', mimeType: 'video/webm', byteSize: 2000000, durationSeconds: 24.5, completedAt: '2026-10-02T09:59:00.000Z' },
    events: [{ id: `event-${i}`, fromStatus: null, toStatus: 'SUBMITTED', note: null, actorAdminId: null, actor: null, createdAt: '2026-10-02T10:00:00.000Z' }],
  }))
  let failNote = true
  let videoRequests = 0
  let exportFilters
  const unexpected = []
  const endpoint = /\/api\/v1\/recruitment\//
  const handler = async route => {
    const request = route.request()
    const url = new URL(request.url())
    const tail = url.pathname.split('/recruitment/')[1]
    const reply = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) })
    assert.match(request.headers().authorization ?? '', /^Bearer /)
    const filtered = applications.filter(item => (!url.searchParams.get('campaignId') || item.campaign.id === url.searchParams.get('campaignId')) && (!url.searchParams.get('institutionId') || item.institution.id === url.searchParams.get('institutionId')) && (!url.searchParams.get('status') || item.status === url.searchParams.get('status')) && (!url.searchParams.get('search') || `${item.fullName} ${item.email} ${item.reference}`.toLowerCase().includes(url.searchParams.get('search').toLowerCase())))
    if (tail === 'campaigns') return reply([campaign])
    if (tail === 'applications/stats') return reply({ total: applications.length, byStatus: Object.fromEntries(statuses.map(status => [status, applications.filter(item => item.status === status).length])), byInstitution: institutions.map(institution => ({ institutionId: institution.id, slug: institution.slug, name: institution.name, count: applications.filter(item => item.institution.id === institution.id).length })) })
    if (tail === 'applications/export') {
      exportFilters = Object.fromEntries(url.searchParams)
      return route.fulfill({ contentType: 'text/csv', body: '"reference","status"\n"ADBX-CR26-0001","UNDER_REVIEW"\n' })
    }
    if (tail === 'applications') {
      const currentPage = Number(url.searchParams.get('page') || 1)
      const limit = Number(url.searchParams.get('limit') || 20)
      return reply({ items: filtered.slice((currentPage - 1) * limit, currentPage * limit), total: filtered.length, page: currentPage, limit })
    }
    const [, id, action] = tail.split('/')
    const application = applications.find(item => item.id === id)
    if (application && action === 'video-url') { videoRequests++; return reply({ url: baseUrl + '/__recruitment-test-video.webm', expiresInSeconds: 300 }) }
    if (application && request.method() === 'GET') return reply(application)
    if (application && request.method() === 'PATCH') {
      if (failNote) { failNote = false; return reply({ message: 'Temporary failure' }, 503) }
      Object.assign(application, request.postDataJSON())
      return reply(application)
    }
    if (application && action === 'status' && request.method() === 'POST') {
      const data = request.postDataJSON()
      application.events.push({ id: `decision-${Date.now()}`, fromStatus: application.status, toStatus: data.status, note: data.note, actorAdminId: 'admin', actor: { id: 'admin', email: 'reviewer@example.com', firstName: 'Review', lastName: 'Team' }, createdAt: '2026-10-03T10:00:00.000Z' })
      application.status = data.status
      application.reviewedAt = '2026-10-03T10:00:00.000Z'
      return reply(application)
    }
    unexpected.push(request.method() + ' ' + tail)
    return reply({}, 500)
  }
  await page.route(endpoint, handler)
  await page.route('**/__recruitment-test-video.webm', route => route.fulfill({ status: 404 }))
  await page.setViewportSize({ width: 1440, height: 1050 })
  await page.goto(baseUrl + '/recruitment')
  await page.getByRole('button', { name: 'Review Ama Mensah', exact: true }).waitFor()
  assert.equal(await page.title(), 'Recruitment | AdBox')
  assert.equal(await page.getByRole('button', { name: /^Switch to (light|dark) mode$/ }).count(), 0)
  await page.getByRole('button', { name: 'Review new applications', exact: true }).and(page.locator(':enabled')).waitFor()
  await page.screenshot({ path: '/tmp/adbox-recruitment-light-desktop.png', fullPage: true, animations: 'disabled' })
  await setThemeFromSettings(page, baseUrl, 'dark')
  await page.waitForFunction(() => document.documentElement.classList.contains('dark'))
  await page.reload()
  await page.getByRole('button', { name: 'Review Ama Mensah', exact: true }).waitFor()
  assert.equal(await page.evaluate(() => localStorage.getItem('adbox-theme')), 'dark')
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains('dark')), true)
  await page.getByRole('heading', { name: 'Great people. Stronger campuses.', exact: true }).waitFor()
  await page.getByRole('button', { name: 'Review new applications', exact: true }).and(page.locator(':enabled')).waitFor()
  await page.screenshot({ path: '/tmp/adbox-recruitment-dark-desktop.png', fullPage: true, animations: 'disabled' })
  await page.getByRole('button', { name: 'Next page', exact: true }).click()
  await page.getByText('11–20 of 25 candidates', { exact: true }).waitFor()
  await page.getByRole('button', { name: 'Previous page', exact: true }).click()
  await page.getByRole('button', { name: 'Review Ama Mensah', exact: true }).click()
  const profile = page.getByRole('dialog')
  assert.equal(await profile.getByRole('button', { name: /^Switch to (light|dark) mode$/ }).count(), 0)
  await profile.getByText(applications[0].paymentAnswer, { exact: true }).waitFor()
  for (const field of ['programme', 'campusReach', 'motivation', 'experience', 'availability', 'otherRoles', 'phoneModel']) await profile.getByText(applications[0][field], { exact: true }).waitFor()
  assert.equal(videoRequests, 0)
  await page.screenshot({ path: '/tmp/adbox-recruitment-dark-profile.png', animations: 'disabled' })
  await profile.getByRole('button', { name: 'Watch introduction' }).click()
  await profile.getByRole('button', { name: 'Get a new video link' }).waitFor()
  assert.equal(videoRequests, 1)
  await profile.getByRole('tab', { name: 'Review', exact: true }).click()
  await profile.getByLabel('Internal note', { exact: true }).fill('Strong campus network; verify weekly availability.')
  await profile.getByRole('radio', { name: '4 out of 5' }).check({ force: true })
  await profile.getByRole('tab', { name: 'Application', exact: true }).click()
  await profile.getByRole('tab', { name: 'Review', exact: true }).click()
  assert.equal(await profile.getByLabel('Internal note', { exact: true }).inputValue(), 'Strong campus network; verify weekly availability.')
  await profile.getByRole('button', { name: 'Save assessment' }).click()
  await profile.getByRole('alert').waitFor()
  await profile.getByRole('button', { name: 'Save assessment' }).click()
  await profile.getByRole('alert').waitFor({ state: 'hidden' })
  assert.equal(applications[0].rating, 4)
  await profile.getByRole('button', { name: 'Update review stage' }).click()
  await profile.getByRole('combobox', { name: 'Next review stage' }).filter({ hasText: 'Shortlisted' }).waitFor()
  assert.equal(applications[0].status, 'UNDER_REVIEW')
  await profile.getByRole('tab', { name: 'History' }).click()
  await profile.getByText('Submitted → Under review', { exact: true }).waitFor()
  await profile.getByRole('tab', { name: 'Contact' }).click()
  await profile.getByRole('combobox', { name: 'Response template' }).click()
  await page.getByRole('option', { name: 'Interview invitation', exact: true }).click()
  assert.match(await profile.getByLabel('Message', { exact: true }).inputValue(), /Add date, time and time zone/)
  assert.match(await profile.getByRole('link', { name: 'Open email draft' }).getAttribute('href'), /^mailto:/)
  for (const theme of ['dark', 'light']) {
    if (theme === 'light') await setThemeFromSettings(page, baseUrl, 'light')
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 })
      for (const tab of ['Application', 'Review', 'Contact', 'History']) {
        await profile.getByRole('tab', { name: tab, exact: true }).click()
        assert.equal(await profile.evaluate(element => element.scrollWidth > element.clientWidth), false, `Candidate ${tab} overflows at ${width} in ${theme} mode`)
      }
    }
  }
  await profile.getByRole('button', { name: 'Close candidate profile' }).click()
  for (const theme of ['light', 'dark']) {
    if (theme === 'dark') await setThemeFromSettings(page, baseUrl, 'dark')
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 })
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Recruitment overflows at ${width} in ${theme} mode`)
    }
    await page.screenshot({ path: `/tmp/adbox-recruitment-${theme}-mobile.png`, fullPage: true })
  }
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
  const navigation = page.getByRole('dialog')
  assert.equal(await navigation.getByRole('link', { name: 'Recruitment', exact: true }).count(), 1)
  await navigation.getByRole('button', { name: 'Close navigation' }).click()
  await navigation.waitFor({ state: 'detached' })
  await page.setViewportSize({ width: 1440, height: 1050 })
  await page.getByRole('textbox', { name: 'Search candidates' }).fill('Ama')
  await page.getByText('1–1 of 1 candidates', { exact: true }).waitFor()
  await page.getByRole('button', { name: 'Export CSV', exact: true }).click()
  const exportDialog = page.getByRole('dialog')
  await exportDialog.getByText(/Text search is not applied/).waitFor()
  const download = page.waitForEvent('download')
  await exportDialog.getByRole('button', { name: 'Download CSV' }).click()
  await download
  assert.equal(exportFilters.search, undefined)
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await page.getByRole('button', { name: 'Filter by University of Ghana', exact: true }).click()
  await page.getByText('1–9 of 9 candidates', { exact: true }).waitFor()
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await page.getByRole('combobox', { name: 'Per page' }).click()
  await page.getByRole('option', { name: '20', exact: true }).click()
  await page.getByText('1–20 of 25 candidates', { exact: true }).waitFor()
  await page.getByRole('button', { name: 'Review new applications', exact: true }).click()
  await page.getByText('1–3 of 3 candidates', { exact: true }).waitFor()
  await page.getByRole('button', { name: 'Remove stage filter', exact: true }).click()
  await page.getByRole('button', { name: 'Show shortlisted', exact: true }).click()
  await page.getByText('1–4 of 4 candidates', { exact: true }).waitFor()
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await page.reload()
  await page.getByRole('button', { name: 'Review Ama Mensah', exact: true }).click()
  await profile.getByRole('tab', { name: 'Review', exact: true }).click()
  assert.equal(await profile.getByLabel('Internal note', { exact: true }).inputValue(), applications[0].internalNote)
  await profile.getByRole('button', { name: 'Close candidate profile' }).click()
  await page.goto(baseUrl + '/settings')
  await page.getByRole('heading', { name: 'Settings', exact: true }).waitFor()
  await page.waitForFunction(() => document.documentElement.classList.contains('dark'))
  assert.equal(await page.evaluate(() => localStorage.getItem('adbox-theme')), 'dark')
  await page.goto(baseUrl + '/recruitment')
  await page.getByRole('button', { name: 'Review Ama Mensah', exact: true }).waitFor()
  await page.waitForFunction(() => document.documentElement.classList.contains('dark'))
  await setThemeFromSettings(page, baseUrl, 'light')
  await page.goto(baseUrl + '/settings')
  await page.unroute(endpoint, handler)
  await page.unroute('**/__recruitment-test-video.webm')
  assert.deepEqual(unexpected, [])
  console.log('Recruitment: reviews, video, response drafts, exports, live search, stage shortcuts, page sizes, persistent light/dark themes, cross-route persistence, mobile navigation, and both themes at 320–1440px passed')
}
