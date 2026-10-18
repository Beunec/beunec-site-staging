/**
 * PreviewPanel.tsx
 *
 * Right-side multi-tab workspace panel (desktop) / full-screen sheet (mobile).
 * Assets is always in the header; Attachments / Preview / HTML / Share / Code
 * appear only when active, when a snapshot is selected, or when an engine
 * deliverable is available. Live sandbox preview lives inside Rivine Code only.
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, FolderOpen, Paperclip, Eye, FileText, Database, Code,
  ImageIcon, Download, Trash2, Loader2, Edit3, Maximize2, Minimize2, UserPlus, FileCode2,
  Sparkles, Lock,
} from 'lucide-react'
import toast from 'react-hot-toast'
import * as assetsApi from '../../lib/assetsApi'
import { getCachedAssets, setCachedAssets } from '../../lib/assetsCache'
import * as sandboxApi from '../../lib/sandboxApi'
import type { Asset } from './ChatSpace'
import { SharePanelContent } from '../ShareModal'
import { DocumentEditor } from './documenteditor'
import { isMarkdownPreview } from './documentEditor.utils'
import { HtmlEditorPreview } from './htmleditor/preview'
import { isHtmlPreview, isHtmlFilename, isHtmlContent } from './htmleditor/htmlEditor.utils'
import { isReadOnlyGuest, normalizePermission } from '../../lib/workspacePermissions'
import { CodeWorkspace } from './codeworkspace/CodeWorkspace'
import { ProjectSource } from '../../lib/projectSource'
import { BinaryAssetPreview } from './BinaryAssetPreview'
import { SourceAssetEditor } from './SourceAssetEditor'
import { PanelSkeleton } from '@/components/aselius-workspace/WorkspaceSkeleton'
import dynamic from 'next/dynamic'
// Ensure Excalidraw package styles load with the Preview panel chunk
// (official Next.js requirement — without this, tool icons render giant/unstyled).
import '@excalidraw/excalidraw/index.css'
import McpAppFrame from './McpAppFrame'

const ExcalidrawArtifactView = dynamic(
  () => import('./ExcalidrawArtifact').then((m) => m.ExcalidrawArtifact),
  { ssr: false },
)

const MermaidArtifactView = dynamic(
  () => import('./MermaidArtifact').then((m) => m.MermaidArtifact),
  { ssr: false },
)

function isExcalidrawAssetHint(asset: Asset, content?: string | null): boolean {
  if (asset.language === 'excalidraw' || asset.format === 'excalidraw') return true
  const name = (asset.name || '').toLowerCase()
  if (name.includes('.excalidraw') || name.endsWith('.excalidraw.json')) return true
  if (!content) return false
  const trimmed = content.trim()
  if (!trimmed.startsWith('{')) return false
  try {
    const parsed = JSON.parse(trimmed) as { skeleton?: unknown; elements?: unknown }
    return Array.isArray(parsed?.skeleton) || Array.isArray(parsed?.elements)
  } catch {
    return false
  }
}

function binaryKindForAsset(asset: Asset): 'pdf' | 'xlsx' | 'png' | 'pptx' | 'video' | 'audio' | null {
  const language = (asset.language || asset.format || '').toLowerCase()
  const name = (asset.name || '').toLowerCase()
  if (language === 'application/pdf' || language === 'pdf' || name.endsWith('.pdf')) return 'pdf'
  if (
    language === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    || language === 'xlsx'
    || name.endsWith('.xlsx')
  ) return 'xlsx'
  if (
    language === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    || language === 'pptx'
    || name.endsWith('.pptx')
  ) return 'pptx'
  if (language === 'image/png' || language === 'png' || name.endsWith('.png')) return 'png'
  // Rivine Creative's media (and raw Creative uploads): JPEG and GIF stills, MP4 video, MP3 audio.
  if (/^image\/(jpeg|gif|webp)$/.test(language) || /\.(jpe?g|gif|webp)$/.test(name)) return 'png'
  if (language.startsWith('video/') || /\.(mp4|mov|webm)$/.test(name)) return 'video'
  if (language.startsWith('audio/') || /\.(mp3|wav|m4a)$/.test(name)) return 'audio'
  return null
}

/** Diagnostic-only sibling of parseExcalidrawScene: why parsing failed, for
 * the "Fix with AI" error banner. Doesn't change parseExcalidrawScene's own
 * contract or call sites. */
function excalidrawParseError(content: string): string | null {
  const trimmed = (content || '').trim()
  if (!trimmed) return 'Excalidraw asset content is empty.'
  let parsed: { skeleton?: unknown; elements?: unknown }
  try {
    parsed = JSON.parse(trimmed)
  } catch (e) {
    return `Excalidraw scene is not valid JSON: ${e instanceof Error ? e.message : 'parse failed'}`
  }
  const skeleton = Array.isArray(parsed?.skeleton) ? parsed.skeleton : undefined
  const elements = Array.isArray(parsed?.elements) ? parsed.elements : undefined
  if ((!skeleton || skeleton.length === 0) && (!elements || elements.length === 0)) {
    return 'Excalidraw scene JSON has no non-empty "skeleton" or "elements" array.'
  }
  return null
}

function parseExcalidrawScene(content: string): {
  skeleton?: unknown[]
  elements?: unknown[]
  focus?: { targetIds: string[]; fitToViewport?: boolean; animate?: boolean } | null
} | null {
  try {
    const parsed = JSON.parse(content) as {
      skeleton?: unknown[]
      elements?: unknown[]
      focus?: { targetIds: string[]; fitToViewport?: boolean; animate?: boolean } | null
    }
    const skeleton = Array.isArray(parsed?.skeleton) ? parsed.skeleton : undefined
    // Treat empty elements as missing so we can fall back to skeleton
    // (editable autosave races used to wipe diagrams to elements: []).
    const elements =
      Array.isArray(parsed?.elements) && parsed.elements.length > 0
        ? parsed.elements
        : undefined
    if ((skeleton && skeleton.length > 0) || (elements && elements.length > 0)) {
      return { skeleton, elements, focus: parsed.focus ?? null }
    }
  } catch {
    /* ignore */
  }
  return null
}

function isMermaidAssetHint(asset: Asset, content?: string | null): boolean {
  if (asset.language === 'mermaid' || asset.format === 'mermaid') return true
  const name = (asset.name || '').toLowerCase()
  if (name.endsWith('.mmd') || name.includes('.mermaid') || name.endsWith('.mmd.json')) return true
  if (!content) return false
  const trimmed = content.trim()
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as { chart?: unknown }
      return typeof parsed?.chart === 'string' && parsed.chart.trim().length > 0
    } catch {
      return false
    }
  }
  // Raw mermaid DSL always opens with its diagram-type keyword as the very
  // first token. Anchor to the start (rather than scanning anywhere in the
  // first 120 chars) so prose that merely mentions one of these common
  // English words — "the pie chart below", "a user journey", "our timeline"
  // — isn't misdetected as a diagram (this previously misrouted plain
  // markdown deliverables into the Mermaid renderer).
  const head = trimmed.replace(/^-+/, '').toLowerCase()
  return /^(flowchart|graph\s|sequencediagram|classdiagram|statediagram|erdiagram|quadrantchart|gantt\b|pie\b|journey\b|mindmap\b|timeline\b)/.test(
    head,
  )
}

