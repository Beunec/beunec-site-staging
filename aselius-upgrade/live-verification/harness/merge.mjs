// Per-line review: the real CodeMirrorMergeDiff (bundled by esbuild from
// merge-entry.tsx) with Accept / Reject on each changed block.
import fs from 'node:fs'
import { chromium } from './app.mjs'
const [BUNDLE, OUT] = process.argv.slice(2)
const js = fs.readFileSync(BUNDLE, 'utf8')
const browser = await chromium.launch()
const res = {}

async function open(theme) {
  const page = await browser.newPage({ viewport: { width: 900, height: 520 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.route('http://merge.test/**', (route) => {
    const u = new URL(route.request().url())
    if (u.pathname === '/bundle.js') return route.fulfill({ contentType: 'text/javascript', body: js })
    return route.fulfill({ contentType: 'text/html', body: '<!doctype html><body style="margin:0"><div id="root"></div><script type="module" src="/bundle.js"></script></body>' })
  })
  await page.goto(`http://merge.test/?theme=${theme}`)
  await page.locator('.cm-chunkButtons').first().waitFor({ timeout: 15000 })
  return { page, errors }
}
const state = (page) => page.evaluate(() => ({ resolved: window.__merge.resolved, count: window.__merge.resolvedCount, OLD: window.__merge.OLD, NEW: window.__merge.NEW, remaining: document.getElementById('remaining').textContent }))

for (const theme of ['dark', 'light']) {
  const { page, errors } = await open(theme)
  res[`${theme}.initialRemaining`] = (await state(page)).remaining
  res[`${theme}.buttonsPerBlock`] = await page.locator('.cm-chunkButtons').evaluateAll((els) => els.map((e) => [...e.querySelectorAll('button')].map((b) => b.textContent).join('/')))
  await page.screenshot({ path: `${OUT}/code-review-inline-${theme}.png` })
  if (theme === 'dark') {
    // Reject the first block (x = 1 stays), accept the others.
    await page.locator('.cm-chunkButtons').first().getByRole('button', { name: 'Reject' }).click()
    res.afterOneReject = (await state(page)).remaining
    // Keyboard: Enter on a focused Accept.
    await page.locator('.cm-chunkButtons').first().getByRole('button', { name: 'Accept' }).focus()
    await page.keyboard.press('Enter')
    while (await page.locator('.cm-chunkButtons').count()) {
      await page.locator('.cm-chunkButtons').first().getByRole('button', { name: 'Accept' }).click()
    }
    const s = await state(page)
    const expected = s.NEW.replace('const x = 10', 'const x = 1')
    res.mixedMergeIsExact = s.resolved === expected
    res.resolvedOnce = s.count === 1
    res.remainingAtEnd = s.remaining
  }
  if (errors.length) res[`${theme}.errors`] = errors
  await page.close()
}
for (const [name, fn] of [['acceptAll', 'acceptAll'], ['rejectAll', 'rejectAll']]) {
  const { page } = await open('light')
  await page.evaluate((f) => window.__merge.handle.current[f](), fn)
  await page.waitForTimeout(100)
  const s = await state(page)
  res[`${name}Result`] = s.resolved === (name === 'acceptAll' ? s.NEW : s.OLD) ? 'exact' : JSON.stringify(s.resolved)
  await page.close()
}
await browser.close()
console.log(JSON.stringify(res, null, 1))
