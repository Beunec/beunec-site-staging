'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import hljs from 'highlight.js'
import katex from 'katex'
import { Download, FileText, ChevronRight, Save, Loader2, ChevronDown, FileType, Printer, Globe, ClipboardCopy, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  countWords,
  downloadDocxDocument,
  downloadTextFile,
  htmlToMarkdown,
  markdownToHtml,
  downloadPdfDocument,
  sanitizeFilename,
  stripBlockMarker,
  type SaveState,
} from './documentEditor.utils'
import { updateAsset, type AssistSelection } from '../../lib/assetsApi'
import RivineAssistDock from './RivineAssistDock'
import PublishDialog from './PublishDialog'
import { getPublishState, type PublishState } from '../../lib/publishApi'
import { selectionFromDom } from './assistSelection'

export interface DocumentEditorProps {
  markdown: string
  title?: string
  isFullscreen?: boolean
  className?: string
  workspaceId?: string
  assetId?: string
  readOnly?: boolean
  onSaved?: (content: string) => void
}

interface TocEntry {
  id: string
  text: string
  level: number
}

const EDITOR_STYLES = `
.dce-root {
  --dce-canvas: #f4f4f0;
  /* No pure white anywhere in the light theme — surfaces (buttons, export menu,
     table headers) use the same canvas tone instead of #ffffff. */
  --dce-surface: var(--dce-canvas);
  --dce-text: #1a1a1a;
  --dce-muted: #6b7280;
  --dce-border: rgba(0, 0, 0, 0.08);
  --dce-accent: #00477d;
  --dce-accent-soft: rgba(0, 68, 119, 0.08);
  --dce-code-bg: #eceae2;
  /* Light-mode code blocks must be LIGHT: the light github hljs theme (loaded
     in light mode) uses dark token colors, so a dark --dce-pre-bg here rendered
     dark-on-dark and unreadable. Warm light surface + dark ink matches the
     light github theme's assumptions. Dark mode overrides both below. */
  --dce-pre-bg: #f1f1ea;
  --dce-pre-fg: #24292f;
  --dce-quote-bg: rgba(0, 68, 119, 0.06);
  --dce-max-w: 100%;
  --dce-pad-x: 1rem;
  --dce-pad-y: 1.25rem;
  --dce-ftb-bg: #1c1c1e;
  --dce-ftb-fg: #e8e8e8;
  --dce-ftb-hover: rgba(255, 255, 255, 0.15);
  --dce-ftb-active: rgba(64, 156, 224, 0.55);
  --dce-ftb-divider: rgba(255, 255, 255, 0.2);
  --dce-ftb-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--dce-canvas);
  color: var(--dce-text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  position: relative;
}
.dce-root.dce-dark {
  --dce-canvas: #111827;
  --dce-surface: #1f2937;
  --dce-text: #f3f4f6;
  --dce-muted: #9ca3af;
  --dce-border: rgba(255, 255, 255, 0.1);
  --dce-accent: #60a5fa;
  --dce-accent-soft: rgba(96, 165, 250, 0.12);
  --dce-code-bg: #374151;
  --dce-pre-bg: #0b1220;
  --dce-pre-fg: #e5e7eb;
  --dce-quote-bg: rgba(96, 165, 250, 0.1);
  --dce-ftb-bg: #2d3748;
  --dce-ftb-fg: #f3f4f6;
  --dce-ftb-hover: rgba(255, 255, 255, 0.12);
  --dce-ftb-active: rgba(96, 165, 250, 0.4);
  --dce-ftb-divider: rgba(255, 255, 255, 0.16);
  --dce-ftb-shadow: 0 8px 24px rgba(0, 0, 0, 0.55);
}
.dce-root.dce-fullscreen { --dce-max-w: 48rem; --dce-pad-x: 2rem; --dce-pad-y: 2rem; }
.dce-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--dce-border);
  background: var(--dce-canvas);
}
.dce-toolbar-title {
  min-width: 0;
  flex: 1;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--dce-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dce-toolbar-meta {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--dce-muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.dce-toolbar-actions { display: flex; align-items: center; gap: 0.375rem; flex-shrink: 0; }
.dce-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.55rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.5rem;
  border: 1px solid var(--dce-border);
  background: var(--dce-surface);
  color: var(--dce-text);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.dce-btn:hover:not(:disabled) { border-color: var(--dce-accent); background: var(--dce-accent-soft); }
.dce-btn:focus-visible { outline: 2px solid var(--dce-accent); outline-offset: 2px; }
.dce-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.dce-btn-primary {
  background: var(--dce-accent);
  border-color: var(--dce-accent);
  color: #fff;
}
.dce-btn-primary:hover:not(:disabled) { filter: brightness(1.08); }
.dce-save-label { font-size: 0.625rem; color: var(--dce-muted); font-variant-numeric: tabular-nums; }
.dce-export-wrap { position: relative; }
.dce-export-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 11.5rem;
  background: var(--dce-surface);
  border: 1px solid var(--dce-border);
  border-radius: 0.5rem;
  box-shadow: 0 8px 24px rgba(0,0,0,.14);
  padding: 0.25rem;
  z-index: 80;
}
.dce-export-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  text-align: left;
  padding: 0.45rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 500;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  color: var(--dce-text);
  cursor: pointer;
}
.dce-export-item:hover:not(:disabled) { background: var(--dce-accent-soft); color: var(--dce-accent); }
.dce-export-item:disabled { opacity: 0.5; cursor: not-allowed; }
.dce-body { flex: 1; min-height: 0; display: flex; overflow: hidden; position: relative; }
.dce-toc {
  display: none;
  flex-shrink: 0;
  width: 10.5rem;
  border-right: 1px solid var(--dce-border);
  padding: 0.875rem 0.625rem;
  overflow-y: auto;
  background: var(--dce-canvas);
}
@media (min-width: 768px) {
  .dce-root.dce-fullscreen .dce-toc { display: block; }
}
.dce-toc-label {
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dce-muted);
  margin-bottom: 0.5rem;
}
.dce-toc-link {
  display: flex;
  align-items: flex-start;
  gap: 0.3rem;
  width: 100%;
  text-align: left;
  padding: 0.2rem 0;
  font-size: 0.7rem;
  line-height: 1.35;
  color: var(--dce-muted);
  background: none;
  border: none;
  cursor: pointer;
}
.dce-toc-link:hover, .dce-toc-link.dce-toc-active { color: var(--dce-accent); }
.dce-toc-link[data-level="2"] { padding-left: 0.65rem; }
.dce-toc-link[data-level="3"] { padding-left: 1.1rem; }
.dce-scroll { flex: 1; min-width: 0; overflow-y: auto; overscroll-behavior: contain; }
.dce-stage { max-width: var(--dce-max-w); margin: 0 auto; padding: var(--dce-pad-y) var(--dce-pad-x) 3rem; position: relative; }
.dce-editor {
  font-size: 0.9375rem;
  line-height: 1.75;
  color: var(--dce-text);
  word-wrap: break-word;
  outline: none;
  min-height: 12rem;
}
.dce-editor[contenteditable="true"]:empty::before {
  content: "Start typing, or paste markdown…";
  color: var(--dce-muted);
  pointer-events: none;
}
.dce-editor h1, .dce-editor h2, .dce-editor h3, .dce-editor h4 {
  font-weight: 600;
  line-height: 1.3;
  scroll-margin-top: 1rem;
}
.dce-editor h1 { font-size: 1.75rem; margin: 0 0 1rem; }
.dce-editor h2 { font-size: 1.25rem; margin: 2rem 0 0.75rem; padding-bottom: 0.35rem; border-bottom: 1px solid var(--dce-border); }
.dce-editor h3 { font-size: 1.0625rem; margin: 1.5rem 0 0.5rem; }
.dce-editor h4 { font-size: 0.9375rem; margin: 1.25rem 0 0.4rem; }
.dce-editor p { margin: 0 0 1rem; }
.dce-editor ul, .dce-editor ol { margin: 0 0 1rem; padding-left: 1.75rem; }
.dce-editor ul { list-style-type: disc; }
.dce-editor ol { list-style-type: decimal; }
.dce-editor ul ul { list-style-type: circle; margin-top: 0.35rem; }
.dce-editor ol ol { list-style-type: lower-alpha; margin-top: 0.35rem; }
.dce-editor li { margin-bottom: 0.35rem; display: list-item; }
.dce-editor li > p { margin: 0 0 0.25rem; }
.dce-editor li > p:last-child { margin-bottom: 0; }
.dce-editor ul.contains-task-list { list-style: none; padding-left: 0.25rem; }
.dce-editor li.task-list-item { list-style: none; display: flex; align-items: flex-start; gap: 0.5rem; }
.dce-editor li.task-list-item input[type="checkbox"] {
  margin-top: 0.35rem;
  flex-shrink: 0;
  accent-color: var(--dce-accent);
  cursor: pointer;
}
.dce-editor a {
  color: var(--dce-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
}
.dce-editor a:hover { opacity: 0.85; }
.dce-editor a:focus-visible { outline: 2px solid var(--dce-accent); outline-offset: 2px; border-radius: 2px; }
.dce-editor[aria-readonly="true"] input[type="checkbox"] { pointer-events: none; opacity: 0.7; }
.dce-editor blockquote {
  margin: 1rem 0;
  padding: 0.65rem 1rem;
  border-left: 3px solid var(--dce-accent);
  background: var(--dce-quote-bg);
  border-radius: 0 0.5rem 0.5rem 0;
  color: var(--dce-muted);
}
.dce-editor hr { border: none; border-top: 1px solid var(--dce-border); margin: 1.75rem 0; }
.dce-editor code {
  font-family: ui-monospace, "SF Mono", Consolas, monospace;
  font-size: 0.85em;
  background: var(--dce-code-bg);
  padding: 0.15em 0.35em;
  border-radius: 0.25rem;
}
.dce-editor pre {
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 0.625rem;
  background: var(--dce-pre-bg);
  color: var(--dce-pre-fg);
  border: 1px solid var(--dce-border);
  overflow-x: auto;
  font-size: 0.8125rem;
}
.dce-editor pre code { background: none; padding: 0; color: inherit; }
.dce-editor .hljs {
  background: transparent;
  color: inherit;
}
.dce-editor table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.875rem; }
.dce-editor th, .dce-editor td { border: 1px solid var(--dce-border); padding: 0.5rem 0.75rem; }
.dce-editor th { font-weight: 600; background: var(--dce-surface); }
.dce-editor img { max-width: 100%; border-radius: 0.5rem; }
.dce-editor .katex-display {
  margin: 1rem 0;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.25rem 0;
}
.dce-editor .katex {
  color: inherit;
  font-size: 1em;
}
.dce-ftb {
  position: absolute;
  display: flex;
  gap: 1px;
  align-items: center;
  background: var(--dce-ftb-bg);
  border-radius: 0.5rem;
  padding: 4px 5px;
  z-index: 50;
  box-shadow: var(--dce-ftb-shadow);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translate(-50%, 4px);
  transition: opacity 0.14s ease, transform 0.14s ease, visibility 0.14s;
}
.dce-ftb.dce-ftb-visible {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translate(-50%, 0);
}
.dce-fbtn {
  background: none;
  border: none;
  color: var(--dce-ftb-fg);
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  transition: background 0.12s ease;
}
.dce-fbtn:hover { background: var(--dce-ftb-hover); }
.dce-fbtn:focus-visible { outline: 2px solid var(--dce-accent); outline-offset: 1px; }
.dce-fbtn.active { background: var(--dce-ftb-active); }
.dce-fdiv { width: 1px; height: 13px; background: var(--dce-ftb-divider); margin: 0 2px; }
@media (max-width: 640px) {
  .dce-root { --dce-pad-x: 0.75rem; }
  .dce-editor { font-size: 0.875rem; }
  .dce-ftb { max-width: calc(100% - 1rem); flex-wrap: wrap; }
}
`

