'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUp, Loader2, Redo2, Sparkles, TextCursorInput, Undo2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { assistAsset, type AssistSelection } from '../../lib/assetsApi'

/**
 * Rivine Assist — the follow-up bar that hovers over an open document.
 *
 * It exists to stop a one-line change costing a full engine turn. "Add a risks
 * section", "make the header blue" — those are span swaps on a document the
 * user is already looking at, not work that needs orchestration, sub-agents and
 * a sandbox. The backend keeps it surgical (every edit is an exact-match,
 * unique substring or it is refused outright); this component's job is to make
 * it feel like part of the document rather than another chat.
 *
 * History is the whole reason this owns state at all. The editors underneath
 * have native undo for typing, but a programmatic content swap is invisible to
 * it — so an assist would otherwise be the one edit in the document a person
 * could not take back. The stack below snapshots the live document immediately
 * before each apply, which means a user's own typing since the last assist is
 * captured in the same step and comes back with it.
 */

export type RivineAssistKind = 'markdown' | 'html' | 'code'

export interface RivineAssistDockProps {
  workspaceId?: string
  assetId?: string
  kind: RivineAssistKind
  /**
   * One file inside a `code_project` asset. When set, the backend edits only
   * that entry in the project manifest and rewrites every sibling untouched.
   */
  filePath?: string
  /** Read at send time — the document changes under us as the user types. */
  getContent: () => string
  /** Put content into the editor and persist it. */
  onApply: (content: string) => void | Promise<void>
  /** View-only, or a document with no asset behind it to save into. */
  disabled?: boolean
  /**
   * The passage the user highlighted, or null for a whole-document edit.
   *
   * Sticky by contract: the owner sets this from the editor's last *non-empty*
   * selection and does not clear it when the editor loses focus. It has to work
   * that way, because clicking into this dock's textarea is itself what blurs
   * the editor — a selection that evaporated on blur would be impossible to
   * actually use. It clears when the user picks something else or presses the
   * chip's ✕.
   */
  selection?: AssistSelection | null
  /** Drop the current selection and go back to whole-document scope. */
  onClearSelection?: () => void
}

const PLACEHOLDER: Record<RivineAssistKind, string> = {
  markdown: 'Ask Rivine Assist to add or change something…',
  html: 'Ask Rivine Assist to change the page…',
  code: 'Ask Rivine Assist to change this file…',
}

const SELECTION_PLACEHOLDER: Record<RivineAssistKind, string> = {
  markdown: 'Ask Rivine Assist to change the highlighted passage…',
  html: 'Ask Rivine Assist to change the highlighted markup…',
  code: 'Ask Rivine Assist to change the highlighted code…',
}

/** A one-line, quote-shaped preview of the selection for the chip. */
function summarize(text: string, max = 56): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat
}

const storageKey = (assetId?: string) => `rivine-assist:hidden:${assetId ?? 'draft'}`

function readHidden(assetId?: string): boolean {
  // Per-viewer convenience only. Private windows and blocked site data throw
  // on access in some browsers, so this must never be the reason the dock
  // fails to render.
  try {
    return window.localStorage.getItem(storageKey(assetId)) === '1'
  } catch {
    return false
  }
}

