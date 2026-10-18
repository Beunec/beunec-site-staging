/** Heuristics and conversion helpers for DocumentEditor. */

import TurndownService from 'turndown'
import { gfm } from '@joplin/turndown-plugin-gfm'
import { marked } from 'marked'

const MD_EXT = /\.(md|markdown)$/i
const MD_FORMAT = /^md$/i

let turndown: TurndownService | null = null
let markedReady = false

/** GFM parse (tables, task lists, strikethrough) — round-trip via turndown-plugin-gfm. */
function ensureMarked() {
  if (markedReady) return
  markedReady = true
  marked.setOptions({ gfm: true, breaks: true })
  marked.use({
    renderer: {
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens)
        const t = title ? ` title="${title.replace(/"/g, '&quot;')}"` : ''
        const url = href || '#'
        return `<a href="${url}"${t} target="_blank" rel="noopener noreferrer">${text}</a>`
      },
    },
  })
}

export function markdownToHtml(md: string): string {
  ensureMarked()
  return marked.parse(md || '') as string
}

/** Strip markdown block markers when converting via keyboard shortcuts. */
export function stripBlockMarker(html: string, tag: string): string {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  const text = (tmp.textContent || '').replace(/\u00a0/g, ' ').trim()
  if (tag === 'ul' && /^[-*+]$/.test(text)) return '<br>'
  if (tag === 'ol' && /^\d+\.$/.test(text)) return '<br>'
  if (tag === 'h1' && text === '#') return '<br>'
  if (tag === 'h2' && text === '##') return '<br>'
  if (tag === 'h3' && text === '###') return '<br>'
  if (tag === 'blockquote' && text === '>') return '<br>'
  return html || '<br>'
}

function getTurndown(): TurndownService {
  if (!turndown) {
    turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
    })
    turndown.use(gfm)
    turndown.addRule('katex-inline', {
      filter: (node) =>
        node.nodeType === 1 &&
        (node as HTMLElement).hasAttribute('data-math-source') &&
        (node as HTMLElement).getAttribute('data-display-mode') !== 'true',
      replacement: (_content, node) => {
        const source = (node as HTMLElement).getAttribute('data-math-source') || ''
        return source ? `$${source}$` : ''
      },
    })
    turndown.addRule('katex-block', {
      filter: (node) =>
        node.nodeType === 1 &&
        (node as HTMLElement).hasAttribute('data-math-source') &&
        (node as HTMLElement).getAttribute('data-display-mode') === 'true',
      replacement: (_content, node) => {
        const source = (node as HTMLElement).getAttribute('data-math-source') || ''
        return source ? `\n\n$$\n${source}\n$$\n\n` : ''
      },
    })
  }
  return turndown
}

export function htmlToMarkdown(html: string): string {
  if (!html.trim()) return ''
  return getTurndown().turndown(html).replace(/\n{3,}/g, '\n\n').trim()
}

export function isMarkdownFilename(name: string): boolean {
  return MD_EXT.test(name || '')
}

export function isMarkdownFormat(format?: string): boolean {
  return Boolean(format && MD_FORMAT.test(format))
}

