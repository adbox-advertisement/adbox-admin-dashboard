import assert from 'node:assert/strict'

async function fillAddAdminForm(dialog, { firstName, lastName, email, telephone = '+233 24 000 0099', password = 'supersecret' }) {
  await dialog.getByLabel('First Name', { exact: true }).fill(firstName)
  await dialog.getByLabel('Last Name', { exact: true }).fill(lastName)
  await dialog.getByLabel('Email', { exact: true }).fill(email)
  await dialog.getByLabel('Telephone', { exact: true }).fill(telephone)
  await dialog.getByLabel('Password', { exact: true }).fill(password)
}

export async function checkManageAdmins(page, baseUrl) {
  await page.setViewportSize({ width: 1440, height: 1200 })
  await page.goto(baseUrl + '/manage-admins')
  await page.getByRole('heading', { name: 'Roles and Permission', exact: true }).waitFor()

  // Admin tab is active by default and lists every seeded admin.
  assert.equal(await page.getByRole('tab', { name: 'Admin', exact: true }).getAttribute('aria-selected'), 'true')
  for (const name of ['Adison Cole', 'Kaiya Reyes', 'Emery Osei', 'Jaxson Mensah', 'Aspen Boateng', 'Giana Addo']) {
    await page.getByRole('row').filter({ hasText: name }).waitFor()
  }

  // Search narrows the list.
  const search = page.getByRole('textbox', { name: 'Search user by name/user name' })
  await search.fill('kaiya')
  await page.getByRole('row').filter({ hasText: 'Kaiya Reyes' }).waitFor()
  assert.equal(await page.getByRole('row').filter({ hasText: 'Adison Cole' }).count(), 0)
  await search.fill('')

  // Role filter narrows the list.
  await page.getByRole('combobox', { name: 'Filter by role' }).click()
  await page.getByRole('option', { name: 'Accountant', exact: true }).click()
  await page.getByRole('row').filter({ hasText: 'Jaxson Mensah' }).waitFor()
  assert.equal(await page.getByRole('row').filter({ hasText: 'Adison Cole' }).count(), 0)
  await page.getByRole('combobox', { name: 'Filter by role' }).click()
  await page.getByRole('option', { name: 'All roles', exact: true }).click()

  // Add Admin: password under 8 characters is rejected.
  await page.getByRole('button', { name: 'Add Admin' }).click()
  let dialog = page.getByRole('dialog', { name: 'Add Admin' })
  await dialog.getByLabel('First Name', { exact: true }).waitFor()
  await fillAddAdminForm(dialog, { firstName: 'Jordan', lastName: 'Blake', email: 'jordan@adbox.com', password: 'short' })
  await dialog.getByRole('button', { name: 'Add Admin', exact: true }).click()
  await dialog.getByRole('alert').filter({ hasText: 'at least 8 characters' }).waitFor()

  // Add Admin: duplicate email is rejected with an inline error.
  await dialog.getByLabel('Password', { exact: true }).fill('supersecret')
  await dialog.getByLabel('Email', { exact: true }).fill('')
  await dialog.getByLabel('Email', { exact: true }).fill('adison@adbox.com')
  await dialog.getByRole('button', { name: 'Add Admin', exact: true }).click()
  await dialog.getByRole('alert').filter({ hasText: 'already exists' }).waitFor()

  // Add Admin: a photo, then a valid submission adds a row and closes the dialog.
  await dialog.getByRole('button', { name: 'Upload profile photo' }).waitFor()
  const avatarInput = dialog.locator('input[type="file"]')
  await avatarInput.setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64') })
  await dialog.getByRole('button', { name: 'Change profile photo' }).waitFor()
  await dialog.getByLabel('Email', { exact: true }).fill('')
  await dialog.getByLabel('Email', { exact: true }).fill('jordan@adbox.com')
  await dialog.getByRole('combobox', { name: 'Assign Role' }).click()
  await page.getByRole('option', { name: 'Auditor', exact: true }).click()
  await dialog.getByRole('checkbox', { name: 'Send notification after adding admin' }).waitFor()
  await dialog.getByRole('button', { name: 'Add Admin', exact: true }).click()
  await dialog.waitFor({ state: 'hidden' })
  await page.getByRole('row').filter({ hasText: 'Jordan Blake' }).waitFor()

  // Row menu: edit profile uses the same fields, minus password/notification.
  await page.getByRole('button', { name: 'Open actions for Jordan Blake' }).click()
  await page.getByRole('menuitem', { name: 'Edit profile' }).click()
  dialog = page.getByRole('dialog', { name: 'Edit profile' })
  await dialog.getByLabel('First Name', { exact: true }).waitFor()
  assert.equal(await dialog.getByLabel('Password', { exact: true }).count(), 0)
  assert.equal(await dialog.getByRole('checkbox', { name: 'Send notification after adding admin' }).count(), 0)
  const lastNameField = dialog.getByLabel('Last Name', { exact: true })
  await lastNameField.fill('')
  await lastNameField.fill('Renamed')
  await dialog.getByRole('button', { name: 'Save changes' }).click()
  await dialog.waitFor({ state: 'hidden' })
  await page.getByRole('row').filter({ hasText: 'Jordan Renamed' }).waitFor()

  // Row menu: remove, with a confirm step that can be cancelled first.
  await page.getByRole('button', { name: 'Open actions for Jordan Renamed' }).click()
  await page.getByRole('menuitem', { name: 'Remove' }).click()
  dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: 'Cancel' }).click()
  await page.getByRole('row').filter({ hasText: 'Jordan Renamed' }).waitFor()
  await page.getByRole('button', { name: 'Open actions for Jordan Renamed' }).click()
  await page.getByRole('menuitem', { name: 'Remove' }).click()
  dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: 'Remove admin' }).click()
  await dialog.waitFor({ state: 'hidden' })
  assert.equal(await page.getByRole('row').filter({ hasText: 'Jordan Renamed' }).count(), 0)

  // Manage Roles and permissions tab: lists seeded roles.
  await page.getByRole('tab', { name: 'Manage Roles and permissions', exact: true }).click()
  for (const name of ['Super Admin', 'Administrator', 'Accountant', 'Auditor']) {
    await page.getByRole('row').filter({ hasText: name }).waitFor()
  }

  // Add Role: at least one permission is required.
  await page.getByRole('button', { name: 'Add Role' }).click()
  let roleDialog = page.getByRole('dialog', { name: 'Add Roles' })
  await roleDialog.getByLabel('Role Name', { exact: true }).fill('Support Lead')
  await roleDialog.getByLabel('Description', { exact: true }).fill('Handles support tickets and escalations.')
  await roleDialog.getByRole('button', { name: 'Add role' }).click()
  await roleDialog.getByRole('alert').filter({ hasText: 'at least one permission' }).waitFor()

  // Add Role: picking a permission moves it from the available list into a
  // removable chip, then a valid submission adds the row.
  await roleDialog.getByRole('button', { name: 'get/User' }).click()
  await roleDialog.getByRole('button', { name: 'Remove get/User' }).waitFor()
  await roleDialog.getByRole('button', { name: 'assign/Roles' }).click()
  await roleDialog.getByRole('button', { name: 'Add role' }).click()
  await roleDialog.waitFor({ state: 'hidden' })
  await page.getByRole('row').filter({ hasText: 'Support Lead' }).waitFor()

  // Row menu: Edit Permission opens the same dialog with permissions pre-filled.
  await page.getByRole('button', { name: 'Open actions for Support Lead' }).click()
  await page.getByRole('menuitem', { name: 'Edit Permission' }).click()
  roleDialog = page.getByRole('dialog', { name: 'Edit Roles' })
  await roleDialog.getByRole('button', { name: 'Remove get/User' }).waitFor()
  await roleDialog.getByRole('button', { name: 'Remove assign/Roles' }).waitFor()
  const roleNameField = roleDialog.getByLabel('Role Name', { exact: true })
  await roleNameField.fill('')
  await roleNameField.fill('Support Renamed')
  await roleDialog.getByRole('button', { name: 'Save changes' }).click()
  await roleDialog.waitFor({ state: 'hidden' })
  await page.getByRole('row').filter({ hasText: 'Support Renamed' }).waitFor()

  // Row menu: Delete role, with a confirm step.
  await page.getByRole('button', { name: 'Open actions for Support Renamed' }).click()
  await page.getByRole('menuitem', { name: 'Delete role' }).click()
  roleDialog = page.getByRole('dialog')
  await roleDialog.getByRole('button', { name: 'Remove role' }).click()
  await roleDialog.waitFor({ state: 'hidden' })
  assert.equal(await page.getByRole('row').filter({ hasText: 'Support Renamed' }).count(), 0)

  await page.getByRole('tab', { name: 'Admin', exact: true }).click()
  await page.getByRole('button', { name: 'Add Admin' }).waitFor()

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1200 })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, '/manage-admins overflows at ' + width)
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  console.log('Manage Admins: list, search, role filter, add-admin form (photo/password/notify), edit/remove admin, roles/permissions CRUD, and responsive layouts passed')
}
