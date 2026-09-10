import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const storageKey = 'adbox-rdi-cms-v1'
const waitForSave = page => page.waitForFunction(key => {
  const draft = localStorage.getItem(key)
  return draft && JSON.parse(draft).updatedAt !== null
}, storageKey)

export async function checkRdiCms(page, baseUrl) {
  const requests = []
  const record = request => { if (['fetch', 'xhr'].includes(request.resourceType()) || request.method() !== 'GET') requests.push(request.method() + ' ' + request.url()) }
  page.on('request', record)
  try {
    await page.setViewportSize({width:1440,height:1000})
    await page.goto(baseUrl + '/rdi')
    await page.getByRole('heading', {name:'Your website, in one place.'}).waitFor()
    assert.equal(await page.getByRole('link', {name:/^Edit .+ page$/}).count(), 6)
    await page.getByRole('textbox', {name:'Search website pages'}).fill('solar')
    assert.equal(await page.getByRole('link', {name:/^Edit .+ page$/}).count(), 1)
    await page.getByRole('textbox', {name:'Search website pages'}).fill('unmatched')
    await page.getByRole('heading', {name:'No pages found'}).waitFor()
    await page.getByRole('button', {name:'Clear search'}).click()
    await page.getByRole('link', {name:'Edit Home page'}).click()
    const preview = page.frameLocator('iframe[title="Website page preview"]')
    await preview.getByRole('heading', {name:'Welcome to RichDad Investments',exact:true}).waitFor()
    const heading = page.getByRole('textbox', {name:'Main heading',exact:true})
    await heading.fill('Welcome to our next chapter')
    await preview.getByRole('heading', {name:'Welcome to our next chapter RichDad Investments',exact:true}).waitFor()
    await page.getByRole('button', {name:'Save draft',exact:true}).click()
    await waitForSave(page)
    await page.reload()
    await page.getByRole('textbox', {name:'Main heading',exact:true}).waitFor()
    assert.equal(await heading.inputValue(),'Welcome to our next chapter')
    await heading.fill('A fresh perspective')
    await page.getByRole('button', {name:'Undo change',exact:true}).click()
    assert.equal(await heading.inputValue(),'Welcome to our next chapter')
    await page.getByRole('button', {name:'Redo change',exact:true}).click()
    assert.equal(await heading.inputValue(),'A fresh perspective')
    const visibility = page.getByRole('switch', {name:'Show Welcome section',exact:true})
    await visibility.click()
    await preview.locator('h1').waitFor({state:'hidden'})
    await visibility.click()
    await preview.getByRole('heading', {name:'A fresh perspective RichDad Investments',exact:true}).waitFor()
    await page.getByRole('button', {name:'mobile preview',exact:true}).click()
    const frame = page.frames().find(frame => frame.url().includes('/rdi/preview/home'))
    await frame.waitForFunction(() => innerWidth === 390)
    await page.getByRole('button', {name:'desktop preview',exact:true}).click()
    await page.getByRole('tab', {name:'Search settings',exact:true}).click()
    await page.getByRole('textbox', {name:'Page title',exact:true}).fill('RichDad Investments | Our next chapter')
    await frame.waitForFunction(() => document.title === 'RichDad Investments | Our next chapter')
    await page.getByRole('tab', {name:'Content',exact:true}).click()
    await page.getByRole('navigation', {name:'Page sections',exact:true}).getByRole('button',{name:/Construction card/}).click()
    await page.getByRole('button', {name:'Replace image',exact:true}).click()
    const picker=page.getByRole('dialog', {name:'Choose an image'})
    await picker.getByRole('textbox', {name:'Search image library'}).waitFor()
    await page.keyboard.press('Escape')
    await picker.waitFor({state:'hidden'})
    await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Replace image')
    await page.getByRole('button', {name:'Replace image',exact:true}).click()
    await picker.getByRole('textbox', {name:'Search image library'}).fill('water installation')
    await picker.getByRole('button', {name:'Select water installation',exact:true}).click()
    await picker.getByRole('button', {name:'Use image',exact:true}).click()
    await preview.locator('[data-cms-section="home.construction-card"] img').waitFor()
    await frame.waitForFunction(() => document.querySelector('[data-cms-section="home.construction-card"] img')?.getAttribute('src') === '/rdi-assets/construction/water-installation.jpg')

    await page.goto(baseUrl + '/rdi/library')
    await page.getByRole('heading', {name:'Media library',exact:true}).waitFor()
    await page.getByLabel('Upload images', {exact:true}).setInputFiles({name:'not-an-image.txt',mimeType:'text/plain',buffer:Buffer.from('not an image')})
    await page.getByRole('alert').filter({hasText:'Choose a JPG, PNG, WebP, or GIF image.'}).waitFor()
    const image=await readFile('public/rdi-assets/logo.png')
    await page.getByLabel('Upload images', {exact:true}).setInputFiles({name:'cms-library-image.png',mimeType:'image/png',buffer:image})
    await page.getByRole('button', {name:'Image details: cms-library-image.png',exact:true}).click()
    const details=page.getByRole('dialog', {name:'Image details'})
    await details.getByRole('textbox', {name:'Image name',exact:true}).fill('Campaign image')
    await details.getByRole('button', {name:'Save details',exact:true}).click()
    await page.getByRole('textbox', {name:'Search media library',exact:true}).fill('Campaign image')
    await page.getByRole('button', {name:'Image details: Campaign image',exact:true}).waitFor()
    await page.goto(baseUrl + '/rdi/pages/home')
    await page.getByRole('navigation', {name:'Page sections',exact:true}).getByRole('button',{name:/Construction card/}).click()
    await page.getByRole('button', {name:'Replace image',exact:true}).click()
    await page.getByRole('dialog').getByRole('textbox', {name:'Search image library'}).fill('Campaign image')
    await page.getByRole('button', {name:'Select Campaign image',exact:true}).click()
    await page.getByRole('button', {name:'Use image',exact:true}).click()
    await page.getByRole('button', {name:'Save draft',exact:true}).click()
    await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).values['home.construction-card.1']?.startsWith('asset:'),storageKey)
    await page.reload()
    await preview.locator('[data-cms-section="home.construction-card"] img').waitFor()
    assert.ok((await preview.locator('[data-cms-section="home.construction-card"] img').getAttribute('src')).startsWith('data:image/png;base64,'))

    await page.goto(baseUrl + '/rdi/pages/contact')
    await page.getByRole('navigation',{name:'Page sections',exact:true}).getByRole('button',{name:/Frequently asked questions/}).click()
    await page.getByRole('button',{name:'Add item',exact:true}).click()
    await page.getByRole('textbox',{name:'Question',exact:true}).fill('Can I start a new project?')
    await page.getByRole('textbox',{name:'Answer',exact:true}).fill('Yes. Share your project details with our team.')
    await preview.getByRole('button',{name:'Can I start a new project?',exact:true}).waitFor()
    await page.getByRole('button',{name:'Duplicate Can I start a new project?',exact:true}).click()
    await page.getByRole('textbox',{name:'Question',exact:true}).fill('What happens next?')
    await page.getByRole('button',{name:'Move What happens next? up',exact:true}).click()
    await preview.getByRole('button',{name:'What happens next?',exact:true}).waitFor()
    await page.getByRole('button',{name:'Remove',exact:true}).click()
    await page.getByRole('dialog',{name:'Remove this item?'}).getByRole('button',{name:'Remove item',exact:true}).click()
    await preview.getByRole('button',{name:'What happens next?',exact:true}).waitFor({state:'hidden'})
    await page.getByRole('button',{name:'Save draft',exact:true}).click()

    await page.goto(baseUrl + '/rdi/settings')
    await page.getByRole('textbox',{name:'Short brand name',exact:true}).fill('RDI Studio')
    await page.getByRole('textbox',{name:'General email address',exact:true}).fill('hello@rdi.example')
    await page.getByRole('textbox',{name:'General phone number',exact:true}).fill('+233 (0) 24 123 4567')
    await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).values['site.brand.name']==='RDI Studio',storageKey)
    const downloadEvent=page.waitForEvent('download')
    await page.getByRole('button',{name:'Export backup',exact:true}).click()
    const download=await downloadEvent
    const backup=JSON.parse(await readFile(await download.path(),'utf8'))
    assert.equal(backup.version,1)
    assert.equal(backup.values['site.brand.name'],'RDI Studio')
    assert.equal(backup.values['home.welcome.1'],'A fresh perspective')
    assert.ok(backup.values['solar.introduction.1'])
    assert.ok(backup.collections['solar-products'].length===9)
    assert.ok(backup.assets.some(asset=>asset.name==='Campaign image'))
    await page.getByLabel('Import website backup',{exact:true}).setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"version":999}')})
    await page.getByRole('alert').filter({hasText:'valid RDI website backup'}).waitFor()
    const duplicateEntries = structuredClone(backup)
    duplicateEntries.collections.faqs[1].id = duplicateEntries.collections.faqs[0].id
    await page.getByLabel('Import website backup',{exact:true}).setInputFiles({name:'duplicate-entries.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(duplicateEntries))})
    await page.getByRole('alert').filter({hasText:'valid RDI website backup'}).waitFor()
    assert.equal(await page.getByRole('dialog').count(),0)
    await page.getByRole('textbox',{name:'Short brand name',exact:true}).fill('Temporary name')
    await page.getByLabel('Import website backup',{exact:true}).setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))})
    await page.getByRole('dialog',{name:'Restore this website backup?'}).getByRole('button',{name:'Restore backup',exact:true}).click()
    assert.equal(await page.getByRole('textbox',{name:'Short brand name',exact:true}).inputValue(),'RDI Studio')
    await page.goto(baseUrl + '/rdi/preview/home')
    await page.getByRole('heading',{name:'A fresh perspective RichDad Investments',exact:true}).waitFor()
    await page.locator('header').getByText('RDI Studio',{exact:true}).waitFor()
    assert.equal(await page.locator('main').count(),1)
    assert.equal(await page.getByRole('navigation',{name:'Dashboard navigation',exact:true}).count(),0)
    await page.goto(baseUrl + '/rdi/preview/contact')
    await page.locator('main a[href="mailto:hello@rdi.example"]').waitFor()
    await page.locator('footer a[href="mailto:hello@rdi.example"]').waitFor()
    assert.equal(await page.locator('main a[href="tel:+233241234567"]').innerText(),'+233 (0) 24 123 4567')

    for(const path of ['/rdi','/rdi/pages/home','/rdi/library','/rdi/settings']){
      await page.goto(baseUrl+path)
      await page.locator('h1').waitFor()
      for(const width of [1440,1024,768,390,320]){
        await page.setViewportSize({width,height:1000})
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,path+' document overflow at '+width)
        assert.equal(await page.locator('main').evaluate(main=>main.scrollWidth>main.clientWidth),false,path+' panel overflow at '+width)
      }
    }
    assert.deepEqual(requests,[],'CMS and previews must not make API requests')
    await checkDraftRecovery(page.context().browser(),baseUrl)
    console.log('CMS editing, live previews, undo/redo, visibility, SEO, media validation/replacement, collection changes, backup restore, responsive layouts, and zero API calls passed')
  } finally {page.off('request',record)}
}

