// Full visual + interaction pass. Usage: node shots.mjs <outdir> [only-scenario,...]
import fs from 'node:fs'
import { chromium, openApp, BASE, collectMetrics, installLongTaskObserver, startStreamServer, stopStreamServer } from './app.mjs'

const OUT = process.argv[2]
const ONLY = (process.argv[3] || '').split(',').filter(Boolean)
fs.mkdirSync(OUT, { recursive: true })
const TS = '/workspace/ws-launch/cs-launch-research'
const report = { scenarios: {}, checks: {} }
const want = (n) => !ONLY.length || ONLY.includes(n)
const browser = await chromium.launch()
await startStreamServer()

async function withApp(name, opts, fn) {
  if (!want(name)) return
  const t = Date.now()
  const { context, page, log } = await openApp(browser, opts)
  try {
    await installLongTaskObserver(context)
    const r = await fn(page, context)
    report.scenarios[name] = { ok: true, ms: Date.now() - t, ...(r || {}), errors: [...new Set(log.errors)].filter((e) => !/fonts\.googleapis|status of 404/.test(e)).slice(0, 12), unhandled: [...new Set(log.unhandled)] }
  } catch (e) {
    report.scenarios[name] = { ok: false, error: String(e).slice(0, 400), errors: [...new Set(log.errors)].slice(0, 12) }
    try { await page.screenshot({ path: `${OUT}/${name}-FAILED.png` }) } catch {}
  } finally {
    await context.close()
  }
}

async function loadThread(page) {
  await page.goto(BASE + TS, { waitUntil: 'domcontentloaded' })
  await page.getByText('Launch plan').first().waitFor({ timeout: 30000 })
  await page.waitForTimeout(800)
}

/** Every visible button must be the top element at its own centre (no overlay covering it). */
async function coveredButtons(page) {
  return page.evaluate(() => {
    const out = []
    for (const el of document.querySelectorAll('button, a[href], [role="button"]')) {
      const r = el.getBoundingClientRect()
      if (r.width < 4 || r.height < 4) continue
      if (r.bottom < 0 || r.right < 0 || r.top > innerHeight || r.left > innerWidth) continue
      const s = getComputedStyle(el)
      if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) === 0 || s.pointerEvents === 'none') continue
      const x = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2))
      const y = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2))
      const top = document.elementFromPoint(x, y)
      if (top && !el.contains(top) && !top.contains(el)) out.push(`${(el.getAttribute('aria-label') || el.textContent || el.title || el.tagName).trim().slice(0, 40)} <- covered by ${top.tagName}.${String(top.className).slice(0, 50)}`)
    }
    return out
  })
}

/** Invisible-but-clickable controls (opacity 0 yet pointer events on). */
async function invisibleClickable(page) {
  return page.evaluate(() => {
    const out = []
    for (const el of document.querySelectorAll('button')) {
      const r = el.getBoundingClientRect()
      if (r.width < 4 || r.height < 4 || r.top > innerHeight) continue
      let n = el, op = 1
      while (n && n !== document.body) { op *= Number(getComputedStyle(n).opacity); n = n.parentElement }
      if (op === 0 && getComputedStyle(el).pointerEvents !== 'none') out.push((el.getAttribute('aria-label') || el.title || el.textContent || '').trim().slice(0, 40))
    }
    return out
  })
}

for (const theme of ['light', 'dark']) {
  await withApp(`ws-${theme}`, { theme }, async (page) => {
    await loadThread(page)
    const metrics = await collectMetrics(page)
    await page.screenshot({ path: `${OUT}/ws-${theme}.png` })
    const covered = await coveredButtons(page)
    const invisible = await invisibleClickable(page)
    return { metrics, covered, invisible }
  })
  await withApp(`ws-mobile-${theme}`, { theme, width: 390, height: 844 }, async (page) => {
    await loadThread(page)
    await page.screenshot({ path: `${OUT}/ws-mobile-${theme}.png` })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
    return { horizontalOverflowPx: overflow, covered: await coveredButtons(page) }
  })
}

await withApp('sidebar-dark', { theme: 'dark' }, async (page) => {
  await loadThread(page)
  await page.getByRole('button', { name: 'Open sidebar' }).first().click()
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${OUT}/sidebar-open-dark.png` })
  const invisible = await invisibleClickable(page)
  // Workspace dropdown: expand a non-active workspace by clicking its name.
  await page.getByText('Research & intelligence', { exact: false }).first().click()
  await page.waitForTimeout(900)
  const expanded = await page.getByText('Market scan').first().isVisible().catch(() => false)
  await page.screenshot({ path: `${OUT}/sidebar-dropdown-dark.png` })
  // Keyboard: can a workspace header be reached and toggled with the keyboard?
  const kb = await page.evaluate(() => {
    const els = [...document.querySelectorAll('[aria-expanded]')].map((e) => (e.textContent || '').trim().slice(0, 30))
    return els
  })
  return { dropdownExpandedShowsTaskspaces: expanded, invisibleClickable: invisible, ariaExpandedControls: kb, covered: await coveredButtons(page) }
})

await withApp('activity-light', { theme: 'light' }, async (page) => {
  await loadThread(page)
  const toggle = page.getByText(/4 steps|activity/i).first()
  await toggle.click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/activity-expanded-light.png` })
})