export function isMarkdownPreview(
  name: string,
  format?: string,
  content?: string | null,
): boolean {
  if (isMarkdownFilename(name) || isMarkdownFormat(format)) return true
  if (!content?.trim()) return false
  const sample = content.slice(0, 4000)
  return (
    /^#{1,6}\s/m.test(sample) ||
    /```[\s\S]*?```/m.test(sample) ||
    /^\s*[-*+]\s/m.test(sample) ||
    /\*\*[^*]+\*\*/m.test(sample) ||
    /^\s*\|.+\|/m.test(sample)
  )
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function sanitizeFilename(name: string): string {
  return (name.replace(/\.[^.]+$/, '') || 'document').replace(/[^a-z0-9-_]+/gi, '-').toLowerCase()
}

export function downloadTextFile(content: string, filename: string, mime = 'text/markdown;charset=utf-8') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Internal lightweight PDF export engine.
//
// Renders the editor's block/inline structure directly with jsPDF's vector
// text/drawing primitives — no html2canvas/html2pdf rasterization, no hidden
// iframe, no browser print dialog. This produces real, selectable, searchable
// PDF text that mirrors the exact markdown formatting (headings, lists, task
// checkboxes, tables, code blocks, blockquotes, bold/italic/underline/strike/
// inline-code/links), instead of the previous approach's occasional blank
// page (a canvas/font-load race in the hidden iframe).
//
// Known, intentional scope limit: inline images are not rasterized/embedded
// (would require an async fetch+canvas round trip per image with real CORS
// failure modes); they're skipped gracefully rather than breaking the export.
// ---------------------------------------------------------------------------

type PdfRunStyle = {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strike?: boolean
  code?: boolean
  linkHref?: string
}

type PdfRun = { text: string } & PdfRunStyle

type RGB = [number, number, number]

interface PdfTheme {
  page: RGB
  text: RGB
  muted: RGB
  border: RGB
  accent: RGB
  quoteBg: RGB
  codeBg: RGB
  preBg: RGB
  preFg: RGB
}

/** Solid-color approximations of the editor's CSS custom properties (PDF fills can't do alpha reliably across renderers). */
function pdfTheme(isDarkMode: boolean): PdfTheme {
  return isDarkMode
    ? {
        page: [17, 24, 39],
        text: [243, 244, 246],
        muted: [156, 163, 175],
        border: [75, 85, 99],
        accent: [96, 165, 250],
        quoteBg: [30, 41, 59],
        codeBg: [55, 65, 81],
        preBg: [11, 18, 32],
        preFg: [229, 231, 235],
      }
    : {
        page: [255, 255, 255],
        text: [26, 26, 26],
        muted: [107, 114, 128],
        border: [221, 221, 221],
        accent: [0, 68, 119],
        quoteBg: [232, 240, 247],
        codeBg: [243, 244, 246],
        preBg: [15, 23, 42],
        preFg: [226, 232, 240],
      }
}

/** Same inline-run walk as the DOCX exporter (parseInlineRuns), producing plain style tokens instead of docx TextRuns. Inline KaTeX is emitted as its literal `$expr$`/`$$expr$$` source, matching the DOCX export's fidelity choice. */
function parsePdfRuns(root: Node): PdfRun[] {
  const segments: PdfRun[] = []

  const walk = (node: Node, style: PdfRunStyle) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent || '').replace(/ /g, ' ')
      if (text) segments.push({ text, ...style })
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return

    const el = node as HTMLElement
    const tag = el.tagName

    if (el.hasAttribute('data-math-source')) {
      const src = el.getAttribute('data-math-source') || ''
      const display = el.getAttribute('data-display-mode') === 'true'
      if (src) segments.push({ text: display ? `$$${src}$$` : `$${src}$`, ...style, code: true })
      return
    }

    if (tag === 'INPUT' && (el as HTMLInputElement).type === 'checkbox') {
      segments.push({ text: (el as HTMLInputElement).checked ? '☑ ' : '☐ ', ...style })
      return
    }

    if (tag === 'BR') {
      segments.push({ text: '\n', ...style })
      return
    }

    const next: PdfRunStyle = { ...style }
    if (tag === 'STRONG' || tag === 'B') next.bold = true
    if (tag === 'EM' || tag === 'I') next.italic = true
    if (tag === 'U') next.underline = true
    if (tag === 'S' || tag === 'DEL' || tag === 'STRIKE') next.strike = true
    if (tag === 'CODE' && el.parentElement?.tagName !== 'PRE') next.code = true

    if (tag === 'A') {
      next.linkHref = el.getAttribute('href') || undefined
      next.underline = true
      el.childNodes.forEach((child) => walk(child, next))
      return
    }

    el.childNodes.forEach((child) => walk(child, next))
  }

  walk(root, {})
  return segments.filter((s) => s.text)
}

interface PdfCursor {
  doc: import('jspdf').jsPDF
  y: number
  marginX: number
  marginTop: number
  marginBottom: number
  pageWidth: number
  pageHeight: number
  theme: PdfTheme
}