async function checkDraftRecovery(browser, baseUrl) {
  for (const failure of ['corrupt-draft', 'storage-full']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
    const errors = []
    const apiRequests = []
    try {
      await context.addInitScript(({ key, failure }) => {
        sessionStorage.setItem('adbox-super-admin-session', JSON.stringify({ accessToken: 'cms-recovery-test' }))
        if (failure === 'corrupt-draft') localStorage.setItem(key, '{invalid draft')
        if (failure === 'storage-full') {
          const original = Storage.prototype.setItem
          Storage.prototype.setItem = function (name, value) {
            if (name === key) throw new DOMException('Storage is full', 'QuotaExceededError')
            return original.call(this, name, value)
          }
        }
      }, { key: storageKey, failure })
      await context.route('**/*', route => {
        if (new URL(route.request().url()).pathname.startsWith('/api/')) {
          apiRequests.push(route.request().url())
          return route.abort()
        }
        return route.continue()
      })
      const recovery = await context.newPage()
      recovery.on('pageerror', error => errors.push(error.message))
      await recovery.goto(baseUrl + '/rdi/pages/home')
      const heading = recovery.getByRole('textbox', { name: 'Main heading', exact: true })
      await heading.waitFor()
      if (failure === 'corrupt-draft') {
        await recovery.getByRole('alert').filter({ hasText: 'saved draft could not be read' }).waitFor()
        assert.equal(await heading.inputValue(), 'Welcome to')
        await heading.fill('Recovered content')
        await recovery.getByRole('button', { name: 'Save draft', exact: true }).click()
        await recovery.waitForFunction(key => JSON.parse(localStorage.getItem(key)).values['home.welcome.1'] === 'Recovered content', storageKey)
        assert.equal(await recovery.getByRole('alert').count(), 0)
      } else {
        await heading.fill('Keep this unsaved content')
        await recovery.getByRole('alert').filter({ hasText: 'couldn’t save your changes' }).waitFor()
        await recovery.getByRole('status').filter({ hasText: 'Not saved' }).waitFor()
        const downloaded = recovery.waitForEvent('download')
        await recovery.getByRole('button', { name: 'Export backup', exact: true }).click()
        const backup = JSON.parse(await readFile(await (await downloaded).path(), 'utf8'))
        assert.equal(backup.values['home.welcome.1'], 'Keep this unsaved content')
        await recovery.getByRole('button', { name: 'Try saving again', exact: true }).click()
        await recovery.getByRole('alert').filter({ hasText: 'couldn’t save your changes' }).waitFor()
      }
      assert.deepEqual(errors, [], failure + ' should not crash the CMS')
      assert.deepEqual(apiRequests, [], failure + ' should remain local')
    } finally { await context.close() }
  }
  console.log('Corrupt draft recovery and storage failure backup passed')
}
