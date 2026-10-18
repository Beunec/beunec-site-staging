// Batch 2 checks: draggable Selius, outcome badges, dark surfaces on Teams/preview/code.
import { chromium, openApp, BASE, startStreamServer, stopStreamServer } from './app.mjs'
const OUT = process.argv[2]
const browser = await chromium.launch()
await startStreamServer()
const res = {}
{
  const { page, context } = await openApp(browser, { theme: 'dark' })
  await page.goto(BASE + '/workspace/ws-launch/cs-launch-research', { waitUntil: 'domcontentloaded' })
  await page.getByText('Launch plan').first().waitFor({ timeout: 30000 })
  const btn = page.locator('[data-selius-float] > button').last()
  const before = await btn.boundingBox()
  await page.mouse.move(before.x + 32, before.y + 32)
  await page.mouse.down()
  await page.mouse.move(before.x - 300, before.y - 250, { steps: 12 })
  await page.mouse.up()
  await page.waitForTimeout(300)
  const after = await btn.boundingBox()
  res.seliusMoved = Math.round(after.x - before.x) + ',' + Math.round(after.y - before.y)
  res.seliusSaved = await page.evaluate(() => localStorage.getItem('selius.offset'))
  res.voiceNotStartedByDrag = !(await page.getByText('Connecting…').count())
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.getByText('Launch plan').first().waitFor({ timeout: 30000 })
  const reloaded = await page.locator('[data-selius-float] > button').last().boundingBox()
  res.seliusPositionPersists = Math.abs(reloaded.x - after.x) < 2 && Math.abs(reloaded.y - after.y) < 2
  // Stream with outcomes
  await page.getByRole('button', { name: /Specialty/ }).first().click()
  await page.getByRole('button', { name: 'Chat', exact: true }).first().click()
  await page.locator('textarea').first().fill('Run the launch checks')
  await page.keyboard.press('Enter')
  await page.getByText('The launch checks pass.').first().waitFor({ timeout: 20000 })
  await page.waitForTimeout(1500)
  await page.getByRole('button', { name: /steps/ }).last().click()
  await page.waitForTimeout(400)
  res.rows = await page.locator('ol').last().locator('li').evaluateAll((lis) => lis.map((li) => li.innerText.replace(/\s+/g, ' ').trim()))
  res.summary = await page.getByRole('button', { name: /steps/ }).last().innerText()
  await page.locator('ol').last().scrollIntoViewIfNeeded()
  await page.screenshot({ path: `${OUT}/b2-activity-outcomes-dark.png` })
  // Preview panel document editor
  await page.getByText('launch brief', { exact: true }).first().click()
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${OUT}/b2-preview-doc-dark.png` })
  await context.close()
}
{
  const { page, context } = await openApp(browser, { theme: 'dark' })
  await page.goto(BASE + '/teams', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(4500)
  res.teamsBg = await page.evaluate(() => getComputedStyle(document.querySelector('[data-teams-surface]') || document.body).backgroundColor)
  await page.screenshot({ path: `${OUT}/b2-teams-dark.png` })
  await context.close()
}
stopStreamServer()
await browser.close()
console.log(JSON.stringify(res, null, 1))
