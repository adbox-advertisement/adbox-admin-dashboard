import assert from 'node:assert/strict'

export async function checkVideoManagement(page, baseUrl) {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(baseUrl + '/video-management/upload')
  await page.getByRole('heading', { name: 'Create something worth sharing.' }).waitFor()
  await page.getByRole('heading', { name: 'Choose your school' }).waitFor()

  // GIS was recently added to the school list and must be searchable and selectable.
  await page.getByPlaceholder('Find your school…').fill('gis')
  await page.getByRole('button', { name: 'Upload for Ghana International School' }).click()
  await page.getByRole('heading', { name: 'Choose a folder' }).waitFor()

  // Tabs must render Photos, Videos, Text in that order, Photos active by default.
  const tabs = page.getByRole('tab')
  assert.deepEqual((await tabs.allTextContents()).map((text) => text.trim()), ['Photos', 'Videos', 'Text'])
  assert.equal(await page.getByRole('tab', { name: 'Photos' }).getAttribute('aria-selected'), 'true')
  await page.getByText('Select photos to upload').waitFor()

  await page.getByRole('tab', { name: 'Videos' }).click()
  await page.getByText('Select videos to upload').waitFor()

  // Create, then rename, a folder for this school. Scoped to the folder
  // list itself: the selected folder's name also appears in the "Selected
  // folder" summary and the "Upload content" panel subtitle once chosen.
  const folderList = page.getByRole('group', { name: 'Upload folders' })
  await page.getByRole('button', { name: 'New folder' }).click()
  await page.getByLabel('Folder name').fill('Orientation week')
  await page.getByRole('button', { name: 'Create folder' }).click()
  await page.getByRole('heading', { name: 'Choose a folder' }).waitFor()
  await folderList.getByText('Orientation week').waitFor()
  await page.getByRole('button', { name: 'Rename Orientation week' }).click()
  const renameField = page.getByLabel('Folder name')
  await renameField.fill('')
  await renameField.fill('Freshers Week')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await folderList.getByText('Freshers Week').waitFor()
  assert.equal(await folderList.getByText('Orientation week').count(), 0)
  // General itself is never renameable.
  assert.equal(await page.getByRole('button', { name: 'Rename General' }).count(), 0)

  // Text tab: text + hashtag + reference, distinct from each other in the live preview.
  await page.getByRole('tab', { name: 'Text' }).click()
  await page.getByRole('heading', { name: 'Create text post' }).waitFor()
  const textField = page.getByRole('textbox', { name: 'Text' })
  await textField.fill('Big win for the robotics team')
  await page.getByRole('button', { name: 'Add hashtag' }).click()
  await page.keyboard.type('RoboticsGH')
  await page.getByRole('textbox', { name: 'Reference' }).fill('REF-2049')
  assert.equal(await textField.inputValue(), 'Big win for the robotics team #RoboticsGH')

  await page.getByRole('button', { name: 'Preview', exact: true }).click()
  const previewDialog = page.getByRole('dialog', { name: 'Post preview' })
  await previewDialog.getByText('Ghana International School').waitFor()
  await previewDialog.getByText('REF-2049').waitFor()
  await previewDialog.getByText('Big win for the robotics team #RoboticsGH').waitFor()
  // The reference must read as a labeled "Ref" badge, not a "#" hashtag chip.
  assert.equal(await previewDialog.getByText('#REF-2049').count(), 0)
  await page.keyboard.press('Escape')
  await previewDialog.waitFor({ state: 'hidden' })

  await page.goto(baseUrl + '/video-management/posts')
  await page.getByRole('heading', { name: 'Good stories belong together.' }).waitFor()
  await page.getByText(/posts in \d+ collections?/).waitFor()

  for (const width of [1440, 1024, 768,390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, '/video-management/posts overflows at ' + width)
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  console.log('Video Management: school search/select (incl. GIS), tab order, folder create/rename, text/hashtag/reference preview, and posts page passed')
}
