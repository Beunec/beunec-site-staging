// QR connect invites: the Settings QR encodes the invite link, and the link's
// one-tap card sends (or accepts) a connection request. Mocked backend.
import { createRequire } from 'node:module'
import { chromium, openApp, BASE } from './app.mjs'

const require = createRequire(import.meta.url)
const qrcode = require('../../../node_modules/qrcode-generator/dist/qrcode.js')
const OUT = process.argv[2]
const CORS = { 'Access-Control-Allow-Origin': BASE, 'Access-Control-Allow-Credentials': 'true' }
const json = (route, body, status = 200) => route.fulfill({ status, headers: CORS, contentType: 'application/json', body: JSON.stringify(body) })

const PROFILES = {
  demo: { cloudhandle: 'demo', firstName: 'Demo', lastName: 'User', isPublic: true },
  alice: { cloudhandle: 'alice', firstName: 'Alice', lastName: 'Okafor', tagline: 'Product design at Acme', isPublic: true },
  bob: { cloudhandle: 'bob', firstName: 'Bob', lastName: 'Lee', isPublic: true },
  carol: { cloudhandle: 'carol', firstName: 'Carol', lastName: 'Diaz', isPublic: true },
}

/** Networks API with the state the cards must read: Bob already asked us, Carol is connected. */
async function mockNetworks(page, calls) {
  // Settings reads the signed-in profile from the user-profiles API.
  await page.route(/\/api\/user-profiles\/demo$/, (route) => json(route, { ...PROFILES.demo, username: 'demo', socialLinks: [], experiences: [] }))
  await page.route(/\/networks\//, async (route) => {
    const req = route.request()
    const url = new URL(req.url())
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { ...CORS, 'Access-Control-Allow-Headers': 'authorization,content-type', 'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE' } })
    let m
    if ((m = url.pathname.match(/\/users\/profile\/([^/]+)$/))) {
      const p = PROFILES[decodeURIComponent(m[1])]
      return p ? json(route, p) : json(route, { message: 'User not found' }, 404)
    }
    if (url.pathname.endsWith('/connections/requests') && req.method() === 'GET') {
      return json(route, [{ id: 'bob#demo', cloudhandle: 'bob', type: 'received', status: 'pending', name: 'Bob Lee' }])
    }
    if (url.pathname.endsWith('/connections/requests') && req.method() === 'POST') {
      calls.push(['POST', JSON.parse(req.postData())])
      return json(route, { id: 'demo#alice', cloudhandle: 'alice', type: 'sent', status: 'pending' }, 201)
    }
    if ((m = url.pathname.match(/\/connections\/requests\/([^/]+)$/)) && req.method() === 'PATCH') {
      calls.push(['PATCH', decodeURIComponent(m[1]), JSON.parse(req.postData())])
      return json(route, { ok: true })
    }
    if (url.pathname.endsWith('/connections')) return json(route, [{ cloudhandle: 'carol', name: 'Carol Diaz' }])
    if (url.pathname.endsWith('/connections/summary')) return json(route, { connections: 1, pending: 1 })
    return json(route, [])
  })
}

const res = {}
const browser = await chromium.launch()

for (const theme of ['dark', 'light']) {
  const { page, context, log } = await openApp(browser, { theme })
  const calls = []
  await mockNetworks(page, calls)
  await page.goto(BASE + '/settings', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Show QR Code' }).waitFor({ timeout: 30000 })
  res[`${theme}.addToWalletGone`] = (await page.getByText('Add to Wallet').count()) === 0
  await page.getByRole('button', { name: 'Show QR Code' }).click()
  const svg = page.getByRole('img', { name: /QR code for/ })
  await svg.waitFor({ timeout: 10000 })
  // Re-encode the expected link with the same library and compare module-for-module.
  const expected = qrcode(0, 'M'); expected.addData(`${BASE}/teams?connect=demo`); expected.make()
  const n = expected.getModuleCount()
  let d = ''
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (expected.isDark(r, c)) d += `M${c + 4} ${r + 4}h1v1h-1z`
  res[`${theme}.qrEncodesInviteLink`] = (await svg.locator('path').getAttribute('d')) === d
  res[`${theme}.dialogFocused`] = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))
  await page.waitForTimeout(500) // let the entry animation finish
  await page.screenshot({ path: `${OUT}/qr-settings-${theme}.png` })
  await page.keyboard.press('Escape')
  res[`${theme}.escapeCloses`] = (await page.getByRole('dialog').count()) === 0
  if (log.errors.length) res[`${theme}.settingsErrors`] = log.errors.slice(0, 5)
  await context.close()
}

