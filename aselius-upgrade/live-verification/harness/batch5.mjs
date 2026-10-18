// Batch 5: Credits-page charcoal dark mode, the Share Workspace tab, the
// Selius page, new sidebar SVG icons + scroll/click behaviour, the brand logo
// on Sidebar vs Onboarding, and the new Scan QR Code camera dialog.
// Mocked backend except where noted.
import { chromium, openApp, BASE } from './app.mjs'

const OUT = process.argv[2]
const CORS = { 'Access-Control-Allow-Origin': BASE, 'Access-Control-Allow-Credentials': 'true' }
const json = (route, body, status = 200) => route.fulfill({ status, headers: CORS, contentType: 'application/json', body: JSON.stringify(body) })
const iso = (m) => new Date(Date.UTC(2026, 9, 16, 9, m)).toISOString()
const rgb = (hex) => { const n = parseInt(hex.replace('#', ''), 16); return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})` }
const ASELIUS_BLUE = rgb('#00477d')

const res = {}
const browser = await chromium.launch()
async function guard(name, fn) {
  try { await fn() } catch (e) { res[`${name}.FAILED`] = String(e.message || e).split('\n')[0].slice(0, 220) }
}

// ── 1. Credits: no raw Aselius-blue background survives into dark mode ─────
await guard('credits', async () => {
  for (const theme of ['dark', 'light']) {
    const { page, context } = await openApp(browser, { theme })
    await page.route(/\/api\/payment\/credits$/, (r) => json(r, {
      balance: 24.5, shareableBalance: 20, plan: 'essential', monthlyAllocation: 15,
      autoReload: { enabled: false, minBalance: 10, reloadPackageId: 'starter' },
      alerts: [], transactions: [], shareLimits: { min: 1, max: 500 },
    }))
    await page.route(/\/usage\/activity/, (r) => json(r, { items: [], total: 0 }))
    await page.goto(BASE + '/credits', { waitUntil: 'domcontentloaded' })
    await page.getByText('Engine minimum balance').waitFor({ timeout: 30000 })
    await page.waitForTimeout(500)
    const addCredits = page.getByRole('button', { name: 'Add credits' })
    const bg = await addCredits.evaluate((el) => getComputedStyle(el).backgroundColor)
    res[`${theme}.addCreditsBg`] = bg
    res[`${theme}.addCreditsIsAseliusBlue`] = bg === ASELIUS_BLUE
    const cardBg = await page.locator('section').filter({ hasText: 'Prepaid Credits' }).first().locator('> div').first().evaluate((el) => getComputedStyle(el).backgroundColor)
    res[`${theme}.cardBg`] = cardBg
    await page.getByRole('button', { name: /Redeem/ }).scrollIntoViewIfNeeded()
    const redeemBg = await page.getByRole('button', { name: 'Redeem' }).evaluate((el) => getComputedStyle(el).backgroundColor)
    res[`${theme}.redeemIsAseliusBlue`] = redeemBg === ASELIUS_BLUE
    await page.screenshot({ path: `${OUT}/credits-charcoal-${theme}.png` })
    await context.close()
  }
})

// ── 2. Share Workspace tab: Invite button, dark mode ────────────────────────
await guard('shareTab', async () => {
  const { page, context } = await openApp(browser, { theme: 'dark' })
  await page.route(/\/workspaces\/ws-launch\/shares/, (r) => r.request().method() === 'GET' ? json(r, []) : r.fallback())
  await page.route(/platform\/connections/, (r) => json(r, []))
  await page.goto(BASE + '/workspace/ws-launch/cs-launch-research', { waitUntil: 'domcontentloaded' })
  await page.getByText('Launch plan').first().waitFor({ timeout: 30000 })
  // The real entry point: the top-bar "Share Workspace" button — this is
  // what requestSharePanel()/setPreviewTab('share') actually wires to.
  await page.getByRole('button', { name: 'Share Workspace' }).click()
  const invite = page.getByRole('button', { name: /Invite/ })
  await invite.waitFor({ timeout: 15000 })
  const bg = await invite.evaluate((el) => getComputedStyle(el).backgroundColor)
  res['shareTab.inviteBg'] = bg
  res['shareTab.inviteIsAseliusBlue'] = bg === ASELIUS_BLUE
  await page.screenshot({ path: `${OUT}/share-tab-dark.png` })
  await context.close()
})

// ── 3. Selius page: dark-mode readability + the preference card ────────────
await guard('selius', async () => {
  for (const theme of ['dark', 'light']) {
    const { page, context } = await openApp(browser, { theme })
    await page.goto(BASE + '/selius', { waitUntil: 'domcontentloaded' })
    await page.getByText('A quieter kind of presence.').waitFor({ timeout: 30000 })
    await page.waitForTimeout(400)
    // Scoped to <main>: "Selius" is also the sidebar nav item's own label.
    const label = page.locator('main').getByText('Selius', { exact: true })
    const labelColor = await label.evaluate((el) => getComputedStyle(el).color)
    const pageBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor || getComputedStyle(document.documentElement).backgroundColor)
    res[`${theme}.seliusLabelColor`] = labelColor
    res[`${theme}.pageBg`] = pageBg
    const card = page.locator('div.rounded-2xl.border').first()
    res[`${theme}.cardBg`] = await card.evaluate((el) => getComputedStyle(el).backgroundColor)
    await page.screenshot({ path: `${OUT}/selius-${theme}.png` })
    await context.close()
  }
})

// ── 4. Sidebar: new SVG icons, scroll with many taskspaces, click responsiveness ─
await guard('sidebar', async () => {
  const MANY = Array.from({ length: 45 }, (_, i) => ({
    id: `cs-many-${i}`, workspace_id: 'ws-launch', title: `Taskspace ${i + 1} — a longer realistic title`,
    created_at: iso(-300 + i), updated_at: iso(30 + i),
  }))
  const { page, context, log } = await openApp(browser, { theme: 'dark' })
  await page.route(/\/workspaces\/ws-launch\/chat-spaces\/?$/, (r) => json(r, MANY))
  await page.route(/\/workspaces\/bootstrap/, (r) => json(r, { workspaces: [
    { id: 'ws-launch', name: 'Product launch', description: null, owner_cloudhandle: 'demo', created_at: iso(-900), updated_at: iso(30), user_role: 'owner' },
  ], active_workspace_id: 'ws-launch', chat_spaces: MANY, active_chat_space_id: MANY[0].id }))
  await page.goto(BASE + '/workspace/ws-launch/' + MANY[0].id, { waitUntil: 'domcontentloaded' })
  await page.getByText('Welcome to Taskspace 1', { exact: false }).first().waitFor({ timeout: 30000 })
  // Entering a workspace auto-collapses the sidebar to a 72px rail (existing,
  // intentional behaviour) — open it, the way a person browsing their
  // taskspace list actually would.
  await page.getByLabel('Open sidebar').click()
  await page.getByText('Taskspace 1 — a longer', { exact: false }).first().waitFor({ timeout: 10000 })
  await page.waitForTimeout(500)

  // New glyphs render as real <svg> (not the old lucide chat bubble / grid / etc),
  // each tinted via the nav item's own `color`.
  const navColors = { Automations: 'rgb(15, 118, 110)', Observability: 'rgb(0, 71, 125)', Credits: 'rgb(16, 185, 129)', 'Manage Teams': 'rgb(6, 182, 212)', Settings: 'rgb(107, 114, 128)' }
  for (const [label, color] of Object.entries(navColors)) {
    const svg = page.locator('[role="menuitem"]').filter({ hasText: label }).locator('svg').first()
    res[`sidebar.icon.${label}`] = { present: (await svg.count()) > 0, color: await svg.evaluate((el) => el.style.color).catch(() => null), matchesConfig: null }
    res[`sidebar.icon.${label}`].matchesConfig = res[`sidebar.icon.${label}`].color === color
  }
  // "Workspaces" is a plain section-label row (not a [role="menuitem"]) — a
  // screenshot of the nav top confirms its icon directly instead of fighting
  // a locator for a one-off layout; the component reference is also verified
  // by reading src/lib/store.ts (icon: WorkspaceGlyph).
  await page.locator('nav').first().screenshot({ path: `${OUT}/sidebar-nav-top-dark.png` })
  res['sidebar.taskspaceIconIsSvg'] = await page.locator('button').filter({ hasText: 'Taskspace 1 —' }).locator('svg').count() > 0

  // Scroll: the nav region holds all 45 rows and is independently scrollable.
  const scrollRegion = page.locator('[data-app-sidebar] .overflow-y-auto').first()
  const rowCount = await scrollRegion.getByText(/^Taskspace \d+ —/).count()
  res['sidebar.taskspaceRowsRendered'] = rowCount
  const before = await scrollRegion.evaluate((el) => el.scrollTop)
  await scrollRegion.evaluate((el) => { el.scrollTop = el.scrollHeight })
  const after = await scrollRegion.evaluate((el) => el.scrollTop)
  res['sidebar.scrolled'] = after > before
  res['sidebar.scrollableHeight'] = await scrollRegion.evaluate((el) => el.scrollHeight > el.clientHeight)
  await page.screenshot({ path: `${OUT}/sidebar-scrolled-dark.png` })

  // Click responsiveness: jump to the last taskspace in the long list.
  await scrollRegion.getByText('Taskspace 45 —', { exact: false }).first().click()
  await page.waitForTimeout(600)
  res['sidebar.lastTaskspaceOpened'] = page.url().includes(MANY[44].id)
  res['sidebar.noConsoleErrorsAfterClicks'] = log.errors.filter((e) => e.startsWith('PAGEERROR')).length === 0

  // Collapse then re-expand the workspace — no glitch, dropdown opens cleanly again.
  const wsRow = page.getByRole('button', { name: 'Product launch' })
  await wsRow.click()
  await page.waitForTimeout(300)
  res['sidebar.collapsedHidesRows'] = (await page.getByText('Taskspace 2 —', { exact: false }).count()) === 0
  await wsRow.click()
  await page.waitForTimeout(300)
  res['sidebar.reExpandShowsRows'] = (await page.getByText('Taskspace 2 —', { exact: false }).count()) > 0

  await page.screenshot({ path: `${OUT}/sidebar-icons-dark.png` })
  if (log.errors.some((e) => e.startsWith('PAGEERROR'))) res['sidebar.pageErrors'] = log.errors.filter((e) => e.startsWith('PAGEERROR'))
  await context.close()
})

// ── 5. Brand logo: same URL on Sidebar header and Onboarding, resolves 200 ──
await guard('logo', async () => {
  const resp = await fetch(BASE + '/Aselius%20Logo%20Icon.png')
  res['logo.status'] = resp.status
  res['logo.contentType'] = resp.headers.get('content-type')
  const { page, context } = await openApp(browser, { theme: 'dark' })
  await page.goto(BASE + '/workspace/ws-launch/cs-launch-research', { waitUntil: 'domcontentloaded' })
  await page.getByText('Launch plan').first().waitFor({ timeout: 30000 })
  // The logo only renders in the sidebar's expanded header — open it
  // (entering a workspace auto-collapses the sidebar; see the sidebar test).
  await page.getByLabel('Open sidebar').click()
  await page.getByText('Aselius Platform').first().waitFor({ timeout: 10000 })
  res['logo.sidebarSrc'] = await page.locator('[data-app-sidebar] img[alt="Aselius"]').first().getAttribute('src')
  await context.close()
})

// ── 6. Scan QR Code: camera granted (stability + cleanup), and denied ──────
await guard('qrScanDenied', async () => {
  // A fresh context with no permission grant and no auto-accept flag: Chromium
  // has no UI to show headless, so the prompt resolves to a real denial —
  // the same place a person who taps "Block" ends up.
  const { page, context } = await openApp(browser, { theme: 'dark' })
  await page.route(/\/api\/user-profiles\/demo$/, (r) => json(r, { cloudhandle: 'demo', firstName: 'Demo', lastName: 'User', username: 'demo', isPublic: true, socialLinks: [], experiences: [] }))
  await page.goto(BASE + '/settings', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Scan QR Code' }).waitFor({ timeout: 30000 })
  await page.getByRole('button', { name: 'Scan QR Code' }).click()
  await page.getByText(/Couldn.t reach the camera|can.t scan a QR code/).waitFor({ timeout: 10000 })
  res['qrScanDenied.messageShown'] = true
  await page.screenshot({ path: `${OUT}/qr-scan-denied-dark.png` })
  await page.keyboard.press('Escape')
  res['qrScanDenied.escapeCloses'] = (await page.getByRole('dialog', { name: /Scan a connect code/ }).count()) === 0
  await context.close()
})

await guard('qrScanGranted', async () => {
  const camBrowser = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] })
  const { page, context, log } = await openApp(camBrowser, { theme: 'dark' })
  await context.grantPermissions(['camera'], { origin: BASE })
  await page.route(/\/api\/user-profiles\/demo$/, (r) => json(r, { cloudhandle: 'demo', firstName: 'Demo', lastName: 'User', username: 'demo', isPublic: true, socialLinks: [], experiences: [] }))
  await page.goto(BASE + '/settings', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Scan QR Code' }).waitFor({ timeout: 30000 })
  await page.getByRole('button', { name: 'Scan QR Code' }).click()
  const video = page.locator('video')
  await video.waitFor({ timeout: 10000 })
  // The feed is live and the scan frame overlay is up — the detection loop started.
  await page.waitForFunction(() => {
    const v = document.querySelector('video')
    return !!v && v.readyState >= 2 && v.videoWidth > 0
  }, { timeout: 10000 })
  res['qrScanGranted.videoPlaying'] = await video.evaluate((v) => ({ w: v.videoWidth, h: v.videoHeight, paused: v.paused }))
  await page.waitForTimeout(500)
  res['qrScanGranted.scanFrameShown'] = (await page.locator('.border-white\\/80').count()) > 0
  res['qrScanGranted.trackLiveWhileOpen'] = await page.evaluate(() => {
    const v = document.querySelector('video')
    const stream = v?.srcObject
    return stream instanceof MediaStream ? stream.getVideoTracks()[0]?.readyState : null
  })
  // Let several real detection passes run (SCAN_INTERVAL_MS=150) with no crash.
  await page.waitForTimeout(3000)
  res['qrScanGranted.noPageErrorsDuringScan'] = log.errors.filter((e) => e.startsWith('PAGEERROR')).length === 0
  await page.screenshot({ path: `${OUT}/qr-scan-live-dark.png` })
  // Closing mid-scan must actually release the camera (the real risk in this
  // feature: a leaked track keeps the camera light on after the dialog is gone).
  // Grab the live track's own reference before closing, so the check is the
  // track's real readyState — not just "the <video> left the DOM".
  await page.evaluate(() => {
    const v = document.querySelector('video')
    const stream = v?.srcObject
    window.__trackBeforeClose = stream instanceof MediaStream ? stream.getVideoTracks()[0] : null
  })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
  res['qrScanGranted.trackStoppedOnClose'] = await page.evaluate(() => window.__trackBeforeClose?.readyState ?? 'no-track-captured')
  res['qrScanGranted.dialogClosed'] = (await page.getByRole('dialog', { name: /Scan a connect code/ }).count()) === 0
  await context.close()
  await camBrowser.close()
})

await browser.close()
console.log(JSON.stringify(res, null, 1))
