'use client'

/**
 * SourceAssetEditor — the preview surface for a standalone text asset that is
 * neither prose nor a web page: JSON, YAML, a Python module, CSS, SQL, a
 * Dockerfile, a CSV.
 *
 * These used to render as a read-only `<pre>`. That was fine as a viewer and
 * wrong as a destination: the panel is where a person reads what an engine
 * produced and asks for the one change they want, and for these files there was
 * nowhere to ask. Now they get the same CodeMirror editor the code workspace
 * uses — language-aware by filename — and the same Rivine Assist dock, fenced
 * to whatever they highlight.
 *
 * Binary assets never reach here; `BinaryAssetPreview` takes them first.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FileCode2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { CodeEditor } from './codeworkspace/CodeEditor'
import RivineAssistDock from './RivineAssistDock'
import { updateAsset, type AssistSelection } from '../../lib/assetsApi'

const AUTOSAVE_MS = 2000

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'

const SAVE_LABEL: Record<SaveState, string> = {
  idle: '',
  dirty: 'Unsaved changes',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Save failed',
}

export function SourceAssetEditor({
  content,
  title,
  workspaceId,
  assetId,
  readOnly = false,
  onSaved,
}: {
  content: string
  title: string
  workspaceId?: string
  assetId?: string
  readOnly?: boolean
  onSaved?: (content: string) => void
}) {
  const [code, setCode] = useState(content)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [isDark, setIsDark] = useState(false)
  const [assistSelection, setAssistSelection] = useState<AssistSelection | null>(null)
  const autosaveRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // What we last put on screen from a prop or a save. Without it the effect
  // below reverts the buffer to the stale `content` prop on the next render
  // after an edit the parent has not been told about yet.
  const loadedKeyRef = useRef<string | null>(null)

  const canSave = Boolean(workspaceId && assetId) && !readOnly

  useEffect(() => {
    const key = `${assetId ?? 'draft'}::${content}`
    if (loadedKeyRef.current === key) return
    loadedKeyRef.current = key
    setCode(content)
    setSaveState('idle')
    setAssistSelection(null)
  }, [assetId, content])

  useEffect(() => {
    const root = document.documentElement
    const read = () => setIsDark(root.classList.contains('dark'))
    read()
    const observer = new MutationObserver(read)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => () => {
    if (autosaveRef.current) clearTimeout(autosaveRef.current)
  }, [])

  const saveNow = useCallback(
    async (silent = false, next?: string) => {
      if (!canSave || !workspaceId || !assetId) return
      const payload = next ?? code
      setSaveState('saving')
      try {
        await updateAsset(workspaceId, assetId, { content: payload })
        loadedKeyRef.current = `${assetId}::${payload}`
        setSaveState('saved')
        onSaved?.(payload)
        if (!silent) toast.success('Saved to asset')
      } catch {
        setSaveState('error')
        if (!silent) toast.error('Failed to save')
      }
    },
    [assetId, canSave, code, onSaved, workspaceId],
  )

  const handleChange = useCallback(
    (next: string) => {
      setCode(next)
      if (!readOnly) setSaveState('dirty')
      if (!canSave) return
      if (autosaveRef.current) clearTimeout(autosaveRef.current)
      autosaveRef.current = setTimeout(() => void saveNow(true, next), AUTOSAVE_MS)
    },
    [canSave, readOnly, saveNow],
  )

  /** Put Rivine Assist's result into the editor and persist it immediately.
   *
   * The assist endpoint already wrote the asset, but undo/redo replays earlier
   * content through this same callback and the server has never seen those — so
   * this saves unconditionally rather than only on the forward edit. */
  const applyAssisted = useCallback(
    async (next: string) => {
      setCode(next)
      loadedKeyRef.current = `${assetId ?? 'draft'}::${next}`
      if (autosaveRef.current) clearTimeout(autosaveRef.current)
      await saveNow(true, next)
    },
    [assetId, saveNow],
  )

  const lineCount = useMemo(() => code.split('\n').length, [code])
  const saveLabel = SAVE_LABEL[saveState]

  return (
    <div className="relative flex flex-col h-full min-h-0 !bg-canvas dark:!bg-gray-900">
      <header className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 border-b border-gray-200/80 dark:border-gray-800">
        <FileCode2 className="w-3.5 h-3.5 flex-shrink-0 opacity-60" aria-hidden />
        <span className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={title}>
          {title}
        </span>
        <span className="ml-auto flex-shrink-0 text-[11px] text-gray-400 tabular-nums">
          {lineCount.toLocaleString()} lines
        </span>
        {saveLabel && (
          <span className="flex-shrink-0 text-[11px] text-gray-400" aria-live="polite">
            {saveLabel}
          </span>
        )}
      </header>

      <div className="flex-1 min-h-0">
        <CodeEditor
          path={title}
          value={code}
          readOnly={readOnly}
          locked={false}
          isDark={isDark}
          onChange={handleChange}
          onSave={() => { void saveNow() }}
          onBlur={() => { if (saveState === 'dirty') void saveNow(true) }}
          onSelectionChange={setAssistSelection}
        />
      </div>

      <RivineAssistDock
        workspaceId={workspaceId}
        assetId={assetId}
        kind="code"
        getContent={() => code}
        onApply={applyAssisted}
        disabled={readOnly}
        selection={assistSelection}
        onClearSelection={() => setAssistSelection(null)}
      />
    </div>
  )
}

export default SourceAssetEditor
