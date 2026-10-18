// Onboarding (the real OnboardingClient, bundled from onboarding-entry.tsx)
// with the app's built CSS, in both themes and at phone width. The server only
// shows this page to a new user, so it is mounted directly.
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from './app.mjs'
const [BUNDLE, CSS_DIR, OUT] = process.argv.slice(2)
const js = fs.readFileSync(BUNDLE, 'utf8')
const css = fs.readdirSync(CSS_DIR).filter((f) => f.endsWith('.css'))
const res = {}
const browser = await chromium.launch()
const contrast = (page) => page.evaluate(() => {
  const lum = (c) => { const m = c.match(/[\d.]+/g); if (!m) return null; const [r, g, b] = m.slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
  const bgOf = (el) => { for (let e = el; e; e = e.parentElement) { const s = getComputedStyle(e); if (s.backgroundImage !== 'none') return null; const m = s.backgroundColor.match(/[\d.]+/g); if (m && (m.length < 4 || +m[3] > 0.5)) return s.backgroundColor } return null }
  const bad = []
  for (const el of document.querySelectorAll('h1,h2,h3,p,label,span,button,a,input')) {
    if (!el.offsetParent || !(el.innerText || el.value || el.placeholder || '').trim()) continue
    const bg = bgOf(el); if (!bg) continue
    const a = lum(getComputedStyle(el).color), b = lum(bg)
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
    if (ratio < 3) bad.push(`${(el.innerText || el.value || el.placeholder).trim().slice(0, 30)} (${ratio.toFixed(1)})`)
  }
  return bad
})
for (const [theme, width, height] of [['dark', 1440, 900], ['light', 1440, 900], ['dark', 390, 844]]) {
  const page = await browser.newPage({ viewport: { width, height } })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)))
  await page.route('http://onb.test/**', (route) => {
    const p = new URL(route.request().url()).pathname
    if (p === '/bundle.js') return route.fulfill({ contentType: 'text/javascript', body: js })
    if (p.endsWith('.css')) return route.fulfill({ contentType: 'text/css', body: fs.readFileSync(path.join(CSS_DIR, path.basename(p))) })
    return route.fulfill({ contentType: 'text/html', body: `<!doctype html><html class="${theme === 'dark' ? 'dark' : ''}"><head>${css.map((f) => `<link rel="stylesheet" href="/${f}">`).join('')}</head><body><div id="root"></div><script type="module" src="/bundle.js"></script></body></html>` })
  })
  await page.route(/backend\.test/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"available":true}' }))
  await page.goto('http://onb.test/')
  await page.getByText("Let's get started").waitFor({ timeout: 15000 })
  await page.waitForTimeout(500)
  const tag = `${theme}-${width}`
  res[`${tag}.welcomeLowContrast`] = await contrast(page)
  res[`${tag}.noHorizontalScroll`] = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
  await page.screenshot({ path: `${OUT}/onboarding-welcome-${tag}.png` })
  await page.getByRole('button').filter({ hasText: /get started|begin|continue|start/i }).first().click()
  await page.locator('input').first().waitFor({ timeout: 10000 })
  await page.waitForTimeout(500)
  await page.locator('input').first().fill('Demo')
  res[`${tag}.formLowContrast`] = await contrast(page)
  await page.screenshot({ path: `${OUT}/onboarding-form-${tag}.png` })
  if (errors.length) res[`${tag}.errors`] = errors
  await page.close()
}
await browser.close()
console.log(JSON.stringify(res, null, 1))
