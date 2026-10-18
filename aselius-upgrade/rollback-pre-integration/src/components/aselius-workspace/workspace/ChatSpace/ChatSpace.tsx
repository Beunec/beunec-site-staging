/**
 * ChatSpace.tsx  —  Main orchestrator
 *
 * Owns:
 *   • All exported types (Source, Tool, Model, Asset, MessageSource, etc.)
 *   • All state (messages, panels, streaming, HITL, assets…)
 *   • All handlers (sendMessage, HITL, export, file-upload, redeem…)
 *   • Root JSX that composes Header, InputArea, Panels, MessageComponents
 *
 * Relative path in repo:
 *   src/components/aselius-workspace/workspace/ChatSpace/ChatSpace.tsx
 */

'use client'

import React, {
  useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Loader2, Code, FileText, Brain, Zap, Globe,
  BookOpen, MessageSquare, Settings, Database,
  FolderOpen,
  Calendar, X, Maximize2, Minimize2, Plus, CheckCircle,
  Heart, TrendingUp, Video, Calculator, Palette, Paperclip,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { useStore } from '@/lib/store'
import { Bone, TaskspaceLoadingSkeleton } from '@/components/aselius-workspace/WorkspaceSkeleton'

// ── Store / auth ──────────────────────────────────────────────────────────────
import { useWorkspaceStore, ChatMessage, ActivityEntry } from '../../../../store/aselius/workspaceStore'
import { useAuthStore } from '../../../../store/aselius/authStore'
import { getMinimalUserProfile } from '@/utils/settingAPI'
import { minProfileQueryKey } from '@/lib/displayHandle'
import { getAseliusStreamUrl } from '@/lib/aseliusApiBase'
import { usePlanLimits } from '@/hooks/usePlanLimits'
import { formatTaskspaceTitle, TASKSPACE_SINGULAR } from '@/lib/taskspaceLabels'
import { TaskspaceEmptyState, type StarterPrompt } from './TaskspaceEmptyState'
import * as assetsApi from '../../lib/assetsApi'
import { readAseliusError } from '../../lib/aseliusError'
import { getCachedAssets, setCachedAssets } from '../../lib/assetsCache'
import {
  parseFileForWorkspace,
  parseUrlForWorkspace,
  saveParsedMarkdownAsAsset,
  MAX_CHAT_ATTACHMENTS,
  type WorkspaceParseResult,
} from '../../lib/workspaceParseApi'
import { creativeUploadRoute, uploadCreativeMedia } from '../../lib/creativeMediaApi'
import { snippetFromText } from './promptAttachments'
import { registerSeliusComposer } from '@/components/selius/composer'
import { stripMediatorOnlyTags } from './messageTags'
import {
  captureScreenshotAsFile,
  ScreenshotCancelledError,
  ScreenshotCaptureError,
} from '../../lib/screenshotCapture'
import { readClipboardForAttachment } from '../../lib/clipboardAttachments'
import { PopupModal, usePopupModal } from '../../ui/PopupModal'
import { Connector } from '../Connector'

// ── Split-file imports ────────────────────────────────────────────────────────
import {
  EnhancedMarkdownMessage,
  InlineApprovalCard,
} from './MessageComponents'

import { DeleteConfirmModal, ConfirmModal } from './Panels'
import PreviewPanel, { type PreviewPanelTab, type PreviewSelection, type ChatAttachment, tabForSelection } from './PreviewPanel'
import { buildMessagePrompt } from './promptAttachments'
import {
  isReadOnlyGuest,
  canManageChatSpaces,
  canShareWorkspace,
  normalizePermission,
} from '@/components/aselius-workspace/lib/workspacePermissions'
import { useWorkspacePresence } from '@/components/aselius-workspace/hooks/useWorkspacePresence'
import { useWorkspaceConnectors, updateWorkspaceConnector } from '@/components/aselius-workspace/hooks/useWorkspaceConnectors'
import {
  connectAppsDisableReason,
  isListedInConnectApps,
  loadEnabledConnectorIds,
  saveEnabledConnectorIds,
  fetchEnabledConnectorIds,
  persistEnabledConnectorIds,
} from '../../lib/taskforceConnectorSelection'
import { useTheme } from '@/components/aselius-workspace/ThemeContext'

import {
  ChatSpaceHeader, EnhancedChatInput, EnhancedToggleSwitch,
  defaultSources, defaultModels, defaultEngines, DEFAULT_ENGINE_ID, availableLanguages,
} from './InputArea'
import {
  buildEngineSpecialtyPrompt,
  specialtyUsesConnectedApps,
  TASKFORCE_ENGINE_ID,
  getEngineLabel,
  isSpecialtyRequired,
  isSpecialtySelectionComplete,
  resolveEngineSpecialty,
} from './engineSpecialties'
import { buildContextIdentityPrompt } from './contextIdentity'
import {
  canSelectEngine,
  formatCredits,
  getEngineMinCredits,
  isWorkspaceLocked,
  CREDITS_LOCKDOWN_MESSAGE,
} from '@/lib/creditConfig'
import { cancelTurn, getTurnStatus, type TurnStatus } from '../../lib/sandboxApi'
import {
  notifyWorkspaceDeliverableReady,
  notifyWorkspaceTurnDone,
  notifyWorkspaceTurnError,
} from '@/lib/workspaceNotificationHelpers'

// ─────────────────────────────────────────────────────────────────────────────
// Types (all exported so index.ts re-exports them)
// ─────────────────────────────────────────────────────────────────────────────

export interface Source {
  id: string
  name: string
  description: string
  icon: string
  color: string
  enabled: boolean
  isPaid?: boolean
  freeLimit?: number
  apiLimit?: string
  comingSoon?: boolean
  /** When set, Connect Apps row is listed but not toggleable. */
  disabledReason?: string
  category: 'web' | 'files' | 'context' | 'nutrition' | 'maps' | 'securities' | 'health' | 'diplomacy' | 'economics' | 'academia' | 'articles' | 'conversations' | 'sec' | 'connectors'
}

export interface Tool {
  id: string
  name: string
  description: string
  icon: string
  color: string
  enabled: boolean
  isPaid?: boolean
  plan?: string
  comingSoon?: boolean
}

export interface Model {
  id: string
  name: string
  description: string
  icon: string
  enabled: boolean
  isPaid: boolean
  version: string
  plan?: string
  comingSoon?: boolean
}

export interface Asset {
  id: string
  name: string
  type: 'document' | 'code' | 'image' | 'data' | 'other' | 'code_project'
  creator: 'user' | 'ai'
  created_at: string
  last_updated?: string
  size: number
  format: string
  description?: string
  tags?: string[]
  url?: string
  chatSpaceId: string
  content?: string
  filePath?: string
  current_content?: string
  language?: string
  sources?: MessageSource[]
}

const CODE_ASSET_LANGUAGES = new Set([
  'html', 'excalidraw', 'mermaid', 'javascript', 'typescript', 'python',
  'tsx', 'jsx', 'css', 'json', 'code_project',
])

function normalizeAssetType(
  rawType: unknown,
  language: string,
  name: string,
): Asset['type'] {
  const stored = String(rawType || '').toLowerCase()
  if (stored === 'code_project' || stored === 'image') return stored
  const lang = language.toLowerCase()
  const lowerName = name.toLowerCase()
  if (
    lang === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    || lang === 'xlsx'
    || lowerName.endsWith('.xlsx')
  ) {
    return 'data'
  }
  if (lang.startsWith('image/') || lowerName.match(/\.(png|jpe?g|gif|webp|svg)$/)) {
    return 'image'
  }
  if (
    CODE_ASSET_LANGUAGES.has(lang)
    || lowerName.endsWith('.html')
    || lowerName.endsWith('.htm')
    || lowerName.endsWith('.mmd')
    || lowerName.endsWith('.excalidraw.json')
  ) {
    return 'code'
  }
  if (
    lang === 'markdown' || lang === 'md' || lang === 'text' || lang === 'pdf' || lang === 'application/pdf'
    || lowerName.endsWith('.md') || lowerName.endsWith('.txt') || lowerName.endsWith('.pdf')
  ) {
    return 'document'
  }
  if (stored === 'document' || stored === 'code' || stored === 'data' || stored === 'other') {
    return stored
  }
  return 'document'
}

/** Normalize backend deliverable shapes (flat snap or `{fragment_snapshot}`) into UI cards. */
function normalizeDeliverableSnaps(
  raw: unknown,
): { assetId: string; filename?: string; kind?: string }[] {
  if (!Array.isArray(raw)) return []
  const out: { assetId: string; filename?: string; kind?: string }[] = []
  const seen = new Set<string>()
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const d = item as Record<string, any>
    const snap =
      d.fragment_snapshot && typeof d.fragment_snapshot === 'object'
        ? (d.fragment_snapshot as Record<string, any>)
        : d
    const assetId = snap.asset_id || d.asset_id || d.assetId
    if (!assetId) continue
    const id = String(assetId)
    if (seen.has(id)) continue
    seen.add(id)
    out.push({
      assetId: id,
      filename: snap.filename || d.filename,
      kind: snap.fragment_type || d.fragment_type || d.kind,
    })
  }
  return out
}

/**
 * Cards for the standalone snapshot fields on a turn payload.
 *
 * A turn carries its outputs in three additive places: `deliverables[]`, the
 * primary `fragment_snapshot`, and Research's `research_fragment_snapshot`
 * companion. Both live handlers previously read only `fragment_snapshot`, so a
 * Research turn's markdown lost its card in the thread even though the file was
 * saved — the user had to go to the Assets panel to find their own deliverable.
 * Ordering matters: the primary stays first so it remains merged[0], which is
 * what auto-opens in the preview panel.
 */
function snapshotCards(
  payload: { fragment_snapshot?: any; research_fragment_snapshot?: any; fragment_type?: string },
): { assetId: string; filename?: string; kind?: string }[] {
  const out: { assetId: string; filename?: string; kind?: string }[] = []
  const seen = new Set<string>()
  for (const snap of [payload?.fragment_snapshot, payload?.research_fragment_snapshot]) {
    const id = snap?.asset_id
    if (!id || seen.has(String(id))) continue
    seen.add(String(id))
    out.push({
      assetId: String(id),
      filename: snap.filename,
      kind: snap.fragment_type || payload?.fragment_type,
    })
  }
  return out
}

function mergeDeliverableCards(
  existing: { assetId: string; filename?: string; kind?: string }[] | undefined,
  incoming: { assetId: string; filename?: string; kind?: string }[],
): { assetId: string; filename?: string; kind?: string }[] {
  const byId = new Map<string, { assetId: string; filename?: string; kind?: string }>()
  for (const d of existing || []) {
    if (d?.assetId) byId.set(d.assetId, d)
  }
  for (const d of incoming) {
    if (d?.assetId) byId.set(d.assetId, { ...byId.get(d.assetId), ...d })
  }
  return Array.from(byId.values())
}

export interface MessageSource {
  id: string
  type: 'web' | 'file' | 'database' | 'api' | 'knowledge'
  title: string
  url?: string
  description?: string
  content?: string
  relevance?: number
  timestamp?: string
  fileName?: string
  fileType?: string
}

export interface ExtendedChatMessage extends ChatMessage {
  imageUrl?: string
  imagePrompt?: string
  timestamp?: number
}

export interface ChatSpaceProps {
  creditsBalance: number
  refreshCredits: () => Promise<void>
  /** True until the first real credits fetch resolves. Without this, the
      lockdown gate below would momentarily treat the hook's 0-balance
      loading placeholder as a genuinely locked $0 account on every mount. */
  creditsLoading?: boolean
}

const PANEL_WIDTH_STORAGE_KEY = 'aselius_preview_panel_width'
const PANEL_RATIO_STORAGE_KEY = 'aselius_preview_panel_width_ratio'
/** Floor — user can shrink assets panel below 50%. */
const PANEL_MIN_PX = 300
const PANEL_MIN_RATIO = 0.2
/** Default when the user has never resized — balanced split within chat area. */
const PANEL_DEFAULT_RATIO = 0.5
const PANEL_MAX_RATIO = 0.5

/**
 * Narrowest split CONTAINER that can host both panes side by side:
 * PANEL_MIN_PX (300) for the panel + ~360px for a readable chat column.
 *
 * The overlay-vs-split decision used to key off `isMobile` (viewport < 640),
 * but the real constraint is the container, which is the viewport MINUS the
 * ~300px sidebar. On a 768px tablet the split container is only ~432px, so the
 * desktop split stayed active, the panel was pinned at its 300px floor, and the
 * chat column collapsed to roughly 130px — unusable, and invisible to any
 * viewport-only check.
 */
const SPLIT_MIN_CONTAINER_PX = 660

function clampPanelWidth(raw: number, containerWidth: number): number {
  const cw = Math.max(containerWidth, PANEL_MIN_PX * 2)
  const min = Math.max(PANEL_MIN_PX, Math.round(cw * PANEL_MIN_RATIO))
  const max = Math.round(cw * PANEL_MAX_RATIO)
  return Math.min(max, Math.max(min, Math.round(raw)))
}

function panelDefaultWidth(containerWidth: number): number {
  return clampPanelWidth(Math.round(containerWidth * PANEL_DEFAULT_RATIO), containerWidth)
}

/** Restore user-saved width; null = no preference yet (use default once). */
function readSavedPanelWidth(containerWidth: number): number | null {
  if (typeof window === 'undefined') return null
  const cw = Math.max(containerWidth, PANEL_MIN_PX * 2)

  const ratioRaw = localStorage.getItem(PANEL_RATIO_STORAGE_KEY)
  if (ratioRaw) {
    const ratio = Number(ratioRaw)
    if (Number.isFinite(ratio) && ratio > 0) {
      return clampPanelWidth(Math.round(cw * ratio), cw)
    }
  }

  const pxRaw = localStorage.getItem(PANEL_WIDTH_STORAGE_KEY)
  if (pxRaw) {
    const px = Number(pxRaw)
    if (Number.isFinite(px) && px > 0) {
      const clamped = clampPanelWidth(px, cw)
      localStorage.setItem(PANEL_RATIO_STORAGE_KEY, String(Math.round((clamped / cw) * 1000) / 1000))
      return clamped
    }
  }

  return null
}

function persistPanelWidth(width: number, containerWidth: number) {
  if (typeof window === 'undefined') return
  const cw = Math.max(containerWidth, 1)
  const ratio = Math.round((width / cw) * 1000) / 1000
  localStorage.setItem(PANEL_RATIO_STORAGE_KEY, String(ratio))
  localStorage.setItem(PANEL_WIDTH_STORAGE_KEY, String(width))
}

const ResizeHandle = ({ onPointerDown }: { onPointerDown: (e: React.PointerEvent) => void }) => (
  <div
    // w-4 (16px) not w-3: the visual grip stays 4px, but the hit area needs to
    // be reachable with a finger. Pointer events so touch/pen work at all.
    className="absolute left-0 top-0 bottom-0 w-4 -translate-x-1/2 cursor-col-resize z-50 flex items-center justify-center group touch-none"
    onPointerDown={onPointerDown}
    role="separator"
    aria-orientation="vertical"
    aria-label="Resize preview panel"
  >
    <div className="h-10 w-1 rounded-full bg-gray-300/80 dark:bg-gray-600/80 group-hover:bg-[#00477d]/60 group-active:bg-[#00477d] transition-[background-color] duration-150" />
  </div>
)

// Maps backend tool names (routes/chat.py tool_call_start payload) to a
// human-readable live-status line. Falls back to a title-cased version of
// the raw name for any tool not listed here, so new tools never show up blank.
const TOOL_STATUS_LABELS: Record<string, string> = {
  request_subagent: 'Delegating to a specialist…',
  generate_code_artifact: 'Writing code…',
  write_file: 'Writing files…',
  apst_patch: 'Applying edits…',
  create_document: 'Creating document…',
  read_asset: 'Reading file…',
  search_document: 'Searching documents…',
  perplexity_multi_search: 'Searching the web…',
  brave_web_search: 'Searching the web…',
  load_reference: 'Loading reference…',
  generate_image: 'Generating image…',
  execute: 'Running commands…',
  finish: 'Finalizing…',
  // Research / Cicero. Without these the fallback below title-cases the raw
  // tool id, so the thread said "Perform Grounded Research…" and
  // "Legal Data Hunter Search…" — the id read back to the user as if it were
  // a sentence.
  perform_grounded_research: 'Searching sources…',
  page_scraper: 'Reading a page…',
  'legal-data-hunter-search': 'Searching case law…',
  'legal-data-hunter-resolve': 'Checking a citation…',
  groundeddatasource: 'Checking sources…',
}

/**
 * Grounded data sources by id prefix.
 *
 * There are several hundred grounded tool ids and they grow with every source
 * we add, so a per-tool table would be stale the day after it was written.
 * Every id is `<family>-<action>`, and the family is what a user actually
 * wants to know — which body of information is being consulted, not which
 * vendor endpoint. Phrased by domain rather than provider for the same reason.
 */