function paintPageBackground(cur: PdfCursor) {
  cur.doc.setFillColor(...cur.theme.page)
  cur.doc.rect(0, 0, cur.pageWidth, cur.pageHeight, 'F')
}

function ensureSpace(cur: PdfCursor, needed: number) {
  if (cur.y + needed > cur.pageHeight - cur.marginBottom) {
    cur.doc.addPage()
    paintPageBackground(cur)
    cur.y = cur.marginTop
  }
}

function applyRunFont(cur: PdfCursor, run: PdfRunStyle, baseSize: number) {
  if (run.code) {
    cur.doc.setFont('courier', run.bold ? 'bold' : 'normal')
    cur.doc.setFontSize(baseSize * 0.94)
  } else {
    const style = run.bold && run.italic ? 'bolditalic' : run.bold ? 'bold' : run.italic ? 'italic' : 'normal'
    cur.doc.setFont('helvetica', style)
    cur.doc.setFontSize(baseSize)
  }
}

interface DrawRunsOpts {
  x: number
  maxWidth: number
  fontSize: number
  lineHeight: number
  color?: RGB
}

/** Word-wraps a stream of mixed-style runs across lines/pages, drawing bold/italic/underline/strike/inline-code/links exactly as authored. Returns nothing; advances cur.y. */
function drawRuns(cur: PdfCursor, runs: PdfRun[], opts: DrawRunsOpts) {
  const { doc } = cur
  const { x, maxWidth, fontSize, lineHeight } = opts
  const baseColor = opts.color || cur.theme.text
  if (!runs.length) return

  type Token = { text: string; style: PdfRunStyle; width: number; isBreak?: boolean }
  const stream: Token[] = []

  for (const run of runs) {
    const parts = run.text.split('\n')
    parts.forEach((part, i) => {
      if (i > 0) stream.push({ text: '', style: run, width: 0, isBreak: true })
      const words = part.match(/\S+|\s+/g) || []
      for (const w of words) {
        applyRunFont(cur, run, fontSize)
        stream.push({ text: w, style: run, width: doc.getTextWidth(w) })
      }
    })
  }

  let lineBuffer: Token[] = []
  let lineWidth = 0

  const flushLine = () => {
    while (lineBuffer.length && /^\s+$/.test(lineBuffer[lineBuffer.length - 1].text)) {
      lineWidth -= lineBuffer.pop()!.width
    }
    if (!lineBuffer.length) {
      cur.y += lineHeight
      return
    }
    ensureSpace(cur, lineHeight)
    const baseline = cur.y
    let cx = x
    for (const tok of lineBuffer) {
      if (/^\s+$/.test(tok.text)) {
        cx += tok.width
        continue
      }
      applyRunFont(cur, tok.style, fontSize)
      const color = tok.style.linkHref ? cur.theme.accent : tok.style.code ? cur.theme.text : baseColor

      if (tok.style.code) {
        doc.setFillColor(...cur.theme.codeBg)
        doc.roundedRect(cx - 1.5, baseline - fontSize * 0.82, tok.width + 3, fontSize * 1.18, 1, 1, 'F')
      }

      doc.setTextColor(...color)
      if (tok.style.linkHref) {
        doc.textWithLink(tok.text, cx, baseline, { url: tok.style.linkHref })
      } else {
        doc.text(tok.text, cx, baseline)
      }

      if (tok.style.underline) {
        doc.setDrawColor(...color)
        doc.setLineWidth(0.5)
        doc.line(cx, baseline + 1.6, cx + tok.width, baseline + 1.6)
      }
      if (tok.style.strike) {
        doc.setDrawColor(...color)
        doc.setLineWidth(0.5)
        doc.line(cx, baseline - fontSize * 0.3, cx + tok.width, baseline - fontSize * 0.3)
      }
      cx += tok.width
    }
    lineBuffer = []
    lineWidth = 0
    cur.y = baseline + lineHeight
  }

  for (const tok of stream) {
    if (tok.isBreak) {
      flushLine()
      continue
    }
    if (lineWidth + tok.width > maxWidth && lineBuffer.length) flushLine()
    lineBuffer.push(tok)
    lineWidth += tok.width
  }
  flushLine()
}

