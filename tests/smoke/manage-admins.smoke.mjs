import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'

async function fillAddAdminForm(dialog, { firstName, lastName, email, password = 'supersecret' }) {
  await dialog.getByLabel('First Name', { exact: true }).fill(firstName)
  await dialog.getByLabel('Last Name', { exact: true }).fill(lastName)
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
  await page.setViewportSize({ width: 1440, height: 1200 })
  await page.goto(baseUrl + '/manage-admins')
  await page.getByRole('heading', { name: 'Roles and Permission', exact: true }).waitFor()

  // The Admin tab loads API accounts and dynamic role filters.
  assert.equal(await page.getByRole('tab', { name: 'Admin', exact: true }).getAttribute('aria-selected'), 'true')
  await page.getByRole('row').filter({ hasText: 'Adison Cole' }).waitFor()
  const search = page.getByRole('textbox', { name: 'Search admins by name or email' })
  await search.fill('kaiya')
  await page.getByRole('row').filter({ hasText: 'Kaiya Reyes' }).waitFor()
  assert.equal(await page.getByRole('row').filter({ hasText: 'Adison Cole' }).count(), 0)
  await search.fill('')
  await page.getByRole('combobox', { name: 'Filter by role' }).click()
  await page.getByRole('option', { name: 'AUDITOR', exact: true }).click()
  await page.getByRole('row').filter({ hasText: 'Kaiya Reyes' }).waitFor()
  assert.equal(await page.getByRole('row').filter({ hasText: 'Adison Cole' }).count(), 0)
  await page.getByRole('combobox', { name: 'Filter by role' }).click()
  await page.getByRole('option', { name: 'All roles', exact: true }).click()

  // Own-access mutations are blocked in the menu.
  await page.getByRole('button', { name: 'Open actions for Adison Cole' }).click()
  for (const name of ['Assign roles', 'Direct permissions', 'Deactivate']) assert.equal(await page.getByRole('menuitem', { name, exact: true }).getAttribute('aria-disabled'), 'true')
  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: 'Add Admin' }).click()
  let dialog = page.getByRole('dialog', { name: 'Add Admin' })
  await fillAddAdminForm(dialog, { firstName: 'Jordan', lastName: 'Blake', email: 'jordan@example.com', password: '1234' })
  assert.equal(await dialog.getByLabel('Telephone', { exact: true }).count(), 0)
  assert.equal(await dialog.locator('input[type="file"]').count(), 0)
  await dialog.getByRole('button', { name: 'Add Admin', exact: true }).click()
  await dialog.getByRole('alert').filter({ hasText: 'at least 5 characters' }).waitFor()
  await dialog.getByLabel('Password', { exact: true }).fill('12345')
  await dialog.getByLabel('Email', { exact: true }).fill('admin@example.com')
  await dialog.getByRole('button', { name: 'Add Admin', exact: true }).click()
  await dialog.getByRole('alert').filter({ hasText: 'already exists' }).waitFor()
  await dialog.getByLabel('Email', { exact: true }).fill('jordan@example.com')
  await dialog.getByRole('checkbox', { name: 'AUDITOR', exact: true }).check()
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 800 })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Admin form overflows at ' + width)
  }
  await dialog.getByRole('button', { name: 'Add Admin', exact: true }).click()
  await dialog.waitFor({ state: 'hidden' })
  await page.reload()
  await page.getByRole('row').filter({ hasText: 'Jordan Blake' }).getByText('AUDITOR').waitFor()

  await page.getByRole('button', { name: 'Open actions for Jordan Blake' }).click()
  await page.getByRole('menuitem', { name: 'Edit profile' }).click()
  dialog = page.getByRole('dialog', { name: 'Edit profile' })
  await dialog.getByLabel('First Name', { exact: true }).waitFor()
  assert.equal(await dialog.getByLabel('Email', { exact: true }).getAttribute('readonly'), '')
  assert.equal(await dialog.getByLabel('Password', { exact: true }).count(), 0)
  await dialog.getByLabel('Last Name', { exact: true }).fill('Renamed')
  await dialog.getByRole('button', { name: 'Save changes' }).click()
  await dialog.waitFor({ state: 'hidden' })

  await page.getByRole('button', { name: 'Open actions for Jordan Renamed' }).click()
  await page.getByRole('menuitem', { name: 'Direct permissions' }).click()
  dialog = page.getByRole('dialog', { name: 'Direct permissions' })
  await dialog.getByRole('button', { name: 'admins.read', exact: true }).click()
  await dialog.getByRole('button', { name: 'Save direct permissions' }).click()
  await dialog.getByRole('alert').filter({ hasText: 'Could not save direct permissions' }).waitFor()
  await dialog.getByRole('button', { name: 'Remove admins.read' }).waitFor()
  await dialog.getByRole('button', { name: 'Save direct permissions' }).click()
  await dialog.waitFor({ state: 'hidden' })
  await page.getByRole('row').filter({ hasText: 'Jordan Renamed' }).getByText('AUDITOR').waitFor()

  // Deactivation preserves the account and supports reactivation.
  await page.getByRole('button', { name: 'Open actions for Jordan Renamed' }).click()
  await page.getByRole('menuitem', { name: 'Deactivate', exact: true }).click()
  dialog = page.getByRole('dialog', { name: 'Deactivate Jordan Renamed?' })
  await dialog.getByRole('button', { name: 'Cancel' }).click()
  await page.getByRole('button', { name: 'Open actions for Jordan Renamed' }).click()
  await page.getByRole('menuitem', { name: 'Deactivate', exact: true }).click()
  dialog = page.getByRole('dialog', { name: 'Deactivate Jordan Renamed?' })
  await dialog.getByRole('button', { name: 'Deactivate admin' }).click()
  await dialog.waitFor({ state: 'hidden' })
  await page.getByRole('row').filter({ hasText: 'Jordan Renamed' }).getByText('Inactive', { exact: true }).waitFor()
  await page.getByRole('button', { name: 'Open actions for Jordan Renamed' }).click()
  await page.getByRole('menuitem', { name: 'Reactivate', exact: true }).click()
  dialog = page.getByRole('dialog', { name: 'Reactivate Jordan Renamed?' })
  await dialog.getByRole('button', { name: 'Reactivate admin' }).click()
  await dialog.waitFor({ state: 'hidden' })
  await page.getByRole('row').filter({ hasText: 'Jordan Renamed' }).getByText('Active', { exact: true }).waitFor()

  // Backend roles replace the old catalog and protect system records.
  await page.getByRole('tab', { name: 'Manage Roles and permissions', exact: true }).click()
  await page.getByRole('row').filter({ hasText: 'SUPER_ADMIN' }).waitFor()
  await page.getByRole('row').filter({ hasText: 'AUDITOR' }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'Open actions for SUPER_ADMIN' }).count(), 0)

  await page.getByRole('button', { name: 'Add Role' }).click()
  let roleDialog = page.getByRole('dialog', { name: 'Add role', exact: true })
  await roleDialog.getByLabel('Role Name', { exact: true }).fill('Support Lead')
  await roleDialog.getByRole('button', { name: 'Add role', exact: true }).click()
  await roleDialog.getByRole('alert').filter({ hasText: 'uppercase letters' }).waitFor()
  await roleDialog.getByLabel('Role Name', { exact: true }).fill('SUPPORT_LEAD')
  await roleDialog.getByLabel('Description', { exact: true }).fill('Handles support tickets and escalations.')
  await roleDialog.getByRole('button', { name: 'Add role', exact: true }).click()

  // Creation opens a separate assignment save; failure preserves selection and role.
  roleDialog = page.getByRole('dialog', { name: 'Edit permissions' })
  await roleDialog.getByRole('button', { name: 'admins.read', exact: true }).click()
  await roleDialog.getByRole('button', { name: 'roles.read', exact: true }).click()
  assert.equal(await roleDialog.getByRole('button', { name: '*', exact: true }).count(), 0)
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 800 })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Permission dialog overflows at ' + width)
    await roleDialog.getByRole('button', { name: 'Save permissions' }).scrollIntoViewIfNeeded()
  }
  await roleDialog.getByRole('button', { name: 'Save permissions' }).click()
  await roleDialog.getByRole('alert').filter({ hasText: 'Could not save permissions' }).waitFor()
  await roleDialog.getByRole('button', { name: 'Remove admins.read' }).waitFor()
  await roleDialog.getByRole('button', { name: 'Save permissions' }).click()
  await roleDialog.waitFor({ state: 'hidden' })
  assert.equal(roles.filter(role => role.name === 'SUPPORT_LEAD').length, 1)

  // A newly created role is immediately assignable from the Admin tab.
  await page.getByRole('tab', { name: 'Admin', exact: true }).click()
  await page.getByRole('button', { name: 'Open actions for Jordan Renamed' }).click()
  await page.getByRole('menuitem', { name: 'Assign roles', exact: true }).click()
  dialog = page.getByRole('dialog', { name: 'Assign roles', exact: true })
  await dialog.getByRole('checkbox', { name: 'SUPPORT_LEAD', exact: true }).check()
  await dialog.getByRole('checkbox', { name: 'AUDITOR', exact: true }).uncheck()
  await dialog.getByRole('button', { name: 'Save roles' }).click()
  await dialog.waitFor({ state: 'hidden' })
  await page.getByRole('row').filter({ hasText: 'Jordan Renamed' }).getByText('SUPPORT_LEAD').waitFor()

  // A reload fetches the persisted API result, including assignments.
  await page.reload()
  await page.getByRole('tab', { name: 'Manage Roles and permissions', exact: true }).click()
  await page.getByRole('row').filter({ hasText: 'SUPPORT_LEAD' }).getByText('admins.read', { exact: true }).waitFor()
  await page.getByRole('button', { name: 'Open actions for SUPPORT_LEAD' }).click()
  await page.getByRole('menuitem', { name: 'Edit permissions', exact: true }).click()
  roleDialog = page.getByRole('dialog', { name: 'Edit permissions' })
  await roleDialog.getByRole('button', { name: 'Remove admins.read' }).click()
  await roleDialog.getByRole('button', { name: 'Remove roles.read' }).click()
  await roleDialog.getByRole('button', { name: 'Save permissions' }).click()
  await roleDialog.waitFor({ state: 'hidden' })
  await page.getByRole('row').filter({ hasText: 'SUPPORT_LEAD' }).getByText('No permissions').waitFor()

  await page.getByRole('button', { name: 'Open actions for SUPPORT_LEAD' }).click()
  await page.getByRole('menuitem', { name: 'Edit role', exact: true }).click()
  roleDialog = page.getByRole('dialog', { name: 'Edit role', exact: true })
  await roleDialog.getByLabel('Role Name', { exact: true }).fill('SUPPORT_RENAMED')
  await roleDialog.getByRole('button', { name: 'Save changes' }).click()
  await roleDialog.waitFor({ state: 'hidden' })
  await page.getByRole('row').filter({ hasText: 'SUPPORT_RENAMED' }).waitFor()
  await page.getByRole('button', { name: 'Open actions for SUPPORT_RENAMED' }).click()
  await page.getByRole('menuitem', { name: 'Delete role' }).click()
  roleDialog = page.getByRole('dialog')
  await roleDialog.getByRole('button', { name: 'Remove role' }).click()
  await roleDialog.waitFor({ state: 'hidden' })
  assert.equal(await page.getByRole('row').filter({ hasText: 'SUPPORT_RENAMED' }).count(), 0)

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1200 })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Roles tab overflows at ' + width)
  }

  await page.getByRole('tab', { name: 'Admin', exact: true }).click()
  await page.getByRole('button', { name: 'Add Admin' }).waitFor()
  await page.getByRole('row').filter({ hasText: 'Jordan Renamed' }).getByText('No roles assigned').waitFor()
  assert.deepEqual(admins.find(admin => admin.email === 'jordan@example.com').permissions.map(entry => entry.permission.key), ['admins.read'])

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1200 })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, '/manage-admins overflows at ' + width)
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.unroute(/\/api\/v1\/(admins|roles|permissions)(\/|$)/, rbacRoute)
  console.log('Manage Admins: list, search, role filter, account creation, profile updates, roles/direct permissions, deactivation/reactivation, cross-tab updates, roles CRUD, and responsive layouts passed')
}
