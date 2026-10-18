/**
 * InputArea.tsx  —  Refactored
 *
 * Layout:
 *  • ChatSpaceHeader  → Language dropdown + Assets (top bar)
 *  • EnhancedChatInput → Claude-style box:
 *      textarea on top; bottom row = attach · agentic engines · send
 *  • Outer toolbar: Connect Apps · Thorough · Voice
 */

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Code, FileText, Loader2, Database, Zap,
  Globe, BookOpen, Calculator, MessageSquare,
  ChevronDown, FolderOpen, Maximize2, Minimize2,
  Square, Mic, MicOff, Languages, Heart, TrendingUp, Paperclip,
  X, ArrowUp, Search, BarChart3, Video, Palette, Sparkles, Camera, Layers,
  ExternalLink, Coins, Gauge,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import { getMinimalUserProfile } from '@/utils/settingAPI'
import { minProfileQueryKey } from '@/lib/displayHandle'

import type { Source, Tool, Model } from './ChatSpace'
import { AttachmentSnapshot, snapshotFromPendingAttachment } from './AttachmentSnapshot'
import { readClipboardEvent } from '../../lib/clipboardAttachments'
import {
  engineHasSpecialties,
  getSpecialtyOptions,
  specialtyUsesConnectedApps,
  TASKFORCE_ENGINE_ID,
  isSpecialtyRequired,
  isSpecialtySelectionComplete,
  resolveEngineSpecialty,
  type EngineSpecialtyOption,
} from './engineSpecialties'
import { canSelectEngine, formatCredits, getEngineMinCredits } from '@/lib/creditConfig'
import { prefetchUserLocation } from './contextIdentity'
import { getEngineDisplayLabel } from './engineDisplayLabels'
import { engineMinBadgeClass, engineSoonBadgeClass } from './engineAccents'

export {
  buildContextIdentityPrompt,
  getUserContextIdentity,
  prefetchUserLocation,
} from './contextIdentity'

// ─────────────────────────────────────────────────────────────────────────────
// Available languages
// ─────────────────────────────────────────────────────────────────────────────
export const availableLanguages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
  'Chinese (Simplified)', 'Chinese (Traditional)', 'Japanese', 'Korean', 'Arabic',
  'Hindi', 'Nigerian Pidgin', 'Turkish', 'Dutch', 'Swedish', 'Norwegian', 'Danish',
  'Finnish', 'Polish', 'Czech', 'Hungarian', 'Romanian', 'Bulgarian', 'Croatian',
  'Serbian', 'Slovak', 'Slovenian', 'Estonian', 'Latvian', 'Lithuanian', 'Greek',
  'Hebrew', 'Persian', 'Urdu', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati',
  'Kannada', 'Malayalam', 'Punjabi', 'Thai', 'Vietnamese', 'Indonesian', 'Malay',
  'Filipino', 'Swahili', 'Yoruba', 'Igbo', 'Hausa', 'Amharic', 'Nepali', 'Sinhala',
  'Mongolian', 'Kurdish', 'English(UK)', 'English(AU)', 'English(CA)',
  'English(South African)', 'English(Nigerian)',
]

// ─────────────────────────────────────────────────────────────────────────────
// Default Sources
// ─────────────────────────────────────────────────────────────────────────────
export const defaultSources: Source[] = [
]

// ─────────────────────────────────────────────────────────────────────────────
// Default Models
// ─────────────────────────────────────────────────────────────────────────────
export const defaultModels: Model[] = [
  /*{ id: 'gpt-oss-20b', name: 'GPT-OSS-20B', description: 'Absolute cheapest option for general text', icon: 'Zap', enabled: true, isPaid: false, version: '20B', plan: 'Free Plan' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', description: "Google's native speed model", icon: 'Zap', enabled: false, isPaid: false, version: '2.0', plan: 'Free Plan' },
  { id: 'rivine-1o-ace', name: 'Rivine-1o-ace', description: "Beunec's self-aware and reflective llm powered by ACE", icon: 'Sparkles', enabled: false, isPaid: false, version: '1.0', plan: 'Free Plan', comingSoon: true },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Multimodal King', icon: 'Sparkles', enabled: false, isPaid: true, version: '2.0', plan: 'Pro Plan' },
  */
 { id: 'gpt-oss-120b', name: 'GPT-OSS-120B', description: 'The Logic Engine', icon: 'Zap', enabled: false, isPaid: true, version: '120B', plan: 'Pro Plan' },
  /*{ id: 'mistral-small-3.1', name: 'Mistral Small 3.1', description: 'Concise answers & European languages', icon: 'MessageSquare', enabled: false, isPaid: true, version: '3.1', plan: 'Pro Plan' },
  { id: 'llama-4-scout', name: 'Llama 4 Scout (17B)', description: 'The Researcher', icon: 'BookOpen', enabled: false, isPaid: true, version: '4.0', plan: 'Pro Plan' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (002)', description: 'Legacy high-reasoning model', icon: 'BookOpen', enabled: false, isPaid: true, version: '1.5', plan: 'Legacy' },
*/]

// Rivine TaskForce is the default. Every turn goes straight to the engine the
// user picked (the mediator and Auto were removed on 2026-10-03).
// `DEFAULT_ENGINE_ID` is the single source of truth: the `enabled` flag below,
// the localStorage fallback, and every "no engine resolved" fallback read it.
export const DEFAULT_ENGINE_ID = 'rivine-chat'

export const defaultEngines: Model[] = [
  { id: 'rivine-chat', name: getEngineDisplayLabel('rivine_chat'), description: 'Workspace-governed professional actions with connected apps', icon: 'MessageSquare', enabled: true, isPaid: false, plan: 'Free Plan', version: '1.0' },
  { id: 'rivine-research', name: 'Rivine Research', description: 'Conducts high-reliable, & multi-domain research with industry adaptability', icon: 'BookOpen', enabled: false, isPaid: false, plan: 'Free Plan', version: '1.0' },
  { id: 'rivine-code', name: 'Rivine Code', description: 'Optimized for software programming, debugging, security, & engineering', icon: 'Code', enabled: false, isPaid: false, plan: 'Free Plan', version: '1.0' },
  { id: 'rivine-cicero', name: 'Rivine Cicero', description: 'Built for real-world legal tasks, drafting, and review with use-case expertise', icon: 'Brain', enabled: false, isPaid: false, plan: 'Free Plan', version: '1.0' },
  { id: 'rivine-confluence', name: 'Rivine Confluence', description: 'Tri-agent forecasting and scenario synthesis, grounded against UN Data Commons and external publishers', icon: 'TrendingUp', enabled: false, isPaid: false, plan: 'Free Plan', version: '1.0' },
  { id: 'rivine-creative', name: 'Rivine Creative', description: 'Generates and surgically edits images, video, speech, and music', icon: 'Sparkles', enabled: false, isPaid: false, plan: 'Free Plan', version: '1.0' },
]