function contentWidth(cur: PdfCursor): number {
  return cur.pageWidth - cur.marginX * 2
}

const HEADING_SIZES: Record<number, number> = { 1: 21, 2: 16.5, 3: 13.5, 4: 12 }

function renderHeading(cur: PdfCursor, el: HTMLElement, level: number) {
  const fontSize = HEADING_SIZES[level] || 12
  const runs = parsePdfRuns(el)
  if (!runs.length) return
  ensureSpace(cur, fontSize * 1.4 + 16)
  cur.y += level === 1 ? 6 : 16
  drawRuns(cur, runs, { x: cur.marginX, maxWidth: contentWidth(cur), fontSize, lineHeight: fontSize * 1.28 })
  if (level === 2) {
    cur.y += 3
    cur.doc.setDrawColor(...cur.theme.border)
    cur.doc.setLineWidth(0.6)
    cur.doc.line(cur.marginX, cur.y, cur.pageWidth - cur.marginX, cur.y)
    cur.y += 10
  } else {
    cur.y += 6
  }
}

function renderParagraph(cur: PdfCursor, el: HTMLElement) {
  const runs = parsePdfRuns(el)
  if (!runs.length) {
    cur.y += 6
    return
  }
  drawRuns(cur, runs, { x: cur.marginX, maxWidth: contentWidth(cur), fontSize: 11, lineHeight: 15 })
  cur.y += 8
}

function renderList(cur: PdfCursor, el: HTMLElement, ordered: boolean, depth = 0) {
  const items = Array.from(el.children).filter((c) => c.tagName === 'LI') as HTMLElement[]
  items.forEach((li, idx) => {
    const isTask = li.classList.contains('task-list-item')
    const marker = isTask
      ? (li.querySelector('input[type="checkbox"]') as HTMLInputElement | null)?.checked
        ? '☑'
        : '☐'
      : ordered
        ? `${idx + 1}.`
        : '•'

    const nestedLists = Array.from(li.children).filter((c) => c.tagName === 'UL' || c.tagName === 'OL') as HTMLElement[]
    const clone = li.cloneNode(true) as HTMLElement
    clone.querySelectorAll(':scope > ul, :scope > ol, input[type="checkbox"]').forEach((n) => n.remove())
    const runs = parsePdfRuns(clone)

    const indent = cur.marginX + depth * 14
    const markerWidth = 14
    ensureSpace(cur, 15)
    cur.doc.setFont('helvetica', 'normal')
    cur.doc.setFontSize(11)
    cur.doc.setTextColor(...cur.theme.text)
    cur.doc.text(marker, indent, cur.y)
    if (runs.length) {
      drawRuns(cur, runs, {
        x: indent + markerWidth,
        maxWidth: cur.pageWidth - cur.marginX - indent - markerWidth,
        fontSize: 11,
        lineHeight: 15,
      })
    } else {
      cur.y += 15
    }
    cur.y += 2

    nestedLists.forEach((nl) => renderList(cur, nl, nl.tagName === 'OL', depth + 1))
  })
  cur.y += 4
}

function renderBlockquote(cur: PdfCursor, el: HTMLElement) {
  const runs = parsePdfRuns(el)
  if (!runs.length) return
  ensureSpace(cur, 24)
  cur.y += 6
  const barTop = cur.y - 4
  const indent = cur.marginX + 12
  drawRuns(cur, runs, {
    x: indent,
    maxWidth: cur.pageWidth - cur.marginX - indent,
    fontSize: 11,
    lineHeight: 15,
    color: cur.theme.muted,
  })
  cur.y += 6
  cur.doc.setFillColor(...cur.theme.accent)
  cur.doc.rect(cur.marginX, barTop, 2.2, cur.y - barTop - 6, 'F')
}

function renderHr(cur: PdfCursor) {
  ensureSpace(cur, 24)
  cur.y += 10
  cur.doc.setDrawColor(...cur.theme.border)
  cur.doc.setLineWidth(0.6)
  cur.doc.line(cur.marginX, cur.y, cur.pageWidth - cur.marginX, cur.y)
  cur.y += 10
}

