// HITL inline card: an app-action approval and a clarification question,
// restored from a paused turn on load, in both themes. Mocked backend.
import { chromium, openApp, BASE } from './app.mjs'

const OUT = process.argv[2]
const CORS = { 'Access-Control-Allow-Origin': BASE, 'Access-Control-Allow-Credentials': 'true' }

const PAUSED = {
  mcp: {
    status: 'paused', thread_id: 'ws-launch_cs-launch-research', hitl_type: 'mcp_tool',
    hitl_prompt: 'TaskForce wants to create a Linear issue for the launch checklist.',
    hitl_tool: 'linear__create_issue', hitl_connector: 'Linear',
    hitl_args: { title: 'Launch checklist', team: 'Growth', priority: 'High' },
    hitl_ui_schema: {
      'x-hitl-severity': 'caution', 'x-hitl-connector-label': 'Linear', 'x-hitl-tool': 'create_issue',
      required: ['title'],
      properties: {
        title: { type: 'string', title: 'Title' },
        priority: { type: 'string', title: 'Priority', enum: ['Low', 'Medium', 'High'] },
        description: { type: 'string', title: 'Description', format: 'textarea' },
      },
    },
  },
  question: {
    status: 'paused', thread_id: 'ws-launch_cs-launch-research', hitl_type: 'research_clarification',
    hitl_prompt: 'Which markets should the launch research cover first?',
    hitl_args: {},
    hitl_ui_schema: { properties: { answer: { type: 'string', title: 'Your answer', format: 'textarea' } } },
  },
}

const res = {}
const browser = await chromium.launch()
for (const [name, status] of Object.entries(PAUSED)) {
  for (const theme of ['dark', 'light']) {
    const { page, context, log } = await openApp(browser, { theme })
    const decisions = []
    // The reattach poll only runs when the thread ends on the user's message.
    await page.route(/\/chats\/cs-launch-research\/messages/, (route) => route.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify({
      messages: [{ id: 'u1', role: 'user', content: 'Plan the launch', created_at: '2026-10-16T10:00:00Z' }],
      total_count: 1, chat_space_id: 'cs-launch-research', workspace_id: 'ws-launch',
    }) }))
    await page.route(/\/turn-status/, (route) => route.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify(status) }))
    await page.route(/\/hitl|\/resume|\/approval/, (route) => {
      if (route.request().method() === 'POST') decisions.push(route.request().url().replace(/^.*\/api\//, ''))
      return route.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: '{"ok":true}' })
    })
    await page.goto(BASE + '/workspace/ws-launch/cs-launch-research', { waitUntil: 'domcontentloaded' })
    const card = page.locator('section[aria-labelledby]').filter({ hasText: name === 'mcp' ? 'Confirm app action' : 'Quick question' })
    await card.waitFor({ timeout: 30000 })
    await card.scrollIntoViewIfNeeded()
    await page.waitForTimeout(600)
    res[`${name}.${theme}.background`] = await card.evaluate((el) => getComputedStyle(el).backgroundImage === 'none' ? getComputedStyle(el).backgroundColor : 'GRADIENT')
    res[`${name}.${theme}.buttons`] = await card.getByRole('button').evaluateAll((bs) => bs.map((b) => b.innerText.trim()).filter(Boolean))
    await card.screenshot({ path: `${OUT}/hitl-${name}-${theme}.png` })
    if (name === 'question' && theme === 'dark') {
      const send = card.getByRole('button', { name: 'Send answer' })
      res.sendDisabledUntilAnswered = await send.isDisabled()
      await card.locator('textarea').first().fill('North America, then the UK.')
      res.sendEnabledAfterAnswer = await send.isEnabled()
    }
    if (log.errors.some((e) => e.startsWith('PAGEERROR'))) res[`${name}.${theme}.pageErrors`] = log.errors.filter((e) => e.startsWith('PAGEERROR'))
    await context.close()
  }
}
await browser.close()
console.log(JSON.stringify(res, null, 1))
