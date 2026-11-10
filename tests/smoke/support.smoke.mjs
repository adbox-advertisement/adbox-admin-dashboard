import assert from 'node:assert/strict'

// Support runs on sample data: no API requests, so nothing is routed here.
export async function checkSupport(page, baseUrl) {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(baseUrl + '/support')
  await page.getByRole('heading', { name: 'Support', exact: true }).waitFor()
  await page.getByRole('region', { name: 'About this page' }).getByText('Sample data.').waitFor()
  const list = page.getByRole('list', { name: 'Tickets' })
  await list.waitFor()

  // On a wide screen the most urgent conversation opens beside the list.
  await page.getByRole('region', { name: /^Conversation: Campus badge disappeared/ }).waitFor()

  // Views narrow the list; a saved reply fills in the customer's name; Send & resolve closes it.
  await page.getByRole('radio', { name: /^Unassigned/ }).click()
  await list.getByRole('button', { name: /Someone signed in to my account/ }).click()
  const conversation = page.getByRole('region', { name: /^Conversation: Someone signed in/ })
  await conversation.getByRole('combobox', { name: 'Insert a saved reply' }).click()
  await page.getByRole('option', { name: 'Account secured' }).click()
  assert.match(await conversation.getByRole('textbox', { name: 'Reply to Abena' }).inputValue(), /^Hi Abena,/)
  await conversation.getByRole('button', { name: 'Send & resolve' }).click()
  await conversation.getByRole('combobox', { name: 'Status' }).filter({ hasText: 'Resolved' }).waitFor()
  await conversation.getByText(/We've signed out every device/).waitFor()

  // Keyboard: "/" goes to search.
  await page.getByRole('heading', { name: 'Support', exact: true }).click()
  await page.keyboard.press('/')
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('type')), 'search')
  await page.getByRole('radio', { name: /^All \d+/ }).click()
  await page.getByRole('searchbox', { name: 'Search conversations' }).fill('jollof')
  await list.getByRole('button', { name: /My ad was rejected/ }).waitFor()
  await page.getByRole('button', { name: 'Clear search' }).click()

  // Reset puts the sample back.
  await page.getByRole('button', { name: 'Reset sample' }).click()
  await page.getByRole('radio', { name: /^Unassigned 3/ }).waitFor()

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, '/support overflows at ' + width)
  }
  // On a phone the list comes first; a conversation opens on its own with a way back.
  await page.setViewportSize({ width: 390, height: 1000 })
  await page.reload()
  await list.getByRole('button').first().click()
  await page.getByRole('button', { name: 'Back to tickets' }).click()
  await list.waitFor()
  await page.setViewportSize({ width: 1440, height: 1000 })
  console.log('Support: sample banner, figures, views, auto-opened conversation, saved reply with send & resolve, search shortcut, reset, phone list/conversation, and responsive layouts passed')
}