function renderCodeBlock(cur: PdfCursor, el: HTMLElement) {
  const codeEl = el.querySelector('code') || el
  const text = (codeEl.textContent || '').replace(/\r\n/g, '\n').replace(/ /g, ' ')
  const fontSize = 9.5
  const lineHeight = fontSize * 1.45
  const padX = 8
  const padY = 8
  const boxWidth = contentWidth(cur)
  const maxTextWidth = boxWidth - padX * 2

  cur.doc.setFont('courier', 'normal')
  cur.doc.setFontSize(fontSize)

  const wrapped: string[] = []
  text.split('\n').forEach((line) => {
    if (!line.length) {
      wrapped.push('')
      return
    }
    let remaining = line
    while (cur.doc.getTextWidth(remaining) > maxTextWidth) {
      let cut = remaining.length
      while (cut > 1 && cur.doc.getTextWidth(remaining.slice(0, cut)) > maxTextWidth) cut--
      wrapped.push(remaining.slice(0, cut))
      remaining = remaining.slice(cut)
    }
    wrapped.push(remaining)
  })

  cur.y += 4
  let idx = 0
  while (idx < wrapped.length) {
    const available = cur.pageHeight - cur.marginBottom - cur.y - padY * 2
    const linesThisPage = Math.floor(available / lineHeight)
    if (linesThisPage < 1) {
      cur.doc.addPage()
      paintPageBackground(cur)
      cur.y = cur.marginTop
      continue
    }
    const chunk = wrapped.slice(idx, idx + linesThisPage)
    const chunkHeight = chunk.length * lineHeight + padY * 2
    const boxTop = cur.y
    cur.doc.setFillColor(...cur.theme.preBg)
    cur.doc.roundedRect(cur.marginX, boxTop, boxWidth, chunkHeight, 3, 3, 'F')
    cur.doc.setTextColor(...cur.theme.preFg)
    let ty = boxTop + padY + fontSize * 0.85
    chunk.forEach((line) => {
      if (line) cur.doc.text(line, cur.marginX + padX, ty)
      ty += lineHeight
    })
    cur.y = boxTop + chunkHeight
    idx += chunk.length
    if (idx < wrapped.length) {
      cur.doc.addPage()
      paintPageBackground(cur)
      cur.y = cur.marginTop
    }
  }
  cur.y += 8
}

function renderTable(cur: PdfCursor, tableEl: HTMLTableElement) {
  const rows = Array.from(tableEl.querySelectorAll('tr'))
  if (!rows.length) return
  const colCount = Math.max(...rows.map((r) => r.querySelectorAll('th, td').length))
  if (!colCount) return

  const boxWidth = contentWidth(cur)
  const colWidth = boxWidth / colCount
  const fontSize = 10
  const lineHeight = 13
  const cellPadX = 5
  const cellPadY = 5

  type Cell = { lines: string[]; isHeader: boolean }
  const grid: Cell[][] = rows.map((tr) => {
    const cells = Array.from(tr.querySelectorAll('th, td'))
    return cells.map((cellEl) => {
      const isHeader = cellEl.tagName === 'TH'
      cur.doc.setFont('helvetica', isHeader ? 'bold' : 'normal')
      cur.doc.setFontSize(fontSize)
      const text = (cellEl.textContent || '').replace(/ /g, ' ').trim()
      const lines = (cur.doc.splitTextToSize(text || ' ', colWidth - cellPadX * 2) as string[]) || ['']
      return { lines, isHeader }
    })
  })

  ensureSpace(cur, lineHeight * 2)
  grid.forEach((row) => {
    const rowLines = Math.max(1, ...row.map((c) => c.lines.length))
    const rowHeight = rowLines * lineHeight + cellPadY * 2
    if (cur.y + rowHeight > cur.pageHeight - cur.marginBottom) {
      cur.doc.addPage()
      paintPageBackground(cur)
      cur.y = cur.marginTop
    }
    const rowTop = cur.y
    row.forEach((cell, ci) => {
      const cx = cur.marginX + ci * colWidth
      if (cell.isHeader) {
        cur.doc.setFillColor(...cur.theme.quoteBg)
        cur.doc.rect(cx, rowTop, colWidth, rowHeight, 'F')
      }
      cur.doc.setDrawColor(...cur.theme.border)
      cur.doc.setLineWidth(0.5)
      cur.doc.rect(cx, rowTop, colWidth, rowHeight, 'S')
      cur.doc.setFont('helvetica', cell.isHeader ? 'bold' : 'normal')
      cur.doc.setFontSize(fontSize)
      cur.doc.setTextColor(...cur.theme.text)
      let ty = rowTop + cellPadY + fontSize * 0.82
      cell.lines.forEach((line) => {
        cur.doc.text(line, cx + cellPadX, ty)
        ty += lineHeight
      })
    })
    cur.y = rowTop + rowHeight
  })
  cur.y += 8
}

