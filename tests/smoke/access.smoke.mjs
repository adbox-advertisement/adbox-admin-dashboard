import assert from 'node:assert/strict'

/**
 * Roles decide what the dashboard offers (src/config/navigation.ts, src/config/navigation-access.ts):
 * signed in as an ads reviewer, the sidebar holds the ads and what anyone may open, and a page their
 * role does not open, reached by its address, says so instead of loading. [currentAdmin] is the
 * harness's signed-in admin; its permissions are put back afterwards.
 */
export async function checkAccess(page, baseUrl, currentAdmin) {
  const superAdmin = currentAdmin.permissions
  try {
    currentAdmin.permissions = ['ads.read', 'ads.review', 'ads.manage']
    await page.setViewportSize({ width: 1440, height: 1000 })
    // A fresh load reads the signed-in admin again.
    await page.goto(baseUrl + '/dashboard')
    const nav = page.getByRole('navigation', { name: 'Dashboard navigation' })
    await nav.getByRole('button', { name: /^Ads Management/ }).waitFor()
    for (const shown of ['Dashboard', 'Settings']) await nav.getByRole('link', { name: shown, exact: true }).waitFor()
    for (const section of ['Manage Users', 'User Content', 'Financials', 'Rewards', 'Video Management', 'Manage Admins']) {
      assert.equal(await nav.getByRole('button', { name: new RegExp('^' + section) }).count(), 0, section + ' should be hidden from an ads reviewer')
    }
    for (const entry of ['RDI', 'Recruitment', 'Support']) {
      assert.equal(await nav.getByRole('link', { name: entry, exact: true }).count(), 0, entry + ' should be hidden from an ads reviewer')
    }

    await page.goto(baseUrl + '/manage-users/people')
    await page.getByRole('heading', { name: 'You don’t have access to this page', exact: true }).waitFor()
    await page.getByRole('list', { name: 'Permissions it needs' }).getByText('platform.users.read', { exact: true }).waitFor()

    // RDI is the Super Admin's, whichever of its pages is opened.
    await page.goto(baseUrl + '/rdi/website/media')
    await page.getByText('Only a Super Admin can open it.', { exact: true }).waitFor()
    assert.equal(await page.locator('#media-project-grid').count(), 0)

    await page.goto(baseUrl + '/support')
    await page.getByText('Only a Super Admin can open it.', { exact: true }).waitFor()
    await page.getByRole('link', { name: 'Back to Dashboard', exact: true }).click()
    await page.waitForURL('**/dashboard')

    // What the role does open, opens: how sponsored posts are placed, read without settings
    // the role may not read, so it asks the API for nothing.
    await nav.getByRole('button', { name: /^Algorithms/ }).click()
    await nav.getByRole('link', { name: 'Sponsored posts', exact: true }).click()
    await page.waitForURL('**/algorithms/sponsored')
    await page.locator('h1', { hasText: 'Sponsored posts' }).waitFor()
    assert.equal(await page.getByRole('heading', { name: 'You don’t have access to this page' }).count(), 0)
    console.log('Role-based navigation: an ads reviewer is offered only what their role opens, and a closed page says so')
  } finally {
    currentAdmin.permissions = superAdmin
  }
}