function slugify(text: string, index: number): string {
  const base = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `dce-h-${base || 'section'}-${index}`
}

function makeP(html = ''): HTMLParagraphElement {
  const p = document.createElement('p')
  p.innerHTML = html || '<br>'
  return p
}

function highlightCodeBlocks(root: HTMLElement) {
  root.querySelectorAll('pre code').forEach((block) => {
    const el = block as HTMLElement
    el.removeAttribute('data-highlighted')
    hljs.highlightElement(el)
  })
}

function normalizeEditorLinks(root: HTMLElement) {
  root.querySelectorAll('a[href]').forEach((node) => {
    const a = node as HTMLAnchorElement
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
  })
}

export function DocumentEditor({
  markdown,
  title = 'Document',
  isFullscreen = false,
  className = '',
  workspaceId,
  assetId,
  readOnly = false,
  onSaved,
}: DocumentEditorProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const floatTbRef = useRef<HTMLDivElement>(null)
  const exportMenuRef = useRef<HTMLDivElement>(null)
  // Rivine Assist's scope: what the user highlighted in the document, held past
  // the editor losing focus (see the selection effect below for why).
  const [assistSelection, setAssistSelection] = useState<AssistSelection | null>(null)
  const tocTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadedKeyRef = useRef<string | null>(null)

  const [toc, setToc] = useState<TocEntry[]>([])
  const [activeId, setActiveId] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [isExportingDocx, setIsExportingDocx] = useState(false)
  const [copiedMarkdown, setCopiedMarkdown] = useState(false)
  const [publishState, setPublishState] = useState<PublishState | null>(null)
  const [publishOpen, setPublishOpen] = useState(false)

  const canSave = Boolean(workspaceId && assetId && !readOnly)
  const canPublish = Boolean(workspaceId && assetId && !readOnly)

  const getEditorHtml = useCallback(
    () => editorRef.current?.innerHTML ?? markdownToHtml(markdown),
    [markdown],
  )

  const renderMath = useCallback((editor: HTMLElement) => {
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT)
    const textNodes: Text[] = []
    let current = walker.nextNode()
    while (current) {
      const textNode = current as Text
      const parentTag = textNode.parentElement?.tagName
      if (
        textNode.textContent &&
        !['CODE', 'PRE', 'SCRIPT', 'STYLE'].includes(parentTag || '')
      ) {
        textNodes.push(textNode)
      }
      current = walker.nextNode()
    }

    textNodes.forEach((textNode) => {
      const source = textNode.textContent || ''
      if (!source.includes('$')) return

      const fragment = document.createDocumentFragment()
      const regex = /(\$\$[\s\S]+?\$\$|\$[^$\n]+\$)/g
      let lastIndex = 0
      let match: RegExpExecArray | null

      while ((match = regex.exec(source))) {
        if (match.index > lastIndex) {
          fragment.appendChild(document.createTextNode(source.slice(lastIndex, match.index)))
        }

        const token = match[0]
        const displayMode = token.startsWith('$$')
        const expr = token.slice(displayMode ? 2 : 1, displayMode ? -2 : -1).trim()

        if (!expr) {
          fragment.appendChild(document.createTextNode(token))
        } else {
          const span = document.createElement('span')
          try {
            span.setAttribute('data-math-source', expr)
            span.setAttribute('data-display-mode', displayMode ? 'true' : 'false')
            span.innerHTML = katex.renderToString(expr, {
              throwOnError: false,
              displayMode,
              strict: 'ignore',
            })
            fragment.appendChild(span)
          } catch {
            fragment.appendChild(document.createTextNode(token))
          }
        }

        lastIndex = regex.lastIndex
      }

      if (lastIndex === 0) return
      if (lastIndex < source.length) {
        fragment.appendChild(document.createTextNode(source.slice(lastIndex)))
      }

      textNode.parentNode?.replaceChild(fragment, textNode)
    })
  }, [])

  const buildToc = useCallback(() => {
    const editor = editorRef.current
    if (!editor) return
    const entries: TocEntry[] = []
    editor.querySelectorAll('h1, h2, h3').forEach((node, i) => {
      const heading = node as HTMLElement
      const level = Number(heading.tagName.charAt(1))
      const text = heading.innerText.trim()
      if (!text) return
      const id = slugify(text, i)
      heading.id = id
      heading.dataset.outlineId = id
      entries.push({ id, text, level })
    })
    setToc(entries)
    setWordCount(countWords(editor.innerText || ''))
  }, [])

  const scheduleToc = useCallback(() => {
    if (tocTimerRef.current) clearTimeout(tocTimerRef.current)
    tocTimerRef.current = setTimeout(buildToc, 200)
  }, [buildToc])

  const injectMarkdownHtml = useCallback((md: string) => {
    const editor = editorRef.current
    if (!editor) return
    editor.innerHTML = markdownToHtml(md || '')
    normalizeEditorLinks(editor)
    renderMath(editor)
    highlightCodeBlocks(editor)
    if (!editor.innerText.trim() && !readOnly) {
      editor.innerHTML = ''
      const p = makeP()
      editor.appendChild(p)
    }
    buildToc()
  }, [buildToc, readOnly, renderMath])

  useEffect(() => {
    const root = document.documentElement
    const sync = () => setIsDarkMode(root.classList.contains('dark'))
    sync()

    const observer = new MutationObserver(sync)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const href = 'https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css'
    if (document.querySelector(`link[href="${href}"]`)) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link)
    }
  }, [])

  useEffect(() => {
    const id = 'dce-hljs-theme'
    let link = document.getElementById(id) as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
    link.href = isDarkMode
      ? 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github-dark.min.css'
      : 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github.min.css'
    const editor = editorRef.current
    if (editor) highlightCodeBlocks(editor)
  }, [isDarkMode])

  useEffect(() => {
    const key = `${assetId ?? 'draft'}::${markdown}`
    if (loadedKeyRef.current === key) return
    loadedKeyRef.current = key
    injectMarkdownHtml(markdown)
    setSaveState('saved')
  }, [markdown, assetId, injectMarkdownHtml])

  const getTopBlock = useCallback((): HTMLElement | null => {
    const editor = editorRef.current
    if (!editor) return null
    const sel = window.getSelection()
    if (!sel?.rangeCount) return null
    let node: Node | null = sel.getRangeAt(0).startContainer
    if (node.nodeType === 3) node = (node as Text).parentElement
    while (node && (node as HTMLElement).parentElement !== editor) {
      node = (node as HTMLElement).parentElement
    }
    return node && node !== editor ? (node as HTMLElement) : null
  }, [])

  const getLeafBlock = useCallback((): HTMLElement | null => {
    const BLOCKS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'LI', 'BLOCKQUOTE', 'PRE', 'DIV'])
    const editor = editorRef.current
    if (!editor) return null
    const sel = window.getSelection()
    if (!sel?.rangeCount) return null
    let node: Node | null = sel.getRangeAt(0).startContainer
    if (node.nodeType === 3) node = (node as Text).parentElement
    while (node && node !== editor) {
      if (BLOCKS.has((node as HTMLElement).tagName)) return node as HTMLElement
      node = (node as HTMLElement).parentElement
    }
    return null
  }, [])

  const isAtStart = useCallback((el: HTMLElement): boolean => {
    const sel = window.getSelection()
    if (!sel?.rangeCount || !sel.getRangeAt(0).collapsed) return false
    const r = sel.getRangeAt(0)
    const tr = document.createRange()
    tr.selectNodeContents(el)
    tr.collapse(true)
    return r.compareBoundaryPoints(Range.START_TO_START, tr) === 0
  }, [])

  const placeCursor = useCallback((el: HTMLElement | null, atEnd = false) => {
    if (!el || !editorRef.current) return
    editorRef.current.focus()
    try {
      const r = document.createRange()
      const s = window.getSelection()
      if (atEnd) {
        r.selectNodeContents(el)
        r.collapse(false)
      } else {
        let fc = el.firstChild
        while (fc && fc.nodeName === 'BR') fc = fc.nextSibling
        if (fc?.nodeType === 3) r.setStart(fc, 0)
        else r.setStart(el, 0)
        r.collapse(true)
      }
      s?.removeAllRanges()
      s?.addRange(r)
    } catch {
      /* ignore */
    }
  }, [])

  const insertMarkdownAtCursor = useCallback((mdText: string) => {
    const editor = editorRef.current
    if (!editor || readOnly) return
    const tmp = document.createElement('div')
    tmp.innerHTML = markdownToHtml(mdText)
    normalizeEditorLinks(tmp)
    renderMath(tmp)
    highlightCodeBlocks(tmp)
    const nodes = Array.from(tmp.children) as HTMLElement[]
    if (!nodes.length) return
    const top = getTopBlock()
    const isEmpty = editor.children.length === 0 || !editor.innerText.trim()
    if (isEmpty) {
      editor.innerHTML = ''
      nodes.forEach((n) => editor.appendChild(n))
    } else if (top) {
      let after: Element = top
      nodes.forEach((n) => {
        after.after(n)
        after = n
      })
    } else {
      nodes.forEach((n) => editor.appendChild(n))
    }
    placeCursor(nodes[0])
    scheduleToc()
    setSaveState('dirty')
  }, [getTopBlock, placeCursor, readOnly, renderMath, scheduleToc])

  const setBlockType = useCallback((tag: string) => {
    const editor = editorRef.current
    if (!editor || readOnly) return
    const top = getTopBlock()
    const sourceHtml = top ? stripBlockMarker(top.innerHTML, tag) : '<br>'
    if (tag === 'ul' || tag === 'ol') {
      const list = document.createElement(tag)
      const li = document.createElement('li')
      li.innerHTML = sourceHtml
      list.appendChild(li)
      if (top) top.replaceWith(list)
      else editor.appendChild(list)
      placeCursor(li, true)
    } else if (tag === 'blockquote') {
      const bq = document.createElement('blockquote')
      const p2 = makeP(sourceHtml)
      bq.appendChild(p2)
      if (top) top.replaceWith(bq)
      else editor.appendChild(bq)
      placeCursor(p2, true)
    } else {
      const el = document.createElement(tag)
      el.innerHTML = sourceHtml
      if (top) top.replaceWith(el)
      else editor.appendChild(el)
      placeCursor(el, true)
      scheduleToc()
    }
    setSaveState('dirty')
  }, [getTopBlock, placeCursor, readOnly, scheduleToc])

  const toggleList = useCallback((ordered: boolean) => {
    if (readOnly) return
    document.execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList', false)
    setSaveState('dirty')
    scheduleToc()
  }, [readOnly, scheduleToc])

  const insertLink = useCallback(() => {
    if (readOnly) return
    const sel = window.getSelection()?.toString() || ''
    const url = window.prompt('Enter URL', 'https://')
    if (!url?.trim()) return
    const href = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`
    if (sel) {
      document.execCommand('createLink', false, href)
    } else {
      document.execCommand('insertHTML', false, `<a href="${href}" target="_blank" rel="noopener noreferrer">link text</a>`)
    }
    if (editorRef.current) normalizeEditorLinks(editorRef.current)
    setSaveState('dirty')
    scheduleToc()
  }, [readOnly, scheduleToc])

  const updateFtbState = useCallback(() => {
    const ftb = floatTbRef.current
    if (!ftb) return
    ftb.querySelector<HTMLElement>('[data-cmd="bold"]')?.classList.toggle('active', document.queryCommandState('bold'))
    ftb.querySelector<HTMLElement>('[data-cmd="italic"]')?.classList.toggle('active', document.queryCommandState('italic'))
    ftb.querySelector<HTMLElement>('[data-cmd="underline"]')?.classList.toggle('active', document.queryCommandState('underline'))
  }, [])

  const execCmd = useCallback((cmd: string) => {
    if (readOnly) return
    document.execCommand(cmd, false)
    updateFtbState()
    setSaveState('dirty')
    scheduleToc()
  }, [readOnly, scheduleToc, updateFtbState])

  const saveNow = useCallback(async (silent = false) => {
    if (!canSave || !workspaceId || !assetId) return
    const md = htmlToMarkdown(editorRef.current?.innerHTML ?? '')
    setSaveState('saving')
    try {
      await updateAsset(workspaceId, assetId, { content: md })
      loadedKeyRef.current = `${assetId}::${md}`
      setSaveState('saved')
      onSaved?.(md)
      if (!silent) toast.success('Saved to asset')
    } catch {
      setSaveState('error')
      if (!silent) toast.error('Failed to save document')
    }
  }, [assetId, canSave, onSaved, workspaceId])

  /** Put Rivine Assist's markdown into the editor and save it.
   *
   * Deliberately the same two steps a person's own edit takes — inject, then
   * `saveNow` — so an assisted change is versioned identically and there is no
   * second persistence path to keep in step with this one. `loadedKeyRef` is
   * stamped first because the `markdown` prop is still the pre-assist text:
   * without it the load effect would fire on the next render and put the old
   * document straight back.
   */
  const applyAssistedContent = useCallback(
    async (content: string) => {
      injectMarkdownHtml(content)
      loadedKeyRef.current = `${assetId ?? 'draft'}::${content}`
      setSaveState('dirty')
      await saveNow(true)
    },
    [assetId, injectMarkdownHtml, saveNow],
  )

  const readAssistContent = useCallback(
    () => htmlToMarkdown(editorRef.current?.innerHTML ?? ''),
    [],
  )

  /**
   * Track what the user has highlighted, so Rivine Assist can be fenced to it.
   *
   * Separate from the formatting toolbar's `selectionchange` handler, which is
   * about where to put a popup. This one is about scope, and it has a rule that
   * handler doesn't: a selection that moves *out* of the editor is ignored
   * rather than cleared. Clicking into the Assist input fires `selectionchange`
   * with the caret in that textarea, and if that cleared the scope the feature
   * would be unusable — you could never reach the box to type in.
   *
   * So: highlight inside the editor sets it, collapsing inside the editor
   * clears it, and anything happening outside leaves it exactly as it was.
   */
  useEffect(() => {
    if (readOnly) return
    let frame = 0

    const sample = () => {
      const editor = editorRef.current
      if (!editor) return
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) return
      const inEditor = sel.anchorNode ? editor.contains(sel.anchorNode) : false
      if (!inEditor) return // focus is in the dock or the toolbar — keep the scope
      setAssistSelection(
        sel.isCollapsed ? null : selectionFromDom(editor, readAssistContent()),
      )
    }

    // Coalesced to one sample per frame: a drag-select fires `selectionchange`
    // on every mouse move, and each sample re-derives the markdown behind the
    // document to measure against.
    const onSel = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        sample()
      })
    }

    document.addEventListener('selectionchange', onSel)
    return () => {
      document.removeEventListener('selectionchange', onSel)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [readOnly, readAssistContent])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (readOnly) return
    const editor = editorRef.current
    if (!editor) return

    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault()
      void saveNow()
      return
    }

    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      insertLink()
      return
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      const leaf = getLeafBlock()
      const top = getTopBlock()
      const text = (leaf?.innerText || '').trim()
      if (text === '---' || text === '***') {
        e.preventDefault()
        const hr = document.createElement('hr')
        const p = makeP()
        ;(top || leaf)?.replaceWith(hr)
        hr.after(p)
        placeCursor(p)
        scheduleToc()
        setSaveState('dirty')
        return
      }
      if (/^```/.test(text)) {
        e.preventDefault()
        const lang = text.slice(3).trim() || 'javascript'
        const pre = document.createElement('pre')
        const code = document.createElement('code')
        code.className = `language-${lang}`
        code.textContent = ''
        pre.appendChild(code)
        const p = makeP()
        ;(top || leaf)?.replaceWith(pre)
        pre.after(p)
        placeCursor(code)
        setSaveState('dirty')
        return
      }
      if (leaf?.tagName === 'LI') {
        e.preventDefault()
        if (!leaf.innerText.trim()) {
          const ul = leaf.parentElement!
          const p = makeP()
          ;(getTopBlock() || ul).after(p)
          leaf.remove()
          if (!ul.children.length) ul.remove()
          placeCursor(p)
        } else {
          const li = document.createElement('li')
          li.innerHTML = '<br>'
          leaf.after(li)
          placeCursor(li)
        }
        setSaveState('dirty')
        return
      }
      if (leaf && ['H1', 'H2', 'H3', 'H4'].includes(leaf.tagName)) {
        e.preventDefault()
        const p = makeP()
        top!.after(p)
        placeCursor(p)
        scheduleToc()
        setSaveState('dirty')
      }
    }

    if (e.key === ' ') {
      const leaf = getLeafBlock()
      if (!leaf || !isAtStart(leaf)) return
      const text = (leaf.innerText || '').replace(/\u00a0/g, ' ').trim()
      const map: Record<string, string> = { '#': 'h1', '##': 'h2', '###': 'h3', '-': 'ul', '*': 'ul', '+': 'ul', '>': 'blockquote' }
      if (map[text]) {
        e.preventDefault()
        setBlockType(map[text])
        return
      }
      if (/^\d+\.$/.test(text)) {
        e.preventDefault()
        setBlockType('ol')
      }
    }

    if (e.key === 'Backspace') {
      const leaf = getLeafBlock()
      if (!leaf) return
      if (['H1', 'H2', 'H3', 'H4', 'BLOCKQUOTE'].includes(leaf.tagName) && isAtStart(leaf) && !leaf.innerText.trim()) {
        e.preventDefault()
        const p = makeP()
        ;(getTopBlock() || leaf).replaceWith(p)
        placeCursor(p)
        scheduleToc()
        setSaveState('dirty')
      }
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      document.execCommand('insertText', false, '  ')
      setSaveState('dirty')
    }
  }, [getLeafBlock, getTopBlock, insertLink, isAtStart, placeCursor, readOnly, saveNow, scheduleToc, setBlockType])

  const handleEditorClick = useCallback((e: React.MouseEvent) => {
    const anchor = (e.target as HTMLElement).closest('a')
    const href = anchor?.getAttribute('href')
    if (!anchor || !href || href === '#') return
    e.preventDefault()
    window.open(anchor.href, '_blank', 'noopener,noreferrer')
  }, [])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    if (readOnly) return
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    if (!text) return
    if (/[#*`\-\[\]!]/.test(text) || text.includes('\n\n')) {
      insertMarkdownAtCursor(text)
    } else {
      document.execCommand('insertText', false, text)
      scheduleToc()
      setSaveState('dirty')
    }
  }, [insertMarkdownAtCursor, readOnly, scheduleToc])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return
    const onInput = () => {
      if (!readOnly) setSaveState('dirty')
      scheduleToc()
      if (canSave && !readOnly) {
        if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
        autosaveTimerRef.current = setTimeout(() => void saveNow(true), 2000)
      }
    }
    const onCheckbox = (e: Event) => {
      if ((e.target as HTMLElement).matches('input[type="checkbox"]') && !readOnly) {
        setSaveState('dirty')
      }
    }
    editor.addEventListener('input', onInput)
    editor.addEventListener('change', onCheckbox)
    return () => {
      editor.removeEventListener('input', onInput)
      editor.removeEventListener('change', onCheckbox)
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    }
  }, [canSave, readOnly, saveNow, scheduleToc])

  useEffect(() => {
    if (readOnly) return

    const hide = () => {
      floatTbRef.current?.classList.remove('dce-ftb-visible')
    }

    // Positions the popup relative to `.dce-stage` — the actual `position: relative`
    // ancestor `.dce-ftb` resolves its `position: absolute` against. The previous
    // implementation measured against the outer `.dce-root` instead, so the popup
    // landed in the wrong spot (off by the toolbar header height, further off after
    // scrolling, and worse still with the fullscreen TOC sidebar's extra width) —
    // exactly the "hard to reliably click" bug being fixed here.
    const reposition = () => {
      const sel = window.getSelection()
      const ftb = floatTbRef.current
      const ed = editorRef.current
      const stage = stageRef.current
      if (!ftb || !ed || !stage) return false
      if (!sel || sel.isCollapsed || !ed.contains(sel.anchorNode) || !sel.toString().trim()) {
        hide()
        return false
      }

      const r = sel.getRangeAt(0).getBoundingClientRect()
      const stageRect = stage.getBoundingClientRect()
      // Toolbar is always laid out (opacity/visibility toggle, not display:none — see
      // CSS), so its real width is measurable even while hidden, giving an accurate
      // clamp instead of the previous fixed 60px guess that clipped a much wider bar.
      const halfWidth = Math.max(60, ftb.offsetWidth / 2)
      const top = Math.max(6, r.top - stageRect.top - ftb.offsetHeight - 12)
      const rawLeft = r.left - stageRect.left + r.width / 2
      const left = Math.min(Math.max(halfWidth, rawLeft), stageRect.width - halfWidth)

      ftb.style.top = `${top}px`
      ftb.style.left = `${left}px`
      ftb.classList.add('dce-ftb-visible')
      updateFtbState()
      return true
    }

    const onSel = () => reposition()
    const onViewportChange = () => {
      if (floatTbRef.current?.classList.contains('dce-ftb-visible')) reposition()
    }

    const scrollEl = scrollRef.current
    document.addEventListener('selectionchange', onSel)
    window.addEventListener('resize', onViewportChange)
    scrollEl?.addEventListener('scroll', onViewportChange, { passive: true })
    return () => {
      document.removeEventListener('selectionchange', onSel)
      window.removeEventListener('resize', onViewportChange)
      scrollEl?.removeEventListener('scroll', onViewportChange)
    }
  }, [readOnly, updateFtbState])

  useEffect(() => {
    const root = editorRef.current
    const scrollRoot = scrollRef.current
    if (!root || !scrollRoot || !toc.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]?.target.id) setActiveId(visible[0].target.id)
      },
      { root: scrollRoot, rootMargin: '-8% 0px -70% 0px', threshold: 0 },
    )
    toc.forEach(({ id }) => {
      const node = root.querySelector(`#${CSS.escape(id)}`)
      if (node) observer.observe(node)
    })
    return () => observer.disconnect()
  }, [toc])

  const scrollToHeading = (id: string) => {
    editorRef.current?.querySelector(`#${CSS.escape(id)}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveId(id)
  }

  /**
   * Put the document on the clipboard as markdown source, for pasting into
   * something else — a PR description, an issue, a chat message. Deliberately
   * the raw markdown rather than rich text: the places people paste documents
   * into mostly speak markdown, and a rich-text copy loses the syntax there.
   */
  const handleCopyMarkdown = useCallback(async () => {
    const md = htmlToMarkdown(getEditorHtml())
    try {
      await navigator.clipboard.writeText(md)
      setCopiedMarkdown(true)
      window.setTimeout(() => setCopiedMarkdown(false), 1800)
      toast.success('Markdown copied')
      setExportMenuOpen(false)
    } catch {
      toast.error('Could not copy — your browser blocked clipboard access.')
    }
  }, [getEditorHtml])

  const handleDownloadMarkdown = useCallback(() => {
    const md = htmlToMarkdown(getEditorHtml())
    downloadTextFile(md, `${sanitizeFilename(title)}.md`)
    setExportMenuOpen(false)
    toast.success('Markdown file downloaded')
  }, [getEditorHtml, title])

  // Whether this document already has a public page. A failure here leaves the
  // control unpublished rather than blocking the editor — publishing is
  // optional to everything else the editor does.
  useEffect(() => {
    if (!canPublish || !workspaceId || !assetId) {
      setPublishState(null)
      return
    }
    let cancelled = false
    getPublishState(workspaceId, assetId)
      .then((state) => {
        if (!cancelled) setPublishState(state)
      })
      .catch(() => {
        if (!cancelled) setPublishState(null)
      })
    return () => {
      cancelled = true
    }
  }, [canPublish, workspaceId, assetId])

  const handleExportPdf = useCallback(() => {
    setExportMenuOpen(false)
    setIsPrinting(true)
    void downloadPdfDocument(getEditorHtml(), title, isDarkMode)
      .then(() => toast.success('PDF downloaded'))
      .catch((error) => {
        console.error('PDF export failed:', error)
        toast.error('Could not export PDF')
      })
      .finally(() => setIsPrinting(false))
  }, [getEditorHtml, isDarkMode, title])

  const handleExportDocx = useCallback(async () => {
    setExportMenuOpen(false)
    setIsExportingDocx(true)
    try {
      await downloadDocxDocument(getEditorHtml(), title)
      toast.success('DOCX file downloaded')
    } catch (error) {
      console.error('DOCX export failed:', error)
      toast.error('Could not export DOCX')
    } finally {
      setIsExportingDocx(false)
    }
  }, [getEditorHtml, title])

  useEffect(() => {
    if (!exportMenuOpen) return
    const onDoc = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [exportMenuOpen])

  const saveLabel =
    saveState === 'saving' ? 'Saving…' :
    saveState === 'saved' ? 'Saved' :
    saveState === 'dirty' ? 'Unsaved' :
    saveState === 'error' ? 'Save failed' :
    readOnly ? 'View only' : ''

  return (
    <div
      ref={rootRef}
      className={`dce-root ${isDarkMode ? 'dce-dark' : ''} ${isFullscreen ? 'dce-fullscreen' : ''} ${className}`.trim()}
      role="document"
      aria-label={title}
    >
      <style dangerouslySetInnerHTML={{ __html: EDITOR_STYLES }} />

      <RivineAssistDock
        workspaceId={workspaceId}
        assetId={assetId}
        kind="markdown"
        getContent={readAssistContent}
        onApply={applyAssistedContent}
        disabled={readOnly}
        selection={assistSelection}
        onClearSelection={() => setAssistSelection(null)}
      />

      {canPublish && workspaceId && assetId && (
        <PublishDialog
          open={publishOpen}
          onClose={() => setPublishOpen(false)}
          workspaceId={workspaceId}
          assetId={assetId}
          title={title}
          kind="markdown"
          state={publishState}
          onStateChange={setPublishState}
        />
      )}

      <header className="dce-toolbar">
        <div className="dce-toolbar-title" title={title}>
          <span className="inline-flex items-center gap-1.5 min-w-0">
            <FileText className="w-3.5 h-3.5 flex-shrink-0 opacity-60" aria-hidden />
            <span className="truncate">{title}</span>
          </span>
        </div>
        <span className="dce-toolbar-meta" aria-live="polite">
          {wordCount.toLocaleString()} words
        </span>
        {saveLabel && (
          <span className="dce-save-label hidden sm:inline" aria-live="polite">
            {saveLabel}
          </span>
        )}
        <div className="dce-toolbar-actions">
          {canSave && (
            <button
              type="button"
              className="dce-btn dce-btn-primary"
              disabled={saveState === 'saving'}
              onClick={() => void saveNow()}
              aria-label="Save document to asset"
            >
              {saveState === 'saving' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Save</span>
            </button>
          )}
          {/* Never gated on the publish-state fetch: gating it made the button
              appear while that request was in flight and vanish when it
              resolved. When publishing is not configured the dialog says so. */}
          {canPublish && (
            <button
              type="button"
              className="dce-btn"
              onClick={() => setPublishOpen(true)}
              title={
                publishState?.published
                  ? 'This document is public — manage or take it down'
                  : 'Publish this document for public access'
              }
              aria-label={publishState?.published ? 'Manage public page' : 'Publish for public access'}
            >
              <Globe className="w-3.5 h-3.5" aria-hidden />
              <span className="hidden sm:inline">{publishState?.published ? 'Published' : 'Publish'}</span>
            </button>
          )}

          <div className="dce-export-wrap" ref={exportMenuRef}>
            <button
              type="button"
              className="dce-btn"
              onClick={() => setExportMenuOpen((v) => !v)}
              aria-expanded={exportMenuOpen}
              aria-haspopup="menu"
              title="Export options"
            >
              <Download className="w-3.5 h-3.5" aria-hidden />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className={`w-3 h-3 flex-shrink-0 text-gray-400 transition-transform duration-200 ${exportMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {exportMenuOpen && (
              <div className="dce-export-menu" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className="dce-export-item"
                  onClick={() => void handleCopyMarkdown()}
                >
                  {copiedMarkdown ? (
                    <Check className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" aria-hidden />
                  ) : (
                    <ClipboardCopy className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
                  )}
                  Copy in Markdown
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="dce-export-item"
                  onClick={handleDownloadMarkdown}
                >
                  <FileType className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
                  Markdown File
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="dce-export-item"
                  disabled={isPrinting}
                  onClick={handleExportPdf}
                >
                  {isPrinting ? (
                    <Loader2 className="w-3.5 h-3.5 flex-shrink-0 animate-spin" aria-hidden />
                  ) : (
                    <Printer className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
                  )}
                  PDF
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="dce-export-item"
                  disabled={isExportingDocx}
                  onClick={() => void handleExportDocx()}
                >
                  {isExportingDocx ? (
                    <Loader2 className="w-3.5 h-3.5 flex-shrink-0 animate-spin" aria-hidden />
                  ) : (
                    <FileText className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
                  )}
                  DOCX
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="dce-body">
        {toc.length > 0 && isFullscreen && (
          <nav className="dce-toc" aria-label="Table of contents">
            <div className="dce-toc-label">Contents</div>
            {toc.map((entry) => (
              <button
                key={entry.id}
                type="button"
                data-level={entry.level}
                className={`dce-toc-link${activeId === entry.id ? ' dce-toc-active' : ''}`}
                onClick={() => scrollToHeading(entry.id)}
              >
                <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5 opacity-50" aria-hidden />
                <span className="line-clamp-2">{entry.text}</span>
              </button>
            ))}
          </nav>
        )}

        <div ref={scrollRef} className="dce-scroll">
          <article className="dce-stage" ref={stageRef}>
            <div
              ref={editorRef}
              className="dce-editor"
              contentEditable={!readOnly}
              suppressContentEditableWarning
              spellCheck={!readOnly}
              role="textbox"
              aria-multiline="true"
              aria-readonly={readOnly}
              aria-label={readOnly ? `Preview of ${title}` : `Edit ${title}`}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onClick={handleEditorClick}
            />

            {!readOnly && (
              <div className="dce-ftb" ref={floatTbRef} onMouseDown={(e) => e.preventDefault()} role="toolbar" aria-label="Formatting">
                <button type="button" className="dce-fbtn" data-cmd="bold" onClick={() => execCmd('bold')}><b>B</b></button>
                <button type="button" className="dce-fbtn" data-cmd="italic" onClick={() => execCmd('italic')}><i>I</i></button>
                <button type="button" className="dce-fbtn" data-cmd="underline" onClick={() => execCmd('underline')} style={{ textDecoration: 'underline' }}>U</button>
                <div className="dce-fdiv" />
                <button type="button" className="dce-fbtn" onClick={() => {
                  const t = window.getSelection()?.toString() || ''
                  if (t) document.execCommand('insertHTML', false, `<code>${t.replace(/</g, '&lt;')}</code>`)
                  setSaveState('dirty')
                }}>{'`'}</button>
                <div className="dce-fdiv" />
                <button type="button" className="dce-fbtn" title="Bullet list" aria-label="Bullet list" onClick={() => toggleList(false)}>•</button>
                <button type="button" className="dce-fbtn" title="Numbered list" aria-label="Numbered list" onClick={() => toggleList(true)}>1.</button>
                <button type="button" className="dce-fbtn" title="Insert link (⌘K)" aria-label="Insert link" onClick={insertLink}>Link</button>
                <div className="dce-fdiv" />
                <button type="button" className="dce-fbtn" onClick={() => setBlockType('h1')}>H1</button>
                <button type="button" className="dce-fbtn" onClick={() => setBlockType('h2')}>H2</button>
                <button type="button" className="dce-fbtn" onClick={() => setBlockType('p')}>¶</button>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  )
}

export default DocumentEditor