function parseMermaidChart(content: string): { chart: string; title?: string } | null {
  const trimmed = content.trim()
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as { chart?: string; title?: string }
      if (typeof parsed?.chart === 'string' && parsed.chart.trim()) {
        return { chart: parsed.chart, title: parsed.title }
      }
    } catch {
      return null
    }
  }
  if (trimmed) return { chart: trimmed }
  return null
}

type McpMediaPayload = {
  kind?: string
  connector_id?: string
  connector_label?: string
  images?: { src: string; mime?: string }[]
  embed_url?: string
  ui_resource_uri?: string
  resource_uris?: string[]
  summary?: string
  title?: string
  channel?: string
  video_id?: string
  watch_url?: string
  thumbnail_url?: string
}

function parseMcpMediaPayload(asset: Asset, content?: string | null): McpMediaPayload | null {
  const lang = (asset.language || asset.format || '').toLowerCase()
  const name = (asset.name || '').toLowerCase()
  const looksMedia =
    lang === 'mcp_image' ||
    lang === 'mcp_embed' ||
    lang === 'mcp_app' ||
    lang === 'youtube' ||
    lang === 'image' ||
    lang === 'iframe' ||
    name.includes('.mcp-image') ||
    name.includes('.mcp-embed') ||
    name.includes('.mcp-app') ||
    name.includes('.youtube.json')
  if (!content?.trim().startsWith('{')) return looksMedia ? { kind: lang || 'file', summary: content || '' } : null
  try {
    const parsed = JSON.parse(content) as McpMediaPayload
    if (
      parsed?.kind === 'image' ||
      parsed?.kind === 'iframe' ||
      parsed?.kind === 'mcp_app' ||
      parsed?.kind === 'youtube' ||
      Array.isArray(parsed?.images) ||
      typeof parsed?.embed_url === 'string'
    ) {
      return parsed
    }
    if (looksMedia) return parsed
  } catch {
    /* ignore */
  }
  return null
}

/** A YouTube id, or null. Ids are `[A-Za-z0-9_-]`, so anything else is junk. */
function youtubeVideoId(value: unknown): string | null {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw) return null

  const clean = (id: string) => {
    const safe = id.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32)
    return safe.length >= 6 ? safe : null
  }

  // A bare id, already.
  if (/^[A-Za-z0-9_-]{6,32}$/.test(raw)) return clean(raw)

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  // http(s) only: an embed src is an iframe target, and a `javascript:` or
  // `data:` URL there would be a script-execution hole, not a video.
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  if (!/(^|\.)youtube\.com$|(^|\.)youtube-nocookie\.com$|(^|\.)youtu\.be$/.test(url.hostname)) {
    return null
  }

  if (url.hostname.endsWith('youtu.be')) return clean(url.pathname.slice(1))
  const v = url.searchParams.get('v')
  if (v) return clean(v)
  const path = url.pathname.split('/').filter(Boolean)
  // /embed/ID and /shorts/ID both put the id straight after the segment.
  if (path.length >= 2 && (path[0] === 'embed' || path[0] === 'shorts' || path[0] === 'v')) {
    return clean(path[1])
  }
  return null
}

/**
 * The iframe src for a YouTube payload.
 *
 * Every YouTube URL shape is reduced to a video id and rebuilt as an embed
 * URL, rather than the previous approach of accepting only a string that was
 * already `/embed/`. The connector does emit that form today, so this changes
 * nothing for it — but anything else (a watch link a model pasted, a
 * `youtu.be` share link, a Short) previously returned null and the panel
 * rendered no player at all, with nothing on screen to say why.
 *
 * Rebuilding also means the host is ours to choose, so a hostile `embed_url`
 * cannot point the iframe somewhere else.
 */