export default function RivineAssistDock({
  workspaceId,
  assetId,
  kind,
  filePath,
  getContent,
  onApply,
  disabled = false,
  selection = null,
  onClearSelection,
}: RivineAssistDockProps) {
  const [hidden, setHidden] = useState(false)
  const [instruction, setInstruction] = useState('')
  const [busy, setBusy] = useState(false)
  const [reply, setReply] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Linear document history. `index` is where we currently are in it; entries
  // after it are redo territory until the next apply truncates them.
  const [history, setHistory] = useState<string[]>([])
  const [index, setIndex] = useState(-1)

  useEffect(() => {
    setHidden(readHidden(assetId))
    // History is per-document. Switching files in the code workspace keeps the
    // same asset, so keying this on assetId alone would let an undo restore
    // one file's contents over a different file.
    setHistory([])
    setIndex(-1)
    setReply('')
  }, [assetId, filePath])

  const setHiddenPersisted = useCallback(
    (next: boolean) => {
      setHidden(next)
      try {
        window.localStorage.setItem(storageKey(assetId), next ? '1' : '0')
      } catch {
        /* a remembered preference is not worth failing over */
      }
    },
    [assetId],
  )

  const canRun = Boolean(workspaceId && assetId) && !disabled
  const canUndo = index > 0
  const canRedo = index >= 0 && index < history.length - 1

  const send = useCallback(async () => {
    const text = instruction.trim()
    if (!text || !canRun || busy || !workspaceId || !assetId) return
    const before = getContent()
    // Pinned for the duration of the call. The editor stays live underneath and
    // the user may click elsewhere while it runs; the request must carry the
    // span they were looking at when they pressed send, not whatever is
    // highlighted when the response lands.
    const scope = selection?.text ? selection : null
    setBusy(true)
    setReply('')
    try {
      const result = await assistAsset(workspaceId, assetId, text, filePath, scope)
      await onApply(result.content)
      setHistory((prev) => {
        // The user may have typed since the last apply. If the live document
        // is not where history thinks it is, that typing becomes its own entry
        // so undo returns to what the person actually had, not to a stale
        // snapshot of it.
        const base = index >= 0 && prev[index] === before ? prev.slice(0, index + 1) : [...prev.slice(0, index + 1), before]
        const next = [...base, result.content]
        setIndex(next.length - 1)
        return next
      })
      setInstruction('')
      setReply(result.reply || 'Done.')
      // The highlighted text has just been replaced, so the old span no longer
      // describes anything. Releasing it also stops the next question silently
      // inheriting a scope the user has stopped thinking about.
      if (scope) onClearSelection?.()
      if (result.grounded) toast.success('Rivine Assist checked grounded sources')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Rivine Assist failed')
    } finally {
      setBusy(false)
    }
  }, [assetId, busy, canRun, filePath, getContent, index, instruction, onApply, onClearSelection, selection, workspaceId])

  const step = useCallback(
    async (delta: number) => {
      const target = index + delta
      if (target < 0 || target >= history.length || busy) return
      setBusy(true)
      try {
        await onApply(history[target])
        setIndex(target)
        setReply(delta < 0 ? 'Undone.' : 'Redone.')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not restore that version')
      } finally {
        setBusy(false)
      }
    },
    [busy, history, index, onApply],
  )

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        void send()
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        setHiddenPersisted(true)
      }
    },
    [send, setHiddenPersisted],
  )

  const scoped = Boolean(selection?.text)
  const placeholder = useMemo(
    () => (scoped ? SELECTION_PLACEHOLDER[kind] : PLACEHOLDER[kind]),
    [kind, scoped],
  )

  if (!canRun) return null

  if (hidden) {
    return (
      <button
        type="button"
        onClick={() => {
          setHiddenPersisted(false)
          window.setTimeout(() => inputRef.current?.focus(), 0)
        }}
        title="Show Rivine Assist"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 inline-flex items-center gap-1.5 rounded-full border border-black/10 dark:border-white/15 bg-[#00477d] text-white shadow-lg px-3 py-1.5 text-[11px] font-semibold hover:brightness-110 transition"
      >
        <Sparkles className="w-3.5 h-3.5" aria-hidden />
        Rivine Assist
      </button>
    )
  }

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[min(46rem,calc(100%-2rem))]">
      {reply && (
        <div className="mb-1.5 mx-auto w-fit max-w-full rounded-full bg-gray-900/85 dark:bg-gray-100/90 px-3 py-1 text-[11px] text-white dark:text-gray-900 shadow truncate">
          {reply}
        </div>
      )}
      {scoped && selection && (
        <div
          // Opaque on purpose. This chip floats over the editor, and at the
          // 8%-tint it used to carry, the code underneath read straight
          // through the label — the selection preview and the source it sits
          // on top of competed for the same pixels. It takes the canvas colour
          // in light mode and the panel's own dark surface in dark mode, so it
          // reads as part of the dock rather than a wash over the document.
          className="mb-1.5 flex items-center gap-1.5 rounded-xl border border-[#00477d]/30 dark:border-blue-300/25 !bg-canvas dark:!bg-gray-800 shadow-sm px-2.5 py-1.5 text-[11px] text-[#00477d] dark:text-blue-200"
          role="status"
        >
          <TextCursorInput className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
          <span className="font-semibold flex-shrink-0">Editing selection</span>
          <span className="truncate font-mono opacity-80" title={selection.text}>
            {summarize(selection.text)}
          </span>
          <span className="ml-auto flex-shrink-0 opacity-60 tabular-nums">
            {selection.text.length.toLocaleString()} chars
          </span>
          <button
            type="button"
            onClick={() => onClearSelection?.()}
            title="Edit the whole document instead"
            aria-label="Clear selection and edit the whole document"
            className="flex-shrink-0 p-0.5 rounded hover:bg-[#00477d]/15 dark:hover:bg-blue-300/20"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <div className="flex items-end gap-1.5 rounded-2xl border border-black/10 dark:border-white/15 bg-[#f4f4f0]/95 dark:bg-gray-800/95 backdrop-blur shadow-xl px-2 py-1.5">
        <Sparkles className="w-4 h-4 mb-1.5 ml-1 flex-shrink-0 text-[#00477d] dark:text-blue-300" aria-hidden />
        <textarea
          ref={inputRef}
          rows={1}
          value={instruction}
          disabled={busy}
          onChange={(event) => setInstruction(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Ask Rivine Assist"
          className="flex-1 resize-none bg-transparent px-1 py-1.5 text-[13px] leading-5 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none max-h-28"
        />
        <button
          type="button"
          onClick={() => void step(-1)}
          disabled={!canUndo || busy}
          title="Undo last change"
          aria-label="Undo last change"
          className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-35 disabled:hover:bg-transparent"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => void step(1)}
          disabled={!canRedo || busy}
          title="Redo"
          aria-label="Redo"
          className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-35 disabled:hover:bg-transparent"
        >
          <Redo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => void send()}
          disabled={busy || !instruction.trim()}
          title="Send to Rivine Assist"
          aria-label="Send to Rivine Assist"
          className="p-1.5 rounded-lg bg-[#00477d] text-white hover:brightness-110 disabled:opacity-40"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
        </button>
        <button
          type="button"
          onClick={() => setHiddenPersisted(true)}
          title="Hide Rivine Assist"
          aria-label="Hide Rivine Assist"
          className="p-1.5 rounded-lg text-gray-400 hover:bg-black/5 dark:hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
