import { chromium, openApp, BASE } from './app.mjs'
const path = process.argv[2] || '/workspace/ws-launch/cs-launch-research'
const theme = process.argv[3] || 'light'
const out = process.argv[4] || '/private/tmp/claude-501/-Users-akinnawo-beunecfullstack/3fece7f5-4969-49c6-95b3-3b76f13588d9/scratchpad/smoke.png'
const browser = await chromium.launch()
const { page, log } = await openApp(browser, { theme })
await page.goto(BASE + path, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(7000)
console.log('url', page.url())
console.log('--- unhandled ---'); for (const s of [...new Set(log.unhandled)]) console.log(s)
console.log('--- errors ---'); for (const s of [...new Set(log.errors)].slice(0, 25)) console.log(s)
await page.screenshot({ path: out })
await browser.close()