function renderHtmlBlocksToPdf(doc: import('jspdf').jsPDF, html: string, theme: PdfTheme) {
  const root = document.createElement('div')
  root.innerHTML = html || ''
  const blocks: HTMLElement[] = []
  collectBlockElements(root, blocks)

  const cur: PdfCursor = {
    doc,
    y: 0,
    marginX: 48,
    marginTop: 48,
    marginBottom: 54,
    pageWidth: doc.internal.pageSize.getWidth(),
    pageHeight: doc.internal.pageSize.getHeight(),
    theme,
  }
  cur.y = cur.marginTop
  paintPageBackground(cur)

  if (!blocks.length) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(11)
    doc.setTextColor(...theme.muted)
    doc.text('(Empty document)', cur.marginX, cur.y)
    return
  }

  for (const block of blocks) {
    const tag = block.tagName
    if (tag === 'HR') {
      renderHr(cur)
    } else if (tag === 'TABLE') {
      renderTable(cur, block as HTMLTableElement)
    } else if (tag === 'UL' || tag === 'OL') {
      renderList(cur, block, tag === 'OL')
    } else if (tag === 'PRE') {
      renderCodeBlock(cur, block)
    } else if (tag === 'BLOCKQUOTE') {
      renderBlockquote(cur, block)
    } else if (/^H[1-4]$/.test(tag)) {
      renderHeading(cur, block, Number(tag.charAt(1)))
    } else {
      renderParagraph(cur, block)
    }
  }
}

/**
 * Download document editor content as a real, text-based PDF file.
 *
 * Internal engine (jsPDF vector text, no html2canvas/html2pdf, no hidden
 * iframe/print dialog) — walks the same block structure as the DOCX export
 * and lays it out directly, so the exported file always contains real
 * content instead of an occasional blank page from a rasterization race.
 */
export async function downloadPdfDocument(
  html: string,
  title = 'Document',
  isDarkMode = false,
): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait', compress: true })
  doc.setProperties({ title: (title || 'Document').slice(0, 200) })
  renderHtmlBlocksToPdf(doc, html, pdfTheme(isDarkMode))
  doc.save(`${sanitizeFilename(title)}.pdf`)
}

