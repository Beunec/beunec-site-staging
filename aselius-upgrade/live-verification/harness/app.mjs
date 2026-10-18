// Harness driver: the REAL Aselius frontend (next start) + local session +
// fixture backend. Labelled "mocked backend" in every report.
import https from 'node:https'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { mintSessionCookie } from './session.mjs'
import { rest, node, streamEvents, sseChunks } from './fixtures.mjs'

const require = createRequire('/Users/akinnawo/beunecfullstack/deploy-aws-lambda-cloudflare/rivine-browse/package.json')
export const { chromium } = require('playwright')
export const BASE = process.env.HARNESS_BASE || 'http://localhost:3100'
const STREAM_PORT = 3199

let streamServer = null
let streamDelay = 220
export function setStreamDelay(ms) { streamDelay = ms }
export async function startStreamServer() {
  if (streamServer) return
  const dir = path.dirname(new URL(import.meta.url).pathname)
  streamServer = https.createServer({ key: fs.readFileSync(path.join(dir, 'key.pem')), cert: fs.readFileSync(path.join(dir, 'cert.pem')) }, async (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': BASE,
      'Access-Control-Allow-Credentials': 'true',
    })
    for (const chunk of sseChunks(streamEvents())) {
      res.write(chunk)
      await new Promise((r) => setTimeout(r, streamDelay / 6))
    }
    res.end()
  })
  await new Promise((r) => streamServer.listen(STREAM_PORT, '127.0.0.1', r))
}
export function stopStreamServer() { streamServer?.close(); streamServer = null }

const CORS = { 'Access-Control-Allow-Origin': BASE, 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': 'authorization,content-type', 'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS' }

export async function openApp(browser, { theme = 'light', width = 1440, height = 900, reducedMotion = 'no-preference' } = {}) {
  // ignoreHTTPSErrors only lets this test context reach the local self-signed stream server.
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion, deviceScaleFactor: 1, ignoreHTTPSErrors: true })
  await context.addCookies([
    { name: '__session', value: await mintSessionCookie(), url: BASE, httpOnly: true, sameSite: 'Lax' },
    { name: 'onboarding_complete', value: 'true', url: BASE, httpOnly: true, sameSite: 'Lax' },
  ])
  await context.addInitScript((t) => {
    try { localStorage.setItem('theme-manual', 'true'); localStorage.setItem('theme', t) } catch {}
  }, theme)
  const log = { unhandled: [], errors: [], requests: [] }
  // Never open a real realtime socket from the harness: keep every WebSocket mocked.
  await context.routeWebSocket(/.*/, () => {})
  await context.route('**/*', async (route) => {
    const req = route.request()
    const url = new URL(req.url())
    const local = url.origin === BASE
    if (local && !url.pathname.startsWith('/api/')) return route.continue()
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS })
    log.requests.push(`${req.method()} ${local ? url.pathname : url.host + url.pathname}`)
    if (/\/chats\/[^/]+\/stream$/.test(url.pathname) && req.method() === 'POST') {
      return route.continue({ url: `https://127.0.0.1:${STREAM_PORT}/stream` })
    }
    let body
    if (local && url.pathname.startsWith('/api/aselius/')) body = rest(req.method(), url.pathname, url.search)
    else if (!local) body = node(req.method(), url.pathname)
    if (body === undefined) {
      log.unhandled.push(`${req.method()} ${local ? url.pathname : url.host + url.pathname}`)
      return route.fulfill({ status: 404, headers: CORS, contentType: 'application/json', body: '{"detail":"harness: no fixture"}' })
    }
    return route.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify(body) })
  })
  const page = await context.newPage()
  page.on('console', (m) => { if (m.type() === 'error') log.errors.push(m.text().slice(0, 240)) })
  page.on('pageerror', (e) => log.errors.push('PAGEERROR ' + String(e).slice(0, 240)))
  return { context, page, log }
}

/** Lab metrics for one navigation (cold cache: new context each time). */
export async function collectMetrics(page) {
  return page.evaluate(async () => {
    const nav = performance.getEntriesByType('navigation')[0]
    const res = performance.getEntriesByType('resource')
    const js = res.filter((r) => r.initiatorType === 'script' || r.name.endsWith('.js'))
    const css = res.filter((r) => r.name.endsWith('.css'))
    const lcp = await new Promise((resolve) => {
      let v = 0
      try {
        new PerformanceObserver((l) => { for (const e of l.getEntries()) v = e.startTime }).observe({ type: 'largest-contentful-paint', buffered: true })
      } catch {}
      setTimeout(() => resolve(v), 200)
    })
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0
    return {
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
      load: Math.round(nav.loadEventEnd),
      fcp: Math.round(fcp),
      lcp: Math.round(lcp),
      jsRequests: js.length,
      jsTransferKB: Math.round(js.reduce((s, r) => s + (r.transferSize || 0), 0) / 1024),
      jsDecodedKB: Math.round(js.reduce((s, r) => s + (r.decodedBodySize || 0), 0) / 1024),
      cssTransferKB: Math.round(css.reduce((s, r) => s + (r.transferSize || 0), 0) / 1024),
      longTasks: (window.__longTasks || []).length,
      longTaskMs: Math.round((window.__longTasks || []).reduce((s, d) => s + d, 0)),
    }
  })
}

export async function installLongTaskObserver(context) {
  await context.addInitScript(() => {
    window.__longTasks = []
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__longTasks.push(e.duration) }).observe({ type: 'longtask', buffered: true }) } catch {}
  })
}