const GROUNDED_FAMILY_LABELS: Record<string, string> = {
  court: 'Checking case law…',
  uk: 'Checking legislation…',
  eurlex: 'Checking legislation…',
  congress: 'Checking legislation…',
  govinfo: 'Checking government records…',
  federal: 'Checking government records…',
  sec: 'Checking company filings…',
  uspto: 'Checking patents…',
  clinicaltrials: 'Checking clinical trials…',
  hrsa: 'Checking health services…',
  healthcare: 'Checking health services…',
  fatsecret: 'Checking nutrition data…',
  eurostat: 'Checking economic data…',
  abs: 'Checking economic data…',
  world: 'Checking economic data…',
  data: 'Checking statistical data…',
  nasa: 'Checking space data…',
  nws: 'Checking weather data…',
  weather: 'Checking weather data…',
  google: 'Checking mapping data…',
  doaj: 'Checking research papers…',
  pub: 'Checking research papers…',
}

/**
 * Longest run of activity kept on a message.
 *
 * A Rivine Code build can emit hundreds of steps. The thread needs to show the
 * engine working, not every event it ever sent — and an unbounded array here
 * is re-rendered on each append for the whole turn.
 */
const ACTIVITY_LIMIT = 60

/**
 * Append one step to a message's activity trail.
 *
 * Read-modify-write through the store, the same idiom `codeSteps` uses. Two
 * rules matter: a repeat of the label already at the tail is dropped (engines
 * re-announce the same phase as they iterate, and a wall of identical lines
 * reads as a stutter, not as progress), and whatever was previously `active`
 * is closed out, so exactly one row is ever live.
 */
function pushActivity(
  messageId: string,
  entry: { id?: string; label: string; kind: ActivityEntry['kind'] },
): void {
  const label = (entry.label || '').trim()
  if (!messageId || !label) return
  const store = useWorkspaceStore.getState()
  const existing = store.messages.find((m) => m.id === messageId)?.activity ?? []
  const tail = existing[existing.length - 1]
  if (tail && tail.label === label) return

  const settled: ActivityEntry[] = existing.map((a) =>
    a.status === 'active' ? { ...a, status: 'done' as const } : a,
  )
  const next = [
    ...settled,
    { id: entry.id || `a${settled.length}`, label, kind: entry.kind, status: 'active' as const },
  ]
  store.updateMessageMetadata(messageId, {
    activity: next.length > ACTIVITY_LIMIT ? next.slice(-ACTIVITY_LIMIT) : next,
  })
}

/** Close the trail out when the turn ends, so nothing is left spinning. */
function settleActivity(messageId: string): void {
  if (!messageId) return
  const store = useWorkspaceStore.getState()
  const existing = store.messages.find((m) => m.id === messageId)?.activity
  if (!existing?.length || !existing.some((a) => a.status === 'active')) return
  store.updateMessageMetadata(messageId, {
    activity: existing.map((a) => (a.status === 'active' ? { ...a, status: 'done' as const } : a)),
  })
}

function friendlyToolLabel(name?: string, args?: Record<string, any>): string {
  if (!name) return 'Working…'
  const mapped = TOOL_STATUS_LABELS[name]
  if (mapped) return mapped
  // TaskForce MCP tools: tf_<connector>_<tool>
  if (name.startsWith('tf_')) {
    const parts = name.slice(3).split('_').filter(Boolean)
    if (parts.length >= 2) {
      const connector = parts[0].replace(/\b\w/g, (c) => c.toUpperCase())
      const tool = parts.slice(1).join(' ').replace(/\b\w/g, (c) => c.toUpperCase())
      return `${connector}: ${tool}…`
    }
  }
  // Grounded RCP tool ids are kebab-case (e.g. "nws-weather-forecast");
  // internal python tool names are snake_case. Only the kebab ones are
  // grounded sources, so the family lookup is safe to key on that shape
  // alone and cannot swallow a Code or TaskForce tool.
  if (name.includes('-')) {
    return GROUNDED_FAMILY_LABELS[name.split('-')[0]] ?? 'Checking sources…'
  }
  const filename = args?.filename || args?.file_path
  const readable = name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return filename ? `${readable} (${filename})…` : `${readable}…`
}

// ─────────────────────────────────────────────────────────────────────────────
// ChatSpace
// ─────────────────────────────────────────────────────────────────────────────

