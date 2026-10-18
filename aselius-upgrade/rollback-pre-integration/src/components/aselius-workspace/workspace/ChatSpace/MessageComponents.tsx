/**
 * MessageComponents.tsx
 *
 * All inline message-rendering sub-components used inside the ChatSpace
 * messages list.  These components are pure UI — they receive props and
 * render; they never mutate external state directly.
 *
 * Exported:
 *   GeneratingAnimation, InlineApprovalCard, EnhancedMarkdownMessage
 */

import React, { useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { materialLight, materialDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import {
  Sparkles, Copy, CheckCircle, ExternalLink,
  AlertTriangle, Check, X as XIcon, ChevronRight, ChevronDown, Trash2, Paperclip, FileText,
} from 'lucide-react'
import toast from 'react-hot-toast'
import SecureImage from '../../../ui/SecureImage'
import { parseMessagePrompt, assetStubFromFileBlock, snippetFromText } from './promptAttachments'
import { RIVINE_NOTE_REGEX } from './messageTags'
import { AttachmentSnapshot } from './AttachmentSnapshot'
import { extractHtmlBlocksFromMarkdown } from './htmleditor/htmlEditor.utils'
import type { PreviewSelection } from './PreviewPanel'
import type { Asset } from './ChatSpace'
import { getEngineDisplayLabel } from './engineDisplayLabels'
import type { ActivityEntry } from '@/store/aselius/workspaceStore'
import { useWorkspaceStore } from '@/store/aselius/workspaceStore'
import { saveAssetToDisk } from '../../lib/assetsApi'

const LINE_CLAMP_CLASS: Record<number, string> = {
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  5: 'line-clamp-5',
}

function textNeedsTruncation(text: string, maxLines: number): boolean {
  if (!text?.trim()) return false
  const lines = text.split('\n')
  return lines.length > maxLines || text.length > maxLines * 80
}

function splitOptimizedIntent(raw: string): { summary: string; rivineNote: string | null } {
  const noteMatch = raw.match(/<rivine_note>\s*([\s\S]*?)\s*<\/rivine_note>/i)
  const rivineNote = noteMatch?.[1]?.trim() || null
  const summary = raw.replace(RIVINE_NOTE_REGEX, '').replace(/\n{3,}/g, '\n\n').trim()
  return { summary, rivineNote }
}

function ShowMoreToggle({
  expanded,
  onToggle,
  className = '',
}: {
  expanded: boolean
  onToggle: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`mt-1 text-xs font-medium text-[#00477d] dark:text-blue-400 hover:underline ${className}`}
    >
      {expanded ? 'Show less' : 'Show more'}
    </button>
  )
}

function CollapsiblePlainText({
  text,
  maxLines = 2,
  className = '',
}: {
  text: string
  maxLines?: number
  className?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const showToggle = textNeedsTruncation(text, maxLines)
  const clamp = LINE_CLAMP_CLASS[maxLines] ?? LINE_CLAMP_CLASS[2]

  if (!text?.trim()) return null

  return (
    <div>
      <div
        className={[
          className,
          !expanded && showToggle ? clamp : '',
        ].filter(Boolean).join(' ')}
      >
        {text}
      </div>
      {showToggle && (
        <ShowMoreToggle expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
      )}
    </div>
  )
}

function OptimizedIntentBlock({
  raw,
  isStreaming,
  hasContent,
}: {
  raw: string
  isStreaming?: boolean
  hasContent?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [noteExpanded, setNoteExpanded] = useState(false)
  const { summary, rivineNote } = splitOptimizedIntent(raw)

  if (!summary && !rivineNote) return null

  const preview = summary.split('\n')[0]?.trim() || 'Refined request'

  return (
    <div className="mb-1.5">
      <button
        type="button"
        onClick={() => {
          setExpanded((v) => {
            if (v) setNoteExpanded(false)
            return !v
          })
        }}
        className="flex items-center gap-1.5 w-full text-left py-1 px-0.5 group/intent"
        aria-expanded={expanded}
      >
        <ChevronRight
          className={`w-3 h-3 flex-shrink-0 text-violet-400 transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}
        />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-violet-500 dark:text-violet-400 flex-shrink-0">
          Mediator
        </span>
        {!expanded ? (
          <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate min-w-0 flex-1">
            {preview}
          </span>
        ) : (
          <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">
            Hide details
          </span>
        )}
        {isStreaming && !hasContent && (
          <span className="text-[10px] text-[#00477d] dark:text-blue-400 animate-pulse flex-shrink-0">working…</span>
        )}
      </button>
      {expanded && (
        <div className="mt-1 rounded-xl border border-violet-200/80 dark:border-violet-800/50 bg-violet-50/50 dark:bg-violet-950/20 px-3 py-2 space-y-1.5">
          {summary && (
            <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {summary}
            </p>
          )}
          {rivineNote && (
            <div>
              <button
                type="button"
                onClick={() => setNoteExpanded((v) => !v)}
                className="flex items-center gap-1 text-[11px] font-medium text-violet-600/90 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                aria-expanded={noteExpanded}
              >
                <ChevronRight className={`w-3 h-3 flex-shrink-0 transition-transform duration-150 ${noteExpanded ? 'rotate-90' : ''}`} />
                {noteExpanded ? 'Hide Rivine routing note' : 'Show Rivine routing note'}
              </button>
              {noteExpanded && (
                <div className="mt-1.5 rounded-lg border border-violet-200/60 dark:border-violet-800/40 bg-violet-50/60 dark:bg-violet-950/30 px-2.5 py-2 text-[11px] leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {rivineNote}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Engine attribution labels (accountability chips)
// Product-level names only — never model IDs.
// ─────────────────────────────────────────────────────────────────────────────

const ENGINE_CHIP_LABELS: Record<string, string> = {
  rivine_chat: getEngineDisplayLabel('rivine_chat'),
  rivine_research: 'Rivine Research',
  rivine_code: 'Rivine Code',
  rivine_cicero: 'Rivine Cicero',
  rivine_creative: 'Rivine Creative',
  rivine_browse: 'Rivine Browse',
}

// The mediator was removed on 2026-10-03; older messages may still carry a
// mediator mode, which is no longer shown.
function attributionChipText(targetEngine?: string): string | null {
  return targetEngine ? ENGINE_CHIP_LABELS[targetEngine] ?? null : null
}

function engineHeaderLabel(targetEngine?: string, isStreaming?: boolean): string {
  // Same map as the bottom accountability chip, read from THIS message only.
  //
  // Deliberately map-only, with no getEngineDisplayLabel fallback: that map
  // also carries non-engines ('mediator' -> 'Mediator', 'auto' -> 'Routing…')
  // for the Observability ledger, and any of those reaching this header would
  // print an internal routing component as the author of the user's answer.
  // An id this map does not know is not yet a real engine, so it reads as
  // pre-routing rather than as a name.
  const label = targetEngine ? ENGINE_CHIP_LABELS[targetEngine] : undefined
  if (label) return label
  return isStreaming ? 'Routing…' : 'Rivine'
}

// ─────────────────────────────────────────────────────────────────────────────
// GeneratingAnimation
// ─────────────────────────────────────────────────────────────────────────────

export const GeneratingAnimation = () => (
  <div className="flex items-center space-x-3 px-4 py-3">
    <Sparkles className="w-5 h-5 text-blue-500 dark:!text-blue-400 animate-pulse transition-colors duration-300" />
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 bg-blue-500 dark:!bg-blue-400 rounded-full animate-bounce transition-colors duration-300" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-blue-500 dark:!bg-blue-400 rounded-full animate-bounce transition-colors duration-300" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-blue-500 dark:!bg-blue-400 rounded-full animate-bounce transition-colors duration-300" style={{ animationDelay: '300ms' }} />
    </div>
    <span className="text-sm text-gray-600 dark:!text-gray-300 animate-pulse transition-colors duration-300">Generating content...</span>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// InlineApprovalCard
// ─────────────────────────────────────────────────────────────────────────────

export const InlineApprovalCard = ({
  request,
  onApprove,
  onReject,
  onViewDetails,
  onAttachFile,
}: {
  request: any
  /** Both receive the optional "Others / add constraints" text as feedback. */
  onApprove: (
    feedback?: string,
    modifiedArgs?: Record<string, unknown>,
    attachments?: Array<{ asset_id: string; filename: string }>,
  ) => void
  onReject: (feedback?: string) => void
  onViewDetails?: () => void
  /** Markdown-first upload, same pipeline as the chat bar. */
  onAttachFile?: (file: File) => Promise<{ asset_id: string; filename: string } | null>
}) => {
  const tool = String(request?.tool ?? '')
  const hitlType = String(request?.hitl_type ?? '')
  const isCharlie = hitlType === 'mediator_charlie'
  const isMcpTool = hitlType === 'mcp_tool'
  // Cicero stops to ask a question it needs answered before it can start.
  // This is an input, not a permission gate: the user types the answer and
  // the engine resumes the request it had already understood.
  // Every engine raises `<engine>_clarification` (cicero, research, ...),
  // so match the suffix rather than adding a branch per engine.
  const isClarification = hitlType.endsWith('_clarification')
  const uiSchema = (
    request?.ui_schema &&
    typeof request.ui_schema === 'object' &&
    !Array.isArray(request.ui_schema)
  ) ? request.ui_schema as Record<string, any> : {}
  const uiProperties = (
    uiSchema.properties &&
    typeof uiSchema.properties === 'object' &&
    !Array.isArray(uiSchema.properties)
  ) ? uiSchema.properties as Record<string, any> : {}
  const hasStructuredFields = Object.keys(uiProperties).length > 0
  const hasDetails = Boolean(uiSchema['x-detail-view'])
  const severity = String(uiSchema['x-hitl-severity'] || (isCharlie || isClarification ? 'info' : 'caution'))
  const isCaution = severity === 'danger' || severity === 'caution'
  const connectorLabel = String(
    uiSchema['x-hitl-connector-label']
    || request?.connector
    || uiSchema['x-hitl-connector']
    || '',
  )
  const remoteTool = String(uiSchema['x-hitl-tool'] || tool || '')

  const [showFeedback, setShowFeedback] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(!hasStructuredFields && isMcpTool)
  const [feedback, setFeedback] = useState('')
  const [argsText, setArgsText] = useState(() =>
    JSON.stringify(request?.args || {}, null, 2),
  )
  const [argsError, setArgsError] = useState<string | null>(null)
  // Files attached on the card. When an engine pauses to ask "which document
  // should I review?", the answer is usually a file — and the card was
  // text-only, so the user had to cancel the pause and start over from the
  // chat bar.
  const [cardFiles, setCardFiles] = useState<Array<{ asset_id: string; filename: string }>>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const trimmedFeedback = feedback.trim() || undefined

  const parseArgs = (): Record<string, unknown> => {
    try {
      const parsed = JSON.parse(argsText)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed
    } catch {
      /* fall through */
    }
    return { ...(request?.args || {}) }
  }

  const updateStructuredArg = (name: string, value: unknown) => {
    const next = { ...parseArgs(), [name]: value }
    setArgsText(JSON.stringify(next, null, 2))
    setArgsError(null)
  }

  // What the user typed into the schema-driven field(s). For a clarification
  // this IS the answer, and it has to travel as `feedback` because that is
  // what the resume endpoint folds back into the original request.
  const pickFiles = async (list: FileList | null) => {
    if (!list || !onAttachFile) return
    setUploading(true)
    try {
      for (const file of Array.from(list)) {
        const saved = await onAttachFile(file)
        if (saved) setCardFiles((prev) => [...prev, saved])
      }
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const clarificationAnswer = isClarification
    ? Object.keys(uiProperties)
        .map((name) => String(parseArgs()[name] ?? '').trim())
        .filter(Boolean)
        .join('\n\n')
    : ''
  const canSend =
    !isClarification || Boolean(clarificationAnswer || trimmedFeedback || cardFiles.length)

  const fieldClass =
    'w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-gray-950/60 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 shadow-sm outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 32 }}
      className="mt-4 mb-6 w-full max-w-3xl mx-auto"
    >
      <div
        className={`relative overflow-hidden rounded-2xl border shadow-[0_12px_40px_-18px_rgba(15,23,42,0.35)] ${
          isCaution
            ? 'border-rose-200/80 dark:border-rose-900/50 bg-gradient-to-br from-rose-50/90 via-white to-orange-50/70 dark:from-rose-950/40 dark:via-gray-900 dark:to-orange-950/30'
            : 'border-sky-200/70 dark:border-sky-900/40 bg-gradient-to-br from-sky-50/90 via-white to-cyan-50/60 dark:from-sky-950/35 dark:via-gray-900 dark:to-cyan-950/25'
        }`}
      >
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-1 ${
            isCaution
              ? 'bg-gradient-to-r from-rose-400 via-orange-400 to-amber-300'
              : 'bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-300'
          }`}
        />

        <div className="relative flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  isCaution
                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300'
                    : 'bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-300'
                }`}
              >
                {isCaution ? <AlertTriangle className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                    {isCharlie
                      ? 'Review optimized plan'
                      : isMcpTool
                        ? 'Confirm app action'
                        : isClarification
                          ? 'Quick question'
                          : 'Approval needed'}
                  </h4>
                  {isMcpTool && connectorLabel && (
                    <span className="inline-flex items-center rounded-full bg-white/70 dark:bg-gray-800/80 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:text-gray-300 ring-1 ring-black/5 dark:ring-white/10">
                      {connectorLabel}
                    </span>
                  )}
                  {isMcpTool && remoteTool && (
                    <span className="inline-flex max-w-full truncate items-center rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-700 dark:text-sky-300">
                      {remoteTool}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {isCharlie
                    ? 'Charlie refined your request before routing. Approve to continue into TaskForce, or revise.'
                    : request.message
                      || (remoteTool
                        ? `TaskForce is ready to run ${remoteTool}. Review the details below.`
                        : 'Please confirm to continue.')}
                </p>
              </div>
            </div>
          </div>

          {isCharlie && (
            <div className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-gray-950/40 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
                Optimized intent
              </p>
              <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {request.message || 'Continue with the refined request.'}
              </p>
            </div>
          )}

          {(isMcpTool || isClarification) && (
            <div className="space-y-3">
              {hasStructuredFields && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {Object.entries(uiProperties).map(([name, schema]) => {
                    const values = parseArgs()
                    const value = values[name] ?? schema.default ?? ''
                    const label = schema.title || name.replaceAll('_', ' ')
                    const required = Array.isArray(uiSchema.required) && uiSchema.required.includes(name)
                    const description = typeof schema.description === 'string' ? schema.description : ''

                    if (Array.isArray(schema.enum)) {
                      return (
                        <label key={name} className="block text-sm text-gray-700 dark:text-gray-200">
                          <span className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">
                            {label}{required ? ' *' : ''}
                          </span>
                          <select
                            value={String(value)}
                            onChange={(event) => updateStructuredArg(name, event.target.value)}
                            className={fieldClass}
                          >
                            {schema.enum.map((option: unknown) => (
                              <option key={String(option)} value={String(option)}>{String(option)}</option>
                            ))}
                          </select>
                          {description && <span className="mt-1 block text-[11px] text-gray-400">{description}</span>}
                        </label>
                      )
                    }
                    if (schema.type === 'boolean') {
                      return (
                        <label
                          key={name}
                          className="flex items-center gap-3 rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-gray-950/40 px-3 py-3 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(value)}
                            onChange={(event) => updateStructuredArg(name, event.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-400"
                          />
                          <span>
                            <span className="font-semibold text-gray-800 dark:text-gray-100">{label}</span>
                            {description && <span className="mt-0.5 block text-[11px] text-gray-400">{description}</span>}
                          </span>
                        </label>
                      )
                    }
                    const multiline = schema.format === 'textarea' || schema['x-ui'] === 'textarea'
                    return (
                      <label key={name} className={`block text-sm text-gray-700 dark:text-gray-200 ${multiline ? 'sm:col-span-2' : ''}`}>
                        <span className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">
                          {label}{required ? ' *' : ''}
                        </span>
                        {multiline ? (
                          <textarea
                            value={String(value)}
                            rows={4}
                            onChange={(event) => updateStructuredArg(name, event.target.value)}
                            className={`${fieldClass} resize-y`}
                          />
                        ) : (
                          <input
                            type={
                              schema.type === 'integer' || schema.type === 'number'
                                ? 'number'
                                : schema.format === 'email'
                                  ? 'email'
                                  : schema.format === 'uri' || schema.format === 'url'
                                    ? 'url'
                                    : 'text'
                            }
                            value={String(value)}
                            onChange={(event) => updateStructuredArg(
                              name,
                              schema.type === 'integer' || schema.type === 'number'
                                ? Number(event.target.value)
                                : event.target.value,
                            )}
                            className={fieldClass}
                          />
                        )}
                        {description && <span className="mt-1 block text-[11px] text-gray-400">{description}</span>}
                      </label>
                    )
                  })}
                </div>
              )}

              {isMcpTool && (
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="text-xs font-medium text-sky-700 dark:text-sky-300 hover:underline"
                >
                  {showAdvanced ? 'Hide raw arguments' : 'Edit raw JSON'}
                </button>
              )}
              <AnimatePresence initial={false}>
                {showAdvanced && isMcpTool && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <textarea
                      value={argsText}
                      onChange={(event) => {
                        setArgsText(event.target.value)
                        setArgsError(null)
                      }}
                      rows={5}
                      spellCheck={false}
                      className={`${fieldClass} font-mono text-xs`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              {argsError && <p className="text-xs text-rose-600 dark:text-rose-400">{argsError}</p>}
            </div>
          )}

          {isClarification && onAttachFile && (
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept=".md,.markdown,.txt,.pdf,.doc,.docx,.csv,.xlsx,.xls,.ppt,.pptx,.json,.html,.rtf"
                onChange={(e) => void pickFiles(e.target.files)}
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-gray-950/50 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-white disabled:opacity-50 transition"
                >
                  <Paperclip className="h-3.5 w-3.5" />
                  {uploading ? 'Parsing…' : 'Attach file'}
                </button>
                <span className="text-[11px] text-gray-400">
                  Converted to markdown, same as the chat bar
                </span>
              </div>
              {cardFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {cardFiles.map((f) => (
                    <span
                      key={f.asset_id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/10 px-2 py-1 text-[11px] font-medium text-sky-700 dark:text-sky-300"
                    >
                      <FileText className="h-3 w-3 flex-shrink-0" />
                      <span className="max-w-[200px] truncate">{f.filename}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${f.filename}`}
                        onClick={() =>
                          setCardFiles((prev) => prev.filter((x) => x.asset_id !== f.asset_id))
                        }
                        className="ml-0.5 text-sky-500/70 hover:text-rose-500 transition"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <AnimatePresence initial={false}>
            {showFeedback ? (
              <motion.textarea
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={2}
                placeholder={isCharlie
                  ? 'What should Charlie change before routing?'
                  : 'Add constraints or direction for how to proceed…'}
                className={fieldClass}
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowFeedback(true)}
                className="self-start text-xs font-medium text-gray-500 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
              >
                Add notes or constraints…
              </button>
            )}
          </AnimatePresence>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3 pt-1">
            {hasDetails && onViewDetails && (
              <button
                onClick={onViewDetails}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-gray-950/50 px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-white transition"
              >
                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                View draft
              </button>
            )}
            <button
              onClick={() => onReject(trimmedFeedback)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white/80 dark:bg-gray-950/50 px-3.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            >
              <XIcon className="w-3.5 h-3.5" />
              {isCharlie && trimmedFeedback ? 'Revise' : isClarification ? 'Cancel' : 'Deny'}
            </button>
            <button
              onClick={() => {
                if (isClarification) {
                  // The field value is the answer; the notes box is optional
                  // extra direction. Both go back as feedback so the resumed
                  // turn sees them as part of the original request.
                  onApprove(
                    [clarificationAnswer, trimmedFeedback].filter(Boolean).join('\n\n') || undefined,
                    undefined,
                    cardFiles,
                  )
                  return
                }
                if (!isMcpTool) {
                  onApprove(trimmedFeedback)
                  return
                }
                try {
                  const parsed = JSON.parse(argsText)
                  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
                    throw new Error('Arguments must be a JSON object.')
                  }
                  const remote = String(remoteTool || tool || '')
                  if (remote.includes('render_diagram')) {
                    const ops = (parsed as Record<string, unknown>).ops
                    if (!Array.isArray(ops) || ops.length === 0) {
                      throw new Error(
                        'render_diagram requires a non-empty ops array. Deny and let TaskForce retry with diagram ops.',
                      )
                    }
                  }
                  if (remote.includes('create_view') || remote.includes('create_scene')) {
                    let elements = (parsed as Record<string, unknown>).elements
                    if (Array.isArray(elements) || (elements && typeof elements === 'object')) {
                      elements = JSON.stringify(elements)
                      ;(parsed as Record<string, unknown>).elements = elements
                      setArgsText(JSON.stringify(parsed, null, 2))
                    }
                    if (typeof elements !== 'string' || !elements.trim()) {
                      throw new Error(
                        'create_view requires a non-empty elements JSON string. Deny and let TaskForce retry with diagram content.',
                      )
                    }
                  }
                  onApprove(trimmedFeedback, parsed)
                } catch (error) {
                  setArgsError(error instanceof Error ? error.message : 'Invalid JSON arguments')
                }
              }}
              disabled={!canSend}
              title={canSend ? undefined : 'Answer the question first'}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 transition disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              <Check className="w-3.5 h-3.5" />
              {isCharlie ? 'Continue' : isClarification ? 'Send answer' : 'Approve & run'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// McpArtifactView — slim connector artifact refs (snapshots via deliverables)
// ─────────────────────────────────────────────────────────────────────────────

export type McpArtifactView = {
  connector_id?: string
  connector_label?: string
  tool_name?: string
  kind?: string
  summary?: string
  is_error?: boolean
  checkpoint_id?: string
  embed_url?: string
  ui_resource_uri?: string
  images?: { src: string; mime?: string }[]
  resource_uris?: string[]
  elements?: unknown[]
  skeleton?: unknown[]
  focus?: {
    targetIds: string[]
    fitToViewport?: boolean
    animate?: boolean
  } | null
  asset_id?: string
  filename?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// EnhancedMarkdownMessage
// ─────────────────────────────────────────────────────────────────────────────

/**
 * What the engine is doing, and did, on this turn.
 *
 * Every engine already streamed this — `thought` titles, `stage` labels, tool
 * names — into a single status line that the next event overwrote. One line at
 * a time, no history, and nothing left once the turn ended: on a Code or
 * Research turn that is minutes of visible work reduced to a flicker, which is
 * why it reads as "nothing is happening".
 *
 * Shown expanded while the turn runs, because that is when someone is watching
 * and wondering. Collapsed to a one-line summary afterwards, because by then
 * the answer is the point and this is the receipt.
 *
 * Labels only, by construction: `sanitize_event` strips a thought's body
 * server-side, and this renders exactly what it lets through.
 */
const ActivityTrail = ({
  activity,
  isStreaming,
}: {
  activity: ActivityEntry[]
  isStreaming: boolean
}) => {
  const [expanded, setExpanded] = useState(false)
  if (!activity.length) return null

  // Live turns show the tail — the recent steps — rather than the whole run,
  // so the panel does not grow without bound while someone is reading it.
  const open = isStreaming || expanded
  const rows = isStreaming ? activity.slice(-6) : activity
  const current = activity[activity.length - 1]

  return (
    <div className="px-4 pb-2">
      {/* The header is the collapse control, so it only earns its space once
          there is something to collapse. While the turn runs it repeated the
          active row's label verbatim directly above it; the rows below are
          already the live view. */}
      {!isStreaming && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 text-xs text-gray-500 dark:!text-gray-400 transition-colors hover:text-gray-700 dark:hover:!text-gray-200"
        >
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
          <span>{`${activity.length} step${activity.length === 1 ? '' : 's'}`}</span>
        </button>
      )}

      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className={[
              // One enclosure with hairline-divided rows, not a pile of
              // separate cards. The steps are a single sequence, so they read
              // as one connected run rather than unrelated panes that happen
              // to be adjacent.
              'relative mt-2 overflow-hidden rounded-xl border backdrop-blur-md',
              'border-gray-200/70 dark:border-white/10',
              'divide-y divide-gray-200/60 dark:divide-white/[0.07]',
              'bg-white/50 dark:bg-white/[0.04]',
            ].join(' ')}
          >
            {/* The wire. A continuous rail behind the dots so each step reads
                as a node on one thread; without it, divided rows still look
                like a stack. Inset to stop short of the first and last dot so
                the run has visible ends rather than bleeding off the edges. */}
            <span
              aria-hidden
              className="pointer-events-none absolute left-[1.0625rem] top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-gray-300/70 dark:via-white/15 to-transparent"
            />
            {rows.map((step) => (
              <li key={step.id} className="relative">
                <div
                  className={[
                    'group/step relative flex items-center gap-2.5 px-2.5 py-2',
                    'text-xs leading-relaxed transition-colors duration-150',
                    step.status === 'active'
                      ? 'bg-[#00477d]/[0.06] dark:bg-blue-400/10'
                      : 'hover:bg-white/70 dark:hover:bg-white/[0.06]',
                  ].join(' ')}
                >
                  {/* Accent on the active row. Replaces the per-pane border
                      that used to mark it — inside one enclosure a full border
                      would cut the run in half. */}
                  {step.status === 'active' && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-[#00477d] dark:bg-blue-400"
                    />
                  )}
                  {/* Sits on the wire, with a ring in the row's own colour so
                      the rail appears to pass behind rather than through it. */}
                  <span
                    className={[
                      'relative z-[1] w-1.5 h-1.5 rounded-full flex-shrink-0 ring-4',
                      step.status === 'active'
                        ? 'bg-[#00477d] dark:!bg-blue-400 animate-pulse ring-[#eef2f6] dark:ring-[#18202b]'
                        : 'bg-gray-300 dark:!bg-gray-600 ring-white/50 dark:ring-[#151a21] group-hover/step:bg-gray-400 dark:group-hover/step:bg-gray-500',
                    ].join(' ')}
                  />
                  <span
                    className={[
                      'min-w-0 flex-1 truncate transition-colors',
                      step.status === 'active'
                        ? 'text-gray-700 dark:!text-gray-200'
                        : 'text-gray-500 dark:!text-gray-400 group-hover/step:text-gray-700 dark:group-hover/step:!text-gray-200',
                    ].join(' ')}
                    title={step.label}
                  >
                    {step.label}
                  </span>
                </div>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Save a deliverable straight to disk from its snapshot card.
 *
 * Reads the workspace at click time rather than taking it as a prop: the
 * deliverable being clicked is by definition in the workspace on screen, and
 * threading an id through every layer between ChatSpace and a card would add a
 * prop to components that have no other use for it.
 */
async function downloadDeliverable(assetId: string, filename: string) {
  const workspaceId = useWorkspaceStore.getState().currentWorkspace?.id
  if (!workspaceId) {
    toast.error('Open a workspace to download this')
    return
  }
  try {
    await saveAssetToDisk(workspaceId, assetId, filename)
    toast.success(`Downloaded ${filename}`)
  } catch {
    toast.error('Could not download that deliverable')
  }
}

export const EnhancedMarkdownMessage = ({
  content,
  isUser,
  messageId,
  onDeleteTurn,
  messageIndex,
  totalMessages,
  aiMessageIndex,
  totalAIMessages,
  isStreaming,
  liveStatus,
  imageUrl,
  imagePrompt,
  deliverableAssetId,
  deliverableFilename,
  deliverables,
  mcpArtifacts,
  optimizedIntent,
  targetEngine,
  mediatorMode,
  codeSteps,
  activity,
  onSnapshotClick,
  onOpenProject,
  onOpenDeliverable,
  resolveAsset,
  isLatestUserMessage = false,
}: {
  content: string
  isUser: boolean
  /** This message's own id — needed to request deletion of its turn. */
  messageId?: string
  /** Deletes this AI message's whole turn (paired user intent + deliverables, server-side). */
  onDeleteTurn?: (aiMessageId: string) => void
  timestamp?: string
  isStreaming?: boolean
  liveStatus?: string | null
  /** What the engine did this turn, in order. See ChatMessage.activity. */
  activity?: ActivityEntry[]
  messageIndex?: number
  totalMessages?: number
  aiMessageIndex?: number
  totalAIMessages?: number
  imageUrl?: string
  imagePrompt?: string
  deliverableAssetId?: string
  deliverableFilename?: string
  /** Multi-deliverable turns (Research: markdown + HTML); replaces the single card when present */
  deliverables?: { assetId: string; filename?: string; kind?: string }[]
  /** @deprecated Inline MCP widgets retired — artifacts open via deliverable snapshots. */
  mcpArtifacts?: McpArtifactView[]
  /** Mediator-optimized intent routed to the Rivine engine (persisted). */
  optimizedIntent?: string | null
  /** Accountability: which Rivine engine executed / which mediator mode routed */
  targetEngine?: string
  mediatorMode?: string
  /** Rivine Code: commands run this turn (execute tool), rendered as a collapsible Steps log */
  codeSteps?: { id: string; command: string; output?: string; status: 'running' | 'done' }[]
  onSnapshotClick?: (selection: PreviewSelection) => void
  /** Rivine Code project bundle card → reopen the file-system panel. */
  onOpenProject?: (assetId: string, filename?: string) => void
  /** Open a saved deliverable in the Preview panel (refreshes assets if needed). */
  onOpenDeliverable?: (assetId: string) => void
  resolveAsset?: (assetId: string) => Asset | undefined
  /** When false, older user requests render as a collapsed flip card. */
  isLatestUserMessage?: boolean
}) => {
  const [copied, setCopied] = useState(false)
  const [stepsExpanded, setStepsExpanded] = useState(false)
  const [aiExpanded, setAiExpanded] = useState(false)

  /**
   * Every deliverable this turn produced — the array AND the singular id.
   *
   * These used to be an either/or: `deliverables?.length ? grid : singular`.
   * A TaskForce Chat turn that wrote three documents saved all three to Assets
   * but set `deliverableAssetId` to the last one, so whichever branch won hid
   * the rest. Users saw one card on the thread and found the others only by
   * opening the Assets panel — the deliverables were never lost, just never
   * shown, which reads as the engine having silently dropped work.
   *
   * Union, deduplicated by assetId, preserving array order and appending the
   * singular only when it is not already represented. Both fields stay
   * populated by the backend, so this must not assume either one is complete.
   */
  const allDeliverables = useMemo(() => {
    const merged: { assetId: string; filename?: string; kind?: string }[] = []
    const seen = new Set<string>()
    for (const d of deliverables || []) {
      if (!d?.assetId || seen.has(d.assetId)) continue
      seen.add(d.assetId)
      merged.push(d)
    }
    if (deliverableAssetId && !seen.has(deliverableAssetId)) {
      merged.push({ assetId: deliverableAssetId, filename: deliverableFilename })
    }
    return merged
  }, [deliverables, deliverableAssetId, deliverableFilename])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast.success('Message copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy message')
    }
  }

  if (isUser) {
    const parsed = parseMessagePrompt(content)
    const hasSnapshots = parsed.pastedBlocks.length > 0 || parsed.fileBlocks.length > 0
    const displayText = parsed.visibleText

    const handleSnapshot = (selection: PreviewSelection) => {
      if (onSnapshotClick) onSnapshotClick(selection)
    }

    const snapshotStrip = hasSnapshots ? (
      <div className="flex items-start gap-2 overflow-x-auto pb-2 mb-2 border-b border-gray-100 dark:border-gray-700/80">
        {parsed.pastedBlocks.map((block) => (
          <AttachmentSnapshot
            key={`pasted-${block.index}`}
            kind="pasted"
            title="Pasted text"
            preview={snippetFromText(block.content, 140)}
            label="PASTED"
            layout="strip"
            onClick={() => handleSnapshot({ kind: 'pasted', content: block.content })}
          />
        ))}
        {parsed.fileBlocks.map((block) => (
          <AttachmentSnapshot
            key={`file-${block.index}`}
            kind="file"
            title={block.filename}
            label={block.filename.split('.').pop()?.toUpperCase() ?? 'FILE'}
            layout="strip"
            onClick={() => {
              const asset = resolveAsset?.(block.assetId) ?? assetStubFromFileBlock(block)
              handleSnapshot({ kind: 'asset', asset })
            }}
          />
        ))}
      </div>
    ) : null

    return (
      <div className="group inline-flex items-end gap-0.5 self-start max-w-full md:w-full">
        <div className="w-fit min-w-0 max-w-[min(100%,32rem)] md:max-w-full rounded-2xl rounded-tl-md px-3.5 py-2 shadow-sm border border-violet-200/70 dark:border-violet-800/45 bg-violet-50/95 dark:bg-violet-950/35 text-gray-900 dark:text-gray-100">
          {snapshotStrip}
          {displayText && (
            <CollapsiblePlainText
              text={displayText}
              maxLines={2}
              className="text-sm leading-relaxed whitespace-pre-wrap break-words"
            />
          )}
        </div>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCopy() }}
          aria-label="Copy request"
          title="Copy"
          className="flex-shrink-0 mb-1 p-0.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-150 active:scale-[0.97]"
        >
          {copied ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    )
  }

  // AI messages — compact by default; expand on demand (ChatGPT-style).
  const htmlBlocks = extractHtmlBlocksFromMarkdown(content)
  const aiContentLong = !isStreaming && textNeedsTruncation(content, 5)

  return (
    <div className="group relative">
      <div className="bg-transparent">
        {/* Header */}
        <div className="flex items-center px-1 py-1">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-[#00477d] rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {engineHeaderLabel(targetEngine, isStreaming)}
            </span>
          </div>
        </div>

        {htmlBlocks.length > 0 && onSnapshotClick && (
          <div className="px-2 pb-2">
            <div className="flex items-start gap-2 overflow-x-auto pb-1">
              {htmlBlocks.map((block, idx) => (
                <AttachmentSnapshot
                  key={`ai-html-${idx}`}
                  kind="file"
                  title={block.title}
                  preview={snippetFromText(block.code, 140)}
                  label="HTML"
                  layout="strip"
                  onClick={() => onSnapshotClick({
                    kind: 'html',
                    content: block.code,
                    title: block.title,
                  })}
                />
              ))}
            </div>
          </div>
        )}

        {/* Live status — only until the activity trail has something to show.
            The trail's own active row carries the same label, so running both
            printed the current step three times over (bouncing dots, this
            line, and the highlighted pane) and read as a stutter rather than
            as progress. Once a step exists the trail is the single place the
            turn's state is reported. */}
        {isStreaming && !content && !activity?.length && (
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-[#00477d] dark:!bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-[#00477d] dark:!bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-[#00477d] dark:!bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm text-gray-500 dark:!text-gray-400">
              {liveStatus || 'Working…'}
            </span>
          </div>
        )}
        {isStreaming && !!content && !activity?.length && (
          <div className="flex items-center gap-2 px-4 pb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-gray-500 dark:!text-gray-400">
              {liveStatus || 'Working…'}
            </span>
          </div>
        )}

        {/* The steps behind that status line — live while the turn runs, and
            still there afterwards instead of vanishing with the spinner. */}
        {!isUser && !!activity?.length && (
          <ActivityTrail activity={activity} isStreaming={!!isStreaming} />
        )}

        {/* Content */}
        <div className="px-1 pb-1">
          {!!optimizedIntent && (
            <OptimizedIntentBlock
              raw={optimizedIntent}
              isStreaming={isStreaming}
              hasContent={!!content}
            />
          )}
          {!!content && (
            <div className="relative">
              <div
                className={[
                  'prose prose-sm max-w-none text-gray-800 dark:!text-gray-200 prose-headings:dark:!text-white prose-strong:dark:!text-white prose-code:dark:!text-white prose-pre:dark:!bg-gray-800 transition-colors duration-300',
                  !aiExpanded && aiContentLong ? 'max-h-[8.5rem] overflow-hidden' : '',
                ].join(' ')}
              >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold mb-4 text-gray-900 dark:!text-white mt-0 border-b border-gray-200 dark:!border-gray-700 pb-2 transition-colors duration-300">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-bold mb-3 text-gray-800 dark:!text-white mt-6 first:mt-0 transition-colors duration-300">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold mb-2 text-gray-700 dark:!text-gray-100 mt-4 transition-colors duration-300">{children}</h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:!text-gray-200 mt-3 transition-colors duration-300">{children}</h4>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900 dark:!text-white transition-colors duration-300">{children}</strong>
                ),
                img: ({ src, alt, ...props }: any) => <SecureImage src={src} alt={alt} {...props} />,
                ul: ({ children, ...props }) => {
                  const depth = (props as any).node?.parent?.tagName === 'li' ? 1 : 0
                  return <ul className={`list-none mb-4 space-y-2 ml-0 ${depth > 0 ? 'ml-4' : ''}`}>{children}</ul>
                },
                ol: ({ children, ...props }) => {
                  const depth = (props as any).node?.parent?.tagName === 'li' ? 1 : 0
                  return <ol className={`list-none mb-4 space-y-2 ml-0 ${depth > 0 ? 'ml-4' : ''}`}>{children}</ol>
                },
                li: ({ children, ...props }) => {
                  const isOrderedList = (props as any).node?.parent?.tagName === 'ol'
                  const listIndex = (props as any).node?.parent?.children?.indexOf((props as any).node) || 0
                  return (
                    <li className="text-gray-700 dark:!text-white text-sm leading-relaxed flex items-start mb-1 transition-colors duration-300">
                      <span className="text-gray-400 dark:!text-gray-500 mr-3 mt-0.5 flex-shrink-0 min-w-[1.5rem] text-right">
                        {isOrderedList ? `${listIndex + 1}.` : '•'}
                      </span>
                      <span className="flex-1 leading-relaxed">{children}</span>
                    </li>
                  )
                },
                p: ({ children }) => (
                  <div className="mb-2 text-gray-700 dark:!text-white leading-relaxed text-sm last:mb-0 transition-colors duration-300">{children}</div>
                ),
                code: ({ children, className }) => {
                  const isBlock = className?.includes('language-')
                  const language = className?.replace('language-', '') || 'text'
                  const handleCopyCode = async () => {
                    try {
                      await navigator.clipboard.writeText(String(children).replace(/\n$/, ''))
                      toast.success('Code copied')
                    } catch {
                      toast.error('Failed to copy')
                    }
                  }
                  return isBlock ? (
                    <div className="my-4 relative group">
                      <button
                        onClick={handleCopyCode}
                        className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 bg-gray-100 dark:!bg-gray-700 hover:bg-gray-200 dark:hover:!bg-gray-600 rounded-md shadow-sm"
                        title="Copy code"
                      >
                        <Copy className="w-4 h-4 text-gray-600 dark:!text-gray-300" />
                      </button>
                      <SyntaxHighlighter
                        language={language}
                        style={document.documentElement.classList.contains('dark') ? materialDark : materialLight}
                        customStyle={{
                          margin: 0,
                          padding: '1rem',
                          fontSize: '0.875rem',
                          lineHeight: '1.5',
                          backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#f8f9fa',
                          borderRadius: '0.75rem',
                          border: document.documentElement.classList.contains('dark') ? '1px solid #374151' : '1px solid #e5e7eb',
                          color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#1f2937',
                        }}
                        showLineNumbers={false}
                        wrapLines
                        wrapLongLines
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="bg-gray-100 dark:!bg-gray-800 text-gray-800 dark:!text-white px-2 py-1 rounded-md text-xs font-mono border border-gray-300 dark:!border-gray-600 transition-colors duration-300">
                      {children}
                    </code>
                  )
                },
                pre: ({ children }) => (
                  <pre className="bg-canvas dark:!bg-gray-900 text-gray-800 dark:!text-gray-200 p-4 rounded-xl overflow-x-auto my-4 text-sm border border-gray-200 dark:!border-gray-700 shadow-sm transition-colors duration-300">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 dark:!border-blue-400 pl-4 italic text-gray-600 dark:!text-gray-300 my-4 bg-blue-50 dark:!bg-blue-900/20 py-3 rounded-r-lg transition-colors duration-300">
                    {children}
                  </blockquote>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="text-blue-600 dark:!text-blue-400 hover:text-blue-800 dark:hover:!text-blue-300 underline break-words inline-flex items-center gap-1 transition-colors duration-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4 border border-gray-200 dark:!border-gray-700 rounded-lg transition-colors duration-300">
                    <table className="min-w-full text-sm">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-gray-300 dark:!border-gray-600 px-3 py-2 bg-gray-50 dark:!bg-gray-800 font-semibold text-left text-gray-900 dark:!text-white transition-colors duration-300">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-gray-300 dark:!border-gray-600 px-3 py-2 text-gray-700 dark:!text-gray-300 transition-colors duration-300">
                    {children}
                  </td>
                ),
                hr: () => <hr className="my-6 border-gray-300 dark:!border-gray-700 transition-colors duration-300" />,
                div: (props: any) => {
                  const { children, className, ...rest } = props
                  if (className?.includes('math-display')) {
                    return <div className={`math-display my-4 ${className}`} {...rest}>{children}</div>
                  }
                  return <div className={className} {...rest}>{children}</div>
                },
              }}
            >
              {content}
            </ReactMarkdown>
              </div>
              {!aiExpanded && aiContentLong && (
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-canvas via-canvas/90 to-transparent dark:from-gray-900 dark:via-gray-900/90"
                  aria-hidden
                />
              )}
              {aiContentLong && (
                <ShowMoreToggle
                  expanded={aiExpanded}
                  onToggle={() => setAiExpanded((v) => !v)}
                  className="relative z-10 px-1"
                />
              )}
            </div>
          )}
        </div>

        {/* Generated Image */}
        {imageUrl && (
          <div className="px-2 pb-4">
            <div className="relative group/image overflow-hidden rounded-xl border border-gray-200 dark:!border-gray-700 bg-gray-50 dark:!bg-gray-900 shadow-sm transition-all duration-300 hover:shadow-md">
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={imageUrl}
                alt={imagePrompt || 'Generated Image'}
                className="w-full h-auto object-cover max-h-[500px]"
              />
              {imagePrompt && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 backdrop-blur-sm text-white text-xs opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                  <p className="line-clamp-2 italic">"{imagePrompt}"</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Deliverable (saved asset) cards — multi-deliverable turns (Research:
            markdown + PDF/XLSX + optional PNG) render one card per artifact; single-deliverable
            turns fall back to the legacy single card. Never both. */}
        {/* Grid, not a column. A TaskForce turn routinely returns 8-10
            artifacts (xlsx + png + md + html per run); stacked full-width in a
            max-w-md column that scrolled for most of the thread and read as
            noise. Degrades to 1 column on narrow viewports so the cards never
            get too small to read. */}
        {allDeliverables.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch gap-2 px-2 pb-4 w-full">
            {allDeliverables.map((d) => (
              d.kind === 'code_project' ? (
                // Rivine Code project bundle — click reopens the file-system
                // panel (live sandbox); the card also downloads the project.
                <AttachmentSnapshot
                  key={d.assetId}
                  kind="file"
                  title={d.filename?.replace(/\.project\.json$/, '') || 'Project'}
                  label="PROJECT"
                  onClick={() => onOpenProject?.(d.assetId, d.filename)}
                />
              ) : (
                <AttachmentSnapshot
                  key={d.assetId}
                  kind="file"
                  title={d.filename || 'Deliverable'}
                  onDownload={() => downloadDeliverable(d.assetId, d.filename || 'deliverable')}
                  label={
                    d.kind === 'markdown'
                      ? 'MD'
                      : d.kind === 'pdf'
                        ? 'PDF'
                        : d.kind === 'xlsx'
                          ? 'XLSX'
                          : d.kind === 'pptx'
                            ? 'PPTX'
                          : d.kind === 'png'
                            ? 'PNG'
                      : d.kind === 'html'
                        ? 'HTML'
                        : d.kind === 'html_stem'
                          ? 'STEM'
                          : d.kind === 'html_3d'
                            ? '3D'
                          : d.kind === 'motion_graphics'
                            ? 'FILM'
                            : d.kind === 'excalidraw'
                              ? 'DIAGRAM'
                              : d.kind === 'mermaid'
                                ? 'MERMAID'
                          : d.kind === 'youtube'
                            ? 'YT'
                          : d.kind === 'image'
                            ? 'IMAGE'
                          : d.kind === 'video'
                            ? 'VIDEO'
                          : d.kind === 'audio'
                            ? 'AUDIO'
                            : d.kind === 'iframe' || d.kind === 'mcp_embed'
                              ? 'PREVIEW'
                              : d.kind === 'mcp_app'
                                ? 'APP'
                                : d.filename?.split('.').pop()?.toUpperCase() ?? 'FILE'
                  }
                  onClick={() => {
                    if (onOpenDeliverable) {
                      onOpenDeliverable(d.assetId)
                      return
                    }
                    const asset = resolveAsset?.(d.assetId)
                    if (asset) onSnapshotClick?.({ kind: 'asset', asset })
                    else toast.error('Deliverable not found in assets yet — try again in a moment.')
                  }}
                />
              )
            ))}
          </div>
        ) : null}

        {/* Rivine Code Steps log — commands the agent ran this turn (execute
            tool only). Collapsed by default; the Codex-CLI-style "completed
            task" view lives here, in the transcript itself. */}
        {codeSteps && codeSteps.length > 0 && (
          <div className="px-2 pb-4">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setStepsExpanded((v) => !v) }}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <ChevronRight className={`w-3 h-3 flex-shrink-0 transition-transform duration-150 ${stepsExpanded ? 'rotate-90' : ''}`} />
              {codeSteps.length === 1 ? '1 command' : `${codeSteps.length} commands`}
              {codeSteps.some((s) => s.status === 'running') && ' · running…'}
            </button>
            {stepsExpanded && (
              <div className="mt-2 space-y-2">
                {codeSteps.map((step) => (
                  <div
                    key={step.id}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 overflow-hidden"
                  >
                    <div className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-400 dark:text-gray-500 select-none">$</span>
                      <span className="truncate">{step.command}</span>
                      {step.status === 'running' && (
                        <span className="ml-auto text-[10px] text-gray-400 shrink-0">running…</span>
                      )}
                    </div>
                    {step.output && (
                      <pre className="px-3 py-2 font-mono text-[11px] leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
                        {step.output}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions bar */}
        <div className="flex items-center justify-between px-1 py-1">
          <div className="flex items-center space-x-1">
            <button
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors group"
              title="Copy message"
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                void handleCopy()
              }}
            >
              {copied ? (
                <CheckCircle className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              )}
            </button>
            {onDeleteTurn && messageId && (
              <button
                className="flex items-center gap-1 px-1.5 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors group ml-1"
                title="Delete this message thread"
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onDeleteTurn(messageId)
                }}
              >
                <Trash2 className="w-3 h-3 text-gray-400 group-hover:text-red-600" />
                <span className="hidden sm:inline text-[11px] text-gray-400 group-hover:text-red-600">Delete</span>
              </button>
            )}
          </div>
          {/* Accountability chip: the engine that executed */}
          {(() => {
            const chip = attributionChipText(targetEngine)
            if (!chip) return null
            return (
              <span
                className="text-[10px] font-medium text-gray-400 dark:text-gray-500 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700 select-none"
                title="Which engine executed this response"
              >
                {chip}
              </span>
            )
          })()}
        </div>
      </div>
    </div>
  )
}