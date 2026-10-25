import assert from 'node:assert/strict'

const usersApi = /\/api\/v1\/(platform-users|verification-requests|institutions|companies|honour-review)(\/|$|\?)/

const members = (total, student, alumni, staff, verified) => ({ total, STUDENT: student, ALUMNI: alumni, STAFF: staff, NONE: total - student - alumni - staff, verified, pending: 1 })

export async function checkManageUsers(page, baseUrl) {
  const institution = { id: '50000000-0000-4000-8000-000000000001', name: 'University of Ghana', shortName: 'UG', slug: 'ug', type: 'UNIVERSITY', region: 'Greater Accra', isActive: true, campuses: [{ id: '51000000-0000-4000-8000-000000000001', name: 'Legon', city: 'Accra' }] }
  const roles = ['VIEWER', 'VIEWER', 'CREATOR', 'PUBLISHER']
  const statuses = ['STUDENT', 'STUDENT', 'ALUMNI', 'STAFF', null]
  const users = Array.from({ length: 23 }, (_, index) => ({
    id: `60000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
    deviceType: index % 2 ? 'Android' : 'iOS', emailVerified: index % 3 === 0, isContactVerified: false, passwordChangedAt: null,
    isOAuth: index % 4 === 0, isMachine: false, isLegal: false, isActive: true, deactivationReason: null, role: index === 0 ? 'PUBLISHER' : roles[index % 4],
    createdAt: new Date(Date.UTC(2026, 8, 30 - index)).toISOString(), updatedAt: '2026-09-30T00:00:00.000Z',
    _count: { followers: 40 - index, following: index, companyPublisher: index === 0 ? 1 : 0 },
    userProfile: {
      id: `61000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, ipAddress: '102.176.0.1', image: null,
      fullName: index === 0 ? 'Ama Mensah' : `Student ${index + 1}`, bio: null, contact: null, email: `student${index + 1}@example.com`,
      username: `student${index + 1}`, dob: null, gender: null, institutionId: institution.id, institution: { id: institution.id, slug: 'ug', name: institution.name },
      campusId: institution.campuses[0].id, campus: institution.campuses[0], hall: null, studentStatus: statuses[index % 5], level: 200, programme: 'BA Economics', graduationYear: 2028,
      verificationTier: index === 0 ? 'PENDING' : 'SELF_DECLARED', verifiedAt: null, honourSince: null, honourRenewsAt: null, spotlightUntil: null,
      createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z',
    },
  }))
  const person = user => ({ id: user.id, role: user.role, isActive: user.isActive, deactivationReason: null, userProfile: { fullName: user.userProfile.fullName, username: user.userProfile.username, email: user.userProfile.email, image: null, studentStatus: user.userProfile.studentStatus, verificationTier: user.userProfile.verificationTier, institution: { id: institution.id, shortName: 'UG' } } })
  const company = {
    id: '80000000-0000-4000-8000-000000000001', name: 'Kofi Foods', email: 'ads@kofifoods.example', phoneNumber: '+233240000000', bio: null, logo: null, website: null,
    status: 'PENDING_VERIFICATION', registrationNumber: 'CS123456789', verifiedAt: null, verifiedByAdminId: null, rejectionNote: null, size: 'SMALL', businessType: 'PRODUCTS',
    createdAt: '2026-09-10T10:00:00.000Z', updatedAt: '2026-09-10T10:00:00.000Z', _count: { publishers: 1, campaigns: 2 },
  }
  const requests = [{ id: '70000000-0000-4000-8000-000000000001', userId: users[0].id, institutionId: institution.id, evidenceUrl: 'https://files.example.com/id.jpg', status: 'PENDING', reviewedByAdminId: null, reviewedAt: null, rejectionNote: null, createdAt: '2026-09-29T00:00:00.000Z', reviewedBy: null }]
  const count = (key, value) => users.filter(user => key(user) === value).length
  const stats = institutionId => ({
    institutionId: institutionId ?? null, generatedAt: '2026-10-24T09:00:00.000Z', total: users.length, newLast7Days: 4, newLast30Days: 23,
    status: { active: count(user => user.isActive, true), suspended: count(user => user.isActive, false), deactivated: 0, pendingDeletion: 0, erased: 0 },
    roles: { GUEST: 0, VIEWER: count(user => user.role, 'VIEWER'), CREATOR: count(user => user.role, 'CREATOR'), PUBLISHER: count(user => user.role, 'PUBLISHER') },
    affiliation: { STUDENT: count(user => user.userProfile.studentStatus, 'STUDENT'), ALUMNI: count(user => user.userProfile.studentStatus, 'ALUMNI'), STAFF: count(user => user.userProfile.studentStatus, 'STAFF'), NONE: count(user => user.userProfile.studentStatus, null) },
    verification: { SELF_DECLARED: 22, PENDING: 1, VERIFIED: 0 },
    badges: { campus: 0, company: 0, honour: 0, spotlight: 0 },
    institutions: [{ id: institution.id, name: institution.name, shortName: 'UG', slug: 'ug', type: 'UNIVERSITY', region: 'Greater Accra', isActive: true, logoUrl: null, campusCount: 1, members: members(23, 10, 4, 4, 0) }],
    campuses: institutionId ? [{ id: institution.campuses[0].id, name: 'Legon', city: 'Accra', hallCount: 2, members: members(23, 10, 4, 4, 0) }] : null,
    withoutCampus: institutionId ? members(0, 0, 0, 0, 0) : null,
  })
  const relationships = {
    counts: { followers: 40, following: 0, requestsReceived: 0, requestsSent: 0, blocking: 0, blockedBy: 0, posts: 5, comments: 12, institutionsFollowed: 0 },
    companies: [{ id: company.id, name: company.name, email: company.email, logo: null, status: company.status, verifiedAt: null, publisherCount: 1, campaignCount: 2, isOwner: true, joinedAt: '2026-09-10T10:00:00.000Z' }],
    institutionsFollowed: [], identities: [], sessions: { active: 1, lastStartedAt: '2026-10-20T10:00:00.000Z' }, consent: null, goldBalance: null,
    honour: { year: 2026, nominationsThisYear: 0, decisions: [] }, spotlightPurchases: 0,
  }

  const route = async route => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname.replace('/api/v1', '')
    const query = Object.fromEntries(url.searchParams)
    const method = request.method()
    const reply = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) })
    const pageOf = (items) => {
      const pageNumber = Number(query.page ?? 1)
      const limit = Number(query.limit ?? 20)
      return { items: items.slice((pageNumber - 1) * limit, pageNumber * limit), total: items.length, page: pageNumber, limit }
    }
    assert.ok(request.headers().authorization?.startsWith('Bearer '), 'User requests must carry the session token')
    if (method === 'GET' && path === '/institutions') return reply([institution])
    if (method === 'GET' && path === '/platform-users/stats') return reply(stats(query.institutionId))
    if (method === 'GET' && path === '/platform-users') {
      const search = (query.search ?? '').toLowerCase()
      return reply(pageOf(users.filter(user =>
        (!query.status || (query.status === 'active') === user.isActive)
        && (!query.role || user.role === query.role)
        && (!query.affiliation || (user.userProfile.studentStatus ?? 'NONE') === query.affiliation)
        && (!query.verificationTier || user.userProfile.verificationTier === query.verificationTier)
        && (!search || user.userProfile.email.includes(search) || user.userProfile.username.includes(search)))))
    }
    if (path.startsWith('/platform-users/')) {
      const [, , id, action] = path.split('/')
      const user = users.find(entry => entry.id === id)
      assert.ok(user, 'User requests must address a real ID')
      if (method === 'GET' && !action) return reply(user)
      if (method === 'GET' && action === 'relationships') return reply(relationships)
      if (method === 'GET' && action === 'connections') return reply({ direction: query.direction ?? 'followers', ...pageOf(query.direction === 'followers' ? users.slice(1, 4).map(entry => ({ user: person(entry), status: 'ACTIVE', since: '2026-10-01T10:00:00.000Z' })) : []) })
      if (method === 'POST' && action === 'suspend') { user.isActive = false; return reply({ ...user, revokedSessions: 2 }) }
      if (method === 'POST' && action === 'reactivate') { user.isActive = true; return reply(user) }
    }
    if (method === 'GET' && path === '/companies') return reply(pageOf([{ ...company, owner: person(users[0]) }].filter(entry => !query.status || entry.status === query.status)))
    if (path === `/companies/${company.id}`) return reply({ ...company, publishers: [{ isOwner: true, joinedAt: '2026-09-10T10:00:00.000Z', user: person(users[0]) }] })
    if (method === 'POST' && path === `/companies/${company.id}/approve`) {
      company.status = 'ACTIVE'
      company.verifiedAt = new Date().toISOString()
      return reply(company)
    }
    if (method === 'GET' && path === '/verification-requests') {
      const items = requests.filter(entry => !query.status || entry.status === query.status)
      return reply({ items, total: items.length, page: 1, limit: Number(query.limit ?? 20) })
    }
    if (method === 'POST' && path.startsWith('/verification-requests/') && path.endsWith('/approve')) {
      const entry = requests.find(item => path.includes(item.id))
      entry.status = 'APPROVED'
      entry.reviewedAt = new Date().toISOString()
      users[0].userProfile.verificationTier = 'VERIFIED'
      return reply(entry)
    }
    if (method === 'GET' && path === '/honour-review') {
      return reply({ year: 2026, rules: { nominationsRequired: 25, campusesRequired: 2, campusCapPer: 100 }, items: [], total: 0, page: 1, limit: 25 })
    }
    return reply({ message: 'Unexpected ' + method + ' ' + path }, 500)
  }

  const noOverflow = async (label) => {
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1100 })
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, label + ' overflows at ' + width)
    }
    await page.setViewportSize({ width: 1440, height: 1100 })
  }

  await page.route(usersApi, route)
  await page.setViewportSize({ width: 1440, height: 1100 })

  // Overview: breakdowns link straight into a filtered People list.
  await page.goto(baseUrl + '/manage-users')
  await page.getByRole('heading', { name: 'Manage Users', exact: true }).waitFor()
  const sections = page.getByRole('navigation', { name: 'Manage Users sections' })
  await sections.getByRole('link', { name: /Publishers & Companies.*1 waiting/ }).waitFor()
  await page.getByRole('list', { name: 'People by account role' }).getByRole('link', { name: /^Publisher:/ }).waitFor()
  await noOverflow('/manage-users')
  await page.getByRole('list', { name: 'People by account role' }).getByRole('link', { name: /^Creator:/ }).click()
  await page.waitForURL('**/manage-users/people?role=CREATOR')
  const table = page.getByRole('table', { name: 'People' })
  const creators = count(user => user.role, 'CREATOR')
  await page.getByText(`Showing 1–${creators} of ${creators} people`).waitFor()
  await page.getByRole('button', { name: 'Clear 1 filter' }).click()
  await page.getByText('Showing 1–20 of 23 people').waitFor()
  await page.getByRole('button', { name: 'Next page' }).click()
  await page.getByText('Showing 21–23 of 23 people').waitFor()
  await page.getByRole('searchbox', { name: /Search people/ }).fill('student1@')
  await page.getByText('Showing 1–1 of 1 people').waitFor()
  await page.getByRole('button', { name: 'Clear search' }).click()
  await page.getByText('Showing 1–20 of 23 people').waitFor()
  await noOverflow('/manage-users/people')

  // Profile page: suspend and reactivate, then tabs.
  await table.getByRole('button', { name: 'Ama Mensah', exact: true }).click()
  await page.waitForURL(`**/manage-users/people/${users[0].id}`)
  await page.getByRole('heading', { level: 1, name: 'Ama Mensah' }).waitFor()
  await page.getByRole('button', { name: 'Suspend', exact: true }).click()
  const confirm = page.getByRole('dialog').filter({ hasText: 'Suspend Ama Mensah?' })
  await confirm.getByLabel(/Reason/).fill('Spam reports')
  await confirm.getByRole('button', { name: 'Suspend user' }).click()
  await confirm.waitFor({ state: 'hidden' })
  assert.equal(users[0].isActive, false)
  await page.getByText('This account is suspended.', { exact: false }).waitFor()
  await page.getByRole('button', { name: 'Reactivate', exact: true }).click()
  await page.getByRole('dialog').filter({ hasText: 'Reactivate Ama Mensah?' }).getByRole('button', { name: 'Reactivate user' }).click()
  await page.getByRole('button', { name: 'Suspend', exact: true }).waitFor()
  assert.equal(users[0].isActive, true)
  await page.getByRole('tab', { name: 'Connections' }).click()
  await page.getByRole('link', { name: 'Student 2', exact: true }).waitFor()
  await page.getByRole('tab', { name: 'Publishing' }).click()
  await page.getByRole('link', { name: 'Kofi Foods' }).waitFor()
  await noOverflow('/manage-users/people/:id')

  // Institutions drill down to campuses and members.
  await sections.getByRole('link', { name: 'Institutions' }).click()
  await page.getByRole('button', { name: /^UG/ }).click()
  await page.getByRole('heading', { level: 1, name: 'University of Ghana' }).waitFor()
  await page.getByRole('radio', { name: 'Alumni' }).click()
  const alumni = count(user => user.userProfile.studentStatus, 'ALUMNI')
  await page.getByText(`Showing 1–${alumni} of ${alumni} people`).waitFor()
  await noOverflow('/manage-users/institutions/:id')

  // Companies: approve from the detail page.
  await sections.getByRole('link', { name: /Publishers & Companies/ }).click()
  await page.getByRole('button', { name: 'Kofi Foods' }).click()
  await page.getByRole('heading', { level: 1, name: 'Kofi Foods' }).waitFor()
  await page.getByRole('button', { name: 'Approve', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Approve company' }).click()
  await page.getByText('Approved', { exact: true }).first().waitFor()
  assert.equal(company.status, 'ACTIVE')
  await noOverflow('/manage-users/companies/:id')

  // Verification queue.
  await sections.getByRole('link', { name: /Verification/ }).click()
  await page.getByRole('link', { name: /View evidence/ }).waitFor()
  await page.getByRole('button', { name: 'Approve', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Approve', exact: true }).click()
  await page.getByText('No requests waiting').waitFor()
  assert.equal(requests[0].status, 'APPROVED')

  // Honours.
  await sections.getByRole('link', { name: 'Honours' }).click()
  await page.getByText('No nominations in 2026').waitFor()
  await noOverflow('/manage-users/honours')

  await page.unroute(usersApi, route)
  console.log('Manage Users: overview breakdowns, filtered people, profile tabs and suspension, institutions, company approval, verification, honours, and responsive layouts passed')
}