/** Download document editor content as a Word-compatible DOCX file (client-side). */
export async function downloadDocxDocument(html: string, title = 'Document'): Promise<void> {
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
  } = await import('docx')

  const children = buildDocxBlocksFromHtml(html, {
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
  })

  if (children.length === 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: sanitizeDocxText(title) || 'Document' })],
      }),
    )
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  })

  const blob = await Packer.toBlob(doc)
  const safeTitle = sanitizeFilename(title)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${safeTitle}.docx`
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Strip characters invalid in OOXML / Word text nodes. */
function sanitizeDocxText(text: string): string {
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/\uFFFE|\uFFFF/g, '')
    .replace(/\u00a0/g, ' ')
}

type DocxRunStyle = {
  bold?: boolean
  italics?: boolean
  underline?: boolean
  strike?: boolean
  font?: string
}

type DocxCtor = {
  Paragraph: typeof import('docx').Paragraph
  TextRun: typeof import('docx').TextRun
  HeadingLevel: typeof import('docx').HeadingLevel
  Table: typeof import('docx').Table
  TableRow: typeof import('docx').TableRow
  TableCell: typeof import('docx').TableCell
  WidthType: typeof import('docx').WidthType
  BorderStyle: typeof import('docx').BorderStyle
}

function buildDocxBlocksFromHtml(html: string, C: DocxCtor): import('docx').FileChild[] {
  const root = document.createElement('div')
  root.innerHTML = html || ''
  const blocks: HTMLElement[] = []
  collectBlockElements(root, blocks)

  const out: import('docx').FileChild[] = []
  const headingForTag: Record<string, (typeof C.HeadingLevel)[keyof typeof C.HeadingLevel]> = {
    H1: C.HeadingLevel.HEADING_1,
    H2: C.HeadingLevel.HEADING_2,
    H3: C.HeadingLevel.HEADING_3,
    H4: C.HeadingLevel.HEADING_4,
    H5: C.HeadingLevel.HEADING_5,
    H6: C.HeadingLevel.HEADING_6,
  }

  for (const block of blocks) {
    const tag = block.tagName

    if (tag === 'HR') {
      out.push(
        new C.Paragraph({
          children: [new C.TextRun({ text: '' })],
          border: { bottom: { style: C.BorderStyle.SINGLE, size: 6, color: 'CCCCCC' } },
          spacing: { before: 200, after: 200 },
        }),
      )
      continue
    }

    if (tag === 'TABLE') {
      const table = buildDocxTable(block as HTMLTableElement, C)
      if (table) out.push(table)
      continue
    }

    if (tag === 'UL' || tag === 'OL') {
      const ordered = tag === 'OL'
      block.querySelectorAll(':scope > li').forEach((li, index) => {
        const prefix = ordered ? `${index + 1}. ` : '• '
        const runs = parseInlineRuns(li, {}, C.TextRun)
        if (li.classList.contains('task-list-item')) {
          const input = li.querySelector('input[type="checkbox"]') as HTMLInputElement | null
          runs.unshift(new C.TextRun({ text: input?.checked ? '☑ ' : '☐ ' }))
        } else {
          runs.unshift(new C.TextRun({ text: prefix }))
        }
        if (runs.length) out.push(new C.Paragraph({ children: runs, spacing: { after: 120 } }))
      })
      continue
    }

    if (tag === 'PRE') {
      const code = block.querySelector('code')
      const text = sanitizeDocxText((code || block).textContent || '')
      if (text) {
        out.push(
          new C.Paragraph({
            children: [new C.TextRun({ text, font: 'Courier New' })],
            spacing: { before: 120, after: 120 },
          }),
        )
      }
      continue
    }

    const heading = headingForTag[tag]
    const runs = parseInlineRuns(block, {}, C.TextRun)
    if (!runs.length) continue

    if (heading) {
      out.push(new C.Paragraph({ heading, children: runs, spacing: { before: 200, after: 120 } }))
      continue
    }

    if (tag === 'BLOCKQUOTE') {
      out.push(
        new C.Paragraph({
          children: runs,
          indent: { left: 720 },
          spacing: { before: 120, after: 120 },
        }),
      )
      continue
    }

    out.push(new C.Paragraph({ children: runs, spacing: { after: 120 } }))
  }

  return out
}

function collectBlockElements(parent: HTMLElement, out: HTMLElement[]) {
  parent.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = sanitizeDocxText(node.textContent || '').trim()
      if (!text) return
      const p = document.createElement('p')
      p.textContent = text
      out.push(p)
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return

    const el = node as HTMLElement
    const tag = el.tagName
    if (tag === 'SCRIPT' || tag === 'STYLE') return

    if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'UL', 'OL', 'BLOCKQUOTE', 'PRE', 'TABLE', 'HR'].includes(tag)) {
      out.push(el)
      return
    }

    if (tag === 'DIV' || tag === 'SECTION' || tag === 'ARTICLE' || tag === 'MAIN') {
      collectBlockElements(el, out)
      return
    }

    const p = document.createElement('p')
    p.innerHTML = el.innerHTML
    if (sanitizeDocxText(p.textContent || '').trim()) out.push(p)
  })
}

function parseInlineRuns(
  root: Node,
  inherited: DocxRunStyle,
  TextRunCtor: typeof import('docx').TextRun,
): import('docx').TextRun[] {
  const segments: Array<{ text: string } & DocxRunStyle> = []

  const walk = (node: Node, style: DocxRunStyle) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = sanitizeDocxText(node.textContent || '')
      if (text) segments.push({ text, ...style })
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return

    const el = node as HTMLElement
    const tag = el.tagName

    if (el.hasAttribute('data-math-source')) {
      const src = sanitizeDocxText(el.getAttribute('data-math-source') || '')
      if (src) segments.push({ text: src, ...style })
      return
    }

    if (tag === 'INPUT' && (el as HTMLInputElement).type === 'checkbox') return

    if (tag === 'BR') {
      segments.push({ text: '\n', ...style })
      return
    }

    const next: DocxRunStyle = { ...style }
    if (tag === 'STRONG' || tag === 'B') next.bold = true
    if (tag === 'EM' || tag === 'I') next.italics = true
    if (tag === 'U') next.underline = true
    if (tag === 'S' || tag === 'DEL' || tag === 'STRIKE') next.strike = true
    if (tag === 'CODE' && el.parentElement?.tagName !== 'PRE') next.font = 'Courier New'

    if (tag === 'A') {
      const href = el.getAttribute('href') || ''
      const label = sanitizeDocxText(el.textContent || href)
      if (label) segments.push({ text: label, ...style })
      if (href && href !== label) segments.push({ text: ` (${href})`, ...style })
      return
    }

    el.childNodes.forEach((child) => walk(child, next))
  }

  walk(root, inherited)
  return mergeTextRunSegments(segments, TextRunCtor)
}

function mergeTextRunSegments(
  segments: Array<{ text: string } & DocxRunStyle>,
  TextRunCtor: typeof import('docx').TextRun,
): import('docx').TextRun[] {
  const merged: Array<{ text: string } & DocxRunStyle> = []
  for (const seg of segments) {
    if (!seg.text) continue
    const prev = merged[merged.length - 1]
    if (
      prev &&
      prev.bold === seg.bold &&
      prev.italics === seg.italics &&
      prev.underline === seg.underline &&
      prev.strike === seg.strike &&
      prev.font === seg.font
    ) {
      prev.text += seg.text
    } else {
      merged.push({ ...seg })
    }
  }

  return merged.map((seg) => {
    const props: {
      text: string
      bold?: boolean
      italics?: boolean
      underline?: Record<string, never>
      strike?: boolean
      font?: string
    } = { text: seg.text }
    if (seg.bold) props.bold = true
    if (seg.italics) props.italics = true
    if (seg.underline) props.underline = {}
    if (seg.strike) props.strike = true
    if (seg.font) props.font = seg.font
    return new TextRunCtor(props)
  })
}

function buildDocxTable(tableEl: HTMLTableElement, C: DocxCtor): import('docx').Table | null {
  const rows: import('docx').TableRow[] = []
  tableEl.querySelectorAll('tr').forEach((tr) => {
    const cells: import('docx').TableCell[] = []
    tr.querySelectorAll('th, td').forEach((cell) => {
      const runs = parseInlineRuns(cell, { bold: cell.tagName === 'TH' }, C.TextRun)
      cells.push(
        new C.TableCell({
          children: [
            new C.Paragraph({
              children: runs.length ? runs : [new C.TextRun({ text: '' })],
            }),
          ],
        }),
      )
    })
    if (cells.length) rows.push(new C.TableRow({ children: cells }))
  })
  if (!rows.length) return null

  return new C.Table({
    rows,
    width: { size: 100, type: C.WidthType.PERCENTAGE },
    borders: {
      top: { style: C.BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
      bottom: { style: C.BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
      left: { style: C.BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
      right: { style: C.BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
      insideHorizontal: { style: C.BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
      insideVertical: { style: C.BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
    },
  })
}

export type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'
