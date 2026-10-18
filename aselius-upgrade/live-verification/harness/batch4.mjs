// Batch 4: deliverable tiles (one icon per format), Rivine Creative chips,
// Credits minimums, native App Connector cards and their popup flow,
// Automations, and Assets + preview panel at desktop and phone width.
// Mocked backend.
import { chromium, openApp, BASE } from './app.mjs'

const OUT = process.argv[2]
const CORS = { 'Access-Control-Allow-Origin': BASE, 'Access-Control-Allow-Credentials': 'true' }
const json = (route, body, status = 200) => route.fulfill({ status, headers: CORS, contentType: 'application/json', body: JSON.stringify(body) })
const iso = (m) => new Date(Date.UTC(2026, 9, 16, 9, m)).toISOString()

const KINDS = [
  ['d-md', 'launch-brief.md', 'markdown'], ['d-pdf', 'board-report.pdf', 'pdf'], ['d-xlsx', 'cap-table.xlsx', 'xlsx'],
  ['d-pptx', 'board-deck.pptx', 'pptx'], ['d-html', 'launch-site.html', 'html'], ['d-png', 'hero-still.png', 'png'],
  ['d-mp4', 'walkthrough.mp4', 'video'], ['d-mp3', 'voiceover.mp3', 'audio'], ['d-mmd', 'release-flow.mmd', 'mermaid'],
  ['d-film', 'launch-film.html', 'motion_graphics'], ['d-proj', 'launch-app.project.json', 'code_project'], ['d-csv', 'leads.csv', 'csv'],
]
const DELIVERABLE_MSGS = [
  { id: 'u1', role: 'user', content: 'Build the full launch kit.', created_at: iso(1) },
  {
    id: 'a1', role: 'assistant', content: 'Here is the launch kit: documents, data, media and the app.', created_at: iso(5),
    metadata: { target_engine: 'rivine_chat' },
    fragment: { deliverables: KINDS.map(([asset_id, filename, fragment_type]) => ({ asset_id, filename, fragment_type })) },
  },
]
const ASSETS = KINDS.map(([id, name, kind], i) => ({
  id, name, type: kind === 'code_project' ? 'code_project' : 'document', creator: 'ai', created_at: iso(6 + i), size: 2048 * (i + 1),
  format: name.split('.').pop(), chatSpaceId: 'cs-launch-research', language: name.split('.').pop(),
  content: kind === 'markdown' ? '# Launch brief\n\nPositioning, audience and the launch plan.\n\n| Owner | Task |\n| --- | --- |\n| Product | Sign-off |' : '',
}))

async function workspaceRoutes(page) {
  await page.route(/\/chats\/cs-launch-research\/messages/, (r) => json(r, { messages: DELIVERABLE_MSGS, total_count: 2, chat_space_id: 'cs-launch-research', workspace_id: 'ws-launch' }))
  await page.route(/\/chats\/cs-launch-research\/assets\/?(\?.*)?$/, (r) => json(r, ASSETS))
}

const res = {}
const browser = await chromium.launch()
async function guard(name, fn) {
  try { await fn() } catch (e) { res[`${name}.FAILED`] = String(e.message || e).split('\n')[0].slice(0, 200) }
}

// 1. Deliverable tiles
await guard('tiles', async () => {
for (const [theme, width, height] of [['dark', 1440, 900], ['light', 1440, 900], ['dark', 390, 844]]) {
  const { page, context, log } = await openApp(browser, { theme, width, height })
  await workspaceRoutes(page)
  await page.goto(BASE + '/workspace/ws-launch/cs-launch-research', { waitUntil: 'domcontentloaded' })
  const tile = page.getByRole('button', { name: /^Open board report, PDF$/ })
  await tile.waitFor({ timeout: 30000 })
  await tile.scrollIntoViewIfNeeded()
  await page.waitForTimeout(600)
  const tag = `${theme}-${width}`
  const tiles = page.locator('button[aria-label^="Open "][aria-label*=", "]')
  res[`${tag}.tiles`] = await tiles.count()
  const meta = await tiles.evaluateAll((els) => els.map((b) => ({
    label: b.getAttribute('aria-label'),
    icon: b.querySelector('svg')?.innerHTML,
    width: Math.round(b.getBoundingClientRect().width),
  })))
  res[`${tag}.uniqueIcons`] = new Set(meta.map((m) => m.icon)).size
  res[`${tag}.tileWidths`] = [...new Set(meta.map((m) => m.width))]
  if (width === 1440 && theme === 'dark') res.tileLabels = meta.map((m) => m.label)
  res[`${tag}.noHorizontalScroll`] = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
  await page.locator('section, div').filter({ has: tile }).last().screenshot({ path: `${OUT}/deliverable-tiles-${tag}.png` }).catch(() => page.screenshot({ path: `${OUT}/deliverable-tiles-${tag}.png` }))
  await page.screenshot({ path: `${OUT}/thread-${tag}.png` })
  if (log.errors.some((e) => e.startsWith('PAGEERROR'))) res[`${tag}.pageErrors`] = log.errors.filter((e) => e.startsWith('PAGEERROR'))
  await context.close()
}
})