{
  const { page, context, log } = await openApp(browser, { theme: 'dark' })
  const calls = []
  await mockNetworks(page, calls)

  // A new person: one tap sends the request, and the card leaves the URL.
  await page.goto(BASE + '/teams?connect=alice', { waitUntil: 'domcontentloaded' })
  const dialog = page.getByRole('dialog', { name: 'Alice Okafor' })
  await dialog.getByRole('button', { name: 'Connect' }).waitFor({ timeout: 30000 })
  await page.waitForTimeout(500) // let the entry animation finish
  await page.screenshot({ path: `${OUT}/qr-connect-card-dark.png` })
  await dialog.getByRole('button', { name: 'Connect' }).click()
  await page.waitForURL((u) => !u.search.includes('connect='), { timeout: 10000 })
  res.connectSent = JSON.stringify(calls.find((c) => c[0] === 'POST')?.[1])

  // They already asked us: the one tap accepts their request.
  await page.goto(BASE + '/teams?connect=bob', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Accept request' }).waitFor({ timeout: 30000 })
  await page.getByRole('button', { name: 'Accept request' }).click()
  await page.waitForURL((u) => !u.search.includes('connect='), { timeout: 10000 })
  res.acceptSent = JSON.stringify(calls.find((c) => c[0] === 'PATCH')?.slice(1))

  // Already connected, and our own code: no button, just the state.
  await page.goto(BASE + '/teams?connect=carol', { waitUntil: 'domcontentloaded' })
  await page.getByText("You're already connected").waitFor({ timeout: 30000 })
  res.connectedState = (await page.getByRole('dialog').getByRole('button', { name: /Connect|Accept/ }).count()) === 0
  await page.goto(BASE + '/teams?connect=demo', { waitUntil: 'domcontentloaded' })
  await page.getByText('This is your own connect code.').waitFor({ timeout: 30000 })
  res.selfState = true

  // A malformed handle never reaches the API.
  const before = calls.length
  await page.goto(BASE + '/teams?connect=%3Cscript%3E', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  res.badHandleIgnored = (await page.getByRole('dialog').count()) === 0 && calls.length === before
  if (log.errors.length) res.teamsErrors = log.errors.slice(0, 5)
  await context.close()
}

{
  // Light-mode card, phone width.
  const { page, context } = await openApp(browser, { theme: 'light', width: 390, height: 844 })
  await mockNetworks(page, [])
  await page.goto(BASE + '/teams?connect=alice', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Connect' }).waitFor({ timeout: 30000 })
  res.mobileNoHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
  await page.waitForTimeout(500) // let the entry animation finish
  await page.screenshot({ path: `${OUT}/qr-connect-card-light-mobile.png` })
  await context.close()
}

{
  // Signed out: the invite survives the login redirect.
  const r = await fetch(BASE + '/teams?connect=alice', { redirect: 'manual' })
  const loc = new URL(r.headers.get('location'), BASE)
  res.loginRedirect = r.status
  res.returnTo = loc.searchParams.get('returnTo')
  res.loginUrlHasNoStrayParams = [...loc.searchParams.keys()].join(',') === 'returnTo'
}

await browser.close()
console.log(JSON.stringify(res, null, 1))