function youtubeEmbedSrc(payload: McpMediaPayload): string | null {
  const id = youtubeVideoId(payload.embed_url) ?? youtubeVideoId(payload.video_id)
  if (!id) return null
  return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type PreviewPanelTab = 'assets' | 'attachments' | 'preview' | 'html' | 'share' | 'code'

export interface ActiveSandbox {
  url: string
  fragmentType: string
  sandboxId: string | null
  expired: boolean
}

export interface ChatAttachment {
  type: 'file' | 'text'
  name?: string
  content?: string
  file?: File
  assetId?: string
  markdownPreview?: string
  sourceUrl?: string
  parserEngine?: string
  /** A raw image or video uploaded for Rivine Creative (not parsed to markdown). */
  mediaKind?: 'image' | 'video'
}

export type PreviewSelection =
  | { kind: 'attachment'; index: number }
  | { kind: 'asset'; asset: Asset }
  | { kind: 'pasted'; content: string }
  | { kind: 'html'; content: string; title?: string; assetId?: string }
  | null

export interface PreviewPanelProps {
  isOpen: boolean
  onClose: () => void
  isMobile: boolean
  activeTab: PreviewPanelTab
  onTabChange: (tab: PreviewPanelTab) => void
  selection: PreviewSelection
  onSelect: (selection: PreviewSelection) => void
  workspaceId: string
  chatSpaceId: string
  chatSpaceTitle: string
  attachments: ChatAttachment[]
  removeAttachment: (index: number) => void
  startEditingAttachment: (index: number) => void
  setDeleteConfirmModal: (modal: { isOpen: boolean; asset: Asset | null }) => void
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
  showShareTab?: boolean
  workspaceName?: string
  workspaceUserRole?: string
  onSharesChanged?: () => void
  onAssetContentSaved?: (assetId: string, content: string) => void
  activeSandbox?: ActiveSandbox | null
  onSandboxExpired?: () => void
  /** A Live Preview (re)boot produced a new sandbox URL. */
  onSandboxBooted?: (sandbox: ActiveSandbox) => void
  /** True only when the mediator routed this turn to rivine_code. When set,
      the panel becomes the full Rivine Code workspace (files/editor/diff/live)
      instead of the standard preview tabs. No other engine can set this. */
  codeSession?: boolean
  /** Files the Rivine Code engine is currently writing (editor locks these). */
  codeLockedPaths?: string[]
  /** Unified diffs for the current turn, so a change can be reviewed. */
  codeDiffs?: Array<{
    path: string; stat: string; patch: string
    added: number; removed: number
    isNew: boolean; isDelete: boolean; binary: boolean
  }>
  /** Bumps when the engine finishes writing a file (triggers live refresh). */
  codeLastWrite?: { path: string; tick: number } | null
  /** When set, show the Rivine Code workspace in ASSET mode for this durable
      code_project asset (opened from a snapshot card or the Assets list) —
      independent of any live sandbox. */
  openProjectAssetId?: string | null
  /** The current chat's live project asset id, so sandbox-mode edits also
      persist to the durable asset. */
  codeProjectAssetId?: string | null
  /** Called when a code_project asset is clicked in the Assets list — opens it
      in the code workspace instead of the raw JSON viewer. */
  onOpenProjectAsset?: (assetId: string) => void
  isDark?: boolean
  /** When true, the Assets tab shows a locked state (view/download/delete all
      blocked) instead of the asset list — driven by the workspace-wide
      credits lockdown (creditConfig.ts::isWorkspaceLocked). */
  assetsLocked?: boolean
  assetsLockedMessage?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatFileSize = (bytes: number | null | undefined) => {
  const n = typeof bytes === 'number' ? bytes : Number(bytes)
  if (!Number.isFinite(n) || n < 0) return '—'
  if (n === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(n) / Math.log(k)), sizes.length - 1)
  return `${parseFloat((n / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

const TYPE_LABELS: Record<string, string> = {
  document: 'document',
  code: 'code',
  image: 'image',
  data: 'data',
  other: 'other',
  code_project: 'code project',
}

const CREATOR_LABELS: Record<string, string> = {
  user: 'uploaded',
  ai: 'deliverable',
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'document': return FileText
    case 'code':
    case 'code_project': return Code
    case 'image': return ImageIcon
    case 'data': return Database
    default: return FileText
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'document': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50'
    case 'code':
    case 'code_project': return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/50'
    case 'image': return 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800/50'
    case 'data': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50'
    default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
  }
}

const ASSETS_TAB = { id: 'assets' as const, label: 'Assets', icon: FolderOpen }
const CODE_TAB = { id: 'code' as const, label: 'Code', icon: FileCode2 }
const ATTACHMENTS_TAB = { id: 'attachments' as const, label: 'Attachments', icon: Paperclip }
const PREVIEW_TAB = { id: 'preview' as const, label: 'Preview', icon: Eye }
const HTML_TAB = { id: 'html' as const, label: 'HTML', icon: FileCode2 }
const SHARE_TAB = { id: 'share' as const, label: 'Share', icon: UserPlus }

/** Assets always visible; other tabs only when active / has content / engine deliverable. */
function visiblePreviewTabs(opts: {
  activeTab: PreviewPanelTab
  attachments: ChatAttachment[]
  selection: PreviewSelection
  showShareTab: boolean
  codeAvailable?: boolean
}): { id: PreviewPanelTab; label: string; icon: React.ElementType }[] {
  const { activeTab, attachments, selection, showShareTab, codeAvailable } = opts
  const tabs: { id: PreviewPanelTab; label: string; icon: React.ElementType }[] = [ASSETS_TAB]

  if (codeAvailable || activeTab === 'code') {
    tabs.unshift(CODE_TAB)
  }
  if (attachments.length > 0 || activeTab === 'attachments') {
    tabs.push(ATTACHMENTS_TAB)
  }
  const htmlTarget = selectionTargetsHtmlTab(selection, attachments)
  if ((!htmlTarget && selection) || activeTab === 'preview') {
    tabs.push(PREVIEW_TAB)
  }
  if (htmlTarget || activeTab === 'html') {
    tabs.push(HTML_TAB)
  }
  if (showShareTab && activeTab === 'share') {
    tabs.push(SHARE_TAB)
  }
  return tabs
}

export function selectionTargetsHtmlTab(
  selection: PreviewSelection,
  attachments: ChatAttachment[],
): boolean {
  if (!selection) return false
  if (selection.kind === 'html') return true
  if (selection.kind === 'pasted') return isHtmlContent(selection.content)
  if (selection.kind === 'asset') {
    const asset = selection.asset
    return isHtmlPreview(
      asset.name,
      asset.format,
      asset.content || asset.current_content,
    )
  }
  if (selection.kind === 'attachment') {
    const att = attachments[selection.index]
    if (!att) return false
    if (isHtmlFilename(att.name || att.file?.name || '')) return true
    if (att.content && isHtmlContent(att.content)) return true
    return false
  }
  return false
}

export function tabForSelection(
  selection: PreviewSelection,
  attachments: ChatAttachment[],
): PreviewPanelTab {
  return selectionTargetsHtmlTab(selection, attachments) ? 'html' : 'preview'
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab bar
// ─────────────────────────────────────────────────────────────────────────────

const TabBar = ({
  tabs,
  activeTab,
  onTabChange,
  attachmentCount,
  compact,
  isFullscreen,
  onToggleFullscreen,
  onClose,
}: {
  tabs: { id: PreviewPanelTab; label: string; icon: React.ElementType }[]
  activeTab: PreviewPanelTab
  onTabChange: (tab: PreviewPanelTab) => void
  attachmentCount: number
  compact?: boolean
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
  onClose?: () => void
}) => (
  <div className="flex-shrink-0 flex items-stretch border-b border-gray-200 dark:border-gray-700 !bg-canvas dark:!bg-gray-900">
    {/* overflow-x-auto, not overflow-hidden: the tabs are whitespace-nowrap, so
        in a narrow panel the later ones were simply clipped and unreachable
        rather than scrollable. */}
    <div className="flex items-center gap-0 flex-1 min-w-0 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id
        const badge = id === 'attachments' && attachmentCount > 0 ? attachmentCount : null
        return (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={[
              'relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
              isActive
                ? 'border-[#00477d] text-[#00477d] dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
            ].join(' ')}
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            {!compact && <span>{label}</span>}
            {badge !== null && (
              <span className="ml-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#00477d] text-white text-[10px] font-bold flex items-center justify-center">
                {badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
    <div className="flex items-center gap-0.5 px-2 flex-shrink-0 border-l border-gray-200 dark:border-gray-700">
      {onToggleFullscreen && !compact && (
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="p-1.5 hover:bg-black/5 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500"
          title={isFullscreen ? 'Exit full screen' : 'Full screen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      )}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 hover:bg-black/5 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// Assets tab
// ─────────────────────────────────────────────────────────────────────────────

const AssetsTab = ({
  workspaceId,
  chatSpaceId,
  isActive,
  setDeleteConfirmModal,
  onSelectAsset,
  locked = false,
  lockedMessage,
}: {
  workspaceId: string
  chatSpaceId: string
  isActive: boolean
  setDeleteConfirmModal: (modal: { isOpen: boolean; asset: Asset | null }) => void
  onSelectAsset: (asset: Asset) => void
  locked?: boolean
  lockedMessage?: string
}) => {
  // Seed from the shared cache so opening the tab paints what ChatSpace has
  // already loaded, instead of spinning on a duplicate request for the same
  // data. `loading` is therefore only true on a genuine first load.
  const [assets, setAssets] = useState<Asset[]>(
    () => getCachedAssets<Asset>(chatSpaceId) ?? [],
  )
  const [loading, setLoading] = useState(!getCachedAssets<Asset>(chatSpaceId))
  const [filter, setFilter] = useState<'all' | 'user' | 'ai'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'document' | 'code' | 'image' | 'data' | 'other'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type' | 'creator'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const fetchAssets = useCallback(async () => {
    if (!workspaceId || !chatSpaceId || locked) return
    const cached = getCachedAssets<Asset>(chatSpaceId)
    if (cached) {
      // Show it now; still revalidate below so a deliverable created since the
      // last look appears without the user having to reopen the panel.
      setAssets(cached)
      setLoading(false)
    } else {
      setLoading(true)
    }
    try {
      const data = await assetsApi.getAssets(workspaceId, chatSpaceId)
      setCachedAssets<Asset>(chatSpaceId, data)
      setAssets(data)
    } catch {
      // Keep showing cached assets if we have them — a failed refresh is not a
      // reason to empty a panel the user is looking at.
      if (!cached) {
        setAssets([])
        toast.error('Failed to load assets.')
      }
    } finally {
      setLoading(false)
    }
  }, [workspaceId, chatSpaceId, locked])

  useEffect(() => {
    if (isActive && !locked) fetchAssets()
  }, [isActive, locked, fetchAssets])

  if (locked) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <Lock className="w-12 h-12 text-amber-500 mb-3" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Assets are locked</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
          {lockedMessage || 'Add credits to restore access.'}
        </p>
      </div>
    )
  }

  const handleDownload = async (asset: Asset) => {
    if (locked) {
      toast.error(lockedMessage || 'Assets are locked. Add credits to restore access.')
      return
    }
    try {
      // A code_project asset is a folder of files — download it as a zip with
      // exact paths/extensions preserved (not the raw JSON manifest).
      if (asset.type === 'code_project') {
        const src = new ProjectSource({ workspaceId, chatSpaceId, assetId: asset.id, hasLiveSandbox: false, fromAsset: true })
        const base = (asset.name || 'project').replace(/\.project\.json$/, '').replace(/[^\w.-]+/g, '-')
        await src.download(`${base || 'project'}.zip`)
        toast.success('Project downloaded')
        return
      }
      const blob = await assetsApi.downloadAsset(workspaceId, asset.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = asset.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(`Downloaded ${asset.name}`)
    } catch {
      toast.error('Failed to download asset')
    }
  }

  const filtered = assets
    .filter((a) => (filter === 'all' || a.creator === filter) && (typeFilter === 'all' || a.type === typeFilter))
    .sort((a, b) => {
      let c = 0
      switch (sortBy) {
        case 'date': c = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break
        case 'name': c = a.name.localeCompare(b.name); break
        case 'type': c = a.type.localeCompare(b.type); break
        case 'creator': c = a.creator.localeCompare(b.creator); break
      }
      return sortOrder === 'asc' ? c : -c
    })

  if (loading) {
    // A skeleton in the shape of the real list, not a centred spinner. It
    // reserves the same layout the assets will occupy, so nothing jumps when
    // they arrive, and it reads as "this is loading" rather than "this is
    // blank" — which matters most on the cold-start requests that take
    // seconds.
    return (
      <div className="flex flex-col h-full" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading assets…</span>
        {/* Mirrors the filter bar so the header does not shift into place */}
        <div className="flex-shrink-0 px-3 py-2 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-2 animate-pulse">
          <div className="h-6 w-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-6 w-24 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-6 w-16 rounded-lg bg-gray-100 dark:bg-gray-800" />
        </div>
        <div className="flex-1 overflow-hidden px-3 py-3 flex flex-col gap-2 animate-pulse">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-800 px-3 py-2.5"
            >
              <div className="h-9 w-9 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="h-3 rounded bg-gray-200 dark:bg-gray-700" style={{ width: `${70 - i * 6}%` }} />
                <div className="h-2.5 w-2/5 rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <FolderOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No assets yet</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Upload files in chat to build your asset library.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-3 py-2 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-2">
        <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-canvas dark:bg-gray-800 text-gray-700 dark:text-gray-200">
          <option value="all">All</option>
          <option value="user">User</option>
          <option value="ai">AI</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-canvas dark:bg-gray-800 text-gray-700 dark:text-gray-200">
          <option value="all">All types</option>
          <option value="document">Documents</option>
          <option value="code">Code</option>
          <option value="image">Images</option>
          <option value="data">Data</option>
        </select>
        <span className="text-xs text-gray-400 self-center ml-auto">{filtered.length} items</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.map((asset) => {
          const TypeIcon = getTypeIcon(asset.type)
          return (
            <div
              key={asset.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-canvas dark:bg-gray-800 hover:border-[#00477d]/40 transition-colors group"
            >
              <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${getTypeColor(asset.type)}`}>
                <TypeIcon className="w-4 h-4" />
              </div>
              <button
                type="button"
                onClick={() => onSelectAsset(asset)}
                className="flex-1 min-w-0 text-left"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{asset.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {formatFileSize(asset.size)} · {TYPE_LABELS[asset.type] || asset.type} · {CREATOR_LABELS[asset.creator] || asset.creator}
                </p>
              </button>
              {/* Always visible on touch devices. `group-hover` never fires
                  without a hover-capable pointer, so on a tablet/phone these
                  actions (Preview / Download / Delete) were unreachable —
                  a functional dead end, not just a styling nit. */}
              <div className="flex items-center gap-1 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity">
                <button type="button" onClick={() => onSelectAsset(asset)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Preview">
                  <Eye className="w-3.5 h-3.5 text-gray-500" />
                </button>
                <button type="button" onClick={() => handleDownload(asset)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Download">
                  <Download className="w-3.5 h-3.5 text-gray-500" />
                </button>
                <button type="button" onClick={() => setDeleteConfirmModal({ isOpen: true, asset })} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete">
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Attachments tab
// ─────────────────────────────────────────────────────────────────────────────

const AttachmentsTab = ({
  attachments,
  removeAttachment,
  startEditingAttachment,
  onSelectAttachment,
}: {
  attachments: ChatAttachment[]
  removeAttachment: (index: number) => void
  startEditingAttachment: (index: number) => void
  onSelectAttachment: (index: number) => void
}) => {
  if (attachments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <Paperclip className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No attachments</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Upload files or paste text in the chat input to attach them here.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      {attachments.map((att, idx) => {
        const isFile = att.type === 'file'
        const ext = att.name?.split('.').pop()?.toUpperCase() ?? 'MD'
        const size = att.file
          ? formatFileSize(att.file.size)
          : att.markdownPreview
            ? `${att.markdownPreview.length}+ chars`
            : `${att.content?.length ?? 0} chars`
        return (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-canvas dark:bg-gray-800 hover:border-[#00477d]/40 transition-colors group"
          >
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex-shrink-0">
              {isFile ? ext : 'TXT'}
            </span>
            <button type="button" onClick={() => onSelectAttachment(idx)} className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {isFile ? att.name : 'Pasted text'}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">{size}</p>
            </button>
            <div className="flex items-center gap-1">
              {!isFile && (
                <button type="button" onClick={() => startEditingAttachment(idx)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" title="Edit">
                  <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                </button>
              )}
              <button type="button" onClick={() => onSelectAttachment(idx)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Preview">
                <Eye className="w-3.5 h-3.5 text-gray-500" />
              </button>
              <button type="button" onClick={() => removeAttachment(idx)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Remove">
                <X className="w-3.5 h-3.5 text-red-500" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// Preview tab
// ─────────────────────────────────────────────────────────────────────────────

const PreviewTab = ({
  selection,
  attachments,
  workspaceId,
  isFullscreen = false,
  onAssetContentSaved,
  workspaceUserRole = 'owner',
  onOpenHtmlTab,
}: {
  selection: PreviewSelection
  attachments: ChatAttachment[]
  workspaceId: string
  isFullscreen?: boolean
  onAssetContentSaved?: (assetId: string, content: string) => void
  workspaceUserRole?: string
  onOpenHtmlTab?: () => void
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [textContent, setTextContent] = useState<string | null>(null)
  const [fixingAsset, setFixingAsset] = useState(false)

  const handleFixWithAi = useCallback(
    async (assetId: string, errorMessage: string) => {
      setFixingAsset(true)
      try {
        const updated = await assetsApi.fixAssetWithAI(workspaceId, assetId, errorMessage)
        const fixed = updated.content || updated.current_content
        if (typeof fixed === 'string' && fixed.trim()) {
          setTextContent(fixed)
          onAssetContentSaved?.(assetId, fixed)
          toast.success('Fixed with AI')
        } else {
          toast.error('AI fix did not return updated content')
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Fix with AI failed')
      } finally {
        setFixingAsset(false)
      }
    },
    [workspaceId, onAssetContentSaved],
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setImageUrl(null)
    setVideoUrl(null)
    setTextContent(null)
    if (!selection) return

    let revoked: string | null = null

    const load = async () => {
      if (selection.kind === 'pasted') {
        setTextContent(selection.content)
        return
      }

      if (selection.kind === 'attachment') {
        const att = attachments[selection.index]
        if (!att) return
        if (att.type === 'text') {
          setTextContent(att.content ?? '')
          return
        }
        // A raw Creative upload has no markdown: show the local file itself.
        if (att.mediaKind && att.file) {
          const url = URL.createObjectURL(att.file)
          revoked = url
          if (att.mediaKind === 'video') setVideoUrl(url)
          else setImageUrl(url)
          return
        }
        // Prefer parsed markdown asset over the original File (PDF/bytes as text breaks Preview).
        if (att.assetId && (att.markdownPreview || att.file)) {
          setLoading(true)
          try {
            const content = await assetsApi.getAssetContent(workspaceId, att.assetId)
            if (/^\s*%PDF-/i.test(content || '')) {
              setTextContent(null)
              toast.error('PDF was not converted to markdown — re-upload the file')
            } else {
              setTextContent(content)
            }
          } catch {
            if (att.markdownPreview && !/^\s*%PDF-/i.test(att.markdownPreview)) {
              setTextContent(att.markdownPreview)
            } else {
              setTextContent(null)
            }
          } finally {
            setLoading(false)
          }
          return
        }
        if (att.file) {
          if (att.file.type.startsWith('image/')) {
            const url = URL.createObjectURL(att.file)
            revoked = url
            setImageUrl(url)
          } else if (att.file.type.startsWith('text/') || att.name?.match(/\.(txt|md|json|js|ts|tsx|jsx|py|css|html|yaml|yml|csv)$/i)) {
            try {
              setTextContent(await att.file.text())
            } catch {
              setTextContent(null)
            }
          }
        }
        return
      }

      if (selection.kind === 'asset') {
        const asset = selection.asset
        if (binaryKindForAsset(asset)) {
          setLoading(false)
          return
        }
        setLoading(true)
        try {
          if (asset.type === 'image' || asset.format?.match(/^(png|jpg|jpeg|gif|webp|svg)$/i)) {
            const blob = await assetsApi.downloadAsset(workspaceId, asset.id)
            const url = URL.createObjectURL(blob)
            revoked = url
            setImageUrl(url)
          } else if (
            isExcalidrawAssetHint(asset) ||
            isMermaidAssetHint(asset) ||
            /\.excalidraw(\.json)?$/i.test(asset.name || '') ||
            /\.mmd$/i.test(asset.name || '')
          ) {
            // Always fetch the latest full body for diagram assets — list payloads
            // can be stale, and a bad editable autosave must be re-read from source.
            try {
              const content = await assetsApi.getAssetContent(workspaceId, asset.id)
              setTextContent(content || asset.content || asset.current_content || '')
            } catch {
              const fallback = asset.content || asset.current_content || ''
              if (fallback) setTextContent(fallback)
              else {
                const blob = await assetsApi.downloadAsset(workspaceId, asset.id)
                setTextContent(await blob.text())
              }
            }
          } else if (asset.content || asset.current_content) {
            const content = asset.content || asset.current_content || ''
            if (/^\s*%PDF-/i.test(content)) {
              toast.error('PDF was not converted to markdown — re-upload the file')
              setTextContent(null)
            } else {
              setTextContent(content)
            }
          } else {
            const blob = await assetsApi.downloadAsset(workspaceId, asset.id)
            const looksText =
              asset.format?.match(/^(txt|md|json|js|ts|tsx|jsx|py|css|html|yaml|yml|csv|youtube)$/i) ||
              (asset.language || '').match(/^(youtube|markdown|html|json|text)$/i) ||
              blob.type.startsWith('text/') ||
              blob.type.includes('json')
            if (looksText) {
              const content = await blob.text()
              if (/^\s*%PDF-/i.test(content)) {
                toast.error('PDF was not converted to markdown — re-upload the file')
                setTextContent(null)
              } else {
                setTextContent(content)
              }
            }
          }
        } catch {
          toast.error('Could not load preview')
        } finally {
          setLoading(false)
        }
      }
    }

    load()
    return () => { if (revoked) URL.revokeObjectURL(revoked) }
  }, [selection, attachments, workspaceId])

  if (!selection) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <Eye className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Nothing selected</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Choose an attachment or asset to preview it here.</p>
      </div>
    )
  }

  const title =
    selection.kind === 'pasted'
      ? 'Pasted text'
      : selection.kind === 'attachment'
      ? attachments[selection.index]?.type === 'file'
        ? attachments[selection.index]?.name ?? 'File'
        : 'Pasted text'
      : selection.kind === 'asset'
      ? selection.asset.name
      : selection.title ?? 'HTML Document'

  if (loading) {
    return <PanelSkeleton />
  }

  if (selection.kind === 'asset') {
    const binaryKind = binaryKindForAsset(selection.asset)
    if (binaryKind) {
      return (
        <BinaryAssetPreview
          workspaceId={workspaceId}
          assetId={selection.asset.id}
          filename={selection.asset.name}
          kind={binaryKind}
        />
      )
    }
  }

  const useDocumentEditor =
    textContent !== null &&
    !(selection.kind === 'asset' && isExcalidrawAssetHint(selection.asset, textContent)) &&
    !(selection.kind === 'asset' && isMermaidAssetHint(selection.asset, textContent)) &&
    isMarkdownPreview(
      title,
      selection.kind === 'asset' ? selection.asset.format : undefined,
      textContent,
    )

  const isHtmlDocument =
    textContent !== null &&
    isHtmlPreview(
      title,
      selection.kind === 'asset' ? selection.asset.format : undefined,
      textContent,
    )

  const isExcalidrawAsset =
    selection.kind === 'asset' &&
    textContent !== null &&
    isExcalidrawAssetHint(selection.asset, textContent)

  const excalidrawScene = isExcalidrawAsset ? parseExcalidrawScene(textContent!) : null

  const mermaidScene =
    selection.kind === 'asset' &&
    textContent !== null &&
    !isExcalidrawAsset &&
    isMermaidAssetHint(selection.asset, textContent)
      ? parseMermaidChart(textContent)
      : null

  const mcpMedia =
    selection.kind === 'asset' &&
    textContent !== null &&
    !isExcalidrawAsset &&
    !mermaidScene
      ? parseMcpMediaPayload(selection.asset, textContent)
      : null

  if (isExcalidrawAsset) {
    const assetId = selection.kind === 'asset' ? selection.asset.id : undefined
    const parseError = !excalidrawScene && textContent !== null ? excalidrawParseError(textContent) : null
    if (parseError) {
      return (
        <div className="flex flex-col h-full !bg-canvas dark:!bg-gray-900">
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-b border-gray-200/80 dark:border-gray-800 !bg-canvas dark:!bg-gray-900">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{title}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">
                Excalidraw diagram · error
              </p>
            </div>
            {assetId && (
              <button
                type="button"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-[#00477d] text-white hover:brightness-110 disabled:opacity-60 transition-colors flex-shrink-0"
                onClick={() => void handleFixWithAi(assetId, parseError)}
                disabled={fixingAsset}
                title="Ask AI to surgically fix the syntax error"
              >
                {fixingAsset ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {fixingAsset ? 'Fixing…' : 'Fix with AI'}
              </button>
            )}
          </div>
          <div className="flex-1 overflow-auto p-4 !bg-canvas dark:!bg-gray-900">
            <pre className="m-0 p-3 text-xs font-mono text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 rounded-xl overflow-auto whitespace-pre-wrap">
              {parseError}
            </pre>
          </div>
        </div>
      )
    }
    return (
      <div className="flex flex-col h-full !bg-canvas dark:!bg-gray-900">
        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200/80 dark:border-gray-800 !bg-canvas dark:!bg-gray-900">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{title}</p>
          <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">
            Excalidraw diagram · editable · click Update to save
          </p>
        </div>
        <div className="flex-1 min-h-0 p-3 !bg-canvas dark:!bg-gray-900">
          <ExcalidrawArtifactView
            skeleton={excalidrawScene?.skeleton}
            elements={excalidrawScene?.elements}
            focus={excalidrawScene?.focus}
            title={title}
            height={isFullscreen ? 860 : 680}
            editable={!isReadOnlyGuest(normalizePermission(workspaceUserRole))}
            workspaceId={workspaceId}
            assetId={assetId}
            onSaved={(content) => {
              if (assetId) onAssetContentSaved?.(assetId, content)
            }}
          />
        </div>
      </div>
    )
  }

  if (mermaidScene) {
    return (
      <div className="flex flex-col h-full !bg-canvas dark:!bg-gray-900">
        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200/80 dark:border-gray-800 !bg-canvas dark:!bg-gray-900">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {mermaidScene.title || title}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">
            Mermaid diagram · read-only
          </p>
        </div>
        <div className="flex-1 min-h-0 p-3 !bg-canvas dark:!bg-gray-900">
          <MermaidArtifactView
            chart={mermaidScene.chart}
            title={mermaidScene.title || title}
            workspaceId={workspaceId}
            assetId={selection.kind === 'asset' ? selection.asset.id : undefined}
            onFixed={(newContent) => {
              setTextContent(newContent)
              if (selection.kind === 'asset') onAssetContentSaved?.(selection.asset.id, newContent)
            }}
          />
        </div>
      </div>
    )
  }

  if (mcpMedia) {
    const images = mcpMedia.images || []
    // An MCP App: the connector authored a `ui://` view. Render it rather than
    // listing the resource URI as a link the user cannot open — `ui://` is not
    // a browser scheme, so the old fallback showed nothing usable at all.
    if (
      mcpMedia.kind === 'mcp_app' &&
      mcpMedia.ui_resource_uri &&
      mcpMedia.connector_id &&
      workspaceId
    ) {
      return (
        <div className="flex flex-col h-full p-3 !bg-canvas dark:!bg-gray-900">
          <McpAppFrame
            workspaceId={workspaceId}
            connectorId={mcpMedia.connector_id}
            connectorLabel={mcpMedia.connector_label || title}
            resourceUri={mcpMedia.ui_resource_uri}
            title={mcpMedia.title || title}
            variant="full"
          />
        </div>
      )
    }
    const isYouTube = mcpMedia.kind === 'youtube' || !!(selection?.kind === 'asset' && (selection.asset.language || '').toLowerCase() === 'youtube')
    const ytEmbed = isYouTube ? youtubeEmbedSrc(mcpMedia) : null
    const embed = ytEmbed || mcpMedia.embed_url
    const httpsResources = (mcpMedia.resource_uris || []).filter((u) => u.startsWith('https://'))
    return (
      <div className="flex flex-col h-full !bg-canvas dark:!bg-gray-900">
        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200/80 dark:border-gray-800 !bg-canvas dark:!bg-gray-900">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {mcpMedia.title || title}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">
            {isYouTube
              ? `YouTube${mcpMedia.channel ? ` · ${mcpMedia.channel}` : ''} · autoplay`
              : 'Connector artifact'}
          </p>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-3 !bg-canvas dark:!bg-gray-900">
          {images.map((img, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${img.src.slice(0, 24)}-${idx}`}
              src={img.src}
              alt={title}
              className="w-full max-h-[640px] object-contain rounded-xl border border-gray-200 dark:border-gray-700 !bg-canvas dark:!bg-gray-900"
            />
          ))}
          {embed && (
            <iframe
              title={mcpMedia.title || title}
              src={embed}
              className="w-full aspect-video min-h-[280px] rounded-xl border border-gray-200 dark:border-gray-700 !bg-black"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          )}
          {isYouTube && mcpMedia.watch_url && (
            <a
              href={mcpMedia.watch_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-sky-700 dark:text-sky-300 hover:underline break-all"
            >
              Open on YouTube
            </a>
          )}
          {httpsResources.map((uri) => (
            <a
              key={uri}
              href={uri}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-sky-700 dark:text-sky-300 hover:underline break-all"
            >
              {uri}
            </a>
          ))}
          {!images.length && !embed && mcpMedia.summary && (
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{mcpMedia.summary}</p>
          )}
        </div>
      </div>
    )
  }

  if (isHtmlDocument && textContent !== null) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <FileCode2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
          This file is HTML. Open it in the HTML tab for live preview and editing.
        </p>
        {onOpenHtmlTab && (
          <button
            type="button"
            onClick={onOpenHtmlTab}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#00477d] text-white hover:brightness-110 transition-colors"
          >
            Open HTML tab
          </button>
        )}
      </div>
    )
  }

  if (useDocumentEditor && textContent !== null) {
    const assetId =
      selection.kind === 'asset'
        ? selection.asset.id
        : selection.kind === 'attachment'
          ? attachments[selection.index]?.assetId
          : undefined

    return (
      <DocumentEditor
        markdown={textContent}
        title={title}
        isFullscreen={isFullscreen}
        className="!bg-canvas dark:!bg-gray-900"
        workspaceId={workspaceId}
        assetId={assetId}
        readOnly={!assetId || isReadOnlyGuest(normalizePermission(workspaceUserRole))}
        onSaved={(content) => {
          if (assetId) onAssetContentSaved?.(assetId, content)
        }}
      />
    )
  }

  // Everything else that is text: JSON, YAML, a source file, CSS, SQL, a CSV.
  // Markdown, HTML, Mermaid, Excalidraw and MCP media have all been taken by a
  // branch above, and binary assets never reach this component. What is left is
  // a file someone can read and reasonably want one line of changed — so it
  // gets a real editor and Rivine Assist rather than the read-only `<pre>` that
  // used to be the end of the line for it.
  if (textContent !== null && !imageUrl) {
    const assetId =
      selection.kind === 'asset'
        ? selection.asset.id
        : selection.kind === 'attachment'
          ? attachments[selection.index]?.assetId
          : undefined

    return (
      <SourceAssetEditor
        content={textContent}
        title={title}
        workspaceId={workspaceId}
        assetId={assetId}
        readOnly={!assetId || isReadOnlyGuest(normalizePermission(workspaceUserRole))}
        onSaved={(content) => {
          if (assetId) onAssetContentSaved?.(assetId, content)
        }}
      />
    )
  }

  return (
    <div className="flex flex-col h-full !bg-canvas dark:!bg-gray-900">
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200/80 dark:border-gray-800 !bg-canvas dark:!bg-gray-900">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{title}</p>
        <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">
          {selection.kind === 'pasted' ? 'Pasted from message' : selection.kind === 'attachment' ? 'Chat attachment' : 'Workspace asset'}
        </p>
      </div>
      <div className="flex-1 overflow-auto p-4 !bg-canvas dark:!bg-gray-900">
        {imageUrl && (
          <img src={imageUrl} alt={title} className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700" />
        )}
        {videoUrl && (
          <video src={videoUrl} controls playsInline className="max-w-full max-h-full rounded-lg border border-gray-200 dark:border-gray-700 bg-black" />
        )}
        {textContent !== null && (
          <pre className="text-xs leading-relaxed whitespace-pre-wrap break-words font-mono !bg-canvas dark:!bg-gray-800/80 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 max-h-full overflow-auto">
            {textContent}
          </pre>
        )}
        {!imageUrl && !videoUrl && textContent === null && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-10 h-10 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">Preview not available for this file type.</p>
            <p className="text-xs text-gray-400 mt-1">Download the file to view it locally.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML tab — live code editor + iframe preview
// ─────────────────────────────────────────────────────────────────────────────

const HtmlTab = ({
  selection,
  attachments,
  workspaceId,
  workspaceUserRole = 'owner',
  onAssetContentSaved,
}: {
  selection: PreviewSelection
  attachments: ChatAttachment[]
  workspaceId: string
  workspaceUserRole?: string
  onAssetContentSaved?: (assetId: string, content: string) => void
}) => {
  const [source, setSource] = useState('')
  const [title, setTitle] = useState('HTML Document')
  const [assetId, setAssetId] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selection) {
      setSource('')
      setTitle('HTML Document')
      setAssetId(undefined)
      return
    }

    let cancelled = false

    const load = async () => {
      if (selection.kind === 'html') {
        setSource(selection.content)
        setTitle(selection.title || 'HTML Document')
        setAssetId(selection.assetId)
        return
      }

      if (selection.kind === 'pasted' && isHtmlContent(selection.content)) {
        setSource(selection.content)
        setTitle('Pasted HTML')
        setAssetId(undefined)
        return
      }

      setLoading(true)
      try {
        if (selection.kind === 'attachment') {
          const att = attachments[selection.index]
          if (!att) return
          if (att.type === 'text' && att.content) {
            setSource(att.content)
            setTitle('Pasted HTML')
            setAssetId(undefined)
            return
          }
          if (att.assetId) {
            const content = await assetsApi.getAssetContent(workspaceId, att.assetId)
            if (cancelled) return
            setSource(content)
            setTitle(att.name || 'HTML Document')
            setAssetId(att.assetId)
            return
          }
          if (att.file) {
            const text = await att.file.text()
            if (cancelled) return
            setSource(text)
            setTitle(att.name || att.file.name || 'HTML Document')
            setAssetId(undefined)
          }
          return
        }

        if (selection.kind === 'asset') {
          const asset = selection.asset
          if (asset.content || asset.current_content) {
            setSource(asset.content || asset.current_content || '')
            setTitle(asset.name)
            setAssetId(asset.id)
            return
          }
          const blob = await assetsApi.downloadAsset(workspaceId, asset.id)
          const text = await blob.text()
          if (cancelled) return
          setSource(text)
          setTitle(asset.name)
          setAssetId(asset.id)
        }
      } catch {
        if (!cancelled) toast.error('Could not load HTML')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [selection, attachments, workspaceId])

  if (!selection) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <FileCode2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No HTML document</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Open an HTML asset or click an HTML snapshot in chat.
        </p>
      </div>
    )
  }

  if (loading) {
    return <PanelSkeleton />
  }

  return (
    <HtmlEditorPreview
      source={source}
      title={title}
      className="!bg-canvas dark:!bg-gray-900"
      workspaceId={workspaceId}
      assetId={assetId}
      readOnly={!assetId || isReadOnlyGuest(normalizePermission(workspaceUserRole))}
      initialView="preview"
      onSaved={(content) => {
        if (assetId) onAssetContentSaved?.(assetId, content)
      }}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel shell
// ─────────────────────────────────────────────────────────────────────────────

export const PreviewPanel = ({
  isOpen,
  onClose,
  isMobile,
  activeTab,
  onTabChange,
  selection,
  onSelect,
  workspaceId,
  chatSpaceId,
  chatSpaceTitle,
  attachments,
  removeAttachment,
  startEditingAttachment,
  setDeleteConfirmModal,
  isFullscreen = false,
  onToggleFullscreen,
  showShareTab = false,
  workspaceName = '',
  workspaceUserRole = 'owner',
  onSharesChanged,
  onAssetContentSaved,
  activeSandbox = null,
  onSandboxExpired,
  onSandboxBooted,
  codeSession = false,
  codeLockedPaths = [],
  codeDiffs = [],
  codeLastWrite = null,
  openProjectAssetId = null,
  codeProjectAssetId = null,
  onOpenProjectAsset,
  isDark = false,
  assetsLocked = false,
  assetsLockedMessage,
}: PreviewPanelProps) => {
  const tabs = React.useMemo(
    () =>
      visiblePreviewTabs({
        activeTab,
        attachments,
        selection,
        showShareTab,
        codeAvailable: codeSession || !!openProjectAssetId,
      }),
    [activeTab, attachments, selection, showShareTab, codeSession, openProjectAssetId],
  )

  const handleSelectAttachment = (index: number) => {
    const sel: PreviewSelection = { kind: 'attachment', index }
    onSelect(sel)
    onTabChange(tabForSelection(sel, attachments))
  }

  const handleSelectAsset = (asset: Asset) => {
    // A code_project asset opens the file-system workspace (deterministic:
    // asset.type, not filename), not the raw JSON viewer.
    if (asset.type === 'code_project' && onOpenProjectAsset) {
      onOpenProjectAsset(asset.id)
      return
    }
    const sel: PreviewSelection = { kind: 'asset', asset }
    onSelect(sel)
    onTabChange(tabForSelection(sel, attachments))
  }

  // The Rivine Code workspace is a real TAB ('code'), not an unconditional
  // body override — so clicking Assets/Attachments/Preview/etc. always shows
  // that tab's own content ("A triggers A, B triggers B"). The code tab is
  // only offered when a code session is live or a code_project asset was
  // explicitly opened; routing/opening auto-switches activeTab to 'code'.
  const showCodeWorkspace = activeTab === 'code' && (codeSession || !!openProjectAssetId)
  const panelContent = showCodeWorkspace ? (
    <div className="flex flex-col h-full !bg-canvas dark:!bg-gray-900">
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        attachmentCount={attachments.length}
        compact={isMobile}
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
        onClose={onClose}
      />
      {codeDiffs.length > 0 && (
        <div className="border-b border-black/10 dark:border-white/10 bg-white/60 dark:bg-gray-950/40 max-h-56 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 sticky top-0 bg-inherit">
            Changes this turn · {codeDiffs.length} file{codeDiffs.length === 1 ? '' : 's'}
          </div>
          {codeDiffs.map((d) => (
            <details key={d.path} className="border-t border-black/5 dark:border-white/5">
              <summary className="cursor-pointer px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2">
                <span className="truncate flex-1 font-mono">{d.path}</span>
                {d.added > 0 && <span className="text-emerald-600 dark:text-emerald-400">+{d.added}</span>}
                {d.removed > 0 && <span className="text-rose-600 dark:text-rose-400">-{d.removed}</span>}
                {d.isNew && <span className="text-[10px] text-gray-400">new</span>}
                {d.isDelete && <span className="text-[10px] text-gray-400">deleted</span>}
              </summary>
              {d.binary ? (
                <p className="px-3 py-2 text-[11px] text-gray-400">Binary file — no textual diff.</p>
              ) : (
                <pre className="px-3 py-2 text-[11px] leading-relaxed overflow-x-auto font-mono">
                  {d.patch.split('\n').map((line, i) => (
                    <div
                      key={i}
                      className={
                        line.startsWith('+') && !line.startsWith('+++')
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : line.startsWith('-') && !line.startsWith('---')
                            ? 'text-rose-700 dark:text-rose-400'
                            : line.startsWith('@@')
                              ? 'text-sky-600 dark:text-sky-400'
                              : 'text-gray-500 dark:text-gray-400'
                      }
                    >
                      {line || '\u00a0'}
                    </div>
                  ))}
                </pre>
              )}
            </details>
          ))}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        <CodeWorkspace
          workspaceId={workspaceId}
          chatSpaceId={chatSpaceId}
          activeSandbox={activeSandbox}
          assetId={openProjectAssetId ?? codeProjectAssetId ?? null}
          fromAsset={!!openProjectAssetId}
          lockedPaths={codeLockedPaths}
          lastWrite={codeLastWrite}
          sessionActive={codeSession}
          workspaceUserRole={workspaceUserRole}
          isDark={isDark}
          onSandboxExpired={onSandboxExpired}
          onSandboxBooted={onSandboxBooted}
        />
      </div>
    </div>
  ) : (
    <div className="flex flex-col h-full !bg-canvas dark:!bg-gray-900">
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        attachmentCount={attachments.length}
        compact={isMobile}
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
        onClose={onClose}
      />

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'assets' && (
          <AssetsTab
            workspaceId={workspaceId}
            chatSpaceId={chatSpaceId}
            isActive={isOpen}
            setDeleteConfirmModal={setDeleteConfirmModal}
            onSelectAsset={handleSelectAsset}
            locked={assetsLocked}
            lockedMessage={assetsLockedMessage}
          />
        )}
        {activeTab === 'attachments' && (
          <AttachmentsTab
            attachments={attachments}
            removeAttachment={removeAttachment}
            startEditingAttachment={startEditingAttachment}
            onSelectAttachment={handleSelectAttachment}
          />
        )}
        {activeTab === 'preview' && (
          <PreviewTab
            selection={selection}
            attachments={attachments}
            workspaceId={workspaceId}
            isFullscreen={isFullscreen}
            onAssetContentSaved={onAssetContentSaved}
            workspaceUserRole={workspaceUserRole}
            onOpenHtmlTab={() => onTabChange('html')}
          />
        )}
        {activeTab === 'html' && (
          <HtmlTab
            selection={selection}
            attachments={attachments}
            workspaceId={workspaceId}
            workspaceUserRole={workspaceUserRole}
            onAssetContentSaved={onAssetContentSaved}
          />
        )}
        {activeTab === 'share' && showShareTab && (
          <SharePanelContent
            workspaceId={workspaceId}
            workspaceName={workspaceName}
            currentUserRole={workspaceUserRole}
            isActive={isOpen && activeTab === 'share'}
            isMobile={isMobile}
            onSharesChanged={onSharesChanged}
          />
        )}
      </div>
    </div>
  )

  if (!isOpen) return null

  // Mobile: full-screen bottom sheet overlay
  if (isMobile) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 260 }}
            className="absolute inset-x-0 bottom-0 top-12 rounded-t-2xl overflow-hidden shadow-2xl border-t border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {panelContent}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Desktop: inline panel (parent controls width via flex)
  return panelContent
}

export default PreviewPanel
