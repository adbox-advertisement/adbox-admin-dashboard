import assert from 'node:assert/strict'

export async function openSettingsTab(page, baseUrl) {
  // A link opened in a new tab inherits the opener's sessionStorage. Playwright's
  // context.newPage has no opener, so copy the synthetic sign-in session explicitly.
  const sessionKey = 'adbox-super-admin-session'
  const session = await page.evaluate(key => sessionStorage.getItem(key), sessionKey)
  const settings = await page.context().newPage()
  try {
    await settings.addInitScript(({ sessionKey, session }) => {
      if (session) sessionStorage.setItem(sessionKey, session)
    }, { sessionKey, session })
    await settings.goto(baseUrl + '/settings')
    await settings.getByRole('heading', { name: 'Appearance', exact: true }).waitFor()
    assert.equal(await settings.getByRole('button', { name: /^Switch to (light|dark) mode$/ }).count(), 1)
    return settings
  } catch (error) {
    await settings.close()
    throw error
  }
}

// Use the real Settings control in a second tab so the screen under review
// retains its open dialog, filters, and unsaved form input.
export async function setThemeFromSettings(page, baseUrl, theme) {
  const settings = await openSettingsTab(page, baseUrl)
  try {
    const isDark = await settings.evaluate(() => document.documentElement.classList.contains('dark'))
    if (isDark !== (theme === 'dark')) {
      await settings.getByRole('button', { name: `Switch to ${theme} mode`, exact: true }).click()
    }
    await settings.waitForFunction(theme => localStorage.getItem('adbox-theme') === theme, theme)
    await page.waitForFunction(theme => document.documentElement.classList.contains('dark') === (theme === 'dark'), theme)
  } finally {
    await settings.close()
  }
}