await withApp('preview-dark', { theme: 'dark' }, async (page) => {
  await loadThread(page)
  await page.getByText('launch brief', { exact: true }).first().click()
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${OUT}/preview-dark.png` })
  return { covered: await coveredButtons(page) }
})

for (const theme of ['dark', 'light']) {
  await withApp(`stream-${theme}`, { theme }, async (page) => {
    await loadThread(page)
    // Pick a specialty if the engine requires one.
    const spec = page.getByRole('button', { name: /Specialty/ }).first()
    if (await spec.isVisible().catch(() => false)) {
      await spec.click(); await page.waitForTimeout(300)
      await page.getByRole('button', { name: 'Chat', exact: true }).first().click()
      await page.waitForTimeout(300)
    }
    const box = page.locator('textarea').first()
    await box.click()
    await box.fill('Run the launch checks')
    await page.keyboard.press('Shift+Enter')
    const hasNewline = (await box.inputValue()).includes('\n')
    let streamRequests = 0
    page.on('request', (r) => { if (/\/stream$/.test(r.url()) && r.method() === 'POST') streamRequests++ })
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1300)
    await page.screenshot({ path: `${OUT}/stream-mid-${theme}.png` })
    await page.waitForTimeout(4500)
    await page.screenshot({ path: `${OUT}/stream-done-${theme}.png` })
    const finalText = await page.getByText('The launch checks pass.').count()
    return { shiftEnterInsertsNewline: hasNewline, streamRequests, finalAnswerRendered: finalText > 0 }
  })
}


await withApp('interactions-dark', { theme: 'dark' }, async (page) => {
  const out = {}
  await loadThread(page)
  // Escape closes a composer menu and returns focus to the message box.
  await page.getByRole('button', { name: /Specialty/ }).first().click()
  await page.waitForTimeout(250)
  out.specialtyMenuOpened = await page.getByRole('button', { name: 'Close specialty menu' }).isVisible()
  await page.keyboard.press('Escape')
  await page.waitForTimeout(250)
  out.escapeClosesMenu = !(await page.getByRole('button', { name: 'Close specialty menu' }).isVisible().catch(() => false))
  out.focusBackInComposer = await page.evaluate(() => document.activeElement?.tagName === 'TEXTAREA')
  // A click inside the portaled engine menu selects the engine.
  await page.getByRole('button', { name: /Rivine TaskForce/ }).first().click()
  await page.waitForTimeout(300)
  await page.locator('[data-agentic-engines-dropdown] button', { hasText: 'Rivine Code' }).first().click()
  await page.waitForTimeout(400)
  out.engineSwitchedToCode = await page.getByRole('button', { name: /Rivine Code/ }).first().isVisible().catch(() => false)
  // Sidebar: the workspace dropdown, by mouse and by keyboard.
  await page.getByRole('button', { name: 'Open sidebar' }).first().click()
  await page.waitForTimeout(500)
  const sidebar = page.locator('[data-app-sidebar]')
  await sidebar.getByRole('button', { name: 'Research & intelligence' }).click()
  await page.waitForTimeout(900)
  out.dropdownShowsOtherWorkspaceTaskspaces = await sidebar.getByText('Market scan').isVisible().catch(() => false)
  out.urlUnchangedByExpand = page.url().endsWith('/workspace/ws-launch/cs-launch-research')
  await page.screenshot({ path: `${OUT}/sidebar-dropdown-fixed-dark.png` })
  const eng = sidebar.getByRole('button', { name: 'Engineering' })
  await eng.focus()
  await page.keyboard.press('Enter')
  await page.waitForTimeout(900)
  out.keyboardOpensDropdown = (await eng.getAttribute('aria-expanded')) === 'true' && await sidebar.getByText('API review').isVisible().catch(() => false)
  out.invisibleClickable = await invisibleClickable(page)
  return out
})

await withApp('scroll-follow-light', { theme: 'light' }, async (page) => {
  const out = {}
  await page.goto(BASE + '/workspace/ws-launch/cs-creative-brief', { waitUntil: 'domcontentloaded' })
  await page.getByText('Question 24').first().waitFor({ timeout: 30000 })
  await page.waitForTimeout(800)
  const gap = () => page.evaluate(() => { const el = [...document.querySelectorAll('div')].find((d) => d.scrollHeight > d.clientHeight + 50 && getComputedStyle(d).overflowY === 'auto' && d.querySelector('.space-y-3')); return el ? Math.round(el.scrollHeight - el.scrollTop - el.clientHeight) : -1 })
  out.opensAtLatest = (await gap()) < 100
  await page.evaluate(() => { const el = [...document.querySelectorAll('div')].find((d) => d.scrollHeight > d.clientHeight + 50 && getComputedStyle(d).overflowY === 'auto' && d.querySelector('.space-y-3')); el.scrollTop = 0; el.dispatchEvent(new Event('scroll')) })
  await page.waitForTimeout(400)
  const jump = page.getByRole('button', { name: 'Jump to latest message' })
  out.jumpButtonAppearsWhenScrolledUp = await jump.isVisible().catch(() => false)
  await page.screenshot({ path: `${OUT}/scroll-jump-light.png` })
  if (out.jumpButtonAppearsWhenScrolledUp) { await jump.click(); await page.waitForTimeout(400) }
  out.jumpReturnsToLatest = (await gap()) < 100
  return out
})

for (const [name, path] of [['settings', '/settings'], ['automations', '/automations'], ['observability', '/observability'], ['credits', '/credits'], ['teams', '/teams'], ['connector', '/workspace/connector']]) {
  for (const theme of ['dark', 'light']) {
    await withApp(`page-${name}-${theme}`, { theme }, async (page) => {
      await page.goto(BASE + path, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(4500)
      await page.screenshot({ path: `${OUT}/page-${name}-${theme}.png` })
      return { metrics: await collectMetrics(page) }
    })
  }
}

stopStreamServer()
await browser.close()
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2))
for (const [k, v] of Object.entries(report.scenarios)) console.log(k, v.ok ? 'ok' : 'FAIL ' + v.error, v.metrics ? JSON.stringify(v.metrics) : '')