/** Rivine Browse downloads: links in the engine menu, not engines. */
export const RIVINE_BROWSE_LINKS = [
  { id: 'browse-mac', name: 'Rivine Browse for Mac', href: 'https://browse.aselius.beunec.com/download/mac' },
  { id: 'browse-windows', name: 'Rivine Browse for Windows', href: 'https://browse.aselius.beunec.com/download/windows' },
  { id: 'browse-extension', name: 'Rivine Browse Chrome Extension', href: 'https://chromewebstore.google.com/detail/rivine-browse/kadbbppafmjcnkoalempcfjfeghimfgj' },
] as const

// ─────────────────────────────────────────────────────────────────────────────
// Shared spring config — calm/subtle (near-critically-damped: little to no
// overshoot) rather than the previous bouncy underdamped spring. This fires
// on every input-area state change, so it's one of the highest-frequency
// animations in the app — toned down for perceived responsiveness, not removed.
// ─────────────────────────────────────────────────────────────────────────────
const SPRING = { type: 'spring' as const, stiffness: 260, damping: 32 }

// ─────────────────────────────────────────────────────────────────────────────
// EnhancedToggleSwitch
// ─────────────────────────────────────────────────────────────────────────────
export const EnhancedToggleSwitch = ({
  enabled,
  onChange,
  disabled = false,
  size = 'sm',
}: {
  enabled: boolean
  onChange: () => void
  disabled?: boolean
  size?: 'sm' | 'md'
}) => {
  const trackW = size === 'md' ? 'w-11 h-6' : 'w-10 h-5'
  const thumb  = size === 'md' ? 'h-5 w-5'  : 'h-4 w-4'
  const tx     = enabled
    ? (size === 'md' ? 'translate-x-5' : 'translate-x-5')
    : 'translate-x-0.5'

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        if (!disabled) onChange()
      }}
      disabled={disabled}
      aria-pressed={enabled}
      className={[
        'relative inline-flex flex-shrink-0 items-center rounded-full transition-colors duration-200 ease-out',
        trackW,
        enabled ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm active:scale-[0.97]',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      ].join(' ')}
    >
      <span
        className={[
          'inline-block transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-out will-change-transform',
          thumb, tx,
        ].join(' ')}
      />
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HeaderLanguageSelector — response language, in the top bar
// ─────────────────────────────────────────────────────────────────────────────
const HeaderLanguageSelector = ({
  selectedLanguage,
  onSelectLanguage,
}: {
  selectedLanguage?: string
  onSelectLanguage?: (lang: string) => void
}) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(null)
  const [isClient, setIsClient] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const current = selectedLanguage || 'English'
  const filtered = availableLanguages.filter((l) => l.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => { setIsClient(true) }, [])

  // The top bar sits inside an overflow-hidden column, so the menu is portaled
  // to <body> and positioned from the trigger's rect.
  const updateMenuPos = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setMenuPos({ top: rect.bottom + 8, left: rect.left, width: Math.max(rect.width, 256) })
  }, [])

  useEffect(() => {
    if (!open) return
    updateMenuPos()
    const onScrollOrResize = () => updateMenuPos()
    window.addEventListener('resize', onScrollOrResize)
    window.addEventListener('scroll', onScrollOrResize, true)
    return () => {
      window.removeEventListener('resize', onScrollOrResize)
      window.removeEventListener('scroll', onScrollOrResize, true)
    }
  }, [open, updateMenuPos])

  const close = () => { setOpen(false); setSearch('') }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={[
          'group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border transition-all duration-200',
          '!bg-canvas dark:!bg-gray-800 shadow-sm',
          open
            ? 'border-violet-400 shadow-md shadow-violet-100 dark:shadow-violet-900/30'
            : 'border-gray-200 dark:border-gray-700 hover:border-violet-300 hover:shadow-md',
        ].join(' ')}
      >
        <Languages className="w-4 h-4 text-violet-500 flex-shrink-0" />
        <div className="flex flex-col items-start leading-none">
          <span className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-400 font-medium tracking-wide uppercase">Language</span>
          <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 mt-0.5 max-w-[9rem] truncate">{current}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-1 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {isClient && createPortal(
        <AnimatePresence>
          {open && menuPos && (
            <>
              <motion.button
                key="lang-backdrop"
                type="button"
                aria-label="Close language menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-[190] cursor-default bg-transparent"
                onClick={close}
              />
              <motion.div
                key="lang-panel"
                role="listbox"
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={SPRING}
                style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}
                className="fixed z-[200] max-w-[calc(100vw-1rem)] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 !bg-canvas dark:!bg-gray-800 overflow-hidden"
              >
                <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Search language…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="overflow-y-auto p-2" style={{ maxHeight: '240px' }}>
                  {filtered.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No language found</p>
                  ) : (
                    filtered.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        role="option"
                        aria-selected={lang === current}
                        onClick={() => { onSelectLanguage?.(lang); close() }}
                        className={[
                          'w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-100 flex items-center justify-between',
                          lang === current
                            ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-semibold'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50',
                        ].join(' ')}
                      >
                        {lang}
                        {lang === current && <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />}
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ChatSpaceHeader  — Language + Assets (Agentic Engines live in the input bar)
// ─────────────────────────────────────────────────────────────────────────────
export const ChatSpaceHeader = ({
  onOpenAssets,
  attachmentCount = 0,
  isPreviewPanelOpen = false,
  hideAssetsButton = false,
  selectedLanguage,
  onSelectLanguage,
}: {
  currentChatSpace: { title: string }
  onOpenAssets: () => void
  attachmentCount?: number
  isPreviewPanelOpen?: boolean
  hideAssetsButton?: boolean
  selectedLanguage?: string
  onSelectLanguage?: (lang: string) => void
  [key: string]: any
}) => {
  return (
    <div className="flex-shrink-0 bg-transparent border-b border-transparent transition-colors duration-300">
      <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-6 py-1 sm:py-1.5">

        {/* ── Language ────────────────────────────────────────── */}
        <HeaderLanguageSelector selectedLanguage={selectedLanguage} onSelectLanguage={onSelectLanguage} />

        {/* ── Spacer ──────────────────────────────────────────── */}
        <div className="flex-1" />

        {/* ── Assets — hidden when side panel is open (tabs live in panel) ── */}
        {!hideAssetsButton && (
        <button
          type="button"
          onClick={onOpenAssets}
          className={[
            'relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 !bg-canvas dark:!bg-gray-800 border rounded-xl shadow-sm hover:border-amber-300 hover:!bg-canvas dark:hover:!bg-gray-800 hover:shadow-md transition-all duration-200 text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-100',
            isPreviewPanelOpen ? 'border-amber-400 shadow-md shadow-amber-100 dark:shadow-amber-900/20' : 'border-gray-200 dark:border-gray-700',
          ].join(' ')}
        >
          <FolderOpen className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>Assets</span>
          {attachmentCount > 0 && (
            <span className="ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
              {attachmentCount}
            </span>
          )}
        </button>
        )}

      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Source icon resolver
// ─────────────────────────────────────────────────────────────────────────────
const SourceIcon = ({ source }: { source: Source }) => {
  const isUrl = typeof source.icon === 'string' && source.icon.startsWith('http')
  if (isUrl) {
    return (
      <Image
        src={source.icon}
        alt={source.name}
        width={18}
        height={18}
        className="w-4.5 h-4.5 rounded-sm flex-shrink-0"
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
    )
  }
  const map: Record<string, React.ReactNode> = {
    Globe:        <Globe        className={`w-4 h-4 flex-shrink-0 ${source.color}`} />,
    FileText:     <FileText     className={`w-4 h-4 flex-shrink-0 ${source.color}`} />,
    MessageSquare:<MessageSquare className={`w-4 h-4 flex-shrink-0 ${source.color}`} />,
    Calculator:   <Calculator   className={`w-4 h-4 flex-shrink-0 ${source.color}`} />,
    Heart:        <Heart        className={`w-4 h-4 flex-shrink-0 ${source.color}`} />,
    TrendingUp:   <TrendingUp   className={`w-4 h-4 flex-shrink-0 ${source.color}`} />,
    BookOpen:     <BookOpen     className={`w-4 h-4 flex-shrink-0 ${source.color}`} />,
  }
  return (map[source.icon] ?? <Globe className={`w-4 h-4 flex-shrink-0 ${source.color}`} />) as React.ReactElement
}

// ─────────────────────────────────────────────────────────────────────────────
// EnhancedChatInput
// ─────────────────────────────────────────────────────────────────────────────
export const EnhancedChatInput = ({
  value,
  onChange,
  onSend,
  loading,
  placeholder = 'Ask Aselius anything...',
  sources,
  connectorsLoading,
  models,
  toggleSource,
  toggleModel,
  engines,
  toggleEngine,
  engineSpecialties,
  setEngineSpecialties,
  // Rivine Code only: Manual asks before each edit, Bypass does not.
  codeRate = 'manual',
  onCodeRateChange,
  // Thorough: the user wants depth over speed on a Rivine engine turn.
  thorough = false,
  onThoroughChange,
  creditsBalance = 0,
  showSources,
  setShowSources,
  showModels,
  setShowModels,
  showAttachmentDropdown,
  setShowAttachmentDropdown,
  isVoiceTyping,
  startVoiceTyping,
  stopVoiceTyping,
  refs,
  handleFileUpload,
  addTextAttachment,
  attachments,
  removeAttachment,
  startEditingAttachment,
  isStreaming,
  onAbortStreaming,
  onClearSources,
  onClearTools,
  isCompact = false,
  onAttachmentClick,
  onOpenPreviewPanel,
  onParseWebUrl,
  onTakeScreenshot,
  onPasteFromClipboard,
  onPasteImageFile,
  isParsingAttachment = false,
  maxAttachments = 10,
  isInputLocked = false,
  inputLockMessage,
  isCreditsLocked = false,
  onInputActivity,
  connectorManageHref,
  onRefreshConnectors,
}: any) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // Keep file input mounted outside the dropdown — closing the menu on click-outside
  // otherwise unmounts <input type="file"> before the native picker fires onChange.
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showEngines, setShowEngines] = useState(false)
  const [showSpecialties, setShowSpecialties] = useState(false)
  const [isDragging,     setIsDragging]     = useState(false)
  const [isInputExpanded, setIsInputExpanded] = useState(false)
  const [showWebParseModal, setShowWebParseModal] = useState(false)
  const [webParseUrl, setWebParseUrl] = useState('')
  const [isWebParsing, setIsWebParsing] = useState(false)
  const [isClient, setIsClient] = useState(false)
  useEffect(() => { setIsClient(true) }, [])

  // These toolbar dropdowns (attach / engine / specialty / connect-apps) used to render `absolute` inside the chat column. That column
  // is `overflow-hidden` and, when the Rivine Code panel is open, narrows —
  // so the menus either got clipped or (once the column was made a CSS
  // containment box to fix the clipping) got trapped in a nested stacking
  // context and painted UNDER the sibling code panel, i.e. invisible.
  // Portaling to <body> with a manually-tracked anchor rect (same pattern
  // used for the header's language menu) escapes both problems.
  const useUpwardAnchoredMenu = (open: boolean, align: 'left' | 'right') => {
    const anchorRef = useRef<HTMLDivElement>(null)
    const [pos, setPos] = useState<{ bottom: number; left?: number; right?: number } | null>(null)

    const update = useCallback(() => {
      const el = anchorRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      // A detached or zero-size anchor measures as all zeros. Writing that
      // would move the panel to the corner mid-interaction; keeping the last
      // good position is always the better answer.
      if (!rect.width && !rect.height) return
      setPos({
        bottom: window.innerHeight - rect.top + 8,
        ...(align === 'left' ? { left: rect.left } : { right: window.innerWidth - rect.right }),
      })
    }, [align])

    useEffect(() => {
      if (!open) return
      update()
      const onScrollOrResize = () => update()
      window.addEventListener('resize', onScrollOrResize)
      window.addEventListener('scroll', onScrollOrResize, true)
      return () => {
        window.removeEventListener('resize', onScrollOrResize)
        window.removeEventListener('scroll', onScrollOrResize, true)
      }
    }, [open, update])

    return { anchorRef, pos }
  }

  const attachMenu = useUpwardAnchoredMenu(!!showAttachmentDropdown, 'left')
  const specialtiesMenu = useUpwardAnchoredMenu(showSpecialties, 'right')
  const enginesMenu = useUpwardAnchoredMenu(showEngines, 'right')
  const connectAppsMenu = useUpwardAnchoredMenu(!!showSources, 'left')

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (showEngines && !(e.target as Element).closest('[data-agentic-engines-dropdown]')) {
        setShowEngines(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showEngines])

  const activeEngine = engines?.find((e: Model) => e.enabled) ?? defaultEngines.find((e) => e.enabled) ?? defaultEngines[0]
  // Connect Apps belong to the Rivine TaskForce Chat agent only. Every
  // other TaskForce specialty is its own agent with its own app, so the
  // control is hidden there (otherwise toggles look active but never inject).
  const isTaskforceSpecialtyAgent =
    activeEngine?.id === TASKFORCE_ENGINE_ID
    && !specialtyUsesConnectedApps(TASKFORCE_ENGINE_ID, engineSpecialties?.[TASKFORCE_ENGINE_ID])
  const connectorsEnabledForEngine =
    specialtyUsesConnectedApps(activeEngine?.id, engineSpecialties?.[activeEngine?.id ?? ''])
  const connectedAppSources = (sources ?? []).filter((s: Source) => s.category === 'connectors')
  const enabledConnectorCount = connectedAppSources.filter((s: Source) => s.enabled).length

  useEffect(() => {
    if (!connectorsEnabledForEngine && showSources) {
      setShowSources?.(false)
    }
  }, [connectorsEnabledForEngine, showSources, setShowSources])
  const specialtyOptions: EngineSpecialtyOption[] = getSpecialtyOptions(activeEngine.id)
  const showSpecialtySelector = engineHasSpecialties(activeEngine.id)
  const activeSpecialtyId = engineSpecialties?.[activeEngine.id] ?? null
  const activeSpecialty = resolveEngineSpecialty(activeEngine.id, activeSpecialtyId)
  const specialtyRequired = isSpecialtyRequired(activeEngine.id)
  const specialtyComplete = isSpecialtySelectionComplete(activeEngine.id, activeSpecialtyId)
  const sendPrerequisitesMet = specialtyRequired ? specialtyComplete : true
  // Default max ~112px compact / ~144px normal; expanded adds ~192px.
  // These MUST stay in sync with the max-h-* classes on the textarea below —
  // the auto-resize effect clamps to this number while CSS clamps to the class,
  // so a mismatch either caps growth early or lets the box overflow its own box.
  // (max-h-28 = 7rem = 112px, max-h-36 = 9rem = 144px.)
  const textareaMaxPx = isInputExpanded
    ? (isCompact ? 112 : 144) + 192
    : (isCompact ? 112 : 144)

  useQuery({
    queryKey: minProfileQueryKey(),
    queryFn: getMinimalUserProfile,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  })

  // Prefetch browser location for automatic <context_identity> on send
  useEffect(() => {
    prefetchUserLocation()
  }, [])

  // Auto-resize textarea — empty stays one line; expanded mode adds extra height
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    if (!value?.trim() && !isInputExpanded) {
      el.style.height = '28px'
      return
    }
    el.style.height = 'auto'
    const next = isInputExpanded
      ? Math.max(el.scrollHeight, textareaMaxPx)
      : Math.min(el.scrollHeight, textareaMaxPx)
    el.style.height = `${Math.min(next, textareaMaxPx)}px`
  }, [value, textareaMaxPx, isInputExpanded])

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const result = readClipboardEvent(e)
    if (!result) return

    if (result.type === 'unsupported') {
      e.preventDefault()
      toast.error(result.reason)
      return
    }

    if (result.type === 'image') {
      e.preventDefault()
      void onPasteImageFile?.(result.file)
      return
    }

    if (result.type === 'text' && result.asAttachment) {
      e.preventDefault()
      if (typeof addTextAttachment === 'function') {
        addTextAttachment(result.text)
        toast.success(`Large text (${result.text.length} chars) added as attachment`)
      }
    }
    // Short text: default browser paste into textarea
  }

  const handlePasteTextClick = async () => {
    if (atAttachmentLimit || isAttachBusy) return
    setShowAttachmentDropdown?.(false)
    textareaRef.current?.focus()
    await onPasteFromClipboard?.()
  }

  const handleScreenshotClick = async () => {
    if (atAttachmentLimit || isAttachBusy) return
    setShowAttachmentDropdown?.(false)
    await onTakeScreenshot?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isInputLocked) return
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      // Lock send while a turn is live (SSE) or reattaching (isStreaming)
      if (canSend && !loading && !isStreaming) onSend()
    }
  }

  const handleSendClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isInputLocked || isStreaming || loading) return
    onSend()
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e)
    if (onInputActivity) {
      void onInputActivity(!!e.target.value.trim())
    }
  }

  const handleTextBlur = () => {
    onInputActivity?.(false)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (isInputLocked) return
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload?.(Array.from(e.dataTransfer.files))
    }
  }, [handleFileUpload, isInputLocked])

  const atAttachmentLimit = (attachments?.length ?? 0) >= maxAttachments
  const isAttachBusy = isParsingAttachment || isWebParsing

  const submitWebParse = async () => {
    const url = webParseUrl.trim()
    if (!url || !/^https?:\/\//i.test(url)) {
      toast.error('Enter a valid http(s) URL')
      return
    }
    if (atAttachmentLimit) {
      toast.error(`Maximum ${maxAttachments} attachments per message`)
      return
    }
    setIsWebParsing(true)
    try {
      await onParseWebUrl?.(url)
      setWebParseUrl('')
      setShowWebParseModal(false)
      setShowAttachmentDropdown?.(false)
    } finally {
      setIsWebParsing(false)
    }
  }

  const closeAllMenus = useCallback(() => {
    setShowSources?.(false)
    setShowAttachmentDropdown?.(false)
    setShowEngines(false)
    setShowSpecialties(false)
  }, [setShowSources, setShowAttachmentDropdown])

  // Source categories
  const sourceCategories: { label: string; key: Source['category'] }[] = [
    { label: 'Web Browser',       key: 'web'        },
    { label: 'File Sources',      key: 'files'      },
    { label: 'Context',           key: 'context'    },
    { label: 'Nutrition',         key: 'nutrition'  },
    { label: 'Maps Platform',     key: 'maps'       },
    { label: 'Securities',        key: 'securities' },
    { label: 'Health & Medicine', key: 'health'     },
    { label: 'Diplomacy',         key: 'diplomacy'  },
    { label: 'World Economics',   key: 'economics'  },
    { label: 'Academia',          key: 'academia'   },
    { label: 'Articles',          key: 'articles'   },
    { label: 'App Connectors',    key: 'connectors' },
  ]

  const enabledSourceCount  = (sources ?? []).filter((s: Source) => s.enabled).length

  const hasTextAttachmentInput = (attachments ?? []).some(
    (att: { type?: string; content?: string }) => att.type === 'text' && !!att.content?.trim(),
  )
  const canSend =
    !isInputLocked &&
    (!!value?.trim() || hasTextAttachmentInput) &&
    sendPrerequisitesMet
  const inputDisabled = loading || isAttachBusy || isInputLocked
  const engineButtonLabel = isCompact
    ? String(activeEngine?.name || '').replace(/^Rivine\s+/i, '')
    : (activeEngine?.name || 'Engine')

  return (
    <div className={`relative flex flex-col items-stretch w-full max-w-4xl mx-auto ${isCompact ? 'gap-0.5' : 'gap-1'}`}>

      {specialtyRequired && !specialtyComplete && (
        <div className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
          Select a <span className="font-semibold">Specialty</span> mode for {activeEngine.name} before sending.
        </div>
      )}

      {activeEngine.id === 'rivine-code' && (
        <div className="w-full flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-gray-950/40">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Rate
          </span>
          {([
            ['manual', 'Manual', 'Ask before each edit'],
            ['bypass', 'Bypass', 'Apply edits without asking'],
          ] as const).map(([value, label, hint]) => (
            <button
              key={value}
              type="button"
              title={hint}
              onClick={() => onCodeRateChange?.(value)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                codeRate === value
                  ? 'bg-[#00477d] text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
          <span className="text-[11px] text-gray-400 ml-auto hidden sm:inline">
            {codeRate === 'bypass'
              ? 'Rivine will edit files in your project without prompting each time'
              : 'Rivine will ask for approval before making each edit'}
          </span>
        </div>
      )}

      {isCreditsLocked && (
        <div className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#00477d]/15 dark:border-blue-500/20 bg-[#00477d]/[0.04] dark:bg-blue-950/25">
          <Coins className="w-3.5 h-3.5 text-[#00477d] dark:text-blue-400 flex-shrink-0" />
          <p className="text-xs text-gray-700 dark:text-gray-300 flex-1 min-w-0 leading-snug">
            Balance below $1.00.{' '}
            <Link href="/credits" className="font-semibold text-[#00477d] dark:text-blue-400 hover:underline">
              Add credits
            </Link>{' '}
            to send messages.
          </p>
        </div>
      )}

      {!isCreditsLocked && isInputLocked && inputLockMessage && (
        <div className="w-full px-3 py-2 rounded-lg border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm leading-snug">
          {inputLockMessage}
        </div>
      )}

      {/* ── Attachments strip ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {attachments?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{   opacity: 0, height: 0      }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar flex-1">
              {attachments.map((att: any, idx: number) => {
                const snap = snapshotFromPendingAttachment(att)
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <AttachmentSnapshot
                      kind={snap.kind}
                      title={snap.title}
                      preview={snap.preview}
                      label={snap.label}
                      onClick={() => onAttachmentClick?.(idx)}
                      onRemove={() => removeAttachment(idx)}
                    />
                  </motion.div>
                )
              })}
              </div>
              {onOpenPreviewPanel && (
                <button
                  type="button"
                  onClick={() => onOpenPreviewPanel('attachments')}
                  className="flex-shrink-0 text-[10px] font-medium text-[#00477d] dark:text-blue-400 hover:underline px-2 py-1"
                >
                  View all
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main input box (Claude-style: textarea + bottom controls) ─────────── */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          'w-full relative flex flex-col',
          'border rounded-2xl',
          'shadow-sm transition-[box-shadow,border-color,transform] duration-200 ease-out',
          isDragging
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.01] shadow-lg shadow-blue-100 dark:shadow-none'
            : 'bg-canvas dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md focus-within:border-blue-400 focus-within:shadow-lg focus-within:shadow-blue-50 dark:focus-within:shadow-blue-900/20',
        ].join(' ')}
      >
        {isDragging && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-blue-500/10 dark:bg-blue-500/20 rounded-xl pointer-events-none border-2 border-dashed border-blue-500 transition-all duration-200">
            <div className="px-4 py-2 bg-canvas/90 dark:bg-gray-800/90 rounded-lg shadow-sm border border-blue-200 dark:border-blue-800">
              <p className="text-blue-600 dark:text-blue-400 font-medium text-sm flex items-center gap-2">
                <Paperclip className="w-4 h-4" /> Drop files here to upload
              </p>
            </div>
          </div>
        )}

        {/* Expand / collapse — only when there is text or already expanded */}
        {(value?.trim() || isInputExpanded) && (
        <button
          type="button"
          onClick={() => setIsInputExpanded(v => !v)}
          title={isInputExpanded ? 'Collapse input' : 'Expand input'}
          className="absolute top-2 right-2 z-20 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors"
        >
          {isInputExpanded ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
        )}

        {/* Textarea — full width for typing room */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          disabled={loading || isAttachBusy}
          rows={1}
          className={[
            'w-full resize-none border-none outline-none focus:ring-0 bg-transparent',
            'text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',
            // text-base (16px) at normal size: the old text-sm was hard to read
            // in the primary input, and 16px is also the threshold below which
            // iOS Safari force-zooms the page on focus.
            // 16px on every width: iOS Safari zooms the page if the focused
            // control is smaller than 16px.
            'text-base leading-normal',
            'min-h-[36px] px-3 pt-2.5 pb-1',
            !(value?.trim() || isInputExpanded) ? 'pr-3' : 'pr-9',
            // Keep in sync with textareaMaxPx above.
            isInputExpanded ? 'max-h-[calc(9rem+2in)]' : (isCompact ? 'max-h-28' : 'max-h-36'),
          ].join(' ')}
        />

        {/* Bottom row: attach · agentic engines · send */}
        <div className="flex items-center gap-1 px-1.5 sm:px-2 pb-1.5 pt-0 min-w-0">
          {/* Attachment */}
          <div className="attachment-dropdown-container relative flex-shrink-0" ref={attachMenu.anchorRef}>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              disabled={atAttachmentLimit || isAttachBusy || isInputLocked}
              onChange={e => {
                const files = e.target.files ? Array.from(e.target.files) : []
                if (files.length) handleFileUpload?.(files)
                setShowAttachmentDropdown?.(false)
                e.target.value = ''
              }}
            />
            <button
              type="button"
              disabled={isAttachBusy || isInputLocked}
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                setShowEngines(false)
                setShowSpecialties(false)
                setShowAttachmentDropdown?.(!showAttachmentDropdown)
              }}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Add attachment"
            >
              {isAttachBusy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
            </button>

            {isClient && attachMenu.pos && createPortal(
            <AnimatePresence>
              {showAttachmentDropdown && (
                <>
                <motion.button
                  key="attach-backdrop"
                  type="button"
                  aria-label="Close attachment menu"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 z-[190] cursor-default bg-transparent"
                  onClick={() => setShowAttachmentDropdown?.(false)}
                />
                <motion.div
                  key="attach-dropdown"
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1    }}
                  exit={{   opacity: 0, y: 8, scale: 0.96  }}
                  transition={SPRING}
                  style={{ bottom: attachMenu.pos.bottom, left: attachMenu.pos.left }}
                  className="fixed w-56 sm:w-60 max-w-[calc(100vw-1rem)] bg-canvas/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-[200] overflow-hidden"
                >
                  <div className="p-2">
                    <p className="text-[10px] font-bold text-gray-400 px-2 pb-2 uppercase tracking-widest">Import from</p>

                    <button
                      type="button"
                      disabled={atAttachmentLimit || isAttachBusy}
                      onClick={() => {
                        if (atAttachmentLimit || isAttachBusy) return
                        fileInputRef.current?.click()
                      }}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-colors ${atAttachmentLimit || isAttachBusy ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'}`}
                    >
                      <FolderOpen className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Upload file</span>
                    </button>

                    <button
                      type="button"
                      disabled={atAttachmentLimit || isAttachBusy}
                      onClick={() => {
                        setShowAttachmentDropdown?.(false)
                        setShowWebParseModal(true)
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/60 rounded-xl text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Globe className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Parse Web/YT</span>
                    </button>

                    <button
                      type="button"
                      disabled={atAttachmentLimit || isAttachBusy}
                      onClick={() => void handleScreenshotClick()}
                      className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/60 rounded-xl text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Camera className="w-4 h-4 text-teal-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Take a Screenshot</span>
                    </button>

                    <button
                      type="button"
                      disabled={atAttachmentLimit || isAttachBusy}
                      onClick={() => void handlePasteTextClick()}
                      className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/60 rounded-xl text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <MessageSquare className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Paste text</span>
                    </button>

                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1.5 mx-2" />
                    <p className="text-[10px] text-gray-400 px-2 pb-1">
                      {attachments?.length ?? 0}/{maxAttachments} attachments · parsed to markdown
                    </p>

                    {([
                      { label: 'Google Drive', icon: 'https://www.google.com/favicon.ico' },
                      { label: 'OneDrive',     icon: 'https://www.microsoft.com/favicon.ico' },
                      { label: 'Dropbox',      icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDv0zU2KCX1ho_P1tZZea2PSFNgjmIXtZ2dg&s' },
                    ] as { label: string; icon: string }[]).map(({ label, icon }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => { toast(`${label} integration coming soon`, { icon: 'ℹ️' }); setShowAttachmentDropdown?.(false) }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/60 rounded-xl text-left transition-colors"
                      >
                        <Image src={icon} alt={label} width={16} height={16} className="w-4 h-4 rounded-sm flex-shrink-0" onError={e => { e.currentTarget.style.display = 'none' }} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
                </>
              )}
            </AnimatePresence>,
            document.body
            )}
          </div>

          <div className={`flex items-center gap-1 sm:gap-1.5 flex-1 min-w-0 justify-end ${isCompact ? 'overflow-x-auto scrollbar-none overscroll-x-contain pr-1' : ''}`}>
            {/* Engine specialty (sub-agent mode) — left of agentic engines */}
            {showSpecialtySelector && (
              <div className="relative flex-shrink-0" ref={specialtiesMenu.anchorRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAttachmentDropdown?.(false)
                    setShowEngines(false)
                    setShowSpecialties((v) => !v)
                  }}
                  className={[
                    'flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full border transition-all duration-200 text-sm sm:text-[15px] font-medium max-w-[7.5rem] sm:max-w-[12rem] flex-shrink-0',
                    showSpecialties
                      ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-400 text-violet-700 dark:text-violet-300 shadow-sm'
                      : specialtyRequired && !specialtyComplete
                        ? 'bg-amber-50 dark:bg-amber-900/15 border-amber-400 dark:border-amber-600 text-amber-800 dark:text-amber-200'
                      : activeSpecialty
                        ? 'bg-violet-50/80 dark:bg-violet-900/15 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300'
                        : 'bg-canvas dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-violet-300 hover:shadow-sm',
                  ].join(' ')}
                  title={specialtyRequired && !specialtyComplete ? 'Required: select a specialty mode' : 'Specialty mode'}
                >
                  <Layers className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                  <span className="truncate">{activeSpecialty?.label ?? (specialtyRequired ? 'Specialty *' : 'Specialty')}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-0.5 transition-transform duration-200 ${showSpecialties ? 'rotate-180' : ''}`} />
                </button>

                {isClient && specialtiesMenu.pos && createPortal(
                <AnimatePresence>
                  {showSpecialties && (
                    <>
                    <motion.button
                      key="specialties-backdrop"
                      type="button"
                      aria-label="Close specialty menu"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="fixed inset-0 z-[190] cursor-default bg-transparent"
                      onClick={() => setShowSpecialties(false)}
                    />
                    <motion.div
                      key="specialties-panel"
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={SPRING}
                      style={{ bottom: specialtiesMenu.pos.bottom, right: specialtiesMenu.pos.right }}
                      className="fixed w-56 sm:w-64 max-w-[calc(100vw-1rem)] bg-canvas/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-[200] overflow-hidden"
                    >
                      <div className="p-3">
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 px-2 pb-2 uppercase tracking-widest">
                          {activeEngine.name} Specialty
                        </p>
                        <div className="space-y-0.5 max-h-56 overflow-y-auto">
                          {specialtyOptions.map((option) => {
                            const isActive = option.id === activeSpecialtyId
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => {
                                  setEngineSpecialties?.((prev: Record<string, string>) => ({
                                    ...(prev ?? {}),
                                    [activeEngine.id]: option.id,
                                  }))
                                  setShowSpecialties(false)
                                }}
                                className={[
                                  'w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 flex items-center justify-between',
                                  isActive
                                    ? 'bg-violet-50 dark:bg-violet-900/30'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                                ].join(' ')}
                              >
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{option.label}</span>
                                {isActive && (
                                  <motion.div
                                    layoutId="specialty-indicator"
                                    className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0 ml-2"
                                  />
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </motion.div>
                    </>
                  )}
                </AnimatePresence>,
                document.body
                )}
              </div>
            )}

            {/* Agentic Engines (compact pill) */}
            <div className="relative flex-shrink-0" data-agentic-engines-dropdown ref={enginesMenu.anchorRef}>
              <button
                type="button"
                onClick={() => {
                  setShowAttachmentDropdown?.(false)
                  setShowSpecialties(false)
                  setShowEngines(v => !v)
                }}
                className={[
                  'flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full border transition-all duration-200 text-sm sm:text-[15px] font-medium max-w-[8.25rem] sm:max-w-none flex-shrink-0',
                  showEngines
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'bg-canvas dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-blue-300 hover:shadow-sm',
                ].join(' ')}
                title="Agentic Engines"
              >
                <Zap className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span className="truncate">{engineButtonLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-0.5 transition-transform duration-200 ${showEngines ? 'rotate-180' : ''}`} />
              </button>

              {isClient && enginesMenu.pos && createPortal(
              <AnimatePresence>
                {showEngines && (
                  <>
                  <motion.button
                    key="engines-backdrop"
                    type="button"
                    aria-label="Close engines menu"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-[190] cursor-default bg-transparent"
                    onClick={() => setShowEngines(false)}
                  />
                  <motion.div
                    key="engines-panel"
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={SPRING}
                    style={{ bottom: enginesMenu.pos.bottom, right: enginesMenu.pos.right }}
                    className="fixed w-72 max-w-[calc(100vw-1rem)] bg-canvas/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-[200] overflow-hidden"
                  >
                    <div className="p-3">
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 px-2 pb-2 uppercase tracking-widest">
                        Agentic Engines
                      </p>
                      <div className="space-y-0.5">
                        {defaultEngines.map(engine => {
                          const isActive = engine.id === activeEngine.id
                          const minCredits = getEngineMinCredits(engine.id)
                          const insufficientCredits = minCredits != null && !canSelectEngine(engine.id, creditsBalance)
                          const isDisabled = !!engine.comingSoon || insufficientCredits
                          return (
                            <button
                              key={engine.id}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => {
                                if (isDisabled) return
                                toggleEngine?.(engine.id)
                                setShowEngines(false)
                                setShowSpecialties(false)
                              }}
                              className={[
                                'w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 flex items-center justify-between',
                                isDisabled
                                  ? 'cursor-not-allowed'
                                  : isActive
                                    ? 'bg-blue-50 dark:bg-blue-900/30'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                              ].join(' ')}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className={`text-sm font-semibold ${isDisabled ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>{engine.name}</p>
                                  {engine.comingSoon && (
                                    <span className={`text-[9px] px-1.5 py-0.5 font-bold rounded-full uppercase tracking-wide ${engineSoonBadgeClass(engine.id)}`}>
                                      Coming Soon
                                    </span>
                                  )}
                                  {minCredits != null && (
                                    <span className={`text-[9px] px-1.5 py-0.5 font-bold rounded-full ${
                                      insufficientCredits
                                        ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-400/50'
                                        : engineMinBadgeClass(engine.id)
                                    }`}>
                                      {formatCredits(minCredits)} min
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{engine.description}</p>
                              </div>
                              {isActive && (
                                <motion.div
                                  layoutId="engine-indicator"
                                  className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 ml-2"
                                />
                              )}
                            </button>
                          )
                        })}
                      </div>
                      <div className="h-px bg-gray-100 dark:bg-gray-700 my-2 mx-2" />
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 px-2 pb-1 uppercase tracking-widest">
                        Rivine Browse
                      </p>
                      <div className="space-y-0.5">
                        {RIVINE_BROWSE_LINKS.map((link) => (
                          <a
                            key={link.id}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setShowEngines(false)}
                            className="w-full px-3 py-2 rounded-xl transition-all duration-150 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{link.name}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-2" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                  </>
                )}
              </AnimatePresence>,
              document.body
              )}
            </div>
          </div>

            {/* Send / Stop */}
            <button
              type="button"
              onClick={isStreaming ? () => { void onAbortStreaming?.() } : handleSendClick}
              disabled={!isStreaming && (!canSend || loading || isAttachBusy || isInputLocked)}
              title={isStreaming ? 'Stop generating' : isInputLocked ? (inputLockMessage || 'Input locked') : 'Send message'}
              className={[
                'flex-shrink-0 rounded-xl flex items-center justify-center transition-[transform,background-color,box-shadow] duration-150 ease-out active:scale-[0.97]',
                isCompact ? 'w-8 h-8' : 'w-9 h-9',
                isStreaming
                  ? 'bg-red-500 hover:bg-red-600 shadow-md shadow-red-200 dark:shadow-red-900/40'
                  : (!canSend || loading || isAttachBusy || isInputLocked)
                    ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed'
                    : 'bg-[#00477d] hover:bg-[#003366] shadow-md shadow-blue-200 dark:shadow-blue-900/40 hover:shadow-lg',
              ].join(' ')}
            >
              {isStreaming || loading ? (
                <Square className="w-3.5 h-3.5 fill-white text-white" />
              ) : (
                <ArrowUp className="w-4 h-4 text-white" />
              )}
            </button>
        </div>
      </div>

      {/* Parse Web/YT modal */}
      <AnimatePresence>
        {showWebParseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
            onClick={() => !isWebParsing && setShowWebParseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-canvas dark:bg-gray-900 shadow-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Parse Web/YT</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Paste a web page or YouTube link — we convert it to markdown and attach it to your message.
              </p>
              <input
                type="url"
                value={webParseUrl}
                onChange={(e) => setWebParseUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitWebParse() }}
                placeholder="https://example.com or https://youtube.com/watch?v=…"
                autoFocus
                disabled={isWebParsing}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 !bg-canvas dark:!bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00477d]/30 focus:border-[#00477d]"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  disabled={isWebParsing}
                  onClick={() => setShowWebParseModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isWebParsing || !webParseUrl.trim()}
                  onClick={submitWebParse}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#00477d] hover:bg-[#003366] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isWebParsing && <Loader2 className="w-4 h-4 animate-spin" />}
                  Parse & attach
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom toolbar (OUTSIDE input box) ───────────────────────────────── */}
      <div className={`flex items-center w-full min-w-0 ${isCompact ? 'gap-1.5 flex-nowrap overflow-x-auto scrollbar-none overscroll-x-contain pb-1.5 pl-0.5 pr-3' : 'gap-1.5 flex-wrap'}`}>

        {/* Connect Apps — Rivine TaskForce Chat only; hidden for the other TaskForce agents */}
        {!isTaskforceSpecialtyAgent && (
        <div className="relative flex-shrink-0" data-connect-apps-dropdown ref={connectAppsMenu.anchorRef}>
          <button
            type="button"
            disabled={!connectorsEnabledForEngine}
            title={
              connectorsEnabledForEngine
                ? 'Select connected apps for this TaskForce turn'
                : 'Select Rivine TaskForce → Chat to use Connect Apps'
            }
            onClick={() => {
              if (!connectorsEnabledForEngine) return
              const opening = !showSources
              setShowSources?.(v => !v)
              if (opening) onRefreshConnectors?.()
            }}
            className={[
              'flex items-center rounded-full border transition-[transform,background-color,border-color,color,box-shadow] duration-150 ease-out flex-shrink-0',
              isCompact ? 'gap-1 px-3 py-1.5 text-sm font-medium' : 'gap-1.5 px-4 py-2 text-[15px] font-medium',
              !connectorsEnabledForEngine
                ? 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60'
                : showSources
                  ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-400 text-cyan-700 dark:text-cyan-300 shadow-sm'
                  : 'bg-canvas dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-cyan-300 hover:bg-cyan-50/40 hover:shadow-sm',
            ].join(' ')}
          >
            <Database className={`w-3.5 h-3.5 ${connectorsEnabledForEngine ? 'text-cyan-500' : 'text-gray-400'}`} />
            <span>{isCompact ? 'Apps' : 'Connect Apps'}</span>
            {connectorsEnabledForEngine && enabledConnectorCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-cyan-500 text-white text-[9px] font-bold ml-0.5">
                {enabledConnectorCount}
              </span>
            )}
          </button>

          {isClient && connectAppsMenu.pos && createPortal(
          <AnimatePresence>
            {showSources && connectorsEnabledForEngine && (
              <>
              <motion.button
                key="sources-backdrop"
                type="button"
                aria-label="Close connect apps menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-[190] cursor-default bg-transparent"
                onClick={() => setShowSources?.(false)}
              />
              <motion.div
                key="sources-panel"
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1    }}
                exit={{   opacity: 0, y: 8, scale: 0.96  }}
                transition={SPRING}
                className="fixed w-96 max-w-[calc(100vw-1rem)] bg-canvas/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-[200] overflow-hidden"
                style={{ bottom: connectAppsMenu.pos.bottom, left: connectAppsMenu.pos.left, maxHeight: '70vh' }}
              >
                {/* Panel header */}
                <div className="sticky top-0 bg-canvas/95 dark:bg-gray-800/95 backdrop-blur-sm px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Connect Apps &amp; Sources</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {enabledSourceCount === 0
                        ? 'Enable connected apps and grounded sources for this TaskForce turn'
                        : `${enabledSourceCount} source${enabledSourceCount === 1 ? '' : 's'} enabled`}
                    </p>
                  </div>
                  {enabledSourceCount > 0 && (
                    <button
                      type="button"
                      onClick={() => onClearSources?.()}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Scrollable categories */}
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 80px)' }}>
                  <div className="px-3 pt-3 pb-1">
                    <div className="flex items-center justify-between px-2 pb-1.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">App Connectors</p>
                      {connectorManageHref ? (
                        <Link
                          href={connectorManageHref}
                          // A real hit target, not an 11px line of text: the
                          // padded pill is roughly three times the area and
                          // reads as something you can press.
                          className="inline-flex items-center gap-1.5 -my-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 dark:bg-cyan-400/10 dark:hover:bg-cyan-400/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
                          title="Open the Connector page to connect or disconnect apps"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowSources?.(false)
                          }}
                        >
                          Manage on Connector page
                          <ExternalLink className="w-3 h-3 flex-shrink-0" aria-hidden />
                        </Link>
                      ) : null}
                    </div>
                    {connectedAppSources.length === 0 && connectorsLoading ? (
                      // Fetch is still in flight — say so rather than assert an
                      // absence we have not actually confirmed yet.
                      <div className="mx-1 mb-2 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 px-3 py-4 text-center">
                        <p className="text-xs text-gray-400 dark:text-gray-500">Loading your connected apps…</p>
                      </div>
                    ) : connectedAppSources.length === 0 ? (
                      <div className="mx-1 mb-2 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 px-3 py-4 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          No connected apps yet. Connect an app on the Connector page, then enable it here for TaskForce.
                        </p>
                        {connectorManageHref ? (
                          <Link
                            href={connectorManageHref}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 dark:text-cyan-300 hover:underline"
                            onClick={() => setShowSources?.(false)}
                          >
                            Open Connector page
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        ) : null}
                      </div>
                    ) : (
                      <div className="space-y-0.5 pb-2">
                        {connectedAppSources.map((source: Source) => {
                          const isDisabled = Boolean(source.comingSoon || source.disabledReason)
                          return (
                          <div
                            key={source.id}
                            role="button"
                            tabIndex={isDisabled ? -1 : 0}
                            title={source.disabledReason || undefined}
                            onKeyDown={(e) => {
                              if (isDisabled) return
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                toggleSource?.(source.id)
                              }
                            }}
                            className={[
                              'flex items-center gap-3 px-2 py-2.5 rounded-xl transition-colors duration-150',
                              isDisabled
                                ? 'opacity-55 cursor-not-allowed'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer',
                            ].join(' ')}
                            onClick={() => {
                              if (isDisabled) return
                              toggleSource?.(source.id)
                            }}
                          >
                            <SourceIcon source={source} />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate block">{source.name}</span>
                              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{source.description}</p>
                            </div>
                            <EnhancedToggleSwitch
                              enabled={source.enabled}
                              disabled={isDisabled}
                              onChange={() => {
                                if (isDisabled) return
                                toggleSource?.(source.id)
                              }}
                            />
                          </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {sourceCategories.filter((cat) => cat.key !== 'connectors').map(cat => {
                    const catSources = (sources ?? []).filter((s: Source) => s.category === cat.key)
                    if (catSources.length === 0) return null

                    return (
                      <div key={cat.key} className="px-3 py-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 pb-1.5">{cat.label}</p>
                        <div className="space-y-0.5">
                          {catSources.map((source: Source) => {
                            const isDisabled = !!source.comingSoon

                            return (
                              <div
                                key={source.id}
                                role="button"
                                tabIndex={isDisabled ? -1 : 0}
                                onKeyDown={(e) => {
                                  if (isDisabled) return
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    toggleSource?.(source.id)
                                  }
                                }}
                                className={[
                                  'flex items-center gap-3 px-2 py-2.5 rounded-xl transition-colors duration-150',
                                  isDisabled
                                    ? 'opacity-40 cursor-not-allowed'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer',
                                ].join(' ')}
                                onClick={(e) => {
                                  // Toggling is not "done choosing" — the menu
                                  // stays open so several apps can be switched
                                  // on in one visit instead of reopening it
                                  // once per app.
                                  e.stopPropagation()
                                  if (!isDisabled) toggleSource?.(source.id)
                                }}
                              >
                                <SourceIcon source={source} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{source.name}</span>
                                    {source.comingSoon && (
                                      <span className="flex-shrink-0 text-[9px] px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-bold rounded-full uppercase">Soon</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{source.description}</p>
                                  {source.apiLimit && (
                                    <p className="text-[10px] text-orange-500 dark:text-orange-400 mt-0.5">{source.apiLimit}</p>
                                  )}
                                </div>
                                <EnhancedToggleSwitch
                                  enabled={source.enabled}
                                  onChange={() => toggleSource?.(source.id)}
                                  disabled={isDisabled}
                                />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
          )}
        </div>
        )}

        {/* Thorough — Rivine engines only. Depth over speed for this turn:
            twice the steps per server invocation and no engine budget. A
            normal turn already runs as long as the work needs. */}
        {onThoroughChange && String(activeEngine?.id || '').startsWith('rivine-') && (
          <button
            type="button"
            aria-pressed={thorough}
            title={thorough
              ? 'Thorough is on: Rivine takes more steps and goes deeper before answering'
              : 'Turn on Thorough for deeper, longer work on this request'}
            onClick={() => onThoroughChange(!thorough)}
            className={[
              'flex items-center rounded-full border transition-[transform,background-color,border-color,color,box-shadow] duration-150 ease-out flex-shrink-0',
              isCompact ? 'gap-1 px-3 py-1.5 text-sm font-medium' : 'gap-1.5 px-4 py-2 text-[15px] font-medium',
              thorough
                ? 'bg-[#00477d]/10 dark:bg-blue-900/30 border-[#00477d] dark:border-blue-400 text-[#00477d] dark:text-blue-300 shadow-sm'
                : 'bg-canvas dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-[#00477d]/40 hover:bg-[#00477d]/[0.04] hover:shadow-sm',
            ].join(' ')}
          >
            <Gauge className={`w-3.5 h-3.5 ${thorough ? 'text-[#00477d] dark:text-blue-300' : 'text-gray-500'}`} />
            <span>Thorough</span>
          </button>
        )}

        {/* Voice */}
        <button
          type="button"
          onClick={() => isVoiceTyping ? stopVoiceTyping?.() : startVoiceTyping?.()}
          className={[
            'flex items-center rounded-full border transition-[transform,background-color,border-color,color,box-shadow] duration-150 ease-out flex-shrink-0',
            isCompact ? 'gap-1 px-3 py-1.5 text-sm font-medium' : 'gap-1.5 px-4 py-2 text-[15px] font-medium',
            isVoiceTyping
              ? 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-600 dark:text-red-300 shadow-sm animate-pulse'
              : 'bg-canvas dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-red-300 hover:bg-red-50/40 hover:shadow-sm',
          ].join(' ')}
        >
          {isVoiceTyping ? (
            <MicOff className="w-3.5 h-3.5 text-red-500" />
          ) : (
            <Mic className="w-3.5 h-3.5 text-gray-500" />
          )}
          <span>{isVoiceTyping ? 'Stop' : 'Voice'}</span>
        </button>

      </div>
      {/* ── End bottom toolbar ───────────────────────────────────────────────── */}

    </div>
  )
}