// 2. Rivine Creative and its chips in the composer
await guard('creative', async () => {
{
  const { page, context, log } = await openApp(browser, { theme: 'dark' })
  await page.goto(BASE + '/workspace/ws-launch/cs-launch-research', { waitUntil: 'domcontentloaded' })
  await page.locator('textarea').first().waitFor({ timeout: 30000 })
  await page.getByRole('button', { name: /TaskForce/ }).last().click()
  await page.getByText('Rivine Creative', { exact: true }).first().click()
  await page.waitForTimeout(500)
  res.creativeSelected = await page.getByRole('button', { name: /Creative/ }).count() > 0
  const specialty = page.getByRole('button', { name: /Specialty|Generate Image|Mode/ }).first()
  await specialty.click()
  await page.waitForTimeout(400)
  res.creativeChips = await page.getByRole('button').filter({ hasText: /Generate Image|Surgical Edit Image|Animate|Generate Video|Surgical Edit Video|Generate Audio|Generate Music/ }).allInnerTexts()
  await page.screenshot({ path: `${OUT}/creative-chips-dark.png` })
  await page.getByRole('button').filter({ hasText: /^Generate Video/ }).first().click()
  await page.waitForTimeout(400)
  res.chipChosen = await page.getByText(/Generate Video/).count() > 0
  await page.screenshot({ path: `${OUT}/creative-chip-chosen-dark.png` })
  if (log.errors.some((e) => e.startsWith('PAGEERROR'))) res.creativePageErrors = log.errors.filter((e) => e.startsWith('PAGEERROR'))
  await context.close()
}
})

// 3. Credits
await guard('credits', async () => {
for (const theme of ['dark', 'light']) {
  const { page, context } = await openApp(browser, { theme })
  await page.route(/\/api\/payment\/credits$/, (r) => json(r, { balance: 24.5, shareableBalance: 20, plan: 'essential', monthlyAllocation: 15, autoReload: { enabled: false, minBalance: 10, reloadPackageId: 'starter' }, alerts: [], transactions: [], shareLimits: { min: 1, max: 500 } }))
  await page.route(/\/usage\/activity/, (r) => json(r, { items: [], total: 0 }))
  await page.goto(BASE + '/credits', { waitUntil: 'domcontentloaded' })
  await page.getByText('Engine minimum balance').waitFor({ timeout: 30000 })
  await page.waitForTimeout(800)
  const section = page.locator('section').filter({ hasText: 'Engine minimum balance' })
  res[`${theme}.creditMinimums`] = (await section.innerText()).split('\n').filter((l) => /Rivine|min/.test(l))
  await section.scrollIntoViewIfNeeded()
  await page.screenshot({ path: `${OUT}/credits-${theme}.png`, fullPage: false })
  await section.screenshot({ path: `${OUT}/credits-minimums-${theme}.png` })
  await context.close()
}
})

// 4. App Connector: native cards and the popup flow
await guard('connector', async () => {
{
  const { page, context, log } = await openApp(browser, { theme: 'dark' })
  const native = [
    ['outlook_mail_calendar', 'Outlook', 'Productivity'], ['supabase', 'Supabase', 'Database'], ['mongodb', 'MongoDB', 'Database'],
    ['stripe', 'Stripe', 'Financial'], ['github', 'GitHub', 'Development'],
  ].map(([server_id, name, category]) => ({ server_id, name, category, access: 'Native', description: 'Native', icon: '', icon_url: '', kind: 'legacy', provider: 'native', sync_status: 'ready', enabled_for_workspace: false, is_connected: false, default_permission: 'needs_approval', tool_count: 0, documented_tools: [], runtime_available: true }))
  const composio = [{ server_id: 'gmail', name: 'Gmail', category: 'communication', access: '', description: 'Every tool this app offers', icon: '', icon_url: '', kind: 'mcp', provider: 'composio', sync_status: 'ready', enabled_for_workspace: true, is_connected: false, default_permission: 'needs_approval', tool_count: 0, documented_tools: [], runtime_available: true, auth_type: 'oauth', endpoint: 'composio' }]
  await page.route(/\/taskforce-connectors\/?(\?.*)?$/, (r) => json(r, [...native, ...composio]))
  let popupUrl = null
  await context.route(/\/api\/aselius\/connectors\/github\/login/, (r) => {
    popupUrl = r.request().url()
    return r.fulfill({ status: 200, contentType: 'text/html', body: '<html><body><script>window.opener.postMessage("github_auth_success","*");window.close();</script></body></html>' })
  })
  await page.goto(BASE + '/workspace/ws-launch/cs-launch-research/connector', { waitUntil: 'domcontentloaded' }).catch(() => {})
  await page.waitForTimeout(1500)
  if (!(await page.getByText('Supabase').count())) {
    await page.goto(BASE + '/workspace/connector', { waitUntil: 'domcontentloaded' }).catch(() => {})
    await page.waitForTimeout(2500)
  }
  res.connectorUrl = page.url().replace(BASE, '')
  res.nativeCardsShown = (await Promise.all(['Outlook', 'Supabase', 'MongoDB', 'Stripe', 'GitHub'].map((n) => page.getByText(n, { exact: true }).count()))).map((c, i) => `${['Outlook', 'Supabase', 'MongoDB', 'Stripe', 'GitHub'][i]}:${c > 0}`)
  res.firebaseOrGoogleShown = (await page.getByText(/^(Firebase|Google)$/).count()) > 0
  await page.screenshot({ path: `${OUT}/connectors-dark.png` })
  const githubCard = page.locator('div').filter({ has: page.getByText('GitHub', { exact: true }) }).filter({ has: page.getByRole('button', { name: /Connect/ }) }).last()
  if (await githubCard.count()) {
    await githubCard.getByRole('button', { name: /Connect/ }).first().click()
    await page.waitForTimeout(2500)
    res.githubPopupUrl = popupUrl ? new URL(popupUrl).pathname + (new URL(popupUrl).search ? '?token=…' : '') : null
    res.githubToast = await page.getByText('GitHub connected').count() > 0
  }
  if (log.errors.some((e) => e.startsWith('PAGEERROR'))) res.connectorPageErrors = log.errors.filter((e) => e.startsWith('PAGEERROR'))
  await context.close()
}
})

