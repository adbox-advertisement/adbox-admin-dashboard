import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'

async function fillAddAdminForm(dialog, { firstName, lastName, email, password = 'supersecret' }) {
  await dialog.getByLabel('First name', { exact: true }).fill(firstName)
  await dialog.getByLabel('Last name', { exact: true }).fill(lastName)
  await dialog.getByLabel('Email', { exact: true }).fill(email)
  await dialog.getByLabel('Password', { exact: true }).fill(password)
}

export async function checkManageAdmins(page, baseUrl) {
  const permissions = [
    { id: randomUUID(), key: '*', description: null },
    { id: randomUUID(), key: 'admins.read', description: 'View admins' },
    { id: randomUUID(), key: 'roles.read', description: 'View roles' },
    ...Array.from({ length: 24 }, (_, index) => ({ id: randomUUID(), key: `workspace.resource-${index}.read`, description: 'View resource' })),
  ]
  let roles = [
    { id: randomUUID(), name: 'SUPER_ADMIN', description: null, isSystem: true, updatedAt: '2026-09-14T12:00:00.000Z', permissions: [{ permission: permissions[0] }] },
    { id: randomUUID(), name: 'AUDITOR', description: 'Read-only access', isSystem: false, updatedAt: '2026-09-14T12:00:00.000Z', permissions: [{ permission: permissions[1] }] },
  ]
  const admins = [
    { id: '30000000-0000-4000-8000-000000000001', firstName: 'Adison', lastName: 'Cole', email: 'admin@example.com', isActive: true, updatedAt: '2026-09-14T12:00:00.000Z', roles: [{ role: roles[0] }], permissions: [] },
    { id: randomUUID(), firstName: 'Kaiya', lastName: 'Reyes', email: 'kaiya@example.com', isActive: true, updatedAt: '2026-09-14T12:00:00.000Z', roles: [{ role: roles[1] }], permissions: [] },
  ]
  let rejectDirectSave = true
  let rejectPermissionSave = true
  const rbacRoute = async route => {
    const request = route.request()
    const path = new URL(request.url()).pathname.replace('/api/v1', '')
    const method = request.method()
    const reply = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) })
    assert.ok(request.headers().authorization?.startsWith('Bearer '), 'RBAC requests must carry the session token')
    if (method === 'GET' && path === '/admins') return reply(admins)
    if (method === 'POST' && path === '/admins') {
      const input = request.postDataJSON()
      assert.deepEqual(Object.keys(input).sort(), ['email', 'firstName', 'lastName', 'password', 'roleIds'])
      assert.ok(input.password.length >= 5 && input.password.length <= 128)
      if (admins.some(admin => admin.email === input.email)) return reply({ message: 'An admin with this email already exists' }, 409)
      const admin = { id: randomUUID(), firstName: input.firstName, lastName: input.lastName, email: input.email, isActive: true, updatedAt: new Date().toISOString(), roles: input.roleIds.map(id => ({ role: roles.find(role => role.id === id) })), permissions: [] }
      admins.push(admin)
      return reply(admin, 201)
    }
    if (path.startsWith('/admins/')) {
      const admin = admins.find(entry => entry.id === path.split('/')[2])
      assert.ok(admin, 'Admin requests must address a real ID')
      if (method === 'GET') return reply(admin)
      const input = request.postDataJSON()
      if (method === 'PATCH') {
        assert.ok(Object.keys(input).every(key => ['firstName', 'lastName', 'isActive'].includes(key)))
        Object.assign(admin, input)
        return reply(admin)
      }
      if (method === 'PUT' && path.endsWith('/roles')) {
        assert.deepEqual(Object.keys(input), ['roleIds'])
        assert.ok(input.roleIds.every(id => roles.some(role => role.id === id)))
        admin.roles = input.roleIds.map(id => ({ role: roles.find(role => role.id === id) }))
        return reply(admin)
      }
      if (method === 'PUT' && path.endsWith('/permissions')) {
        assert.deepEqual(Object.keys(input), ['permissionIds'])
        assert.ok(input.permissionIds.every(id => permissions.some(permission => permission.id === id)))
        if (rejectDirectSave) { rejectDirectSave = false; return reply({ message: 'Unavailable' }, 503) }
        admin.permissions = input.permissionIds.map(id => ({ permission: permissions.find(permission => permission.id === id) }))
        return reply(admin)
      }
      throw new Error(`Unexpected admin request: ${method} ${path}`)
    }
    if (method === 'GET' && path === '/permissions') return reply(permissions)
    if (method === 'GET' && path === '/roles') return reply(roles)
    if (method === 'POST' && path === '/roles') {
      const input = request.postDataJSON()
      assert.deepEqual(Object.keys(input).sort(), ['description', 'name'])
      const role = { ...input, id: randomUUID(), isSystem: false, updatedAt: new Date().toISOString(), permissions: [] }
      roles.push(role)
      return reply(role, 201)
    }
    const role = roles.find(entry => entry.id === path.split('/')[2])
    assert.ok(role, 'Writes must address a real role ID')
    assert.equal(role.isSystem, false, 'The system role must never be edited')
    if (method === 'PATCH') {
      const input = request.postDataJSON()
      assert.deepEqual(Object.keys(input).sort(), ['description', 'name'])
      Object.assign(role, input)
      return reply(role)
    }
    if (method === 'PUT' && path.endsWith('/permissions')) {
      const input = request.postDataJSON()
      assert.deepEqual(Object.keys(input), ['permissionIds'])
      assert.ok(input.permissionIds.every(id => permissions.some(permission => permission.id === id && permission.key !== '*')))
      if (rejectPermissionSave) {
        rejectPermissionSave = false
        return reply({ message: 'Temporarily unavailable' }, 503)
      }
      role.permissions = input.permissionIds.map(id => ({ permission: permissions.find(permission => permission.id === id) }))
      return reply(role)
    }
    if (method === 'DELETE') {
      roles = roles.filter(entry => entry.id !== role.id)
      for (const admin of admins) admin.roles = admin.roles.filter(assignment => assignment.role.id !== role.id)
      return reply({ message: 'Role deleted' })
    }
    throw new Error(`Unexpected RBAC request: ${method} ${path}`)
  }
  await page.route(/\/api\/v1\/(admins|roles|permissions)(\/|$)/, rbacRoute)
  const fits = async label => {
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 })
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${label} overflows at ${width}`)
    }
    await page.setViewportSize({ width: 1440, height: 1200 })
  }
  await page.setViewportSize({ width: 1440, height: 1200 })
  await page.goto(baseUrl + '/manage-admins')
  await page.waitForURL('**/manage-admins/admins')
  await page.getByRole('heading', { name: 'Admins', exact: true }).waitFor()
  const nav = page.getByRole('navigation', { name: 'Dashboard navigation', exact: true })
  for (const name of ['Admins', 'Roles', 'Permissions']) await nav.getByRole('link', { name, exact: true }).waitFor()

  // The list: Super Admins first, search and role filter.
  const list = page.getByRole('list', { name: 'Admins' })
  assert.equal(await list.getByRole('link').first().getAttribute('aria-label'), 'Adison Cole, active')
  await page.getByText(/You're a Super Admin/).waitFor()
  const search = page.getByRole('searchbox', { name: 'Search admins' })
  await search.fill('kaiya')
  await list.getByRole('link', { name: /^Kaiya Reyes/ }).waitFor()
  assert.equal(await list.getByRole('link', { name: /^Adison Cole/ }).count(), 0)
  await search.fill('')
  await page.getByRole('combobox', { name: 'Role' }).click()
  await page.getByRole('option', { name: 'Auditor', exact: true }).click()
  await list.getByRole('link', { name: /^Kaiya Reyes/ }).waitFor()
  assert.equal(await list.getByRole('link', { name: /^Adison Cole/ }).count(), 0)
  await page.getByRole('combobox', { name: 'Role' }).click()
  await page.getByRole('option', { name: 'All roles', exact: true }).click()
  await fits('/manage-admins/admins')

  // Your own access is locked, even for a Super Admin.
  await list.getByRole('link', { name: /^Adison Cole/ }).click()
  await page.getByText(/This is your account/).waitFor()
  assert.equal(await page.getByRole('button', { name: 'Change roles' }).count(), 0)
  assert.equal(await page.getByRole('button', { name: 'Deactivate' }).count(), 0)
  await page.getByText('Everything.', { exact: true }).waitFor()
  await page.getByRole('link', { name: 'All admins' }).click()

  // Add an admin with a role; validation and duplicate email are explained.
  await page.getByRole('button', { name: 'Add admin' }).click()
  let dialog = page.getByRole('dialog', { name: 'Add admin' })
  await fillAddAdminForm(dialog, { firstName: 'Jordan', lastName: 'Blake', email: 'jordan@example.com', password: '1234' })
  await dialog.getByRole('button', { name: 'Add admin', exact: true }).click()
  await dialog.getByRole('alert').filter({ hasText: 'at least 5 characters' }).waitFor()
  await dialog.getByLabel('Password', { exact: true }).fill('12345')
  await dialog.getByLabel('Email', { exact: true }).fill('admin@example.com')
  await dialog.getByRole('button', { name: 'Add admin', exact: true }).click()
  await dialog.getByRole('alert').filter({ hasText: 'already exists' }).waitFor()
  await dialog.getByLabel('Email', { exact: true }).fill('jordan@example.com')
  await dialog.getByRole('checkbox', { name: 'Auditor', exact: true }).click()
  await fits('Add admin dialog')
  await dialog.getByRole('button', { name: 'Add admin', exact: true }).click()
  await page.getByRole('heading', { level: 1, name: /Jordan Blake/ }).waitFor()
  await page.getByText('Added Jordan Blake.').waitFor()
  await page.getByRole('region', { name: 'Roles' }).getByText('Auditor', { exact: true }).waitFor()

  await page.getByRole('button', { name: 'Edit name' }).click()
  dialog = page.getByRole('dialog', { name: 'Edit name' })
  assert.equal(await dialog.getByLabel('Email', { exact: true }).count(), 0)
  assert.equal(await dialog.getByLabel('Password', { exact: true }).count(), 0)
  await dialog.getByLabel('Last name', { exact: true }).fill('Renamed')
  await dialog.getByRole('button', { name: 'Save name' }).click()
  await page.getByRole('heading', { level: 1, name: /Jordan Renamed/ }).waitFor()

  // Extra permissions: a failed save keeps the choice.
  await page.getByRole('region', { name: 'Extra permissions' }).getByRole('button', { name: 'Change' }).click()
  dialog = page.getByRole('dialog', { name: 'Extra permissions for Jordan Renamed' })
  assert.equal(await dialog.getByRole('checkbox', { name: 'Everything', exact: true }).count(), 0)
  await dialog.getByRole('checkbox', { name: 'View admins', exact: true }).click()
  await dialog.getByRole('button', { name: 'Save extra permissions' }).click()
  await dialog.getByRole('alert').filter({ hasText: 'Could not save the extra permissions' }).waitFor()
  assert.equal(await dialog.getByRole('checkbox', { name: 'View admins', exact: true }).getAttribute('aria-checked'), 'true')
  await dialog.getByRole('button', { name: 'Save extra permissions' }).click()
  await dialog.waitFor({ state: 'hidden' })
  await page.getByRole('region', { name: 'Extra permissions' }).getByText('View admins', { exact: true }).first().waitFor()
  await page.getByRole('region', { name: 'What they can do' }).getByText('Extra permission', { exact: true }).first().waitFor()

  // Deactivate and reactivate.
  await page.getByRole('button', { name: 'Deactivate' }).click()
  dialog = page.getByRole('dialog', { name: 'Deactivate Jordan Renamed?' })
  await dialog.getByRole('button', { name: 'Cancel' }).click()
  await page.getByRole('button', { name: 'Deactivate' }).click()
  await page.getByRole('dialog', { name: 'Deactivate Jordan Renamed?' }).getByRole('button', { name: 'Deactivate admin' }).click()
  await page.getByText('Jordan Renamed is deactivated and signed out.').waitFor()
  await page.getByRole('button', { name: 'Reactivate' }).click()
  await page.getByRole('dialog', { name: 'Reactivate Jordan Renamed?' }).getByRole('button', { name: 'Reactivate admin' }).click()
  await page.getByText('Jordan Renamed can sign in again.').waitFor()
  const jordanPath = new URL(page.url()).pathname
  await fits(jordanPath)

  // Roles: the built-in role is locked.
  await nav.getByRole('link', { name: 'Roles', exact: true }).click()
  const roleCards = page.getByRole('list', { name: 'Roles' })
  await roleCards.getByRole('link', { name: 'Super Admin', exact: true }).click()
  await page.getByText(/It can't be renamed, changed or deleted/).waitFor()
  for (const name of ['Rename', 'Delete', 'Edit permissions']) assert.equal(await page.getByRole('button', { name, exact: true }).count(), 0)
  await page.getByRole('link', { name: 'All roles' }).click()

  // A new role goes straight to choosing what it allows; a failed save keeps the choice.
  await page.getByRole('button', { name: 'New role' }).click()
  let roleDialog = page.getByRole('dialog', { name: 'New role' })
  await roleDialog.getByLabel('Role name', { exact: true }).fill('!')
  await roleDialog.getByRole('button', { name: 'Create role' }).click()
  await roleDialog.getByRole('alert').filter({ hasText: '2 to 64 letters' }).waitFor()
  await roleDialog.getByLabel('Role name', { exact: true }).fill('Support lead')
  await roleDialog.getByText('SUPPORT_LEAD', { exact: true }).waitFor()
  await roleDialog.getByLabel(/What it's for/).fill('Handles support tickets and escalations.')
  await roleDialog.getByRole('button', { name: 'Create role' }).click()
  roleDialog = page.getByRole('dialog', { name: 'What Support lead allows' })
  assert.equal(await roleDialog.getByRole('checkbox', { name: 'Everything', exact: true }).count(), 0)
  await roleDialog.getByRole('checkbox', { name: 'View admins', exact: true }).click()
  await roleDialog.getByRole('checkbox', { name: 'View roles', exact: true }).click()
  await fits('Role permissions dialog')
  await roleDialog.getByRole('button', { name: 'Save permissions' }).click()
  await roleDialog.getByRole('alert').filter({ hasText: 'Could not save the permissions' }).waitFor()
  assert.equal(await roleDialog.getByRole('checkbox', { name: 'View roles', exact: true }).getAttribute('aria-checked'), 'true')
  await roleDialog.getByRole('button', { name: 'Save permissions' }).click()
  await roleDialog.waitFor({ state: 'hidden' })
  assert.equal(roles.filter(role => role.name === 'SUPPORT_LEAD').length, 1)
  const supportPath = new URL(page.url()).pathname
  await page.getByRole('region', { name: 'What this role allows' }).getByText('View roles', { exact: true }).first().waitFor()

  // The new role can be given straight away.
  await page.goto(baseUrl + jordanPath)
  await page.getByRole('button', { name: 'Change roles' }).click()
  dialog = page.getByRole('dialog', { name: 'Roles for Jordan Renamed' })
  await dialog.getByRole('checkbox', { name: 'Support lead', exact: true }).click()
  await dialog.getByRole('checkbox', { name: 'Auditor', exact: true }).click()
  await dialog.getByRole('button', { name: 'Save roles' }).click()
  await dialog.waitFor({ state: 'hidden' })
  await page.getByRole('region', { name: 'Roles' }).getByText('Support lead', { exact: true }).waitFor()

  // After a reload: edit, rename and delete the role.
  await page.goto(baseUrl + supportPath)
  await page.getByRole('region', { name: 'Admins with this role' }).getByText('Jordan Renamed').waitFor()
  await page.getByRole('button', { name: 'Edit permissions' }).click()
  roleDialog = page.getByRole('dialog', { name: 'What Support lead allows' })
  await roleDialog.getByRole('button', { name: 'Clear in Admins and access' }).click()
  await roleDialog.getByRole('button', { name: 'Save permissions' }).click()
  await roleDialog.waitFor({ state: 'hidden' })
  await page.getByRole('region', { name: 'What this role allows' }).getByText(/^Nothing yet/).waitFor()
  await page.getByRole('button', { name: 'Rename' }).click()
  roleDialog = page.getByRole('dialog', { name: 'Rename role' })
  await roleDialog.getByLabel('Role name', { exact: true }).fill('Support renamed')
  await roleDialog.getByRole('button', { name: 'Save', exact: true }).click()
  await page.getByRole('heading', { level: 1, name: /Support renamed/ }).waitFor()
  await fits(supportPath)
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('dialog', { name: 'Delete Support renamed?' }).getByRole('button', { name: 'Delete role' }).click()
  await page.waitForURL('**/manage-admins/roles')
  await page.getByRole('list', { name: 'Roles' }).getByRole('link', { name: 'Auditor', exact: true }).waitFor()
  assert.equal(await page.getByRole('link', { name: 'Support renamed', exact: true }).count(), 0)
  await fits('/manage-admins/roles')

  // The permission list, by area, with the roles that include each.
  await nav.getByRole('link', { name: 'Permissions', exact: true }).click()
  const accessArea = page.getByRole('region', { name: /Admins and access/ })
  await accessArea.getByRole('link', { name: 'Auditor', exact: true }).first().waitFor()
  await page.getByRole('searchbox', { name: 'Search permissions' }).fill('resource-3')
  await page.getByText('workspace.resource-3.read', { exact: true }).waitFor()
  await fits('/manage-admins/permissions')

  await page.goto(baseUrl + jordanPath)
  await page.getByRole('region', { name: 'Roles' }).getByText(/^No roles yet/).waitFor()
  assert.deepEqual(admins.find(admin => admin.email === 'jordan@example.com').permissions.map(entry => entry.permission.key), ['admins.read'])

  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.unroute(/\/api\/v1\/(admins|roles|permissions)(\/|$)/, rbacRoute)
  console.log('Manage Admins: sidebar sections, list with search/filters, own access locked, add admin with role, rename, extra permissions with failed save, deactivate/reactivate, built-in role locked, role create/permissions/assign/rename/delete, permission list, and responsive layouts passed')
}
