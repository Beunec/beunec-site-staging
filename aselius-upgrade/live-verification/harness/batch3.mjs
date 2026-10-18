// Batch 3 pages: Shared with Me cards, Governance, Settings (white primary in
// dark). Mocked backend, both themes.
import { chromium, openApp, BASE } from './app.mjs'

const OUT = process.argv[2]
const CORS = { 'Access-Control-Allow-Origin': BASE, 'Access-Control-Allow-Credentials': 'true' }
const json = (route, body) => route.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify(body) })
const iso = (d) => new Date(Date.UTC(2026, 9, 16) + d * 86400000).toISOString()

const SHARED = [
  { id: 'ws-launch', name: 'Product launch', description: null, owner_cloudhandle: 'demo', created_at: iso(-30), updated_at: iso(0), user_role: 'owner' },
  { id: 'ws-acme', name: 'Acme partnership', description: null, owner_cloudhandle: 'alice', created_at: iso(-12), updated_at: iso(-1), user_role: 'operator' },
  { id: 'ws-q4', name: 'Q4 planning', description: null, owner_cloudhandle: 'bob', created_at: iso(-5), updated_at: null, user_role: 'member' },
  { id: 'ws-brand', name: 'Brand refresh with a rather long workspace name', description: null, owner_cloudhandle: 'carol', created_at: iso(-3), updated_at: iso(-2), user_role: 'guest' },
]
const INVITES = [{ id: 'ws-invite', name: 'Investor update', owner_email: 'dana', permission: 'member', shared_at: iso(-1) }]

const res = {}
const browser = await chromium.launch()
for (const theme of ['dark', 'light']) {
  // Shared with Me
  {
    const { page, context, log } = await openApp(browser, { theme })
    await page.route(/\/api\/aselius\/workspaces\/?(\?.*)?$/, (r) => r.request().method() === 'GET' ? json(r, SHARED) : r.fallback())
    await page.route(/\/workspaces\/invitations/, (r) => json(r, INVITES))
    await page.goto(BASE + '/workspace/shared-with-me', { waitUntil: 'domcontentloaded' })
    await page.getByRole('article', { name: 'Acme partnership' }).waitFor({ timeout: 30000 })
    await page.waitForTimeout(500)
    res[`${theme}.shared.cards`] = await page.getByRole('article').count()
    res[`${theme}.shared.pendingActions`] = await page.getByRole('article', { name: 'Investor update' }).getByRole('button').allInnerTexts()
    res[`${theme}.shared.openButtonBg`] = await page.getByRole('article', { name: 'Acme partnership' }).getByRole('button').evaluate((b) => getComputedStyle(b).backgroundColor)
    await page.screenshot({ path: `${OUT}/shared-with-me-${theme}.png` })
    if (log.errors.some((e) => e.startsWith('PAGEERROR'))) res[`${theme}.shared.pageErrors`] = log.errors
    await context.close()
  }
  // Governance
  {
    const { page, context, log } = await openApp(browser, { theme })
    await page.route(/\/governance\/workspaces\/[^/]+\/configuration/, (r) => json(r, {
      id: 'gov-1', workspace_id: 'ws-launch',
      system_instructions: { primary_role: 'A launch strategist for B2B SaaS.', specified_industry: 'Developer tools', behavioral_guidelines: '', response_format: 'Bullets first, then detail.' },
      content_restrictions: { prohibited_topics: 'Unannounced pricing', content_filters: '' },
    }))
    const toasts = []
    page.on('console', () => {})
    await page.goto(BASE + '/workspace/ws-launch/cs-launch-research/governance', { waitUntil: 'domcontentloaded' })
    await page.getByLabel('Primary Role Definition').waitFor({ timeout: 30000 })
    await page.waitForTimeout(800)
    res[`${theme}.gov.labelledFields`] = await page.locator('textarea[id^="gov-"]').count()
    res[`${theme}.gov.subtitle`] = (await page.getByText(/How every engine behaves in/).innerText()).trim()
    res[`${theme}.gov.loadToast`] = await page.getByText('Governance configuration loaded').count()
    res[`${theme}.gov.saveBg`] = await page.getByRole('button', { name: /Save Configuration/ }).evaluate((b) => getComputedStyle(b).backgroundColor)
    await page.screenshot({ path: `${OUT}/governance-${theme}.png` })
    if (log.errors.some((e) => e.startsWith('PAGEERROR'))) res[`${theme}.gov.pageErrors`] = log.errors
    void toasts
    await context.close()
  }
  // Settings
  {
    const { page, context, log } = await openApp(browser, { theme })
    await page.route(/\/api\/user-profiles\/demo$/, (r) => json(r, { cloudhandle: 'demo', firstName: 'Demo', lastName: 'User', username: 'demo', isPublic: true, socialLinks: [], experiences: [] }))
    await page.goto(BASE + '/settings', { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: 'Show QR Code' }).waitFor({ timeout: 30000 })
    await page.waitForTimeout(600)
    res[`${theme}.settings.activeTabBg`] = await page.locator('nav button').first().evaluate((b) => getComputedStyle(b).backgroundColor)
    await page.screenshot({ path: `${OUT}/settings-${theme}.png` })
    if (log.errors.some((e) => e.startsWith('PAGEERROR'))) res[`${theme}.settings.pageErrors`] = log.errors
    await context.close()
  }
}
await browser.close()
console.log(JSON.stringify(res, null, 1))