// 5. Automations
await guard('automations', async () => {
for (const theme of ['dark', 'light']) {
  const { page, context, log } = await openApp(browser, { theme })
  await page.route(/\/automations\/contracts/, (r) => json(r, { engines: [
    { engine: 'rivine_research', label: 'Rivine Research', schedulable: true, default_budget_usd: 2 },
    { engine: 'rivine_chat', label: 'Rivine TaskForce', schedulable: true, default_budget_usd: 1 },
    { engine: 'rivine_cicero', label: 'Rivine Cicero', schedulable: true, default_budget_usd: 2 },
    { engine: 'rivine_confluence', label: 'Rivine Confluence', schedulable: true, default_budget_usd: 2 },
  ] }))
  await page.route(/\/automations\/templates/, (r) => json(r, { templates: [
    { id: 't1', title: 'Daily market brief', category: 'Research', runs_on: 'cloud', engine: 'rivine_research', summary: 'A sourced brief every morning.', goal: 'Brief me on {topic}.', schedule: { every: 'day', at: '08:00' } },
  ] }))
  await page.route(/\/api\/aselius\/automations(\?.*)?$/, (r) => r.request().method() === 'GET' ? json(r, { automations: [
    { id: 'a1', name: 'Packaging news', engine: 'rivine_research', engine_label: 'Rivine Research', goal: 'Brief me on flexible packaging news.', schedule: { every: 'day', at: '08:00' }, schedule_label: 'Every day at 08:00', timezone: 'UTC', status: 'active', budget_usd: 2, notify: 'always', next_run_at: iso(600), last_run_at: iso(0), consecutive_failures: 0, workspace_id: 'ws-launch', source: 'web', tested: true, last_status: 'succeeded', paused_reason: null, runs: [] },
  ] }) : r.fallback())
  await page.goto(BASE + '/automations', { waitUntil: 'domcontentloaded' })
  await page.getByText('Packaging news').waitFor({ timeout: 30000 })
  await page.waitForTimeout(600)
  res[`${theme}.automationListed`] = true
  await page.screenshot({ path: `${OUT}/automations-${theme}.png` })
  if (log.errors.some((e) => e.startsWith('PAGEERROR'))) res[`${theme}.automationPageErrors`] = log.errors.filter((e) => e.startsWith('PAGEERROR'))
  await context.close()
}
})

// 6. Assets list and preview panel, desktop and phone
await guard('assets', async () => {
for (const [width, height] of [[1440, 900], [390, 844]]) {
  const { page, context, log } = await openApp(browser, { theme: 'dark', width, height })
  await workspaceRoutes(page)
  await page.goto(BASE + '/workspace/ws-launch/cs-launch-research', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /^Open launch brief, Document$/ }).waitFor({ timeout: 30000 })
  await page.getByRole('button', { name: /^Open launch brief, Document$/ }).click()
  await page.waitForTimeout(2500)
  res[`${width}.previewOpen`] = await page.getByText('Launch brief').count() > 0
  res[`${width}.previewNoHorizontalScroll`] = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
  await page.screenshot({ path: `${OUT}/preview-${width}.png` })
  const assetsTab = page.locator('button[aria-pressed][aria-label="Assets"]').first()
  if (await assetsTab.count()) {
    await assetsTab.click()
    await page.waitForTimeout(1500)
    res[`${width}.assetsListed`] = await page.getByText('cap-table.xlsx').count() > 0
    await page.screenshot({ path: `${OUT}/assets-${width}.png` })
  } else {
    res[`${width}.assetsTab`] = 'not found'
  }
  if (log.errors.some((e) => e.startsWith('PAGEERROR'))) res[`${width}.previewPageErrors`] = log.errors.filter((e) => e.startsWith('PAGEERROR'))
  await context.close()
}
})

await browser.close()
console.log(JSON.stringify(res, null, 1))