export const ChatSpace: React.FC<ChatSpaceProps> = ({ creditsBalance, refreshCredits, creditsLoading = false }) => {
  const popupModal = usePopupModal()

  // ── External stores ─────────────────────────────────────────────────────────
  const {
    currentWorkspace, currentChatSpace, messages,
    fetchMessages,
    deleteTurn,
    sharePanelRequestId,
    // Read so this component can tell "still loading" from "nothing here".
    // Without them `!currentChatSpace` meant both, and the empty state — with
    // its Create button — was what every workspace click rendered while the
    // taskspace list was still in flight.
    chatSpaces,
    loading: storeLoading,
  } = useWorkspaceStore()
  const { user } = useAuthStore()
  const darkMode = useStore((state) => state.darkMode)
  const {
    connectors: workspaceConnectors,
    loading: workspaceConnectorsLoading,
    refresh: refreshWorkspaceConnectors,
  } = useWorkspaceConnectors(currentWorkspace?.id)

  const { data: userProfile } = useQuery({
    queryKey: minProfileQueryKey((user as any)?.cloudhandle),
    queryFn: getMinimalUserProfile,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  })

  const workspaceRole = normalizePermission(currentWorkspace?.user_role || 'owner')
  const isGuestReadOnly = isReadOnlyGuest(workspaceRole)
  const { activeTyper, isInputLockedByPeer, signalTyping } = useWorkspacePresence(
    currentWorkspace?.id,
    currentChatSpace?.id,
  )
  // Gate on creditsLoading so the hook's transient 0-balance placeholder
  // (before the first real /credits fetch resolves) never reads as a
  // genuinely locked account for a user who actually has a healthy balance.
  const isCreditsLocked = !creditsLoading && isWorkspaceLocked(creditsBalance)
  const isInputLocked = isGuestReadOnly || isInputLockedByPeer || isCreditsLocked
  const inputLockMessage = isGuestReadOnly
    ? 'You have view-only access to this workspace.'
    : isInputLockedByPeer
      ? `${activeTyper} is typing — wait until they finish to send.`
      : isCreditsLocked
        ? CREDITS_LOCKDOWN_MESSAGE
        : undefined

  // ── Preview panel (Assets + Attachments) ─────────────────────────────────────
  const [showPreviewPanel, setShowPreviewPanel] = useState(false)
  const [previewTab, setPreviewTab] = useState<PreviewPanelTab>('assets')
  const [previewSelection, setPreviewSelection] = useState<PreviewSelection>(null)
  const [panelWidth, setPanelWidth] = useState(480)
  const [isPanelFullscreen, setIsPanelFullscreen] = useState(false)
  const [isResizingPanel, setIsResizingPanel] = useState(false)
  const panelWidthRef = useRef(480)
  const panelWidthBeforeFullscreen = useRef(480)
  const splitContainerRef = useRef<HTMLDivElement>(null)
  const isResizingPanelRef = useRef(false)
  const isPanelFullscreenRef = useRef(false)
  // Measured width of the split container (viewport minus sidebar/padding).
  // 0 until first measure — treated as "not yet known", see canHostSplit.
  const [splitContainerWidth, setSplitContainerWidth] = useState(0)

  const measureSplitWidth = useCallback((): number => {
    const w = splitContainerRef.current?.getBoundingClientRect().width
    if (w && w > 0) return w
    if (typeof window !== 'undefined') return window.innerWidth
    return 960
  }, [])

  // ── Live sandbox preview (rivine_code fragment_url from SSE) ─────────────────
  const [activeSandbox, setActiveSandbox] = useState<{
    url: string
    fragmentType: string
    sandboxId: string | null
    expired: boolean
  } | null>(null)

  // ── Rivine Code hybrid workspace (files/editor/diff) — code_file SSE ─────────
  // codeStreamActive flips true the instant the code engine writes a file this
  // turn; combined with the last assistant message's targetEngine it gates the
  // Code workspace panel to rivine_code only (never keyword-based).
  const [codeStreamActive, setCodeStreamActive] = useState(false)
  // Set the instant the mediator routes this turn to rivine_code (engine_selected
  // SSE event), BEFORE any file is written — so the Code panel opens immediately
  // instead of after the first (potentially minutes-later) code_file event.
  const [codeRouted, setCodeRouted] = useState(false)
  const [codeLockedPaths, setCodeLockedPaths] = useState<string[]>([])
  /** Unified diffs for this turn, newest last. Rendered in the Changes view. */
  const [codeDiffs, setCodeDiffs] = useState<Array<{
    path: string; stat: string; patch: string
    added: number; removed: number
    isNew: boolean; isDelete: boolean; binary: boolean
  }>>([])
  const [codeLastWrite, setCodeLastWrite] = useState<{ path: string; tick: number } | null>(null)
  const codeWriteTick = useRef(0)
  // A code_project asset the user explicitly opened (snapshot card or Assets
  // list). When set, the panel shows that saved project in asset mode,
  // independent of any live sandbox.
  const [openProjectAssetId, setOpenProjectAssetId] = useState<string | null>(null)
  // Durable code_project asset id announced by the server mid-build, before the
  // turn has produced any message to read a deliverable off. Without it the
  // file panel has no fallback source while a build is running, so a sandbox
  // that dies mid-turn empties the tree even though the files were saved.
  const [liveProjectAssetId, setLiveProjectAssetId] = useState<string | null>(null)

  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  // Gate the Rivine Code workspace strictly to rivine_code: the engine wrote a
  // file this turn (codeStreamActive), or the most recent assistant message was
  // produced by rivine_code and a sandbox is live. No other engine qualifies.
  const lastAssistantEngine = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return messages[i].targetEngine
    }
    return undefined
  }, [messages])
  const codeSession = codeStreamActive || codeRouted || (!!activeSandbox && lastAssistantEngine === 'rivine_code')

  // Latest code_project deliverable assetId in this chat — lets sandbox-mode
  // edits also persist to the durable asset (and survives reload since it's
  // read from message metadata). Deterministic: keyed on the deliverable kind.
  const chatProjectAssetId = useMemo(() => {
    // A checkpoint from the turn happening right now is fresher than anything
    // already persisted to a message, and during the first Code turn in a chat
    // it is the ONLY durable id that exists.
    if (liveProjectAssetId) return liveProjectAssetId
    for (let i = messages.length - 1; i >= 0; i--) {
      const d = messages[i].deliverables?.find((x) => x.kind === 'code_project')
      if (d?.assetId) return d.assetId
    }
    return null
  }, [messages, liveProjectAssetId])

  const closePreviewPanel = useCallback(() => {
    const cw = measureSplitWidth()
    persistPanelWidth(panelWidthRef.current, cw)
    setShowPreviewPanel(false)
    setIsPanelFullscreen(false)
  }, [measureSplitWidth])

  const togglePanelFullscreen = useCallback(() => {
    setIsPanelFullscreen((prev) => {
      if (!prev) {
        panelWidthBeforeFullscreen.current = panelWidth
        return true
      }
      setPanelWidth(panelWidthBeforeFullscreen.current)
      return false
    })
  }, [panelWidth])

  const openPreviewPanel = useCallback((tab: PreviewPanelTab = 'assets', selection?: PreviewSelection) => {
    setPreviewTab(tab)
    if (selection !== undefined) setPreviewSelection(selection)
    setShowPreviewPanel((wasOpen) => {
      if (!wasOpen) {
        const cw = measureSplitWidth()
        const saved = readSavedPanelWidth(cw)
        const next = saved != null
          ? saved
          : panelWidthRef.current > 0
            ? clampPanelWidth(panelWidthRef.current, cw)
            : panelDefaultWidth(cw)
        setPanelWidth(next)
        panelWidthRef.current = next
      }
      return true
    })
  }, [measureSplitWidth])

  const canShare = canShareWorkspace(currentWorkspace?.user_role)

  useEffect(() => {
    if (!sharePanelRequestId || !canShare) return
    setShowPreviewPanel(true)
    setPreviewTab('share')
  }, [sharePanelRequestId, canShare])

  const handleAssetContentSaved = useCallback((assetId: string, content: string) => {
    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetId ? { ...a, content, current_content: content } : a,
      ),
    )
    setAttachments((prev) =>
      prev.map((att) =>
        att.assetId === assetId
          ? { ...att, markdownPreview: snippetFromText(content, 200) }
          : att,
      ),
    )
    setPreviewSelection((sel) => {
      if (sel?.kind === 'asset' && sel.asset.id === assetId) {
        return { kind: 'asset', asset: { ...sel.asset, content, current_content: content } }
      }
      return sel
    })
  }, [])

  useEffect(() => {
    const handler = () => openPreviewPanel('assets')
    window.addEventListener('openAssetsModal', handler)
    return () => window.removeEventListener('openAssetsModal', handler)
  }, [openPreviewPanel])

  // ── Plan limits (daily uploads) ──────────────────────────────────────────────
  const { data: planLimits, refresh: refreshPlanLimits } = usePlanLimits()
  const [message, setMessage] = useState('')
  const seliusDraft = useRef<string | null>(null)
  const seliusEngine = useRef<{ id: string; specialty: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingAiMessageId, setStreamingAiMessageId] = useState<string | null>(null)
  const [liveStatus, setLiveStatus] = useState<string | null>(null)
  // Bumped when a turn outlives the stream that started it (turn
  // continuation), so the turn-status follower below picks it up.
  const [followNonce, setFollowNonce] = useState(0)
  const streamAbortRef = useRef<AbortController | null>(null)
  const userCancelledRef = useRef(false)
  const turnNotifyDedupeRef = useRef<string | null>(null)
  const [tempAiId, setTempAiId] = useState<string>('')
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [messagesFetched, setMessagesFetched] = useState(false)
  const [currentChatSpaceId, setCurrentChatSpaceId] = useState<string | null>(null)
  /** Asset list requests already in flight, keyed by taskspace. */
  const assetsInFlight = useRef(new Map<string, Promise<Asset[]>>())

  // ── Asset state ──────────────────────────────────────────────────────────────
  const [assets, setAssets] = useState<Asset[]>([])
  // False only while the FIRST load for a taskspace is in flight, so the panel
  // can show a skeleton instead of an empty state. A cached re-visit starts
  // true — there is real content to show, and flashing a skeleton over it would
  // be a downgrade from what the user can already see.
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; asset: Asset | null }>({ isOpen: false, asset: null })
  const [deleteTurnModal, setDeleteTurnModal] = useState<{ isOpen: boolean; aiMessageId: string | null }>({ isOpen: false, aiMessageId: null })

  // ── Attachment state ─────────────────────────────────────────────────────────
  const [attachments, setAttachments] = useState<ChatAttachment[]>([])
  const [isParsingAttachment, setIsParsingAttachment] = useState(false)

  const openMessageSnapshot = useCallback((selection: PreviewSelection) => {
    openPreviewPanel(tabForSelection(selection, attachments), selection)
  }, [attachments, openPreviewPanel])

  // Rivine Code project card / Assets-list code_project → open the file-system
  // panel loaded with the saved project (asset mode). Never downloads — the
  // panel has its own zip download. Works after reload/logout (asset-backed),
  // independent of any live sandbox.
  const openCodeProject = useCallback((assetId: string) => {
    setOpenProjectAssetId(assetId)
    openPreviewPanel('code')
  }, [openPreviewPanel])

  const [editingAttachment, setEditingAttachment] = useState<{ index: number; content: string } | null>(null)
  const [showAttachmentDropdown, setShowAttachmentDropdown] = useState(false)

  // ── HITL ─────────────────────────────────────────────────────────────────────
  const [approvalRequest, setApprovalRequest] = useState<{
    tool: string | null; tool_call_id: string | null; args: Record<string, any>; ui_schema?: Record<string, any>; message: string; thread_id: string; hitl_type?: string | null; connector?: string | null
  } | null>(null)

  // ── Toolbar config state ─────────────────────────────────────────────────────
  const [showSources, setShowSources] = useState(false)
  const [showModels, setShowModels] = useState(false)
  const [sources, setSources] = useState<Source[]>(defaultSources)
  const [models, setModels] = useState<Model[]>(defaultModels)
  const [engines, setEngines] = useState<Model[]>(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem('aselius_selected_engine')
    const savedId = saved && defaultEngines.some((e) => e.id === saved) ? saved : DEFAULT_ENGINE_ID
    return defaultEngines.map((e) => ({ ...e, enabled: e.id === savedId }))
  })

  const connectorsWorkspaceRef = useRef<string | null>(null)

  useEffect(() => {
    const listed = workspaceConnectors.filter(isListedInConnectApps)
    const workspaceId = currentWorkspace?.id ?? null
    const workspaceChanged = connectorsWorkspaceRef.current !== workspaceId
    connectorsWorkspaceRef.current = workspaceId
    const persisted = loadEnabledConnectorIds(workspaceId)
    setSources((previous) => {
      const hadConnectors =
        !workspaceChanged && previous.some((source) => source.category === 'connectors')
      const sessionEnabled = new Set(
        previous
          .filter((source) => source.category === 'connectors' && source.enabled)
          .map((source) => source.id),
      )
      // After first catalog hydrate for this workspace, trust in-memory toggles.
      // On workspace switch / fresh mount, restore last selection for that workspace.
      const enabled = hadConnectors ? sessionEnabled : persisted
      const nonConnectors = previous.filter((source) => source.category !== 'connectors')
      const connectorSources: Source[] = listed.map((connector) => {
        const disabledReason = connectAppsDisableReason(connector)
        const canEnable = !disabledReason
        return {
          id: connector.server_id,
          name: connector.name,
          description: disabledReason
            || connector.description
            || connector.access
            || (
              connector.tool_count > 0
                ? `${connector.tool_count} TaskForce tools`
                : 'Rivine TaskForce app connector'
            ),
          icon: connector.icon || connector.icon_url || 'Globe',
          color: 'text-cyan-500',
          enabled: canEnable && enabled.has(connector.server_id),
          comingSoon: Boolean(disabledReason),
          disabledReason: disabledReason || undefined,
          category: 'connectors',
        }
      })
      return [...nonConnectors, ...connectorSources]
    })
  }, [workspaceConnectors, currentWorkspace?.id])

  // Pull the saved selection from the server once per workspace.
  //
  // The effect above restores from `localStorage`, which only ever knew about
  // this browser. This is what makes the choice follow the person to a second
  // device instead of silently starting empty there; it applies the server copy
  // only when it actually differs, so it cannot fight in-session toggles.
  useEffect(() => {
    const workspaceId = currentWorkspace?.id
    if (!workspaceId) return
    let cancelled = false
    void (async () => {
      const remote = await fetchEnabledConnectorIds(
        workspaceId,
        useAuthStore.getState().token,
      )
      if (cancelled || remote.size === 0) return
      setSources((previous) => {
        const connectors = previous.filter((s) => s.category === 'connectors')
        if (!connectors.length) return previous
        const already = new Set(connectors.filter((s) => s.enabled).map((s) => s.id))
        const same =
          already.size === remote.size && [...remote].every((id) => already.has(id))
        if (same) return previous
        return previous.map((source) =>
          source.category === 'connectors'
            ? { ...source, enabled: !source.comingSoon && remote.has(source.id) }
            : source,
        )
      })
    })()
    return () => { cancelled = true }
  }, [currentWorkspace?.id, workspaceConnectors.length])

  // ── Voice ────────────────────────────────────────────────────────────────────
  const [isVoiceTyping, setIsVoiceTyping] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)

  // ── Language ─────────────────────────────────────────────────────────────────
  const [selectedLanguage, setSelectedLanguageState] = useState(
    () => (typeof window !== 'undefined' && localStorage.getItem('aselius_selected_language')) || 'English',
  )
  const setSelectedLanguage = useCallback((lang: string) => {
    setSelectedLanguageState(lang)
    localStorage.setItem('aselius_selected_language', lang)
  }, [])

  // ── Engine specialty (sub-agent mode per Rivine engine) ─────────────────────
  // Persisted the same way as language/engine (§ preference
  // persistence, 2026-07-17) — reported as "Rivine Notes resets every time I
  // switch workspace" even though no remount was found in the component
  // tree; persisting it the same way as its siblings closes the symptom
  // regardless of the exact re-render path that was clearing it.
  // Rivine Code Rate. Manual asks before each write; Bypass applies edits in
  // the project without prompting per edit. Defaults to Manual — asking is
  // never destructive, whereas assuming Bypass would let a turn edit files the
  // user never approved.
  const [codeRate, setCodeRate] = useState<'manual' | 'bypass'>(() => {
    if (typeof window === 'undefined') return 'manual'
    try {
      const saved = window.localStorage.getItem('rivine.code.rate')
      return saved === 'bypass' ? 'bypass' : 'manual'
    } catch {
      return 'manual'
    }
  })

  const updateCodeRate = useCallback((rate: 'manual' | 'bypass') => {
    setCodeRate(rate)
    try {
      window.localStorage.setItem('rivine.code.rate', rate)
    } catch {
      /* storage unavailable — the choice still applies to this session */
    }
  }, [])

  // Thorough (Rivine engines): depth over speed for the turns it is on for.
  // Remembered like Rate, so a user who works this way keeps working this way.
  const [thorough, setThorough] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    try {
      return window.localStorage.getItem('rivine.thorough') === 'on'
    } catch {
      return false
    }
  })

  const updateThorough = useCallback((on: boolean) => {
    setThorough(on)
    try {
      window.localStorage.setItem('rivine.thorough', on ? 'on' : 'off')
    } catch {
      /* storage unavailable — the choice still applies to this session */
    }
  }, [])

  const [engineSpecialties, setEngineSpecialtiesState] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {}
    try {
      const saved = localStorage.getItem('aselius_engine_specialties')
      return saved ? JSON.parse(saved) : {}
    } catch { return {} }
  })
  const setEngineSpecialties = useCallback((updater: React.SetStateAction<Record<string, string>>) => {
    setEngineSpecialtiesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      localStorage.setItem('aselius_engine_specialties', JSON.stringify(next))
      return next
    })
  }, [])


  // ── Mobile detection ─────────────────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(false)

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sourcesRef = useRef<HTMLDivElement>(null)
  const toolsRef = useRef<HTMLDivElement>(null)
  const modelsRef = useRef<HTMLDivElement>(null)

  // ── Computed ─────────────────────────────────────────────────────────────────

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  // Restore saved width once the split container is measured.
  useLayoutEffect(() => {
    let raf = 0
    let ro: ResizeObserver | null = null

    const apply = () => {
      const el = splitContainerRef.current
      const cw = el?.getBoundingClientRect().width ?? 0
      if (!el || cw <= 0) {
        raf = requestAnimationFrame(apply)
        return
      }
      setSplitContainerWidth(cw)
      const saved = readSavedPanelWidth(cw)
      const next = saved != null
        ? saved
        : panelWidthRef.current > 0
          ? clampPanelWidth(panelWidthRef.current, cw)
          : panelDefaultWidth(cw)
      setPanelWidth(next)
      panelWidthRef.current = next

      ro = new ResizeObserver(() => {
        const cw2 = el.getBoundingClientRect().width
        if (cw2 <= 0) return
        // Track width even mid-resize/fullscreen: the split-vs-overlay
        // decision must stay correct while the window is being resized.
        setSplitContainerWidth(cw2)
        if (isResizingPanelRef.current || isPanelFullscreenRef.current) return
        setPanelWidth((w) => {
          const clamped = clampPanelWidth(w, cw2)
          panelWidthRef.current = clamped
          return clamped
        })
      })
      ro.observe(el)
    }

    apply()
    return () => {
      if (raf) cancelAnimationFrame(raf)
      ro?.disconnect()
    }
  }, [])

  useEffect(() => {
    isResizingPanelRef.current = isResizingPanel
  }, [isResizingPanel])

  useEffect(() => {
    isPanelFullscreenRef.current = isPanelFullscreen
  }, [isPanelFullscreen])

  useEffect(() => {
    panelWidthRef.current = panelWidth
  }, [panelWidth])

  useEffect(() => {
    const onViewportResize = () => {
      if (isResizingPanel || isPanelFullscreen) return
      const cw = measureSplitWidth()
      setPanelWidth((w) => clampPanelWidth(w, cw))
    }
    window.addEventListener('resize', onViewportResize)
    return () => window.removeEventListener('resize', onViewportResize)
  }, [measureSplitWidth, isResizingPanel, isPanelFullscreen])

  useEffect(() => {
    if (!isResizingPanel) return
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    return () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizingPanel])

  useEffect(() => {
    if (!isResizingPanel) return

    // Pointer events rather than mouse events: `mousemove`/`mouseup` never fire
    // for touch or pen input, so the drag handle was inert on every tablet even
    // though it rendered and had `touch-none`. Pointer events cover mouse, pen
    // and touch through one API.
    const onMove = (e: PointerEvent) => {
      if (isPanelFullscreenRef.current) return
      const rect = splitContainerRef.current?.getBoundingClientRect()
      if (!rect) return
      const next = clampPanelWidth(rect.right - e.clientX, rect.width)
      panelWidthRef.current = next
      setPanelWidth(next)
    }

    const onUp = () => {
      if (!isResizingPanelRef.current) return
      isResizingPanelRef.current = false
      setIsResizingPanel(false)
      const cw = splitContainerRef.current?.getBoundingClientRect().width ?? measureSplitWidth()
      persistPanelWidth(panelWidthRef.current, cw)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    // pointercancel fires when the browser takes over the gesture (scroll,
    // sheet dismiss); without it a cancelled drag leaves the panel stuck in
    // resizing state and the width never persists.
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [isResizingPanel, measureSplitWidth])

  const startResizing = (e: React.PointerEvent) => {
    isResizingPanelRef.current = true
    setIsResizingPanel(true)
    e.preventDefault()
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // USE EFFECTS
  // ──────────────────────────────────────────────────────────────────────────────

  // Click-outside to close dropdowns
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (showSources && !(e.target as Element).closest('[data-connect-apps-dropdown]')) setShowSources(false)
      if (showModels && !(e.target as Element).closest('[data-models-dropdown]')) setShowModels(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showSources, showModels])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (showAttachmentDropdown && !(e.target as Element).closest('.attachment-dropdown-container')) {
        setShowAttachmentDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showAttachmentDropdown])


  /**
   * True when the preview panel must take over the screen instead of sitting
   * beside the chat. Container-driven, not viewport-driven: `isMobile` alone
   * missed the 640-1024px tablet range, where the sidebar leaves too little
   * room for a usable side-by-side split (see SPLIT_MIN_CONTAINER_PX).
   *
   * `splitContainerWidth === 0` means "not measured yet" — treated as roomy so
   * the desktop split does not flash as an overlay on first paint.
   */
  const usePanelOverlay =
    isMobile || (splitContainerWidth > 0 && splitContainerWidth < SPLIT_MIN_CONTAINER_PX)

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Voice recognition
  useEffect(() => {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) return
    const SR = (window as any).webkitSpeechRecognition
    const r = new SR()
    r.continuous = true; r.interimResults = true; r.lang = 'en-US'
    r.onstart = () => setIsVoiceTyping(true)
    r.onresult = (event: any) => {
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript
      }
      if (final) setMessage((prev) => prev + final)
    }
    r.onerror = (event: any) => { console.error('Speech error:', event.error); setIsVoiceTyping(false); toast.error('Voice recognition error: ' + event.error) }
    r.onend = () => setIsVoiceTyping(false)
    setRecognition(r)
    return () => { try { r.stop() } catch { } }
  }, [])

  // Fetch messages when chat space changes
  useEffect(() => {
    if (!currentWorkspace || !currentChatSpace) return
    let mounted = true
    const isSwitching = currentChatSpaceId && currentChatSpaceId !== currentChatSpace.id
    setCurrentChatSpaceId(currentChatSpace.id)
    setMessagesFetched(false)
    if (isSwitching) {
      setApprovalRequest(null)
      // Checkpoint ids belong to one taskspace's build. Carrying one across a
      // switch would point the next taskspace's file panel at a project that
      // is not its own.
      setLiveProjectAssetId(null)
    }
    if (isSwitching && messages.length > 0) setLoadingMessages(true)
    else setLoadingMessages(false)
    const t = setTimeout(async () => {
      if (!mounted || !currentWorkspace || !currentChatSpace) return
      try {
        await fetchMessages(currentWorkspace.id, currentChatSpace.id)
        if (mounted) { setMessagesFetched(true); setLoadingMessages(false) }
      } catch {
        if (mounted) { setMessagesFetched(true); setLoadingMessages(false); toast.error('Failed to load messages') }
      }
    }, 50)
    return () => { mounted = false; clearTimeout(t) }
  }, [currentWorkspace, currentChatSpace?.id, fetchMessages])

  // Reattach to an in-flight or just-finished turn after (re)loading a
  // Taskspace. The backend keeps generating even if a client disconnected
  // mid-turn (routes/chat.py's /stream detaches the workflow into its own
  // task), so a lone trailing user message with no reply doesn't mean the
  // turn was lost — it may still be running, or may have finished after
  // this tab navigated away. Poll turn-status until it resolves.
  useEffect(() => {
    if (!messagesFetched || !currentWorkspace || !currentChatSpace) return
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || lastMessage.role !== 'user') return
    if (isStreaming) return // this tab is already the one driving the turn

    let cancelled = false
    let pollTimer: ReturnType<typeof setTimeout> | null = null
    let placeholderId: string | null = null
    let networkFailures = 0
    const MAX_NETWORK_FAILURES = 5
    // Backstop for a turn that never reaches a terminal status (backend bug,
    // orphaned task, etc.) — without this, a single bad turn polls every 2.5s
    // FOREVER as long as the tab stays open, which is real invocation cost for
    // zero user benefit. 10 minutes covers every legitimate engine response.
    const POLL_STARTED_AT = Date.now()
    const MAX_POLL_DURATION_MS = 10 * 60 * 1000
    // Requests must not fire while the tab is in the background — a poll every
    // 2.5s from a backgrounded/minimized tab is pure waste, and was previously
    // unconditional. Cleared on hide, re-armed with an immediate poll on show
    // so a returning user isn't stuck waiting out the last interval.
    let pausedByHidden = typeof document !== 'undefined' && document.hidden

    const stopReattaching = () => {
      setIsStreaming(false)
      setStreamingAiMessageId(null)
      setLiveStatus(null)
    }

    const emitReattachNotify = (status: Awaited<ReturnType<typeof getTurnStatus>>) => {
      const dedupeKey = `${currentChatSpace.id}:${status.status}:${status.ai_message_id || status.error || ''}`
      if (turnNotifyDedupeRef.current === dedupeKey) return
      turnNotifyDedupeRef.current = dedupeKey
      const workspaceName = currentWorkspace.name || 'Workspace'
      const engineLabel = status.target_engine
        ? String(status.target_engine).replace(/_/g, ' ')
        : undefined
      const deliverables = normalizeDeliverableSnaps(status.deliverables)
      if (status.status === 'done') {
        if (deliverables.length > 0 || status.fragment_snapshot?.asset_id) {
          const first = deliverables[0]
          notifyWorkspaceDeliverableReady({
            workspaceName,
            workspaceId: currentWorkspace.id,
            chatSpaceId: currentChatSpace.id,
            filename: first?.filename || status.fragment_snapshot?.filename,
            engineLabel,
          })
          toast.success('Your deliverable is ready')
        } else {
          notifyWorkspaceTurnDone({
            workspaceName,
            workspaceId: currentWorkspace.id,
            chatSpaceId: currentChatSpace.id,
            engineLabel,
            preview: status.content,
          })
          toast.success('Your response is ready')
        }
      } else if (status.status === 'error') {
        notifyWorkspaceTurnError({
          workspaceName,
          workspaceId: currentWorkspace.id,
          chatSpaceId: currentChatSpace.id,
          error: status.error,
        })
      }
    }

    // A turn that failed or was stopped can still have produced a real project.
    // Rivine Code checkpoints its files to a durable asset as it writes them,
    // and the server attaches the newest checkpoint to the terminal status. The
    // reattach path used to just drop the placeholder and show an error, so
    // that work vanished from the thread even though it was safely saved —
    // which is exactly why a stopped or crashed build felt like lost work.
    const surfaceSalvagedProject = (status: TurnStatus, note: string) => {
      const cards = mergeDeliverableCards(
        undefined,
        normalizeDeliverableSnaps(status.deliverables),
      )
      if (cards.length === 0) return
      const store = useWorkspaceStore.getState()
      const id = `salvaged-${Date.now()}-ai`
      store.addMessage({
        id,
        role: 'assistant',
        content: note,
        created_at: new Date().toISOString(),
      })
      store.updateMessageMetadata(id, {
        deliverables: cards,
        deliverableAssetId: cards[0].assetId,
        deliverableFilename: cards[0].filename,
        targetEngine: status.target_engine ?? undefined,
      })
      fetchAssets(currentChatSpace.id)
    }

    const poll = async () => {
      if (cancelled) return
      try {
        const status = await getTurnStatus(currentWorkspace.id, currentChatSpace.id)
        if (cancelled) return
        networkFailures = 0

        // The server says `running`, but nothing is actually executing it.
        //
        // A turn row stays `running` if the process that owned it died — Lambda
        // timeout, container reap, a crash — because only that process ever
        // writes the terminal status. This poll used to believe the row
        // forever, so users sat in front of "Still working on your last
        // request…" and a Stop button for over a day after the sandbox had been
        // reaped. `live` is the server telling us whether a task is genuinely
        // registered; when it is explicitly false the turn is not coming back.
        if (status.status === 'running' && status.live === false) {
          if (placeholderId) {
            useWorkspaceStore.getState().removeMessage(placeholderId)
            placeholderId = null
          }
          setStreamingAiMessageId(null)
          setIsStreaming(false)
          setLiveStatus(null)
          toast.error('That request stopped unexpectedly — please send it again.')
          stopReattaching()
          return
        }

        if (status.status === 'running') {
          // A build that started in another tab (or before this reload) has
          // already saved checkpoints. Adopting the id now means the file panel
          // has a durable source from the moment it opens, instead of an empty
          // tree until the turn finally ends.
          if (status.checkpoint_deliverable?.asset_id) {
            setLiveProjectAssetId(String(status.checkpoint_deliverable.asset_id))
          }
          if (!placeholderId) {
            placeholderId = `reattach-${Date.now()}-ai`
            useWorkspaceStore.getState().addMessage({
              id: placeholderId, role: 'assistant', content: '', created_at: new Date().toISOString(),
            })
            setStreamingAiMessageId(placeholderId)
            setIsStreaming(true)
          }
          // A turn between invocations (`continuing`) is briefly not heartbeating;
          // the server marks it dead itself once its heartbeat goes stale.
          if (status.live !== true && !status.continuing && Date.now() - POLL_STARTED_AT > MAX_POLL_DURATION_MS) {
            // Give up rather than poll indefinitely — but only on a turn the
            // server cannot vouch for. A turn that is heartbeating (`live`) is
            // followed for as long as it runs: long-horizon turns continue
            // across server invocations and can legitimately take hours. The backend keeps running
            // regardless — this only stops THIS tab from asking every 2.5s.
            // A later fetchMessages()/reload will still pick up the result once
            // it lands, since that reads persisted messages, not this poll.
            // Clear the streaming UI too, not just the status line. Leaving
            // `isStreaming` set kept the Stop button and the animated
            // placeholder on screen after we had already given up polling, so
            // the interface claimed work was in progress that this tab was no
            // longer even watching.
            if (placeholderId) {
              useWorkspaceStore.getState().removeMessage(placeholderId)
              placeholderId = null
            }
            setStreamingAiMessageId(null)
            setIsStreaming(false)
            setLiveStatus(null)
            toast.error('This is taking longer than expected. Refresh to check for a reply.')
            stopReattaching()
            return
          }
          setLiveStatus(
            status.continuing
              ? 'Still working — continuing in the background…'
              : 'Still working on your last request…',
          )
          if (typeof document !== 'undefined' && document.hidden) {
            // Tab is backgrounded: stop the network calls but keep the
            // streaming/placeholder UI state as-is. The visibilitychange
            // listener below fires an immediate poll the moment it's shown
            // again, so nothing here needs its own timer.
            pausedByHidden = true
            return
          }
          // Every 2.5 s at first, then every 5 s: a long-running turn does not
          // need second-by-second polling for its whole life.
          pollTimer = setTimeout(poll, Date.now() - POLL_STARTED_AT > 120_000 ? 5000 : 2500)
          return
        }

        if (status.status === 'done' && status.ai_message_id && status.content) {
          const store = useWorkspaceStore.getState()
          if (placeholderId) {
            store.updateMessageContent(placeholderId, status.content)
            store.updateMessageId(placeholderId, status.ai_message_id)
          } else {
            store.addMessage({
              id: status.ai_message_id, role: 'assistant',
              content: status.content, created_at: new Date().toISOString(),
            })
          }
          if (status.fragment_snapshot?.asset_id) {
            store.updateMessageMetadata(status.ai_message_id, {
              deliverableAssetId: status.fragment_snapshot.asset_id,
              deliverableFilename: status.fragment_snapshot.filename,
            })
            fetchAssets(currentChatSpace.id)
          }
          if (status.target_engine || status.mediator_mode) {
            store.updateMessageMetadata(status.ai_message_id, {
              targetEngine: status.target_engine ?? undefined,
              mediatorMode: status.mediator_mode ?? undefined,
            })
          }
          {
            const incoming = normalizeDeliverableSnaps(status.deliverables)
            const fromSnap = snapshotCards(status as any)
            const merged = mergeDeliverableCards(
              store.messages.find((m) => m.id === status.ai_message_id)?.deliverables,
              [...fromSnap, ...incoming],
            )
            if (merged.length > 0) {
              store.updateMessageMetadata(status.ai_message_id, {
                deliverables: merged,
                deliverableAssetId: merged[0].assetId,
                deliverableFilename: merged[0].filename,
              })
            }
          }
          if (status.fragment_url) {
            setActiveSandbox({
              url: status.fragment_url,
              fragmentType: status.fragment_type || '',
              sandboxId: status.sandbox_id ?? null,
              expired: false,
            })
            // Sandbox iframe lives under Rivine Code → Live, not a Preview-panel Live tab.
            openPreviewPanel('code')
          }
          emitReattachNotify(status)
          stopReattaching()
          return
        }

        if (status.status === 'error') {
          if (placeholderId) useWorkspaceStore.getState().removeMessage(placeholderId)
          surfaceSalvagedProject(
            status,
            'This request stopped before it finished. The files written up to that point were saved — open the project below to pick it up.',
          )
          toast.error(status.error || 'The previous request failed.')
          emitReattachNotify(status)
          stopReattaching()
          return
        }

        if (status.status === 'cancelled') {
          if (placeholderId) useWorkspaceStore.getState().removeMessage(placeholderId)
          surfaceSalvagedProject(
            status,
            'Stopped. The files written before you stopped it were saved — open the project below to pick it up.',
          )
          stopReattaching()
          return
        }

        if (status.status === 'paused' && status.hitl_type) {
          // The engine is still waiting on this question (its checkpoint is
          // kept). Show it again rather than cancelling it: until 2026-10-04 a
          // reload or a visit to another taskspace silently threw the paused
          // turn away. Only the card's Cancel ends it.
          const store = useWorkspaceStore.getState()
          const question = String(status.hitl_prompt || 'Approval required.').trim()
          if (placeholderId) {
            store.updateMessageContent(placeholderId, question)
          } else if (!store.messages.some((m) => m.role === 'assistant' && m.content === question)) {
            store.addMessage({
              id: `hitl-${status.thread_id}`, role: 'assistant',
              content: question, created_at: new Date().toISOString(),
            })
          }
          setApprovalRequest({
            tool: status.hitl_tool ?? null,
            tool_call_id: status.hitl_tool_call_id ?? null,
            args: status.hitl_args || {},
            ui_schema: status.hitl_ui_schema || {},
            message: question,
            thread_id: status.thread_id || `${currentWorkspace.id}_${currentChatSpace.id}`,
            hitl_type: status.hitl_type,
            connector: status.hitl_connector ?? null,
          })
          setStreamingAiMessageId(null)
          setIsStreaming(false)
          setLiveStatus(null)
          stopReattaching()
          return
        }

        // idle / no ai_message_id yet — nothing more to reattach to
        if (placeholderId) useWorkspaceStore.getState().removeMessage(placeholderId)
        stopReattaching()
      } catch {
        // Transient network error — retry with backoff; only give up after several failures
        networkFailures += 1
        if (networkFailures >= MAX_NETWORK_FAILURES) {
          if (placeholderId) useWorkspaceStore.getState().removeMessage(placeholderId)
          stopReattaching()
          return
        }
        setLiveStatus('Reconnecting to your last request…')
        setIsStreaming(true)
        pollTimer = setTimeout(poll, Math.min(2500 * networkFailures, 10000))
      }
    }

    const onVisibilityChange = () => {
      if (document.hidden) return // poll() itself detects this on its next tick
      if (pausedByHidden && !cancelled) {
        pausedByHidden = false
        if (pollTimer) clearTimeout(pollTimer)
        void poll()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    void poll()
    return () => {
      cancelled = true
      if (pollTimer) clearTimeout(pollTimer)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesFetched, currentChatSpace?.id, currentWorkspace?.id, followNonce])

  // Auto-scroll
  useEffect(() => {
    const t = setTimeout(() => {
      const isInitial = messagesFetched && messages.length > 0
      scrollToBottom(isInitial ? 'instant' : 'smooth')
    }, 150)
    return () => clearTimeout(t)
  }, [messages, currentChatSpace?.id, messagesFetched])

  // Fetch assets on chat space change
  const fetchAssets = useCallback(async (chatSpaceId: string): Promise<Asset[]> => {
    if (!currentWorkspace?.id) return []
    // During a workspace switch the workspace changes before the taskspace does,
    // so this ran once with the NEW workspace and the OLD taskspace: a 404 every
    // switch (25 in three days of production logs). Only ask for a taskspace
    // known to belong to the current workspace.
    const known = useWorkspaceStore.getState().currentChatSpace
    if (known?.id === chatSpaceId && known.workspace_id && String(known.workspace_id) !== String(currentWorkspace.id)) return []
    // Ten call sites reach for this, and several fire within the same few
    // hundred milliseconds at the end of a turn — the stream's `done`, the
    // deliverable branch, the HITL settle, the panel refresh. Each was a
    // separate GET of the *same* list, and that list carries every text
    // asset's full body, so a Research turn with a long report re-downloaded
    // it several times over just to redraw the same cards.
    const inFlight = assetsInFlight.current.get(chatSpaceId)
    if (inFlight) return inFlight

    const run = (async (): Promise<Asset[]> => {
    try {
      const ASELIUS_BASE_URL = '/api/aselius'
      const { token } = useAuthStore.getState()
      const response = await fetch(
        `${ASELIUS_BASE_URL}/workspaces/${currentWorkspace.id}/chats/${chatSpaceId}/assets`,
        { headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, credentials: 'include' },
      )
      if (!response.ok) { if (response.status === 404) return []; throw new Error('Failed to fetch assets') }
      const raw = await response.json()
      // Backend AssetResponse uses language/filename; normalize to local Asset shape.
      const data: Asset[] = (Array.isArray(raw) ? raw : []).map((a: any) => {
        const language = String(a.language || a.format || '')
        const name = String(a.name || a.filename || 'Untitled')
        const content = typeof a.current_content === 'string'
          ? a.current_content
          : (typeof a.content === 'string' ? a.content : undefined)
        const parsedSize = Number(a.size)
        const size = Number.isFinite(parsedSize) && parsedSize >= 0
          ? parsedSize
          : (content ? new TextEncoder().encode(content).length : 0)
        const type = normalizeAssetType(a.type, language, name)
        const creator = a.creator === 'user' || a.creator === 'ai' ? a.creator : 'ai'
        return {
          id: String(a.id),
          name,
          type,
          creator,
          created_at: a.created_at,
          last_updated: a.last_updated,
          size,
          format: a.format || language || '',
          description: a.description,
          tags: a.tags || [],
          chatSpaceId: a.chatSpaceId || a.chat_space_id || chatSpaceId,
          content: a.content,
          current_content: a.current_content,
          language: a.language,
          filePath: a.filePath,
          url: a.url,
        }
      })
      setCachedAssets<Asset>(chatSpaceId, data)
      // Only adopt into the visible panel if the user is still on this
      // taskspace — a slow response for one they left must not replace it.
      if (useWorkspaceStore.getState().currentChatSpace?.id === chatSpaceId) {
        setAssets(data)
      }
      return data
    } catch (error) {
      // Rethrow-free, but mark the failure so callers can tell "the request
      // broke" apart from "there are genuinely no assets". Returning a bare []
      // made a failed fetch indistinguishable from an empty workspace, so a
      // network/500 surfaced to the user as "deliverable not found yet" and
      // sent them into a pointless retry loop.
      console.error('Error fetching assets:', error)
      const failed: any[] = []
      ;(failed as any).__fetchFailed = true
      return failed
    }
    })()

    // Coalescing, not caching: dropped the moment it settles, so the next
    // call after completion still goes to the network. `setCachedAssets` is
    // what makes a repeat open instant.
    assetsInFlight.current.set(chatSpaceId, run)
    try {
      return await run
    } finally {
      if (assetsInFlight.current.get(chatSpaceId) === run) {
        assetsInFlight.current.delete(chatSpaceId)
      }
    }
  }, [currentWorkspace?.id])

  const openDeliverableAsset = useCallback(async (assetId: string) => {
    if (!currentChatSpace?.id) return
    let asset = assets.find((a) => a.id === assetId)

    // The card can be clicked before the asset row is durable — the engine
    // announces the deliverable as soon as the turn completes, while persistence
    // finishes just behind it. A single refetch lost that race often enough that
    // users were told to "try again in a moment" for something that was about to
    // exist, so retry briefly before giving up.
    let fetchFailed = false
    if (!asset) {
      const RETRY_DELAYS_MS = [0, 400, 1200]
      for (const delay of RETRY_DELAYS_MS) {
        if (delay) await new Promise((r) => setTimeout(r, delay))
        const fresh = await fetchAssets(currentChatSpace.id)
        fetchFailed = Boolean((fresh as any).__fetchFailed)
        asset = fresh.find((a) => a.id === assetId)
        if (asset) break
      }
    }

    if (!asset) {
      // Say which failure this actually is; "not found yet" for a broken
      // request just sends the user back to click again.
      toast.error(
        fetchFailed
          ? "Couldn't load assets — check your connection and try again."
          : 'Deliverable not found in assets yet — try again in a moment.'
      )
      return
    }
    openPreviewPanel(tabForSelection({ kind: 'asset', asset }, attachments), { kind: 'asset', asset })
  }, [assets, attachments, currentChatSpace?.id, fetchAssets, openPreviewPanel])

  useEffect(() => {
    if (!currentChatSpaceId) return
    // Paint the last-known assets for this taskspace immediately, then
    // revalidate. On a first visit there is nothing cached and this is a no-op,
    // so the only change is that a RE-visit stops showing an empty panel while
    // the network round trip is in flight.
    const cached = getCachedAssets<Asset>(currentChatSpaceId)
    setAssets(cached ?? [])
    setAssetsLoaded(!!cached)
    void fetchAssets(currentChatSpaceId).finally(() => setAssetsLoaded(true))
  }, [currentChatSpaceId, fetchAssets])

  // ──────────────────────────────────────────────────────────────────────────────
  // CONFIG HANDLERS
  // ──────────────────────────────────────────────────────────────────────────────

  const toggleSource = (sourceId: string) => {
    const target = sources.find((s) => s.id === sourceId)
    if (!target || target.comingSoon || target.disabledReason) return

    const turningOn = !target.enabled
    if (
      target.category === 'connectors' &&
      turningOn &&
      sources.filter((source) => source.category === 'connectors' && source.enabled).length >= 10
    ) {
      toast.error('Select at most 10 connectors per TaskForce turn')
      return
    }

    // Side effects stay out of the setState updater: React may run an updater
    // more than once, which would fire these requests twice.
    const next = sources.map((s) => (s.id === sourceId ? { ...s, enabled: turningOn } : s))
    setSources(next)
    if (target.category !== 'connectors') return

    const token = useAuthStore.getState().token
    const enabledIds = next
      .filter((s) => s.category === 'connectors' && s.enabled)
      .map((s) => s.id)
    void persistEnabledConnectorIds(currentWorkspace?.id, enabledIds, token)

    const connector = workspaceConnectors.find((c) => c.server_id === sourceId)
    if (!turningOn || !connector || connector.enabled_for_workspace || !currentWorkspace?.id) return

    // Switching an app on here is the user saying "let TaskForce use this", but
    // the turn endpoint admits a connector only when it is enabled for the
    // workspace — and "no row" reads as disabled. So this write is what makes
    // the selection real, not a nicety.
    //
    // It must therefore not fail quietly. A swallowed failure left the app
    // looking selected while every following turn was refused 403 with a
    // message the chat then discarded; the user saw a working toggle and a
    // broken assistant. On failure the toggle goes back off and says why.
    void updateWorkspaceConnector(currentWorkspace.id, sourceId, {
      enabled: true,
      default_permission: connector.default_permission || 'needs_approval',
    })
      .then(() => refreshWorkspaceConnectors())
      .catch((error: unknown) => {
        setSources((prev) =>
          prev.map((s) => (s.id === sourceId ? { ...s, enabled: false } : s)),
        )
        void persistEnabledConnectorIds(
          currentWorkspace?.id,
          enabledIds.filter((id) => id !== sourceId),
          token,
        )
        toast.error(
          error instanceof Error && error.message
            ? `Could not enable ${target.name || 'this app'}: ${error.message}`
            : `Could not enable ${target.name || 'this app'} for this workspace.`,
        )
      })
  }

  const toggleModel = (modelId: string) => {
    setModels((prev) => prev.map((m) => ({ ...m, enabled: m.id === modelId })))
  }

  const toggleEngine = (engineId: string) => {
    const target = defaultEngines.find((e) => e.id === engineId)
    if (target?.comingSoon) return
    setEngines((prev) => prev.map((e) => ({ ...e, enabled: e.id === engineId })))
    localStorage.setItem('aselius_selected_engine', engineId)
    if (engineId !== 'rivine-chat') {
      setShowSources(false)
      setSources((prev) => {
        const next = prev.map((source) =>
          source.category === 'connectors' ? { ...source, enabled: false } : source,
        )
        void persistEnabledConnectorIds(currentWorkspace?.id, [], useAuthStore.getState().token)
        return next
      })
    }
  }

  const assertEngineCredits = useCallback((engineId: string): boolean => {
    if (creditsLoading) return false
    if (canSelectEngine(engineId, creditsBalance)) return true
    const min = getEngineMinCredits(engineId)
    const label = defaultEngines.find((e) => e.id === engineId)?.name ?? engineId
    toast.error(
      `${label} requires at least ${formatCredits(min ?? 0)} in prepaid credits. Add credits to continue.`,
      { duration: 5000, id: `engine-credits-${engineId}` },
    )
    return false
  }, [creditsBalance, creditsLoading])

  const handleToggleEngine = useCallback((engineId: string) => {
    if (!assertEngineCredits(engineId)) return
    toggleEngine(engineId)
  }, [assertEngineCredits])

  const handleStarterPrompt = useCallback((starter: StarterPrompt) => {
    if (!assertEngineCredits(starter.engineId)) return
    const target = defaultEngines.find((e) => e.id === starter.engineId)
    if (target?.comingSoon) return
    if (!resolveEngineSpecialty(starter.engineId, starter.specialtyId)) return

    toggleEngine(starter.engineId)
    setEngineSpecialties((prev) => ({ ...prev, [starter.engineId]: starter.specialtyId }))
    setMessage(starter.prompt)
    toast.success(`Ready · ${starter.engineLabel} · ${starter.specialtyLabel}`)
  }, [assertEngineCredits])

  // ──────────────────────────────────────────────────────────────────────────────
  // ASSET HELPERS
  // ──────────────────────────────────────────────────────────────────────────────

  const confirmDeleteAsset = async () => {
    if (!deleteConfirmModal.asset || !currentWorkspace) return
    try {
      await assetsApi.deleteAsset(currentWorkspace.id, deleteConfirmModal.asset.id)
      setAssets((prev) => {
        const next = prev.filter((a) => a.id !== deleteConfirmModal.asset!.id)
        // Keep the shared cache honest, or the Assets panel would paint the
        // deleted item back from cache the next time it opens.
        setCachedAssets<Asset>(currentChatSpace?.id ?? '', next)
        return next
      })
      setDeleteConfirmModal({ isOpen: false, asset: null })
      toast.success(`Successfully deleted ${deleteConfirmModal.asset.name}`)
    } catch { toast.error(`Failed to delete ${deleteConfirmModal.asset.name}`) }
  }

  const cancelDeleteAsset = () => setDeleteConfirmModal({ isOpen: false, asset: null })

  const requestDeleteTurn = useCallback((aiMessageId: string) => {
    setDeleteTurnModal({ isOpen: true, aiMessageId })
  }, [])

  const confirmDeleteTurn = async () => {
    const { aiMessageId } = deleteTurnModal
    if (!aiMessageId) return
    setDeleteTurnModal({ isOpen: false, aiMessageId: null })
    try {
      await deleteTurn(aiMessageId)
    } catch {
      // deleteTurn already reverts local state + toasts on failure.
    }
  }

  const cancelDeleteTurn = () => setDeleteTurnModal({ isOpen: false, aiMessageId: null })

  // ──────────────────────────────────────────────────────────────────────────────
  // FILE UPLOAD (markdown-first via file-management parser → workspace assets)
  // ──────────────────────────────────────────────────────────────────────────────

  const mapApiAssetToLocal = (asset: assetsApi.Asset): Asset => ({
    id: asset.id,
    name: asset.name,
    type: asset.type,
    creator: asset.creator,
    created_at: asset.created_at,
    last_updated: asset.last_updated,
    size: asset.size,
    format: asset.format,
    description: asset.description,
    tags: asset.tags,
    chatSpaceId: asset.chatSpaceId,
    content: asset.content,
    current_content: asset.current_content,
    language: asset.language,
    filePath: asset.filePath,
    url: asset.url,
  })

  const addParsedAssetAttachment = useCallback((
    asset: assetsApi.Asset,
    parsed: { markdown: string; sourceUrl?: string; parserEngine?: string },
    sourceFile?: File,
  ) => {
    setAssets((prev) => [mapApiAssetToLocal(asset), ...prev])
    setAttachments((prev) => {
      if (prev.length >= MAX_CHAT_ATTACHMENTS) return prev
      const next = [...prev, {
        type: 'file' as const,
        name: asset.name,
        file: sourceFile,
        assetId: asset.id,
        markdownPreview: snippetFromText(parsed.markdown, 200),
        sourceUrl: parsed.sourceUrl,
        parserEngine: parsed.parserEngine,
      }]
      if (!isMobile) {
        setTimeout(() => {
          const mapped = mapApiAssetToLocal(asset)
          const sel: PreviewSelection = { kind: 'asset', asset: mapped }
          openPreviewPanel(tabForSelection(sel, []), sel)
        }, 0)
      }
      return next
    })
  }, [isMobile, openPreviewPanel])

  const ensureAttachmentCapacity = (incomingCount = 1): boolean => {
    const remaining = MAX_CHAT_ATTACHMENTS - attachments.length
    if (remaining <= 0) {
      popupModal.showError('Attachment Limit', `You can attach up to ${MAX_CHAT_ATTACHMENTS} files per message.`)
      return false
    }
    if (incomingCount > remaining) {
      popupModal.showError('Attachment Limit', `Only ${remaining} more attachment${remaining === 1 ? '' : 's'} allowed (max ${MAX_CHAT_ATTACHMENTS}).`)
      return false
    }
    return true
  }

  /** The engine and specialty chip a message sent now would use (same resolution as send). */
  const currentEngineAndSpecialty = (): { engineId: string | null; specialtyId: string | null } => {
    const picked = seliusEngine.current
    const engine = (picked && defaultEngines.find((e) => e.id === picked.id))
      || engines.find((e) => e.enabled)
      || defaultEngines.find((e) => e.id === DEFAULT_ENGINE_ID)
    if (!engine) return { engineId: null, specialtyId: null }
    return { engineId: engine.id, specialtyId: picked?.specialty || engineSpecialties[engine.id] || null }
  }

  /** A raw image or video for a Rivine Creative chip: uploaded as is, never parsed to markdown. */
  const uploadCreativeFile = async (file: File) => {
    if (!currentChatSpace || !currentWorkspace) return
    setIsParsingAttachment(true)
    const toastId = toast.loading(`Uploading ${file.name}…`)
    try {
      const asset = await uploadCreativeMedia(
        file,
        { workspaceId: currentWorkspace.id, chatSpaceId: currentChatSpace.id },
        (pct, phase) => {
          toast.loading(phase === 'uploading' ? `Uploading ${file.name}… ${pct}%` : `Preparing ${file.name}…`, { id: toastId })
        },
      )
      setAttachments((prev) => (prev.length >= MAX_CHAT_ATTACHMENTS ? prev : [...prev, {
        type: 'file' as const,
        name: asset.name,
        file,
        assetId: asset.id,
        mediaKind: asset.kind,
      }]))
      void fetchAssets(currentChatSpace.id)
      toast.success(`"${asset.name}" attached`, { id: toastId })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      popupModal.showError('Upload Failed', msg)
      toast.error(msg, { id: toastId })
    } finally {
      setIsParsingAttachment(false)
    }
  }

  const parseAndAttachFile = async (file: File, options?: { assetName?: string }) => {
    if (!currentChatSpace || !currentWorkspace) {
      popupModal.showError('Upload Failed', 'No workspace selected')
      return
    }
    if (planLimits && planLimits.dailyUploadsRemaining <= 0) {
      popupModal.showError(
        'Daily Upload Limit',
        `You've used all ${planLimits.dailyUploadLimit} uploads for today. Resets at midnight UTC.`,
      )
      return
    }

    // Rivine Creative: images (and videos for the video chips) go to the media models untouched.
    const { engineId, specialtyId } = currentEngineAndSpecialty()
    const route = creativeUploadRoute(engineId, specialtyId, file)
    if (typeof route === 'object') {
      popupModal.showError('Upload Not Supported', route.refuse)
      return
    }
    if (route === 'raw') {
      await uploadCreativeFile(file)
      return
    }

    setIsParsingAttachment(true)
    const label = options?.assetName?.replace(/\.md$/i, '') ?? file.name
    const toastId = toast.loading(`Parsing ${label}…`)

    try {
      const parsed = await parseFileForWorkspace(
        file,
        (_pct, phase) => {
          toast.loading(phase === 'parsing' ? `Converting ${label} to markdown…` : `Uploading ${label}…`, { id: toastId })
        },
        { workspaceId: currentWorkspace.id, chatSpaceId: currentChatSpace.id },
      )
      const asset = await saveParsedMarkdownAsAsset(
        currentWorkspace.id,
        currentChatSpace.id,
        parsed,
        options?.assetName ? { assetName: options.assetName } : undefined,
      )
      addParsedAssetAttachment(asset, parsed, file)
      toast.success(`"${asset.name}" ready as markdown`, { id: toastId })
      refreshPlanLimits()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to parse file'
      popupModal.showError('Parse Failed', msg)
      toast.error(msg, { id: toastId })
    } finally {
      setIsParsingAttachment(false)
    }
  }

  /**
   * Upload a file from a clarification card.
   *
   * Same markdown-first pipeline the chat bar uses (parse -> asset), but the
   * asset is returned rather than pushed into the input's attachment tray:
   * the card sends it with the resume, so answering "which document?" with the
   * document does not require cancelling the pause and retyping the request.
   */
  const parseFileForCard = async (
    file: File,
  ): Promise<{ asset_id: string; filename: string } | null> => {
    if (!currentChatSpace || !currentWorkspace) {
      popupModal.showError('Upload Failed', 'No workspace selected')
      return null
    }
    if (planLimits && planLimits.dailyUploadsRemaining <= 0) {
      popupModal.showError(
        'Daily Upload Limit',
        `You've used all ${planLimits.dailyUploadLimit} uploads for today. Resets at midnight UTC.`,
      )
      return null
    }
    const toastId = toast.loading(`Parsing ${file.name}…`)
    try {
      const parsed = await parseFileForWorkspace(
        file,
        (_pct, phase) => {
          toast.loading(
            phase === 'parsing' ? `Converting ${file.name} to markdown…` : `Uploading ${file.name}…`,
            { id: toastId },
          )
        },
        { workspaceId: currentWorkspace.id, chatSpaceId: currentChatSpace.id },
      )
      const asset = await saveParsedMarkdownAsAsset(
        currentWorkspace.id,
        currentChatSpace.id,
        parsed,
      )
      toast.success(`"${asset.name}" ready as markdown`, { id: toastId })
      refreshPlanLimits()
      return { asset_id: asset.id, filename: asset.name }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to parse file'
      popupModal.showError('Parse Failed', msg)
      toast.error(msg, { id: toastId })
      return null
    }
  }

  const handleScreenshotCapture = async () => {
    if (!ensureAttachmentCapacity()) return
    try {
      const file = await captureScreenshotAsFile()
      await parseAndAttachFile(file, { assetName: 'Screenshot.md' })
    } catch (err) {
      if (err instanceof ScreenshotCancelledError) return
      const msg = err instanceof ScreenshotCaptureError
        ? err.message
        : err instanceof Error ? err.message : 'Screenshot failed'
      popupModal.showError('Screenshot Failed', msg)
      toast.error(msg)
    }
  }

  const applyClipboardPasteResult = async (
    result: Awaited<ReturnType<typeof readClipboardForAttachment>>,
  ) => {
    if (result.type === 'empty') {
      toast.error('Clipboard is empty or permission was denied')
      return
    }
    if (result.type === 'unsupported') {
      toast.error(result.reason)
      return
    }
    if (result.type === 'text') {
      if (!result.text.trim()) {
        toast.error('Clipboard has no text to paste')
        return
      }
      addTextAttachment(result.text)
      toast.success(`Text (${result.text.length} chars) added as attachment`)
      return
    }
    if (result.type === 'image') {
      await parseAndAttachFile(result.file)
    }
  }

  const handlePasteFromClipboard = async () => {
    if (!ensureAttachmentCapacity()) return
    try {
      const result = await readClipboardForAttachment()
      await applyClipboardPasteResult(result)
    } catch {
      toast.error('Could not read clipboard. Try Ctrl/Cmd+V in the input instead.')
    }
  }

  const handlePasteImageFile = async (file: File) => {
    if (!ensureAttachmentCapacity()) return
    await parseAndAttachFile(file)
  }

  const handleFileUpload = async (file: File) => {
    if (!ensureAttachmentCapacity()) return
    await parseAndAttachFile(file)
  }

  const handleFilesUpload = async (files: File[]) => {
    if (!files.length) return
    const { validateUploadBatch } = await import('@/lib/fileValidation')
    const { accepted, rejected } = validateUploadBatch(files)
    rejected.forEach(({ file, reason }) => toast.error(`${file.name}: ${reason}`))

    let slotsLeft = MAX_CHAT_ATTACHMENTS - attachments.length
    if (slotsLeft <= 0) {
      popupModal.showError('Attachment Limit', `You can attach up to ${MAX_CHAT_ATTACHMENTS} files per message.`)
      return
    }

    const batch = accepted.slice(0, slotsLeft)
    if (batch.length < accepted.length) {
      toast.error(`Only ${slotsLeft} more attachment${slotsLeft === 1 ? '' : 's'} allowed (max ${MAX_CHAT_ATTACHMENTS}).`)
    }

    for (const file of batch) {
      await parseAndAttachFile(file)
    }
  }

  const handleWebUrlParse = async (url: string) => {
    if (!ensureAttachmentCapacity()) return
    if (!currentChatSpace || !currentWorkspace) {
      popupModal.showError('Parse Failed', 'No workspace selected')
      return
    }

    setIsParsingAttachment(true)
    const toastId = toast.loading('Parsing URL…')

    try {
      const parsed = await parseUrlForWorkspace(url, (pct) => {
        toast.loading(`Parsing page… ${pct}%`, { id: toastId })
      })
      const asset = await saveParsedMarkdownAsAsset(currentWorkspace.id, currentChatSpace.id, parsed)
      addParsedAssetAttachment(asset, parsed)
      toast.success(`"${asset.name}" added from URL`, { id: toastId })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to parse URL'
      popupModal.showError('Parse Failed', msg)
      toast.error(msg, { id: toastId })
    } finally {
      setIsParsingAttachment(false)
    }
  }



  // ──────────────────────────────────────────────────────────────────────────────
  // ATTACHMENT HELPERS
  // ──────────────────────────────────────────────────────────────────────────────

  const removeAttachment = (index: number) => setAttachments((prev) => prev.filter((_, i) => i !== index))
  const addTextAttachment = (content: string) => {
    if (attachments.length >= MAX_CHAT_ATTACHMENTS) {
      popupModal.showError('Attachment Limit', `You can attach up to ${MAX_CHAT_ATTACHMENTS} items per message.`)
      return
    }
    setAttachments((prev) => {
      const next = [...prev, { type: 'text' as const, content, name: `text-${Date.now()}.txt` }]
      if (!isMobile) {
        setTimeout(() => {
          openPreviewPanel('attachments', { kind: 'attachment', index: next.length - 1 })
        }, 0)
      }
      return next
    })
  }
  const startEditingAttachment = (index: number) => {
    const att = attachments[index]
    if (att.type === 'text' && att.content) setEditingAttachment({ index, content: att.content })
  }
  const saveEditedAttachment = () => {
    if (editingAttachment) {
      setAttachments((prev) => prev.map((a, i) => i === editingAttachment.index ? { ...a, content: editingAttachment.content } : a))
      setEditingAttachment(null)
    }
  }
  const cancelEditingAttachment = () => setEditingAttachment(null)

  // ──────────────────────────────────────────────────────────────────────────────
  // VOICE
  // ──────────────────────────────────────────────────────────────────────────────

  const startVoiceTyping = () => { if (recognition && !isVoiceTyping) recognition.start() }
  const stopVoiceTyping = () => { if (recognition && isVoiceTyping) recognition.stop() }

  // ──────────────────────────────────────────────────────────────────────────────
  // CORE SEND MESSAGE (SSE streaming)
  // ──────────────────────────────────────────────────────────────────────────────

  const internalHandleSendMessage = async (content: string, messageAttachments: typeof attachments) => {
    if (!currentChatSpace || !currentWorkspace || !user || loading || isStreaming) return
    setLoading(true); setIsStreaming(true)
    userCancelledRef.current = false
    // Re-arm code-session detection for this turn; the lastAssistantEngine
    // fallback keeps the panel open for same-session code follow-ups.
    // codeRouted is (re)set by this turn's engine_selected event.
    setCodeStreamActive(false); setCodeRouted(false); setCodeLockedPaths([])
    // Diffs belong to the turn that produced them; carrying them over
    // would show the previous turn's changes against this one's files.
    setCodeDiffs([])
    // A fresh turn: drop any explicitly-opened saved project so the live build
    // (sandbox mode) takes the panel, not a stale asset view.
    setOpenProjectAssetId(null)

    const fullContent = buildMessagePrompt(content, messageAttachments)

    // Optimistic UI — store full prompt including <pasted_text> / <file_attachment> tags
    const optimisticUserMsg: ChatMessage = { id: `temp-${Date.now()}-user`, role: 'user', content: fullContent, created_at: new Date().toISOString() }
    useWorkspaceStore.getState().addMessage(optimisticUserMsg)
    const tempId = `temp-${Date.now()}-ai`
    const optimisticAiMsg: ChatMessage = { id: tempId, role: 'assistant', content: '', created_at: new Date().toISOString() }
    useWorkspaceStore.getState().addMessage(optimisticAiMsg)
    setStreamingAiMessageId(tempId)
    // Declared out here, not in the reader block, so `finally` can still name
    // the message it was writing to — including on the abort and error paths,
    // which are exactly the ones that would otherwise leave the last activity
    // row spinning forever.
    let currentAiId = tempId
    // The opening status names the engine that is about to run.
    {
      const pendingEngine = seliusEngine.current
      const startingEngine = (pendingEngine && defaultEngines.find((e) => e.id === pendingEngine.id))
        || engines.find((e) => e.enabled)
        || defaultEngines.find((e) => e.id === DEFAULT_ENGINE_ID)
      setLiveStatus(`${startingEngine?.name ?? 'Rivine'} is working…`)
    }

    const abortController = new AbortController()
    streamAbortRef.current = abortController

    try {
      const selectedModel = models.find((m) => m.enabled) || defaultModels.find((m) => m.enabled)
      const picked = seliusEngine.current
      seliusEngine.current = null
      const selectedEngine = (picked && defaultEngines.find((e) => e.id === picked.id))
        || engines.find((e) => e.enabled)
        || defaultEngines.find((e) => e.id === DEFAULT_ENGINE_ID)
      const enabledSources = sources
        .filter((source) => source.enabled && source.category !== 'connectors')
        .map((source) => ({ name: source.id, enabled: true }))
      const selectedConnectorIds = sources
        .filter((source) => source.enabled && source.category === 'connectors')
        .map((source) => source.id)
      const explicitTargetEngine = (selectedEngine?.id ?? DEFAULT_ENGINE_ID).replace(/-/g, '_')
      let connectorIds = explicitTargetEngine && explicitTargetEngine !== 'rivine_chat'
        ? []
        : [...selectedConnectorIds]
      // The engine the specialty belongs to.
      let specialtyEngineId: string | null = null

      let msgWithIntent = fullContent
      msgWithIntent += `\n\n${buildContextIdentityPrompt()}`
      if (selectedLanguage !== 'English') {
        msgWithIntent += `\n\n[User wants your AI response to be in ${selectedLanguage}.]`
      }
      let activeSpecialtyId: string | null = null
      let specialtyLabelForApi: string | null = null

      if (selectedEngine) {
        const specialty = resolveEngineSpecialty(selectedEngine.id, picked?.specialty || engineSpecialties[selectedEngine.id])
        if (specialty) {
          // The engine reads the structured `specialty` / `code_mode` fields
          // below; a "sub-agent" tag in the message invited role-play and drift.
          activeSpecialtyId = specialty.id
          specialtyLabelForApi = specialty.label
          specialtyEngineId = selectedEngine.id
        }
      }

      // Strip legacy routing pins (agentic_engine); the engine is chosen above.
      msgWithIntent = stripMediatorOnlyTags(msgWithIntent)
      // Connected apps belong to the TaskForce Chat agent only. The other
      // TaskForce specialties are standalone agents whose own app (Excalidraw,
      // Mermaid, HTML STEM/3D, YouTube, Code Execution) the backend builds —
      // they are never sent as connector ids.
      if (specialtyEngineId === TASKFORCE_ENGINE_ID && !specialtyUsesConnectedApps(specialtyEngineId, activeSpecialtyId)) {
        connectorIds = []
      }

      const apiAttachments = await Promise.all(
        messageAttachments.map(async (att: any) => {
          if (att.type === 'file' && att.assetId) return { type: 'file_reference', asset_id: att.assetId, filename: att.name }
          return null
        }),
      )

      const { token } = useAuthStore.getState()
      const response = await fetch(
        getAseliusStreamUrl(
          `workspaces/${currentWorkspace.id}/chats/${currentChatSpace.id}/stream`,
        ),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          signal: abortController.signal,
          body: JSON.stringify({
            message: msgWithIntent,
            workspace_id: currentWorkspace.id,
            chat_space_id: currentChatSpace.id,
            sources: enabledSources,
            connector_ids: connectorIds,
            target_engine: explicitTargetEngine,
            specialty: specialtyLabelForApi || activeSpecialtyId,
            user_propritize: specialtyLabelForApi || activeSpecialtyId,
            // Rivine Code dispatches on these two alone — no router, no
            // keyword matching, no classifier turn.
            code_mode: activeSpecialtyId,
            code_rate: codeRate,
            // Sent only when on, so an older backend sees the same body as before.
            ...(thorough ? { thorough: true } : {}),
            model: selectedModel ? { name: selectedModel.id, version: selectedModel.version } : null,
            // Ids only — the backend hydrates content server-side
            // (routes/chat.py::hydrate_user_attachments) as source of truth.
            attachments: apiAttachments.filter(Boolean),
          }),
        },
      )
      if (!response.ok) {
        // Reads `error` as well as `detail`: main.py's exception handler renames
        // FastAPI's detail to error, so reading only detail threw away every
        // message the backend sent — a turn refused for a specific, fixable
        // reason surfaced as a bare "Stream failed (403)".
        const detail = await readAseliusError(response, '')
        throw new Error(detail || `Stream failed (${response.status})`)
      }
      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      let sawFinalAnswer = false
      let sawCancelled = false
      let sawContinuing = false

      while (true) {
        if (userCancelledRef.current || abortController.signal.aborted) {
          try { await reader.cancel() } catch { /* ignore */ }
          break
        }
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const dataStr = line.slice(6)
          if (dataStr.trim() === '[DONE]') break
          try {
            const data = JSON.parse(dataStr)

            if (data.type === 'meta') { useWorkspaceStore.getState().updateMessageId(optimisticUserMsg.id, data.user_message_id); continue }
            if (data.type === 'error') {
              if (data.cancelled || userCancelledRef.current) {
                sawCancelled = true
                continue
              }
              const errText = data.content || 'Request failed'
              toast.error(errText)
              // Keep the bubble. Stream-end used to drop an empty assistant
              // message after a toast, so a failed Cicero/Research turn looked
              // like the engine never replied.
              accumulated = errText
              useWorkspaceStore.getState().updateMessageContent(currentAiId, errText)
              if (typeof document !== 'undefined' && document.hidden) {
                notifyWorkspaceTurnError({
                  workspaceName: currentWorkspace.name,
                  workspaceId: currentWorkspace.id,
                  chatSpaceId: currentChatSpace.id,
                  error: errText,
                })
              }
              continue
            }
            if (data.type === 'engine_selected') {
              // The engine for this turn is known. Open the Rivine Code file-system
              // panel the moment it's routed to rivine_code — no waiting for the
              // first code_file event (cold-path builds are silent for minutes).
              if (data.engine === 'rivine_code') { setCodeRouted(true); openPreviewPanel('code') }
              const engine = typeof data.engine === 'string' ? data.engine : ''
              if (engine) {
                // Stamp THIS streaming message only. The header and the bottom
                // chip both read targetEngine off the message, so a later turn
                // cannot rewrite an earlier bubble's engine.
                useWorkspaceStore.getState().updateMessageMetadata(currentAiId, {
                  targetEngine: engine,
                })
              }
              // "Routed to rivine_code" is internal plumbing spoken out loud:
              // it names a dispatch step the user did not ask about, using an
              // identifier rather than a product name. Say what is happening
              // to their work instead.
              const engineLabel = getEngineLabel(engine) || engine.replace(/_/g, ' ')
              if (engineLabel) setLiveStatus(`${engineLabel} is working…`)
              if (connectorIds.length > 0 && data.engine !== 'rivine_chat') {
                toast(
                  `${engineLabel || 'This engine'} handled this turn, so your app connectors were not used.`,
                )
              }
              continue
            }
            if (data.type === 'mcp_degraded') {
              const label = data.connector_label || data.connector_id || 'App connector'
              toast(
                `${label} was unresponsive — continuing with grounded web sources.`,
                { duration: 5000 },
              )
              setLiveStatus(`${label} unresponsive — using grounded sources`)
              continue
            }
            if (data.type === 'thought') {
              const label = data.title || 'Thinking…'
              setLiveStatus(label)
              // Also kept on the message, so the reasoning step stays visible
              // instead of being overwritten by the next one. Title only —
              // `content` is stripped server-side and stays there.
              pushActivity(currentAiId, { label, kind: 'thought' })
              continue
            }
            if (data.type === 'tool_result') { continue }

            if (data.type === 'mcp_artifact') {
              // Connector media/files persist as assets; conversation shows snapshot
              // cards only (email/calendar/HITL stay on InlineApprovalCard).
              const assetId = typeof data.asset_id === 'string' ? data.asset_id : undefined
              const kind = typeof data.kind === 'string' ? data.kind : 'file'
              const filename =
                typeof data.filename === 'string'
                  ? data.filename
                  : `${data.connector_label || data.connector_id || 'App'} ${data.tool_name || 'artifact'}`
              if (assetId) {
                const store = useWorkspaceStore.getState()
                const existingD =
                  store.messages.find((m) => m.id === currentAiId)?.deliverables ?? []
                if (!existingD.some((d) => d.assetId === assetId)) {
                  store.updateMessageMetadata(currentAiId, {
                    deliverables: [
                      ...existingD,
                      { assetId, filename, kind },
                    ],
                  })
                }
                void fetchAssets(currentChatSpace.id)
              }
              const label = data.connector_label || data.connector_id || 'App'
              const tool = data.tool_name || 'action'
              setLiveStatus(`${label}: ${tool} saved`)
              continue
            }

            if (data.type === 'stage') {
              if (data.status === 'start' || data.status === 'progress') {
                const label = data.label || data.node || 'Working…'
                setLiveStatus(label)
                pushActivity(currentAiId, { label, kind: 'stage' })
              }
              continue
            }

            if (data.type === 'tool_call_start') {
              const toolLabel = friendlyToolLabel(data.name, data.args)
              setLiveStatus(toolLabel)
              pushActivity(currentAiId, {
                id: data.tool_call_id,
                label: toolLabel,
                kind: 'tool',
              })
              if (data.name === 'execute' && data.args?.command && data.tool_call_id) {
                // Rivine Code's command/test log (see public_stream.py's
                // narrow §5.4 exception for the `execute` tool) — appended to
                // the in-progress AI message as a collapsible "Steps" entry,
                // same read-modify-write idiom as the `fragment` branch above.
                const store = useWorkspaceStore.getState()
                const existing = store.messages.find((m) => m.id === currentAiId)?.codeSteps ?? []
                store.updateMessageMetadata(currentAiId, {
                  codeSteps: [...existing, { id: data.tool_call_id, command: data.args.command, status: 'running' as const }],
                })
              }
              continue
            }
            if (data.type === 'tool_call_done') {
              if (data.name === 'execute' && data.tool_call_id) {
                const store = useWorkspaceStore.getState()
                const existing = store.messages.find((m) => m.id === currentAiId)?.codeSteps ?? []
                store.updateMessageMetadata(currentAiId, {
                  codeSteps: existing.map((s) =>
                    s.id === data.tool_call_id ? { ...s, output: data.result_preview, status: 'done' as const } : s
                  ),
                })
              }
              continue
            }

            if (data.type === 'ui_action' || data.type === 'tool_use') {
              const action = data.name || data.tool
              const payload = data.params || data
              if (action === 'open_image_canvas' && payload.imageUrl) {
                useWorkspaceStore.getState().updateMessageMetadata(currentAiId, { imageUrl: payload.imageUrl, imagePrompt: payload.prompt || payload.title })
                toast.success('Image generated!')
              }
              if ((action === 'open_canvas' || action === 'open_html') && payload.assetId) {
                // Append, don't overwrite. This handler used to only set the
                // singular `deliverableAssetId`, so a Chat turn that called
                // create_document three times ended with the LAST asset id and
                // the first two never appeared on the thread — they were saved
                // to Assets, so the work existed, but the transcript showed one
                // card and read as if the engine had dropped the rest.
                //
                // Same merge shape as the `fragment` branch below so the two
                // paths cannot disagree about what the turn produced.
                const store = useWorkspaceStore.getState()
                const existing = store.messages.find((m) => m.id === currentAiId)?.deliverables ?? []
                const assetId = String(payload.assetId)
                store.updateMessageMetadata(currentAiId, {
                  deliverables: existing.some((d) => d.assetId === assetId)
                    ? existing
                    : [...existing, {
                        assetId,
                        filename: payload.title,
                        kind: action === 'open_html' ? 'html' : 'document',
                      }],
                  deliverableAssetId: assetId,
                  deliverableFilename: payload.title,
                })
                fetchAssets(currentChatSpace.id)
              }
            }

            if (data.type === 'fragment') {
              // One event per deliverable (Research emits two: markdown + HTML).
              const snap = data.fragment_snapshot
              const nested = snap?.fragment_snapshot && typeof snap.fragment_snapshot === 'object'
                ? snap.fragment_snapshot
                : null
              const assetId = snap?.asset_id || nested?.asset_id
              const filename = snap?.filename || nested?.filename
              const kind = snap?.fragment_type || nested?.fragment_type || data.fragment_type
              if (assetId) {
                const store = useWorkspaceStore.getState()
                const existing = store.messages.find((m) => m.id === currentAiId)?.deliverables ?? []
                if (!existing.some((d) => d.assetId === assetId)) {
                  store.updateMessageMetadata(currentAiId, {
                    deliverables: [...existing, { assetId: String(assetId), filename, kind }],
                    deliverableAssetId: String(assetId),
                    deliverableFilename: filename,
                  })
                }
                fetchAssets(currentChatSpace.id)
              }
              continue
            }

            if (data.type === 'sandbox_ready' && data.url) {
              setActiveSandbox({
                url: data.url,
                fragmentType: data.fragment_type,
                sandboxId: data.sandbox_id ?? null,
                expired: false,
              })
              // Rivine Code owns the live iframe; do not open a panel-level Live tab.
              openPreviewPanel('code')
            }

            if (data.type === 'file_diff' && data.path) {
              // The change itself, as it lands. Manual rate used to ask with a
              // filename and a tool name, which is a permission prompt rather
              // than a review — approving "edit_file src/auth.py" says nothing
              // about what is being done to the auth.
              if (!codeStreamActive) { setCodeStreamActive(true); openPreviewPanel('code') }
              setCodeDiffs((prev) => {
                const next = prev.filter((d) => d.path !== data.path)
                return [...next, {
                  path: String(data.path),
                  stat: String(data.stat || ''),
                  patch: String(data.patch || ''),
                  added: Number(data.added || 0),
                  removed: Number(data.removed || 0),
                  isNew: Boolean(data.is_new),
                  isDelete: Boolean(data.is_delete),
                  binary: Boolean(data.binary),
                }].slice(-50)
              })
              setLiveStatus(String(data.stat || `Changed ${data.path}`))
              continue
            }

            if (data.type === 'code_file' && data.path) {
              // Rivine Code wrote/edited a file. This event only ever fires for
              // rivine_code (only it has write_file/edit_file), so it also flips
              // the Code workspace on and opens the panel.
              if (!codeStreamActive) { setCodeStreamActive(true); openPreviewPanel('code') }
              const rel = String(data.path)
              if (rel === '.') {
                setLiveStatus('Updating project files…')
              } else {
                const short = rel.split('/').filter(Boolean).slice(-2).join('/')
                setLiveStatus(data.status === 'writing' ? `Writing ${short}…` : `Saved ${short}`)
              }
              if (data.status === 'writing') {
                setCodeLockedPaths((p) => (p.includes(data.path) ? p : [...p, data.path]))
                // Surface the path in the file tree the instant the write starts,
                // not only after GET /sandbox/files succeeds on a later poll.
                codeWriteTick.current += 1
                setCodeLastWrite({ path: data.path, tick: codeWriteTick.current })
              } else if (data.status === 'written') {
                setCodeLockedPaths((p) => p.filter((x) => x !== data.path))
                codeWriteTick.current += 1
                setCodeLastWrite({ path: data.path, tick: codeWriteTick.current })
              }
              continue
            }

            if (data.type === 'code_project_checkpoint' && data.asset_id) {
              // The server has durably saved the project mid-build. Adopting the
              // id now gives the file panel a fallback it can read from the
              // moment the sandbox becomes unreachable, instead of showing an
              // empty tree for work that is safely persisted.
              setLiveProjectAssetId(String(data.asset_id))
              continue
            }

            if (data.type === 'turn_continuing') {
              // The server handed this turn to a fresh invocation so it can keep
              // working past a single invocation's time limit. This stream ends
              // here; the turn does not — it is followed through turn-status.
              sawContinuing = true
              setLiveStatus('Still working — continuing in the background…')
              continue
            }

            if (data.type === 'approval_request') {
              const pauseText = String(data.message || 'Approval required.').trim()
              setApprovalRequest({ tool: data.tool, tool_call_id: data.tool_call_id, args: data.args, ui_schema: data.ui_schema || {}, message: data.message, hitl_type: data.hitl_type ?? null, connector: data.connector ?? data.hitl_connector ?? null, thread_id: data.thread_id || `${currentWorkspace.id}_${currentChatSpace.id}` })
              if (!accumulated.trim() && pauseText) {
                accumulated = pauseText
                useWorkspaceStore.getState().updateMessageContent(currentAiId, pauseText)
              }
              continue
            }

            if (data.type === 'token' || data.type === 'content') {
              const piece = data.content || data.delta || ''
              if (piece) {
                if (liveStatus) setLiveStatus(null)
                accumulated += piece
                useWorkspaceStore.getState().updateMessageContent(currentAiId, accumulated)
              }
            }

            if (data.type === 'final_answer') {
              if (userCancelledRef.current || sawCancelled) continue
              sawFinalAnswer = true
              setLiveStatus(null)
              const finalContent = data.content || accumulated
              useWorkspaceStore.getState().updateMessageContent(currentAiId, finalContent)
              if (data.ai_message_id && currentAiId !== data.ai_message_id) {
                const newId = data.ai_message_id
                useWorkspaceStore.getState().updateMessageId(currentAiId, newId)
                currentAiId = newId; setStreamingAiMessageId(newId)
              }
              if (data.target_engine || data.mediator_mode) {
                useWorkspaceStore.getState().updateMessageMetadata(currentAiId, {
                  targetEngine: data.target_engine ?? undefined,
                  mediatorMode: data.mediator_mode ?? undefined,
                })
              }
              const incoming = normalizeDeliverableSnaps(data.deliverables)
              const fromSnap = snapshotCards(data as any)
              const store = useWorkspaceStore.getState()
              const existing = store.messages.find((m) => m.id === currentAiId)?.deliverables
              const merged = mergeDeliverableCards(existing, [...fromSnap, ...incoming])
              if (merged.length > 0) {
                // Merge (never wipe mid-stream cards if the final payload is incomplete).
                store.updateMessageMetadata(currentAiId, {
                  deliverables: merged,
                  deliverableAssetId: merged[0].assetId,
                  deliverableFilename: merged[0].filename,
                })
                const firstId = merged[0]?.assetId
                if (currentChatSpace?.id) {
                  void fetchAssets(currentChatSpace.id).then(() => {
                    if (firstId) void openDeliverableAsset(firstId)
                  })
                }
              }
              if (data.fragment_url && !activeSandbox) {
                setActiveSandbox({
                  url: data.fragment_url,
                  fragmentType: data.fragment_type,
                  sandboxId: null,
                  expired: false,
                })
                openPreviewPanel('code')
              }

              // Notify when user is away from the tab; skip noise while watching live.
              if (typeof document !== 'undefined' && document.hidden && !userCancelledRef.current) {
                const engineLabel = data.target_engine
                  ? String(data.target_engine).replace(/_/g, ' ')
                  : undefined
                const dedupeKey = `${currentChatSpace.id}:done:${data.ai_message_id || currentAiId}`
                if (turnNotifyDedupeRef.current !== dedupeKey) {
                  turnNotifyDedupeRef.current = dedupeKey
                  if (merged.length > 0 || data.fragment_snapshot?.asset_id) {
                    notifyWorkspaceDeliverableReady({
                      workspaceName: currentWorkspace.name,
                      workspaceId: currentWorkspace.id,
                      chatSpaceId: currentChatSpace.id,
                      filename: merged[0]?.filename || data.fragment_snapshot?.filename,
                      engineLabel,
                    })
                  } else {
                    notifyWorkspaceTurnDone({
                      workspaceName: currentWorkspace.name,
                      workspaceId: currentWorkspace.id,
                      chatSpaceId: currentChatSpace.id,
                      engineLabel,
                      preview: finalContent,
                    })
                  }
                }
              }
            }
          } catch { /* partial chunk — ignore */ }
        }
      }

      if (userCancelledRef.current || sawCancelled) {
        const store = useWorkspaceStore.getState()
        const aiMsg = store.messages.find((m) => m.id === currentAiId)
        if (aiMsg && !String(aiMsg.content || '').trim()) {
          store.removeMessage(currentAiId)
        }
      } else if (sawContinuing && !sawFinalAnswer) {
        // Not an ending: the turn is still running server-side. Hand the bubble
        // to the turn-status follower, which shows progress for as long as the
        // turn is live and fills in the final answer and deliverables when it
        // lands — minutes or hours later.
        useWorkspaceStore.getState().removeMessage(currentAiId)
        setFollowNonce((n) => n + 1)
      } else if (!sawFinalAnswer && !accumulated.trim()) {
        // Stream ended with no tokens and no final_answer (provider drop,
        // Lambda timeout). Keep a bubble — deleting it is how a working
        // Cicero turn looked like "nothing came out".
        const fallback = 'This request ended before a reply was produced. Please retry.'
        useWorkspaceStore.getState().updateMessageContent(currentAiId, fallback)
      }
    } catch (error: any) {
      if (error?.name === 'AbortError' || userCancelledRef.current) {
        const store = useWorkspaceStore.getState()
        const aiMsg = store.messages.find((m) => m.id === tempId || m.id === streamingAiMessageId)
        if (aiMsg && !String(aiMsg.content || '').trim()) {
          store.removeMessage(aiMsg.id)
        }
        // Soft toast is emitted by handleAbortStreaming; avoid double notify here.
      } else {
        console.error('Error sending message:', error)
        const errText = error?.message || 'Failed to send message'
        toast.error(errText)
        useWorkspaceStore.getState().updateMessageContent(tempId, errText)
        if (typeof document !== 'undefined' && document.hidden && currentWorkspace && currentChatSpace) {
          notifyWorkspaceTurnError({
            workspaceName: currentWorkspace.name,
            workspaceId: currentWorkspace.id,
            chatSpaceId: currentChatSpace.id,
            error: errText,
          })
        }
      }
    }
    finally {
      if (streamAbortRef.current === abortController) streamAbortRef.current = null
      // Close the trail before the spinner goes, so the last step does not sit
      // there looking like it is still running on a turn that has ended.
      settleActivity(currentAiId)
      setLoading(false)
      setIsStreaming(false)
      setStreamingAiMessageId(null)
      setLiveStatus(null)
      refreshCredits()
    }
  }

  const handleAbortStreaming = useCallback(async () => {
    if (!currentWorkspace || !currentChatSpace) return
    userCancelledRef.current = true
    streamAbortRef.current?.abort()
    setLiveStatus('Stopping…')
    try {
      const result = await cancelTurn(currentWorkspace.id, currentChatSpace.id)
      // Stopping is not discarding. Anything Rivine Code had written is saved
      // before the sandbox is torn down, so show it rather than leaving the
      // user to guess whether minutes of build work still exist.
      const salvaged = mergeDeliverableCards(
        undefined,
        normalizeDeliverableSnaps(result?.deliverables),
      )
      if (salvaged.length > 0) {
        const store = useWorkspaceStore.getState()
        const id = `salvaged-${Date.now()}-ai`
        store.addMessage({
          id,
          role: 'assistant',
          content: 'Stopped. The files written before you stopped it were saved — open the project below to pick it up.',
          created_at: new Date().toISOString(),
        })
        store.updateMessageMetadata(id, {
          deliverables: salvaged,
          deliverableAssetId: salvaged[0].assetId,
          deliverableFilename: salvaged[0].filename,
          targetEngine: 'rivine_code',
        })
        fetchAssets(currentChatSpace.id)
        toast('Generation stopped — your files were saved', { duration: 3500 })
      } else {
        toast('Generation stopped', { duration: 2000 })
      }
    } catch (err: any) {
      console.error('Cancel turn failed:', err)
      toast.error(err?.message || 'Failed to stop generation')
    } finally {
      setLoading(false)
      setIsStreaming(false)
      setStreamingAiMessageId((id) => {
        if (id) {
          const store = useWorkspaceStore.getState()
          const aiMsg = store.messages.find((m) => m.id === id)
          if (aiMsg && !String(aiMsg.content || '').trim()) {
            store.removeMessage(id)
          }
        }
        return null
      })
      setLiveStatus(null)
    }
  }, [currentWorkspace, currentChatSpace])

  const handleSendMessage = async () => {
    if (isInputLocked) {
      if (inputLockMessage) toast.error(inputLockMessage)
      return
    }
    if (loading || isStreaming) return
    if (creditsLoading) {
      toast.error('Loading your credit balance — try again in a moment.', { id: 'credits-loading' })
      return
    }
    const picked = seliusEngine.current
    const selectedEngine = (picked && defaultEngines.find((e) => e.id === picked.id))
      || engines.find((e) => e.enabled)
      || defaultEngines.find((e) => e.id === DEFAULT_ENGINE_ID)
    const specialtyForSend = picked?.specialty || (selectedEngine ? engineSpecialties[selectedEngine.id] : undefined)
    if (
      selectedEngine &&
      isSpecialtyRequired(selectedEngine.id) &&
      !isSpecialtySelectionComplete(selectedEngine.id, specialtyForSend)
    ) {
      seliusEngine.current = null
      seliusDraft.current = null
      toast.error('Select a specialty mode before sending your request')
      return
    }
    if (selectedEngine && !canSelectEngine(selectedEngine.id, creditsBalance)) {
      seliusEngine.current = null
      seliusDraft.current = null
      const min = getEngineMinCredits(selectedEngine.id)
      toast.error(`${selectedEngine.name} requires at least ${formatCredits(min ?? 0)} in prepaid credits.`)
      return
    }
    const content = (seliusDraft.current ?? message).trim()
    seliusDraft.current = null
    const hasTextAttachmentInput = attachments.some(
      (att) => att.type === 'text' && !!att.content?.trim(),
    )
    if (!content && !hasTextAttachmentInput) return
    // Clear the input immediately — don't wait for the response to finish
    // streaming, or the box sits there looking unsent for the whole request.
    setMessage(''); setAttachments([])
    void internalHandleSendMessage(content, attachments)
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // HITL
  // ──────────────────────────────────────────────────────────────────────────────

  const handleHITLDecision = async (
    decision: 'approved' | 'rejected',
    feedback?: string,
    modifiedArgs?: Record<string, unknown>,
    attachments?: Array<{ asset_id: string; filename: string }>,
  ) => {
    if (!approvalRequest || !currentWorkspace || !currentChatSpace) return
    const store = useWorkspaceStore.getState()
    // The question stays where it was asked, the answer goes under it as the
    // person's message, and the reply gets a bubble of its own. This is the
    // order the server now saves (question, answer, reply), so a reload shows
    // the same thread. Before 2026-10-04 the reply overwrote the question and
    // the answer was never shown at all.
    const question = [...store.messages].reverse().find((m) => m.role === 'assistant')
    if (question && !String(question.content || '').trim()) {
      store.updateMessageContent(question.id, approvalRequest.message)
    }
    const said = (feedback || '').trim()
    const names = (attachments || []).map((a) => a.filename).filter(Boolean)
    const answerText =
      (said ? (decision === 'approved' ? said : `Declined — ${said}`) : decision === 'approved' ? 'Approved' : 'Declined')
      + (names.length ? `\n\nAttached: ${names.join(', ')}` : '')
    const pending = approvalRequest
    const answerId = `msg-answer-${Date.now()}`
    store.addMessage({
      id: answerId,
      content: answerText,
      role: 'user',
      created_at: new Date().toISOString(),
    })
    const streamingId = `msg-resume-${Date.now()}`
    const priorDeliverables: { assetId: string; filename?: string; kind?: string }[] = []
    userCancelledRef.current = false
    const abortController = new AbortController()
    streamAbortRef.current = abortController
    try {
      const ASELIUS_BASE_URL = '/api/aselius'; const { token } = useAuthStore.getState()
      setApprovalRequest(null)
      setLoading(true)
      setIsStreaming(true)
      setStreamingAiMessageId(streamingId)
      setLiveStatus(
        decision === 'approved'
          ? 'Executing approved action…'
          : 'Cancelling action…',
      )
      store.addMessage({
        id: streamingId,
        content: '',
        role: 'assistant',
        created_at: new Date().toISOString(),
      })
      toast(decision === 'approved' ? 'Processing action...' : 'Action rejected')
      const res = await fetch(`${ASELIUS_BASE_URL}/workspaces/${currentWorkspace.id}/chats/${currentChatSpace.id}/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          thread_id: approvalRequest.thread_id,
          approved: decision === 'approved',
          decision,
          feedback,
          modified_args: modifiedArgs,
          // Files attached on the card. The backend hydrates these exactly as
          // it hydrates chat attachments, so the resumed turn reads them.
          attachments: (attachments || []).map((a) => ({
            type: 'file_reference',
            asset_id: a.asset_id,
            filename: a.filename,
          })),
        }),
        signal: abortController.signal,
      })
      if (!res.ok) {
        if (res.status === 409 && userCancelledRef.current) return
        if (res.status === 409) {
          // Nothing is waiting on this any more (answered elsewhere, or cancelled).
          store.removeMessage(streamingId)
          toast('That question is no longer open. Send the request again if you still need it.')
          return
        }
        throw new Error('Resume failed')
      }
      const data = await res.json()
      const continuation = data.context_metadata
      if (continuation?.paused && continuation?.hitl_type) {
        setApprovalRequest({
          tool: continuation.hitl_tool || null,
          tool_call_id: continuation.hitl_tool_call_id || null,
          args: continuation.hitl_args || {},
          ui_schema: continuation.hitl_ui_schema || {},
          message: continuation.hitl_prompt || data.response || 'Approval required',
          thread_id: continuation.thread_id || approvalRequest.thread_id,
          hitl_type: continuation.hitl_type,
          connector: continuation.hitl_connector || null,
        })
        store.updateMessageContent(streamingId, continuation.hitl_prompt || data.response || 'Approval required')
        toast('Rivine needs you again')
        return
      }
      if (continuation?.continuing) {
        // The approved work is long and has moved to a background invocation.
        // Same hand-over as a streamed turn: drop the empty bubble made for
        // this resume and let the turn-status follower show progress and the
        // final answer when it lands.
        store.removeMessage(streamingId)
        setFollowNonce((n) => n + 1)
        toast('Still working — continuing in the background')
        return
      }
      const targetId = streamingId
      if (data.response) {
        store.updateMessageContent(targetId, data.response)
        if (data.ai_message_id) store.updateMessageId(targetId, data.ai_message_id)
      }
      const metaPatch: Record<string, unknown> = {}
      const incomingArtifacts = Array.isArray(continuation?.mcp_artifacts)
        ? continuation.mcp_artifacts
        : []
      if (incomingArtifacts.length > 0) {
        const storeMsgs = useWorkspaceStore.getState().messages
        const existingD =
          (storeMsgs.find((m) => m.id === targetId)?.deliverables as
            | { assetId: string; filename?: string; kind?: string }[]
            | undefined) ?? priorDeliverables
        const merged = [...existingD]
        for (const art of incomingArtifacts) {
          const assetId = art?.asset_id
          if (!assetId || merged.some((d) => d.assetId === assetId)) continue
          merged.push({
            assetId,
            filename: art.filename || `${art.connector_label || 'App'} ${art.tool_name || 'artifact'}`,
            kind: art.kind || 'file',
          })
        }
        metaPatch.deliverables = merged
        setLiveStatus('Artifact saved')
      }
      const incomingDeliverables = normalizeDeliverableSnaps(continuation?.deliverables)
      if (incomingDeliverables.length > 0) {
        metaPatch.deliverables = mergeDeliverableCards(priorDeliverables, incomingDeliverables)
        if (!metaPatch.deliverableAssetId && incomingDeliverables[0]?.assetId) {
          metaPatch.deliverableAssetId = incomingDeliverables[0].assetId
          metaPatch.deliverableFilename = incomingDeliverables[0].filename
        }
      } else if (continuation?.fragment_snapshot?.asset_id) {
        const snapCard = {
          assetId: String(continuation.fragment_snapshot.asset_id),
          filename: continuation.fragment_snapshot.filename as string | undefined,
          kind: continuation.fragment_snapshot.fragment_type as string | undefined,
        }
        metaPatch.deliverables = mergeDeliverableCards(priorDeliverables, [snapCard])
        metaPatch.deliverableAssetId = snapCard.assetId
        metaPatch.deliverableFilename = snapCard.filename
      }
      if (Object.keys(metaPatch).length > 0) {
        const finalId = data.ai_message_id || targetId
        store.updateMessageMetadata(finalId, metaPatch)
      }
      const openAssetId =
        (incomingDeliverables[0]?.assetId as string | undefined)
        || (continuation?.fragment_snapshot?.asset_id as string | undefined)
      if (currentChatSpace?.id) {
        await fetchAssets(currentChatSpace.id)
        if (openAssetId) await openDeliverableAsset(openAssetId)
      }
      toast.success(decision === 'approved' ? 'Action completed' : 'Action rejected')
    } catch (error: any) {
      if (error?.name !== 'AbortError' && !userCancelledRef.current) {
        // The turn is still paused on the server: put the question back so it
        // can be answered again.
        useWorkspaceStore.getState().removeMessage(streamingId)
        useWorkspaceStore.getState().removeMessage(answerId)
        setApprovalRequest(pending)
        toast.error('Failed to process decision. Please try again.')
      }
    }
    finally {
      if (streamAbortRef.current === abortController) streamAbortRef.current = null
      settleActivity(streamingId)
      setLoading(false)
      setIsStreaming(false)
      setStreamingAiMessageId(null)
      setLiveStatus(null)
    }
  }

  useEffect(() => registerSeliusComposer({
    select(engineId, specialtyId) {
      seliusEngine.current = { id: engineId, specialty: specialtyId }
      toggleEngine(engineId)
      if (specialtyId) setEngineSpecialties((prev) => ({ ...prev, [engineId]: specialtyId }))
    },
    async send(text) {
      if (loading || isStreaming) return 'A turn is already running.'
      seliusDraft.current = text
      setMessage(text)
      await handleSendMessage()
      return 'Sent.'
    },
    async answer(decision, text) {
      // The question card's own path: the answer is shown, saved to the thread, and resumes the turn.
      if (!approvalRequest) return 'Nothing is waiting for an answer.'
      await handleHITLDecision(decision, text.trim() || undefined)
      return decision === 'approved' ? 'Answered.' : 'Declined.'
    },
    snapshot() {
      const engine = engines.find((e) => e.enabled)
      return {
        engineId: engine?.id ?? null,
        engineName: engine?.name ?? null,
        specialtyId: engine ? (engineSpecialties[engine.id] ?? null) : null,
        streaming: isStreaming || loading,
        waiting: approvalRequest?.message ?? null,
        workspaceId: currentWorkspace?.id ?? null,
        workspaceName: currentWorkspace?.name ?? null,
        taskspaceId: currentChatSpace?.id ?? null,
        taskspaceName: currentChatSpace?.title ?? null,
      }
    },
  }), [engines, engineSpecialties, isStreaming, loading, approvalRequest, currentWorkspace, currentChatSpace])

  // ──────────────────────────────────────────────────────────────────────────────
  // RENDER GUARD
  // ──────────────────────────────────────────────────────────────────────────────

  // A workspace is open and its taskspace is on the way: the list is still
  // loading, or it has arrived and the selection has not landed yet. Both are
  // "wait a moment", and both used to render as "you have nothing".
  if (!currentChatSpace && (storeLoading || chatSpaces.length > 0)) {
    return <TaskspaceLoadingSkeleton darkMode={darkMode} />
  }

  if (!currentChatSpace) {
    return (
      <div className="flex-1 flex items-center justify-center !bg-canvas dark:!bg-gray-900 p-8 transition-colors duration-300">
        <div className="text-center max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl bg-[#00477d]/90 border border-white/20 dark:border-white/10">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:!text-white mb-4 transition-colors duration-300">
            No {TASKSPACE_SINGULAR} Selected
          </h3>
          <p className="text-lg text-gray-600 dark:!text-gray-400 leading-relaxed mb-6 transition-colors duration-300">
            Create or select a taskspace to start your AI-powered productivity workspace with Aselius
          </p>
          {canManageChatSpaces(workspaceRole) && (
            <Button
              onClick={() => window.dispatchEvent(new CustomEvent('createNewSpace'))}
              className="text-white px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
              style={{ backgroundColor: '#00477d' } as React.CSSProperties}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Taskspace
            </Button>
          )}
        </div>
      </div>
    )
  }

  const chatInputProps = {
    value: message,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value),
    onSend: handleSendMessage,
    loading,
    sources, models, engines,
    toggleSource, toggleModel, toggleEngine: handleToggleEngine,
    showSources, setShowSources,
    showModels, setShowModels,
    showAttachmentDropdown, setShowAttachmentDropdown,
    isVoiceTyping, startVoiceTyping, stopVoiceTyping,
    handleFileUpload: handleFilesUpload,
    addTextAttachment,
    attachments, removeAttachment, startEditingAttachment,
    onParseWebUrl: handleWebUrlParse,
    onTakeScreenshot: handleScreenshotCapture,
    onPasteFromClipboard: handlePasteFromClipboard,
    onPasteImageFile: handlePasteImageFile,
    isParsingAttachment,
    maxAttachments: MAX_CHAT_ATTACHMENTS,
    isStreaming, onAbortStreaming: handleAbortStreaming,
    engineSpecialties, setEngineSpecialties,
    creditsBalance,
    onClearSources: () => {
      setSources((p) => p.map((s) => ({ ...s, enabled: false })))
      void persistEnabledConnectorIds(currentWorkspace?.id, [], useAuthStore.getState().token)
    },
    refs: { sourcesRef, modelsRef },
    onOpenPreviewPanel: openPreviewPanel,
    onAttachmentClick: (index: number) => {
      const sel: PreviewSelection = { kind: 'attachment', index }
      openPreviewPanel(tabForSelection(sel, attachments), sel)
    },
    isInputLocked,
    inputLockMessage,
    isCreditsLocked,
    onInputActivity: signalTyping,
    connectorManageHref:
      currentWorkspace && currentChatSpace
        ? `/workspace/${currentWorkspace.id}/${currentChatSpace.id}/connector`
        : '/connector',
    onRefreshConnectors: () => {
      void refreshWorkspaceConnectors()
    },
    // Lets the Connect Apps menu tell "still fetching" from "confirmed zero" —
    // without it, an empty `sources` list during the fetch read as "you have
    // no connected apps" for a user who had several.
    connectorsLoading: workspaceConnectorsLoading,
    // Compact the toolbar whenever the input column is actually narrow —
    // either because the side-by-side panel is eating half of it, or because
    // the viewport itself is small. Keying only on panel state meant a 375px
    // phone (no panel) rendered full-size pills and the send button got
    // squeezed, while a wide desktop with the panel open compacted correctly.
    isCompact: (showPreviewPanel && !usePanelOverlay) || isMobile,
    // Rate must reach both EnhancedChatInput sites. Empty-state used to wire
    // these ad-hoc; the messages-path input only spread chatInputProps — so
    // Bypass became a dead click after the first message.
    codeRate,
    onCodeRateChange: updateCodeRate,
    thorough,
    onThoroughChange: updateThorough,
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="relative flex-1 flex flex-col min-h-0 !bg-canvas dark:!bg-gray-900 h-full overflow-hidden transition-colors duration-300"
    >
      <div ref={splitContainerRef} className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* ── Messages + Input (hidden in panel fullscreen mode) ─────────── */}
        {!isPanelFullscreen && (
        <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden transition-all duration-300" data-taskspace-surface>
          <div className="flex-shrink-0 relative z-30 overflow-visible border-b border-gray-200/60 dark:border-gray-700/60 !bg-canvas/95 dark:!bg-gray-900/95 backdrop-blur-sm">
            <ChatSpaceHeader
              currentChatSpace={currentChatSpace}
              models={models}
              sources={sources}
              selectedLanguage={selectedLanguage}
              onSelectLanguage={setSelectedLanguage}
              onOpenAssets={() => openPreviewPanel('assets')}
              attachmentCount={attachments.length}
              isPreviewPanelOpen={showPreviewPanel}
              hideAssetsButton={showPreviewPanel && !isMobile}
              isMobile={isMobile}
            />
          </div>
          {loadingMessages ? (
            <div
              className="flex-1 min-h-0 overflow-hidden px-4 sm:px-8 py-6 space-y-6 max-w-3xl mx-auto w-full"
              aria-busy="true"
              aria-label="Loading messages"
            >
              <div className="flex justify-end">
                <Bone className="h-10 w-2/5 rounded-2xl" darkMode={darkMode} />
              </div>
              <div className="space-y-2">
                <Bone className="h-4 w-3/4" darkMode={darkMode} />
                <Bone className="h-4 w-1/2" darkMode={darkMode} />
                <Bone className="h-4 w-2/3" darkMode={darkMode} />
              </div>
              <div className="flex justify-end">
                <Bone className="h-8 w-1/3 rounded-2xl" darkMode={darkMode} />
              </div>
            </div>
          ) : messages.length === 0 && messagesFetched ? (
            /* ── Empty state ─────────────────────────────────────────────── */
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 sm:py-10 pt-4">
                <TaskspaceEmptyState
                  title={formatTaskspaceTitle(currentChatSpace.title)}
                  onSelectStarter={handleStarterPrompt}
                />
              </div>
              <div className="flex-shrink-0 px-3 sm:px-6 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1 border-t border-gray-200/80 dark:border-gray-700/80 !bg-canvas dark:!bg-gray-900">
                <div className="w-full max-w-4xl mx-auto">
                  <EnhancedChatInput
                    {...chatInputProps} placeholder="Complete any task operations with the Aselius workspace..." />
                </div>
              </div>
            </div>
          ) : (
            /* ── Messages list ───────────────────────────────────────────── */
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-3 sm:px-6 pt-2 pb-3 min-h-0 scroll-smooth overscroll-contain">
                <div className="max-w-4xl mx-auto w-full space-y-3">
                <AnimatePresence>
                  {(() => {
                    const unique = messages.filter((msg, i, self) => i === self.findIndex((t) => t.id === msg.id))
                    const aiMessages = unique.filter((m) => m.role === 'assistant' || m.role === 'ai')
                    const totalAI = aiMessages.length
                    const lastUserMessageId = [...unique].reverse().find((m) => m.role === 'user')?.id

                    return unique.map((msg, index) => {
                      const isAssistant = msg.role === 'assistant' || msg.role === 'ai'
                      const aiIdx = isAssistant ? aiMessages.findIndex((a) => a.id === msg.id) : undefined
                      const vm = msg as ExtendedChatMessage
                      const nextMsg = index < unique.length - 1 ? unique[index + 1] : null
                      const isStreamingThis = vm.id === streamingAiMessageId
                      // Divider after a full turn (user + completed AI), not between question and answer.
                      const showTurnDivider =
                        isAssistant &&
                        !isStreamingThis &&
                        (nextMsg?.role === 'user' || index === unique.length - 1)

                      return (
                        // Plain div, deliberately: this was a motion.div with
                        // `transition={{ delay: index * 0.03 }}`, so every
                        // message staggered in on open — a 20-message taskspace
                        // took ~600ms for the last row to appear, and re-played
                        // that on every switch. Messages now paint instantly;
                        // live feedback for NEW messages still comes from the
                        // streaming indicator, which is the honest signal.
                        <div key={msg.id} className="w-full">
                          <EnhancedMarkdownMessage
                                content={vm.content}
                                isUser={vm.role === 'user'}
                                messageId={vm.id}
                                onDeleteTurn={isAssistant ? requestDeleteTurn : undefined}
                                timestamp={vm.created_at}
                                isStreaming={vm.id === streamingAiMessageId}
                                liveStatus={vm.id === streamingAiMessageId ? liveStatus : null}
                                activity={vm.activity}
                                messageIndex={index}
                                totalMessages={unique.length}
                                aiMessageIndex={aiIdx}
                                totalAIMessages={totalAI}
                                imageUrl={vm.imageUrl}
                                imagePrompt={vm.imagePrompt}
                                deliverableAssetId={vm.deliverableAssetId}
                                deliverableFilename={vm.deliverableFilename}
                                deliverables={vm.deliverables}
                                optimizedIntent={vm.optimizedIntent}
                                targetEngine={vm.targetEngine}
                                mediatorMode={vm.mediatorMode}
                                codeSteps={vm.codeSteps}
                                onSnapshotClick={openMessageSnapshot}
                                onOpenProject={openCodeProject}
                                onOpenDeliverable={(assetId) => { void openDeliverableAsset(assetId) }}
                                resolveAsset={(assetId) => assets.find((a) => a.id === assetId)}
                                isLatestUserMessage={vm.role === 'user' && vm.id === lastUserMessageId}
                              />
                          {showTurnDivider && (
                            <div
                              className="my-4 h-px w-full bg-gray-300 dark:bg-gray-600"
                              role="separator"
                              aria-hidden
                            />
                          )}
                        </div>
                      )
                    })
                  })()}
                </AnimatePresence>

                {/* HITL approval (email/calendar/tool confirmations) stay inline. */}
                {approvalRequest && (
                  <div className="flex justify-center pb-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="w-full max-w-4xl px-4">
                      <InlineApprovalCard
                        request={approvalRequest}
                        onApprove={(feedback, modifiedArgs, attachments) => handleHITLDecision('approved', feedback, modifiedArgs, attachments)}
                        onAttachFile={parseFileForCard}
                        onReject={(feedback) => handleHITLDecision('rejected', feedback)}
                      />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="flex-shrink-0 px-3 sm:px-6 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1 border-t border-gray-200/80 dark:border-gray-700/80 !bg-canvas dark:!bg-gray-900">
                <div className="w-full max-w-4xl mx-auto">
                  <EnhancedChatInput {...chatInputProps} placeholder="Continue with task operations in the Aselius Workspace..." />
                </div>
              </div>
            </div>
          )}
        </div>
        )}

        {/* ── Preview Panel (side-by-side, only when there is room) ───────── */}
        {!usePanelOverlay && showPreviewPanel && (
          <AnimatePresence>
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{
                width: isPanelFullscreen ? '100%' : panelWidth,
                opacity: 1,
              }}
              exit={{ width: 0, opacity: 0 }}
              transition={
                isResizingPanel
                  ? { duration: 0 }
                  : { duration: 0.2, ease: [0.23, 1, 0.32, 1] }
              }
              className={[
                'flex-shrink-0 border-l border-gray-200 dark:border-gray-700 shadow-xl relative overflow-hidden h-full',
                isPanelFullscreen ? 'absolute inset-0 z-30 border-l-0' : '',
              ].join(' ')}
            >
              {!isPanelFullscreen && <ResizeHandle onPointerDown={startResizing} />}
              <PreviewPanel
                isOpen={showPreviewPanel}
                onClose={closePreviewPanel}
                isMobile={false}
                activeTab={previewTab}
                onTabChange={setPreviewTab}
                selection={previewSelection}
                onSelect={setPreviewSelection}
                workspaceId={currentWorkspace?.id || ''}
                chatSpaceId={currentChatSpace.id}
                chatSpaceTitle={formatTaskspaceTitle(currentChatSpace.title)}
                attachments={attachments}
                removeAttachment={removeAttachment}
                startEditingAttachment={startEditingAttachment}
                setDeleteConfirmModal={setDeleteConfirmModal}
                isFullscreen={isPanelFullscreen}
                onToggleFullscreen={togglePanelFullscreen}
                showShareTab={canShare}
                workspaceName={currentWorkspace?.name || ''}
                workspaceUserRole={currentWorkspace?.user_role || 'owner'}
                onSharesChanged={() => useWorkspaceStore.getState().fetchWorkspaces()}
                onAssetContentSaved={handleAssetContentSaved}
                activeSandbox={activeSandbox}
                onSandboxExpired={() => setActiveSandbox((s) => (s ? { ...s, expired: true } : s))}
                onSandboxBooted={(booted) => setActiveSandbox({ ...booted, expired: false })}
                codeSession={codeSession}
                codeLockedPaths={codeLockedPaths}
          codeDiffs={codeDiffs}
                codeLastWrite={codeLastWrite}
                openProjectAssetId={openProjectAssetId}
                codeProjectAssetId={chatProjectAssetId}
                onOpenProjectAsset={openCodeProject}
                isDark={isDark}
                assetsLocked={isCreditsLocked}
                assetsLockedMessage={CREDITS_LOCKDOWN_MESSAGE}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Overlay preview panel — phones AND any container too narrow to split */}
      {usePanelOverlay && showPreviewPanel && currentWorkspace && (
        <PreviewPanel
          isOpen={showPreviewPanel}
          onClose={closePreviewPanel}
          isMobile
          activeTab={previewTab}
          onTabChange={setPreviewTab}
          selection={previewSelection}
          onSelect={setPreviewSelection}
          workspaceId={currentWorkspace.id}
          chatSpaceId={currentChatSpace.id}
          chatSpaceTitle={formatTaskspaceTitle(currentChatSpace.title)}
          attachments={attachments}
          removeAttachment={removeAttachment}
          startEditingAttachment={startEditingAttachment}
          setDeleteConfirmModal={setDeleteConfirmModal}
          isFullscreen
          showShareTab={canShare}
          workspaceName={currentWorkspace.name}
          workspaceUserRole={currentWorkspace.user_role || 'owner'}
          onSharesChanged={() => useWorkspaceStore.getState().fetchWorkspaces()}
          onAssetContentSaved={handleAssetContentSaved}
          activeSandbox={activeSandbox}
          onSandboxExpired={() => setActiveSandbox((s) => (s ? { ...s, expired: true } : s))}
                onSandboxBooted={(booted) => setActiveSandbox({ ...booted, expired: false })}
          codeSession={codeSession}
          codeLockedPaths={codeLockedPaths}
          codeDiffs={codeDiffs}
          codeLastWrite={codeLastWrite}
          openProjectAssetId={openProjectAssetId}
          codeProjectAssetId={chatProjectAssetId}
          onOpenProjectAsset={openCodeProject}
          isDark={isDark}
          assetsLocked={isCreditsLocked}
          assetsLockedMessage={CREDITS_LOCKDOWN_MESSAGE}
        />
      )}

      {/* ── Overlay Modals ──────────────────────────────────────────────────── */}
      <DeleteConfirmModal isOpen={deleteConfirmModal.isOpen} asset={deleteConfirmModal.asset} onConfirm={confirmDeleteAsset} onCancel={cancelDeleteAsset} />
      <ConfirmModal
        isOpen={deleteTurnModal.isOpen}
        title="Delete this message thread?"
        message="Are you sure you want to delete this specific thread, you are aware this would delete your intent and AI deliverables attached to this message."
        confirmLabel="Delete"
        onConfirm={confirmDeleteTurn}
        onCancel={cancelDeleteTurn}
      />

      {/* Edit attachment */}
      {editingAttachment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="!bg-canvas rounded-2xl shadow-2xl max-w-4xl w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Edit Text Attachment</h3>
              <button onClick={cancelEditingAttachment} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="mb-6">
              <textarea value={editingAttachment.content} onChange={(e) => setEditingAttachment({ ...editingAttachment, content: e.target.value })} className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Edit your text content..." />
              <div className="text-xs text-gray-500 mt-2">{editingAttachment.content.length} characters</div>
            </div>
            <div className="flex items-center justify-end space-x-3">
              <button onClick={cancelEditingAttachment} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
              <button onClick={saveEditedAttachment} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"><CheckCircle className="w-4 h-4" /><span>Done</span></button>
            </div>
          </div>
        </div>
      )}

      {/* PopupModal */}
      <PopupModal isOpen={popupModal.modal.isOpen} onClose={popupModal.hideModal} type={popupModal.modal.type} title={popupModal.modal.title} message={popupModal.modal.message} duration={popupModal.modal.duration} />
    </div>
  )
}

export default ChatSpace