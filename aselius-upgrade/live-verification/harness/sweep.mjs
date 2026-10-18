// Page-error sweep: every main route, both themes. Mocked backend.
import { chromium, openApp, BASE } from './app.mjs'
const ROUTES = ['/workspace/ws-launch/cs-launch-research', '/workspace/ws-launch/cs-launch-research/governance', '/workspace/shared-with-me', '/teams', '/settings', '/credits', '/observability', '/automations', '/selius']
const browser = await chromium.launch()
const res = {}
for (const theme of ['light', 'dark']) {
  for (const route of ROUTES) {
    const { page, context, log } = await openApp(browser, { theme })
    await page.goto(BASE + route, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3500)
    const pageErrors = log.errors.filter((e) => e.startsWith('PAGEERROR'))
    res[`${theme} ${route}`] = pageErrors.length ? pageErrors : 'ok'
    await context.close()
  }
}
await browser.close()
console.log(JSON.stringify(res, null, 1))
